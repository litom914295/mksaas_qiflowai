import { randomUUID } from 'crypto';
import { getDb } from '@/db';
import { creditTransaction, user, userCredit } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * 创建测试用户
 */
export async function createTestUser(
  overrides: {
    email?: string;
    name?: string;
    role?: string;
    credits?: number;
  } = {}
) {
  const db = await getDb();
  const userId = randomUUID();
  const email =
    overrides.email ||
    `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;

  // 创建用户
  await db.insert(user).values({
    id: userId,
    email,
    name: overrides.name || 'Test User',
    emailVerified: true,
    role: overrides.role || 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // 创建积分记录
  const initialCredits =
    overrides.credits !== undefined ? overrides.credits : 100;
  await db.insert(userCredit).values({
    id: randomUUID(),
    userId,
    currentCredits: initialCredits,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return {
    id: userId,
    email,
    name: overrides.name || 'Test User',
    role: overrides.role || 'user',
    credits: initialCredits,
  };
}

/**
 * 创建测试管理员
 */
export async function createTestAdmin(overrides = {}) {
  return createTestUser({
    role: 'admin',
    name: 'Admin User',
    ...overrides,
  });
}

/**
 * 获取测试用户的积分余额
 */
export async function getTestUserCredits(userId: string): Promise<number> {
  const db = await getDb();
  const record = await db
    .select({ currentCredits: userCredit.currentCredits })
    .from(userCredit)
    .where(eq(userCredit.userId, userId))
    .limit(1);

  return record[0]?.currentCredits || 0;
}

/**
 * 获取用户的积分交易记录
 */
export async function getTestUserTransactions(userId: string) {
  const db = await getDb();
  return await db
    .select()
    .from(creditTransaction)
    .where(eq(creditTransaction.userId, userId))
    .orderBy(creditTransaction.createdAt);
}

/**
 * 清理测试数据
 */
export async function cleanupTestData() {
  const db = await getDb();

  try {
    // 删除所有测试用户（邮箱包含 test-）
    await db.delete(user).where(
      // @ts-ignore - Drizzle ORM 类型问题
      sql`email LIKE 'test-%@example.com'`
    );

    console.log('测试数据清理完成');
  } catch (error) {
    console.error('清理测试数据失败:', error);
  }
}

/**
 * 清理特定用户的数据
 */
export async function cleanupTestUser(userId: string) {
  const db = await getDb();

  try {
    // Drizzle ORM 会自动处理级联删除
    await db.delete(user).where(eq(user.id, userId));
  } catch (error) {
    console.error('清理测试用户失败:', error);
  }
}

/**
 * 等待一段时间（用于异步操作）
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 重置用户积分到指定值
 */
export async function resetUserCredits(userId: string, credits: number) {
  const db = await getDb();
  await db
    .update(userCredit)
    .set({ currentCredits: credits, updatedAt: new Date() })
    .where(eq(userCredit.userId, userId));
}
