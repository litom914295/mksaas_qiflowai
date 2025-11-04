/**
 * 验证所有语言文件的 form 翻译
 */

const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'locales');
const locales = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'ms'];

console.log('🔍 验证表单翻译...\n');

let allValid = true;

locales.forEach((locale) => {
  const filePath = path.join(localesDir, `${locale}.json`);

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    if (!data.form) {
      console.log(`❌ ${locale}: 缺少 form 对象`);
      allValid = false;
      return;
    }

    const formKeys = Object.keys(data.form);
    console.log(`✅ ${locale}: ${formKeys.length} 个翻译键`);
    console.log(`   标题示例: "${data.form.title}"`);
    console.log(`   提交按钮: "${data.form.submitButton}"`);
    console.log('');
  } catch (error) {
    console.log(`❌ ${locale}: 读取失败 - ${error.message}`);
    allValid = false;
  }
});

if (allValid) {
  console.log('🎉 所有语言翻译验证通过！');
} else {
  console.log('⚠️  发现问题，请检查上方错误信息');
}
