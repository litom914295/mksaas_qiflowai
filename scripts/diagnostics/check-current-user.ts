/**
 * 检查当前登录用户信息
 */
import { getDb } from '@/db';
import { session, user } from '@/db/schema';
import { desc } from 'drizzle-orm';

async function checkCurrentUser() {
  console.log('========================================');
  console.log('🔍 检查当前登录用户');
  console.log('========================================\n');

  try {
    const db = await getDb();

    // 获取所有用户
    console.log('📍 步骤1: 获取所有用户...');
    const allUsers = await db.select().from(user);
    console.log(`✅ 找到 ${allUsers.length} 个用户\n`);

    allUsers.forEach((u, index) => {
      console.log(`${index + 1}. ${u.email || 'No Email'}`);
      console.log(`   ID: ${u.id}`);
      console.log(`   名称: ${u.name || 'No Name'}`);
      console.log(`   创建时间: ${u.createdAt}`);
      console.log('');
    });

    // 获取最近的会话
    console.log('📍 步骤2: 获取最近的会话...');
    const recentSessions = await db
      .select()
      .from(session)
      .orderBy(desc(session.updatedAt))
      .limit(5);

    console.log(`✅ 找到 ${recentSessions.length} 个最近会话\n`);

    recentSessions.forEach((s, index) => {
      console.log(`${index + 1}. 会话 ID: ${s.id}`);
      console.log(`   用户 ID: ${s.userId}`);
      console.log(`   更新时间: ${s.updatedAt}`);
      console.log(`   过期时间: ${s.expiresAt}`);
      console.log('');
    });

    console.log('========================================');
    console.log('✅ 检查完成');
    console.log('========================================');
  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error);
    throw error;
  }
}

// 执行检查
if (require.main === module) {
  checkCurrentUser()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('脚本执行失败:', error);
      process.exit(1);
    });
}

export { checkCurrentUser };
