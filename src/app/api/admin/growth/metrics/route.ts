import { getDb } from '@/db';
import {
  baziCalculations,
  creditTransaction,
  referralRelationships,
  shareRecords,
  user,
  userCredit,
} from '@/db/schema';
import { verifyAuth } from '@/lib/auth/verify';
import { and, count, eq, gte, lt, sql } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

// 增长指标API - 真实数据版本
export async function GET(request: NextRequest) {
  try {
    // 验证权限
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const dateRange = searchParams.get('dateRange') || '7d';
    const type = searchParams.get('type') || 'summary';

    const db = await getDb();

    // 计算真实指标
    const metrics = {
      summary: {
        kFactor: await calculateKFactor(db),
        activationRate: await calculateActivationRate(db),
        retentionRate: await calculateRetentionRate(db),
        shareStats: await calculateShareStats(db),
        creditsStats: await calculateCreditsStats(db),
        fraudStats: await calculateFraudStats(db),
      },
      detailed: {
        timeline: await generateRealTimelineData(db, dateRange),
        userSegments: await calculateUserSegments(db),
      },
    };

    return NextResponse.json({
      success: true,
      data: type === 'summary' ? metrics.summary : metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching growth metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

// K因子计算 (病毒系数)
async function calculateKFactor(db: any) {
  const totalUsers = await db.select({ count: count() }).from(user);
  const totalReferrals = await db
    .select({ count: count() })
    .from(referralRelationships);
  const activatedReferrals = await db
    .select({ count: count() })
    .from(referralRelationships)
    .where(eq(referralRelationships.status, 'activated'));

  const userCount = Number(totalUsers[0]?.count || 0);
  const referralCount = Number(totalReferrals[0]?.count || 0);
  const activatedCount = Number(activatedReferrals[0]?.count || 0);

  const invitationRate = userCount > 0 ? referralCount / userCount : 0;
  const conversionRate = referralCount > 0 ? activatedCount / referralCount : 0;
  const averageInvites = userCount > 0 ? referralCount / userCount : 0;
  const kFactorValue = invitationRate * conversionRate * (averageInvites || 1);

  return {
    value: Number(kFactorValue.toFixed(2)),
    trend: 0, // TODO: 需要历史数据对比
    breakdown: {
      invitationRate: Number(invitationRate.toFixed(2)),
      conversionRate: Number(conversionRate.toFixed(2)),
      averageInvites: Number(averageInvites.toFixed(1)),
    },
  };
}

// 激活率计算
async function calculateActivationRate(db: any) {
  const totalUsers = await db.select({ count: count() }).from(user);
  const usersWithAnalysis = await db
    .selectDistinct({ userId: baziCalculations.userId })
    .from(baziCalculations);

  const total = Number(totalUsers[0]?.count || 0);
  const activated = usersWithAnalysis.length;
  const activationRate = total > 0 ? activated / total : 0;

  return {
    value: Number(activationRate.toFixed(2)),
    trend: 0, // TODO: 需要历史数据对比
    total,
    activated,
  };
}

// 留存率计算
async function calculateRetentionRate(db: any) {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // D1用户: 注册于1天前的用户
  const d1Users = await db
    .select({ id: user.id })
    .from(user)
    .where(
      and(
        gte(user.createdAt, oneDayAgo),
        lt(user.createdAt, new Date(oneDayAgo.getTime() + 24 * 60 * 60 * 1000))
      )
    );

  // D1活跃用户: 这些用户在注册后24小时内有过分析行为
  const d1ActiveUsers =
    d1Users.length > 0
      ? await db
          .selectDistinct({ userId: baziCalculations.userId })
          .from(baziCalculations)
          .where(
            and(
              sql`${baziCalculations.userId} IN (${sql.join(
                d1Users.map((u: any) => sql`${u.id}`),
                sql`, `
              )})`,
              gte(baziCalculations.createdAt, oneDayAgo)
            )
          )
      : [];

  const d1Retention =
    d1Users.length > 0 ? d1ActiveUsers.length / d1Users.length : 0;

  return {
    d1: Number(d1Retention.toFixed(2)),
    d7: 0, // 简化版本,仅计算D1
    d30: 0, // 简化版本,仅计算D1
    trend: 0,
  };
}

// 分享统计
async function calculateShareStats(db: any) {
  const totalShares = await db.select({ count: count() }).from(shareRecords);
  const uniqueSharers = await db
    .selectDistinct({ userId: shareRecords.userId })
    .from(shareRecords);
  const rewardedShares = await db
    .select({ count: count() })
    .from(shareRecords)
    .where(eq(shareRecords.rewardGranted, true));

  const total = Number(totalShares[0]?.count || 0);
  const rewarded = Number(rewardedShares[0]?.count || 0);

  return {
    totalShares: total,
    uniqueSharers: uniqueSharers.length,
    shareConversion: total > 0 ? Number((rewarded / total).toFixed(2)) : 0,
    trend: 0,
  };
}

// 积分统计
async function calculateCreditsStats(db: any) {
  const transactions = await db
    .select({
      totalIn: sql<number>`COALESCE(SUM(CASE WHEN ${creditTransaction.amount} > 0 THEN ${creditTransaction.amount} ELSE 0 END), 0)`,
      totalOut: sql<number>`COALESCE(SUM(CASE WHEN ${creditTransaction.amount} < 0 THEN ABS(${creditTransaction.amount}) ELSE 0 END), 0)`,
    })
    .from(creditTransaction);

  const usersWithCredits = await db
    .select({
      count: count(),
      avgBalance: sql<number>`AVG(${userCredit.currentCredits})`,
    })
    .from(userCredit)
    .where(sql`${userCredit.currentCredits} > 0`);

  return {
    totalDistributed: Number(transactions[0]?.totalIn || 0),
    totalRedeemed: Number(transactions[0]?.totalOut || 0),
    averageBalance: Number(
      Number(usersWithCredits[0]?.avgBalance || 0).toFixed(0)
    ),
    activeUsers: Number(usersWithCredits[0]?.count || 0),
  };
}

// 风控统计 (简化版本)
async function calculateFraudStats(db: any) {
  return {
    blockedUsers: 0, // TODO: 需要黑名单表
    fraudAttempts: 0, // TODO: 需要风控日志表
    preventionRate: 0,
    falsePositiveRate: 0,
  };
}

// 生成真实时间线数据
async function generateRealTimelineData(db: any, range: string) {
  const days = range === '30d' ? 30 : range === '14d' ? 14 : 7;
  const data = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const startOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    // 新用户数
    const newUsers = await db
      .select({ count: count() })
      .from(user)
      .where(
        and(gte(user.createdAt, startOfDay), lt(user.createdAt, endOfDay))
      );

    // 推荐数
    const referrals = await db
      .select({ count: count() })
      .from(referralRelationships)
      .where(
        and(
          gte(referralRelationships.createdAt, startOfDay),
          lt(referralRelationships.createdAt, endOfDay)
        )
      );

    // 分享数
    const shares = await db
      .select({ count: count() })
      .from(shareRecords)
      .where(
        and(
          gte(shareRecords.createdAt, startOfDay),
          lt(shareRecords.createdAt, endOfDay)
        )
      );

    data.push({
      date: startOfDay.toISOString().split('T')[0],
      newUsers: Number(newUsers[0]?.count || 0),
      referrals: Number(referrals[0]?.count || 0),
      shares: Number(shares[0]?.count || 0),
    });
  }

  return data;
}

// 用户分层
async function calculateUserSegments(db: any) {
  // 基于积分余额和活跃度进行简单分层
  const usersWithCredits = await db
    .select({
      userId: userCredit.userId,
      credits: userCredit.currentCredits,
    })
    .from(userCredit);

  const highValue = usersWithCredits.filter((u: any) => u.credits >= 1000).length;
  const active = usersWithCredits.filter(
    (u: any) => u.credits >= 100 && u.credits < 1000
  ).length;
  const normal = usersWithCredits.filter(
    (u: any) => u.credits > 0 && u.credits < 100
  ).length;
  const dormant = usersWithCredits.filter((u: any) => u.credits === 0).length;

  return [
    { segment: '高价值用户', count: highValue, avgLTV: 1000 },
    { segment: '活跃用户', count: active, avgLTV: 500 },
    { segment: '普通用户', count: normal, avgLTV: 50 },
    { segment: '休眠用户', count: dormant, avgLTV: 0 },
  ];
}
