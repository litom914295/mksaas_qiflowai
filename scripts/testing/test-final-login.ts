import dotenv from 'dotenv';

dotenv.config();

async function testLogin() {
  const baseURL = 'http://localhost:3000';
  const email = 'admin@qiflowai.com';
  const password = 'admin123456';

  console.log('🚀 测试最终登录方案...\n');
  console.log('邮箱:', email);
  console.log('密码:', password);

  console.log('\n测试 API 路由: /api/auth/sign-in/email');

  try {
    const response = await fetch(`${baseURL}/api/auth/sign-in/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const text = await response.text();

    if (response.ok) {
      console.log('✅ 登录成功！');
      try {
        const data = JSON.parse(text);
        console.log('用户 ID:', data.user?.id);
        console.log('用户邮箱:', data.user?.email);
        console.log('Session:', data.session ? '已创建' : '未创建');
      } catch {
        console.log('响应:', text);
      }

      console.log('\n✨ 现在你可以访问:');
      console.log('   http://localhost:3000/zh-CN/auth/login');
      console.log('   使用以上凭据登录');
    } else {
      console.error('❌ 登录失败:');
      console.error('状态码:', response.status);
      console.error('响应:', text);

      console.log('\n🔧 故障排除:');
      console.log('1. 确保服务器已重启');
      console.log('2. 检查控制台是否有错误');
      console.log('3. 尝试使用备用 API: /api/auth-fallback/login');
    }
  } catch (error) {
    console.error('❌ 请求失败:', error);
    console.log('\n⚠️  确保服务器正在运行: npm run dev');
  }
}

testLogin().catch(console.error);
