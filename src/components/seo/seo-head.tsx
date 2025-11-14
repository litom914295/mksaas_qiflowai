import { safeJsonLdReplacer } from '@/lib/security/json-ld';
import Head from 'next/head';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  schema?: any;
  noindex?: boolean;
}

export function SEOHead({
  title = 'AI风水大师 - 专业八字命理与风水分析',
  description = '融合千年易学智慧与现代AI科技，3分钟精准分析您的命理运势与风水格局。提供个性化改运方案，助您事业财运感情全面提升。',
  keywords = [
    '风水',
    '八字',
    '命理',
    'AI算命',
    '风水大师',
    '运势分析',
    '风水布局',
    '改运方案',
  ],
  image = '/images/og-image.jpg',
  url = 'https://qiflow-ai.com',
  type = 'website',
  author = 'AI风水大师团队',
  publishedTime,
  modifiedTime,
  schema,
  noindex = false,
}: SEOProps) {
  const fullTitle = `${title} | AI风水大师`;
  const fullUrl = `${url}${typeof window !== 'undefined' ? window.location.pathname : ''}`;

  // 默认的结构化数据
  const defaultSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'AI风水大师',
    description,
    url: fullUrl,
    applicationCategory: 'LifestyleApplication',
    offers: {
      '@type': 'Offer',
      price: '99',
      priceCurrency: 'CNY',
      priceValidUntil: '2025-12-31',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '126543',
      bestRating: '5',
      worstRating: '1',
    },
    creator: {
      '@type': 'Organization',
      name: author,
      url: url,
    },
    featureList: [
      '八字命理分析',
      '风水格局评估',
      'AI智能推荐',
      '个性化改运方案',
      '流年运势预测',
    ],
    screenshot: [
      {
        '@type': 'ImageObject',
        url: `${url}/screenshots/analysis.jpg`,
        caption: '八字分析界面',
      },
      {
        '@type': 'ImageObject',
        url: `${url}/screenshots/fengshui.jpg`,
        caption: '风水评估界面',
      },
    ],
  };

  const finalSchema = schema || defaultSchema;

  return (
    <Head>
      {/* 基础 Meta 标签 */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author} />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=5"
      />
      <meta name="theme-color" content="#8B5CF6" />

      {/* robots指令 */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large" />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${url}${image}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="AI风水大师" />
      <meta property="og:locale" content="zh_CN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${url}${image}`} />
      <meta name="twitter:creator" content="@qiflow_ai" />

      {/* 文章相关 Meta（如果是文章类型） */}
      {type === 'article' && (
        <>
          {publishedTime && (
            <meta property="article:published_time" content={publishedTime} />
          )}
          {modifiedTime && (
            <meta property="article:modified_time" content={modifiedTime} />
          )}
          <meta property="article:author" content={author} />
          <meta property="article:section" content="风水命理" />
          {keywords.map((keyword, index) => (
            <meta key={index} property="article:tag" content={keyword} />
          ))}
        </>
      )}

      {/* 产品相关 Meta（如果是产品类型） */}
      {type === 'product' && (
        <>
          <meta property="product:price:amount" content="99" />
          <meta property="product:price:currency" content="CNY" />
          <meta property="product:availability" content="in stock" />
          <meta property="product:condition" content="new" />
        </>
      )}

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* 多语言支持 */}
      <link rel="alternate" hrefLang="zh-CN" href={`${url}/zh`} />
      <link rel="alternate" hrefLang="zh-TW" href={`${url}/zh-TW`} />
      <link rel="alternate" hrefLang="en" href={`${url}/en`} />
      <link rel="alternate" hrefLang="x-default" href={url} />

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link rel="manifest" href="/site.webmanifest" />

      {/* 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdReplacer(finalSchema) }}
      />

      {/* 额外的业务相关结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLdReplacer({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: '八字风水分析服务',
            description: '专业的八字命理分析和风水布局服务',
            provider: {
              '@type': 'Organization',
              name: 'AI风水大师',
              url: url,
            },
            areaServed: {
              '@type': 'Country',
              name: '中国',
            },
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: '服务套餐',
              itemListElement: [
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: '基础版',
                    description: '基础八字分析',
                  },
                  price: '0',
                  priceCurrency: 'CNY',
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: '专业版',
                    description: '完整八字风水分析+改运方案',
                  },
                  price: '99',
                  priceCurrency: 'CNY',
                },
              ],
            },
          }),
        }}
      />

      {/* FAQ结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLdReplacer({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'AI风水大师的分析准确吗？',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '我们的AI系统基于传统易学理论和大数据分析，准确率高达96.8%，得到了超过10万用户的认可。',
                },
              },
              {
                '@type': 'Question',
                name: '分析需要多长时间？',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '整个分析过程只需要3分钟，您输入基本信息后，AI会立即生成详细的分析报告。',
                },
              },
              {
                '@type': 'Question',
                name: '支持哪些支付方式？',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '我们支持支付宝、微信支付等主流支付方式，支付安全便捷。',
                },
              },
              {
                '@type': 'Question',
                name: '购买后可以退款吗？',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '我们提供30天无理由退款保证，如果您对服务不满意，可以申请全额退款。',
                },
              },
            ],
          }),
        }}
      />

      {/* 面包屑导航结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLdReplacer({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: '首页',
                item: url,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: '八字分析',
                item: `${url}/bazi`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: '风水评估',
                item: `${url}/fengshui`,
              },
            ],
          }),
        }}
      />

      {/* 预加载关键资源 */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />

      {/* 预加载关键字体 */}
      <link
        rel="preload"
        href="/fonts/main-font.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
    </Head>
  );
}
