import fs from 'fs';

try {
  const content = fs.readFileSync('src/locales/zh-TW.json', 'utf8');
  console.log('文件大小:', content.length, '字符');
  
  // 尝试解析 JSON
  const parsed = JSON.parse(content);
  console.log('✅ JSON 格式正确！');
  console.log('顶级键数量:', Object.keys(parsed).length);
  
} catch (error) {
  console.log('❌ JSON 错误:', error.message);
  
  // 如果错误包含位置信息，显示该位置附近的内容
  if (error.message.includes('position')) {
    const match = error.message.match(/position (\d+)/);
    if (match) {
      const position = parseInt(match[1]);
      const content = fs.readFileSync('src/locales/zh-TW.json', 'utf8');
      const start = Math.max(0, position - 50);
      const end = Math.min(content.length, position + 50);
      console.log('\n错误位置附近的内容:');
      console.log('位置', position, '附近:');
      console.log(JSON.stringify(content.substring(start, end)));
    }
  }
}