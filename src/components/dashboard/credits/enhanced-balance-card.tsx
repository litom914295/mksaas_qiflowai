'use client';

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
import { websiteConfig } from '@/config/website';
import { useCreditBalance, useCreditStats } from '@/hooks/use-credits';
import { useMounted } from '@/hooks/use-mounted';
import { CREDITS_EXPIRATION_DAYS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import {
  AlertTriangleIcon,
  CalendarIcon,
  CoinsIcon,
  GiftIcon,
  RefreshCwIcon,
  ShoppingCartIcon,
  TrendingUpIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';

interface EnhancedBalanceCardProps {
  className?: string;
}

/**
 * Enhanced credits balance card with more features and better UI
 */
export function EnhancedBalanceCard({ className }: EnhancedBalanceCardProps) {
  const t = useTranslations('Dashboard.settings.credits.balance');
  const mounted = useMounted();

  // Use TanStack Query hooks for credits
  const {
    data: balance = 0,
    isLoading: isLoadingBalance,
    error: balanceError,
    refetch: refetchBalance,
  } = useCreditBalance();

  // TanStack Query hook for credit statistics
  const {
    data: creditStats,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats,
  } = useCreditStats();

  // Retry all data fetching
  const handleRetry = useCallback(() => {
    refetchBalance();
    refetchStats();
  }, [refetchBalance, refetchStats]);

  // Don't render if credits are disabled
  if (!websiteConfig.credits.enableCredits) {
    return null;
  }

  // Render loading skeleton
  if (!mounted || isLoadingBalance || isLoadingStats) {
    return (
      <Card className={cn('w-full h-fit', className)}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (balanceError || statsError) {
    return (
      <Card className={cn('w-full h-fit border-destructive/50', className)}>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangleIcon className="h-5 w-5 text-destructive" />
            {t('title')}
          </CardTitle>
          <CardDescription className="text-destructive">
            加载失败，请重试
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleRetry} className="w-full">
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            重试
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Calculate usage statistics
  const totalCreditsUsed = creditStats?.totalCreditsUsed || 0;
  const totalCreditsEarned =
    creditStats?.totalCreditsEarned || balance + totalCreditsUsed;
  const usagePercentage =
    totalCreditsEarned > 0 ? (totalCreditsUsed / totalCreditsEarned) * 100 : 0;

  return (
    <Card className={cn('w-full h-fit overflow-hidden', className)}>
      {/* Header */}
      <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CoinsIcon className="h-5 w-5 text-primary" />
              {t('title')}
            </CardTitle>
            <CardDescription>管理您的积分余额和使用情况</CardDescription>
          </div>
          <div className="bg-primary/10 p-3 rounded-full">
            <CoinsIcon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="space-y-6">
        {/* Current Balance */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary">
              {balance.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">积分</span>
          </div>
          <div className="text-sm text-muted-foreground">当前可用余额</div>
        </div>

        {/* Usage Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">使用情况</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(usagePercentage)}%
            </span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
          <div className="text-xs text-muted-foreground">
            已使用 {totalCreditsUsed.toLocaleString()} / 获得{' '}
            {totalCreditsEarned.toLocaleString()} 积分
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Today's Usage */}
          <div className="bg-muted/30 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUpIcon className="h-3 w-3" />
              今日使用
            </div>
            <div className="text-lg font-semibold">
              {creditStats?.todayUsage || 0}
            </div>
          </div>

          {/* Expiring Soon */}
          <div className="bg-muted/30 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarIcon className="h-3 w-3" />
              即将过期
            </div>
            <div className="text-lg font-semibold text-amber-600">
              {creditStats?.expiringCredits?.amount || 0}
            </div>
          </div>
        </div>

        {/* Expiration Warning */}
        {creditStats?.expiringCredits &&
          creditStats.expiringCredits.amount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertTriangleIcon className="h-4 w-4" />
                <span className="text-sm font-medium">积分即将过期</span>
              </div>
              <div className="text-xs text-amber-700">
                {creditStats.expiringCredits.amount} 积分将在{' '}
                {CREDITS_EXPIRATION_DAYS} 天内过期，请及时使用
              </div>
            </div>
          )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="default"
            size="sm"
            className="w-full"
            onClick={() => {
              // 滚动到积分套餐区域
              const packagesSection = document.querySelector('[data-section="credit-packages"]');
              if (packagesSection) {
                packagesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
          >
            <ShoppingCartIcon className="h-4 w-4 mr-2" />
            购买积分
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() =>
              (window.location.href = '/settings/credits?tab=transactions')
            }
          >
            <GiftIcon className="h-4 w-4 mr-2" />
            使用记录
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
