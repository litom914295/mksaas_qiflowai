const fs = require('fs');
const path = require('path');

// 所有缺失的翻译 - 根据实际使用的命名空间组织
const missingTranslations = {
  // common.json 中的翻译
  common: {
    'zh-CN': {
      PricingPage: {
        monthly: '月付',
        yearly: '年付',
        mostPopular: '最受欢迎',
        currentPlan: '当前套餐',
        upgradeTo: '升级到',
        subscribe: '订阅',
        getStarted: '开始使用',
        perMonth: '/月',
        perYear: '/年',
        billedMonthly: '按月计费',
        billedYearly: '按年计费',
        save: '节省',
        whatIncluded: '包含内容',
        allFeaturesInclude: '所有功能包括',
      },
      PricePlans: {
        free: {
          name: '免费版',
          description: '适合初次体验用户',
          features: {
            'feature-1': '基础八字排盘',
            'feature-2': '五行分析',
            'feature-3': '简单命理解读',
            'feature-4': '社区支持',
          },
          limits: {
            'limit-1': '每月5次分析',
            'limit-2': '基础功能only',
            'limit-3': '不含AI咨询',
          },
        },
        pro: {
          name: '专业版',
          description: '适合深度使用用户',
          features: {
            'feature-1': '无限次八字分析',
            'feature-2': '完整命理报告',
            'feature-3': 'AI智能咨询',
            'feature-4': '玄空风水分析',
            'feature-5': 'PDF导出功能',
          },
          limits: {
            'limit-1': '每月500积分',
            'limit-2': '优先客服支持',
          },
        },
        lifetime: {
          name: '终身版',
          description: '一次付费,永久使用',
          features: {
            'feature-1': '所有专业版功能',
            'feature-2': '无限次数使用',
            'feature-3': '永久免费更新',
            'feature-4': 'VIP专属客服',
            'feature-5': '高级AI模型',
            'feature-6': '私人定制服务',
            'feature-7': '优先获取新功能',
          },
          limits: [],
        },
      },
      BaziHome: {
        teaser: {
          title: '体验智能罗盘',
          clockwise: '顺时针',
          counterClockwise: '逆时针',
          currentDegreeLabel: '当前度数',
        },
      },
      Metadata: {
        title: 'QiFlow AI - 智能八字风水分析平台',
        description:
          '基于AI的专业八字命理和玄空风水分析服务，为您提供个性化的命理咨询和风水建议',
      },
    },
    'zh-TW': {
      PricingPage: {
        monthly: '月付',
        yearly: '年付',
        mostPopular: '最受歡迎',
        currentPlan: '當前套餐',
        upgradeTo: '升級到',
        subscribe: '訂閱',
        getStarted: '開始使用',
        perMonth: '/月',
        perYear: '/年',
        billedMonthly: '按月計費',
        billedYearly: '按年計費',
        save: '節省',
        whatIncluded: '包含內容',
        allFeaturesInclude: '所有功能包括',
      },
      PricePlans: {
        free: {
          name: '免費版',
          description: '適合初次體驗用戶',
          features: {
            'feature-1': '基礎八字排盤',
            'feature-2': '五行分析',
            'feature-3': '簡單命理解讀',
            'feature-4': '社區支援',
          },
          limits: {
            'limit-1': '每月5次分析',
            'limit-2': '基礎功能only',
            'limit-3': '不含AI諮詢',
          },
        },
        pro: {
          name: '專業版',
          description: '適合深度使用用戶',
          features: {
            'feature-1': '無限次八字分析',
            'feature-2': '完整命理報告',
            'feature-3': 'AI智能諮詢',
            'feature-4': '玄空風水分析',
            'feature-5': 'PDF匯出功能',
          },
          limits: {
            'limit-1': '每月500積分',
            'limit-2': '優先客服支援',
          },
        },
        lifetime: {
          name: '終身版',
          description: '一次付費，永久使用',
          features: {
            'feature-1': '所有專業版功能',
            'feature-2': '無限次數使用',
            'feature-3': '永久免費更新',
            'feature-4': 'VIP專屬客服',
            'feature-5': '高級AI模型',
            'feature-6': '私人定製服務',
            'feature-7': '優先獲取新功能',
          },
          limits: [],
        },
      },
      BaziHome: {
        teaser: {
          title: '體驗智能羅盤',
          clockwise: '順時針',
          counterClockwise: '逆時針',
          currentDegreeLabel: '當前度數',
        },
      },
      Metadata: {
        title: 'QiFlow AI - 智能八字風水分析平台',
        description:
          '基於AI的專業八字命理和玄空風水分析服務，為您提供個性化的命理諮詢和風水建議',
      },
    },
    en: {
      PricingPage: {
        monthly: 'Monthly',
        yearly: 'Yearly',
        mostPopular: 'Most Popular',
        currentPlan: 'Current Plan',
        upgradeTo: 'Upgrade to',
        subscribe: 'Subscribe',
        getStarted: 'Get Started',
        perMonth: '/month',
        perYear: '/year',
        billedMonthly: 'Billed monthly',
        billedYearly: 'Billed yearly',
        save: 'Save',
        whatIncluded: "What's included",
        allFeaturesInclude: 'All features include',
      },
      PricePlans: {
        free: {
          name: 'Free',
          description: 'Perfect for trying out',
          features: {
            'feature-1': 'Basic Ba Zi chart',
            'feature-2': 'Five elements analysis',
            'feature-3': 'Simple destiny reading',
            'feature-4': 'Community support',
          },
          limits: {
            'limit-1': '5 analyses per month',
            'limit-2': 'Basic features only',
            'limit-3': 'No AI consultation',
          },
        },
        pro: {
          name: 'Professional',
          description: 'For serious users',
          features: {
            'feature-1': 'Unlimited Ba Zi analysis',
            'feature-2': 'Complete destiny reports',
            'feature-3': 'AI smart consultation',
            'feature-4': 'Xuankong Feng Shui analysis',
            'feature-5': 'PDF export feature',
          },
          limits: {
            'limit-1': '500 credits per month',
            'limit-2': 'Priority customer support',
          },
        },
        lifetime: {
          name: 'Lifetime',
          description: 'Pay once, use forever',
          features: {
            'feature-1': 'All Pro features',
            'feature-2': 'Unlimited usage',
            'feature-3': 'Free updates forever',
            'feature-4': 'VIP customer service',
            'feature-5': 'Advanced AI models',
            'feature-6': 'Private customization',
            'feature-7': 'Early access to new features',
          },
          limits: [],
        },
      },
      BaziHome: {
        teaser: {
          title: 'Experience Smart Compass',
          clockwise: 'Clockwise',
          counterClockwise: 'Counter-clockwise',
          currentDegreeLabel: 'Current Degree',
        },
      },
      Metadata: {
        title: 'QiFlow AI - Intelligent Ba Zi & Feng Shui Analysis Platform',
        description:
          'Professional AI-powered Ba Zi destiny and Xuankong Feng Shui analysis service, providing personalized destiny consultation and Feng Shui advice',
      },
    },
    ja: {
      PricingPage: {
        monthly: '月額',
        yearly: '年額',
        mostPopular: '最も人気',
        currentPlan: '現在のプラン',
        upgradeTo: 'アップグレード',
        subscribe: '購読',
        getStarted: '始める',
        perMonth: '/月',
        perYear: '/年',
        billedMonthly: '月額請求',
        billedYearly: '年額請求',
        save: '節約',
        whatIncluded: '含まれるもの',
        allFeaturesInclude: 'すべての機能',
      },
      PricePlans: {
        free: {
          name: '無料版',
          description: '初回体験に最適',
          features: {
            'feature-1': '基本八字盤',
            'feature-2': '五行分析',
            'feature-3': '簡単な命理解読',
            'feature-4': 'コミュニティサポート',
          },
          limits: {
            'limit-1': '月5回まで',
            'limit-2': '基本機能のみ',
            'limit-3': 'AIコンサルなし',
          },
        },
        pro: {
          name: 'プロ版',
          description: '本格利用者向け',
          features: {
            'feature-1': '無制限八字分析',
            'feature-2': '完全命理レポート',
            'feature-3': 'AIスマートコンサル',
            'feature-4': '玄空風水分析',
            'feature-5': 'PDF出力機能',
          },
          limits: {
            'limit-1': '月500クレジット',
            'limit-2': '優先カスタマーサポート',
          },
        },
        lifetime: {
          name: 'ライフタイム版',
          description: '一度の支払いで永久使用',
          features: {
            'feature-1': 'すべてのプロ機能',
            'feature-2': '無制限使用',
            'feature-3': '永久無料アップデート',
            'feature-4': 'VIP専用サポート',
            'feature-5': '高度なAIモデル',
            'feature-6': 'プライベートカスタマイズ',
            'feature-7': '新機能への早期アクセス',
          },
          limits: [],
        },
      },
      BaziHome: {
        teaser: {
          title: 'スマートコンパスを体験',
          clockwise: '時計回り',
          counterClockwise: '反時計回り',
          currentDegreeLabel: '現在の度数',
        },
      },
      Metadata: {
        title: 'QiFlow AI - インテリジェント八字風水分析プラットフォーム',
        description:
          'AIベースのプロフェッショナル八字命理と玄空風水分析サービス、パーソナライズされた命理コンサルティングと風水アドバイスを提供',
      },
    },
    ko: {
      PricingPage: {
        monthly: '월간',
        yearly: '연간',
        mostPopular: '가장 인기',
        currentPlan: '현재 플랜',
        upgradeTo: '업그레이드',
        subscribe: '구독',
        getStarted: '시작하기',
        perMonth: '/월',
        perYear: '/년',
        billedMonthly: '월간 청구',
        billedYearly: '연간 청구',
        save: '절약',
        whatIncluded: '포함 내용',
        allFeaturesInclude: '모든 기능 포함',
      },
      PricePlans: {
        free: {
          name: '무료',
          description: '첫 체험에 적합',
          features: {
            'feature-1': '기본 사주 차트',
            'feature-2': '오행 분석',
            'feature-3': '간단한 명리 해석',
            'feature-4': '커뮤니티 지원',
          },
          limits: {
            'limit-1': '월 5회 분석',
            'limit-2': '기본 기능만',
            'limit-3': 'AI 컨설팅 없음',
          },
        },
        pro: {
          name: '프로페셔널',
          description: '본격 사용자용',
          features: {
            'feature-1': '무제한 사주 분석',
            'feature-2': '완전한 명리 보고서',
            'feature-3': 'AI 스마트 컨설팅',
            'feature-4': '현공 풍수 분석',
            'feature-5': 'PDF 내보내기',
          },
          limits: {
            'limit-1': '월 500크레딧',
            'limit-2': '우선 고객 지원',
          },
        },
        lifetime: {
          name: '평생',
          description: '한 번 결제로 영구 사용',
          features: {
            'feature-1': '모든 프로 기능',
            'feature-2': '무제한 사용',
            'feature-3': '영구 무료 업데이트',
            'feature-4': 'VIP 전용 고객 서비스',
            'feature-5': '고급 AI 모델',
            'feature-6': '개인 맞춤 서비스',
            'feature-7': '신기능 조기 액세스',
          },
          limits: [],
        },
      },
      BaziHome: {
        teaser: {
          title: '스마트 나침반 체험',
          clockwise: '시계 방향',
          counterClockwise: '반시계 방향',
          currentDegreeLabel: '현재 각도',
        },
      },
      Metadata: {
        title: 'QiFlow AI - 지능형 사주 풍수 분석 플랫폼',
        description:
          'AI 기반 전문 사주 명리 및 현공 풍수 분석 서비스, 개인화된 명리 상담 및 풍수 조언 제공',
      },
    },
    ms: {
      PricingPage: {
        monthly: 'Bulanan',
        yearly: 'Tahunan',
        mostPopular: 'Paling Popular',
        currentPlan: 'Pelan Semasa',
        upgradeTo: 'Naik taraf ke',
        subscribe: 'Langgan',
        getStarted: 'Mulakan',
        perMonth: '/bulan',
        perYear: '/tahun',
        billedMonthly: 'Bil bulanan',
        billedYearly: 'Bil tahunan',
        save: 'Jimat',
        whatIncluded: 'Apa yang termasuk',
        allFeaturesInclude: 'Semua ciri termasuk',
      },
      PricePlans: {
        free: {
          name: 'Percuma',
          description: 'Sesuai untuk percubaan',
          features: {
            'feature-1': 'Carta Ba Zi asas',
            'feature-2': 'Analisis lima elemen',
            'feature-3': 'Bacaan takdir mudah',
            'feature-4': 'Sokongan komuniti',
          },
          limits: {
            'limit-1': '5 analisis sebulan',
            'limit-2': 'Ciri asas sahaja',
            'limit-3': 'Tiada perundingan AI',
          },
        },
        pro: {
          name: 'Profesional',
          description: 'Untuk pengguna serius',
          features: {
            'feature-1': 'Analisis Ba Zi tanpa had',
            'feature-2': 'Laporan nasib lengkap',
            'feature-3': 'Perundingan pintar AI',
            'feature-4': 'Analisis Feng Shui Xuankong',
            'feature-5': 'Ciri eksport PDF',
          },
          limits: {
            'limit-1': '500 kredit sebulan',
            'limit-2': 'Sokongan pelanggan keutamaan',
          },
        },
        lifetime: {
          name: 'Seumur Hidup',
          description: 'Bayar sekali, guna selamanya',
          features: {
            'feature-1': 'Semua ciri Pro',
            'feature-2': 'Penggunaan tanpa had',
            'feature-3': 'Kemas kini percuma selamanya',
            'feature-4': 'Perkhidmatan pelanggan VIP',
            'feature-5': 'Model AI lanjutan',
            'feature-6': 'Penyesuaian peribadi',
            'feature-7': 'Akses awal ciri baharu',
          },
          limits: [],
        },
      },
      BaziHome: {
        teaser: {
          title: 'Alami Kompas Pintar',
          clockwise: 'Ikut jam',
          counterClockwise: 'Lawan jam',
          currentDegreeLabel: 'Darjah semasa',
        },
      },
      Metadata: {
        title: 'QiFlow AI - Platform Analisis Ba Zi & Feng Shui Pintar',
        description:
          'Perkhidmatan analisis nasib Ba Zi dan Feng Shui Xuankong profesional berkuasa AI, menyediakan perundingan nasib dan nasihat Feng Shui yang diperibadikan',
      },
    },
  },
};

// 语言文件路径
const localesDir = path.join(__dirname, '..', 'src', 'locales');
const languages = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'ms'];

// 深度合并对象的辅助函数
function deepMerge(target, source) {
  const output = { ...target };
  for (const key in source) {
    if (
      source[key] instanceof Object &&
      !Array.isArray(source[key]) &&
      key in target
    ) {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
}

// 主函数
async function scanAndFixMissingTranslations() {
  console.log('🔍 开始扫描并修复缺失的翻译...\n');

  let successCount = 0;
  let errorCount = 0;
  const results = {
    added: {},
    errors: [],
  };

  for (const lang of languages) {
    try {
      const langDir = path.join(localesDir, lang);

      // 确保语言目录存在
      if (!fs.existsSync(langDir)) {
        fs.mkdirSync(langDir, { recursive: true });
      }

      // 处理 common.json
      const commonFilePath = path.join(langDir, 'common.json');
      let commonData = {};

      if (fs.existsSync(commonFilePath)) {
        const fileContent = fs.readFileSync(commonFilePath, 'utf-8');
        commonData = JSON.parse(fileContent);
      }

      // 合并缺失的翻译
      if (missingTranslations.common[lang]) {
        const newData = deepMerge(commonData, missingTranslations.common[lang]);
        fs.writeFileSync(
          commonFilePath,
          JSON.stringify(newData, null, 2),
          'utf-8'
        );

        const addedKeys = Object.keys(missingTranslations.common[lang]);
        results.added[lang] = addedKeys;

        console.log(`✅ ${lang}: 已添加 ${addedKeys.length} 个命名空间`);
        console.log(`   ├─ ${addedKeys.join('\n   ├─ ')}`);
      }

      successCount++;
    } catch (error) {
      console.error(`❌ ${lang}: 处理失败`);
      console.error(`   错误: ${error.message}`);
      results.errors.push({ lang, error: error.message });
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n📊 执行结果:');
  console.log(`   ✅ 成功: ${successCount} 个语言`);
  console.log(`   ❌ 失败: ${errorCount} 个语言`);

  console.log('\n📝 已添加的翻译命名空间:');
  console.log('   • PricingPage (定价页面)');
  console.log('   • PricePlans (价格套餐)');
  console.log('   • BaziHome (首页)');
  console.log('   • Metadata (元数据)');

  console.log('\n✨ 翻译补充完成！');
  console.log('\n💡 提示:');
  console.log('   1. 清除 Next.js 缓存: Remove-Item -Recurse -Force .next');
  console.log('   2. 重启开发服务器: npm run dev');
  console.log('   3. 在浏览器中访问英文版定价页面测试');
  console.log('   4. URL: http://localhost:3000/en/pricing');
}

// 执行
scanAndFixMissingTranslations().catch(console.error);
