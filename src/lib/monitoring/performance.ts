/**
 * 性能监控工具
 * 用于追踪和报告应用性能指标
 */

import { logger } from './logger';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  tags?: Record<string, string>;
  timestamp: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private timers: Map<string, number> = new Map();

  /**
   * 记录性能指标
   */
  recordMetric(
    name: string,
    value: number,
    unit = 'ms',
    tags?: Record<string, string>
  ) {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      tags,
      timestamp: new Date().toISOString(),
    };

    this.metrics.push(metric);

    // 开发环境下输出到控制台
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`Performance: ${name} = ${value}${unit}`, { tags });
    }

    // 发送到监控服务
    this.sendMetric(metric);
  }

  /**
   * 开始计时
   */
  startTimer(name: string) {
    this.timers.set(name, performance.now());
  }

  /**
   * 结束计时并记录
   */
  endTimer(name: string, tags?: Record<string, string>) {
    const startTime = this.timers.get(name);
    if (!startTime) {
      logger.warn(`Timer "${name}" was not started`);
      return;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(name);
    this.recordMetric(name, duration, 'ms', tags);

    return duration;
  }

  /**
   * 包装函数以自动计时
   */
  wrapFunction<T extends (...args: any[]) => any>(fn: T, name?: string): T {
    const timerName = name || fn.name || 'anonymous';

    return ((...args: Parameters<T>) => {
      this.startTimer(timerName);
      try {
        const result = fn(...args);

        // 处理异步函数
        if (result instanceof Promise) {
          return result.finally(() => {
            this.endTimer(timerName);
          });
        }

        this.endTimer(timerName);
        return result;
      } catch (error) {
        this.endTimer(timerName, { error: 'true' });
        throw error;
      }
    }) as T;
  }

  /**
   * 记录 Web Vitals 指标
   */
  recordWebVital(metric: {
    name: string;
    value: number;
    rating?: 'good' | 'needs-improvement' | 'poor';
    delta?: number;
  }) {
    this.recordMetric(`web_vital_${metric.name}`, metric.value, 'ms', {
      rating: metric.rating || 'unknown',
    });
  }

  /**
   * 记录 API 请求性能
   */
  recordAPICall(options: {
    endpoint: string;
    method: string;
    duration: number;
    status: number;
    success: boolean;
  }) {
    this.recordMetric('api_call_duration', options.duration, 'ms', {
      endpoint: options.endpoint,
      method: options.method,
      status: String(options.status),
      success: String(options.success),
    });
  }

  /**
   * 记录数据库查询性能
   */
  recordDatabaseQuery(options: {
    query: string;
    duration: number;
    rows?: number;
  }) {
    this.recordMetric('database_query_duration', options.duration, 'ms', {
      query: options.query.substring(0, 100), // 限制长度
      rows: options.rows ? String(options.rows) : '',
    });
  }

  /**
   * 记录缓存命中率
   */
  recordCacheHit(hit: boolean, key?: string) {
    this.recordMetric('cache_hit', hit ? 1 : 0, 'boolean', {
      key: key?.substring(0, 50) ?? '',
    });
  }

  /**
   * 获取所有指标
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * 清空指标
   */
  clearMetrics() {
    this.metrics = [];
  }

  /**
   * 发送指标到监控服务
   */
  private async sendMetric(metric: PerformanceMetric) {
    if (process.env.PERFORMANCE_MONITORING_ENABLED !== 'true') {
      return;
    }

    try {
      // TODO: 实现具体的监控服务集成
      // 例如：Datadog, New Relic, CloudWatch, etc.

      if (process.env.METRICS_ENDPOINT) {
        await fetch(process.env.METRICS_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.METRICS_TOKEN}`,
          },
          body: JSON.stringify(metric),
        }).catch(() => {
          // 静默失败
        });
      }
    } catch (error) {
      // 静默失败
    }
  }

  /**
   * 监控内存使用
   */
  recordMemoryUsage() {
    if (typeof window !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory;
      this.recordMetric(
        'memory_used',
        memory.usedJSHeapSize / 1024 / 1024,
        'MB'
      );
      this.recordMetric(
        'memory_total',
        memory.totalJSHeapSize / 1024 / 1024,
        'MB'
      );
      this.recordMetric(
        'memory_limit',
        memory.jsHeapSizeLimit / 1024 / 1024,
        'MB'
      );
    }
  }
}

// 导出单例实例
export const performanceMonitor = new PerformanceMonitor();

// 导出类型
export type { PerformanceMetric };
