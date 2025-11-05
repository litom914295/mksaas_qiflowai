import 'dotenv/config';
import { randomBytes } from 'crypto';
import { getDb } from '@/db';
import { account, user } from '@/db/schema';
import { scryptAsync } from '@noble/hashes/scrypt';
import { bytesToHex } from '@noble/hashes/utils';
import { and, eq } from 'drizzle-orm';

async function scryptHash(password: string) {
  // mirror better-auth defaults
  const N = 16384,
    r = 16,
    p = 1,
    dkLen = 64;
  const saltBytes = randomBytes(16);
  const saltHex = bytesToHex(saltBytes);
  const key = await scryptAsync(password.normalize('NFKC'), saltHex, {
    N,
    r,
    p,
    dkLen,
    maxmem: 128 * N * r * 2,
  });
  const keyHex = bytesToHex(key);
  return `${saltHex}:${keyHex}`;
}

async function rehash(email: string, plain: string) {
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
  const accs = await db
    .select()
    .from(account)
    .where(and(eq(account.userId, u.id), eq(account.providerId, 'credential')))
    .limit(1);
  if (accs.length === 0) {
    console.log('Credential account not found:', email);
    return;
  }
  const current = accs[0].password || '';
  if (typeof current === 'string' && current.includes(':')) {
    console.log('Already scrypt format, skip:', email);
    return;
  }
  const newHash = await scryptHash(plain);
  await db
    .update(account)
    .set({ password: newHash, updatedAt: new Date() })
    .where(and(eq(account.userId, u.id), eq(account.providerId, 'credential')));
  console.log('✅ Rehashed to scrypt for:', email);
}

(async () => {
  await rehash('admin@qiflowai.com', 'Admin@123456');
  await rehash('test@example.com', 'password123');
  await rehash('newtest1@example.com', 'password123');
  console.log('Done.');
  process.exit(0);
})();
