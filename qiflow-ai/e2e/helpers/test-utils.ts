import { Page, expect } from '@playwright/test';

/**
 * 等待元素出现并验证
 */
export async function waitAndVerifyElement(
  page: Page,
  selector: string,
  options: { timeout?: number; text?: string } = {}
) {
  const element = await page.waitForSelector(selector, {
    timeout: options.timeout || 5000,
  });

  if (options.text) {
    await expect(element).toContain(options.text);
  }

  return element;
}

/**
 * 模拟网络延迟
 */
export async function simulateNetworkDelay(page: Page, delay: number = 1000) {
  await page.route('**/*', async route => {
    await new Promise(resolve => setTimeout(resolve, delay));
    await route.continue();
  });
}

/**
 * 等待状态机转换
 */
export async function waitForStateTransition(
  page: Page,
  fromState: string,
  toState: string,
  timeout: number = 10000
) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const currentState = await page.getAttribute(
      '[data-testid="chat-interface"]',
      'data-state'
    );

    if (currentState === toState) {
      return true;
    }

    await page.waitForTimeout(100);
  }

  throw new Error(`State transition from ${fromState} to ${toState} timed out`);
}

/**
 * 验证 AI 响应质量
 */
export async function verifyAIResponse(page: Page, expectedKeywords: string[]) {
  const lastMessage = await page.locator('[data-testid="ai-message"]').last();
  const messageText = await lastMessage.textContent();

  expect(messageText).toBeTruthy();

  for (const keyword of expectedKeywords) {
    expect(messageText).toContain(keyword);
  }

  return messageText;
}

/**
 * 截图并保存
 */
export async function takeScreenshotWithName(
  page: Page,
  name: string,
  fullPage: boolean = false
) {
  await page.screenshot({
    path: `test-results/screenshots/${name}-${Date.now()}.png`,
    fullPage,
  });
}

/**
 * 模拟用户操作延迟
 */
export async function humanLikeDelay(min: number = 100, max: number = 500) {
  const delay = Math.random() * (max - min) + min;
  await new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * 验证表单验证
 */
export async function testFormValidation(
  page: Page,
  formData: Record<
    string,
    { selector: string; invalidValue: string; validValue: string }
  >
) {
  for (const [field, config] of Object.entries(formData)) {
    // 测试无效值
    await page.fill(config.selector, config.invalidValue);
    await page.click('[data-testid="submit-button"]');

    const errorMessage = await page.locator(`[data-testid="${field}-error"]`);
    await expect(errorMessage).toBeVisible();

    // 测试有效值
    await page.fill(config.selector, config.validValue);
    const errorAfterFix = page.locator(`[data-testid="${field}-error"]`);
    await expect(errorAfterFix).not.toBeVisible();
  }
}

/**
 * 监控控制台错误
 */
export async function monitorConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  page.on('pageerror', error => {
    errors.push(error.message);
  });

  return errors;
}

/**
 * 验证多语言支持
 */
export async function testLanguageSwitch(
  page: Page,
  languages: string[],
  testSelector: string
) {
  for (const lang of languages) {
    await page.selectOption('[data-testid="language-selector"]', lang);
    await page.waitForTimeout(500);

    const element = await page.locator(testSelector);
    const text = await element.textContent();

    // 验证文本已更改且不为空
    expect(text).toBeTruthy();
    expect(text).not.toBe('MISSING_MESSAGE');
  }
}

/**
 * 验证响应时间
 */
export async function measureResponseTime(
  page: Page,
  action: () => Promise<void>
): Promise<number> {
  const startTime = Date.now();
  await action();
  const endTime = Date.now();

  return endTime - startTime;
}

/**
 * 模拟移动设备行为
 */
export async function simulateMobileGestures(page: Page) {
  // 模拟触摸事件
  await page.touchscreen.tap(100, 100);

  // 模拟滑动
  await page.touchscreen.tap(100, 100);
  await page.mouse.move(100, 200);
  await page.touchscreen.tap(100, 200);
}

/**
 * 等待动画完成
 */
export async function waitForAnimationsToComplete(page: Page) {
  await page.waitForFunction(() => {
    return (
      !document.querySelector('[data-testid*="loading"]') &&
      !document.querySelector('.animate-spin') &&
      !document.querySelector('.animate-pulse')
    );
  });
}
