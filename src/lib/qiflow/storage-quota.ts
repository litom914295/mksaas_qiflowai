/**
 * localStorage 配额监控与管理工具
 * 用于监控存储空间使用情况并清理过期数据
 */

export interface StorageQuotaInfo {
  used: number; // 已使用字节数
  available: number; // 可用字节数（估算）
  total: number; // 总配额（估算）
  percentage: number; // 使用百分比
  isNearLimit: boolean; // 是否接近上限（>80%）
}

/**
 * 检查 localStorage 配额使用情况
 * @returns 配额信息
 */
export function checkLocalStorageQuota(): StorageQuotaInfo {
  let used = 0;
  const total = 5 * 1024 * 1024; // localStorage 通常为 5MB

  try {
    // 计算当前使用量
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          // 估算字符串的字节数（UTF-16，每个字符2字节）
          used += (key.length + value.length) * 2;
        }
      }
    }
  } catch (error) {
    console.error('[Storage Quota] 检查配额失败:', error);
  }

  const available = Math.max(0, total - used);
  const percentage = (used / total) * 100;
  const isNearLimit = percentage > 80;

  return {
    used,
    available,
    total,
    percentage,
    isNearLimit,
  };
}

/**
 * 清理过期的户型图缓存
 * @param keepDays 保留天数，超过此天数的缓存将被清理
 * @returns 清理的项目数量
 */
export function cleanOldFloorplanCache(keepDays: number = 7): number {
  let cleanedCount = 0;
  const cutoffTime = Date.now() - keepDays * 24 * 60 * 60 * 1000;
  const keysToRemove: string[] = [];

  try {
    // 扫描所有 floorplan 相关的键
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key && key.startsWith('floorplan_')) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            const data = JSON.parse(value);
            
            // 检查 updatedAt 时间戳
            if (data.updatedAt && data.updatedAt < cutoffTime) {
              keysToRemove.push(key);
            }
          }
        } catch (error) {
          // JSON 解析失败，可能是损坏的数据，标记为删除
          keysToRemove.push(key);
        }
      }
    }

    // 批量删除
    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
      cleanedCount++;
    });

    console.log(`[Storage Quota] 清理了 ${cleanedCount} 个过期户型图缓存`);
  } catch (error) {
    console.error('[Storage Quota] 清理缓存失败:', error);
  }

  return cleanedCount;
}

/**
 * 清理所有匿名用户的户型图缓存
 * @returns 清理的项目数量
 */
export function cleanAnonymousFloorplanCache(): number {
  let cleanedCount = 0;
  const keysToRemove: string[] = [];

  try {
    // 扫描所有匿名用户的缓存
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key && key.startsWith('floorplan_anonymous_')) {
        keysToRemove.push(key);
      }
    }

    // 批量删除
    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
      cleanedCount++;
    });

    console.log(`[Storage Quota] 清理了 ${cleanedCount} 个匿名户型图缓存`);
  } catch (error) {
    console.error('[Storage Quota] 清理匿名缓存失败:', error);
  }

  return cleanedCount;
}

/**
 * 获取所有户型图缓存的统计信息
 * @returns 统计信息
 */
export function getFloorplanCacheStats(): {
  totalCount: number;
  anonymousCount: number;
  userCount: number;
  totalSize: number;
  oldestTimestamp: number | null;
  newestTimestamp: number | null;
} {
  let totalCount = 0;
  let anonymousCount = 0;
  let userCount = 0;
  let totalSize = 0;
  let oldestTimestamp: number | null = null;
  let newestTimestamp: number | null = null;

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key && key.startsWith('floorplan_')) {
        totalCount++;
        
        if (key.startsWith('floorplan_anonymous_')) {
          anonymousCount++;
        } else {
          userCount++;
        }

        const value = localStorage.getItem(key);
        if (value) {
          totalSize += (key.length + value.length) * 2;

          try {
            const data = JSON.parse(value);
            if (data.updatedAt) {
              if (!oldestTimestamp || data.updatedAt < oldestTimestamp) {
                oldestTimestamp = data.updatedAt;
              }
              if (!newestTimestamp || data.updatedAt > newestTimestamp) {
                newestTimestamp = data.updatedAt;
              }
            }
          } catch {
            // 忽略解析错误
          }
        }
      }
    }
  } catch (error) {
    console.error('[Storage Quota] 获取统计信息失败:', error);
  }

  return {
    totalCount,
    anonymousCount,
    userCount,
    totalSize,
    oldestTimestamp,
    newestTimestamp,
  };
}

/**
 * 格式化字节数为可读字符串
 * @param bytes 字节数
 * @returns 格式化后的字符串
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * 检查是否可以安全地存储数据
 * @param estimatedSize 预估的数据大小（字节）
 * @returns 是否可以安全存储
 */
export function canSafelyStore(estimatedSize: number): boolean {
  const quota = checkLocalStorageQuota();
  const safeThreshold = quota.total * 0.9; // 保留10%的安全余量
  
  return (quota.used + estimatedSize) < safeThreshold;
}

/**
 * 自动清理策略：当接近配额上限时自动清理旧数据
 * @returns 是否执行了清理
 */
export function autoCleanIfNeeded(): boolean {
  const quota = checkLocalStorageQuota();
  
  if (quota.isNearLimit) {
    console.log('[Storage Quota] 检测到存储空间接近上限，开始自动清理...');
    
    // 先清理30天以上的旧数据
    let cleaned = cleanOldFloorplanCache(30);
    
    // 如果还是接近上限，清理7天以上的数据
    const quotaAfter = checkLocalStorageQuota();
    if (quotaAfter.isNearLimit) {
      cleaned += cleanOldFloorplanCache(7);
    }
    
    if (cleaned > 0) {
      console.log(`[Storage Quota] 自动清理完成，清理了 ${cleaned} 个缓存项`);
      return true;
    }
  }
  
  return false;
}
