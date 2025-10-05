'use client';

/**
 * Web Vitals 监控组件
 * 用于监控 Core Web Vitals (LCP, CLS, INP)
 */

import { useEffect } from 'react';
import {
  type Metric,
  onCLS,
  onFCP,
  onINP,
  onLCP,
  onTTFB,
} from 'web-vitals';

interface WebVitalsProps {
  /**
   * 是否启用监控（默认：仅生产环境）
   */
  enabled?: boolean;
  /**
   * 自定义上报函数
   */
  onReport?: (metric: Metric) => void;
}

/**
 * 默认上报函数
 */
function defaultOnReport(metric: Metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
  });

  // 发送到分析服务
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/vitals', body);
  } else {
    fetch('/api/analytics/vitals', {
      body,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      keepalive: true,
    }).catch(console.error);
  }

  // 开发环境控制台输出
  if (process.env.NODE_ENV === 'development') {
    const thresholds = {
      LCP: { good: 2500, needsImprovement: 4000 },
      CLS: { good: 0.1, needsImprovement: 0.25 },
      INP: { good: 200, needsImprovement: 500 },
      FCP: { good: 1800, needsImprovement: 3000 },
      TTFB: { good: 800, needsImprovement: 1800 },
    };

    const threshold = thresholds[metric.name as keyof typeof thresholds];
    let status = '✅';

    if (threshold) {
      if (metric.value > threshold.needsImprovement) {
        status = '❌';
      } else if (metric.value > threshold.good) {
        status = '⚠️';
      }
    }

    console.log(
      `${status} ${metric.name}: ${metric.value.toFixed(2)}${metric.name === 'CLS' ? '' : 'ms'} (${metric.rating})`
    );
  }
}

export function WebVitals({
  enabled = process.env.NODE_ENV === 'production',
  onReport = defaultOnReport,
}: WebVitalsProps) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    // 监控各项指标
    onCLS(onReport);
    onFCP(onReport);
    onINP(onReport); // INP 替代了 FID
    onLCP(onReport);
    onTTFB(onReport);
  }, [enabled, onReport]);

  return null;
}

/**
 * 性能检查Hook
 */
export function usePerformanceCheck() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    // 检查是否有性能问题
    const checkPerformance = () => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;

      if (!navigation) {
        return;
      }

      const metrics = {
        'DNS 查询': navigation.domainLookupEnd - navigation.domainLookupStart,
        'TCP 连接': navigation.connectEnd - navigation.connectStart,
        'TLS 握手': navigation.secureConnectionStart
          ? navigation.connectEnd - navigation.secureConnectionStart
          : 0,
        TTFB: navigation.responseStart - navigation.requestStart,
        下载时间: navigation.responseEnd - navigation.responseStart,
        'DOM 解析':
          navigation.domContentLoadedEventEnd - navigation.responseEnd,
        资源加载:
          navigation.loadEventStart - navigation.domContentLoadedEventEnd,
      };

      console.group('📊 性能详情');
      Object.entries(metrics).forEach(([name, value]) => {
        const status = value > 1000 ? '❌' : value > 500 ? '⚠️' : '✅';
        console.log(`${status} ${name}: ${value.toFixed(2)}ms`);
      });
      console.groupEnd();

      // 检查资源
      const resources = performance.getEntriesByType(
        'resource'
      ) as PerformanceResourceTiming[];
      const slowResources = resources.filter((r) => r.duration > 500);

      if (slowResources.length > 0) {
        console.group('⚠️ 慢速资源 (>500ms)');
        slowResources.forEach((r) => {
          console.log(`${r.name}: ${r.duration.toFixed(2)}ms`);
        });
        console.groupEnd();
      }
    };

    // 页面加载完成后检查
    if (document.readyState === 'complete') {
      checkPerformance();
    } else {
      window.addEventListener('load', checkPerformance);
      return () => window.removeEventListener('load', checkPerformance);
    }
  }, []);
}
