import 'dotenv/config';
import { getDb } from '@/db';
import { account, user } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function checkUser(email: string) {
  const db = await getDb();
  const users = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
  if (users.length === 0) {
    console.log('User not found:', email);
    return;
  }
  const u = users[0];
  console.log('User:', u.id, u.email);
  const accounts = await db
    .select()
    .from(account)
    .where(eq(account.userId, u.id));
  for (const a of accounts) {
    console.log(
      `- providerId=${a.providerId}, accountId=${a.accountId}, hasPassword=${!!a.password}, pwdLen=${a.password?.length}`
    );
  }
}

(async () => {
  await checkUser('test@example.com');
  await checkUser('newtest1@example.com');
  await checkUser('bettertest@example.com');
  process.exit(0);
})();
