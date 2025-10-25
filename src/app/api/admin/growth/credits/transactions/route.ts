import { withAdminAuth } from '@/lib/middleware/adminAuth';
import { prisma } from '@/lib/prisma';
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

    // 构建查询条件
    const where: any = {};
    if (type) where.type = type;
    if (userId) where.userId = userId;

    // 获取交易记录
    const [transactions, total] = await Promise.all([
      prisma.creditTransaction.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              credits: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.creditTransaction.count({ where }),
    ]);

    // 计算统计数据
    const stats = await prisma.creditTransaction.aggregate({
      _sum: { amount: true },
      _count: true,
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayStats = await prisma.creditTransaction.aggregate({
      where: {
        createdAt: { gte: today },
      },
      _sum: { amount: true },
      _count: true,
    });

    // 获取今日签到数
    const todaySignins = await prisma.checkIn.count({
      where: {
        checkInDate: today,
      },
    });

    // 获取7日活跃用户数
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeUsers7d = await prisma.user.count({
      where: {
        creditTransactions: {
          some: {
            createdAt: { gte: sevenDaysAgo },
          },
        },
      },
    });

    // 获取平均余额
    const avgBalance = await prisma.user.aggregate({
      _avg: { credits: true },
    });

    // 格式化交易记录
    const formattedTransactions = transactions.map(
      (t: (typeof transactions)[number]) => ({
        id: t.id,
        userId: t.userId,
        userName: t.user.name || 'Unknown',
        userEmail: t.user.email || '',
        type: t.type,
        amount: t.amount,
        balance: t.user.credits,
        description: t.description || '',
        metadata: t.metadata,
        createdAt: t.createdAt.toISOString(),
      })
    );

    return NextResponse.json({
      transactions: formattedTransactions,
      stats: {
        totalUsers: await prisma.user.count(),
        totalCreditsIssued: stats._sum.amount || 0,
        totalCreditsSpent: 0, // TODO: 计算消费总额
        averageBalance: Math.round(avgBalance._avg.credits || 0),
        todaySignins,
        activeUsers7d,
        todayTransactions: todayStats._count || 0,
        todayAmount: todayStats._sum.amount || 0,
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
