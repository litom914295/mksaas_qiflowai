import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

// 需要认证的路由前缀
const protectedPaths = [
  '/admin',
  '/api/admin',
  '/dashboard',
  '/settings',
  '/profile',
];

// 公开路由（不需要认证）
const publicPaths = [
  '/auth',
  '/api/auth',
  '/test-login',
  '/',
  '/about',
  '/contact',
  '/pricing',
];

// 创建国际化中间件
const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 先处理国际化
  const intlResponse = intlMiddleware(request);

  // 移除语言前缀以进行路由匹配
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '');

  // 检查是否是公开路由
  const isPublicPath = publicPaths.some(
    (path) => pathWithoutLocale.startsWith(path) || pathname.startsWith(path)
  );

  if (isPublicPath) {
    return intlResponse;
  }

  // 检查是否是受保护的路由
  const isProtectedPath = protectedPaths.some(
    (path) => pathWithoutLocale.startsWith(path) || pathname.startsWith(path)
  );

  if (isProtectedPath) {
    // 检查 Supabase session cookie
    const token = request.cookies.get('supabase-auth-token');

    // 未登录，重定向到登录页
    if (!token) {
      const locale = pathname.split('/')[1] || 'zh-CN';
      const url = new URL(`/${locale}/auth/login`, request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    // 已登录，允许访问
    return intlResponse;
  }

  return intlResponse;
}

export const config = {
  matcher: [
    '/',
    '/(zh-CN|zh-TW|en)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
