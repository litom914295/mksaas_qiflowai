/**
 * 八字计算性能监控系统
 * 用于追踪和优化计算性能
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface PerformanceReport {
  totalTime: number;
  metrics: PerformanceMetric[];
  summary: {
    slowest: PerformanceMetric | null;
    fastest: PerformanceMetric | null;
    average: number;
  };
  warnings: string[];
}

export class BaziPerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private thresholds: Map<string, number> = new Map();
  private enabled: boolean = true;

  constructor() {
    // 设置默认性能阈值（毫秒）
    this.thresholds.set('fourPillarsCalculation', 50);
    this.thresholds.set('wuxingAnalysis', 30);
    this.thresholds.set('yongshenAnalysis', 100);
    this.thresholds.set('patternDetection', 80);
    this.thresholds.set('dayunCalculation', 150);
    this.thresholds.set('interpretation', 200);
    this.thresholds.set('total', 500);
  }

  /**
   * 开始计时
   */
  start(name: string, metadata?: Record<string, any>): void {
    if (!this.enabled) return;

    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      metadata,
    });
  }

  /**
   * 结束计时
   */
  end(name: string): number {
    if (!this.enabled) return 0;

    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric "${name}" was not started`);
      return 0;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;

    // 检查是否超过阈值
    const threshold = this.thresholds.get(name);
    if (threshold && metric.duration > threshold) {
      console.warn(
        `⚠️ Performance warning: "${name}" took ${metric.duration.toFixed(2)}ms (threshold: ${threshold}ms)`
      );
    }

    return metric.duration;
  }

  /**
   * 使用装饰器模式测量异步函数性能
   */
  async measure<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.start(name, metadata);
    try {
      const result = await fn();
      return result;
    } finally {
      this.end(name);
    }
  }

  /**
   * 使用装饰器模式测量同步函数性能
   */
  measureSync<T>(
    name: string,
    fn: () => T,
    metadata?: Record<string, any>
  ): T {
    this.start(name, metadata);
    try {
      const result = fn();
      return result;
    } finally {
      this.end(name);
    }
  }

  /**
   * 生成性能报告
   */
  generateReport(): PerformanceReport {
    const metrics = Array.from(this.metrics.values()).filter(m => m.duration);
    
    if (metrics.length === 0) {
      return {
        totalTime: 0,
        metrics: [],
        summary: {
          slowest: null,
          fastest: null,
          average: 0,
        },
        warnings: [],
      };
    }

    const totalTime = metrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    const sortedMetrics = [...metrics].sort((a, b) => (b.duration || 0) - (a.duration || 0));
    
    const warnings: string[] = [];
    
    // 检查总时间
    const totalThreshold = this.thresholds.get('total');
    if (totalThreshold && totalTime > totalThreshold) {
      warnings.push(`Total calculation time (${totalTime.toFixed(2)}ms) exceeded threshold (${totalThreshold}ms)`);
    }

    // 检查单个指标
    metrics.forEach(metric => {
      const threshold = this.thresholds.get(metric.name);
      if (threshold && metric.duration && metric.duration > threshold) {
        warnings.push(
          `"${metric.name}" (${metric.duration.toFixed(2)}ms) exceeded threshold (${threshold}ms)`
        );
      }
    });

    return {
      totalTime,
      metrics,
      summary: {
        slowest: sortedMetrics[0] || null,
        fastest: sortedMetrics[sortedMetrics.length - 1] || null,
        average: totalTime / metrics.length,
      },
      warnings,
    };
  }

  /**
   * 打印性能报告到控制台
   */
  logReport(): void {
    const report = this.generateReport();
    
    console.group('🎯 八字计算性能报告');
    console.log(`📊 总耗时: ${report.totalTime.toFixed(2)}ms`);
    
    if (report.metrics.length > 0) {
      console.table(
        report.metrics.map(m => ({
          名称: m.name,
          耗时: `${m.duration?.toFixed(2)}ms`,
          占比: `${((m.duration || 0) / report.totalTime * 100).toFixed(1)}%`,
        }))
      );
      
      if (report.summary.slowest) {
        console.log(`🐢 最慢: ${report.summary.slowest.name} (${report.summary.slowest.duration?.toFixed(2)}ms)`);
      }
      
      if (report.summary.fastest) {
        console.log(`🚀 最快: ${report.summary.fastest.name} (${report.summary.fastest.duration?.toFixed(2)}ms)`);
      }
      
      console.log(`📈 平均: ${report.summary.average.toFixed(2)}ms`);
    }
    
    if (report.warnings.length > 0) {
      console.warn('⚠️ 性能警告:');
      report.warnings.forEach(warning => console.warn(`  - ${warning}`));
    }
    
    console.groupEnd();
  }

  /**
   * 清理指标
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * 启用/禁用监控
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * 设置性能阈值
   */
  setThreshold(name: string, threshold: number): void {
    this.thresholds.set(name, threshold);
  }

  /**
   * 获取指标统计
   */
  getStats(): {
    metricsCount: number;
    totalTime: number;
    enabled: boolean;
  } {
    const totalTime = Array.from(this.metrics.values()).reduce(
      (sum, m) => sum + (m.duration || 0),
      0
    );

    return {
      metricsCount: this.metrics.size,
      totalTime,
      enabled: this.enabled,
    };
  }
}

// 创建全局监控实例
export const globalMonitor = new BaziPerformanceMonitor();

/**
 * 性能基准测试
 */
export class BaziBenchmark {
  private monitor: BaziPerformanceMonitor;
  
  constructor() {
    this.monitor = new BaziPerformanceMonitor();
  }

  /**
   * 运行基准测试
   */
  async runBenchmark(
    testCases: Array<{
      name: string;
      data: any;
      fn: (data: any) => Promise<any>;
    }>,
    iterations: number = 10
  ): Promise<{
    results: Map<string, number[]>;
    summary: Map<string, { avg: number; min: number; max: number; std: number }>;
  }> {
    const results = new Map<string, number[]>();

    for (const testCase of testCases) {
      const times: number[] = [];
      
      console.log(`Running benchmark: ${testCase.name}...`);
      
      for (let i = 0; i < iterations; i++) {
        this.monitor.clear();
        const startTime = performance.now();
        
        await testCase.fn(testCase.data);
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        times.push(duration);
      }
      
      results.set(testCase.name, times);
    }

    // 计算统计信息
    const summary = new Map<string, { avg: number; min: number; max: number; std: number }>();
    
    results.forEach((times, name) => {
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const min = Math.min(...times);
      const max = Math.max(...times);
      const variance = times.reduce((sum, time) => sum + Math.pow(time - avg, 2), 0) / times.length;
      const std = Math.sqrt(variance);
      
      summary.set(name, { avg, min, max, std });
    });

    return { results, summary };
  }

  /**
   * 打印基准测试结果
   */
  printBenchmarkResults(
    summary: Map<string, { avg: number; min: number; max: number; std: number }>
  ): void {
    console.group('📊 基准测试结果');
    
    const data = Array.from(summary.entries()).map(([name, stats]) => ({
      测试名称: name,
      平均耗时: `${stats.avg.toFixed(2)}ms`,
      最小耗时: `${stats.min.toFixed(2)}ms`,
      最大耗时: `${stats.max.toFixed(2)}ms`,
      标准差: `${stats.std.toFixed(2)}ms`,
    }));
    
    console.table(data);
    console.groupEnd();
  }
}

/**
 * 性能优化建议生成器
 */
export class PerformanceOptimizer {
  /**
   * 根据性能报告生成优化建议
   */
  static generateSuggestions(report: PerformanceReport): string[] {
    const suggestions: string[] = [];

    // 总时间优化建议
    if (report.totalTime > 500) {
      suggestions.push('考虑启用缓存机制以减少重复计算');
      suggestions.push('考虑使用 Web Worker 进行耗时计算');
    }

    // 分析最慢的操作
    if (report.summary.slowest) {
      const slowest = report.summary.slowest;
      
      if (slowest.name.includes('interpretation') && slowest.duration && slowest.duration > 200) {
        suggestions.push('AI解读可以考虑异步加载或分批处理');
      }
      
      if (slowest.name.includes('dayun') && slowest.duration && slowest.duration > 150) {
        suggestions.push('大运计算可以考虑预计算或延迟加载');
      }
      
      if (slowest.name.includes('pattern') && slowest.duration && slowest.duration > 100) {
        suggestions.push('格局检测可以优化匹配算法或使用索引');
      }
    }

    // 检查是否有过多的小操作
    const smallOperations = report.metrics.filter(m => m.duration && m.duration < 10);
    if (smallOperations.length > 20) {
      suggestions.push('考虑合并小操作以减少函数调用开销');
    }

    return suggestions;
  }
}

// 导出便捷函数
export function startMeasure(name: string, metadata?: Record<string, any>): void {
  globalMonitor.start(name, metadata);
}

export function endMeasure(name: string): number {
  return globalMonitor.end(name);
}

export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  return globalMonitor.measure(name, fn, metadata);
}

export function measureSync<T>(
  name: string,
  fn: () => T,
  metadata?: Record<string, any>
): T {
  return globalMonitor.measureSync(name, fn, metadata);
}

export function getPerformanceReport(): PerformanceReport {
  return globalMonitor.generateReport();
}

export function logPerformance(): void {
  globalMonitor.logReport();
}