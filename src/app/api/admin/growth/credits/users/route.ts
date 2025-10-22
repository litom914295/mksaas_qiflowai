import { getDb } from '@/db';
import { creditTransaction, user, userCredit } from '@/db/schema';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
import { and, desc, eq, gt, lt } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * 获取用户积分列表
 */
export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Number.parseInt(searchParams.get('page') || '1');
    const limit = Number.parseInt(searchParams.get('limit') || '50');
    const db = await getDb();

    console.log(`[管理员接口] 获取用户积分列表, page=${page}, limit=${limit}`);

    // 获取用户列表（使用统一的数据源）
    const usersQuery = db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        // 从 user_credit 表获取真实积分余额
        credits: userCredit.currentCredits,
        updatedAt: userCredit.updatedAt,
      })
      .from(user)
      .leftJoin(userCredit, eq(user.id, userCredit.userId))
      .orderBy(desc(userCredit.currentCredits))
      .limit(limit)
      .offset((page - 1) * limit);

    const usersData = await usersQuery;

    // 获取总用户数
    const totalResult = await db.select({ count: user.id }).from(user);
    const total = totalResult.length;

    // 并行获取每个用户的交易统计
    const userCredits = await Promise.all(
      usersData.map(async (userData) => {
        // 获取用户的收入交易总额
        const earnedResult = await db
          .select({ sum: creditTransaction.amount })
          .from(creditTransaction)
          .where(
            and(
              eq(creditTransaction.userId, userData.id),
              gt(creditTransaction.amount, 0)
            )
          );

        const totalEarned = earnedResult.reduce(
          (sum, row) => sum + (row.sum || 0),
          0
        );

        // 获取用户的支出交易总额（取绝对值）
        const spentResult = await db
          .select({ sum: creditTransaction.amount })
          .from(creditTransaction)
          .where(
            and(
              eq(creditTransaction.userId, userData.id),
              lt(creditTransaction.amount, 0)
            )
          );

        const totalSpent = Math.abs(
          spentResult.reduce((sum, row) => sum + (row.sum || 0), 0)
        );

        return {
          userId: userData.id,
          userName: userData.name || 'Unknown',
          userEmail: userData.email || '',
          balance: userData.credits || 0, // 从 user_credit 表获取的真实余额
          totalEarned,
          totalSpent,
          lastUpdate: userData.updatedAt?.toISOString() || null,
        };
      })
    );

    return NextResponse.json({
      users: userCredits,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching user credits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user credits' },
      { status: 500 }
    );
  }
});
