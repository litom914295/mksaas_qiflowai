import path from 'node:path';
import dotenv from 'dotenv';

// 加载环境变量
const localEnvPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: localEnvPath });
dotenv.config();

async function main() {
  const { getDb } = await import('../src/db/index');
  const { addCredits } = await import('../src/credits/credits');
  const { CREDIT_TRANSACTION_TYPE } = await import('../src/credits/types');
  const { sql } = await import('drizzle-orm');

  const db = await getDb();

  console.log('\n🔍 查找demo用户...');

  // 使用原生SQL查询demo用户
  const found = await db.execute(sql`
    SELECT id, email, name, role 
    FROM "user" 
    WHERE email LIKE 'demo%' 
       OR name LIKE '%demo%' 
       OR name LIKE '%Demo%'
  `);

  const users = found.rows || [];

  if (!users || users.length === 0) {
    console.error('❌ 未找到demo用户');
    console.log('\n💡 提示: 请确认demo用户的邮箱地址');
    console.log('   如果需要指定具体邮箱，可以运行:');
    console.log('   npm run add-credits <email> 5000');
    process.exit(1);
  }

  // 如果找到多个用户，显示列表
  if (users.length > 1) {
    console.log(`\n✅ 找到 ${users.length} 个demo用户:\n`);
    users.forEach((user: any, index: number) => {
      console.log(
        `${index + 1}. ${user.name} (${user.email}) - ID: ${user.id}`
      );
    });
    console.log('\n将为所有demo用户添加5000积分...\n');
  }

  const amount = 5000;

  // 为每个demo用户添加积分
  for (const user of users) {
    console.log(`\n处理用户: ${user.name} (${user.email})`);
    console.log(`   用户ID: ${user.id}`);
    console.log(`   角色: ${user.role}`);

    try {
      // 查询当前积分
      const { getUserCredits } = await import('../src/credits/credits');
      const currentCredits = await getUserCredits(user.id);
      console.log(`   当前积分: ${currentCredits}`);

      // 添加积分
      console.log(`   ➕ 添加 ${amount} 积分...`);

      await addCredits({
        userId: user.id,
        amount: amount,
        type: CREDIT_TRANSACTION_TYPE.MANUAL_ADJUSTMENT,
        description: `测试积分充值 - 为demo用户添加 ${amount} 积分用于功能测试`,
        expireDays: 365, // 1年有效期
      });

      const newCredits = await getUserCredits(user.id);
      console.log('   ✅ 积分添加成功!');
      console.log(`   新余额: ${newCredits}`);
      console.log(`   增加: +${newCredits - currentCredits}`);
    } catch (error) {
      console.error(`   ❌ 为用户 ${user.email} 添加积分失败:`, error);
    }
  }

  console.log('\n🎉 所有demo用户的积分已更新完成!');
  console.log('\n📝 测试说明:');
  console.log('   现在demo用户拥有充足的积分可以测试以下功能:');
  console.log('   - AI对话 (5积分/次)');
  console.log('   - 八字分析 (10积分/次)');
  console.log('   - 玄空风水 (20-120积分/次)');
  console.log('   - PDF导出 (5积分/次)');
  console.log('   - 深度解读 (30积分/次)');
}

main().catch((err) => {
  console.error('❌ 脚本执行失败:', err);
  process.exit(1);
});
