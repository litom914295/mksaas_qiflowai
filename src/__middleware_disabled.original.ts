import { getToken } from 'next-auth/jwt';
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
  '/',
  '/about',
  '/contact',
  '/pricing',
];

// 角色权限映射
const roleRouteAccess: Record<string, string[]> = {
  superadmin: ['*'], // 超级管理员可以访问所有路由
  admin: ['/admin', '/api/admin', '/dashboard', '/settings', '/profile'],
  operator: ['/admin/users', '/admin/content', '/dashboard', '/profile'],
  user: ['/dashboard', '/profile', '/settings'],
};

// 特定路由的权限要求
const routePermissions: Record<string, string[]> = {
  '/admin/users': ['user:read', 'user:write'],
  '/admin/roles': ['role:read', 'role:write'],
  '/admin/settings': ['system:settings'],
  '/admin/logs': ['system:logs'],
  '/admin/finance': ['finance:read'],
  '/api/admin/users': ['user:read', 'user:write'],
  '/api/admin/roles': ['role:read', 'role:write'],
};

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

  // 显式允许未登录访问的管理路由
  const isAdminLoginPath = pathWithoutLocale.startsWith('/admin/login');
  if (
    (isPublicPath && !pathWithoutLocale.startsWith('/auth/signout')) ||
    isAdminLoginPath
  ) {
    return intlResponse;
  }

  // 检查是否是受保护的路由（排除管理登录页）
  const isProtectedPath = protectedPaths.some(
    (path) =>
      (pathWithoutLocale.startsWith(path) || pathname.startsWith(path)) &&
      !isAdminLoginPath
  );

  if (isProtectedPath) {
    // 获取用户会话
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // 未登录，重定向到登录页
    if (!token) {
      const locale = pathname.split('/')[1];
      const url = new URL(`/${locale}/auth/login`, request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    // 检查角色权限
    const userRole = (token.role as string) || 'user';
    const userPermissions = (token.permissions as string[]) || [];

    // 超级管理员跳过所有权限检查
    if (userRole === 'superadmin') {
      return intlResponse;
    }

    // 检查角色是否有访问该路由的权限
    const allowedRoutes = roleRouteAccess[userRole] || [];
    const hasRoleAccess =
      allowedRoutes.includes('*') ||
      allowedRoutes.some((route) => pathWithoutLocale.startsWith(route));

    if (!hasRoleAccess) {
      const locale = pathname.split('/')[1];
      return NextResponse.redirect(
        new URL(`/${locale}/unauthorized`, request.url)
      );
    }

    // 检查特定路由的权限要求
    const requiredPermissions = routePermissions[pathWithoutLocale];
    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasPermission = requiredPermissions.some((permission) =>
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        const locale = pathname.split('/')[1];
        return NextResponse.redirect(
          new URL(`/${locale}/unauthorized`, request.url)
        );
      }
    }

    // 添加用户信息到请求头，供后续使用
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', (token.id as string) || '');
    requestHeaders.set('x-user-role', userRole);
    requestHeaders.set('x-user-permissions', userPermissions.join(','));

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
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
