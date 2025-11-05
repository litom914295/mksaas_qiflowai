import 'dotenv/config';

async function createViaAPI() {
  console.log('🔧 通过 Better Auth 1.2.8 创建测试用户...\n');

  const email = 'bettertest@example.com';
  const password = 'Test123456!';
  const name = 'Better Test';

  try {
    const response = await fetch(
      'http://localhost:3000/api/auth/sign-up/email',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ 注册失败:', data);
      process.exit(1);
    }

    console.log('✅ 注册成功!');
    console.log('用户信息:', data.user);

    console.log('\n📝 测试账号：');
    console.log('  邮箱:', email);
    console.log('  密码:', password);
    console.log('\n🎯 请使用此账号测试登录');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 请求失败:', error);
    console.error('\n💡 请确保开发服务器正在运行: npm run dev');
    process.exit(1);
  }
}

createViaAPI();
