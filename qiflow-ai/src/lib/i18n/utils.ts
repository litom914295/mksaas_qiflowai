import { locales, defaultLocale, type Locale } from './config';

// 验证语言代码是否有效
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

// 从URL路径中提取语言代码
export function getLocaleFromPathname(pathname: string): Locale {
  const segments = pathname.split('/');
  const potentialLocale = segments[1];
  
  if (potentialLocale && isValidLocale(potentialLocale)) {
    return potentialLocale;
  }
  
  return defaultLocale;
}

// 移除路径中的语言前缀
export function removeLocaleFromPathname(pathname: string): string {
  const segments = pathname.split('/');
  if (segments[1] && isValidLocale(segments[1])) {
    segments.splice(1, 1);
  }
  return segments.join('/') || '/';
}

// 为路径添加语言前缀
export function addLocaleToPathname(pathname: string, locale: Locale): string {
  const cleanPath = removeLocaleFromPathname(pathname);
  return `/${locale}${cleanPath === '/' ? '' : cleanPath}`;
}

// 获取浏览器首选语言
export function getBrowserLocale(): Locale {
  if (typeof window === 'undefined') {
    return defaultLocale;
  }

  const browserLang = navigator.language || navigator.languages?.[0];
  
  if (!browserLang) {
    return defaultLocale;
  }

  // 精确匹配
  if (isValidLocale(browserLang)) {
    return browserLang;
  }

  // 语言代码匹配（如 zh-CN 匹配 zh）
  const langCode = browserLang.split('-')[0];
  const matchingLocale = locales.find(locale => locale.startsWith(langCode));
  
  return matchingLocale || defaultLocale;
}

// 格式化日期时间
export function formatDateTime(
  date: Date,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(date);
}

// 格式化数字
export function formatNumber(
  number: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(number);
}

// 格式化货币
export function formatCurrency(
  amount: number,
  locale: Locale,
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

// 获取相对时间格式
export function formatRelativeTime(
  date: Date,
  locale: Locale,
  baseDate: Date = new Date()
): string {
  const diffInSeconds = Math.floor((baseDate.getTime() - date.getTime()) / 1000);
  
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  
  if (Math.abs(diffInSeconds) < 60) {
    return rtf.format(-diffInSeconds, 'second');
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (Math.abs(diffInMinutes) < 60) {
    return rtf.format(-diffInMinutes, 'minute');
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (Math.abs(diffInHours) < 24) {
    return rtf.format(-diffInHours, 'hour');
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (Math.abs(diffInDays) < 30) {
    return rtf.format(-diffInDays, 'day');
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (Math.abs(diffInMonths) < 12) {
    return rtf.format(-diffInMonths, 'month');
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return rtf.format(-diffInYears, 'year');
}

// 获取语言的文本方向
export function getTextDirection(_locale: Locale): 'ltr' | 'rtl' {
  // 目前支持的语言都是从左到右
  return 'ltr';
}

// 获取语言的字体族
export function getFontFamily(locale: Locale): string {
  switch (locale) {
    case 'zh-CN':
    case 'zh-TW':
      return '"Noto Sans SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';
    case 'ja':
      return '"Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", sans-serif';
    case 'ko':
      return '"Noto Sans KR", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    case 'ms':
      return '"Noto Sans", "Segoe UI", "Roboto", sans-serif';
    default:
      return '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", sans-serif';
  }
}

// 检查是否为CJK语言（中日韩）
export function isCJKLocale(locale: Locale): boolean {
  return ['zh-CN', 'zh-TW', 'ja', 'ko'].includes(locale);
}

// 获取语言的排序规则
export function getCollator(locale: Locale): Intl.Collator {
  return new Intl.Collator(locale, {
    sensitivity: 'base',
    numeric: true,
  });
}

// 本地化URL slug
export function localizeSlug(slug: string, locale: Locale): string {
  // 为不同语言提供本地化的URL slug
  const slugMappings: Record<string, Record<Locale, string>> = {
    'dashboard': {
      'zh-CN': 'dashboard',
      'zh-TW': 'dashboard',
      'en': 'dashboard',
      'ja': 'dashboard',
      'ko': 'dashboard',
      'ms': 'dashboard'
    },
    'analysis': {
      'zh-CN': 'analysis',
      'zh-TW': 'analysis',
      'en': 'analysis',
      'ja': 'analysis',
      'ko': 'analysis',
      'ms': 'analysis'
    },
    // 可以根据需要添加更多映射
  };

  return slugMappings[slug]?.[locale] || slug;
}