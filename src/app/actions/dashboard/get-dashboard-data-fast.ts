'use server';

import { getSession } from '@/lib/server';
import type { DashboardData } from './get-dashboard-data';

/**
 * 快速获取仪表盘数据 - 最小化版本
 * 用于解决数据库查询超时导致的加载慢问题
 *
 * 策略：
 * 1. 只返回基本用户信息
 * 2. 所有统计数据使用默认值
 * 3. 不查询数据库
 * 4. 加载时间 < 100ms
 */
export async function getDashboardDataFast(): Promise<DashboardData | null> {
  try {
    const session = await getSession();

    if (!session?.user) {
      console.error('[getDashboardDataFast] No session or user found');
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

    // 从网站配置获取签到奖励
    const { websiteConfig } = await import('@/config/website');
    const nextReward = websiteConfig.credits?.dailySignin?.amount || 10;

    const dashboardData: DashboardData = {
      user: {
        name: session.user.name ?? '用户',
        avatar: session.user.image ?? undefined,
        level: '加载中...', // 使用占位符
      },
      greeting,
      stats: {
        credits: 0, // 默认值，前端会异步加载
        analysisCount: 0,
        monthlyAnalysis: 0,
        totalUsers: 0,
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
          isSigned: false, // 默认未签到，前端会异步加载
          streak: 0,
          nextReward,
        },
        newbieMissions: {
          completed: 0,
          total: 5,
          progress: 0,
        },
      },
      recentAnalyses: [], // 空数组，前端会异步加载
    };

    console.log('[getDashboardDataFast] Returning fast minimal data');
    return dashboardData;
  } catch (error) {
    console.error(
      '[getDashboardDataFast] Failed to get fast dashboard data:',
      error
    );
    return null;
  }
}
