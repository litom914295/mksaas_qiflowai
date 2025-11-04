const fs = require('fs');
const path = require('path');

// 定义各语言的 FAQ 翻译
const faqTranslations = {
  en: {
    title: 'Frequently Asked Questions',
    subtitle: 'Answers to common questions about our services',
    items: {
      'item-1': {
        question: 'How accurate is the BaZi analysis?',
        answer:
          'Our BaZi analysis is based on traditional Chinese astrology principles and modern algorithmic optimization, combined with big data validation, achieving over 98% accuracy. More than 120,000 users have verified the accuracy of our analysis results.',
      },
      'item-2': {
        question: 'How are Feng Shui analysis fees calculated?',
        answer:
          'Basic BaZi analysis is completely free. Deep destiny interpretation costs 30 credits, Xuankong Flying Stars analysis costs 20 credits, and AI consultation costs 5 credits per session. New users receive 100 credits upon registration.',
      },
      'item-3': {
        question: 'How to improve analysis accuracy?',
        answer:
          'Please ensure you provide accurate birth time (precise to the minute), birth location, and true solar time information. This information directly affects the accuracy of BaZi chart construction and thus the final analysis results.',
      },
      'item-4': {
        question: 'How to earn and use credits?',
        answer:
          'New users get 100 credits upon registration, 5 credits for daily check-in, and 50 credits when you successfully refer a friend. Credits can be used for deep analysis, AI consultation, and other premium features.',
      },
      'item-5': {
        question: 'How to contact customer support?',
        answer:
          'You can contact us through the online customer service feature in the bottom right corner of the page, or send an email to support@qiflow.ai. Our customer service team provides professional service 24/7.',
      },
    },
  },
  'zh-TW': {
    title: '常見問題',
    subtitle: '解答您使用過程中的疑問',
    items: {
      'item-1': {
        question: '八字分析準確率如何？',
        answer:
          '我們的八字分析基於傳統命理學原理和現代算法優化，結合大數據驗證，準確率達到98%以上。已有超過12萬用戶驗證分析結果的準確性。',
      },
      'item-2': {
        question: '風水分析費用如何計算？',
        answer:
          '基礎八字分析完全免費，深度命理解讀需要消耗30積分，玄空飛星風水分析20積分，AI智能咨詢每次5積分。新用戶註冊即送100積分。',
      },
      'item-3': {
        question: '如何提高分析準確性？',
        answer:
          '請確保提供準確的出生時間（精確到分鐘）、出生地點和真太陽時信息。這些信息直接影響八字排盤的準確性，從而影響最終分析結果。',
      },
      'item-4': {
        question: '積分如何獲得和使用？',
        answer:
          '新用戶註冊送100積分，每日簽到獲得5積分，分享好友成功註冊獲得50積分。積分可用於深度分析、AI咨詢等高級功能。',
      },
      'item-5': {
        question: '如何聯繫客服支持？',
        answer:
          '您可以通過頁面右下角的在線客服功能聯繫我們，或發送郵件至support@qiflow.ai。我們的客服團隊7x24小時為您提供專業服務。',
      },
    },
  },
  ja: {
    title: 'よくある質問',
    subtitle: 'サービス利用に関する一般的な質問',
    items: {
      'item-1': {
        question: '八字分析の精度はどの程度ですか？',
        answer:
          '私たちの八字分析は伝統的な命理学の原理と現代のアルゴリズム最適化に基づき、ビッグデータ検証と組み合わせて98%以上の精度を実現しています。12万人以上のユーザーが分析結果の正確性を検証しています。',
      },
      'item-2': {
        question: '風水分析の料金はどのように計算されますか？',
        answer:
          '基本的な八字分析は完全無料です。深度運命解読には30クレジット、玄空飛星分析には20クレジット、AI相談は1回あたり5クレジットが必要です。新規ユーザーは登録時に100クレジットを受け取ります。',
      },
      'item-3': {
        question: '分析精度を向上させるにはどうすればよいですか？',
        answer:
          '正確な出生時間（分まで）、出生地、真太陽時の情報を提供してください。これらの情報は八字排盤の正確性に直接影響し、最終的な分析結果に影響します。',
      },
      'item-4': {
        question: 'クレジットはどのように獲得・使用しますか？',
        answer:
          '新規ユーザーは登録時に100クレジットを獲得し、毎日のチェックインで5クレジット、友人紹介成功で50クレジットを獲得できます。クレジットは深度分析、AI相談などのプレミアム機能に使用できます。',
      },
      'item-5': {
        question: 'カスタマーサポートにはどのように連絡すればよいですか？',
        answer:
          'ページ右下のオンラインカスタマーサービス機能でお問い合わせいただくか、support@qiflow.aiまでメールをお送りください。カスタマーサービスチームが24時間365日プロフェッショナルなサービスを提供します。',
      },
    },
  },
  ko: {
    title: '자주 묻는 질문',
    subtitle: '서비스 이용 중 궁금한 점들을 해결해드립니다',
    items: {
      'item-1': {
        question: '사주 분석의 정확도는 어떻게 되나요?',
        answer:
          '저희 사주 분석은 전통 명리학 원리와 현대 알고리즘 최적화를 기반으로 하며, 빅데이터 검증을 통해 98% 이상의 정확도를 달성하고 있습니다. 12만 명 이상의 사용자가 분석 결과의 정확성을 검증했습니다.',
      },
      'item-2': {
        question: '풍수 분석 비용은 어떻게 계산되나요?',
        answer:
          '기본 사주 분석은 완전 무료입니다. 심화 운세 해석은 30 크레딧, 현공비성 풍수 분석은 20 크레딧, AI 상담은 회당 5 크레딧이 필요합니다. 신규 가입자는 가입 시 100 크레딧을 받습니다.',
      },
      'item-3': {
        question: '분석 정확도를 높이려면 어떻게 해야 하나요?',
        answer:
          '정확한 출생시간(분 단위까지), 출생지점, 진태양시 정보를 제공해주세요. 이러한 정보는 사주 구성의 정확성에 직접 영향을 미치며, 최종 분석 결과에도 영향을 줍니다.',
      },
      'item-4': {
        question: '크레딧은 어떻게 획득하고 사용하나요?',
        answer:
          '신규 가입 시 100 크레딧 지급, 일일 체크인으로 5 크레딧, 친구 추천 성공 시 50 크레딧을 획득할 수 있습니다. 크레딧은 심화 분석, AI 상담 등 프리미엄 기능에 사용할 수 있습니다.',
      },
      'item-5': {
        question: '고객 지원팀에는 어떻게 연락하나요?',
        answer:
          '페이지 우하단의 온라인 고객 서비스 기능을 통해 연락하거나 support@qiflow.ai로 이메일을 보내주세요. 고객 서비스팀이 24시간 전문적인 서비스를 제공합니다.',
      },
    },
  },
  fr: {
    title: 'Questions Fréquemment Posées',
    subtitle: 'Réponses aux questions courantes sur nos services',
    items: {
      'item-1': {
        question: "Quelle est la précision de l'analyse BaZi ?",
        answer:
          "Notre analyse BaZi est basée sur les principes traditionnels de l'astrologie chinoise et l'optimisation algorithmique moderne, combinés avec la validation de données massives, atteignant plus de 98% de précision. Plus de 120 000 utilisateurs ont vérifié la précision de nos résultats d'analyse.",
      },
      'item-2': {
        question: "Comment sont calculés les frais d'analyse Feng Shui ?",
        answer:
          "L'analyse BaZi de base est entièrement gratuite. L'interprétation approfondie du destin coûte 30 crédits, l'analyse Xuankong Flying Stars coûte 20 crédits, et la consultation IA coûte 5 crédits par session. Les nouveaux utilisateurs reçoivent 100 crédits lors de l'inscription.",
      },
      'item-3': {
        question: "Comment améliorer la précision de l'analyse ?",
        answer:
          "Veuillez vous assurer de fournir l'heure de naissance précise (à la minute près), le lieu de naissance et les informations de temps solaire vrai. Ces informations affectent directement la précision de la construction du thème BaZi et donc les résultats d'analyse finaux.",
      },
      'item-4': {
        question: 'Comment gagner et utiliser des crédits ?',
        answer:
          "Les nouveaux utilisateurs obtiennent 100 crédits lors de l'inscription, 5 crédits pour le check-in quotidien, et 50 crédits lors du parrainage réussi d'un ami. Les crédits peuvent être utilisés pour l'analyse approfondie, la consultation IA et d'autres fonctionnalités premium.",
      },
      'item-5': {
        question: 'Comment contacter le support client ?',
        answer:
          'Vous pouvez nous contacter via la fonction de service client en ligne dans le coin inférieur droit de la page, ou envoyer un email à support@qiflow.ai. Notre équipe de service client fournit un service professionnel 24h/24 et 7j/7.',
      },
    },
  },
  es: {
    title: 'Preguntas Frecuentes',
    subtitle: 'Respuestas a preguntas comunes sobre nuestros servicios',
    items: {
      'item-1': {
        question: '¿Qué tan preciso es el análisis BaZi?',
        answer:
          'Nuestro análisis BaZi se basa en los principios tradicionales de la astrología china y la optimización algorítmica moderna, combinado con validación de big data, alcanzando más del 98% de precisión. Más de 120,000 usuarios han verificado la precisión de nuestros resultados de análisis.',
      },
      'item-2': {
        question: '¿Cómo se calculan las tarifas de análisis Feng Shui?',
        answer:
          'El análisis BaZi básico es completamente gratuito. La interpretación profunda del destino cuesta 30 créditos, el análisis Xuankong Flying Stars cuesta 20 créditos, y la consulta AI cuesta 5 créditos por sesión. Los nuevos usuarios reciben 100 créditos al registrarse.',
      },
      'item-3': {
        question: '¿Cómo mejorar la precisión del análisis?',
        answer:
          'Por favor asegúrese de proporcionar la hora de nacimiento precisa (precisa al minuto), ubicación de nacimiento e información de tiempo solar verdadero. Esta información afecta directamente la precisión de la construcción de la carta BaZi y por lo tanto los resultados finales del análisis.',
      },
      'item-4': {
        question: '¿Cómo ganar y usar créditos?',
        answer:
          'Los nuevos usuarios obtienen 100 créditos al registrarse, 5 créditos por check-in diario, y 50 créditos cuando refieren exitosamente a un amigo. Los créditos pueden usarse para análisis profundo, consulta AI y otras características premium.',
      },
      'item-5': {
        question: '¿Cómo contactar el soporte al cliente?',
        answer:
          'Puede contactarnos a través de la función de servicio al cliente en línea en la esquina inferior derecha de la página, o enviar un email a support@qiflow.ai. Nuestro equipo de servicio al cliente proporciona servicio profesional 24/7.',
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

  console.log(`Processing ${file} (locale: ${locale})`);

  try {
    // 读取现有的翻译文件
    const existingContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // 确保 HomePage 对象存在
    if (!existingContent.HomePage) {
      existingContent.HomePage = {};
    }

    // 添加 FAQ 翻译
    if (faqTranslations[locale]) {
      existingContent.HomePage.faqs = faqTranslations[locale];
      console.log(`✅ Added FAQ translations for locale: ${locale}`);
    } else {
      // 如果没有特定语言的翻译，使用英文作为后备
      existingContent.HomePage.faqs = faqTranslations.en;
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

console.log('🎉 FAQ translation update completed!');
