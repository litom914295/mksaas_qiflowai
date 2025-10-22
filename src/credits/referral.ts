import { randomUUID } from 'crypto';
import { getDb } from '@/db';
import { creditTransaction, userCredit } from '@/db/schema';
import { and, eq, sql } from 'drizzle-orm';
import { addCredits } from './credits';

// 新增积分交易类型
export enum REFERRAL_CREDIT_TYPE {
  REFERRAL_REWARD = 'REFERRAL_REWARD', // 推荐人奖励
  REFEREE_BONUS = 'REFEREE_BONUS', // 被推荐人奖励
  SHARE_REWARD = 'SHARE_REWARD', // 分享奖励
  TASK_COMPLETE = 'TASK_COMPLETE', // 任务完成
  ACHIEVEMENT_UNLOCK = 'ACHIEVEMENT_UNLOCK', // 成就解锁
  MILESTONE_REWARD = 'MILESTONE_REWARD', // 里程碑奖励
}

// 推荐奖励配置
export const referralConfig = {
  // 直接推荐奖励
  directReferral: {
    referrer: 30, // 推荐人获得30积分
    referee: 20, // 新用户额外获得20积分(总计70)
    maxDaily: 5, // 每日最多5个有效推荐
    expireDays: 30, // 积分30天后过期
  },
  // 间接推荐奖励(二级)
  indirectReferral: {
    referrer: 10, // 间接推荐人获得10积分
    enabled: true, // 开启二级奖励
    expireDays: 30,
  },
  // 里程碑奖励
  milestones: [
    { count: 3, reward: 50, name: '初级推广大使' },
    { count: 10, reward: 200, name: '中级推广大使' },
    { count: 30, reward: 500, name: '高级推广大使' },
    { count: 100, reward: 2000, name: '超级推广大使' },
  ],
  // 分享奖励
  shareRewards: {
    dailyFortune: 5,
    baziAnalysis: 10,
    fengshuiTips: 10,
    achievement: 15,
    maxDailyShares: 3,
  },
};

/**
 * 生成唯一推荐码
 */
export async function generateReferralCode(): Promise<string> {
  const db = await getDb();
  let code: string;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    // 生成 QF + 4位随机数字
    const randomNum = Math.floor(Math.random() * 10000);
    code = `QF${randomNum.toString().padStart(4, '0')}`;

    // 检查是否已存在
    const existing = (await db.execute(
      sql`SELECT 1 FROM referral_codes WHERE code = ${code} LIMIT 1`
    )) as any[];

    if (!existing || existing.length === 0) {
      return code;
    }

    attempts++;
  } while (attempts < maxAttempts);

  // 如果尝试失败，使用UUID的一部分
  return `QF${randomUUID().substring(0, 4).toUpperCase()}`;
}

/**
 * 为用户创建推荐码
 */
export async function createUserReferralCode(userId: string) {
  const db = await getDb();

  // 检查是否已有推荐码
  const existing = (await db.execute(
    sql`SELECT code FROM referral_codes WHERE user_id = ${userId} LIMIT 1`
  )) as any[];

  if (existing && existing.length > 0) {
    return existing[0].code;
  }

  // 生成新推荐码
  const code = await generateReferralCode();

  await db.execute(sql`
    INSERT INTO referral_codes (id, code, user_id, created_at, updated_at)
    VALUES (${randomUUID()}, ${code}, ${userId}, NOW(), NOW())
  `);

  // 初始化用户统计
  await db.execute(sql`
    INSERT INTO user_referral_stats (id, user_id, created_at, updated_at)
    VALUES (${randomUUID()}, ${userId}, NOW(), NOW())
    ON CONFLICT (user_id) DO NOTHING
  `);

  return code;
}

/**
 * 验证推荐码
 */
export async function validateReferralCode(code: string): Promise<{
  valid: boolean;
  userId?: string;
  message?: string;
}> {
  if (!code || code.length < 4) {
    return { valid: false, message: '无效的推荐码' };
  }

  const db = await getDb();
  const result = (await db.execute(sql`
    SELECT user_id, expire_at, max_usage, usage_count
    FROM referral_codes
    WHERE code = ${code.toUpperCase()}
    LIMIT 1
  `)) as any[];

  if (!result || result.length === 0) {
    return { valid: false, message: '推荐码不存在' };
  }

  const referralCode = result[0];

  // 检查是否过期
  if (referralCode.expire_at && new Date(referralCode.expire_at) < new Date()) {
    return { valid: false, message: '推荐码已过期' };
  }

  // 检查使用次数
  if (
    referralCode.max_usage &&
    referralCode.usage_count >= referralCode.max_usage
  ) {
    return { valid: false, message: '推荐码使用次数已达上限' };
  }

  return { valid: true, userId: referralCode.user_id };
}

/**
 * 处理推荐注册
 */
export async function processReferralRegistration({
  referrerId,
  refereeId,
  referralCode,
}: {
  referrerId: string;
  refereeId: string;
  referralCode: string;
}) {
  const db = await getDb();

  try {
    // 开始事务
    await db.execute(sql`BEGIN`);

    // 1. 创建推荐关系
    await db.execute(sql`
      INSERT INTO referral_relationships 
        (id, referrer_id, referee_id, referral_code, level, status, created_at)
      VALUES 
        (${randomUUID()}, ${referrerId}, ${refereeId}, ${referralCode}, 1, 'active', NOW())
    `);

    // 2. 更新推荐码使用次数
    await db.execute(sql`
      UPDATE referral_codes 
      SET usage_count = usage_count + 1, updated_at = NOW()
      WHERE code = ${referralCode}
    `);

    // 3. 检查今日推荐数量
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayReferrals = (await db.execute(sql`
      SELECT COUNT(*) as count
      FROM referral_relationships
      WHERE referrer_id = ${referrerId}
        AND created_at >= ${today.toISOString()}
        AND reward_granted = true
    `)) as any[];

    const todayCount = todayReferrals[0]?.count || 0;

    // 4. 发放奖励（如果未达到每日上限）
    if (todayCount < referralConfig.directReferral.maxDaily) {
      // 推荐人奖励
      await addCredits({
        userId: referrerId,
        amount: referralConfig.directReferral.referrer,
        type: REFERRAL_CREDIT_TYPE.REFERRAL_REWARD,
        description: '推荐新用户注册奖励',
        expireDays: referralConfig.directReferral.expireDays,
      });

      // 被推荐人额外奖励
      await addCredits({
        userId: refereeId,
        amount: referralConfig.directReferral.referee,
        type: REFERRAL_CREDIT_TYPE.REFEREE_BONUS,
        description: '使用推荐码注册额外奖励',
        expireDays: referralConfig.directReferral.expireDays,
      });

      // 标记奖励已发放
      await db.execute(sql`
        UPDATE referral_relationships 
        SET reward_granted = true, activated_at = NOW()
        WHERE referrer_id = ${referrerId} AND referee_id = ${refereeId}
      `);

      // 5. 更新统计数据
      await db.execute(sql`
        UPDATE user_referral_stats 
        SET 
          direct_referrals = direct_referrals + 1,
          total_referral_rewards = total_referral_rewards + ${referralConfig.directReferral.referrer},
          last_referral_at = NOW(),
          updated_at = NOW()
        WHERE user_id = ${referrerId}
      `);

      // 6. 检查并处理二级推荐奖励
      if (referralConfig.indirectReferral.enabled) {
        await processIndirectReferralReward(referrerId, refereeId);
      }

      // 7. 检查里程碑奖励
      await checkAndGrantMilestoneRewards(referrerId);
    }

    // 提交事务
    await db.execute(sql`COMMIT`);

    return {
      success: true,
      referrerReward:
        todayCount < referralConfig.directReferral.maxDaily
          ? referralConfig.directReferral.referrer
          : 0,
      refereeReward: referralConfig.directReferral.referee,
    };
  } catch (error) {
    // 回滚事务
    await db.execute(sql`ROLLBACK`);
    console.error('processReferralRegistration error:', error);
    throw error;
  }
}

/**
 * 处理二级推荐奖励
 */
async function processIndirectReferralReward(
  directReferrerId: string,
  newUserId: string
) {
  const db = await getDb();

  // 查找直接推荐人的推荐人（二级推荐人）
  const result = (await db.execute(sql`
    SELECT referrer_id 
    FROM referral_relationships
    WHERE referee_id = ${directReferrerId}
      AND status = 'active'
    LIMIT 1
  `)) as any[];

  if (result && result.length > 0) {
    const indirectReferrerId = result[0].referrer_id;

    // 创建二级推荐关系
    await db.execute(sql`
      INSERT INTO referral_relationships 
        (id, referrer_id, referee_id, level, status, created_at)
      VALUES 
        (${randomUUID()}, ${indirectReferrerId}, ${newUserId}, 2, 'active', NOW())
      ON CONFLICT DO NOTHING
    `);

    // 发放二级推荐奖励
    await addCredits({
      userId: indirectReferrerId,
      amount: referralConfig.indirectReferral.referrer,
      type: REFERRAL_CREDIT_TYPE.REFERRAL_REWARD,
      description: '二级推荐奖励',
      expireDays: referralConfig.indirectReferral.expireDays,
    });

    // 更新统计
    await db.execute(sql`
      UPDATE user_referral_stats 
      SET 
        indirect_referrals = indirect_referrals + 1,
        total_referral_rewards = total_referral_rewards + ${referralConfig.indirectReferral.referrer},
        updated_at = NOW()
      WHERE user_id = ${indirectReferrerId}
    `);
  }
}

/**
 * 检查并发放里程碑奖励
 */
async function checkAndGrantMilestoneRewards(userId: string) {
  const db = await getDb();

  // 获取用户当前推荐数
  const stats = (await db.execute(sql`
    SELECT direct_referrals, referral_level
    FROM user_referral_stats
    WHERE user_id = ${userId}
    LIMIT 1
  `)) as any[];

  if (!stats || stats.length === 0) return;

  const directReferrals = stats[0].direct_referrals;
  const currentLevel = stats[0].referral_level;

  // 检查每个里程碑
  for (const milestone of referralConfig.milestones) {
    if (directReferrals >= milestone.count) {
      // 检查是否已经获得过这个里程碑
      const achieved = (await db.execute(sql`
        SELECT 1 FROM achievements
        WHERE user_id = ${userId}
          AND achievement_id = ${'referral_milestone_' + milestone.count}
        LIMIT 1
      `)) as any[];

      if (!achieved || achieved.length === 0) {
        // 发放里程碑奖励
        await addCredits({
          userId,
          amount: milestone.reward,
          type: REFERRAL_CREDIT_TYPE.MILESTONE_REWARD,
          description: `达成推荐里程碑：${milestone.name}`,
          expireDays: 60, // 里程碑奖励60天有效
        });

        // 记录成就
        await db.execute(sql`
          INSERT INTO achievements 
            (id, user_id, achievement_id, achievement_name, reward_amount, unlocked_at)
          VALUES 
            (${randomUUID()}, ${userId}, ${'referral_milestone_' + milestone.count}, 
             ${milestone.name}, ${milestone.reward}, NOW())
        `);

        // 更新用户等级称号
        if (currentLevel !== milestone.name) {
          await db.execute(sql`
            UPDATE user_referral_stats
            SET referral_level = ${milestone.name}, updated_at = NOW()
            WHERE user_id = ${userId}
          `);
        }
      }
    }
  }
}

/**
 * 获取用户推荐统计
 */
export async function getUserReferralStats(userId: string) {
  const db = await getDb();

  const stats = (await db.execute(sql`
    SELECT 
      urs.*,
      rc.code as referral_code,
      rc.custom_code,
      rc.usage_count,
      rc.total_rewards
    FROM user_referral_stats urs
    LEFT JOIN referral_codes rc ON urs.user_id = rc.user_id
    WHERE urs.user_id = ${userId}
    LIMIT 1
  `)) as any[];

  if (!stats || stats.length === 0) {
    // 初始化统计数据
    await createUserReferralCode(userId);
    return {
      directReferrals: 0,
      indirectReferrals: 0,
      totalReferralRewards: 0,
      referralCode: await createUserReferralCode(userId),
      referralLevel: null,
    };
  }

  return stats[0];
}

/**
 * 记录分享行为
 */
export async function recordShare({
  userId,
  shareType,
  platform,
  shareUrl,
}: {
  userId: string;
  shareType: string;
  platform?: string;
  shareUrl?: string;
}) {
  const db = await getDb();

  // 检查今日分享次数
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayShares = (await db.execute(sql`
    SELECT COUNT(*) as count
    FROM share_records
    WHERE user_id = ${userId}
      AND created_at >= ${today.toISOString()}
      AND reward_granted = true
  `)) as any[];

  const todayCount = todayShares[0]?.count || 0;

  // 记录分享
  const shareId = randomUUID();
  await db.execute(sql`
    INSERT INTO share_records 
      (id, user_id, share_type, platform, share_url, created_at)
    VALUES 
      (${shareId}, ${userId}, ${shareType}, ${platform}, ${shareUrl}, NOW())
  `);

  // 如果未达到每日上限，发放奖励
  if (todayCount < referralConfig.shareRewards.maxDailyShares) {
    const reward =
      referralConfig.shareRewards[
        shareType as keyof typeof referralConfig.shareRewards
      ] || 5;

    if (typeof reward === 'number') {
      await addCredits({
        userId,
        amount: reward,
        type: REFERRAL_CREDIT_TYPE.SHARE_REWARD,
        description: `分享${shareType}获得奖励`,
        expireDays: 7, // 分享奖励7天有效
      });

      // 更新分享记录
      await db.execute(sql`
        UPDATE share_records
        SET reward_granted = true, reward_amount = ${reward}
        WHERE id = ${shareId}
      `);

      // 更新统计
      await db.execute(sql`
        UPDATE user_referral_stats
        SET total_shares = total_shares + 1, updated_at = NOW()
        WHERE user_id = ${userId}
      `);

      return { success: true, reward };
    }
  }

  return { success: true, reward: 0 };
}

/**
 * 获取推荐排行榜
 */
export async function getReferralLeaderboard(limit = 10) {
  const db = await getDb();

  const result = await db.execute(sql`
    SELECT 
      u.id,
      u.name,
      u.image as avatar,
      urs.direct_referrals,
      urs.indirect_referrals,
      urs.total_referral_rewards,
      urs.referral_level,
      RANK() OVER (ORDER BY urs.direct_referrals DESC) as rank
    FROM user_referral_stats urs
    JOIN "user" u ON urs.user_id = u.id
    WHERE urs.direct_referrals > 0
    ORDER BY urs.direct_referrals DESC
    LIMIT ${limit}
  `);

  return result || [];
}
