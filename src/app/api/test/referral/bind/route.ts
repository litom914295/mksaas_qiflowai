import { getDb } from '@/db';
import { referralCodes, referralRelationships, user } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const BodySchema = z.object({
  referrerEmail: z.string().email(),
  refereeEmail: z.string().email(),
});

function randCode() {
  const n = Math.floor(Math.random() * 10000);
  return `QF${String(n).padStart(4, '0')}`;
}

export async function POST(request: Request) {
  try {
    if (process.env.NODE_ENV !== 'test') {
      const h = (request.headers as any).get?.('x-test-enable') || '';
      if (h !== 'true') {
        return NextResponse.json(
          { success: false, error: 'FORBIDDEN' },
          { status: 403 }
        );
      }
    }

    const json = await request.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'INVALID_BODY' },
        { status: 400 }
      );
    }

    const { referrerEmail, refereeEmail } = parsed.data;
    const db = await getDb();

    const [referrer] = await db
      .select({ id: user.id, email: user.email })
      .from(user)
      .where(eq(user.email, referrerEmail))
      .limit(1);

    const [referee] = await db
      .select({ id: user.id, email: user.email })
      .from(user)
      .where(eq(user.email, refereeEmail))
      .limit(1);

    if (!referrer?.id || !referee?.id) {
      return NextResponse.json(
        { success: false, error: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (referrer.id === referee.id) {
      return NextResponse.json(
        { success: false, error: 'SELF_REFERRAL_NOT_ALLOWED' },
        { status: 400 }
      );
    }

    // Ensure referrer has a referral code
    let code: string | undefined;
    const existCode = await db
      .select({ code: referralCodes.code })
      .from(referralCodes)
      .where(eq(referralCodes.userId, referrer.id))
      .limit(1);
    if (existCode.length > 0) {
      code = existCode[0].code;
    } else {
      // Generate unique code with retry
      let tries = 0;
      let gen = randCode();
      while (tries < 20) {
        const dup = await db
          .select({ code: referralCodes.code })
          .from(referralCodes)
          .where(eq(referralCodes.code, gen))
          .limit(1);
        if (dup.length === 0) break;
        gen = randCode();
        tries++;
      }
      code = gen;
      await db.insert(referralCodes).values({ userId: referrer.id, code });
    }

    // Idempotent: create pending relation if absent
    const existing = await db
      .select({ id: referralRelationships.id })
      .from(referralRelationships)
      .where(
        and(
          eq(referralRelationships.referrerId, referrer.id),
          eq(referralRelationships.refereeId, referee.id)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(referralRelationships).values({
        referrerId: referrer.id,
        refereeId: referee.id,
        referralCode: code!,
        status: 'pending',
        level: 1,
      });
    }

    return NextResponse.json({ success: true, data: { code } });
  } catch (error) {
    console.error('test/referral/bind error:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
