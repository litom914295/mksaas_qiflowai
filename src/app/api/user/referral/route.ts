import { getDb } from '@/db';
import { creditTransaction, referralCodes, referrals, user } from '@/db/schema';
import { verifyAuth } from '@/lib/auth';
import { generateReferralCode } from '@/lib/services/referral';
import { eq, inArray, sql } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * 获取用户的推荐信息
 */
export async function GET(request: NextRequest) {
  try {
    const { authenticated, userId } = await verifyAuth(
      request as unknown as Request
    );
    if (!authenticated || !userId) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const db = await getDb();

    // 获取用户信息
    const userResult = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    const currentUser = userResult[0];

    // 获取用户的推荐码
    const referralCodeResult = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.userId, userId))
      .limit(1);

    // 如果没有推荐码,生成一个
    let referralCode =
      referralCodeResult.length > 0 ? referralCodeResult[0].code : null;
    if (!referralCode) {
      referralCode = await generateReferralCode(userId);
    }

    // 获取推荐关系列表
    const referralsList = await db
      .select({
        id: referrals.id,
        status: referrals.status,
        createdAt: referrals.createdAt,
        activatedAt: referrals.activatedAt,
        referredId: referrals.referredId,
      })
      .from(referrals)
      .where(eq(referrals.referrerId, userId))
      .orderBy(sql`${referrals.createdAt} DESC`);

    // 获取被推荐用户信息
    const referredUserIds = referralsList.map((r) => r.referredId);
    const referredUsers =
      referredUserIds.length > 0
        ? await db
            .select({
              id: user.id,
              name: user.name,
              email: user.email,
              createdAt: user.createdAt,
            })
            .from(user)
            .where(inArray(user.id, referredUserIds))
        : [];

    // 创建用户 map 以便快速查找
    const userMap = new Map(referredUsers.map((u) => [u.id, u]));

    // 计算已获得的推荐奖励
    const referralRewardsResult = await db
      .select({ total: sql<number>`sum(${creditTransaction.amount})` })
      .from(creditTransaction)
      .where(
        sql`${creditTransaction.userId} = ${userId} AND ${creditTransaction.type} IN ('referral_bonus', 'milestone')`
      );

    return NextResponse.json({
      success: true,
      data: {
        referralCode,
        referralLink: `${process.env.NEXT_PUBLIC_APP_URL}/register?ref=${referralCode}`,
        totalInvites: referralsList.length,
        successfulInvites: referralsList.filter((r) => r.status === 'activated')
          .length,
        totalRewards: Number(referralRewardsResult[0]?.total || 0),
        referrals: referralsList.map((r) => {
          const referredUser = userMap.get(r.referredId);
          return {
            id: r.id,
            status: r.status,
            userName: referredUser?.name || '新用户',
            createdAt: r.createdAt?.toISOString(),
            activatedAt: r.activatedAt?.toISOString(),
          };
        }),
      },
    });
  } catch (error) {
    console.error('Get referral info error:', error);
    return NextResponse.json({ error: '获取推荐信息失败' }, { status: 500 });
  }
}
