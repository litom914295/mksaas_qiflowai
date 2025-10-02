'use client';

import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { locales, type Locale } from '@/lib/i18n/config';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

// Constants
// const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const getLocaleFromPath = (pathname: string): Locale => {
  const seg = pathname.split('/')[1];
  const found = locales.find(l => l.toLowerCase() === seg?.toLowerCase());
  return (found ?? 'zh-CN') as Locale;
};

export function GuestEntry() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname || '/');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const continueAsGuest = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const resp = await fetch('/api/guest/start', { method: 'POST' });
      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to start guest session');
      }
      const data = await resp.json();

      // 存储会话信息到localStorage以便前端使用
      const session = data?.session;
      if (session?.id) {
        localStorage.setItem(
          'qiflow_guest_token',
          JSON.stringify({
            id: session.id,
            expiresAt: session.expiresAt,
            maxAnalyses: session.maxAnalyses,
            maxAiQueries: session.maxAiQueries,
          })
        );

        // 成功创建游客会话，跳转到游客分析页面
        router.push(`/${locale}/guest-analysis`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Failed to create guest session:', error);
      // 改进的错误处理：提供更友好的错误信息
      const errorMessage = error instanceof Error ? error.message : t('common.error');
        setError(`${t('home.guestEntry.sessionCreationFailed')}: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [router, locale, t]);

  const goRegister = useCallback(() => {
    router.push(`/${locale}/auth/register`);
  }, [router, locale]);

  const goLogin = useCallback(() => {
    router.push(`/${locale}/auth/login`);
  }, [router, locale]);

  return (
    <div className='actions space-y-4'>
      {error && (
        <div className='bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700'>
          {error}
        </div>
      )}

      <div className='flex flex-col sm:flex-row gap-3'>
        <Button
          onClick={continueAsGuest}
          className='px-8 flex-1'
          variant='default'
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size='sm' className='mr-2' />
              {t('home.guestEntry.creatingSession')}
            </>
          ) : (
            t('home.guestEntry.continueAsGuest')
          )}
        </Button>

        <Button
          onClick={goRegister}
          className='px-8 flex-1'
          variant='secondary'
          disabled={isLoading}
        >
          {t('home.guestEntry.registerNow')}
        </Button>
      </div>

      <div className='text-center'>
        <button
          onClick={goLogin}
          className='text-sm text-gray-600 hover:text-gray-800 underline'
          disabled={isLoading}
        >
          {t('home.guestEntry.alreadyHaveAccount')}
        </button>
      </div>

      <div className='text-xs text-gray-500 text-center'>
        {t('home.guestEntry.guestModeDescription')}
      </div>
    </div>
  );
}
