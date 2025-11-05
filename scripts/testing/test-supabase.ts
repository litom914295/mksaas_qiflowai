import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function testSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('缺少 Supabase 配置');
    return;
  }

  console.log('Supabase URL:', supabaseUrl);

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // 测试连接 - 获取用户列表
    const { data: users, error: usersError } =
      await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error('获取用户列表失败:', usersError);
    } else {
      console.log(`\n找到 ${users?.users?.length || 0} 个用户`);
      users?.users?.forEach((user) => {
        console.log(`- ${user.email} (ID: ${user.id})`);
      });
    }

    // 创建管理员用户
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@qiflowai.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';

    console.log(`\n尝试创建管理员用户: ${adminEmail}`);

    const { data: newUser, error: createError } =
      await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          name: 'Admin',
          role: 'admin',
        },
      });

    if (createError) {
      if (createError.message?.includes('already registered')) {
        console.log('✅ 管理员用户已存在');

        // 尝试更新用户角色
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const adminUser = existingUsers?.users?.find(
          (u) => u.email === adminEmail
        );

        if (adminUser) {
          console.log(`管理员用户 ID: ${adminUser.id}`);

          // 更新用户元数据
          const { error: updateError } =
            await supabase.auth.admin.updateUserById(adminUser.id, {
              user_metadata: {
                role: 'admin',
                name: 'Admin',
              },
            });

          if (updateError) {
            console.error('更新用户角色失败:', updateError);
          } else {
            console.log('✅ 用户角色已更新为 admin');
          }
        }
      } else {
        console.error('创建管理员用户失败:', createError);
      }
    } else {
      console.log('✅ 管理员用户创建成功:', newUser?.user?.id);
    }
  } catch (error) {
    console.error('Supabase 操作失败:', error);
  }
}

testSupabase().catch(console.error);
