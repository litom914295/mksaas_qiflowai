/**
 * 统一系统性能缓存
 *
 * 提供内存缓存以优化重复分析请求的性能
 */

import type { UnifiedAnalysisInput, UnifiedAnalysisOutput } from './types';

/**
 * 缓存项
 */
interface CacheEntry {
  key: string;
  value: UnifiedAnalysisOutput;
  timestamp: number;
  hitCount: number;
}

/**
 * 缓存统计
 */
interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

/**
 * 性能缓存管理器
 */
export class AnalysisCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number;
  private ttl: number; // Time to live in milliseconds
  private hits = 0;
  private misses = 0;

  constructor(maxSize = 100, ttlMinutes = 30) {
    this.maxSize = maxSize;
    this.ttl = ttlMinutes * 60 * 1000;
  }

  /**
   * 生成缓存键
   */
  private generateKey(input: UnifiedAnalysisInput): string {
    // 创建一个稳定的键，包含关键参数
    const keyData = {
      bazi: {
        birthYear: input.bazi.birthYear,
        birthMonth: input.bazi.birthMonth,
        birthDay: input.bazi.birthDay,
        birthHour: input.bazi.birthHour,
        gender: input.bazi.gender,
      },
      house: {
        facing: input.house.facing,
        buildYear: input.house.buildYear,
        floor: input.house.floor,
        layoutHash: input.house.layout
          ? this.hashLayout(input.house.layout)
          : null,
      },
      time: {
        currentYear: input.time.currentYear,
        currentMonth: input.time.currentMonth,
      },
      options: {
        depth: input.options?.depth || 'comprehensive',
        includeScoring: input.options?.includeScoring ?? true,
        includeWarnings: input.options?.includeWarnings ?? true,
      },
    };

    return JSON.stringify(keyData);
  }

  /**
   * 对房间布局进行哈希
   */
  private hashLayout(layout: any[]): string {
    const simplified = layout.map((room) => ({
      type: room.type,
      position: room.position,
      isPrimary: room.isPrimary,
    }));
    return JSON.stringify(simplified);
  }

  /**
   * 获取缓存结果
   */
  get(input: UnifiedAnalysisInput): UnifiedAnalysisOutput | null {
    const key = this.generateKey(input);
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // 检查是否过期
    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // 命中
    entry.hitCount++;
    this.hits++;

    console.log(`[缓存] 命中 - Key: ${key.substring(0, 50)}...`);
    console.log(
      `[缓存] 命中次数: ${entry.hitCount}, 缓存时间: ${Math.round((now - entry.timestamp) / 1000)}秒前`
    );

    return entry.value;
  }

  /**
   * 设置缓存
   */
  set(input: UnifiedAnalysisInput, value: UnifiedAnalysisOutput): void {
    const key = this.generateKey(input);

    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.findOldestEntry();
      if (oldestKey) {
        this.cache.delete(oldestKey);
        console.log('[缓存] 达到最大容量，删除最旧条目');
      }
    }

    const entry: CacheEntry = {
      key,
      value,
      timestamp: Date.now(),
      hitCount: 0,
    };

    this.cache.set(key, entry);
    console.log(
      `[缓存] 添加新条目 - 当前大小: ${this.cache.size}/${this.maxSize}`
    );
  }

  /**
   * 查找最旧的条目
   */
  private findOldestEntry(): string | null {
    let oldestKey: string | null = null;
    let oldestTime = Number.MAX_SAFE_INTEGER;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  /**
   * 清除所有缓存
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    console.log('[缓存] 已清空所有缓存');
  }

  /**
   * 清除过期的缓存
   */
  clearExpired(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      console.log(`[缓存] 清除了 ${removed} 个过期条目`);
    }

    return removed;
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
      hitRate: total > 0 ? (this.hits / total) * 100 : 0,
    };
  }

  /**
   * 打印缓存统计
   */
  printStats(): void {
    const stats = this.getStats();
    console.log('═'.repeat(60));
    console.log('📊 缓存统计信息');
    console.log('═'.repeat(60));
    console.log(`命中次数: ${stats.hits}`);
    console.log(`未命中次数: ${stats.misses}`);
    console.log(`缓存大小: ${stats.size}/${this.maxSize}`);
    console.log(`命中率: ${stats.hitRate.toFixed(2)}%`);
    console.log('═'.repeat(60));
  }
}

/**
 * 全局缓存实例（单例）
 */
let globalCache: AnalysisCache | null = null;

/**
 * 获取全局缓存实例
 */
export function getGlobalCache(): AnalysisCache {
  if (!globalCache) {
    globalCache = new AnalysisCache(100, 30); // 最多100个条目，30分钟过期
  }
  return globalCache;
}

/**
 * 重置全局缓存
 */
export function resetGlobalCache(): void {
  if (globalCache) {
    globalCache.clear();
  }
  globalCache = null;
}

/**
 * 带缓存的分析函数装饰器
 */
export function withCache<
  T extends (...args: any[]) => Promise<UnifiedAnalysisOutput>,
>(fn: T, useCache = true): T {
  return (async (...args: any[]) => {
    if (!useCache) {
      return fn(...args);
    }

    const input = args[0] as UnifiedAnalysisInput;
    const cache = getGlobalCache();

    // 尝试从缓存获取
    const cached = cache.get(input);
    if (cached) {
      return cached;
    }

    // 执行实际分析
    const result = await fn(...args);

    // 保存到缓存
    cache.set(input, result);

    return result;
  }) as T;
}
