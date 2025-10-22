/**
 * 签到功能测试脚本
 * 用于测试签到API的各个环节
 */

import { eq } from 'drizzle-orm';
import { websiteConfig } from '../src/config/website';
import { getDb } from '../src/db';
import { creditTransaction, user, userCredit } from '../src/db/schema';

async function testSigninFunction() {
  console.log('========================================');
  console.log('签到功能测试');
  console.log('========================================\n');

  try {
    // 1. 测试配置
    console.log('步骤 1: 检查签到配置...');
    console.log('积分系统启用:', websiteConfig.credits?.enableCredits);
    console.log('签到功能启用:', websiteConfig.credits?.dailySignin?.enable);
    console.log('签到奖励积分:', websiteConfig.credits?.dailySignin?.amount);

    if (
      !websiteConfig.credits?.enableCredits ||
      !websiteConfig.credits?.dailySignin?.enable
    ) {
      console.error('❌ 签到功能未启用!');
      return;
    }
    console.log('✅ 签到配置正常\n');

    // 2. 测试数据库连接
    console.log('步骤 2: 测试数据库连接...');
    const db = await getDb();
    console.log('✅ 数据库连接成功\n');

    // 3. 获取测试用户
    console.log('步骤 3: 获取测试用户...');
    const users = await db.select().from(user).limit(1);

    if (users.length === 0) {
      console.error('❌ 没有找到用户,无法测试');
      return;
    }

    const testUser = users[0];
    console.log('测试用户:', {
      id: testUser.id,
      email: testUser.email,
    });
    console.log('');

    // 4. 检查用户积分记录
    console.log('步骤 4: 检查用户积分记录...');
    const credits = await db
      .select()
      .from(userCredit)
      .where(eq(userCredit.userId, testUser.id))
      .limit(1);

    if (credits.length === 0) {
      console.warn('⚠️  用户没有积分记录,尝试创建...');
      try {
        await db.insert(userCredit).values({
          id: `ucr_test_${Date.now()}`,
          userId: testUser.id,
          currentCredits: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log('✅ 积分记录创建成功');
      } catch (error) {
        console.error('❌ 积分记录创建失败:', error);
        return;
      }
    } else {
      console.log('✅ 用户当前积分:', credits[0].currentCredits);
    }
    console.log('');

    // 5. 检查今日签到记录
    console.log('步骤 5: 检查今日签到记录...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const signedToday = await db
      .select()
      .from(creditTransaction)
      .where(eq(creditTransaction.userId, testUser.id))
      .limit(10);

    const todaySignin = signedToday.filter(
      (t) => t.type === 'DAILY_SIGNIN' && new Date(t.createdAt as any) >= today
    );

    if (todaySignin.length > 0) {
      console.log('⚠️  用户今日已签到');
    } else {
      console.log('✅ 用户今日未签到,可以进行签到');
    }
    console.log('');

    // 6. 汇总报告
    console.log('========================================');
    console.log('测试汇总:');
    console.log('========================================');
    console.log('✅ 签到配置: 正常');
    console.log('✅ 数据库连接: 正常');
    console.log('✅ 测试用户: 存在');
    console.log(
      `${credits.length > 0 ? '✅' : '⚠️'} 积分记录: ${credits.length > 0 ? '存在' : '已创建'}`
    );
    console.log(
      `${todaySignin.length === 0 ? '✅' : '⚠️'} 签到状态: ${todaySignin.length === 0 ? '可以签到' : '今日已签到'}`
    );
    console.log('');

    console.log('建议:');
    console.log('1. 启动开发服务器: npm run dev');
    console.log('2. 登录账号:', testUser.email);
    console.log('3. 访问个人后台并尝试签到');
    console.log('4. 查看服务器控制台的 [签到API] 日志');
  } catch (error) {
    console.error('❌ 测试失败:', error);
    if (error instanceof Error) {
      console.error('错误详情:', error.message);
      console.error('错误堆栈:', error.stack);
    }
  }
}

// 运行测试
testSigninFunction()
  .then(() => {
    console.log('\n测试完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('测试异常:', error);
    process.exit(1);
  });
