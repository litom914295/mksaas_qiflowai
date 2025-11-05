import 'dotenv/config';
import { getDb } from '@/db';
import { account, user } from '@/db/schema';
import { compare } from 'bcryptjs';
import { and, eq } from 'drizzle-orm';

async function debugLogin() {
  const email = 'admin@qiflowai.com';
  const password = 'Admin@123456';

  console.log('🔍 调试登录流程...\n');
  console.log('邮箱:', email);
  console.log('密码:', password);

  const db = await getDb();

  // 步骤1: 查找用户（Better Auth做的第一步）
  console.log('\n📝 步骤1: 查找用户...');
  const users = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (users.length === 0) {
    console.error('❌ 用户不存在 - 这会导致401');
    return;
  }

  const foundUser = users[0];
  console.log('✅ 找到用户:', foundUser.id);
  console.log('   邮箱:', foundUser.email);
  console.log('   邮箱验证:', foundUser.emailVerified);
  console.log('   角色:', foundUser.role);
  console.log('   封禁状态:', foundUser.banned);

  // 步骤2: 查找credential账号（Better Auth做的第二步）
  console.log('\n📝 步骤2: 查找credential账号...');
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
    console.error('❌ 未找到credential账号 - 这会导致401');
    console.log('\n💡 尝试用 accountId 查询:');
    const accountsByEmail = await db
      .select()
      .from(account)
      .where(eq(account.accountId, email))
      .limit(1);

    if (accountsByEmail.length > 0) {
      console.log('✅ 找到账号:', accountsByEmail[0]);
      console.log(
        '   但 userId 不匹配:',
        accountsByEmail[0].userId,
        '!=',
        foundUser.id
      );
    }
    return;
  }

  const credentialAccount = accounts[0];
  console.log('✅ 找到credential账号');
  console.log('   Account ID:', credentialAccount.accountId);
  console.log('   User ID:', credentialAccount.userId);
  console.log('   密码已设置:', !!credentialAccount.password);

  // 步骤3: 验证密码（Better Auth做的第三步）
  if (!credentialAccount.password) {
    console.error('❌ 密码未设置 - 这会导致401');
    return;
  }

  console.log('\n📝 步骤3: 验证密码...');
  const isValid = await compare(password, credentialAccount.password);

  if (isValid) {
    console.log('✅ 密码验证成功！');
  } else {
    console.error('❌ 密码验证失败 - 这会导致401');
    console.log(
      '   存储的哈希:',
      credentialAccount.password.substring(0, 30) + '...'
    );
  }

  // 步骤4: 检查邮箱验证（如果requireEmailVerification=true）
  console.log('\n📝 步骤4: 检查邮箱验证要求...');
  console.log('   requireEmailVerification: false (在auth.ts中设置)');
  console.log('   emailVerified:', foundUser.emailVerified);
  if (!foundUser.emailVerified) {
    console.log(
      '⚠️  邮箱未验证，但由于requireEmailVerification=false，应该允许登录'
    );
  } else {
    console.log('✅ 邮箱已验证');
  }

  // 步骤5: 检查用户是否被封禁
  console.log('\n📝 步骤5: 检查封禁状态...');
  if (foundUser.banned) {
    console.error('❌ 用户已被封禁 - 这会导致401');
  } else {
    console.log('✅ 用户未被封禁');
  }

  console.log('\n' + '='.repeat(50));
  console.log('🎯 诊断结果:');
  console.log('='.repeat(50));

  if (isValid && !foundUser.banned) {
    console.log('✅ 所有检查通过，登录应该成功');
    console.log('\n💡 如果登录仍然失败，可能的原因:');
    console.log('1. Better Auth版本问题');
    console.log('2. 数据库schema与Better Auth期望不匹配');
    console.log('3. baseURL配置问题导致cookie设置失败');
  } else {
    console.log('❌ 登录失败，原因如上所示');
  }
}

debugLogin()
  .then(() => {
    console.log('\n✅ 调试完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 调试失败:', error);
    process.exit(1);
  });
