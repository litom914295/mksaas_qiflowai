import dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config();

async function testConnections() {
  console.log('测试不同的数据库连接模式...\n');

  const connections = [
    {
      name: 'Transaction Mode Pooler (原始)',
      url: process.env.DATABASE_URL,
      desc: '用于短事务',
    },
    {
      name: 'Session Mode Pooler (推荐)',
      url: process.env.SESSION_DATABASE_URL,
      desc: '用于 Better Auth 等需要持续会话的应用',
    },
    {
      name: 'Direct Connection',
      url: process.env.DIRECT_DATABASE_URL,
      desc: '用于数据库迁移',
    },
  ];

  for (const conn of connections) {
    if (!conn.url) {
      console.log(`❌ ${conn.name}: 未配置`);
      continue;
    }

    console.log(`\n测试 ${conn.name}:`);
    console.log(`描述: ${conn.desc}`);
    console.log(`URL: ${conn.url.replace(/:[^@]+@/, ':****@')}`);

    try {
      const sql = postgres(conn.url, {
        ssl: 'require',
        max: 1,
        prepare: false,
        idle_timeout: 20,
        connect_timeout: 10,
      });

      // 测试基本连接
      const result = await sql`SELECT NOW() as time, current_database() as db`;
      console.log('✅ 连接成功');
      console.log(`   数据库: ${result[0].db}`);
      console.log(`   时间: ${result[0].time}`);

      // 测试查询 user 表
      try {
        const userCount = await sql`SELECT COUNT(*) as count FROM "user"`;
        console.log(`   user 表记录数: ${userCount[0].count}`);

        // 查询管理员
        const admin = await sql`
          SELECT id, email, role 
          FROM "user" 
          WHERE email = 'admin@mksaas.com'
          LIMIT 1
        `;

        if (admin.length > 0) {
          console.log(
            `   ✅ 找到管理员用户: ${admin[0].email} (${admin[0].role})`
          );
        } else {
          console.log('   ⚠️  未找到管理员用户');
        }
      } catch (e) {
        console.log(`   ⚠️  查询 user 表失败: ${e.message}`);
      }

      await sql.end();
    } catch (error) {
      console.error(`❌ 连接失败: ${error.message}`);
      if (error.code) console.error(`   错误码: ${error.code}`);
    }
  }

  console.log('\n\n建议:');
  console.log(
    '1. Better Auth 应该使用 Session Mode Pooler (SESSION_DATABASE_URL)'
  );
  console.log('2. 数据库迁移应该使用 Direct Connection (DIRECT_DATABASE_URL)');
  console.log('3. 短事务查询可以使用 Transaction Mode Pooler (DATABASE_URL)');
}

testConnections().catch(console.error);
