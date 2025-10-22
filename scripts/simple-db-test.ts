import dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config();

async function testDB() {
  console.log('测试数据库连接...\n');

  const urls = [
    { name: 'Pooler', url: process.env.DATABASE_URL },
    { name: 'Direct', url: process.env.DIRECT_DATABASE_URL },
  ];

  for (const { name, url } of urls) {
    if (!url) {
      console.log(`❌ ${name}: 未配置`);
      continue;
    }

    console.log(`\n测试 ${name} 连接...`);
    console.log(`URL: ${url.replace(/:[^@]+@/, ':****@')}`); // 隐藏密码

    try {
      const sql = postgres(url, {
        ssl: 'require',
        max: 1,
      });

      // 简单查询
      const result = await sql`SELECT 1 as test`;
      console.log(`✅ ${name}: 连接成功`);

      // 尝试列出表
      try {
        const tables = await sql`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          LIMIT 5
        `;
        console.log(`   找到 ${tables.length} 个表`);
        tables.forEach((t) => console.log(`   - ${t.table_name}`));
      } catch (e) {
        console.log(`   ⚠️  无法列出表: ${e.message}`);
      }

      await sql.end();
    } catch (error) {
      console.error(`❌ ${name}: ${error.message}`);
      if (error.code) console.error(`   错误码: ${error.code}`);
    }
  }
}

testDB().catch(console.error);
