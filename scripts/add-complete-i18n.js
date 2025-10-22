/**
 * 完整的国际化翻译添加脚本
 * 为所有主要组件添加翻译键
 */

const fs = require('fs');
const path = require('path');

const locales = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'ms'];
const messagesDir = path.join(__dirname, '..', 'messages');

// 完整的翻译内容结构
const completeTranslations = {
  'zh-CN': {
    // Home页面 Features 区域
    home: {
      features: {
        title: '强大的功能，简单的操作',
        subtitle:
          '从八字命理到风水布局，从数据分析到AI咨询，一站式解决所有需求',
        learnMore: '了解更多',
        hint: '💡 所有功能均采用先进的AI算法，确保准确性和专业性',
        bazi: {
          title: '八字分析',
          description: '30秒生成命理报告',
        },
        xuankong: {
          title: '玄空风水',
          description: '智能飞星布局分析',
        },
        compass: {
          title: '罗盘算法',
          description: 'AI 智能方位识别',
        },
        floorPlan: {
          title: '户型图分析',
          description: '上传户型图即可分析',
        },
        visualization3d: {
          title: '3D 可视化',
          description: '立体风水布局展示',
        },
        aiAssistant: {
          title: 'AI 助手',
          description: '24/7 智能问答',
        },
      },
    },

    // FAQ区域
    faqs: {
      title: '常见问题',
      subtitle: '关于我们服务的常见问题解答',
      items: [
        {
          question: '什么是八字命理？',
          answer:
            '八字命理是中国传统文化中的一种命理学说，通过出生年月日时推算人的命运走向。我们的AI系统结合传统理论与现代算法，为您提供精准的命理分析。',
        },
        {
          question: '玄空风水准确吗？',
          answer:
            '我们的玄空风水分析基于传统风水理论，结合AI算法进行精确计算。准确率达到98%以上，已有超过12万用户验证。',
        },
        {
          question: '如何使用罗盘功能？',
          answer:
            '在手机上打开罗盘工具，允许访问设备方向权限，然后按照指引进行方位测量即可。系统会自动校准并提供精准的方位数据。',
        },
        {
          question: '我的数据安全吗？',
          answer:
            '我们非常重视用户隐私和数据安全。所有数据均采用加密存储，不会与第三方分享。您可以随时删除自己的数据。',
        },
        {
          question: '支持哪些支付方式？',
          answer:
            '我们支持支付宝、微信支付、信用卡等多种支付方式。首次体验完全免费，后续可根据需要购买积分。',
        },
        {
          question: '如何联系客服？',
          answer:
            '您可以通过页面右下角的在线客服、邮箱 support@qiflowai.com 或微信公众号联系我们，我们会在24小时内回复。',
        },
      ],
    },

    // Pricing 区域
    pricing: {
      title: '选择适合您的套餐',
      subtitle: '灵活的定价方案，满足不同需求',
      monthly: '月付',
      yearly: '年付',
      save: '节省',
      perMonth: '/月',
      perYear: '/年',
      popularBadge: '最受欢迎',
      getStarted: '立即开始',
      currentPlan: '当前套餐',
      features: '功能特性',
      plans: {
        free: {
          name: '免费体验',
          description: '适合初次尝试的用户',
          price: '0',
          features: ['基础八字分析', '每月5次查询', '标准报告导出', '社区支持'],
        },
        basic: {
          name: '基础版',
          description: '适合个人用户',
          price: '29',
          features: [
            '完整八字分析',
            '每月30次查询',
            '高级报告导出',
            'PDF 格式下载',
            '优先客服支持',
          ],
        },
        pro: {
          name: '专业版',
          description: '适合专业用户和小型工作室',
          price: '99',
          features: [
            '无限次查询',
            '玄空风水分析',
            '3D 可视化',
            'AI 深度解读',
            '专属客服',
            'API 接口访问',
          ],
        },
        enterprise: {
          name: '企业版',
          description: '适合大型机构和企业',
          price: '联系我们',
          features: [
            '所有专业版功能',
            '团队协作',
            '自定义品牌',
            '专属服务器',
            '技术支持',
            '定制开发',
          ],
        },
      },
    },

    // CTA 区域
    cta: {
      title: '准备开始您的命理之旅了吗？',
      subtitle: '立即注册，体验AI驱动的命理分析服务',
      primaryButton: '免费开始',
      secondaryButton: '查看演示',
      trustBadge: '已有 120,000+ 用户信赖',
    },

    // Testimonials 区域
    testimonials: {
      title: '用户评价',
      subtitle: '看看其他用户怎么说',
      readMore: '查看更多评价',
      items: [
        {
          name: '张女士',
          role: '企业高管',
          avatar: '/avatars/avatar-1.jpg',
          rating: 5,
          content:
            '非常准确的八字分析，帮助我在职业规划上做出了正确的决定。界面简洁，操作方便，强烈推荐！',
        },
        {
          name: '李先生',
          role: '室内设计师',
          avatar: '/avatars/avatar-2.jpg',
          rating: 5,
          content:
            '玄空风水分析功能太棒了！为客户提供专业的风水建议变得轻而易举。3D可视化让客户一目了然。',
        },
        {
          name: '王小姐',
          role: '自由职业者',
          avatar: '/avatars/avatar-3.jpg',
          rating: 5,
          content:
            'AI助手24小时在线解答，比传统咨询方便太多。价格也很合理，性价比超高！',
        },
      ],
    },

    // Footer
    footer: {
      company: {
        title: '公司',
        about: '关于我们',
        blog: '博客',
        careers: '招聘',
        press: '媒体',
      },
      product: {
        title: '产品',
        features: '功能',
        pricing: '定价',
        security: '安全',
        roadmap: '路线图',
      },
      resources: {
        title: '资源',
        documentation: '文档',
        guides: '指南',
        apiReference: 'API 参考',
        community: '社区',
      },
      legal: {
        title: '法律',
        privacy: '隐私政策',
        terms: '服务条款',
        disclaimer: '免责声明',
        gdpr: 'GDPR',
      },
      social: {
        title: '关注我们',
        wechat: '微信',
        weibo: '微博',
        twitter: 'Twitter',
        github: 'GitHub',
      },
      copyright: '© 2024 QiFlowAI. 保留所有权利。',
      madeWith: '用 ❤️ 制作于中国',
    },
  },

  'zh-TW': {
    home: {
      features: {
        title: '強大的功能，簡單的操作',
        subtitle:
          '從八字命理到風水佈局，從數據分析到AI諮詢，一站式解決所有需求',
        learnMore: '了解更多',
        hint: '💡 所有功能均採用先進的AI算法，確保準確性和專業性',
        bazi: { title: '八字分析', description: '30秒生成命理報告' },
        xuankong: { title: '玄空風水', description: '智能飛星佈局分析' },
        compass: { title: '羅盤算法', description: 'AI 智能方位識別' },
        floorPlan: { title: '戶型圖分析', description: '上傳戶型圖即可分析' },
        visualization3d: {
          title: '3D 可視化',
          description: '立體風水佈局展示',
        },
        aiAssistant: { title: 'AI 助手', description: '24/7 智能問答' },
      },
    },
    faqs: {
      title: '常見問題',
      subtitle: '關於我們服務的常見問題解答',
      items: [
        {
          question: '什麼是八字命理？',
          answer:
            '八字命理是中國傳統文化中的一種命理學說，通過出生年月日時推算人的命運走向。我們的AI系統結合傳統理論與現代算法，為您提供精準的命理分析。',
        },
        {
          question: '玄空風水準確嗎？',
          answer:
            '我們的玄空風水分析基於傳統風水理論，結合AI算法進行精確計算。準確率達到98%以上，已有超過12萬用戶驗證。',
        },
        {
          question: '如何使用羅盤功能？',
          answer:
            '在手機上打開羅盤工具，允許訪問設備方向權限，然後按照指引進行方位測量即可。系統會自動校準並提供精準的方位數據。',
        },
        {
          question: '我的數據安全嗎？',
          answer:
            '我們非常重視用戶隱私和數據安全。所有數據均採用加密存儲，不會與第三方分享。您可以隨時刪除自己的數據。',
        },
        {
          question: '支持哪些支付方式？',
          answer:
            '我們支持支付寶、微信支付、信用卡等多種支付方式。首次體驗完全免費，後續可根據需要購買積分。',
        },
        {
          question: '如何聯繫客服？',
          answer:
            '您可以通過頁面右下角的在線客服、郵箱 support@qiflowai.com 或微信公眾號聯繫我們，我們會在24小時內回覆。',
        },
      ],
    },
    pricing: {
      title: '選擇適合您的套餐',
      subtitle: '靈活的定價方案，滿足不同需求',
      monthly: '月付',
      yearly: '年付',
      save: '節省',
      perMonth: '/月',
      perYear: '/年',
      popularBadge: '最受歡迎',
      getStarted: '立即開始',
      currentPlan: '當前套餐',
      features: '功能特性',
      plans: {
        free: {
          name: '免費體驗',
          description: '適合初次嘗試的用戶',
          price: '0',
          features: ['基礎八字分析', '每月5次查詢', '標準報告導出', '社區支持'],
        },
        basic: {
          name: '基礎版',
          description: '適合個人用戶',
          price: '29',
          features: [
            '完整八字分析',
            '每月30次查詢',
            '高級報告導出',
            'PDF 格式下載',
            '優先客服支持',
          ],
        },
        pro: {
          name: '專業版',
          description: '適合專業用戶和小型工作室',
          price: '99',
          features: [
            '無限次查詢',
            '玄空風水分析',
            '3D 可視化',
            'AI 深度解讀',
            '專屬客服',
            'API 接口訪問',
          ],
        },
        enterprise: {
          name: '企業版',
          description: '適合大型機構和企業',
          price: '聯繫我們',
          features: [
            '所有專業版功能',
            '團隊協作',
            '自定義品牌',
            '專屬服務器',
            '技術支持',
            '定制開發',
          ],
        },
      },
    },
    cta: {
      title: '準備開始您的命理之旅了嗎？',
      subtitle: '立即註冊，體驗AI驅動的命理分析服務',
      primaryButton: '免費開始',
      secondaryButton: '查看演示',
      trustBadge: '已有 120,000+ 用戶信賴',
    },
    testimonials: {
      title: '用戶評價',
      subtitle: '看看其他用戶怎麼說',
      readMore: '查看更多評價',
      items: [
        {
          name: '張女士',
          role: '企業高管',
          avatar: '/avatars/avatar-1.jpg',
          rating: 5,
          content:
            '非常準確的八字分析，幫助我在職業規劃上做出了正確的決定。界面簡潔，操作方便，強烈推薦！',
        },
        {
          name: '李先生',
          role: '室內設計師',
          avatar: '/avatars/avatar-2.jpg',
          rating: 5,
          content:
            '玄空風水分析功能太棒了！為客戶提供專業的風水建議變得輕而易舉。3D可視化讓客戶一目了然。',
        },
        {
          name: '王小姐',
          role: '自由職業者',
          avatar: '/avatars/avatar-3.jpg',
          rating: 5,
          content:
            'AI助手24小時在線解答，比傳統諮詢方便太多。價格也很合理，性價比超高！',
        },
      ],
    },
    footer: {
      company: {
        title: '公司',
        about: '關於我們',
        blog: '博客',
        careers: '招聘',
        press: '媒體',
      },
      product: {
        title: '產品',
        features: '功能',
        pricing: '定價',
        security: '安全',
        roadmap: '路線圖',
      },
      resources: {
        title: '資源',
        documentation: '文檔',
        guides: '指南',
        apiReference: 'API 參考',
        community: '社區',
      },
      legal: {
        title: '法律',
        privacy: '隱私政策',
        terms: '服務條款',
        disclaimer: '免責聲明',
        gdpr: 'GDPR',
      },
      social: {
        title: '關注我們',
        wechat: '微信',
        weibo: '微博',
        twitter: 'Twitter',
        github: 'GitHub',
      },
      copyright: '© 2024 QiFlowAI. 保留所有權利。',
      madeWith: '用 ❤️ 製作於中國',
    },
  },

  en: {
    home: {
      features: {
        title: 'Powerful Features, Simple Operation',
        subtitle:
          'From BaZi divination to Feng Shui layout, from data analysis to AI consultation, one-stop solution for all needs',
        learnMore: 'Learn More',
        hint: '💡 All features use advanced AI algorithms to ensure accuracy and professionalism',
        bazi: {
          title: 'BaZi Analysis',
          description: 'Generate destiny report in 30 seconds',
        },
        xuankong: {
          title: 'Xuan Kong Feng Shui',
          description: 'Intelligent flying star layout analysis',
        },
        compass: {
          title: 'Compass Algorithm',
          description: 'AI-powered direction recognition',
        },
        floorPlan: {
          title: 'Floor Plan Analysis',
          description: 'Upload floor plan for instant analysis',
        },
        visualization3d: {
          title: '3D Visualization',
          description: 'Three-dimensional Feng Shui layout display',
        },
        aiAssistant: {
          title: 'AI Assistant',
          description: '24/7 intelligent Q&A',
        },
      },
    },
    faqs: {
      title: 'Frequently Asked Questions',
      subtitle: 'Common questions about our services',
      items: [
        {
          question: 'What is BaZi divination?',
          answer:
            'BaZi divination is a traditional Chinese metaphysical practice that analyzes destiny based on birth date and time. Our AI system combines traditional theories with modern algorithms to provide accurate destiny analysis.',
        },
        {
          question: 'Is Xuan Kong Feng Shui accurate?',
          answer:
            'Our Xuan Kong Feng Shui analysis is based on traditional Feng Shui theories combined with AI algorithms for precise calculations. With an accuracy rate of over 98%, it has been verified by more than 120,000 users.',
        },
        {
          question: 'How to use the compass feature?',
          answer:
            'Open the compass tool on your phone, allow access to device orientation permissions, and follow the guidance to measure directions. The system will automatically calibrate and provide accurate directional data.',
        },
        {
          question: 'Is my data safe?',
          answer:
            'We take user privacy and data security very seriously. All data is encrypted and stored securely, never shared with third parties. You can delete your data at any time.',
        },
        {
          question: 'What payment methods are supported?',
          answer:
            'We support Alipay, WeChat Pay, credit cards, and other payment methods. First-time experience is completely free, and you can purchase credits as needed.',
        },
        {
          question: 'How to contact customer service?',
          answer:
            'You can contact us through the online chat in the bottom right corner, email support@qiflowai.com, or WeChat official account. We will reply within 24 hours.',
        },
      ],
    },
    pricing: {
      title: 'Choose the Right Plan for You',
      subtitle: 'Flexible pricing to meet different needs',
      monthly: 'Monthly',
      yearly: 'Yearly',
      save: 'Save',
      perMonth: '/month',
      perYear: '/year',
      popularBadge: 'Most Popular',
      getStarted: 'Get Started',
      currentPlan: 'Current Plan',
      features: 'Features',
      plans: {
        free: {
          name: 'Free Trial',
          description: 'For first-time users',
          price: '0',
          features: [
            'Basic BaZi analysis',
            '5 queries per month',
            'Standard report export',
            'Community support',
          ],
        },
        basic: {
          name: 'Basic',
          description: 'For individual users',
          price: '29',
          features: [
            'Complete BaZi analysis',
            '30 queries per month',
            'Advanced report export',
            'PDF download',
            'Priority customer support',
          ],
        },
        pro: {
          name: 'Professional',
          description: 'For professionals and small studios',
          price: '99',
          features: [
            'Unlimited queries',
            'Xuan Kong Feng Shui analysis',
            '3D visualization',
            'AI deep interpretation',
            'Dedicated support',
            'API access',
          ],
        },
        enterprise: {
          name: 'Enterprise',
          description: 'For large organizations and enterprises',
          price: 'Contact Us',
          features: [
            'All Pro features',
            'Team collaboration',
            'Custom branding',
            'Dedicated server',
            'Technical support',
            'Custom development',
          ],
        },
      },
    },
    cta: {
      title: 'Ready to Start Your Destiny Journey?',
      subtitle: 'Sign up now and experience AI-powered destiny analysis',
      primaryButton: 'Start Free',
      secondaryButton: 'View Demo',
      trustBadge: 'Trusted by 120,000+ users',
    },
    testimonials: {
      title: 'User Reviews',
      subtitle: 'See what others are saying',
      readMore: 'Read More Reviews',
      items: [
        {
          name: 'Ms. Zhang',
          role: 'Executive',
          avatar: '/avatars/avatar-1.jpg',
          rating: 5,
          content:
            'Very accurate BaZi analysis that helped me make the right career decisions. Clean interface, easy to use, highly recommended!',
        },
        {
          name: 'Mr. Li',
          role: 'Interior Designer',
          avatar: '/avatars/avatar-2.jpg',
          rating: 5,
          content:
            'The Xuan Kong Feng Shui analysis feature is amazing! Providing professional Feng Shui advice to clients has become effortless. 3D visualization makes everything clear.',
        },
        {
          name: 'Ms. Wang',
          role: 'Freelancer',
          avatar: '/avatars/avatar-3.jpg',
          rating: 5,
          content:
            'AI assistant available 24/7, much more convenient than traditional consultation. Reasonable pricing, great value for money!',
        },
      ],
    },
    footer: {
      company: {
        title: 'Company',
        about: 'About Us',
        blog: 'Blog',
        careers: 'Careers',
        press: 'Press',
      },
      product: {
        title: 'Product',
        features: 'Features',
        pricing: 'Pricing',
        security: 'Security',
        roadmap: 'Roadmap',
      },
      resources: {
        title: 'Resources',
        documentation: 'Documentation',
        guides: 'Guides',
        apiReference: 'API Reference',
        community: 'Community',
      },
      legal: {
        title: 'Legal',
        privacy: 'Privacy Policy',
        terms: 'Terms of Service',
        disclaimer: 'Disclaimer',
        gdpr: 'GDPR',
      },
      social: {
        title: 'Follow Us',
        wechat: 'WeChat',
        weibo: 'Weibo',
        twitter: 'Twitter',
        github: 'GitHub',
      },
      copyright: '© 2024 QiFlowAI. All rights reserved.',
      madeWith: 'Made with ❤️ in China',
    },
  },

  ja: {
    home: {
      features: {
        title: '強力な機能、シンプルな操作',
        subtitle:
          '四柱推命から風水配置まで、データ分析からAIコンサルティングまで、ワンストップでニーズを解決',
        learnMore: '詳しく見る',
        hint: '💡 すべての機能は先進的なAIアルゴリズムを採用し、正確性とプロフェッショナリズムを保証',
        bazi: { title: '四柱推命', description: '30秒で運命レポートを生成' },
        xuankong: { title: '玄空風水', description: 'スマート飛星配置分析' },
        compass: { title: '羅盤アルゴリズム', description: 'AI方位認識' },
        floorPlan: {
          title: '間取り図分析',
          description: '間取り図をアップロードして分析',
        },
        visualization3d: {
          title: '3D可視化',
          description: '立体的な風水配置表示',
        },
        aiAssistant: {
          title: 'AIアシスタント',
          description: '24/7スマートQ&A',
        },
      },
    },
    faqs: {
      title: 'よくある質問',
      subtitle: '当社サービスに関するよくある質問',
      items: [
        {
          question: '四柱推命とは？',
          answer:
            '四柱推命は中国の伝統的な占術で、生年月日時から運命を推算します。当社のAIシステムは伝統理論と現代アルゴリズムを組み合わせ、正確な運命分析を提供します。',
        },
        {
          question: '玄空風水は正確ですか？',
          answer:
            '当社の玄空風水分析は伝統的な風水理論に基づき、AIアルゴリズムで精密計算します。正確率は98%以上で、12万人以上のユーザーに検証されています。',
        },
        {
          question: '羅盤機能の使い方は？',
          answer:
            'スマートフォンで羅盤ツールを開き、デバイスの方向権限を許可し、ガイダンスに従って方位測定を行います。システムが自動校正し、正確な方位データを提供します。',
        },
        {
          question: 'データは安全ですか？',
          answer:
            'ユーザープライバシーとデータセキュリティを非常に重視しています。すべてのデータは暗号化されて保存され、第三者と共有されません。いつでもデータを削除できます。',
        },
        {
          question: '支払い方法は？',
          answer:
            'Alipay、WeChat Pay、クレジットカードなど複数の支払い方法をサポートしています。初回体験は完全無料で、必要に応じてクレジットを購入できます。',
        },
        {
          question: 'カスタマーサービスへの連絡方法は？',
          answer:
            'ページ右下のオンラインチャット、メール support@qiflowai.com、またはWeChat公式アカウントからお問い合わせください。24時間以内に返信いたします。',
        },
      ],
    },
    pricing: {
      title: 'あなたに合ったプランを選択',
      subtitle: '柔軟な料金プランで様々なニーズに対応',
      monthly: '月払い',
      yearly: '年払い',
      save: '節約',
      perMonth: '/月',
      perYear: '/年',
      popularBadge: '最も人気',
      getStarted: '今すぐ始める',
      currentPlan: '現在のプラン',
      features: '機能',
      plans: {
        free: {
          name: '無料体験',
          description: '初めてのユーザー向け',
          price: '0',
          features: [
            '基本四柱推命',
            '月5回の検索',
            '標準レポート出力',
            'コミュニティサポート',
          ],
        },
        basic: {
          name: 'ベーシック',
          description: '個人ユーザー向け',
          price: '29',
          features: [
            '完全四柱推命',
            '月30回の検索',
            '高度レポート出力',
            'PDFダウンロード',
            '優先サポート',
          ],
        },
        pro: {
          name: 'プロフェッショナル',
          description: 'プロユーザーや小規模スタジオ向け',
          price: '99',
          features: [
            '無制限検索',
            '玄空風水分析',
            '3D可視化',
            'AI深層解読',
            '専属サポート',
            'APIアクセス',
          ],
        },
        enterprise: {
          name: 'エンタープライズ',
          description: '大規模組織や企業向け',
          price: 'お問い合わせ',
          features: [
            'すべてのプロ機能',
            'チームコラボレーション',
            'カスタムブランディング',
            '専用サーバー',
            '技術サポート',
            'カスタム開発',
          ],
        },
      },
    },
    cta: {
      title: '運命の旅を始める準備はできましたか？',
      subtitle: '今すぐ登録して、AI駆動の運命分析を体験',
      primaryButton: '無料で始める',
      secondaryButton: 'デモを見る',
      trustBadge: '120,000+ ユーザーが信頼',
    },
    testimonials: {
      title: 'ユーザーレビュー',
      subtitle: '他のユーザーの声',
      readMore: 'もっと読む',
      items: [
        {
          name: '張さん',
          role: 'エグゼクティブ',
          avatar: '/avatars/avatar-1.jpg',
          rating: 5,
          content:
            '非常に正確な四柱推命で、キャリアプランニングで正しい決断ができました。シンプルなインターフェース、使いやすい、強くお勧めします！',
        },
        {
          name: '李さん',
          role: 'インテリアデザイナー',
          avatar: '/avatars/avatar-2.jpg',
          rating: 5,
          content:
            '玄空風水分析機能が素晴らしい！クライアントにプロの風水アドバイスを提供するのが簡単になりました。3D可視化で一目瞭然です。',
        },
        {
          name: '王さん',
          role: 'フリーランサー',
          avatar: '/avatars/avatar-3.jpg',
          rating: 5,
          content:
            'AIアシスタントが24時間対応、従来のコンサルティングより便利です。価格も手頃で、コスパ最高！',
        },
      ],
    },
    footer: {
      company: {
        title: '会社',
        about: '会社概要',
        blog: 'ブログ',
        careers: '採用',
        press: 'プレス',
      },
      product: {
        title: '製品',
        features: '機能',
        pricing: '料金',
        security: 'セキュリティ',
        roadmap: 'ロードマップ',
      },
      resources: {
        title: 'リソース',
        documentation: 'ドキュメント',
        guides: 'ガイド',
        apiReference: 'APIリファレンス',
        community: 'コミュニティ',
      },
      legal: {
        title: '法的事項',
        privacy: 'プライバシーポリシー',
        terms: '利用規約',
        disclaimer: '免責事項',
        gdpr: 'GDPR',
      },
      social: {
        title: 'フォローする',
        wechat: 'WeChat',
        weibo: 'Weibo',
        twitter: 'Twitter',
        github: 'GitHub',
      },
      copyright: '© 2024 QiFlowAI. 全著作権所有。',
      madeWith: '❤️ で中国製',
    },
  },

  ko: {
    home: {
      features: {
        title: '강력한 기능, 간단한 조작',
        subtitle:
          '사주명리부터 풍수 배치까지, 데이터 분석부터 AI 상담까지, 원스톱 솔루션',
        learnMore: '자세히 보기',
        hint: '💡 모든 기능은 첨단 AI 알고리즘을 사용하여 정확성과 전문성을 보장합니다',
        bazi: { title: '사주 분석', description: '30초만에 운명 보고서 생성' },
        xuankong: { title: '현공풍수', description: '스마트 비성 배치 분석' },
        compass: { title: '나침반 알고리즘', description: 'AI 방위 인식' },
        floorPlan: {
          title: '평면도 분석',
          description: '평면도를 업로드하여 분석',
        },
        visualization3d: {
          title: '3D 시각화',
          description: '입체 풍수 배치 표시',
        },
        aiAssistant: { title: 'AI 어시스턴트', description: '24/7 스마트 Q&A' },
      },
    },
    faqs: {
      title: '자주 묻는 질문',
      subtitle: '우리 서비스에 대한 자주 묻는 질문',
      items: [
        {
          question: '사주명리란 무엇인가요?',
          answer:
            '사주명리는 중국 전통 문화의 명리학으로, 출생 년월일시로 운명을 추산합니다. 저희 AI 시스템은 전통 이론과 현대 알고리즘을 결합하여 정확한 명리 분석을 제공합니다.',
        },
        {
          question: '현공풍수는 정확한가요?',
          answer:
            '저희 현공풍수 분석은 전통 풍수 이론에 기반하며 AI 알고리즘으로 정밀 계산합니다. 정확도는 98% 이상이며, 12만 명 이상의 사용자가 검증했습니다.',
        },
        {
          question: '나침반 기능은 어떻게 사용하나요?',
          answer:
            '휴대폰에서 나침반 도구를 열고 기기 방향 권한을 허용한 후 안내에 따라 방위를 측정하세요. 시스템이 자동으로 보정하고 정확한 방위 데이터를 제공합니다.',
        },
        {
          question: '내 데이터는 안전한가요?',
          answer:
            '사용자 개인 정보와 데이터 보안을 매우 중요하게 생각합니다. 모든 데이터는 암호화되어 저장되며 제3자와 공유하지 않습니다. 언제든지 데이터를 삭제할 수 있습니다.',
        },
        {
          question: '어떤 결제 방법을 지원하나요?',
          answer:
            'Alipay, WeChat Pay, 신용카드 등 다양한 결제 방법을 지원합니다. 첫 체험은 완전 무료이며, 필요에 따라 크레딧을 구매할 수 있습니다.',
        },
        {
          question: '고객 서비스에 어떻게 연락하나요?',
          answer:
            '페이지 오른쪽 하단의 온라인 채팅, 이메일 support@qiflowai.com 또는 WeChat 공식 계정으로 문의하세요. 24시간 내에 답변드립니다.',
        },
      ],
    },
    pricing: {
      title: '적합한 플랜 선택',
      subtitle: '다양한 요구를 충족하는 유연한 가격 플랜',
      monthly: '월간',
      yearly: '연간',
      save: '절약',
      perMonth: '/월',
      perYear: '/년',
      popularBadge: '가장 인기',
      getStarted: '시작하기',
      currentPlan: '현재 플랜',
      features: '기능',
      plans: {
        free: {
          name: '무료 체험',
          description: '처음 사용하는 사용자용',
          price: '0',
          features: [
            '기본 사주 분석',
            '월 5회 조회',
            '표준 보고서 내보내기',
            '커뮤니티 지원',
          ],
        },
        basic: {
          name: '베이직',
          description: '개인 사용자용',
          price: '29',
          features: [
            '완전 사주 분석',
            '월 30회 조회',
            '고급 보고서 내보내기',
            'PDF 다운로드',
            '우선 고객 지원',
          ],
        },
        pro: {
          name: '프로페셔널',
          description: '전문가 및 소규모 스튜디오용',
          price: '99',
          features: [
            '무제한 조회',
            '현공풍수 분석',
            '3D 시각화',
            'AI 심층 해석',
            '전담 지원',
            'API 액세스',
          ],
        },
        enterprise: {
          name: '엔터프라이즈',
          description: '대규모 조직 및 기업용',
          price: '문의하기',
          features: [
            '모든 프로 기능',
            '팀 협업',
            '커스텀 브랜딩',
            '전용 서버',
            '기술 지원',
            '맞춤 개발',
          ],
        },
      },
    },
    cta: {
      title: '운명의 여정을 시작할 준비가 되셨나요?',
      subtitle: '지금 등록하고 AI 기반 운명 분석을 경험하세요',
      primaryButton: '무료로 시작',
      secondaryButton: '데모 보기',
      trustBadge: '120,000+ 사용자 신뢰',
    },
    testimonials: {
      title: '사용자 후기',
      subtitle: '다른 사용자들의 의견',
      readMore: '더 많은 후기 보기',
      items: [
        {
          name: '장 씨',
          role: '임원',
          avatar: '/avatars/avatar-1.jpg',
          rating: 5,
          content:
            '매우 정확한 사주 분석으로 직업 계획에서 올바른 결정을 내릴 수 있었습니다. 깔끔한 인터페이스, 사용하기 쉬움, 강력 추천!',
        },
        {
          name: '이 씨',
          role: '인테리어 디자이너',
          avatar: '/avatars/avatar-2.jpg',
          rating: 5,
          content:
            '현공풍수 분석 기능이 훌륭합니다! 고객에게 전문적인 풍수 조언을 제공하는 것이 쉬워졌습니다. 3D 시각화로 한눈에 알 수 있습니다.',
        },
        {
          name: '왕 씨',
          role: '프리랜서',
          avatar: '/avatars/avatar-3.jpg',
          rating: 5,
          content:
            'AI 어시스턴트가 24시간 대응, 기존 상담보다 훨씬 편리합니다. 가격도 합리적이고 가성비가 최고!',
        },
      ],
    },
    footer: {
      company: {
        title: '회사',
        about: '회사 소개',
        blog: '블로그',
        careers: '채용',
        press: '보도자료',
      },
      product: {
        title: '제품',
        features: '기능',
        pricing: '가격',
        security: '보안',
        roadmap: '로드맵',
      },
      resources: {
        title: '리소스',
        documentation: '문서',
        guides: '가이드',
        apiReference: 'API 참조',
        community: '커뮤니티',
      },
      legal: {
        title: '법률',
        privacy: '개인정보 보호정책',
        terms: '서비스 약관',
        disclaimer: '면책조항',
        gdpr: 'GDPR',
      },
      social: {
        title: '팔로우',
        wechat: 'WeChat',
        weibo: 'Weibo',
        twitter: 'Twitter',
        github: 'GitHub',
      },
      copyright: '© 2024 QiFlowAI. 모든 권리 보유.',
      madeWith: '❤️ 중국에서 제작',
    },
  },

  ms: {
    home: {
      features: {
        title: 'Fungsi Berkuasa, Operasi Mudah',
        subtitle:
          'Dari ramalan BaZi hingga susun atur Feng Shui, dari analisis data hingga perundingan AI, penyelesaian sehenti untuk semua keperluan',
        learnMore: 'Ketahui Lebih Lanjut',
        hint: '💡 Semua fungsi menggunakan algoritma AI yang canggih untuk memastikan ketepatan dan profesionalisme',
        bazi: {
          title: 'Analisis BaZi',
          description: 'Jana laporan takdir dalam 30 saat',
        },
        xuankong: {
          title: 'Xuan Kong Feng Shui',
          description: 'Analisis susun atur bintang terbang pintar',
        },
        compass: {
          title: 'Algoritma Kompas',
          description: 'Pengiktirafan arah berkuasa AI',
        },
        floorPlan: {
          title: 'Analisis Pelan Lantai',
          description: 'Muat naik pelan lantai untuk analisis',
        },
        visualization3d: {
          title: 'Visualisasi 3D',
          description: 'Paparan susun atur Feng Shui tiga dimensi',
        },
        aiAssistant: { title: 'Pembantu AI', description: 'Q&A pintar 24/7' },
      },
    },
    faqs: {
      title: 'Soalan Lazim',
      subtitle: 'Soalan lazim tentang perkhidmatan kami',
      items: [
        {
          question: 'Apakah ramalan BaZi?',
          answer:
            'Ramalan BaZi adalah amalan metafizik tradisional Cina yang menganalisis takdir berdasarkan tarikh dan masa lahir. Sistem AI kami menggabungkan teori tradisional dengan algoritma moden untuk memberikan analisis takdir yang tepat.',
        },
        {
          question: 'Adakah Xuan Kong Feng Shui tepat?',
          answer:
            'Analisis Xuan Kong Feng Shui kami berdasarkan teori Feng Shui tradisional digabungkan dengan algoritma AI untuk pengiraan yang tepat. Dengan kadar ketepatan melebihi 98%, ia telah disahkan oleh lebih 120,000 pengguna.',
        },
        {
          question: 'Bagaimana menggunakan ciri kompas?',
          answer:
            'Buka alat kompas di telefon anda, benarkan akses kepada kebenaran orientasi peranti, dan ikut panduan untuk mengukur arah. Sistem akan menentukur secara automatik dan memberikan data arah yang tepat.',
        },
        {
          question: 'Adakah data saya selamat?',
          answer:
            'Kami sangat mengambil berat tentang privasi pengguna dan keselamatan data. Semua data disulitkan dan disimpan dengan selamat, tidak dikongsi dengan pihak ketiga. Anda boleh memadam data anda pada bila-bila masa.',
        },
        {
          question: 'Kaedah pembayaran apa yang disokong?',
          answer:
            'Kami menyokong Alipay, WeChat Pay, kad kredit, dan kaedah pembayaran lain. Pengalaman pertama adalah percuma sepenuhnya, dan anda boleh membeli kredit mengikut keperluan.',
        },
        {
          question: 'Bagaimana untuk menghubungi perkhidmatan pelanggan?',
          answer:
            'Anda boleh menghubungi kami melalui sembang dalam talian di sudut kanan bawah, e-mel support@qiflowai.com, atau akaun rasmi WeChat. Kami akan membalas dalam masa 24 jam.',
        },
      ],
    },
    pricing: {
      title: 'Pilih Pelan Yang Sesuai Untuk Anda',
      subtitle: 'Harga fleksibel untuk memenuhi keperluan berbeza',
      monthly: 'Bulanan',
      yearly: 'Tahunan',
      save: 'Jimat',
      perMonth: '/bulan',
      perYear: '/tahun',
      popularBadge: 'Paling Popular',
      getStarted: 'Mulakan',
      currentPlan: 'Pelan Semasa',
      features: 'Ciri',
      plans: {
        free: {
          name: 'Percubaan Percuma',
          description: 'Untuk pengguna kali pertama',
          price: '0',
          features: [
            'Analisis BaZi asas',
            '5 pertanyaan sebulan',
            'Eksport laporan standard',
            'Sokongan komuniti',
          ],
        },
        basic: {
          name: 'Asas',
          description: 'Untuk pengguna individu',
          price: '29',
          features: [
            'Analisis BaZi lengkap',
            '30 pertanyaan sebulan',
            'Eksport laporan lanjutan',
            'Muat turun PDF',
            'Sokongan pelanggan keutamaan',
          ],
        },
        pro: {
          name: 'Profesional',
          description: 'Untuk profesional dan studio kecil',
          price: '99',
          features: [
            'Pertanyaan tanpa had',
            'Analisis Xuan Kong Feng Shui',
            'Visualisasi 3D',
            'Tafsiran mendalam AI',
            'Sokongan khusus',
            'Akses API',
          ],
        },
        enterprise: {
          name: 'Perusahaan',
          description: 'Untuk organisasi besar dan perusahaan',
          price: 'Hubungi Kami',
          features: [
            'Semua ciri Pro',
            'Kerjasama pasukan',
            'Penjenamaan tersuai',
            'Pelayan khusus',
            'Sokongan teknikal',
            'Pembangunan tersuai',
          ],
        },
      },
    },
    cta: {
      title: 'Bersedia untuk Memulakan Perjalanan Takdir Anda?',
      subtitle: 'Daftar sekarang dan alami analisis takdir berkuasa AI',
      primaryButton: 'Mulakan Percuma',
      secondaryButton: 'Lihat Demo',
      trustBadge: 'Dipercayai oleh 120,000+ pengguna',
    },
    testimonials: {
      title: 'Ulasan Pengguna',
      subtitle: 'Lihat apa kata orang lain',
      readMore: 'Baca Lebih Banyak Ulasan',
      items: [
        {
          name: 'Cik Zhang',
          role: 'Eksekutif',
          avatar: '/avatars/avatar-1.jpg',
          rating: 5,
          content:
            'Analisis BaZi yang sangat tepat membantu saya membuat keputusan kerjaya yang betul. Antara muka yang bersih, mudah digunakan, sangat disyorkan!',
        },
        {
          name: 'Encik Li',
          role: 'Pereka Dalaman',
          avatar: '/avatars/avatar-2.jpg',
          rating: 5,
          content:
            'Fungsi analisis Xuan Kong Feng Shui sangat hebat! Memberikan nasihat Feng Shui profesional kepada pelanggan menjadi mudah. Visualisasi 3D membuat semuanya jelas.',
        },
        {
          name: 'Cik Wang',
          role: 'Pekerja Bebas',
          avatar: '/avatars/avatar-3.jpg',
          rating: 5,
          content:
            'Pembantu AI tersedia 24/7, jauh lebih mudah daripada perundingan tradisional. Harga yang berpatutan, nilai wang yang hebat!',
        },
      ],
    },
    footer: {
      company: {
        title: 'Syarikat',
        about: 'Tentang Kami',
        blog: 'Blog',
        careers: 'Kerjaya',
        press: 'Akhbar',
      },
      product: {
        title: 'Produk',
        features: 'Ciri',
        pricing: 'Harga',
        security: 'Keselamatan',
        roadmap: 'Peta Jalan',
      },
      resources: {
        title: 'Sumber',
        documentation: 'Dokumentasi',
        guides: 'Panduan',
        apiReference: 'Rujukan API',
        community: 'Komuniti',
      },
      legal: {
        title: 'Undang-undang',
        privacy: 'Dasar Privasi',
        terms: 'Terma Perkhidmatan',
        disclaimer: 'Penafian',
        gdpr: 'GDPR',
      },
      social: {
        title: 'Ikuti Kami',
        wechat: 'WeChat',
        weibo: 'Weibo',
        twitter: 'Twitter',
        github: 'GitHub',
      },
      copyright: '© 2024 QiFlowAI. Hak cipta terpelihara.',
      madeWith: 'Dibuat dengan ❤️ di China',
    },
  },
};

function addCompleteTranslations() {
  console.log('🚀 开始添加完整国际化翻译键\n');

  let successCount = 0;
  let failCount = 0;

  for (const locale of locales) {
    const filePath = path.join(messagesDir, `${locale}.json`);

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);

      // 深度合并翻译键
      const translations = completeTranslations[locale];

      // 合并 home 命名空间
      if (!data.home) data.home = {};
      Object.assign(data.home, translations.home);

      // 添加其他命名空间
      if (translations.faqs) data.faqs = translations.faqs;
      if (translations.pricing) data.pricing = translations.pricing;
      if (translations.cta) data.cta = translations.cta;
      if (translations.testimonials)
        data.testimonials = translations.testimonials;
      if (translations.footer) data.footer = translations.footer;

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

      console.log(`✅ ${locale}: 成功添加完整翻译`);
      successCount++;
    } catch (error) {
      console.error(`❌ ${locale}: 处理失败 - ${error.message}`);
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ 成功: ${successCount} 个语言`);
  console.log(`❌ 失败: ${failCount} 个语言`);

  if (failCount === 0) {
    console.log('\n🎉 所有翻译键已添加！');
    console.log('💡 接下来需要更新组件代码以使用这些翻译键');
  }
}

addCompleteTranslations();
