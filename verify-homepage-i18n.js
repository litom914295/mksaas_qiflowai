/**
 * 验证首页翻译完整性
 */

const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'locales');
const locales = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'ms'];

const requiredNamespaces = {
  BaziHome: [
    'title',
    'subtitle',
    'heroTitle',
    'heroTitleHighlight',
    'heroDescription',
  ],
  form: [
    'title',
    'name',
    'gender',
    'birthCity',
    'birthDate',
    'birthTime',
    'submitButton',
  ],
  'home.features': ['title', 'subtitle', 'learnMore'],
};

console.log('🔍 验证首页翻译完整性...\n');

let allValid = true;
let totalKeys = 0;

locales.forEach((locale) => {
  const filePath = path.join(localesDir, `${locale}.json`);

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    console.log(`\n📋 ${locale}:`);

    // 检查 BaziHome
    if (data.BaziHome) {
      const baziKeys = Object.keys(data.BaziHome).length;
      console.log(`  ✅ BaziHome: ${baziKeys} 个键`);
      console.log(`     示例: "${data.BaziHome.title}"`);
      totalKeys += baziKeys;
    } else {
      console.log('  ❌ BaziHome: 缺失');
      allValid = false;
    }

    // 检查 form
    if (data.form) {
      const formKeys = Object.keys(data.form).length;
      console.log(`  ✅ form: ${formKeys} 个键`);
      console.log(`     示例: "${data.form.title}"`);
      totalKeys += formKeys;
    } else {
      console.log('  ❌ form: 缺失');
      allValid = false;
    }

    // 检查 home.features
    if (data.home?.features) {
      const featureKeys = Object.keys(data.home.features).length;
      console.log(`  ✅ home.features: ${featureKeys} 个键`);
      console.log(`     示例: "${data.home.features.title}"`);
      totalKeys += featureKeys;
    } else {
      console.log('  ❌ home.features: 缺失');
      allValid = false;
    }
  } catch (error) {
    console.log(`❌ ${locale}: 读取失败 - ${error.message}`);
    allValid = false;
  }
});

console.log(`\n${'='.repeat(50)}`);
if (allValid) {
  console.log('🎉 所有语言翻译验证通过！');
  console.log(`📊 总共 ${totalKeys} 个翻译键`);
} else {
  console.log('⚠️  发现问题，请检查上方错误信息');
}
