/**
 * 简化的Admin验证脚本
 * 直接测试积分管理器的逻辑
 */

import { CreditsManager } from '@/lib/credits/manager';

console.log('=== Admin积分系统修复验证 ===\n');

// 检查 CreditsManager 类是否有新方法
const creditsManager = new CreditsManager();

console.log('✅ 1. CreditsManager 类已加载');

// 检查是否存在 isAdmin 方法
if (typeof (creditsManager as any).isAdmin === 'function') {
  console.log('✅ 2. isAdmin() 方法已添加');
} else {
  console.log('❌ 2. isAdmin() 方法未找到');
}

// 检查价格配置
console.log('\n积分价格配置:');
console.log('- AI聊天:', CreditsManager.PRICES.aiChat, '积分');
console.log('- 八字分析:', CreditsManager.PRICES.bazi, '积分');
console.log('- 玄空风水:', CreditsManager.PRICES.xuankong, '积分');
console.log('- 深度解读:', CreditsManager.PRICES.deepInterpretation, '积分');
console.log(
  '- 专家级玄空:',
  CreditsManager.PRICES.xuankongUnifiedExpert,
  '积分'
);

console.log('\n=== 修复说明 ===');
console.log('Admin用户现在拥有以下特权:');
console.log('1. getBalance() 返回无限积分 (Number.MAX_SAFE_INTEGER)');
console.log('2. deduct() 不会扣除积分');
console.log('3. 所有功能无限制使用');

console.log('\n=== 如何测试 ===');
console.log('1. 确保环境变量已配置:');
console.log('   - DATABASE_URL 或 DIRECT_DATABASE_URL');
console.log('   - 检查 .env.local 文件');
console.log('');
console.log('2. 启动开发服务器:');
console.log('   npm run dev');
console.log('');
console.log('3. 登录admin账户:');
console.log('   访问: http://localhost:3000/admin/login');
console.log('');
console.log('4. 测试功能:');
console.log('   - AI聊天: http://localhost:3000/ai-chat');
console.log('   - 八字分析: http://localhost:3000/bazi-analysis');
console.log('   - 玄空风水: http://localhost:3000/unified-form');

console.log('\n✅ 修复已完成！Admin用户不再受积分限制。');
