/**
 * 操作审计日志系统
 */

export enum AuditAction {
  // 监控配置
  SENTRY_CONFIG_UPDATE = 'sentry.config.update',
  CLOUD_BACKUP_CONFIG_UPDATE = 'cloud_backup.config.update',
  CRON_JOB_CREATE = 'cron.job.create',
  CRON_JOB_UPDATE = 'cron.job.update',
  CRON_JOB_DELETE = 'cron.job.delete',
  CRON_JOB_EXECUTE = 'cron.job.execute',

  // 备份操作
  BACKUP_CREATE = 'backup.create',
  BACKUP_RESTORE = 'backup.restore',
  BACKUP_DELETE = 'backup.delete',

  // 部署操作
  DEPLOYMENT_TRIGGER = 'deployment.trigger',
  DEPLOYMENT_ROLLBACK = 'deployment.rollback',
  ENV_VAR_UPDATE = 'env.var.update',

  // 用户管理
  USER_CREATE = 'user.create',
  USER_UPDATE = 'user.update',
  USER_DELETE = 'user.delete',
  USER_ROLE_CHANGE = 'user.role.change',

  // 系统配置
  SYSTEM_CONFIG_UPDATE = 'system.config.update',
  ALERT_RULE_CREATE = 'alert.rule.create',
  ALERT_RULE_UPDATE = 'alert.rule.update',
}

export enum AuditLevel {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

export interface AuditLog {
  id?: string;
  action: AuditAction;
  level: AuditLevel;
  userId: string;
  userEmail: string;
  userRole: string;
  description: string;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
}

class AuditLogger {
  /**
   * 记录审计日志
   */
  async log(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    const auditLog: AuditLog = {
      ...log,
      timestamp: new Date(),
    };

    // TODO: 实际项目中应保存到数据库
    console.log('[AUDIT]', JSON.stringify(auditLog, null, 2));

    // 对于关键操作，可以发送告警通知
    if (log.level === AuditLevel.CRITICAL) {
      await this.sendCriticalAlert(auditLog);
    }
  }

  /**
   * 发送关键操作告警
   */
  private async sendCriticalAlert(log: AuditLog): Promise<void> {
    // TODO: 实现告警通知（邮件、短信、Slack等）
    console.warn('[CRITICAL AUDIT]', log);
  }

  /**
   * 查询审计日志
   */
  async query(params: {
    userId?: string;
    action?: AuditAction;
    level?: AuditLevel;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<AuditLog[]> {
    // TODO: 实际项目中应从数据库查询
    return [];
  }

  /**
   * 导出审计日志
   */
  async export(params: {
    startDate: Date;
    endDate: Date;
    format?: 'csv' | 'json';
  }): Promise<string> {
    // TODO: 实现日志导出
    return '';
  }
}

export const auditLogger = new AuditLogger();

/**
 * 便捷的日志记录函数
 */
export async function logAudit(
  action: AuditAction,
  user: { id: string; email: string; role: string },
  description: string,
  options: {
    level?: AuditLevel;
    metadata?: Record<string, any>;
    ip?: string;
  } = {}
) {
  await auditLogger.log({
    action,
    level: options.level || AuditLevel.INFO,
    userId: user.id,
    userEmail: user.email,
    userRole: user.role,
    description,
    metadata: options.metadata,
    ip: options.ip,
  });
}
