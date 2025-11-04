import { getDb } from '@/db';
import { referrals, user, creditTransaction, referralCodes } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

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
    const db = await getDb();
    
    return await db.transaction(async (tx) => {
      // 查找该用户的推荐关系
      const referralResult = await tx
        .select()
        .from(referrals)
        .where(
          and(
            eq(referrals.referredId, userId),
            eq(referrals.status, 'pending')
          )
        )
        .limit(1);

      if (referralResult.length === 0) {
        console.log('No pending referral found for user:', userId);
        return null;
      }

      const referral = referralResult[0];

      // 查询推荐人信息（包含 successfulInvites）
      const referrerResult = await tx
        .select()
        .from(user)
        .where(eq(user.id, referral.referrerId))
        .limit(1);

      if (referrerResult.length === 0) {
        console.log('Referrer not found:', referral.referrerId);
        return null;
      }

      const referrer = referrerResult[0];

      // 更新推荐状态为已激活
      await tx
        .update(referrals)
        .set({
          status: 'activated',
          activatedAt: new Date(),
          rewardTier: 'basic',
        })
        .where(eq(referrals.id, referral.id));

      // 1. 给被推荐人发放奖励
      await tx.insert(creditTransaction).values({
        userId: referral.referredId,
        amount: REFERRAL_CONFIG.inviteeBonus,
        type: 'referred_bonus',
        description: `完成首次分析,获得新用户奖励`,
      });

      await tx
        .update(user)
        .set({
          credits: sql`COALESCE(${user.credits}, 0) + ${REFERRAL_CONFIG.inviteeBonus}`,
        })
        .where(eq(user.id, referral.referredId));

      // 2. 给推荐人发放奖励
      await tx.insert(creditTransaction).values({
        userId: referral.referrerId,
        amount: REFERRAL_CONFIG.inviterBonus,
        type: 'referral_bonus',
        description: `成功推荐用户（ID: ${referral.referredId}）`,
      });

      await tx
        .update(user)
        .set({
          credits: sql`COALESCE(${user.credits}, 0) + ${REFERRAL_CONFIG.inviterBonus}`,
        })
        .where(eq(user.id, referral.referrerId));

      // 注意: user 表需要添加 successfulInvites, totalInvites 字段
      // 如果 schema 中没有这些字段，这部分需要调整

      // 3. 检查推荐人的里程碑奖励
      const newInviteCount = (referrer.successfulInvites || 0) + 1;
      const milestoneReward =
        REFERRAL_CONFIG.milestones[
          newInviteCount as keyof typeof REFERRAL_CONFIG.milestones
        ];

      if (milestoneReward) {
        // 发放里程碑奖励
        await tx.insert(creditTransaction).values({
          userId: referral.referrerId,
          amount: milestoneReward,
          type: 'milestone',
          description: `推荐里程碑奖励: 成功邀请${newInviteCount}人`,
        });

        await tx
          .update(user)
          .set({
            credits: sql`COALESCE(${user.credits}, 0) + ${milestoneReward}`,
          })
          .where(eq(user.id, referral.referrerId));
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
    const db = await getDb();
    
    // 检查是否已存在推荐关系
    const existingReferral = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referredId, referredId))
      .limit(1);

    if (existingReferral.length > 0) {
      throw new Error('该用户已被推荐过');
    }

    // 不能自己推荐自己
    if (referrerId === referredId) {
      throw new Error('不能推荐自己');
    }

    // 创建推荐关系
    const result = await db
      .insert(referrals)
      .values({
        referrerId,
        referredId,
        status: 'pending',
        progress: {},
        createdAt: new Date(),
      })
      .returning();

    // 注意: 更新 totalInvites 需要 user 表有这个字段
    // 如果没有，需要补充到 schema 中

    return result[0];
  } catch (error) {
    console.error('Error creating referral:', error);
    throw error;
  }
}

/**
 * 通过推荐码查找推荐人
 */
export async function findReferrerByCode(referralCode: string) {
  const db = await getDb();
  const result = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      referralCode: referralCodes.code,
    })
    .from(user)
    .leftJoin(referralCodes, eq(referralCodes.userId, user.id))
    .where(eq(referralCodes.code, referralCode))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * 生成唯一的推荐码
 */
export async function generateReferralCode(userId: string): Promise<string> {
  const db = await getDb();
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';

  while (true) {
    // 生成6位随机码
    code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // 检查是否已存在
    const existing = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.code, code))
      .limit(1);

    if (existing.length === 0) {
      // 创建推荐码
      await db.insert(referralCodes).values({
        userId,
        code,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      break;
    }
  }

  return code;
}
