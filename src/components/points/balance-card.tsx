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
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Coins,
  Plus,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

type BalanceCardProps = {
  balance: {
    current: number;
    total: number;
    used: number;
    expiring: number;
    expiringDate: string;
  };
  trend: {
    percentage: number;
    direction: 'up' | 'down' | 'stable';
  };
};

export default function BalanceCard({ balance, trend }: BalanceCardProps) {
  const usagePercentage = (balance.used / balance.total) * 100;
  const remainingPercentage =
    ((balance.total - balance.used) / balance.total) * 100;

  // 根据余额情况确定颜色主题
  const getBalanceStatus = () => {
    const ratio = balance.current / balance.total;
    if (ratio > 0.5) return { color: 'green', label: '充足', icon: '🎉' };
    if (ratio > 0.2) return { color: 'yellow', label: '适中', icon: '⚠️' };
    return { color: 'red', label: '不足', icon: '🚨' };
  };

  const status = getBalanceStatus();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 p-2">
                <Coins className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">积分余额</CardTitle>
                <CardDescription>管理您的QiFlow积分</CardDescription>
              </div>
            </div>
            <Badge
              variant={
                status.color === 'green'
                  ? 'default'
                  : status.color === 'yellow'
                    ? 'secondary'
                    : 'destructive'
              }
              className="text-sm"
            >
              {status.icon} {status.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 当前余额显示 */}
          <div className="rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 p-6 dark:from-amber-900/20 dark:to-orange-900/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">当前余额</p>
                <p className="mt-1 text-4xl font-bold text-amber-600 dark:text-amber-500">
                  {balance.current.toLocaleString()}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  {trend.direction === 'up' ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        +{trend.percentage}%
                      </span>
                    </div>
                  ) : trend.direction === 'down' ? (
                    <div className="flex items-center gap-1 text-red-600">
                      <TrendingDown className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        -{trend.percentage}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">持平</span>
                  )}
                  <span className="text-sm text-muted-foreground">较上月</span>
                </div>
              </div>
              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                充值
              </Button>
            </div>
          </div>

          {/* 使用情况 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">使用情况</span>
              <span className="font-medium">
                {balance.used}/{balance.total}
              </span>
            </div>
            <div className="relative h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${usagePercentage}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-amber-500 to-orange-500"
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${remainingPercentage}%` }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="absolute right-0 top-0 h-full bg-gray-300 dark:bg-gray-600"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500" />
                <span className="text-muted-foreground">
                  已使用 {usagePercentage.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-600" />
                <span className="text-muted-foreground">
                  剩余 {remainingPercentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* 即将过期提醒 */}
          {balance.expiring > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-900 dark:text-orange-300">
                    积分即将过期
                  </p>
                  <p className="mt-1 text-sm text-orange-700 dark:text-orange-400">
                    您有 {balance.expiring} 积分将于 {balance.expiringDate}{' '}
                    过期，请尽快使用
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* 快捷操作 */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full">
              查看明细
            </Button>
            <Button variant="outline" className="w-full">
              兑换记录
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
