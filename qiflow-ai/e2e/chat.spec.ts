/**
 * E2E Tests for Chat Interface
 *
 * Tests the complete user journey of the AI conversation system
 * including chat interface, state management, and error handling.
 */

import { expect, test, type BrowserContext, type Page } from '@playwright/test';

// Test data and configuration
const TEST_CONFIG = {
  baseUrl: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3001',
  testTimeout: 30000,
  user: {
    email: 'test@qiflow.ai',
    password: 'TestPassword123!',
    name: 'E2E Test User',
  },
  guest: {
    sessionId: 'e2e-guest-session',
  },
  bazi: {
    year: 1990,
    month: 5,
    day: 15,
    hour: 14,
    gender: 'male',
    timezone: 'Asia/Shanghai',
  },
  house: {
    address: '测试地址123号',
    facing: 'southeast',
    buildYear: 2010,
  },
} as const;

test.describe('Chat Interface E2E Tests', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({
      // Enable console logs
      recordVideo: { dir: 'test-results/videos/' },
      // screenshot: { mode: 'only-on-failure' },
    });
  });

  test.beforeEach(async () => {
    page = await context.newPage();

    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser console error:', msg.text());
      }
    });

    // Navigate to the app
    await page.goto(TEST_CONFIG.baseUrl);
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test.describe('Guest User Journey', () => {
    test('should allow guest user to start a conversation', async () => {
      // Look for guest mode entry point
      const guestButton = page
        .locator(
          '[data-testid="start-guest-session"], [data-testid="guest-start"], button:has-text("游客模式"), button:has-text("Guest Mode")'
        )
        .first();

      if (await guestButton.isVisible()) {
        await guestButton.click();
        await page.waitForLoadState('networkidle');
      }

      // Check if we're on the chat interface
      await expect(
        page.locator(
          '[data-testid="chat-interface"], [data-testid="chat-container"], [role="main"]'
        )
      ).toBeVisible();

      // Look for message input
      const messageInput = page
        .locator(
          '[data-testid="message-input"], input[placeholder*="输入"], input[placeholder*="message"], textarea[placeholder*="输入"], textarea[placeholder*="message"]'
        )
        .first();
      await expect(messageInput).toBeVisible();

      // Send a test message
      await messageInput.fill('你好，我想了解风水分析');

      // Look for send button
      const sendButton = page
        .locator(
          '[data-testid="send-button"], button[type="submit"], button:has-text("发送"), button:has-text("Send")'
        )
        .first();
      await sendButton.click();

      // Wait for AI response
      await page.waitForTimeout(2000); // Give time for response

      // Check that message was sent and appears in chat
      await expect(page.locator('text=你好，我想了解风水分析')).toBeVisible();

      // Look for AI response indicators
      const aiResponse = page
        .locator(
          '[data-testid="ai-message"], [data-role="assistant"], .assistant-message'
        )
        .first();
      await expect(aiResponse).toBeVisible({ timeout: 10000 });
    });

    test('should handle BaZi data input flow', async () => {
      // Start guest session if needed
      const guestButton = page
        .locator(
          '[data-testid="start-guest-session"], button:has-text("游客模式")'
        )
        .first();
      if (await guestButton.isVisible()) {
        await guestButton.click();
        await page.waitForLoadState('networkidle');
      }

      // Navigate to BaZi input or send message asking for analysis
      const messageInput = page
        .locator('[data-testid="message-input"], input, textarea')
        .first();
      await messageInput.fill('请分析我的八字命理');

      const sendButton = page
        .locator('[data-testid="send-button"], button[type="submit"]')
        .first();
      await sendButton.click();

      // Wait for response and look for BaZi input form or prompts
      await page.waitForTimeout(3000);

      // Check if BaZi form appears or if AI asks for birth info
      const hasBaziForm = await page
        .locator(
          '[data-testid="bazi-form"], form:has-text("出生"), form:has-text("八字")'
        )
        .isVisible();
      const hasAiPrompt = await page
        .locator('text=出生时间, text=八字, text=年月日时')
        .isVisible();

      expect(hasBaziForm || hasAiPrompt).toBeTruthy();

      if (hasBaziForm) {
        // Fill BaZi form
        await page
          .locator('[data-testid="birth-year"], input[name="year"]')
          .fill(TEST_CONFIG.bazi.year.toString());
        await page
          .locator(
            '[data-testid="birth-month"], select[name="month"], input[name="month"]'
          )
          .fill(TEST_CONFIG.bazi.month.toString());
        await page
          .locator(
            '[data-testid="birth-day"], select[name="day"], input[name="day"]'
          )
          .fill(TEST_CONFIG.bazi.day.toString());
        await page
          .locator(
            '[data-testid="birth-hour"], select[name="hour"], input[name="hour"]'
          )
          .fill(TEST_CONFIG.bazi.hour.toString());

        // Submit form
        const submitButton = page
          .locator(
            '[data-testid="submit-bazi"], button[type="submit"]:has-text("提交"), button:has-text("分析")'
          )
          .first();
        await submitButton.click();
      } else if (hasAiPrompt) {
        // Respond with birth information via chat
        await messageInput.fill(
          `我的出生时间是${TEST_CONFIG.bazi.year}年${TEST_CONFIG.bazi.month}月${TEST_CONFIG.bazi.day}日${TEST_CONFIG.bazi.hour}时`
        );
        await sendButton.click();
      }

      // Wait for analysis result
      await page.waitForTimeout(5000);

      // Check for analysis content
      const analysisContent = page
        .locator('text=五行, text=八字, text=命理, text=元素')
        .first();
      await expect(analysisContent).toBeVisible({ timeout: 15000 });
    });

    test('should handle feng shui house analysis flow', async () => {
      // Start guest session
      const guestButton = page
        .locator(
          '[data-testid="start-guest-session"], button:has-text("游客模式")'
        )
        .first();
      if (await guestButton.isVisible()) {
        await guestButton.click();
        await page.waitForLoadState('networkidle');
      }

      // Request feng shui analysis
      const messageInput = page
        .locator('[data-testid="message-input"], input, textarea')
        .first();
      await messageInput.fill('请分析我家的风水布局');

      const sendButton = page
        .locator('[data-testid="send-button"], button[type="submit"]')
        .first();
      await sendButton.click();

      await page.waitForTimeout(3000);

      // Provide house information
      await messageInput.fill(
        `我家地址是${TEST_CONFIG.house.address}，朝向${TEST_CONFIG.house.facing}，建于${TEST_CONFIG.house.buildYear}年`
      );
      await sendButton.click();

      // Wait for feng shui analysis
      await page.waitForTimeout(5000);

      // Check for feng shui analysis content
      const fengshuiContent = page
        .locator('text=风水, text=方位, text=飞星, text=布局')
        .first();
      await expect(fengshuiContent).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe('Chat State Management', () => {
    test('should maintain conversation context across messages', async () => {
      // Start session
      const guestButton = page
        .locator(
          '[data-testid="start-guest-session"], button:has-text("游客模式")'
        )
        .first();
      if (await guestButton.isVisible()) {
        await guestButton.click();
        await page.waitForLoadState('networkidle');
      }

      const messageInput = page
        .locator('[data-testid="message-input"], input, textarea')
        .first();
      const sendButton = page
        .locator('[data-testid="send-button"], button[type="submit"]')
        .first();

      // Send first message
      await messageInput.fill('我想了解八字分析');
      await sendButton.click();
      await page.waitForTimeout(2000);

      // Send follow-up message
      await messageInput.fill('我的出生时间是1990年5月15日14时');
      await sendButton.click();
      await page.waitForTimeout(3000);

      // Send third message that references context
      await messageInput.fill('根据我刚才提供的信息，我应该注意什么？');
      await sendButton.click();
      await page.waitForTimeout(3000);

      // Verify all messages are visible
      await expect(page.locator('text=我想了解八字分析')).toBeVisible();
      await expect(page.locator('text=1990年5月15日14时')).toBeVisible();
      await expect(page.locator('text=根据我刚才提供的信息')).toBeVisible();

      // Check that AI response references the context
      const contextualResponse = page
        .locator('[data-testid="ai-message"], .assistant-message')
        .last();
      await expect(contextualResponse).toBeVisible();
    });

    test('should handle conversation state transitions', async () => {
      // Start session
      const guestButton = page
        .locator(
          '[data-testid="start-guest-session"], button:has-text("游客模式")'
        )
        .first();
      if (await guestButton.isVisible()) {
        await guestButton.click();
        await page.waitForLoadState('networkidle');
      }

      const messageInput = page
        .locator('[data-testid="message-input"], input, textarea')
        .first();
      const sendButton = page
        .locator('[data-testid="send-button"], button[type="submit"]')
        .first();

      // Greeting state
      await expect(
        page.locator('[data-testid="chat-state"], .chat-state')
      ).toContainText(/greeting|问候|初始/i);

      // Transition to collecting info
      await messageInput.fill('你好');
      await sendButton.click();
      await page.waitForTimeout(2000);

      // Should ask for more information
      const infoRequest = page.locator(
        'text=出生, text=信息, text=时间, text=详细'
      );
      await expect(infoRequest.first()).toBeVisible({ timeout: 10000 });

      // Provide information to transition to analysis
      await messageInput.fill('我想分析八字，出生于1990年5月15日14时');
      await sendButton.click();
      await page.waitForTimeout(5000);

      // Should show analysis or recommendations
      const analysisIndicator = page.locator(
        'text=分析, text=建议, text=五行, text=元素'
      );
      await expect(analysisIndicator.first()).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle network errors gracefully', async () => {
      // Start session
      const guestButton = page
        .locator(
          '[data-testid="start-guest-session"], button:has-text("游客模式")'
        )
        .first();
      if (await guestButton.isVisible()) {
        await guestButton.click();
        await page.waitForLoadState('networkidle');
      }

      // Simulate network failure
      await page.route('**/api/chat', route => {
        route.abort('failed');
      });

      const messageInput = page
        .locator('[data-testid="message-input"], input, textarea')
        .first();
      const sendButton = page
        .locator('[data-testid="send-button"], button[type="submit"]')
        .first();

      await messageInput.fill('测试网络错误');
      await sendButton.click();

      // Should show error message
      const errorMessage = page.locator(
        '[data-testid="error-message"], .error-message, text=错误, text=失败'
      );
      await expect(errorMessage.first()).toBeVisible({ timeout: 10000 });

      // Should allow retry
      const retryButton = page.locator(
        '[data-testid="retry-button"], button:has-text("重试"), button:has-text("Retry")'
      );
      if (await retryButton.isVisible()) {
        // Remove network simulation
        await page.unroute('**/api/chat');
        await retryButton.click();
        await page.waitForTimeout(3000);
      }
    });

    test('should handle rate limiting', async () => {
      // Start session
      const guestButton = page
        .locator(
          '[data-testid="start-guest-session"], button:has-text("游客模式")'
        )
        .first();
      if (await guestButton.isVisible()) {
        await guestButton.click();
        await page.waitForLoadState('networkidle');
      }

      // Simulate rate limit response
      await page.route('**/api/chat', route => {
        route.fulfill({
          status: 429,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: '请求过于频繁，请稍后再试',
            },
          }),
        });
      });

      const messageInput = page
        .locator('[data-testid="message-input"], input, textarea')
        .first();
      const sendButton = page
        .locator('[data-testid="send-button"], button[type="submit"]')
        .first();

      await messageInput.fill('测试频率限制');
      await sendButton.click();

      // Should show rate limit message
      const rateLimitMessage = page.locator('text=频繁, text=稍后, text=限制');
      await expect(rateLimitMessage.first()).toBeVisible({ timeout: 10000 });
    });

    test('should handle budget limits', async () => {
      // Start session
      const guestButton = page
        .locator(
          '[data-testid="start-guest-session"], button:has-text("游客模式")'
        )
        .first();
      if (await guestButton.isVisible()) {
        await guestButton.click();
        await page.waitForLoadState('networkidle');
      }

      // Simulate budget limit response
      await page.route('**/api/chat', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              sessionId: 'test-session',
              reply: {
                id: 'budget-reply',
                role: 'assistant',
                content:
                  '当前对话已接近预算上限，为避免额外费用，请稍后再试或升级套餐。',
                timestamp: new Date().toISOString(),
              },
              limitedByBudget: true,
            },
          }),
        });
      });

      const messageInput = page
        .locator('[data-testid="message-input"], input, textarea')
        .first();
      const sendButton = page
        .locator('[data-testid="send-button"], button[type="submit"]')
        .first();

      await messageInput.fill('测试预算限制');
      await sendButton.click();

      // Should show budget limit message
      const budgetMessage = page.locator(
        'text=预算, text=额外费用, text=升级套餐'
      );
      await expect(budgetMessage.first()).toBeVisible({ timeout: 10000 });
    });

    test('should handle empty messages', async () => {
      // Start session
      const guestButton = page
        .locator(
          '[data-testid="start-guest-session"], button:has-text("游客模式")'
        )
        .first();
      if (await guestButton.isVisible()) {
        await guestButton.click();
        await page.waitForLoadState('networkidle');
      }

      const messageInput = page
        .locator('[data-testid="message-input"], input, textarea')
        .first();
      const sendButton = page
        .locator('[data-testid="send-button"], button[type="submit"]')
        .first();

      // Try to send empty message
      await messageInput.fill('');

      // Send button should be disabled or clicking should not send
      const isDisabled = await sendButton.isDisabled();
      if (!isDisabled) {
        await sendButton.click();
        // Should not see any new messages in chat
        await page.waitForTimeout(1000);
      }

      // Try with whitespace only
      await messageInput.fill('   \n\t   ');
      if (!(await sendButton.isDisabled())) {
        await sendButton.click();
        await page.waitForTimeout(1000);
      }

      // Verify no empty messages were sent
      const emptyMessage = page.locator('text=""');
      await expect(emptyMessage).not.toBeVisible();
    });
  });

  test.describe('User Interface and Accessibility', () => {
    test('should be keyboard navigable', async () => {
      // Start session
      const guestButton = page
        .locator(
          '[data-testid="start-guest-session"], button:has-text("游客模式")'
        )
        .first();
      if (await guestButton.isVisible()) {
        await guestButton.click();
        await page.waitForLoadState('networkidle');
      }

      // Tab through interface
      await page.keyboard.press('Tab');

      // Should focus on message input
      const messageInput = page
        .locator('[data-testid="message-input"], input, textarea')
        .first();
      await expect(messageInput).toBeFocused();

      // Type message using keyboard
      await page.keyboard.type('键盘导航测试');

      // Tab to send button
      await page.keyboard.press('Tab');
      const sendButton = page
        .locator('[data-testid="send-button"], button[type="submit"]')
        .first();
      await expect(sendButton).toBeFocused();

      // Send using Enter or Space
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);

      // Verify message was sent
      await expect(page.locator('text=键盘导航测试')).toBeVisible();
    });

    test('should have proper ARIA labels and roles', async () => {
      // Start session
      const guestButton = page
        .locator(
          '[data-testid="start-guest-session"], button:has-text("游客模式")'
        )
        .first();
      if (await guestButton.isVisible()) {
        await guestButton.click();
        await page.waitForLoadState('networkidle');
      }

      // Check for proper ARIA attributes
      const chatContainer = page
        .locator(
          '[role="main"], [role="dialog"], [aria-label*="chat"], [aria-label*="对话"]'
        )
        .first();
      await expect(chatContainer).toBeVisible();

      const messageInput = page
        .locator('[data-testid="message-input"], input, textarea')
        .first();
      const inputLabel = await messageInput.getAttribute('aria-label');
      expect(inputLabel).toBeTruthy();

      const sendButton = page
        .locator('[data-testid="send-button"], button[type="submit"]')
        .first();
      const buttonLabel = await sendButton.getAttribute('aria-label');
      expect(buttonLabel).toBeTruthy();
    });

    test('should display loading states correctly', async () => {
      // Start session
      const guestButton = page
        .locator(
          '[data-testid="start-guest-session"], button:has-text("游客模式")'
        )
        .first();
      if (await guestButton.isVisible()) {
        await guestButton.click();
        await page.waitForLoadState('networkidle');
      }

      // Slow down API response to test loading state
      await page.route('**/api/chat', async route => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        route.continue();
      });

      const messageInput = page
        .locator('[data-testid="message-input"], input, textarea')
        .first();
      const sendButton = page
        .locator('[data-testid="send-button"], button[type="submit"]')
        .first();

      await messageInput.fill('测试加载状态');
      await sendButton.click();

      // Should show loading indicator
      const loadingIndicator = page.locator(
        '[data-testid="loading"], [data-testid="typing-indicator"], .loading, .spinner'
      );
      await expect(loadingIndicator.first()).toBeVisible({ timeout: 1000 });

      // Wait for response
      await page.waitForTimeout(3000);

      // Loading should disappear
      await expect(loadingIndicator.first()).not.toBeVisible();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile viewport', async () => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Start session
      const guestButton = page
        .locator(
          '[data-testid="start-guest-session"], button:has-text("游客模式")'
        )
        .first();
      if (await guestButton.isVisible()) {
        await guestButton.click();
        await page.waitForLoadState('networkidle');
      }

      // Check that interface is usable on mobile
      const messageInput = page
        .locator('[data-testid="message-input"], input, textarea')
        .first();
      await expect(messageInput).toBeVisible();

      const sendButton = page
        .locator('[data-testid="send-button"], button[type="submit"]')
        .first();
      await expect(sendButton).toBeVisible();

      // Test touch interaction
      await messageInput.tap();
      await messageInput.fill('移动端测试');
      await sendButton.tap();

      await page.waitForTimeout(2000);
      await expect(page.locator('text=移动端测试')).toBeVisible();
    });

    test('should handle orientation changes', async () => {
      // Start in portrait
      await page.setViewportSize({ width: 375, height: 667 });

      // Start session
      const guestButton = page
        .locator(
          '[data-testid="start-guest-session"], button:has-text("游客模式")'
        )
        .first();
      if (await guestButton.isVisible()) {
        await guestButton.click();
        await page.waitForLoadState('networkidle');
      }

      // Send a message
      const messageInput = page
        .locator('[data-testid="message-input"], input, textarea')
        .first();
      await messageInput.fill('测试屏幕旋转');

      const sendButton = page
        .locator('[data-testid="send-button"], button[type="submit"]')
        .first();
      await sendButton.click();
      await page.waitForTimeout(2000);

      // Rotate to landscape
      await page.setViewportSize({ width: 667, height: 375 });
      await page.waitForTimeout(500);

      // Interface should still be usable
      await expect(messageInput).toBeVisible();
      await expect(sendButton).toBeVisible();
      await expect(page.locator('text=测试屏幕旋转')).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load initial interface quickly', async () => {
      const startTime = Date.now();

      await page.goto(TEST_CONFIG.baseUrl);

      // Wait for main interface to be visible
      const chatInterface = page
        .locator(
          '[data-testid="chat-interface"], [data-testid="chat-container"], [role="main"]'
        )
        .first();
      await expect(chatInterface).toBeVisible({ timeout: 10000 });

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    });

    test('should handle multiple rapid messages', async () => {
      // Start session
      const guestButton = page
        .locator(
          '[data-testid="start-guest-session"], button:has-text("游客模式")'
        )
        .first();
      if (await guestButton.isVisible()) {
        await guestButton.click();
        await page.waitForLoadState('networkidle');
      }

      const messageInput = page
        .locator('[data-testid="message-input"], input, textarea')
        .first();
      const sendButton = page
        .locator('[data-testid="send-button"], button[type="submit"]')
        .first();

      // Send multiple messages rapidly
      const messages = ['消息1', '消息2', '消息3'];

      for (const message of messages) {
        await messageInput.fill(message);
        await sendButton.click();
        await page.waitForTimeout(100); // Small delay between messages
      }

      // Wait for all messages to be processed
      await page.waitForTimeout(5000);

      // All messages should be visible
      for (const message of messages) {
        await expect(page.locator(`text=${message}`)).toBeVisible();
      }
    });
  });
});
