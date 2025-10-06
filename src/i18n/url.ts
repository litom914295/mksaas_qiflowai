import { LOCALES, LOCALE_COOKIE_NAME } from './routing';
import type { NextRequest } from 'next/server';

/**
 * 确保路径带有 locale 前缀；若未带则添加给定 locale（默认 zh-CN）。
 * - 已带任一支持的 locale 时，原样返回
 * - 仅处理以 '/' 开头的站内路径
 */
export function ensureLocalePrefix(path: string, locale = 'zh-CN'): string {
  if (!path || !path.startsWith('/')) return path;
  const first = path.split('/')[1];
  if (LOCALES.includes(first)) return path; // 已带 locale
  return `/${locale}${path}`;
}

/**
 * 从请求中选择更合适的 locale：
 * 1) Cookie: NEXT_LOCALE
 * 2) Accept-Language: 解析并在支持列表中匹配（特殊处理 zh → zh-CN）
 * 3) 兜底: 'zh-CN'（与业务目标一致）
 */
export function getPreferredLocaleFromRequest(req: NextRequest, fallback: string = 'zh-CN'): string {
  try {
    const cookie = req.cookies.get(LOCALE_COOKIE_NAME)?.value;
    if (cookie && LOCALES.some(l => l.toLowerCase() === cookie.toLowerCase())) {
      return LOCALES.find(l => l.toLowerCase() === cookie.toLowerCase())!;
    }
  } catch {}

  try {
    const al = req.headers.get('accept-language') || '';
    if (al) {
      const items = al.split(',').map(s => s.trim().split(';')[0].toLowerCase());
      for (const lang of items) {
        // 精确匹配
        const exact = LOCALES.find(l => l.toLowerCase() === lang);
        if (exact) return exact;
        // 前缀匹配（如 zh → zh-CN, en → en）
        if (lang.startsWith('zh')) {
          const zh = LOCALES.find(l => l.toLowerCase() === 'zh-cn') || LOCALES.find(l => l.toLowerCase().startsWith('zh'));
          if (zh) return zh;
        }
        if (lang.startsWith('en')) {
          const en = LOCALES.find(l => l.toLowerCase() === 'en');
          if (en) return en;
        }
      }
    }
  } catch {}

  return fallback;
}
