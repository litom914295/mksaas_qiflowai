import { getDb } from '@/db';
import { auditLogs } from '@/db/schema';
import type { NextRequest } from 'next/server';

/**
 * 审计日志操作类型
 */
export const AuditAction = {
  // 用户操作
  USER_CREATE: 'USER_CREATE',
  USER_UPDATE: 'USER_UPDATE',
  USER_DELETE: 'USER_DELETE',
  USER_BLOCK: 'USER_BLOCK',
  USER_UNBLOCK: 'USER_UNBLOCK',
  USER_ASSIGN_ROLE: 'USER_ASSIGN_ROLE',
  USER_REVOKE_ROLE: 'USER_REVOKE_ROLE',

  // 角色操作
  ROLE_CREATE: 'ROLE_CREATE',
  ROLE_UPDATE: 'ROLE_UPDATE',
  ROLE_DELETE: 'ROLE_DELETE',
  ROLE_ASSIGN_PERMISSION: 'ROLE_ASSIGN_PERMISSION',
  ROLE_REVOKE_PERMISSION: 'ROLE_REVOKE_PERMISSION',

  // 权限操作
  PERMISSION_CREATE: 'PERMISSION_CREATE',
  PERMISSION_UPDATE: 'PERMISSION_UPDATE',
  PERMISSION_DELETE: 'PERMISSION_DELETE',

  // 积分操作
  CREDIT_ADJUST: 'CREDIT_ADJUST',
  CREDIT_PURCHASE: 'CREDIT_PURCHASE',
  CREDIT_REFUND: 'CREDIT_REFUND',

  // 内容操作
  CONTENT_CREATE: 'CONTENT_CREATE',
  CONTENT_UPDATE: 'CONTENT_UPDATE',
  CONTENT_DELETE: 'CONTENT_DELETE',
  CONTENT_APPROVE: 'CONTENT_APPROVE',
  CONTENT_REJECT: 'CONTENT_REJECT',

  // 订单操作
  ORDER_CREATE: 'ORDER_CREATE',
  ORDER_UPDATE: 'ORDER_UPDATE',
  ORDER_REFUND: 'ORDER_REFUND',
  ORDER_CANCEL: 'ORDER_CANCEL',

  // 配置操作
  CONFIG_UPDATE: 'CONFIG_UPDATE',

  // 登录操作
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',
} as const;

export type AuditActionType = (typeof AuditAction)[keyof typeof AuditAction];

/**
 * 审计日志资源类型
 */
export const AuditResource = {
  USER: 'USER',
  ROLE: 'ROLE',
  PERMISSION: 'PERMISSION',
  CREDIT: 'CREDIT',
  ORDER: 'ORDER',
  CONTENT: 'CONTENT',
  CONFIG: 'CONFIG',
  AUTH: 'AUTH',
  BAZI_ANALYSIS: 'BAZI_ANALYSIS',
  FENGSHUI_ANALYSIS: 'FENGSHUI_ANALYSIS',
  AI_CHAT: 'AI_CHAT',
  COMPASS: 'COMPASS',
} as const;

export type AuditResourceType =
  (typeof AuditResource)[keyof typeof AuditResource];

/**
 * 审计日志状态
 */
export const AuditStatus = {
  SUCCESS: 'success',
  FAILED: 'failed',
  WARNING: 'warning',
} as const;

export type AuditStatusType = (typeof AuditStatus)[keyof typeof AuditStatus];

/**
 * 审计日志参数
 */
interface LogAuditParams {
  userId: string;
  userEmail?: string;
  action: AuditActionType;
  resource: AuditResourceType;
  resourceId?: string;
  description: string;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  status?: AuditStatusType;
  errorMessage?: string;
  request?: NextRequest;
  ipAddress?: string;
  userAgent?: string;
  method?: string;
  path?: string;
}

/**
 * 从Request对象提取元数据
 */
function extractRequestMetadata(request?: NextRequest) {
  if (!request) {
    return {
      ipAddress: null,
      userAgent: null,
      method: null,
      path: null,
    };
  }

  // 提取真实IP(考虑代理)
  const ipAddress =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    null;

  const userAgent = request.headers.get('user-agent') || null;
  const method = request.method;
  const path = request.nextUrl.pathname;

  return { ipAddress, userAgent, method, path };
}

/**
 * 清理敏感信息
 */
function sanitizeChanges(changes?: {
  before?: Record<string, any>;
  after?: Record<string, any>;
}): { before?: Record<string, any>; after?: Record<string, any> } | null {
  if (!changes) return null;

  const sensitiveFields = [
    'password',
    'passwordHash',
    'token',
    'apiKey',
    'secret',
    'privateKey',
  ];

  function removeSensitiveFields(
    obj: Record<string, any>
  ): Record<string, any> {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
        cleaned[key] = '[REDACTED]';
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        cleaned[key] = removeSensitiveFields(value);
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }

  return {
    before: changes.before ? removeSensitiveFields(changes.before) : undefined,
    after: changes.after ? removeSensitiveFields(changes.after) : undefined,
  };
}

/**
 * 记录审计日志(异步非阻塞)
 */
export async function logAudit(params: LogAuditParams): Promise<void> {
  try {
    const {
      userId,
      userEmail,
      action,
      resource,
      resourceId,
      description,
      changes,
      status = AuditStatus.SUCCESS,
      errorMessage,
      request,
      ipAddress: customIpAddress,
      userAgent: customUserAgent,
      method: customMethod,
      path: customPath,
    } = params;

    // 提取请求元数据
    const requestMetadata = extractRequestMetadata(request);

    // 清理敏感信息
    const sanitizedChanges = sanitizeChanges(changes);

    // 写入数据库(异步非阻塞)
    const db = await getDb();
    await db.insert(auditLogs).values({
      userId: userId || 'system',
      userEmail: userEmail || 'system',
      action,
      resource,
      resourceId: resourceId || undefined,
      description,
      changes: sanitizedChanges || undefined,
      status,
      errorMessage: errorMessage || undefined,
      ipAddress: customIpAddress || requestMetadata.ipAddress || undefined,
      userAgent: customUserAgent || requestMetadata.userAgent || undefined,
      method: customMethod || requestMetadata.method || undefined,
      path: customPath || requestMetadata.path || undefined,
    });

    console.log(
      `[Audit] ${action} on ${resource}${resourceId ? `:${resourceId}` : ''} by ${userId}`
    );
  } catch (error) {
    // 审计日志失败不应影响主流程,只记录错误
    console.error('[Audit] Failed to log audit:', error);
  }
}

/**
 * 批量记录审计日志
 */
export async function logAuditBatch(logs: LogAuditParams[]): Promise<void> {
  try {
    const sanitizedLogs = logs.map((params) => {
      const requestMetadata = extractRequestMetadata(params.request);
      const sanitizedChanges = sanitizeChanges(params.changes);

      return {
        userId: params.userId,
        userEmail: params.userEmail || null,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId || null,
        description: params.description,
        changes: sanitizedChanges,
        status: params.status || AuditStatus.SUCCESS,
        errorMessage: params.errorMessage || null,
        ipAddress: params.ipAddress || requestMetadata.ipAddress,
        userAgent: params.userAgent || requestMetadata.userAgent,
        method: params.method || requestMetadata.method,
        path: params.path || requestMetadata.path,
      };
    });

    const db = await getDb();
    await db.insert(auditLogs).values(
      sanitizedLogs.map((l) => ({
        ...l,
        userId: l.userId || 'system',
        userEmail: l.userEmail || 'system',
      }))
    );

    console.log(`[Audit] Batch logged ${logs.length} entries`);
  } catch (error) {
    console.error('[Audit] Failed to batch log audits:', error);
  }
}

/**
 * 便捷函数:记录用户操作
 */
export async function logUserAction(params: {
  userId: string;
  userEmail?: string;
  action: AuditActionType;
  targetUserId?: string;
  description: string;
  changes?: { before?: Record<string, any>; after?: Record<string, any> };
  request?: NextRequest;
  status?: AuditStatusType;
  errorMessage?: string;
}): Promise<void> {
  return logAudit({
    ...params,
    resource: AuditResource.USER,
    resourceId: params.targetUserId,
  });
}

/**
 * 便捷函数:记录角色操作
 */
export async function logRoleAction(params: {
  userId: string;
  userEmail?: string;
  action: AuditActionType;
  roleId?: string;
  description: string;
  changes?: { before?: Record<string, any>; after?: Record<string, any> };
  request?: NextRequest;
  status?: AuditStatusType;
  errorMessage?: string;
}): Promise<void> {
  return logAudit({
    ...params,
    resource: AuditResource.ROLE,
    resourceId: params.roleId,
  });
}

/**
 * 便捷函数:记录积分操作
 */
export async function logCreditAction(params: {
  userId: string;
  userEmail?: string;
  action: AuditActionType;
  targetUserId?: string;
  description: string;
  changes?: { before?: Record<string, any>; after?: Record<string, any> };
  request?: NextRequest;
  status?: AuditStatusType;
  errorMessage?: string;
}): Promise<void> {
  return logAudit({
    ...params,
    resource: AuditResource.CREDIT,
    resourceId: params.targetUserId,
  });
}
