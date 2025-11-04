// 快速登录测试脚本
console.log('===================================');
console.log('快速登录测试');
console.log('===================================\n');

const testLogin = async (email: string, password: string) => {
  console.log(`测试登录: ${email}`);

  try {
    const response = await fetch(
      'http://localhost:3000/api/auth/sign-in/email',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('✅ 登录成功！');
      console.log(`   - 用户ID: ${data.user?.id}`);
      console.log(`   - 邮箱: ${data.user?.email}`);
      console.log(`   - 角色: ${data.user?.role || 'user'}`);
      return true;
    }
    console.log(`❌ 登录失败: ${data.error || '未知错误'}`);
    return false;
  } catch (error) {
    console.log(
      `❌ 请求失败: ${error instanceof Error ? error.message : '未知错误'}`
    );
    return false;
  }
};

const runTests = async () => {
  console.log('1. 测试管理员账户登录');
  console.log('-----------------------------------');
  const adminSuccess = await testLogin('admin@qiflowai.com', 'admin123456');

  console.log('\n2. 测试用户账户登录');
  console.log('-----------------------------------');
  const userSuccess = await testLogin('test@example.com', 'test123456');

  console.log('\n===================================');
  console.log('测试结果汇总');
  console.log('===================================');
  console.log(`管理员登录: ${adminSuccess ? '✅ 成功' : '❌ 失败'}`);
  console.log(`测试用户登录: ${userSuccess ? '✅ 成功' : '❌ 失败'}`);

  if (adminSuccess && userSuccess) {
    console.log('\n🎉 所有测试通过！系统登录功能正常。');
    console.log('\n您现在可以：');
    console.log('1. 访问 http://localhost:3000/test-login 进行登录');
    console.log(
      '2. 访问 http://localhost:3000/zh-CN/auth/login 使用正式登录页面'
    );
    console.log('3. 登录后访问 http://localhost:3000/zh-CN/dashboard 管理后台');
  } else {
    console.log('\n⚠️ 部分测试失败，请检查系统配置。');
  }
};

// 确保开发服务器正在运行
console.log('⚠️ 注意: 请确保开发服务器正在运行 (npm run dev)\n');

// 等待一秒后开始测试
setTimeout(runTests, 1000);
