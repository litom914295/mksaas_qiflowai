'use server';

import { CREDIT_TRANSACTION_TYPE } from '@/credits/types';
import { db } from '@/db';
import { creditTransaction, users } from '@/db/schema';
import { abTestManager } from '@/lib/ab-test/manager';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';

/**
 * 领取 A/B 测试参与奖励
 */
export async function claimABTestRewardAction(params: {
  experimentName: string;
}): Promise<{ success: boolean; error?: string; creditsEarned?: number }> {
  try {
    // 1. 验证用户登录
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: '未登录' };
    }

    const userId = session.user.id;

    // 2. 检查用户是否已领取过该实验奖励
    const hasReceived = await abTestManager.hasReceivedReward({
      experimentName: params.experimentName,
      userId,
    });

    if (hasReceived) {
      return { success: false, error: '您已领取过该实验的奖励' };
    }

    // 3. 获取实验配置中的奖励金额
    const variant = await abTestManager.getVariant({
      experimentName: params.experimentName,
      userId,
    });

    if (!variant) {
      return { success: false, error: '实验不存在或未激活' };
    }

    // 默认奖励 10 积分
    const rewardAmount = 10;

    // 4. 发放积分
    await db
      .update(users)
      .set({
        credits: db.$increment(users.credits, rewardAmount),
      })
      .where(eq(users.id, userId));

    // 5. 记录积分交易
    await db.insert(creditTransaction).values({
      userId,
      type: CREDIT_TRANSACTION_TYPE.AB_TEST_BONUS,
      amount: rewardAmount,
      description: `参与 A/B 测试奖励: ${params.experimentName}`,
      metadata: {
        experimentName: params.experimentName,
        variantId: variant.variantId,
      },
    });

    // 6. 追踪奖励事件
    await abTestManager.trackEvent({
      experimentName: params.experimentName,
      userId,
      eventType: 'reward',
      eventData: {
        creditsEarned: rewardAmount,
      },
    });

    console.log(
      `[Reward] User ${userId} earned ${rewardAmount} credits from experiment ${params.experimentName}`
    );

    return {
      success: true,
      creditsEarned: rewardAmount,
    };
  } catch (error) {
    console.error('[Reward] Error claiming reward:', error);
    return {
      success: false,
      error: '领取奖励失败，请稍后重试',
    };
  }
}
