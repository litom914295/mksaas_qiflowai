import { getDb } from '@/db';
import { creditTransaction } from '@/db/schema';
import { getSession } from '@/lib/server';
import { and, eq, gte, sql } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/credits/signin-history
 * 获取最近90天的签到历史记录（用于热力图展示）
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const days = Number.parseInt(searchParams.get('days') || '90', 10);

    // 计算查询起始日期
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const db = await getDb();

    // 查询签到记录
    const signIns = await db
      .select({
        createdAt: creditTransaction.createdAt,
        amount: creditTransaction.amount,
      })
      .from(creditTransaction)
      .where(
        and(
          eq(creditTransaction.userId, userId),
          eq(creditTransaction.type, 'DAILY_SIGNIN'),
          gte(creditTransaction.createdAt, startDate)
        )
      )
      .orderBy(sql`${creditTransaction.createdAt} DESC`);

    // 按日期分组（一天可能有多次签到记录，取第一次）
    const signInByDate: Record<
      string,
      { date: string; amount: number; count: number }
    > = {};

    signIns.forEach((signin) => {
      const date = new Date(signin.createdAt);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      if (!signInByDate[dateKey]) {
        signInByDate[dateKey] = {
          date: dateKey,
          amount: signin.amount,
          count: 1,
        };
      }
    });

    // 转换为数组并按日期排序
    const history = Object.values(signInByDate).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    // 计算连续签到天数
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    const signInDates = new Set(history.map((h) => h.date));

    // 计算当前连续天数
    let checkDate = new Date();
    while (true) {
      const dateKey = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      if (!signInDates.has(dateKey)) {
        break;
      }
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // 计算最大连续天数
    checkDate = new Date();
    checkDate.setDate(checkDate.getDate() - days);
    for (let i = 0; i < days; i++) {
      const dateKey = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      if (signInDates.has(dateKey)) {
        tempStreak++;
        maxStreak = Math.max(maxStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
      checkDate.setDate(checkDate.getDate() + 1);
    }

    // 生成热力图数据（包含未签到的日期）
    const heatmapData: Array<{
      date: string;
      count: number;
      amount: number;
      level: number; // 0-4 颜色级别
    }> = [];

    checkDate = new Date();
    checkDate.setDate(checkDate.getDate() - days + 1);

    for (let i = 0; i < days; i++) {
      const dateKey = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      const signInData = signInByDate[dateKey];

      heatmapData.push({
        date: dateKey,
        count: signInData ? 1 : 0,
        amount: signInData?.amount || 0,
        level: signInData ? 4 : 0, // 简化：签到=4级，未签到=0级
      });

      checkDate.setDate(checkDate.getDate() + 1);
    }

    // 统计数据
    const stats = {
      totalDays: history.length,
      currentStreak,
      maxStreak,
      totalCredits: history.reduce((sum, h) => sum + h.amount, 0),
      avgCreditsPerDay:
        history.length > 0
          ? Math.round(
              history.reduce((sum, h) => sum + h.amount, 0) / history.length
            )
          : 0,
    };

    return NextResponse.json({
      history, // 实际签到记录
      heatmapData, // 热力图数据（包含所有日期）
      stats, // 统计摘要
    });
  } catch (error) {
    console.error('获取签到历史失败:', error);
    return NextResponse.json({ error: '获取签到历史失败' }, { status: 500 });
  }
}
