/**
 * Security Monitoring and Alerting Module
 *
 * Monitors critical security events and triggers alerts when thresholds are exceeded
 */

import { getDb } from '@/db';
import { auditLogs, creditTransaction } from '@/db/schema';
import { and, eq, gte, sql } from 'drizzle-orm';
import { AuditEventType, AuditSeverity } from './audit-log';

/**
 * Alert severity levels
 */
export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

/**
 * Alert types
 */
export enum AlertType {
  ABNORMAL_CREDITS = 'ABNORMAL_CREDITS',
  EXCESSIVE_AUTH_FAILURES = 'EXCESSIVE_AUTH_FAILURES',
  HIGH_ERROR_RATE = 'HIGH_ERROR_RATE',
  RATE_LIMIT_ABUSE = 'RATE_LIMIT_ABUSE',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  CONTENT_MODERATION_SPIKE = 'CONTENT_MODERATION_SPIKE',
}

/**
 * Alert configuration
 */
interface AlertConfig {
  /** Alert type */
  type: AlertType;
  /** Alert severity */
  severity: AlertSeverity;
  /** Alert threshold */
  threshold: number;
  /** Time window in minutes */
  windowMinutes: number;
  /** Alert message template */
  message: string;
}

/**
 * Alert result
 */
interface AlertResult {
  triggered: boolean;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  details: Record<string, any>;
  timestamp: Date;
}

/**
 * Alert configurations
 */
const ALERT_CONFIGS: AlertConfig[] = [
  {
    type: AlertType.ABNORMAL_CREDITS,
    severity: AlertSeverity.CRITICAL,
    threshold: 1000, // Credits in a single transaction
    windowMinutes: 60,
    message: 'Abnormal credit transaction detected',
  },
  {
    type: AlertType.EXCESSIVE_AUTH_FAILURES,
    severity: AlertSeverity.WARNING,
    threshold: 5, // Failed auth attempts
    windowMinutes: 5,
    message: 'Excessive authentication failures detected',
  },
  {
    type: AlertType.HIGH_ERROR_RATE,
    severity: AlertSeverity.WARNING,
    threshold: 10, // Error percentage
    windowMinutes: 15,
    message: 'High error rate detected',
  },
  {
    type: AlertType.RATE_LIMIT_ABUSE,
    severity: AlertSeverity.WARNING,
    threshold: 10, // Rate limit hits
    windowMinutes: 60,
    message: 'Excessive rate limit violations detected',
  },
  {
    type: AlertType.CONTENT_MODERATION_SPIKE,
    severity: AlertSeverity.WARNING,
    threshold: 5, // Flagged content
    windowMinutes: 15,
    message: 'Content moderation spike detected',
  },
];

/**
 * Check for abnormal credit transactions
 */
async function checkAbnormalCredits(
  config: AlertConfig
): Promise<AlertResult | null> {
  try {
    const db = await getDb();
    const now = new Date();
    const windowStart = new Date(
      now.getTime() - config.windowMinutes * 60 * 1000
    );

    // Check for large single transactions
    const largeTransactions = await db
      .select()
      .from(creditTransaction)
      .where(
        and(
          gte(creditTransaction.createdAt, windowStart),
          sql`ABS(${creditTransaction.amount}) >= ${config.threshold}`
        )
      )
      .limit(10);

    if (largeTransactions.length > 0) {
      return {
        triggered: true,
        type: config.type,
        severity: config.severity,
        message: config.message,
        details: {
          count: largeTransactions.length,
          transactions: largeTransactions.map((t) => ({
            userId: t.userId,
            amount: t.amount,
            type: t.type,
            createdAt: t.createdAt,
          })),
          windowMinutes: config.windowMinutes,
        },
        timestamp: now,
      };
    }

    return null;
  } catch (error) {
    console.error('Error checking abnormal credits:', error);
    return null;
  }
}

/**
 * Check for excessive authentication failures
 */
async function checkAuthFailures(
  config: AlertConfig
): Promise<AlertResult | null> {
  try {
    const db = await getDb();
    const now = new Date();
    const windowStart = new Date(
      now.getTime() - config.windowMinutes * 60 * 1000
    );

    // Count failed auth attempts
    const failedAttempts = await db
      .select({
        userId: auditLogs.userId,
        count: sql<number>`COUNT(*)`,
      })
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.eventType, AuditEventType.USER_LOGIN_FAILED),
          gte(auditLogs.createdAt, windowStart)
        )
      )
      .groupBy(auditLogs.userId)
      .having(sql`COUNT(*) >= ${config.threshold}`);

    if (failedAttempts.length > 0) {
      return {
        triggered: true,
        type: config.type,
        severity: config.severity,
        message: config.message,
        details: {
          affectedUsers: failedAttempts.length,
          users: failedAttempts.map((u) => ({
            userId: u.userId,
            attempts: u.count,
          })),
          windowMinutes: config.windowMinutes,
        },
        timestamp: now,
      };
    }

    return null;
  } catch (error) {
    console.error('Error checking auth failures:', error);
    return null;
  }
}

/**
 * Check for high error rate
 */
async function checkErrorRate(
  config: AlertConfig
): Promise<AlertResult | null> {
  try {
    const db = await getDb();
    const now = new Date();
    const windowStart = new Date(
      now.getTime() - config.windowMinutes * 60 * 1000
    );

    // Count total and error events
    const errorEvents = await db
      .select({
        total: sql<number>`COUNT(*)`,
        errors: sql<number>`COUNT(CASE WHEN ${auditLogs.severity} IN ('ERROR', 'CRITICAL') THEN 1 END)`,
      })
      .from(auditLogs)
      .where(gte(auditLogs.createdAt, windowStart));

    if (errorEvents.length > 0 && errorEvents[0]) {
      const total = errorEvents[0].total || 0;
      const errors = errorEvents[0].errors || 0;
      const errorRate = total > 0 ? (errors / total) * 100 : 0;

      if (errorRate >= config.threshold && total >= 10) {
        // At least 10 events
        return {
          triggered: true,
          type: config.type,
          severity: config.severity,
          message: config.message,
          details: {
            errorRate: errorRate.toFixed(2),
            totalEvents: total,
            errorEvents: errors,
            windowMinutes: config.windowMinutes,
          },
          timestamp: now,
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error checking error rate:', error);
    return null;
  }
}

/**
 * Check for rate limit abuse
 */
async function checkRateLimitAbuse(
  config: AlertConfig
): Promise<AlertResult | null> {
  try {
    const db = await getDb();
    const now = new Date();
    const windowStart = new Date(
      now.getTime() - config.windowMinutes * 60 * 1000
    );

    // Count rate limit violations per user
    const violations = await db
      .select({
        userId: auditLogs.userId,
        count: sql<number>`COUNT(*)`,
      })
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.eventType, AuditEventType.RATE_LIMIT_EXCEEDED),
          gte(auditLogs.createdAt, windowStart)
        )
      )
      .groupBy(auditLogss.userId)
      .having(sql`COUNT(*) >= ${config.threshold}`);

    if (violations.length > 0) {
      return {
        triggered: true,
        type: config.type,
        severity: config.severity,
        message: config.message,
        details: {
          affectedUsers: violations.length,
          users: violations.map((u) => ({
            userId: u.userId,
            violations: u.count,
          })),
          windowMinutes: config.windowMinutes,
        },
        timestamp: now,
      };
    }

    return null;
  } catch (error) {
    console.error('Error checking rate limit abuse:', error);
    return null;
  }
}

/**
 * Check for content moderation spike
 */
async function checkModerationSpike(
  config: AlertConfig
): Promise<AlertResult | null> {
  try {
    const db = await getDb();
    const now = new Date();
    const windowStart = new Date(
      now.getTime() - config.windowMinutes * 60 * 1000
    );

    // Count flagged content
    const flaggedCount = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.eventType, AuditEventType.CONTENT_MODERATION_FLAGGED),
          gte(auditLogs.createdAt, windowStart)
        )
      );

    if (flaggedCount.length > 0 && flaggedCount[0]) {
      const count = flaggedCount[0].count || 0;

      if (count >= config.threshold) {
        return {
          triggered: true,
          type: config.type,
          severity: config.severity,
          message: config.message,
          details: {
            flaggedContent: count,
            windowMinutes: config.windowMinutes,
          },
          timestamp: now,
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error checking moderation spike:', error);
    return null;
  }
}

/**
 * Run all security checks
 */
export async function runSecurityChecks(): Promise<AlertResult[]> {
  const alerts: AlertResult[] = [];

  for (const config of ALERT_CONFIGS) {
    let result: AlertResult | null = null;

    switch (config.type) {
      case AlertType.ABNORMAL_CREDITS:
        result = await checkAbnormalCredits(config);
        break;
      case AlertType.EXCESSIVE_AUTH_FAILURES:
        result = await checkAuthFailures(config);
        break;
      case AlertType.HIGH_ERROR_RATE:
        result = await checkErrorRate(config);
        break;
      case AlertType.RATE_LIMIT_ABUSE:
        result = await checkRateLimitAbuse(config);
        break;
      case AlertType.CONTENT_MODERATION_SPIKE:
        result = await checkModerationSpike(config);
        break;
    }

    if (result) {
      alerts.push(result);
      // Log to console immediately
      console.warn('[SECURITY ALERT]', {
        type: result.type,
        severity: result.severity,
        message: result.message,
        details: result.details,
      });
    }
  }

  return alerts;
}

/**
 * Send alert notification
 *
 * This is a placeholder for actual notification implementation
 * You can integrate with email, Slack, Discord, or other services
 */
export async function sendAlertNotification(alert: AlertResult): Promise<void> {
  // TODO: Implement actual notification logic
  // Examples:
  // - Email via SendGrid, AWS SES, Resend
  // - Slack via Webhook
  // - Discord via Webhook
  // - PagerDuty for critical alerts
  // - SMS via Twilio

  console.log('[ALERT NOTIFICATION]', {
    type: alert.type,
    severity: alert.severity,
    message: alert.message,
    details: alert.details,
    timestamp: alert.timestamp,
  });

  // Example Email notification (commented out)
  /*
  if (alert.severity === AlertSeverity.CRITICAL) {
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `[CRITICAL] Security Alert: ${alert.type}`,
      body: `
        Alert Type: ${alert.type}
        Severity: ${alert.severity}
        Message: ${alert.message}
        Details: ${JSON.stringify(alert.details, null, 2)}
        Timestamp: ${alert.timestamp.toISOString()}
      `,
    });
  }
  */

  // Example Slack notification (commented out)
  /*
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (webhookUrl) {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 Security Alert: ${alert.message}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Type:* ${alert.type}\n*Severity:* ${alert.severity}\n*Message:* ${alert.message}`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `\`\`\`${JSON.stringify(alert.details, null, 2)}\`\`\``,
            },
          },
        ],
      }),
    });
  }
  */
}

/**
 * Check security status and send alerts if needed
 *
 * This function should be called periodically (e.g., every 5-15 minutes)
 * via a cron job or scheduled task
 */
export async function checkSecurityStatus(): Promise<{
  alertsTriggered: number;
  alerts: AlertResult[];
}> {
  console.log('[SECURITY MONITOR] Running security checks...');

  const alerts = await runSecurityChecks();

  // Send notifications for triggered alerts
  for (const alert of alerts) {
    await sendAlertNotification(alert);
  }

  console.log(
    `[SECURITY MONITOR] Completed. ${alerts.length} alert(s) triggered.`
  );

  return {
    alertsTriggered: alerts.length,
    alerts,
  };
}

/**
 * Get alert configuration
 */
export function getAlertConfig(): AlertConfig[] {
  return ALERT_CONFIGS;
}

/**
 * Update alert configuration dynamically
 * (Optional feature for runtime configuration updates)
 */
export function updateAlertConfig(
  type: AlertType,
  updates: Partial<AlertConfig>
): boolean {
  const config = ALERT_CONFIGS.find((c) => c.type === type);
  if (config) {
    Object.assign(config, updates);
    return true;
  }
  return false;
}
