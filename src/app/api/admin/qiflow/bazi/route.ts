import { getDb } from '@/db';
import { baziCalculations, user } from '@/db/schema';
import { verifyAuth } from '@/lib/auth/verify';
import { and, count, desc, eq, gte, like, or, sql } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 查询参数验证
const querySchema = z.object({
  page: z.string().optional().default('1'),
  pageSize: z.string().optional().default('20'),
  search: z.string().optional(),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

// 获取八字分析记录列表和统计数据
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'list';

    const db = await getDb();

    // 获取统计数据
    if (type === 'stats') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      // 总分析数
      const totalResult = await db
        .select({ count: count() })
        .from(baziCalculations);

      // 今日分析数
      const todayResult = await db
        .select({ count: count() })
        .from(baziCalculations)
        .where(gte(baziCalculations.createdAt, today));

      // 本月分析数
      const thisMonthResult = await db
        .select({ count: count() })
        .from(baziCalculations)
        .where(gte(baziCalculations.createdAt, thisMonth));

      // 上月分析数
      const lastMonthResult = await db
        .select({ count: count() })
        .from(baziCalculations)
        .where(
          and(
            gte(baziCalculations.createdAt, lastMonth),
            gte(baziCalculations.createdAt, thisMonth)
          )
        );

      // 独立用户数
      const uniqueUsersResult = await db
        .selectDistinct({ userId: baziCalculations.userId })
        .from(baziCalculations);

      // 最近7天趋势
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const trendData = await db
        .select({
          date: sql<string>`DATE(${baziCalculations.createdAt})`,
          count: count(),
        })
        .from(baziCalculations)
        .where(gte(baziCalculations.createdAt, sevenDaysAgo))
        .groupBy(sql`DATE(${baziCalculations.createdAt})`)
        .orderBy(sql`DATE(${baziCalculations.createdAt})`);

      const stats = {
        total: totalResult[0]?.count || 0,
        today: todayResult[0]?.count || 0,
        thisMonth: thisMonthResult[0]?.count || 0,
        lastMonth: lastMonthResult[0]?.count || 0,
        uniqueUsers: uniqueUsersResult.length,
        monthlyGrowth:
          lastMonthResult[0]?.count > 0
            ? (
                ((thisMonthResult[0]?.count - lastMonthResult[0]?.count) /
                  lastMonthResult[0]?.count) *
                100
              ).toFixed(1)
            : '0',
        trend: trendData.map((item) => ({
          date: item.date,
          count: item.count,
        })),
      };

      return NextResponse.json({
        success: true,
        data: stats,
      });
    }

    // 获取分析记录列表
    if (type === 'list') {
      const params = querySchema.parse(Object.fromEntries(searchParams));
      const page = Number.parseInt(params.page);
      const pageSize = Number.parseInt(params.pageSize);
      const skip = (page - 1) * pageSize;

      // 构建查询条件
      const conditions: any[] = [];

      // 搜索条件 (用户名或邮箱)
      if (params.search) {
        conditions.push(
          or(
            like(user.email, `%${params.search}%`),
            like(user.name, `%${params.search}%`)
          )!
        );
      }

      // 日期范围筛选
      if (params.dateFrom) {
        conditions.push(gte(baziCalculations.createdAt, new Date(params.dateFrom)));
      }
      if (params.dateTo) {
        const endDate = new Date(params.dateTo);
        endDate.setHours(23, 59, 59, 999);
        conditions.push(gte(baziCalculations.createdAt, endDate));
      }

      // 排序
      const orderByColumn =
        params.sortBy === 'createdAt' ? baziCalculations.createdAt : baziCalculations.createdAt;
      const orderByDirection =
        params.sortOrder === 'asc' ? orderByColumn : desc(orderByColumn);

      // 查询分析记录
      const records = await db
        .select({
          id: baziCalculations.id,
          userId: baziCalculations.userId,
          input: baziCalculations.input,
          result: baziCalculations.result,
          createdAt: baziCalculations.createdAt,
          userName: user.name,
          userEmail: user.email,
          userCredits: user.credits,
        })
        .from(baziCalculations)
        .leftJoin(user, eq(baziCalculations.userId, user.id))
        .where(and(...conditions))
        .orderBy(orderByDirection)
        .limit(pageSize)
        .offset(skip);

      // 获取总数
      const totalResult = await db
        .select({ count: count() })
        .from(baziCalculations)
        .leftJoin(user, eq(baziCalculations.userId, user.id))
        .where(and(...conditions));

      const total = Number(totalResult[0]?.count || 0);

      return NextResponse.json({
        success: true,
        data: {
          records,
          pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
          },
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid type parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('获取八字分析数据失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取数据失败',
      },
      { status: 500 }
    );
  }
}
