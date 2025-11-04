'use client';

import { PerformanceDashboard } from '@/components/qiflow/performance/PerformanceDashboard';
import { WebVitals } from '@/components/qiflow/performance/WebVitals';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Activity, RefreshCw, TrendingUp, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function PerformancePage() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [metrics, setMetrics] = useState({
    lcp: null as number | null,
    fcp: null as number | null,
    cls: null as number | null,
    ttfb: null as number | null,
    inp: null as number | null,
  });

  useEffect(() => {
    if (isMonitoring) {
      // 模拟收集性能数据
      const collectMetrics = () => {
        const navigation = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming;
        if (navigation) {
          setMetrics({
            lcp: 2100, // 模拟数据
            fcp: 1200,
            cls: 0.05,
            ttfb: navigation.responseStart - navigation.requestStart,
            inp: 150,
          });
        }
      };

      collectMetrics();
      const interval = setInterval(collectMetrics, 5000);
      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="w-8 h-8" />
            性能监控中心
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            实时监控Web Vitals指标，优化用户体验
          </p>
        </div>
        <Button
          onClick={() => setIsMonitoring(!isMonitoring)}
          variant={isMonitoring ? 'destructive' : 'default'}
        >
          {isMonitoring ? (
            <>停止监控</>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              开始监控
            </>
          )}
        </Button>
      </div>

      {/* 快速指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              LCP (最大内容绘制)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.lcp ? `${metrics.lcp}ms` : '--'}
            </div>
            <p className="text-xs text-muted-foreground">目标: &lt; 2500ms</p>
            {metrics.lcp && (
              <div
                className={`text-xs mt-1 ${metrics.lcp < 2500 ? 'text-green-500' : 'text-red-500'}`}
              >
                {metrics.lcp < 2500 ? '✓ 良好' : '✗ 需要优化'}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              FCP (首次内容绘制)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.fcp ? `${metrics.fcp}ms` : '--'}
            </div>
            <p className="text-xs text-muted-foreground">目标: &lt; 1800ms</p>
            {metrics.fcp && (
              <div
                className={`text-xs mt-1 ${metrics.fcp < 1800 ? 'text-green-500' : 'text-red-500'}`}
              >
                {metrics.fcp < 1800 ? '✓ 良好' : '✗ 需要优化'}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              CLS (累积布局偏移)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.cls !== null ? metrics.cls.toFixed(3) : '--'}
            </div>
            <p className="text-xs text-muted-foreground">目标: &lt; 0.1</p>
            {metrics.cls !== null && (
              <div
                className={`text-xs mt-1 ${metrics.cls < 0.1 ? 'text-green-500' : 'text-red-500'}`}
              >
                {metrics.cls < 0.1 ? '✓ 良好' : '✗ 需要优化'}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              INP (交互响应)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.inp ? `${metrics.inp}ms` : '--'}
            </div>
            <p className="text-xs text-muted-foreground">目标: &lt; 200ms</p>
            {metrics.inp && (
              <div
                className={`text-xs mt-1 ${metrics.inp < 200 ? 'text-green-500' : 'text-red-500'}`}
              >
                {metrics.inp < 200 ? '✓ 良好' : '✗ 需要优化'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 性能仪表板 */}
      {isMonitoring && <PerformanceDashboard />}

      {/* 优化建议 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            性能优化建议
          </CardTitle>
          <CardDescription>基于当前性能数据的优化建议</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-semibold">优化图片加载</h4>
                <p className="text-sm text-muted-foreground">
                  使用 next/image 组件，启用懒加载，使用 WebP 格式
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-semibold">代码分割</h4>
                <p className="text-sm text-muted-foreground">
                  使用动态导入减少初始包大小，按路由进行代码分割
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-semibold">缓存策略</h4>
                <p className="text-sm text-muted-foreground">
                  实施三级缓存策略，使用 CDN 加速静态资源
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-semibold">减少主线程工作</h4>
                <p className="text-sm text-muted-foreground">
                  使用 Web Worker 处理复杂计算，避免阻塞主线程
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 实时监控状态 */}
      {isMonitoring && (
        <div className="fixed bottom-4 left-4 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-sm font-medium">监控中...</span>
        </div>
      )}
    </div>
  );
}
