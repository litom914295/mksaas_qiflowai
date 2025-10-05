'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useLocalePathname as usePathname,
  useLocaleRouter as useRouter,
} from '@/i18n/navigation';
import { LOCALE_COOKIE_NAME } from '@/i18n/routing';
import { locales } from '@/lib/i18n/meta';
import { useLocale } from 'next-intl';

/**
 * Language switcher component
 *
 * Displays a dropdown menu with all 6 supported languages.
 * Current language is highlighted. Switching updates URL/cookie
 * and immediately reflects in the UI.
 *
 * Supports:
 * - zh-CN (Simplified Chinese)
 * - en (English)
 * - ja (Japanese)
 * - ko (Korean)
 * - ms-MY (Malay)
 * - zh-TW (Traditional Chinese)
 */
export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const switchTo = (code: string) => {
    // Set cookie to persist language preference
    document.cookie = `${LOCALE_COOKIE_NAME}=${code}; path=/; max-age=31536000; SameSite=Lax`;

    // Navigate to the same path with new locale
    // next-intl's navigation handles locale prefix automatically
    router.replace(pathname, { locale: code as any });
  };

  const currentLocaleMeta = locales.find((l) => l.code === currentLocale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          aria-label={`Current language: ${currentLocaleMeta?.nativeName || currentLocale}`}
        >
          <span className="text-lg" aria-hidden="true">
            {currentLocaleMeta?.flag || '🌐'}
          </span>
          <span className="hidden sm:inline">
            {currentLocaleMeta?.nativeName || currentLocale}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        {locales.map((locale) => {
          const isActive = currentLocale === locale.code;
          return (
            <DropdownMenuItem
              key={locale.code}
              onClick={() => switchTo(locale.code)}
              className={isActive ? 'bg-accent font-medium' : ''}
              aria-current={isActive ? 'true' : undefined}
            >
              <span className="mr-3 text-lg" aria-hidden="true">
                {locale.flag}
              </span>
              <span className="flex-1">{locale.nativeName}</span>
              {isActive && (
                <span
                  className="ml-2 text-xs text-muted-foreground"
                  aria-label="Current language"
                >
                  ✓
                </span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
