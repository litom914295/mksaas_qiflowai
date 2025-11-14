/**
 * A/B 测试工具库
 * 
 * 功能：
 * 1. 用户变体分配（基于 userId 或 cookie）
 * 2. Cookie 读写（持久化变体分配）
 * 3. 事件追踪（埋点）
 * 4. Feature Flag 管理
 */

import { cookies } from 'next/headers';

// ===== 类型定义 =====

export type ABVariant = 'control' | 'v2_1';

export interface ABExperiment {
  name: string;
  enabled: boolean;
  variants: ABVariant[];
  splitRatio: number; // 0-100，表示 treatment 占比
}

export interface ABTrackingEvent {
  userId?: string;
  sessionId?: string;
  variant: ABVariant;
  eventName: string;
  timestamp: string;
  properties?: Record<string, any>;
}

// ===== 配置 =====

const AB_EXPERIMENTS: Record<string, ABExperiment> = {
  AB_V21: {
    name: 'AB_V21',
    enabled: process.env.AB_V21_ENABLED === 'true', // 环境变量控制
    variants: ['control', 'v2_1'],
    splitRatio: 50, // 50% treatment (v2_1)
  },
};

const AB_COOKIE_NAME = 'ab_v21';
const AB_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7天

// ===== 核心函数 =====

/**
 * 获取用户的 A/B 变体
 * 
 * 优先级：
 * 1. 环境变量强制指定（调试用）
 * 2. 已有 cookie（用户已被分配）
 * 3. 基于 userId 哈希分配
 * 4. 随机分配并写入 cookie
 * 
 * @param userId - 用户ID（可选）
 * @returns ABVariant
 */
export async function getABVariant(userId?: string): Promise<ABVariant> {
  const experiment = AB_EXPERIMENTS.AB_V21;

  // 1. 实验未启用，直接返回 control
  if (!experiment.enabled) {
    return 'control';
  }

  // 2. 环境变量强制指定（调试用）
  const forceVariant = process.env.AB_V21_FORCE_VARIANT as ABVariant | undefined;
  if (forceVariant && experiment.variants.includes(forceVariant)) {
    return forceVariant;
  }

  // 3. 检查 cookie（用户已被分配）
  const cookieStore = await cookies();
  const existingVariant = (await cookieStore.get(AB_COOKIE_NAME))?.value as ABVariant | undefined;
  if (existingVariant && experiment.variants.includes(existingVariant)) {
    return existingVariant;
  }

  // 4. 基于 userId 哈希分配
  let variant: ABVariant;
  if (userId) {
    const hash = hashUserId(userId);
    variant = hash % 100 < experiment.splitRatio ? 'v2_1' : 'control';
  } else {
    // 5. 随机分配
    variant = Math.random() * 100 < experiment.splitRatio ? 'v2_1' : 'control';
  }

  // 6. 写入 cookie（持久化）
  await cookieStore.set(AB_COOKIE_NAME, variant, {
    maxAge: AB_COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });

  return variant;
}

/**
 * 用户ID哈希函数
 * 
 * 使用简单的哈希算法（DJB2）确保相同 userId 总是分配到相同变体
 * 
 * @param userId - 用户ID
 * @returns 哈希值（0-99）
 */
function hashUserId(userId: string): number {
  let hash = 5381;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 33) ^ userId.charCodeAt(i);
  }
  return Math.abs(hash) % 100;
}

/**
 * 手动设置用户变体（用于测试或人工指定）
 * 
 * @param variant - 变体名称
 */
export async function setABVariant(variant: ABVariant): Promise<void> {
  const cookieStore = await cookies();
  await cookieStore.set(AB_COOKIE_NAME, variant, {
    maxAge: AB_COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });
}

/**
 * 清除用户变体（用于测试）
 */
export async function clearABVariant(): Promise<void> {
  const cookieStore = await cookies();
  await cookieStore.delete(AB_COOKIE_NAME);
}

// ===== 事件追踪 =====

/**
 * 追踪 A/B 测试事件
 * 
 * @param eventName - 事件名称（如 'report_generated'）
 * @param properties - 事件属性（如 { durationMs: 1200, jsonOk: true }）
 * @param userId - 用户ID（可选）
 * @param variant - 变体（可选，如不提供则自动获取）
 */
export async function trackABEvent(
  eventName: string,
  properties?: Record<string, any>,
  userId?: string,
  variant?: ABVariant
): Promise<void> {
  // 如果未提供 variant，自动获取
  const finalVariant = variant || (await getABVariant(userId));

  const event: ABTrackingEvent = {
    userId,
    sessionId: generateSessionId(),
    variant: finalVariant,
    eventName,
    timestamp: new Date().toISOString(),
    properties,
  };

  // TODO: 接入实际埋点系统
  // 目前先打印到控制台/日志
  console.log('[AB_TRACKING]', JSON.stringify(event));

  // 可选：写入数据库或发送到分析平台
  // await sendToAnalytics(event);
}

/**
 * 生成会话ID（简单实现）
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ===== 便捷函数 =====

/**
 * 判断当前用户是否在 v2.1 变体中
 * 
 * @param userId - 用户ID（可选）
 * @returns boolean
 */
export async function isV21Variant(userId?: string): Promise<boolean> {
  const variant = await getABVariant(userId);
  return variant === 'v2_1';
}

/**
 * 根据变体选择报告生成函数
 * 
 * @param variant - 变体名称
 * @returns 'v2.0' | 'v2.1'
 */
export function getReportVersion(variant: ABVariant): 'v2.0' | 'v2.1' {
  return variant === 'v2_1' ? 'v2.1' : 'v2.0';
}

// ===== 导出 =====

export { AB_EXPERIMENTS, AB_COOKIE_NAME };
