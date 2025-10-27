import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
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
    const result = await prisma.$transaction(async (tx: typeof prisma) => {
      // 检查今天是否已签到
      const existingCheckIn = await tx.checkIn.findUnique({
        where: {
          userId_checkInDate: {
            userId,
            checkInDate: today,
          },
        },
      });

      if (existingCheckIn) {
        throw new Error('今天已经签到过了');
      }

      // 获取昨天的签到记录
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const yesterdayCheckIn = await tx.checkIn.findUnique({
        where: {
          userId_checkInDate: {
            userId,
            checkInDate: yesterday,
          },
        },
      });

      // 计算连续签到天数
      const consecutiveDays = yesterdayCheckIn
        ? yesterdayCheckIn.consecutiveDays + 1
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
      const checkIn = await tx.checkIn.create({
        data: {
          userId,
          checkInDate: today,
          consecutiveDays,
          rewardCredits,
          milestoneReward,
        },
      });

      // 创建积分交易记录
      await tx.creditTransaction.create({
        data: {
          userId,
          amount: totalReward,
          type: 'signin',
          description: `签到奖励 ${rewardCredits}积分${milestoneReward > 0 ? ` + 连续${consecutiveDays}天奖励 ${milestoneReward}积分` : ''}`,
          metadata: {
            consecutiveDays,
            baseReward: rewardCredits,
            milestoneReward,
          },
        },
      });

      // 更新用户积分
      await tx.user.update({
        where: { id: userId },
        data: {
          credits: { increment: totalReward },
        },
      });

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

    // 获取今天的签到记录
    const todayCheckIn = await prisma.checkIn.findUnique({
      where: {
        userId_checkInDate: {
          userId,
          checkInDate: today,
        },
      },
    });

    // 获取最近的签到记录(用于显示连续签到天数)
    const latestCheckIn = await prisma.checkIn.findFirst({
      where: { userId },
      orderBy: { checkInDate: 'desc' },
    });

    // 获取本月签到次数
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisMonthCheckIns = await prisma.checkIn.count({
      where: {
        userId,
        checkInDate: {
          gte: thisMonthStart,
        },
      },
    });

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
