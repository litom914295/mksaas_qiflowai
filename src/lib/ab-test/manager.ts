/**
 * A/B 测试管理器
 * 用于实验管理、用户分组和事件追踪
 */

import { createHash } from 'crypto';
import { getDb } from '@/db';
import {
  abTestAssignments,
  abTestEvents,
  abTestExperiments,
} from '@/db/schema';
import { and, eq } from 'drizzle-orm';

export type VariantConfig = {
  id: string;
  weight: number;
  config?: Record<string, any>;
};

export type Experiment = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  variants: VariantConfig[];
  startDate: Date | null;
  endDate: Date | null;
  goalMetric: string | null;
  metadata: Record<string, any> | null;
};

export type Assignment = {
  id: string;
  experimentId: string;
  userId: string;
  variantId: string;
  assignedAt: Date;
};

/**
 * A/B 测试管理器
 */
export class ABTestManager {
  /**
   * 获取用户在实验中的变体
   * 如果用户未分组，自动分配变体
   */
  async getVariant(params: {
    experimentName: string;
    userId: string;
  }): Promise<{
    variantId: string;
    variantConfig?: Record<string, any>;
  } | null> {
    const db = await getDb();
    
    // 1. 获取实验配置
    const [experiment] = await db
      .select()
      .from(abTestExperiments)
      .where(
        and(
          eq(abTestExperiments.name, params.experimentName),
          eq(abTestExperiments.status, 'active')
        )
      )
      .limit(1);

    if (!experiment) {
      console.warn(
        `[ABTest] Experiment not found or inactive: ${params.experimentName}`
      );
      return null;
    }

    // 2. 检查用户是否已分组
    const [existingAssignment] = await db
      .select()
      .from(abTestAssignments)
      .where(
        and(
          eq(abTestAssignments.experimentId, experiment.id),
          eq(abTestAssignments.userId, params.userId)
        )
      )
      .limit(1);

    if (existingAssignment) {
      const variant = (experiment.variants as VariantConfig[]).find(
        (v) => v.id === existingAssignment.variantId
      );
      return {
        variantId: existingAssignment.variantId,
        variantConfig: variant?.config,
      };
    }

    // 3. 分配变体 (哈希分桶)
    const variantId = this.assignVariant(
      params.userId,
      experiment.variants as VariantConfig[]
    );

    // 4. 保存分配记录
    const [assignment] = await db
      .insert(abTestAssignments)
      .values({
        experimentId: experiment.id,
        userId: params.userId,
        variantId,
      })
      .returning();

    console.log(
      `[ABTest] User ${params.userId} assigned to variant ${variantId}`
    );

    const variant = (experiment.variants as VariantConfig[]).find(
      (v) => v.id === variantId
    );
    return {
      variantId,
      variantConfig: variant?.config,
    };
  }

  /**
   * 分配变体 (哈希分桶算法)
   * 确保相同用户始终分配到相同变体
   */
  private assignVariant(userId: string, variants: VariantConfig[]): string {
    // 1. 计算用户 ID 的哈希值
    const hash = createHash('md5').update(userId).digest('hex');
    const hashNum = Number.parseInt(hash.substring(0, 8), 16);

    // 2. 计算总权重
    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);

    // 3. 映射到 0-totalWeight 范围
    const bucket = hashNum % totalWeight;

    // 4. 根据权重分配变体
    let cumulativeWeight = 0;
    for (const variant of variants) {
      cumulativeWeight += variant.weight;
      if (bucket < cumulativeWeight) {
        return variant.id;
      }
    }

    // 默认返回第一个变体
    return variants[0].id;
  }

  /**
   * 追踪事件
   */
  async trackEvent(params: {
    experimentName: string;
    userId: string;
    eventType: string;
    eventData?: Record<string, any>;
  }): Promise<void> {
    const db = await getDb();
    
    try {
      // 1. 获取实验
      const [experiment] = await db
        .select()
        .from(abTestExperiments)
        .where(eq(abTestExperiments.name, params.experimentName))
        .limit(1);

      if (!experiment) {
        console.warn(`[ABTest] Experiment not found: ${params.experimentName}`);
        return;
      }

      // 2. 获取用户分配
      const [assignment] = await db
        .select()
        .from(abTestAssignments)
        .where(
          and(
            eq(abTestAssignments.experimentId, experiment.id),
            eq(abTestAssignments.userId, params.userId)
          )
        )
        .limit(1);

      if (!assignment) {
        console.warn(`[ABTest] No assignment found for user ${params.userId}`);
        return;
      }

      // 3. 记录事件
      await db.insert(abTestEvents).values({
        experimentId: experiment.id,
        assignmentId: assignment.id,
        userId: params.userId,
        eventType: params.eventType,
        eventData: params.eventData || {},
      });

      console.log(
        `[ABTest] Event tracked: ${params.eventType} for user ${params.userId}`
      );
    } catch (error) {
      console.error('[ABTest] Failed to track event:', error);
    }
  }

  /**
   * 检查用户是否已获得实验奖励
   */
  async hasReceivedReward(params: {
    experimentName: string;
    userId: string;
  }): Promise<boolean> {
    const db = await getDb();
    
    const [experiment] = await db
      .select()
      .from(abTestExperiments)
      .where(eq(abTestExperiments.name, params.experimentName))
      .limit(1);

    if (!experiment) return false;

    const [rewardEvent] = await db
      .select()
      .from(abTestEvents)
      .where(
        and(
          eq(abTestEvents.experimentId, experiment.id),
          eq(abTestEvents.userId, params.userId),
          eq(abTestEvents.eventType, 'reward')
        )
      )
      .limit(1);

    return !!rewardEvent;
  }

  /**
   * 获取实验统计数据
   */
  async getExperimentStats(experimentName: string) {
    // TODO: 实现统计查询
    // 返回采纳率、转化率、平均购买金额等指标
    return {
      totalUsers: 0,
      variantStats: [],
    };
  }
}

// 导出单例
export const abTestManager = new ABTestManager();
