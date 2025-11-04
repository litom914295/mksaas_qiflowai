'use client';

import { useLocaleRouter } from '@/i18n/navigation';
import { authClient } from '@/lib/auth-client';
import { useEffect } from 'react';

/**
 * ReferralHandler
 * - 捕获 URL 中的 ?ref=CODE 参数
 * - 登录后自动调用 /api/referral/use 进行登记（pending）
 * - 幂等：成功后清理本地存储与 URL 参数
 */
export function ReferralHandler() {
  const router = useLocaleRouter();
  const { data: session } = authClient.useSession();

  useEffect(() => {
    const url = new URL(window.location.href);
    const ref = url.searchParams.get('ref');

    // 若 URL 有 ref，则优先写入本地存储，并移除 URL 参数避免重复
    if (ref) {
      localStorage.setItem('qf_referral_code', ref);
      url.searchParams.delete('ref');
      router.replace(url.pathname + url.search + url.hash);
    }

    const code = localStorage.getItem('qf_referral_code');
    if (!code) return;

    // 需要用户已登录才可登记推荐关系
    if (!session?.user?.id) return;
    (async () => {
      try {
        const res = await fetch('/api/referral/use', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });
        const data = await res.json();
        if (data?.success) {
          localStorage.removeItem('qf_referral_code');
        }
      } catch {}
    })();
  }, [router, session?.user?.id]);

  return null;
}
