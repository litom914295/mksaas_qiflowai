import dotenv from 'dotenv';

dotenv.config();

const baseURL = 'http://localhost:3000';

async function testSystem() {
  console.log('🚀 开始系统完整性测试...\n');

  // 测试账户
  const accounts = [
    { email: 'admin@qiflowai.com', password: 'admin123456', role: '管理员' },
    { email: 'test@example.com', password: 'test123456', role: '普通用户' },
  ];

  let allTestsPassed = true;

  for (const account of accounts) {
    console.log(`\n📝 测试 ${account.role} 账户`);
    console.log(`邮箱: ${account.email}`);

    try {
      // 1. 测试登录
      console.log('  1. 测试登录...');
      const loginResponse = await fetch(`${baseURL}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: account.email,
          password: account.password,
        }),
      });

      if (loginResponse.ok) {
        const data = await loginResponse.json();
        console.log('     ✅ 登录成功');
        console.log(`     用户ID: ${data.user?.id}`);
      } else {
        console.log('     ❌ 登录失败');
        allTestsPassed = false;
        continue;
      }

      // 2. 测试获取会话
      console.log('  2. 测试获取会话...');
      const sessionResponse = await fetch(`${baseURL}/api/auth/session`, {
        credentials: 'include',
      });

      if (sessionResponse.ok) {
        console.log('     ✅ 会话有效');
      } else {
        console.log('     ❌ 会话无效');
        allTestsPassed = false;
      }

      // 3. 测试登出
      console.log('  3. 测试登出...');
      const logoutResponse = await fetch(`${baseURL}/api/auth/sign-out`, {
        method: 'POST',
        credentials: 'include',
      });

      if (logoutResponse.ok) {
        console.log('     ✅ 登出成功');
      } else {
        console.log('     ❌ 登出失败');
        allTestsPassed = false;
      }
    } catch (error) {
      console.error(`  ❌ 测试失败: ${error.message}`);
      allTestsPassed = false;
    }
  }

  console.log('\n' + '='.repeat(50));

  if (allTestsPassed) {
    console.log('✨ 所有测试通过！系统运行正常');
    console.log('\n可以访问以下页面：');
    console.log('  - 登录页面: http://localhost:3000/zh-CN/auth/login');
    console.log('  - 测试页面: http://localhost:3000/zh-CN/test-login');
    console.log(
      '  - Dashboard: http://localhost:3000/zh-CN/dashboard (需要先登录)'
    );
  } else {
    console.log('⚠️  部分测试失败，请检查错误信息');
  }

  console.log('\n可用账户：');
  accounts.forEach((acc) => {
    console.log(`  ${acc.role}: ${acc.email} / ${acc.password}`);
  });
}

testSystem().catch(console.error);
