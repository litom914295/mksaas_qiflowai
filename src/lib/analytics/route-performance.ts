/**
 * 路由性能监控工具
 *
 * 用于追踪和分析路由切换的性能指标
 */

export interface RoutePerformanceMetrics {
  from: string;
  to: string;
  locale: string;
  duration: number;
  timestamp: number;
  userAgent?: string;
  device?: 'desktop' | 'mobile' | 'tablet';
  connection?: string;
}

export interface NavigationTiming {
  route: string;
  loadTime: number;
  domContentLoaded: number;
  domComplete: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  timeToInteractive?: number;
}

class RoutePerformanceTracker {
  private metrics: RoutePerformanceMetrics[] = [];
  private navigationTimings: NavigationTiming[] = [];
  private previousRoute = '';
  private navigationStartTime = 0;
  private maxMetricsStored = 50; // 最多存储50条记录

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  /**
   * 初始化监控
   */
  private initialize() {
    // 监听路由变化
    this.setupRouteChangeListener();

    // 监听性能指标
    this.setupPerformanceObserver();

    // 记录初始路由
    this.previousRoute = window.location.pathname;
  }

  /**
   * 设置路由变化监听器
   */
  private setupRouteChangeListener() {
    // 对于 Next.js App Router，我们可以监听 popstate 事件
    window.addEventListener('popstate', () => {
      this.trackRouteChange(window.location.pathname);
    });

    // 拦截 pushState 和 replaceState
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.trackRouteChange(window.location.pathname);
    };

    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      this.trackRouteChange(window.location.pathname);
    };
  }

  /**
   * 设置性能观察器
   */
  private setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      try {
        // 观察导航时间
        const navObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navTiming = entry as PerformanceNavigationTiming;
              this.recordNavigationTiming({
                route: window.location.pathname,
                loadTime: navTiming.loadEventEnd - navTiming.fetchStart,
                domContentLoaded:
                  navTiming.domContentLoadedEventEnd - navTiming.fetchStart,
                domComplete: navTiming.domComplete - navTiming.fetchStart,
              });
            }
          }
        });
        navObserver.observe({ entryTypes: ['navigation'] });

        // 观察 Paint 时间
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-paint') {
              this.updateNavigationTiming('firstPaint', entry.startTime);
            }
            if (entry.name === 'first-contentful-paint') {
              this.updateNavigationTiming(
                'firstContentfulPaint',
                entry.startTime
              );
            }
          }
        });
        paintObserver.observe({ entryTypes: ['paint'] });

        // 观察 LCP (Largest Contentful Paint)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry;
          if (lastEntry) {
            this.updateNavigationTiming(
              'largestContentfulPaint',
              lastEntry.startTime
            );
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (error) {
        console.warn('Performance Observer setup failed:', error);
      }
    }
  }

  /**
   * 追踪路由变化
   */
  private trackRouteChange(newRoute: string) {
    if (this.previousRoute === newRoute) return;

    const endTime = performance.now();
    const duration = this.navigationStartTime
      ? endTime - this.navigationStartTime
      : 0;

    const metric: RoutePerformanceMetrics = {
      from: this.previousRoute,
      to: newRoute,
      locale: this.extractLocale(newRoute),
      duration,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      device: this.detectDevice(),
      connection: this.getConnectionType(),
    };

    this.addMetric(metric);

    // 发送到分析服务（如果配置了）
    this.sendToAnalytics(metric);

    // 更新状态
    this.previousRoute = newRoute;
    this.navigationStartTime = performance.now();
  }

  /**
   * 记录导航时间
   */
  private recordNavigationTiming(timing: NavigationTiming) {
    this.navigationTimings.push(timing);
    if (this.navigationTimings.length > this.maxMetricsStored) {
      this.navigationTimings.shift();
    }
  }

  /**
   * 更新导航时间的特定指标
   */
  private updateNavigationTiming(
    metric: keyof NavigationTiming,
    value: number
  ) {
    const latestTiming =
      this.navigationTimings[this.navigationTimings.length - 1];
    if (latestTiming) {
      (latestTiming as any)[metric] = value;
    }
  }

  /**
   * 添加性能指标
   */
  private addMetric(metric: RoutePerformanceMetrics) {
    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetricsStored) {
      this.metrics.shift();
    }
  }

  /**
   * 从路径中提取 locale
   */
  private extractLocale(pathname: string): string {
    const match = pathname.match(/^\/(zh-CN|en)/);
    return match ? match[1] : 'unknown';
  }

  /**
   * 检测设备类型
   */
  private detectDevice(): 'desktop' | 'mobile' | 'tablet' {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (
      /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
        ua
      )
    ) {
      return 'mobile';
    }
    return 'desktop';
  }

  /**
   * 获取网络连接类型
   */
  private getConnectionType(): string {
    const nav = navigator as any;
    if (nav.connection) {
      return nav.connection.effectiveType || nav.connection.type || 'unknown';
    }
    return 'unknown';
  }

  /**
   * 发送数据到分析服务
   */
  private async sendToAnalytics(metric: RoutePerformanceMetrics) {
    // 这里可以集成 Google Analytics, Mixpanel, 或自定义分析服务

    // 示例：Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'route_change', {
        from_route: metric.from,
        to_route: metric.to,
        locale: metric.locale,
        duration: metric.duration,
        device: metric.device,
        connection: metric.connection,
      });
    }

    // 示例：发送到自定义API
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      try {
        await fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metric),
        });
      } catch (error) {
        console.warn('Failed to send analytics:', error);
      }
    }
  }

  /**
   * 获取所有性能指标
   */
  public getMetrics(): RoutePerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * 获取导航时间
   */
  public getNavigationTimings(): NavigationTiming[] {
    return [...this.navigationTimings];
  }

  /**
   * 获取平均路由切换时间
   */
  public getAverageRouteDuration(): number {
    if (this.metrics.length === 0) return 0;
    const total = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    return total / this.metrics.length;
  }

  /**
   * 获取特定 locale 的性能统计
   */
  public getLocaleStats(locale: string) {
    const localeMetrics = this.metrics.filter((m) => m.locale === locale);
    if (localeMetrics.length === 0) {
      return {
        count: 0,
        avgDuration: 0,
        minDuration: 0,
        maxDuration: 0,
      };
    }

    const durations = localeMetrics.map((m) => m.duration);
    return {
      count: localeMetrics.length,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
    };
  }

  /**
   * 获取慢速路由（超过阈值的路由）
   */
  public getSlowRoutes(thresholdMs = 1000): RoutePerformanceMetrics[] {
    return this.metrics.filter((m) => m.duration > thresholdMs);
  }

  /**
   * 清除所有指标
   */
  public clearMetrics() {
    this.metrics = [];
    this.navigationTimings = [];
  }

  /**
   * 导出指标为 JSON
   */
  public exportMetrics(): string {
    return JSON.stringify(
      {
        metrics: this.metrics,
        navigationTimings: this.navigationTimings,
        stats: {
          totalRouteChanges: this.metrics.length,
          averageDuration: this.getAverageRouteDuration(),
          localeStats: {
            'zh-CN': this.getLocaleStats('zh-CN'),
            en: this.getLocaleStats('en'),
          },
          slowRoutes: this.getSlowRoutes(),
        },
      },
      null,
      2
    );
  }
}

// 创建全局单例实例
let tracker: RoutePerformanceTracker | null = null;

export function getRoutePerformanceTracker(): RoutePerformanceTracker {
  if (typeof window === 'undefined') {
    // 服务端返回一个空的实现
    return {
      getMetrics: () => [],
      getNavigationTimings: () => [],
      getAverageRouteDuration: () => 0,
      getLocaleStats: () => ({
        count: 0,
        avgDuration: 0,
        minDuration: 0,
        maxDuration: 0,
      }),
      getSlowRoutes: () => [],
      clearMetrics: () => {},
      exportMetrics: () => '{}',
    } as RoutePerformanceTracker;
  }

  if (!tracker) {
    tracker = new RoutePerformanceTracker();
  }
  return tracker;
}

/**
 * React Hook 用于访问性能追踪器
 */
export function useRoutePerformance() {
  return getRoutePerformanceTracker();
}
