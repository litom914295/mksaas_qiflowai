// 调试登录脚本
// 在浏览器控制台运行这个来测试登录

async function testLogin() {
  const email = 'admin@mksaas.com';
  const password = 'admin123456';

  console.log('开始测试登录...');
  console.log('邮箱:', email);
  console.log('密码:', password);

  try {
    const response = await fetch('/api/auth/sign-in/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    console.log('响应状态:', response.status);

    const data = await response.json();
    console.log('响应数据:', data);

    if (response.ok) {
      console.log('✅ 登录成功!');
      console.log('用户信息:', data.user);
      console.log('会话信息:', data.session);

      // 测试跳转
      console.log('3秒后将跳转到管理后台...');
      setTimeout(() => {
        window.location.href = '/zh-CN/dashboard';
      }, 3000);
    } else {
      console.error('❌ 登录失败:', data.error);
    }

    return data;
  } catch (error) {
    console.error('❌ 网络错误:', error);
    return null;
  }
}

// 直接执行测试
testLogin();

console.log('提示: 也可以手动调用 testLogin() 来重新测试');
