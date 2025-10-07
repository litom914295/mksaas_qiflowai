import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString =
  'postgresql://postgres:Sd%40721204@db.sibwcdadrsbfkblinezj.supabase.co:5432/postgres';
const client = postgres(connectionString);
const db = drizzle(client);

async function checkTables() {
  try {
    console.log('🔍 检查数据库中的所有表...');
    const result = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('📋 找到的表:');
    result.forEach((row) => {
      console.log(`  - ${row.table_name}`);
    });

    if (result.length === 0) {
      console.log('❌ 没有找到任何表！');
    } else {
      console.log(`✅ 总共找到 ${result.length} 个表`);
    }
  } catch (error) {
    console.error('❌ 检查表时出错:', error);
  } finally {
    await client.end();
  }
}

checkTables();

