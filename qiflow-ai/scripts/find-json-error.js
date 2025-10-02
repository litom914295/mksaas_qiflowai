import fs from 'fs';

const content = fs.readFileSync('src/locales/zh-TW.json', 'utf8');
const lines = content.split('\n');

console.log('检查第 810-820 行:');
for (let i = 810; i <= 820; i++) {
  if (i < lines.length) {
    console.log(`第 ${i + 1} 行:`, JSON.stringify(lines[i]));
  }
}

// 尝试找到错误位置
try {
  JSON.parse(content);
} catch (error) {
  console.log('\n错误信息:', error.message);
  
  if (error.message.includes('position')) {
    const match = error.message.match(/position (\d+)/);
    if (match) {
      const position = parseInt(match[1]);
      const charAtPosition = content[position];
      console.log(`位置 ${position} 的字符:`, JSON.stringify(charAtPosition));
      console.log(`字符代码:`, charAtPosition.charCodeAt(0));
    }
  }
}
