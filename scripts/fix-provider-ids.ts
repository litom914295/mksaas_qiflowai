import 'dotenv/config';
import { getDb } from '@/db';
import { account, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { generateId } from 'better-auth';

async function ensureEmailProvider(email: string) {
  const db = await getDb();
  const users = await db.select().from(user).where(eq(user.email, email)).limit(1);
  if (users.length === 0) {
    console.log('User not found, skip:', email);
    return;
  }
  const u = users[0];
  const accounts = await db.select().from(account).where(eq(account.userId, u.id));
  const cred = accounts.find(a => a.providerId === 'credential');
  const emailAcc = accounts.find(a => a.providerId === 'email');

  if (!cred) {
    console.log('No credential account, skip:', email);
    return;
  }

  if (!emailAcc) {
    await db.insert(account).values({
      id: generateId(),
      userId: u.id,
      providerId: 'email',
      accountId: email, // Better Auth expects email as accountId
      password: cred.password,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('✅ Added email provider account for', email);
  } else {
    // ensure fields
    await db.update(account).set({ accountId: email, updatedAt: new Date() }).where(and(eq(account.userId, u.id), eq(account.providerId, 'email')));
    console.log('✅ Updated existing email provider account for', email);
  }
}

(async () => {
  await ensureEmailProvider('test@example.com');
  await ensureEmailProvider('newtest1@example.com');
  await ensureEmailProvider('admin@qiflowai.com');
  console.log('Done.');
  process.exit(0);
})();
