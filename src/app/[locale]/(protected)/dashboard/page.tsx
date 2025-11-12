// 临时使用快速版本解决数据库超时问题
import { getDashboardDataFast as getDashboardData } from '@/app/actions/dashboard/get-dashboard-data-fast';
// import { getDashboardData } from '@/app/actions/dashboard/get-dashboard-data';
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton';
import ActivitySection from '@/components/dashboard/personal/activity-section';
import QuickActionsGrid from '@/components/dashboard/personal/quick-actions';
import StatsGrid from '@/components/dashboard/personal/stats-grid';
import WelcomeBanner from '@/components/dashboard/personal/welcome-banner';
import { Skeleton } from '@/components/ui/skeleton';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { EnhancedSignInCalendar } from '@/components/daily-signin/enhanced-signin-calendar';
import { ActivityChart } from '@/components/dashboard/activity-chart';
import { EnhancedCreditsEarningGuide } from '@/components/dashboard/credits/enhanced-credits-earning-guide';
// 新增优化组件
import { QiFlowStatsCardsServer } from '@/components/dashboard/qiflow-stats-cards-server';

// 注意：骨架屏组件已移动到 @/components/dashboard/dashboard-skeleton.tsx

// Next.js 缓存配置 - 5分钟重新验证
export const revalidate = 300;

// 错误边界组件
function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8 dark:border-red-800 dark:bg-red-900/20">
      <h2 className="mb-2 text-xl font-semibold text-red-600 dark:text-red-400">
        加载失败
      </h2>
      <p className="text-center text-sm text-red-600 dark:text-red-400">
        {error?.message || '无法加载仪表盘数据，请稍后重试'}
      </p>
    </div>
  );
}

/**
 * Personal Dashboard Page - Now the main dashboard
 *
 * Provides a comprehensive personal management interface with:
 * - Welcome banner with user information
 * - Statistics cards showing key metrics
 * - Quick action buttons for common tasks
 * - Activity center with recent user activities
 * - Recent analysis records preview
 */
export default async function DashboardPage() {
  try {
    // 获取仪表盘数据
    const dashboardData = await getDashboardData();

    if (!dashboardData) {
      notFound();
    }

    return (
      <div className="h-full overflow-auto">
        <div className="container mx-auto max-w-7xl space-y-6 p-6">
          {/* 页面标题 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">个人中心</h1>
            <p className="mt-2 text-muted-foreground">
              管理您的账户、查看数据统计和探索更多功能
            </p>
          </div>

          {/* 欢迎横幅 */}
          <Suspense fallback={<Skeleton className="h-32 w-full rounded-lg" />}>
            <WelcomeBanner
              userName={dashboardData.user.name}
              userAvatar={dashboardData.user.avatar}
              userLevel={dashboardData.user.level}
              greeting={dashboardData.greeting}
            />
          </Suspense>

          {/* 核心数据卡片（新增）- 服务端渲染优化首屏 */}
          <Suspense
            fallback={
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-32 rounded-lg" />
                ))}
              </div>
            }
          >
            <QiFlowStatsCardsServer />
          </Suspense>

          {/* 活动趋势图表（新增） */}
          <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
            <ActivityChart />
          </Suspense>

          {/* 签到日历 + 积分指南（新增） */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Suspense fallback={<Skeleton className="h-[600px] rounded-lg" />}>
              <EnhancedSignInCalendar />
            </Suspense>
            <Suspense fallback={<Skeleton className="h-[600px] rounded-lg" />}>
              <EnhancedCreditsEarningGuide />
            </Suspense>
          </div>

          {/* 快速入口 */}
          <Suspense fallback={<Skeleton className="h-48 w-full rounded-lg" />}>
            <QuickActionsGrid />
          </Suspense>

          {/* 统计数据网格（原有组件，可选保留） */}
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              展开查看原统计数据
            </summary>
            <Suspense
              fallback={
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-32 rounded-lg" />
                  ))}
                </div>
              }
            >
              <div className="mt-4">
                <StatsGrid stats={dashboardData.stats} />
              </div>
            </Suspense>
          </details>

          {/* 活动中心（原有组件，可选保留） */}
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              展开查看活动历史
            </summary>
            <Suspense
              fallback={
                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <Skeleton className="h-80 rounded-lg" />
                  <Skeleton className="h-80 rounded-lg" />
                </div>
              }
            >
              <div className="mt-4">
                <ActivitySection activities={dashboardData.activities} />
              </div>
            </Suspense>
          </details>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    return <ErrorBoundary error={error as Error} />;
  }
}
