'use client';

import { useEffect, useState } from 'react';
import { globalCostGuard } from '@/lib/qiflow/monitoring/cost-guard';

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
export function useCostMonitoring(updateInterval = 10000) {
  const [usage, setUsage] = useState(() => globalCostGuard.getCurrentUsage());

  useEffect(() => {
    // 初始化时立即获取一次
    setUsage(globalCostGuard.getCurrentUsage());

    // 定时更新
    const timer = setInterval(() => {
      setUsage(globalCostGuard.getCurrentUsage());
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
export function useCostAlerts() {
  const usage = useCostMonitoring();
  const [alerts, setAlerts] = useState<Array<{
    level: 'info' | 'warning' | 'critical';
    message: string;
    timestamp: Date;
  }>>([]);

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
