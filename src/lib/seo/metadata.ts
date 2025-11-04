/**
 * SEO 元数据生成器
 * 任务15: SEO优化 (Metadata/Sitemap/Robots)
 */

import type { Metadata } from 'next';

interface PageMetadataProps {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
  canonicalUrl?: string;
  locale?: string;
}

/**
 * 生成页面元数据
 */
export function generatePageMetadata({
  title,
  description,
  keywords = [],
  ogImage = '/og-image.jpg',
  noIndex = false,
  canonicalUrl,
  locale = 'zh-CN',
}: PageMetadataProps): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qiflow.ai';
  const siteName = 'QiFlow AI';
  const fullTitle = `${title} | ${siteName}`;

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),

    // Open Graph
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl || siteUrl,
      siteName,
      images: [
        {
          url: ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale,
      type: 'website',
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`],
      creator: '@qiflowai',
      site: '@qiflowai',
    },

    // Canonical URL
    alternates: canonicalUrl
      ? {
          canonical: canonicalUrl,
        }
      : undefined,

    // Robots
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },

    // Verification
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      // 其他验证码可以添加在这里
    },

    // 其他元数据
    metadataBase: new URL(siteUrl),
    applicationName: siteName,
    authors: [{ name: siteName }],
    generator: 'Next.js',
    referrer: 'origin-when-cross-origin',
    creator: siteName,
    publisher: siteName,
    category: '风水命理',
  };
}

/**
 * 首页元数据
 */
export const homeMetadata: Metadata = generatePageMetadata({
  title: 'AI 八字 · 玄空风水分析',
  description:
    '结合传统命理与现代 AI，一键生成关键洞察与建议，隐私优先、透明计费。',
  keywords: [
    'AI八字',
    '八字分析',
    '玄空风水罗盘',
    '飞星',
    'AI咨询',
    '四柱',
    '风水',
    'Bazi',
    'Feng Shui',
    'Luopan',
  ],
  ogImage: '/og-home.jpg',
});

/**
 * 八字分析页元数据
 */
export const baziMetadata: Metadata = generatePageMetadata({
  title: 'AI 八字命理分析',
  description: '基于专业算法的个人化命理洞察，结合传统十神理论与现代 AI 技术。',
  keywords: ['八字', '命理', 'AI分析', '十神', '大运', '流年'],
  ogImage: '/og-bazi.jpg',
});

/**
 * 玄空罗盘页元数据
 */
export const compassMetadata: Metadata = generatePageMetadata({
  title: '玄空飞星罗盘分析',
  description: '精确测量方位，智能生成风水布局建议，助力优化居住与工作空间。',
  keywords: ['玄空', '飞星', '罗盘', '风水', '九宫', '方位'],
  ogImage: '/og-compass.jpg',
});

/**
 * AI 对话页元数据
 */
export const chatMetadata: Metadata = generatePageMetadata({
  title: 'AI 风水命理咨询',
  description: '实时多轮对话，专业命理风水问题解答，个性化建议推荐。',
  keywords: ['AI对话', '命理咨询', '风水问答', '在线咨询'],
  ogImage: '/og-chat.jpg',
});

/**
 * 定价页元数据
 */
export const pricingMetadata: Metadata = generatePageMetadata({
  title: '积分套餐与定价',
  description: '灵活的积分套餐，透明的功能计费，按需付费无隐藏费用。',
  keywords: ['定价', '积分', '套餐', '计费'],
  ogImage: '/og-pricing.jpg',
});

/**
 * 关于页元数据
 */
export const aboutMetadata: Metadata = generatePageMetadata({
  title: '关于我们',
  description:
    'QiFlow AI 融合传统命理智慧与现代 AI 技术，提供专业可信的个性化分析服务。',
  keywords: ['关于', '团队', '使命', '技术'],
  ogImage: '/og-about.jpg',
});

/**
 * JSON-LD 结构化数据
 */
export function generateJsonLd(
  type: 'Organization' | 'WebSite' | 'FAQPage',
  data: any
) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qiflow.ai';

  const schemas = {
    Organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'QiFlow AI',
      url: baseUrl,
      logo: `${baseUrl}/logo.png`,
      description: '融合传统命理与现代 AI 技术的智能分析平台',
      ...data,
    },
    WebSite: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'QiFlow AI',
      url: baseUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${baseUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
      ...data,
    },
    FAQPage: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: data.questions || [],
    },
  };

  return {
    __html: JSON.stringify(schemas[type]),
  };
}
