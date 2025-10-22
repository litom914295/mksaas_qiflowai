// 数据分析追踪系统
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// Google Analytics配置
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX';

// 页面浏览事件
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// 自定义事件追踪
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// 转化漏斗追踪
export class ConversionFunnel {
  private static instance: ConversionFunnel;
  private funnelSteps: Map<string, any> = new Map();
  private sessionId: string;

  private constructor() {
    this.sessionId = this.generateSessionId();
  }

  static getInstance(): ConversionFunnel {
    if (!ConversionFunnel.instance) {
      ConversionFunnel.instance = new ConversionFunnel();
    }
    return ConversionFunnel.instance;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 记录漏斗步骤
  trackStep(step: string, data?: any) {
    const timestamp = new Date().toISOString();
    this.funnelSteps.set(step, {
      timestamp,
      data,
      sessionId: this.sessionId,
    });

    // 发送到Google Analytics
    event({
      action: 'funnel_step',
      category: 'Conversion',
      label: step,
      value: this.funnelSteps.size,
    });

    // 发送到自定义后端
    this.sendToBackend('funnel', {
      step,
      timestamp,
      sessionId: this.sessionId,
      data,
    });
  }

  // 获取漏斗数据
  getFunnelData() {
    return Array.from(this.funnelSteps.entries()).map(([step, data]) => ({
      step,
      ...data,
    }));
  }

  // 清除漏斗数据
  clearFunnel() {
    this.funnelSteps.clear();
    this.sessionId = this.generateSessionId();
  }

  // 发送数据到后端
  private async sendToBackend(type: string, data: any) {
    try {
      // TODO: 实现实际的后端API
      console.log(`Analytics [${type}]:`, data);

      // 示例API调用
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ type, data })
      // });
    } catch (error) {
      console.error('Failed to send analytics:', error);
    }
  }
}

// 用户行为追踪
export class UserBehaviorTracker {
  private static instance: UserBehaviorTracker;
  private events: any[] = [];
  private startTime: number;

  private constructor() {
    this.startTime = Date.now();
    this.setupEventListeners();
  }

  static getInstance(): UserBehaviorTracker {
    if (!UserBehaviorTracker.instance) {
      UserBehaviorTracker.instance = new UserBehaviorTracker();
    }
    return UserBehaviorTracker.instance;
  }

  private setupEventListeners() {
    if (typeof window === 'undefined') return;

    // 追踪页面停留时间
    window.addEventListener('beforeunload', () => {
      const duration = Date.now() - this.startTime;
      this.track('page_exit', { duration });
    });

    // 追踪滚动深度
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollPercentage =
        (window.scrollY /
          (document.documentElement.scrollHeight - window.innerHeight)) *
        100;
      if (scrollPercentage > maxScroll) {
        maxScroll = scrollPercentage;
        if (maxScroll >= 25 && maxScroll < 50) {
          this.track('scroll_depth', { depth: '25%' });
        } else if (maxScroll >= 50 && maxScroll < 75) {
          this.track('scroll_depth', { depth: '50%' });
        } else if (maxScroll >= 75 && maxScroll < 100) {
          this.track('scroll_depth', { depth: '75%' });
        } else if (maxScroll >= 100) {
          this.track('scroll_depth', { depth: '100%' });
        }
      }
    });

    // 追踪点击热图
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const data = {
        tagName: target.tagName,
        className: target.className,
        id: target.id,
        text: target.innerText?.substring(0, 50),
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now(),
      };
      this.track('click', data);
    });
  }

  track(eventType: string, data?: any) {
    const eventData = {
      type: eventType,
      data,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    this.events.push(eventData);

    // 批量发送（每10个事件或5秒）
    if (this.events.length >= 10) {
      this.flush();
    }
  }

  private flush() {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    // 发送到分析后端
    fetch('/api/analytics/behavior', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: eventsToSend }),
    }).catch(console.error);
  }

  getEvents() {
    return this.events;
  }
}

// 性能监控
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // 监控页面加载性能
  measurePageLoad() {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming;

        const metrics = {
          // Core Web Vitals
          FCP: perfData.responseEnd - perfData.requestStart,
          LCP: 0, // 需要使用PerformanceObserver
          CLS: 0, // 需要使用PerformanceObserver
          FID: 0, // 需要使用PerformanceObserver
          TTFB: perfData.responseStart - perfData.requestStart,

          // 其他指标
          domContentLoaded:
            perfData.domContentLoadedEventEnd -
            perfData.domContentLoadedEventStart,
          loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
          domInteractive: perfData.domInteractive - perfData.fetchStart,

          // 资源加载
          dnsTime: perfData.domainLookupEnd - perfData.domainLookupStart,
          tcpTime: perfData.connectEnd - perfData.connectStart,
          requestTime: perfData.responseEnd - perfData.requestStart,
        };

        console.log('Performance Metrics:', metrics);

        // 发送到Google Analytics
        Object.entries(metrics).forEach(([key, value]) => {
          event({
            action: 'timing_complete',
            category: 'Performance',
            label: key,
            value: Math.round(value),
          });
        });
      }, 0);
    });

    // 监控Core Web Vitals
    this.observeCoreWebVitals();
  }

  private observeCoreWebVitals() {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    // LCP (Largest Contentful Paint)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        const lcp =
          (lastEntry as any).renderTime || (lastEntry as any).loadTime;

        event({
          action: 'web_vitals',
          category: 'Performance',
          label: 'LCP',
          value: Math.round(lcp),
        });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.error('LCP Observer failed:', e);
    }

    // FID (First Input Delay)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fid = (entry as any).processingStart - (entry as any).startTime;

          event({
            action: 'web_vitals',
            category: 'Performance',
            label: 'FID',
            value: Math.round(fid),
          });
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.error('FID Observer failed:', e);
    }

    // CLS (Cumulative Layout Shift)
    let clsValue = 0;
    try {
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }

        event({
          action: 'web_vitals',
          category: 'Performance',
          label: 'CLS',
          value: Math.round(clsValue * 1000), // 转换为更易读的数值
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.error('CLS Observer failed:', e);
    }
  }
}

// 错误追踪
export class ErrorTracker {
  private static instance: ErrorTracker;
  private errors: any[] = [];

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
      ErrorTracker.instance.setupErrorHandlers();
    }
    return ErrorTracker.instance;
  }

  private setupErrorHandlers() {
    if (typeof window === 'undefined') return;

    // 捕获JavaScript错误
    window.addEventListener('error', (event) => {
      this.trackError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    });

    // 捕获Promise错误
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        type: 'promise',
        reason: event.reason,
        promise: event.promise,
      });
    });
  }

  trackError(error: any) {
    this.errors.push({
      ...error,
      timestamp: new Date().toISOString(),
      url: window?.location?.href,
      userAgent: navigator?.userAgent,
    });

    // 发送到Google Analytics
    event({
      action: 'exception',
      category: 'Error',
      label: error.message || error.reason,
      value: 1,
    });

    // 发送到后端
    this.sendToBackend(error);
  }

  private async sendToBackend(error: any) {
    try {
      // TODO: 实现实际的错误报告API
      console.error('Error tracked:', error);

      // await fetch('/api/analytics/error', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(error)
      // });
    } catch (e) {
      console.error('Failed to send error:', e);
    }
  }

  getErrors() {
    return this.errors;
  }
}
