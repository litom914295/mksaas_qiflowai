/**
 * 更新所有语言文件的表单翻译
 * 运行: node update-form-i18n.js
 */

const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'locales');

// 定义所有语言的表单翻译
const formTranslations = {
  'zh-CN': {
    form: {
      title: '开始命理之旅 · 免费体验',
      name: '姓名',
      namePlaceholder: '请输入姓名',
      gender: '性别',
      male: '男',
      female: '女',
      birthCity: '出生城市',
      birthCityPlaceholder: '如: 北京',
      solarTime: '真太阳时',
      birthDate: '出生日期',
      solar: '阳历',
      lunar: '阴历',
      birthTime: '出生时间',
      timeMorning: '上午',
      timeAfternoon: '下午',
      timeEvening: '晚上',
      timeMorningTooltip: '卯辰巳午 (05:00-13:00)',
      timeAfternoonTooltip: '未申酉戌 (13:00-21:00)',
      timeEveningTooltip: '亥子丑寅 (21:00-05:00)',
      lunarNote: '已选择阴历，系统将自动转换为阳历进行排盘',
      submitButton: '开始分析',
    },
  },
  'zh-TW': {
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
    },
  },
  en: {
    form: {
      title: 'Start Your Journey · Free Experience',
      name: 'Name',
      namePlaceholder: 'Enter your name',
      gender: 'Gender',
      male: 'Male',
      female: 'Female',
      birthCity: 'Birth City',
      birthCityPlaceholder: 'e.g. Beijing',
      solarTime: 'Solar Time',
      birthDate: 'Birth Date',
      solar: 'Solar',
      lunar: 'Lunar',
      birthTime: 'Birth Time',
      timeMorning: 'Morning',
      timeAfternoon: 'Afternoon',
      timeEvening: 'Evening',
      timeMorningTooltip: 'Mao-Chen-Si-Wu (05:00-13:00)',
      timeAfternoonTooltip: 'Wei-Shen-You-Xu (13:00-21:00)',
      timeEveningTooltip: 'Hai-Zi-Chou-Yin (21:00-05:00)',
      lunarNote: 'Lunar calendar selected, will be converted to solar calendar',
      submitButton: 'Start Analysis',
    },
  },
  ja: {
    form: {
      title: '運命の旅を始めよう · 無料体験',
      name: '氏名',
      namePlaceholder: '氏名を入力してください',
      gender: '性別',
      male: '男性',
      female: '女性',
      birthCity: '出生地',
      birthCityPlaceholder: '例: 東京',
      solarTime: '真太陽時',
      birthDate: '生年月日',
      solar: '太陽暦',
      lunar: '太陰暦',
      birthTime: '出生時刻',
      timeMorning: '午前',
      timeAfternoon: '午後',
      timeEvening: '夜',
      timeMorningTooltip: '卯辰巳午 (05:00-13:00)',
      timeAfternoonTooltip: '未申酉戌 (13:00-21:00)',
      timeEveningTooltip: '亥子丑寅 (21:00-05:00)',
      lunarNote: '太陰暦が選択されています。太陽暦に自動変換されます',
      submitButton: '分析開始',
    },
  },
  ko: {
    form: {
      title: '운명의 여정 시작 · 무료 체험',
      name: '이름',
      namePlaceholder: '이름을 입력하세요',
      gender: '성별',
      male: '남성',
      female: '여성',
      birthCity: '출생 도시',
      birthCityPlaceholder: '예: 서울',
      solarTime: '진태양시',
      birthDate: '생년월일',
      solar: '양력',
      lunar: '음력',
      birthTime: '출생 시간',
      timeMorning: '오전',
      timeAfternoon: '오후',
      timeEvening: '저녁',
      timeMorningTooltip: '묘진사오 (05:00-13:00)',
      timeAfternoonTooltip: '미신유술 (13:00-21:00)',
      timeEveningTooltip: '해자축인 (21:00-05:00)',
      lunarNote: '음력이 선택되었습니다. 양력으로 자동 변환됩니다',
      submitButton: '분석 시작',
    },
  },
  ms: {
    form: {
      title: 'Mulakan Perjalanan · Percubaan Percuma',
      name: 'Nama',
      namePlaceholder: 'Masukkan nama anda',
      gender: 'Jantina',
      male: 'Lelaki',
      female: 'Perempuan',
      birthCity: 'Bandar Lahir',
      birthCityPlaceholder: 'cth: Kuala Lumpur',
      solarTime: 'Masa Suria',
      birthDate: 'Tarikh Lahir',
      solar: 'Solar',
      lunar: 'Lunar',
      birthTime: 'Masa Lahir',
      timeMorning: 'Pagi',
      timeAfternoon: 'Petang',
      timeEvening: 'Malam',
      timeMorningTooltip: 'Mao-Chen-Si-Wu (05:00-13:00)',
      timeAfternoonTooltip: 'Wei-Shen-You-Xu (13:00-21:00)',
      timeEveningTooltip: 'Hai-Zi-Chou-Yin (21:00-05:00)',
      lunarNote: 'Kalendar lunar dipilih, akan ditukar ke kalendar solar',
      submitButton: 'Mula Analisis',
    },
  },
};

// 更新每个语言文件
Object.keys(formTranslations).forEach((locale) => {
  const filePath = path.join(localesDir, `${locale}.json`);

  try {
    // 读取现有文件
    const content = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(content);

    // 添加或更新 form 键
    json.form = formTranslations[locale].form;

    // 写回文件（保持格式化）
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf-8');

    console.log(`✅ 已更新 ${locale}.json`);
  } catch (error) {
    console.error(`❌ 更新 ${locale}.json 失败:`, error.message);
  }
});

console.log('\n🎉 所有语言文件更新完成！');
