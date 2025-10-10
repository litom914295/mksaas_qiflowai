import { expect, test } from '@playwright/test';

test.describe('国际化路由导航', () => {
  test.describe('无 locale 路径重定向', () => {
    test('访问 /ai-chat 应该重定向到 /zh-CN/ai-chat', async ({ page }) => {
      await page.goto('/ai-chat');
      await expect(page).toHaveURL(/\/zh-CN\/ai-chat/);
    });

    test('访问 /analysis/bazi 应该重定向到 /zh-CN/analysis/bazi', async ({
      page,
    }) => {
      await page.goto('/analysis/bazi');
      await expect(page).toHaveURL(/\/zh-CN\/analysis\/bazi/);
    });

    test('访问 /analysis/xuankong 应该重定向到 /zh-CN/analysis/xuankong', async ({
      page,
    }) => {
      await page.goto('/analysis/xuankong');
      await expect(page).toHaveURL(/\/zh-CN\/analysis\/xuankong/);
    });

    test('访问 /showcase 应该重定向到 /zh-CN/showcase', async ({ page }) => {
      await page.goto('/showcase');
      await expect(page).toHaveURL(/\/zh-CN\/showcase/);
    });

    test('访问 /docs 应该重定向到 /zh-CN/docs', async ({ page }) => {
      await page.goto('/docs');
      await expect(page).toHaveURL(/\/zh-CN\/docs/);
    });
  });

  test.describe('带 locale 的路径访问', () => {
    test('直接访问 /zh-CN/ai-chat 应该成功', async ({ page }) => {
      await page.goto('/zh-CN/ai-chat');
      await expect(page).toHaveURL(/\/zh-CN\/ai-chat/);
      await expect(page).toHaveTitle(/AI.*咨询/i);
    });

    test('直接访问 /en/dashboard 应该成功', async ({ page }) => {
      // 注意：如果用户未登录，可能会被重定向到登录页
      await page.goto('/en/dashboard');
      // 检查 URL 包含 /en/ locale
      expect(page.url()).toContain('/en/');
    });

    test('访问 /zh-CN/showcase 应该显示正确的内容', async ({ page }) => {
      await page.goto('/zh-CN/showcase');
      await expect(page).toHaveURL(/\/zh-CN\/showcase/);
      // 检查页面是否包含中文内容
      await expect(page.locator('body')).toContainText(/功能展示|核心功能/);
    });
  });

  test.describe('页面内链接导航', () => {
    test('首页链接应该包含正确的 locale 前缀', async ({ page }) => {
      await page.goto('/zh-CN');

      // 查找 AI Chat 链接
      const aiChatLink = page.locator('a[href*="ai-chat"]').first();
      await expect(aiChatLink).toHaveAttribute('href', /\/zh-CN\/ai-chat/);

      // 点击链接
      await aiChatLink.click();

      // 确认导航成功
      await expect(page).toHaveURL(/\/zh-CN\/ai-chat/);
    });

    test('从展示页面导航到分析页面应该保持 locale', async ({ page }) => {
      await page.goto('/zh-CN/showcase');

      // 查找八字分析链接
      const baziLink = page.locator('a[href*="bazi"]').first();
      await baziLink.click();

      // 确认 URL 仍包含 zh-CN locale
      await expect(page).toHaveURL(/\/zh-CN\/analysis\/bazi/);
    });

    test('返回首页链接应该使用正确的 locale', async ({ page }) => {
      await page.goto('/zh-CN/ai-chat');

      // 查找返回首页的链接
      const homeLink = page.locator('a[href="/"], a[href*="首页"]').first();

      if ((await homeLink.count()) > 0) {
        await homeLink.click();

        // 确认导航到首页且保持 locale
        await expect(page).toHaveURL(/\/zh-CN\/?$/);
      }
    });
  });

  test.describe('语言切换', () => {
    test('切换到英文应该更新 URL locale', async ({ page }) => {
      await page.goto('/zh-CN/ai-chat');

      // 查找语言切换器（假设有这个功能）
      const langSwitcher = page.locator(
        '[data-testid="language-switcher"], [aria-label*="language"], button:has-text("EN")'
      );

      if ((await langSwitcher.count()) > 0) {
        await langSwitcher.click();

        // 如果有语言选项，点击英文
        const enOption = page.locator(
          '[data-locale="en"], a:has-text("English")'
        );
        if ((await enOption.count()) > 0) {
          await enOption.click();

          // 确认 URL 切换到 en locale
          await expect(page).toHaveURL(/\/en\/ai-chat/);
        }
      }
    });

    test('通过 cookie 设置 locale 应该生效', async ({ page, context }) => {
      // 设置 locale cookie 为 en
      await context.addCookies([
        {
          name: 'NEXT_LOCALE',
          value: 'en',
          domain: 'localhost',
          path: '/',
        },
      ]);

      // 访问无 locale 的路径
      await page.goto('/ai-chat');

      // 应该重定向到英文版本
      await expect(page).toHaveURL(/\/en\/ai-chat/);
    });
  });

  test.describe('错误处理', () => {
    test('访问不存在的路径应该显示 404 页面', async ({ page }) => {
      const response = await page.goto('/zh-CN/non-existent-page');
      expect(response?.status()).toBe(404);
    });

    test('404 页面应该包含返回首页的链接', async ({ page }) => {
      await page.goto('/zh-CN/non-existent-page');

      // 查找返回首页的链接
      const homeLink = page.locator('a[href*="zh-CN"]').first();
      await expect(homeLink).toBeVisible();

      // 点击链接应该返回首页
      await homeLink.click();
      await expect(page).toHaveURL(/\/zh-CN\/?$/);
    });

    test('错误页面应该保持当前 locale', async ({ page }) => {
      // 触发一个可能的错误（例如访问需要认证的页面）
      await page.goto('/zh-CN/non-existent-page');

      // 即使是错误页面，URL 也应该保持 zh-CN locale
      expect(page.url()).toContain('/zh-CN/');
    });
  });

  test.describe('移动端导航', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

    test('移动端菜单导航应该保持 locale', async ({ page }) => {
      await page.goto('/zh-CN');

      // 查找移动端菜单按钮
      const menuButton = page.locator(
        '[data-testid="mobile-menu"], button[aria-label*="menu"]'
      );

      if ((await menuButton.count()) > 0) {
        await menuButton.click();

        // 等待菜单出现
        await page.waitForTimeout(500);

        // 点击菜单中的链接
        const aiChatLink = page.locator('a[href*="ai-chat"]').first();
        if ((await aiChatLink.count()) > 0) {
          await aiChatLink.click();

          // 确认 locale 保持为 zh-CN
          await expect(page).toHaveURL(/\/zh-CN\/ai-chat/);
        }
      }
    });
  });

  test.describe('浏览器前进后退', () => {
    test('后退按钮应该保持正确的 locale', async ({ page }) => {
      // 访问首页
      await page.goto('/zh-CN');

      // 导航到 AI Chat
      await page.goto('/zh-CN/ai-chat');

      // 导航到 showcase
      await page.goto('/zh-CN/showcase');

      // 后退
      await page.goBack();
      await expect(page).toHaveURL(/\/zh-CN\/ai-chat/);

      // 再次后退
      await page.goBack();
      await expect(page).toHaveURL(/\/zh-CN\/?$/);
    });

    test('前进按钮应该保持正确的 locale', async ({ page }) => {
      await page.goto('/zh-CN');
      await page.goto('/zh-CN/ai-chat');

      // 后退
      await page.goBack();

      // 前进
      await page.goForward();
      await expect(page).toHaveURL(/\/zh-CN\/ai-chat/);
    });
  });

  test.describe('外部链接处理', () => {
    test('外部链接不应该添加 locale 前缀', async ({ page }) => {
      await page.goto('/zh-CN/showcase');

      // 查找可能的外部链接
      const externalLinks = page.locator('a[href^="http"]');

      if ((await externalLinks.count()) > 0) {
        const firstLink = externalLinks.first();
        const href = await firstLink.getAttribute('href');

        // 外部链接不应该包含 locale
        expect(href).not.toContain('/zh-CN/');
        expect(href).not.toContain('/en/');
      }
    });
  });

  test.describe('性能测试', () => {
    test('locale 重定向应该快速完成', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/ai-chat');
      await expect(page).toHaveURL(/\/zh-CN\/ai-chat/);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 重定向应该在1秒内完成
      expect(duration).toBeLessThan(1000);
    });

    test('页面导航应该流畅', async ({ page }) => {
      await page.goto('/zh-CN');

      // 测量导航到 AI Chat 的时间
      const startTime = Date.now();

      await page.click('a[href*="ai-chat"]');
      await expect(page).toHaveURL(/\/zh-CN\/ai-chat/);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 导航应该在2秒内完成
      expect(duration).toBeLessThan(2000);
    });
  });
});
