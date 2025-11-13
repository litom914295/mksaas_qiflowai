'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

type SignInResult = {
  success: boolean;
  message: string;
  data?: {
    points: number;
    streak: number;
    nextReward: number;
    totalSignIns: number;
    already?: boolean;
  };
  error?: string;
};

/**
 * 执行每日签到
 * @returns 签到结果
 */
export async function performDailySignIn(): Promise<SignInResult> {
  try {
    // 调用真实的签到 API
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/credits/daily-signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 传递 cookies 以进行身份验证
        Cookie: (await cookies()).toString(),
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || '签到失败');
    }

    if (result.success) {
      // 重新验证相关页面缓存
      revalidatePath('/personal');
      revalidatePath('/points');
      revalidatePath('/settings/credits');

      // 如果已经签到过
      if (result.data?.already) {
        return {
          success: true,
          message: '今日已签到',
          data: {
            points: 0,
            streak: result.data.streak || 0,
            nextReward: 5,
            totalSignIns: 0,
            already: true,
          },
        };
      }

      // 签到成功
      return {
        success: true,
        message: '签到成功！获得积分奖励',
        data: {
          points: 5, // 签到积分从配置获取
          streak: result.data?.streak || 1,
          nextReward: 5,
          totalSignIns: result.data?.streak || 1,
        },
      };
    }

    throw new Error('签到失败');
  } catch (error) {
    console.error('Daily sign-in error:', error);

    return {
      success: false,
      message: '签到失败，请稍后重试',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 获取签到状态
 * @returns 签到状态数据
 */
export async function getSignInStatus() {
  try {
    // TODO: 从数据库获取实际签到状态

    // 模拟数据
    return {
      isSigned: false, // 今日是否已签到
      streak: 6, // 连续签到天数
      nextReward: 5, // 下次签到奖励
      totalSignIns: 29, // 累计签到天数
      signInHistory: [
        { date: '2024-01-14', points: 5 },
        { date: '2024-01-13', points: 5 },
        { date: '2024-01-12', points: 5 },
        { date: '2024-01-11', points: 5 },
        { date: '2024-01-10', points: 5 },
        { date: '2024-01-09', points: 5 },
        { date: '2024-01-08', points: 5 },
      ],
      rewards: {
        day1: 5,
        day7: 10,
        day14: 20,
        day30: 50,
      },
    };
  } catch (error) {
    console.error('Get sign-in status error:', error);
    throw error;
  }
}
