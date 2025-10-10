'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  XCircle,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  score: number;
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
  fcp: number;
  inp: number;
  cacheHitRate: number;
  apiResponseTime: number;
  errorRate: number;
}

interface MetricStatus {
  label: string;
  value: number | string;
  unit?: string;
  status: 'good' | 'warning' | 'error';
  target: string;
}

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    score: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
    ttfb: 0,
    fcp: 0,
    inp: 0,
    cacheHitRate: 0,
    apiResponseTime: 0,
    errorRate: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟获取性能数据
    const fetchMetrics = async () => {
      setLoading(true);
      // 实际应用中，这里应该从监控服务获取真实数据
      setTimeout(() => {
        setMetrics({
          score: 92,
          lcp: 2100, // ms
          fid: 45, // ms
          cls: 0.05,
          ttfb: 600, // ms
          fcp: 1200, // ms
          inp: 150, // ms
          cacheHitRate: 85, // %
          apiResponseTime: 320, // ms
          errorRate: 0.5, // %
        });
        setLoading(false);
      }, 1000);
    };

    fetchMetrics();
    // 每30秒刷新一次
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return '优秀';
    if (score >= 50) return '需要改进';
    return '差';
  };

  const getMetricStatus = (
    metric: string,
    value: number
  ): 'good' | 'warning' | 'error' => {
    const thresholds: Record<string, { good: number; warning: number }> = {
      lcp: { good: 2500, warning: 4000 },
      fid: { good: 100, warning: 300 },
      cls: { good: 0.1, warning: 0.25 },
      ttfb: { good: 800, warning: 1800 },
      fcp: { good: 1800, warning: 3000 },
      inp: { good: 200, warning: 500 },
      cacheHitRate: { good: 80, warning: 60 },
      apiResponseTime: { good: 500, warning: 1000 },
      errorRate: { good: 1, warning: 5 },
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'good';

    // 对于缓存命中率，数值越高越好
    if (metric === 'cacheHitRate') {
      if (value >= threshold.good) return 'good';
      if (value >= threshold.warning) return 'warning';
      return 'error';
    }

    // 对于其他指标，数值越低越好
    if (value <= threshold.good) return 'good';
    if (value <= threshold.warning) return 'warning';
    return 'error';
  };

  const performanceItems: MetricStatus[] = [
    {
      label: 'LCP (最大内容绘制)',
      value: metrics.lcp,
      unit: 'ms',
      status: getMetricStatus('lcp', metrics.lcp),
      target: '< 2.5s',
    },
    {
      label: 'INP (交互到下一次绘制)',
      value: metrics.inp,
      unit: 'ms',
      status: getMetricStatus('inp', metrics.inp),
      target: '< 200ms',
    },
    {
      label: 'CLS (累积布局偏移)',
      value: metrics.cls.toFixed(3),
      unit: '',
      status: getMetricStatus('cls', metrics.cls),
      target: '< 0.1',
    },
    {
      label: 'TTFB (首字节时间)',
      value: metrics.ttfb,
      unit: 'ms',
      status: getMetricStatus('ttfb', metrics.ttfb),
      target: '< 800ms',
    },
  ];

  const systemMetrics: MetricStatus[] = [
    {
      label: '缓存命中率',
      value: `${metrics.cacheHitRate}%`,
      unit: '',
      status: getMetricStatus('cacheHitRate', metrics.cacheHitRate),
      target: '> 80%',
    },
    {
      label: 'API响应时间',
      value: metrics.apiResponseTime,
      unit: 'ms',
      status: getMetricStatus('apiResponseTime', metrics.apiResponseTime),
      target: '< 500ms',
    },
    {
      label: '错误率',
      value: `${metrics.errorRate}%`,
      unit: '',
      status: getMetricStatus('errorRate', metrics.errorRate),
      target: '< 1%',
    },
  ];

  const StatusIcon = ({ status }: { status: 'good' | 'warning' | 'error' }) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">加载性能数据...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 总体性能评分 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            性能总分
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div
                className={`text-4xl font-bold ${getScoreColor(metrics.score)}`}
              >
                {metrics.score}
              </div>
              <Badge
                variant={
                  metrics.score >= 90
                    ? 'default'
                    : metrics.score >= 50
                      ? 'secondary'
                      : 'destructive'
                }
              >
                {getScoreLabel(metrics.score)}
              </Badge>
            </div>
            <Zap className={`w-8 h-8 ${getScoreColor(metrics.score)}`} />
          </div>
          <Progress value={metrics.score} className="h-2" />
        </CardContent>
      </Card>

      {/* Core Web Vitals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Core Web Vitals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {performanceItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded"
              >
                <div className="flex-1">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {item.label}
                  </div>
                  <div className="text-lg font-semibold">
                    {item.value}
                    {item.unit}
                  </div>
                  <div className="text-xs text-gray-500">
                    目标: {item.target}
                  </div>
                </div>
                <StatusIcon status={item.status} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 系统指标 */}
      <Card>
        <CardHeader>
          <CardTitle>系统性能指标</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {systemMetrics.map((item) => (
              <div key={item.label} className="text-center p-4 border rounded">
                <StatusIcon status={item.status} />
                <div className="mt-2 text-2xl font-bold">{item.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {item.label}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  目标: {item.target}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 优化建议 */}
      <Card>
        <CardHeader>
          <CardTitle>优化建议</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {metrics.lcp > 2500 && (
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                <span className="text-sm">
                  优化最大内容绘制时间：考虑使用图片懒加载和CDN加速
                </span>
              </li>
            )}
            {metrics.cacheHitRate < 80 && (
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                <span className="text-sm">
                  提高缓存命中率：检查缓存策略配置
                </span>
              </li>
            )}
            {metrics.inp > 200 && (
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                <span className="text-sm">
                  改善交互响应：减少主线程阻塞，使用Web Worker处理复杂计算
                </span>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
