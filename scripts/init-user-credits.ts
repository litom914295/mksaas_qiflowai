/**
 * 用户积分初始化脚本
 * 为所有没有积分记录的用户创建初始积分
 */

import { eq, notInArray } from 'drizzle-orm';
import { getDb } from '../src/db';
import { user, userCredit } from '../src/db/schema';

const INITIAL_CREDITS = 100; // 初始积分数量

async function initializeUserCredits() {
  console.log('========================================');
  console.log('用户积分初始化');
  console.log('========================================\n');

  try {
    const db = await getDb();
    console.log('✅ 数据库连接成功\n');

    // 1. 获取所有用户
    console.log('步骤 1: 获取所有用户...');
    const allUsers = await db
      .select({ id: user.id, email: user.email })
      .from(user);
    console.log(`找到 ${allUsers.length} 个用户\n`);

    if (allUsers.length === 0) {
      console.log('没有用户需要初始化，退出');
      return;
    }

    // 2. 获取已有积分记录的用户
    console.log('步骤 2: 检查现有积分记录...');
    const existingCredits = await db
      .select({ userId: userCredit.userId })
      .from(userCredit);
    const existingUserIds = new Set(existingCredits.map((c) => c.userId));
    console.log(`已有积分记录的用户: ${existingUserIds.size} 个\n`);

    // 3. 找出需要初始化的用户
    const usersToInit = allUsers.filter((u) => !existingUserIds.has(u.id));
    console.log(`需要初始化的用户: ${usersToInit.length} 个\n`);

    if (usersToInit.length === 0) {
      console.log('所有用户已有积分记录，无需初始化');
      return;
    }

    // 4. 批量创建积分记录
    console.log('步骤 3: 为用户创建积分记录...');
    let successCount = 0;
    let failCount = 0;

    for (const u of usersToInit) {
      try {
        await db.insert(userCredit).values({
          id: `ucr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: u.id,
          currentCredits: INITIAL_CREDITS,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log(`✅ 为用户 ${u.email} 初始化 ${INITIAL_CREDITS} 积分`);
        successCount++;
      } catch (error) {
        console.error(`❌ 为用户 ${u.email} 初始化失败:`, error);
        failCount++;
      }
    }

    // 5. 汇总报告
    console.log('\n========================================');
    console.log('初始化完成:');
    console.log('========================================');
    console.log(`✅ 成功: ${successCount} 个用户`);
    if (failCount > 0) {
      console.log(`❌ 失败: ${failCount} 个用户`);
    }
    console.log(`💰 每个用户获得: ${INITIAL_CREDITS} 积分`);
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    if (error instanceof Error) {
      console.error('错误详情:', error.message);
      console.error('错误堆栈:', error.stack);
    }
    throw error;
  }
}

// 运行初始化
initializeUserCredits()
  .then(() => {
    console.log('\n初始化完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('初始化异常:', error);
    process.exit(1);
  });
