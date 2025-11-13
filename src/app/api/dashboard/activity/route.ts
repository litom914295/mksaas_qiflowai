import { getDb } from '@/db';
import {
  baziCalculations,
  creditTransaction,
  fengshuiAnalysis,
} from '@/db/schema';
import { auth } from '@/lib/auth';
import { and, count, eq, gte, sql } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * 获取用户活动趋势数据
 * GET /api/dashboard/activity?range=7d|30d|90d
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    if (!session || !userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get('range') || '30d';

    // 计算日期范围
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const db = await getDb();

    // 生成日期数组
    const dateArray: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dateArray.push(date.toISOString().split('T')[0]);
    }

    // 获取八字分析数据（按天分组）
    const baziData = await db
      .select({
        date: sql<string>`DATE(${baziCalculations.createdAt})`,
        count: count(),
      })
      .from(baziCalculations)
      .where(
        and(
          eq(baziCalculations.userId, userId),
          gte(baziCalculations.createdAt, startDate)
        )
      )
      .groupBy(sql`DATE(${baziCalculations.createdAt})`);

    // 获取风水分析数据
    const fengshuiData = await db
      .select({
        date: sql<string>`DATE(${fengshuiAnalysis.createdAt})`,
        count: count(),
      })
      .from(fengshuiAnalysis)
      .where(
        and(
          eq(fengshuiAnalysis.userId, userId),
          gte(fengshuiAnalysis.createdAt, startDate)
        )
      )
      .groupBy(sql`DATE(${fengshuiAnalysis.createdAt})`);

    // 获取AI对话数据
    const aiChatData = await db
      .select({
        date: sql<string>`DATE(${creditTransaction.createdAt})`,
        count: count(),
      })
      .from(creditTransaction)
      .where(
        and(
          eq(creditTransaction.userId, userId),
          eq(creditTransaction.type, 'AI_CHAT'),
          gte(creditTransaction.createdAt, startDate)
        )
      )
      .groupBy(sql`DATE(${creditTransaction.createdAt})`);

    // 构建数据映射
    const baziMap = new Map(baziData.map((d) => [d.date, Number(d.count)]));
    const fengshuiMap = new Map(
      fengshuiData.map((d) => [d.date, Number(d.count)])
    );
    const aiChatMap = new Map(aiChatData.map((d) => [d.date, Number(d.count)]));

    // 生成完整数据（确保每天都有记录，缺失的填0）
    const activityData = dateArray.map((date) => ({
      date,
      baziAnalysis: baziMap.get(date) || 0,
      fengshuiAnalysis: fengshuiMap.get(date) || 0,
      aiChat: aiChatMap.get(date) || 0,
    }));

    return NextResponse.json(activityData);
  } catch (error) {
    console.error('[Activity API] Error:', error);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
