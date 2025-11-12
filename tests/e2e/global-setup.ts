/**
 * Playwright全局设置
 * 配置测试用户认证状态,避免每个测试都需要登录
 */

import path from 'node:path';
import { type FullConfig, chromium } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔧 配置E2E测试认证状态...');

    // 方案1: 添加测试用户的session cookie
    // 这样可以绕过登录要求
    await context.addCookies([
      {
        name: 'better-auth.session_token',
        value: 'e2e-test-session-token',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      },
      {
        name: 'NEXT_LOCALE',
        value: 'zh-CN',
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
      },
    ]);

    // 方案2: 设置测试环境标识
    // 中间件可以检查这个来绕过认证
    await context.addCookies([
      {
        name: 'E2E_TEST_MODE',
        value: 'true',
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
      },
    ]);

    // 保存认证状态到文件
    const storageStatePath = path.join(
      __dirname,
      '..',
      '..',
      'playwright',
      '.auth',
      'user.json'
    );
    await context.storageState({ path: storageStatePath });

    console.log('✅ E2E测试认证状态配置完成');
    console.log(`📁 认证状态保存至: ${storageStatePath}`);
  } catch (error) {
    console.error('❌ 配置认证状态失败:', error);
    // 继续测试,即使认证配置失败
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }
}

export default globalSetup;
