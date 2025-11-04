const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function checkAndCreateTestUsers() {
  console.log('检查现有测试用户...');

  // 列出现有用户
  const { data: authUsers, error: listError } =
    await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('获取用户列表失败:', listError);
    return;
  }

  console.log('现有用户:');
  authUsers?.users.forEach((user) => {
    console.log(`- ${user.email} (ID: ${user.id})`);
  });

  // 检查是否存在 test@example.com
  const testUser = authUsers?.users.find((u) => u.email === 'test@example.com');

  if (testUser) {
    console.log('\n✓ test@example.com 用户已存在');

    // 测试登录
    console.log('测试登录...');
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123',
      });

    if (signInError) {
      console.log('❌ 登录失败:', signInError.message);

      // 尝试重置密码
      console.log('尝试重置用户密码...');
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        testUser.id,
        { password: 'password123' }
      );

      if (updateError) {
        console.error('重置密码失败:', updateError);
      } else {
        console.log('✓ 密码已重置');

        // 再次测试登录
        const { data: retrySignIn, error: retryError } =
          await supabase.auth.signInWithPassword({
            email: 'test@example.com',
            password: 'password123',
          });

        if (retryError) {
          console.log('❌ 重试登录仍然失败:', retryError.message);
        } else {
          console.log('✓ 登录成功！');
        }
      }
    } else {
      console.log('✓ 登录成功！');
    }
  } else {
    console.log('\n创建 test@example.com 测试用户...');

    const { data: newUser, error: createError } =
      await supabase.auth.admin.createUser({
        email: 'test@example.com',
        password: 'password123',
        email_confirm: true,
        user_metadata: {
          name: 'Test User',
        },
      });

    if (createError) {
      console.error('创建用户失败:', createError);
    } else {
      console.log('✓ 测试用户创建成功');

      // 测试登录
      console.log('测试新用户登录...');
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: 'test@example.com',
          password: 'password123',
        });

      if (signInError) {
        console.log('❌ 新用户登录失败:', signInError.message);
      } else {
        console.log('✓ 新用户登录成功！');
      }
    }
  }

  // 同样检查 demo@qiflowai.com
  const demoUser = authUsers?.users.find((u) => u.email === 'demo@qiflowai.com');

  if (!demoUser) {
    console.log('\n创建 demo@qiflowai.com 测试用户...');

    const { data: newDemo, error: demoError } =
      await supabase.auth.admin.createUser({
        email: 'demo@qiflowai.com',
        password: 'demo123456',
        email_confirm: true,
        user_metadata: {
          name: 'Demo User',
        },
      });

    if (demoError) {
      console.error('创建 demo 用户失败:', demoError);
    } else {
      console.log('✓ Demo 用户创建成功');
    }
  } else {
    console.log('\n✓ demo@qiflowai.com 用户已存在');
  }

  // 检查 admin@qiflowai.com 用户
  const adminUser = authUsers?.users.find(
    (u) => u.email === 'admin@qiflowai.com'
  );

  if (adminUser) {
    console.log('\n✓ admin@qiflowai.com 用户已存在，测试登录...');

    // 测试 admin 用户登录
    const { data: adminSignIn, error: adminSignInError } =
      await supabase.auth.signInWithPassword({
        email: 'admin@qiflowai.com',
        password: 'admin123456',
      });

    if (adminSignInError) {
      console.log('❌ Admin 用户登录失败:', adminSignInError.message);
      console.log('尝试重置 admin 用户密码...');

      const { error: adminUpdateError } =
        await supabase.auth.admin.updateUserById(adminUser.id, {
          password: 'admin123456',
        });

      if (adminUpdateError) {
        console.error('重置 admin 密码失败:', adminUpdateError);
      } else {
        console.log('✓ Admin 密码已重置');
      }
    } else {
      console.log('✓ Admin 用户登录成功！');
    }
  }
}

checkAndCreateTestUsers().catch(console.error);
