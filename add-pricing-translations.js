const fs = require('fs');
const path = require('path');

// 定义各语言的 Pricing 翻译
const pricingTranslations = {
  'zh-CN': {
    // home.pricing - 用于 PricingSection.tsx
    home: {
      pricing: {
        title: '选择适合你的套餐',
        subtitle: '所有套餐均享首充 50% 优惠，选择更大套餐更划算',
        firstTimeOffer: '首次充值额外赠送 50% 积分',
        mostPopular: '最受欢迎',
        credits: '积分',
        save: '立省',
        buyNow: '立即购买',
        hint: '💡 所有套餐均支持 支付宝、微信支付、信用卡等多种支付方式',
        refund: '7 天无理由退款 · 数据加密保护 · 安全可靠',
        starter: {
          name: '入门版',
          features: {
            credits: '100 积分',
            analyses: '约 5-10 次分析',
            bazi: '基础八字分析',
            xuankong: '玄空风水查询',
            validity: '7 天有效期',
          },
        },
        standard: {
          name: '标准版',
          features: {
            credits: '500 积分',
            analyses: '约 25-50 次分析',
            bazi: '完整八字分析',
            xuankong: '高级风水建议',
            ai: 'AI 智能咨询',
            pdf: 'PDF 报告导出',
            validity: '30 天有效期',
          },
        },
        professional: {
          name: '专业版',
          features: {
            credits: '1500 积分',
            analyses: '约 75-150 次分析',
            bazi: '深度八字解读',
            xuankong: '专业风水布局',
            ai: '无限 AI 咨询',
            support: '优先技术支持',
            vip: 'VIP 专属服务',
            validity: '90 天有效期',
          },
        },
      },
    },
    // HomePage.pricing - 用于 blocks/pricing/pricing.tsx
    HomePage: {
      pricing: {
        subtitle: '灵活的定价方案',
        description: '选择最适合您需求的套餐，所有套餐均包含核心功能',
      },
    },
  },
  en: {
    home: {
      pricing: {
        title: 'Choose Your Plan',
        subtitle:
          'All plans include 50% off for first-time purchase, larger plans offer better value',
        firstTimeOffer: 'Get 50% extra credits on first purchase',
        mostPopular: 'Most Popular',
        credits: 'credits',
        save: 'Save',
        buyNow: 'Buy Now',
        hint: '💡 All plans support Alipay, WeChat Pay, Credit Card and more',
        refund: '7-day money-back guarantee · Data encryption · Safe & secure',
        starter: {
          name: 'Starter',
          features: {
            credits: '100 credits',
            analyses: 'About 5-10 analyses',
            bazi: 'Basic BaZi analysis',
            xuankong: 'Xuankong Feng Shui query',
            validity: '7 days validity',
          },
        },
        standard: {
          name: 'Standard',
          features: {
            credits: '500 credits',
            analyses: 'About 25-50 analyses',
            bazi: 'Complete BaZi analysis',
            xuankong: 'Advanced Feng Shui advice',
            ai: 'AI intelligent consultation',
            pdf: 'PDF report export',
            validity: '30 days validity',
          },
        },
        professional: {
          name: 'Professional',
          features: {
            credits: '1500 credits',
            analyses: 'About 75-150 analyses',
            bazi: 'In-depth BaZi interpretation',
            xuankong: 'Professional Feng Shui layout',
            ai: 'Unlimited AI consultation',
            support: 'Priority technical support',
            vip: 'VIP exclusive service',
            validity: '90 days validity',
          },
        },
      },
    },
    HomePage: {
      pricing: {
        subtitle: 'Flexible Pricing Plans',
        description:
          'Choose the plan that best suits your needs, all plans include core features',
      },
    },
  },
  'zh-TW': {
    home: {
      pricing: {
        title: '選擇適合你的套餐',
        subtitle: '所有套餐均享首充 50% 優惠，選擇更大套餐更划算',
        firstTimeOffer: '首次充值額外贈送 50% 積分',
        mostPopular: '最受歡迎',
        credits: '積分',
        save: '立省',
        buyNow: '立即購買',
        hint: '💡 所有套餐均支持 支付寶、微信支付、信用卡等多種支付方式',
        refund: '7 天無理由退款 · 數據加密保護 · 安全可靠',
        starter: {
          name: '入門版',
          features: {
            credits: '100 積分',
            analyses: '約 5-10 次分析',
            bazi: '基礎八字分析',
            xuankong: '玄空風水查詢',
            validity: '7 天有效期',
          },
        },
        standard: {
          name: '標準版',
          features: {
            credits: '500 積分',
            analyses: '約 25-50 次分析',
            bazi: '完整八字分析',
            xuankong: '高級風水建議',
            ai: 'AI 智能咨詢',
            pdf: 'PDF 報告導出',
            validity: '30 天有效期',
          },
        },
        professional: {
          name: '專業版',
          features: {
            credits: '1500 積分',
            analyses: '約 75-150 次分析',
            bazi: '深度八字解讀',
            xuankong: '專業風水佈局',
            ai: '無限 AI 咨詢',
            support: '優先技術支持',
            vip: 'VIP 專屬服務',
            validity: '90 天有效期',
          },
        },
      },
    },
    HomePage: {
      pricing: {
        subtitle: '靈活的定價方案',
        description: '選擇最適合您需求的套餐，所有套餐均包含核心功能',
      },
    },
  },
  ja: {
    home: {
      pricing: {
        title: 'プランを選択',
        subtitle: 'すべてのプランで初回購入50%オフ、大きいプランほどお得',
        firstTimeOffer: '初回購入で50%追加クレジット',
        mostPopular: '最も人気',
        credits: 'クレジット',
        save: '節約',
        buyNow: '今すぐ購入',
        hint: '💡 すべてのプランでAlipay、WeChat Pay、クレジットカードなどに対応',
        refund: '7日間返金保証 · データ暗号化 · 安全で確実',
        starter: {
          name: 'スターター',
          features: {
            credits: '100 クレジット',
            analyses: '約 5-10 回の分析',
            bazi: '基本八字分析',
            xuankong: '玄空風水クエリ',
            validity: '7日間有効',
          },
        },
        standard: {
          name: 'スタンダード',
          features: {
            credits: '500 クレジット',
            analyses: '約 25-50 回の分析',
            bazi: '完全な八字分析',
            xuankong: '高度な風水アドバイス',
            ai: 'AI インテリジェント相談',
            pdf: 'PDF レポートエクスポート',
            validity: '30日間有効',
          },
        },
        professional: {
          name: 'プロフェッショナル',
          features: {
            credits: '1500 クレジット',
            analyses: '約 75-150 回の分析',
            bazi: '詳細な八字解釈',
            xuankong: 'プロの風水レイアウト',
            ai: '無制限 AI 相談',
            support: '優先技術サポート',
            vip: 'VIP 専用サービス',
            validity: '90日間有効',
          },
        },
      },
    },
    HomePage: {
      pricing: {
        subtitle: '柔軟な価格プラン',
        description:
          'ニーズに最適なプランを選択してください。すべてのプランにコア機能が含まれます',
      },
    },
  },
  ko: {
    home: {
      pricing: {
        title: '플랜 선택',
        subtitle: '모든 플랜은 첫 구매 시 50% 할인, 큰 플랜일수록 더 유리',
        firstTimeOffer: '첫 구매 시 50% 추가 크레딧',
        mostPopular: '가장 인기',
        credits: '크레딧',
        save: '절약',
        buyNow: '지금 구매',
        hint: '💡 모든 플랜은 Alipay, WeChat Pay, 신용카드 등 지원',
        refund: '7일 환불 보증 · 데이터 암호화 · 안전하고 확실',
        starter: {
          name: '스타터',
          features: {
            credits: '100 크레딧',
            analyses: '약 5-10회 분석',
            bazi: '기본 사주 분석',
            xuankong: '현공 풍수 쿼리',
            validity: '7일 유효',
          },
        },
        standard: {
          name: '스탠다드',
          features: {
            credits: '500 크레딧',
            analyses: '약 25-50회 분석',
            bazi: '완전한 사주 분석',
            xuankong: '고급 풍수 조언',
            ai: 'AI 지능형 상담',
            pdf: 'PDF 보고서 내보내기',
            validity: '30일 유효',
          },
        },
        professional: {
          name: '프로페셔널',
          features: {
            credits: '1500 크레딧',
            analyses: '약 75-150회 분석',
            bazi: '심층 사주 해석',
            xuankong: '전문 풍수 레이아웃',
            ai: '무제한 AI 상담',
            support: '우선 기술 지원',
            vip: 'VIP 전용 서비스',
            validity: '90일 유효',
          },
        },
      },
    },
    HomePage: {
      pricing: {
        subtitle: '유연한 가격 플랜',
        description:
          '귀하의 필요에 가장 적합한 플랜을 선택하세요. 모든 플랜에는 핵심 기능이 포함됩니다',
      },
    },
  },
  fr: {
    home: {
      pricing: {
        title: 'Choisissez Votre Forfait',
        subtitle:
          'Tous les forfaits incluent 50% de réduction pour le premier achat, les forfaits plus importants offrent un meilleur rapport qualité-prix',
        firstTimeOffer:
          'Obtenez 50% de crédits supplémentaires lors du premier achat',
        mostPopular: 'Le Plus Populaire',
        credits: 'crédits',
        save: 'Économiser',
        buyNow: 'Acheter Maintenant',
        hint: '💡 Tous les forfaits prennent en charge Alipay, WeChat Pay, Carte de crédit et plus',
        refund:
          'Garantie de remboursement de 7 jours · Cryptage des données · Sûr et sécurisé',
        starter: {
          name: 'Débutant',
          features: {
            credits: '100 crédits',
            analyses: 'Environ 5-10 analyses',
            bazi: 'Analyse BaZi de base',
            xuankong: 'Requête Feng Shui Xuankong',
            validity: 'Validité de 7 jours',
          },
        },
        standard: {
          name: 'Standard',
          features: {
            credits: '500 crédits',
            analyses: 'Environ 25-50 analyses',
            bazi: 'Analyse BaZi complète',
            xuankong: 'Conseils Feng Shui avancés',
            ai: 'Consultation intelligente IA',
            pdf: 'Export de rapport PDF',
            validity: 'Validité de 30 jours',
          },
        },
        professional: {
          name: 'Professionnel',
          features: {
            credits: '1500 crédits',
            analyses: 'Environ 75-150 analyses',
            bazi: 'Interprétation approfondie BaZi',
            xuankong: 'Disposition Feng Shui professionnelle',
            ai: 'Consultation IA illimitée',
            support: 'Support technique prioritaire',
            vip: 'Service exclusif VIP',
            validity: 'Validité de 90 jours',
          },
        },
      },
    },
    HomePage: {
      pricing: {
        subtitle: 'Plans Tarifaires Flexibles',
        description:
          'Choisissez le plan qui convient le mieux à vos besoins, tous les plans incluent les fonctionnalités de base',
      },
    },
  },
  es: {
    home: {
      pricing: {
        title: 'Elige Tu Plan',
        subtitle:
          'Todos los planes incluyen 50% de descuento en la primera compra, los planes más grandes ofrecen mejor valor',
        firstTimeOffer:
          'Obtén 50% de créditos adicionales en la primera compra',
        mostPopular: 'Más Popular',
        credits: 'créditos',
        save: 'Ahorrar',
        buyNow: 'Comprar Ahora',
        hint: '💡 Todos los planes soportan Alipay, WeChat Pay, Tarjeta de crédito y más',
        refund:
          'Garantía de devolución de 7 días · Encriptación de datos · Seguro y confiable',
        starter: {
          name: 'Inicial',
          features: {
            credits: '100 créditos',
            analyses: 'Aproximadamente 5-10 análisis',
            bazi: 'Análisis BaZi básico',
            xuankong: 'Consulta Feng Shui Xuankong',
            validity: 'Validez de 7 días',
          },
        },
        standard: {
          name: 'Estándar',
          features: {
            credits: '500 créditos',
            analyses: 'Aproximadamente 25-50 análisis',
            bazi: 'Análisis BaZi completo',
            xuankong: 'Consejos Feng Shui avanzados',
            ai: 'Consulta inteligente AI',
            pdf: 'Exportación de informe PDF',
            validity: 'Validez de 30 días',
          },
        },
        professional: {
          name: 'Profesional',
          features: {
            credits: '1500 créditos',
            analyses: 'Aproximadamente 75-150 análisis',
            bazi: 'Interpretación profunda BaZi',
            xuankong: 'Diseño Feng Shui profesional',
            ai: 'Consulta AI ilimitada',
            support: 'Soporte técnico prioritario',
            vip: 'Servicio exclusivo VIP',
            validity: 'Validez de 90 días',
          },
        },
      },
    },
    HomePage: {
      pricing: {
        subtitle: 'Planes de Precios Flexibles',
        description:
          'Elija el plan que mejor se adapte a sus necesidades, todos los planes incluyen características principales',
      },
    },
  },
};

// 获取所有语言文件
const localesDir = path.join(__dirname, 'src', 'locales');
const localeFiles = fs
  .readdirSync(localesDir)
  .filter((file) => file.endsWith('.json'));

console.log('Found locale files:', localeFiles);

localeFiles.forEach((file) => {
  const filePath = path.join(localesDir, file);
  const locale = path.basename(file, '.json');

  console.log(`\nProcessing ${file} (locale: ${locale})`);

  try {
    // 读取现有的翻译文件
    const existingContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // 获取对应语言的翻译
    const translations = pricingTranslations[locale] || pricingTranslations.en;

    // 添加 home.pricing 翻译
    if (!existingContent.home) {
      existingContent.home = {};
    }
    existingContent.home.pricing = translations.home.pricing;
    console.log(`✅ Added home.pricing translations for locale: ${locale}`);

    // 添加 HomePage.pricing 翻译
    if (!existingContent.HomePage) {
      existingContent.HomePage = {};
    }
    existingContent.HomePage.pricing = translations.HomePage.pricing;
    console.log(`✅ Added HomePage.pricing translations for locale: ${locale}`);

    // 写回文件
    fs.writeFileSync(
      filePath,
      JSON.stringify(existingContent, null, 2),
      'utf8'
    );
    console.log(`✅ Updated ${file} successfully`);
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log('\n🎉 Pricing translations update completed!');
