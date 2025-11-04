# 测试脚本配置指南

## 📋 概述

本文档说明如何在 `package.json` 中配置测试脚本，以便运行单元测试和 E2E 测试。

---

## 🔧 package.json 配置

### 推荐的测试脚本

在 `package.json` 的 `scripts` 部分添加以下内容：

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest src/lib/__tests__/",
    "test:i18n": "jest src/lib/__tests__/i18n-routes.test.ts",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:i18n": "playwright test e2e/i18n-navigation.spec.ts",
    "test:all": "npm run test && npm run test:e2e",
    "playwright:install": "playwright install"
  }
}
```

---

## 📦 依赖安装

### Jest (单元测试)

如果项目还没有安装 Jest，运行：

```bash
npm install --save-dev jest @jest/globals @types/jest ts-jest
```

### Jest 配置文件

创建 `jest.config.js`：

```javascript
/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

module.exports = config;
```

### Playwright (E2E 测试)

如果项目还没有安装 Playwright，运行：

```bash
npm install --save-dev @playwright/test
npx playwright install
```

---

## 🚀 运行测试

### 单元测试

```bash
# 运行所有单元测试
npm run test

# 监听模式（开发时使用）
npm run test:watch

# 生成覆盖率报告
npm run test:coverage

# 仅运行 i18n-routes 测试
npm run test:i18n
```

### E2E 测试

```bash
# 首次运行前安装浏览器
npm run playwright:install

# 运行所有 E2E 测试
npm run test:e2e

# 使用 UI 模式运行（推荐）
npm run test:e2e:ui

# 仅运行 i18n 导航测试
npm run test:e2e:i18n
```

### 运行所有测试

```bash
# 运行单元测试和 E2E 测试
npm run test:all
```

---

## 📊 覆盖率报告

运行 `npm run test:coverage` 后，会生成覆盖率报告：

- 终端输出：简要统计
- HTML 报告：`coverage/lcov-report/index.html`

打开 HTML 报告：

```bash
# Windows
start coverage/lcov-report/index.html

# macOS
open coverage/lcov-report/index.html

# Linux
xdg-open coverage/lcov-report/index.html
```

---

## 🔍 调试测试

### Jest 调试

在 VS Code 中创建 `.vscode/launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Debug",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Playwright 调试

```bash
# 以调试模式运行
npx playwright test --debug

# 逐步执行
npx playwright test --debug e2e/i18n-navigation.spec.ts

# 查看浏览器操作
npx playwright test --headed
```

---

## 📝 最佳实践

### 1. 测试命名

- 单元测试：`*.test.ts` 或 `*.spec.ts`
- E2E 测试：`*.spec.ts`（在 `e2e/` 目录中）

### 2. 测试组织

```
src/
├── lib/
│   ├── i18n-routes.ts
│   └── __tests__/
│       └── i18n-routes.test.ts
e2e/
└── i18n-navigation.spec.ts
```

### 3. 持续集成

在 CI/CD 流程中添加测试步骤（如 GitHub Actions）：

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### 4. Pre-commit Hook

使用 Husky 在提交前运行测试：

```bash
# 安装 Husky
npm install --save-dev husky
npx husky install

# 添加 pre-commit hook
npx husky add .husky/pre-commit "npm run test"
```

---

## 🎯 快速开始检查清单

- [ ] 安装 Jest 和相关依赖
- [ ] 安装 Playwright
- [ ] 创建 `jest.config.js`
- [ ] 更新 `package.json` 脚本
- [ ] 运行 `npm run test` 验证单元测试
- [ ] 运行 `npm run test:e2e` 验证 E2E 测试
- [ ] 查看覆盖率报告
- [ ] （可选）配置 CI/CD
- [ ] （可选）设置 pre-commit hook

---

## 🆘 常见问题

### Q1: Jest 找不到模块

**问题：** `Cannot find module '@/...'`

**解决方案：** 确保 `jest.config.js` 中配置了 `moduleNameMapper`：

```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
}
```

### Q2: Playwright 浏览器未安装

**问题：** `Executable doesn't exist`

**解决方案：** 运行 `npx playwright install`

### Q3: TypeScript 类型错误

**问题：** Jest 中的 TypeScript 类型错误

**解决方案：** 确保安装了 `@types/jest` 和 `ts-jest`

### Q4: E2E 测试超时

**问题：** 测试在 CI 中超时

**解决方案：** 增加超时时间或优化测试：

```typescript
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60秒
  // ...
});
```

---

## 📚 相关资源

- [Jest 官方文档](https://jestjs.io/)
- [Playwright 官方文档](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [国际化路由使用指南](./i18n-routes-guide.md)

---

**最后更新：** 2024年  
**维护者：** QiFlow AI 开发团队
