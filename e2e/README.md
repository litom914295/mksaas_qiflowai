# E2E 测试指南

## 🚀 快速开始

### 方法一：使用已运行的开发服务器（最快）

如果你已经在另一个终端运行了 `npm run dev`：

```bash
# 设置环境变量，重用现有服务器
$env:E2E_BASE_URL="http://localhost:3000"

# 运行快速测试（推荐）
npx playwright test e2e/i18n-navigation-quick.spec.ts --headed

# 或运行所有测试
npx playwright test --headed
```

### 方法二：让 Playwright 自动启动服务器

```bash
# Playwright 会自动运行 dev 服务器
$env:E2E_DEV="1"
npx playwright test e2e/i18n-navigation-quick.spec.ts
```

### 方法三：使用 npm 脚本

```bash
# 快速 i18n 测试
npm run test:e2e:i18n

# 所有 E2E 测试（带 UI）
npm run test:e2e:ui

# 带浏览器窗口（方便调试）
npm run test:e2e:headed

# 调试模式
npm run test:e2e:debug
```

---

## 📂 测试文件说明

### `i18n-navigation-quick.spec.ts` ⚡
**快速版本** - 只测试核心功能，运行时间短

包含的测试：
- ✅ 基本路径重定向
- ✅ Locale 检测
- ✅ 页面内容验证
- ✅ 链接检查
- ✅ 404 处理

**运行时间：** ~1-2分钟

```bash
npx playwright test e2e/i18n-navigation-quick.spec.ts
```

### `i18n-navigation.spec.ts` 🔍
**完整版本** - 详细测试所有场景

包含的测试：
- ✅ 所有快速测试的内容
- ✅ 语言切换
- ✅ Cookie 持久化
- ✅ 移动端测试
- ✅ 浏览器前进后退
- ✅ 性能测试

**运行时间：** ~5-10分钟

```bash
npx playwright test e2e/i18n-navigation.spec.ts
```

---

## ⚡ 性能优化建议

### 1. 使用现有服务器（最快）

在一个终端：
```bash
npm run dev
```

在另一个终端：
```bash
$env:E2E_BASE_URL="http://localhost:3000"
npx playwright test e2e/i18n-navigation-quick.spec.ts
```

### 2. 只运行 Chromium（本地开发）

配置已经优化：本地只运行 Chromium，CI 运行所有浏览器。

### 3. 使用 headed 模式查看进度

```bash
npx playwright test --headed
```

### 4. 并行运行（谨慎使用）

```bash
# 使用多个 worker
npx playwright test --workers=2
```

---

## 🐛 调试技巧

### 1. 调试单个测试

```bash
npx playwright test --debug e2e/i18n-navigation-quick.spec.ts
```

### 2. 查看测试报告

```bash
npm run test:e2e:report
```

### 3. 查看失败截图

失败的测试会自动保存截图和视频到 `test-results/` 目录。

### 4. 使用 UI 模式（推荐）

```bash
npm run test:e2e:ui
```

UI 模式提供：
- 可视化测试执行
- 时间轴
- 网络请求
- 控制台日志
- 逐步调试

---

## ⚠️ 常见问题

### Q1: 测试超时

**问题：** `Test timeout of 30000ms exceeded`

**解决方案：**
1. 确保开发服务器正在运行
2. 使用快速测试版本
3. 增加 `test.setTimeout(60000)`

```typescript
test('my test', async ({ page }) => {
  test.setTimeout(60000); // 60秒
  // ...
});
```

### Q2: 无法连接到服务器

**问题：** `Error: connect ECONNREFUSED 127.0.0.1:3000`

**解决方案：**
1. 检查端口 3000 是否被占用
2. 手动启动开发服务器：`npm run dev`
3. 设置环境变量重用服务器：
   ```bash
   $env:E2E_BASE_URL="http://localhost:3000"
   ```

### Q3: 浏览器未安装

**问题：** `Executable doesn't exist at ...`

**解决方案：**
```bash
npm run playwright:install
```

### Q4: 测试在 CI 中失败

**解决方案：**
1. 确保 CI 中安装了浏览器：
   ```bash
   npx playwright install --with-deps
   ```
2. 设置正确的超时时间
3. 使用无头模式

---

## 📊 性能对比

| 测试版本 | 测试数量 | 运行时间 | 适用场景 |
|---------|---------|---------|---------|
| quick.spec.ts | 6个 | ~1-2分钟 | 快速验证、开发时 |
| 完整版本 | 22个 | ~5-10分钟 | CI/CD、发版前 |

---

## 🎯 推荐工作流

### 开发时

```bash
# 终端 1：运行开发服务器
npm run dev

# 终端 2：运行快速测试
$env:E2E_BASE_URL="http://localhost:3000"
npx playwright test e2e/i18n-navigation-quick.spec.ts --headed
```

### 提交前

```bash
# 运行完整测试套件
npm run test:e2e
```

### CI/CD

```bash
# 在 CI 环境中
npx playwright install --with-deps
npm run build
npm run test:e2e
```

---

## 📝 编写新测试

### 测试模板

```typescript
import { test, expect } from '@playwright/test';

test.describe('我的功能', () => {
  // 设置超时
  test.setTimeout(45000);

  test('应该做某事', async ({ page }) => {
    // 访问页面
    await page.goto('/zh-CN/my-page');
    
    // 等待加载
    await page.waitForLoadState('domcontentloaded');
    
    // 执行断言
    expect(await page.title()).toContain('预期标题');
  });
});
```

### 最佳实践

1. ✅ 使用有意义的测试描述
2. ✅ 添加适当的等待（waitForLoadState）
3. ✅ 使用数据属性选择器（data-testid）
4. ✅ 处理超时情况
5. ✅ 清理测试数据
6. ❌ 不要硬编码等待时间（sleep）
7. ❌ 不要依赖测试执行顺序

---

## 📚 相关文档

- [Playwright 官方文档](https://playwright.dev/)
- [测试脚本配置指南](../docs/test-scripts-setup.md)
- [优化完成总结](../docs/optimization-completed-summary.md)

---

**提示：** 如果测试经常超时，先尝试运行快速版本，然后逐步添加更多测试。
