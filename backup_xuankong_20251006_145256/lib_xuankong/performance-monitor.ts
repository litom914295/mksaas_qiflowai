/**
 * 性能监控工具
 * 用于监控和优化玄空飞星分析系统的性能
 */

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface PerformanceSummary {
  totalOperations: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  p50: number;
  p95: number;
  p99: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private readonly maxMetricsPerOperation = 1000;
  private enabled: boolean = process.env.NODE_ENV === 'development';

  /**
   * 启用或禁用性能监控
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * 开始计时
   */
  startTiming(operationName: string): (metadata?: Record<string, any>) => void {
    if (!this.enabled) {
      return () => {}; // 返回空函数
    }

    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();

    return (metadata?: Record<string, any>) => {
      const duration = performance.now() - startTime;
      const endMemory = this.getMemoryUsage();

      this.recordMetric({
        name: operationName,
        duration,
        timestamp: Date.now(),
        metadata: {
          ...metadata,
          memoryDelta: endMemory - startMemory,
        },
      });
    };
  }

  /**
   * 记录性能指标
   */
  recordMetric(metric: PerformanceMetric): void {
    if (!this.metrics.has(metric.name)) {
      this.metrics.set(metric.name, []);
    }

    const metrics = this.metrics.get(metric.name)!;
    metrics.push(metric);

    // 限制存储的指标数量
    if (metrics.length > this.maxMetricsPerOperation) {
      metrics.shift();
    }
  }

  /**
   * 获取内存使用情况
   */
  private getMemoryUsage(): number {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }

  /**
   * 获取操作的性能摘要
   */
  getSummary(operationName: string): PerformanceSummary | null {
    const metrics = this.metrics.get(operationName);
    if (!metrics || metrics.length === 0) {
      return null;
    }

    const durations = metrics.map((m) => m.duration).sort((a, b) => a - b);
    const sum = durations.reduce((a, b) => a + b, 0);

    return {
      totalOperations: durations.length,
      averageDuration: sum / durations.length,
      minDuration: durations[0],
      maxDuration: durations[durations.length - 1],
      p50: this.getPercentile(durations, 0.5),
      p95: this.getPercentile(durations, 0.95),
      p99: this.getPercentile(durations, 0.99),
    };
  }

  /**
   * 计算百分位数
   */
  private getPercentile(sortedArray: number[], percentile: number): number {
    const index = Math.ceil(sortedArray.length * percentile) - 1;
    return sortedArray[Math.max(0, index)];
  }

  /**
   * 获取所有操作的性能报告
   */
  getFullReport(): Record<string, PerformanceSummary> {
    const report: Record<string, PerformanceSummary> = {};

    for (const [name] of this.metrics) {
      const summary = this.getSummary(name);
      if (summary) {
        report[name] = summary;
      }
    }

    return report;
  }

  /**
   * 检查性能是否符合阈值
   */
  checkPerformance(
    operationName: string,
    thresholdMs: number
  ): {
    passed: boolean;
    summary: PerformanceSummary | null;
    violations: string[];
  } {
    const summary = this.getSummary(operationName);
    if (!summary) {
      return {
        passed: true,
        summary: null,
        violations: [],
      };
    }

    const violations: string[] = [];

    if (summary.averageDuration > thresholdMs) {
      violations.push(
        `平均耗时 ${summary.averageDuration.toFixed(2)}ms 超过阈值 ${thresholdMs}ms`
      );
    }

    if (summary.p95 > thresholdMs * 1.5) {
      violations.push(`P95 ${summary.p95.toFixed(2)}ms 超过阈值的1.5倍`);
    }

    if (summary.maxDuration > thresholdMs * 3) {
      violations.push(
        `最大耗时 ${summary.maxDuration.toFixed(2)}ms 超过阈值的3倍`
      );
    }

    return {
      passed: violations.length === 0,
      summary,
      violations,
    };
  }

  /**
   * 打印性能报告
   */
  printReport(): void {
    const report = this.getFullReport();

    console.group('🚀 性能监控报告');

    for (const [name, summary] of Object.entries(report)) {
      console.group(`📊 ${name}`);
      console.log(`总操作数: ${summary.totalOperations}`);
      console.log(`平均耗时: ${summary.averageDuration.toFixed(2)}ms`);
      console.log(`最小耗时: ${summary.minDuration.toFixed(2)}ms`);
      console.log(`最大耗时: ${summary.maxDuration.toFixed(2)}ms`);
      console.log(`P50: ${summary.p50.toFixed(2)}ms`);
      console.log(`P95: ${summary.p95.toFixed(2)}ms`);
      console.log(`P99: ${summary.p99.toFixed(2)}ms`);
      console.groupEnd();
    }

    console.groupEnd();
  }

  /**
   * 清除所有指标
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * 清除特定操作的指标
   */
  clearOperation(operationName: string): void {
    this.metrics.delete(operationName);
  }

  /**
   * 导出指标数据（用于分析）
   */
  exportMetrics(): Record<string, PerformanceMetric[]> {
    const exported: Record<string, PerformanceMetric[]> = {};

    for (const [name, metrics] of this.metrics) {
      exported[name] = [...metrics];
    }

    return exported;
  }
}

// 单例实例
export const performanceMonitor = new PerformanceMonitor();

/**
 * 性能监控装饰器
 */
export function measurePerformance(operationName: string) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const endTiming = performanceMonitor.startTiming(operationName);

      try {
        const result = originalMethod.apply(this, args);

        // 处理Promise
        if (result instanceof Promise) {
          return result.finally(() => {
            endTiming({ method: propertyKey, args: args.length });
          });
        }

        endTiming({ method: propertyKey, args: args.length });
        return result;
      } catch (error) {
        endTiming({ method: propertyKey, error: true });
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * 性能监控Hook（用于函数）
 */
export function withPerformanceMonitoring<T extends (...args: any[]) => any>(
  fn: T,
  operationName: string
): T {
  return ((...args: any[]) => {
    const endTiming = performanceMonitor.startTiming(operationName);

    try {
      const result = fn(...args);

      if (result instanceof Promise) {
        return result.finally(() => {
          endTiming({ args: args.length });
        });
      }

      endTiming({ args: args.length });
      return result;
    } catch (error) {
      endTiming({ error: true });
      throw error;
    }
  }) as T;
}

/**
 * React Hook用于组件性能监控
 */
export function usePerformanceMonitor(componentName: string) {
  if (typeof window === 'undefined') return;

  const startTime = performance.now();

  return () => {
    const duration = performance.now() - startTime;
    performanceMonitor.recordMetric({
      name: `component:${componentName}`,
      duration,
      timestamp: Date.now(),
    });
  };
}

/**
 * 性能阈值配置
 */
export const PERFORMANCE_THRESHOLDS = {
  // 综合分析
  comprehensiveAnalysis: {
    basic: 1000, // 基础分析 < 1秒
    standard: 1500, // 标准分析 < 1.5秒
    expert: 2000, // 专家分析 < 2秒
  },

  // 单模块分析
  modules: {
    liunian: 100, // 流年分析 < 100ms
    liunianWithMonthly: 200, // 含月度 < 200ms
    personalized: 150, // 个性化 < 150ms
    recommendations: 200, // 推荐 < 200ms
    recommendationsFull: 300, // 完整推荐 < 300ms
  },

  // React组件渲染
  components: {
    panel: 500, // 主面板 < 500ms
    basicView: 300, // 基础视图 < 300ms
    grid: 200, // 飞星盘 < 200ms
  },
} as const;

export default performanceMonitor;
