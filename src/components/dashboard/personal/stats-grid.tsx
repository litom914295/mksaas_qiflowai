'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  CreditCard,
  Package,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import CountUp from 'react-countup';

type StatsGridProps = {
  stats:
    | {
        credits?: number;
        analysisCount?: number;
        monthlyAnalysis?: number;
        totalUsers?: number;
      }
    | any;
};

export default function StatsGrid({ stats }: StatsGridProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 计算增长率（模拟数据）
  const growthRate =
    stats.monthlyAnalysis && stats.analysisCount
      ? Math.round((stats.monthlyAnalysis / stats.analysisCount) * 100 - 100)
      : 0;

  const statsCards = [
    {
      title: '积分余额',
      value: stats.credits || 0,
      icon: <CreditCard className="h-8 w-8" />,
      color: 'from-purple-500 to-pink-500',
      trend: null,
      link: '/zh-CN/settings/credits',
      suffix: '',
      description: '可用积分',
    },
    {
      title: '总分析次数',
      value: stats.analysisCount || 0,
      icon: <Activity className="h-8 w-8" />,
      color: 'from-blue-500 to-cyan-500',
      trend: null,
      suffix: '次',
      description: '累计分析',
    },
    {
      title: '本月分析',
      value: stats.monthlyAnalysis || 0,
      icon: <Package className="h-8 w-8" />,
      color: 'from-green-500 to-emerald-500',
      trend: growthRate > 0 ? `+${growthRate}%` : `${growthRate}%`,
      trendType: growthRate >= 0 ? 'up' : 'down',
      suffix: '次',
      description: '当月使用',
    },
    {
      title: '平台用户',
      value: stats.totalUsers || 0,
      icon: <TrendingUp className="h-8 w-8" />,
      color: 'from-orange-500 to-red-500',
      trend: null,
      suffix: '',
      description: '活跃用户',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
          whileHover={{ scale: 1.02 }}
          className="group"
        >
          <Card className="relative overflow-hidden border-0 shadow-lg transition-all hover:shadow-xl">
            {/* 渐变背景 */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-5 group-hover:opacity-10 transition-opacity`}
            />

            <CardHeader className="relative pb-2">
              <div className="flex items-start justify-between">
                {/* 图标容器 */}
                <div
                  className={`rounded-xl bg-gradient-to-br ${card.color} p-3 text-white shadow-lg`}
                >
                  {card.icon}
                </div>

                {/* 趋势标签 */}
                {card.trend && card.trendType && (
                  <Badge
                    variant="outline"
                    className={
                      card.trendType === 'up'
                        ? 'border-green-500 text-green-600'
                        : 'border-red-500 text-red-600'
                    }
                  >
                    {card.trendType === 'up' ? (
                      <TrendingUp className="mr-1 h-3 w-3" />
                    ) : (
                      <TrendingDown className="mr-1 h-3 w-3" />
                    )}
                    {card.trend}
                  </Badge>
                )}
                {card.trend && !card.trendType && (
                  <span className="text-xs text-muted-foreground">
                    {card.trend}
                  </span>
                )}
              </div>

              <CardDescription className="mt-3 text-xs font-medium uppercase tracking-wider">
                {card.title}
              </CardDescription>
            </CardHeader>

            <CardContent className="relative">
              <div className="flex items-baseline gap-1">
                <p className="text-3xl font-bold">
                  {isMounted ? (
                    <CountUp
                      start={0}
                      end={card.value || 0}
                      duration={1.5}
                      separator=","
                    />
                  ) : (
                    (card.value || 0).toLocaleString()
                  )}
                </p>
                <span className="text-lg font-medium text-muted-foreground">
                  {card.suffix}
                </span>
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                {card.description}
              </p>

              {/* 链接指示器 */}
              {card.link && (
                <Link href={card.link} className="group/link">
                  <div className="mt-3 flex items-center text-xs font-medium text-muted-foreground transition-colors hover:text-primary">
                    查看详情
                    <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover/link:translate-x-1" />
                  </div>
                </Link>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
