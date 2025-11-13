'use server';

import { getUserCredits } from '@/credits/credits';
import { getDb } from '@/db';
import {
  baziCalculations,
  creditTransaction,
  fengshuiAnalysis,
  payment,
  user,
} from '@/db/schema';
import { getSession } from '@/lib/server';
import { getUserPlan } from '@/lib/user-plan';
import { and, count, eq, gte, sql } from 'drizzle-orm';
import { cache } from 'react';

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

export interface RecentAnalysis {
  id: string;
  type: 'bazi' | 'fengshui';
  title: string;
  createdAt: Date;
  creditsUsed: number;
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
  recentAnalyses: RecentAnalysis[];
}

// 使用 React cache 避免同一请求中重复查询
const getDashboardDataUncached = async (): Promise<DashboardData | null> => {
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
    let userLevel = '免费会员';
    let analysisCount = 0;
    let monthlyAnalysis = 0;
    let totalUsers = 0;
    let recentAnalyses: RecentAnalysis[] = [];
    let newbieMissionsData = {
      completed: 0,
      total: 5,
      progress: 0,
    };

    // 只在启用数据库时才查询
    if (!disableCreditsDb) {
      try {
        // 获取真实的用户积分（带超时，优化为2秒快速失败）
        const creditsPromise = getUserCredits(session.user.id);
        const timeoutPromise = new Promise<number>((_, reject) =>
          setTimeout(() => reject(new Error('Credits query timeout')), 2000)
        );
        userCredits = await Promise.race([creditsPromise, timeoutPromise]);
      } catch (error) {
        console.warn('Failed to get user credits, using default value:', error);
        userCredits = 0; // 降级为默认值
      }

      try {
        // 获取用户会员等级
        const userPlan = await getUserPlan(session.user.id);
        if (userPlan) {
          if (userPlan.type === 'LIFETIME') {
            userLevel = '终身会员';
          } else if (userPlan.type === 'SUBSCRIPTION') {
            const planName = userPlan.planName?.toLowerCase() || '';
            if (planName.includes('pro')) {
              userLevel = 'Pro 会员';
            } else {
              userLevel = '订阅会员';
            }
          } else {
            userLevel = '免费会员';
          }
        }
      } catch (error) {
        console.warn('Failed to get user plan:', error);
      }

      try {
        // 获取用户分析统计
        const db = await getDb();

        // 总分析次数（八字 + 风水）
        const [baziCount, fengshuiCount] = await Promise.all([
          db
            .select({ count: count() })
            .from(baziCalculations)
            .where(eq(baziCalculations.userId, session.user.id)),
          db
            .select({ count: count() })
            .from(fengshuiAnalysis)
            .where(eq(fengshuiAnalysis.userId, session.user.id)),
        ]);

        analysisCount =
          (baziCount[0]?.count || 0) + (fengshuiCount[0]?.count || 0);

        // 本月分析次数
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [monthlyBazi, monthlyFengshui] = await Promise.all([
          db
            .select({ count: count() })
            .from(baziCalculations)
            .where(
              and(
                eq(baziCalculations.userId, session.user.id),
                gte(baziCalculations.createdAt, startOfMonth)
              )
            ),
          db
            .select({ count: count() })
            .from(fengshuiAnalysis)
            .where(
              and(
                eq(fengshuiAnalysis.userId, session.user.id),
                gte(fengshuiAnalysis.createdAt, startOfMonth)
              )
            ),
        ]);

        monthlyAnalysis =
          (monthlyBazi[0]?.count || 0) + (monthlyFengshui[0]?.count || 0);

        // 平台总用户数
        const usersResult = await db.select({ count: count() }).from(user);
        totalUsers = usersResult[0]?.count || 0;

        // 获取最近的分析记录（最近5条）
        const [recentBazi, recentFengshui] = await Promise.all([
          db
            .select({
              id: baziCalculations.id,
              createdAt: baziCalculations.createdAt,
              creditsUsed: baziCalculations.creditsUsed,
              input: baziCalculations.input,
            })
            .from(baziCalculations)
            .where(eq(baziCalculations.userId, session.user.id))
            .orderBy(sql`${baziCalculations.createdAt} DESC`)
            .limit(5),
          db
            .select({
              id: fengshuiAnalysis.id,
              createdAt: fengshuiAnalysis.createdAt,
              creditsUsed: fengshuiAnalysis.creditsUsed,
              input: fengshuiAnalysis.input,
            })
            .from(fengshuiAnalysis)
            .where(eq(fengshuiAnalysis.userId, session.user.id))
            .orderBy(sql`${fengshuiAnalysis.createdAt} DESC`)
            .limit(5),
        ]);

        // 合并并按时间排序
        const allRecent = [
          ...recentBazi.map((r) => ({
            ...r,
            type: 'bazi' as const,
            title: `八字分析`,
          })),
          ...recentFengshui.map((r) => ({
            ...r,
            type: 'fengshui' as const,
            title: `玄空风水分析`,
          })),
        ]
          .sort((a, b) => {
            const timeA = new Date(a.createdAt).getTime();
            const timeB = new Date(b.createdAt).getTime();
            return timeB - timeA;
          })
          .slice(0, 5);

        recentAnalyses = allRecent.map((r) => ({
          id: r.id,
          type: r.type,
          title: r.title,
          createdAt: new Date(r.createdAt),
          creditsUsed: r.creditsUsed,
        }));

        // 获取新手任务进度
        try {
          const { getUserNewbieMissions } = await import(
            '@/lib/newbie-missions'
          );
          const missionsResult = await getUserNewbieMissions(session.user.id);
          newbieMissionsData = {
            completed: missionsResult.completed,
            total: missionsResult.total,
            progress: missionsResult.progress,
          };
        } catch (error) {
          console.warn('Failed to get newbie missions:', error);
        }
      } catch (error) {
        console.warn('Failed to get analysis stats:', error);
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

          // 计算连续签到天数（优化：从120天减少到30天）
          const since = new Date();
          since.setDate(since.getDate() - 30);
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
          today.setHours(0, 0, 0, 0);
          let streak = 0;

          // 从今天开始向前检查连续天数
          // 如果今天已签到，从 i=0 开始；如果今天未签，从 i=1 开始（昨天）
          const startIndex = marked.has(dateKey(today)) ? 0 : 1;

          for (let i = startIndex; i < 365; i++) {
            const cur = new Date(today);
            cur.setDate(today.getDate() - i);
            if (marked.has(dateKey(cur))) {
              streak += 1;
            } else {
              break; // 一旦断签就停止
            }
          }

          return { isSigned, streak };
        })();

        // 优化超时时间：从15秒减少到3秒，提升响应速度
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Sign in query timeout')), 3000)
        );

        const result = await Promise.race([signInPromise, timeoutPromise]);
        isSigned = result.isSigned;
        streak = result.streak;
      } catch (error) {
        console.error('Failed to get sign in status:', error);
        // 超时或错误时，尝试从简化查询获取签到状态（只查今天）
        try {
          const db = await getDb();
          const now = new Date();
          const startOfDay = new Date(now);
          startOfDay.setHours(0, 0, 0, 0);

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

          isSigned = todaySignIn.length > 0;
          streak = 0; // 连续签到失败时默认为0
          console.log(
            'Sign in status recovered from fallback query:',
            isSigned
          );
        } catch (fallbackError) {
          console.error('Fallback query also failed:', fallbackError);
          // 最后降级为默认值
          isSigned = false;
          streak = 0;
        }
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
        level: userLevel, // 真实的会员等级
      },
      greeting,
      stats: {
        credits: userCredits, // 真实的积分数据
        analysisCount, // 真实的分析次数
        monthlyAnalysis, // 真实的月度分析
        totalUsers, // 真实的用户总数
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
        newbieMissions: newbieMissionsData, // 真实的新手任务数据
      },
      recentAnalyses, // 真实的最近分析记录
    };

    return dashboardData;
  } catch (error) {
    console.error('Failed to get dashboard data:', error);
    return null;
  }
};

// 导出缓存版本
export const getDashboardData = cache(getDashboardDataUncached);
