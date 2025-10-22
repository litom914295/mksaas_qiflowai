const fs = require('fs');
const path = require('path');

// 定义各语言的 HomePage.features 翻译
const featuresTranslations = {
  'zh-CN': {
    title: '核心功能',
    subtitle: '专业的分析工具',
    description: '结合传统智慧与现代技术，为您提供全方位的命理风水分析服务',
    items: {
      'item-1': {
        title: '数据驱动分析',
        description: '基于海量数据和专业算法，提供精准的命理分析',
      },
      'item-2': {
        title: '隐私保护',
        description: '严格的数据加密和隐私保护措施，确保您的信息安全',
      },
      'item-3': {
        title: '个性化服务',
        description: '根据您的个人信息，提供定制化的分析报告和建议',
      },
      'item-4': {
        title: '实时更新',
        description: '持续更新的运势分析和风水布局建议，助您把握时机',
      },
    },
  },
  en: {
    title: 'Core Features',
    subtitle: 'Professional Analysis Tools',
    description:
      'Combining traditional wisdom with modern technology to provide comprehensive destiny and Feng Shui analysis services',
    items: {
      'item-1': {
        title: 'Data-Driven Analysis',
        description:
          'Accurate destiny analysis based on massive data and professional algorithms',
      },
      'item-2': {
        title: 'Privacy Protection',
        description:
          'Strict data encryption and privacy protection measures to ensure your information security',
      },
      'item-3': {
        title: 'Personalized Service',
        description:
          'Customized analysis reports and recommendations based on your personal information',
      },
      'item-4': {
        title: 'Real-time Updates',
        description:
          'Continuously updated fortune analysis and Feng Shui layout recommendations to help you seize opportunities',
      },
    },
  },
  'zh-TW': {
    title: '核心功能',
    subtitle: '專業的分析工具',
    description: '結合傳統智慧與現代技術，為您提供全方位的命理風水分析服務',
    items: {
      'item-1': {
        title: '數據驅動分析',
        description: '基於海量數據和專業算法，提供精準的命理分析',
      },
      'item-2': {
        title: '隱私保護',
        description: '嚴格的數據加密和隱私保護措施，確保您的信息安全',
      },
      'item-3': {
        title: '個性化服務',
        description: '根據您的個人信息，提供定制化的分析報告和建議',
      },
      'item-4': {
        title: '實時更新',
        description: '持續更新的運勢分析和風水佈局建議，助您把握時機',
      },
    },
  },
  ja: {
    title: 'コア機能',
    subtitle: 'プロフェッショナルな分析ツール',
    description:
      '伝統的な知恵と現代技術を組み合わせて、包括的な運命と風水の分析サービスを提供',
    items: {
      'item-1': {
        title: 'データ駆動型分析',
        description: '膨大なデータと専門的なアルゴリズムに基づく正確な運命分析',
      },
      'item-2': {
        title: 'プライバシー保護',
        description:
          '厳格なデータ暗号化とプライバシー保護措置により、お客様の情報セキュリティを確保',
      },
      'item-3': {
        title: 'パーソナライズドサービス',
        description:
          'お客様の個人情報に基づいてカスタマイズされた分析レポートと推奨事項',
      },
      'item-4': {
        title: 'リアルタイム更新',
        description:
          '継続的に更新される運勢分析と風水レイアウトの推奨事項で、チャンスをつかむお手伝い',
      },
    },
  },
  ko: {
    title: '핵심 기능',
    subtitle: '전문 분석 도구',
    description:
      '전통적인 지혜와 현대 기술을 결합하여 포괄적인 운명 및 풍수 분석 서비스를 제공',
    items: {
      'item-1': {
        title: '데이터 기반 분석',
        description:
          '방대한 데이터와 전문 알고리즘을 기반으로 정확한 운명 분석 제공',
      },
      'item-2': {
        title: '개인정보 보호',
        description:
          '엄격한 데이터 암호화 및 개인정보 보호 조치로 정보 보안 보장',
      },
      'item-3': {
        title: '맞춤형 서비스',
        description:
          '개인 정보를 기반으로 맞춤형 분석 보고서 및 권장 사항 제공',
      },
      'item-4': {
        title: '실시간 업데이트',
        description:
          '지속적으로 업데이트되는 운세 분석 및 풍수 레이아웃 권장 사항으로 기회 포착 지원',
      },
    },
  },
  fr: {
    title: 'Fonctionnalités Principales',
    subtitle: "Outils d'Analyse Professionnels",
    description:
      "Combinant la sagesse traditionnelle avec la technologie moderne pour fournir des services complets d'analyse du destin et du Feng Shui",
    items: {
      'item-1': {
        title: 'Analyse Pilotée par les Données',
        description:
          'Analyse précise du destin basée sur des données massives et des algorithmes professionnels',
      },
      'item-2': {
        title: 'Protection de la Vie Privée',
        description:
          'Mesures strictes de cryptage des données et de protection de la vie privée pour garantir la sécurité de vos informations',
      },
      'item-3': {
        title: 'Service Personnalisé',
        description:
          "Rapports d'analyse personnalisés et recommandations basés sur vos informations personnelles",
      },
      'item-4': {
        title: 'Mises à Jour en Temps Réel',
        description:
          'Analyses de fortune et recommandations de disposition Feng Shui continuellement mises à jour pour vous aider à saisir les opportunités',
      },
    },
  },
  es: {
    title: 'Características Principales',
    subtitle: 'Herramientas de Análisis Profesionales',
    description:
      'Combinando la sabiduría tradicional con la tecnología moderna para proporcionar servicios integrales de análisis del destino y Feng Shui',
    items: {
      'item-1': {
        title: 'Análisis Basado en Datos',
        description:
          'Análisis preciso del destino basado en datos masivos y algoritmos profesionales',
      },
      'item-2': {
        title: 'Protección de Privacidad',
        description:
          'Estrictas medidas de encriptación de datos y protección de privacidad para garantizar la seguridad de su información',
      },
      'item-3': {
        title: 'Servicio Personalizado',
        description:
          'Informes de análisis personalizados y recomendaciones basadas en su información personal',
      },
      'item-4': {
        title: 'Actualizaciones en Tiempo Real',
        description:
          'Análisis de fortuna y recomendaciones de diseño Feng Shui actualizados continuamente para ayudarle a aprovechar las oportunidades',
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

    // 确保 HomePage 对象存在
    if (!existingContent.HomePage) {
      existingContent.HomePage = {};
    }

    // 添加 features 翻译
    if (featuresTranslations[locale]) {
      existingContent.HomePage.features = featuresTranslations[locale];
      console.log(
        `✅ Added HomePage.features translations for locale: ${locale}`
      );
    } else {
      // 如果没有特定语言的翻译，使用英文作为后备
      existingContent.HomePage.features = featuresTranslations.en;
      console.log(`⚠️  Used English fallback for locale: ${locale}`);
    }

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

console.log('\n🎉 HomePage.features translation update completed!');
