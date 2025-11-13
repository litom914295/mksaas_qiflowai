/**
 * 八字错误处理工具
 * 提供 try-catch 包装器和错误边界
 *
 * @module bazi/utils/error-handler
 */

import {
  BaziError,
  DateConversionError,
  FourPillarsCalculationError,
  TrueSolarTimeError,
  ValidationError,
  WuxingAnalysisError,
  YongshenAnalysisError,
  createErrorResponse,
  logError,
} from '../errors';

/**
 * 通用结果类型
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * 安全执行函数(同步)
 * 捕获所有异常并返回 Result
 *
 * @example
 * ```ts
 * const result = safeExecute(() => calculateBazi(input));
 * if (result.success) {
 *   console.log(result.data);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export function safeExecute<T>(
  fn: () => T,
  context?: Record<string, any>
): Result<T> {
  try {
    const data = fn();
    return { success: true, data };
  } catch (error) {
    logError(error as Error, context);
    return {
      success: false,
      error: error as Error,
    };
  }
}

/**
 * 安全执行函数(异步)
 * 捕获所有异常并返回 Result
 *
 * @example
 * ```ts
 * const result = await safeExecuteAsync(async () => {
 *   return await fetchBaziData();
 * });
 * ```
 */
export async function safeExecuteAsync<T>(
  fn: () => Promise<T>,
  context?: Record<string, any>
): Promise<Result<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    logError(error as Error, context);
    return {
      success: false,
      error: error as Error,
    };
  }
}

/**
 * 包装函数为安全版本
 *
 * @example
 * ```ts
 * const safeBaziCalc = wrapSafe(calculateBazi);
 * const result = safeBaziCalc(input);
 * ```
 */
export function wrapSafe<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => TReturn,
  context?: Record<string, any>
): (...args: TArgs) => Result<TReturn> {
  return (...args: TArgs) => {
    return safeExecute(() => fn(...args), context);
  };
}

/**
 * 包装异步函数为安全版本
 */
export function wrapSafeAsync<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  context?: Record<string, any>
): (...args: TArgs) => Promise<Result<TReturn>> {
  return async (...args: TArgs) => {
    return await safeExecuteAsync(() => fn(...args), context);
  };
}

/**
 * 重试执行(带指数退避)
 *
 * @example
 * ```ts
 * const result = await retryAsync(
 *   () => fetchBaziData(),
 *   { maxRetries: 3, delay: 1000 }
 * );
 * ```
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    backoff?: number;
    shouldRetry?: (error: Error) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = 2,
    shouldRetry = () => true,
  } = options;

  let lastError: Error;
  let currentDelay = delay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // 最后一次尝试或不应该重试
      if (attempt === maxRetries || !shouldRetry(lastError)) {
        throw lastError;
      }

      // 等待后重试
      await new Promise((resolve) => setTimeout(resolve, currentDelay));
      currentDelay *= backoff;
    }
  }

  throw lastError!;
}

/**
 * 错误转换器
 * 将未知错误转换为八字错误
 */
export function toBaziError(error: unknown): BaziError {
  if (error instanceof BaziError) {
    return error;
  }

  if (error instanceof Error) {
    // 根据错误消息推断错误类型
    const message = error.message.toLowerCase();

    if (message.includes('validation') || message.includes('invalid')) {
      return new ValidationError(error.message, [error.message]);
    }

    if (message.includes('date') || message.includes('lunar')) {
      return new DateConversionError(error.message);
    }

    if (message.includes('solar') || message.includes('time')) {
      return new TrueSolarTimeError(error.message);
    }

    if (message.includes('pillar') || message.includes('四柱')) {
      return new FourPillarsCalculationError(error.message);
    }

    if (message.includes('wuxing') || message.includes('五行')) {
      return new WuxingAnalysisError(error.message);
    }

    if (message.includes('yongshen') || message.includes('用神')) {
      return new YongshenAnalysisError(error.message);
    }

    // 默认八字错误
    return new BaziError(error.message, 'UNKNOWN_ERROR');
  }

  // 非 Error 对象
  return new BaziError(String(error) || '未知错误', 'UNKNOWN_ERROR', {
    originalError: error,
  });
}

/**
 * 错误边界装饰器
 * 用于类方法
 *
 * @example
 * ```ts
 * class BaziCalculator {
 *   @withErrorBoundary()
 *   calculate(input: BirthInput) {
 *     // 可能抛出异常的代码
 *   }
 * }
 * ```
 */
export function withErrorBoundary(
  errorType: typeof BaziError = BaziError
): MethodDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      try {
        const result = originalMethod.apply(this, args);

        // 如果返回Promise,处理异步错误
        if (result instanceof Promise) {
          return result.catch((error: Error) => {
            throw toBaziError(error);
          });
        }

        return result;
      } catch (error) {
        throw toBaziError(error);
      }
    };

    return descriptor;
  };
}

/**
 * 创建错误处理中间件(用于API路由)
 *
 * @example
 * ```ts
 * export async function POST(req: Request) {
 *   return handleApiError(async () => {
 *     const data = await req.json();
 *     const result = await calculateBazi(data);
 *     return Response.json({ success: true, data: result });
 *   });
 * }
 * ```
 */
export async function handleApiError<T>(
  handler: () => Promise<T>
): Promise<T | Response> {
  try {
    return await handler();
  } catch (error) {
    const baziError = toBaziError(error);
    const response = createErrorResponse(baziError);

    // 开发环境下记录详细错误
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Error]', {
        error: baziError,
        stack: baziError.stack,
      });
    }

    // 返回错误响应
    return Response.json(response, {
      status: getHttpStatus(baziError),
    });
  }
}

/**
 * 根据错误类型获取HTTP状态码
 */
function getHttpStatus(error: BaziError): number {
  if (error instanceof ValidationError) {
    return 400; // Bad Request
  }

  if (
    error instanceof DateConversionError ||
    error instanceof TrueSolarTimeError ||
    error instanceof FourPillarsCalculationError ||
    error instanceof WuxingAnalysisError ||
    error instanceof YongshenAnalysisError
  ) {
    return 422; // Unprocessable Entity
  }

  return 500; // Internal Server Error
}

/**
 * 断言函数(类型守卫)
 *
 * @example
 * ```ts
 * assert(date !== null, '日期不能为空');
 * // 此后 TypeScript 知道 date 不是 null
 * ```
 */
export function assert(
  condition: any,
  message: string,
  ErrorClass: typeof BaziError = BaziError
): asserts condition {
  if (!condition) {
    throw new ErrorClass(message, 'ASSERTION_FAILED');
  }
}

/**
 * 非空断言
 */
export function assertNotNull<T>(
  value: T | null | undefined,
  message = '值不能为空'
): asserts value is T {
  assert(value != null, message);
}

/**
 * 类型断言
 */
export function assertType<T>(
  value: unknown,
  typeGuard: (value: unknown) => value is T,
  message = '类型不匹配'
): asserts value is T {
  if (!typeGuard(value)) {
    throw new ValidationError(message, [message]);
  }
}
