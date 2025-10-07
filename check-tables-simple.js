const { Client } = require('pg');

const client = new Client({
  connectionString:
    'postgresql://postgres:Sd%40721204@db.sibwcdadrsbfkblinezj.supabase.co:5432/postgres',
});

async function checkTables() {
  try {
    await client.connect();
    console.log('🔍 检查数据库中的所有表...');

    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('📋 找到的表:');
    result.rows.forEach((row) => {
      console.log(`  - ${row.table_name}`);
    });

    if (result.rows.length === 0) {
      console.log('❌ 没有找到任何表！');
    } else {
      console.log(`✅ 总共找到 ${result.rows.length} 个表`);
    }
  } catch (error) {
    console.error('❌ 检查表时出错:', error.message);
  } finally {
    await client.end();
  }
}

checkTables();

