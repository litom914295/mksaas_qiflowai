/**
 * API: 查询分析历史
 * GET /api/analysis/history
 */

import { getDb } from '@/db';
import { analysisHistory } from '@/db/schema/analysis';
import { auth } from '@/lib/auth';
import { desc, eq, sql } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    // 获取用户session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取查询参数
    const { searchParams } = new URL(req.url);
    const limit = Number.parseInt(searchParams.get('limit') || '10');
    const offset = Number.parseInt(searchParams.get('offset') || '0');

    // 查询用户的分析历史
    const db = await getDb();
    const history = await db
      .select()
      .from(analysisHistory)
      .where(eq(analysisHistory.userId, session.user.id))
      .orderBy(desc(analysisHistory.createdAt))
      .limit(limit)
      .offset(offset);

    // 获取总记录数用于分页
    const totalCount = await db
      .select({ count: sql`count(*)` })
      .from(analysisHistory)
      .where(eq(analysisHistory.userId, session.user.id));

    const total = Number(totalCount[0]?.count || 0);

    return NextResponse.json({
      success: true,
      data: history,
      pagination: {
        limit,
        offset,
        total,
        hasMore: history.length === limit,
      },
    });
  } catch (error) {
    console.error('Error fetching analysis history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
