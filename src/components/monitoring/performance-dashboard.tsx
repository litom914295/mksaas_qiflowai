'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { performanceMonitor } from '@/lib/qiflow/xuankong/performance-monitor';
import { useEffect, useState } from 'react';
import { Activity, Clock, Gauge, TrendingUp } from 'lucide-react';

interface PerformanceMetrics {
  [key: string]: {
    totalOperations: number;
    averageDuration: number;
    minDuration: number;
    maxDuration: number;
    p50: number;
    p95: number;
    p99: number;
  };
}

/**
 * 性能监控Dashboard
 * 实时展示系统性能指标
 */
export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // 初始加载
    updateMetrics();

    // 定期更新（每10秒）
    const interval = setInterval(() => {
      updateMetrics();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const updateMetrics = () => {
    const report = performanceMonitor.getFullReport();
    setMetrics(report);
    setLastUpdate(new Date());
  };

  const getMetricStatus = (avgDuration: number): 'good' | 'warning' | 'critical' => {
    if (avgDuration < 100) return 'good';
    if (avgDuration < 500) return 'warning';
    return 'critical';
  };

  const getStatusColor = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
    }
  };

  const getStatusBadge = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good':
        return <Badge variant="default" className="bg-green-500">良好</Badge>;
      case 'warning':
        return <Badge variant="default" className="bg-yellow-500">警告</Badge>;
      case 'critical':
        return <Badge variant="destructive">严重</Badge>;
    }
  };

  const topOperations = Object.entries(metrics)
    .sort((a, b) => b[1].totalOperations - a[1].totalOperations)
    .slice(0, 5);

  const slowestOperations = Object.entries(metrics)
    .sort((a, b) => b[1].p95 - a[1].p95)
    .slice(0, 5);

  return (
    <div className="space-y-6 p-4">
      {/* 标题和最后更新时间 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">性能监控</h2>
          <p className="text-sm text-muted-foreground">
            最后更新: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Activity className="h-3 w-3" />
          实时监控中
        </Badge>
      </div>

      {/* 关键指标卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总操作数</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(metrics).reduce(
                (sum, m) => sum + m.totalOperations,
                0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              跨 {Object.keys(metrics).length} 个操作类型
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均响应时间</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(metrics).length > 0
                ? Math.round(
                    Object.values(metrics).reduce(
                      (sum, m) => sum + m.averageDuration,
                      0
                    ) / Object.values(metrics).length
                  )
                : 0}
              ms
            </div>
            <p className="text-xs text-muted-foreground">所有操作平均</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">P95 延迟</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(metrics).length > 0
                ? Math.round(
                    Math.max(...Object.values(metrics).map((m) => m.p95))
                  )
                : 0}
              ms
            </div>
            <p className="text-xs text-muted-foreground">95%的请求快于此值</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">健康状态</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {Object.values(metrics).length > 0 ? (
              <>
                {getStatusBadge(
                  getMetricStatus(
                    Object.values(metrics).reduce(
                      (sum, m) => sum + m.averageDuration,
                      0
                    ) / Object.values(metrics).length
                  )
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  基于平均响应时间
                </p>
              </>
            ) : (
              <Badge variant="outline">无数据</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 热门操作 */}
      <Card>
        <CardHeader>
          <CardTitle>热门操作</CardTitle>
          <CardDescription>调用次数最多的操作</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {topOperations.map(([name, metric]) => {
            const status = getMetricStatus(metric.averageDuration);
            return (
              <div key={name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{name}</span>
                    {getStatusBadge(status)}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {metric.totalOperations} 次调用
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>平均: {metric.averageDuration.toFixed(2)}ms</span>
                  <span>P50: {metric.p50.toFixed(2)}ms</span>
                  <span>P95: {metric.p95.toFixed(2)}ms</span>
                  <span>P99: {metric.p99.toFixed(2)}ms</span>
                </div>
                <Progress
                  value={(metric.averageDuration / 1000) * 100}
                  className={`h-2 ${getStatusColor(status)}`}
                />
              </div>
            );
          })}
          {topOperations.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              暂无性能数据
            </p>
          )}
        </CardContent>
      </Card>

      {/* 最慢操作 */}
      <Card>
        <CardHeader>
          <CardTitle>需要优化的操作</CardTitle>
          <CardDescription>P95延迟最高的操作</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {slowestOperations.map(([name, metric]) => {
            const status = getMetricStatus(metric.p95);
            return (
              <div key={name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{name}</span>
                    {getStatusBadge(status)}
                  </div>
                  <span className={`text-sm font-bold ${getStatusColor(status)}`}>
                    P95: {metric.p95.toFixed(2)}ms
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>最小: {metric.minDuration.toFixed(2)}ms</span>
                  <span>平均: {metric.averageDuration.toFixed(2)}ms</span>
                  <span>最大: {metric.maxDuration.toFixed(2)}ms</span>
                </div>
                <Progress
                  value={(metric.p95 / 2000) * 100}
                  className={`h-2 ${getStatusColor(status)}`}
                />
              </div>
            );
          })}
          {slowestOperations.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              暂无性能数据
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}