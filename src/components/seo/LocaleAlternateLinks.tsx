import { routing } from '@/i18n/routing';

/**
 * Locale Alternate Links 组件
 * 
 * 为每个支持的 locale 生成 <link rel="alternate" hreflang="..."> 标签
 * 这对于国际化 SEO 至关重要
 * 
 * @see https://developers.google.com/search/docs/specialty/international/localized-versions
 */

export interface LocaleAlternateLinksProps {
  /** 当前页面的路径（不含 locale 前缀，如 '/dashboard' 或 '/ai/chat'） */
  pathname: string;
  /** 网站的基础 URL（如 'https://qiflow.ai'） */
  baseUrl?: string;
}

export function LocaleAlternateLinks({ 
  pathname, 
  baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qiflow.ai' 
}: LocaleAlternateLinksProps) {
  const locales = routing.locales as readonly string[];

  return (
    <>
      {locales.map((locale) => (
        <link
          key={locale}
          rel="alternate"
          hrefLang={locale}
          href={`${baseUrl}/${locale}${pathname}`}
        />
      ))}
      
      {/* x-default 用于未匹配到任何 hreflang 的用户 */}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${baseUrl}/${routing.defaultLocale}${pathname}`}
      />
    </>
  );
}

/**
 * 生成 sitemap 的 URL 列表（包含所有 locale）
 */
export function generateLocalizedUrls(
  pathname: string,
  baseUrl?: string
): Array<{ locale: string; url: string; isDefault: boolean }> {
  const base = baseUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://qiflow.ai';
  const locales = routing.locales as readonly string[];

  return locales.map((locale) => ({
    locale,
    url: `${base}/${locale}${pathname}`,
    isDefault: locale === routing.defaultLocale,
  }));
}

/**
 * 为 Open Graph 和 Twitter Card 生成 locale-aware URLs
 */
export function getCanonicalUrl(
  pathname: string,
  locale: string,
  baseUrl?: string
): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://qiflow.ai';
  return `${base}/${locale}${pathname}`;
}
