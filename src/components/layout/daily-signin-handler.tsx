'use client';

import { websiteConfig } from '@/config/website';
import { creditsKeys } from '@/hooks/use-credits';
import { authClient } from '@/lib/auth-client';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

/**
 * DailySigninHandler
 * - 全站自动签到（进入任意页面触发）
 * - 每天最多一次，依赖 localStorage 标记
 * - 签到成功后自动刷新积分余额
 */
export function DailySigninHandler() {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!websiteConfig.credits.enableCredits) return;
    if (!websiteConfig.credits.dailySignin?.enable) return;
    if (!session?.user?.id) return;

    const key = 'qf_daily_signin_date';
    const today = new Date().toISOString().slice(0, 10);
    const last =
      typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    if (last === today) return;

    console.log('[自动签到] 开始检查签到状态...');
    (async () => {
      try {
        // 关键修复：先检查服务器是否已签到，避免重复签到
        const checkRes = await fetch('/api/credits/daily-signin/status');
        const checkData = await checkRes.json();
        
        if (checkData?.success && checkData?.data?.hasSignedToday) {
          console.log('[自动签到] 今日已签到，跳过');
          localStorage.setItem(key, today);
          return;
        }

        console.log('[自动签到] 执行签到...');
        const res = await fetch('/api/credits/daily-signin', {
          method: 'POST',
        });
        const data = await res.json();
        if (data?.success) {
          localStorage.setItem(key, today);
          if (data?.data?.already) {
            console.log('[自动签到] 已签到（服务端幂等）');
          } else {
            console.log('[自动签到] 签到成功,刷新积分余额');
            // 刷新积分余额和统计数据
            queryClient.invalidateQueries({
              queryKey: creditsKeys.balance(),
            });
            queryClient.invalidateQueries({
              queryKey: creditsKeys.stats(),
            });
          }
        }
      } catch (error) {
        console.error('[自动签到] 失败:', error);
      }
    })();
  }, [session?.user?.id, queryClient]);

  return null;
}
