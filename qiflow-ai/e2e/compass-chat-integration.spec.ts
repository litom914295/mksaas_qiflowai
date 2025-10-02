import { expect, test } from './fixtures';
import {
    humanLikeDelay,
    takeScreenshotWithName,
    verifyAIResponse,
    waitAndVerifyElement,
    waitForAnimationsToComplete,
    waitForStateTransition,
} from './helpers/test-utils';

test.describe('罗盘与对话联动测试', () => {
  test('罗盘读数更新对话上下文', async ({
    page,
    chatPage,
    compassPage,
    compassReadings,
    testUser,
  }) => {
    await test.step('初始化聊天会话', async () => {
      await chatPage.navigateToChat();
      await chatPage.startGuestSession();
      await chatPage.sendMessage('我想了解家居风水');
      await chatPage.fillBaziForm(testUser);

      // 等待分析完成
      await waitForStateTransition(
        page,
        'collecting_info',
        'explaining',
        15000
      );
    });

    await test.step('导航到罗盘页面', async () => {
      await compassPage.navigateToCompass();
      await compassPage.waitForCompassLoad();

      // 验证罗盘初始状态
      const compassState = await compassPage.getCompassState();
      expect(compassState).toBe('ready');
    });

    await test.step('模拟罗盘读数变化', async () => {
      // 模拟初始方向读数
      await compassPage.simulateCompassReading({
        magnetic: 185,
        true: 180,
        declination: -5,
        accuracy: 'high',
      });

      await humanLikeDelay(500, 1000);

      // 验证读数更新
      const currentReading = await compassPage.getCurrentReading();
      expect(parseInt(currentReading ?? '0')).toBeCloseTo(185, 5);

      const calibratedReading = await compassPage.getCalibratedReading();
      expect(parseInt(calibratedReading ?? '0')).toBeCloseTo(180, 5);
    });

    await test.step('从罗盘打开对话', async () => {
      await compassPage.openChatFromCompass();

      // 验证对话界面加载
      await waitAndVerifyElement(page, '[data-testid="chat-interface"]');

      // 验证上下文包含罗盘信息
      await waitAndVerifyElement(page, '[data-testid="compass-context"]');

      const contextInfo = await page.locator(
        '[data-testid="compass-reading-display"]'
      );
      expect(await contextInfo.textContent()).toContain('180°');
    });

    await test.step('验证AI响应包含方位信息', async () => {
      await chatPage.sendMessage('基于当前房屋朝向给我建议');
      await chatPage.waitForAIResponse();

      // 验证AI响应考虑了方位信息
      await verifyAIResponse(page, ['南向', '朝向', '方位', '180']);
    });

    await test.step('测试罗盘读数变化更新对话', async () => {
      // 切换到罗盘页面
      await page.goto('/compass');
      await compassPage.waitForCompassLoad();

      // 模拟方向变化
      await compassPage.simulateCompassReading({
        magnetic: 95,
        true: 90,
        declination: -5,
        accuracy: 'high',
      });

      await humanLikeDelay(1000);

      // 重新打开对话
      await compassPage.openChatFromCompass();

      await chatPage.sendMessage('现在的朝向如何？');
      await chatPage.waitForAIResponse();

      // 验证新的方位信息
      await verifyAIResponse(page, ['东向', '90']);
    });

    await takeScreenshotWithName(page, 'compass-chat-integration', true);
  });

  test('罗盘校准过程与对话反馈', async ({ page, compassPage, chatPage }) => {
    await test.step('启动罗盘校准流程', async () => {
      await compassPage.navigateToCompass();
      await compassPage.waitForCompassLoad();

      // 开始校准
      await page.click('[data-testid="calibrate-button"]');
      await waitAndVerifyElement(page, '[data-testid="calibration-modal"]');
    });

    await test.step('模拟校准过程', async () => {
      // 模拟设备旋转校准
      const calibrationSteps: { magnetic: number; accuracy: 'low' | 'medium' | 'high' }[] = [
        { magnetic: 0, accuracy: 'low' },
        { magnetic: 90, accuracy: 'medium' },
        { magnetic: 180, accuracy: 'medium' },
        { magnetic: 270, accuracy: 'high' },
        { magnetic: 360, accuracy: 'high' },
      ];

      for (const step of calibrationSteps) {
        await compassPage.simulateCompassReading({
          magnetic: step.magnetic,
          true: step.magnetic - 5,
          declination: -5,
          accuracy: step.accuracy,
        });

        await humanLikeDelay(800, 1200);

        // 验证校准进度
        const progress = await page.getAttribute(
          '[data-testid="calibration-progress"]',
          'data-value'
        );
        expect(parseInt(progress ?? '0')).toBeGreaterThan(0);
      }

      // 完成校准
      await waitAndVerifyElement(page, '[data-testid="calibration-complete"]');
    });

    await test.step('验证校准结果在对话中的应用', async () => {
      await compassPage.openChatFromCompass();
      await chatPage.startGuestSession();

      await chatPage.sendMessage('罗盘校准得如何？');
      await chatPage.waitForAIResponse();

      // 验证AI知道校准状态
      await verifyAIResponse(page, ['校准', '精确', '准确']);
    });
  });

  test('3D罗盘与2D罗盘切换', async ({ page, compassPage, chatPage }) => {
    await test.step('测试罗盘视图切换', async () => {
      await compassPage.navigateToCompass();
      await compassPage.waitForCompassLoad();

      // 默认2D视图
      await waitAndVerifyElement(page, '[data-testid="compass-2d"]');

      // 切换到3D视图
      await page.click('[data-testid="toggle-3d-view"]');
      await waitForAnimationsToComplete(page);
      await waitAndVerifyElement(page, '[data-testid="compass-3d"]');

      // 验证3D罗盘交互
      await page.mouse.move(300, 300);
      await page.mouse.down();
      await page.mouse.move(350, 250);
      await page.mouse.up();

      await humanLikeDelay(500);
    });

    await test.step('验证3D交互不影响读数准确性', async () => {
      // 模拟方向读数
      await compassPage.simulateCompassReading({
        magnetic: 225,
        true: 220,
        declination: -5,
        accuracy: 'high',
      });

      const reading = await compassPage.getCurrentReading();
      expect(parseInt(reading ?? '0')).toBeCloseTo(225, 5);

      // 打开对话验证读数传递正确
      await compassPage.openChatFromCompass();
      await chatPage.startGuestSession();

      await chatPage.sendMessage('当前朝向是？');
      await chatPage.waitForAIResponse();

      await verifyAIResponse(page, ['西南', '225', '220']);
    });
  });

  test('移动设备罗盘功能', async ({ page, compassPage, chatPage }) => {
    // 模拟移动设备
    await page.setViewportSize({ width: 375, height: 667 });

    await test.step('测试移动设备罗盘界面', async () => {
      await compassPage.navigateToCompass();
      await compassPage.waitForCompassLoad();

      // 验证移动端界面适配
      await waitAndVerifyElement(page, '[data-testid="mobile-compass"]');
      await expect(
        page.locator('[data-testid="desktop-only"]')
      ).not.toBeVisible();
    });

    await test.step('测试设备方向权限', async () => {
      // 模拟权限请求
      await page.click('[data-testid="request-orientation-permission"]');

      // 模拟用户同意权限
      await page.evaluate(() => {
        Object.defineProperty(window, 'DeviceOrientationEvent', {
          value: {
            requestPermission: () => Promise.resolve('granted'),
          },
        });
      });

      await humanLikeDelay(1000);

      // 验证权限状态
      await waitAndVerifyElement(page, '[data-testid="permission-granted"]');
    });

    await test.step('测试触摸手势控制', async () => {
      // 模拟触摸操作
      await page.touchscreen.tap(200, 200);
      await humanLikeDelay(500);

      // 模拟滑动锁定方向
      await page.touchscreen.tap(200, 200);
      await page.mouse.move(200, 150);
      await page.touchscreen.tap(200, 150);

      await waitAndVerifyElement(page, '[data-testid="direction-locked"]');
    });

    await test.step('验证移动端对话集成', async () => {
      await compassPage.openChatFromCompass();

      // 验证移动端聊天界面
      await waitAndVerifyElement(page, '[data-testid="mobile-chat"]');

      await chatPage.startGuestSession();
      await chatPage.sendMessage('移动端测试');
      await chatPage.waitForAIResponse();

      // 验证移动端AI响应
      const response = await chatPage.getLastMessage();
      expect(response).toBeTruthy();
    });
  });

  test('罗盘数据持久化和恢复', async ({ page, compassPage, chatPage }) => {
    await test.step('设置罗盘读数并保存', async () => {
      await compassPage.navigateToCompass();
      await compassPage.waitForCompassLoad();

      // 设置特定读数
      await compassPage.simulateCompassReading({
        magnetic: 135,
        true: 130,
        declination: -5,
        accuracy: 'high',
      });

      // 保存读数
      await page.click('[data-testid="save-reading"]');
      await waitAndVerifyElement(page, '[data-testid="reading-saved"]');
    });

    await test.step('刷新页面验证数据恢复', async () => {
      await page.reload();
      await compassPage.waitForCompassLoad();

      // 验证读数恢复
      const savedReading = await page.getAttribute(
        '[data-testid="last-saved-reading"]',
        'data-value'
      );
      expect(parseInt(savedReading ?? '0')).toBeCloseTo(135, 5);
    });

    await test.step('验证历史读数在对话中可用', async () => {
      await compassPage.openChatFromCompass();
      await chatPage.startGuestSession();

      await chatPage.sendMessage('显示我的历史罗盘读数');
      await chatPage.waitForAIResponse();

      await verifyAIResponse(page, ['历史', '135', '东南']);
    });
  });

  test('罗盘错误处理和降级', async ({ page, compassPage, chatPage }) => {
    await test.step('模拟传感器不可用', async () => {
      await compassPage.navigateToCompass();

      // 模拟设备不支持方向传感器
      await page.evaluate(() => {
        Object.defineProperty(window, 'DeviceOrientationEvent', {
          value: undefined,
        });
      });

      await page.reload();
      await compassPage.waitForCompassLoad();

      // 验证降级到手动输入模式
      await waitAndVerifyElement(page, '[data-testid="manual-input-mode"]');
    });

    await test.step('测试手动输入模式', async () => {
      await page.fill('[data-testid="manual-direction-input"]', '270');
      await page.click('[data-testid="set-direction"]');

      const manualReading = await compassPage.getCurrentReading();
      expect(parseInt(manualReading ?? '0')).toBe(270);
    });

    await test.step('验证手动模式对话集成', async () => {
      await compassPage.openChatFromCompass();
      await chatPage.startGuestSession();

      await chatPage.sendMessage('当前朝向');
      await chatPage.waitForAIResponse();

      await verifyAIResponse(page, ['西向', '270', '手动设置']);
    });
  });
});
