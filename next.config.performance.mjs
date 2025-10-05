/**
 * Next.js 性能优化配置
 * 任务14: 优化Core Web Vitals (LCP/CLS/INP)
 */

/** @type {import('next').NextConfig} */
const performanceConfig = {
  // 1. 图片优化
  images: {
    // 启用图片优化
    formats: ['image/webp', 'image/avif'],
    // 设置图片尺寸
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 懒加载策略
    minimumCacheTTL: 60,
    // 允许的域名
    domains: [],
  },

  // 2. 编译优化
  compiler: {
    // 移除console.log (生产环境)
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'],
          }
        : false,
    // 移除React属性
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },

  // 3. 实验性功能
  experimental: {
    // 优化包导入
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
      'react-icons',
    ],
    // 服务器组件外部包
    serverComponentsExternalPackages: [],
    // 优化字体
    optimizeFonts: true,
    // 启用Turbopack (开发)
    turbo: {},
  },

  // 4. 生产优化
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  compress: true,

  // 5. SWC Minification
  swcMinify: true,

  // 6. 静态优化
  generateEtags: true,

  // 7. 严格模式
  reactStrictMode: true,

  // 8. 重定向和重写优化
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      // 静态资源缓存
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // 图片缓存
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default performanceConfig;
