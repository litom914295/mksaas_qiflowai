/**
 * 数据库连接和积分系统测试脚本
 * 用于诊断个人后台积分显示问题
 */

import { eq } from 'drizzle-orm';
import { getDb } from '../src/db';
import { creditTransaction, user, userCredit } from '../src/db/schema';

async function testDatabaseConnection() {
  console.log('========================================');
  console.log('开始测试数据库连接和积分系统');
  console.log('========================================\n');

  try {
    // 1. 测试数据库连接
    console.log('步骤 1: 测试数据库连接...');
    const db = await getDb();
    console.log('✅ 数据库连接成功\n');

    // 2. 检查用户表
    console.log('步骤 2: 检查用户表...');
    const users = await db.select().from(user).limit(5);
    console.log(`✅ 找到 ${users.length} 个用户`);
    if (users.length > 0) {
      console.log('用户示例:', users[0].email);
    }
    console.log('');

    // 3. 检查积分表
    console.log('步骤 3: 检查积分表...');
    const credits = await db.select().from(userCredit).limit(5);
    console.log(`✅ 找到 ${credits.length} 条积分记录`);
    if (credits.length > 0) {
      console.log('积分示例:', {
        userId: credits[0].userId,
        credits: credits[0].currentCredits,
      });
    } else {
      console.warn('⚠️  积分表为空，可能需要初始化用户积分');
    }
    console.log('');

    // 4. 检查积分交易记录
    console.log('步骤 4: 检查积分交易记录...');
    const transactions = await db.select().from(creditTransaction).limit(5);
    console.log(`✅ 找到 ${transactions.length} 条交易记录`);
    if (transactions.length > 0) {
      console.log('交易示例:', {
        type: transactions[0].type,
        amount: transactions[0].amount,
        createdAt: transactions[0].createdAt,
      });
    }
    console.log('');

    // 5. 检查用户积分关联
    console.log('步骤 5: 检查用户积分关联...');
    if (users.length > 0) {
      const testUserId = users[0].id;
      const userCredit = await db
        .select()
        .from(userCredit)
        .where(eq(userCredit.userId, testUserId))
        .limit(1);

      if (userCredit.length > 0) {
        console.log(
          `✅ 用户 ${users[0].email} 的积分: ${userCredit[0].currentCredits}`
        );
      } else {
        console.warn(`⚠️  用户 ${users[0].email} 没有积分记录`);
        console.log('建议: 为此用户创建初始积分记录');
      }
    }
    console.log('');

    // 6. 汇总报告
    console.log('========================================');
    console.log('测试汇总:');
    console.log('========================================');
    console.log(`✅ 数据库连接: 正常`);
    console.log(`✅ 用户表: ${users.length} 条记录`);
    console.log(
      `${credits.length > 0 ? '✅' : '⚠️'} 积分表: ${credits.length} 条记录`
    );
    console.log(
      `${transactions.length > 0 ? '✅' : '⚠️'} 交易表: ${transactions.length} 条记录`
    );
    console.log('');

    if (credits.length === 0) {
      console.log('⚠️  问题诊断:');
      console.log('1. 积分表为空，这可能是导致前端不显示积分的原因');
      console.log('2. 建议运行初始化脚本为现有用户创建积分记录');
      console.log('3. 或者在用户注册时自动创建积分记录');
    }
  } catch (error) {
    console.error('❌ 测试失败:', error);
    if (error instanceof Error) {
      console.error('错误详情:', error.message);
      console.error('错误堆栈:', error.stack);
    }

    console.log('\n可能的问题:');
    console.log('1. 数据库连接字符串配置错误');
    console.log('2. 数据库服务未启动');
    console.log('3. 网络连接问题');
    console.log('4. 数据库迁移未执行');
  }
}

// 运行测试
testDatabaseConnection()
  .then(() => {
    console.log('\n测试完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('测试异常:', error);
    process.exit(1);
  });
