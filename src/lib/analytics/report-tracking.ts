/**
 * 专业报告v2.0数据埋点系统
 *
 * 跟踪指标：
 * 1. 报告生成次数（按版本v1.0/v2.0）
 * 2. 阅读时长（总时长 + 各章节停留时间）
 * 3. 章节停留比例（热力图数据）
 * 4. 付费转化漏斗（免费→付费）
 * 5. 用户反馈（5星评分 + NPS）
 *
 * 用于A/B测试分析（v1.0 vs v2.0）
 */

// ===== 类型定义 =====

/**
 * 报告版本
 */
export type ReportVersion = 'v1.0' | 'v2.0';

/**
 * 报告生成事件
 */
export interface ReportGeneratedEvent {
  eventType: 'report_generated';
  timestamp: number; // Unix timestamp
  version: ReportVersion;
  userId: string;
  reportId: string;
  generationTimeMs: number; // 生成耗时（毫秒）
  isSuccess: boolean;
  errorType?: string; // 错误类型（如果失败）

  // 报告元数据
  metadata: {
    patternType: string; // 格局类型
    lifeThemeType?: string; // 人生主题类型（v2.0）
    hasAttribution?: boolean; // 是否包含归因分解（v2.0）
    hasHopeTimeline?: boolean; // 是否包含希望时间线（v2.0）
  };
}

/**
 * 章节类型（v2.0）
 */
export type ChapterType =
  | 'summary' // 摘要
  | 'lifeTheme' // 人生主题故事
  | 'patternAnalysis' // 格局分析
  | 'domainAnalysis' // 六大领域
  | 'attribution' // 归因分解
  | 'hopeTimeline' // 希望之光
  | 'actionPlan' // 行动清单
  | 'fengshuiChecklist' // 风水Checklist
  | 'decisionWindows' // 决策时间窗口
  | 'appendix'; // 附录

/**
 * 章节阅读事件
 */
export interface ChapterReadEvent {
  eventType: 'chapter_read';
  timestamp: number;
  version: ReportVersion;
  userId: string;
  reportId: string;
  chapterType: ChapterType;
  durationMs: number; // 该章节停留时长（毫秒）
  scrollDepth: number; // 滚动深度（0-100%）
  isCompleted: boolean; // 是否读完该章节
}

/**
 * 报告阅读会话
 */
export interface ReportReadingSession {
  eventType: 'reading_session';
  timestamp: number;
  version: ReportVersion;
  userId: string;
  reportId: string;

  // 会话数据
  totalDurationMs: number; // 总阅读时长
  chaptersRead: ChapterType[]; // 阅读过的章节
  completionRate: number; // 完成率（0-100%）

  // 章节停留时间分布
  chapterDurations: Record<ChapterType, number>;

  // 行为数据
  scrollDepthMax: number; // 最大滚动深度
  bounceRate: boolean; // 是否跳出（<30秒离开）
}

/**
 * 付费转化事件
 */
export interface ConversionEvent {
  eventType: 'conversion';
  timestamp: number;
  version: ReportVersion;
  userId: string;
  reportId: string;

  // 转化数据
  stage:
    | 'view_free'
    | 'view_paid_preview'
    | 'click_pay_button'
    | 'payment_success'
    | 'payment_failed';
  amount?: number; // 付费金额（元）
  paymentMethod?: string; // 支付方式

  // 归因数据
  referrer?: string; // 来源渠道
  campaign?: string; // 营销活动
  readingTimeBeforeConversion?: number; // 转化前阅读时长
}

/**
 * 用户反馈事件
 */
export interface FeedbackEvent {
  eventType: 'feedback';
  timestamp: number;
  version: ReportVersion;
  userId: string;
  reportId: string;

  // 评分数据
  rating: number; // 1-5星
  npsScore?: number; // NPS评分（0-10）

  // 维度评分
  dimensions?: {
    accuracy: number; // 准确性（1-5）
    actionability: number; // 可执行性（1-5）
    empathy: number; // 共鸣度（1-5）
    hope: number; // 希望感（1-5）
  };

  // 开放反馈
  comment?: string;
  tags?: string[]; // 标签（如"有帮助"、"太抽象"等）
}

// ===== 埋点工具函数 =====

/**
 * 记录报告生成事件
 */
export function trackReportGenerated(params: {
  version: ReportVersion;
  userId: string;
  reportId: string;
  generationTimeMs: number;
  isSuccess: boolean;
  errorType?: string;
  metadata: ReportGeneratedEvent['metadata'];
}): ReportGeneratedEvent {
  const event: ReportGeneratedEvent = {
    eventType: 'report_generated',
    timestamp: Date.now(),
    ...params,
  };

  // 发送到分析服务
  sendToAnalytics(event);

  return event;
}

/**
 * 记录章节阅读事件
 */
export function trackChapterRead(params: {
  version: ReportVersion;
  userId: string;
  reportId: string;
  chapterType: ChapterType;
  durationMs: number;
  scrollDepth: number;
  isCompleted: boolean;
}): ChapterReadEvent {
  const event: ChapterReadEvent = {
    eventType: 'chapter_read',
    timestamp: Date.now(),
    ...params,
  };

  sendToAnalytics(event);

  return event;
}

/**
 * 记录阅读会话结束
 */
export function trackReadingSessionEnd(params: {
  version: ReportVersion;
  userId: string;
  reportId: string;
  totalDurationMs: number;
  chaptersRead: ChapterType[];
  completionRate: number;
  chapterDurations: Record<ChapterType, number>;
  scrollDepthMax: number;
  bounceRate: boolean;
}): ReportReadingSession {
  const event: ReportReadingSession = {
    eventType: 'reading_session',
    timestamp: Date.now(),
    ...params,
  };

  sendToAnalytics(event);

  return event;
}

/**
 * 记录付费转化事件
 */
export function trackConversion(params: {
  version: ReportVersion;
  userId: string;
  reportId: string;
  stage: ConversionEvent['stage'];
  amount?: number;
  paymentMethod?: string;
  referrer?: string;
  campaign?: string;
  readingTimeBeforeConversion?: number;
}): ConversionEvent {
  const event: ConversionEvent = {
    eventType: 'conversion',
    timestamp: Date.now(),
    ...params,
  };

  sendToAnalytics(event);

  return event;
}

/**
 * 记录用户反馈
 */
export function trackFeedback(params: {
  version: ReportVersion;
  userId: string;
  reportId: string;
  rating: number;
  npsScore?: number;
  dimensions?: FeedbackEvent['dimensions'];
  comment?: string;
  tags?: string[];
}): FeedbackEvent {
  const event: FeedbackEvent = {
    eventType: 'feedback',
    timestamp: Date.now(),
    ...params,
  };

  sendToAnalytics(event);

  return event;
}

// ===== 分析服务接口 =====

/**
 * 发送事件到分析服务
 * （实际项目中接入 Google Analytics / Mixpanel / 自建埋点系统）
 */
function sendToAnalytics(event: any): void {
  // TODO: 实际实现时替换为真实的分析服务
  // 例如：
  // - Google Analytics 4 (gtag.js)
  // - Mixpanel (mixpanel.track)
  // - 自建埋点系统（POST /api/analytics/track）

  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    // 浏览器环境 + 生产环境
    console.log('[Analytics]', event.eventType, event);

    // 示例：发送到自建API
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    }).catch((err) => console.error('[Analytics] Failed to send event:', err));
  } else {
    // 开发环境：仅打印日志
    console.log('[Analytics] [DEV]', event.eventType, event);
  }
}

// ===== A/B测试辅助函数 =====

/**
 * 计算转化率
 */
export function calculateConversionRate(params: {
  totalViews: number;
  totalConversions: number;
}): number {
  if (params.totalViews === 0) return 0;
  return (params.totalConversions / params.totalViews) * 100;
}

/**
 * 计算ARPU（Average Revenue Per User）
 */
export function calculateARPU(params: {
  totalRevenue: number;
  totalUsers: number;
}): number {
  if (params.totalUsers === 0) return 0;
  return params.totalRevenue / params.totalUsers;
}

/**
 * 计算满意度
 */
export function calculateSatisfaction(params: {
  ratings: number[]; // 1-5星评分数组
}): number {
  if (params.ratings.length === 0) return 0;

  const sum = params.ratings.reduce((acc, rating) => acc + rating, 0);
  const avg = sum / params.ratings.length;

  // 转换为百分比（5星 = 100%）
  return (avg / 5) * 100;
}

/**
 * 计算NPS（Net Promoter Score）
 */
export function calculateNPS(params: {
  npsScores: number[]; // 0-10评分数组
}): number {
  if (params.npsScores.length === 0) return 0;

  let promoters = 0; // 9-10分
  let detractors = 0; // 0-6分

  params.npsScores.forEach((score) => {
    if (score >= 9) {
      promoters++;
    } else if (score <= 6) {
      detractors++;
    }
  });

  const promotersRate = (promoters / params.npsScores.length) * 100;
  const detractorsRate = (detractors / params.npsScores.length) * 100;

  return promotersRate - detractorsRate;
}

// ===== 导出所有类型和函数 =====
// 说明：为避免重复导出冲突，移除二次导出声明。请从本模块顶部或具体导出位置按需导入类型。
