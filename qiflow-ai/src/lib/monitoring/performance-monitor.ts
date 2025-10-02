/**
 * QiFlow AI - 性能监控系统
 * 
 * 实时监控系统性能，包括响应时间、内存使用、API调用等
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'MB' | 'count' | 'percent';
  timestamp: number;
  tags?: Record<string, string>;
}

export interface PerformanceSnapshot {
  timestamp: number;
  metrics: {
    responseTime: number;        // 平均响应时间 (ms)
    memoryUsage: number;         // 内存使用 (MB)
    cpuUsage: number;           // CPU使用率 (%)
    activeRequests: number;      // 活动请求数
    errorRate: number;          // 错误率 (%)
    throughput: number;         // 吞吐量 (req/s)
  };
  details: {
    slowestEndpoints: Array<{ path: string; time: number }>;
    errorEndpoints: Array<{ path: string; count: number }>;
    memoryBreakdown: {
      heap: number;
      external: number;
      arrayBuffers: number;
    };
  };
}

export interface PerformanceAlert {
  id: string;
  level: 'info' | 'warning' | 'critical';
  metric: string;
  message: string;
  threshold: number;
  currentValue: number;
  timestamp: number;
}

/**
 * 性能监控器配置
 */
export interface MonitorConfig {
  enabled: boolean;
  sampleInterval: number;      // 采样间隔 (ms)
  historySize: number;         // 历史记录大小
  alertThresholds: {
    responseTime: number;       // 响应时间阈值 (ms)
    memoryUsage: number;       // 内存使用阈值 (MB)
    cpuUsage: number;         // CPU使用率阈值 (%)
    errorRate: number;        // 错误率阈值 (%)
  };
  endpoints: string[];        // 监控的端点列表
}

/**
 * 性能监控器
 */
export class PerformanceMonitor {
  private config: MonitorConfig;
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private snapshots: PerformanceSnapshot[] = [];
  private alerts: PerformanceAlert[] = [];
  private timers: Map<string, number> = new Map();
  private requestCounts: Map<string, number> = new Map();
  private errorCounts: Map<string, number> = new Map();
  private intervalId?: NodeJS.Timeout;
  
  constructor(config: Partial<MonitorConfig> = {}) {
    this.config = {
      enabled: true,
      sampleInterval: 5000,
      historySize: 100,
      alertThresholds: {
        responseTime: 1000,
        memoryUsage: 500,
        cpuUsage: 80,
        errorRate: 5
      },
      endpoints: [],
      ...config
    };
    
    if (this.config.enabled) {
      this.start();
    }
  }
  
  /**
   * 开始监控
   */
  start(): void {
    if (this.intervalId) {
      return;
    }
    
    this.intervalId = setInterval(() => {
      this.collectSnapshot();
      this.checkAlerts();
      this.cleanupHistory();
    }, this.config.sampleInterval);
    
    console.log('[性能监控] 监控系统已启动');
  }
  
  /**
   * 停止监控
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      console.log('[性能监控] 监控系统已停止');
    }
  }
  
  /**
   * 记录指标
   */
  recordMetric(metric: PerformanceMetric): void {
    const key = `${metric.name}_${JSON.stringify(metric.tags || {})}`;
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    
    const history = this.metrics.get(key)!;
    history.push(metric);
    
    // 保持历史大小限制
    if (history.length > this.config.historySize) {
      history.shift();
    }
  }
  
  /**
   * 开始计时
   */
  startTimer(name: string): void {
    this.timers.set(name, Date.now());
  }
  
  /**
   * 结束计时并记录
   */
  endTimer(name: string, tags?: Record<string, string>): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      return 0;
    }
    
    const duration = Date.now() - startTime;
    this.timers.delete(name);
    
    this.recordMetric({
      name: `timer.${name}`,
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      tags
    });
    
    return duration;
  }
  
  /**
   * 记录请求
   */
  recordRequest(endpoint: string, success: boolean, duration: number): void {
    // 更新请求计数
    const countKey = `${endpoint}_total`;
    this.requestCounts.set(countKey, (this.requestCounts.get(countKey) || 0) + 1);
    
    // 更新错误计数
    if (!success) {
      const errorKey = `${endpoint}_error`;
      this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);
    }
    
    // 记录响应时间
    this.recordMetric({
      name: 'request.duration',
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      tags: { endpoint, success: String(success) }
    });
  }
  
  /**
   * 收集快照
   */
  private collectSnapshot(): void {
    const now = Date.now();
    
    // 计算平均响应时间
    const responseMetrics = Array.from(this.metrics.entries())
      .filter(([key]) => key.startsWith('request.duration'))
      .flatMap(([, metrics]) => metrics)
      .filter(m => m.timestamp > now - this.config.sampleInterval);
    
    const avgResponseTime = responseMetrics.length > 0
      ? responseMetrics.reduce((sum, m) => sum + m.value, 0) / responseMetrics.length
      : 0;
    
    // 获取内存使用情况
    const memoryUsage = this.getMemoryUsage();
    
    // 计算CPU使用率（模拟）
    const cpuUsage = this.getCPUUsage();
    
    // 计算活动请求数
    const activeRequests = this.timers.size;
    
    // 计算错误率
    const totalRequests = Array.from(this.requestCounts.values())
      .reduce((sum, count) => sum + count, 0);
    const totalErrors = Array.from(this.errorCounts.values())
      .reduce((sum, count) => sum + count, 0);
    const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
    
    // 计算吞吐量
    const throughput = totalRequests / (this.config.sampleInterval / 1000);
    
    // 找出最慢的端点
    const endpointTimes: Map<string, number[]> = new Map();
    responseMetrics.forEach(m => {
      const endpoint = m.tags?.endpoint || 'unknown';
      if (!endpointTimes.has(endpoint)) {
        endpointTimes.set(endpoint, []);
      }
      endpointTimes.get(endpoint)!.push(m.value);
    });
    
    const slowestEndpoints = Array.from(endpointTimes.entries())
      .map(([path, times]) => ({
        path,
        time: Math.max(...times)
      }))
      .sort((a, b) => b.time - a.time)
      .slice(0, 5);
    
    // 找出错误最多的端点
    const errorEndpoints = Array.from(this.errorCounts.entries())
      .map(([path, count]) => ({
        path: path.replace('_error', ''),
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    const snapshot: PerformanceSnapshot = {
      timestamp: now,
      metrics: {
        responseTime: avgResponseTime,
        memoryUsage: memoryUsage.total,
        cpuUsage,
        activeRequests,
        errorRate,
        throughput
      },
      details: {
        slowestEndpoints,
        errorEndpoints,
        memoryBreakdown: memoryUsage
      }
    };
    
    this.snapshots.push(snapshot);
    
    // 保持快照历史大小
    if (this.snapshots.length > this.config.historySize) {
      this.snapshots.shift();
    }
  }
  
  /**
   * 获取内存使用情况
   */
  private getMemoryUsage(): { heap: number; external: number; arrayBuffers: number; total: number } {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      return {
        heap: usage.heapUsed / 1024 / 1024,
        external: usage.external / 1024 / 1024,
        arrayBuffers: usage.arrayBuffers / 1024 / 1024,
        total: (usage.heapUsed + usage.external + usage.arrayBuffers) / 1024 / 1024
      };
    }
    
    // 浏览器环境的粗略估计
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory;
      const used = memory.usedJSHeapSize / 1024 / 1024;
      return {
        heap: used,
        external: 0,
        arrayBuffers: 0,
        total: used
      };
    }
    
    return { heap: 0, external: 0, arrayBuffers: 0, total: 0 };
  }
  
  /**
   * 获取CPU使用率（模拟）
   */
  private getCPUUsage(): number {
    // 在Node.js环境中可以使用process.cpuUsage()
    // 这里使用模拟值
    return Math.random() * 30 + 20; // 20-50%的随机值
  }
  
  /**
   * 检查告警
   */
  private checkAlerts(): void {
    const latest = this.snapshots[this.snapshots.length - 1];
    if (!latest) return;
    
    const { metrics } = latest;
    const { alertThresholds } = this.config;
    
    // 检查响应时间
    if (metrics.responseTime > alertThresholds.responseTime) {
      this.createAlert('warning', 'responseTime', 
        `响应时间过高: ${metrics.responseTime.toFixed(2)}ms`,
        alertThresholds.responseTime, metrics.responseTime);
    }
    
    // 检查内存使用
    if (metrics.memoryUsage > alertThresholds.memoryUsage) {
      this.createAlert('warning', 'memoryUsage',
        `内存使用过高: ${metrics.memoryUsage.toFixed(2)}MB`,
        alertThresholds.memoryUsage, metrics.memoryUsage);
    }
    
    // 检查CPU使用率
    if (metrics.cpuUsage > alertThresholds.cpuUsage) {
      this.createAlert('critical', 'cpuUsage',
        `CPU使用率过高: ${metrics.cpuUsage.toFixed(2)}%`,
        alertThresholds.cpuUsage, metrics.cpuUsage);
    }
    
    // 检查错误率
    if (metrics.errorRate > alertThresholds.errorRate) {
      this.createAlert('critical', 'errorRate',
        `错误率过高: ${metrics.errorRate.toFixed(2)}%`,
        alertThresholds.errorRate, metrics.errorRate);
    }
  }
  
  /**
   * 创建告警
   */
  private createAlert(
    level: PerformanceAlert['level'],
    metric: string,
    message: string,
    threshold: number,
    currentValue: number
  ): void {
    const alert: PerformanceAlert = {
      id: `${metric}_${Date.now()}`,
      level,
      metric,
      message,
      threshold,
      currentValue,
      timestamp: Date.now()
    };
    
    this.alerts.push(alert);
    
    // 保持告警历史大小
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }
    
    // 触发告警通知
    this.notifyAlert(alert);
  }
  
  /**
   * 发送告警通知
   */
  private notifyAlert(alert: PerformanceAlert): void {
    console.warn(`[性能告警] ${alert.level.toUpperCase()}: ${alert.message}`);
    
    // 这里可以添加其他通知方式，如：
    // - 发送邮件
    // - 发送短信
    // - 调用Webhook
    // - 写入日志文件
  }
  
  /**
   * 清理历史数据
   */
  private cleanupHistory(): void {
    const cutoffTime = Date.now() - (this.config.historySize * this.config.sampleInterval);
    
    // 清理指标历史
    this.metrics.forEach((metrics, key) => {
      const filtered = metrics.filter(m => m.timestamp > cutoffTime);
      if (filtered.length > 0) {
        this.metrics.set(key, filtered);
      } else {
        this.metrics.delete(key);
      }
    });
    
    // 清理告警历史
    this.alerts = this.alerts.filter(a => a.timestamp > cutoffTime);
  }
  
  /**
   * 获取最新快照
   */
  getLatestSnapshot(): PerformanceSnapshot | null {
    return this.snapshots[this.snapshots.length - 1] || null;
  }
  
  /**
   * 获取历史快照
   */
  getSnapshots(count?: number): PerformanceSnapshot[] {
    if (count) {
      return this.snapshots.slice(-count);
    }
    return [...this.snapshots];
  }
  
  /**
   * 获取告警列表
   */
  getAlerts(level?: PerformanceAlert['level']): PerformanceAlert[] {
    if (level) {
      return this.alerts.filter(a => a.level === level);
    }
    return [...this.alerts];
  }
  
  /**
   * 获取性能报告
   */
  generateReport(): {
    summary: {
      avgResponseTime: number;
      avgMemoryUsage: number;
      avgCPUUsage: number;
      avgErrorRate: number;
      totalRequests: number;
      totalErrors: number;
      uptime: number;
    };
    trends: {
      responseTime: 'improving' | 'stable' | 'degrading';
      memoryUsage: 'improving' | 'stable' | 'degrading';
      errorRate: 'improving' | 'stable' | 'degrading';
    };
    recommendations: string[];
  } {
    if (this.snapshots.length === 0) {
      return {
        summary: {
          avgResponseTime: 0,
          avgMemoryUsage: 0,
          avgCPUUsage: 0,
          avgErrorRate: 0,
          totalRequests: 0,
          totalErrors: 0,
          uptime: 0
        },
        trends: {
          responseTime: 'stable',
          memoryUsage: 'stable',
          errorRate: 'stable'
        },
        recommendations: ['需要更多数据来生成报告']
      };
    }
    
    // 计算平均值
    const avgResponseTime = this.snapshots.reduce((sum, s) => sum + s.metrics.responseTime, 0) / this.snapshots.length;
    const avgMemoryUsage = this.snapshots.reduce((sum, s) => sum + s.metrics.memoryUsage, 0) / this.snapshots.length;
    const avgCPUUsage = this.snapshots.reduce((sum, s) => sum + s.metrics.cpuUsage, 0) / this.snapshots.length;
    const avgErrorRate = this.snapshots.reduce((sum, s) => sum + s.metrics.errorRate, 0) / this.snapshots.length;
    
    const totalRequests = Array.from(this.requestCounts.values()).reduce((sum, count) => sum + count, 0);
    const totalErrors = Array.from(this.errorCounts.values()).reduce((sum, count) => sum + count, 0);
    
    const uptime = this.snapshots.length * this.config.sampleInterval / 1000; // 秒
    
    // 分析趋势
    const recentSnapshots = this.snapshots.slice(-10);
    const oldSnapshots = this.snapshots.slice(0, 10);
    
    const trends = {
      responseTime: this.analyzeTrend(
        oldSnapshots.map(s => s.metrics.responseTime),
        recentSnapshots.map(s => s.metrics.responseTime)
      ),
      memoryUsage: this.analyzeTrend(
        oldSnapshots.map(s => s.metrics.memoryUsage),
        recentSnapshots.map(s => s.metrics.memoryUsage)
      ),
      errorRate: this.analyzeTrend(
        oldSnapshots.map(s => s.metrics.errorRate),
        recentSnapshots.map(s => s.metrics.errorRate)
      )
    };
    
    // 生成建议
    const recommendations: string[] = [];
    
    if (avgResponseTime > this.config.alertThresholds.responseTime * 0.8) {
      recommendations.push('响应时间接近阈值，建议优化慢查询和API调用');
    }
    
    if (avgMemoryUsage > this.config.alertThresholds.memoryUsage * 0.8) {
      recommendations.push('内存使用率较高，建议检查内存泄漏');
    }
    
    if (avgErrorRate > this.config.alertThresholds.errorRate * 0.5) {
      recommendations.push('错误率偏高，建议检查错误日志并修复问题');
    }
    
    if (trends.responseTime === 'degrading') {
      recommendations.push('响应时间呈恶化趋势，需要立即关注');
    }
    
    if (trends.memoryUsage === 'degrading') {
      recommendations.push('内存使用呈增长趋势，可能存在内存泄漏');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('系统运行正常，各项指标良好');
    }
    
    return {
      summary: {
        avgResponseTime,
        avgMemoryUsage,
        avgCPUUsage,
        avgErrorRate,
        totalRequests,
        totalErrors,
        uptime
      },
      trends,
      recommendations
    };
  }
  
  /**
   * 分析趋势
   */
  private analyzeTrend(oldValues: number[], recentValues: number[]): 'improving' | 'stable' | 'degrading' {
    if (oldValues.length === 0 || recentValues.length === 0) {
      return 'stable';
    }
    
    const oldAvg = oldValues.reduce((sum, v) => sum + v, 0) / oldValues.length;
    const recentAvg = recentValues.reduce((sum, v) => sum + v, 0) / recentValues.length;
    
    const changePercent = ((recentAvg - oldAvg) / oldAvg) * 100;
    
    if (changePercent < -10) {
      return 'improving';
    } else if (changePercent > 10) {
      return 'degrading';
    } else {
      return 'stable';
    }
  }
}

/**
 * 创建全局性能监控器实例
 */
let globalMonitor: PerformanceMonitor | null = null;

export function getPerformanceMonitor(config?: Partial<MonitorConfig>): PerformanceMonitor {
  if (!globalMonitor) {
    globalMonitor = new PerformanceMonitor(config);
  }
  return globalMonitor;
}

/**
 * Express/Next.js中间件
 */
export function performanceMiddleware() {
  return (req: any, res: any, next: any) => {
    const monitor = getPerformanceMonitor();
    const startTime = Date.now();
    const endpoint = `${req.method} ${req.path}`;
    
    monitor.startTimer(endpoint);
    
    // 监听响应结束
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const success = res.statusCode < 400;
      
      monitor.endTimer(endpoint);
      monitor.recordRequest(endpoint, success, duration);
    });
    
    next();
  };
}

/**
 * 性能装饰器
 */
export function monitored(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = async function(...args: any[]) {
    const monitor = getPerformanceMonitor();
    const methodName = `${target.constructor.name}.${propertyKey}`;
    
    monitor.startTimer(methodName);
    
    try {
      const result = await originalMethod.apply(this, args);
      monitor.endTimer(methodName, { status: 'success' });
      return result;
    } catch (error) {
      monitor.endTimer(methodName, { status: 'error' });
      throw error;
    }
  };
  
  return descriptor;
}