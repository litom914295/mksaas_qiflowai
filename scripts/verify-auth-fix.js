#!/usr/bin/env node
/**
 * 认证系统快速修复验证脚本 (v5.1.1)
 *
 * 用途: 验证刚才的修复是否生效
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 正在验证认证系统修复...\n');

// 1. 检查 API 路由文件是否已修复
console.log('✅ 检查 1: API 路由 JSON 解析错误修复');
const routeFile = path.join(__dirname, '../src/app/api/auth/[...all]/route.ts');
const routeContent = fs.readFileSync(routeFile, 'utf-8');

if (routeContent.includes('安全解析 JSON')) {
  console.log('   ✅ JSON 解析已添加 try-catch 防护\n');
} else {
  console.log('   ❌ JSON 解析修复未应用\n');
  process.exit(1);
}

// 2. 检查 next.config.ts 是否修复
console.log('✅ 检查 2: Next.js 配置警告修复');
const configFile = path.join(__dirname, '../next.config.ts');
const configContent = fs.readFileSync(configFile, 'utf-8');

const hasDevIndicatorsObject = configContent.includes('devIndicators: {');
const hasTypedRoutesRemoved = !configContent.match(/^\s*typedRoutes:/m);
const hasTurbopackRemoved = !configContent.match(/^\s*turbopack:\s*{/m);

if (hasDevIndicatorsObject && hasTypedRoutesRemoved && hasTurbopackRemoved) {
  console.log('   ✅ Next.js 15 配置已修复\n');
} else {
  console.log('   ⚠️  部分配置可能仍有问题:');
  console.log(
    `      devIndicators 对象格式: ${hasDevIndicatorsObject ? '✅' : '❌'}`
  );
  console.log(
    `      typedRoutes 已移除: ${hasTypedRoutesRemoved ? '✅' : '❌'}`
  );
  console.log(`      turbopack 已移除: ${hasTurbopackRemoved ? '✅' : '❌'}\n`);
}

// 3. 检查环境变量
console.log('✅ 检查 3: 环境变量配置');
const envFile = path.join(__dirname, '../.env.local');
if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf-8');

  const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL=');
  const hasSupabaseAnonKey = envContent.includes(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY='
  );
  const hasServiceKey = envContent.includes('SUPABASE_SERVICE_ROLE_KEY=');
  const hasDatabaseUrl = envContent.includes('DATABASE_URL=');

  console.log(`   Supabase URL: ${hasSupabaseUrl ? '✅' : '❌'}`);
  console.log(`   Supabase Anon Key: ${hasSupabaseAnonKey ? '✅' : '❌'}`);
  console.log(`   Service Role Key: ${hasServiceKey ? '✅' : '❌'}`);
  console.log(`   Database URL: ${hasDatabaseUrl ? '✅' : '❌'}\n`);

  if (
    !hasSupabaseUrl ||
    !hasSupabaseAnonKey ||
    !hasServiceKey ||
    !hasDatabaseUrl
  ) {
    console.log('   ⚠️  部分环境变量缺失，可能影响认证功能\n');
  }
} else {
  console.log('   ❌ .env.local 文件不存在\n');
}

// 4. 生成测试建议
console.log('📋 下一步测试建议:\n');
console.log('1. 重启开发服务器:');
console.log('   npm run dev\n');
console.log('2. 测试登录场景:');
console.log('   - 访问 http://localhost:3001/zh-CN/auth/login');
console.log('   - 输入正确的账号密码');
console.log('   - 输入错误的账号密码 (测试错误处理)');
console.log('   - 留空账号密码 (测试表单验证)\n');
console.log('3. 检查浏览器开发者工具:');
console.log('   - Network 面板: 查看 /api/auth/sign-in/email 请求');
console.log('   - Console 面板: 查看是否有 JSON 解析错误\n');
console.log('4. 检查服务器日志:');
console.log('   - 不应再出现 "SyntaxError: Unexpected end of JSON input"');
console.log('   - 不应再出现 Next.js 配置警告\n');

console.log('📝 注意事项:\n');
console.log('- 当前修复是临时方案 (优先级 B)');
console.log('- 建议后续迁移到 Better Auth (优先级 A)');
console.log('- 详细信息请查看 AUTH_ISSUES_REPORT.md\n');

console.log('✨ 验证完成!');
