import path from 'node:path';
import dotenv from 'dotenv';

// 优先加载 .env.local，其次加载 .env
const localEnvPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: localEnvPath });
dotenv.config();

// 使用 Node 18+ 原生 fetch

async function main() {
  const baseURL = process.env.SEED_BASE_URL || 'http://localhost:3000';
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || 'Admin';

  if (!email || !password) {
    console.error('缺少 ADMIN_EMAIL 或 ADMIN_PASSWORD 环境变量');
    process.exit(1);
  }

  // 1) 调用 Better Auth 注册 API（幂等：如果已存在会返回错误，后续直接提权）
  try {
    const res = await fetch(`${baseURL}/api/auth/sign-up/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.warn('注册可能已存在，继续提权:', res.status, text);
    }
  } catch (e) {
    console.warn('注册请求失败（可能用户已存在），继续提权');
  }

  // 2) 将该用户设为 admin 角色
  const { getDb } = await import('../src/db/index');
  const { users } = await import('../src/db/schema/auth');
  const { eq } = await import('drizzle-orm');
  const db = await getDb();

  // 通过 email 查找用户
  const found = await db
    .select()
    .from(users)
    .where(eq(users.email, email as string))
    .limit(1);
  if (!found || found.length === 0) {
    console.error('未找到刚注册/已存在的用户，无法提权');
    process.exit(1);
  }

  const userId = found[0].id;
  await db.update(users).set({ role: 'admin' }).where(eq(users.id, userId));

  console.log('✅ 管理员用户已就绪');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
