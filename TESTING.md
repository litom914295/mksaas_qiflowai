# QiFlow AI 测试指南

## 📋 概述

本项目使用完整的测试金字塔，包含单元测试、API 测试、集成测试和 E2E 测试。

### 测试技术栈
- **单元测试/API测试**: Vitest + React Testing Library
- **E2E 测试**: Playwright
- **Mock**: MSW (Mock Service Worker)
- **覆盖率**: @vitest/coverage-v8

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 缓存回归保障

- `src/lib/cache/__tests__/bazi-cache.test.ts`：确保 `computeBaziWithCache` 在重复请求下能够命中缓存，避免重复计算导致的性能回退。

### 运行测试

```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 监听模式（开发时使用）
npm run test:unit:watch

# 运行 API 测试
npm run test:api

# 运行 E2E 测试
npm run test:e2e

# 运行安全测试
npm run test:security

# 生成覆盖率报告
npm run test:coverage
```

## 📁 测试目录结构

```
tests/
├── unit/           # 单元测试
│   ├── bazi/       # 八字计算测试
│   ├── credits/    # 积分系统测试
│   ├── fengshui/   # 风水计算测试
│   └── ai/         # AI 功能测试
├── api/            # API 路由测试
├── integration/    # 集成测试
├── e2e/            # 端到端测试
├── security/       # 安全测试
├── helpers/        # 测试辅助工具
├── mocks/          # Mock 数据和 handlers
└── setup.ts        # 测试设置文件
```

## 🧪 编写测试

### 单元测试示例

```typescript
import { describe, expect, test } from 'vitest';

describe('功能模块', () => {
  test('应该正确执行某个操作', () => {
    const result = doSomething();
    expect(result).toBe(expectedValue);
  });
});
```

### API 测试示例

```typescript
import { describe, expect, test } from 'vitest';

describe('API: /api/endpoint', () => {
  test('GET 请求返回正确数据', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('field');
  });
});
```

### E2E 测试示例

```typescript
import { test, expect } from '@playwright/test';

test('用户完整流程', async ({ page }) => {
  await page.goto('/zh');
  await expect(page).toHaveTitle(/QiFlow/);
  
  // 执行用户操作
  await page.click('[data-testid="start-analysis"]');
  
  // 验证结果
  await expect(page.locator('.result')).toBeVisible();
});
```

## 🔧 测试配置

### Vitest 配置 (vitest.config.ts)
- 环境：jsdom (用于组件测试)
- 覆盖率阈值：80%
- 排除目录：node_modules, .next, dist

### Playwright 配置 (playwright.config.ts)
- 基础 URL：http://localhost:3000
- 浏览器：Chromium, Firefox, WebKit
- 重试：2 次
- 超时：30 秒

## 📊 测试覆盖率

### 目标覆盖率
- **整体**: ≥ 80%
- **核心业务逻辑**: ≥ 90%
- **算法模块**: ≥ 95%

### 查看覆盖率报告
```bash
npm run test:coverage

# 生成 HTML 报告
npx vitest run --coverage --reporter=html
```

## 🛡️ 测试类型

### 1. 单元测试
- 纯函数和算法
- React 组件
- 工具函数
- 业务逻辑

### 2. API 测试
- Route handlers
- 中间件
- 错误处理
- 响应格式

### 3. 集成测试
- 数据库操作
- 认证流程
- 支付集成
- 外部服务

### 4. E2E 测试
- 关键用户路径
- 跨浏览器兼容性
- 多语言支持
- 响应式设计

### 5. 性能测试
- 加载时间
- Core Web Vitals
- API 响应时间
- 资源大小

### 6. 安全测试
- XSS 防护
- SQL 注入防护
- 认证授权
- 敏感数据保护

## 🐛 调试测试

### Vitest 调试
```bash
# 使用 UI 模式
npx vitest --ui

# 单个文件
npx vitest run path/to/test.ts

# 匹配测试名称
npx vitest -t "test name pattern"
```

### Playwright 调试
```bash
# 调试模式
npm run test:e2e:debug

# 带界面运行
npm run test:e2e:headed

# 查看测试报告
npm run test:e2e:report
```

## 💡 最佳实践

### DO ✅
1. 保持测试独立和可重复
2. 使用描述性的测试名称
3. 遵循 AAA 模式 (Arrange-Act-Assert)
4. Mock 外部依赖
5. 使用 data-testid 定位元素
6. 测试边界情况和错误路径

### DON'T ❌
1. 不要在测试中使用真实的 API 密钥
2. 不要依赖测试执行顺序
3. 不要在测试中修改全局状态
4. 不要忽略异步操作
5. 不要硬编码等待时间

## 🔄 CI/CD 集成

测试在以下场景自动运行：
- Pull Request 提交
- 主分支合并
- 发布前检查

### CI 流程
1. Lint 和类型检查
2. 单元测试和 API 测试
3. 集成测试
4. E2E 测试（关键路径）
5. 性能测试
6. 安全扫描

## 📚 相关资源

- [Vitest 文档](https://vitest.dev/)
- [Playwright 文档](https://playwright.dev/)
- [Testing Library 文档](https://testing-library.com/)
- [MSW 文档](https://mswjs.io/)

## 🤝 贡献指南

提交代码前请确保：
1. 所有测试通过
2. 覆盖率达到要求
3. 新功能包含对应测试
4. 更新相关测试文档

## ❓ 常见问题

### Q: 测试运行失败怎么办？
A: 检查环境变量、依赖版本、数据库连接

### Q: 如何跳过某些测试？
A: 使用 `test.skip()` 或 `describe.skip()`

### Q: 如何只运行特定测试？
A: 使用 `test.only()` 或 `describe.only()`

### Q: Mock 数据在哪里？
A: 查看 `tests/helpers/mock-data.ts` 和 `tests/mocks/`

## 📞 联系支持

如有问题，请联系：
- 技术负责人
- QA 团队
- 查看项目 Wiki
