import { loadEnvConfig } from '@next/env';
import { withSentryConfig } from '@sentry/nextjs';
import { createMDX } from 'fumadocs-mdx/next';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// Load Next.js environment variables (ensures CLI tools can access env vars)
loadEnvConfig(process.cwd());

/**
 * https://nextjs.org/docs/app/api-reference/config/next-config-js
 */
const nextConfig: NextConfig = {
  // Docker standalone output
  ...(process.env.DOCKER_BUILD === 'true' && { output: 'standalone' }),

  /* config options here */
  // Next.js 15: devIndicators 配置
  devIndicators: {
    buildActivityPosition: 'bottom-right',
  },

  // Ensure .tsx/.jsx pages are recognized alongside MDX
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],

  // 性能优化：禁用生产环境 source maps
  productionBrowserSourceMaps: false,

  // 性能优化：启用压缩
  compress: true,

  // Next.js 15: typedRoutes 已移到 experimental
  experimental: {
    webpackBuildWorker: false,
    optimizePackageImports: [],
    // typedRoutes 已在 Next.js 15 中正式移除，无需配置
  },

  // Webpack 优化配置
  webpack: (
    config: any,
    { dev, isServer }: { dev: boolean; isServer: boolean }
  ) => {
    // MDX 支持 - 确保 MDX 文件正确被处理
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];

    // 开发环境优化
    if (dev) {
      // 减少文件监听开销
      config.watchOptions = {
        poll: false, // 禁用轮询，使用原生文件系统事件
        aggregateTimeout: 300, // 增加聚合延迟，减少编译次数
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/.next/**',
          '**/backup_*/**',
          '**/qiflow-ai/**',
          '**/qiflow-ui/**',
          '**/artifacts/**',
          '**/.taskmaster/**',
          '**/tests/**',
          '**/scripts/**',
        ],
      };

      // 开发环境优化：减少代码分割和优化
      config.optimization = {
        ...config.optimization,
        moduleIds: 'named',
        chunkIds: 'named',
        minimize: false, // 开发环境不压缩
        splitChunks: false, // 禁用代码分割以加快编译
        removeAvailableModules: false,
        removeEmptyChunks: false,
      };
    }

    // 优化模块解析
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };

    // 减少bundle大小
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },

  // Next.js 15: Turbopack 配置已移除，不再需要在根配置中声明
  // Turbopack 现在通过命令行 `--turbo` 启用
  // SVG 加载器可在 webpack 配置中自定义

  // https://nextjs.org/docs/architecture/nextjs-compiler#remove-console
  // Remove all console.* calls in production only
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'],
          }
        : false,
  },

  // 安全头部（提升 Best Practices 分数）
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
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
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  images: {
    // https://vercel.com/docs/image-optimization/managing-image-optimization-costs#minimizing-image-optimization-costs
    // https://nextjs.org/docs/app/api-reference/components/image#unoptimized
    // vercel has limits on image optimization, 1000 images per month
    unoptimized: process.env.DISABLE_IMAGE_OPTIMIZATION === 'true',
    formats: ['image/avif', 'image/webp'], // 现代图片格式
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048], // 设备尺寸
    imageSizes: [16, 32, 48, 64, 96, 128, 256], // 图片尺寸
    minimumCacheTTL: 60, // 最小缓存时间
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
      },
      {
        protocol: 'https',
        hostname: 'html.tailus.io',
      },
      {
        protocol: 'https',
        hostname: 'service.firecrawl.dev',
      },
    ],
  },
};

/**
 * You can specify the path to the request config file or use the default one (@/i18n/request.ts)
 *
 * https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing#next-config
 */
// const withNextIntl = createNextIntlPlugin(); // disabled for isolation

/**
 * https://fumadocs.dev/docs/ui/manual-installation
 * https://fumadocs.dev/docs/mdx/plugin
 */
// MDX plugin disabled for stability

/**
 * Webpack Bundle Analyzer
 * Run with: ANALYZE=true npm run build
 */
// const withBundleAnalyzer = bundleAnalyzer({
//   enabled: process.env.ANALYZE === 'true',
// });

// 明确指向 i18n 请求配置，避免默认路径差异
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
const withMDX = createMDX();

// 应用所有配置包装器
let config = nextConfig;
config = withNextIntl(config);
config = withMDX(config);

// Sentry配置 - 仅在生产环境或设置了SENTRY_AUTH_TOKEN时启用
const shouldUseSentry =
  process.env.NODE_ENV === 'production' || process.env.SENTRY_AUTH_TOKEN;

if (shouldUseSentry) {
  config = withSentryConfig(config, {
    // Sentry Webpack Plugin 选项
    // https://github.com/getsentry/sentry-webpack-plugin
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    authToken: process.env.SENTRY_AUTH_TOKEN,

    // 静默构建输出以减少日志
    silent: true,

    // 上传source maps
    // 注意：这会增加构建时间
    widenClientFileUpload: true,

    // 自动设置路由以隧道Sentry请求，避免广告拦截器
    tunnelRoute: '/monitoring',

    // 禁用Sentry SDK的调试日志
    disableLogger: true,

    // 自动为客户端导入instruments
    automaticVercelMonitors: true,
  });
}

export default config;
