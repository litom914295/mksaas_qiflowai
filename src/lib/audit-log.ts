/**
 * Audit Log Module
 *
 * Records critical operations for security, compliance, and debugging
 */

import { randomUUID } from 'crypto';
import { getDb } from '@/db';
import { auditLogs } from '@/db/schema';

/**
 * Audit log event types
 */
export enum AuditEventType {
  // Authentication & Authorization
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_LOGIN_FAILED = 'USER_LOGIN_FAILED',
  USER_REGISTER = 'USER_REGISTER',
  USER_PASSWORD_CHANGE = 'USER_PASSWORD_CHANGE',
  USER_ROLE_CHANGE = 'USER_ROLE_CHANGE',
  USER_BAN = 'USER_BAN',
  USER_UNBAN = 'USER_UNBAN',

  // Credits & Payments
  CREDITS_ADD = 'CREDITS_ADD',
  CREDITS_CONSUME = 'CREDITS_CONSUME',
  CREDITS_REFUND = 'CREDITS_REFUND',
  CREDITS_EXPIRE = 'CREDITS_EXPIRE',
  PAYMENT_CREATED = 'PAYMENT_CREATED',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_REFUNDED = 'PAYMENT_REFUNDED',
  SUBSCRIPTION_CREATED = 'SUBSCRIPTION_CREATED',
  SUBSCRIPTION_UPDATED = 'SUBSCRIPTION_UPDATED',
  SUBSCRIPTION_CANCELLED = 'SUBSCRIPTION_CANCELLED',

  // AI & Content
  AI_IMAGE_GENERATED = 'AI_IMAGE_GENERATED',
  AI_IMAGE_FAILED = 'AI_IMAGE_FAILED',
  AI_CONTENT_MODERATION = 'AI_CONTENT_MODERATION',
  AI_RATE_LIMIT_EXCEEDED = 'AI_RATE_LIMIT_EXCEEDED',

  // Content Moderation
  CONTENT_MODERATION_FLAGGED = 'CONTENT_MODERATION_FLAGGED',
  CONTENT_MODERATION_FAILED = 'CONTENT_MODERATION_FAILED',
  CONTENT_MODERATION_PASSED = 'CONTENT_MODERATION_PASSED',

  // Admin Actions
  ADMIN_USER_EDIT = 'ADMIN_USER_EDIT',
  ADMIN_CREDIT_ADJUST = 'ADMIN_CREDIT_ADJUST',
  ADMIN_CONFIG_CHANGE = 'ADMIN_CONFIG_CHANGE',

  // Security
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
}

/**
 * Audit log severity levels
 */
export enum AuditSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export interface AuditLogEntry {
  eventType: AuditEventType;
  userId?: string;
  userName?: string;
  severity?: AuditSeverity;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log an audit event
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    const db = await getDb();

    await db.insert(auditLogs).values({
      userId: entry.userId || 'system',
      userEmail: (entry.userName || entry.userId || 'system') as string,
      action: String(entry.eventType),
      resource: 'system',
      description: entry.description,
      // 按表结构，changes 为 { before?:..., after?:... }
      changes: undefined,
      status:
        entry.severity === AuditSeverity.ERROR ||
        entry.severity === AuditSeverity.CRITICAL
          ? 'failed'
          : 'success',
      ipAddress: entry.ipAddress || undefined,
      userAgent: entry.userAgent || undefined,
    });

    // Also log to console for immediate visibility
    const logLevel =
      entry.severity === AuditSeverity.ERROR ||
      entry.severity === AuditSeverity.CRITICAL
        ? 'error'
        : entry.severity === AuditSeverity.WARNING
          ? 'warn'
          : 'info';

    console[logLevel]('[AUDIT]', {
      eventType: entry.eventType,
      userId: entry.userId,
      description: entry.description,
      severity: entry.severity,
    });
  } catch (error) {
    // Don't let audit logging failure break the application
    console.error('[AUDIT] Failed to log audit event:', error);
  }
}

/**
 * Helper functions for common audit events
 */

export async function logCreditsChange(params: {
  userId: string;
  userName?: string;
  amount: number;
  type: 'add' | 'consume' | 'refund';
  description: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  const eventTypeMap = {
    add: AuditEventType.CREDITS_ADD,
    consume: AuditEventType.CREDITS_CONSUME,
    refund: AuditEventType.CREDITS_REFUND,
  };

  await logAudit({
    eventType: eventTypeMap[params.type],
    userId: params.userId,
    userName: params.userName,
    severity: AuditSeverity.INFO,
    description: params.description,
    metadata: {
      amount: params.amount,
      ...params.metadata,
    },
  });
}

export async function logPaymentEvent(params: {
  userId: string;
  userName?: string;
  eventType: AuditEventType;
  description: string;
  amount?: number;
  currency?: string;
  paymentId?: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  await logAudit({
    eventType: params.eventType,
    userId: params.userId,
    userName: params.userName,
    severity: AuditSeverity.INFO,
    description: params.description,
    metadata: {
      amount: params.amount,
      currency: params.currency,
      paymentId: params.paymentId,
      ...params.metadata,
    },
  });
}

export async function logSecurityEvent(params: {
  eventType: AuditEventType;
  userId?: string;
  description: string;
  severity?: AuditSeverity;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  await logAudit({
    eventType: params.eventType,
    userId: params.userId,
    severity: params.severity || AuditSeverity.WARNING,
    description: params.description,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: params.metadata,
  });
}

export async function logAIEvent(params: {
  userId: string;
  eventType: AuditEventType;
  description: string;
  provider?: string;
  model?: string;
  creditsConsumed?: number;
  success: boolean;
  metadata?: Record<string, any>;
}): Promise<void> {
  await logAudit({
    eventType: params.eventType,
    userId: params.userId,
    severity: params.success ? AuditSeverity.INFO : AuditSeverity.WARNING,
    description: params.description,
    metadata: {
      provider: params.provider,
      model: params.model,
      creditsConsumed: params.creditsConsumed,
      success: params.success,
      ...params.metadata,
    },
  });
}

/**
 * Query audit logs (for admin dashboard)
 */
export async function queryAuditLogs(params: {
  userId?: string;
  eventType?: AuditEventType;
  severity?: AuditSeverity;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): Promise<any[]> {
  // Implementation depends on your DB schema
  // This is a placeholder for the actual implementation
  const db = await getDb();

  // Build query based on params
  // Return filtered audit logs

  return []; // Placeholder
}
