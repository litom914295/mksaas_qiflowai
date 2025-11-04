/**
 * 测试数据库注册功能
 * 运行: npx tsx scripts/test-db-registration.ts
 */

import { getDb } from '@/db';
import { creditTransaction, user, userCredit } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function testDatabaseConnection() {
  console.log('🔍 测试数据库连接和表结构...\n');

  try {
    // 1. 测试数据库连接
    console.log('1️⃣ 测试数据库连接...');
    const db = await getDb();
    console.log('   ✅ 数据库连接成功\n');

    // 2. 测试 user 表
    console.log('2️⃣ 测试 user 表...');
    try {
      const users = await db.select().from(user).limit(1);
      console.log(`   ✅ user 表存在 (找到 ${users.length} 条记录)\n`);
    } catch (error) {
      console.error('   ❌ user 表不存在或无法访问');
      console.error(
        '   错误:',
        error instanceof Error ? error.message : String(error),
        '\n'
      );
      return false;
    }

    // 3. 测试 userCredit 表
    console.log('3️⃣ 测试 userCredit 表...');
    try {
      const credits = await db.select().from(userCredit).limit(1);
      console.log(`   ✅ userCredit 表存在 (找到 ${credits.length} 条记录)\n`);
    } catch (error) {
      console.error('   ❌ userCredit 表不存在或无法访问');
      console.error(
        '   错误:',
        error instanceof Error ? error.message : String(error),
        '\n'
      );
      return false;
    }

    // 4. 测试 creditTransaction 表
    console.log('4️⃣ 测试 creditTransaction 表...');
    try {
      const transactions = await db.select().from(creditTransaction).limit(1);
      console.log(
        `   ✅ creditTransaction 表存在 (找到 ${transactions.length} 条记录)\n`
      );
    } catch (error) {
      console.error('   ❌ creditTransaction 表不存在或无法访问');
      console.error(
        '   错误:',
        error instanceof Error ? error.message : String(error),
        '\n'
      );
      return false;
    }

    // 5. 测试插入和删除（不影响实际数据）
    console.log('5️⃣ 测试数据库写入权限...');
    const testUserId = 'test-user-' + Date.now();
    try {
      // 创建测试用户
      await db.insert(user).values({
        id: testUserId,
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('   ✅ 可以插入数据');

      // 删除测试用户
      await db.delete(user).where(eq(user.id, testUserId));
      console.log('   ✅ 可以删除数据\n');
    } catch (error) {
      console.error('   ❌ 数据库写入权限不足');
      console.error(
        '   错误:',
        error instanceof Error ? error.message : String(error),
        '\n'
      );
      return false;
    }

    console.log('✅ 所有数据库测试通过！\n');
    console.log('📝 下一步：');
    console.log('   1. 重启开发服务器: npm run dev');
    console.log('   2. 清除浏览器缓存和 cookies');
    console.log('   3. 尝试注册新用户');
    console.log('   4. 查看终端日志，寻找以下标记:');
    console.log('      - ✅ 表示成功');
    console.log('      - ❌ 表示失败\n');

    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败');
    console.error(
      '错误:',
      error instanceof Error ? error.message : String(error)
    );
    console.error('\n请检查:');
    console.error('1. .env 文件中的 DATABASE_URL 是否正确');
    console.error('2. 数据库是否可以访问');
    console.error('3. 运行 npm run db:push 同步数据库 schema\n');
    return false;
  }
}

// 运行测试
testDatabaseConnection()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('测试脚本执行失败:', error);
    process.exit(1);
  });
