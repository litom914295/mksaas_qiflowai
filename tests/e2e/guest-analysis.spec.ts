import { test, expect } from '@playwright/test';

test.describe('Guest Analysis Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/zh-CN/guest-analysis');
  });

  test('should display page title and navigation', async ({ page }) => {
    // 检查页面标题
    await expect(page.locator('h1')).toContainText('智能风水分析体验');
    
    // 检查返回按钮
    const backButton = page.getByRole('button', { name: /返回/i });
    await expect(backButton).toBeVisible();
  });

  test('should display step indicator with 4 steps', async ({ page }) => {
    // 检查步骤指示器
    const stepIndicator = page.locator('nav[aria-label="进度指示器"]');
    await expect(stepIndicator).toBeVisible();
    
    // 应该有4个步骤
    const steps = stepIndicator.locator('div[role="img"]');
    await expect(steps).toHaveCount(4);
    
    // 第一步应该是激活状态
    const firstStep = steps.first();
    await expect(firstStep).toHaveClass(/bg-blue-500/);
  });

  test('should fill and submit personal data form', async ({ page }) => {
    // 等待表单加载
    await page.waitForSelector('input[name="name"]');
    
    // 填写个人信息
    await page.fill('input[name="name"]', '张三');
    await page.selectOption('select[name="gender"]', 'male');
    await page.fill('input[name="birthDate"]', '1990-05-15');
    await page.fill('input[name="birthTime"]', '14:30');
    await page.fill('input[name="location"]', '北京');
    
    // 提交表单
    await page.click('button[type="submit"]');
    
    // 应该进入第二步
    await expect(page.locator('h3')).toContainText('确定房屋方位信息');
  });

  test('should use quick fill functionality', async ({ page }) => {
    // 点击快速填充按钮
    const quickFillButton = page.getByRole('button', { name: /快速填充示例数据/i });
    await quickFillButton.click();
    
    // 等待数据填充
    await page.waitForTimeout(500);
    
    // 验证数据已填充
    await expect(page.locator('input[name="name"]')).not.toHaveValue('');
    await expect(page.locator('select[name="gender"]')).not.toHaveValue('');
  });

  test('should navigate through all steps', async ({ page }) => {
    // 快速填充第一步
    await page.getByRole('button', { name: /快速填充示例数据/i }).click();
    await page.waitForTimeout(300);
    
    // 提交第一步
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);
    
    // 验证第二步
    await expect(page.locator('h3')).toContainText('确定房屋方位信息');
    
    // 快速填充第二步
    const quickFillButton2 = page.getByRole('button', { name: /快速填充示例数据/i });
    await quickFillButton2.click();
    await page.waitForTimeout(300);
    
    // 提交第二步
    const nextButton = page.locator('button[type="submit"]').last();
    await nextButton.click();
    await page.waitForTimeout(500);
    
    // 验证第三步（开始分析）
    await expect(page.locator('h3')).toContainText('准备开始分析');
    
    // 点击开始分析
    const startButton = page.getByRole('button', { name: /开始分析/i });
    await startButton.click();
    
    // 等待分析完成（最多10秒）
    await page.waitForTimeout(3000);
    
    // 应该显示分析结果
    await expect(page.locator('h3')).toContainText('八字');
  });

  test('should be accessible', async ({ page }) => {
    // 运行基本的可访问性检查
    
    // 检查表单标签
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toHaveAttribute('aria-required', 'true');
    
    // 检查按钮有适当的标签
    const quickFillButton = page.getByRole('button', { name: /快速填充示例数据/i });
    await expect(quickFillButton).toHaveAttribute('aria-label');
    
    // 检查步骤指示器
    const stepIndicator = page.locator('nav[aria-label="进度指示器"]');
    await expect(stepIndicator).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // 设置移动视口
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 页面应该正常显示
    await expect(page.locator('h1')).toBeVisible();
    
    // 表单应该是单列布局
    const form = page.locator('form').first();
    await expect(form).toBeVisible();
    
    // 步骤指示器应该可见
    const stepIndicator = page.locator('nav[aria-label="进度指示器"]');
    await expect(stepIndicator).toBeVisible();
  });

  test('should display error on invalid form submission', async ({ page }) => {
    // 尝试提交空表单
    await page.click('button[type="submit"]');
    
    // HTML5 验证应该阻止提交
    const nameInput = page.locator('input[name="name"]');
    const isInvalid = await nameInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBeTruthy();
  });

  test('should allow navigation back to previous step', async ({ page }) => {
    // 快速填充并进入第二步
    await page.getByRole('button', { name: /快速填充示例数据/i }).click();
    await page.waitForTimeout(300);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);
    
    // 点击返回按钮
    const backButton = page.getByRole('button', { name: /上一步/i });
    await backButton.click();
    
    // 应该回到第一步
    await expect(page.locator('h3')).toContainText('填写您的个人信息');
  });

  test('should have good performance metrics', async ({ page }) => {
    // 测量性能指标
    const navigationTiming = await page.evaluate(() => {
      const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
        loadComplete: timing.loadEventEnd - timing.loadEventStart,
        domInteractive: timing.domInteractive - timing.fetchStart,
      };
    });
    
    // 验证性能指标在合理范围内
    expect(navigationTiming.domInteractive).toBeLessThan(3000); // 3秒内可交互
    
    console.log('Performance metrics:', navigationTiming);
  });
});
