// 测试 Next.js 构建
const { exec } = require('child_process');

console.log('开始测试构建...');

exec('npm run build', (error, stdout, stderr) => {
  if (error) {
    console.error('构建失败:');
    console.error(stderr);
    
    // 提取关键错误信息
    const lines = stderr.split('\n');
    lines.forEach(line => {
      if (line.includes('Error') || line.includes('Unexpected')) {
        console.log('>>> ', line);
      }
    });
  } else {
    console.log('构建成功!');
  }
});