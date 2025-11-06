import { getDb } from '@/db';
import { creditTransaction } from '@/db/schema';
import { auth } from '@/lib/auth';
import { and, eq, gte } from 'drizzle-orm';
import { NextResponse } from 'next/server';

/**
 * 获取签到状态API
 * GET /api/credits/daily-signin/status
 * 返回今日是否已签到、连续签到天数等信息
 */
export async function GET(request: Request) {
  try {
    // 鉴权
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    if (!session || !userId) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const db = await getDb();

    // 计算当天零点
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    // 查询今天是否已签到
    const todaySignIn = await db
      .select({ id: creditTransaction.id, createdAt: creditTransaction.createdAt })
      .from(creditTransaction)
      .where(
        and(
          eq(creditTransaction.userId, userId),
          eq(creditTransaction.type, 'DAILY_SIGNIN'),
          gte(creditTransaction.createdAt, startOfDay)
        )
      )
      .limit(1);

    const hasSignedToday = todaySignIn.length > 0;

    // 计算连续签到天数（最近120天内）
    const since = new Date();
    since.setDate(since.getDate() - 120);
    const rows = await db
      .select({ createdAt: creditTransaction.createdAt })
      .from(creditTransaction)
      .where(
        and(
          eq(creditTransaction.userId, userId),
          eq(creditTransaction.type, 'DAILY_SIGNIN'),
          gte(creditTransaction.createdAt, since)
        )
      );

    // 构建已签到日期集合
    const marked = new Set<string>();
    for (const r of rows) {
      const d = new Date(r.createdAt as unknown as string);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      marked.add(dateKey);
    }

    // 计算连续签到天数
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streak = 0;

    for (let i = 0; i < 365; i++) {
      const cur = new Date(today);
      cur.setDate(today.getDate() - i);
      const curKey = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
      
      if (marked.has(curKey)) {
        streak += 1;
      } else {
        break;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        hasSignedToday,
        streak,
        lastSignInDate: hasSignedToday ? todaySignIn[0].createdAt : null,
      },
    });
  } catch (error) {
    console.error('[签到状态API] 错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
