import fs from 'fs';
import path from 'path';

// 翻译文件路径
const localesDir = path.join(__dirname, '../src/locales');
const locales = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'ms'];

// 递归获取对象的所有键路径
function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getAllKeys(obj[key], prefix ? `${prefix}.${key}` : key));
    } else {
      keys.push(prefix ? `${prefix}.${key}` : key);
    }
  }
  return keys;
}

// 检查翻译文件结构
function checkTranslations() {
  console.log('🔍 检查翻译文件结构一致性...\n');
  
  const allKeys = {};
  const missingKeys = {};
  const extraKeys = {};
  
  // 读取所有翻译文件
  for (const locale of locales) {
    const filePath = path.join(localesDir, `${locale}.json`);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ 文件不存在: ${filePath}`);
      continue;
    }
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      const keys = getAllKeys(data);
      allKeys[locale] = keys;
      console.log(`✅ ${locale}: ${keys.length} 个翻译键`);
    } catch (error) {
      console.error(`❌ 解析 ${locale}.json 失败:`, error.message);
    }
  }
  
  // 找出所有唯一的键
  const allUniqueKeys = new Set();
  Object.values(allKeys).forEach(keys => {
    keys.forEach(key => allUniqueKeys.add(key));
  });
  
  console.log(`\n📊 总共发现 ${allUniqueKeys.size} 个唯一翻译键\n`);
  
  // 检查每个语言文件缺失的键
  for (const locale of locales) {
    if (!allKeys[locale]) continue;
    
    const missing = Array.from(allUniqueKeys).filter(key => !allKeys[locale].includes(key));
    const extra = allKeys[locale].filter(key => !allUniqueKeys.has(key));
    
    if (missing.length > 0) {
      missingKeys[locale] = missing;
    }
    if (extra.length > 0) {
      extraKeys[locale] = extra;
    }
  }
  
  // 报告缺失的键
  if (Object.keys(missingKeys).length > 0) {
    console.log('❌ 缺失的翻译键:');
    for (const [locale, keys] of Object.entries(missingKeys)) {
      console.log(`\n  ${locale} (${keys.length} 个):`);
      keys.slice(0, 10).forEach(key => console.log(`    - ${key}`));
      if (keys.length > 10) {
        console.log(`    ... 还有 ${keys.length - 10} 个`);
      }
    }
  }
  
  // 报告多余的键
  if (Object.keys(extraKeys).length > 0) {
    console.log('\n⚠️  多余的翻译键:');
    for (const [locale, keys] of Object.entries(extraKeys)) {
      console.log(`\n  ${locale} (${keys.length} 个):`);
      keys.slice(0, 10).forEach(key => console.log(`    - ${key}`));
      if (keys.length > 10) {
        console.log(`    ... 还有 ${keys.length - 10} 个`);
      }
    }
  }
  
  // 检查特定键的存在性
  console.log('\n🔍 检查关键翻译键:');
  const criticalKeys = [
    'home.title',
    'home.subtitle',
    'home.features.bazi.title',
    'home.features.flyingStar.title',
    'home.features.compass.title',
    'home.features.floorPlan.title',
    'home.features.visualization3d.title',
    'home.features.aiAssistant.title',
    'common.loading',
    'common.error',
    'common.success',
    'common.switchLanguage'
  ];
  
  for (const key of criticalKeys) {
    const missing = [];
    for (const locale of locales) {
      if (allKeys[locale] && !allKeys[locale].includes(key)) {
        missing.push(locale);
      }
    }
    
    if (missing.length > 0) {
      console.log(`❌ ${key}: 缺失于 ${missing.join(', ')}`);
    } else {
      console.log(`✅ ${key}: 所有语言都有`);
    }
  }
  
  // 总结
  const totalMissing = Object.values(missingKeys).reduce((sum, keys) => sum + keys.length, 0);
  const totalExtra = Object.values(extraKeys).reduce((sum, keys) => sum + keys.length, 0);
  
  console.log(`\n📈 总结:`);
  console.log(`  - 总翻译键数: ${allUniqueKeys.size}`);
  console.log(`  - 缺失键数: ${totalMissing}`);
  console.log(`  - 多余键数: ${totalExtra}`);
  
  if (totalMissing === 0 && totalExtra === 0) {
    console.log('\n🎉 所有翻译文件结构一致！');
  } else {
    console.log('\n⚠️  翻译文件结构不一致，需要修复');
  }
}

// 运行检查
checkTranslations();


