import { prisma } from '@/lib/prisma';

/**
 * 推荐奖励配置
 */
const REFERRAL_CONFIG = {
  inviterBonus: 50, // 推荐人奖励
  inviteeBonus: 20, // 被推荐人奖励
  milestones: {
    3: 100, // 3人里程碑
    10: 500, // 10人里程碑
    50: 2000, // 50人里程碑
  },
};

/**
 * 激活推荐奖励
 * 当被推荐人完成首次分析时调用
 */
export async function activateReferralReward(userId: string) {
  try {
    return await prisma.$transaction(async (tx) => {
      // 查找该用户的推荐关系
      const referral = await tx.referral.findFirst({
        where: {
          referredId: userId,
          status: 'pending',
        },
        include: {
          referrer: {
            select: {
              id: true,
              name: true,
              email: true,
              successfulInvites: true,
            },
          },
        },
      });

      if (!referral) {
        console.log('No pending referral found for user:', userId);
        return null;
      }

      // 更新推荐状态为已激活
      await tx.referral.update({
        where: { id: referral.id },
        data: {
          status: 'activated',
          activatedAt: new Date(),
          rewardTier: 'basic',
        },
      });

      // 1. 给被推荐人发放奖励
      await tx.creditTransaction.create({
        data: {
          userId: referral.referredId,
          amount: REFERRAL_CONFIG.inviteeBonus,
          type: 'referred_bonus',
          description: `完成首次分析,获得新用户奖励`,
          metadata: {
            referrerId: referral.referrerId,
          },
        },
      });

      await tx.user.update({
        where: { id: referral.referredId },
        data: {
          credits: { increment: REFERRAL_CONFIG.inviteeBonus },
        },
      });

      // 2. 给推荐人发放奖励
      await tx.creditTransaction.create({
        data: {
          userId: referral.referrerId,
          amount: REFERRAL_CONFIG.inviterBonus,
          type: 'referral_bonus',
          description: `成功推荐用户 ${referral.referred?.name || '新用户'}`,
          metadata: {
            referredId: referral.referredId,
          },
        },
      });

      await tx.user.update({
        where: { id: referral.referrerId },
        data: {
          credits: { increment: REFERRAL_CONFIG.inviterBonus },
          successfulInvites: { increment: 1 },
        },
      });

      // 3. 检查推荐人的里程碑奖励
      const newInviteCount = referral.referrer.successfulInvites + 1;
      const milestoneReward =
        REFERRAL_CONFIG.milestones[
          newInviteCount as keyof typeof REFERRAL_CONFIG.milestones
        ];

      if (milestoneReward) {
        // 发放里程碑奖励
        await tx.creditTransaction.create({
          data: {
            userId: referral.referrerId,
            amount: milestoneReward,
            type: 'milestone',
            description: `推荐里程碑奖励: 成功邀请${newInviteCount}人`,
            metadata: {
              milestone: newInviteCount,
              tier: `milestone_${newInviteCount}`,
            },
          },
        });

        await tx.user.update({
          where: { id: referral.referrerId },
          data: {
            credits: { increment: milestoneReward },
          },
        });
      }

      return {
        referral,
        inviteeReward: REFERRAL_CONFIG.inviteeBonus,
        inviterReward: REFERRAL_CONFIG.inviterBonus,
        milestoneReward: milestoneReward || 0,
        newInviteCount,
      };
    });
  } catch (error) {
    console.error('Error activating referral reward:', error);
    throw error;
  }
}

/**
 * 创建推荐关系
 */
export async function createReferral(referrerId: string, referredId: string) {
  try {
    // 检查是否已存在推荐关系
    const existingReferral = await prisma.referral.findFirst({
      where: {
        referredId,
      },
    });

    if (existingReferral) {
      throw new Error('该用户已被推荐过');
    }

    // 不能自己推荐自己
    if (referrerId === referredId) {
      throw new Error('不能推荐自己');
    }

    // 创建推荐关系
    const referral = await prisma.referral.create({
      data: {
        referrerId,
        referredId,
        status: 'pending',
        progress: {},
      },
    });

    // 更新推荐人的总邀请数
    await prisma.user.update({
      where: { id: referrerId },
      data: {
        totalInvites: { increment: 1 },
      },
    });

    return referral;
  } catch (error) {
    console.error('Error creating referral:', error);
    throw error;
  }
}

/**
 * 通过推荐码查找推荐人
 */
export async function findReferrerByCode(referralCode: string) {
  return await prisma.user.findUnique({
    where: { referralCode },
    select: {
      id: true,
      name: true,
      email: true,
      referralCode: true,
    },
  });
}

/**
 * 生成唯一的推荐码
 */
export async function generateReferralCode(userId: string): Promise<string> {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';

  while (true) {
    // 生成6位随机码
    code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // 检查是否已存在
    const existing = await prisma.user.findUnique({
      where: { referralCode: code },
    });

    if (!existing) {
      // 更新用户的推荐码
      await prisma.user.update({
        where: { id: userId },
        data: { referralCode: code },
      });
      break;
    }
  }

  return code;
}
