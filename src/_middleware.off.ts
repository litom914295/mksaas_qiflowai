import { createClient } from '@supabase/supabase-js';
import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';
// import { applySecurityHeaders } from './lib/security/headers';

// 需要认证的路由前缀
const protectedPaths = [
  '/admin',
  '/api/admin',
  '/dashboard',
  '/settings',
  '/profile',
];

// 需要邮箱验证的路由（即使已登录）
const emailVerificationRequired = [
  '/dashboard',
  '/settings',
  '/profile',
  '/api/protected',
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

// 允许未验证用户访问的路由
const unverifiedAllowedPaths = [
  '/auth/verify-email',
  '/auth/logout',
  '/api/auth/resend-verification',
];

// 创建国际化中间件
const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 如果是根路径，直接重定向到默认语言
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/zh-CN', request.url));
  }

  // 先处理国际化
  const response = intlMiddleware(request);

  // 应用安全响应头
  // response = applySecurityHeaders(response);

  // 移除语言前缀以进行路由匹配
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '');

  // 检查是否是公开路由
  const isPublicPath = publicPaths.some(
    (path) => pathWithoutLocale.startsWith(path) || pathname.startsWith(path)
  );

  if (isPublicPath) {
    return response;
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

    // 检查是否需要邮箱验证
    const requiresEmailVerification = emailVerificationRequired.some(
      (path) => pathWithoutLocale.startsWith(path) || pathname.startsWith(path)
    );

    const isUnverifiedAllowed = unverifiedAllowedPaths.some(
      (path) => pathWithoutLocale.startsWith(path) || pathname.startsWith(path)
    );

    if (requiresEmailVerification && !isUnverifiedAllowed) {
      try {
        // 从 cookie 获取用户信息来检查邮箱验证状态
        // 注意：实际项目中应该从服务器端验证
        const userInfo = request.cookies.get('user-info');
        if (userInfo) {
          const user = JSON.parse(userInfo.value);
          if (!user.email_verified) {
            const locale = pathname.split('/')[1] || 'zh-CN';
            const url = new URL(`/${locale}/auth/verify-email`, request.url);
            url.searchParams.set('from', pathname);
            return NextResponse.redirect(url);
          }
        }
      } catch (error) {
        console.error('Failed to check email verification status:', error);
      }
    }

    // 已登录且邮箱已验证（或不需要验证），允许访问
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    // 匹配所有页面路径，但排除 API、静态文件等
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
