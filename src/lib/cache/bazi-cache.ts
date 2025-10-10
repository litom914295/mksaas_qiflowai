/**
 * 八字计算结果缓存服务
 * 使用内存缓存和localStorage持久化存储
 */

import type { EnhancedBaziResult } from '@/lib/qiflow/bazi/types';

interface CacheEntry {
  key: string;
  data: EnhancedBaziResult;
  timestamp: number;
  expiresAt: number;
}

class BaziCacheService {
  private memoryCache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_PREFIX = 'bazi_cache_';
  private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24小时
  private readonly MAX_CACHE_SIZE = 100; // 最大缓存条目数

  /**
   * 生成缓存键
   */
  private generateKey(params: {
    datetime: string;
    gender: string;
    timezone?: string;
    location?: any;
  }): string {
    const keyData = {
      dt: params.datetime,
      g: params.gender,
      tz: params.timezone || 'Asia/Shanghai',
      loc: params.location?.name || 'default',
    };
    return btoa(JSON.stringify(keyData));
  }

  /**
   * 获取缓存
   */
  get(params: {
    datetime: string;
    gender: string;
    timezone?: string;
    location?: any;
  }): EnhancedBaziResult | null {
    const key = this.generateKey(params);

    // 先检查内存缓存
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && memoryEntry.expiresAt > Date.now()) {
      console.log('📦 [Cache] Hit from memory cache');
      return memoryEntry.data;
    }

    // 检查localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.CACHE_PREFIX + key);
        if (stored) {
          const entry: CacheEntry = JSON.parse(stored);
          if (entry.expiresAt > Date.now()) {
            console.log('💾 [Cache] Hit from localStorage');
            // 恢复到内存缓存
            this.memoryCache.set(key, entry);
            return entry.data;
          }
          // 过期，清理
          localStorage.removeItem(this.CACHE_PREFIX + key);
        }
      } catch (error) {
        console.error('Cache read error:', error);
      }
    }

    console.log('❌ [Cache] Miss');
    return null;
  }

  /**
   * 设置缓存
   */
  set(
    params: {
      datetime: string;
      gender: string;
      timezone?: string;
      location?: any;
    },
    data: EnhancedBaziResult,
    ttl: number = this.DEFAULT_TTL
  ): void {
    const key = this.generateKey(params);
    const entry: CacheEntry = {
      key,
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    };

    // 存入内存缓存
    this.memoryCache.set(key, entry);

    // 控制内存缓存大小
    if (this.memoryCache.size > this.MAX_CACHE_SIZE) {
      const firstKey = this.memoryCache.keys().next().value;
      if (firstKey) {
        this.memoryCache.delete(firstKey);
      }
    }

    // 持久化到localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.CACHE_PREFIX + key, JSON.stringify(entry));
        console.log('✅ [Cache] Saved to cache');

        // 清理过期的localStorage条目
        this.cleanupExpiredEntries();
      } catch (error) {
        console.error('Cache write error:', error);
        // localStorage可能满了，清理一些旧条目
        this.cleanupOldestEntries();
      }
    }
  }

  /**
   * 清除指定缓存
   */
  remove(params: {
    datetime: string;
    gender: string;
    timezone?: string;
    location?: any;
  }): void {
    const key = this.generateKey(params);
    this.memoryCache.delete(key);

    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.CACHE_PREFIX + key);
    }
  }

  /**
   * 清除所有缓存
   */
  clear(): void {
    this.memoryCache.clear();

    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    }

    console.log('🗑️ [Cache] All cache cleared');
  }

  /**
   * 清理过期条目
   */
  private cleanupExpiredEntries(): void {
    if (typeof window === 'undefined') return;

    const now = Date.now();
    const keys = Object.keys(localStorage);
    let cleaned = 0;

    keys.forEach((key) => {
      if (key.startsWith(this.CACHE_PREFIX)) {
        try {
          const entry: CacheEntry = JSON.parse(
            localStorage.getItem(key) || '{}'
          );
          if (entry.expiresAt && entry.expiresAt < now) {
            localStorage.removeItem(key);
            cleaned++;
          }
        } catch (error) {
          // 无效条目，删除
          localStorage.removeItem(key);
          cleaned++;
        }
      }
    });

    if (cleaned > 0) {
      console.log(`🧹 [Cache] Cleaned ${cleaned} expired entries`);
    }
  }

  /**
   * 清理最旧的条目（当localStorage满时）
   */
  private cleanupOldestEntries(count = 10): void {
    if (typeof window === 'undefined') return;

    const entries: Array<{ key: string; timestamp: number }> = [];
    const keys = Object.keys(localStorage);

    keys.forEach((key) => {
      if (key.startsWith(this.CACHE_PREFIX)) {
        try {
          const entry: CacheEntry = JSON.parse(
            localStorage.getItem(key) || '{}'
          );
          entries.push({ key, timestamp: entry.timestamp || 0 });
        } catch (error) {
          // 无效条目，直接删除
          localStorage.removeItem(key);
        }
      }
    });

    // 按时间戳排序，删除最旧的
    entries
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(0, count)
      .forEach(({ key }) => localStorage.removeItem(key));

    console.log(`🧹 [Cache] Cleaned ${count} oldest entries`);
  }

  /**
   * 获取缓存统计
   */
  getStats(): {
    memoryCount: number;
    storageCount: number;
    totalSize: number;
  } {
    const memoryCount = this.memoryCache.size;
    let storageCount = 0;
    let totalSize = 0;

    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          storageCount++;
          const item = localStorage.getItem(key);
          if (item) {
            totalSize += item.length;
          }
        }
      });
    }

    return {
      memoryCount,
      storageCount,
      totalSize: Math.round(totalSize / 1024), // KB
    };
  }
}

// 导出单例
export const baziCache = new BaziCacheService();

// 包装函数，带缓存的八字计算
export async function computeBaziWithCache(
  params: {
    datetime: string;
    gender: string;
    timezone?: string;
    location?: any;
  },
  computeFn: (params: any) => Promise<EnhancedBaziResult>
): Promise<EnhancedBaziResult> {
  // 尝试从缓存获取
  const cached = baziCache.get(params);
  if (cached) {
    return cached;
  }

  // 计算新结果
  const result = await computeFn(params);

  // 存入缓存
  if (result) {
    baziCache.set(params, result);
  }

  return result;
}
