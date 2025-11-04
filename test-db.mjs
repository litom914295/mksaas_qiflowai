import postgres from 'postgres';

const DIRECT = 'postgresql://postgres:7MNsdjs7Wyjg9Qtr@db.sibwcdadrsbfkblinezj.supabase.co:5432/postgres?sslmode=require';
const SESSION = 'postgresql://postgres:7MNsdjs7Wyjg9Qtr@sibwcdadrsbfkblinezj.pooler.supabase.net:6543/postgres?sslmode=require';
const TRANSACTION = 'postgresql://postgres:7MNsdjs7Wyjg9Qtr@sibwcdadrsbfkblinezj.pooler.supabase.net:5432/postgres?sslmode=require';

console.log('测试数据库连接...\n');

async function testConnection(name, url) {
  console.log(`正在测试 ${name}...`);
  try {
    const sql = postgres(url, {
      prepare: false,
      ssl: 'require',
      max: 1,
      connect_timeout: 10,
    });
    
    const result = await sql`SELECT 1 as test, NOW() as time`;
    console.log(`✅ ${name} 连接成功!`);
    console.log(`   服务器时间: ${result[0].time}`);
    
    // 测试 users 表
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`   用户数量: ${userCount[0].count}`);
    
    await sql.end();
    return true;
  } catch (error) {
    console.error(`❌ ${name} 连接失败:`);
    console.error(`   错误: ${error.message}`);
    return false;
  }
}

async function main() {
  const results = [];
  
  results.push(await testConnection('直接连接', DIRECT));
  console.log('');
  
  results.push(await testConnection('会话池连接', SESSION));
  console.log('');
  
  results.push(await testConnection('事务池连接', TRANSACTION));
  console.log('');
  
  if (results.some(r => r)) {
    console.log('📋 总结：至少有一个连接可用');
    process.exit(0);
  } else {
    console.log('❌ 总结：所有连接都失败了');
    process.exit(1);
  }
}

main().catch(console.error);