# QiFlow AI 测试快速实施指南

## 🚀 立即开始

### 第一步：修复构建问题（30分钟）

编辑 `playwright.config.ts`:
```typescript
export default defineConfig({
  // ... 现有配置
  
  webServer: {
    command: 'npm run build && npm run start -- -p 3010',
    url: 'http://localhost:3010/api/health',
    timeout: 300_000, // 增加到 300 秒
    reuseExistingServer: true,
  },
})
```

### 第二步：运行现有测试（10分钟）

```bash
# 快速测试（跳过服务器构建）
E2E_SKIP_SERVER=true npm run test:e2e

# 或者运行特定测试
npx playwright test tests/e2e/smoke.spec.ts --headed
```

### 第三步：配置 package.json 脚本（5分钟）

在 `package.json` 中添加：
```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run",
    "test:unit:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e:quick": "E2E_SKIP_SERVER=true playwright test",
    "test:security": "vitest run tests/security",
    "test:credits": "vitest run tests/unit/credits"
  }
}
```

---

## ⚡ 优先实施：积分系统测试

### 创建测试数据库辅助函数

`tests/helpers/db-helper.ts`:
```typescript
import { db } from '@/db';

export async function createTestUser(overrides = {}) {
  return await db.users.create({
    email: `test-${Date.now()}@example.com`,
    name: 'Test User',
    credits: 100,
    ...overrides
  });
}

export async function cleanupTestData() {
  // 清理测试数据
  await db.users.deleteMany({
    where: { email: { contains: 'test-' } }
  });
}
```

### 实现第一个积分测试

`tests/unit/credits/deduct-credits.test.ts`:
```typescript
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { deductCredits } from '@/credits/credits';
import { createTestUser, cleanupTestData } from '../../helpers/db-helper';

describe('deductCredits - 积分扣除', () => {
  let testUser;

  beforeEach(async () => {
    testUser = await createTestUser({ credits: 100 });
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  test('应该成功扣除积分', async () => {
    const result = await deductCredits(testUser.id, 10, 'bazi');
    
    expect(result.success).toBe(true);
    expect(result.newBalance).toBe(90);
    expect(result.transactionId).toBeDefined();
  });

  test('余额不足时应该拒绝扣费', async () => {
    const result = await deductCredits(testUser.id, 1000, 'bazi');
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('余额不足');
    
    // 验证余额未变化
    const user = await db.users.findUnique({ where: { id: testUser.id } });
    expect(user.credits).toBe(100);
  });

  test('应该正确记录交易历史', async () => {
    await deductCredits(testUser.id, 10, 'bazi');
    
    const transactions = await db.creditTransactions.findMany({
      where: { userId: testUser.id }
    });
    
    expect(transactions).toHaveLength(1);
    expect(transactions[0].amount).toBe(-10);
    expect(transactions[0].type).toBe('deduct');
    expect(transactions[0].module).toBe('bazi');
  });
});
```

运行测试：
```bash
npm run test:credits
```

---

## 🔒 优先实施：安全测试

### SQL 注入防护测试

`tests/security/sql-injection.test.ts`:
```typescript
import { describe, test, expect } from 'vitest';
import { db } from '@/db';

describe('SQL注入防护', () => {
  const sqlPayloads = [
    "'; DROP TABLE users; --",
    "1' OR '1'='1",
    "admin'--",
    "' UNION SELECT * FROM users--"
  ];

  test('用户查询应该防止 SQL 注入', async () => {
    for (const payload of sqlPayloads) {
      // 尝试使用恶意输入查询
      const result = await db.users.findMany({
        where: { name: payload }
      });
      
      // 应该安全返回空结果，而不是抛出错误或泄露数据
      expect(result).toEqual([]);
    }
  });

  test('参数化查询应该自动转义特殊字符', async () => {
    const maliciousEmail = "'; DROP TABLE users; --";
    
    // 这应该安全执行，而不会破坏数据库
    await expect(
      db.users.findUnique({ where: { email: maliciousEmail } })
    ).resolves.toBeNull();
  });
});
```

### XSS 防护测试

`tests/security/xss-protection.test.ts`:
```typescript
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import UserProfile from '@/components/UserProfile';

describe('XSS防护', () => {
  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert(1)>',
    'javascript:alert(1)',
    '<iframe src="javascript:alert(1)">'
  ];

  test('用户名应该转义 HTML 标签', () => {
    for (const payload of xssPayloads) {
      const { container } = render(
        <UserProfile user={{ name: payload, email: 'test@example.com' }} />
      );
      
      // 检查 payload 被转义为文本，而不是执行
      expect(container.innerHTML).not.toContain(payload);
      expect(container.innerHTML).toContain('&lt;'); // HTML 实体转义
    }
  });

  test('评论内容应该清理危险脚本', async () => {
    const comment = '<script>alert("危险")</script>普通文字';
    
    // 假设有评论组件
    const { container } = render(<Comment content={comment} />);
    
    // 脚本应该被移除，普通文字保留
    expect(container.textContent).toBe('普通文字');
    expect(container.innerHTML).not.toContain('<script>');
  });
});
```

运行安全测试：
```bash
npm run test:security
```

---

## 🧪 E2E 测试：支付流程

`tests/e2e/payment-flow.spec.ts`:
```typescript
import { test, expect } from '@playwright/test';

test.describe('支付流程测试', () => {
  test('Stripe 支付完整流程', async ({ page }) => {
    // 1. 登录
    await page.goto('/zh-CN/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // 2. 进入积分购买页
    await page.goto('/zh-CN/settings/credits');
    await expect(page.getByText('购买积分')).toBeVisible();

    // 3. 选择套餐
    const package100 = page.locator('[data-package="100"]');
    await package100.click();
    await expect(page.getByText('¥19.90')).toBeVisible();

    // 4. 点击购买
    await page.getByRole('button', { name: '立即购买' }).click();

    // 5. Stripe Checkout 页面
    // 注意：在测试环境需要模拟 Stripe
    await page.waitForURL(/.*stripe\.com.*/);
    
    // 6. 使用 Stripe 测试卡号
    await page.fill('[name="cardNumber"]', '4242424242424242');
    await page.fill('[name="cardExpiry"]', '12/34');
    await page.fill('[name="cardCvc"]', '123');
    await page.click('button[type="submit"]');

    // 7. 返回成功页面
    await page.waitForURL(/.*\/payment\/success.*/);
    await expect(page.getByText('支付成功')).toBeVisible();

    // 8. 验证积分到账
    await page.goto('/zh-CN/settings/credits');
    const balance = await page.locator('[data-testid="credit-balance"]').textContent();
    expect(Number.parseInt(balance)).toBeGreaterThanOrEqual(100);
  });

  test('余额不足应该触发购买提示', async ({ page }) => {
    // TODO: 实现
  });

  test('支付失败应该正确处理', async ({ page }) => {
    // TODO: 使用 Stripe 测试失败卡号
  });
});
```

---

## 📊 测试覆盖率检查

运行所有测试并查看覆盖率：
```bash
npm run test:coverage
```

查看 HTML 报告：
```bash
# 生成后会在 coverage/index.html
open coverage/index.html
```

---

## ✅ 每日测试检查清单

### 提交代码前
- [ ] 运行单元测试：`npm run test:unit`
- [ ] 运行安全测试：`npm run test:security`
- [ ] 检查覆盖率：覆盖率不应下降

### 部署前
- [ ] 运行所有E2E测试：`npm run test:e2e`
- [ ] 运行烟雾测试：`npx playwright test tests/e2e/smoke.spec.ts`
- [ ] 检查关键路径（登录、支付、八字分析）

### 每周
- [ ] 审查测试失败报告
- [ ] 更新测试数据
- [ ] 添加新功能的测试

---

## 🐛 调试测试

### 单元测试调试
```bash
# 交互式调试
npm run test:unit:watch

# 只运行特定测试
npm run test:unit -- tests/unit/credits/deduct-credits.test.ts
```

### E2E 测试调试
```bash
# 有头模式（可以看到浏览器）
npm run test:e2e:headed

# 调试模式（暂停在每一步）
npm run test:e2e:debug

# UI 模式（可视化界面）
npm run test:e2e:ui
```

---

## 💡 常见问题

### Q: 测试数据库怎么处理？
A: 使用独立的测试数据库，或者在每个测试后清理数据。

### Q: 如何模拟第三方服务（如 Stripe）？
A: 使用 Mock 或 Stripe 提供的测试环境。

### Q: 测试运行很慢怎么办？
A: 
- 使用 `test.only()` 只运行特定测试
- 并行运行测试
- 优化数据库查询

### Q: CI/CD 中测试失败？
A: 
- 检查环境变量
- 确保测试数据库可访问
- 增加超时时间

---

## 📞 需要帮助？

- 查看 [完整测试计划](./COMPREHENSIVE_TEST_PLAN_v1.md)
- 查看 [测试评估报告](./TEST_ASSESSMENT_REPORT.md)
- 联系团队技术负责人

---

**记住：测试不是负担，是保护伞！** 🛡️
