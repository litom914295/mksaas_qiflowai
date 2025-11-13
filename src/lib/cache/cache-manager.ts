import { getRedisClient } from './redis';

/**
 * 缓存管理器
 * 提供统一的缓存接口,自动处理Redis不可用情况
 */

export interface CacheOptions {
  /** 过期时间(秒) */
  ttl?: number;
  /** 缓存键前缀 */
  prefix?: string;
}

/**
 * 缓存键命名空间
 */
export const CacheKeys = {
  // 用户相关
  USER_PROFILE: 'user:profile:',
  USER_CREDITS: 'user:credits:',
  USER_STATS: 'user:stats:',

  // 业务数据
  BAZI_ANALYSIS: 'bazi:analysis:',
  FENGSHUI_ANALYSIS: 'fengshui:analysis:',
  REFERRAL_STATS: 'referral:stats:',

  // 统计数据
  DASHBOARD_STATS: 'dashboard:stats',
  GROWTH_METRICS: 'dashboard:growth',
  REVENUE_DATA: 'dashboard:revenue',

  // 配置数据
  CREDIT_RULES: 'config:credit_rules',
  CHECKIN_CONFIG: 'config:checkin',
  SYSTEM_CONFIG: 'config:system',
} as const;

/**
 * 默认TTL配置(秒)
 */
export const DefaultTTL = {
  SHORT: 60, // 1分钟
  MEDIUM: 300, // 5分钟
  LONG: 1800, // 30分钟
  VERY_LONG: 3600, // 1小时
  DAY: 86400, // 1天
} as const;

class CacheManager {
  /**
   * 获取缓存
   */
  async get<T>(key: string): Promise<T | null> {
    const redis = getRedisClient();
    if (!redis) return null;

    try {
      const data = await redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * 设置缓存
   */
  async set<T>(
    key: string,
    value: T,
    options?: CacheOptions
  ): Promise<boolean> {
    const redis = getRedisClient();
    if (!redis) return false;

    try {
      const data = JSON.stringify(value);
      const ttl = options?.ttl || DefaultTTL.MEDIUM;

      await redis.setex(key, ttl, data);
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * 删除缓存
   */
  async del(key: string | string[]): Promise<boolean> {
    const redis = getRedisClient();
    if (!redis) return false;

    try {
      const keys = Array.isArray(key) ? key : [key];
      await redis.del(...keys);
      return true;
    } catch (error) {
      console.error('Cache del error:', error);
      return false;
    }
  }

  /**
   * 批量删除(通过模式匹配)
   */
  async delByPattern(pattern: string): Promise<number> {
    const redis = getRedisClient();
    if (!redis) return 0;

    try {
      const keys = await redis.keys(pattern);
      if (keys.length === 0) return 0;

      await redis.del(...keys);
      return keys.length;
    } catch (error) {
      console.error('Cache delByPattern error:', error);
      return 0;
    }
  }

  /**
   * 检查键是否存在
   */
  async exists(key: string): Promise<boolean> {
    const redis = getRedisClient();
    if (!redis) return false;

    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  /**
   * 设置过期时间
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    const redis = getRedisClient();
    if (!redis) return false;

    try {
      await redis.expire(key, ttl);
      return true;
    } catch (error) {
      console.error('Cache expire error:', error);
      return false;
    }
  }

  /**
   * 获取或设置缓存(带回调)
   * 如果缓存不存在,执行fetcher获取数据并缓存
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T | null> {
    // 尝试从缓存获取
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // 缓存未命中,执行fetcher
    try {
      const data = await fetcher();
      if (data !== null && data !== undefined) {
        await this.set(key, data, options);
      }
      return data;
    } catch (error) {
      console.error('Cache getOrSet fetcher error:', error);
      return null;
    }
  }

  /**
   * 增加计数器
   */
  async incr(key: string, ttl?: number): Promise<number> {
    const redis = getRedisClient();
    if (!redis) return 0;

    try {
      const value = await redis.incr(key);
      if (ttl && value === 1) {
        // 首次创建时设置过期时间
        await redis.expire(key, ttl);
      }
      return value;
    } catch (error) {
      console.error('Cache incr error:', error);
      return 0;
    }
  }

  /**
   * 减少计数器
   */
  async decr(key: string): Promise<number> {
    const redis = getRedisClient();
    if (!redis) return 0;

    try {
      return await redis.decr(key);
    } catch (error) {
      console.error('Cache decr error:', error);
      return 0;
    }
  }

  /**
   * 批量获取
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    const redis = getRedisClient();
    if (!redis || keys.length === 0) return keys.map(() => null);

    try {
      const values = await redis.mget(...keys);
      return values.map((v) => (v ? (JSON.parse(v) as T) : null));
    } catch (error) {
      console.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  }

  /**
   * 批量设置
   */
  async mset<T>(items: Record<string, T>, ttl?: number): Promise<boolean> {
    const redis = getRedisClient();
    if (!redis) return false;

    try {
      const pipeline = redis.pipeline();

      for (const [key, value] of Object.entries(items)) {
        const data = JSON.stringify(value);
        if (ttl) {
          pipeline.setex(key, ttl, data);
        } else {
          pipeline.set(key, data);
        }
      }

      await pipeline.exec();
      return true;
    } catch (error) {
      console.error('Cache mset error:', error);
      return false;
    }
  }

  /**
   * 清空所有缓存(危险操作)
   */
  async flush(): Promise<boolean> {
    const redis = getRedisClient();
    if (!redis) return false;

    try {
      await redis.flushdb();
      return true;
    } catch (error) {
      console.error('Cache flush error:', error);
      return false;
    }
  }
}

// 导出单例
export const cacheManager = new CacheManager();

/**
 * 便捷函数:缓存装饰器
 * 用于自动缓存函数结果
 */
export function withCache<T>(
  keyGenerator: (...args: any[]) => string,
  options?: CacheOptions
) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const key = keyGenerator(...args);

      return await cacheManager.getOrSet(
        key,
        () => originalMethod.apply(this, args),
        options
      );
    };

    return descriptor;
  };
}
