import 'dotenv/config';
import { getDb } from '@/db';
import { account, user } from '@/db/schema';
import { auth } from '@/lib/auth';
import { and, eq } from 'drizzle-orm';

async function resetAdminPassword() {
  console.log('🔐 使用 Better Auth 方式重置管理员密码...\n');

  const email = 'admin@qiflowai.com';
  const password = 'Admin@123456';

  const db = await getDb();

  // 1. 查找用户
  const users = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (users.length === 0) {
    console.error('❌ 用户不存在');
    process.exit(1);
  }

  const foundUser = users[0];
  console.log('✅ 找到用户:', foundUser.id);

  // 2. 使用 Better Auth 的密码哈希函数
  console.log('\n🔒 使用 Better Auth 加密密码...');
  const hashedPassword = await auth.password.hash(password);

  console.log('哈希信息:');
  console.log('- 长度:', hashedPassword.length);
  console.log('- 前60字符:', hashedPassword.substring(0, 60));
  console.log('- 格式:', hashedPassword.substring(0, 4));

  // 3. 更新密码
  const accounts = await db
    .select()
    .from(account)
    .where(
      and(
        eq(account.userId, foundUser.id),
        eq(account.providerId, 'credential')
      )
    )
    .limit(1);

  if (accounts.length === 0) {
    console.error('❌ 未找到 credential 账号');
    process.exit(1);
  }

  await db
    .update(account)
    .set({
      password: hashedPassword,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(account.userId, foundUser.id),
        eq(account.providerId, 'credential')
      )
    );

  console.log('\n✅ 密码已更新！');

  // 4. 验证新密码
  console.log('\n🔍 验证新密码...');
  const isValid = await auth.password.verify(password, hashedPassword);
  console.log('验证结果:', isValid ? '✅ 通过' : '❌ 失败');

  console.log('\n📝 管理员登录信息：');
  console.log('  邮箱:', email);
  console.log('  密码:', password);
  console.log('\n✅ 完成！请重新尝试登录。');

  process.exit(0);
}

resetAdminPassword().catch((error) => {
  console.error('\n❌ 重置失败:', error);
  process.exit(1);
});
