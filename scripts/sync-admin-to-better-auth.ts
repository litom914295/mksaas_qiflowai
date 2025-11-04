import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function syncAdminUser() {
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

  // 获取管理员用户
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@qiflowai.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';

  console.log(`查找管理员用户: ${adminEmail}`);

  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const adminUser = existingUsers?.users?.find((u) => u.email === adminEmail);

  if (!adminUser) {
    console.error('未找到管理员用户');
    return;
  }

  console.log(`找到管理员用户，ID: ${adminUser.id}`);

  // 直接在数据库中创建用户记录
  const { getDb } = await import('../src/db/index');
  const { users } = await import('../src/db/schema/auth');
  const { eq } = await import('drizzle-orm');

  try {
    const db = await getDb();

    // 检查用户是否已存在
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    if (existingUser.length > 0) {
      console.log('用户已存在于 Better Auth 表中');

      // 更新为管理员角色
      await db
        .update(users)
        .set({
          role: 'admin',
          emailVerified: true,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser[0].id));

      console.log('✅ 用户角色已更新为 admin');
    } else {
      // 创建新用户记录
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      const newUser = {
        id: adminUser.id,
        email: adminEmail,
        name: adminUser.user_metadata?.name || 'Admin',
        emailVerified: true,
        role: 'admin',
        banned: false,
        createdAt: new Date(adminUser.created_at),
        updatedAt: new Date(),
      };

      await db.insert(users).values(newUser);
      console.log('✅ 管理员用户已添加到 Better Auth 表');
    }

    // 测试登录
    console.log('\n现在你可以使用以下凭据登录:');
    console.log(`邮箱: ${adminEmail}`);
    console.log(`密码: ${adminPassword}`);
    console.log('登录地址: http://localhost:3000/zh-CN/auth/login');
  } catch (error) {
    console.error('数据库操作失败:', error);

    // 如果是连接错误，尝试初始化数据库表
    if (error.message?.includes('Tenant or user not found')) {
      console.log('\n数据库连接问题，可能需要重新配置数据库URL');
      console.log('请检查 Supabase 项目设置中的数据库连接字符串');
    }
  }
}

syncAdminUser().catch(console.error);
