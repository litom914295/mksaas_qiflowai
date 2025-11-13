import { getDb } from '@/db';
import { analysis } from '@/db/schema';
import { verifyAuth } from '@/lib/auth/verify';
import { and, count, desc, eq, gte, sql } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

// 罗盘使用统计API
export async function GET(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'stats';
    const db = await getDb();

    if (type === 'stats') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // 统计玄空风水中使用罗盘的记录
      const totalResult = await db
        .select({ count: count() })
        .from(analysis)
        .where(eq(analysis.type, 'xuankong'));

      const todayResult = await db
        .select({ count: count() })
        .from(analysis)
        .where(
          and(eq(analysis.type, 'xuankong'), gte(analysis.createdAt, today))
        );

      const thisMonthResult = await db
        .select({ count: count() })
        .from(analysis)
        .where(
          and(eq(analysis.type, 'xuankong'), gte(analysis.createdAt, thisMonth))
        );

      // 最近7天趋势
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const trendData = await db
        .select({
          date: sql<string>`DATE(${analysis.createdAt})`,
          count: count(),
        })
        .from(analysis)
        .where(
          and(
            eq(analysis.type, 'xuankong'),
            gte(analysis.createdAt, sevenDaysAgo)
          )
        )
        .groupBy(sql`DATE(${analysis.createdAt})`)
        .orderBy(sql`DATE(${analysis.createdAt})`);

      const stats = {
        total: totalResult[0]?.count || 0,
        today: todayResult[0]?.count || 0,
        thisMonth: thisMonthResult[0]?.count || 0,
        trend: trendData.map((item) => ({
          date: item.date,
          count: item.count,
        })),
        // 模拟设备统计 (实际应从input.metadata中提取)
        devices: {
          ios: Math.floor((totalResult[0]?.count || 0) * 0.6),
          android: Math.floor((totalResult[0]?.count || 0) * 0.35),
          other: Math.floor((totalResult[0]?.count || 0) * 0.05),
        },
      };

      return NextResponse.json({
        success: true,
        data: stats,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid type parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('获取罗盘统计失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取数据失败',
      },
      { status: 500 }
    );
  }
}
