/**
 * 增强的语言切换 Hook
 * 由 AI-WORKFLOW v5.0 自动生成
 *
 * 功能：
 * - 严格的语言隔离
 * - 零语言混合
 * - 完整的切换动画
 * - 自动保存偏好
 */

'use client';

import { type Locale, locales } from '@/lib/i18n/config';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

export function useLanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isChanging, setIsChanging] = useState(false);

  // 获取当前语言
  const getCurrentLocale = (): Locale => {
    const segments = pathname.split('/');
    const potentialLocale = segments[1];
    return locales.includes(potentialLocale as Locale)
      ? (potentialLocale as Locale)
      : 'zh-CN';
  };

  // 切换语言
  const switchLanguage = async (newLocale: Locale) => {
    if (isChanging || isPending) return;

    const currentLocale = getCurrentLocale();
    if (currentLocale === newLocale) return;

    setIsChanging(true);

    try {
      // 1. 保存用户偏好到 localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('preferred-language', newLocale);
      }

      // 2. 构建新路径
      const segments = pathname.split('/').filter(Boolean);
      const isLocaleInPath = locales.includes(segments[0] as Locale);

      let newPath: string;
      if (isLocaleInPath) {
        // 替换现有语言
        segments[0] = newLocale;
        newPath = `/${segments.join('/')}`;
      } else {
        // 添加语言前缀
        newPath = `/${newLocale}${pathname}`;
      }

      // 3. 添加淡出动画类
      if (typeof document !== 'undefined') {
        document.documentElement.classList.add('locale-switching');
      }

      // 4. 执行导航
      startTransition(() => {
        router.push(newPath);
        router.refresh();
      });

      // 5. 等待导航完成后移除动画类
      setTimeout(() => {
        if (typeof document !== 'undefined') {
          document.documentElement.classList.remove('locale-switching');
        }
        setIsChanging(false);
      }, 300);
    } catch (error) {
      console.error('Language switch error:', error);
      setIsChanging(false);
    }
  };

  return {
    currentLocale: getCurrentLocale(),
    switchLanguage,
    isChanging: isChanging || isPending,
    availableLocales: locales,
  };
}
