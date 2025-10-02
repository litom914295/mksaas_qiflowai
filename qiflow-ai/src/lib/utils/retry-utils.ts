/**
 * QiFlow AI - 重试机制工具
 *
 * 提供灵活的重试策略，用于处理网络、数据库和外部服务的临时故障
 */

import { QiFlowApiError, ErrorCode } from '@/types/api-errors';

export interface RetryOptions {
  retries: number;
  delay: number;
  backoff?: 'fixed' | 'exponential' | 'linear';
  maxDelay?: number;
  shouldRetry?: (error: any, attempt: number) => boolean;
  onError?: (error: any, attempt: number) => void;
  onSuccess?: (result: any, attempts: number) => void;
  timeout?: number;
}

export interface CircuitBreakerOptions {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
}

/**
 * 默认重试配置
 */
const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  retries: 3,
  delay: 1000,
  backoff: 'exponential',
  maxDelay: 30000,
  shouldRetry: (error: any) => {
    // 默认只重试网络、超时和系统错误
    if (error instanceof QiFlowApiError) {
      return error.retryable;
    }
    return true;
  },
  onError: () => {},
  onSuccess: () => {},
  timeout: 30000,
};

/**
 * 计算重试延迟
 */
function calculateDelay(
  attempt: number,
  baseDelay: number,
  backoff: 'fixed' | 'exponential' | 'linear',
  maxDelay: number
): number {
  let delay: number;

  switch (backoff) {
    case 'fixed':
      delay = baseDelay;
      break;
    case 'linear':
      delay = baseDelay * attempt;
      break;
    case 'exponential':
    default:
      delay = baseDelay * Math.pow(2, attempt - 1);
      break;
  }

  // 添加随机抖动以避免惊群效应
  const jitter = Math.random() * 0.1 * delay;
  delay += jitter;

  return Math.min(delay, maxDelay);
}

/**
 * 带超时的Promise包装
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(
          new QiFlowApiError(
            ErrorCode.TIMEOUT_ERROR,
            `操作超时 (${timeoutMs}ms)`
          )
        );
      }, timeoutMs);
    }),
  ]);
}

/**
 * 核心重试函数
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: any;
  let attempt = 1;

  while (attempt <= config.retries + 1) {
    try {
      const operationPromise = operation();
      const result = config.timeout
        ? await withTimeout(operationPromise, config.timeout)
        : await operationPromise;

      if (attempt > 1) {
        config.onSuccess(result, attempt);
      }

      return result;
    } catch (error) {
      lastError = error;

      // 最后一次尝试，不再重试
      if (attempt > config.retries) {
        break;
      }

      // 检查是否应该重试
      if (!config.shouldRetry(error, attempt)) {
        break;
      }

      config.onError(error, attempt);

      // 计算延迟并等待
      const delay = calculateDelay(
        attempt,
        config.delay,
        config.backoff,
        config.maxDelay
      );
      await new Promise(resolve => setTimeout(resolve, delay));

      attempt++;
    }
  }

  throw lastError;
}

/**
 * 熔断器状态
 */
enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open',
}

/**
 * 熔断器实现
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime = 0;
  private successCount = 0;

  constructor(private options: CircuitBreakerOptions) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime < this.options.recoveryTimeout) {
        throw new QiFlowApiError(
          ErrorCode.EXTERNAL_SERVICE_ERROR,
          '服务熔断中，请稍后重试'
        );
      }
      this.state = CircuitState.HALF_OPEN;
      this.successCount = 0;
    }

    try {
      const result = await operation();

      // 成功执行
      if (this.state === CircuitState.HALF_OPEN) {
        this.successCount++;
        if (this.successCount >= 3) {
          // 连续3次成功后关闭熔断器
          this.state = CircuitState.CLOSED;
          this.failureCount = 0;
        }
      } else {
        this.failureCount = Math.max(0, this.failureCount - 1);
      }

      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      if (this.failureCount >= this.options.failureThreshold) {
        this.state = CircuitState.OPEN;
      }

      throw error;
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  getFailureCount(): number {
    return this.failureCount;
  }

  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = 0;
    this.successCount = 0;
  }
}

/**
 * 数据库操作重试配置
 */
export const DATABASE_RETRY_CONFIG: Partial<RetryOptions> = {
  retries: 3,
  delay: 500,
  backoff: 'exponential',
  maxDelay: 5000,
  shouldRetry: (error: any) => {
    // 重试数据库连接错误、超时错误等
    if (error instanceof QiFlowApiError) {
      return [
        ErrorCode.DATABASE_ERROR,
        ErrorCode.TIMEOUT_ERROR,
        ErrorCode.NETWORK_ERROR,
      ].includes(error.code);
    }

    // PostgreSQL 特定错误码
    if (error?.code) {
      const retryableCodes = [
        '53300', // too_many_connections
        '57P01', // admin_shutdown
        '08000', // connection_exception
        '08003', // connection_does_not_exist
        '08006', // connection_failure
        '40001', // serialization_failure
      ];
      return retryableCodes.includes(error.code);
    }

    return false;
  },
};

/**
 * Redis操作重试配置
 */
export const REDIS_RETRY_CONFIG: Partial<RetryOptions> = {
  retries: 2,
  delay: 200,
  backoff: 'exponential',
  maxDelay: 2000,
  shouldRetry: (error: any) => {
    if (error instanceof QiFlowApiError) {
      return [ErrorCode.REDIS_ERROR, ErrorCode.NETWORK_ERROR].includes(
        error.code
      );
    }

    // Redis 特定错误
    if (error?.code === 'ECONNRESET' || error?.code === 'ETIMEDOUT') {
      return true;
    }

    return false;
  },
};

/**
 * AI服务调用重试配置
 */
export const AI_SERVICE_RETRY_CONFIG: Partial<RetryOptions> = {
  retries: 2,
  delay: 1000,
  backoff: 'exponential',
  maxDelay: 10000,
  timeout: 30000,
  shouldRetry: (error: any) => {
    if (error instanceof QiFlowApiError) {
      return [
        ErrorCode.AI_SERVICE_UNAVAILABLE,
        ErrorCode.NETWORK_ERROR,
        ErrorCode.TIMEOUT_ERROR,
      ].includes(error.code);
    }

    // HTTP 状态码重试
    if (error?.status) {
      const retryableStatus = [408, 429, 500, 502, 503, 504];
      return retryableStatus.includes(error.status);
    }

    return false;
  },
};

/**
 * 外部服务重试配置
 */
export const EXTERNAL_SERVICE_RETRY_CONFIG: Partial<RetryOptions> = {
  retries: 3,
  delay: 1000,
  backoff: 'exponential',
  maxDelay: 8000,
  timeout: 15000,
  shouldRetry: (error: any) => {
    if (error instanceof QiFlowApiError) {
      return error.retryable;
    }

    // 网络相关错误
    if (error?.code) {
      const networkErrors = [
        'ENOTFOUND',
        'ECONNREFUSED',
        'ETIMEDOUT',
        'ECONNRESET',
      ];
      return networkErrors.includes(error.code);
    }

    return false;
  },
};

/**
 * 创建带熔断器的重试函数
 */
export function createRetryWithCircuitBreaker(
  circuitBreakerOptions: CircuitBreakerOptions,
  retryOptions: Partial<RetryOptions> = {}
) {
  const circuitBreaker = new CircuitBreaker(circuitBreakerOptions);

  return async function <T>(operation: () => Promise<T>): Promise<T> {
    return withRetry(() => circuitBreaker.execute(operation), retryOptions);
  };
}

/**
 * 批量操作重试
 */
export async function retryBatch<T>(
  operations: Array<() => Promise<T>>,
  options: Partial<RetryOptions> = {},
  concurrency = 3
): Promise<T[]> {
  const results: T[] = [];
  const errors: any[] = [];

  // 分批处理
  for (let i = 0; i < operations.length; i += concurrency) {
    const batch = operations.slice(i, i + concurrency);

    const batchPromises = batch.map(async (operation, index) => {
      try {
        return await withRetry(operation, options);
      } catch (error) {
        errors.push({ index: i + index, error });
        throw error;
      }
    });

    try {
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    } catch (error) {
      // 记录错误但继续处理其他批次
      console.warn('[RetryBatch] Batch failed:', error);
    }
  }

  if (errors.length > 0) {
    throw new QiFlowApiError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      `批量操作失败: ${errors.length}/${operations.length} 个操作失败`,
      { details: { errors } }
    );
  }

  return results;
}
