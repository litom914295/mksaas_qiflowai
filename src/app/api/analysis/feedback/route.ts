/**
 * API: 提交用户反馈
 * POST /api/analysis/feedback
 */

import { getDb } from '@/db';
import { analysisFeedback } from '@/db/schema/analysis';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 获取用户session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // 验证必填字段
    const { analysisId, rating, feedbackType } = body;

    if (!analysisId || !rating || !feedbackType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 验证评分范围
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // 保存到数据库
    const db = await getDb();
    const [saved] = await db
      .insert(analysisFeedback)
      .values({
        analysisId,
        userId: session.user.id,
        rating,
        feedbackType,
        comment: body.comment || null,
        tags: body.tags || null,
        wouldRecommend: body.wouldRecommend || null,
        isPublic: 0, // 默认不公开
        isResolved: 0,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        id: saved.id,
        createdAt: saved.createdAt,
      },
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
