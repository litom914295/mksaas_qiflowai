'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { useEffect } from 'react';

type WebVitalsMetric = {
  id: string;
  name: string;
  value: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
};

/**
 * Web Vitals 性能监控组件
 * 收集并报告核心Web指标
 */
export function WebVitalsMonitor() {
  useReportWebVitals((metric) => {
    // 在开发环境中记录到控制台
    if (process.env.NODE_ENV === 'development') {
      console.log('Web Vitals:', metric);
    }

    // 发送到分析服务（如果需要）
    sendToAnalytics(metric);
  });

  useEffect(() => {
    // 监听页面可见性变化
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // 页面隐藏时发送累积的性能数据
        flushPendingMetrics();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null;
}

// 批量发送性能数据
let pendingMetrics: WebVitalsMetric[] = [];
let flushTimer: NodeJS.Timeout | null = null;

function sendToAnalytics(metric: WebVitalsMetric) {
  pendingMetrics.push({
    id: metric.id,
    name: metric.name,
    value: Math.round(metric.value),
    rating: metric.rating,
  });

  // 批量发送，减少网络请求
  if (flushTimer) {
    clearTimeout(flushTimer);
  }

  flushTimer = setTimeout(() => {
    flushPendingMetrics();
  }, 5000); // 5秒后发送
}

function flushPendingMetrics() {
  if (pendingMetrics.length === 0) return;

  const metricsToSend = [...pendingMetrics];
  pendingMetrics = [];

  // 发送到你的分析端点
  if (typeof navigator.sendBeacon !== 'undefined' && process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    const body = JSON.stringify({
      metrics: metricsToSend,
      url: window.location.href,
      timestamp: Date.now(),
    });

    navigator.sendBeacon(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, body);
  }

  // 在开发环境中输出汇总
  if (process.env.NODE_ENV === 'development') {
    console.table(
      metricsToSend.reduce((acc, metric) => {
        acc[metric.name] = {
          value: metric.value,
          rating: metric.rating || 'N/A',
        };
        return acc;
      }, {} as Record<string, any>)
    );
  }
}

// 导出用于测试的工具函数
export { flushPendingMetrics, sendToAnalytics };