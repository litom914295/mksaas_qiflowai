/**
 * 添加表单区域所有缺失的翻译键
 */

const fs = require('fs');
const path = require('path');

const locales = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'ms'];
const messagesDir = path.join(__dirname, '..', 'messages');

// 表单区域所有翻译
const formCompleteTranslations = {
  'zh-CN': {
    // 日期选择
    yearPlaceholder: '年份',
    monthPlaceholder: '月份',
    dayPlaceholder: '日期',
    yearSuffix: '年',
    monthSuffix: '月',
    daySuffix: '日',
    lunarNote: '农历日期将自动转换为公历进行计算',

    // 风水信息
    addFengshuiInfo: '添加风水信息（可选）',
    houseDirection: '房屋朝向',
    selectDirection: '选择朝向',
    directionNorth: '北',
    directionSouth: '南',
    directionEast: '东',
    directionWest: '西',
    directionNortheast: '东北',
    directionNorthwest: '西北',
    directionSoutheast: '东南',
    directionSouthwest: '西南',
    roomCountLabel: '房间数',
    roomCountPlaceholder: '房间数',
    roomSuffix: '室',
    completionYear: '建成年份',
    completionYearPlaceholder: '如: 2020',
    completionMonth: '建成月份',

    // 底部提示
    bottomHint: '💡 无需注册 · 3分钟生成 · 首次体验免费',
    mobileUsers: '12万+用户',
    mobileAccuracy: '98%准确',
  },
  'zh-TW': {
    yearPlaceholder: '年份',
    monthPlaceholder: '月份',
    dayPlaceholder: '日期',
    yearSuffix: '年',
    monthSuffix: '月',
    daySuffix: '日',
    lunarNote: '農曆日期將自動轉換為公曆進行計算',

    addFengshuiInfo: '添加風水信息（可選）',
    houseDirection: '房屋朝向',
    selectDirection: '選擇朝向',
    directionNorth: '北',
    directionSouth: '南',
    directionEast: '東',
    directionWest: '西',
    directionNortheast: '東北',
    directionNorthwest: '西北',
    directionSoutheast: '東南',
    directionSouthwest: '西南',
    roomCountLabel: '房間數',
    roomCountPlaceholder: '房間數',
    roomSuffix: '室',
    completionYear: '建成年份',
    completionYearPlaceholder: '如: 2020',
    completionMonth: '建成月份',

    bottomHint: '💡 無需註冊 · 3分鐘生成 · 首次體驗免費',
    mobileUsers: '12萬+用戶',
    mobileAccuracy: '98%準確',
  },
  en: {
    yearPlaceholder: 'Year',
    monthPlaceholder: 'Month',
    dayPlaceholder: 'Day',
    yearSuffix: '',
    monthSuffix: '',
    daySuffix: '',
    lunarNote:
      'Lunar dates will be automatically converted to Gregorian for calculation',

    addFengshuiInfo: 'Add Feng Shui Info (Optional)',
    houseDirection: 'House Direction',
    selectDirection: 'Select Direction',
    directionNorth: 'North',
    directionSouth: 'South',
    directionEast: 'East',
    directionWest: 'West',
    directionNortheast: 'Northeast',
    directionNorthwest: 'Northwest',
    directionSoutheast: 'Southeast',
    directionSouthwest: 'Southwest',
    roomCountLabel: 'Room Count',
    roomCountPlaceholder: 'Rooms',
    roomSuffix: ' rooms',
    completionYear: 'Completion Year',
    completionYearPlaceholder: 'e.g.: 2020',
    completionMonth: 'Completion Month',

    bottomHint: '💡 No Registration · 3-Min Generation · First Experience Free',
    mobileUsers: '120K+ Users',
    mobileAccuracy: '98% Accurate',
  },
  ja: {
    yearPlaceholder: '年',
    monthPlaceholder: '月',
    dayPlaceholder: '日',
    yearSuffix: '年',
    monthSuffix: '月',
    daySuffix: '日',
    lunarNote: '旧暦の日付は自動的にグレゴリオ暦に変換されて計算されます',

    addFengshuiInfo: '風水情報を追加（オプション）',
    houseDirection: '住宅の方位',
    selectDirection: '方位を選択',
    directionNorth: '北',
    directionSouth: '南',
    directionEast: '東',
    directionWest: '西',
    directionNortheast: '東北',
    directionNorthwest: '西北',
    directionSoutheast: '東南',
    directionSouthwest: '西南',
    roomCountLabel: '部屋数',
    roomCountPlaceholder: '部屋数',
    roomSuffix: '室',
    completionYear: '完成年',
    completionYearPlaceholder: '例: 2020',
    completionMonth: '完成月',

    bottomHint: '💡 登録不要 · 3分生成 · 初回無料',
    mobileUsers: '12万+ユーザー',
    mobileAccuracy: '98%正確',
  },
  ko: {
    yearPlaceholder: '년',
    monthPlaceholder: '월',
    dayPlaceholder: '일',
    yearSuffix: '년',
    monthSuffix: '월',
    daySuffix: '일',
    lunarNote: '음력 날짜는 자동으로 양력으로 변환되어 계산됩니다',

    addFengshuiInfo: '풍수 정보 추가（선택 사항）',
    houseDirection: '주택 방향',
    selectDirection: '방향 선택',
    directionNorth: '북',
    directionSouth: '남',
    directionEast: '동',
    directionWest: '서',
    directionNortheast: '동북',
    directionNorthwest: '서북',
    directionSoutheast: '동남',
    directionSouthwest: '서남',
    roomCountLabel: '방 수',
    roomCountPlaceholder: '방 수',
    roomSuffix: '실',
    completionYear: '완공 연도',
    completionYearPlaceholder: '예: 2020',
    completionMonth: '완공 월',

    bottomHint: '💡 등록 불필요 · 3분 생성 · 첫 체험 무료',
    mobileUsers: '12만+ 사용자',
    mobileAccuracy: '98% 정확',
  },
  ms: {
    yearPlaceholder: 'Tahun',
    monthPlaceholder: 'Bulan',
    dayPlaceholder: 'Hari',
    yearSuffix: '',
    monthSuffix: '',
    daySuffix: '',
    lunarNote:
      'Tarikh lunar akan ditukar secara automatik kepada Gregorian untuk pengiraan',

    addFengshuiInfo: 'Tambah Maklumat Feng Shui (Pilihan)',
    houseDirection: 'Arah Rumah',
    selectDirection: 'Pilih Arah',
    directionNorth: 'Utara',
    directionSouth: 'Selatan',
    directionEast: 'Timur',
    directionWest: 'Barat',
    directionNortheast: 'Timur Laut',
    directionNorthwest: 'Barat Laut',
    directionSoutheast: 'Tenggara',
    directionSouthwest: 'Barat Daya',
    roomCountLabel: 'Bilangan Bilik',
    roomCountPlaceholder: 'Bilik',
    roomSuffix: ' bilik',
    completionYear: 'Tahun Siap',
    completionYearPlaceholder: 'cth: 2020',
    completionMonth: 'Bulan Siap',

    bottomHint: '💡 Tanpa Pendaftaran · 3 Minit · Percubaan Pertama Percuma',
    mobileUsers: '120K+ Pengguna',
    mobileAccuracy: '98% Tepat',
  },
};

function addFormCompleteTranslations() {
  console.log('🚀 添加表单区域完整翻译键\n');

  let successCount = 0;
  let failCount = 0;

  for (const locale of locales) {
    const filePath = path.join(messagesDir, `${locale}.json`);

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);

      if (!('form' in data)) {
        data.form = {};
      }

      let addedCount = 0;
      for (const [key, value] of Object.entries(
        formCompleteTranslations[locale]
      )) {
        if (!(key in data.form)) {
          data.form[key] = value;
          addedCount++;
        }
      }

      if (addedCount === 0) {
        console.log(`✓ ${locale}: 所有表单翻译键已存在`);
        successCount++;
        continue;
      }

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

      console.log(`✅ ${locale}: 成功添加 ${addedCount} 个表单翻译键`);
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
    console.log('\n🎉 所有表单翻译键已添加！');
    console.log('现在将开始替换组件中的硬编码文本...');
  }
}

addFormCompleteTranslations();
