/**
 * 完整验证并修复所有翻译文件
 * 运行: node fix-all-translations.js
 */

const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'locales');
const locales = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'ms'];

console.log('🔍 检查所有翻译文件...\n');

let hasErrors = false;

locales.forEach((locale) => {
  const filePath = path.join(localesDir, `${locale}.json`);

  try {
    // 读取文件，移除可能的BOM
    let content = fs.readFileSync(filePath, 'utf-8');
    content = content.replace(/^\uFEFF/, '');

    // 尝试解析JSON
    const json = JSON.parse(content);

    // 检查必需的命名空间
    const hasBaziHome = !!json.BaziHome;
    const hasForm = !!json.form;
    const hasHomeFeatures = !!json.home?.features;

    if (!hasBaziHome || !hasForm || !hasHomeFeatures) {
      console.log(`❌ ${locale}: 缺少必需的命名空间`);
      if (!hasBaziHome) console.log('   - 缺少 BaziHome');
      if (!hasForm) console.log('   - 缺少 form');
      if (!hasHomeFeatures) console.log('   - 缺少 home.features');
      hasErrors = true;
    } else {
      console.log(`✅ ${locale}:`);
      console.log(`   - BaziHome: ${Object.keys(json.BaziHome).length} 个键`);
      console.log(`   - form: ${Object.keys(json.form).length} 个键`);
      console.log(
        `   - home.features: ${Object.keys(json.home.features).length} 个键`
      );

      // 显示示例翻译
      console.log(`   示例: "${json.form.title}"`);
    }

    // 如果文件有BOM或需要重新格式化，重新保存
    if (content.startsWith('\uFEFF')) {
      fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf-8');
      console.log('   ⚠️  已移除BOM并重新格式化');
    }
  } catch (error) {
    console.log(`❌ ${locale}: 文件解析失败`);
    console.log(`   错误: ${error.message}`);
    hasErrors = true;
  }

  console.log('');
});

if (hasErrors) {
  console.log('❌ 发现问题！请运行修复脚本:');
  console.log('   node update-homepage-i18n.js');
  process.exit(1);
} else {
  console.log('🎉 所有翻译文件验证通过！');
  console.log('\n📝 下一步:');
  console.log('1. 停止开发服务器 (Ctrl+C)');
  console.log('2. 清除缓存: rmdir /s /q .next');
  console.log('3. 重启: npm run dev');
}
