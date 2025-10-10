/**
 * 性能监控系统
 *
 * 监控和记录关键性能指标
 * 帮助识别性能瓶颈和优化机会
 *
 * @author QiFlow AI Team
 * @version 1.0.0
 */

// ==================== 类型定义 ====================

/**
 * 性能指标
 */
export interface PerformanceMetric {
  name: string;
  duration: number; // 毫秒
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * 性能报告
 */
export interface PerformanceReport {
  totalDuration: number;
  metrics: PerformanceMetric[];
  bottlenecks: Array<{
    name: string;
    duration: number;
    percentage: number;
    suggestions: string[];
  }>;
  cacheStats?: {
    hits: number;
    misses: number;
    hitRate: number;
  };
  summary: string;
}

/**
 * 性能阈值配置
 */
export interface PerformanceThresholds {
  critical: number; // 毫秒
  warning: number; // 毫秒
  good: number; // 毫秒
}

// ==================== 性能监控器 ====================

/**
 * 性能监控器类
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private startTimes: Map<string, number> = new Map();
  private cacheHits = 0;
  private cacheMisses = 0;

  // 默认阈值（毫秒）
  private thresholds: PerformanceThresholds = {
    critical: 1000, // 1秒
    warning: 500, // 0.5秒
    good: 200, // 0.2秒
  };

  /**
   * 设置性能阈值
   */
  setThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  /**
   * 开始计时
   */
  start(name: string): void {
    this.startTimes.set(name, Date.now());
  }

  /**
   * 结束计时并记录
   */
  end(name: string, metadata?: Record<string, any>): number {
    const startTime = this.startTimes.get(name);
    if (!startTime) {
      console.warn(`Performance monitoring: No start time found for "${name}"`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.startTimes.delete(name);

    // 记录指标
    this.metrics.push({
      name,
      duration,
      timestamp: new Date(),
      metadata,
    });

    // 输出警告（如果超过阈值）
    if (duration > this.thresholds.critical) {
      console.warn(
        `⚠️ [CRITICAL] ${name}: ${duration}ms (threshold: ${this.thresholds.critical}ms)`
      );
    } else if (duration > this.thresholds.warning) {
      console.warn(
        `⚡ [WARNING] ${name}: ${duration}ms (threshold: ${this.thresholds.warning}ms)`
      );
    }

    return duration;
  }

  /**
   * 记录缓存命中
   */
  recordCacheHit(): void {
    this.cacheHits++;
  }

  /**
   * 记录缓存未命中
   */
  recordCacheMiss(): void {
    this.cacheMisses++;
  }

  /**
   * 获取缓存命中率
   */
  getCacheHitRate(): number {
    const total = this.cacheHits + this.cacheMisses;
    return total > 0 ? (this.cacheHits / total) * 100 : 0;
  }

  /**
   * 生成性能报告
   */
  generateReport(): PerformanceReport {
    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);

    // 识别瓶颈（耗时超过10%的操作）
    const bottlenecks = this.metrics
      .map((m) => ({
        name: m.name,
        duration: m.duration,
        percentage: (m.duration / totalDuration) * 100,
        suggestions: this.getSuggestions(m.name, m.duration),
      }))
      .filter((b) => b.percentage > 10 || b.duration > this.thresholds.warning)
      .sort((a, b) => b.duration - a.duration);

    // 缓存统计
    const cacheStats = {
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: this.getCacheHitRate(),
    };

    // 生成摘要
    const summary = this.generateSummary(
      totalDuration,
      bottlenecks.length,
      cacheStats.hitRate
    );

    return {
      totalDuration,
      metrics: this.metrics,
      bottlenecks,
      cacheStats,
      summary,
    };
  }

  /**
   * 获取优化建议
   */
  private getSuggestions(name: string, duration: number): string[] {
    const suggestions: string[] = [];

    // 根据操作名称和耗时给出建议
    if (name.includes('database') || name.includes('db')) {
      if (duration > this.thresholds.warning) {
        suggestions.push('考虑添加数据库索引');
        suggestions.push('检查查询是否可以优化');
        suggestions.push('考虑使用缓存');
      }
    }

    if (name.includes('api') || name.includes('fetch')) {
      if (duration > this.thresholds.warning) {
        suggestions.push('检查网络连接');
        suggestions.push('考虑使用CDN');
        suggestions.push('实现请求缓存');
      }
    }

    if (name.includes('calculation') || name.includes('compute')) {
      if (duration > this.thresholds.warning) {
        suggestions.push('考虑使用Web Worker');
        suggestions.push('优化算法复杂度');
        suggestions.push('实现结果缓存');
      }
    }

    if (name.includes('render') || name.includes('display')) {
      if (duration > this.thresholds.warning) {
        suggestions.push('减少DOM操作');
        suggestions.push('使用虚拟滚动');
        suggestions.push('优化组件渲染');
      }
    }

    // 通用建议
    if (duration > this.thresholds.critical) {
      suggestions.push('该操作耗时过长，需要立即优化');
    }

    return suggestions;
  }

  /**
   * 生成性能摘要
   */
  private generateSummary(
    totalDuration: number,
    bottleneckCount: number,
    cacheHitRate: number
  ): string {
    const parts: string[] = [];

    // 总体性能评估
    if (totalDuration < this.thresholds.good) {
      parts.push('✅ 性能优秀');
    } else if (totalDuration < this.thresholds.warning) {
      parts.push('✓ 性能良好');
    } else if (totalDuration < this.thresholds.critical) {
      parts.push('⚡ 性能一般，建议优化');
    } else {
      parts.push('⚠️ 性能较差，需要立即优化');
    }

    parts.push(`总耗时: ${totalDuration}ms`);

    // 瓶颈评估
    if (bottleneckCount > 0) {
      parts.push(`发现 ${bottleneckCount} 个性能瓶颈`);
    } else {
      parts.push('未发现明显性能瓶颈');
    }

    // 缓存评估
    if (cacheHitRate > 0) {
      if (cacheHitRate >= 80) {
        parts.push(`缓存命中率: ${cacheHitRate.toFixed(1)}% (优秀)`);
      } else if (cacheHitRate >= 60) {
        parts.push(`缓存命中率: ${cacheHitRate.toFixed(1)}% (良好)`);
      } else if (cacheHitRate >= 40) {
        parts.push(`缓存命中率: ${cacheHitRate.toFixed(1)}% (一般)`);
      } else {
        parts.push(`缓存命中率: ${cacheHitRate.toFixed(1)}% (较低，建议优化)`);
      }
    }

    return parts.join(' | ');
  }

  /**
   * 清除所有指标
   */
  clear(): void {
    this.metrics = [];
    this.startTimes.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  /**
   * 获取指定操作的统计信息
   */
  getStats(operationName: string): {
    count: number;
    totalDuration: number;
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
  } | null {
    const relevantMetrics = this.metrics.filter(
      (m) => m.name === operationName
    );

    if (relevantMetrics.length === 0) {
      return null;
    }

    const durations = relevantMetrics.map((m) => m.duration);

    return {
      count: relevantMetrics.length,
      totalDuration: durations.reduce((sum, d) => sum + d, 0),
      avgDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
    };
  }

  /**
   * 打印性能报告到控制台
   */
  printReport(): void {
    const report = this.generateReport();

    console.log('\n========== 性能监控报告 ==========');
    console.log(`📊 ${report.summary}`);

    if (report.metrics.length > 0) {
      console.log('\n📈 操作详情:');
      report.metrics.forEach((m) => {
        const status =
          m.duration > this.thresholds.critical
            ? '⚠️'
            : m.duration > this.thresholds.warning
              ? '⚡'
              : '✓';
        console.log(`  ${status} ${m.name}: ${m.duration}ms`);
      });
    }

    if (report.bottlenecks.length > 0) {
      console.log('\n🔥 性能瓶颈:');
      report.bottlenecks.forEach((b) => {
        console.log(
          `  • ${b.name}: ${b.duration}ms (${b.percentage.toFixed(1)}%)`
        );
        if (b.suggestions.length > 0) {
          b.suggestions.forEach((s) => {
            console.log(`    → ${s}`);
          });
        }
      });
    }

    if (report.cacheStats) {
      console.log('\n💾 缓存统计:');
      console.log(`  命中: ${report.cacheStats.hits}`);
      console.log(`  未命中: ${report.cacheStats.misses}`);
      console.log(`  命中率: ${report.cacheStats.hitRate.toFixed(1)}%`);
    }

    console.log('===================================\n');
  }
}

// ==================== 全局监控器实例 ====================

let globalMonitor: PerformanceMonitor | null = null;

/**
 * 获取全局性能监控器
 */
export function getGlobalMonitor(): PerformanceMonitor {
  if (!globalMonitor) {
    globalMonitor = new PerformanceMonitor();
  }
  return globalMonitor;
}

/**
 * 重置全局监控器
 */
export function resetGlobalMonitor(): void {
  globalMonitor = new PerformanceMonitor();
}

// ==================== 装饰器工具 ====================

/**
 * 性能监控装饰器
 *
 * 用法:
 * ```typescript
 * const myFunction = withPerformanceMonitoring(
 *   'myOperation',
 *   async () => {
 *     // 你的代码
 *   }
 * );
 * ```
 */
export function withPerformanceMonitoring<T>(
  operationName: string,
  fn: () => T | Promise<T>,
  monitor?: PerformanceMonitor
): () => Promise<T> {
  return async () => {
    const m = monitor || getGlobalMonitor();
    m.start(operationName);

    try {
      const result = await fn();
      m.end(operationName);
      return result;
    } catch (error) {
      m.end(operationName, { error: true });
      throw error;
    }
  };
}

/**
 * 测量异步函数的执行时间
 */
export async function measureAsync<T>(
  operationName: string,
  fn: () => Promise<T>,
  monitor?: PerformanceMonitor
): Promise<T> {
  const m = monitor || getGlobalMonitor();
  m.start(operationName);

  try {
    const result = await fn();
    m.end(operationName);
    return result;
  } catch (error) {
    m.end(operationName, { error: true });
    throw error;
  }
}

/**
 * 测量同步函数的执行时间
 */
export function measureSync<T>(
  operationName: string,
  fn: () => T,
  monitor?: PerformanceMonitor
): T {
  const m = monitor || getGlobalMonitor();
  m.start(operationName);

  try {
    const result = fn();
    m.end(operationName);
    return result;
  } catch (error) {
    m.end(operationName, { error: true });
    throw error;
  }
}
