/**
 * 用户积分和签到系统诊断脚本
 * 用于检测积分余额、签到状态、连续签到天数等问题
 */

import { randomUUID } from 'crypto';
import { getDb } from '@/db';
import { creditTransaction, user, userCredit } from '@/db/schema';
import { and, eq, gte, sql } from 'drizzle-orm';

const INITIAL_CREDITS = 100;

// 日期转换函数
function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// 计算连续签到天数
function calculateStreak(signInRecords: Date[]): number {
  const marked = new Set<string>();
  for (const record of signInRecords) {
    marked.add(dateKey(record));
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;

  // 如果今天已签到，从 i=0 开始；如果今天未签，从 i=1 开始（昨天）
  const startIndex = marked.has(dateKey(today)) ? 0 : 1;

  for (let i = startIndex; i < 365; i++) {
    const cur = new Date(today);
    cur.setDate(today.getDate() - i);
    if (marked.has(dateKey(cur))) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

async function diagnoseCreditsSystem() {
  console.log('========================================');
  console.log('🔍 开始诊断积分和签到系统');
  console.log('========================================\n');

  try {
    const db = await getDb();

    // 1. 获取所有用户
    console.log('📍 步骤1: 获取所有用户...');
    const allUsers = await db.select().from(user);
    console.log(`✅ 找到 ${allUsers.length} 个用户\n`);

    // 2. 检查每个用户的积分和签到状态
    let missingCredits = 0;
    let usersWithZeroCredits = 0;
    const issues: string[] = [];

    for (const u of allUsers) {
      console.log(`\n👤 检查用户: ${u.email || u.name || u.id}`);
      console.log('─'.repeat(50));

      // 检查积分记录
      const credits = await db
        .select()
        .from(userCredit)
        .where(eq(userCredit.userId, u.id))
        .limit(1);

      if (credits.length === 0) {
        missingCredits++;
        console.log('❌ 缺少积分记录');
        issues.push(`用户 ${u.email} 缺少积分记录`);

        // 自动修复：创建积分记录
        try {
          await db.insert(userCredit).values({
            id: randomUUID(),
            userId: u.id,
            currentCredits: INITIAL_CREDITS,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          // 记录初始积分交易
          await db.insert(creditTransaction).values({
            id: randomUUID(),
            userId: u.id,
            type: 'WELCOME_BONUS',
            amount: INITIAL_CREDITS,
            remainingAmount: INITIAL_CREDITS,
            description: `新用户欢迎积分 +${INITIAL_CREDITS}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          console.log(`✅ 已自动创建积分记录，初始积分: ${INITIAL_CREDITS}`);
        } catch (error) {
          console.error('❌ 创建积分记录失败:', error);
        }
      } else {
        const balance = credits[0].currentCredits;
        console.log(`💰 积分余额: ${balance}`);

        if (balance === 0) {
          usersWithZeroCredits++;
          issues.push(`用户 ${u.email} 积分余额为0`);
        }

        if (balance < 0) {
          issues.push(`用户 ${u.email} 积分余额异常: ${balance}`);
          console.log('⚠️  警告: 积分余额为负数');
        }
      }

      // 检查今日签到状态
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todaySignIn = await db
        .select()
        .from(creditTransaction)
        .where(
          and(
            eq(creditTransaction.userId, u.id),
            eq(creditTransaction.type, 'DAILY_SIGNIN'),
            gte(creditTransaction.createdAt, today)
          )
        )
        .limit(1);

      const isSigned = todaySignIn.length > 0;
      console.log(`📅 今日签到: ${isSigned ? '✅ 已签到' : '❌ 未签到'}`);

      if (isSigned && todaySignIn[0]) {
        console.log(`   签到时间: ${todaySignIn[0].createdAt}`);
        console.log(`   获得积分: ${todaySignIn[0].amount}`);
      }

      // 计算连续签到天数
      const since = new Date();
      since.setDate(since.getDate() - 120);
      const signInRecords = await db
        .select({ createdAt: creditTransaction.createdAt })
        .from(creditTransaction)
        .where(
          and(
            eq(creditTransaction.userId, u.id),
            eq(creditTransaction.type, 'DAILY_SIGNIN'),
            gte(creditTransaction.createdAt, since)
          )
        );

      const signInDates = signInRecords.map(
        (r) => new Date(r.createdAt as any)
      );
      const streak = calculateStreak(signInDates);

      console.log(`🔥 连续签到: ${streak} 天`);
      console.log(`📊 总签到次数: ${signInRecords.length} 次`);

      // 检查连续签到天数异常
      if (streak === 0 && signInRecords.length > 0) {
        issues.push(`用户 ${u.email} 有签到记录但连续天数为0`);
        console.log('⚠️  警告: 有签到记录但连续天数为0，可能是算法问题');
      }
    }

    // 3. 总结报告
    console.log('\n\n========================================');
    console.log('📋 诊断报告总结');
    console.log('========================================');
    console.log(`总用户数: ${allUsers.length}`);
    console.log(`缺少积分记录: ${missingCredits} 个用户`);
    console.log(`积分余额为0: ${usersWithZeroCredits} 个用户`);
    console.log(`发现问题数: ${issues.length} 个\n`);

    if (issues.length > 0) {
      console.log('⚠️  发现的问题列表:');
      issues.forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue}`);
      });
    } else {
      console.log('✅ 未发现问题，系统运行正常！');
    }

    console.log('\n========================================');
    console.log('✅ 诊断完成');
    console.log('========================================\n');

    return {
      totalUsers: allUsers.length,
      missingCredits,
      usersWithZeroCredits,
      issues,
    };
  } catch (error) {
    console.error('❌ 诊断过程中发生错误:', error);
    throw error;
  }
}

// 执行诊断
if (require.main === module) {
  diagnoseCreditsSystem()
    .then((result) => {
      console.log('诊断结果:', JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch((error) => {
      console.error('脚本执行失败:', error);
      process.exit(1);
    });
}

export { diagnoseCreditsSystem };
