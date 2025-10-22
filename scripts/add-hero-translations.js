/**
 * 添加 HeroWithForm 组件所有缺失的翻译键
 */

const fs = require('fs');
const path = require('path');

const locales = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'ms'];
const messagesDir = path.join(__dirname, '..', 'messages');

// Hero区域的翻译
const heroTranslations = {
  'zh-CN': {
    // 主标题和副标题
    mainTitle: '3分钟，看清你的',
    mainTitleLine2: '天赋与运势转折点',
    mainSubtitle: '结合千年命理智慧与AI算法，98%用户认为「准得离谱」',

    // 特性标签
    feature1: '98% 算法精准',
    feature2: '隐私保护',
    feature3: '3分钟分析',

    // 社会证明
    usersGuided: '人获得了人生指南',
    usersGuidedPrefix: '已有',

    // 次要CTA
    viewExample: '先看个示例',
    aiConsult: 'AI智能咨询',

    // 信任指标
    userRating: '用户评分',
    algorithmAccuracy: '算法准确率',

    // Alert提示
    alertFillRequired: '请填写所有必填信息',
  },
  'zh-TW': {
    mainTitle: '3分鐘，看清你的',
    mainTitleLine2: '天賦與運勢轉折點',
    mainSubtitle: '結合千年命理智慧與AI算法，98%用戶認為「準得離譜」',

    feature1: '98% 算法精準',
    feature2: '隱私保護',
    feature3: '3分鐘分析',

    usersGuided: '人獲得了人生指南',
    usersGuidedPrefix: '已有',

    viewExample: '先看個示例',
    aiConsult: 'AI智能咨詢',

    userRating: '用戶評分',
    algorithmAccuracy: '算法準確率',

    alertFillRequired: '請填寫所有必填信息',
  },
  en: {
    mainTitle: '3 Minutes to Reveal',
    mainTitleLine2: 'Your Talents & Fortune Turning Points',
    mainSubtitle:
      'Combining millennia of wisdom with AI algorithms, 98% of users find it "Incredibly Accurate"',

    feature1: '98% Algorithm Accuracy',
    feature2: 'Privacy Protected',
    feature3: '3-Min Analysis',

    usersGuided: 'people received life guidance',
    usersGuidedPrefix: '',

    viewExample: 'View Example',
    aiConsult: 'AI Consultation',

    userRating: 'User Rating',
    algorithmAccuracy: 'Algorithm Accuracy',

    alertFillRequired: 'Please fill in all required fields',
  },
  ja: {
    mainTitle: '3分で見える',
    mainTitleLine2: 'あなたの才能と運命の転機',
    mainSubtitle:
      '千年の命理知恵とAIアルゴリズムを組み合わせ、98%のユーザーが「信じられないほど正確」と評価',

    feature1: '98% 算法精度',
    feature2: 'プライバシー保護',
    feature3: '3分分析',

    usersGuided: '人が人生の指針を得ました',
    usersGuidedPrefix: 'すでに',

    viewExample: '例を見る',
    aiConsult: 'AI相談',

    userRating: 'ユーザー評価',
    algorithmAccuracy: 'アルゴリズム精度',

    alertFillRequired: '必須項目をすべて入力してください',
  },
  ko: {
    mainTitle: '3분만에 확인하는',
    mainTitleLine2: '당신의 재능과 운명의 전환점',
    mainSubtitle:
      '천년의 명리 지혜와 AI 알고리즘 결합, 98% 사용자가 "놀랍도록 정확"하다고 평가',

    feature1: '98% 알고리즘 정확도',
    feature2: '개인정보 보호',
    feature3: '3분 분석',

    usersGuided: '명이 인생 가이드를 받았습니다',
    usersGuidedPrefix: '이미',

    viewExample: '예시 보기',
    aiConsult: 'AI 상담',

    userRating: '사용자 평가',
    algorithmAccuracy: '알고리즘 정확도',

    alertFillRequired: '필수 항목을 모두 입력해주세요',
  },
  ms: {
    mainTitle: '3 Minit untuk Mengetahui',
    mainTitleLine2: 'Bakat & Titik Perubahan Nasib Anda',
    mainSubtitle:
      'Menggabungkan kebijaksanaan ribuan tahun dengan algoritma AI, 98% pengguna menganggapnya "Sangat Tepat"',

    feature1: '98% Ketepatan Algoritma',
    feature2: 'Privasi Dilindungi',
    feature3: 'Analisis 3 Minit',

    usersGuided: 'orang telah mendapat panduan hidup',
    usersGuidedPrefix: 'Sudah',

    viewExample: 'Lihat Contoh',
    aiConsult: 'Konsultasi AI',

    userRating: 'Penilaian Pengguna',
    algorithmAccuracy: 'Ketepatan Algoritma',

    alertFillRequired: 'Sila isi semua medan yang diperlukan',
  },
};

function addHeroTranslations() {
  console.log('🚀 添加 Hero 区域翻译键\n');

  let successCount = 0;
  let failCount = 0;

  for (const locale of locales) {
    const filePath = path.join(messagesDir, `${locale}.json`);

    try {
      // 读取现有文件
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);

      // 添加到 BaziHome 命名空间
      if (!('BaziHome' in data)) {
        data.BaziHome = {};
      }

      // 添加所有翻译键
      let addedCount = 0;
      for (const [key, value] of Object.entries(heroTranslations[locale])) {
        if (!(key in data.BaziHome)) {
          data.BaziHome[key] = value;
          addedCount++;
        }
      }

      if (addedCount === 0) {
        console.log(`✓ ${locale}: 所有 Hero 翻译键已存在`);
        successCount++;
        continue;
      }

      // 写回文件
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

      console.log(`✅ ${locale}: 成功添加 ${addedCount} 个 Hero 翻译键`);
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
    console.log('\n🎉 所有 Hero 区域翻译键已添加！');
    console.log('\n⚠️  重要提示：');
    console.log('翻译键已添加到 messages/ 文件，但组件代码中的硬编码文本');
    console.log('仍需要手动替换为 t() 或 tForm() 调用。');
    console.log('\n建议的替换：');
    console.log('1. 在 HeroWithForm.tsx 中');
    console.log("2. 将所有硬编码中文替换为 t('keyName')");
    console.log('\n浏览器会自动热更新');
  }
}

addHeroTranslations();
