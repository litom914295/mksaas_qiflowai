/**
 * 内存缓存层
 * 用于缓存计算结果，提高性能
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hits: number;
}

export class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize: number;
  private ttl: number; // Time to live in milliseconds
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
  };

  constructor(maxSize = 1000, ttlSeconds = 3600) {
    this.maxSize = maxSize;
    this.ttl = ttlSeconds * 1000;

    // 定期清理过期缓存
    setInterval(() => this.cleanup(), 60000); // 每分钟清理一次
  }

  /**
   * 生成缓存键
   */
  static generateKey(params: Record<string, any>): string {
    const sorted = Object.keys(params)
      .sort()
      .reduce(
        (result, key) => {
          result[key] = params[key];
          return result;
        },
        {} as Record<string, any>
      );

    return JSON.stringify(sorted);
  }

  /**
   * 获取缓存
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // 检查是否过期
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // 更新命中次数
    entry.hits++;
    this.stats.hits++;

    return entry.data as T;
  }

  /**
   * 设置缓存
   */
  set<T>(key: string, data: T): void {
    // 检查容量
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hits: 0,
    });
  }

  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
    };
  }

  /**
   * 获取或设置缓存
   */
  async getOrSet<T>(key: string, factory: () => T | Promise<T>): Promise<T> {
    const cached = this.get<T>(key);

    if (cached !== null) {
      return cached;
    }

    const data = await factory();
    this.set(key, data);

    return data;
  }

  /**
   * LRU淘汰策略
   */
  private evictLRU(): void {
    let minHits = Number.POSITIVE_INFINITY;
    let oldestKey: string | null = null;
    let oldestTime = Number.POSITIVE_INFINITY;

    // 找出最少使用且最老的缓存项
    for (const [key, entry] of this.cache.entries()) {
      if (
        entry.hits < minHits ||
        (entry.hits === minHits && entry.timestamp < oldestTime)
      ) {
        minHits = entry.hits;
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  /**
   * 清理过期缓存
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => {
      this.cache.delete(key);
    });
  }

  /**
   * 获取缓存统计
   */
  getStats() {
    const hitRate =
      this.stats.hits / (this.stats.hits + this.stats.misses) || 0;

    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: (hitRate * 100).toFixed(2) + '%',
    };
  }

  /**
   * 预热缓存
   */
  async warmup<T>(
    keys: string[],
    factory: (key: string) => T | Promise<T>
  ): Promise<void> {
    await Promise.all(
      keys.map(async (key) => {
        const cached = this.get(key);
        if (!cached) {
          const data = await factory(key);
          this.set(key, data);
        }
      })
    );
  }
}

// 创建单例实例
export const baziCache = new MemoryCache(500, 3600); // 500个条目，1小时过期

/**
 * 缓存装饰器
 */
export function Cacheable(ttlSeconds?: number) {
  return (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) => {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cache = new MemoryCache(100, ttlSeconds || 3600);
      const key = MemoryCache.generateKey({ method: propertyName, args });

      return cache.getOrSet(key, () => method.apply(this, args));
    };

    return descriptor;
  };
}

/**
 * 批量计算缓存
 */
export class BatchCache<T> {
  private batch: Map<string, Promise<T>> = new Map();
  private batchTimeout: NodeJS.Timeout | null = null;
  private batchSize: number;
  private batchDelay: number;

  constructor(
    private processor: (keys: string[]) => Promise<Map<string, T>>,
    batchSize = 10,
    batchDelay = 50
  ) {
    this.batchSize = batchSize;
    this.batchDelay = batchDelay;
  }

  async get(key: string): Promise<T> {
    // 如果已经在批处理中
    const existing = this.batch.get(key);
    if (existing) {
      return existing;
    }

    // 创建新的Promise
    const promise = new Promise<T>((resolve, reject) => {
      // 添加到批处理队列
      this.batch.set(key, promise);

      // 触发批处理
      this.scheduleBatch();
    });

    return promise;
  }

  private scheduleBatch() {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    // 如果达到批量大小，立即处理
    if (this.batch.size >= this.batchSize) {
      this.processBatch();
      return;
    }

    // 否则延迟处理
    this.batchTimeout = setTimeout(() => {
      this.processBatch();
    }, this.batchDelay);
  }

  private async processBatch() {
    if (this.batch.size === 0) return;

    const keys = Array.from(this.batch.keys());
    const promises = this.batch;
    this.batch = new Map();

    try {
      const results = await this.processor(keys);

      keys.forEach((key) => {
        const result = results.get(key);
        const promise = promises.get(key) as any;

        if (result !== undefined) {
          promise._resolve(result);
        } else {
          promise._reject(new Error(`No result for key: ${key}`));
        }
      });
    } catch (error) {
      // 所有请求都失败
      promises.forEach((promise) => {
        (promise as any)._reject(error);
      });
    }
  }
}
