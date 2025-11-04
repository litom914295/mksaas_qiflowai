import { routing } from '@/i18n/routing';
import { Routes } from '@/routes';

/**
 * 获取带国际化前缀的路由路径
 *
 * @param route - Routes 枚举值（如 Routes.AIChat）
 * @param locale - 可选的 locale，如果不提供则使用默认 locale (zh-CN)
 * @returns 带 locale 前缀的完整路径（如 /zh-CN/ai/chat）
 *
 * @example
 * ```ts
 * // 使用默认 locale (zh-CN)
 * getLocalizedRoute(Routes.AIChat) // => '/zh-CN/ai/chat'
 *
 * // 指定 locale
 * getLocalizedRoute(Routes.AIChat, 'en') // => '/en/ai/chat'
 *
 * // 外部链接保持不变
 * getLocalizedRoute(Routes.Roadmap) // => 'https://qiflowai.link/roadmap'
 * ```
 */
export function getLocalizedRoute(route: Routes, locale?: string): string {
  const targetLocale = locale || routing.defaultLocale;
  const routePath = route as string;

  // 如果是外部链接或锚点，直接返回
  if (routePath.startsWith('http') || routePath.startsWith('#')) {
    return routePath;
  }

  // 如果路由已经包含 locale 前缀，直接返回
  const locales = routing.locales as readonly string[];
  for (const loc of locales) {
    if (routePath.startsWith(`/${loc}/`) || routePath === `/${loc}`) {
      return routePath;
    }
  }

  // 添加 locale 前缀
  // 注意：如果 routePath 是 '/'，则返回 '/zh-CN'；否则返回 '/zh-CN/path'
  return routePath === '/'
    ? `/${targetLocale}`
    : `/${targetLocale}${routePath}`;
}

/**
 * 在客户端组件中获取当前 locale 下的国际化路由
 *
 * 这个函数会尝试从 URL 中提取当前的 locale，
 * 如果无法提取则使用默认 locale
 *
 * @param route - Routes 枚举值
 * @returns 带当前 locale 前缀的完整路径
 *
 * @example
 * ```tsx
 * 'use client'
 * import { useLocaleRoute } from '@/lib/i18n-routes'
 *
 * function MyComponent() {
 *   const chatUrl = useLocaleRoute(Routes.AIChat)
 *   return <a href={chatUrl}>AI Chat</a>
 * }
 * ```
 */
export function useLocaleRoute(route: Routes): string {
  // 在客户端尝试从 window.location.pathname 提取 locale
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    const locales = routing.locales as readonly string[];

    for (const locale of locales) {
      if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
        return getLocalizedRoute(route, locale);
      }
    }
  }

  // 默认返回使用 defaultLocale 的路径
  return getLocalizedRoute(route);
}

/**
 * 从请求对象中获取 locale 并生成国际化路由
 * 用于服务端 API 路由、Server Actions 等场景
 *
 * @param route - Routes 枚举值
 * @param request - Next.js Request 对象或包含 headers 的对象
 * @returns 带检测到的 locale 前缀的完整路径
 *
 * @example
 * ```ts
 * // 在 API Route 中使用
 * export async function POST(request: Request) {
 *   const chatUrl = getLocalizedRouteFromRequest(Routes.AIChat, request)
 *   return Response.json({ url: chatUrl })
 * }
 * ```
 */
export function getLocalizedRouteFromRequest(
  route: Routes,
  request: Request | { headers: Headers }
): string {
  // 1. 检查 cookie 中的 NEXT_LOCALE
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const localeCookie = cookieHeader
      .split(';')
      .find((c) => c.trim().startsWith('NEXT_LOCALE='));

    if (localeCookie) {
      const locale = localeCookie.split('=')[1]?.trim();
      if (locale && (routing.locales as readonly string[]).includes(locale)) {
        return getLocalizedRoute(route, locale);
      }
    }
  }

  // 2. 检查 Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const locales = routing.locales as readonly string[];
    const preferredLocales = acceptLanguage
      .split(',')
      .map((lang) => lang.split(';')[0]?.trim())
      .filter(Boolean);

    for (const preferred of preferredLocales) {
      // 精确匹配
      if (locales.includes(preferred)) {
        return getLocalizedRoute(route, preferred);
      }

      // 语言代码匹配（如 'zh' 匹配 'zh-CN'）
      const langCode = preferred.split('-')[0];
      const matched = locales.find((loc) => loc.startsWith(langCode + '-'));
      if (matched) {
        return getLocalizedRoute(route, matched);
      }
    }
  }

  // 3. 默认使用 defaultLocale
  return getLocalizedRoute(route);
}

/**
 * 类型安全的路由 builder，用于在 TypeScript 中更方便地构建国际化路由
 *
 * @example
 * ```ts
 * const routes = createLocalizedRoutes('zh-CN')
 * routes.AIChat // => '/zh-CN/ai/chat'
 * routes.Dashboard // => '/zh-CN/dashboard'
 * ```
 */
export function createLocalizedRoutes(locale?: string) {
  return new Proxy({} as Record<keyof typeof Routes, string>, {
    get(target, prop: string) {
      if (prop in Routes) {
        return getLocalizedRoute(Routes[prop as keyof typeof Routes], locale);
      }
      return undefined;
    },
  });
}
