/**
 * QiFlow AI - API 错误类型定义
 *
 * 统一的错误类型系统，用于处理后端验证、业务逻辑和系统错误
 */

export enum ErrorCode {
  // 输入验证错误 (1xxx)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',

  // 认证和授权错误 (2xxx)
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  INVALID_SESSION = 'INVALID_SESSION',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  GUEST_SESSION_LIMIT_EXCEEDED = 'GUEST_SESSION_LIMIT_EXCEEDED',

  // 业务逻辑错误 (3xxx)
  CONVERSATION_STATE_ERROR = 'CONVERSATION_STATE_ERROR',
  ALGORITHM_EXECUTION_FAILED = 'ALGORITHM_EXECUTION_FAILED',
  INVALID_BAZI_DATA = 'INVALID_BAZI_DATA',
  INVALID_FENGSHUI_DATA = 'INVALID_FENGSHUI_DATA',
  KNOWLEDGE_SERVICE_ERROR = 'KNOWLEDGE_SERVICE_ERROR',

  // 资源限制错误 (4xxx)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  BUDGET_LIMIT_EXCEEDED = 'BUDGET_LIMIT_EXCEEDED',
  AI_SERVICE_UNAVAILABLE = 'AI_SERVICE_UNAVAILABLE',

  // 系统错误 (5xxx)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  REDIS_ERROR = 'REDIS_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
}

export interface ApiErrorDetails {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
  field?: string;
  timestamp: string;
  traceId?: string;
  retryable: boolean;
  category: 'validation' | 'auth' | 'business' | 'resource' | 'system';
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetails;
  validation?: ValidationError[];
  metadata: {
    requestId: string;
    timestamp: string;
    version: string;
    endpoint?: string;
  };
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  metadata: {
    requestId: string;
    timestamp: string;
    version: string;
    executionTime?: number;
  };
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * 创建标准化的错误响应
 */
export function createErrorResponse(
  error: Partial<ApiErrorDetails> & { code: ErrorCode; message: string },
  requestId: string,
  endpoint?: string,
  validation?: ValidationError[]
): ApiErrorResponse {
  const category = getErrorCategory(error.code);

  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      details: error.details,
      field: error.field,
      timestamp: new Date().toISOString(),
      traceId: error.traceId,
      retryable: isRetryableError(error.code),
      category,
    },
    validation,
    metadata: {
      requestId,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      endpoint,
    },
  };
}

/**
 * 创建标准化的成功响应
 */
export function createSuccessResponse<T>(
  data: T,
  requestId: string,
  executionTime?: number
): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    metadata: {
      requestId,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      executionTime,
    },
  };
}

/**
 * 根据错误代码获取错误类别
 */
function getErrorCategory(code: ErrorCode): ApiErrorDetails['category'] {
  if (
    code.startsWith('VALIDATION') ||
    code.includes('INVALID') ||
    code.includes('MISSING')
  ) {
    return 'validation';
  }
  if (
    code.includes('AUTH') ||
    code.includes('SESSION') ||
    code.includes('PERMISSION')
  ) {
    return 'auth';
  }
  if (
    code.includes('CONVERSATION') ||
    code.includes('ALGORITHM') ||
    code.includes('BAZI') ||
    code.includes('FENGSHUI')
  ) {
    return 'business';
  }
  if (
    code.includes('RATE_LIMIT') ||
    code.includes('QUOTA') ||
    code.includes('BUDGET')
  ) {
    return 'resource';
  }
  return 'system';
}

/**
 * 判断错误是否可重试
 */
function isRetryableError(code: ErrorCode): boolean {
  const retryableCodes: ErrorCode[] = [
    ErrorCode.NETWORK_ERROR,
    ErrorCode.TIMEOUT_ERROR,
    ErrorCode.EXTERNAL_SERVICE_ERROR,
    ErrorCode.AI_SERVICE_UNAVAILABLE,
    ErrorCode.REDIS_ERROR,
  ];

  return retryableCodes.includes(code);
}

/**
 * 自定义错误类，用于在应用中抛出结构化错误
 */
export class QiFlowApiError extends Error {
  public readonly code: ErrorCode;
  public readonly details?: Record<string, unknown>;
  public readonly field?: string;
  public readonly traceId?: string;
  public readonly retryable: boolean;
  public readonly category: ApiErrorDetails['category'];

  constructor(
    code: ErrorCode,
    message: string,
    options: {
      details?: Record<string, unknown>;
      field?: string;
      traceId?: string;
      cause?: unknown;
    } = {}
  ) {
    super(message);
    this.name = 'QiFlowApiError';
    this.code = code;
    this.details = options.details;
    this.field = options.field;
    this.traceId = options.traceId;
    this.retryable = isRetryableError(code);
    this.category = getErrorCategory(code);
    this.cause = options.cause;
  }

  /**
   * 将错误转换为API响应格式
   */
  toApiResponse(requestId: string, endpoint?: string): ApiErrorResponse {
    return createErrorResponse(
      {
        code: this.code,
        message: this.message,
        details: this.details,
        field: this.field,
        traceId: this.traceId,
      },
      requestId,
      endpoint
    );
  }
}

/**
 * 常用错误创建函数
 */
export const createValidationError = (
  field: string,
  message: string,
  value?: unknown,
  traceId?: string
) =>
  new QiFlowApiError(
    ErrorCode.VALIDATION_ERROR,
    `Validation failed for field '${field}': ${message}`,
    { field, details: { value }, traceId }
  );

export const createAuthenticationError = (
  message: string = 'Authentication failed',
  traceId?: string
) => new QiFlowApiError(ErrorCode.AUTHENTICATION_FAILED, message, { traceId });

export const createRateLimitError = (
  limit: number,
  resetTime?: number,
  traceId?: string
) =>
  new QiFlowApiError(ErrorCode.RATE_LIMIT_EXCEEDED, 'Rate limit exceeded', {
    details: { limit, resetTime },
    traceId,
  });

export const createInternalError = (
  message: string = 'Internal server error',
  cause?: unknown,
  traceId?: string
) =>
  new QiFlowApiError(ErrorCode.INTERNAL_SERVER_ERROR, message, {
    details: { cause: cause instanceof Error ? cause.message : cause },
    traceId,
  });
