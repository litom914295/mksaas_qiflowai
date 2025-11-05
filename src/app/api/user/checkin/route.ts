import { getDb } from '@/db';
import { checkIns, creditTransaction, user } from '@/db/schema';
import { verifyAuth } from '@/lib/auth';
import { and, desc, eq, gte, sql } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * 用户签到
 */
export async function POST(request: NextRequest) {
  try {
    // 获取当前用户
    const { authenticated, userId } = await verifyAuth(
      request as unknown as Request
    );
    if (!authenticated || !userId) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 使用事务确保数据一致性
    const db = await getDb();
    const result = await db.transaction(async (tx) => {
      // 检查今天是否已签到
      const existingCheckIn = await tx
        .select()
        .from(checkIns)
        .where(
          and(eq(checkIns.userId, userId), eq(checkIns.checkInDate, today))
        )
        .limit(1);

      if (existingCheckIn.length > 0) {
        throw new Error('今天已经签到过了');
      }

      // 获取昨天的签到记录
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const yesterdayCheckIn = await tx
        .select()
        .from(checkIns)
        .where(
          and(eq(checkIns.userId, userId), eq(checkIns.checkInDate, yesterday))
        )
        .limit(1);

      // 计算连续签到天数
      const consecutiveDays =
        yesterdayCheckIn.length > 0
          ? yesterdayCheckIn[0].consecutiveDays + 1
          : 1;

      // 获取签到配置
      // TODO: 从数据库获取配置,暂时使用硬编码
      const config = {
        daily: 2,
        consecutive7: 5,
        consecutive30: 20,
      };

      // 计算奖励积分
      const rewardCredits = config.daily;
      let milestoneReward = 0;

      // 连续签到奖励
      if (consecutiveDays === 7) {
        milestoneReward = config.consecutive7;
      } else if (consecutiveDays === 30) {
        milestoneReward = config.consecutive30;
      }

      const totalReward = rewardCredits + milestoneReward;

      // 创建签到记录
      const checkInResult = await tx
        .insert(checkIns)
        .values({
          userId,
          checkInDate: today,
          consecutiveDays,
          rewardCredits,
          milestoneReward,
          createdAt: new Date(),
        })
        .returning();

      const checkIn = checkInResult[0];

      // 创建积分交易记录
      await tx.insert(creditTransaction).values({
        id: crypto.randomUUID(),
        userId,
        amount: totalReward,
        type: 'signin',
        description: `签到奖励 ${rewardCredits}积分${milestoneReward > 0 ? ` + 连续${consecutiveDays}天奖励 ${milestoneReward}积分` : ''}`,
      });

      // 更新用户积分
      await tx
        .update(user)
        .set({
          credits: sql`COALESCE(${user.credits}, 0) + ${totalReward}`,
        })
        .where(eq(user.id, userId));

      return {
        checkIn,
        reward: totalReward,
        consecutiveDays,
      };
    });

    return NextResponse.json({
      success: true,
      message: '签到成功',
      data: {
        consecutiveDays: result.consecutiveDays,
        reward: result.reward,
        checkInDate: result.checkIn.checkInDate.toISOString(),
      },
    });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || '签到失败',
      },
      { status: 400 }
    );
  }
}

/**
 * 获取签到状态
 */
export async function GET(request: NextRequest) {
  try {
    const { authenticated, userId } = await verifyAuth(
      request as unknown as Request
    );
    if (!authenticated || !userId) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const db = await getDb();

    // 获取今天的签到记录
    const todayCheckInResult = await db
      .select()
      .from(checkIns)
      .where(and(eq(checkIns.userId, userId), eq(checkIns.checkInDate, today)))
      .limit(1);

    const todayCheckIn =
      todayCheckInResult.length > 0 ? todayCheckInResult[0] : null;

    // 获取最近的签到记录(用于显示连续签到天数)
    const latestCheckInResult = await db
      .select()
      .from(checkIns)
      .where(eq(checkIns.userId, userId))
      .orderBy(desc(checkIns.checkInDate))
      .limit(1);

    const latestCheckIn =
      latestCheckInResult.length > 0 ? latestCheckInResult[0] : null;

    // 获取本月签到次数
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisMonthCheckInsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(checkIns)
      .where(
        and(
          eq(checkIns.userId, userId),
          gte(checkIns.checkInDate, thisMonthStart)
        )
      );

    const thisMonthCheckIns = Number(thisMonthCheckInsResult[0]?.count || 0);

    return NextResponse.json({
      success: true,
      data: {
        hasCheckedInToday: !!todayCheckIn,
        consecutiveDays: latestCheckIn?.consecutiveDays || 0,
        thisMonthCheckIns,
        todayCheckIn: todayCheckIn
          ? {
              date: todayCheckIn.checkInDate.toISOString(),
              reward: todayCheckIn.rewardCredits + todayCheckIn.milestoneReward,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Get check-in status error:', error);
    return NextResponse.json({ error: '获取签到状态失败' }, { status: 500 });
  }
}
