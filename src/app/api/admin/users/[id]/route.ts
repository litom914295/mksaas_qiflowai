import { getDb } from '@/db';
import {
  baziCalculations,
  creditTransaction,
  referralRelationships,
  user,
  userCredit,
} from '@/db/schema';
import { verifyAuth } from '@/lib/auth/verify';
import { desc, eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

// 获取用户详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUserId = await verifyAuth(request);
    if (!adminUserId) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const userId = params.id;
    const db = await getDb();

    // 获取用户基本信息
    const userInfo = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!userInfo.length) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    // 获取积分信息
    const creditInfo = await db
      .select()
      .from(userCredit)
      .where(eq(userCredit.userId, userId))
      .limit(1);

    // 获取积分交易历史 (最近20条)
    const transactions = await db
      .select()
      .from(creditTransaction)
      .where(eq(creditTransaction.userId, userId))
      .orderBy(desc(creditTransaction.createdAt))
      .limit(20);

    // 获取分析历史 (最近10条)
    const analyses = await db
      .select({
        id: baziCalculations.id,
        createdAt: baziCalculations.createdAt,
      })
      .from(baziCalculations)
      .where(eq(baziCalculations.userId, userId))
      .orderBy(desc(baziCalculations.createdAt))
      .limit(10);

    // 获取推荐关系 (作为推荐人)
    const referralsGiven = await db
      .select({
        id: referralRelationships.id,
        refereeId: referralRelationships.refereeId,
        status: referralRelationships.status,
        createdAt: referralRelationships.createdAt,
        refereeName: user.name,
        refereeEmail: user.email,
      })
      .from(referralRelationships)
      .leftJoin(user, eq(referralRelationships.refereeId, user.id))
      .where(eq(referralRelationships.referrerId, userId))
      .limit(10);

    // 获取推荐关系 (被推荐)
    const referralsReceived = await db
      .select({
        id: referralRelationships.id,
        referrerId: referralRelationships.referrerId,
        status: referralRelationships.status,
        createdAt: referralRelationships.createdAt,
        referrerName: user.name,
        referrerEmail: user.email,
      })
      .from(referralRelationships)
      .leftJoin(user, eq(referralRelationships.referrerId, user.id))
      .where(eq(referralRelationships.refereeId, userId))
      .limit(1);

    return NextResponse.json({
      success: true,
      data: {
        user: userInfo[0],
        credit: creditInfo[0] || null,
        transactions,
        analyses,
        referrals: {
          given: referralsGiven,
          received: referralsReceived[0] || null,
        },
      },
    });
  } catch (error) {
    console.error('获取用户详情失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取数据失败',
      },
      { status: 500 }
    );
  }
}
