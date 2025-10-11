/**
 * Redis缓存服务
 * 用于八字分析结果缓存和性能优化
 */

import { Redis } from 'ioredis';

// Redis客户端配置
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true
};

// 创建Redis客户端实例
let redisClient: Redis | null = null;

/**
 * 获取Redis客户端
 */
export function getRedisClient(): Redis | null {
  if (!process.env.REDIS_HOST) {
    console.warn('Redis未配置，使用内存缓存降级');
    return null;
  }

  if (!redisClient) {
    try {
      redisClient = new Redis(redisConfig);
      
      redisClient.on('error', (err) => {
        console.error('Redis连接错误:', err);
      });

      redisClient.on('connect', () => {
        console.log('Redis连接成功');
      });

      redisClient.on('ready', () => {
        console.log('Redis客户端就绪');
      });
    } catch (error) {
      console.error('Redis初始化失败:', error);
      return null;
    }
  }

  return redisClient;
}

/**
 * 缓存服务类
 */
export class CacheService {
  private redis: Redis | null;
  private memoryCache: Map<string, { value: any; expires: number }>;

  constructor() {
    this.redis = getRedisClient();
    this.memoryCache = new Map();
    
    // 定期清理过期的内存缓存
    setInterval(() => this.cleanupMemoryCache(), 60000); // 每分钟清理一次
  }

  /**
   * 设置缓存
   */
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    const serialized = JSON.stringify(value);
    
    if (this.redis) {
      try {
        await this.redis.setex(key, ttl, serialized);
      } catch (error) {
        console.error('Redis set error:', error);
        this.setMemoryCache(key, value, ttl);
      }
    } else {
      this.setMemoryCache(key, value, ttl);
    }
  }

  /**
   * 获取缓存
   */
  async get<T = any>(key: string): Promise<T | null> {
    if (this.redis) {
      try {
        const value = await this.redis.get(key);
        return value ? JSON.parse(value) : null;
      } catch (error) {
        console.error('Redis get error:', error);
        return this.getMemoryCache(key);
      }
    } else {
      return this.getMemoryCache(key);
    }
  }

  /**
   * 删除缓存
   */
  async delete(key: string): Promise<void> {
    if (this.redis) {
      try {
        await this.redis.del(key);
      } catch (error) {
        console.error('Redis delete error:', error);
      }
    }
    this.memoryCache.delete(key);
  }

  /**
   * 批量获取缓存
   */
  async mget<T = any>(keys: string[]): Promise<(T | null)[]> {
    if (this.redis) {
      try {
        const values = await this.redis.mget(...keys);
        return values.map(v => v ? JSON.parse(v) : null);
      } catch (error) {
        console.error('Redis mget error:', error);
        return keys.map(key => this.getMemoryCache(key));
      }
    } else {
      return keys.map(key => this.getMemoryCache(key));
    }
  }

  /**
   * 检查缓存是否存在
   */
  async exists(key: string): Promise<boolean> {
    if (this.redis) {
      try {
        const exists = await this.redis.exists(key);
        return exists === 1;
      } catch (error) {
        console.error('Redis exists error:', error);
        return this.memoryCache.has(key);
      }
    } else {
      const cached = this.memoryCache.get(key);
      return cached ? cached.expires > Date.now() : false;
    }
  }

  /**
   * 设置哈希字段
   */
  async hset(key: string, field: string, value: any, ttl?: number): Promise<void> {
    if (this.redis) {
      try {
        await this.redis.hset(key, field, JSON.stringify(value));
        if (ttl) {
          await this.redis.expire(key, ttl);
        }
      } catch (error) {
        console.error('Redis hset error:', error);
      }
    }
  }

  /**
   * 获取哈希字段
   */
  async hget<T = any>(key: string, field: string): Promise<T | null> {
    if (this.redis) {
      try {
        const value = await this.redis.hget(key, field);
        return value ? JSON.parse(value) : null;
      } catch (error) {
        console.error('Redis hget error:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * 获取所有哈希字段
   */
  async hgetall<T = any>(key: string): Promise<Record<string, T> | null> {
    if (this.redis) {
      try {
        const hash = await this.redis.hgetall(key);
        const result: Record<string, T> = {};
        for (const [field, value] of Object.entries(hash)) {
          result[field] = JSON.parse(value);
        }
        return Object.keys(result).length > 0 ? result : null;
      } catch (error) {
        console.error('Redis hgetall error:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * 增加计数器
   */
  async incr(key: string, ttl?: number): Promise<number> {
    if (this.redis) {
      try {
        const value = await this.redis.incr(key);
        if (ttl) {
          await this.redis.expire(key, ttl);
        }
        return value;
      } catch (error) {
        console.error('Redis incr error:', error);
        return 0;
      }
    }
    return 0;
  }

  /**
   * 设置内存缓存
   */
  private setMemoryCache(key: string, value: any, ttl: number): void {
    const expires = Date.now() + ttl * 1000;
    this.memoryCache.set(key, { value, expires });
  }

  /**
   * 获取内存缓存
   */
  private getMemoryCache<T = any>(key: string): T | null {
    const cached = this.memoryCache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.value;
    }
    this.memoryCache.delete(key);
    return null;
  }

  /**
   * 清理过期的内存缓存
   */
  private cleanupMemoryCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.memoryCache.entries()) {
      if (cached.expires <= now) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * 清空所有缓存
   */
  async flush(): Promise<void> {
    if (this.redis) {
      try {
        await this.redis.flushdb();
      } catch (error) {
        console.error('Redis flush error:', error);
      }
    }
    this.memoryCache.clear();
  }
}

// 导出单例
export const cacheService = new CacheService();

/**
 * 八字分析专用缓存键生成器
 */
export class BaziCacheKey {
  /**
   * 生成分析结果缓存键
   */
  static analysis(params: {
    name: string;
    gender: string;
    birthDate: string;
    birthTime: string;
    analysisType: string;
  }): string {
    const normalized = [
      params.gender,
      params.birthDate,
      params.birthTime,
      params.analysisType
    ].join(':');
    return `bazi:analysis:${normalized}`;
  }

  /**
   * 生成用户历史缓存键
   */
  static userHistory(userId: string, page: number = 1): string {
    return `bazi:history:${userId}:${page}`;
  }

  /**
   * 生成批量任务缓存键
   */
  static batchJob(jobId: string): string {
    return `bazi:batch:${jobId}`;
  }

  /**
   * 生成速率限制键
   */
  static rateLimit(userId: string, type: string = 'analysis'): string {
    return `bazi:rate:${type}:${userId}`;
  }

  /**
   * 生成统计数据键
   */
  static stats(type: 'daily' | 'weekly' | 'monthly', date: string): string {
    return `bazi:stats:${type}:${date}`;
  }
}