/**
 * LRU (Least Recently Used) 缓存实现
 * 用于缓存八字计算结果,提升性能
 */

export interface LRUCacheOptions {
  /**
   * 最大缓存条目数
   */
  maxSize: number;

  /**
   * 条目过期时间(毫秒)
   * 0 表示永不过期
   */
  ttl?: number;

  /**
   * 是否在每次访问时重置过期时间
   */
  refreshOnAccess?: boolean;
}

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  accessCount: number;
}

/**
 * LRU缓存类
 * 使用Map保持插入顺序,实现O(1)时间复杂度的操作
 */
export class LRUCache<K, V> {
  private cache: Map<K, CacheEntry<V>>;
  private maxSize: number;
  private ttl: number;
  private refreshOnAccess: boolean;
  private hits = 0;
  private misses = 0;

  constructor(options: LRUCacheOptions) {
    this.cache = new Map();
    this.maxSize = options.maxSize;
    this.ttl = options.ttl || 0;
    this.refreshOnAccess = options.refreshOnAccess ?? true;
  }

  /**
   * 获取缓存值
   */
  get(key: K): V | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return undefined;
    }

    // 检查是否过期
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.misses++;
      return undefined;
    }

    // 更新访问时间和访问次数
    entry.accessCount++;
    if (this.refreshOnAccess) {
      entry.timestamp = Date.now();
    }

    // 移到最前面 (LRU策略)
    this.cache.delete(key);
    this.cache.set(key, entry);

    this.hits++;
    return entry.value;
  }

  /**
   * 设置缓存值
   */
  set(key: K, value: V): void {
    // 如果key已存在,先删除旧值
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // 如果缓存已满,删除最旧的条目(Map的第一个元素)
    else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    // 添加新条目
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 0,
    });
  }

  /**
   * 检查key是否存在且未过期
   */
  has(key: K): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 删除指定key
   */
  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * 获取缓存大小
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * 获取所有key
   */
  keys(): IterableIterator<K> {
    return this.cache.keys();
  }

  /**
   * 获取所有value
   */
  values(): IterableIterator<V> {
    // 过滤已过期的值
    const validValues: V[] = [];
    for (const [key, entry] of this.cache.entries()) {
      if (!this.isExpired(entry)) {
        validValues.push(entry.value);
      } else {
        this.cache.delete(key);
      }
    }
    return validValues.values();
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? (this.hits / total) * 100 : 0;

    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: hitRate.toFixed(2) + '%',
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * 清理过期条目
   */
  cleanup(): number {
    let removed = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        removed++;
      }
    }
    return removed;
  }

  /**
   * 检查条目是否过期
   */
  private isExpired(entry: CacheEntry<V>): boolean {
    if (this.ttl === 0) {
      return false;
    }

    const age = Date.now() - entry.timestamp;
    return age > this.ttl;
  }

  /**
   * 获取条目信息(用于调试)
   */
  getEntry(key: K): CacheEntry<V> | undefined {
    return this.cache.get(key);
  }

  /**
   * 获取所有条目(用于调试)
   */
  getAllEntries(): Array<[K, CacheEntry<V>]> {
    return Array.from(this.cache.entries());
  }
}

/**
 * 创建缓存key的辅助函数
 */
export function createCacheKey(...args: any[]): string {
  return JSON.stringify(args);
}

/**
 * 创建一个默认的四柱计算缓存
 */
export function createFourPillarsCache() {
  return new LRUCache<string, any>({
    maxSize: 1000, // 缓存1000个计算结果
    ttl: 1000 * 60 * 60, // 1小时过期
    refreshOnAccess: true,
  });
}

/**
 * 创建一个默认的真太阳时缓存
 */
export function createTrueSolarTimeCache() {
  return new LRUCache<string, any>({
    maxSize: 500, // 缓存500个计算结果
    ttl: 1000 * 60 * 30, // 30分钟过期
    refreshOnAccess: true,
  });
}

/**
 * 创建一个默认的五行权重缓存
 */
export function createWuxingStrengthCache() {
  return new LRUCache<string, any>({
    maxSize: 500, // 缓存500个计算结果
    ttl: 1000 * 60 * 60, // 1小时过期
    refreshOnAccess: true,
  });
}
