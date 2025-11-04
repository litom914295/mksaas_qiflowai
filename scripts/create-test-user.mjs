import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// 加载环境变量
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 环境变量未配置！');
  console.error('请确保 .env.local 中包含:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createTestUser() {
  console.log('🚀 开始创建测试用户...\n');

  const testUsers = [
    {
      email: 'test@example.com',
      password: 'test123456',
      name: 'Test User',
    },
    {
      email: 'admin@mksaas.com',
      password: 'admin123456',
      name: 'Admin User',
    },
  ];

  for (const user of testUsers) {
    console.log(`📧 创建用户: ${user.email}`);

    // 尝试注册用户
    const { data: signUpData, error: signUpError } =
      await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // 自动确认邮箱
        user_metadata: {
          name: user.name,
        },
      });

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log(`   ℹ️  用户已存在: ${user.email}`);

        // 更新密码
        const { data: users } = await supabase.auth.admin.listUsers();
        const existingUser = users.users.find((u) => u.email === user.email);

        if (existingUser) {
          const { error: updateError } =
            await supabase.auth.admin.updateUserById(existingUser.id, {
              password: user.password,
            });

          if (updateError) {
            console.log(`   ❌ 更新密码失败: ${updateError.message}`);
          } else {
            console.log(`   ✅ 密码已更新为: ${user.password}`);
          }
        }
      } else {
        console.log(`   ❌ 创建失败: ${signUpError.message}`);
      }
    } else {
      console.log('   ✅ 创建成功！');
      console.log(`   📧 邮箱: ${user.email}`);
      console.log(`   🔑 密码: ${user.password}`);
      console.log(`   👤 ID: ${signUpData.user.id}`);
    }
    console.log('');
  }

  console.log('✨ 完成！\n');
  console.log('📝 测试用户信息:');
  console.log('─'.repeat(50));
  testUsers.forEach((user) => {
    console.log(`邮箱: ${user.email}`);
    console.log(`密码: ${user.password}`);
    console.log('');
  });
  console.log('🌐 现在可以使用这些凭据登录了！');
}

createTestUser().catch(console.error);
