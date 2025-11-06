'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  CalendarIcon,
  FlameIcon,
  TrophyIcon,
  TrendingUpIcon,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfWeek, addDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface EnhancedSignInCalendarProps {
  className?: string;
}

/**
 * 增强版签到日历 - 带热力图和里程碑进度
 */
export function EnhancedSignInCalendar({
  className,
}: EnhancedSignInCalendarProps) {
  // 获取签到历史
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['signin-history'],
    queryFn: async () => {
      const res = await fetch('/api/credits/signin-history?days=90');
      if (!res.ok) throw new Error('获取历史失败');
      return res.json();
    },
  });

  // 获取日常进度（用于里程碑）
  const { data: progressData, isLoading: progressLoading } = useQuery({
    queryKey: ['daily-progress'],
    queryFn: async () => {
      const res = await fetch('/api/credits/daily-progress');
      if (!res.ok) throw new Error('获取进度失败');
      return res.json();
    },
  });

  const isLoading = historyLoading || progressLoading;

  // 渲染热力图
  const renderHeatmap = () => {
    if (!historyData?.heatmapData) return null;

    // 只显示最近90天，按周分组
    const weeks: Array<Array<{ date: string; level: number; amount: number }>> =
      [];
    let currentWeek: Array<{ date: string; level: number; amount: number }> =
      [];

    historyData.heatmapData.forEach(
      (day: { date: string; level: number; amount: number }, index: number) => {
        const dayOfWeek = new Date(day.date).getDay();

        // 第一周可能不完整，前面补空格
        if (index === 0 && dayOfWeek !== 0) {
          for (let i = 0; i < dayOfWeek; i++) {
            currentWeek.push({ date: '', level: -1, amount: 0 });
          }
        }

        currentWeek.push(day);

        // 周六或最后一天，保存当前周
        if (dayOfWeek === 6 || index === historyData.heatmapData.length - 1) {
          weeks.push([...currentWeek]);
          currentWeek = [];
        }
      }
    );

    // 热力图颜色映射
    const getLevelColor = (level: number) => {
      if (level === -1) return 'bg-transparent'; // 空白
      if (level === 0) return 'bg-gray-100 border border-gray-200'; // 未签到
      if (level === 4) return 'bg-green-500'; // 已签到
      return 'bg-gray-100';
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">签到热力图（最近90天）</span>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">少</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-200" />
              <div className="w-3 h-3 rounded-sm bg-green-200" />
              <div className="w-3 h-3 rounded-sm bg-green-400" />
              <div className="w-3 h-3 rounded-sm bg-green-500" />
            </div>
            <span className="text-muted-foreground">多</span>
          </div>
        </div>

        {/* 热力图网格 */}
        <div className="overflow-x-auto">
          <div className="inline-flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={cn(
                      'w-3 h-3 rounded-sm transition-all hover:ring-2 hover:ring-primary/50',
                      getLevelColor(day.level)
                    )}
                    title={
                      day.level === 4
                        ? `${day.date}: +${day.amount} 积分`
                        : day.level === 0
                          ? `${day.date}: 未签到`
                          : ''
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* 周标签 */}
        <div className="flex gap-1 text-xs text-muted-foreground">
          <span className="w-8">周日</span>
          <span className="w-8">周一</span>
          <span className="w-8">周二</span>
          <span className="w-8">周三</span>
          <span className="w-8">周四</span>
          <span className="w-8">周五</span>
          <span className="w-8">周六</span>
        </div>
      </div>
    );
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          签到日历
        </CardTitle>
        <CardDescription>
          每日坚持签到，积累连续天数，赢取丰厚奖励
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 统计摘要 */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <FlameIcon className="h-3 w-3 text-orange-500" />
                当前连续
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {historyData?.stats.currentStreak || 0}
                <span className="text-sm text-muted-foreground ml-1">天</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUpIcon className="h-3 w-3 text-blue-500" />
                最长连续
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {historyData?.stats.maxStreak || 0}
                <span className="text-sm text-muted-foreground ml-1">天</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">累计签到</div>
              <div className="text-2xl font-bold">
                {historyData?.stats.totalDays || 0}
                <span className="text-sm text-muted-foreground ml-1">天</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">累计积分</div>
              <div className="text-2xl font-bold text-green-600">
                {historyData?.stats.totalCredits || 0}
              </div>
            </div>
          </div>
        )}

        {/* 热力图 */}
        {!isLoading && renderHeatmap()}

        {/* 里程碑进度 */}
        {!isLoading && progressData?.streak && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <TrophyIcon className="h-4 w-4 text-amber-500" />
              连续签到里程碑
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {progressData.streak.milestones
                .slice(0, 4)
                .map((milestone: any) => (
                  <div
                    key={milestone.days}
                    className={cn(
                      'border rounded-lg p-3 space-y-2 transition-all',
                      milestone.achieved
                        ? 'bg-green-50/50 border-green-300'
                        : 'hover:border-primary/30'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrophyIcon
                          className={cn(
                            'h-4 w-4',
                            milestone.achieved
                              ? 'text-amber-500'
                              : 'text-muted-foreground'
                          )}
                        />
                        <span className="text-sm font-medium">
                          {milestone.days} 天
                        </span>
                        {milestone.achieved && (
                          <Badge className="bg-green-500 text-white text-xs px-1 py-0">
                            ✓
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {milestone.reward}
                      </span>
                    </div>
                    <Progress
                      value={milestone.progress}
                      className={cn(
                        'h-1',
                        milestone.achieved && '[&>div]:bg-green-500'
                      )}
                    />
                  </div>
                ))}
            </div>

            {/* 下一个奖励预览 */}
            {progressData.streak.nextMilestone &&
              !progressData.streak.milestones[
                progressData.streak.milestones.length - 1
              ].achieved && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-amber-900">
                        🎁 下一个奖励
                      </div>
                      <div className="text-xs text-amber-700">
                        再签到{' '}
                        <span className="font-bold">
                          {progressData.streak.nextMilestone.daysLeft}
                        </span>{' '}
                        天即可获得{' '}
                        <span className="font-bold">
                          {progressData.streak.nextMilestone.reward}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">进度</div>
                      <div className="text-lg font-bold text-amber-700">
                        {Math.floor(progressData.streak.nextMilestone.progress)}%
                      </div>
                    </div>
                  </div>
                  <Progress
                    value={progressData.streak.nextMilestone.progress}
                    className="mt-3 h-2 [&>div]:bg-amber-500"
                  />
                </div>
              )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
