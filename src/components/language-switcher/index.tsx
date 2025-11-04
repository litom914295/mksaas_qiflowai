/**
 * 增强的语言切换器 UI 组件
 * 由 AI-WORKFLOW v5.0 自动生成
 *
 * 特性：
 * - 支持全部 6 种语言
 * - 流畅的切换动画
 * - 零语言混合
 * - 移动端优化
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguageSwitcher } from '@/hooks/use-language-switcher';
import { Locale, localeNames } from '@/lib/i18n/config';
import { Check, Globe, Loader2 } from 'lucide-react';

export function LanguageSwitcher() {
  const { currentLocale, switchLanguage, isChanging, availableLocales } =
    useLanguageSwitcher();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          disabled={isChanging}
          aria-label="Switch language"
        >
          {isChanging ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Globe className="h-5 w-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {availableLocales.map((locale) => {
          const isActive = locale === currentLocale;
          return (
            <DropdownMenuItem
              key={locale}
              onClick={() => !isActive && switchLanguage(locale)}
              className="flex items-center justify-between cursor-pointer"
              disabled={isActive || isChanging}
            >
              <span className={isActive ? 'font-semibold' : ''}>
                {localeNames[locale]}
              </span>
              {isActive && <Check className="h-4 w-4 ml-2" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
