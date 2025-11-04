'use client';

import { useEffect, useState } from 'react';
import { type Metric, onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

interface WebVitalsData {
  CLS: number | null; // Cumulative Layout Shift
  FCP: number | null; // First Contentful Paint
  INP: number | null; // Interaction to Next Paint
  LCP: number | null; // Largest Contentful Paint
  TTFB: number | null; // Time to First Byte
}

interface VitalThresholds {
  good: number;
  needsImprovement: number;
}

const THRESHOLDS: Record<keyof WebVitalsData, VitalThresholds> = {
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FCP: { good: 1800, needsImprovement: 3000 },
  INP: { good: 200, needsImprovement: 500 },
  LCP: { good: 2500, needsImprovement: 4000 },
  TTFB: { good: 800, needsImprovement: 1800 },
};

// 发送数据到分析服务
const sendToAnalytics = (metric: Metric) => {
  // 这里可以集成 Google Analytics 或其他分析服务
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'web_vitals', {
      event_category: 'Web Vitals',
      event_label: metric.name,
      value: Math.round(metric.value),
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta,
    });
  }

  // 也可以发送到自定义端点
  if (process.env.NEXT_PUBLIC_ANALYTICS_URL) {
    fetch(`${process.env.NEXT_PUBLIC_ANALYTICS_URL}/vitals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric: metric.name,
        value: metric.value,
        delta: metric.delta,
        id: metric.id,
        url: window.location.href,
        timestamp: Date.now(),
      }),
    }).catch(() => {
      // 静默失败，不影响用户体验
    });
  }
};

export function WebVitals() {
  const [vitals, setVitals] = useState<WebVitalsData>({
    CLS: null,
    FCP: null,
    INP: null,
    LCP: null,
    TTFB: null,
  });

  const [showVitals, setShowVitals] = useState(false);

  useEffect(() => {
    // 只在开发环境显示
    setShowVitals(process.env.NODE_ENV === 'development');

    // 收集 Web Vitals 数据
    onCLS((metric) => {
      setVitals((prev) => ({ ...prev, CLS: metric.value }));
      sendToAnalytics(metric);
    });

    onFCP((metric) => {
      setVitals((prev) => ({ ...prev, FCP: metric.value }));
      sendToAnalytics(metric);
    });

    onINP((metric) => {
      setVitals((prev) => ({ ...prev, INP: metric.value }));
      sendToAnalytics(metric);
    });

    onLCP((metric) => {
      setVitals((prev) => ({ ...prev, LCP: metric.value }));
      sendToAnalytics(metric);
    });

    onTTFB((metric) => {
      setVitals((prev) => ({ ...prev, TTFB: metric.value }));
      sendToAnalytics(metric);
    });
  }, []);

  if (!showVitals) return null;

  const getScoreColor = (metric: keyof WebVitalsData, value: number) => {
    const threshold = THRESHOLDS[metric];
    if (value <= threshold.good) return 'text-green-500';
    if (value <= threshold.needsImprovement) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (metric: keyof WebVitalsData, value: number) => {
    const threshold = THRESHOLDS[metric];
    if (value <= threshold.good) return '良好';
    if (value <= threshold.needsImprovement) return '需要改进';
    return '差';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white p-4 rounded-lg shadow-lg backdrop-blur-sm max-w-sm">
      <div className="text-xs font-semibold mb-2">Web Vitals 监控</div>
      <div className="space-y-1 text-xs">
        {Object.entries(vitals).map(([key, value]) => {
          const metric = key as keyof WebVitalsData;
          return (
            <div key={key} className="flex justify-between items-center">
              <span className="font-mono">{key}:</span>
              {value !== null ? (
                <span className={`font-bold ${getScoreColor(metric, value)}`}>
                  {metric === 'CLS'
                    ? value.toFixed(3)
                    : `${Math.round(value)}ms`}
                  <span className="ml-1 text-xs opacity-75">
                    ({getScoreLabel(metric, value)})
                  </span>
                </span>
              ) : (
                <span className="text-gray-400">测量中...</span>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 pt-2 border-t border-gray-700 text-xs text-gray-400">
        <div>LCP &lt; 2.5s | INP &lt; 200ms | CLS &lt; 0.1</div>
      </div>
    </div>
  );
}

// 性能监控钩子
export function usePerformanceObserver() {
  const [performanceData, setPerformanceData] = useState<{
    navigation: PerformanceNavigationTiming | null;
    resources: PerformanceResourceTiming[];
  }>({
    navigation: null,
    resources: [],
  });

  useEffect(() => {
    // 获取导航性能数据
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          setPerformanceData((prev) => ({
            ...prev,
            navigation: entry as PerformanceNavigationTiming,
          }));
        } else if (entry.entryType === 'resource') {
          setPerformanceData((prev) => ({
            ...prev,
            resources: [...prev.resources, entry as PerformanceResourceTiming],
          }));
        }
      }
    });

    observer.observe({ entryTypes: ['navigation', 'resource'] });

    return () => observer.disconnect();
  }, []);

  return performanceData;
}
