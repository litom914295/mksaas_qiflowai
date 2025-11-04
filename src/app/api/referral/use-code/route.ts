import { websiteConfig } from '@/config/website';
import {
  processReferralRegistration,
  validateReferralCode,
} from '@/credits/referral';
import { getDb } from '@/db';
import { verifyAuth } from '@/lib/auth';
import { and, eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { authenticated, userId } = await verifyAuth(request);
    if (!authenticated || !userId) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const code = String(body?.code || '')
      .trim()
      .toUpperCase();
    if (!code) {
      return NextResponse.json(
        { success: false, error: 'INVALID_CODE' },
        { status: 400 }
      );
    }

    // 校验推荐码
    const validation = await validateReferralCode(code);
    if (!validation.valid || !validation.userId) {
      return NextResponse.json(
        { success: false, error: validation.message || 'CODE_NOT_FOUND' },
        { status: 400 }
      );
    }

    const referrerId = validation.userId;
    if (referrerId === userId) {
      return NextResponse.json(
        { success: false, error: 'SELF_REFERRAL_NOT_ALLOWED' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 防重复：检查是否已存在推荐关系
    const existing = (await db.execute(sql`
      SELECT 1 FROM referral_relationships WHERE referee_id = ${userId} LIMIT 1
    `)) as any[];
    if (existing && existing.length > 0) {
      return NextResponse.json({ success: true, data: { alreadyBound: true } });
    }

    // P0：直接发放奖励（后续升级为“激活后发放”）
    const result = await processReferralRegistration({
      referrerId,
      refereeId: userId,
      referralCode: code,
    });

    return NextResponse.json({
      success: true,
      data: { alreadyBound: false, ...result },
    });
  } catch (error) {
    console.error('use-code error:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
