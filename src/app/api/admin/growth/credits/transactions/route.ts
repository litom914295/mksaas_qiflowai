import { getDb } from '@/db';
import { creditTransaction, user, checkIns } from '@/db/schema';
import { eq, gte, sql, desc } from 'drizzle-orm';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * 获取积分交易记录和统计信息
 */
export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const page = Number.parseInt(searchParams.get('page') || '1');
    const limit = Number.parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const userId = searchParams.get('userId');

    const db = await getDb();

    // 构建查询条件
    const conditions = [];
    if (type) conditions.push(eq(creditTransaction.type, type));
    if (userId) conditions.push(eq(creditTransaction.userId, userId));

    // 查询条件
    const whereClause = conditions.length > 0 ? conditions[0] : undefined;

    // 获取交易记录 (关联用户)
    const transactionsQuery = db
      .select({
        id: creditTransaction.id,
        userId: creditTransaction.userId,
        type: creditTransaction.type,
        amount: creditTransaction.amount,
        description: creditTransaction.description,
        createdAt: creditTransaction.createdAt,
        userName: user.name,
        userEmail: user.email,
        userCredits: user.credits,
      })
      .from(creditTransaction)
      .leftJoin(user, eq(creditTransaction.userId, user.id))
      .orderBy(desc(creditTransaction.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    if (whereClause) {
      transactionsQuery.where(whereClause);
    }

    const [transactions, totalResult] = await Promise.all([
      transactionsQuery,
      db
        .select({ count: sql<number>`count(*)` })
        .from(creditTransaction)
        .where(whereClause),
    ]);

    const total = Number(totalResult[0]?.count || 0);

    // 计算统计数据
    const statsResult = await db
      .select({
        totalAmount: sql<number>`sum(${creditTransaction.amount})`,
        totalCount: sql<number>`count(*)`,
      })
      .from(creditTransaction);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayStatsResult = await db
      .select({
        todayAmount: sql<number>`sum(${creditTransaction.amount})`,
        todayCount: sql<number>`count(*)`,
      })
      .from(creditTransaction)
      .where(gte(creditTransaction.createdAt, today));

    // 获取今日签到数
    const todaySigninsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(checkIns)
      .where(gte(checkIns.checkInDate, today));

    const todaySignins = Number(todaySigninsResult[0]?.count || 0);

    // 获取7日活跃用户数 (简化版)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeUsers7dResult = await db
      .select({ count: sql<number>`count(distinct ${creditTransaction.userId})` })
      .from(creditTransaction)
      .where(gte(creditTransaction.createdAt, sevenDaysAgo));

    const activeUsers7d = Number(activeUsers7dResult[0]?.count || 0);

    // 获取用户总数和平均余额
    const userStatsResult = await db
      .select({
        totalUsers: sql<number>`count(*)`,
        avgCredits: sql<number>`avg(COALESCE(${user.credits}, 0))`,
      })
      .from(user);

    const stats = statsResult[0] || { totalAmount: 0, totalCount: 0 };
    const todayStats = todayStatsResult[0] || { todayAmount: 0, todayCount: 0 };
    const userStats = userStatsResult[0] || { totalUsers: 0, avgCredits: 0 };

    // 格式化交易记录
    const formattedTransactions = transactions.map((t) => ({
      id: t.id,
      userId: t.userId,
      userName: t.userName || 'Unknown',
      userEmail: t.userEmail || '',
      type: t.type,
      amount: t.amount,
      balance: t.userCredits || 0,
      description: t.description || '',
      createdAt: t.createdAt?.toISOString(),
    }));

    return NextResponse.json({
      transactions: formattedTransactions,
      stats: {
        totalUsers: Number(userStats.totalUsers || 0),
        totalCreditsIssued: Number(stats.totalAmount || 0),
        totalCreditsSpent: 0, // TODO: 计算消费总额
        averageBalance: Math.round(Number(userStats.avgCredits || 0)),
        todaySignins,
        activeUsers7d,
        todayTransactions: Number(todayStats.todayCount || 0),
        todayAmount: Number(todayStats.todayAmount || 0),
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
});
