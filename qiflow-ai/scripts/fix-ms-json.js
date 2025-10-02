import fs from 'fs';

// 读取英文文件作为模板
const enContent = fs.readFileSync('src/locales/en.json', 'utf8');
const enData = JSON.parse(enContent);

// 读取中文文件作为参考
const zhContent = fs.readFileSync('src/locales/zh-CN.json', 'utf8');
const zhData = JSON.parse(zhContent);

// 读取当前的 ms 文件
const msContent = fs.readFileSync('src/locales/ms.json', 'utf8');

// 尝试解析，如果失败则使用中文文件作为基础
let msData;
try {
  msData = JSON.parse(msContent);
} catch (error) {
  console.log('当前 ms.json 文件有错误，使用中文文件作为基础...');
  msData = JSON.parse(zhContent);
}

// 确保所有必要的键都存在
function ensureKeysExist(target, source, path = '') {
  for (const key in source) {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
      }
      ensureKeysExist(target[key], source[key], currentPath);
    } else {
      if (!target[key]) {
        target[key] = source[key]; // 使用源文件的值作为默认值
        console.log(`添加缺失的键: ${currentPath}`);
      }
    }
  }
}

// 确保 ms 包含所有必要的键
ensureKeysExist(msData, enData);

// 写入修复后的文件
const fixedContent = JSON.stringify(msData, null, 2);
fs.writeFileSync('src/locales/ms.json', fixedContent, 'utf8');

console.log('✅ ms.json 文件已修复！');
console.log('文件大小:', fixedContent.length, '字符');

// 验证修复结果
try {
  const parsed = JSON.parse(fixedContent);
  console.log('✅ JSON 格式验证通过！');
  console.log('顶级键数量:', Object.keys(parsed).length);
} catch (error) {
  console.log('❌ 修复后仍有错误:', error.message);
}
