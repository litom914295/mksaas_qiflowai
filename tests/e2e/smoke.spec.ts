import { expect, test } from '@playwright/test';

test.describe('烟雾测试 - 基础功能验证', () => {
  test('首页可以正常访问', async ({ page }) => {
    await page.goto('/zh');

    // 验证页面加载成功
    await expect(page).toHaveURL(/.*localhost:3000.*/);

    // 验证关键元素存在
    const heroSection = page.locator('section').first();
    await expect(heroSection).toBeVisible();
  });

  test('八字分析页面可以访问', async ({ page }) => {
    await page.goto('/zh/analysis/bazi');

    // 等待页面加载
    await page.waitForLoadState('networkidle');

    // 验证URL正确
    await expect(page).toHaveURL(/.*analysis\/bazi.*/);

    // 验证表单元素存在
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toBeVisible();
  });

  test('AI聊天页面可以访问', async ({ page }) => {
    await page.goto('/zh/ai-chat');

    // 等待页面加载
    await page.waitForLoadState('networkidle');

    // 验证URL正确
    await expect(page).toHaveURL(/.*ai-chat.*/);

    // 验证页面有内容
    const pageContent = page.locator('h1').first();
    await expect(pageContent).toBeVisible();
  });

  test('展示页面可以访问', async ({ page }) => {
    await page.goto('/zh/showcase');

    // 等待页面加载
    await page.waitForLoadState('networkidle');

    // 验证URL正确
    await expect(page).toHaveURL(/.*showcase.*/);

    // 验证页面有内容
    const pageTitle = page.locator('h1').first();
    await expect(pageTitle).toBeVisible();
  });

  test('导航功能正常', async ({ page }) => {
    await page.goto('/zh');

    // 查找并点击八字分析链接
    const baziLink = page.locator('a[href*="analysis/bazi"]').first();
    if (await baziLink.isVisible()) {
      await baziLink.click();
      await expect(page).toHaveURL(/.*analysis\/bazi.*/);
    }
  });
});
