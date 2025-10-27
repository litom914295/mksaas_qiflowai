import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for
  // - API routes
  // - _next (internal Next.js resources)
  // - Static files (e.g., images, icons)
  matcher: ['/((?!api|_next|.*\\.).*)'],
};
