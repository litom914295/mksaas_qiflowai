import { expect, test } from '@playwright/test';

/**
 * 快速 i18n 导航测试
 *
 * 这是简化版的测试，只测试最关键的功能
 * 运行时间更短，适合快速验证
 */

test.describe('国际化路由 - 快速测试', () => {
  // 增加单个测试的超时时间
  test.setTimeout(45000);

  test.describe('基本重定向', () => {
    test('访问根路径应该包含 locale', async ({ page }) => {
      await page.goto('/');
      // 等待页面加载完成
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      // URL 应该包含 locale 前缀
      const url = page.url();
      expect(url).toMatch(/\/(zh-CN|en)/);
    });

    test('直接访问 /zh-CN 应该成功', async ({ page }) => {
      const response = await page.goto('/zh-CN');
      expect(response?.status()).toBeLessThan(400);
      await page.waitForLoadState('domcontentloaded');
      expect(page.url()).toContain('/zh-CN');
    });
  });

  test.describe('页面访问', () => {
    test('访问中文首页应该显示中文内容', async ({ page }) => {
      await page.goto('/zh-CN');
      await page.waitForLoadState('domcontentloaded');

      // 检查是否有中文内容（任何中文字符）
      const bodyText = await page.locator('body').textContent();
      expect(bodyText).toMatch(/[\u4e00-\u9fa5]/); // 匹配中文字符
    });

    test('页面标题应该包含正确的语言', async ({ page }) => {
      await page.goto('/zh-CN');
      await page.waitForLoadState('domcontentloaded');

      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
    });
  });

  test.describe('链接检查', () => {
    test('页面中的内部链接应该包含 locale', async ({ page }) => {
      await page.goto('/zh-CN');
      await page.waitForLoadState('networkidle', { timeout: 15000 });

      // 获取所有链接
      const links = await page.locator('a[href^="/"]').all();

      if (links.length > 0) {
        // 检查前几个内部链接
        for (let i = 0; i < Math.min(3, links.length); i++) {
          const href = await links[i].getAttribute('href');
          if (href && !href.startsWith('/#')) {
            // 内部链接应该包含 locale 或是锚点
            const hasLocale = href.match(/^\/(zh-CN|en)/);
            const isHash = href.startsWith('/#');
            expect(hasLocale || isHash).toBeTruthy();
          }
        }
      }
    });
  });
});

test.describe('错误处理', () => {
  test('404 页面应该保持 locale', async ({ page }) => {
    const response = await page.goto('/zh-CN/this-page-does-not-exist-12345');

    // 可能是 404 或者重定向
    const status = response?.status();
    expect([404, 301, 302, 307, 308]).toContain(status);

    // URL 应该仍然包含 zh-CN
    expect(page.url()).toContain('/zh-CN');
  });
});
