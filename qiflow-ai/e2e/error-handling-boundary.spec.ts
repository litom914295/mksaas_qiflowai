import { expect, test } from './fixtures';
import {
    humanLikeDelay,
    measureResponseTime,
    monitorConsoleErrors,
    takeScreenshotWithName,
    testFormValidation,
    waitAndVerifyElement,
    waitForStateTransition
} from './helpers/test-utils';

test.describe('错误场景和边界条件测试', () => {
  test.beforeEach(async ({ page }) => {
    await monitorConsoleErrors(page);
  });

  describe('网络错误处理', () => {
    test('应该处理API服务完全不可用', async ({ page, chatPage }) => {
      await chatPage.navigateToChat();
      await chatPage.startGuestSession();

      // 拦截所有API请求并返回错误
      await page.route('**/api/**', route => {
        route.abort('failed');
      });

      await chatPage.sendMessage('测试消息');

      // 验证错误处理UI
      await waitAndVerifyElement(page, '[data-testid="network-error"]');
      await waitAndVerifyElement(page, '[data-testid="offline-indicator"]');

      // 验证重试按钮可用
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="retry-button"]')
      ).not.toBeDisabled();
    });

    test('应该处理间歇性网络问题', async ({ page, chatPage }) => {
      await chatPage.navigateToChat();
      await chatPage.startGuestSession();

      let requestCount = 0;

      // 模拟间歇性网络故障
      await page.route('**/api/chat/**', route => {
        requestCount++;
        if (requestCount <= 2) {
          // 前两次请求失败
          route.abort('failed');
        } else {
          // 第三次请求成功
          route.continue();
        }
      });

      await chatPage.sendMessage('测试网络恢复');

      // 第一次失败
      await waitAndVerifyElement(page, '[data-testid="error-message"]');

      // 点击重试
      await page.click('[data-testid="retry-button"]');

      // 第二次仍然失败
      await waitAndVerifyElement(page, '[data-testid="error-message"]');

      // 再次重试，这次应该成功
      await page.click('[data-testid="retry-button"]');
      await chatPage.waitForAIResponse();

      // 验证最终成功
      await expect(
        page.locator('[data-testid="error-message"]')
      ).not.toBeVisible();
    });

    test('应该处理慢速网络连接', async ({ page, chatPage }) => {
      await chatPage.navigateToChat();
      await chatPage.startGuestSession();

      // 模拟慢速网络（5秒延迟）
      await page.route('**/api/chat/**', async route => {
        await new Promise(resolve => setTimeout(resolve, 5000));
        await route.continue();
      });

      const responseTime = await measureResponseTime(page, async () => {
        await chatPage.sendMessage('慢网络测试');

        // 验证加载指示器
        await waitAndVerifyElement(page, '[data-testid="loading-indicator"]');
        await waitAndVerifyElement(
          page,
          '[data-testid="slow-network-warning"]',
          {
            timeout: 8000,
          }
        );

        await chatPage.waitForAIResponse();
      });

      expect(responseTime).toBeGreaterThan(5000);
      await expect(
        page.locator('[data-testid="loading-indicator"]')
      ).not.toBeVisible();
    });
  });

  describe('数据验证和边界条件', () => {
    test('应该验证八字表单输入', async ({ page, chatPage }) => {
      await chatPage.navigateToChat();
      await chatPage.startGuestSession();
      await chatPage.sendMessage('我想分析八字');

      await waitForStateTransition(page, 'greeting', 'collecting_info');

      // 测试表单验证
      await testFormValidation(page, {
        birthDate: {
          selector: '[data-testid="birth-date"]',
          invalidValue: '2050-01-01', // 未来日期
          validValue: '1990-01-01',
        },
        birthTime: {
          selector: '[data-testid="birth-time"]',
          invalidValue: '25:00', // 无效时间
          validValue: '12:00',
        },
      });

      // 测试极端边界情况
      const extremeCases = [
        { date: '1900-01-01', time: '00:00', description: '20世纪初' },
        { date: '2023-12-31', time: '23:59', description: '当前年份最后一刻' },
        { date: '1970-01-01', time: '00:00', description: 'Unix纪元开始' },
      ];

      for (const testCase of extremeCases) {
        await page.fill('[data-testid="birth-date"]', testCase.date);
        await page.fill('[data-testid="birth-time"]', testCase.time);
        await page.click('[data-testid="submit-bazi"]');

        // 验证能够处理边界日期
        await waitForStateTransition(
          page,
          'collecting_info',
          'analyzing',
          10000
        );
        await waitForStateTransition(page, 'analyzing', 'explaining', 20000);

        // 返回到收集信息状态继续下一个测试
        await page.click('[data-testid="edit-bazi-info"]');
        await waitForStateTransition(page, 'explaining', 'collecting_info');
      }
    });

    test('应该处理超长文本输入', async ({ page, chatPage }) => {
      await chatPage.navigateToChat();
      await chatPage.startGuestSession();

      // 生成超长文本（10KB）
      const longText = 'A'.repeat(10000);

      await chatPage.sendMessage(longText);

      // 验证处理超长输入
      await waitAndVerifyElement(
        page,
        '[data-testid="input-too-long-warning"]'
      );

      // 验证消息被截断或拒绝
      const lastMessage = await chatPage.getLastMessage();
      expect(lastMessage?.length || 0).toBeLessThan(10000);

      // 测试正常长度的消息仍然工作
      await chatPage.sendMessage('正常长度的测试消息');
      await chatPage.waitForAIResponse();
    });

    test('应该处理特殊字符和Unicode', async ({ page, chatPage }) => {
      await chatPage.navigateToChat();
      await chatPage.startGuestSession();

      const specialTexts = [
        '🎯🔮✨ 测试表情符号',
        '𝕋𝕖𝕤𝕥 𝕞𝕒𝕥𝕙 𝕗𝕠𝕟𝕥𝕤',
        '中文繁體字測試',
        'العربية اختبار',
        'тест на русском',
        '日本語テスト',
        '한국어 테스트',
        'ไทย ทดสอบ',
      ];

      for (const text of specialTexts) {
        await chatPage.sendMessage(text);
        await chatPage.waitForAIResponse();

        // 验证消息正确显示
        const userMessage = await page
          .locator('[data-testid="user-message"]')
          .last();
        await expect(userMessage).toContainText(text);

        // 验证AI能够响应
        const aiMessage = await page
          .locator('[data-testid="ai-message"]')
          .last();
        await expect(aiMessage).toBeVisible();

        await humanLikeDelay(300, 500);
      }
    });
  });

  describe('并发和竞争条件', () => {
    test('应该处理快速连续消息发送', async ({ page, chatPage }) => {
      await chatPage.navigateToChat();
      await chatPage.startGuestSession();

      // 快速发送多条消息
      const messages = [
        '第一条消息',
        '第二条消息',
        '第三条消息',
        '第四条消息',
        '第五条消息',
      ];

      for (const message of messages) {
        await chatPage.sendMessage(message);
        await humanLikeDelay(50, 100); // 很短的间隔
      }

      // 验证所有消息都被正确处理
      await page.waitForTimeout(3000);

      const userMessages = await page
        .locator('[data-testid="user-message"]')
        .count();
      expect(userMessages).toBe(5);

      // 验证AI响应了最新的消息
      const aiMessages = await page
        .locator('[data-testid="ai-message"]')
        .count();
      expect(aiMessages).toBeGreaterThan(0);
    });

    test('应该处理多个浏览器标签页的同一会话', async ({ browser }) => {
      const context = await browser.newContext();
      const page1 = await context.newPage();
      const page2 = await context.newPage();

      const chatPage1 = new (await import('./fixtures')).ChatPageObject(page1);
      const chatPage2 = new (await import('./fixtures')).ChatPageObject(page2);

      // 在第一个标签页创建会话
      await chatPage1.navigateToChat();
      await chatPage1.startGuestSession();
      await chatPage1.sendMessage('标签页1的消息');

      // 在第二个标签页打开同一个应用
      await chatPage2.navigateToChat();

      // 等待同步
      await page2.waitForTimeout(2000);

      // 验证会话状态同步
      const state1 = await chatPage1.getCurrentState();
      const state2 = await chatPage2.getCurrentState();

      expect(state1).toBe(state2);

      // 在第二个标签页发送消息
      await chatPage2.sendMessage('标签页2的消息');

      // 验证第一个标签页能看到更新
      await page1.waitForTimeout(2000);
      const messages1 = await page1
        .locator('[data-testid="chat-message"]')
        .count();
      const messages2 = await page2
        .locator('[data-testid="chat-message"]')
        .count();

      expect(messages1).toBe(messages2);

      await context.close();
    });
  });

  describe('资源限制和性能边界', () => {
    test('应该处理内存不足情况', async ({ page, chatPage }) => {
      await chatPage.navigateToChat();
      await chatPage.startGuestSession();

      // 模拟大量数据加载导致内存压力
      await page.evaluate(() => {
        // 创建大量DOM元素模拟内存压力
        const container = document.createElement('div');
        container.style.display = 'none';
        document.body.appendChild(container);

        for (let i = 0; i < 10000; i++) {
          const element = document.createElement('div');
          element.innerHTML = `Large content ${i}`.repeat(100);
          container.appendChild(element);
        }
      });

      await chatPage.sendMessage('在内存压力下的测试');

      // 验证应用仍然能够响应
      await chatPage.waitForAIResponse();

      // 验证没有崩溃
      const pageUrl = page.url();
      expect(pageUrl).toContain('localhost');
    });

    test('应该处理CPU密集型操作', async ({ page, chatPage, compassPage }) => {
      await compassPage.navigateToCompass();
      await compassPage.waitForCompassLoad();

      // 模拟CPU密集型操作（大量罗盘计算）
      await page.evaluate(() => {
        for (let i = 0; i < 1000; i++) {
          // 模拟复杂的罗盘计算
          const angle = (i * 360) / 1000;
          const radians = (angle * Math.PI) / 180;
          const x = Math.cos(radians) * 100;
          const y = Math.sin(radians) * 100;

          // 模拟DOM更新
          if (i % 100 === 0) {
            const element = document.querySelector(
              '[data-testid="compass-reading"]'
            );
            if (element) {
              element.setAttribute('data-value', angle.toString());
            }
          }
        }
      });

      // 验证UI仍然响应
      await compassPage.simulateCompassReading({
        magnetic: 180,
        true: 175,
        declination: -5,
        accuracy: 'high',
      });

      const reading = await compassPage.getCurrentReading();
      expect(parseInt(reading ?? '0')).toBeCloseTo(180, 10);
    });
  });

  describe('浏览器兼容性边界', () => {
    test('应该处理不支持的浏览器功能', async ({ page, compassPage }) => {
      await compassPage.navigateToCompass();

      // 模拟浏览器不支持设备方向API
      await page.evaluate(() => {
        // 通过覆盖为 undefined 模拟不支持（避免删除导致的只读报错）
        Object.defineProperty(window, 'DeviceOrientationEvent', { value: undefined });
        Object.defineProperty(window, 'DeviceMotionEvent', { value: undefined });
      });

      await page.reload();
      await compassPage.waitForCompassLoad();

      // 验证降级到手动输入模式
      await waitAndVerifyElement(page, '[data-testid="manual-input-mode"]');
      await waitAndVerifyElement(
        page,
        '[data-testid="browser-compatibility-warning"]'
      );

      // 验证手动模式仍然可用
      await page.fill('[data-testid="manual-direction-input"]', '90');
      await page.click('[data-testid="set-direction"]');

      const manualReading = await compassPage.getCurrentReading();
      expect(parseInt(manualReading ?? '0')).toBe(90);
    });

    test('应该处理本地存储不可用', async ({ page, chatPage }) => {
      // 禁用本地存储
      await page.evaluate(() => {
        Object.defineProperty(window, 'localStorage', {
          value: null,
          writable: false,
        });
      });

      await chatPage.navigateToChat();

      // 验证应用仍然可以运行（使用内存存储）
      await chatPage.startGuestSession();
      await chatPage.sendMessage('无本地存储测试');
      await chatPage.waitForAIResponse();

      // 验证警告提示
      await waitAndVerifyElement(
        page,
        '[data-testid="storage-unavailable-warning"]'
      );
    });
  });

  describe('异常数据处理', () => {
    test('应该处理损坏的会话数据', async ({ page, chatPage }) => {
      // 注入损坏的会话数据
      await page.evaluate(() => {
        window.localStorage.setItem('guestSessionId', 'invalid-session-data');
        window.localStorage.setItem('chatHistory', '{"invalid": json}');
        window.localStorage.setItem('currentChatState', 'not-json');
      });

      await chatPage.navigateToChat();

      // 验证应用能够处理损坏的数据并重新初始化
      await chatPage.startGuestSession();

      // 验证新的有效会话被创建
      const sessionId = await page.evaluate(() => {
        return window.localStorage.getItem('guestSessionId');
      });

      expect(sessionId).toBeTruthy();
      expect(sessionId).not.toBe('invalid-session-data');
    });

    test('应该处理API返回的异常数据', async ({ page, chatPage }) => {
      await chatPage.navigateToChat();
      await chatPage.startGuestSession();

      // 模拟API返回异常数据
      await page.route('**/api/chat/**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            // 缺少必要字段
            content: null,
            confidence: 'not-a-number',
            state: 'invalid-state',
            metadata: 'not-an-object',
          }),
        });
      });

      await chatPage.sendMessage('异常数据测试');

      // 验证错误处理
      await waitAndVerifyElement(page, '[data-testid="data-format-error"]');
      await waitAndVerifyElement(page, '[data-testid="retry-button"]');

      // 验证系统仍然稳定
      const currentState = await chatPage.getCurrentState();
      expect(['greeting', 'collecting_info', 'error']).toContain(currentState);
    });
  });

  describe('安全边界测试', () => {
    test('应该防止XSS攻击', async ({ page, chatPage }) => {
      await chatPage.navigateToChat();
      await chatPage.startGuestSession();

      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src="x" onerror="alert(\'XSS\')">',
        'javascript:alert("XSS")',
        '<svg onload="alert(\'XSS\')">',
        '{{constructor.constructor("alert(\'XSS\')")()}}',
      ];

      for (const payload of xssPayloads) {
        await chatPage.sendMessage(payload);
        await humanLikeDelay(500);

        // 验证脚本没有执行
        const alertDialogs = await page.evaluate(() => {
          return window.document.querySelector('script') === null;
        });

        expect(alertDialogs).toBe(true);

        // 验证内容被正确转义
        const lastMessage = await page
          .locator('[data-testid="user-message"]')
          .last();
        const messageText = await lastMessage.textContent();
        expect(messageText).toContain(payload);

        const messageHTML = await lastMessage.innerHTML();
        expect(messageHTML).not.toContain('<script>');
      }
    });

    test('应该限制文件上传大小和类型', async ({ page, chatPage }) => {
      await chatPage.navigateToChat();
      await chatPage.startGuestSession();

      // 模拟上传超大文件
      const largeFakeFile = new Array(50 * 1024 * 1024).fill('A').join(''); // 50MB

      await page.evaluate(content => {
        const fileInput = document.querySelector(
          '[data-testid="file-upload"]'
        ) as HTMLInputElement;
        if (fileInput) {
          const dataTransfer = new DataTransfer();
          const file = new File([content], 'large-file.txt', {
            type: 'text/plain',
          });
          dataTransfer.items.add(file);
          fileInput.files = dataTransfer.files;
          fileInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, largeFakeFile);

      // 验证文件被拒绝
      await waitAndVerifyElement(page, '[data-testid="file-too-large-error"]');

      // 测试不支持的文件类型
      await page.evaluate(() => {
        const fileInput = document.querySelector(
          '[data-testid="file-upload"]'
        ) as HTMLInputElement;
        if (fileInput) {
          const dataTransfer = new DataTransfer();
          const file = new File(['content'], 'script.exe', {
            type: 'application/exe',
          });
          dataTransfer.items.add(file);
          fileInput.files = dataTransfer.files;
          fileInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });

      await waitAndVerifyElement(
        page,
        '[data-testid="unsupported-file-type-error"]'
      );
    });
  });

  test('综合错误恢复测试', async ({ page, chatPage, testUser }) => {
    await chatPage.navigateToChat();
    await chatPage.startGuestSession();

    // 1. 开始正常流程
    await chatPage.sendMessage('我想分析八字');
    await waitForStateTransition(page, 'greeting', 'collecting_info');

    // 2. 模拟网络错误
    await page.route('**/api/**', route => route.abort('failed'));
    await chatPage.fillBaziForm(testUser);
    await waitAndVerifyElement(page, '[data-testid="error-message"]');

    // 3. 恢复网络并重试
    await page.unroute('**/api/**');
    await page.click('[data-testid="retry-button"]');

    // 4. 验证能够继续正常流程
    await waitForStateTransition(page, 'collecting_info', 'analyzing');
    await waitForStateTransition(page, 'analyzing', 'explaining', 20000);

    // 5. 模拟浏览器崩溃恢复（刷新页面）
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 6. 验证会话恢复
    const recoveredState = await chatPage.getCurrentState();
    expect(['explaining', 'recommending']).toContain(recoveredState);

    // 7. 验证可以继续对话
    await chatPage.sendMessage('请给我具体建议');
    await chatPage.waitForAIResponse();

    await takeScreenshotWithName(page, 'error-recovery-complete', true);
  });
});
