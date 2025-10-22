/**
 * 修复翻译文件的UTF-8编码问题
 * 运行: node fix-encoding.js
 */

const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'locales');

// 完整的翻译数据（正确的UTF-8字符）
const translations = {
  'zh-TW': {
    BaziHome: {
      title: '開始命理之旅',
      subtitle: '免費體驗',
      heroTitle: '3分鐘，看清你的',
      heroTitleHighlight: '天賦與運勢轉折點',
      heroDescription: '結合千年命理智慧與AI算法，98%用戶認為「準得離譜」',
      accuracy: '98% 算法精準',
      privacy: '隱私保護',
      speed: '3分鐘分析',
      userCount: '已有 {count} 人獲得了人生指南',
      rating: '用戶評分',
      algorithmAccuracy: '算法準確率',
      viewExample: '先看個示例',
      aiConsultation: 'AI智能諮詢',
    },
    form: {
      title: '開始命理之旅 · 免費體驗',
      name: '姓名',
      namePlaceholder: '請輸入姓名',
      gender: '性別',
      male: '男',
      female: '女',
      birthCity: '出生城市',
      birthCityPlaceholder: '如: 台北',
      solarTime: '真太陽時',
      birthDate: '出生日期',
      solar: '陽曆',
      lunar: '陰曆',
      birthTime: '出生時間',
      timeMorning: '上午',
      timeAfternoon: '下午',
      timeEvening: '晚上',
      timeMorningTooltip: '卯辰巳午 (05:00-13:00)',
      timeAfternoonTooltip: '未申酉戌 (13:00-21:00)',
      timeEveningTooltip: '亥子丑寅 (21:00-05:00)',
      lunarNote: '已選擇陰曆，系統將自動轉換為陽曆進行排盤',
      submitButton: '開始分析',
      addHouseInfo: '添加風水資訊（可選）',
      houseDirection: '房屋朝向',
      selectDirection: '選擇朝向',
      roomCount: '房間數',
      completionYear: '建成年份',
      completionMonth: '建成月份',
      noRegistration: '💡 無需註冊 · 3分鐘生成 · 首次體驗免費',
      fillAllFields: '請填寫所有必填資訊',
      users: '12萬+用戶',
      accurate: '98%準確',
    },
    home: {
      features: {
        title: '強大的功能，簡單的操作',
        subtitle:
          '從八字命理到風水佈局，從數據分析到AI諮詢，一站式解決所有需求',
        learnMore: '了解更多',
        hint: '💡 所有功能均採用先進的AI算法，確保準確性和專業性',
        bazi: {
          title: '八字分析',
          description: '30秒生成命理報告',
        },
        xuankong: {
          title: '玄空風水',
          description: '智能飛星佈局分析',
        },
        compass: {
          title: '羅盤算法',
          description: 'AI 智能方位識別',
        },
        floorPlan: {
          title: '戶型圖分析',
          description: '上傳戶型圖即可分析',
        },
        visualization3d: {
          title: '3D 可視化',
          description: '立體風水佈局展示',
        },
        aiAssistant: {
          title: 'AI 助手',
          description: '24/7 智能問答',
        },
      },
    },
  },
};

// 只修复 zh-TW，因为其他语言已经正确
const locale = 'zh-TW';
const filePath = path.join(localesDir, `${locale}.json`);

try {
  // 读取现有文件
  let existingData = {};
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    existingData = JSON.parse(content);
  } catch (e) {
    console.log('⚠️  无法读取现有文件，将创建新文件');
  }

  // 合并翻译（保留其他现有内容）
  const mergedData = {
    ...existingData,
    ...translations[locale],
  };

  // 写回文件，明确使用 UTF-8 BOM
  const jsonString = JSON.stringify(mergedData, null, 2);
  fs.writeFileSync(filePath, '\uFEFF' + jsonString, 'utf-8');

  console.log(`✅ 已修复 ${locale}.json 的编码问题`);
  console.log('📝 已添加/更新:');
  console.log(
    `   - BaziHome: ${Object.keys(mergedData.BaziHome || {}).length} 个键`
  );
  console.log(`   - form: ${Object.keys(mergedData.form || {}).length} 个键`);
  console.log(
    `   - home.features: ${Object.keys(mergedData.home?.features || {}).length} 个键`
  );
} catch (error) {
  console.error('❌ 修复失败:', error.message);
  process.exit(1);
}

console.log('\n🎉 编码修复完成！请重启开发服务器。');
