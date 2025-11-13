/**
 * 转化追踪系统
 *
 * 记录用户行为和转化漏斗数据
 */

/**
 * 事件类型
 */
export type EventType =
  | 'page_view' // 页面浏览
  | 'report_generated' // 报告生成
  | 'paywall_shown' // Paywall显示
  | 'paywall_dismissed' // Paywall关闭
  | 'payment_initiated' // 发起支付
  | 'payment_completed' // 支付完成
  | 'payment_failed' // 支付失败
  | 'report_unlocked' // 报告解锁
  | 'pdf_downloaded'; // PDF下载

/**
 * 事件数据
 */
export interface TrackingEvent {
  // 基础信息
  eventType: EventType;
  timestamp: Date;

  // 用户标识
  userId?: string;
  sessionId?: string;

  // 事件属性
  properties: Record<string, any>;

  // 实验信息（如果参与了A/B测试）
  experimentId?: string;
  variantId?: string;
}

/**
 * 转化漏斗
 */
export interface ConversionFunnel {
  // 总访问量
  totalViews: number;

  // 生成报告数
  reportsGenerated: number;

  // Paywall展示数
  paywallShown: number;

  // 支付发起数
  paymentInitiated: number;

  // 支付完成数
  paymentCompleted: number;

  // 转化率
  viewToPaywall: number; // 访问→Paywall展示
  paywallToPayment: number; // Paywall→发起支付
  paymentToComplete: number; // 发起支付→完成支付
  overallConversion: number; // 总体转化率
}

/**
 * 转化追踪器
 */
export class ConversionTracker {
  private events: TrackingEvent[] = [];

  /**
   * 追踪事件
   */
  track(
    eventType: EventType,
    properties: Record<string, any> = {},
    context?: {
      userId?: string;
      sessionId?: string;
      experimentId?: string;
      variantId?: string;
    }
  ): void {
    const event: TrackingEvent = {
      eventType,
      timestamp: new Date(),
      properties,
      ...context,
    };

    this.events.push(event);

    // 发送到分析服务（可选）
    this.sendToAnalytics(event);

    console.log(`[Tracking] ${eventType}`, properties);
  }

  /**
   * 获取转化漏斗数据
   */
  getFunnel(filter?: {
    experimentId?: string;
    variantId?: string;
    dateRange?: { start: Date; end: Date };
  }): ConversionFunnel {
    let filteredEvents = this.events;

    // 应用过滤器
    if (filter) {
      if (filter.experimentId) {
        filteredEvents = filteredEvents.filter(
          (e) => e.experimentId === filter.experimentId
        );
      }
      if (filter.variantId) {
        filteredEvents = filteredEvents.filter(
          (e) => e.variantId === filter.variantId
        );
      }
      if (filter.dateRange) {
        filteredEvents = filteredEvents.filter(
          (e) =>
            e.timestamp >= filter.dateRange!.start &&
            e.timestamp <= filter.dateRange!.end
        );
      }
    }

    // 计算各阶段数量
    const totalViews = this.countEvents(filteredEvents, 'page_view');
    const reportsGenerated = this.countEvents(
      filteredEvents,
      'report_generated'
    );
    const paywallShown = this.countEvents(filteredEvents, 'paywall_shown');
    const paymentInitiated = this.countEvents(
      filteredEvents,
      'payment_initiated'
    );
    const paymentCompleted = this.countEvents(
      filteredEvents,
      'payment_completed'
    );

    // 计算转化率
    const viewToPaywall = totalViews > 0 ? paywallShown / totalViews : 0;
    const paywallToPayment =
      paywallShown > 0 ? paymentInitiated / paywallShown : 0;
    const paymentToComplete =
      paymentInitiated > 0 ? paymentCompleted / paymentInitiated : 0;
    const overallConversion =
      totalViews > 0 ? paymentCompleted / totalViews : 0;

    return {
      totalViews,
      reportsGenerated,
      paywallShown,
      paymentInitiated,
      paymentCompleted,
      viewToPaywall: Number((viewToPaywall * 100).toFixed(2)),
      paywallToPayment: Number((paywallToPayment * 100).toFixed(2)),
      paymentToComplete: Number((paymentToComplete * 100).toFixed(2)),
      overallConversion: Number((overallConversion * 100).toFixed(2)),
    };
  }

  /**
   * 获取实验对比数据
   */
  compareVariants(experimentId: string): Map<string, ConversionFunnel> {
    const variantIds = new Set(
      this.events
        .filter((e) => e.experimentId === experimentId && e.variantId)
        .map((e) => e.variantId!)
    );

    const comparison = new Map<string, ConversionFunnel>();

    for (const variantId of variantIds) {
      const funnel = this.getFunnel({ experimentId, variantId });
      comparison.set(variantId, funnel);
    }

    return comparison;
  }

  /**
   * 获取用户旅程
   */
  getUserJourney(userId: string): TrackingEvent[] {
    return this.events
      .filter((e) => e.userId === userId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * 导出数据
   */
  export(): TrackingEvent[] {
    return [...this.events];
  }

  /**
   * 重置数据（仅用于测试）
   */
  reset(): void {
    this.events = [];
  }

  /**
   * 统计事件数量
   */
  private countEvents(events: TrackingEvent[], eventType: EventType): number {
    return events.filter((e) => e.eventType === eventType).length;
  }

  /**
   * 发送到分析服务（占位）
   */
  private sendToAnalytics(event: TrackingEvent): void {
    // TODO: 集成 Google Analytics, Mixpanel 等
    // 示例：
    // if (typeof window !== 'undefined' && window.gtag) {
    //   window.gtag('event', event.eventType, event.properties);
    // }
  }
}

/**
 * 全局追踪器实例
 */
export const globalTracker = new ConversionTracker();

/**
 * 便捷追踪函数
 */
export const track = {
  pageView: (props?: Record<string, any>) =>
    globalTracker.track('page_view', props),

  reportGenerated: (
    reportType: 'basic' | 'essential',
    props?: Record<string, any>
  ) => globalTracker.track('report_generated', { reportType, ...props }),

  paywallShown: (variant: string, props?: Record<string, any>) =>
    globalTracker.track('paywall_shown', { variant, ...props }),

  paywallDismissed: (reason: string, props?: Record<string, any>) =>
    globalTracker.track('paywall_dismissed', { reason, ...props }),

  paymentInitiated: (amount: number, props?: Record<string, any>) =>
    globalTracker.track('payment_initiated', { amount, ...props }),

  paymentCompleted: (
    orderId: string,
    amount: number,
    props?: Record<string, any>
  ) => globalTracker.track('payment_completed', { orderId, amount, ...props }),

  paymentFailed: (errorCode: string, props?: Record<string, any>) =>
    globalTracker.track('payment_failed', { errorCode, ...props }),

  reportUnlocked: (reportId: string, props?: Record<string, any>) =>
    globalTracker.track('report_unlocked', { reportId, ...props }),

  pdfDownloaded: (reportId: string, props?: Record<string, any>) =>
    globalTracker.track('pdf_downloaded', { reportId, ...props }),
};
