/**
 * SEO 元数据生成器
 * 为八字分析、AI聊天等页面生成优化的元数据
 */

import { Metadata } from 'next';

// 基础元数据配置
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://qiflow.ai';
const SITE_NAME = 'QiFlow AI - AI八字风水智能分析平台';

// 默认元数据
export const defaultMetadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: SITE_NAME,
    template: '%s | QiFlow AI',
  },
  description: '融合东方智慧与现代AI，专业八字分析与风水指导，基于千年易学智慧与现代科技',
  keywords: [
    'AI八字',
    '八字分析',
    '风水罗盘',
    '玄空飞星',
    'AI咨询',
    '命理分析',
    'BaZi',
    'Feng Shui',
    'QiFlow',
  ],
  authors: [{ name: 'QiFlow AI Team' }],
  creator: 'QiFlow AI',
  publisher: 'QiFlow AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
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
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: BASE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: '融合东方智慧与现代AI，专业八字分析与风水指导',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'QiFlow AI - AI八字风水分析',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: '融合东方智慧与现代AI，专业八字分析与风水指导',
    images: ['/og-image.png'],
    creator: '@qiflowai',
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      'zh-CN': `${BASE_URL}/zh`,
      'en-US': `${BASE_URL}/en`,
      'ko-KR': `${BASE_URL}/ko`,
      'ja-JP': `${BASE_URL}/ja`,
    },
  },
};

// 页面特定元数据生成器
export const generatePageMetadata = (
  page: 'bazi' | 'xuankong' | 'ai-chat' | 'showcase',
  locale: string = 'zh'
): Metadata => {
  const metadata: Record<string, Metadata> = {
    bazi: {
      title: '八字分析 - 专业命理算法分析',
      description: '基于专业算法的个性化八字命理分析，结合传统十神理论与现代AI技术，提供深度生活洞察与运势指导',
      keywords: ['八字分析', '四柱命理', '十神', '命盘', '运势分析', 'BaZi Analysis'],
      openGraph: {
        title: '八字分析 | QiFlow AI',
        description: '专业八字算法分析，深度解读您的命理特征',
        images: [
          {
            url: '/og-bazi.png',
            width: 1200,
            height: 630,
            alt: '八字分析',
          },
        ],
      },
    },
    xuankong: {
      title: '玄空飞星风水罗盘',
      description: '精确测量方位，智能生成风水布局建议，助力优化居住与工作空间',
      keywords: ['玄空飞星', '风水罗盘', '九宫飞星', '风水布局', 'Flying Stars'],
      openGraph: {
        title: '玄空飞星罗盘 | QiFlow AI',
        description: '专业风水罗盘，智能空间优化建议',
        images: [
          {
            url: '/og-xuankong.png',
            width: 1200,
            height: 630,
            alt: '玄空飞星罗盘',
          },
        ],
      },
    },
    'ai-chat': {
      title: 'AI智能咨询',
      description: '基于您的八字命理和风水数据，提供个性化的专业建议与实时问答',
      keywords: ['AI咨询', '智能问答', '命理咨询', '风水建议', 'AI Consultation'],
      openGraph: {
        title: 'AI智能咨询 | QiFlow AI',
        description: '算法优先的AI问答，个性化专业建议',
        images: [
          {
            url: '/og-chat.png',
            width: 1200,
            height: 630,
            alt: 'AI智能咨询',
          },
        ],
      },
    },
    showcase: {
      title: '功能展示',
      description: '探索QiFlow AI的核心功能：八字命理分析、玄空飞星罗盘、AI智能咨询',
      keywords: ['功能展示', '产品特性', '核心功能', 'Features'],
      openGraph: {
        title: '功能展示 | QiFlow AI',
        description: '探索QiFlow AI的强大功能',
        images: [
          {
            url: '/og-showcase.png',
            width: 1200,
            height: 630,
            alt: '功能展示',
          },
        ],
      },
    },
  };

  return {
    ...metadata[page],
    alternates: {
      canonical: `${BASE_URL}/${locale}/${page}`,
      languages: {
        'zh-CN': `${BASE_URL}/zh/${page}`,
        'en-US': `${BASE_URL}/en/${page}`,
        'ko-KR': `${BASE_URL}/ko/${page}`,
        'ja-JP': `${BASE_URL}/ja/${page}`,
      },
    },
  };
};

// 结构化数据生成器（JSON-LD）
export const generateStructuredData = (
  type: 'WebSite' | 'SoftwareApplication' | 'FAQPage',
  data?: any
) => {
  const schemas: Record<string, any> = {
    WebSite: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: BASE_URL,
      description: '融合东方智慧与现代AI的八字风水分析平台',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${BASE_URL}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    SoftwareApplication: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'QiFlow AI',
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'CNY',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '10000',
        bestRating: '5',
        worstRating: '1',
      },
    },
    FAQPage: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: data?.faqs?.map((faq: any) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
  };

  return schemas[type] || {};
};

// 动态元数据生成（用于个性化内容）
export const generateDynamicMetadata = (
  title: string,
  description: string,
  image?: string
): Metadata => {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [image] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
};