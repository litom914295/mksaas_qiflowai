import dotenv from 'dotenv';

dotenv.config();

console.log('分析 Supabase 连接配置...\n');

// 从 Supabase URL 提取项目 ID
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const projectId = supabaseUrl
  ? supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
  : null;

console.log('Supabase 项目 ID:', projectId || '未找到');

if (projectId) {
  console.log('\n正确的连接字符串格式:');

  // 密码
  const password = '7MNsdjs7Wyjg9Qtr';

  // Transaction Mode Pooler (端口 6543)
  console.log('\n1. Transaction Mode Pooler (用于短事务):');
  const transactionUrl = `postgresql://postgres.${projectId}:${password}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`;
  console.log(`   DATABASE_URL=${transactionUrl}`);

  // Session Mode Pooler (端口 5432)
  console.log('\n2. Session Mode Pooler (用于 Better Auth):');
  const sessionUrl = `postgresql://postgres.${projectId}:${password}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`;
  console.log(`   SESSION_DATABASE_URL=${sessionUrl}`);

  // Direct Connection (端口 5432，不同的主机名)
  console.log('\n3. Direct Connection (用于数据库迁移):');
  const directUrl = `postgresql://postgres.${projectId}:${password}@db.${projectId}.supabase.co:5432/postgres`;
  console.log(`   DIRECT_DATABASE_URL=${directUrl}`);

  console.log('\n\n建议更新 .env 文件:');
  console.log('```');
  console.log('# Transaction Mode Pooler (用于短事务)');
  console.log(`DATABASE_URL=${transactionUrl}`);
  console.log();
  console.log('# Session Mode Pooler (用于 Better Auth)');
  console.log(`SESSION_DATABASE_URL=${sessionUrl}`);
  console.log();
  console.log('# Direct Connection (用于数据库迁移)');
  console.log(`DIRECT_DATABASE_URL=${directUrl}`);
  console.log('```');

  console.log('\n注意事项:');
  console.log('1. Transaction Mode 使用端口 6543');
  console.log('2. Session Mode 使用端口 5432');
  console.log('3. Direct Connection 使用 db.{project-id}.supabase.co 主机名');
  console.log('4. Better Auth 应该使用 Session Mode 或 Direct Connection');
}

// 检查当前配置
console.log('\n\n当前配置:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '已配置' : '未配置');
console.log(
  'SESSION_DATABASE_URL:',
  process.env.SESSION_DATABASE_URL ? '已配置' : '未配置'
);
console.log(
  'DIRECT_DATABASE_URL:',
  process.env.DIRECT_DATABASE_URL ? '已配置' : '未配置'
);
