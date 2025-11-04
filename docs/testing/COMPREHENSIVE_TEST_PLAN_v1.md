# QiFlow AI 全面测试计划 v1.0

## 📋 测试现状分析

### ✅ 已有测试覆盖
1. **E2E 测试 (Playwright)**
   - ✓ 国际化路由测试（i18n-navigation.spec.ts）
   - ✓ 基础烟雾测试（smoke.spec.ts）
   - ✓ QiFlow 核心功能测试（qiflow.spec.ts）
   - ✓ API 健康检查（health-check.spec.ts）
   - ✓ AI 聊天系统测试
   - ✓ 用户增长激活测试
   - ✓ 访客分析测试

2. **单元测试**
   - ✓ 权限系统测试（lib/auth/__tests__/permissions.test.ts）
   - ✓ i18n 路由测试（lib/__tests__/i18n-routes.test.ts）
   - ✓ Bazi 集成测试（__tests__/bazi-integration.test.tsx）
   - ✓ API 用户测试（__tests__/api/users.test.ts）

### ❌ 测试覆盖缺口

#### 🔴 高优先级未覆盖
1. **计费系统（Critical）**
   - 积分扣除逻辑
   - 余额验证
   - 支付流程（Stripe/Alipay/WeChat）
   - 订阅管理
   - 降级策略

2. **安全性测试**
   - 认证/授权流程
   - SQL 注入防护
   - XSS 防护
   - CSRF 防护
   - 敏感数据处理

3. **API 端点测试**
   - RESTful API 完整性
   - 错误处理
   - 限流机制
   - 响应格式验证

#### 🟡 中优先级未覆盖
4. **业务逻辑核心**
   - 八字计算准确性
   - 玄空飞星分析
   - AI 对话质量
   - PDF 导出功能

5. **数据完整性**
   - 数据库迁移测试
   - 数据一致性检查
   - 备份/恢复流程

6. **国际化完整性**
   - 所有语言翻译完整性
   - 日期/时间本地化
   - 货币格式化

#### 🟢 低优先级未覆盖
7. **性能测试**
   - 页面加载时间
   - Core Web Vitals
   - API 响应时间
   - 并发处理能力

8. **可访问性测试**
   - WCAG 2.1 AA 标准
   - 屏幕阅读器兼容性
   - 键盘导航

---

## 🎯 测试策略

### 1. 单元测试策略（Vitest）

#### 目标覆盖率
- 工具函数：95%+
- 业务逻辑：90%+
- 组件逻辑：80%+

#### 优先测试模块
```typescript
// 计费系统核心
src/credits/
  ├── credits.ts          // 积分核心逻辑
  ├── distribute.ts       // 积分分发
  ├── vouchers.ts        // 优惠券
  └── client.ts          // 客户端操作

// 认证授权
src/lib/auth/
  └── permissions.ts     // 权限验证

// 八字计算核心
src/lib/qiflow/
  ├── bazi-calculator.ts
  └── xuankong-calculator.ts
```

### 2. 集成测试策略

#### API 测试矩阵
| API 端点 | 方法 | 优先级 | 测试场景 |
|---------|------|--------|---------|
| `/api/credits/balance` | GET | 高 | 正常/未登录/余额不足 |
| `/api/credits/consume` | POST | 高 | 扣费成功/余额不足/参数错误 |
| `/api/payment/checkout` | POST | 高 | Stripe/Alipay/WeChat 支付 |
| `/api/qiflow/bazi` | POST | 高 | 计算准确性/错误处理 |
| `/api/qiflow/xuankong` | POST | 中 | 风水分析准确性 |
| `/api/ai/chat` | POST | 高 | AI 响应质量/限流 |
| `/api/admin/*` | ALL | 高 | 权限验证/数据操作 |

### 3. E2E 测试策略（Playwright）

#### 用户旅程测试
```
1. 新用户注册流程
   ├── 18+ 年龄验证
   ├── 邮箱注册
   ├── 欢迎奖励积分发放
   └── 首次使用引导

2. 八字分析完整流程
   ├── 表单填写
   ├── 积分扣除确认
   ├── 计算结果展示
   ├── PDF 导出
   └── 结果分享

3. 积分购买流程
   ├── 套餐选择
   ├── 支付方式选择
   ├── 支付完成
   └── 积分到账确认

4. 管理员操作流程
   ├── 用户管理
   ├── 积分管理
   ├── 数据导出
   └── 系统配置
```

### 4. 性能测试策略

#### 关键指标
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **API 响应时间**: p95 < 500ms
- **并发用户**: 支持 100+ 同时在线

### 5. 安全测试策略

#### 测试检查清单
- [ ] SQL 注入防护（参数化查询）
- [ ] XSS 防护（输入转义）
- [ ] CSRF Token 验证
- [ ] 认证 Token 过期机制
- [ ] 敏感数据加密存储
- [ ] API 限流实现
- [ ] 权限边界测试
- [ ] 文件上传安全性

---

## 📝 测试用例详细规划

### Phase 1: 关键功能测试（1-2天）

#### 1.1 积分系统测试
```typescript
// tests/unit/credits/credits.test.ts
describe('Credits System', () => {
  describe('deductCredits', () => {
    test('成功扣除积分', async () => {})
    test('余额不足时拒绝扣费', async () => {})
    test('并发扣费的一致性', async () => {})
  })
  
  describe('creditDegradation', () => {
    test('余额不足时三级降级', async () => {})
    test('每个模块的积分消耗准确', async () => {})
  })
  
  describe('distributeCredits', () => {
    test('新用户欢迎奖励发放', async () => {})
    test('推荐奖励计算准确', async () => {})
    test('优惠券使用逻辑', async () => {})
  })
})
```

#### 1.2 支付系统测试
```typescript
// tests/e2e/payment-flow.spec.ts
describe('Payment Integration', () => {
  test('Stripe 支付流程', async ({ page }) => {
    // 1. 选择套餐
    // 2. 创建 checkout session
    // 3. 模拟支付成功
    // 4. 验证积分到账
    // 5. 验证订单记录
  })
  
  test('支付失败回滚', async ({ page }) => {})
  test('重复支付检测', async ({ page }) => {})
})
```

#### 1.3 认证授权测试
```typescript
// tests/unit/auth/permissions.test.ts
describe('Authentication & Authorization', () => {
  test('管理员权限验证', async () => {})
  test('普通用户权限边界', async () => {})
  test('Token 过期处理', async () => {})
  test('多设备登录限制', async () => {})
})
```

### Phase 2: API 端点测试（2-3天）

```typescript
// tests/api/endpoints.test.ts
describe('API Endpoints', () => {
  describe('GET /api/credits/balance', () => {
    test('返回正确的余额', async () => {})
    test('未认证返回 401', async () => {})
  })
  
  describe('POST /api/qiflow/bazi', () => {
    test('有效输入返回准确结果', async () => {})
    test('无效输入返回 400', async () => {})
    test('余额不足返回 402', async () => {})
    test('响应时间 < 3s', async () => {})
  })
  
  describe('POST /api/admin/credits', () => {
    test('管理员可以添加积分', async () => {})
    test('非管理员返回 403', async () => {})
  })
})
```

### Phase 3: 安全性测试（1-2天）

```typescript
// tests/security/vulnerabilities.test.ts
describe('Security Tests', () => {
  test('SQL 注入防护', async () => {
    // 测试各种 SQL 注入 payload
  })
  
  test('XSS 防护', async () => {
    // 测试脚本注入
  })
  
  test('CSRF 防护', async () => {
    // 测试跨站请求伪造
  })
  
  test('敏感数据不在日志中泄露', async () => {
    // 验证 PII、支付信息不被记录
  })
})
```

### Phase 4: 性能与负载测试（2天）

```typescript
// tests/performance/load-test.spec.ts
import { test as loadTest } from '@playwright/test'

describe('Performance Tests', () => {
  test('首页加载性能', async ({ page }) => {
    await page.goto('/')
    const metrics = await page.evaluate(() => ({
      lcp: performance.getEntriesByType('largest-contentful-paint')[0],
      fid: performance.getEntriesByType('first-input')[0],
      cls: performance.getEntriesByType('layout-shift')
    }))
    
    expect(metrics.lcp.renderTime).toBeLessThan(2500)
  })
  
  test('API 并发处理', async () => {
    // 模拟 50 个并发请求
  })
})
```

---

## 🛠️ 测试工具配置

### Vitest 配置
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/**'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

### Playwright 增强配置
```typescript
// playwright.config.ts (追加)
export default defineConfig({
  // ... 现有配置
  
  // 添加性能测试配置
  use: {
    // ... 现有配置
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    
    // 性能指标收集
    contextOptions: {
      recordVideo: {
        dir: './test-results/videos'
      }
    }
  },
  
  // 添加移动端测试
  projects: [
    // ... 现有配置
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] }
    }
  ]
})
```

---

## 📊 测试执行计划

### 阶段 1: 基础设施准备（0.5天）
- [x] 安装 Vitest
- [ ] 配置 Vitest
- [ ] 设置测试数据库
- [ ] 创建测试辅助函数

### 阶段 2: 核心功能测试（3天）
- [ ] 积分系统单元测试（1天）
- [ ] 支付系统集成测试（1天）
- [ ] 认证授权测试（0.5天）
- [ ] API 端点测试（0.5天）

### 阶段 3: E2E 测试扩充（2天）
- [ ] 用户注册到首次使用完整流程
- [ ] 积分购买和消费流程
- [ ] 管理员操作流程
- [ ] 错误场景处理

### 阶段 4: 专项测试（2天）
- [ ] 安全性测试（1天）
- [ ] 性能测试（0.5天）
- [ ] 可访问性测试（0.5天）

### 阶段 5: 测试报告（0.5天）
- [ ] 生成覆盖率报告
- [ ] 分析测试结果
- [ ] 提出改进建议
- [ ] 创建修复任务清单

**总预估时间: 8天**

---

## 🔄 持续集成策略

### GitHub Actions 工作流
```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:unit
      - run: npm run test:coverage
  
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx playwright install
      - run: npm run test:e2e
  
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - run: npm audit
      - run: npm run lint:security
```

---

## 📈 成功指标

### 量化目标
- ✅ 单元测试覆盖率 > 80%
- ✅ E2E 测试覆盖关键用户旅程 100%
- ✅ 所有 API 端点都有测试
- ✅ 安全测试通过率 100%
- ✅ 性能测试通过 Core Web Vitals 标准
- ✅ CI/CD 管道绿色通过率 > 95%

### 质量标准
- 📌 所有支付流程必须有完整测试
- 📌 权限系统必须有边界测试
- 📌 积分系统必须有并发测试
- 📌 关键业务逻辑必须有快照测试

---

## 🚀 快速开始

### 1. 运行现有测试
```bash
# E2E 测试
npm run test:e2e

# 单元测试（待配置）
npm run test:unit

# 测试覆盖率
npm run test:coverage
```

### 2. 添加新测试
```bash
# 单元测试
npx vitest tests/unit/your-test.test.ts

# E2E 测试
npx playwright test tests/e2e/your-test.spec.ts --headed
```

### 3. 调试测试
```bash
# 调试 E2E
npm run test:e2e:debug

# UI 模式
npm run test:e2e:ui
```

---

## 📚 参考资料

- [Playwright 文档](https://playwright.dev/)
- [Vitest 文档](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Web.dev Testing Guide](https://web.dev/testing/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
