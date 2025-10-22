import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function createTestUser() {
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

  const testEmail = 'test@example.com';
  const testPassword = 'test123456';
  const testName = 'Test User';

  console.log(`创建测试用户: ${testEmail}`);

  try {
    // 创建用户
    const { data: newUser, error: createError } =
      await supabase.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: {
          name: testName,
          role: 'user',
        },
      });

    if (createError) {
      if (createError.message?.includes('already registered')) {
        console.log('用户已存在，更新密码...');

        // 获取用户并更新密码
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const testUser = existingUsers?.users?.find(
          (u) => u.email === testEmail
        );

        if (testUser) {
          const { error: updateError } =
            await supabase.auth.admin.updateUserById(testUser.id, {
              password: testPassword,
            });

          if (updateError) {
            console.error('更新密码失败:', updateError);
          } else {
            console.log('✅ 密码已更新');
          }

          // 同步到 user 表
          await syncUserToTable(supabase, testUser.id, testEmail, testName);
        }
      } else {
        console.error('创建用户失败:', createError);
      }
    } else {
      console.log('✅ 用户创建成功:', newUser?.user?.id);

      // 同步到 user 表
      if (newUser?.user) {
        await syncUserToTable(supabase, newUser.user.id, testEmail, testName);
      }
    }

    // 测试登录
    console.log('\n测试登录...');
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

    if (signInError) {
      console.error('登录失败:', signInError);
    } else {
      console.log('✅ 登录成功!');
    }

    console.log('\n测试账户信息:');
    console.log('邮箱:', testEmail);
    console.log('密码:', testPassword);
    console.log('角色: user');
  } catch (error) {
    console.error('操作失败:', error);
  }
}

async function syncUserToTable(
  supabase: any,
  userId: string,
  email: string,
  name: string
) {
  try {
    // 检查用户是否存在于 user 表
    const { data: existingUser } = await supabase
      .from('user')
      .select('*')
      .eq('id', userId)
      .single();

    if (!existingUser) {
      // 插入新用户
      const { error: insertError } = await supabase.from('user').insert({
        id: userId,
        email: email,
        name: name,
        email_verified: true,
        role: 'user',
        banned: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error('插入用户到表失败:', insertError);
      } else {
        console.log('✅ 用户已同步到 user 表');
      }
    } else {
      console.log('用户已存在于 user 表');
    }
  } catch (error) {
    console.error('同步用户失败:', error);
  }
}

createTestUser().catch(console.error);
