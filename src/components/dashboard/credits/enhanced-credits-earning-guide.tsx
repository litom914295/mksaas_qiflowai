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
  ArrowRightIcon,
  CalendarCheckIcon,
  CheckCircle2Icon,
  CreditCardIcon,
  FlameIcon,
  GiftIcon,
  MessageSquareIcon,
  SparklesIcon,
  TrophyIcon,
  WindIcon,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

interface EnhancedCreditsEarningGuideProps {
  className?: string;
}

/**
 * 增强版积分获取指南 - 显示实时任务进度和里程碑
 */
export function EnhancedCreditsEarningGuide({
  className,
}: EnhancedCreditsEarningGuideProps) {
  // 获取日常任务进度
  const { data: progressData, isLoading } = useQuery({
    queryKey: ['daily-progress'],
    queryFn: async () => {
      const res = await fetch('/api/credits/daily-progress');
      if (!res.ok) throw new Error('获取进度失败');
      return res.json();
    },
    refetchInterval: 30000, // 每30秒刷新
  });

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <GiftIcon className="h-5 w-5 text-primary" />
          积分获取指南
        </CardTitle>
        <CardDescription>
          完成每日任务获取积分，达成连续签到里程碑赢取丰厚奖励
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 今日任务进度 */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <CalendarCheckIcon className="h-4 w-4" />
            今日任务进度
          </h3>
          {isLoading ? (
            <div className="grid gap-3 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border rounded-lg p-4 space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {/* 每日签到 */}
              <Link
                href="/dashboard"
                className={cn(
                  'border rounded-lg p-4 space-y-3 transition-all hover:shadow-md',
                  progressData?.tasks.dailySignIn.urgent &&
                    'border-orange-300 bg-orange-50/50 shadow-sm ring-2 ring-orange-200'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-orange-100 p-1.5 rounded">
                      <FlameIcon className="h-4 w-4 text-orange-600" />
                    </div>
                    <span className="text-sm font-medium">每日签到</span>
                    {progressData?.tasks.dailySignIn.urgent && (
                      <Badge className="bg-orange-500 text-white text-xs px-1.5 py-0">
                        未完成
                      </Badge>
                    )}
                  </div>
                  {progressData?.tasks.dailySignIn.completed && (
                    <CheckCircle2Icon className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <Progress
                  value={progressData?.tasks.dailySignIn.progress || 0}
                  className="h-2 [&>div]:bg-orange-500"
                />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {progressData?.tasks.dailySignIn.description}
                  </span>
                  <span className="font-semibold text-green-600">
                    {progressData?.tasks.dailySignIn.credits}
                  </span>
                </div>
              </Link>

              {/* 八字分析 */}
              <Link
                href="/bazi"
                className="border rounded-lg p-4 space-y-3 transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-purple-100 p-1.5 rounded">
                      <SparklesIcon className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium">八字分析</span>
                  </div>
                  {progressData?.tasks.baziAnalysis.completed && (
                    <CheckCircle2Icon className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <Progress
                  value={progressData?.tasks.baziAnalysis.progress || 0}
                  className="h-2 [&>div]:bg-purple-500"
                />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {progressData?.tasks.baziAnalysis.current || 0} /{' '}
                    {progressData?.tasks.baziAnalysis.goal || 1} 次
                  </span>
                  <span className="font-semibold text-red-600">
                    {progressData?.tasks.baziAnalysis.credits}
                  </span>
                </div>
              </Link>

              {/* 风水分析 */}
              <Link
                href="/fengshui"
                className="border rounded-lg p-4 space-y-3 transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-amber-100 p-1.5 rounded">
                      <WindIcon className="h-4 w-4 text-amber-600" />
                    </div>
                    <span className="text-sm font-medium">风水分析</span>
                  </div>
                  {progressData?.tasks.fengshuiAnalysis.completed && (
                    <CheckCircle2Icon className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <Progress
                  value={progressData?.tasks.fengshuiAnalysis.progress || 0}
                  className="h-2 [&>div]:bg-amber-500"
                />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {progressData?.tasks.fengshuiAnalysis.current || 0} /{' '}
                    {progressData?.tasks.fengshuiAnalysis.goal || 1} 次
                  </span>
                  <span className="font-semibold text-red-600">
                    {progressData?.tasks.fengshuiAnalysis.credits}
                  </span>
                </div>
              </Link>

              {/* AI对话 */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 p-1.5 rounded">
                      <MessageSquareIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium">AI对话</span>
                  </div>
                  {progressData?.tasks.aiChat.completed && (
                    <CheckCircle2Icon className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <Progress
                  value={progressData?.tasks.aiChat.progress || 0}
                  className="h-2 [&>div]:bg-blue-500"
                />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {progressData?.tasks.aiChat.current || 0} /{' '}
                    {progressData?.tasks.aiChat.goal || 5} 轮
                  </span>
                  <span className="font-semibold text-red-600">
                    {progressData?.tasks.aiChat.credits}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 签到里程碑进度 */}
        {!isLoading && progressData?.streak && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <TrophyIcon className="h-4 w-4 text-amber-500" />
                连续签到里程碑
              </h3>
              <Badge variant="secondary" className="text-xs">
                <FlameIcon className="h-3 w-3 mr-1 text-orange-500" />
                已连续 {progressData.streak.current} 天
              </Badge>
            </div>

            <div className="space-y-2">
              {progressData.streak.milestones.map((milestone: any) => (
                <div
                  key={milestone.days}
                  className={cn(
                    'border rounded-lg p-3 transition-all',
                    milestone.achieved
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
                      : 'hover:border-primary/50'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
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
                        {milestone.days} 天里程碑
                      </span>
                      {milestone.achieved && (
                        <Badge className="bg-green-500 text-white text-xs px-1.5 py-0">
                          ✓ 已达成
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs font-medium text-amber-700">
                      {milestone.reward}
                    </span>
                  </div>
                  <Progress
                    value={milestone.progress}
                    className={cn(
                      'h-1.5',
                      milestone.achieved && '[&>div]:bg-green-500'
                    )}
                  />
                  <div className="flex justify-between items-center mt-1.5">
                    <span className="text-xs text-muted-foreground">
                      {Math.floor(milestone.progress)}% 完成
                    </span>
                    {!milestone.achieved && (
                      <span className="text-xs text-muted-foreground">
                        还需 {milestone.days - progressData.streak.current} 天
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 下一个里程碑预览 */}
            {progressData.streak.nextMilestone &&
              !progressData.streak.milestones[
                progressData.streak.milestones.length - 1
              ].achieved && (
                <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border-2 border-amber-300 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-500/10 p-2 rounded-lg">
                      <TrophyIcon className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h4 className="text-sm font-semibold text-amber-900">
                        🎯 下一个里程碑奖励
                      </h4>
                      <p className="text-sm text-amber-800">
                        再坚持签到{' '}
                        <span className="font-bold text-amber-900">
                          {progressData.streak.nextMilestone.daysLeft}
                        </span>{' '}
                        天，即可获得{' '}
                        <span className="font-bold text-amber-900">
                          {progressData.streak.nextMilestone.reward}
                        </span>
                      </p>
                      <Progress
                        value={progressData.streak.nextMilestone.progress}
                        className="h-2 [&>div]:bg-amber-500"
                      />
                      <div className="flex justify-between items-center text-xs text-amber-700">
                        <span>
                          {Math.floor(
                            progressData.streak.nextMilestone.progress
                          )}
                          % 完成
                        </span>
                        <span className="font-medium">
                          {progressData.streak.current} /{' '}
                          {progressData.streak.nextMilestone.days} 天
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>
        )}

        {/* 其他获取方式 */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <CreditCardIcon className="h-4 w-4" />
            更多获取方式
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/settings/credits"
              className="border rounded-lg p-4 space-y-2 hover:shadow-md transition-all hover:border-primary/50"
            >
              <div className="flex items-center gap-2">
                <div className="bg-green-100 p-1.5 rounded">
                  <CreditCardIcon className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm font-medium">购买积分</span>
              </div>
              <p className="text-xs text-muted-foreground">
                多种套餐可选，立即到账
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-green-600">
                  100+ 积分
                </span>
                <ArrowRightIcon className="h-3 w-3 text-muted-foreground" />
              </div>
            </Link>

            <div className="border border-dashed rounded-lg p-4 space-y-2 opacity-60">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 p-1.5 rounded">
                  <GiftIcon className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium">邀请好友</span>
                <Badge variant="secondary" className="text-xs">
                  即将上线
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                邀请好友注册，双方获得积分
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-600">
                  50 积分/人
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 温馨提示 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <GiftIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-blue-900">
                💡 积分使用提示
              </h4>
              <ul className="text-xs text-blue-800 space-y-1.5">
                <li>• 每日签到获取 5-20 随机积分，连续签到奖励翻倍</li>
                <li>• 八字分析消耗 10 积分，风水分析消耗 20 积分</li>
                <li>• AI对话每轮消耗 5 积分，深度解读消耗 30 积分</li>
                <li>• 达成连续签到里程碑可获得免费分析券或对话轮次</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
