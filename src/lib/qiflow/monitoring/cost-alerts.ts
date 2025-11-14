/**
 * 成本预警系统
 *
 * 监控成本使用情况，触发预警和降级
 */

import { type CostLimits, globalCostGuard } from './cost-guard';

/**
 * 预警级别
 */
export type AlertLevel = 'info' | 'warning' | 'critical';

/**
 * 预警阈值配置
 */
export interface AlertThresholds {
  // 信息级别（达到限制的50%）
  info: number;

  // 警告级别（达到限制的75%）
  warning: number;

  // 严重级别（达到限制的90%）
  critical: number;
}

export const DEFAULT_ALERT_THRESHOLDS: AlertThresholds = {
  info: 0.5,
  warning: 0.75,
  critical: 0.9,
};

/**
 * 预警消息
 */
export interface CostAlert {
  level: AlertLevel;
  metric: 'hourly' | 'daily' | 'report';
  message: string;
  usage: number;
  limit: number;
  percentage: number;
  timestamp: Date;
  action?: string;
}

/**
 * 预警回调函数类型
 */
export type AlertCallback = (alert: CostAlert) => void | Promise<void>;

/**
 * 成本预警系统类
 */
export class CostAlertSystem {
  private callbacks: Map<AlertLevel, AlertCallback[]> = new Map();
  private lastAlerts: Map<string, Date> = new Map();
  private alertCooldown = 5 * 60 * 1000; // 5分钟冷却时间

  constructor(private thresholds: AlertThresholds = DEFAULT_ALERT_THRESHOLDS) {
    this.callbacks.set('info', []);
    this.callbacks.set('warning', []);
    this.callbacks.set('critical', []);
  }

  /**
   * 注册预警回调
   */
  on(level: AlertLevel, callback: AlertCallback): void {
    const callbacks = this.callbacks.get(level) || [];
    callbacks.push(callback);
    this.callbacks.set(level, callbacks);
  }

  /**
   * 检查成本使用情况并触发预警
   */
  async checkUsage(): Promise<CostAlert[]> {
    const alerts: CostAlert[] = [];
    const usage = globalCostGuard.getCurrentUsage();

    // 检查每小时使用
    const hourlyAlert = this.checkMetric(
      'hourly',
      usage.hourly,
      usage.limits.hourly
    );
    if (hourlyAlert) alerts.push(hourlyAlert);

    // 检查每日使用
    const dailyAlert = this.checkMetric(
      'daily',
      usage.daily,
      usage.limits.daily
    );
    if (dailyAlert) alerts.push(dailyAlert);

    // 触发回调
    for (const alert of alerts) {
      await this.triggerAlert(alert);
    }

    return alerts;
  }

  /**
   * 检查单个指标
   */
  private checkMetric(
    metric: 'hourly' | 'daily' | 'report',
    usage: number,
    limit: number
  ): CostAlert | null {
    const percentage = usage / limit;

    // 确定预警级别
    let level: AlertLevel | null = null;
    if (percentage >= this.thresholds.critical) {
      level = 'critical';
    } else if (percentage >= this.thresholds.warning) {
      level = 'warning';
    } else if (percentage >= this.thresholds.info) {
      level = 'info';
    }

    if (!level) return null;

    // 检查冷却时间
    const alertKey = `${metric}-${level}`;
    const lastAlert = this.lastAlerts.get(alertKey);
    if (lastAlert && Date.now() - lastAlert.getTime() < this.alertCooldown) {
      return null; // 还在冷却期
    }

    // 生成预警消息
    const alert: CostAlert = {
      level,
      metric,
      message: this.generateMessage(level, metric, usage, limit, percentage),
      usage: Number(usage.toFixed(4)),
      limit,
      percentage: Number((percentage * 100).toFixed(2)),
      timestamp: new Date(),
      action: this.suggestAction(level, percentage),
    };

    // 记录预警时间
    this.lastAlerts.set(alertKey, new Date());

    return alert;
  }

  /**
   * 生成预警消息
   */
  private generateMessage(
    level: AlertLevel,
    metric: string,
    usage: number,
    limit: number,
    percentage: number
  ): string {
    const percentStr = (percentage * 100).toFixed(1);

    const metricNames = {
      hourly: '每小时',
      daily: '每日',
      report: '单报告',
    };

    return `【${level.toUpperCase()}】${metricNames[metric as keyof typeof metricNames]}成本已达 ${percentStr}% ($${usage.toFixed(2)} / $${limit.toFixed(2)})`;
  }

  /**
   * 建议操作
   */
  private suggestAction(level: AlertLevel, percentage: number): string {
    if (level === 'critical') {
      if (percentage >= 0.95) {
        return '立即启用模板降级，停止所有非必要AI调用';
      }
      return '启用缓存优先模式，减少AI调用';
    }

    if (level === 'warning') {
      return '建议启用缓存，监控后续使用情况';
    }

    return '继续监控';
  }

  /**
   * 触发预警回调
   */
  private async triggerAlert(alert: CostAlert): Promise<void> {
    const callbacks = this.callbacks.get(alert.level) || [];

    // 执行所有回调
    await Promise.all(
      callbacks.map((callback) => {
        try {
          return callback(alert);
        } catch (error) {
          console.error('[CostAlert] 回调执行失败:', error);
          return Promise.resolve();
        }
      })
    );

    // 默认日志输出
    this.logAlert(alert);
  }

  /**
   * 记录预警日志
   */
  private logAlert(alert: CostAlert): void {
    const emoji = {
      info: 'ℹ️',
      warning: '⚠️',
      critical: '🚨',
    }[alert.level];

    console.log(`${emoji} ${alert.message}`);
    if (alert.action) {
      console.log(`   建议：${alert.action}`);
    }
  }

  /**
   * 重置冷却时间
   */
  resetCooldown(): void {
    this.lastAlerts.clear();
  }
}

/**
 * 全局预警系统实例
 */
export const globalAlertSystem = new CostAlertSystem();

/**
 * 默认预警处理器
 */
globalAlertSystem.on('critical', async (alert) => {
  console.error('🚨 [CostAlert] 成本严重超限:', alert.message);
  // TODO: 发送通知（邮件/短信/webhook）
  // TODO: 触发自动降级
});

globalAlertSystem.on('warning', async (alert) => {
  console.warn('⚠️ [CostAlert] 成本预警:', alert.message);
  // TODO: 发送通知
});

/**
 * 启动定期检查（每5分钟）
 */
export function startCostMonitoring(
  intervalMs: number = 5 * 60 * 1000
): NodeJS.Timer {
  return setInterval(async () => {
    await globalAlertSystem.checkUsage();
  }, intervalMs);
}
