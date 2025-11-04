/**
 * 服务端翻译 Provider
 * 由 AI-WORKFLOW v5.0 自动生成
 *
 * 功能：
 * - 服务端加载翻译
 * - 通过 Context 提供给客户端组件
 * - 零客户端 JavaScript（翻译数据预加载）
 */

'use client';

import type { Locale } from '@/lib/i18n/config';
import { type ReactNode, createContext, useContext } from 'react';

type TranslationContextType = {
  locale: Locale;
  translations: Record<string, any>;
  t: (key: string, fallback?: string) => string;
};

const TranslationContext = createContext<TranslationContextType | null>(null);

type TranslationProviderProps = {
  locale: Locale;
  translations: Record<string, any>;
  children: ReactNode;
};

export function TranslationProvider({
  locale,
  translations,
  children,
}: TranslationProviderProps) {
  // 翻译函数
  const t = (key: string, fallback?: string): string => {
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return fallback || key;
      }
    }

    return typeof value === 'string' ? value : fallback || key;
  };

  return (
    <TranslationContext.Provider value={{ locale, translations, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

/**
 * 客户端组件中使用翻译的 Hook
 */
export function useTranslation() {
  const context = useContext(TranslationContext);

  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }

  return context;
}
