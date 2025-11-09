import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // 支持两个测试目录
  testDir: './',
  testMatch: ['**/e2e/**/*.spec.ts', '**/tests/e2e/**/*.spec.ts'],

  fullyParallel: true,

  // 全局设置 - 配置认证状态
  globalSetup: './tests/e2e/global-setup.ts',

  // 优化超时设置
  timeout: 60_000, // 单个测试超时60秒（增加以应对慢页面）
  expect: {
    timeout: 10_000, // expect 断言超时10秒（增加稳定性）
  },

  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3010',
    headless: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // 使用保存的认证状态 (如果存在)
    storageState: process.env.E2E_SKIP_AUTH
      ? undefined
      : './playwright/.auth/user.json',

    // 添加导航超时 - 增加到60秒以应对慢启动
    navigationTimeout: 60_000, // 60秒导航超时（从15秒增加）
    actionTimeout: 30_000, // 30秒操作超时（从10秒增加）
  },

  webServer: process.env.E2E_SKIP_SERVER
    ? undefined
    : {
        command: process.env.E2E_DEV
          ? 'npm run dev -- -p 3010'
          : 'npm run build && npm run start -- -p 3010',
        url: process.env.E2E_HEALTH_URL || 'http://localhost:3010/api/health',
        timeout: 300_000, // 增加到300秒（5分钟），确保构建有足够时间
        reuseExistingServer: true, // 总是复用已存在的服务器
        stderr: 'pipe', // 捕获错误输出
        stdout: 'pipe', // 捕获标准输出
      },

  // 只在本地运行 Chromium，CI 中运行所有浏览器
  projects: process.env.CI
    ? [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
      ]
    : [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
