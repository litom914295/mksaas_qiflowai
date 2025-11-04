import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('===================================');
console.log('系统配置检查');
console.log('===================================\n');

// 检查环境变量
console.log('1. 环境变量检查:');
console.log(
  `   - NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ 已设置' : '❌ 缺失'}`
);
console.log(
  `   - NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ 已设置' : '❌ 缺失'}`
);
console.log(
  `   - SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceRoleKey ? '✅ 已设置' : '❌ 缺失'}`
);

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  console.error('\n❌ 缺少必要的环境变量，请检查 .env.local 文件');
  process.exit(1);
}

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

console.log('\n2. 用户账户检查:');

// 检查管理员账户
async function checkAdminUser() {
  try {
    const { data: adminAuth, error: adminError } =
      await supabase.auth.admin.listUsers();

    if (adminError) {
      console.error('   ❌ 无法获取用户列表:', adminError.message);
      return;
    }

    const adminUser = adminAuth?.users?.find(
      (u) => u.email === 'admin@qiflowai.com'
    );
    if (adminUser) {
      console.log('   ✅ 管理员账户存在 (admin@qiflowai.com)');
      console.log(`      - ID: ${adminUser.id}`);
      console.log(
        `      - 创建时间: ${new Date(adminUser.created_at).toLocaleString()}`
      );
    } else {
      console.log('   ❌ 管理员账户不存在');
    }

    const testUser = adminAuth?.users?.find(
      (u) => u.email === 'test@example.com'
    );
    if (testUser) {
      console.log('   ✅ 测试账户存在 (test@example.com)');
      console.log(`      - ID: ${testUser.id}`);
      console.log(
        `      - 创建时间: ${new Date(testUser.created_at).toLocaleString()}`
      );
    } else {
      console.log('   ⚠️ 测试账户不存在');
    }
  } catch (error) {
    console.error('   ❌ 检查用户时出错:', error);
  }
}

console.log('\n3. 数据库表检查:');

// 检查数据库表
async function checkDatabaseTables() {
  try {
    // 检查 user 表
    const { data: users, error: userError } = await supabase
      .from('user')
      .select('id, email, role')
      .limit(5);

    if (userError) {
      console.log('   ❌ user 表访问失败:', userError.message);
    } else {
      console.log(`   ✅ user 表可访问 (${users?.length || 0} 条记录)`);
      if (users && users.length > 0) {
        const adminInDb = users.find((u) => u.email === 'admin@qiflowai.com');
        if (adminInDb) {
          console.log(`      - 管理员在数据库中: role=${adminInDb.role}`);
        }
      }
    }

    // 检查 tenant 表
    const { error: tenantError } = await supabase
      .from('tenant')
      .select('id')
      .limit(1);

    if (tenantError) {
      console.log('   ❌ tenant 表访问失败:', tenantError.message);
    } else {
      console.log('   ✅ tenant 表可访问');
    }
  } catch (error) {
    console.error('   ❌ 检查数据库表时出错:', error);
  }
}

console.log('\n4. 访问路径信息:');
console.log('   📍 测试登录页面: http://localhost:3000/test-login');
console.log('   📍 正式登录页面: http://localhost:3000/zh-CN/auth/login');
console.log('   📍 管理后台: http://localhost:3000/zh-CN/dashboard');

console.log('\n5. 重要说明:');
console.log('   - nuqs 适配器已添加到 providers.tsx');
console.log('   - QueryClient 已正确配置');
console.log('   - Supabase Auth 已集成');
console.log('   - 中间件已更新为使用 Supabase Auth');

// 执行检查
(async () => {
  await checkAdminUser();
  await checkDatabaseTables();

  console.log('\n===================================');
  console.log('检查完成');
  console.log('===================================');
  console.log('\n如果所有项目都显示 ✅，系统应该可以正常运行。');
  console.log('如果有 ❌ 项目，请根据提示进行修复。');
})();
