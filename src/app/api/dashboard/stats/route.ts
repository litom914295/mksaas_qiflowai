import { getDb } from '@/db';
import { baziCalculations, fengshuiAnalysis, creditTransaction } from '@/db/schema';
import { auth } from '@/lib/auth';
import { and, count, eq, gte, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

/**
 * 获取用户仪表盘统计数据
 * GET /api/dashboard/stats
 */
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    if (!session || !userId) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const db = await getDb();

    // 计算本月起始时间
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // 获取本月八字分析次数
    const baziThisMonth = await db
      .select({ count: count() })
      .from(baziCalculations)
      .where(
        and(
          eq(baziCalculations.userId, userId),
          gte(baziCalculations.createdAt, startOfMonth)
        )
      );

    // 获取上月八字分析次数（用于计算趋势）
    const baziLastMonth = await db
      .select({ count: count() })
      .from(baziCalculations)
      .where(
        and(
          eq(baziCalculations.userId, userId),
          gte(baziCalculations.createdAt, startOfLastMonth),
          sql`${baziCalculations.createdAt} < ${startOfMonth.toISOString()}`
        )
      );

    // 获取本月风水分析次数
    const fengshuiThisMonth = await db
      .select({ count: count() })
      .from(fengshuiAnalysis)
      .where(
        and(
          eq(fengshuiAnalysis.userId, userId),
          gte(fengshuiAnalysis.createdAt, startOfMonth)
        )
      );

    // 获取上月风水分析次数
    const fengshuiLastMonth = await db
      .select({ count: count() })
      .from(fengshuiAnalysis)
      .where(
        and(
          eq(fengshuiAnalysis.userId, userId),
          gte(fengshuiAnalysis.createdAt, startOfLastMonth),
          sql`${fengshuiAnalysis.createdAt} < ${startOfMonth.toISOString()}`
        )
      );

    // 获取本月AI对话次数（基于积分交易记录）
    const aiChatThisMonth = await db
      .select({ count: count() })
      .from(creditTransaction)
      .where(
        and(
          eq(creditTransaction.userId, userId),
          eq(creditTransaction.type, 'AI_CHAT'),
          gte(creditTransaction.createdAt, startOfMonth)
        )
      );

    // 获取上月AI对话次数
    const aiChatLastMonth = await db
      .select({ count: count() })
      .from(creditTransaction)
      .where(
        and(
          eq(creditTransaction.userId, userId),
          eq(creditTransaction.type, 'AI_CHAT'),
          gte(creditTransaction.createdAt, startOfLastMonth),
          sql`${creditTransaction.createdAt} < ${startOfMonth.toISOString()}`
        )
      );

    // 获取连续签到天数
    const since = new Date();
    since.setDate(since.getDate() - 120);
    const signInRows = await db
      .select({ createdAt: creditTransaction.createdAt })
      .from(creditTransaction)
      .where(
        and(
          eq(creditTransaction.userId, userId),
          eq(creditTransaction.type, 'DAILY_SIGNIN'),
          gte(creditTransaction.createdAt, since)
        )
      );

    // 计算连续签到天数
    const marked = new Set<string>();
    for (const r of signInRows) {
      // 确保 createdAt 是 Date 对象
      const d = r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      marked.add(dateKey);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let consecutiveSignIns = 0;

    for (let i = 0; i < 365; i++) {
      const cur = new Date(today);
      cur.setDate(today.getDate() - i);
      const curKey = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
      
      if (marked.has(curKey)) {
        consecutiveSignIns += 1;
      } else {
        break;
      }
    }

    // 计算趋势百分比
    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const baziCount = Number(baziThisMonth[0]?.count || 0);
    const baziPrevCount = Number(baziLastMonth[0]?.count || 0);
    const fengshuiCount = Number(fengshuiThisMonth[0]?.count || 0);
    const fengshuiPrevCount = Number(fengshuiLastMonth[0]?.count || 0);
    const aiChatCount = Number(aiChatThisMonth[0]?.count || 0);
    const aiChatPrevCount = Number(aiChatLastMonth[0]?.count || 0);

    return NextResponse.json({
      baziAnalysisCount: baziCount,
      baziAnalysisTrend: calculateTrend(baziCount, baziPrevCount),
      fengshuiAnalysisCount: fengshuiCount,
      fengshuiAnalysisTrend: calculateTrend(fengshuiCount, fengshuiPrevCount),
      aiChatRounds: aiChatCount,
      aiChatTrend: calculateTrend(aiChatCount, aiChatPrevCount),
      consecutiveSignIns,
      signInTrend: 0, // 签到趋势可以后续优化
    });
  } catch (error) {
    console.error('[Dashboard Stats API] Error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
