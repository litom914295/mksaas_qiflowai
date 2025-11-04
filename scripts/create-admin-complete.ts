import 'dotenv/config';
import { getDb } from '@/db';
import { account, user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hash } from 'bcryptjs';
import { generateId } from 'better-auth'

async function createAdminComplete() {
  console.log('🔧 创建完整的管理员账号...\n');

  const email = 'admin@qiflowai.com';
  const password = 'Admin@123456';
  const name = 'Admin';

  const db = await getDb();

  // 1. 检查用户是否存在
  const existingUser = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  let userId: string;

  if (existingUser.length > 0) {
    console.log('✅ 用户已存在:', existingUser[0].id);
    userId = existingUser[0].id;
    
    // 更新为admin角色
    await db
      .update(user)
      .set({ 
        role: 'admin',
        emailVerified: true // 设置邮箱已验证
      })
      .where(eq(user.id, userId));
    console.log('✅ 更新用户为管理员角色并验证邮箱');
  } else {
    // 创建新用户
    const newUser = await db
      .insert(user)
      .values({
        email,
        name,
        role: 'admin',
        emailVerified: true,
      })
      .returning();
    
    userId = newUser[0].id;
    console.log('✅ 创建新用户:', userId);
  }

  // 2. 检查credential账号是否存在
  const existingAccount = await db
    .select()
    .from(account)
    .where(eq(account.userId, userId))
    .limit(1);

  if (existingAccount.length > 0) {
    console.log('⚠️  账号记录已存在，删除旧记录...');
    await db.delete(account).where(eq(account.userId, userId));
  }

  // 3. 创建credential账号并设置密码
  const hashedPassword = await hash(password, 10);
  
  await db.insert(account).values({
    id: generateId(), // 生成唯一ID
    userId,
    accountId: email, // Better Auth 使用 email 作为 accountId
    providerId: 'credential',
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('✅ 创建 credential 账号并设置密码');
  console.log('\n📝 管理员登录信息：');
  console.log('  邮箱:', email);
  console.log('  密码:', password);
  console.log('\n✅ 管理员账号创建完成！');
}

createAdminComplete()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 创建失败:', error);
    process.exit(1);
  });
