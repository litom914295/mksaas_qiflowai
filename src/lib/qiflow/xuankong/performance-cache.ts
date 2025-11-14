/**
 * 性能缓存模块
 * 用于缓存玄空风水计算结果，提升API响应速度
 */

import { createHash } from 'crypto';
import type {
  ComprehensiveAnalysisOptions,
  ComprehensiveAnalysisResult,
} from './comprehensive-engine';

// 缓存接口
interface CacheEntry {
  key: string;
  result: ComprehensiveAnalysisResult;
  timestamp: number;
  hits: number;
  ttl: number; // Time to live in milliseconds
}

// 缓存统计
interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  hitRate: number;
}

/**
 * 内存缓存实现
 */
export class XuankongCache {
  private cache: Map<string, CacheEntry>;
  private stats: CacheStats;
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize = 100, defaultTTL = 3600000) {
    // 默认1小时过期
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0,
      hitRate: 0,
    };
  }

  /**
   * 生成缓存键
   */
  private generateKey(options: ComprehensiveAnalysisOptions): string {
    // 提取关键参数用于生成缓存键
    const keyData = {
      facing: options.facing?.degrees || options.facing,
      location: options.location,
      buildYear: options.observedAt
        ? new Date(options.observedAt).getFullYear()
        : null,
      includeQixingdajie: options.includeQixingdajie !== false,
      includeChengmenjue: options.includeChengmenjue !== false,
      includeLingzheng: options.includeLingzheng !== false,
      environmentInfo: options.environmentInfo
        ? {
            waterPositions: options.environmentInfo.waterPositions?.sort(),
            mountainPositions:
              options.environmentInfo.mountainPositions?.sort(),
          }
        : null,
    };

    // 创建稳定的哈希值
    const jsonStr = JSON.stringify(keyData, Object.keys(keyData).sort());
    return createHash('md5').update(jsonStr).digest('hex');
  }

  /**
   * 获取缓存结果
   */
  get(
    options: ComprehensiveAnalysisOptions
  ): ComprehensiveAnalysisResult | null {
    const key = this.generateKey(options);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // 检查是否过期
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.size--;
      this.updateHitRate();
      return null;
    }

    // 更新命中统计
    entry.hits++;
    this.stats.hits++;
    this.updateHitRate();

    // 返回深拷贝以防止修改缓存
    return JSON.parse(JSON.stringify(entry.result));
  }

  /**
   * 设置缓存结果
   */
  set(
    options: ComprehensiveAnalysisOptions,
    result: ComprehensiveAnalysisResult,
    ttl?: number
  ): void {
    const key = this.generateKey(options);

    // 检查缓存大小限制
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    const entry: CacheEntry = {
      key,
      result: JSON.parse(JSON.stringify(result)), // 深拷贝
      timestamp: Date.now(),
      hits: 0,
      ttl: ttl || this.defaultTTL,
    };

    const isNew = !this.cache.has(key);
    this.cache.set(key, entry);

    if (isNew) {
      this.stats.size++;
    }
  }

  /**
   * LRU驱逐策略
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    const oldestTime = Date.now();
    let leastHits = Number.POSITIVE_INFINITY;

    // 找出最少使用且最老的项
    for (const [key, entry] of this.cache.entries()) {
      const score = entry.hits * 1000 + (Date.now() - entry.timestamp);
      if (score < leastHits) {
        leastHits = score;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
      this.stats.size--;
    }
  }

  /**
   * 清理过期缓存
   */
  cleanExpired(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
        this.stats.size--;
      }
    }

    return cleaned;
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0,
      hitRate: 0,
    };
  }

  /**
   * 获取缓存统计
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * 更新命中率
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * 预热缓存
   * 预先计算常见的配置组合
   */
  async warmup(
    computeFn: (
      options: ComprehensiveAnalysisOptions
    ) => Promise<ComprehensiveAnalysisResult>
  ): Promise<void> {
    // 常见的朝向
    const commonFacings = [0, 45, 90, 135, 180, 225, 270, 315];
    // 常见的建造年份
    const commonYears = [2020, 2021, 2022, 2023, 2024, 2025];

    const warmupPromises: Promise<void>[] = [];

    for (const facing of commonFacings) {
      for (const year of commonYears) {
        const options: ComprehensiveAnalysisOptions = {
          facing: { degrees: facing },
          observedAt: new Date(year, 0, 1),
          includeQixingdajie: true,
          includeChengmenjue: true,
          includeLingzheng: true,
        };

        warmupPromises.push(
          computeFn(options)
            .then((result) => {
              this.set(options, result, this.defaultTTL * 2); // 预热缓存时间加倍
            })
            .catch(() => {
              // 忽略预热错误
            })
        );
      }
    }

    // 批量执行，限制并发
    const batchSize = 5;
    for (let i = 0; i < warmupPromises.length; i += batchSize) {
      await Promise.all(warmupPromises.slice(i, i + batchSize));
    }
  }

  /**
   * 导出缓存数据（用于持久化）
   */
  export(): string {
    const data = {
      cache: Array.from(this.cache.entries()),
      stats: this.stats,
      timestamp: Date.now(),
    };
    return JSON.stringify(data);
  }

  /**
   * 导入缓存数据（从持久化恢复）
   */
  import(data: string): void {
    try {
      const parsed = JSON.parse(data);
      this.cache = new Map(parsed.cache);
      this.stats = parsed.stats;

      // 清理已过期的项
      this.cleanExpired();
    } catch (error) {
      console.error('Failed to import cache:', error);
    }
  }
}

// 单例实例
let cacheInstance: XuankongCache | null = null;

/**
 * 获取缓存实例
 */
export function getCache(): XuankongCache {
  if (!cacheInstance) {
    cacheInstance = new XuankongCache();

    // 定期清理过期缓存
    setInterval(() => {
      cacheInstance?.cleanExpired();
    }, 60000); // 每分钟清理一次
  }
  return cacheInstance;
}

/**
 * 带缓存的计算包装器
 */
export async function withCache<T>(
  key: string,
  computeFn: () => Promise<T>,
  ttl = 3600000
): Promise<T> {
  const cache = getCache();

  // 尝试从缓存获取
  const cached = (cache as any).cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.result;
  }

  // 计算并缓存
  const result = await computeFn();
  (cache as any).cache.set(key, {
    key,
    result,
    timestamp: Date.now(),
    hits: 0,
    ttl,
  });

  return result;
}

/**
 * 性能监控装饰器
 */
export function measurePerformance(
  target: any,
  propertyName: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const start = Date.now();
    try {
      const result = await originalMethod.apply(this, args);
      const duration = Date.now() - start;

      // 记录性能指标
      console.log(`[Performance] ${propertyName} took ${duration}ms`);

      // 如果执行时间过长，记录警告
      if (duration > 1000) {
        console.warn(
          `[Performance Warning] ${propertyName} took ${duration}ms (> 1s)`
        );
      }

      return result;
    } catch (error) {
      const duration = Date.now() - start;
      console.error(
        `[Performance Error] ${propertyName} failed after ${duration}ms`,
        error
      );
      throw error;
    }
  };

  return descriptor;
}

/**
 * 批量处理优化
 */
export class BatchProcessor<T, R> {
  private queue: Array<{
    args: T;
    resolve: (value: R) => void;
    reject: (error: any) => void;
  }> = [];
  private processing = false;
  private batchSize: number;
  private batchDelay: number;
  private processFn: (batch: T[]) => Promise<R[]>;

  constructor(
    processFn: (batch: T[]) => Promise<R[]>,
    batchSize = 10,
    batchDelay = 100
  ) {
    this.processFn = processFn;
    this.batchSize = batchSize;
    this.batchDelay = batchDelay;
  }

  async add(args: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push({ args, resolve, reject });
      this.scheduleProcess();
    });
  }

  private scheduleProcess(): void {
    if (!this.processing) {
      this.processing = true;
      setTimeout(() => this.process(), this.batchDelay);
    }
  }

  private async process(): Promise<void> {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    // 取出一批待处理项
    const batch = this.queue.splice(0, this.batchSize);
    const args = batch.map((item) => item.args);

    try {
      // 批量处理
      const results = await this.processFn(args);

      // 分发结果
      batch.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      // 错误处理
      batch.forEach((item) => {
        item.reject(error);
      });
    }

    // 继续处理剩余队列
    if (this.queue.length > 0) {
      setTimeout(() => this.process(), this.batchDelay);
    } else {
      this.processing = false;
    }
  }
}
