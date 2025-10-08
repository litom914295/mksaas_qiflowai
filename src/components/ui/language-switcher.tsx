'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { localeNames, locales, type Locale } from '@/lib/i18n/config';
import { usePathname, useRouter } from '@/lib/i18n/routing';
import { Check, Globe } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const tCommon = useTranslations('common');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (newLocale: Locale) => {
    // Get path without locale (only remove the starting language segment)
    const pathWithoutLocale = pathname.replace(/^\/(?:[a-z]{2}(?:-[A-Z]{2})?)(?=\/|$)/, '') || '/';
    // Use next-intl routing method for language switching
    router.replace(pathWithoutLocale, { locale: newLocale });
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center gap-2 ${className}`}
          aria-label={tCommon('switchLanguage')}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {localeNames[locale]}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLanguageChange(loc)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span>{localeNames[loc]}</span>
            {locale === loc && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Simplified language switcher (only shows language codes)
export function CompactLanguageSwitcher({ className }: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: Locale) => {
    // Get path without locale (only remove the starting language segment)
    const pathWithoutLocale = pathname.replace(/^\/(?:[a-z]{2}(?:-[A-Z]{2})?)(?=\/|$)/, '') || '/';
    // Use next-intl routing method for language switching
    router.replace(pathWithoutLocale, { locale: newLocale });
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {locales.map((loc) => (
        <Button
          key={loc}
          variant={locale === loc ? "default" : "ghost"}
          size="sm"
          onClick={() => handleLanguageChange(loc)}
          className="px-2 py-1 text-xs"
        >
          {loc.split('-')[0].toUpperCase()}
        </Button>
      ))}
    </div>
  );
}