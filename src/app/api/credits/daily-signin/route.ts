import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { getDb } from '@/db';
import { achievements, creditTransaction } from '@/db/schema';
import { addCredits } from '@/credits/credits';
import { websiteConfig } from '@/config/website';
import { and, eq, gte } from 'drizzle-orm';
import { issueVoucher } from '@/credits/vouchers';

function dateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function POST(request: Request) {
  try {
    // 鉴权
    const { authenticated, userId } = await verifyAuth(request);
    if (!authenticated || !userId) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // 检查是否启用每日签到
    const dailyCfg = websiteConfig.credits?.dailySignin;
    if (!websiteConfig.credits.enableCredits || !dailyCfg?.enable) {
      return NextResponse.json(
        { success: false, error: 'DAILY_SIGNIN_DISABLED' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 计算当天零点
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    // 查询今天是否已签到（幂等）
    const signed = await db
      .select({ id: creditTransaction.id })
      .from(creditTransaction)
      .where(
        and(
          eq(creditTransaction.userId, userId),
          eq(creditTransaction.type, 'DAILY_SIGNIN'),
          gte(creditTransaction.createdAt, startOfDay)
        )
      )
      .limit(1);

    if (signed.length > 0) {
      return NextResponse.json({ success: true, data: { already: true } });
    }

    // 发放签到积分（不过期）
    await addCredits({
      userId,
      amount: dailyCfg.amount,
      type: 'DAILY_SIGNIN',
      description: '每日签到奖励',
    });

    // 计算连续签到（基于 creditTransaction DAILY_SIGNIN）
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
    const marked = new Set<string>();
    for (const r of rows) {
      const d = new Date(r.createdAt as unknown as string);
      marked.add(dateKey(d));
    }
    const today = new Date();
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const cur = new Date(today);
      cur.setDate(today.getDate() - i);
      if (marked.has(dateKey(cur))) streak += 1; else break;
    }

    // 里程碑券：7/15/30/60/90 天
    const milestones: Array<{ n: number; code: string; action: 'bazi'|'fengshui'|'ai_chat'|'pdf_export'; units: number; name: string; expireDays?: number; }>= [
      { n: 7,  code: 'bazi_ticket_1',       action: 'bazi',       units: 1,   name: 'streak_7' },
      { n: 15, code: 'ai_chat_rounds_5',    action: 'ai_chat',    units: 5,   name: 'streak_15' },
      { n: 30, code: 'fengshui_ticket_1',   action: 'fengshui',   units: 1,   name: 'streak_30' },
      { n: 60, code: 'pdf_export_3',        action: 'pdf_export', units: 3,   name: 'streak_60' },
      { n: 90, code: 'ai_chat_rounds_100',  action: 'ai_chat',    units: 100, name: 'streak_90' },
    ];

    for (const m of milestones) {
      if (streak === m.n) {
        const exists = await db
          .select({ id: achievements.id })
          .from(achievements)
          .where(and(eq(achievements.userId, userId), eq(achievements.achievementId, m.name)))
          .limit(1);
        if (exists.length === 0) {
          await issueVoucher({ userId, action: m.action, units: m.units, voucherCode: m.code, reason: m.name, expireAt: null });
          await db.insert(achievements).values({ userId, achievementId: m.name, achievementName: m.name, rewardAmount: 0 });
        }
      }
    }

    return NextResponse.json({ success: true, data: { already: false, streak } });
  } catch (error) {
    console.error('daily-signin error:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
