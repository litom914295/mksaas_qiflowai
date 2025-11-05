import { getDb } from '@/db';
import { checkIns, creditTransaction, user } from '@/db/schema';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
import { desc, eq, sql } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * 导出积分数据为CSV
 */
export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'transactions';

    const db = await getDb();

    if (type === 'transactions') {
      // 导出交易记录 (关联用户)
      const transactions = await db
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
        .limit(10000); // 限制导出数量

      // 转换为CSV格式
      const csvHeaders = [
        'ID',
        '用户ID',
        '用户名',
        '用户邮箱',
        '交易类型',
        '金额',
        '当前余额',
        '说明',
        '创建时间',
      ];

      const csvRows = transactions.map((t) => [
        t.id,
        t.userId,
        t.userName || '',
        t.userEmail || '',
        t.type,
        t.amount,
        t.userCredits || 0,
        t.description || '',
        t.createdAt?.toISOString() || '',
      ]);

      const csv = [csvHeaders, ...csvRows]
        .map((row) => row.map((cell: string | number) => `"${cell}"`).join(','))
        .join('\n');

      // 添加BOM以支持Excel打开中文
      const bom = '\uFEFF';
      const blob = bom + csv;

      return new NextResponse(blob, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="credit_transactions_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    if (type === 'users') {
      // 导出用户积分 (简化版 - 不包含交易统计)
      const users = await db
        .select()
        .from(user)
        .orderBy(desc(user.createdAt))
        .limit(10000);

      // 计算统计数据 (简化版)
      const usersWithStats = users.map((u) => ({
        id: u.id,
        name: u.name || '',
        email: u.email || '',
        balance: u.credits || 0,
        totalEarned: 0, // TODO: 需要分别查询
        totalSpent: 0, // TODO: 需要分别查询
        signInStreak: 0, // TODO: 需要关联 checkIns
        lastSignIn: '',
        createdAt: u.createdAt?.toISOString() || '',
      }));

      // 转换为CSV格式
      const csvHeaders = [
        'ID',
        '用户名',
        '邮箱',
        '当前余额',
        '累计获得',
        '累计消费',
        '连续签到',
        '最后签到',
        '注册时间',
      ];

      const csvRows = usersWithStats.map(
        (u: (typeof usersWithStats)[number]) => [
          u.id,
          u.name,
          u.email,
          u.balance,
          u.totalEarned,
          u.totalSpent,
          u.signInStreak,
          u.lastSignIn,
          u.createdAt,
        ]
      );

      const csv = [csvHeaders, ...csvRows]
        .map((row) => row.map((cell: string | number) => `"${cell}"`).join(','))
        .join('\n');

      // 添加BOM
      const bom = '\uFEFF';
      const blob = bom + csv;

      return new NextResponse(blob, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="credit_users_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid export type' }, { status: 400 });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
});
