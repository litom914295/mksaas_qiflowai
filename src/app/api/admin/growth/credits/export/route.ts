import { prisma } from '@/lib/db/prisma';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * 导出积分数据为CSV
 */
export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'transactions';

    if (type === 'transactions') {
      // 导出交易记录
      const transactions = await prisma.creditTransaction.findMany({
        include: {
          user: {
            select: {
              name: true,
              email: true,
              credits: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10000, // 限制导出数量
      });

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

      const csvRows = transactions.map((t: (typeof transactions)[number]) => [
        t.id,
        t.userId,
        t.user.name || '',
        t.user.email || '',
        t.type,
        t.amount,
        t.user.credits,
        t.description || '',
        t.createdAt.toISOString(),
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
      // 导出用户积分
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          credits: true,
          createdAt: true,
          creditTransactions: {
            select: {
              amount: true,
            },
          },
          checkIns: {
            orderBy: { checkInDate: 'desc' },
            take: 1,
            select: {
              consecutiveDays: true,
              checkInDate: true,
            },
          },
        },
        orderBy: { credits: 'desc' },
      });

      // 计算统计数据
      const usersWithStats = users.map((user: (typeof users)[number]) => {
        const totalEarned = user.creditTransactions
          .filter((t: { amount: number }) => t.amount > 0)
          .reduce((sum: number, t: { amount: number }) => sum + t.amount, 0);

        const totalSpent = Math.abs(
          user.creditTransactions
            .filter((t: { amount: number }) => t.amount < 0)
            .reduce((sum: number, t: { amount: number }) => sum + t.amount, 0)
        );

        return {
          id: user.id,
          name: user.name || '',
          email: user.email || '',
          balance: user.credits,
          totalEarned,
          totalSpent,
          signInStreak: user.checkIns[0]?.consecutiveDays || 0,
          lastSignIn: user.checkIns[0]?.checkInDate?.toISOString() || '',
          createdAt: user.createdAt.toISOString(),
        };
      });

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
