/**
 * QiFlow AI - 输入验证工具
 *
 * 基于 Zod 的输入验证，提供类型安全的请求体验证
 */

import { ErrorCode, QiFlowApiError, ValidationError } from '@/types/api-errors';
import { z } from 'zod';

/**
 * 通用验证规则
 */
const commonValidationRules = {
  sessionId: z.string().min(1, '会话ID不能为空').max(256, '会话ID过长'),
  userId: z.string().min(1, '用户ID不能为空').max(256, '用户ID过长'),
  message: z.string().min(1, '消息内容不能为空').max(10000, '消息内容过长'),
  locale: z.enum(['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'ms']).optional(),
  traceId: z.string().optional(),
};

/**
 * 聊天API请求验证
 */
export const chatRequestSchema = z.object({
  sessionId: commonValidationRules.sessionId.optional(),
  userId: commonValidationRules.userId,
  message: commonValidationRules.message,
  attachments: z.array(z.unknown()).optional(),
  locale: commonValidationRules.locale,
  metadata: z.record(z.string(), z.unknown()).optional(),
  traceId: commonValidationRules.traceId,
});

/**
 * 增强聊天API请求验证
 */
export const enhancedChatRequestSchema = z.object({
  sessionId: commonValidationRules.sessionId.optional(),
  userId: commonValidationRules.userId,
  message: commonValidationRules.message,
  attachments: z.array(z.unknown()).optional(),
  config: z
    .object({
      enableBaziAnalysis: z.boolean().optional(),
      enableFengShuiAnalysis: z.boolean().optional(),
      responseStyle: z
        .enum(['conversational', 'analytical', 'educational'])
        .optional(),
      explanationLevel: z.enum(['basic', 'detailed', 'expert']).optional(),
    })
    .optional(),
});

/**
 * 会话管理请求验证
 */
export const sessionRequestSchema = z.object({
  sessionId: commonValidationRules.sessionId,
  userId: commonValidationRules.userId.optional(),
});

/**
 * 知识图谱查询验证
 */
export const knowledgeQuerySchema = z.object({
  query: z.string().min(1, '查询内容不能为空').max(1000, '查询内容过长'),
  sessionId: commonValidationRules.sessionId.optional(),
  maxResults: z.number().int().min(1).max(20).optional().default(5),
  confidence: z.number().min(0).max(1).optional().default(0.7),
});

/**
 * 置信度评估请求验证
 */
export const confidenceRequestSchema = z.object({
  sessionId: commonValidationRules.sessionId,
  analysisId: z.string().min(1, '分析ID不能为空'),
  factors: z.record(z.string(), z.number().min(0).max(1)).optional(),
});

/**
 * 八字数据验证
 */
export const baziDataSchema = z.object({
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '出生日期格式无效 (YYYY-MM-DD)'),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/, '出生时间格式无效 (HH:MM)'),
  timezone: z.string().min(1, '时区不能为空'),
  longitude: z.number().min(-180).max(180),
  latitude: z.number().min(-90).max(90),
  calendarType: z.enum(['gregorian', 'lunar']).optional().default('gregorian'),
  useTrueSolarTime: z.boolean().optional().default(false),
});

/**
 * 风水数据验证
 */
export const fengshuiDataSchema = z.object({
  facingAngle: z.number().min(0).max(359.9, '面向角度必须在 0-359.9 度之间'),
  observedAt: z.string().datetime('观测时间格式无效'),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    address: z.string().min(1, '地址不能为空'),
    timezone: z.string().min(1, '时区不能为空'),
    country: z.string().optional(),
    region: z.string().optional(),
    city: z.string().optional(),
  }),
});

/**
 * 游客会话验证
 */
export const guestSessionSchema = z.object({
  deviceFingerprint: z.string().optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  metadata: z
    .object({
      source: z.enum(['api', 'web', 'mobile']),
      deviceType: z.enum(['desktop', 'mobile', 'tablet']).optional(),
      referrer: z.string().url().optional(),
      utmSource: z.string().optional(),
      utmMedium: z.string().optional(),
      utmCampaign: z.string().optional(),
    })
    .optional(),
});

/**
 * 验证函数类型
 */
export type ValidationSchema = z.ZodSchema<any>;

/**
 * 验证请求数据
 */
export async function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  traceId?: string
): Promise<T> {
  try {
    return await schema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors: ValidationError[] = error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
        value: err.path.reduce((obj, key) => obj?.[key], data as any),
      }));

      throw new QiFlowApiError(ErrorCode.VALIDATION_ERROR, '请求数据验证失败', {
        details: { validationErrors },
        traceId,
      });
    }

    throw new QiFlowApiError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      '验证过程中发生未知错误',
      { details: { originalError: error }, traceId }
    );
  }
}

/**
 * 安全的字符串清理
 */
export function sanitizeString(input: unknown, maxLength = 10000): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, '') // 移除控制字符
    .replace(/\s+/g, ' ') // 标准化空白字符
    .slice(0, maxLength); // 截断长度
}

/**
 * 验证并清理用户输入
 */
export function sanitizeAndValidateMessage(
  message: unknown,
  traceId?: string
): string {
  if (!message || typeof message !== 'string') {
    throw new QiFlowApiError(
      ErrorCode.INVALID_INPUT,
      '消息内容必须是非空字符串',
      { field: 'message', traceId }
    );
  }

  const sanitized = sanitizeString(message, 10000);

  if (!sanitized) {
    throw new QiFlowApiError(
      ErrorCode.INVALID_INPUT,
      '消息内容不能为空或只包含无效字符',
      { field: 'message', traceId }
    );
  }

  return sanitized;
}

/**
 * 验证会话ID格式
 */
export function validateSessionId(
  sessionId: unknown,
  traceId?: string
): string {
  if (!sessionId || typeof sessionId !== 'string') {
    throw new QiFlowApiError(
      ErrorCode.INVALID_INPUT,
      '会话ID必须是非空字符串',
      { field: 'sessionId', traceId }
    );
  }

  const trimmed = sessionId.trim();

  if (!trimmed || trimmed.length > 256) {
    throw new QiFlowApiError(
      ErrorCode.INVALID_INPUT,
      '会话ID长度必须在1-256字符之间',
      { field: 'sessionId', traceId }
    );
  }

  // 验证会话ID格式（字母数字下划线连字符）
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    throw new QiFlowApiError(
      ErrorCode.INVALID_FORMAT,
      '会话ID只能包含字母、数字、下划线和连字符',
      { field: 'sessionId', traceId }
    );
  }

  return trimmed;
}

/**
 * 验证用户ID格式
 */
export function validateUserId(userId: unknown, traceId?: string): string {
  if (!userId || typeof userId !== 'string') {
    throw new QiFlowApiError(
      ErrorCode.INVALID_INPUT,
      '用户ID必须是非空字符串',
      { field: 'userId', traceId }
    );
  }

  const trimmed = userId.trim();

  if (!trimmed || trimmed.length > 256) {
    throw new QiFlowApiError(
      ErrorCode.INVALID_INPUT,
      '用户ID长度必须在1-256字符之间',
      { field: 'userId', traceId }
    );
  }

  return trimmed;
}

/**
 * 验证坐标范围
 */
export function validateCoordinates(
  latitude: number,
  longitude: number,
  traceId?: string
): { latitude: number; longitude: number } {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    throw new QiFlowApiError(ErrorCode.INVALID_INPUT, '纬度和经度必须是数字', {
      traceId,
    });
  }

  if (latitude < -90 || latitude > 90) {
    throw new QiFlowApiError(
      ErrorCode.INVALID_INPUT,
      '纬度必须在 -90 到 90 度之间',
      { field: 'latitude', traceId }
    );
  }

  if (longitude < -180 || longitude > 180) {
    throw new QiFlowApiError(
      ErrorCode.INVALID_INPUT,
      '经度必须在 -180 到 180 度之间',
      { field: 'longitude', traceId }
    );
  }

  return { latitude, longitude };
}

/**
 * 验证时间格式
 */
export function validateDateTime(
  dateTime: string,
  fieldName: string,
  traceId?: string
): string {
  try {
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    return date.toISOString();
  } catch {
    throw new QiFlowApiError(
      ErrorCode.INVALID_FORMAT,
      `${fieldName}时间格式无效`,
      { field: fieldName, traceId }
    );
  }
}

/**
 * 批量验证函数
 */
export async function validateMultiple<T extends Record<string, any>>(
  validations: Array<{
    name: keyof T;
    schema: ValidationSchema;
    data: unknown;
  }>,
  traceId?: string
): Promise<T> {
  const results: Partial<T> = {};
  const errors: ValidationError[] = [];

  for (const validation of validations) {
    try {
      results[validation.name] = await validateRequest(
        validation.schema,
        validation.data,
        traceId
      );
    } catch (error) {
      if (error instanceof QiFlowApiError && error.details?.validationErrors) {
        errors.push(...(error.details.validationErrors as ValidationError[]));
      } else {
        errors.push({
          field: String(validation.name),
          message: error instanceof Error ? error.message : '验证失败',
          code: 'unknown_error',
        });
      }
    }
  }

  if (errors.length > 0) {
    throw new QiFlowApiError(ErrorCode.VALIDATION_ERROR, '多项验证失败', {
      details: { validationErrors: errors },
      traceId,
    });
  }

  return results as T;
}
