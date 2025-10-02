import { expect, test } from './fixtures';
import {
    humanLikeDelay,
    monitorConsoleErrors,
    takeScreenshotWithName,
    testLanguageSwitch,
    verifyAIResponse,
    waitAndVerifyElement,
    waitForStateTransition,
} from './helpers/test-utils';

test.describe('QiFlow AI 对话系统 E2E 测试', () => {
  test.beforeEach(async ({ page }) => {
    // 监控控制台错误
    await monitorConsoleErrors(page);
  });

  test('嘉宾会话创建和基本对话流程', async ({ page, chatPage, testUser }) => {
    await test.step('导航到首页并启动嘉宾会话', async () => {
      await chatPage.navigateToChat();
      await chatPage.startGuestSession();

      // 验证会话已创建
      await waitAndVerifyElement(page, '[data-testid="chat-interface"]');
      await expect(
        page.locator('[data-testid="guest-indicator"]')
      ).toBeVisible();
    });

    await test.step('验证初始状态为 greeting', async () => {
      const state = await chatPage.getCurrentState();
      expect(state).toBe('greeting');

      // 验证欢迎消息
      await verifyAIResponse(page, ['欢迎', '风水', '八字']);
    });

    await test.step('开始信息收集流程', async () => {
      await chatPage.sendMessage('我想了解我的八字和家居风水');
      await chatPage.waitForAIResponse();

      // 等待状态转换到 collecting_info
      await waitForStateTransition(page, 'greeting', 'collecting_info');

      // 验证信息收集提示
      await verifyAIResponse(page, ['出生日期', '时间', '性别']);
    });

    await test.step('填写八字信息', async () => {
      await chatPage.fillBaziForm(testUser);
      await humanLikeDelay(500, 1000);

      // 等待状态转换到 analyzing
      await waitForStateTransition(page, 'collecting_info', 'analyzing');

      // 验证分析中状态
      await waitAndVerifyElement(page, '[data-testid="analyzing-indicator"]');
    });

    await test.step('等待分析完成', async () => {
      // 等待状态转换到 explaining
      await waitForStateTransition(page, 'analyzing', 'explaining', 15000);

      // 验证八字分析结果
      await verifyAIResponse(page, ['八字', '五行', '喜用神']);
    });

    await test.step('获取风水建议', async () => {
      await chatPage.sendMessage('请给我一些家居风水建议');
      await chatPage.waitForAIResponse();

      // 等待状态转换到 recommending
      await waitForStateTransition(page, 'explaining', 'recommending');

      // 验证推荐卡片出现
      const recommendationCards = await chatPage.getRecommendationCards();
      expect(recommendationCards.length).toBeGreaterThan(0);
    });

    await test.step('测试推荐卡片交互', async () => {
      await chatPage.selectRecommendationCard(0);
      await chatPage.waitForAIResponse();

      // 验证详细建议
      await verifyAIResponse(page, ['方位', '颜色', '材质']);
    });

    // 截图保存测试结果
    await takeScreenshotWithName(page, 'chat-flow-complete', true);
  });

  test('会话状态持久化和恢复', async ({ page, chatPage, testUser }) => {
    await test.step('创建会话并进行到分析阶段', async () => {
      await chatPage.navigateToChat();
      await chatPage.startGuestSession();
      await chatPage.sendMessage('我想了解八字');
      await chatPage.fillBaziForm(testUser);

      // 等待分析完成
      await waitForStateTransition(
        page,
        'collecting_info',
        'explaining',
        15000
      );
    });

    await test.step('刷新页面验证状态恢复', async () => {
      await page.reload();
      await page.waitForLoadState('networkidle');

      // 验证会话状态已恢复
      const state = await chatPage.getCurrentState();
      expect(['explaining', 'recommending']).toContain(state);

      // 验证聊天历史恢复
      const messages = await page
        .locator('[data-testid="chat-message"]')
        .count();
      expect(messages).toBeGreaterThan(0);
    });
  });

  test('多语言切换功能', async ({ page, chatPage }) => {
    await chatPage.navigateToChat();
    await chatPage.startGuestSession();

    const languages = ['zh-CN', 'en', 'ja', 'ko'];
    await testLanguageSwitch(
      page,
      languages,
      '[data-testid="welcome-message"]'
    );

    // 验证每种语言下的AI响应
    for (const lang of languages) {
      await page.selectOption('[data-testid="language-selector"]', lang);
      await page.waitForTimeout(500);

      await chatPage.sendMessage('Hello');
      await chatPage.waitForAIResponse();

      const lastMessage = await chatPage.getLastMessage();
      expect(lastMessage).toBeTruthy();
      expect(lastMessage).not.toContain('MISSING_MESSAGE');
    }
  });

  test('错误处理和重试机制', async ({ page, chatPage }) => {
    await test.step('模拟网络错误', async () => {
      await chatPage.navigateToChat();
      await chatPage.startGuestSession();

      // 模拟API失败
      await page.route('**/api/chat/**', route => {
        route.abort('failed');
      });

      await chatPage.sendMessage('测试消息');

      // 验证错误处理
      await waitAndVerifyElement(page, '[data-testid="error-message"]');
      await waitAndVerifyElement(page, '[data-testid="retry-button"]');
    });

    await test.step('测试重试功能', async () => {
      // 恢复API响应
      await page.unroute('**/api/chat/**');

      await page.click('[data-testid="retry-button"]');
      await chatPage.waitForAIResponse();

      // 验证重试成功
      await expect(
        page.locator('[data-testid="error-message"]')
      ).not.toBeVisible();
    });
  });

  test('并发会话处理', async ({ browser }) => {
    // 创建多个页面模拟并发会话
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    const chatPage1 = new (await import('./fixtures')).ChatPageObject(page1);
    const chatPage2 = new (await import('./fixtures')).ChatPageObject(page2);

    await Promise.all([chatPage1.navigateToChat(), chatPage2.navigateToChat()]);

    await Promise.all([
      chatPage1.startGuestSession(),
      chatPage2.startGuestSession(),
    ]);

    // 验证两个会话独立运行
    await Promise.all([
      chatPage1.sendMessage('会话1测试'),
      chatPage2.sendMessage('会话2测试'),
    ]);

    await Promise.all([
      chatPage1.waitForAIResponse(),
      chatPage2.waitForAIResponse(),
    ]);

    // 验证会话隔离
    const state1 = await chatPage1.getCurrentState();
    const state2 = await chatPage2.getCurrentState();

    expect(state1).toBeTruthy();
    expect(state2).toBeTruthy();

    await context1.close();
    await context2.close();
  });

  test('会话超时和清理', async ({ page, chatPage }) => {
    await chatPage.navigateToChat();
    await chatPage.startGuestSession();

    // 模拟长时间无活动
    await page.waitForTimeout(2000);

    // 验证会话超时警告
    await waitAndVerifyElement(page, '[data-testid="session-warning"]', {
      timeout: 10000,
    });

    // 测试会话延期
    await page.click('[data-testid="extend-session"]');
    await expect(
      page.locator('[data-testid="session-warning"]')
    ).not.toBeVisible();
  });

  test('输入验证和安全性', async ({ page, chatPage }) => {
    await chatPage.navigateToChat();
    await chatPage.startGuestSession();

    const maliciousInputs = [
      '<script>alert(\"xss\")</script>',
      '{{constructor.constructor(\"alert(1)\")()}}',
      'SELECT * FROM users',
      '../../etc/passwd',
    ];

    for (const input of maliciousInputs) {
      await chatPage.sendMessage(input);
      await chatPage.waitForAIResponse();

      // 验证输入被正确转义
      const lastMessage = await page
        .locator('[data-testid="user-message"]')
        .last();
      const messageHTML = await lastMessage.innerHTML();

      expect(messageHTML).not.toContain('<script>');
      expect(messageHTML).not.toContain('constructor');
    }
  });
});
