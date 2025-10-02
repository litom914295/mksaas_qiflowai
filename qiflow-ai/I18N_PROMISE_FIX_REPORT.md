# Next.js 15 i18n Promise 处理修复报告

## 问题描述

在 Next.js 15 中，`next-intl` 的 `requestLocale` 参数可能是一个 Promise 对象，导致以下错误：

```
[i18n] requested locale: [object Promise]
[i18n] requestLocale: ReactPromise {status: 'pending', value: null, reason: null, ...}
```

## 修复内容

### 1. 修复 `src/i18n/request.ts`

**问题**: `requestLocale` 参数是 Promise 对象，需要 await 处理

**解决方案**: 添加 Promise 检测和异步处理逻辑

```typescript
// 处理 requestLocale 可能是 Promise 的情况
let resolvedRequestLocale = requestLocale;
if (requestLocale && typeof requestLocale === 'object' && 'then' in requestLocale) {
  try {
    resolvedRequestLocale = await requestLocale;
  } catch (error) {
    console.error('[i18n] Error resolving requestLocale:', error);
    resolvedRequestLocale = null;
  }
}
```

### 2. 创建简化测试页面

**文件**: `src/app/[locale]/simple-lang-test/page.tsx`
- 简化了 hooks 使用，避免复杂的依赖关系
- 添加了详细的控制台日志用于调试
- 使用原生 Next.js 路由进行语言切换

**文件**: `src/app/[locale]/minimal-test/page.tsx`
- 纯服务器端渲染页面
- 用于验证翻译是否正确加载
- 提供直接链接测试不同语言版本

## 测试步骤

1. **重启开发服务器**
   ```bash
   npm run dev
   ```

2. **访问测试页面**
   - 简化测试: `http://localhost:3000/zh-CN/simple-lang-test`
   - 最小化测试: `http://localhost:3000/zh-CN/minimal-test`

3. **验证语言切换**
   - 点击语言按钮
   - 观察 URL 变化
   - 检查控制台日志
   - 验证翻译内容更新

## 预期结果

- ✅ `[i18n] requested locale:` 显示正确的语言代码而不是 `[object Promise]`
- ✅ 语言切换按钮正常工作
- ✅ URL 正确更新
- ✅ 翻译内容正确显示
- ✅ 控制台错误减少

## 注意事项

1. **浏览器扩展干扰**: 某些浏览器扩展可能导致 CSP 错误，这些不影响核心功能
2. **React 错误 #321**: 通常与 hooks 依赖有关，简化组件可以避免此问题
3. **Promise 处理**: Next.js 15 中许多参数变为 Promise，需要正确 await

## 下一步

如果问题仍然存在，请：
1. 清除浏览器缓存
2. 检查控制台中的具体错误信息
3. 尝试访问最小化测试页面验证服务器端翻译
4. 提供详细的错误日志以便进一步调试


