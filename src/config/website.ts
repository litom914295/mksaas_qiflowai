export const websiteConfig = {
  i18n: {
    defaultLocale: 'zh-CN',
    locales: {
      'zh-CN': { name: '简体中文', code: 'zh-CN' },
      'zh-TW': { name: '繁體中文', code: 'zh-TW' },
      en: { name: 'English', code: 'en' },
      ja: { name: '日本語', code: 'ja' },
      ko: { name: '한국어', code: 'ko' },
      'ms-MY': { name: 'Bahasa Melayu', code: 'ms-MY' },
    },
  },
  name: 'QiFlow AI',
  description: '智能八字风水分析平台',
  features: {
    enableDatafastRevenueTrack: false,
    enableAffonsoAffiliate: false,
    enablePromotekitAffiliate: false,
    enableTurnstileCaptcha: false,
    enableCrispChat: false,
    enableUpgradeCard: true,
    enableUpdateAvatar: true,
  },
  // 统一的价格与积分配置（供 credits/price 逻辑读取）
  price: {
    provider: 'stripe',
    plans: {
      free: {
        id: 'free',
        prices: [],
        isFree: true,
        isLifetime: false,
        credits: {
          enable: true,
          amount: 50,
          expireDays: 30,
        },
      },
      pro: {
        id: 'pro',
        prices: [
          {
            type: 'subscription',
            priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY!,
            amount: 990,
            currency: 'USD',
            interval: 'month',
          },
          {
            type: 'subscription',
            priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY!,
            amount: 9900,
            currency: 'USD',
            interval: 'year',
          },
        ],
        isFree: false,
        isLifetime: false,
        popular: true,
        credits: {
          enable: true,
          amount: 1000,
          expireDays: 30,
        },
      },
      lifetime: {
        id: 'lifetime',
        prices: [
          {
            type: 'one_time',
            priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_LIFETIME!,
            amount: 19900,
            currency: 'USD',
            allowPromotionCode: true,
          },
        ],
        isFree: false,
        isLifetime: true,
        credits: {
          enable: true,
          amount: 1000,
          expireDays: 30,
        },
      },
    },
  },
  credits: {
    enableCredits: true,
    // 注册赠送：提升为70，保证首日完整体验
    registerGiftCredits: {
      enable: true,
      amount: 70,
      expireDays: 30,
    },
    // 每日签到奖励（P0）
    dailySignin: {
      enable: true,
      amount: 5,
    },
    // 是否允许免费计划也购买积分包
    enablePackagesForFreePlan: true,
    // 可售卖积分包（若未配置Stripe价格ID，前端可隐藏购买入口）
    packages: {
      basic: {
        id: 'basic',
        popular: false,
        amount: 100,
        expireDays: 30,
        price: {
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDITS_BASIC!,
          amount: 990,
          currency: 'USD',
          allowPromotionCode: true,
        },
      },
      standard: {
        id: 'standard',
        popular: true,
        amount: 200,
        expireDays: 30,
        price: {
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDITS_STANDARD!,
          amount: 1490,
          currency: 'USD',
          allowPromotionCode: true,
        },
      },
      premium: {
        id: 'premium',
        popular: false,
        amount: 500,
        expireDays: 30,
        price: {
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDITS_PREMIUM!,
          amount: 3990,
          currency: 'USD',
          allowPromotionCode: true,
        },
      },
      enterprise: {
        id: 'enterprise',
        popular: false,
        amount: 1000,
        expireDays: 30,
        price: {
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDITS_ENTERPRISE!,
          amount: 6990,
          currency: 'USD',
          allowPromotionCode: true,
        },
      },
    },
  },
  newsletter: {
    enable: false,
    autoSubscribeAfterSignUp: false,
  },
  mail: {
    supportEmail: process.env.SUPPORT_EMAIL || 'support@qiflowai.com',
  },
  analytics: {
    enableVercelAnalytics: false,
    enableVercelSpeedInsights: false,
    enableDatafastAnalytics: false,
  },
  metadata: {
    social: {
      twitter: process.env.NEXT_PUBLIC_TWITTER_URL || '',
      github: process.env.NEXT_PUBLIC_GITHUB_URL || '',
    },
    images: {
      logoLight: '/logo.png',
      logoDark: '/logo.png',
    },
  },
  blog: {
    paginationSize: 10,
    relatedPostsSize: 3,
    enable: false,
  },
  auth: {
    enableCredentialLogin: true,
    enableGoogleLogin: false,
    enableGithubLogin: false,
  },
  ui: {
    mode: {
      defaultMode: 'system' as const,
      enableSwitch: true,
    },
    theme: {
      defaultTheme: 'default',
      enableSwitch: true,
    },
  },
  docs: { enable: false },
  storage: { enable: false },
};
