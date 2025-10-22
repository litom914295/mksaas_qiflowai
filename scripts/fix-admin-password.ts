import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function fixAdminPassword() {
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

  const adminEmail = 'admin@mksaas.com';
  const adminPassword = 'admin123456';

  console.log('修复管理员用户密码...');

  try {
    // 生成 bcrypt 密码哈希
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    console.log('生成密码哈希:', hashedPassword);

    // 在 user 表中添加密码字段（如果需要）
    const { data, error } = await supabase
      .from('user')
      .update({
        // 注意：Supabase Auth 不会在 user 表中存储密码
        // 密码存储在 auth.users 表中
        updated_at: new Date().toISOString(),
      })
      .eq('email', adminEmail);

    if (error) {
      console.error('更新用户失败:', error);
    } else {
      console.log('✅ 用户记录已更新');
    }

    // 重置 Supabase Auth 密码
    console.log('\n重置 Supabase Auth 密码...');

    // 使用 admin API 更新密码
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const adminUser = authUsers?.users?.find((u) => u.email === adminEmail);

    if (adminUser) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        adminUser.id,
        { password: adminPassword }
      );

      if (updateError) {
        console.error('更新密码失败:', updateError);
      } else {
        console.log('✅ Supabase Auth 密码已更新');
      }
    }

    // 测试登录
    console.log('\n测试登录...');
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });

    if (signInError) {
      console.error('登录失败:', signInError);
    } else {
      console.log('✅ 登录成功!');
      console.log('用户 ID:', signInData.user?.id);
      console.log('Session:', signInData.session ? '已创建' : '未创建');
    }
  } catch (error) {
    console.error('操作失败:', error);
  }

  console.log('\n\n登录信息:');
  console.log('邮箱: admin@mksaas.com');
  console.log('密码: admin123456');
  console.log('登录地址: http://localhost:3000/zh-CN/auth/login');
}

fixAdminPassword().catch(console.error);
