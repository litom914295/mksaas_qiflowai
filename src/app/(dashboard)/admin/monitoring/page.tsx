'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useCostAlerts,
  useCostMonitoring,
} from '@/lib/qiflow/hooks/useCostMonitoring';

/**
 * 管理监控面板
 *
 * 功能：
 * 1. 实时成本监控（4层防护状态）
 * 2. 成本预警提示（3级告警）
 * 3. 转化漏斗数据展示
 * 4. 系统健康状态
 */
export default function MonitoringPage() {
  const { usage, alerts } = useCostAlerts();

  // 计算使用百分比
  const dailyPercent = (usage.daily.used / usage.daily.limit) * 100;
  const hourlyPercent = (usage.hourly.used / usage.hourly.limit) * 100;
  const perRequestPercent =
    (usage.perRequest.used / usage.perRequest.limit) * 100;
  const perReportPercent = (usage.perReport.used / usage.perReport.limit) * 100;

  // 获取颜色
  function getColor(percent: number) {
    if (percent >= 90) return 'text-red-600';
    if (percent >= 75) return 'text-yellow-600';
    if (percent >= 50) return 'text-blue-600';
    return 'text-green-600';
  }

  function getBgColor(percent: number) {
    if (percent >= 90) return 'bg-red-100';
    if (percent >= 75) return 'bg-yellow-100';
    if (percent >= 50) return 'bg-blue-100';
    return 'bg-green-100';
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">系统监控面板</h1>

      {/* 告警信息 */}
      {alerts.length > 0 && (
        <div className="mb-6 space-y-2">
          {alerts.map((alert, index) => (
            <Alert
              key={index}
              variant={alert.level === 'critical' ? 'destructive' : 'default'}
            >
              <AlertDescription>
                <span className="font-semibold">
                  {alert.level === 'critical' ? '🚨 严重' : '⚠️ 警告'}:
                </span>{' '}
                {alert.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* 4层成本防护系统状态 */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Layer 1: 单次请求 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Layer 1: 单次请求检查</span>
              <span className={getColor(perRequestPercent)}>
                {perRequestPercent.toFixed(0)}%
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>已用</span>
                <span className="font-mono">
                  ${usage.perRequest.used.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all ${getBgColor(perRequestPercent)}`}
                  style={{ width: `${Math.min(perRequestPercent, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>限制</span>
                <span>${usage.perRequest.limit.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Layer 2: 单报告累计 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Layer 2: 单报告累计</span>
              <span className={getColor(perReportPercent)}>
                {perReportPercent.toFixed(0)}%
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>已用</span>
                <span className="font-mono">
                  ${usage.perReport.used.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all ${getBgColor(perReportPercent)}`}
                  style={{ width: `${Math.min(perReportPercent, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>限制</span>
                <span>${usage.perReport.limit.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Layer 3: 每小时限制 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Layer 3: 每小时限制</span>
              <span className={getColor(hourlyPercent)}>
                {hourlyPercent.toFixed(0)}%
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>已用</span>
                <span className="font-mono">
                  ${usage.hourly.used.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all ${getBgColor(hourlyPercent)}`}
                  style={{ width: `${Math.min(hourlyPercent, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>限制</span>
                <span>${usage.hourly.limit.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Layer 4: 每日总限制 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Layer 4: 每日总限制</span>
              <span className={getColor(dailyPercent)}>
                {dailyPercent.toFixed(0)}%
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>已用</span>
                <span className="font-mono">
                  ${usage.daily.used.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all ${getBgColor(dailyPercent)}`}
                  style={{ width: `${Math.min(dailyPercent, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>限制</span>
                <span>${usage.daily.limit.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 系统状态汇总 */}
      <Card>
        <CardHeader>
          <CardTitle>系统状态</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {dailyPercent < 90 ? '✅' : '🚨'}
              </div>
              <div className="text-sm text-muted-foreground mt-1">系统状态</div>
              <div className="font-semibold">
                {dailyPercent < 90 ? '正常运行' : '成本预警'}
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                ${usage.daily.used.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">今日成本</div>
              <div className="font-semibold">
                剩余 ${(usage.daily.limit - usage.daily.used).toFixed(2)}
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                ~{Math.floor((usage.daily.limit - usage.daily.used) / 0.35)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                可生成报告数
              </div>
              <div className="font-semibold">(按$0.35/份计算)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 说明 */}
      <div className="mt-6 text-sm text-muted-foreground">
        <p>📊 数据每10秒自动更新</p>
        <p>🔄 成本数据在每个自然小时/天重置</p>
        <p>
          ⚡ 详细文档参见：<code>@LAUNCH_PERFORMANCE_MONITORING.md</code>
        </p>
      </div>
    </div>
  );
}
