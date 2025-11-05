import { websiteConfig } from '@/config/website';
import { addCredits } from '@/credits/credits';
import { issueVoucher } from '@/credits/vouchers';
import { getDb } from '@/db';
import { achievements, creditTransaction } from '@/db/schema';
import { auth } from '@/lib/auth';
import { and, eq, gte } from 'drizzle-orm';
import { NextResponse } from 'next/server';

function dateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function POST(request: Request) {
  // Add timeout protection (max 30 seconds)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    console.log('[签到API] 开始处理签到请求');

    // 鉴权 - 使用 auth.api.getSession 直接处理请求
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    if (!session || !userId) {
      console.warn('[签到API] 用户未认证，检查cookie是否存在');
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Get database connection
    const db = await getDb();
    const { user } = await import('@/db/schema');

    // 检查是否启用每日签到
    const dailyCfg = websiteConfig.credits?.dailySignin;

    if (!websiteConfig.credits.enableCredits || !dailyCfg?.enable) {
      console.warn('[签到API] 签到功能未启用');
      return NextResponse.json(
        { success: false, error: 'DAILY_SIGNIN_DISABLED' },
        { status: 400 }
      );
    }

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
      clearTimeout(timeoutId);
      return NextResponse.json({ success: true, data: { already: true } });
    }

    // 计算随机签到积分（5的倍数：5, 10, 15, 20）
    const minAmount = (dailyCfg as any).minAmount || 5;
    const maxAmount = (dailyCfg as any).maxAmount || 20;

    // 生成5的倍数：[1, 2, 3, 4] -> [5, 10, 15, 20]
    const multiplier =
      Math.floor(Math.random() * ((maxAmount - minAmount) / 5 + 1)) +
      minAmount / 5;
    const randomAmount = multiplier * 5;

    // Add credits
    await addCredits({
      userId,
      amount: randomAmount,
      type: 'DAILY_SIGNIN',
      description: `每日签到奖励 +${randomAmount}`,
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
    today.setHours(0, 0, 0, 0);
    let streak = 0;

    // 从今天开始向前检查连续天数
    // 签到后，今天已经被添加到 marked 集合中，从 i=0 开始计数
    for (let i = 0; i < 365; i++) {
      const cur = new Date(today);
      cur.setDate(today.getDate() - i);
      if (marked.has(dateKey(cur))) {
        streak += 1;
      } else {
        break; // 一旦断签就停止
      }
    }

    // 里程碑券：7/15/30/60/90 天
    const milestones: Array<{
      n: number;
      code: string;
      action: 'bazi' | 'fengshui' | 'ai_chat' | 'pdf_export';
      units: number;
      name: string;
      expireDays?: number;
    }> = [
      {
        n: 7,
        code: 'bazi_ticket_1',
        action: 'bazi',
        units: 1,
        name: 'streak_7',
      },
      {
        n: 15,
        code: 'ai_chat_rounds_5',
        action: 'ai_chat',
        units: 5,
        name: 'streak_15',
      },
      {
        n: 30,
        code: 'fengshui_ticket_1',
        action: 'fengshui',
        units: 1,
        name: 'streak_30',
      },
      {
        n: 60,
        code: 'pdf_export_3',
        action: 'pdf_export',
        units: 3,
        name: 'streak_60',
      },
      {
        n: 90,
        code: 'ai_chat_rounds_100',
        action: 'ai_chat',
        units: 100,
        name: 'streak_90',
      },
    ];

    for (const m of milestones) {
      if (streak === m.n) {
        const exists = await db
          .select({ id: achievements.id })
          .from(achievements)
          .where(
            and(
              eq(achievements.userId, userId),
              eq(achievements.achievementId, m.name)
            )
          )
          .limit(1);
        if (exists.length === 0) {
          await issueVoucher({
            userId,
            action: m.action,
            units: m.units,
            voucherCode: m.code,
            reason: m.name,
            expireAt: null,
          });
          await db.insert(achievements).values({
            userId,
            achievementId: m.name,
            achievementName: m.name,
            rewardAmount: 0,
          });
        }
      }
    }

    console.log(
      '[签到API] 签到成功, 连续天数:',
      streak,
      '获得积分:',
      randomAmount
    );
    clearTimeout(timeoutId);
    return NextResponse.json({
      success: true,
      data: { already: false, streak, earnedCredits: randomAmount },
    });
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('[签到API] ❌ 签到失败:', error);
    if (error instanceof Error) {
      console.error('[签到API] 错误详情:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
