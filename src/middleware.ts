import { betterFetch } from '@better-fetch/fetch';
import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_COOKIE_NAME,
  routing,
} from './i18n/routing';
import type { Session } from './lib/auth-types';
import { getBaseUrl } from './lib/urls/urls';
import {
  DEFAULT_LOGIN_REDIRECT,
  protectedRoutes,
  routesNotAllowedByLoggedInUsers,
} from './routes';
import { defaultRateLimiters, getClientIp } from './lib/rate-limit';

const intlMiddleware = createMiddleware(routing);

/**
 * 1. Next.js middleware
 * https://nextjs.org/docs/app/building-your-application/routing/middleware
 *
 * 2. Better Auth middleware
 * https://www.better-auth.com/docs/integrations/next#middleware
 *
 * In Next.js middleware, it's recommended to only check for the existence of a session cookie
 * to handle redirection. To avoid blocking requests by making API or database calls.
 */
// 是否启用详细日志（只在需要调试时启用）
const ENABLE_VERBOSE_LOGGING = process.env.MIDDLEWARE_DEBUG === 'true';

export default async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  
  // 只在调试模式下记录所有请求
  if (ENABLE_VERBOSE_LOGGING) {
    console.log('>> middleware start, pathname', nextUrl.pathname);
  }

  // API限流处理
  if (nextUrl.pathname.startsWith('/api/')) {
    const clientIp = getClientIp(req);
    let rateLimiter = defaultRateLimiters.general;
    
    // 根据API路径选择不同的限流器
    if (nextUrl.pathname.startsWith('/api/ai/chat')) {
      rateLimiter = defaultRateLimiters.aiChat;
    } else if (nextUrl.pathname.startsWith('/api/bazi/') || nextUrl.pathname.startsWith('/api/fengshui/')) {
      rateLimiter = defaultRateLimiters.baziCalculation;
    }
    
    const rateLimitResult = await rateLimiter(clientIp);
    
    // 如果超过限流，返回429
    if (!rateLimitResult.success) {
      return new NextResponse(
        JSON.stringify({
          error: rateLimitResult.message,
          retryAfter: rateLimitResult.reset,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toISOString(),
            'Retry-After': Math.ceil((rateLimitResult.reset.getTime() - Date.now()) / 1000).toString(),
          },
        }
      );
    }
    
    // API请求通过限流，继续处理但添加限流响应头
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toISOString());
    return response;
  }

  // 智能处理无 locale 前缀的路径
  // 这个逻辑应该在所有其他处理之前执行
  const hasLocalePrefix = LOCALES.some(locale => 
    nextUrl.pathname === `/${locale}` || nextUrl.pathname.startsWith(`/${locale}/`)
  );

  // 如果路径不包含 locale 前缀，且不是静态资源或API
  if (!hasLocalePrefix && !nextUrl.pathname.startsWith('/_next')) {
    // 确定用户的首选 locale
    let preferredLocale: string | null = null;

    // 1. 优先从 cookie 获取
    const localeCookie = req.cookies.get(LOCALE_COOKIE_NAME);
    if (localeCookie?.value && LOCALES.includes(localeCookie.value)) {
      preferredLocale = localeCookie.value;
    }

    // 2. 如果没有 cookie，从 Accept-Language header 获取
    if (!preferredLocale) {
      const acceptLanguage = req.headers.get('accept-language');
      if (acceptLanguage) {
        const languages = acceptLanguage
          .split(',')
          .map(lang => lang.split(';')[0]?.trim())
          .filter(Boolean);

        for (const lang of languages) {
          // 精确匹配
          if (LOCALES.includes(lang)) {
            preferredLocale = lang;
            break;
          }
          // 语言代码匹配（如 'zh' 匹配 'zh-CN'）
          const langCode = lang.split('-')[0];
          const matched = LOCALES.find(loc => loc.startsWith(langCode + '-'));
          if (matched) {
            preferredLocale = matched;
            break;
          }
        }
      }
    }

    // 3. 回退到默认 locale
    if (!preferredLocale) {
      preferredLocale = DEFAULT_LOCALE;
    }

    // 构建带 locale 的完整路径
    const localizedPath = `/${preferredLocale}${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
    
    // 只记录重要的重定向（非静态资源）
    if (!nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf)$/)) {
      console.log(
        `🌐 i18n redirect: ${nextUrl.pathname} -> ${localizedPath} [${preferredLocale}]`
      );
    }

    return NextResponse.redirect(new URL(localizedPath, nextUrl));
  }

  // do not use getSession() here, it will cause error related to edge runtime
  // const session = await getSession();
  let session: Session | null = null;
  let isLoggedIn = false;

  try {
    const response = await betterFetch<Session>('/api/auth/get-session', {
      baseURL: getBaseUrl(),
      headers: {
        cookie: req.headers.get('cookie') || '', // Forward the cookies from the request
      },
    });
    session = response.data;
    isLoggedIn = !!session;
  } catch (error) {
    // 如果获取 session 失败，记录错误但允许请求继续
    // 这通常发生在数据库未初始化或 Better Auth 配置问题时
    console.error('❌ Middleware: Failed to fetch session:', {
      error: error instanceof Error ? error.message : String(error),
      pathname: nextUrl.pathname,
      baseURL: getBaseUrl(),
    });
    // 降级处理：假设用户未登录，让请求继续
    isLoggedIn = false;
  }
  // console.log('middleware, isLoggedIn', isLoggedIn);

  // Get the pathname of the request (e.g. /zh/dashboard to /dashboard)
  const pathnameWithoutLocale = getPathnameWithoutLocale(
    nextUrl.pathname,
    LOCALES
  );

  // If the route can not be accessed by logged in users, redirect if the user is logged in
  if (isLoggedIn) {
    const isNotAllowedRoute = routesNotAllowedByLoggedInUsers.some((route) =>
      new RegExp(`^${route}$`).test(pathnameWithoutLocale)
    );
    if (isNotAllowedRoute) {
      if (ENABLE_VERBOSE_LOGGING) {
        console.log(
          '<< middleware end, not allowed route, already logged in, redirecting to dashboard'
        );
      }
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
  }

  const isProtectedRoute = protectedRoutes.some((route) =>
    new RegExp(`^${route}$`).test(pathnameWithoutLocale)
  );
  // console.log('middleware, isProtectedRoute', isProtectedRoute);

  // If the route is a protected route, redirect to login if user is not logged in
  if (!isLoggedIn && isProtectedRoute) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    
    if (ENABLE_VERBOSE_LOGGING) {
      console.log(
        '<< middleware end, not logged in, redirecting to login, callbackUrl',
        callbackUrl
      );
    }
    
    return NextResponse.redirect(
      new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}`, nextUrl)
    );
  }

  // Apply intlMiddleware for all routes
  if (ENABLE_VERBOSE_LOGGING) {
    console.log('<< middleware end, applying intlMiddleware');
  }
  return intlMiddleware(req);
}

/**
 * Get the pathname of the request (e.g. /zh/dashboard to /dashboard)
 */
function getPathnameWithoutLocale(pathname: string, locales: string[]): string {
  const localePattern = new RegExp(`^/(${locales.join('|')})/`);
  return pathname.replace(localePattern, '/');
}

/**
 * Next.js internationalized routing
 * specify the routes the middleware applies to
 *
 * https://next-intl.dev/docs/routing#base-path
 */
export const config = {
  // The `matcher` is relative to the `basePath`
  matcher: [
    // Match all pathnames except for
    // - if they start with `/api`, `/_next` or `/_vercel`
    // - if they contain a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
