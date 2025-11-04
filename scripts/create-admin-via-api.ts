import 'dotenv/config';
import { getDb } from '@/db';
import { user, account } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function createAdminViaAPI() {
  console.log('🔧 通过 Better Auth API 创建管理员...\n');

  const email = 'admin@qiflowai.com';
  const password = 'Admin@123456';
  const name = 'Admin';

  try {
    // 调用 Better Auth 的 sign-up API
    const response = await fetch('http://localhost:3002/api/auth/sign-up/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        name,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ 注册失败:', errorData);
      
      // 如果用户已存在，删除后重试
      if (errorData.message?.includes('already exists') || errorData.message?.includes('already')) {
        console.log('\n⚠️  用户已存在，删除旧用户后重试...');
        const db = await getDb();
        
        // 删除旧用户（cascade 会自动删除关联的 account）
        await db.delete(user).where(eq(user.email, email));
        console.log('✅ 已删除旧用户');
        
        // 重试
        console.log('\n🔄 重新创建用户...');
        const retryResponse = await fetch('http://localhost:3002/api/auth/sign-up/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            name,
          }),
        });
        
        if (!retryResponse.ok) {
          const retryError = await retryResponse.json();
          console.error('❌ 重试失败:', retryError);
          process.exit(1);
        }
        
        const retryData = await retryResponse.json();
        console.log('✅ 重试成功!');
        console.log('用户ID:', retryData.user?.id);
      } else {
        process.exit(1);
      }
    } else {
      const data = await response.json();
      console.log('✅ 创建成功!');
      console.log('用户ID:', data.user?.id);
    }

    // 更新用户角色为 admin
    console.log('\n🔐 设置管理员角色...');
    const db = await getDb();
    
    const users = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);
    
    if (users.length === 0) {
      console.error('❌ 找不到刚创建的用户');
      process.exit(1);
    }
    
    await db
      .update(user)
      .set({
        role: 'admin',
        emailVerified: true,
      })
      .where(eq(user.id, users[0].id));
    
    console.log('✅ 已设置为管理员角色');
    
    console.log('\n📝 管理员登录信息：');
    console.log('  邮箱:', email);
    console.log('  密码:', password);
    console.log('\n✅ 完成！现在可以登录了。');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 创建失败:', error);
    process.exit(1);
  }
}

createAdminViaAPI();
