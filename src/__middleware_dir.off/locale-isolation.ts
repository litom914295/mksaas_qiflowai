/**
 * 严格的语言隔离中间件
 * 由 AI-WORKFLOW v5.0 自动生成
 *
 * 功能：
 * - 强制语言前缀路由
 * - 自动重定向无语言前缀的请求
 * - 尊重用户语言偏好
 * - 防止语言混合
 */

import { defaultLocale, locales } from '@/lib/i18n/config';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 不需要语言前缀的路径
const PUBLIC_PATHS = [
  '/api',
  '/_next',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/manifest.json',
];

export function localeIsolationMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 跳过公共路径
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 检查路径是否已包含语言前缀
  const pathnameLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // 如果已有有效的语言前缀，继续处理
  if (pathnameLocale) {
    const response = NextResponse.next();
    // 设置当前语言到响应头（供后续使用）
    response.headers.set('x-current-locale', pathnameLocale);
    return response;
  }

  // 确定重定向目标语言
  let targetLocale = defaultLocale;

  // 1. 检查 Cookie 中的语言偏好
  const cookieLocale = request.cookies.get('preferred-language')?.value;
  if (cookieLocale && locales.includes(cookieLocale as any)) {
    targetLocale = cookieLocale as any;
  }
  // 2. 检查 Accept-Language 头
  else {
    const acceptLanguage = request.headers.get('accept-language');
    if (acceptLanguage) {
      const browserLocale = parseBrowserLocale(acceptLanguage);
      if (browserLocale && locales.includes(browserLocale as any)) {
        targetLocale = browserLocale as any;
      }
    }
  }

  // 重定向到带语言前缀的URL
  const url = request.nextUrl.clone();
  url.pathname = `/${targetLocale}${pathname === '/' ? '' : pathname}`;

  const response = NextResponse.redirect(url);
  response.headers.set('x-redirected-locale', targetLocale);

  return response;
}

/**
 * 解析浏览器 Accept-Language 头
 */
function parseBrowserLocale(acceptLanguage: string): string | null {
  // Accept-Language 格式: en-US,en;q=0.9,zh-CN;q=0.8
  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const [code, qValue] = lang.trim().split(';q=');
      return {
        code: code.trim(),
        quality: qValue ? Number.parseFloat(qValue) : 1.0,
      };
    })
    .sort((a, b) => b.quality - a.quality);

  // 匹配支持的语言
  for (const { code } of languages) {
    // 精确匹配
    if (locales.includes(code as any)) {
      return code;
    }
    // 尝试匹配语言代码前缀（如 en-US -> en）
    const prefix = code.split('-')[0];
    const matchedLocale = locales.find((locale) => locale.startsWith(prefix));
    if (matchedLocale) {
      return matchedLocale;
    }
  }

  return null;
}
