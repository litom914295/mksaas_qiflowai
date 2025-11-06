/**
 * 数据库性能诊断脚本
 * 用于排查仪表盘加载慢的问题
 */

import { getDb } from '../src/db';
import { getUserCredits } from '../src/credits/credits';

async function diagnose() {
  console.log('🔍 开始数据库性能诊断...\n');

  const testUserId = process.argv[2];
  if (!testUserId) {
    console.error('❌ 请提供测试用户ID');
    console.log('用法: tsx scripts/diagnose-database.ts <user-id>');
    process.exit(1);
  }

  // 1. 测试数据库连接
  console.log('1️⃣  测试数据库连接...');
  const connectStart = Date.now();
  try {
    const db = await getDb();
    const connectTime = Date.now() - connectStart;
    console.log(`✅ 数据库连接成功 (${connectTime}ms)\n`);
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    process.exit(1);
  }

  // 2. 测试 getUserCredits 性能
  console.log('2️⃣  测试 getUserCredits 性能...');
  const creditsStart = Date.now();
  try {
    const credits = await getUserCredits(testUserId);
    const creditsTime = Date.now() - creditsStart;
    console.log(`✅ 获取积分: ${credits} (${creditsTime}ms)`);
    
    if (creditsTime > 1000) {
      console.warn(`⚠️  警告: getUserCredits 耗时超过 1秒 (${creditsTime}ms)`);
      console.warn('   建议: 检查 user_credit 表是否有索引');
    }
  } catch (error) {
    console.error('❌ 获取积分失败:', error);
  }
  console.log('');

  // 3. 测试签到查询性能
  console.log('3️⃣  测试签到查询性能...');
  const db = await getDb();
  const { creditTransaction } = await import('../src/db/schema');
  const { and, eq, gte } = await import('drizzle-orm');
  
  const signInStart = Date.now();
  try {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const todaySignIn = await db
      .select({ id: creditTransaction.id })
      .from(creditTransaction)
      .where(
        and(
          eq(creditTransaction.userId, testUserId),
          eq(creditTransaction.type, 'DAILY_SIGNIN'),
          gte(creditTransaction.createdAt, startOfDay)
        )
      )
      .limit(1);

    const signInTime = Date.now() - signInStart;
    console.log(`✅ 签到查询完成 (${signInTime}ms)`);
    console.log(`   今日已签到: ${todaySignIn.length > 0 ? '是' : '否'}`);
    
    if (signInTime > 500) {
      console.warn(`⚠️  警告: 签到查询耗时超过 500ms (${signInTime}ms)`);
      console.warn('   建议: 创建索引 idx_credit_transaction_signin');
    }
  } catch (error) {
    console.error('❌ 签到查询失败:', error);
  }
  console.log('');

  // 4. 测试签到历史查询性能（30天）
  console.log('4️⃣  测试签到历史查询性能 (30天)...');
  const historyStart = Date.now();
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const signInRecords = await db
      .select({ createdAt: creditTransaction.createdAt })
      .from(creditTransaction)
      .where(
        and(
          eq(creditTransaction.userId, testUserId),
          eq(creditTransaction.type, 'DAILY_SIGNIN'),
          gte(creditTransaction.createdAt, since)
        )
      );

    const historyTime = Date.now() - historyStart;
    console.log(`✅ 签到历史查询完成 (${historyTime}ms)`);
    console.log(`   30天内签到次数: ${signInRecords.length}`);
    
    if (historyTime > 1000) {
      console.error(`❌ 严重: 签到历史查询耗时超过 1秒 (${historyTime}ms)`);
      console.error('   这是导致仪表盘加载慢的主要原因！');
      console.error('   必须创建索引: idx_credit_transaction_signin');
    } else if (historyTime > 500) {
      console.warn(`⚠️  警告: 签到历史查询耗时超过 500ms (${historyTime}ms)`);
    }
  } catch (error) {
    console.error('❌ 签到历史查询失败:', error);
  }
  console.log('');

  // 5. 检查表大小
  console.log('5️⃣  检查表大小...');
  try {
    const result = await db.execute`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
        n_live_tup as rows
      FROM pg_stat_user_tables
      WHERE tablename IN ('user_credit', 'credit_transaction', 'bazi_calculations', 'fengshui_analysis')
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
    `;
    
    console.log('表大小统计:');
    for (const row of result as any[]) {
      console.log(`  ${row.tablename}: ${row.size} (${row.rows} 行)`);
    }
  } catch (error) {
    console.warn('⚠️  无法获取表大小信息');
  }
  console.log('');

  // 6. 检查索引
  console.log('6️⃣  检查现有索引...');
  try {
    const result = await db.execute`
      SELECT 
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public' 
      AND tablename IN ('user_credit', 'credit_transaction', 'bazi_calculations', 'fengshui_analysis')
      ORDER BY tablename, indexname;
    `;
    
    console.log('现有索引:');
    let hasRequiredIndexes = false;
    for (const row of result as any[]) {
      console.log(`  ${row.tablename}.${row.indexname}`);
      if (row.indexname.includes('credit_transaction') && 
          (row.indexname.includes('signin') || row.indexname.includes('user_id'))) {
        hasRequiredIndexes = true;
      }
    }
    
    if (!hasRequiredIndexes) {
      console.error('\n❌ 缺少关键索引！');
      console.error('   请执行: scripts/optimize-database-indexes.sql');
    }
  } catch (error) {
    console.warn('⚠️  无法获取索引信息');
  }
  console.log('');

  // 7. 总结
  console.log('📊 诊断总结');
  console.log('━'.repeat(60));
  console.log('建议操作:');
  console.log('1. 执行 scripts/optimize-database-indexes.sql 创建索引');
  console.log('2. 使用快速版本仪表盘 (已实施)');
  console.log('3. 监控数据库连接池状态');
  console.log('4. 考虑添加 Redis 缓存');
  console.log('');
  console.log('预期改善:');
  console.log('- getUserCredits: < 50ms');
  console.log('- 签到查询: < 100ms');
  console.log('- 总仪表盘加载: < 2秒');
  console.log('');

  process.exit(0);
}

diagnose().catch((error) => {
  console.error('诊断过程出错:', error);
  process.exit(1);
});
