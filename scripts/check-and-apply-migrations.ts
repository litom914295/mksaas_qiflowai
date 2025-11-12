/**
 * 数据库迁移检查和应用脚本
 *
 * 用途：
 * 1. 检查哪些表已经存在
 * 2. 列出未应用的迁移
 * 3. 提供应用迁移的命令
 */

import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

async function checkMigrationStatus() {
  console.log('🔍 检查数据库迁移状态...\n');

  // 使用环境变量中的数据库连接
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ DATABASE_URL 环境变量未设置');
    console.log('\n请确保 .env.local 文件中配置了 DATABASE_URL');
    return;
  }

  const client = postgres(connectionString);
  const db = drizzle(client);

  const tablesToCheck = [
    'stripe_webhook_events', // Phase 1
    'qiflow_reports', // Phase 2
    'chat_sessions', // Phase 2
    'knowledge_documents', // Phase 7
    'rag_retrieval_logs', // Phase 7
    'monthly_fortunes', // Phase 8
  ];

  const results: Record<string, boolean> = {};

  for (const table of tablesToCheck) {
    try {
      const result = await client`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = ${table}
        )
      `;

      const exists = result[0]?.exists === true;
      results[table] = exists;

      console.log(`${exists ? '✅' : '❌'} ${table}`);
    } catch (error) {
      console.error(`❌ ${table} - 检查失败:`, error);
      results[table] = false;
    }
  }

  console.log('\n📊 迁移状态总结:\n');

  const missingTables = Object.entries(results)
    .filter(([_, exists]) => !exists)
    .map(([table]) => table);

  if (missingTables.length === 0) {
    console.log('🎉 所有表都已创建！数据库迁移完成。');
  } else {
    console.log('⚠️  以下表尚未创建:\n');
    missingTables.forEach((table) => console.log(`   - ${table}`));
    console.log('\n运行以下命令应用迁移:\n');
    console.log('   npx drizzle-kit push');
    console.log('   或');
    console.log('   npm run db:push');
  }

  await client.end();
  return { results, missingTables };
}

// 运行检查
checkMigrationStatus()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('检查失败:', error);
    process.exit(1);
  });
