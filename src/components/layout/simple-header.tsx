'use client';

import { LanguageSwitcher } from '@/components/language-switcher';
import { ModeSwitcher } from '@/components/layout/mode-switcher';
import { BrandLogo } from '@/components/qiflow/homepage/BrandLogo';
import { LocaleLink } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export type SimpleHeaderProps = {
  title?: string;
  showBackButton?: boolean;
  className?: string;
};

/**
 * Simple header for non-marketing pages (auth, analysis, reports, tools, etc.)
 * Provides:
 * - Brand logo (links to home)
 * - Page title (optional)
 * - Language switcher
 * - Mode switcher (light/dark)
 * - Back button (optional)
 */
export function SimpleHeader({
  title,
  showBackButton = false,
  className,
}: SimpleHeaderProps) {
  const t = useTranslations('Metadata');

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
    >
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-4">
          {showBackButton && (
            <LocaleLink
              href="/"
              className="flex items-center text-sm text-muted-foreground hover:text-foreground"
              aria-label="Back to home"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              <span className="hidden sm:inline">Back</span>
            </LocaleLink>
          )}
          <LocaleLink
            href="/"
            className="flex items-center gap-2"
            aria-label={t('name')}
          >
            <BrandLogo href="" size={96} className="h-7 w-auto" />
            <span className="hidden font-semibold sm:inline-block">
              {t('name')}
            </span>
          </LocaleLink>
          {title && (
            <>
              <span className="text-muted-foreground hidden sm:inline">·</span>
              <h1 className="hidden text-sm font-medium sm:inline-block">
                {title}
              </h1>
            </>
          )}
        </div>

        {/* Right: Language + Mode switchers */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ModeSwitcher />
        </div>
      </div>
    </header>
  );
}
