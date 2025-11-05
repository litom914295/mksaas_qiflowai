/**
 * 快速检查admin用户积分状态
 * 显示所有admin用户及其积分信息
 */

import { getDb } from '@/db';
import { user, userCredit } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function checkAdminUsers() {
  console.log('=== 检查Admin用户积分状态 ===\n');

  try {
    const db = await getDb();

    // 查找所有admin用户
    const adminUsers = await db
      .select({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      })
      .from(user)
      .where(eq(user.role, 'admin'));

    if (adminUsers.length === 0) {
      console.log('⚠️  未找到admin用户');
      console.log('提示: 使用以下命令创建admin用户:');
      console.log('npm run tsx scripts/fix-admin-password.ts\n');
      return;
    }

    console.log(`找到 ${adminUsers.length} 个admin用户:\n`);

    for (const admin of adminUsers) {
      console.log(`\n📋 用户信息:`);
      console.log(`   ID: ${admin.id}`);
      console.log(`   邮箱: ${admin.email}`);
      console.log(`   名称: ${admin.name || '(未设置)'}`);
      console.log(`   角色: ${admin.role}`);

      // 查询积分信息
      const credits = await db
        .select({
          currentCredits: userCredit.currentCredits,
        })
        .from(userCredit)
        .where(eq(userCredit.userId, admin.id))
        .limit(1);

      if (credits.length > 0) {
        console.log(`   当前积分: ${credits[0].currentCredits}`);
      } else {
        console.log(`   当前积分: (未初始化)`);
      }

      console.log(`   实际使用: 无限积分 (${Number.MAX_SAFE_INTEGER})`);
      console.log('   ✅ Admin用户不受积分限制');
    }

    console.log('\n=== 测试建议 ===');
    console.log('1. 使用以下命令登录admin账户:');
    console.log('   前端路径: /admin/login');
    console.log('   邮箱: ' + adminUsers[0].email);
    console.log('\n2. 测试以下功能:');
    console.log('   - AI聊天（/ai-chat）');
    console.log('   - 八字分析（/bazi-analysis）');
    console.log('   - 玄空风水（/unified-form）');
    console.log('\n3. 验证结果:');
    console.log('   - 所有功能应该可以正常使用');
    console.log('   - 不应出现"积分不足"提示');
  } catch (error) {
    console.error('❌ 检查失败:', error);
    if (error instanceof Error) {
      console.error('错误详情:', error.message);
    }
  }
}

// 运行检查
checkAdminUsers()
  .then(() => {
    console.log('\n✓ 检查完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ 执行失败:', error);
    process.exit(1);
  });
