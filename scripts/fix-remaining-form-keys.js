/**
 * 添加缺失的10个 form 翻译键
 */

const fs = require('fs');
const path = require('path');

const locales = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'ms'];
const messagesDir = path.join(__dirname, '..', 'messages');

// 缺失的翻译键
const additionalFormKeys = {
  'zh-CN': {
    birthCity: '出生城市',
    birthCityPlaceholder: '请输入出生城市（用于时区计算）',
    solarTime: '太阳时',
    timeMorning: '上午',
    timeMorningTooltip: '上午时段（06:00-12:00）',
    timeAfternoon: '下午',
    timeAfternoonTooltip: '下午时段（12:00-18:00）',
    timeEvening: '晚上',
    timeEveningTooltip: '晚上时段（18:00-00:00）',
    submitButton: '开始分析',
  },
  'zh-TW': {
    birthCity: '出生城市',
    birthCityPlaceholder: '請輸入出生城市（用於時區計算）',
    solarTime: '太陽時',
    timeMorning: '上午',
    timeMorningTooltip: '上午時段（06:00-12:00）',
    timeAfternoon: '下午',
    timeAfternoonTooltip: '下午時段（12:00-18:00）',
    timeEvening: '晚上',
    timeEveningTooltip: '晚上時段（18:00-00:00）',
    submitButton: '開始分析',
  },
  en: {
    birthCity: 'Birth City',
    birthCityPlaceholder: 'Enter birth city (for timezone calculation)',
    solarTime: 'Solar Time',
    timeMorning: 'Morning',
    timeMorningTooltip: 'Morning period (06:00-12:00)',
    timeAfternoon: 'Afternoon',
    timeAfternoonTooltip: 'Afternoon period (12:00-18:00)',
    timeEvening: 'Evening',
    timeEveningTooltip: 'Evening period (18:00-00:00)',
    submitButton: 'Start Analysis',
  },
  ja: {
    birthCity: '出生都市',
    birthCityPlaceholder: '出生都市を入力（タイムゾーン計算用）',
    solarTime: '太陽時',
    timeMorning: '午前',
    timeMorningTooltip: '午前時間帯（06:00-12:00）',
    timeAfternoon: '午後',
    timeAfternoonTooltip: '午後時間帯（12:00-18:00）',
    timeEvening: '夜',
    timeEveningTooltip: '夜間時間帯（18:00-00:00）',
    submitButton: '分析を開始',
  },
  ko: {
    birthCity: '출생 도시',
    birthCityPlaceholder: '출생 도시 입력（시간대 계산용）',
    solarTime: '태양시',
    timeMorning: '오전',
    timeMorningTooltip: '오전 시간대（06:00-12:00）',
    timeAfternoon: '오후',
    timeAfternoonTooltip: '오후 시간대（12:00-18:00）',
    timeEvening: '저녁',
    timeEveningTooltip: '저녁 시간대（18:00-00:00）',
    submitButton: '분석 시작',
  },
  ms: {
    birthCity: 'Bandar Lahir',
    birthCityPlaceholder: 'Masukkan bandar lahir (untuk pengiraan zon waktu)',
    solarTime: 'Masa Solar',
    timeMorning: 'Pagi',
    timeMorningTooltip: 'Tempoh pagi (06:00-12:00)',
    timeAfternoon: 'Petang',
    timeAfternoonTooltip: 'Tempoh petang (12:00-18:00)',
    timeEvening: 'Malam',
    timeEveningTooltip: 'Tempoh malam (18:00-00:00)',
    submitButton: 'Mula Analisis',
  },
};

function addMissingFormKeys() {
  console.log('🚀 添加缺失的 form 翻译键\n');

  let successCount = 0;
  let failCount = 0;

  for (const locale of locales) {
    const filePath = path.join(messagesDir, `${locale}.json`);

    try {
      // 读取现有文件
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);

      // 检查 form 命名空间是否存在
      if (!('form' in data)) {
        console.error(`❌ ${locale}: form 命名空间不存在`);
        failCount++;
        continue;
      }

      // 添加缺失的键
      let addedCount = 0;
      for (const [key, value] of Object.entries(additionalFormKeys[locale])) {
        if (!(key in data.form)) {
          data.form[key] = value;
          addedCount++;
        }
      }

      if (addedCount === 0) {
        console.log(`✓ ${locale}: 所有键已存在，无需更新`);
        successCount++;
        continue;
      }

      // 写回文件
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

      console.log(`✅ ${locale}: 成功添加 ${addedCount} 个翻译键`);
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
    console.log('\n🎉 所有缺失的 form 翻译键已添加！');
    console.log('\n📝 已添加的键：');
    console.log('  - birthCity');
    console.log('  - birthCityPlaceholder');
    console.log('  - solarTime');
    console.log('  - timeMorning');
    console.log('  - timeMorningTooltip');
    console.log('  - timeAfternoon');
    console.log('  - timeAfternoonTooltip');
    console.log('  - timeEvening');
    console.log('  - timeEveningTooltip');
    console.log('  - submitButton');
    console.log('\n📝 后续步骤：');
    console.log('浏览器会自动热更新，无需重启服务器');
    console.log('如果没有自动更新，请刷新浏览器 (Ctrl+Shift+R)');
  }
}

addMissingFormKeys();
