import 'dotenv/config';
import { getDb } from '@/db';
import { account, user } from '@/db/schema';
import { compare } from 'bcryptjs';
import { eq } from 'drizzle-orm';

async function testPassword() {
  const email = 'admin@qiflowai.com';
  const testPassword = 'Admin@123456';

  console.log('🔐 测试密码验证...\n');
  console.log('测试密码:', testPassword);

  const db = await getDb();

  // 获取用户
  const users = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (users.length === 0) {
    console.error('❌ 用户不存在');
    return;
  }

  const userId = users[0].id;
  console.log('\n✅ 找到用户:', userId);
  console.log('邮箱验证状态:', users[0].emailVerified ? '已验证' : '未验证');

  // 获取账号
  const accounts = await db
    .select()
    .from(account)
    .where(eq(account.userId, userId));

  if (accounts.length === 0) {
    console.error('❌ 未找到账号记录');
    return;
  }

  console.log('\n📋 账号信息：');
  for (const acc of accounts) {
    console.log(`  Provider: ${acc.providerId}`);
    console.log(`  Account ID: ${acc.accountId}`);

    if (acc.providerId === 'credential' && acc.password) {
      console.log(`  密码哈希: ${acc.password.substring(0, 30)}...`);

      // 测试密码验证
      console.log('\n🔍 测试密码验证...');
      const isValid = await compare(testPassword, acc.password);

      if (isValid) {
        console.log('✅ 密码验证成功！');
      } else {
        console.log('❌ 密码验证失败！');
        console.log('\n可能的原因：');
        console.log('1. 密码哈希算法不匹配');
        console.log('2. 密码实际存储的值与测试的不同');
      }
    }
  }
}

testPassword()
  .then(() => {
    console.log('\n✅ 测试完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 测试失败:', error);
    process.exit(1);
  });
