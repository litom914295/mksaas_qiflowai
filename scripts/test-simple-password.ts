import 'dotenv/config';
import { getDb } from '@/db';
import { account, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { hash as bcryptHash, compare as bcryptCompare, genSalt } from 'bcryptjs';
import { generateId } from 'better-auth';

async function testSimplePassword() {
  console.log('🧪 测试简单密码...\n');

  const email = 'test@example.com';
  const password = 'password123'; // 简单密码
  const name = 'Test User';

  const db = await getDb();

  // 1. 删除测试用户（如果存在）
  await db.delete(user).where(eq(user.email, email));
  console.log('🗑️  清理旧测试用户');

  // 2. 创建用户
  const [newUser] = await db
    .insert(user)
    .values({
      id: generateId(),
      email,
      name,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  console.log('✅ 创建用户:', newUser.id);

  // 3. 生成密码哈希（使用标准 bcryptjs）
  const salt = await genSalt(10);
  const hashedPassword = await bcryptHash(password, salt);

  console.log('\n密码哈希信息:');
  console.log('- Salt rounds: 10');
  console.log('- 哈希长度:', hashedPassword.length);
  console.log('- 哈希前缀:', hashedPassword.substring(0, 7));
  console.log('- 完整哈希:', hashedPassword);

  // 4. 创建 account
  await db.insert(account).values({
    id: generateId(),
    userId: newUser.id,
    accountId: email,
    providerId: 'credential',
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('\n✅ 创建 account 记录');

  // 5. 验证密码
  console.log('\n🔍 验证密码...');
  const isValid = await bcryptCompare(password, hashedPassword);
  console.log('bcryptjs verify:', isValid ? '✅ 通过' : '❌ 失败');

  // 6. 从数据库读取并验证
  const accounts = await db
    .select()
    .from(account)
    .where(and(
      eq(account.userId, newUser.id),
      eq(account.providerId, 'credential')
    ))
    .limit(1);

  if (accounts.length > 0) {
    const savedHash = accounts[0].password;
    console.log('\n从数据库读取的哈希:', savedHash?.substring(0, 60));
    
    if (savedHash) {
      const dbVerify = await bcryptCompare(password, savedHash);
      console.log('数据库密码验证:', dbVerify ? '✅ 通过' : '❌ 失败');
    }
  }

  console.log('\n📝 测试用户登录信息：');
  console.log('  邮箱:', email);
  console.log('  密码:', password);
  console.log('\n💡 请使用这个测试账号尝试登录');
  console.log('   如果测试账号能登录，说明 admin 账号的密码哈希有问题');

  process.exit(0);
}

testSimplePassword().catch((error) => {
  console.error('\n❌ 测试失败:', error);
  process.exit(1);
});
