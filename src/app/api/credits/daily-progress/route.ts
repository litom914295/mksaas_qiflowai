import { getDb } from '@/db';
import {
  baziCalculations,
  creditTransaction,
  fengshuiAnalysis,
} from '@/db/schema';
import { getSession } from '@/lib/server';
import { and, eq, gte, sql } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/credits/daily-progress
 * 获取今日任务完成进度
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const userId = session.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const db = await getDb();

    // 1. 查询今日签到状态
    const todaySignIn = await db
      .select()
      .from(creditTransaction)
      .where(
        and(
          eq(creditTransaction.userId, userId),
          eq(creditTransaction.type, 'DAILY_SIGNIN'),
          gte(creditTransaction.createdAt, today)
        )
      )
      .limit(1);

    // 2. 查询今日八字分析次数
    const todayBaziCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(baziCalculations)
      .where(
        and(
          eq(baziCalculations.userId, userId),
          gte(baziCalculations.createdAt, today)
        )
      );

    // 3. 查询今日风水分析次数
    const todayFengshuiCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(fengshuiAnalysis)
      .where(
        and(
          eq(fengshuiAnalysis.userId, userId),
          gte(fengshuiAnalysis.createdAt, today)
        )
      );

    // 4. 查询今日AI对话轮数
    const todayAiChatCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(creditTransaction)
      .where(
        and(
          eq(creditTransaction.userId, userId),
          eq(creditTransaction.type, 'AI_CHAT'),
          gte(creditTransaction.createdAt, today)
        )
      );

    // 5. 查询连续签到天数（用于里程碑进度）
    const allSignIns = await db
      .select({ createdAt: creditTransaction.createdAt })
      .from(creditTransaction)
      .where(
        and(
          eq(creditTransaction.userId, userId),
          eq(creditTransaction.type, 'DAILY_SIGNIN'),
          gte(
            creditTransaction.createdAt,
            new Date(Date.now() - 120 * 24 * 60 * 60 * 1000)
          )
        )
      )
      .orderBy(sql`${creditTransaction.createdAt} DESC`);

    // 计算连续签到天数
    let streak = 0;
    const signInDates = new Set(
      allSignIns.map((s) => {
        const d = new Date(s.createdAt);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      })
    );

    const checkDate = new Date();
    while (true) {
      const dateKey = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      if (!signInDates.has(dateKey)) {
        break;
      }
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // 任务目标配置
    const taskGoals = {
      dailySignIn: 1, // 每日签到1次
      baziAnalysis: 1, // 八字分析1次
      fengshuiAnalysis: 1, // 风水分析1次
      aiChat: 5, // AI对话5轮
    };

    // 里程碑配置
    const milestones = [
      { days: 7, reward: '八字分析券 x1', type: 'bazi_voucher' },
      { days: 15, reward: 'AI对话轮次 x5', type: 'ai_chat_bonus' },
      { days: 30, reward: '风水分析券 x1', type: 'fengshui_voucher' },
      { days: 60, reward: 'PDF导出券 x3', type: 'pdf_export_voucher' },
      { days: 90, reward: 'AI对话轮次 x100', type: 'ai_chat_mega' },
    ];

    // 计算下一个里程碑
    const nextMilestone =
      milestones.find((m) => m.days > streak) ||
      milestones[milestones.length - 1];
    const progressToNext = nextMilestone
      ? (streak / nextMilestone.days) * 100
      : 100;

    return NextResponse.json({
      tasks: {
        dailySignIn: {
          completed: todaySignIn.length > 0,
          current: todaySignIn.length > 0 ? 1 : 0,
          goal: taskGoals.dailySignIn,
          progress: todaySignIn.length > 0 ? 100 : 0,
          credits: '+5~20',
          description: '每日签到获取随机积分',
          urgent: todaySignIn.length === 0, // 未签到则高亮
        },
        baziAnalysis: {
          completed:
            Number(todayBaziCount[0]?.count || 0) >= taskGoals.baziAnalysis,
          current: Number(todayBaziCount[0]?.count || 0),
          goal: taskGoals.baziAnalysis,
          progress: Math.min(
            (Number(todayBaziCount[0]?.count || 0) / taskGoals.baziAnalysis) *
              100,
            100
          ),
          credits: '-10',
          description: '进行八字命理分析',
          urgent: false,
        },
        fengshuiAnalysis: {
          completed:
            Number(todayFengshuiCount[0]?.count || 0) >=
            taskGoals.fengshuiAnalysis,
          current: Number(todayFengshuiCount[0]?.count || 0),
          goal: taskGoals.fengshuiAnalysis,
          progress: Math.min(
            (Number(todayFengshuiCount[0]?.count || 0) /
              taskGoals.fengshuiAnalysis) *
              100,
            100
          ),
          credits: '-20',
          description: '进行玄空风水分析',
          urgent: false,
        },
        aiChat: {
          completed:
            Number(todayAiChatCount[0]?.count || 0) >= taskGoals.aiChat,
          current: Number(todayAiChatCount[0]?.count || 0),
          goal: taskGoals.aiChat,
          progress: Math.min(
            (Number(todayAiChatCount[0]?.count || 0) / taskGoals.aiChat) * 100,
            100
          ),
          credits: '-5/轮',
          description: '与AI命理顾问对话',
          urgent: false,
        },
      },
      streak: {
        current: streak,
        milestones: milestones.map((m) => ({
          ...m,
          achieved: streak >= m.days,
          progress: Math.min((streak / m.days) * 100, 100),
        })),
        nextMilestone: nextMilestone
          ? {
              ...nextMilestone,
              daysLeft: nextMilestone.days - streak,
              progress: progressToNext,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('获取日常进度失败:', error);
    return NextResponse.json({ error: '获取日常进度失败' }, { status: 500 });
  }
}
