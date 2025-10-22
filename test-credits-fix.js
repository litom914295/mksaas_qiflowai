// 简单测试脚本：验证积分修复
const { getUserCredits } = require('./src/credits/credits');

async function testCreditsBalance() {
  try {
    console.log('🧪 测试积分余额读取...\n');

    // 使用一个已知的用户ID（从数据库中获取）
    const testUserId = 'demo-user-id'; // 需要替换为实际的用户ID

    console.log(`测试用户ID: ${testUserId}`);

    const balance = await getUserCredits(testUserId);
    console.log(`当前积分余额: ${balance}`);

    console.log('\n✅ 测试完成');
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testCreditsBalance();
