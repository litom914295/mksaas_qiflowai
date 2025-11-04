import { expect, test } from '@playwright/test';

test.describe('管理后台认证', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/zh-CN/admin/signin');
  });

  test('应该显示登录页面', async ({ page }) => {
    // 检查页面标题
    await expect(page).toHaveTitle(/管理后台登录/);

    // 检查登录表单元素
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('应该显示验证错误消息', async ({ page }) => {
    // 提交空表单
    await page.locator('button[type="submit"]').click();

    // 检查验证消息
    await expect(page.locator('text=请输入邮箱')).toBeVisible();
    await expect(page.locator('text=请输入密码')).toBeVisible();
  });

  test('应该处理无效的登录凭证', async ({ page }) => {
    // 填写无效凭证
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.locator('button[type="submit"]').click();

    // 等待错误消息
    await expect(page.locator('text=邮箱或密码错误')).toBeVisible({
      timeout: 10000,
    });
  });

  test('应该成功登录并跳转到仪表板', async ({ page }) => {
    // 使用有效凭证登录
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'Admin@123456');

    // 点击登录按钮
    await Promise.all([
      page.waitForNavigation(),
      page.locator('button[type="submit"]').click(),
    ]);

    // 验证跳转到仪表板
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await expect(page.locator('h1:has-text("仪表板")')).toBeVisible();
  });

  test('应该处理MFA验证流程', async ({ page }) => {
    // 启用MFA的账号登录
    await page.fill('input[name="email"]', 'mfa-admin@example.com');
    await page.fill('input[name="password"]', 'Admin@123456');
    await page.locator('button[type="submit"]').click();

    // 等待MFA页面
    await expect(page.locator('text=双因素认证')).toBeVisible({
      timeout: 10000,
    });

    // 输入MFA代码
    const otpInputs = page.locator('input[data-otp-input]');
    const otpCode = '123456'; // 测试环境中的固定码
    for (let i = 0; i < otpCode.length; i++) {
      await otpInputs.nth(i).fill(otpCode[i]);
    }

    // 等待自动提交并跳转
    await expect(page).toHaveURL(/\/admin\/dashboard/, {
      timeout: 10000,
    });
  });

  test('应该记住用户登录状态', async ({ page, context }) => {
    // 登录
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'Admin@123456');

    // 勾选记住我
    await page.check('input[name="rememberMe"]');
    await page.locator('button[type="submit"]').click();

    // 等待登录成功
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    // 获取cookies
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(
      (c) => c.name === 'authjs.session-token'
    );
    expect(sessionCookie).toBeDefined();

    // 验证cookie过期时间（记住我应该是30天）
    if (sessionCookie) {
      const expiryDate = new Date(sessionCookie.expires * 1000);
      const now = new Date();
      const daysDiff =
        (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBeGreaterThan(25); // 至少25天
    }
  });

  test('应该能够登出', async ({ page }) => {
    // 先登录
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'Admin@123456');
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/\/admin\/dashboard/);

    // 点击用户菜单
    await page.locator('button[data-testid="user-menu"]').click();

    // 点击登出
    await page.locator('button:has-text("登出")').click();

    // 确认登出对话框
    await page.locator('button:has-text("确认登出")').click();

    // 验证跳转回登录页
    await expect(page).toHaveURL(/\/admin\/signin/);
  });
});

test.describe('权限验证', () => {
  test('未授权用户不能访问管理页面', async ({ page }) => {
    // 直接访问受保护页面
    await page.goto('/zh-CN/admin/dashboard');

    // 应该重定向到登录页
    await expect(page).toHaveURL(/\/admin\/signin/);
  });

  test('普通用户不能访问超级管理员页面', async ({ page }) => {
    // 以普通管理员身份登录
    await page.goto('/zh-CN/admin/signin');
    await page.fill('input[name="email"]', 'editor@example.com');
    await page.fill('input[name="password"]', 'Editor@123456');
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/\/admin\/dashboard/);

    // 尝试访问系统设置页面（需要超级管理员权限）
    await page.goto('/zh-CN/admin/system/settings');

    // 应该显示无权限页面
    await expect(page.locator('text=403')).toBeVisible();
    await expect(page.locator('text=无权访问')).toBeVisible();
  });
});
