import { getDb } from '@/db';
import { referralCodes, referralRelationships } from '@/db/schema';
import { verifyAuth } from '@/lib/auth';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const BodySchema = z.object({
  code: z.string().min(3).max(20),
});

export async function POST(request: Request) {
  try {
    const { authenticated, userId } = await verifyAuth(request);
    if (!authenticated || !userId) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const json = await request.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'INVALID_BODY' },
        { status: 400 }
      );
    }

    const code = parsed.data.code.trim().toUpperCase();
    const db = await getDb();

    // 查找推荐码归属
    const [owner] = await db
      .select({ userId: referralCodes.userId })
      .from(referralCodes)
      .where(eq(referralCodes.code, code))
      .limit(1);

    if (!owner?.userId) {
      return NextResponse.json(
        { success: false, error: 'INVALID_CODE' },
        { status: 404 }
      );
    }

    // 不允许自荐
    if (owner.userId === userId) {
      return NextResponse.json(
        { success: false, error: 'SELF_REFERRAL_NOT_ALLOWED' },
        { status: 400 }
      );
    }

    // 幂等：若已存在关系则直接返回成功
    const exists = await db
      .select({ id: referralRelationships.id })
      .from(referralRelationships)
      .where(
        and(
          eq(referralRelationships.referrerId, owner.userId),
          eq(referralRelationships.refereeId, userId)
        )
      )
      .limit(1);

    if (exists.length > 0) {
      return NextResponse.json({ success: true, data: { already: true } });
    }

    // 创建 pending 关系，奖励在激活后发放
    await db.insert(referralRelationships).values({
      referrerId: owner.userId,
      refereeId: userId,
      referralCode: code,
      status: 'pending',
      level: 1,
    });

    return NextResponse.json({ success: true, data: { already: false } });
  } catch (error) {
    console.error('referral/use error:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
