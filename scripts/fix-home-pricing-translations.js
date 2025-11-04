/**
 * 首页定价模块翻译补全脚本
 * 由 AI-WORKFLOW v5.0 自动生成
 *
 * 功能：
 * - 确保所有语言都有 home.pricing 的完整翻译
 * - 基于英文和中文版本进行翻译
 */

const fs = require('fs');
const path = require('path');

// 马来语翻译词典
const msPricingTranslations = {
  title: 'Pilih Pakej Yang Sesuai Untuk Anda',
  subtitle:
    'Semua pakej menikmati diskaun 50% untuk pertama kali, pakej lebih besar lebih berbaloi',
  firstTimeOffer: 'Tambahan 50% kredit untuk penambahan pertama',
  mostPopular: 'Paling Popular',
  credits: 'kredit',
  save: 'Jimat',
  buyNow: 'Beli Sekarang',
  hint: '💡 Semua pakej menyokong Alipay, WeChat Pay, kad kredit dan pelbagai kaedah pembayaran lain',
  refund:
    '7 hari pulangan tanpa sebab · Perlindungan enkripsi data · Selamat dan boleh dipercayai',
  starter: {
    name: 'Versi Permulaan',
    features: {
      credits: '100 kredit',
      analyses: 'Kira-kira 5-10 analisis',
      bazi: 'Analisis Ba Zi asas',
      xuankong: 'Pertanyaan Feng Shui Xuan Kong',
      validity: 'Tempoh sah 7 hari',
    },
  },
  standard: {
    name: 'Versi Standard',
    features: {
      credits: '500 kredit',
      analyses: 'Kira-kira 25-50 analisis',
      bazi: 'Analisis Ba Zi lengkap',
      xuankong: 'Nasihat Feng Shui lanjutan',
      ai: 'Konsultasi AI pintar',
      pdf: 'Eksport laporan PDF',
      validity: 'Tempoh sah 30 hari',
    },
  },
  professional: {
    name: 'Versi Profesional',
    features: {
      credits: '1500 kredit',
      analyses: 'Kira-kira 75-150 analisis',
      bazi: 'Tafsiran Ba Zi mendalam',
      xuankong: 'Susun atur Feng Shui profesional',
      ai: 'Konsultasi AI tanpa had',
      support: 'Sokongan teknikal keutamaan',
      vip: 'Perkhidmatan eksklusif VIP',
      validity: 'Tempoh sah 90 hari',
    },
  },
};

// 日语翻译词典
const jaPricingTranslations = {
  title: 'あなたに最適なプランを選択',
  subtitle: '全てのプランで初回50%割引、大きなプランを選ぶとよりお得',
  firstTimeOffer: '初回チャージで追加50%クレジット',
  mostPopular: '最も人気',
  credits: 'クレジット',
  save: '節約',
  buyNow: '今すぐ購入',
  hint: '💡 全てのプランはAlipay、WeChat Pay、クレジットカードなど複数の支払い方法に対応',
  refund: '7日間返金保証 · データ暗号化保護 · 安全で信頼できる',
  starter: {
    name: '入門版',
    features: {
      credits: '100 クレジット',
      analyses: '約5-10回の分析',
      bazi: '基礎八字分析',
      xuankong: '玄空風水検索',
      validity: '有効期限7日',
    },
  },
  standard: {
    name: 'スタンダード版',
    features: {
      credits: '500 クレジット',
      analyses: '約25-50回の分析',
      bazi: '完全八字分析',
      xuankong: '高度な風水アドバイス',
      ai: 'AIスマートコンサルティング',
      pdf: 'PDFレポートエクスポート',
      validity: '有効期限30日',
    },
  },
  professional: {
    name: 'プロフェッショナル版',
    features: {
      credits: '1500 クレジット',
      analyses: '約75-150回の分析',
      bazi: '深い八字解読',
      xuankong: 'プロの風水レイアウト',
      ai: '無制限AIコンサルティング',
      support: '優先技術サポート',
      vip: 'VIP専用サービス',
      validity: '有効期限90日',
    },
  },
};

// 韩语翻译词典
const koPricingTranslations = {
  title: '당신에게 맞는 패키지 선택',
  subtitle:
    '모든 패키지는 첫 충전 시 50% 할인, 더 큰 패키지를 선택하면 더 유리',
  firstTimeOffer: '첫 충전 시 추가 50% 크레딧 제공',
  mostPopular: '가장 인기',
  credits: '크레딧',
  save: '절약',
  buyNow: '지금 구매',
  hint: '💡 모든 패키지는 Alipay, WeChat Pay, 신용카드 등 다양한 결제 방법 지원',
  refund: '7일 무조건 환불 · 데이터 암호화 보호 · 안전하고 신뢰할 수 있음',
  starter: {
    name: '입문 버전',
    features: {
      credits: '100 크레딧',
      analyses: '약 5-10회 분석',
      bazi: '기초 팔자 분석',
      xuankong: '현공풍수 조회',
      validity: '7일 유효기간',
    },
  },
  standard: {
    name: '표준 버전',
    features: {
      credits: '500 크레딧',
      analyses: '약 25-50회 분석',
      bazi: '완전한 팔자 분석',
      xuankong: '고급 풍수 조언',
      ai: 'AI 스마트 컨설팅',
      pdf: 'PDF 보고서 내보내기',
      validity: '30일 유효기간',
    },
  },
  professional: {
    name: '전문가 버전',
    features: {
      credits: '1500 크레딧',
      analyses: '약 75-150회 분석',
      bazi: '심층 팔자 해석',
      xuankong: '전문 풍수 레이아웃',
      ai: '무제한 AI 컨설팅',
      support: '우선 기술 지원',
      vip: 'VIP 전용 서비스',
      validity: '90일 유효기간',
    },
  },
};

// 英语翻译词典
const enPricingTranslations = {
  title: 'Choose Your Perfect Package',
  subtitle:
    'All packages enjoy 50% off for first-time purchase, larger packages offer better value',
  firstTimeOffer: 'Extra 50% credits for first-time recharge',
  mostPopular: 'Most Popular',
  credits: 'credits',
  save: 'Save',
  buyNow: 'Buy Now',
  hint: '💡 All packages support Alipay, WeChat Pay, credit cards and multiple payment methods',
  refund:
    '7-day money-back guarantee · Data encryption protection · Safe and reliable',
  starter: {
    name: 'Starter Edition',
    features: {
      credits: '100 credits',
      analyses: 'About 5-10 analyses',
      bazi: 'Basic Ba Zi analysis',
      xuankong: 'Xuan Kong Feng Shui query',
      validity: '7-day validity',
    },
  },
  standard: {
    name: 'Standard Edition',
    features: {
      credits: '500 credits',
      analyses: 'About 25-50 analyses',
      bazi: 'Complete Ba Zi analysis',
      xuankong: 'Advanced Feng Shui advice',
      ai: 'AI smart consultation',
      pdf: 'PDF report export',
      validity: '30-day validity',
    },
  },
  professional: {
    name: 'Professional Edition',
    features: {
      credits: '1500 credits',
      analyses: 'About 75-150 analyses',
      bazi: 'In-depth Ba Zi interpretation',
      xuankong: 'Professional Feng Shui layout',
      ai: 'Unlimited AI consultation',
      support: 'Priority technical support',
      vip: 'VIP exclusive service',
      validity: '90-day validity',
    },
  },
};

// 繁体中文翻译词典
const zhTWPricingTranslations = {
  title: '選擇適合你的套餐',
  subtitle: '所有套餐均享首充 50% 優惠，選擇更大套餐更劃算',
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
      ai: 'AI 智能諮詢',
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
      ai: '無限 AI 諮詢',
      support: '優先技術支持',
      vip: 'VIP 專屬服務',
      validity: '90 天有效期',
    },
  },
};

const languages = {
  en: enPricingTranslations,
  'zh-TW': zhTWPricingTranslations,
  'ms-MY': msPricingTranslations,
  ja: jaPricingTranslations,
  ko: koPricingTranslations,
};

console.log('🔧 首页定价模块翻译补全工具\n');

let totalUpdated = 0;

// 处理每种语言
for (const [langCode, translations] of Object.entries(languages)) {
  const filePath = path.join(__dirname, `../messages/${langCode}.json`);

  try {
    console.log(`\n处理语言: ${langCode}`);

    // 读取文件
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    // 确保 home.pricing 存在
    if (!data.home) {
      data.home = {};
    }

    // 检查是否需要更新
    // 检测是否包含中文字符
    const containsChinese =
      data.home.pricing?.title &&
      /[\u4e00-\u9fa5]/.test(JSON.stringify(data.home.pricing));

    const needsUpdate =
      !data.home.pricing ||
      !data.home.pricing.title ||
      data.home.pricing.title.includes('[') ||
      data.home.pricing.title === 'Credit Packages' ||
      data.home.pricing.title === '价格' ||
      containsChinese;

    if (needsUpdate) {
      data.home.pricing = translations;

      // 保存文件
      const updatedContent = JSON.stringify(data, null, 2);
      fs.writeFileSync(filePath, updatedContent, 'utf-8');

      console.log(`✅ ${langCode}: 已更新 home.pricing 翻译`);
      totalUpdated++;
    } else {
      console.log(`⏭️  ${langCode}: 翻译已存在，跳过`);
    }
  } catch (error) {
    console.error(`❌ ${langCode}: 处理失败 -`, error.message);
  }
}

console.log(`\n✅ 完成！共更新 ${totalUpdated} 个语言文件`);
