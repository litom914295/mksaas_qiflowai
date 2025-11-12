'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { websiteConfig } from '@/config/website';
import { useCreditBalance, useCreditStats } from '@/hooks/use-credits';
import { useMounted } from '@/hooks/use-mounted';
import { useLocaleRouter } from '@/i18n/navigation';
import { CREDITS_EXPIRATION_DAYS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Routes } from '@/routes';
import { RefreshCwIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

/**
 * Credits balance card, show credit balance
 */
export default function CreditsBalanceCard() {
  // Don't render if credits are disabled - move this check before any hooks
  if (!websiteConfig.credits.enableCredits) {
    return null;
  }

  const t = useTranslations('Dashboard.settings.credits.balance');
  const searchParams = useSearchParams();
  const localeRouter = useLocaleRouter();
  const hasHandledSession = useRef(false);
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

  // Handle payment success after credits purchase
  const handlePaymentSuccess = useCallback(async () => {
    // Use queueMicrotask to avoid React rendering conflicts
    queueMicrotask(() => {
      toast.success(t('creditsAdded'));
    });

    // Wait for webhook to process (simplified approach)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Force refresh data
    refetchBalance();
    refetchStats();
  }, [t, refetchBalance, refetchStats]);

  // Check for payment success and show success message
  useEffect(() => {
    const sessionId = searchParams?.get('credits_session_id');
    if (sessionId && !hasHandledSession.current) {
      hasHandledSession.current = true;

      // Clean up URL parameters first
      const url = new URL(window.location.href);
      url.searchParams.delete('credits_session_id');
      localeRouter.replace(Routes.SettingsCredits + url.search);

      // Handle payment success
      handlePaymentSuccess();
    }
  }, [searchParams, localeRouter, handlePaymentSuccess]);

  // Retry all data fetching using refetch methods
  const handleRetry = useCallback(() => {
    // Use refetch methods for immediate data refresh
    refetchBalance();
    refetchStats();
  }, [refetchBalance, refetchStats]);

  // 进入积分页自动尝试签到（双保险）
  useEffect(() => {
    if (!websiteConfig.credits.dailySignin?.enable) return;
    const key = 'qf_daily_signin_date';
    const today = new Date().toISOString().slice(0, 10);
    const last =
      typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    if (last === today) return;
    (async () => {
      try {
        const res = await fetch('/api/credits/daily-signin', {
          method: 'POST',
        });
        const data = await res.json();
        if (data?.success) {
          localStorage.setItem(key, today);
          if (!data?.data?.already) {
            refetchBalance();
            refetchStats();
          }
        }
      } catch {}
    })();
  }, [refetchBalance, refetchStats]);

  // Render loading skeleton
  if (!mounted || isLoadingBalance || isLoadingStats) {
    return (
      <Card className={cn('w-full overflow-hidden pt-6 pb-0 flex flex-col')}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 flex-1">
          <div className="flex items-center justify-start space-x-4">
            <Skeleton className="h-9 w-1/5" />
          </div>
        </CardContent>
        <CardFooter className="px-6 py-4 flex justify-between items-center bg-muted rounded-none">
          <Skeleton className="h-4 w-3/5" />
        </CardFooter>
      </Card>
    );
  }

  // Render error state
  if (balanceError || statsError) {
    return (
      <Card className={cn('w-full overflow-hidden pt-6 pb-0 flex flex-col')}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 flex-1">
          <div className="text-destructive text-sm">
            {balanceError?.message || statsError?.message}
          </div>
        </CardContent>
        <CardFooter className="mt-2 px-6 py-4 flex justify-end items-center bg-muted rounded-none">
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={handleRetry}
          >
            <RefreshCwIcon className="size-4 mr-1" />
            {t('retry')}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // 智能建议逻辑
  const getSuggestion = () => {
    if (balance < 50) {
      return {
        text: '积分余额较低，建议及时充值以体验更多AI功能',
        variant: 'destructive' as const,
      };
    } else if (balance < 200) {
      return {
        text: '每日签到可获得免费积分，坚持签到还有额外奖励',
        variant: 'default' as const,
      };
    } else if (balance < 500) {
      return {
        text: '积分充足，可以放心使用八字分析和风水服务',
        variant: 'default' as const,
      };
    } else {
      return {
        text: '积分余额非常充足，可以尽情体验所有高级功能',
        variant: 'default' as const,
      };
    }
  };

  const suggestion = getSuggestion();

  return (
    <Card className={cn('w-full overflow-hidden flex flex-col')}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">
              {t('title')}
            </CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => localeRouter.push(Routes.Pricing)}
            className="ml-auto"
          >
            充值
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-6">
        {/* Credits balance */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <div className="text-4xl font-bold tracking-tight">
              {balance.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">积分</div>
          </div>
          {creditStats && (
            <div className="flex gap-4 text-sm">
              <div className="text-muted-foreground">
                累计获得:
                <span className="ml-1 font-medium text-green-600">
                  +{creditStats.totalCreditsEarned?.toLocaleString() || 0}
                </span>
              </div>
              <div className="text-muted-foreground">
                累计消耗:
                <span className="ml-1 font-medium text-red-600">
                  -{creditStats.totalCreditsUsed?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 智能建议 */}
        <div className="rounded-lg border bg-muted/50 p-3">
          <div className="flex items-start gap-2">
            <div className="rounded-full bg-primary/10 p-1.5">
              <svg
                className="h-4 w-4 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground flex-1">
              {suggestion.text}
            </p>
          </div>
        </div>

        {/* 快速充值入口 */}
        {balance < 500 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">快速充值</div>
            <div className="grid grid-cols-3 gap-2">
              {[100, 500, 1000].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  className="h-auto py-2 flex flex-col items-center"
                  onClick={() => localeRouter.push(Routes.Pricing)}
                >
                  <div className="text-lg font-semibold">{amount}</div>
                  <div className="text-xs text-muted-foreground">积分</div>
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="px-6 py-4 flex justify-between items-center bg-muted/30 rounded-none border-t">
        {/* Expiring credits warning */}
        {!isLoadingStats &&
        creditStats &&
        creditStats.expiringCredits.amount > 0 ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-amber-600">⚠️</span>
            <span className="text-muted-foreground">
              {t('expiringCredits', {
                credits: creditStats.expiringCredits.amount,
                days: CREDITS_EXPIRATION_DAYS,
              })}
            </span>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            积分永久有效，放心使用
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
