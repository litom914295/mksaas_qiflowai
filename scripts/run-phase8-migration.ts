/**
 * Phase 8 数据库迁移执行脚本
 *
 * 用途：
 * 1. 自动读取 SQL 文件
 * 2. 连接 Supabase 数据库
 * 3. 执行迁移 SQL
 * 4. 验证表创建成功
 *
 * 使用方法：
 * npx tsx scripts/run-phase8-migration.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// 加载 .env.local 文件
config({ path: '.env.local' });

async function runMigration() {
  console.log('🚀 开始执行 Phase 8 数据库迁移...\n');

  // 1. 检查环境变量
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ 错误: 未找到 DATABASE_URL 环境变量');
    console.log('请在 .env.local 中配置 DATABASE_URL');
    process.exit(1);
  }

  console.log('✅ 数据库连接 URL 已找到');

  // 2. 读取 SQL 文件
  const sqlPath = join(
    process.cwd(),
    'drizzle',
    '0008_phase8_monthly_fortunes.sql'
  );
  let migrationSql: string;

  try {
    migrationSql = readFileSync(sqlPath, 'utf-8');
    console.log('✅ SQL 文件读取成功');
    console.log(`📄 文件路径: ${sqlPath}`);
    console.log(`📏 SQL 长度: ${migrationSql.length} 字符\n`);
  } catch (error) {
    console.error('❌ 错误: 无法读取 SQL 文件');
    console.error(error);
    process.exit(1);
  }

  // 3. 连接数据库
  const connection = postgres(databaseUrl, { max: 1 });
  const db = drizzle(connection);

  console.log('🔌 正在连接数据库...');

  try {
    // 4. 执行迁移
    console.log('📝 执行 SQL 迁移...\n');
    console.log('--- SQL 内容 ---');
    console.log(migrationSql);
    console.log('--- 结束 ---\n');

    await db.execute(sql.raw(migrationSql));

    console.log('✅ SQL 执行成功！\n');

    // 5. 验证表是否创建
    console.log('🔍 验证表结构...');

    const tableCheck = await db.execute(sql`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_name = 'monthly_fortunes'
    `);

    if (tableCheck.length > 0) {
      console.log('✅ 表 "monthly_fortunes" 创建成功！');
      console.log(`📊 表类型: ${tableCheck[0].table_type}`);
    } else {
      console.log('⚠️  警告: 未找到表 "monthly_fortunes"');
      console.log('   这可能是因为表已存在或迁移未生效');
    }

    // 6. 验证索引
    console.log('\n🔍 验证索引...');

    const indexCheck = await db.execute(sql`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'monthly_fortunes'
    `);

    console.log(`✅ 找到 ${indexCheck.length} 个索引:`);
    indexCheck.forEach((idx: any) => {
      console.log(`   - ${idx.indexname}`);
    });

    // 7. 验证约束
    console.log('\n🔍 验证唯一约束...');

    const constraintCheck = await db.execute(sql`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_name = 'monthly_fortunes'
    `);

    console.log(`✅ 找到 ${constraintCheck.length} 个约束:`);
    constraintCheck.forEach((c: any) => {
      console.log(`   - ${c.constraint_name} (${c.constraint_type})`);
    });

    console.log('\n🎉 迁移完成！');
    console.log('\n📋 下一步:');
    console.log('   1. 运行 npm run dev');
    console.log('   2. 访问 http://localhost:3000/qiflow/monthly-fortune');
    console.log('   3. 测试功能');
  } catch (error) {
    console.error('\n❌ 迁移失败:');
    console.error(error);

    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        console.log('\n💡 提示: 表已存在，无需重复迁移');
      } else {
        console.log('\n🔧 可能的解决方案:');
        console.log('   1. 检查 DATABASE_URL 是否正确');
        console.log('   2. 检查数据库权限');
        console.log('   3. 手动在 Supabase Dashboard 中执行 SQL');
      }
    }

    process.exit(1);
  } finally {
    // 8. 关闭连接
    await connection.end();
    console.log('\n🔌 数据库连接已关闭');
  }
}

// 运行迁移
runMigration().catch(console.error);
