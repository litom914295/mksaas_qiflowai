// Internationalization routing configuration
import { createNavigation } from 'next-intl/navigation';
import { defaultLocale, locales } from './config';

export const routing = {
  locales,
  defaultLocale,
  // Always show locale prefix to ensure path consistency
  localePrefix: 'always' as const,
};

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
