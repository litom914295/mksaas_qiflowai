import 'dotenv/config';
import { getDb } from '@/db';
import { account, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

async function checkAllPasswords() {
  console.log('🔍 检查所有用户的密码...\n');

  const db = await getDb();

  const users = await db.select().from(user);
  
  console.log(`找到 ${users.length} 个用户:\n`);

  for (const u of users) {
    console.log(`用户: ${u.email}`);
    console.log(`  ID: ${u.id}`);
    
    const accounts = await db
      .select()
      .from(account)
      .where(and(
        eq(account.userId, u.id),
        eq(account.providerId, 'credential')
      ))
      .limit(1);
    
    if (accounts.length === 0) {
      console.log(`  ❌ 没有 credential account`);
    } else {
      const pwd = accounts[0].password;
      if (pwd) {
        console.log(`  ✅ 密码存在: ${pwd.substring(0, 10)}...`);
      } else {
        console.log(`  ❌ 密码为 NULL/undefined`);
      }
    }
    console.log('');
  }

  process.exit(0);
}

checkAllPasswords().catch(console.error);
