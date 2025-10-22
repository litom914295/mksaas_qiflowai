import { getDb } from '@/db';
import { referralCodes, user } from '@/db/schema';
import { getSession } from '@/lib/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

function isAdmin(role?: string | null) {
  return role === 'admin';
}

function randCode() {
  const n = Math.floor(Math.random() * 10000);
  return `QF${String(n).padStart(4, '0')}`;
}

export async function POST() {
  try {
    const session = await getSession();
    if (!session?.user?.id || !isAdmin((session.user as any).role)) {
      return NextResponse.json(
        { success: false, error: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const db = await getDb();
    const users = await db.select({ id: user.id }).from(user);

    let created = 0;
    for (const u of users) {
      const existing = await db
        .select({ code: referralCodes.code })
        .from(referralCodes)
        .where(eq(referralCodes.userId, u.id))
        .limit(1);
      if (existing.length > 0) continue;

      // 生成唯一推荐码
      let code = randCode();
      let tries = 0;
      while (tries < 20) {
        const dup = await db
          .select({ code: referralCodes.code })
          .from(referralCodes)
          .where(eq(referralCodes.code, code))
          .limit(1);
        if (dup.length === 0) break;
        code = randCode();
        tries++;
      }

      await db.insert(referralCodes).values({ userId: u.id, code });
      created++;
    }

    return NextResponse.json({ success: true, data: { created } });
  } catch (error) {
    console.error('admin/referral/ensure-codes error:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
