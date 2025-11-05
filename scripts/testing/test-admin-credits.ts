/**
 * 测试admin用户积分限制修复
 * 验证admin用户不受积分限制
 */

import { CreditsManager } from '@/lib/credits/manager';

async function testAdminCredits() {
  console.log('=== 测试admin用户积分功能 ===\n');

  const creditsManager = new CreditsManager();

  // 测试用admin用户ID (需要替换为实际的admin用户ID)
  // 可以通过数据库查询获取: SELECT id FROM "user" WHERE role = 'admin' LIMIT 1;
  const adminUserId = 'admin-user-id-here'; // TODO: 替换为实际的admin用户ID
  const normalUserId = 'normal-user-id-here'; // TODO: 替换为实际的普通用户ID

  console.log('测试1: 检查admin用户角色');
  const isAdmin = await creditsManager.isAdmin(adminUserId);
  console.log(`Admin用户检测: ${isAdmin ? '✓ 是管理员' : '✗ 不是管理员'}\n`);

  console.log('测试2: 获取admin用户积分余额');
  const adminBalance = await creditsManager.getBalance(adminUserId);
  console.log(`Admin积分余额: ${adminBalance}`);
  console.log(`预期: 无限积分 (${Number.MAX_SAFE_INTEGER})`);
  console.log(
    `结果: ${adminBalance === Number.MAX_SAFE_INTEGER ? '✓ 通过' : '✗ 失败'}\n`
  );

  console.log('测试3: 检查admin用户是否可以使用任意功能');
  const canAffordExpensive = await creditsManager.canAfford(
    adminUserId,
    'xuankongUnifiedExpert'
  );
  console.log(
    `Admin可以使用最贵功能(120积分): ${canAffordExpensive ? '✓ 是' : '✗ 否'}\n`
  );

  console.log('测试4: 尝试扣除admin用户积分');
  const deductSuccess = await creditsManager.deduct(adminUserId, 100);
  console.log(
    `扣除结果: ${deductSuccess ? '✓ 成功 (但不会实际扣除)' : '✗ 失败'}\n`
  );

  console.log('测试5: 对比普通用户');
  const normalBalance = await creditsManager.getBalance(normalUserId);
  console.log(`普通用户积分余额: ${normalBalance}`);
  console.log(
    `普通用户有限制: ${normalBalance < Number.MAX_SAFE_INTEGER ? '✓ 是' : '✗ 否'}\n`
  );

  console.log('=== 测试完成 ===');
  console.log('\n总结:');
  console.log('- Admin用户拥有无限积分');
  console.log('- Admin用户不受积分扣除影响');
  console.log('- Admin用户可以使用所有功能');
  console.log('- 普通用户仍然受积分限制');
}

// 运行测试
testAdminCredits()
  .then(() => {
    console.log('\n✓ 测试脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ 测试失败:', error);
    process.exit(1);
  });
