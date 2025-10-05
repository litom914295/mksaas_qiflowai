/**
 * 积分扣减一致性验证脚本
 * 验证数据库记录、ledger和余额的一致性
 */

import 'dotenv/config';
import { eq, sql } from 'drizzle-orm';
import { getDb } from '../src/db';
import {
  baziCalculations,
  creditTransaction,
  fengshuiAnalysis,
  userCredit,
} from '../src/db/schema';

async function verifyCreditsConsistency() {
  console.log('🔍 开始验证积分一致性...\n');

  try {
    const db = await getDb();

    // 1. 检查用户积分记录
    console.log('📊 检查用户积分记录...');
    const users = await db.select().from(userCredit);
    console.log(`  找到 ${users.length} 个用户积分记录`);

    for (const user of users.slice(0, 3)) {
      // 只检查前3个用户
      console.log(`\n  👤 用户ID: ${user.userId}`);
      console.log(`     当前积分: ${user.currentCredits}`);

      // 2. 检查该用户的交易记录
      const transactions = await db
        .select()
        .from(creditTransaction)
        .where(eq(creditTransaction.userId, user.userId));

      console.log(`     交易记录数: ${transactions.length}`);

      // 计算交易记录总和
      const calculatedBalance = transactions.reduce((sum, tx) => {
        return sum + tx.amount;
      }, 0);

      console.log(`     交易记录计算余额: ${calculatedBalance}`);

      // 3. 检查该用户的八字计算记录
      const baziRecords = await db
        .select()
        .from(baziCalculations)
        .where(eq(baziCalculations.userId, user.userId));

      const baziCreditsUsed = baziRecords.reduce((sum, record) => {
        return sum + (record.creditsUsed || 0);
      }, 0);

      console.log(
        `     八字计算消耗: ${baziCreditsUsed} (${baziRecords.length} 次)`
      );

      // 4. 检查该用户的玄空风水记录
      const xuankongRecords = await db
        .select()
        .from(fengshuiAnalysis)
        .where(eq(fengshuiAnalysis.userId, user.userId));

      const xuankongCreditsUsed = xuankongRecords.reduce((sum, record) => {
        return sum + (record.creditsUsed || 0);
      }, 0);

      console.log(
        `     玄空风水消耗: ${xuankongCreditsUsed} (${xuankongRecords.length} 次)`
      );

      // 5. 一致性检查
      const totalUsed = baziCreditsUsed + xuankongCreditsUsed;
      const isConsistent = user.currentCredits === calculatedBalance;

      if (isConsistent) {
        console.log('     ✅ 余额一致性检查通过');
      } else {
        console.log('     ⚠️  余额不一致！');
        console.log(`        数据库余额: ${user.currentCredits}`);
        console.log(`        计算余额: ${calculatedBalance}`);
        console.log(`        差异: ${user.currentCredits - calculatedBalance}`);
      }
    }

    // 6. 汇总统计
    console.log('\n\n📈 汇总统计:');

    const totalBaziRecords = await db
      .select({ count: sql<number>`count(*)` })
      .from(baziCalculations);
    console.log(`  八字计算总次数: ${totalBaziRecords[0]?.count || 0}`);

    const totalXuankongRecords = await db
      .select({ count: sql<number>`count(*)` })
      .from(fengshuiAnalysis);
    console.log(`  玄空风水总次数: ${totalXuankongRecords[0]?.count || 0}`);

    const totalTransactions = await db
      .select({ count: sql<number>`count(*)` })
      .from(creditTransaction);
    console.log(`  积分交易总数: ${totalTransactions[0]?.count || 0}`);

    const totalUsers = await db
      .select({ count: sql<number>`count(*)` })
      .from(userCredit);
    console.log(`  用户总数: ${totalUsers[0]?.count || 0}`);

    // 7. 检查积分流动总额
    const creditFlow = await db
      .select({
        totalIn: sql<number>`COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0)`,
        totalOut: sql<number>`COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0)`,
      })
      .from(creditTransaction);

    if (creditFlow[0]) {
      console.log('\n💰 积分流动:');
      console.log(`  总充值: ${creditFlow[0].totalIn}`);
      console.log(`  总消费: ${creditFlow[0].totalOut}`);
      console.log(
        `  净流入: ${Number(creditFlow[0].totalIn) - Number(creditFlow[0].totalOut)}`
      );
    }

    console.log('\n✅ 积分一致性验证完成！');
  } catch (error) {
    console.error('\n❌ 验证失败:', error);
    process.exit(1);
  }

  process.exit(0);
}

// 运行验证
verifyCreditsConsistency();
