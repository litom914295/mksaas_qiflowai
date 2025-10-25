'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Coins, TrendingUp, Users } from 'lucide-react';

interface DashboardStats {
  credits: number;
  analysisCount: number;
  monthlyAnalysis: number;
  totalUsers: number;
}

interface StatsGridProps {
  stats: DashboardStats;
}

export default function StatsGrid({ stats }: StatsGridProps) {
  // 安全地访问数据，使用默认值防止 undefined
  const credits = stats?.credits ?? 0;
  const analysisCount = stats?.analysisCount ?? 0;
  const monthlyAnalysis = stats?.monthlyAnalysis ?? 0;
  const totalUsers = stats?.totalUsers ?? 0;

  const statsData = [
    {
      title: '剩余积分',
      value: credits.toLocaleString(),
      icon: Coins,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: '总分析次数',
      value: analysisCount.toLocaleString(),
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: '本月分析',
      value: monthlyAnalysis.toLocaleString(),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      title: '平台用户',
      value: totalUsers.toLocaleString(),
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.title === '剩余积分' && (
                <p className="mt-1 text-xs text-muted-foreground">
                  可用于分析服务
                </p>
              )}
              {stat.title === '本月分析' && (
                <p className="mt-1 text-xs text-muted-foreground">
                  较上月增长 12%
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
