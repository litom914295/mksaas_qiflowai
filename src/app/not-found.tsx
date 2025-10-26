import { redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';

/**
 * Catching non-localized requests
 *
 * This page renders when a route like `/unknown.txt` is requested.
 * In this case, the layout at `app/[locale]/layout.tsx` receives
 * an invalid value as the `[locale]` param and calls `notFound()`.
 *
 * https://next-intl.dev/docs/environments/error-files#catching-non-localized-requests
 */
export default function GlobalNotFound() {
  // Redirect to the default locale's home
  redirect(`/${routing.defaultLocale}`);
}
