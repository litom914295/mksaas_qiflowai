/**
 * Retry Utilities
 * 重试工具类
 */

export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: 'linear' | 'exponential';
  onRetry?: (attempt: number, error: Error) => void;
  shouldRetry?: (error: Error) => boolean;
}

/**
 * 重试异步函数
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 'exponential',
    onRetry,
    shouldRetry = () => true,
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts || !shouldRetry(lastError)) {
        throw lastError;
      }

      const waitTime = calculateDelay(attempt, delay, backoff);

      if (onRetry) {
        onRetry(attempt, lastError);
      }

      await sleep(waitTime);
    }
  }

  throw lastError!;
}

/**
 * 计算延迟时间
 */
function calculateDelay(
  attempt: number,
  baseDelay: number,
  backoff: 'linear' | 'exponential'
): number {
  if (backoff === 'exponential') {
    return baseDelay * Math.pow(2, attempt - 1);
  }
  return baseDelay * attempt;
}

/**
 * 休眠函数
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 带超时的 Promise
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = 'Operation timed out'
): Promise<T> {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId!);
  }
}

/**
 * 批量重试
 */
export async function retryBatch<T>(
  items: T[],
  fn: (item: T) => Promise<any>,
  options: RetryOptions = {}
): Promise<{ success: any[]; failed: Array<{ item: T; error: Error }> }> {
  const results = await Promise.allSettled(
    items.map((item) => retry(() => fn(item), options))
  );

  const success: any[] = [];
  const failed: Array<{ item: T; error: Error }> = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      success.push(result.value);
    } else {
      failed.push({ item: items[index], error: result.reason });
    }
  });

  return { success, failed };
}

/**
 * 条件重试 - 根据错误类型决定是否重试
 */
export function createRetryableError(message: string, retryable = true): Error {
  const error = new Error(message);
  (error as any).retryable = retryable;
  return error;
}

export function isRetryableError(error: Error): boolean {
  return (error as any).retryable !== false;
}

/**
 * withRetry 是 retry 函数的别名
 */
export const withRetry = retry;
