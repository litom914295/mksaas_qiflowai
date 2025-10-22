/**
 * API: 分析记录详情
 * GET /api/analysis/history/[id] - 获取单个分析记录
 * DELETE /api/analysis/history/[id] - 删除分析记录
 */

import { getDb } from '@/db';
import { analysisHistory } from '@/db/schema/analysis';
import { auth } from '@/lib/auth';
import { and, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 获取用户session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // 查询单个分析记录
    const db = await getDb();
    const record = await db
      .select()
      .from(analysisHistory)
      .where(
        and(
          eq(analysisHistory.id, id),
          eq(analysisHistory.userId, session.user.id)
        )
      )
      .limit(1);

    if (record.length === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    // 增加查看次数
    await db
      .update(analysisHistory)
      .set({
        viewCount: (record[0].viewCount || 0) + 1,
        updatedAt: new Date(),
      })
      .where(eq(analysisHistory.id, id));

    return NextResponse.json({
      success: true,
      data: {
        ...record[0],
        viewCount: (record[0].viewCount || 0) + 1,
      },
    });
  } catch (error) {
    console.error('Error fetching analysis record:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 获取用户session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // 删除分析记录（只能删除自己的记录）
    const db = await getDb();
    const result = await db
      .delete(analysisHistory)
      .where(
        and(
          eq(analysisHistory.id, id),
          eq(analysisHistory.userId, session.user.id)
        )
      );

    return NextResponse.json({
      success: true,
      message: 'Record deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting analysis record:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
