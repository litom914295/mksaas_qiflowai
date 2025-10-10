const fs = require('fs');
const path = require('path');

// 读取源文件和目标文件
const locales = ['zh-CN', 'en'];

locales.forEach((locale) => {
  const sourceFile = `./qiflow-ai/src/locales/${locale}.json`;
  const targetFile = `./messages/${locale}.json`;

  // 读取并移除 BOM
  const removeBOM = (str) => str.replace(/^\uFEFF/, '');
  const source = JSON.parse(removeBOM(fs.readFileSync(sourceFile, 'utf8')));
  const target = JSON.parse(removeBOM(fs.readFileSync(targetFile, 'utf8')));

  // 深度合并函数
  function deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (
        source[key] &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key])
      ) {
        result[key] = deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }

  // 合并
  const merged = deepMerge(target, source);

  // 写回文件
  fs.writeFileSync(targetFile, JSON.stringify(merged, null, 2), 'utf8');
  console.log(`✅ Merged ${locale} successfully!`);
});

console.log('✅ All translation files merged successfully!');
