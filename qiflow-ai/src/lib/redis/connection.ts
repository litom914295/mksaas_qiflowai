import {
  CircuitBreaker,
  REDIS_RETRY_CONFIG,
  withRetry,
} from '@/lib/utils/retry-utils';
import { ErrorCode, QiFlowApiError } from '@/types/api-errors';
import { Redis } from 'ioredis';

interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  keyPrefix: string;
  maxRetriesPerRequest: number;
  retryDelayOnFailover: number;
  connectTimeout: number;
  lazyConnect: boolean;
  keepAlive: number;
}

interface RedisHealthMetrics {
  isConnected: boolean;
  lastError?: string;
  connectionAttempts: number;
  successfulConnections: number;
  lastSuccessfulConnection?: Date;
  averageResponseTime: number;
}

const DEFAULT_CONFIG: RedisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number.parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: Number.parseInt(process.env.REDIS_DB || '0', 10),
  keyPrefix: process.env.REDIS_KEY_PREFIX || 'qiflow:',
  maxRetriesPerRequest: Number.parseInt(
    process.env.REDIS_MAX_RETRIES_PER_REQUEST || '3',
    10
  ),
  retryDelayOnFailover: Number.parseInt(
    process.env.REDIS_RETRY_DELAY_ON_FAILOVER || '2000',
    10
  ),
  connectTimeout: Number.parseInt(
    process.env.REDIS_CONNECT_TIMEOUT || '10000',
    10
  ),
  lazyConnect: true,
  keepAlive: 30000,
};

/**
 * 增强的 Redis 连接管理器，包含重试机制和故障降级
 */
class RedisConnection {
  private static instance: Redis | null = null;
  private static circuitBreaker: CircuitBreaker | null = null;
  private static healthMetrics: RedisHealthMetrics = {
    isConnected: false,
    connectionAttempts: 0,
    successfulConnections: 0,
    averageResponseTime: 0,
  };
  private static fallbackStorage = new Map<
    string,
    { value: any; expiry?: number }
  >();
  private static readonly FALLBACK_TTL = 300000; // 5分钟

  static getInstance(customConfig: Partial<RedisConfig> = {}): Redis {
    if (!RedisConnection.instance) {
      RedisConnection.instance = RedisConnection.createConnection(customConfig);
    }
    return RedisConnection.instance;
  }

  private static createConnection(customConfig: Partial<RedisConfig>): Redis {
    const config = { ...DEFAULT_CONFIG, ...customConfig };

    // 创建熔断器
    RedisConnection.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      recoveryTimeout: 60000, // 1分钟
      monitoringPeriod: 30000, // 30秒
    });

    const redis = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.db,
      keyPrefix: config.keyPrefix,
      maxRetriesPerRequest: config.maxRetriesPerRequest,
      connectTimeout: config.connectTimeout,
      lazyConnect: config.lazyConnect,
      keepAlive: config.keepAlive,
      retryStrategy: times => {
        const delay = Math.min(times * 200, 2000);
        console.warn(`[Redis] Retry attempt ${times}, delay: ${delay}ms`);
        return delay;
      },
      reconnectOnError: err => {
        console.error('[Redis] Reconnect on error:', err.message);
        if (err && err.message && err.message.includes('READONLY')) {
          return true;
        }
        return false;
      },
    });

    // 连接事件监听
    redis.on('connect', () => {
      console.log('[Redis] Connected successfully');
      RedisConnection.healthMetrics.isConnected = true;
      RedisConnection.healthMetrics.successfulConnections++;
      RedisConnection.healthMetrics.lastSuccessfulConnection = new Date();
      delete RedisConnection.healthMetrics.lastError;
    });

    redis.on('ready', () => {
      console.log('[Redis] Ready for commands');
    });

    redis.on('error', error => {
      console.error('[Redis] Connection error:', error);
      RedisConnection.healthMetrics.isConnected = false;
      RedisConnection.healthMetrics.lastError = error.message;
    });

    redis.on('close', () => {
      console.warn('[Redis] Connection closed');
      RedisConnection.healthMetrics.isConnected = false;
    });

    redis.on('reconnecting', (delay: number) => {
      console.log(`[Redis] Reconnecting in ${delay}ms`);
      RedisConnection.healthMetrics.connectionAttempts++;
    });

    redis.on('end', () => {
      console.warn('[Redis] Connection ended');
      RedisConnection.healthMetrics.isConnected = false;
    });

    return redis;
  }

  /**
   * 带故障降级的 Redis 操作
   */
  static async executeWithFallback<T>(
    operation: (redis: Redis) => Promise<T>,
    fallbackValue?: T,
    operationName = 'redis_operation'
  ): Promise<T> {
    if (!RedisConnection.circuitBreaker) {
      throw new QiFlowApiError(ErrorCode.REDIS_ERROR, 'Redis 熔断器未初始化');
    }

    const startTime = Date.now();

    try {
      const result = await RedisConnection.circuitBreaker.execute(async () => {
        const redis = RedisConnection.getInstance();
        return await withRetry(() => operation(redis), REDIS_RETRY_CONFIG);
      });

      // 更新平均响应时间
      const responseTime = Date.now() - startTime;
      RedisConnection.updateAverageResponseTime(responseTime);

      return result;
    } catch (error) {
      console.error(`[Redis] ${operationName} failed:`, error);

      // 记录错误指标
      RedisConnection.healthMetrics.lastError =
        error instanceof Error ? error.message : String(error);

      // 如果有备用值，返回备用值
      if (fallbackValue !== undefined) {
        console.warn(`[Redis] Using fallback value for ${operationName}`);
        return fallbackValue;
      }

      // 否则抛出错误
      throw new QiFlowApiError(
        ErrorCode.REDIS_ERROR,
        `Redis 操作失败: ${operationName}`,
        { details: { originalError: error } }
      );
    }
  }

  /**
   * 带内存备用的获取操作
   */
  static async getWithMemoryFallback(
    key: string,
    defaultValue?: any
  ): Promise<any> {
    try {
      const result = await RedisConnection.executeWithFallback(
        redis => redis.get(key),
        null,
        `get:${key}`
      );

      if (result !== null) {
        try {
          return JSON.parse(result);
        } catch {
          return result;
        }
      }
    } catch (error) {
      console.warn(
        `[Redis] Get operation failed for key ${key}, checking memory fallback`
      );
    }

    // 检查内存备用
    const fallbackItem = RedisConnection.fallbackStorage.get(key);
    if (fallbackItem) {
      // 检查是否过期
      if (!fallbackItem.expiry || Date.now() < fallbackItem.expiry) {
        console.log(`[Redis] Using memory fallback for key: ${key}`);
        return fallbackItem.value;
      } else {
        // 清理过期数据
        RedisConnection.fallbackStorage.delete(key);
      }
    }

    return defaultValue;
  }

  /**
   * 带内存备用的设置操作
   */
  static async setWithMemoryFallback(
    key: string,
    value: any,
    ttlSeconds?: number
  ): Promise<boolean> {
    const serializedValue =
      typeof value === 'string' ? value : JSON.stringify(value);

    // 同时更新内存备用
    const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    RedisConnection.fallbackStorage.set(key, { value, expiry });

    try {
      await RedisConnection.executeWithFallback(
        async redis => {
          if (ttlSeconds) {
            await redis.setex(key, ttlSeconds, serializedValue);
          } else {
            await redis.set(key, serializedValue);
          }
        },
        undefined,
        `set:${key}`
      );
      return true;
    } catch (error) {
      console.warn(
        `[Redis] Set operation failed for key ${key}, value stored in memory fallback`
      );
      return false;
    }
  }

  /**
   * 带内存备用的删除操作
   */
  static async deleteWithMemoryFallback(key: string): Promise<boolean> {
    // 从内存备用中删除
    RedisConnection.fallbackStorage.delete(key);

    try {
      await RedisConnection.executeWithFallback(
        redis => redis.del(key),
        0,
        `del:${key}`
      );
      return true;
    } catch (error) {
      console.warn(`[Redis] Delete operation failed for key ${key}`);
      return false;
    }
  }

  /**
   * 清理过期的内存备用数据
   */
  static cleanupExpiredFallbackData(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, item] of RedisConnection.fallbackStorage.entries()) {
      if (item.expiry && now >= item.expiry) {
        RedisConnection.fallbackStorage.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(
        `[Redis] Cleaned up ${cleanedCount} expired fallback entries`
      );
    }
  }

  /**
   * 获取连接健康状态
   */
  static async getHealthStatus(): Promise<
    RedisHealthMetrics & {
      circuitBreakerState: string;
      fallbackEntriesCount: number;
    }
  > {
    return {
      ...RedisConnection.healthMetrics,
      circuitBreakerState:
        RedisConnection.circuitBreaker?.getState() || 'unknown',
      fallbackEntriesCount: RedisConnection.fallbackStorage.size,
    };
  }

  /**
   * 测试连接
   */
  static async testConnection(): Promise<{
    success: boolean;
    responseTime: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      await RedisConnection.executeWithFallback(
        redis => redis.ping(),
        'PONG',
        'ping'
      );

      return {
        success: true,
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * 更新平均响应时间
   */
  private static updateAverageResponseTime(responseTime: number): void {
    const alpha = 0.1; // 指数加权平均参数
    RedisConnection.healthMetrics.averageResponseTime =
      RedisConnection.healthMetrics.averageResponseTime * (1 - alpha) +
      responseTime * alpha;
  }

  /**
   * 重置连接
   */
  static async resetConnection(): Promise<void> {
    if (RedisConnection.instance) {
      try {
        await RedisConnection.instance.quit();
      } catch (error) {
        console.error('[Redis] Error during quit:', error);
      }
      RedisConnection.instance = null;
    }

    if (RedisConnection.circuitBreaker) {
      RedisConnection.circuitBreaker.reset();
    }

    // 重置指标
    RedisConnection.healthMetrics = {
      isConnected: false,
      connectionAttempts: 0,
      successfulConnections: 0,
      averageResponseTime: 0,
    };
  }

  /**
   * 断开连接
   */
  static disconnect(): void {
    if (RedisConnection.instance) {
      RedisConnection.instance.disconnect();
      RedisConnection.instance = null;
    }

    // 清理内存备用
    RedisConnection.fallbackStorage.clear();

    console.log('[Redis] Disconnected and cleaned up');
  }
}

// 定期清理过期的备用数据
setInterval(() => {
  RedisConnection.cleanupExpiredFallbackData();
}, 60000); // 每分钟清理一次

export { RedisConnection };
export type { RedisConfig, RedisHealthMetrics };
