'use server';

/**
 * 获取仪表盘数据
 */

import { getUserCredits } from '@/credits/credits';
import { getDb } from '@/db';
import { creditTransaction } from '@/db/schema';
import { getSession } from '@/lib/server';
import { and, eq, gte } from 'drizzle-orm';

export interface DashboardStats {
  credits: number;
  analysisCount: number;
  monthlyAnalysis: number;
  totalUsers: number;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

export interface DashboardData {
  user: {
    name: string;
    avatar?: string;
    level: string;
  };
  greeting: string;
  stats: DashboardStats;
  quickActions: QuickAction[];
  activities: {
    dailySignIn: {
      isSigned: boolean;
      streak: number;
      nextReward: number;
    };
    newbieMissions: {
      completed: number;
      total: number;
      progress: number;
    };
  };
}

export async function getDashboardData(): Promise<DashboardData | null> {
  try {
    const session = await getSession();

    console.log('getDashboardData - session:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userName: session?.user?.name,
    });

    if (!session?.user) {
      console.error('getDashboardData - No session or user found');
      return null;
    }

    // 获取当前时间的问候语
    const hour = new Date().getHours();
    let greeting = '早上好';
    if (hour >= 12 && hour < 18) {
      greeting = '下午好';
    } else if (hour >= 18) {
      greeting = '晚上好';
    }

    // 检查是否禁用数据库查询（用于本地开发）
    const disableCreditsDb = process.env.DISABLE_CREDITS_DB === 'true';

    // 默认值
    let userCredits = 0;
    let isSigned = false;
    let streak = 0;
    let nextReward = 10;

    // 只在启用数据库时才查询
    if (!disableCreditsDb) {
      try {
        // 获取真实的用户积分（带超时）
        const creditsPromise = getUserCredits(session.user.id);
        const timeoutPromise = new Promise<number>((_, reject) =>
          setTimeout(() => reject(new Error('Credits query timeout')), 5000)
        );
        userCredits = await Promise.race([creditsPromise, timeoutPromise]);
      } catch (error) {
        console.warn('Failed to get user credits, using default value:', error);
        userCredits = 0; // 降级为默认值
      }

      try {
        // 获取签到状态（带超时）
        const signInPromise = (async () => {
          const db = await getDb();
          const now = new Date();
          const startOfDay = new Date(now);
          startOfDay.setHours(0, 0, 0, 0);

          // 检查今天是否已签到
          const todaySignIn = await db
            .select({ id: creditTransaction.id })
            .from(creditTransaction)
            .where(
              and(
                eq(creditTransaction.userId, session.user.id),
                eq(creditTransaction.type, 'DAILY_SIGNIN'),
                gte(creditTransaction.createdAt, startOfDay)
              )
            )
            .limit(1);

          const isSigned = todaySignIn.length > 0;

          // 计算连续签到天数
          const since = new Date();
          since.setDate(since.getDate() - 120);
          const signInRecords = await db
            .select({ createdAt: creditTransaction.createdAt })
            .from(creditTransaction)
            .where(
              and(
                eq(creditTransaction.userId, session.user.id),
                eq(creditTransaction.type, 'DAILY_SIGNIN'),
                gte(creditTransaction.createdAt, since)
              )
            );

          // 计算连续签到
          const dateKey = (d: Date) => {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
          };

          const marked = new Set<string>();
          for (const r of signInRecords) {
            const d = new Date(r.createdAt as unknown as string);
            marked.add(dateKey(d));
          }

          const today = new Date();
          let streak = 0;
          for (let i = 0; i < 365; i++) {
            const cur = new Date(today);
            cur.setDate(today.getDate() - i);
            if (marked.has(dateKey(cur))) streak += 1;
            else break;
          }

          return { isSigned, streak };
        })();

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Sign in query timeout')), 5000)
        );

        const result = await Promise.race([signInPromise, timeoutPromise]);
        isSigned = result.isSigned;
        streak = result.streak;
      } catch (error) {
        console.warn(
          'Failed to get sign in status, using default values:',
          error
        );
        // 降级为默认值
        isSigned = false;
        streak = 0;
      }
    } else {
      console.log(
        '[getDashboardData] DISABLE_CREDITS_DB=true, using mock data'
      );
    }

    // 从网站配置获取签到奖励
    const { websiteConfig } = await import('@/config/website');
    nextReward = websiteConfig.credits?.dailySignin?.amount || 10;

    const dashboardData: DashboardData = {
      user: {
        name: session.user.name ?? '用户',
        avatar: session.user.image ?? undefined,
        level: '普通会员',
      },
      greeting,
      stats: {
        credits: userCredits, // 使用真实的积分数据
        analysisCount: 15, // TODO: 从数据库获取
        monthlyAnalysis: 8, // TODO: 从数据库获取
        totalUsers: 10240, // TODO: 从数据库获取
      },
      quickActions: [
        {
          id: 'bazi-analysis',
          title: '八字分析',
          description: '深入了解您的命理运势',
          icon: 'Calendar',
          href: '/analysis/bazi',
          color: 'bg-blue-500',
        },
        {
          id: 'fengshui-analysis',
          title: '风水分析',
          description: '优化您的居住环境',
          icon: 'Home',
          href: '/analysis/xuankong',
          color: 'bg-green-500',
        },
        {
          id: 'history',
          title: '我的分析',
          description: '查看历史分析记录',
          icon: 'History',
          href: '/analysis/history',
          color: 'bg-purple-500',
        },
        {
          id: 'credits',
          title: '积分充值',
          description: '购买更多积分',
          icon: 'Coins',
          href: '/settings/credits',
          color: 'bg-orange-500',
        },
      ],
      activities: {
        dailySignIn: {
          isSigned, // 真实的签到状态
          streak, // 真实的连续签到天数
          nextReward, // 从配置获取的奖励
        },
        newbieMissions: {
          completed: 2, // TODO: 从数据库获取
          total: 5, // TODO: 从数据库获取
          progress: 40, // TODO: 从数据库获取
        },
      },
    };

    return dashboardData;
  } catch (error) {
    console.error('Failed to get dashboard data:', error);
    return null;
  }
}
