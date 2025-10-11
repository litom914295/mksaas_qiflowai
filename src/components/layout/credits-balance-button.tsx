'use client';

import { Button } from '@/components/ui/button';
import { websiteConfig } from '@/config/website';
import { useCreditBalance } from '@/hooks/use-credits';
import { useLocaleRouter } from '@/i18n/navigation';
import { Routes } from '@/routes';
import { CoinsIcon, Loader2Icon } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function CreditsBalanceButton() {
  // If credits are not enabled, return null
  if (!websiteConfig.credits.enableCredits) {
    return null;
  }

  const router = useLocaleRouter();

  // Use TanStack Query hook for credit balance
  const { data: balance = 0, isLoading, refetch } = useCreditBalance();

  // 进入页面自动触发签到（顶部菜单为全站常驻入口）
  const tried = useRef(false);
  useEffect(() => {
    if (!websiteConfig.credits.dailySignin?.enable) return;
    if (tried.current) return;
    const key = 'qf_daily_signin_date';
    const today = new Date().toISOString().slice(0, 10);
    const last = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    if (last === today) return;
    tried.current = true;
    (async () => {
      try {
        const res = await fetch('/api/credits/daily-signin', { method: 'POST' });
        const data = await res.json();
        if (data?.success) {
          localStorage.setItem(key, today);
          if (!data?.data?.already) refetch();
        }
      } catch {}
    })();
  }, [refetch]);

  const handleClick = () => {
    router.push(Routes.SettingsCredits);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-8 gap-2 px-2 text-sm font-medium cursor-pointer"
      onClick={handleClick}
    >
      <CoinsIcon className="h-4 w-4" />
      <span className="">
        {isLoading ? (
          <Loader2Icon className="h-4 w-4 animate-spin" />
        ) : (
          balance.toLocaleString()
        )}
      </span>
    </Button>
  );
}
