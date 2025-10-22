import path from 'node:path';
import dotenv from 'dotenv';

// 加载环境变量
const localEnvPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: localEnvPath });
dotenv.config();

async function main() {
  const { getDb } = await import('../src/db/index');
  const { user } = await import('../src/db/schema');

  const db = await getDb();

  console.log('\n📝 列出所有用户:');

  // 查询所有用户
  const allUsers = await db
    .select({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })
    .from(user);

  if (allUsers.length === 0) {
    console.log('❌ 数据库中没有用户');
    process.exit(1);
  }

  console.log(`\n找到 ${allUsers.length} 个用户:\n`);
  allUsers.forEach((user: any, index: number) => {
    console.log(
      `${index + 1}. ${user.email} (${user.name}) - ID: ${user.id} - 角色: ${user.role}`
    );
  });

  // 查找demo用户
  const demoUser = allUsers.find(
    (u: any) =>
      u.email?.includes('demo') || u.name?.toLowerCase().includes('demo')
  );

  if (!demoUser) {
    console.log('\n⚠️  未找到demo用户');
    console.log('请使用以下命令手动指定用户ID:');
    console.log('  node scripts/add-credits-direct.ts <userId> <amount>');
    process.exit(1);
  }

  console.log(`\n✅ 找到demo用户: ${demoUser.email} (${demoUser.name})`);
  console.log(`   用户ID: ${demoUser.id}`);

  // 添加积分
  const amount = 5000;

  try {
    const { creditsManager } = await import('../src/lib/credits/manager');

    // 获取当前积分
    const currentBalance = await creditsManager.getBalance(demoUser.id);
    console.log(`\n💰 当前积分: ${currentBalance}`);

    console.log(`\n➕ 添加 ${amount} 积分...`);
    const success = await creditsManager.addCredits(demoUser.id, amount);

    if (success) {
      const newBalance = await creditsManager.getBalance(demoUser.id);
      console.log('✅ 积分添加成功!');
      console.log(`   新余额: ${newBalance}`);
      console.log(`   增加: +${newBalance - currentBalance}`);

      console.log('\n🎉 Demo用户现在可以充分测试所有功能了!');
      console.log('\n📝 测试功能列表:');
      console.log('   - AI对话 (5积分/次)');
      console.log('   - 八字分析 (10积分/次)');
      console.log('   - 玄空风水本地模式 (20积分/次)');
      console.log('   - 玄空风水基础分析 (30积分/次)');
      console.log('   - 玄空风水标准分析 (50积分/次)');
      console.log('   - 玄空风水综合分析 (80积分/次)');
      console.log('   - 玄空风水专家分析 (120积分/次)');
      console.log('   - PDF导出 (5积分/次)');
      console.log('   - 深度解读 (30积分/次)');
    } else {
      console.error('❌ 添加积分失败');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ 操作失败:', error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('❌ 脚本执行失败:', err);
  process.exit(1);
});
