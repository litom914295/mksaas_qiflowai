import { expect, test } from '@playwright/test';

test.describe('八字分析功能测试', () => {
  test.use({ baseURL: 'http://localhost:3000' });
  test.beforeEach(async ({ page }) => {
    // 访问八字分析页面
    await page.goto('/zh/analysis/bazi');
  });

  test('页面加载和基本元素展示', async ({ page }) => {
    // 检查页面标题
    await expect(page).toHaveTitle(/八字分析/);

    // 检查关键元素是否存在
    await expect(page.locator('[data-testid="bazi-form-card"]')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[type="date"]')).toBeVisible();
    await expect(page.locator('input[type="time"]')).toBeVisible();
    await expect(page.locator('select[name="gender"]')).toBeVisible();

    // 检查提交按钮
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeDisabled(); // 初始状态应该是禁用的
  });

  test('填写表单并提交', async ({ page }) => {
    // 填写表单
    await page.fill('input[name="name"]', '测试用户');

    // 填写日期
    await page.fill('input[type="date"]', '1990-01-01');

    // 填写时间
    await page.fill('input[type="time"]', '08:30');

    // 选择性别
    await page.selectOption('select[name="gender"]', 'male');

    // 等待表单验证
    await page.waitForTimeout(500);

    // 检查提交按钮是否启用
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled();

    // 模拟提交（不实际发送请求）
    // await submitButton.click();
    // await page.waitForSelector('[data-testid="analysis-result"]', { timeout: 10000 });
  });

  test('表单验证测试', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');

    // 初始状态，按钮应该禁用
    await expect(submitButton).toBeDisabled();

    // 只填写姓名，按钮仍然禁用
    await page.fill('input[name="name"]', '测试');
    await expect(submitButton).toBeDisabled();

    // 填写完整信息后，按钮启用
    await page.fill('input[type="date"]', '1990-01-01');
    await page.fill('input[type="time"]', '12:00');
    await page.selectOption('select[name="gender"]', 'female');

    // 等待验证完成
    await page.waitForTimeout(500);
    await expect(submitButton).toBeEnabled();
  });

  test('响应式设计测试', async ({ page }) => {
    // 测试移动端视图
    await page.setViewportSize({ width: 375, height: 667 });

    // 检查移动端布局
    await expect(page.locator('[data-testid="bazi-form-card"]')).toBeVisible();

    // 测试平板视图
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('[data-testid="bazi-form-card"]')).toBeVisible();

    // 测试桌面视图
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('[data-testid="bazi-form-card"]')).toBeVisible();
  });

  test('测试数据按钮功能', async ({ page }) => {
    // 查找测试数据按钮
    const testButton = page.locator('button:has-text("填充测试数据")');

    if (await testButton.isVisible()) {
      // 点击测试数据按钮
      await testButton.click();

      // 验证表单是否被填充
      await expect(page.locator('input[name="name"]')).toHaveValue('测试用户');
      await expect(page.locator('input[type="date"]')).toHaveValue(
        '1990-01-01'
      );
      await expect(page.locator('input[type="time"]')).toHaveValue('08:30');
      await expect(page.locator('select[name="gender"]')).toHaveValue('male');

      // 验证提交按钮是否启用
      await expect(page.locator('button[type="submit"]')).toBeEnabled();
    }
  });

  test('性能指标检查', async ({ page }) => {
    // 收集性能指标
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded:
          navigation.domContentLoadedEventEnd -
          navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        domInteractive: navigation.domInteractive - navigation.fetchStart,
        ttfb: navigation.responseStart - navigation.requestStart,
      };
    });

    // 验证性能指标
    expect(metrics.domContentLoaded).toBeLessThan(3000); // DOM内容加载时间 < 3s
    expect(metrics.loadComplete).toBeLessThan(5000); // 页面完全加载时间 < 5s
    expect(metrics.ttfb).toBeLessThan(1000); // TTFB < 1s
  });
});
