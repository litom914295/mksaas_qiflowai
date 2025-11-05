import 'dotenv/config';
import { getDb } from '@/db';
import { account } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

async function checkPasswordHash() {
  console.log('🔍 检查密码哈希格式...\n');

  const db = await getDb();

  const accounts = await db
    .select()
    .from(account)
    .where(
      and(
        eq(account.accountId, 'admin@qiflowai.com'),
        eq(account.providerId, 'credential')
      )
    )
    .limit(1);

  if (accounts.length === 0) {
    console.error('❌ 未找到 admin 账号');
    process.exit(1);
  }

  const acc = accounts[0];
  const passwordHash = acc.password;

  if (!passwordHash) {
    console.error('❌ 密码字段为空');
    process.exit(1);
  }

  console.log('密码哈希信息:');
  console.log('- 长度:', passwordHash.length);
  console.log('- 前60字符:', passwordHash.substring(0, 60));
  console.log(
    '- 格式:',
    passwordHash.startsWith('$2a$') || passwordHash.startsWith('$2b$')
      ? 'bcrypt'
      : '未知'
  );

  // 检查是否是有效的 bcrypt 哈希
  const bcryptRegex = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;
  const isValidBcrypt = bcryptRegex.test(passwordHash);

  console.log('- 是否有效的 bcrypt:', isValidBcrypt ? '✅ 是' : '❌ 否');

  if (!isValidBcrypt) {
    console.log('\n⚠️  密码哈希格式不正确！');
    console.log('可能原因：');
    console.log('1. 使用了错误的哈希算法');
    console.log('2. 密码未正确加密');
    console.log('3. 数据迁移时出错');

    console.log('\n修复方法：重新生成正确的密码哈希');
  } else {
    console.log('\n✅ 密码哈希格式正确');
  }

  process.exit(0);
}

checkPasswordHash().catch(console.error);
