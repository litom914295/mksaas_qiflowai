'use client';
import React from 'react';

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
  GiftIcon,
  ShareIcon,
  StarIcon,
  TrophyIcon,
  UserPlusIcon,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface CreditsEarningGuideProps {
  className?: string;
}

/**
 * Credits earning guide component showing different ways to earn credits
 */
export function CreditsEarningGuide({ className }: CreditsEarningGuideProps) {
  // 获取日常任务进度
  const { data: progressData, isLoading } = useQuery({
    queryKey: ['daily-progress'],
    queryFn: async () => {
      const res = await fetch('/api/credits/daily-progress');
      if (!res.ok) throw new Error('获取进度失败');
      return res.json();
    },
    refetchInterval: 30000, // 每30秒刷新一次
  });

  const earningMethods = [
    {
      id: 'daily-signin',
      icon: CalendarCheckIcon,
      title: '每日签到',
      description: '每天签到即可获得免费积分，连续签到奖励更丰厚',
      credits: '10-30',
      difficulty: 'easy',
      status: 'active',
      action: {
        label: '立即签到',
        href: '/dashboard', // 这里可以触发签到功能
      },
    },
    {
      id: 'referral',
      icon: UserPlusIcon,
      title: '邀请好友',
      description: '邀请新用户注册并完成首次充值，双方均可获得积分奖励',
      credits: '100',
      difficulty: 'medium',
      status: 'active',
      action: {
        label: '邀请朋友',
        href: '/referral',
      },
    },
    {
      id: 'social-share',
      icon: ShareIcon,
      title: '社交分享',
      description: '分享分析结果到社交媒体，让更多人了解精彩内容',
      credits: '10',
      difficulty: 'easy',
      status: 'active',
      action: {
        label: '去分享',
        href: '/analysis',
      },
    },
    {
      id: 'purchase',
      icon: CreditCardIcon,
      title: '直接购买',
      description: '购买积分套餐，立即到账，尽享全部功能',
      credits: '1000+',
      difficulty: 'easy',
      status: 'active',
      action: {
        label: '购买积分',
        href: '/settings/credits',
      },
    },
    {
      id: 'feedback',
      icon: StarIcon,
      title: '产品反馈',
      description: '提供有价值的产品改进建议或使用体验反馈',
      credits: '50',
      difficulty: 'medium',
      status: 'active',
      action: {
        label: '提交反馈',
        href: '/feedback',
      },
    },
    {
      id: 'events',
      icon: GiftIcon,
      title: '活动奖励',
      description: '参与节日活动和特殊事件，赢取限定积分大奖',
      credits: '不定',
      difficulty: 'easy',
      status: 'upcoming',
      action: {
        label: '查看活动',
        href: '/events',
      },
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'upcoming':
        return 'bg-blue-500';
      case 'expired':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '简单';
      case 'medium':
        return '中等';
      case 'hard':
        return '困难';
      default:
        return '简单';
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <GiftIcon className="h-5 w-5 text-primary" />
          积分获取指南
        </CardTitle>
        <CardDescription>
          通过以下方式轻松获得积分，解锁更多精彩服务
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
              <div
                className={cn(
                  'border rounded-lg p-4 space-y-3 transition-all',
                  progressData?.tasks.dailySignIn.urgent &&
                    'border-orange-300 bg-orange-50/50 shadow-sm'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarCheckIcon className="h-4 w-4 text-orange-600" />
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
                  className="h-2"
                />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {progressData?.tasks.dailySignIn.description}
                  </span>
                  <span className="font-semibold text-green-600">
                    {progressData?.tasks.dailySignIn.credits}
                  </span>
                </div>
              </div>

              {/* 八字分析 */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StarIcon className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">八字分析</span>
                  </div>
                  {progressData?.tasks.baziAnalysis.completed && (
                    <CheckCircle2Icon className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <Progress
                  value={progressData?.tasks.baziAnalysis.progress || 0}
                  className="h-2"
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
              </div>

              {/* 风水分析 */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrophyIcon className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium">风水分析</span>
                  </div>
                  {progressData?.tasks.fengshuiAnalysis.completed && (
                    <CheckCircle2Icon className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <Progress
                  value={progressData?.tasks.fengshuiAnalysis.progress || 0}
                  className="h-2"
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
              </div>

              {/* AI对话 */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShareIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">AI对话</span>
                  </div>
                  {progressData?.tasks.aiChat.completed && (
                    <CheckCircle2Icon className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <Progress
                  value={progressData?.tasks.aiChat.progress || 0}
                  className="h-2"
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
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <TrophyIcon className="h-4 w-4" />
              连续签到里程碑 (当前 {progressData.streak.current} 天)
            </h3>
            <div className="space-y-3">
              {progressData.streak.milestones.map((milestone: any) => (
                <div
                  key={milestone.days}
                  className={cn(
                    'border rounded-lg p-3 transition-all',
                    milestone.achieved
                      ? 'bg-green-50/50 border-green-300'
                      : 'hover:border-primary/50'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {milestone.days} 天里程碑
                      </span>
                      {milestone.achieved && (
                        <Badge className="bg-green-500 text-white text-xs px-1.5 py-0">
                          已达成
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
                      'h-1.5',
                      milestone.achieved && '[&>div]:bg-green-500'
                    )}
                  />
                </div>
              ))}
            </div>

            {/* 下一个里程碑预览 */}
            {progressData.streak.nextMilestone &&
              !progressData.streak.milestones[progressData.streak.milestones.length - 1].achieved && (
                <div className="bg-gradient-to-r from-primary/10 to-purple-100 border border-primary/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <TrophyIcon className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <h4 className="text-sm font-medium">下一个里程碑</h4>
                      <p className="text-sm text-muted-foreground">
                        再签到 <span className="font-semibold text-primary">{progressData.streak.nextMilestone.daysLeft}</span> 天即可获得{' '}
                        <span className="font-semibold text-primary">
                          {progressData.streak.nextMilestone.reward}
                        </span>
                      </p>
                      <Progress
                        value={progressData.streak.nextMilestone.progress}
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
              )}
          </div>
        )}

        {/* 其他获取方式 */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <GiftIcon className="h-4 w-4" />
            更多获取方式
          </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {earningMethods.map((method) => {
            const Icon = method.icon;
            return (
              <div
                key={method.id}
                className="relative border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow"
              >
                {/* Status indicator */}
                <div className="absolute top-3 right-3">
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full',
                      getStatusColor(method.status)
                    )}
                  />
                </div>

                {/* Icon and Title */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{method.title}</h4>
                      <Badge
                        variant="secondary"
                        className={cn(
                          'text-xs px-2 py-0.5',
                          getDifficultyColor(method.difficulty)
                        )}
                      >
                        {getDifficultyText(method.difficulty)}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {method.description}
                  </p>
                </div>

                {/* Credits amount */}
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-muted-foreground">可获得: </span>
                    <span className="font-semibold text-primary">
                      {method.credits} 积分
                    </span>
                  </div>
                </div>

                {/* Action button */}
                <Button
                  variant={method.status === 'active' ? 'default' : 'secondary'}
                  size="sm"
                  className="w-full"
                  disabled={method.status !== 'active'}
                  onClick={() => {
                    if (method.action.href.startsWith('/')) {
                      window.location.href = method.action.href;
                    }
                  }}
                >
                  {method.action.label}
                  <ArrowRightIcon className="h-3 w-3 ml-2" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* Tips section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <GiftIcon className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-blue-900">
                💡 获取积分小贴士
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 每日坚持签到，可获得连续签到奖励加成，最高可达30积分</li>
                <li>• 邀请朋友注册并充值，双方各得50积分，共计100积分奖励</li>
                <li>• 每日可分享5次，每次获10积分，每日最多50积分</li>
                <li>• 积分有效期为30天，请及时使用避免过期浪费</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
