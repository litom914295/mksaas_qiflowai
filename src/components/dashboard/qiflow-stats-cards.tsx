'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  IconCalendar,
  IconFlame,
  IconMessageCircle,
  IconSparkles,
  IconTrendingDown,
  IconTrendingUp,
  IconYinYang,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';

type StatsData = {
  baziAnalysisCount: number;
  baziAnalysisTrend: number;
  fengshuiAnalysisCount: number;
  fengshuiAnalysisTrend: number;
  aiChatRounds: number;
  aiChatTrend: number;
  consecutiveSignIns: number;
  signInTrend: number;
};

export function QiFlowStatsCards() {
  const { data, isLoading } = useQuery<StatsData>({
    queryKey: ['qiflow-dashboard-stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  if (isLoading) {
    return <StatsCardsSkeleton />;
  }

  const stats = data || {
    baziAnalysisCount: 0,
    baziAnalysisTrend: 0,
    fengshuiAnalysisCount: 0,
    fengshuiAnalysisTrend: 0,
    aiChatRounds: 0,
    aiChatTrend: 0,
    consecutiveSignIns: 0,
    signInTrend: 0,
  };

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* 八字分析次数 */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>八字分析</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconYinYang className="h-6 w-6 text-purple-500" />
              {stats.baziAnalysisCount}
            </div>
            <Badge variant="outline" className="text-xs">
              {stats.baziAnalysisTrend >= 0 ? (
                <>
                  <IconTrendingUp className="h-3 w-3" />+
                  {stats.baziAnalysisTrend}%
                </>
              ) : (
                <>
                  <IconTrendingDown className="h-3 w-3" />
                  {stats.baziAnalysisTrend}%
                </>
              )}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.baziAnalysisTrend >= 0 ? '稳步增长中' : '需要提升'}
            {stats.baziAnalysisTrend >= 0 ? (
              <IconTrendingUp className="size-4 text-green-600" />
            ) : (
              <IconTrendingDown className="size-4 text-red-600" />
            )}
          </div>
          <div className="text-muted-foreground">本月累计分析次数</div>
        </CardFooter>
      </Card>

      {/* 风水分析次数 */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>风水分析</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconSparkles className="h-6 w-6 text-amber-500" />
              {stats.fengshuiAnalysisCount}
            </div>
            <Badge variant="outline" className="text-xs">
              {stats.fengshuiAnalysisTrend >= 0 ? (
                <>
                  <IconTrendingUp className="h-3 w-3" />+
                  {stats.fengshuiAnalysisTrend}%
                </>
              ) : (
                <>
                  <IconTrendingDown className="h-3 w-3" />
                  {stats.fengshuiAnalysisTrend}%
                </>
              )}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.fengshuiAnalysisTrend >= 0 ? '持续上升' : '有待改善'}
            {stats.fengshuiAnalysisTrend >= 0 ? (
              <IconTrendingUp className="size-4 text-green-600" />
            ) : (
              <IconTrendingDown className="size-4 text-red-600" />
            )}
          </div>
          <div className="text-muted-foreground">本月累计分析次数</div>
        </CardFooter>
      </Card>

      {/* AI对话轮数 */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>AI对话</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconMessageCircle className="h-6 w-6 text-blue-500" />
              {stats.aiChatRounds}
            </div>
            <Badge variant="outline" className="text-xs">
              {stats.aiChatTrend >= 0 ? (
                <>
                  <IconTrendingUp className="h-3 w-3" />+{stats.aiChatTrend}%
                </>
              ) : (
                <>
                  <IconTrendingDown className="h-3 w-3" />
                  {stats.aiChatTrend}%
                </>
              )}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.aiChatTrend >= 0 ? '活跃互动中' : '使用频率下降'}
            {stats.aiChatTrend >= 0 ? (
              <IconTrendingUp className="size-4 text-green-600" />
            ) : (
              <IconTrendingDown className="size-4 text-red-600" />
            )}
          </div>
          <div className="text-muted-foreground">本月AI对话轮数</div>
        </CardFooter>
      </Card>

      {/* 连续签到天数 */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>连续签到</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconFlame className="h-6 w-6 text-orange-500" />
              {stats.consecutiveSignIns} 天
            </div>
            <Badge variant="outline" className="text-xs">
              <IconCalendar className="h-3 w-3" />
              本月已签 {stats.consecutiveSignIns} 天
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.consecutiveSignIns >= 7 ? '坚持不懈' : '继续加油'}
            <IconFlame
              className={`size-4 ${stats.consecutiveSignIns >= 7 ? 'text-orange-500' : 'text-gray-400'}`}
            />
          </div>
          <div className="text-muted-foreground">
            {stats.consecutiveSignIns >= 30
              ? '已达成月度签到！'
              : `距离下一个里程碑还有 ${Math.ceil((7 - (stats.consecutiveSignIns % 7)) % 7 || 7)} 天`}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="@container/card">
          <CardHeader>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-32" />
          </CardHeader>
          <CardFooter>
            <Skeleton className="h-4 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
