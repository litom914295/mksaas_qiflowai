/**
 * API: 保存分析结果
 * POST /api/analysis/save
 */

import { getDb } from '@/db';
import { analysisHistory } from '@/db/schema/analysis';
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
    const { name, birthDate, gender, location, baziResult, fengshuiResult } =
      body;

    if (!name || !birthDate || !gender || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 保存到数据库
    const db = await getDb();
    const [saved] = await db
      .insert(analysisHistory)
      .values({
        userId: session.user.id,
        name,
        birthDate,
        birthTime: body.birthTime || null,
        gender,
        location,
        houseOrientation: body.houseOrientation || null,
        houseAddress: body.houseAddress || null,
        houseFloor: body.houseFloor || null,
        houseRoomCount: body.houseRoomCount || null,
        baziResult: baziResult || null,
        fengshuiResult: fengshuiResult || null,
        aiEnhancedAnalysis: body.aiEnhancedAnalysis || null,
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
    console.error('Error saving analysis:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
