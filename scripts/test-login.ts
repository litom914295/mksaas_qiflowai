import dotenv from 'dotenv';

dotenv.config();

async function testLogin() {
  const baseURL = 'http://localhost:3000';
  const email = process.env.ADMIN_EMAIL || 'admin@mksaas.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123456';

  console.log(`测试登录: ${email}`);

  // 测试新的登录 API
  console.log('\n1. 测试 Supabase Auth Fallback 登录...');
  try {
    const response = await fetch(`${baseURL}/api/auth-fallback/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ 登录成功!');
      console.log('用户 ID:', data.user?.id);
      console.log('用户邮箱:', data.user?.email);
      console.log('Session:', data.session ? '已创建' : '未创建');
    } else {
      console.error('❌ 登录失败:', data.error);
    }
  } catch (error) {
    console.error('❌ 请求失败:', error);
  }

  // 测试原始的 Better Auth 登录 API
  console.log('\n2. 测试 Better Auth 登录...');
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
      console.log('✅ Better Auth 登录成功!');
      try {
        const data = JSON.parse(text);
        console.log('响应数据:', data);
      } catch {
        console.log('响应:', text);
      }
    } else {
      console.error('❌ Better Auth 登录失败:');
      console.error('状态码:', response.status);
      console.error('响应:', text);
    }
  } catch (error) {
    console.error('❌ 请求失败:', error);
  }
}

testLogin().catch(console.error);
