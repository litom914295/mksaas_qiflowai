/**
 * 八字计算错误类型定义
 * 提供详细的错误分类和上下文信息
 *
 * @module bazi/errors
 */

/**
 * 八字计算错误基类
 */
export class BaziError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, any>
  ) {
    super(message);
    this.name = 'BaziError';

    // 确保正确的原型链
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * 转换为JSON格式
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      stack: this.stack,
    };
  }
}

/**
 * 输入验证错误
 * 当用户提供的输入数据格式或值不正确时抛出
 */
export class ValidationError extends BaziError {
  constructor(
    message: string,
    public readonly errors: string[],
    context?: Record<string, any>
  ) {
    super(message, 'VALIDATION_ERROR', context);
    this.name = 'ValidationError';
  }

  /**
   * 获取错误详情
   */
  getDetails(): string {
    return this.errors.join('\n');
  }
}

/**
 * 日期转换错误
 * 当农历/公历转换失败时抛出
 */
export class DateConversionError extends BaziError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'DATE_CONVERSION_ERROR', context);
    this.name = 'DateConversionError';
  }
}

/**
 * 真太阳时计算错误
 * 当真太阳时计算失败时抛出
 */
export class TrueSolarTimeError extends BaziError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'TRUE_SOLAR_TIME_ERROR', context);
    this.name = 'TrueSolarTimeError';
  }
}

/**
 * 四柱计算错误
 * 当四柱计算过程中出现问题时抛出
 */
export class FourPillarsCalculationError extends BaziError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'FOUR_PILLARS_CALCULATION_ERROR', context);
    this.name = 'FourPillarsCalculationError';
  }
}

/**
 * 五行分析错误
 * 当五行强度分析失败时抛出
 */
export class WuxingAnalysisError extends BaziError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'WUXING_ANALYSIS_ERROR', context);
    this.name = 'WuxingAnalysisError';
  }
}

/**
 * 用神分析错误
 * 当用神推算失败时抛出
 */
export class YongshenAnalysisError extends BaziError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'YONGSHEN_ANALYSIS_ERROR', context);
    this.name = 'YongshenAnalysisError';
  }
}

/**
 * 数据不存在错误
 * 当查找的数据(如纳音、藏干)不存在时抛出
 */
export class DataNotFoundError extends BaziError {
  constructor(
    message: string,
    public readonly key: string,
    context?: Record<string, any>
  ) {
    super(message, 'DATA_NOT_FOUND', context);
    this.name = 'DataNotFoundError';
  }
}

/**
 * 配置错误
 * 当配置参数无效时抛出
 */
export class ConfigError extends BaziError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'CONFIG_ERROR', context);
    this.name = 'ConfigError';
  }
}

/**
 * 错误代码枚举
 */
export enum BaziErrorCode {
  // 通用错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',

  // 输入验证错误
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_DATE = 'INVALID_DATE',
  INVALID_TIME = 'INVALID_TIME',
  INVALID_LONGITUDE = 'INVALID_LONGITUDE',
  INVALID_LATITUDE = 'INVALID_LATITUDE',
  INVALID_GENDER = 'INVALID_GENDER',

  // 计算错误
  DATE_CONVERSION_ERROR = 'DATE_CONVERSION_ERROR',
  TRUE_SOLAR_TIME_ERROR = 'TRUE_SOLAR_TIME_ERROR',
  FOUR_PILLARS_CALCULATION_ERROR = 'FOUR_PILLARS_CALCULATION_ERROR',
  WUXING_ANALYSIS_ERROR = 'WUXING_ANALYSIS_ERROR',
  YONGSHEN_ANALYSIS_ERROR = 'YONGSHEN_ANALYSIS_ERROR',

  // 数据错误
  DATA_NOT_FOUND = 'DATA_NOT_FOUND',
  NAYIN_NOT_FOUND = 'NAYIN_NOT_FOUND',
  HIDDEN_STEM_NOT_FOUND = 'HIDDEN_STEM_NOT_FOUND',

  // 配置错误
  CONFIG_ERROR = 'CONFIG_ERROR',
  MISSING_DEPENDENCY = 'MISSING_DEPENDENCY',
}

/**
 * 判断是否为八字计算错误
 */
export function isBaziError(error: any): error is BaziError {
  return error instanceof BaziError;
}

/**
 * 判断是否为验证错误
 */
export function isValidationError(error: any): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * 创建错误响应对象
 */
export function createErrorResponse(error: Error): {
  success: false;
  error: {
    name: string;
    message: string;
    code?: string;
    context?: Record<string, any>;
    errors?: string[];
  };
} {
  if (isBaziError(error)) {
    return {
      success: false,
      error: {
        name: error.name,
        message: error.message,
        code: error.code,
        context: error.context,
        errors: isValidationError(error) ? error.errors : undefined,
      },
    };
  }

  // 通用错误
  return {
    success: false,
    error: {
      name: error.name || 'Error',
      message: error.message || '未知错误',
      code: BaziErrorCode.UNKNOWN_ERROR,
    },
  };
}

/**
 * 错误日志记录
 */
export function logError(error: Error, context?: Record<string, any>): void {
  if (process.env.NODE_ENV === 'development') {
    console.error('[BaziError]', {
      name: error.name,
      message: error.message,
      context,
      stack: error.stack,
    });
  }
}
