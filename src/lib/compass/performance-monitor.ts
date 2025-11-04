/**
 * 风水罗盘性能监控工具
 *
 * 监控渲染性能和内存使用情况
 */

export interface PerformanceMetrics {
  renderTime: number;
  frameRate: number;
  memoryUsage: number;
  timestamp: number;
}

export class CompassPerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 100;
  private renderStartTime = 0;
  private frameCount = 0;
  private lastFrameTime = 0;

  // 开始渲染计时
  startRender(): void {
    this.renderStartTime = performance.now();
  }

  // 结束渲染计时
  endRender(): void {
    if (this.renderStartTime === 0) return;

    const renderTime = performance.now() - this.renderStartTime;
    const now = performance.now();

    // 计算帧率
    this.frameCount++;
    const frameRate =
      this.lastFrameTime > 0 ? 1000 / (now - this.lastFrameTime) : 0;
    this.lastFrameTime = now;

    // 获取内存使用情况
    const memoryUsage = this.getMemoryUsage();

    const metrics: PerformanceMetrics = {
      renderTime,
      frameRate,
      memoryUsage,
      timestamp: now,
    };

    this.addMetrics(metrics);
    this.renderStartTime = 0;
  }

  // 获取内存使用情况
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }

  // 添加性能指标
  private addMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics);

    // 保持最大数量限制
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  // 获取平均性能指标
  getAverageMetrics(): Partial<PerformanceMetrics> {
    if (this.metrics.length === 0) return {};

    const sum = this.metrics.reduce(
      (acc, metric) => ({
        renderTime: acc.renderTime + metric.renderTime,
        frameRate: acc.frameRate + metric.frameRate,
        memoryUsage: acc.memoryUsage + metric.memoryUsage,
      }),
      { renderTime: 0, frameRate: 0, memoryUsage: 0 }
    );

    const count = this.metrics.length;
    return {
      renderTime: sum.renderTime / count,
      frameRate: sum.frameRate / count,
      memoryUsage: sum.memoryUsage / count,
    };
  }

  // 获取最新指标
  getLatestMetrics(): PerformanceMetrics | null {
    return this.metrics.length > 0
      ? this.metrics[this.metrics.length - 1]
      : null;
  }

  // 获取所有指标
  getAllMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  // 清除指标
  clearMetrics(): void {
    this.metrics = [];
    this.frameCount = 0;
    this.lastFrameTime = 0;
  }

  // 检查性能警告
  checkPerformanceWarnings(): string[] {
    const warnings: string[] = [];
    const latest = this.getLatestMetrics();
    const average = this.getAverageMetrics();

    if (latest) {
      if (latest.renderTime > 16) {
        // 超过16ms可能影响60fps
        warnings.push(`渲染时间过长: ${latest.renderTime.toFixed(2)}ms`);
      }

      if (latest.frameRate < 30) {
        warnings.push(`帧率过低: ${latest.frameRate.toFixed(1)}fps`);
      }

      if (latest.memoryUsage > 100) {
        // 超过100MB
        warnings.push(`内存使用过高: ${latest.memoryUsage.toFixed(1)}MB`);
      }
    }

    if (average.renderTime && average.renderTime > 10) {
      warnings.push(`平均渲染时间过长: ${average.renderTime.toFixed(2)}ms`);
    }

    return warnings;
  }
}

// 全局性能监控实例
export const compassPerformanceMonitor = new CompassPerformanceMonitor();
