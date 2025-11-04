const fs = require('fs');
const path = require('path');

console.log('🔍 诊断 Next.js 配置...\n');

// 检查关键文件
const checks = [
  { path: 'app/[locale]/layout.tsx', desc: 'Layout文件' },
  { path: 'app/[locale]/page.tsx', desc: '首页' },
  { path: 'app/[locale]/(routes)/unified-form/page.tsx', desc: '表单页' },
  { path: 'src/middleware.ts', desc: 'Middleware' },
  { path: 'src/i18n/routing.ts', desc: 'i18n路由配置' },
  { path: 'src/i18n/request.ts', desc: 'i18n请求配置' },
  { path: 'src/config/website.ts', desc: '网站配置' },
  { path: 'messages/zh-CN.json', desc: '中文翻译' },
];

console.log('检查文件存在性：\n');
checks.forEach((check) => {
  const fullPath = path.join(__dirname, '..', check.path);
  const exists = fs.existsSync(fullPath);
  const icon = exists ? '✅' : '❌';
  console.log(`${icon} ${check.desc}: ${check.path}`);

  if (exists && check.path.endsWith('.tsx')) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n').length;
    console.log(`   📄 ${lines} 行代码`);
  }
});

console.log('\n检查目录结构：\n');
try {
  const appDir = path.join(__dirname, '..', 'app');
  const dirs = fs
    .readdirSync(appDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  console.log('📁 app/ 目录下的文件夹:', dirs.join(', '));

  if (dirs.includes('[locale]')) {
    const localeDir = path.join(appDir, '[locale]');
    const localeContents = fs.readdirSync(localeDir);
    console.log('📁 app/[locale]/ 内容:', localeContents.join(', '));
  }
} catch (e) {
  console.error('❌ 读取目录失败:', e.message);
}

console.log('\n检查 package.json dependencies：\n');
try {
  const pkg = require('../package.json');
  const deps = ['next', 'next-intl', 'react', 'react-dom'];

  deps.forEach((dep) => {
    const version = pkg.dependencies?.[dep] || pkg.devDependencies?.[dep];
    const icon = version ? '✅' : '❌';
    console.log(`${icon} ${dep}: ${version || '未安装'}`);
  });
} catch (e) {
  console.error('❌ 读取 package.json 失败:', e.message);
}

console.log('\n📋 诊断完成！');
console.log('\n下一步：');
console.log('1. 确保 npm run dev 正在运行');
console.log('2. 访问 http://localhost:3000/zh-CN/test-simple');
console.log('3. 查看终端输出的middleware日志');
console.log('4. 检查浏览器控制台是否有错误\n');
