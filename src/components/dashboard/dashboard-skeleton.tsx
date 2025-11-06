import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * 仪表盘加载骨架屏
 * 用于在数据加载时显示占位符，提升用户体验
 */
export function DashboardSkeleton() {
  return (
    <div className="h-full overflow-auto">
      <div className="container mx-auto max-w-7xl space-y-6 p-6">
        {/* 页面标题骨架 */}
        <div className="mb-8 space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-96" />
        </div>

        {/* 欢迎横幅骨架 */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </Card>

        {/* 统计数据网格骨架 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-5 rounded" />
                </div>
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </Card>
          ))}
        </div>

        {/* 快速入口骨架 */}
        <Card className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-3 rounded-lg border border-border p-4"
                >
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* 活动中心骨架 */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* 每日签到卡片骨架 */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-5 rounded" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-20 w-full rounded-lg" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-10 w-full rounded" />
            </div>
          </Card>

          {/* 新手任务卡片骨架 */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-5 rounded" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* 最近分析记录骨架 */}
        <div className="mt-8 space-y-4">
          <Skeleton className="h-7 w-32" />
          <Card className="p-8">
            <div className="space-y-3 text-center">
              <Skeleton className="mx-auto h-6 w-48" />
              <Skeleton className="mx-auto h-4 w-64" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
