/**
 * 成本守卫
 *
 * 防止AI调用成本超支，实施三级降级策略
 */

import type { ModelName } from './token-counter';

/**
 * 成本阈值配置
 */
export interface CostLimits {
  // 单次调用最大成本（USD）
  perRequest: number;

  // 单个报告最大成本（USD）
  perReport: number;

  // 每小时最大成本（USD）
  hourly: number;

  // 每天最大成本（USD）
  daily: number;
}

/**
 * 默认成本限制
 */
export const DEFAULT_COST_LIMITS: CostLimits = {
  perRequest: 0.5, // 单次调用不超过$0.50
  perReport: 1.0, // 单个报告不超过$1.00
  hourly: 10.0, // 每小时不超过$10.00
  daily: 100.0, // 每天不超过$100.00
};

/**
 * 降级策略
 */
export type FallbackStrategy =
  | 'use_cache' // 使用缓存
  | 'reduce_quality' // 降低质量（减少prompt长度）
  | 'use_template' // 使用模板
  | 'reject'; // 拒绝服务

/**
 * 成本守卫类
 */
export class CostGuard {
  private hourlyUsage: Map<string, number> = new Map(); // key: hour timestamp
  private dailyUsage: Map<string, number> = new Map(); // key: date
  private reportCosts: Map<string, number> = new Map(); // key: reportId

  constructor(private limits: CostLimits = DEFAULT_COST_LIMITS) {}

  /**
   * 检查是否可以执行请求
   */
  canExecute(
    estimatedCost: number,
    reportId?: string
  ): {
    allowed: boolean;
    reason?: string;
    suggestedStrategy?: FallbackStrategy;
  } {
    // 1. 检查单次请求成本
    if (estimatedCost > this.limits.perRequest) {
      return {
        allowed: false,
        reason: `单次请求成本 $${estimatedCost.toFixed(4)} 超过限制 $${this.limits.perRequest}`,
        suggestedStrategy: 'reduce_quality',
      };
    }

    // 2. 检查报告成本（如果提供了reportId）
    if (reportId) {
      const reportCost = this.reportCosts.get(reportId) || 0;
      if (reportCost + estimatedCost > this.limits.perReport) {
        return {
          allowed: false,
          reason: `报告 ${reportId} 累计成本将超过限制 $${this.limits.perReport}`,
          suggestedStrategy: 'use_template',
        };
      }
    }

    // 3. 检查每小时成本
    const currentHour = this.getCurrentHourKey();
    const hourlyUsed = this.hourlyUsage.get(currentHour) || 0;
    if (hourlyUsed + estimatedCost > this.limits.hourly) {
      return {
        allowed: false,
        reason: `每小时成本 $${hourlyUsed.toFixed(2)} 已接近限制 $${this.limits.hourly}`,
        suggestedStrategy: 'use_cache',
      };
    }

    // 4. 检查每天成本
    const currentDate = this.getCurrentDateKey();
    const dailyUsed = this.dailyUsage.get(currentDate) || 0;
    if (dailyUsed + estimatedCost > this.limits.daily) {
      return {
        allowed: false,
        reason: `每日成本 $${dailyUsed.toFixed(2)} 已接近限制 $${this.limits.daily}`,
        suggestedStrategy: 'reject',
      };
    }

    return { allowed: true };
  }

  /**
   * 记录实际消耗
   */
  recordUsage(actualCost: number, reportId?: string): void {
    const currentHour = this.getCurrentHourKey();
    const currentDate = this.getCurrentDateKey();

    // 更新小时统计
    this.hourlyUsage.set(
      currentHour,
      (this.hourlyUsage.get(currentHour) || 0) + actualCost
    );

    // 更新每日统计
    this.dailyUsage.set(
      currentDate,
      (this.dailyUsage.get(currentDate) || 0) + actualCost
    );

    // 更新报告统计
    if (reportId) {
      this.reportCosts.set(
        reportId,
        (this.reportCosts.get(reportId) || 0) + actualCost
      );
    }

    // 清理旧数据（保留最近48小时）
    this.cleanup();
  }

  /**
   * 获取当前使用情况
   */
  getCurrentUsage(): {
    hourly: number;
    daily: number;
    limits: CostLimits;
    remainingHourly: number;
    remainingDaily: number;
  } {
    const currentHour = this.getCurrentHourKey();
    const currentDate = this.getCurrentDateKey();

    const hourly = this.hourlyUsage.get(currentHour) || 0;
    const daily = this.dailyUsage.get(currentDate) || 0;

    return {
      hourly: Number(hourly.toFixed(4)),
      daily: Number(daily.toFixed(4)),
      limits: this.limits,
      remainingHourly: Number((this.limits.hourly - hourly).toFixed(4)),
      remainingDaily: Number((this.limits.daily - daily).toFixed(4)),
    };
  }

  /**
   * 获取报告成本
   */
  getReportCost(reportId: string): number {
    return this.reportCosts.get(reportId) || 0;
  }

  /**
   * 重置所有统计
   */
  reset(): void {
    this.hourlyUsage.clear();
    this.dailyUsage.clear();
    this.reportCosts.clear();
  }

  /**
   * 获取当前小时的key
   */
  private getCurrentHourKey(): string {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`;
  }

  /**
   * 获取当前日期的key
   */
  private getCurrentDateKey(): string {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  }

  /**
   * 清理旧数据
   */
  private cleanup(): void {
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - 48 * 60 * 60 * 1000); // 48小时前

    // 清理hourlyUsage
    for (const [key] of this.hourlyUsage) {
      const [year, month, date, hour] = key.split('-').map(Number);
      const keyDate = new Date(year, month, date, hour);
      if (keyDate < cutoffTime) {
        this.hourlyUsage.delete(key);
      }
    }
  }
}

/**
 * 全局成本守卫实例
 */
export const globalCostGuard = new CostGuard();

/**
 * 成本守卫装饰器（用于包装AI调用）
 */
export function withCostGuard<T>(estimatedCost: number, reportId?: string) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // 检查是否允许执行
      const check = globalCostGuard.canExecute(estimatedCost, reportId);

      if (!check.allowed) {
        console.warn(`[CostGuard] 请求被拒绝: ${check.reason}`);
        throw new Error(`Cost limit exceeded: ${check.reason}`);
      }

      // 执行原方法
      const result = await originalMethod.apply(this, args);

      // 记录实际消耗（这里使用估计值，实际应记录真实值）
      globalCostGuard.recordUsage(estimatedCost, reportId);

      return result;
    };

    return descriptor;
  };
}
