import { randomUUID } from 'crypto';
import { websiteConfig } from '@/config/website';
import { getDb } from '@/db';
import { referralCodes, shareRecords } from '@/db/schema';
import { verifyAuth } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const CreateShareSchema = z.object({
  shareType: z.string().min(1), // e.g. dailyFortune | baziAnalysis | fengshuiAnalysis
  locale: z.string().optional().default('zh-CN'),
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

    if (!websiteConfig.growth?.share?.enable) {
      return NextResponse.json(
        { success: false, error: 'SHARE_DISABLED' },
        { status: 400 }
      );
    }

    const json = await request.json().catch(() => ({}));
    const parsed = CreateShareSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'INVALID_BODY' },
        { status: 400 }
      );
    }

    const { shareType, locale } = parsed.data;
    const db = await getDb();

    // 获取用户推荐码以拼接 ?ref=
    let code: string | undefined;
    try {
      const rows = await db
        .select({ code: referralCodes.code })
        .from(referralCodes)
        .where(eq(referralCodes.userId, userId))
        .limit(1);
      code = rows?.[0]?.code;
    } catch {}

    // 创建 share_records
    const id = randomUUID();
    const [inserted] = await db
      .insert(shareRecords)
      .values({
        id,
        userId,
        shareType,
        platform: 'web',
        rewardGranted: false,
        rewardAmount: websiteConfig.growth.share.rewardCredits ?? 0,
      })
      .returning({ id: shareRecords.id });

    const path = `/${locale}/s/${inserted.id}`;
    const url = code ? `${path}?ref=${encodeURIComponent(code)}` : path;

    return NextResponse.json({ success: true, data: { id: inserted.id, url } });
  } catch (error) {
    console.error('share/create error:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
