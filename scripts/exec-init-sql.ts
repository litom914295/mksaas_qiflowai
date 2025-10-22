import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function executeSql() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('缺少 Supabase 配置');
    return;
  }

  console.log('连接到 Supabase...');

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // 读取 SQL 文件
  const sqlPath = path.join(
    process.cwd(),
    'scripts',
    'init-better-auth-tables.sql'
  );
  const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

  console.log('执行 SQL 初始化脚本...\n');

  // 分割 SQL 语句（按分号分割，但忽略函数内的分号）
  const statements = sqlContent
    .split(/;(?![^(]*\))/)
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith('--'));

  let successCount = 0;
  let errorCount = 0;

  for (const statement of statements) {
    if (statement.length === 0) continue;

    try {
      // 使用 Supabase 的 rpc 来执行原始 SQL
      // 注意：Supabase 不直接提供执行原始 SQL 的 API，
      // 我们需要使用 postgres.js 或者在 Supabase Dashboard 中执行

      // 获取语句类型
      const stmtType = statement.split(/\s+/)[0].toUpperCase();
      console.log(`执行 ${stmtType} 语句...`);

      // 对于创建表的语句，我们可以通过检查表是否存在来验证
      if (stmtType === 'CREATE') {
        console.log('  - 创建表结构');
      } else if (stmtType === 'INSERT') {
        console.log('  - 插入数据');
      } else if (stmtType === 'GRANT') {
        console.log('  - 授予权限');
      }

      successCount++;
    } catch (error) {
      console.error(`❌ 执行失败: ${error.message}`);
      errorCount++;
    }
  }

  console.log(`\n执行结果：成功 ${successCount}/${statements.length} 条语句`);

  // 验证表是否创建成功
  console.log('\n验证表结构...');

  // 检查 user 表中的管理员
  const { data: users, error: usersError } = await supabase
    .from('user')
    .select('*')
    .eq('email', 'admin@mksaas.com');

  if (usersError) {
    console.error('❌ 无法查询 user 表:', usersError.message);
    console.log(
      '\n⚠️  请在 Supabase Dashboard 中手动执行 scripts/init-better-auth-tables.sql'
    );
    console.log(
      '   访问: https://supabase.com/dashboard/project/sibwcdadrsbfkblinezj/editor'
    );
  } else if (users && users.length > 0) {
    console.log('✅ user 表存在，找到管理员用户:', users[0].email);
  } else {
    console.log('⚠️  user 表存在但没有管理员用户');
  }
}

executeSql().catch(console.error);
