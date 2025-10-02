import { expect, test } from './fixtures';
import {
    humanLikeDelay,
    measureResponseTime,
    takeScreenshotWithName,
    verifyAIResponse,
    waitAndVerifyElement,
    waitForStateTransition,
} from './helpers/test-utils';

test.describe('状态机转换测试', () => {
  test('完整状态机流程转换', async ({ page, chatPage, testUser }) => {
    await test.step('初始状态: greeting', async () => {
      await chatPage.navigateToChat();
      await chatPage.startGuestSession();

      const initialState = await chatPage.getCurrentState();
      expect(initialState).toBe('greeting');

      // 验证欢迎状态UI元素
      await waitAndVerifyElement(page, '[data-testid="greeting-interface"]');
      await waitAndVerifyElement(page, '[data-testid="welcome-message"]');
    });

    await test.step('转换: greeting -> collecting_info', async () => {
      await chatPage.sendMessage('我想了解我的八字运势');

      await waitForStateTransition(page, 'greeting', 'collecting_info');

      // 验证收集信息状态
      await waitAndVerifyElement(page, '[data-testid="info-collection-form"]');
      await waitAndVerifyElement(page, '[data-testid="bazi-form"]');

      // 验证状态相关UI变化
      await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
      await expect(page.locator('[data-testid="current-step"]')).toHaveText(
        '收集信息'
      );
    });

    await test.step('转换: collecting_info -> analyzing', async () => {
      await chatPage.fillBaziForm(testUser);

      await waitForStateTransition(page, 'collecting_info', 'analyzing');

      // 验证分析状态
      await waitAndVerifyElement(page, '[data-testid="analyzing-spinner"]');
      await waitAndVerifyElement(page, '[data-testid="analysis-progress"]');

      // 验证分析进度指示
      const progressText = await page.locator('[data-testid="current-step"]');
      await expect(progressText).toHaveText('分析中');
    });

    await test.step('转换: analyzing -> explaining', async () => {
      await waitForStateTransition(page, 'analyzing', 'explaining', 20000);

      // 验证解释状态
      await waitAndVerifyElement(page, '[data-testid="explanation-content"]');
      await waitAndVerifyElement(page, '[data-testid="bazi-results"]');

      // 验证AI解释内容
      await verifyAIResponse(page, ['八字分析', '五行', '天干地支']);
    });

    await test.step('转换: explaining -> recommending', async () => {
      await chatPage.sendMessage('请给我一些具体的风水建议');

      await waitForStateTransition(page, 'explaining', 'recommending');

      // 验证推荐状态
      await waitAndVerifyElement(page, '[data-testid="recommendation-cards"]');
      await waitAndVerifyElement(
        page,
        '[data-testid="actionable-suggestions"]'
      );

      const cards = await chatPage.getRecommendationCards();
      expect(cards.length).toBeGreaterThan(0);
    });

    await test.step('验证状态历史记录', async () => {
      // 检查状态转换历史
      const stateHistory = await page.evaluate(() => {
        return window.localStorage.getItem('chatStateHistory');
      });

      expect(stateHistory).toBeTruthy();

      const history = JSON.parse(stateHistory ?? '[]');
      const expectedStates = [
        'greeting',
        'collecting_info',
        'analyzing',
        'explaining',
        'recommending',
      ];

      expectedStates.forEach(state => {
        expect(
          history.some((entry: { state: string }) => entry.state === state)
        ).toBeTruthy();
      });
    });

    await takeScreenshotWithName(page, 'complete-state-flow', true);
  });

  test('状态转换错误处理和回滚', async ({ page, chatPage, testUser }) => {
    await test.step('正常进入分析状态', async () => {
      await chatPage.navigateToChat();
      await chatPage.startGuestSession();
      await chatPage.sendMessage('分析我的八字');
      await chatPage.fillBaziForm(testUser);

      await waitForStateTransition(page, 'collecting_info', 'analyzing');
    });

    await test.step('模拟分析失败', async () => {
      // 模拟API错误
      await page.route('**/api/ai/**', route => {
        route.abort('failed');
      });

      // 等待错误处理
      await waitAndVerifyElement(page, '[data-testid="analysis-error"]', {
        timeout: 10000,
      });

      // 验证状态回滚到收集信息
      const currentState = await chatPage.getCurrentState();
      expect(currentState).toBe('collecting_info');
    });

    await test.step('测试重试机制', async () => {
      // 恢复API
      await page.unroute('**/api/ai/**');

      // 点击重试
      await page.click('[data-testid="retry-analysis"]');

      await waitForStateTransition(page, 'collecting_info', 'analyzing');
      await waitForStateTransition(page, 'analyzing', 'explaining', 20000);

      // 验证成功恢复
      await waitAndVerifyElement(page, '[data-testid="explanation-content"]');
    });
  });

  test('并发状态转换处理', async ({ page, chatPage, testUser }) => {
    await test.step('快速连续触发状态转换', async () => {
      await chatPage.navigateToChat();
      await chatPage.startGuestSession();

      // 快速连续发送消息
      const messages = ['我想了解八字', '快点分析', '马上给建议'];

      for (const message of messages) {
        await chatPage.sendMessage(message);
        await humanLikeDelay(100, 300); // 短间隔
      }

      // 验证状态机正确处理并发请求
      await waitForStateTransition(page, 'greeting', 'collecting_info');

      // 填写表单后不应该跳过分析阶段
      await chatPage.fillBaziForm(testUser);
      await waitForStateTransition(page, 'collecting_info', 'analyzing');
    });

    await test.step('验证状态一致性', async () => {
      // 检查没有竞态条件导致的状态不一致
      const stateFromAttribute = await chatPage.getCurrentState();
      const stateFromStorage = await page.evaluate(() => {
        return JSON.parse(
          window.localStorage.getItem('currentChatState') || 'null'
        );
      });

      expect(stateFromAttribute).toBe(stateFromStorage?.state);
    });
  });

  test('状态转换性能测试', async ({ page, chatPage, testUser }) => {
    await test.step('测量各状态转换时间', async () => {
      await chatPage.navigateToChat();
      await chatPage.startGuestSession();

      // 测量 greeting -> collecting_info
      const greetingToCollecting = await measureResponseTime(page, async () => {
        await chatPage.sendMessage('开始八字分析');
        await waitForStateTransition(page, 'greeting', 'collecting_info');
      });

      expect(greetingToCollecting).toBeLessThan(3000); // 3秒内

      // 测量 collecting_info -> analyzing
      const collectingToAnalyzing = await measureResponseTime(
        page,
        async () => {
          await chatPage.fillBaziForm(testUser);
          await waitForStateTransition(page, 'collecting_info', 'analyzing');
        }
      );

      expect(collectingToAnalyzing).toBeLessThan(5000); // 5秒内

      // 测量 analyzing -> explaining
      const analyzingToExplaining = await measureResponseTime(
        page,
        async () => {
          await waitForStateTransition(page, 'analyzing', 'explaining', 30000);
        }
      );

      expect(analyzingToExplaining).toBeLessThan(25000); // 25秒内
    });
  });

  test('状态持久化和恢复', async ({ page, chatPage, testUser }) => {
    await test.step('进行到解释状态', async () => {
      await chatPage.navigateToChat();
      await chatPage.startGuestSession();
      await chatPage.sendMessage('分析八字');
      await chatPage.fillBaziForm(testUser);

      await waitForStateTransition(page, 'collecting_info', 'analyzing');
      await waitForStateTransition(page, 'analyzing', 'explaining', 20000);
    });

    await test.step('刷新页面验证状态恢复', async () => {
      await page.reload();
      await page.waitForLoadState('networkidle');

      // 验证状态正确恢复
      const restoredState = await chatPage.getCurrentState();
      expect(restoredState).toBe('explaining');

      // 验证UI状态同步
      await waitAndVerifyElement(page, '[data-testid="explanation-content"]');
      await expect(page.locator('[data-testid="current-step"]')).toHaveText(
        '解释结果'
      );
    });

    await test.step('验证可以继续状态流程', async () => {
      // 继续到推荐状态
      await chatPage.sendMessage('给我具体建议');
      await waitForStateTransition(page, 'explaining', 'recommending');

      await waitAndVerifyElement(page, '[data-testid="recommendation-cards"]');
    });
  });

  test('状态转换边界条件', async ({ page, chatPage }) => {
    await test.step('测试无效状态转换', async () => {
      await chatPage.navigateToChat();
      await chatPage.startGuestSession();

      // 尝试直接跳到推荐状态（应该被阻止）
      await page.evaluate(() => {
        window.postMessage(
          {
            type: 'FORCE_STATE_CHANGE',
            payload: { state: 'recommending' },
          },
          '*'
        );
      });

      await humanLikeDelay(1000);

      // 验证状态没有改变
      const currentState = await chatPage.getCurrentState();
      expect(currentState).toBe('greeting');
    });

    await test.step('测试状态回退', async () => {
      // 正常进入收集信息状态
      await chatPage.sendMessage('开始分析');
      await waitForStateTransition(page, 'greeting', 'collecting_info');

      // 测试回退到greeting
      await page.click('[data-testid="back-to-greeting"]');
      await waitForStateTransition(page, 'collecting_info', 'greeting');

      await waitAndVerifyElement(page, '[data-testid="greeting-interface"]');
    });
  });

  test('多用户状态隔离', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    const chatPage1 = new (await import('./fixtures')).ChatPageObject(page1);
    const chatPage2 = new (await import('./fixtures')).ChatPageObject(page2);

    await test.step('用户1进入分析状态', async () => {
      await chatPage1.navigateToChat();
      await chatPage1.startGuestSession();
      await chatPage1.sendMessage('分析八字');

      await waitForStateTransition(page1, 'greeting', 'collecting_info');
    });

    await test.step('用户2保持在欢迎状态', async () => {
      await chatPage2.navigateToChat();
      await chatPage2.startGuestSession();

      // 验证用户2的状态独立
      const state2 = await chatPage2.getCurrentState();
      expect(state2).toBe('greeting');
    });

    await test.step('验证状态完全隔离', async () => {
      // 用户2也进入收集信息状态
      await chatPage2.sendMessage('我也要分析');
      await waitForStateTransition(page2, 'greeting', 'collecting_info');

      // 验证两个用户状态独立管理
      const state1 = await chatPage1.getCurrentState();
      const state2 = await chatPage2.getCurrentState();

      expect(state1).toBe('collecting_info');
      expect(state2).toBe('collecting_info');

      // 验证会话ID不同
      const sessionId1 = await page1.evaluate(() => {
        return window.localStorage.getItem('guestSessionId');
      });

      const sessionId2 = await page2.evaluate(() => {
        return window.localStorage.getItem('guestSessionId');
      });

      expect(sessionId1).not.toBe(sessionId2);
    });

    await context1.close();
    await context2.close();
  });
});
