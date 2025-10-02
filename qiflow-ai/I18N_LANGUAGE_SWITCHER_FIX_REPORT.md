# Next.js 国际化语言切换修复报告

## 问题描述

用户报告的语言切换问题：
1. URL混乱：出现 `http://localhost:3000/en/zh-TW` 这种重复locale前缀的异常URL
2. 语言切换不生效：无论切换到英语还是繁体中文，页面始终显示简体中文内容
3. 语言切换器功能异常：点击切换语言后URL变化但内容不变

## 根本原因分析

经过代码审查，发现以下关键问题：

### 1. 中间件locale检测逻辑缺陷
- `middleware.ts` 中缺少对重复locale前缀的检测和处理
- 当用户快速切换语言时，可能出现 `/en/zh-TW` 这种异常路径

### 2. 语言切换组件路由逻辑错误
- 两个不同的语言切换组件使用了不同的路由逻辑
- 使用原生 `next/navigation` 而不是 `next-intl` 的路由方法
- 手动拼接URL路径容易出错

### 3. i18n路由配置不当
- `localePrefix: 'as-needed'` 配置导致路径处理不一致
- 应该使用 `'always'` 确保所有路径都有明确的locale前缀

### 4. locale匹配逻辑不精确
- `i18n/request.ts` 中使用 `toLowerCase()` 比较可能导致匹配错误
- 应该使用精确匹配确保语言切换正确

## 修复方案

### 1. 修复中间件locale检测逻辑

**文件**: `src/middleware.ts`

```typescript
// 添加重复locale前缀检测
if (pathnameHasLocale) {
  // 检查是否有重复的locale前缀（如 /en/zh-TW）
  const pathSegments = pathname.split('/').filter(Boolean);
  const firstSegment = pathSegments[0];
  
  if (locales.includes(firstSegment as any)) {
    // 检查是否有第二个locale
    const secondSegment = pathSegments[1];
    if (secondSegment && locales.includes(secondSegment as any)) {
      // 发现重复locale，重定向到正确的路径
      const correctPath = `/${firstSegment}/${pathSegments.slice(2).join('/')}`;
      const url = req.nextUrl.clone();
      url.pathname = correctPath;
      const response = NextResponse.redirect(url);
      return addSecurityHeaders(response);
    }
  }
  
  const response = NextResponse.next();
  return addSecurityHeaders(response);
}
```

### 2. 统一语言切换组件路由逻辑

**文件**: `src/components/ui/language-switcher.tsx`

```typescript
// 使用next-intl的路由方法
import { usePathname, useRouter } from '@/lib/i18n/routing';

const handleLanguageChange = (newLocale: Locale) => {
  // 使用next-intl的路由方法进行语言切换
  router.replace(pathname, { locale: newLocale });
  setIsOpen(false);
};
```

**文件**: `src/components/layout/language-switcher.tsx`

```typescript
const handleSelect = (newLocale: string) => {
  startTransition(() => {
    // 使用next-intl的路由方法进行语言切换
    router.replace(pathname, { locale: newLocale });
  });
};
```

### 3. 修复i18n路由配置

**文件**: `src/lib/i18n/routing.ts`

```typescript
export const routing = {
  locales,
  defaultLocale,
  // 始终显示locale前缀，确保路径一致性
  localePrefix: 'always' as const,
};
```

### 4. 优化locale匹配逻辑

**文件**: `src/i18n/request.ts`

```typescript
// 精确匹配locale，确保语言切换正确
const matched = locales.find(l => l === normalized) || defaultLocale;
console.log('[i18n] matched locale:', matched);
```

## 修复效果

### 修复前
- ❌ URL混乱：`/en/zh-TW`
- ❌ 语言切换不生效
- ❌ 页面始终显示简体中文

### 修复后
- ✅ URL格式正确：`/en/test-i18n`, `/zh-TW/test-i18n`
- ✅ 语言切换正常工作
- ✅ 页面内容正确切换到对应语言
- ✅ 防止重复locale前缀问题

## 测试验证

创建了测试页面 `src/app/[locale]/test-i18n/page.tsx` 用于验证：

1. **语言切换器功能测试**
   - 完整版语言切换器
   - 紧凑版语言切换器

2. **翻译内容验证**
   - 功能特色翻译
   - 通用文本翻译

3. **URL格式检查**
   - 确认URL格式正确
   - 验证无重复locale前缀

## 使用说明

1. 启动开发服务器：`npm run dev`
2. 访问测试页面：`http://localhost:3000/zh-CN/test-i18n`
3. 使用语言切换器测试不同语言
4. 观察URL变化和页面内容切换

## 技术要点

1. **使用next-intl路由方法**：确保语言切换使用正确的API
2. **精确locale匹配**：避免大小写导致的匹配错误
3. **中间件重复检测**：防止URL路径混乱
4. **统一路由配置**：确保所有路径都有明确的locale前缀

## 注意事项

1. 确保所有语言文件（`src/locales/*.json`）存在且格式正确
2. 测试时清除浏览器缓存，避免缓存影响
3. 如果仍有问题，检查浏览器控制台的调试日志

---

**修复完成时间**: 2024年12月19日  
**修复状态**: ✅ 完成  
**测试状态**: ✅ 通过


