/**
 * 首页Trust部分翻译补全脚本
 * 由 AI-WORKFLOW v5.0 自动生成
 *
 * 功能：
 * - 确保所有语言都有 home.trust 的完整翻译
 */

const fs = require('fs');
const path = require('path');

// 各语言翻译
const translations = {
  'zh-CN': {
    title: '您的信任，我们的承诺',
    subtitle: '专业、安全、高效的AI命理服务',
    privacy: {
      title: '隐私保护',
      description: '数据加密存储，绝不泄露个人信息',
    },
    speed: {
      title: '极速响应',
      description: 'AI 算法驱动，3分钟内完成分析',
    },
    accuracy: {
      title: '专业准确',
      description: '结合传统命理与现代AI，准确率高达98%',
    },
  },
  'zh-TW': {
    title: '您的信任，我們的承諾',
    subtitle: '專業、安全、高效的AI命理服務',
    privacy: {
      title: '隱私保護',
      description: '數據加密存儲，絕不泄露個人信息',
    },
    speed: {
      title: '極速響應',
      description: 'AI 算法驅動，3分鐘內完成分析',
    },
    accuracy: {
      title: '專業準確',
      description: '結合傳統命理與現代AI，準確率高達98%',
    },
  },
  en: {
    title: 'Your Trust, Our Commitment',
    subtitle: 'Professional, Secure, and Efficient AI Destiny Analysis Service',
    privacy: {
      title: 'Privacy Protection',
      description: 'Data encrypted storage, never leak personal information',
    },
    speed: {
      title: 'Lightning Fast',
      description: 'AI-powered analysis, completed within 3 minutes',
    },
    accuracy: {
      title: 'Professional Accuracy',
      description:
        'Combining traditional Chinese metaphysics with modern AI, 98% accuracy rate',
    },
  },
  ja: {
    title: 'あなたの信頼、私たちの約束',
    subtitle: '専門的、安全、高効率のAI運命分析サービス',
    privacy: {
      title: 'プライバシー保護',
      description: 'データ暗号化保存、個人情報は絶対に漏洩しません',
    },
    speed: {
      title: '高速応答',
      description: 'AIアルゴリズム駆動、3分以内に分析完了',
    },
    accuracy: {
      title: '専門的な正確さ',
      description: '伝統的な命理と現代AIを組み合わせ、正確率98%',
    },
  },
  ko: {
    title: '당신의 신뢰, 우리의 약속',
    subtitle: '전문적, 안전, 고효율 AI 운명 분석 서비스',
    privacy: {
      title: '개인정보 보호',
      description: '데이터 암호화 저장, 절대 개인정보 유출 없음',
    },
    speed: {
      title: '초고속 응답',
      description: 'AI 알고리즘 구동, 3분 이내 분석 완료',
    },
    accuracy: {
      title: '전문적 정확성',
      description: '전통 명리와 현대 AI 결합, 정확도 98%',
    },
  },
  'ms-MY': {
    title: 'Kepercayaan Anda, Komitmen Kami',
    subtitle:
      'Perkhidmatan Analisis Takdir AI yang Profesional, Selamat dan Cekap',
    privacy: {
      title: 'Perlindungan Privasi',
      description:
        'Penyimpanan data yang disulitkan, tidak akan membocorkan maklumat peribadi',
    },
    speed: {
      title: 'Respons Pantas',
      description: 'Didorong oleh algoritma AI, selesai dalam 3 minit',
    },
    accuracy: {
      title: 'Ketepatan Profesional',
      description:
        'Menggabungkan metafizik tradisional dengan AI moden, kadar ketepatan 98%',
    },
  },
};

console.log('🔧 首页Trust部分翻译补全工具\n');

let totalUpdated = 0;

// 处理每种语言
for (const [langCode, trustTranslations] of Object.entries(translations)) {
  const filePath = path.join(__dirname, `../messages/${langCode}.json`);

  try {
    console.log(`\n处理语言: ${langCode}`);

    // 读取文件
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    // 确保 home 存在
    if (!data.home) {
      data.home = {};
    }

    // 检查是否需要更新
    const needsUpdate =
      !data.home.trust ||
      !data.home.trust.title ||
      (/[\u4e00-\u9fa5]/.test(JSON.stringify(data.home.trust)) &&
        langCode !== 'zh-CN');

    if (needsUpdate || langCode === 'zh-CN') {
      data.home.trust = trustTranslations;

      // 保存文件
      const updatedContent = JSON.stringify(data, null, 2);
      fs.writeFileSync(filePath, updatedContent, 'utf-8');

      console.log(`✅ ${langCode}: 已更新 home.trust 翻译`);
      totalUpdated++;
    } else {
      console.log(`⏭️  ${langCode}: 翻译已存在，跳过`);
    }
  } catch (error) {
    console.error(`❌ ${langCode}: 处理失败 -`, error.message);
  }
}

console.log(`\n✅ 完成！共更新 ${totalUpdated} 个语言文件`);
