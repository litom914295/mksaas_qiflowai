import 'dotenv/config';
import { getDb } from '@/db';
import { account, user } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { and, eq } from 'drizzle-orm';

async function fixAdminPassword() {
  console.log('🔐 修复管理员密码...\n');

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

  // 2. 生成新的 bcrypt 哈希
  console.log('\n🔒 生成新的密码哈希...');
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  console.log('哈希信息:');
  console.log('- 长度:', hashedPassword.length);
  console.log('- 格式:', hashedPassword.substring(0, 7));

  // 3. 验证
  const testVerify = bcrypt.compareSync(password, hashedPassword);
  console.log('验证:', testVerify ? '✅ 通过' : '❌ 失败');

  if (!testVerify) {
    console.error('❌ 哈希验证失败！');
    process.exit(1);
  }

  // 4. 更新密码
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
  console.log('\n📝 登录信息:');
  console.log('  邮箱:', email);
  console.log('  密码:', password);

  process.exit(0);
}

fixAdminPassword().catch((error) => {
  console.error('\n❌ 失败:', error);
  process.exit(1);
});
