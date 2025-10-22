import { type Page, expect, test } from '@playwright/test';

// 辅助函数：登录管理员
async function loginAsAdmin(page: Page) {
  await page.goto('/zh-CN/admin/signin');
  await page.fill('input[name="email"]', 'admin@example.com');
  await page.fill('input[name="password"]', 'Admin@123456');
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/admin\/dashboard/);
}

test.describe('用户管理', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/zh-CN/admin/users');
  });

  test('应该显示用户列表', async ({ page }) => {
    // 检查页面标题
    await expect(page.locator('h1:has-text("用户管理")')).toBeVisible();

    // 检查表格头
    await expect(page.locator('th:has-text("用户")')).toBeVisible();
    await expect(page.locator('th:has-text("邮箱")')).toBeVisible();
    await expect(page.locator('th:has-text("角色")')).toBeVisible();
    await expect(page.locator('th:has-text("状态")')).toBeVisible();

    // 检查至少有一个用户（当前登录的管理员）
    await expect(page.locator('tbody tr')).toHaveCount(1, { minimum: 1 });
  });

  test('应该能够搜索用户', async ({ page }) => {
    // 在搜索框输入
    const searchInput = page.locator('input[placeholder*="搜索用户"]');
    await searchInput.fill('admin');

    // 等待搜索结果
    await page.waitForTimeout(500); // 等待去抖

    // 验证搜索结果
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(1, { minimum: 1 });

    // 验证结果包含搜索关键词
    const firstRow = rows.first();
    const text = await firstRow.textContent();
    expect(text?.toLowerCase()).toContain('admin');
  });

  test('应该能够按状态筛选用户', async ({ page }) => {
    // 点击状态筛选按钮
    await page.locator('button:has-text("状态")').click();

    // 选择"活跃"状态
    await page.locator('[role="menuitem"]:has-text("活跃")').click();

    // 等待筛选结果
    await page.waitForTimeout(500);

    // 验证所有显示的用户都是活跃状态
    const statusBadges = page.locator('tbody tr td:nth-child(4) span');
    const count = await statusBadges.count();
    for (let i = 0; i < count; i++) {
      const text = await statusBadges.nth(i).textContent();
      expect(text).toContain('活跃');
    }
  });

  test('应该能够创建新用户', async ({ page }) => {
    // 点击创建用户按钮
    await page.locator('button:has-text("创建用户")').click();

    // 等待对话框打开
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // 填写用户表单
    await page.fill('input[name="name"]', '测试用户');
    await page.fill('input[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'Test@123456');
    await page.fill('input[name="confirmPassword"]', 'Test@123456');

    // 选择角色
    await page.locator('button[role="combobox"]').click();
    await page.locator('[role="option"]:has-text("编辑员")').click();

    // 提交表单
    await page.locator('[role="dialog"] button:has-text("创建")').click();

    // 等待成功消息
    await expect(page.locator('text=用户创建成功')).toBeVisible({
      timeout: 5000,
    });

    // 验证新用户出现在列表中
    await expect(page.locator('td:has-text("测试用户")')).toBeVisible();
  });

  test('应该能够编辑用户信息', async ({ page }) => {
    // 点击第一个用户的编辑按钮
    await page
      .locator('tbody tr')
      .first()
      .locator('button[aria-label="编辑"]')
      .click();

    // 等待编辑对话框
    await expect(
      page.locator('[role="dialog"]:has-text("编辑用户")')
    ).toBeVisible();

    // 修改用户名
    const nameInput = page.locator('[role="dialog"] input[name="name"]');
    await nameInput.clear();
    await nameInput.fill('更新后的名称');

    // 保存更改
    await page.locator('[role="dialog"] button:has-text("保存")').click();

    // 等待成功消息
    await expect(page.locator('text=用户更新成功')).toBeVisible({
      timeout: 5000,
    });

    // 验证更改已保存
    await expect(page.locator('td:has-text("更新后的名称")')).toBeVisible();
  });

  test('应该能够批量操作用户', async ({ page }) => {
    // 选择多个用户
    const checkboxes = page.locator('tbody tr input[type="checkbox"]');
    const count = Math.min(await checkboxes.count(), 3);

    for (let i = 0; i < count; i++) {
      await checkboxes.nth(i).check();
    }

    // 验证批量操作按钮出现
    await expect(page.locator('text=已选择')).toBeVisible();
    await expect(page.locator(`text=${count} 项`)).toBeVisible();

    // 点击批量操作
    await page.locator('button:has-text("批量操作")').click();

    // 选择批量禁用
    await page.locator('[role="menuitem"]:has-text("批量禁用")').click();

    // 确认操作
    await page.locator('button:has-text("确认")').click();

    // 等待成功消息
    await expect(page.locator('text=批量操作成功')).toBeVisible({
      timeout: 5000,
    });
  });

  test('应该能够删除用户', async ({ page }) => {
    // 创建一个测试用户用于删除
    await page.locator('button:has-text("创建用户")').click();
    const testEmail = `delete-test-${Date.now()}@example.com`;
    await page.fill('input[name="name"]', '待删除用户');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'Test@123456');
    await page.fill('input[name="confirmPassword"]', 'Test@123456');
    await page.locator('[role="dialog"] button:has-text("创建")').click();

    // 等待用户创建成功
    await expect(page.locator('text=用户创建成功')).toBeVisible({
      timeout: 5000,
    });

    // 找到新创建的用户行并点击删除
    const userRow = page.locator(`tbody tr:has-text("${testEmail}")`);
    await userRow.locator('button[aria-label="删除"]').click();

    // 确认删除对话框
    await expect(page.locator('text=确认删除')).toBeVisible();
    await page.locator('button:has-text("确认删除")').click();

    // 等待删除成功
    await expect(page.locator('text=用户删除成功')).toBeVisible({
      timeout: 5000,
    });

    // 验证用户已从列表中移除
    await expect(
      page.locator(`tbody tr:has-text("${testEmail}")`)
    ).not.toBeVisible();
  });

  test('应该能够导出用户列表', async ({ page }) => {
    // 设置下载监听
    const downloadPromise = page.waitForEvent('download');

    // 点击导出按钮
    await page.locator('button:has-text("导出")').click();

    // 选择导出格式
    await page.locator('[role="menuitem"]:has-text("导出为 CSV")').click();

    // 等待下载
    const download = await downloadPromise;

    // 验证下载的文件名
    expect(download.suggestedFilename()).toMatch(/users.*\.csv/);
  });

  test('应该能够查看用户详情', async ({ page }) => {
    // 点击第一个用户的查看按钮
    await page
      .locator('tbody tr')
      .first()
      .locator('button[aria-label="查看"]')
      .click();

    // 等待详情对话框或页面
    await expect(page.locator('text=用户详情')).toBeVisible();

    // 验证详情内容
    await expect(page.locator('text=基本信息')).toBeVisible();
    await expect(page.locator('text=权限信息')).toBeVisible();
    await expect(page.locator('text=登录历史')).toBeVisible();
    await expect(page.locator('text=操作日志')).toBeVisible();
  });
});

test.describe('角色权限管理', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/zh-CN/admin/users/roles');
  });

  test('应该显示角色列表', async ({ page }) => {
    // 检查默认角色
    await expect(page.locator('text=超级管理员')).toBeVisible();
    await expect(page.locator('text=管理员')).toBeVisible();
    await expect(page.locator('text=编辑员')).toBeVisible();
    await expect(page.locator('text=查看者')).toBeVisible();
  });

  test('应该能够创建自定义角色', async ({ page }) => {
    // 点击创建角色按钮
    await page.locator('button:has-text("创建角色")').click();

    // 填写角色信息
    await page.fill('input[name="name"]', '内容审核员');
    await page.fill('textarea[name="description"]', '负责审核和管理内容');

    // 选择权限
    await page.locator('input[value="content:read"]').check();
    await page.locator('input[value="content:write"]').check();
    await page.locator('input[value="content:delete"]').check();

    // 保存角色
    await page.locator('button:has-text("创建")').click();

    // 验证角色创建成功
    await expect(page.locator('text=角色创建成功')).toBeVisible({
      timeout: 5000,
    });
    await expect(page.locator('text=内容审核员')).toBeVisible();
  });

  test('应该能够编辑角色权限', async ({ page }) => {
    // 点击编辑员角色的编辑按钮
    const roleCard = page.locator('div:has-text("编辑员")').locator('..');
    await roleCard.locator('button[aria-label="编辑"]').click();

    // 修改权限
    await page.locator('input[value="analytics:view"]').check();

    // 保存更改
    await page.locator('button:has-text("保存")').click();

    // 验证更新成功
    await expect(page.locator('text=角色更新成功')).toBeVisible({
      timeout: 5000,
    });
  });
});
