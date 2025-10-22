import { getDashboardData } from '@/app/actions/dashboard/get-dashboard-data';
import ActivitySection from '@/components/dashboard/personal/activity-section';
import QuickActions from '@/components/dashboard/personal/quick-actions';
import StatsGrid from '@/components/dashboard/personal/stats-grid';
import WelcomeBanner from '@/components/dashboard/personal/welcome-banner';
import { Skeleton } from '@/components/ui/skeleton';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

// 加载骨架屏组件
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Banner Skeleton */}
      <Skeleton className="h-32 w-full rounded-lg" />

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <Skeleton className="h-48 w-full rounded-lg" />

      {/* Activity Section Skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-lg" />
        <Skeleton className="h-80 rounded-lg" />
      </div>
    </div>
  );
}

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

// 主页面组件
export default async function PersonalDashboardPage() {
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

          {/* 统计数据网格 */}
          <Suspense
            fallback={
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-32 rounded-lg" />
                ))}
              </div>
            }
          >
            <StatsGrid stats={dashboardData.stats} />
          </Suspense>

          {/* 快速入口 */}
          <Suspense fallback={<Skeleton className="h-48 w-full rounded-lg" />}>
            <QuickActions />
          </Suspense>

          {/* 活动中心 */}
          <Suspense
            fallback={
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Skeleton className="h-80 rounded-lg" />
                <Skeleton className="h-80 rounded-lg" />
              </div>
            }
          >
            <ActivitySection activities={dashboardData.activities} />
          </Suspense>

          {/* 最近分析记录 - 预留位置 */}
          <section className="mt-8">
            <h2 className="mb-4 text-xl font-semibold">最近分析</h2>
            <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
              <p>暂无分析记录</p>
              <p className="mt-2 text-sm">
                开始使用 QiFlow AI 进行您的第一次分析吧！
              </p>
            </div>
          </section>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    return <ErrorBoundary error={error as Error} />;
  }
}
