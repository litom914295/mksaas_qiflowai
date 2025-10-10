export const websiteConfig = {
  i18n: {
    defaultLocale: 'zh-CN',
    locales: {
      'zh-CN': {
        name: '简体中文',
        code: 'zh-CN',
      },
      en: {
        name: 'English',
        code: 'en',
      },
    },
  },
  name: '气流AI',
  description: '智能八字风水分析平台',
  features: {
    enableDatafastRevenueTrack: false, // 默认禁用 Datafast 收入跟踪
  },
  credits: {
    enableCredits: true, // 启用积分系统
    registerGiftCredits: {
      enable: true, // 注册赠送积分
      amount: 50, // 注册赠送积分数
    },
  },
  newsletter: {
    enable: false, // 禁用邮件订阅
    autoSubscribeAfterSignUp: false, // 注册后不自动订阅
  },
  mail: {
    supportEmail: process.env.SUPPORT_EMAIL || 'support@qiflowai.com', // 支持邮箱
  },
  analytics: {
    enableVercelAnalytics: false, // Vercel 分析
    enableVercelSpeedInsights: false, // Vercel Speed Insights
    enableDatafastAnalytics: false, // Datafast 分析
  },
  metadata: {
    social: {
      twitter: process.env.NEXT_PUBLIC_TWITTER_URL || '',
      github: process.env.NEXT_PUBLIC_GITHUB_URL || '',
    },
  },
  blog: {
    paginationSize: 10, // 博客分页大小
    relatedPostsSize: 3, // 相关文章数量
  },
  auth: {
    enableCredentialLogin: true, // 启用账号密码登录
  },
  ui: {
    mode: {
      defaultMode: 'system' as const, // 默认主题模式
    },
  },
};
