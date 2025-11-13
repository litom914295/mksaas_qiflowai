/**
 * 验证admin用户权限配置
 * 检查数据库中admin用户的role字段和积分管理器功能
 */

import { getDb } from '@/db';
import { user, userCredit } from '@/db/schema';
import { CreditsManager } from '@/lib/credits/manager';
import { eq } from 'drizzle-orm';

async function verifyAdminPrivileges() {
  console.log('\n=== 开始验证Admin用户权限 ===\n');

  try {
    const db = await getDb();

    // 1. 查找所有admin用户
    console.log('1. 查找admin用户...');
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
      console.error('❌ 未找到任何admin用户！');
      console.log('\n请确保数据库中存在role为"admin"的用户');
      console.log('可以运行以下命令创建admin用户:');
      console.log('  npm run create-admin');
      return;
    }

    console.log(`✅ 找到 ${adminUsers.length} 个admin用户:\n`);
    adminUsers.forEach((u, i) => {
      console.log(`   ${i + 1}. ${u.email} (${u.name || 'N/A'})`);
      console.log(`      - ID: ${u.id}`);
      console.log(`      - Role: ${u.role}\n`);
    });

    // 2. 测试每个admin用户的积分权限
    console.log('2. 测试积分管理器功能...\n');
    const creditsManager = new CreditsManager();

    for (const adminUser of adminUsers) {
      console.log(`测试用户: ${adminUser.email}`);

      // 2.1 检查是否被识别为管理员
      const isAdminResult = await creditsManager.isAdmin(adminUser.id);
      console.log(`   isAdmin检查: ${isAdminResult ? '✅ 是' : '❌ 否'}`);

      if (!isAdminResult) {
        console.error(
          `   ⚠️ 警告: 用户role为"${adminUser.role}"但未被识别为管理员!`
        );
      }

      // 2.2 检查积分余额（应该是无限）
      const balance = await creditsManager.getBalance(adminUser.id);
      const isUnlimited = balance === Number.MAX_SAFE_INTEGER;
      console.log(`   积分余额: ${isUnlimited ? '∞ (无限)' : balance}`);

      if (!isUnlimited) {
        console.error('   ⚠️ 警告: 管理员积分应该是无限的!');
      }

      // 2.3 测试积分扣除（应该返回成功但不扣除）
      const deductResult = await creditsManager.deduct(adminUser.id, 100);
      console.log(`   积分扣除测试: ${deductResult ? '✅ 通过' : '❌ 失败'}`);

      // 2.4 再次检查余额（应该没变）
      const balanceAfter = await creditsManager.getBalance(adminUser.id);
      const stillUnlimited = balanceAfter === Number.MAX_SAFE_INTEGER;
      console.log(
        `   扣除后余额: ${stillUnlimited ? '∞ (无限)' : balanceAfter}`
      );

      if (!stillUnlimited) {
        console.error('   ⚠️ 错误: 管理员积分被扣除了!');
      }

      // 2.5 检查可用功能
      const availableFeatures = await creditsManager.getAvailableFeatures(
        adminUser.id
      );
      console.log(
        `   可用功能数: ${availableFeatures.length}/${Object.keys(CreditsManager.PRICES).length}`
      );

      console.log('');
    }

    // 3. 检查数据库中的积分记录
    console.log('3. 检查积分记录表...\n');
    for (const adminUser of adminUsers) {
      const credits = await db
        .select()
        .from(userCredit)
        .where(eq(userCredit.userId, adminUser.id))
        .limit(1);

      if (credits.length > 0) {
        console.log(`   ${adminUser.email}:`);
        console.log(`      - 当前积分: ${credits[0].currentCredits}`);
        console.log(`      - 创建时间: ${credits[0].createdAt}`);
        console.log(`      - 更新时间: ${credits[0].updatedAt}\n`);
      } else {
        console.log(`   ${adminUser.email}: 无积分记录\n`);
      }
    }

    // 4. 总结
    console.log('\n=== 验证完成 ===\n');

    const allPassed = adminUsers.every(async (u) => {
      const isAdmin = await creditsManager.isAdmin(u.id);
      const balance = await creditsManager.getBalance(u.id);
      return isAdmin && balance === Number.MAX_SAFE_INTEGER;
    });

    if (allPassed) {
      console.log('✅ 所有admin用户权限配置正确！');
    } else {
      console.log('⚠️ 部分admin用户权限配置可能有问题，请查看上方详情');
    }

    console.log('\n提示：');
    console.log('  - Admin用户应该拥有无限积分');
    console.log('  - Admin用户不应该被限流');
    console.log('  - Admin用户的role字段必须是"admin"');
    console.log('\n如果发现问题，可能的原因：');
    console.log('  1. 数据库中用户的role字段不是"admin"');
    console.log('  2. 积分管理器的isAdmin方法有问题');
    console.log('  3. API路由没有使用正确的权限检查');
  } catch (error) {
    console.error('\n❌ 验证过程出错:', error);
    if (error instanceof Error) {
      console.error('错误详情:', error.message);
      console.error('错误堆栈:', error.stack);
    }
  }
}

// 运行验证
verifyAdminPrivileges()
  .then(() => {
    console.log('\n验证脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n脚本执行失败:', error);
    process.exit(1);
  });
