'use server';

import { getDb } from '@/db';
import { payment } from '@/db/schema';
import { findPlanByPriceId } from '@/lib/price-plan';
import { PaymentTypes } from '@/payment/types';
import { and, desc, eq, or } from 'drizzle-orm';

/**
 * 用户计划信息
 */
export interface UserPlan {
  type: 'LIFETIME' | 'SUBSCRIPTION' | 'FREE';
  planId?: string;
  planName?: string;
  priceId?: string;
  status?: string;
  periodStart?: Date;
  periodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
}

/**
 * 获取用户的当前计划信息
 * @param userId 用户ID
 * @returns 用户计划信息，如果没有付费计划则返回 null
 */
export async function getUserPlan(userId: string): Promise<UserPlan | null> {
  try {
    const db = await getDb();

    // 查询用户的支付记录，按创建时间倒序
    const payments = await db
      .select({
        id: payment.id,
        priceId: payment.priceId,
        type: payment.type,
        status: payment.status,
        periodStart: payment.periodStart,
        periodEnd: payment.periodEnd,
        cancelAtPeriodEnd: payment.cancelAtPeriodEnd,
        createdAt: payment.createdAt,
      })
      .from(payment)
      .where(
        and(
          eq(payment.userId, userId),
          or(eq(payment.status, 'active'), eq(payment.status, 'completed'))
        )
      )
      .orderBy(desc(payment.createdAt))
      .limit(10);

    if (payments.length === 0) {
      return null;
    }

    // 优先检查终身会员（ONE_TIME 且 completed 状态）
    const lifetimePayment = payments.find(
      (p) => p.type === PaymentTypes.ONE_TIME && p.status === 'completed'
    );

    if (lifetimePayment) {
      const plan = findPlanByPriceId(lifetimePayment.priceId);
      if (plan && plan.isLifetime) {
        return {
          type: 'LIFETIME',
          planId: plan.id,
          planName: plan.name,
          priceId: lifetimePayment.priceId,
          status: lifetimePayment.status,
        };
      }
    }

    // 检查订阅会员（SUBSCRIPTION 且 active 状态）
    const subscriptionPayment = payments.find(
      (p) => p.type === PaymentTypes.SUBSCRIPTION && p.status === 'active'
    );

    if (subscriptionPayment) {
      const plan = findPlanByPriceId(subscriptionPayment.priceId);
      return {
        type: 'SUBSCRIPTION',
        planId: plan?.id,
        planName: plan?.name,
        priceId: subscriptionPayment.priceId,
        status: subscriptionPayment.status,
        periodStart: subscriptionPayment.periodStart ?? undefined,
        periodEnd: subscriptionPayment.periodEnd ?? undefined,
        cancelAtPeriodEnd: subscriptionPayment.cancelAtPeriodEnd ?? undefined,
      };
    }

    // 没有有效的付费计划
    return null;
  } catch (error) {
    console.error('Failed to get user plan:', error);
    return null;
  }
}

/**
 * 检查用户是否是终身会员
 * @param userId 用户ID
 * @returns 是否是终身会员
 */
export async function isLifetimeMember(userId: string): Promise<boolean> {
  const plan = await getUserPlan(userId);
  return plan?.type === 'LIFETIME';
}

/**
 * 检查用户是否有活跃订阅
 * @param userId 用户ID
 * @returns 是否有活跃订阅
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const plan = await getUserPlan(userId);
  return plan?.type === 'SUBSCRIPTION' && plan?.status === 'active';
}

/**
 * 获取用户等级显示名称
 * @param userId 用户ID
 * @returns 用户等级名称
 */
export async function getUserLevelName(userId: string): Promise<string> {
  const plan = await getUserPlan(userId);

  if (!plan) {
    return '免费会员';
  }

  if (plan.type === 'LIFETIME') {
    return '终身会员';
  }

  if (plan.type === 'SUBSCRIPTION') {
    const planName = plan.planName?.toLowerCase() || '';
    if (planName.includes('pro')) {
      return 'Pro 会员';
    }
    return '订阅会员';
  }

  return '免费会员';
}
