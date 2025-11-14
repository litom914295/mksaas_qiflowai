'use client';

import { globalCostGuard } from '@/lib/qiflow/monitoring/cost-guard';
import { useEffect, useState } from 'react';

// 类型定义
export interface UsageMetrics {
  daily: { used: number; limit: number };
  hourly: { used: number; limit: number };
  perRequest: { used: number; limit: number };
  perReport: { used: number; limit: number };
}

export interface CostAlert {
  level: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
}

/**
 * 成本监控 React Hook
 *
 * 用于在前端组件中实时监控成本使用情况
 *
 * @example
 * ```tsx
 * function AdminPanel() {
 *   const usage = useCostMonitoring();
 *
 *   return (
 *     <div>
 *       <p>今日成本: ${usage.daily.used.toFixed(2)} / ${usage.daily.limit}</p>
 *       <p>每小时: ${usage.hourly.used.toFixed(2)} / ${usage.hourly.limit}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useCostMonitoring(updateInterval = 10000): UsageMetrics {
  const [usage, setUsage] = useState(() => {
    const rawUsage = globalCostGuard.getCurrentUsage();
    return {
      daily: { used: rawUsage.daily, limit: rawUsage.limits.daily },
      hourly: { used: rawUsage.hourly, limit: rawUsage.limits.hourly },
      perRequest: { used: 0, limit: rawUsage.limits.perRequest || 0.5 },
      perReport: { used: 0, limit: rawUsage.limits.perReport || 5 },
    };
  });

  useEffect(() => {
    // 初始化时立即获取一次
    const rawUsage = globalCostGuard.getCurrentUsage();
    setUsage({
      daily: { used: rawUsage.daily, limit: rawUsage.limits.daily },
      hourly: { used: rawUsage.hourly, limit: rawUsage.limits.hourly },
      perRequest: { used: 0, limit: rawUsage.limits.perRequest || 0.5 },
      perReport: { used: 0, limit: rawUsage.limits.perReport || 5 },
    });

    // 定时更新
    const timer = setInterval(() => {
      const rawUsage = globalCostGuard.getCurrentUsage();
      setUsage({
        daily: { used: rawUsage.daily, limit: rawUsage.limits.daily },
        hourly: { used: rawUsage.hourly, limit: rawUsage.limits.hourly },
        perRequest: { used: 0, limit: rawUsage.limits.perRequest || 0.5 },
        perReport: { used: 0, limit: rawUsage.limits.perReport || 5 },
      });
    }, updateInterval);

    return () => clearInterval(timer);
  }, [updateInterval]);

  return usage;
}

/**
 * 成本警告 Hook
 *
 * 监控成本使用并在超过阈值时返回警告信息
 */
export function useCostAlerts(): { usage: UsageMetrics; alerts: CostAlert[] } {
  const usage = useCostMonitoring();
  const [alerts, setAlerts] = useState<CostAlert[]>([]);

  useEffect(() => {
    const newAlerts: typeof alerts = [];

    // 检查每日成本
    const dailyPercent = (usage.daily.used / usage.daily.limit) * 100;
    if (dailyPercent >= 90) {
      newAlerts.push({
        level: 'critical',
        message: `每日成本已达${dailyPercent.toFixed(0)}%，即将触发限制`,
        timestamp: new Date(),
      });
    } else if (dailyPercent >= 75) {
      newAlerts.push({
        level: 'warning',
        message: `每日成本已达${dailyPercent.toFixed(0)}%`,
        timestamp: new Date(),
      });
    }

    // 检查每小时成本
    const hourlyPercent = (usage.hourly.used / usage.hourly.limit) * 100;
    if (hourlyPercent >= 90) {
      newAlerts.push({
        level: 'critical',
        message: `每小时成本已达${hourlyPercent.toFixed(0)}%`,
        timestamp: new Date(),
      });
    }

    setAlerts(newAlerts);
  }, [usage]);

  return { usage, alerts };
}
