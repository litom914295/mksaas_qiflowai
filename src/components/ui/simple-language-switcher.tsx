'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { localeNames, locales, type Locale } from '@/lib/i18n/config';
import { Check, Globe } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

interface SimpleLanguageSwitcherProps {
  className?: string;
}

export function SimpleLanguageSwitcher({
  className,
}: SimpleLanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (newLocale: Locale) => {
    // Get current path, remove existing locale prefix
    let cleanPath = pathname ?? '/';

    // Remove all possible locale prefixes
    for (const loc of locales) {
      if (cleanPath?.startsWith(`/${loc}/`)) {
        cleanPath = cleanPath.replace(`/${loc}/`, '/');
        break;
      } else if (cleanPath === `/${loc}`) {
        cleanPath = '/';
        break;
      }
    }

    // Ensure path starts with /
    if (!cleanPath.startsWith('/')) {
      cleanPath = '/' + cleanPath;
    }

    // Build new URL
    const newPath = `/${newLocale}${cleanPath}`;

    console.log('Language switch debug:', {
      originalPath: pathname,
      cleanPath,
      newLocale,
      newPath,
    });

    // Use native routing for navigation
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className={`flex items-center gap-2 ${className}`}
          aria-label={t('common.switchLanguage')}
        >
          <Globe className='h-4 w-4' />
          <span className='hidden sm:inline'>{localeNames[locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-48'>
        {locales.map(loc => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLanguageChange(loc)}
            className='flex items-center justify-between cursor-pointer'
          >
            <span>{localeNames[loc]}</span>
            {locale === loc && <Check className='h-4 w-4' />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
