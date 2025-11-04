/**
 * 转化追踪工具函数
 * 封装Vercel Analytics事件追踪，用于监测首页优化的转化效果
 */

import { track } from '@vercel/analytics';

// 事件类型定义
export interface HeroCTAEvent {
  variant: 'A' | 'B';
  position: 'above_fold' | 'below_fold';
  cta_text: string;
  cta_type: 'primary' | 'secondary' | 'tertiary';
}

export interface FeatureCardEvent {
  feature: 'bazi' | 'xuankong' | 'ai';
  priority: 'primary' | 'secondary' | 'tertiary';
  from_section: 'grid' | 'comparison' | 'teaser';
}

export interface ScrollDepthEvent {
  depth_percent: number;
  section_reached: string;
}

export interface FormEvent {
  form_type: 'bazi' | 'xuankong' | 'instant_try';
  entry_point: string;
  time_spent_seconds?: number;
}

/**
 * 追踪Hero区域CTA点击
 */
export function trackHeroCTAClick(data: HeroCTAEvent) {
  track('hero_cta_clicked', {
    variant: data.variant,
    position: data.position,
    cta_text: data.cta_text,
    cta_type: data.cta_type,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 追踪功能卡片点击
 */
export function trackFeatureCardClick(data: FeatureCardEvent) {
  track('feature_card_clicked', {
    feature: data.feature,
    priority: data.priority,
    from_section: data.from_section,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 追踪对比表查看
 */
export function trackComparisonTableView(scrollDepth: number) {
  track('comparison_table_viewed', {
    scroll_depth: `${scrollDepth}%`,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 追踪页面滚动深度
 */
export function trackScrollDepth(data: ScrollDepthEvent) {
  track('scroll_depth', {
    depth_percent: data.depth_percent,
    section_reached: data.section_reached,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 追踪表单开始填写
 */
export function trackFormStarted(data: FormEvent) {
  track('form_started', {
    form_type: data.form_type,
    entry_point: data.entry_point,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 追踪表单完成
 */
export function trackFormCompleted(data: FormEvent) {
  track('form_completed', {
    form_type: data.form_type,
    entry_point: data.entry_point,
    ...(data.time_spent_seconds !== undefined && {
      time_spent_seconds: data.time_spent_seconds,
    }),
    timestamp: new Date().toISOString(),
  });
}

/**
 * 追踪社会证明交互（头像墙、实时活动流等）
 */
export function trackSocialProofInteraction(
  element: 'avatar_wall' | 'live_activity' | 'trust_metrics',
  action: 'view' | 'click' | 'hover'
) {
  track('social_proof_interaction', {
    element,
    action,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 追踪信任元素查看
 */
export function trackTrustElementView(
  element: 'expert_testimonial' | 'certification_badge' | 'media_mention'
) {
  track('trust_element_viewed', {
    element,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 追踪即时体验功能使用
 */
export function trackInstantTryUsage(
  action: 'date_selected' | 'result_generated' | 'cta_clicked'
) {
  track('instant_try_usage', {
    action,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 追踪A/B测试变体分配
 */
export function trackABVariantAssigned(
  variant: 'A' | 'B',
  source: 'url' | 'cookie' | 'default'
) {
  track('ab_variant_assigned', {
    variant,
    source,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 批量追踪页面视图（首次加载）
 */
export function trackPageView(
  pathname: string,
  variant: 'A' | 'B',
  referrer?: string
) {
  track('page_view', {
    pathname,
    variant,
    referrer: referrer || document.referrer || 'direct',
    timestamp: new Date().toISOString(),
  });
}

/**
 * 追踪页面停留时间
 */
export function trackTimeOnPage(pathname: string, timeSpentSeconds: number) {
  track('time_on_page', {
    pathname,
    time_spent_seconds: timeSpentSeconds,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 追踪退出意图（即将离开页面）
 */
export function trackExitIntent(
  pathname: string,
  timeSpentSeconds: number,
  scrollDepth: number
) {
  track('exit_intent', {
    pathname,
    time_spent_seconds: timeSpentSeconds,
    scroll_depth: `${scrollDepth}%`,
    timestamp: new Date().toISOString(),
  });
}
