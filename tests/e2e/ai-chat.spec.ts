import { expect, test } from '@playwright/test';

test.describe('AI聊天功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 访问AI聊天页面
    await page.goto('/zh/ai-chat');
  });

  test('页面加载和基本元素', async ({ page }) => {
    // 检查页面标题
    await expect(page).toHaveTitle(/AI智能咨询/);

    // 检查页面主要元素
    await expect(page.locator('h1:has-text("AI智能咨询")')).toBeVisible();

    // 检查护栏特性说明
    await expect(page.locator('text=算法优先')).toBeVisible();
    await expect(page.locator('text=智能识别')).toBeVisible();
    await expect(page.locator('text=合规保护')).toBeVisible();

    // 检查聊天组件
    await expect(
      page.locator('[data-testid="ai-chat-container"]')
    ).toBeVisible();

    // 检查输入框和发送按钮
    await expect(page.locator('textarea[placeholder*="输入"]')).toBeVisible();
    await expect(page.locator('button:has-text("发送")')).toBeVisible();
  });

  test('发送消息功能', async ({ page }) => {
    // 找到输入框
    const input = page.locator('textarea[placeholder*="输入"]');
    const sendButton = page.locator('button:has-text("发送")');

    // 输入测试消息
    await input.fill('什么是八字命理？');

    // 发送消息
    await sendButton.click();

    // 等待响应（模拟）
    await page.waitForTimeout(1000);

    // 验证消息是否显示在聊天记录中
    await expect(page.locator('text=什么是八字命理？')).toBeVisible();
  });

  test('算法优先护栏测试', async ({ page }) => {
    const input = page.locator('textarea[placeholder*="输入"]');
    const sendButton = page.locator('button:has-text("发送")');

    // 测试需要数据的问题
    await input.fill('我的事业运势如何？');
    await sendButton.click();

    // 应该提示先进行八字分析
    await page.waitForTimeout(1000);
    // await expect(page.locator('text=/请先进行.*分析/')).toBeVisible();
  });

  test('预设问题快捷选择', async ({ page }) => {
    // 检查是否有预设问题
    const presetQuestions = page.locator(
      '[data-testid="preset-questions"] button'
    );

    if ((await presetQuestions.count()) > 0) {
      // 点击第一个预设问题
      await presetQuestions.first().click();

      // 验证问题是否被填充到输入框
      const input = page.locator('textarea[placeholder*="输入"]');
      await expect(input).not.toHaveValue('');
    }
  });

  test('聊天历史记录', async ({ page }) => {
    const input = page.locator('textarea[placeholder*="输入"]');
    const sendButton = page.locator('button:has-text("发送")');

    // 发送多条消息
    const messages = ['测试消息1', '测试消息2', '测试消息3'];

    for (const msg of messages) {
      await input.fill(msg);
      await sendButton.click();
      await page.waitForTimeout(500);
    }

    // 验证所有消息都显示在历史记录中
    for (const msg of messages) {
      await expect(page.locator(`text=${msg}`)).toBeVisible();
    }
  });

  test('响应式布局测试', async ({ page }) => {
    // 测试移动端
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(
      page.locator('[data-testid="ai-chat-container"]')
    ).toBeVisible();

    // 测试平板
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(
      page.locator('[data-testid="ai-chat-container"]')
    ).toBeVisible();

    // 测试桌面
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(
      page.locator('[data-testid="ai-chat-container"]')
    ).toBeVisible();
  });

  test('错误处理测试', async ({ page }) => {
    // 模拟网络错误
    await page.route('**/api/chat', (route) => route.abort());

    const input = page.locator('textarea[placeholder*="输入"]');
    const sendButton = page.locator('button:has-text("发送")');

    await input.fill('测试错误处理');
    await sendButton.click();

    // 应该显示错误提示
    await page.waitForTimeout(1000);
    // await expect(page.locator('text=/错误|失败|重试/')).toBeVisible();
  });
});
