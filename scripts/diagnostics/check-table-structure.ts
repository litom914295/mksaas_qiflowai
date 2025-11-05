import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function checkTables() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('缺少 Supabase 配置');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log('检查数据库表结构...\n');

  // 尝试查询 user 表（不同的可能性）
  const tableNames = ['user', 'users', 'auth.users'];

  for (const tableName of tableNames) {
    try {
      console.log(`检查表: ${tableName}`);
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (!error) {
        console.log(`✅ 表 ${tableName} 存在`);
        if (data && data.length > 0) {
          console.log('   列:', Object.keys(data[0]));
        } else {
          console.log('   表为空');
        }
      } else {
        console.log(`❌ 表 ${tableName} 不存在或无法访问:`, error.message);
      }
    } catch (e) {
      console.log('❌ 错误:', e.message);
    }
    console.log('');
  }

  // 检查 Supabase Auth 用户
  console.log('检查 Supabase Auth 用户:');
  const { data: authUsers, error: authError } =
    await supabase.auth.admin.listUsers();

  if (!authError) {
    console.log(`找到 ${authUsers?.users?.length || 0} 个 Auth 用户`);
    authUsers?.users?.forEach((user) => {
      console.log(`  - ${user.email} (ID: ${user.id})`);
    });
  } else {
    console.log('❌ 无法获取 Auth 用户:', authError);
  }

  // 建议
  console.log('\n📝 建议:');
  console.log('1. 在 Supabase Dashboard 中手动创建 Better Auth 所需的表结构');
  console.log(
    '   访问: https://supabase.com/dashboard/project/sibwcdadrsbfkblinezj/sql/new'
  );
  console.log('   执行: scripts/init-better-auth-tables.sql');
  console.log('\n2. 或者使用 Supabase Auth 作为主要认证系统');
  console.log('   用户已经在 Supabase Auth 中创建成功');
}

checkTables().catch(console.error);
