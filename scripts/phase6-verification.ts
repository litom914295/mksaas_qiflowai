/**
 * Phase 6 - 数据库迁移验证与功能测试
 *
 * 用途: 验证 chatSessions 表和 Phase 6 功能是否正常工作
 */

import { createChatSessionAction } from '@/actions/chat/create-chat-session';
import { endChatSessionAction } from '@/actions/chat/end-chat-session';
import { getChatSessionStatusAction } from '@/actions/chat/get-chat-session-status';
import { renewChatSessionAction } from '@/actions/chat/renew-chat-session';
import { db } from '@/db';
import { chatSessions, creditTransaction } from '@/db/schema';
import { sql } from 'drizzle-orm';

// 颜色输出辅助函数
const colors = {
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
  blue: (text: string) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text: string) => `\x1b[36m${text}\x1b[0m`,
};

console.log(colors.cyan('\n========================================'));
console.log(colors.cyan('Phase 6 - 数据库迁移验证与功能测试'));
console.log(colors.cyan('========================================\n'));

/**
 * 1. 验证数据库表结构
 */
async function verifyDatabaseSchema() {
  console.log(colors.blue('📋 验证 1: 检查数据库表结构\n'));

  try {
    // 检查 chatSessions 表是否存在
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'chat_sessions'
      );
    `);

    const tableExists = result.rows[0]?.exists;

    if (tableExists) {
      console.log(colors.green('✅ chatSessions 表存在'));

      // 检查列
      const columns = await db.execute(sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'chat_sessions'
        ORDER BY ordinal_position;
      `);

      console.log(colors.cyan('\n列信息:'));
      columns.rows.forEach((col: any) => {
        console.log(
          `  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`
        );
      });

      // 检查索引
      const indexes = await db.execute(sql`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'chat_sessions';
      `);

      console.log(colors.cyan('\n索引信息:'));
      indexes.rows.forEach((idx: any) => {
        console.log(`  - ${idx.indexname}`);
      });

      return true;
    } else {
      console.log(colors.red('❌ chatSessions 表不存在'));
      console.log(colors.yellow('\n请执行以下命令创建表:'));
      console.log(colors.yellow('  npx drizzle-kit push'));
      console.log(
        colors.yellow(
          '  或手动执行: drizzle/0002_phase2_reports_and_sessions.sql'
        )
      );
      return false;
    }
  } catch (error) {
    console.error(colors.red('❌ 数据库连接失败:'), error);
    return false;
  }
}

/**
 * 2. 验证 creditTransaction 表的交易类型
 */
async function verifyCreditTransactionTypes() {
  console.log(colors.blue('\n\n📋 验证 2: 检查积分交易类型\n'));

  try {
    // 检查是否有 CHAT_SESSION_START 或 CHAT_SESSION_RENEW 类型的记录
    const result = await db.execute(sql`
      SELECT DISTINCT type 
      FROM credit_transaction
      WHERE type IN ('CHAT_SESSION_START', 'CHAT_SESSION_RENEW')
      LIMIT 5;
    `);

    if (result.rows.length > 0) {
      console.log(colors.green('✅ 找到 Chat 会话相关的积分交易记录:'));
      result.rows.forEach((row: any) => {
        console.log(`  - ${row.type}`);
      });
    } else {
      console.log(colors.yellow('⚠️  尚未有 Chat 会话相关的积分交易记录'));
      console.log(colors.cyan('   这是正常的，因为还没有用户使用会话功能'));
    }

    return true;
  } catch (error) {
    console.error(colors.red('❌ 查询失败:'), error);
    return false;
  }
}

/**
 * 3. 验证 Server Actions 是否可用
 */
async function verifyServerActions() {
  console.log(colors.blue('\n\n📋 验证 3: 检查 Server Actions\n'));

  const actions = [
    { name: 'createChatSessionAction', fn: createChatSessionAction },
    { name: 'renewChatSessionAction', fn: renewChatSessionAction },
    { name: 'getChatSessionStatusAction', fn: getChatSessionStatusAction },
    { name: 'endChatSessionAction', fn: endChatSessionAction },
  ];

  let allAvailable = true;

  actions.forEach((action) => {
    if (typeof action.fn === 'function') {
      console.log(colors.green(`✅ ${action.name} 可用`));
    } else {
      console.log(colors.red(`❌ ${action.name} 不可用`));
      allAvailable = false;
    }
  });

  return allAvailable;
}

/**
 * 4. 统计现有会话数据
 */
async function statisticsExistingSessions() {
  console.log(colors.blue('\n\n📋 验证 4: 统计现有会话数据\n'));

  try {
    const stats = await db.execute(sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COALESCE(SUM(credits_used), 0) as total_credits,
        COALESCE(AVG(message_count), 0) as avg_messages
      FROM chat_sessions;
    `);

    const data = stats.rows[0] as any;

    console.log(colors.cyan('会话统计:'));
    console.log(`  总会话数: ${data.total}`);
    console.log(`  活跃会话: ${data.active}`);
    console.log(`  过期会话: ${data.expired}`);
    console.log(`  已完成: ${data.completed}`);
    console.log(`  总积分消耗: ${data.total_credits}`);
    console.log(`  平均消息数: ${Number(data.avg_messages).toFixed(2)}`);

    return true;
  } catch (error) {
    console.error(colors.red('❌ 统计失败:'), error);
    return false;
  }
}

/**
 * 5. 测试总结
 */
async function printSummary(results: boolean[]) {
  console.log(colors.cyan('\n========================================'));
  console.log(colors.cyan('测试结果总结'));
  console.log(colors.cyan('========================================\n'));

  const testNames = [
    '数据库表结构',
    '积分交易类型',
    'Server Actions',
    '会话数据统计',
  ];

  results.forEach((result, index) => {
    const icon = result ? '✅' : '❌';
    const color = result ? colors.green : colors.red;
    console.log(
      color(`${icon} ${testNames[index]}: ${result ? '通过' : '失败'}`)
    );
  });

  const allPassed = results.every((r) => r);
  console.log('');

  if (allPassed) {
    console.log(colors.green('🎉 所有验证通过！Phase 6 数据库迁移成功！'));
  } else {
    console.log(colors.red('⚠️  部分验证失败，请检查上述错误信息'));
  }

  console.log('');
}

/**
 * 主函数
 */
async function main() {
  const results: boolean[] = [];

  // 执行所有验证
  results.push(await verifyDatabaseSchema());
  results.push(await verifyCreditTransactionTypes());
  results.push(await verifyServerActions());
  results.push(await statisticsExistingSessions());

  // 打印总结
  await printSummary(results);

  // 退出
  process.exit(results.every((r) => r) ? 0 : 1);
}

// 运行
main().catch((error) => {
  console.error(colors.red('❌ 运行失败:'), error);
  process.exit(1);
});
