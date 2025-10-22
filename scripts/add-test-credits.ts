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

  // 可以通过命令行参数指定邮箱和积分数量
  const email = process.argv[2] || 'test@example.com';
  const amount = Number.parseInt(process.argv[3] || '1000', 10);

  console.log(`\n🔍 查找用户: ${email}`);

  // 使用原生SQL查询用户
  const result = await db.execute(sql`
    SELECT id, email, name, role 
    FROM "user" 
    WHERE email = ${email}
    LIMIT 1
  `);

  const found = result.rows || [];

  if (!found || found.length === 0) {
    console.error(`❌ 未找到用户: ${email}`);
    console.log('\n💡 提示: 你可以先运行以下命令创建测试用户:');
    console.log('   npm run script:create-test-user');
    console.log('\n或者指定其他用户邮箱:');
    console.log('   npm run script:add-test-credits <email> <amount>');
    process.exit(1);
  }

  const user = found[0];
  console.log(`✅ 找到用户: ${user.name} (${user.email})`);
  console.log(`   用户ID: ${user.id}`);
  console.log(`   角色: ${user.role}`);

  // 查询当前积分
  const { getUserCredits } = await import('../src/credits/credits');
  const currentCredits = await getUserCredits(user.id);
  console.log(`\n💰 当前积分: ${currentCredits}`);

  // 添加积分
  console.log(`\n➕ 添加 ${amount} 积分...`);

  try {
    await addCredits({
      userId: user.id,
      amount: amount,
      type: CREDIT_TRANSACTION_TYPE.MANUAL_ADJUSTMENT,
      description: `测试积分 - 手动添加 ${amount} 积分`,
      expireDays: 365, // 1年有效期
    });

    const newCredits = await getUserCredits(user.id);
    console.log('✅ 积分添加成功!');
    console.log(`   新余额: ${newCredits}`);
    console.log(`   增加: +${newCredits - currentCredits}`);

    console.log('\n📝 测试账户信息:');
    console.log(`   邮箱: ${email}`);
    console.log('   密码: test123456 (默认)');
    console.log(`   积分余额: ${newCredits}`);
    console.log('\n🎉 现在你可以使用这个账户进行测试了!');
  } catch (error) {
    console.error('❌ 添加积分失败:', error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('❌ 脚本执行失败:', err);
  process.exit(1);
});
