import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 编译器选项
  compiler: {
    // 移除 console.log (仅在生产环境)
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // 图片优化配置
  images: {
    domains: ['localhost'],
  },

  // Webpack 配置
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    // 处理 canvg 模块的解析问题
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      fs: false,
    };

    // 处理 canvg 模块的导入问题
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'canvg': false,
      };
    }

    return config;
  },

  // 国际化配置
  async headers() {
    const base = [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];

    // 开发环境下不设置 CSP，避免浏览器扩展与内联脚本导致的干扰

    if (process.env.NODE_ENV === 'production') {
      base[0].headers.push({
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'wasm-unsafe-eval' 'inline-speculation-rules'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob:",
          "connect-src 'self'",
          "font-src 'self' data:",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join('; '),
      });
    }

    return base;
  },

  // 重定向配置 - 由middleware处理，这里不需要额外配置
  // async redirects() {
  //   return [];
  // },
};

export default withNextIntl(nextConfig);
