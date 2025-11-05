import 'dotenv/config';
import { getDb } from '@/db';
import { account, user } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function checkAdminAccount() {
  console.log('🔍 检查管理员账号...\n');

  const db = await getDb();

  // 查找管理员用户
  const adminUser = await db
    .select()
    .from(user)
    .where(eq(user.email, 'admin@qiflowai.com'))
    .limit(1);

  if (adminUser.length === 0) {
    console.error('❌ 未找到管理员账号 admin@qiflowai.com');
    console.log('\n💡 请运行以下命令创建管理员账号：');
    console.log('npm run db:seed');
    return;
  }

  console.log('✅ 找到管理员用户：');
  console.log('  ID:', adminUser[0].id);
  console.log('  邮箱:', adminUser[0].email);
  console.log('  名称:', adminUser[0].name);
  console.log('  创建时间:', adminUser[0].createdAt);
  console.log('  邮箱验证:', adminUser[0].emailVerified ? '已验证' : '未验证');

  // 查找关联的账号（密码存储位置）
  const accounts = await db
    .select()
    .from(account)
    .where(eq(account.userId, adminUser[0].id));

  console.log('\n📋 关联账号信息：');
  if (accounts.length === 0) {
    console.error('❌ 未找到关联的账号记录（密码信息）');
    console.log('\n💡 这意味着密码没有正确设置。请重新运行 seed 脚本：');
    console.log('npm run db:seed');
    return;
  }

  for (const acc of accounts) {
    console.log(`\n  账号类型: ${acc.providerId}`);
    console.log(`  账号ID: ${acc.accountId}`);
    console.log(`  密码已设置: ${acc.password ? '是' : '否'}`);
    if (acc.password) {
      console.log(`  密码哈希: ${acc.password.substring(0, 20)}...`);
    }
  }

  // 检查是否有 credential 类型的账号
  const credentialAccount = accounts.find((a) => a.providerId === 'credential');
  if (!credentialAccount) {
    console.error('\n❌ 未找到 credential 类型的账号');
    console.log('💡 需要创建 credential 账号以支持邮箱密码登录');
  } else if (!credentialAccount.password) {
    console.error('\n❌ credential 账号存在但密码未设置');
  } else {
    console.log('\n✅ credential 账号配置正常，密码已设置');
    console.log('\n📝 请使用以下凭据登录：');
    console.log('  邮箱: admin@qiflowai.com');
    console.log('  密码: Admin@123456');
  }
}

checkAdminAccount()
  .then(() => {
    console.log('\n✅ 检查完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 检查失败:', error);
    process.exit(1);
  });
