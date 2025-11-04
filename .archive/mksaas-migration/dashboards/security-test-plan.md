# 认证与安全功能测试计划

## 🧪 测试环境准备

### 环境要求
- Node.js 18+
- PostgreSQL (Supabase)
- Redis (用于速率限制测试)
- Playwright (E2E测试)

### 测试账号
```javascript
// test/fixtures/users.js
export const testUsers = {
  normal: {
    email: 'user@test.com',
    password: 'Test123!@#',
    role: 'user'
  },
  admin: {
    email: 'admin@test.com', 
    password: 'Admin123!@#',
    role: 'admin'
  },
  unverified: {
    email: 'unverified@test.com',
    password: 'Unverified123!@#',
    emailVerified: false
  }
};
```

## 📋 功能测试用例

### 1. 认证功能测试

#### 1.1 注册流程
```typescript
// tests/e2e/auth/register.spec.ts
import { test, expect } from '@playwright/test';

test.describe('用户注册', () => {
  test('成功注册新用户', async ({ page }) => {
    await page.goto('/auth/register');
    
    // 填写表单
    await page.fill('[name="email"]', 'newuser@test.com');
    await page.fill('[name="password"]', 'NewUser123!@#');
    await page.fill('[name="confirmPassword"]', 'NewUser123!@#');
    
    // 完成 Captcha（如果启用）
    await page.frameLocator('[title="Turnstile"]').locator('input').click();
    
    // 提交
    await page.click('[type="submit"]');
    
    // 验证跳转到验证邮箱页面
    await expect(page).toHaveURL('/auth/verify-email');
    await expect(page.locator('text=/已发送验证邮件/')).toBeVisible();
  });

  test('拒绝重复邮箱注册', async ({ page }) => {
    await page.goto('/auth/register');
    
    await page.fill('[name="email"]', 'user@test.com');
    await page.fill('[name="password"]', 'Test123!@#');
    await page.click('[type="submit"]');
    
    await expect(page.locator('text=/邮箱已被注册/')).toBeVisible();
  });

  test('密码强度验证', async ({ page }) => {
    await page.goto('/auth/register');
    
    // 弱密码
    await page.fill('[name="password"]', '123');
    await page.click('[type="submit"]');
    
    await expect(page.locator('text=/密码至少8位/')).toBeVisible();
  });
});
```

#### 1.2 登录流程
```typescript
// tests/e2e/auth/login.spec.ts
test.describe('用户登录', () => {
  test('正常登录', async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.fill('[name="email"]', 'user@test.com');
    await page.fill('[name="password"]', 'Test123!@#');
    await page.click('[type="submit"]');
    
    // 验证跳转到仪表盘
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-avatar"]')).toBeVisible();
  });

  test('错误密码处理', async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.fill('[name="email"]', 'user@test.com');
    await page.fill('[name="password"]', 'WrongPassword');
    await page.click('[type="submit"]');
    
    await expect(page.locator('text=/密码错误/')).toBeVisible();
  });

  test('未验证邮箱限制', async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.fill('[name="email"]', 'unverified@test.com');
    await page.fill('[name="password"]', 'Unverified123!@#');
    await page.click('[type="submit"]');
    
    // 登录成功但访问受限页面时重定向
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/auth/verify-email');
  });
});
```

#### 1.3 密码重置
```typescript
// tests/e2e/auth/reset-password.spec.ts
test.describe('密码重置', () => {
  test('发送重置邮件', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    
    await page.fill('[name="email"]', 'user@test.com');
    await page.click('[type="submit"]');
    
    await expect(page.locator('text=/重置链接已发送/')).toBeVisible();
  });

  test('使用重置链接', async ({ page }) => {
    // 模拟点击邮件中的链接
    const resetToken = 'mock-reset-token';
    await page.goto(`/auth/reset-password?token=${resetToken}`);
    
    await page.fill('[name="password"]', 'NewPassword123!@#');
    await page.fill('[name="confirmPassword"]', 'NewPassword123!@#');
    await page.click('[type="submit"]');
    
    await expect(page).toHaveURL('/auth/login');
    await expect(page.locator('text=/密码已重置/')).toBeVisible();
  });

  test('Token 只能使用一次', async ({ page }) => {
    const resetToken = 'used-reset-token';
    
    // 第二次使用相同token
    await page.goto(`/auth/reset-password?token=${resetToken}`);
    await page.fill('[name="password"]', 'AnotherPassword123!@#');
    await page.click('[type="submit"]');
    
    await expect(page.locator('text=/链接已失效/')).toBeVisible();
  });
});
```

### 2. 安全特性测试

#### 2.1 速率限制
```typescript
// tests/e2e/security/rate-limit.spec.ts
test('登录接口速率限制', async ({ request }) => {
  const endpoint = '/api/auth/sign-in';
  
  // 连续发送6次请求（限制为5次/分钟）
  for (let i = 0; i < 6; i++) {
    const response = await request.post(endpoint, {
      data: {
        email: 'test@test.com',
        password: 'wrong'
      }
    });
    
    if (i < 5) {
      expect(response.status()).not.toBe(429);
    } else {
      // 第6次应该被限制
      expect(response.status()).toBe(429);
      const body = await response.text();
      expect(body).toContain('Too many requests');
    }
  }
});
```

#### 2.2 CSRF 保护
```typescript
// tests/e2e/security/csrf.spec.ts
test('CSRF token 验证', async ({ request }) => {
  // 不带 CSRF token 的请求
  const response = await request.post('/api/auth/sign-out', {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  expect(response.status()).toBe(403);
});
```

#### 2.3 权限控制
```typescript
// tests/e2e/security/rbac.spec.ts
test.describe('RBAC权限', () => {
  test('普通用户无法访问管理接口', async ({ page }) => {
    // 以普通用户登录
    await loginAs(page, testUsers.normal);
    
    // 尝试访问管理页面
    await page.goto('/admin/users');
    
    // 应该被重定向或显示403
    await expect(page).toHaveURL('/403');
  });

  test('管理员可以访问管理接口', async ({ page }) => {
    // 以管理员登录
    await loginAs(page, testUsers.admin);
    
    await page.goto('/admin/users');
    
    await expect(page).toHaveURL('/admin/users');
    await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
  });
});
```

### 3. 安全头验证

#### 3.1 响应头检查
```bash
#!/bin/bash
# tests/scripts/check-security-headers.sh

URL="http://localhost:3000"

echo "检查安全响应头..."

# 发送请求并检查头
HEADERS=$(curl -s -I $URL)

# 检查必需的安全头
check_header() {
  if echo "$HEADERS" | grep -qi "$1"; then
    echo "✅ $1: 存在"
  else
    echo "❌ $1: 缺失"
    exit 1
  fi
}

check_header "Strict-Transport-Security"
check_header "X-Frame-Options"
check_header "X-Content-Type-Options"
check_header "Content-Security-Policy"
check_header "Referrer-Policy"

echo "所有安全头检查通过！"
```

### 4. UI一致性测试

#### 4.1 页眉页脚检查
```typescript
// tests/e2e/ui/layout.spec.ts
const pagesToTest = [
  '/',
  '/features',
  '/pricing',
  '/ai-chat',
  '/performance',
  '/reports',
  '/tools'
];

test.describe('UI布局一致性', () => {
  for (const path of pagesToTest) {
    test(`${path} 页面包含必要元素`, async ({ page }) => {
      await page.goto(path);
      
      // 检查页眉元素
      await expect(page.locator('[data-testid="site-header"]')).toBeVisible();
      await expect(page.locator('[data-testid="login-button"], [data-testid="user-menu"]')).toBeVisible();
      await expect(page.locator('[data-testid="language-switcher"]')).toBeVisible();
      await expect(page.locator('[data-testid="theme-switcher"]')).toBeVisible();
      
      // 检查页脚（部分页面可能没有）
      if (path !== '/dashboard' && path !== '/admin') {
        await expect(page.locator('[data-testid="site-footer"]')).toBeVisible();
      }
    });
  }
});
```

## 🚀 自动化测试脚本

### package.json 测试命令
```json
{
  "scripts": {
    "test": "npm run test:unit && npm run test:e2e",
    "test:unit": "jest",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:security": "npm run test:security:headers && npm run test:security:scan",
    "test:security:headers": "./tests/scripts/check-security-headers.sh",
    "test:security:scan": "npm audit && snyk test"
  }
}
```

### CI/CD 集成
```yaml
# .github/workflows/security-tests.yml
name: Security Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run unit tests
      run: npm run test:unit
    
    - name: Start application
      run: |
        npm run build
        npm run start &
        npx wait-on http://localhost:3000
    
    - name: Run E2E tests
      run: npm run test:e2e
    
    - name: Check security headers
      run: npm run test:security:headers
    
    - name: Security scan
      run: npm run test:security:scan
```

## 📊 测试覆盖率目标

| 测试类型 | 目标覆盖率 | 当前状态 |
|---------|-----------|---------|
| 单元测试 | 80% | 待实施 |
| E2E测试 | 核心流程100% | 待实施 |
| 安全测试 | 100% | 待实施 |
| UI测试 | 所有页面 | 待实施 |

## ✅ 验收标准

- [ ] 所有认证流程正常工作
- [ ] 速率限制有效防止暴力破解
- [ ] 权限控制正确实施
- [ ] 安全头全部配置
- [ ] UI元素在所有页面一致
- [ ] 无已知安全漏洞
- [ ] 测试覆盖率达标

## 🔧 调试工具

### 1. 查看当前用户会话
```javascript
// 浏览器控制台
fetch('/api/auth/session')
  .then(r => r.json())
  .then(console.log);
```

### 2. 模拟不同用户角色
```javascript
// tests/helpers/auth.js
export async function loginAs(page, user) {
  await page.goto('/auth/login');
  await page.fill('[name="email"]', user.email);
  await page.fill('[name="password"]', user.password);
  await page.click('[type="submit"]');
  await page.waitForURL('/dashboard');
}
```

### 3. 清理测试数据
```sql
-- tests/cleanup.sql
DELETE FROM users WHERE email LIKE '%@test.com';
DELETE FROM sessions WHERE user_id NOT IN (SELECT id FROM users);
```

---

*测试计划版本：1.0*  
*最后更新：2024-12-26*