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
import { cn } from '@/lib/utils';
import {
  ArrowRightIcon,
  CalendarCheckIcon,
  CreditCardIcon,
  GiftIcon,
  ShareIcon,
  StarIcon,
  UserPlusIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

interface CreditsEarningGuideProps {
  className?: string;
}

/**
 * Credits earning guide component showing different ways to earn credits
 */
export function CreditsEarningGuide({ className }: CreditsEarningGuideProps) {
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
      <CardContent>
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
