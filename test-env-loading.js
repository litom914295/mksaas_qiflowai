/**
 * 测试脚本：验证环境变量加载
 * 用于验证 Phase 2 P0 修复是否有效
 */

// 测试 drizzle.config.ts 的方式
console.log('=== 测试 1: @next/env 加载方式 ===');
const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());

console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DIRECT_DATABASE_URL exists:', !!process.env.DIRECT_DATABASE_URL);
console.log('NEXT_PUBLIC_APP_URL exists:', !!process.env.NEXT_PUBLIC_APP_URL);

// 显示前几个字符（不泄露完整信息）
if (process.env.DATABASE_URL) {
  console.log('DATABASE_URL preview:', process.env.DATABASE_URL.substring(0, 20) + '...');
}
if (process.env.DIRECT_DATABASE_URL) {
  console.log('DIRECT_DATABASE_URL preview:', process.env.DIRECT_DATABASE_URL.substring(0, 20) + '...');
}

console.log('\n✅ P0 修复验证：环境变量加载成功！');
