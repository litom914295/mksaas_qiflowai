# 国际化路由快速参考

> 🚀 快速查询表，用于在不同场景下正确使用国际化路由

---

## 📋 快速决策树

```
需要在哪里使用路由？
│
├─ 客户端组件
│  │
│  ├─ 需要链接？ → 使用 LocaleLink
│  │   import { LocaleLink } from '@/i18n/navigation'
│  │   <LocaleLink href="/ai/chat">Chat</LocaleLink>
│  │
│  └─ 需要 URL 字符串？ → 使用 useLocaleRoute
│      import { useLocaleRoute } from '@/lib/i18n-routes'
│      const url = useLocaleRoute(Routes.AIChat)
│
├─ 服务端组件
│  │
│  └─ 使用 getLocalizedRoute + params.locale
│      import { getLocalizedRoute } from '@/lib/i18n-routes'
│      const url = getLocalizedRoute(Routes.AIChat, params.locale)
│
├─ API 路由
│  │
│  └─ 使用 getLocalizedRouteFromRequest
│      import { getLocalizedRouteFromRequest } from '@/lib/i18n-routes'
│      const url = getLocalizedRouteFromRequest(Routes.AIChat, request)
│
└─ Server Actions
   │
   └─ 使用 getLocalizedRoute + 传入 locale
       import { getLocalizedRoute } from '@/lib/i18n-routes'
       redirect(getLocalizedRoute(Routes.Dashboard, locale))
```

---

## 🔧 常用代码片段

### 客户端链接

```tsx
import { LocaleLink } from '@/i18n/navigation';

<LocaleLink href="/ai/chat">AI Chat</LocaleLink>
```

### 客户端导航

```tsx
import { useLocaleRouter } from '@/i18n/navigation';
import { useLocaleRoute } from '@/lib/i18n-routes';
import { Routes } from '@/routes';

const router = useLocaleRouter();
const chatUrl = useLocaleRoute(Routes.AIChat);

router.push(chatUrl);
// 或
window.location.href = chatUrl;
```

### 服务端组件

```tsx
import { getLocalizedRoute } from '@/lib/i18n-routes';
import { Routes } from '@/routes';

export default function Page({ params }: { params: { locale: string } }) {
  const url = getLocalizedRoute(Routes.AIChat, params.locale);
  return <a href={url}>Chat</a>;
}
```

### API 路由

```typescript
import { getLocalizedRouteFromRequest } from '@/lib/i18n-routes';
import { Routes } from '@/routes';

export async function POST(request: Request) {
  const url = getLocalizedRouteFromRequest(Routes.AIChat, request);
  return Response.json({ url });
}
```

### Server Actions

```typescript
'use server'
import { redirect } from 'next/navigation';
import { getLocalizedRoute } from '@/lib/i18n-routes';
import { Routes } from '@/routes';

export async function submitForm(locale: string) {
  // ... 处理逻辑
  redirect(getLocalizedRoute(Routes.Dashboard, locale));
}
```

---

## 📦 Import 备忘录

```typescript
// 国际化链接组件
import { LocaleLink } from '@/i18n/navigation';

// 国际化导航 hooks
import { 
  useLocaleRouter, 
  useLocalePathname 
} from '@/i18n/navigation';

// 国际化路由工具
import { 
  getLocalizedRoute,           // 基础函数
  useLocaleRoute,              // 客户端 hook
  getLocalizedRouteFromRequest, // API 路由
  createLocalizedRoutes        // 批量生成
} from '@/lib/i18n-routes';

// 路由枚举
import { Routes } from '@/routes';
```

---

## ⚡ 常见模式

### 模式 1: 条件跳转

```tsx
'use client'
import { useLocaleRouter } from '@/i18n/navigation';
import { useLocaleRoute } from '@/lib/i18n-routes';
import { Routes } from '@/routes';

function ConditionalNav({ condition }: { condition: boolean }) {
  const router = useLocaleRouter();
  const urlA = useLocaleRoute(Routes.AIChat);
  const urlB = useLocaleRoute(Routes.Dashboard);
  
  const handleClick = () => {
    router.push(condition ? urlA : urlB);
  };
  
  return <button onClick={handleClick}>Navigate</button>;
}
```

### 模式 2: 动态导航菜单

```tsx
'use client'
import { LocaleLink } from '@/i18n/navigation';
import { Routes } from '@/routes';

const navItems = [
  { label: 'Dashboard', href: Routes.Dashboard },
  { label: 'AI Chat', href: Routes.AIChat },
  { label: 'BaZi', href: Routes.QiflowBazi },
];

export function Nav() {
  return (
    <nav>
      {navItems.map((item) => (
        <LocaleLink key={item.href} href={item.href}>
          {item.label}
        </LocaleLink>
      ))}
    </nav>
  );
}
```

### 模式 3: API 重定向

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getLocalizedRouteFromRequest } from '@/lib/i18n-routes';
import { Routes } from '@/routes';

export async function GET(request: NextRequest) {
  const needAuth = await checkAuth(request);
  
  if (!needAuth) {
    const loginUrl = getLocalizedRouteFromRequest(Routes.Login, request);
    return NextResponse.redirect(new URL(loginUrl, request.url));
  }
  
  // ... 继续处理
}
```

### 模式 4: 批量生成路由

```typescript
import { createLocalizedRoutes } from '@/lib/i18n-routes';

// 生成所有中文路由
const zhRoutes = createLocalizedRoutes('zh-CN');
console.log(zhRoutes.AIChat);      // '/zh-CN/ai/chat'
console.log(zhRoutes.Dashboard);    // '/zh-CN/dashboard'

// 生成所有英文路由
const enRoutes = createLocalizedRoutes('en');
console.log(enRoutes.AIChat);      // '/en/ai/chat'
```

---

## 🚫 常见错误和修复

### ❌ 错误 1: 直接使用 Routes 枚举

```tsx
// ❌ 错误
<a href={Routes.AIChat}>Chat</a>  // 跳转到 /ai/chat（缺少 locale）

// ✅ 正确
<LocaleLink href={Routes.AIChat}>Chat</LocaleLink>
```

### ❌ 错误 2: 在客户端用错函数

```tsx
// ❌ 错误（locale 是 undefined）
'use client'
const url = getLocalizedRoute(Routes.AIChat);

// ✅ 正确
'use client'
const url = useLocaleRoute(Routes.AIChat);
```

### ❌ 错误 3: 硬编码 locale

```typescript
// ❌ 错误（不考虑用户偏好）
const url = '/zh-CN/ai/chat';

// ✅ 正确
const url = getLocalizedRouteFromRequest(Routes.AIChat, request);
```

### ❌ 错误 4: 忘记传入 locale 参数

```tsx
// ❌ 错误
export default function Page({ params }: any) {
  const url = getLocalizedRoute(Routes.AIChat); // locale 丢失
  return <a href={url}>Chat</a>;
}

// ✅ 正确
export default function Page({ params }: { params: { locale: string } }) {
  const url = getLocalizedRoute(Routes.AIChat, params.locale);
  return <a href={url}>Chat</a>;
}
```

---

## 🎯 Routes 枚举速查

```typescript
// 主要路由
Routes.Root           = '/'
Routes.Dashboard      = '/dashboard'

// AI 功能
Routes.AIChat         = '/ai/chat'
Routes.AIText         = '/ai/text'
Routes.AIImage        = '/ai/image'

// QiFlow 分析
Routes.QiflowBazi     = '/analysis/bazi'
Routes.QiflowXuankong = '/analysis/xuankong'

// 营销页面
Routes.Blog           = '/blog'
Routes.Docs           = '/docs'
Routes.About          = '/about'

// 认证
Routes.Login          = '/auth/login'
Routes.Register       = '/auth/register'

// 设置
Routes.SettingsProfile = '/settings/profile'
Routes.SettingsBilling = '/settings/billing'
```

---

## 🔍 调试技巧

### 检查当前 locale

```tsx
'use client'
import { useLocalePathname } from '@/i18n/navigation';

function DebugLocale() {
  const pathname = useLocalePathname();
  console.log('当前路径:', pathname);
  
  // 从 pathname 提取 locale
  const locale = pathname.split('/')[1];
  console.log('当前 locale:', locale);
  
  return null;
}
```

### 测试路由生成

```typescript
import { getLocalizedRoute } from '@/lib/i18n-routes';
import { Routes } from '@/routes';

// 测试各种场景
console.log('zh-CN:', getLocalizedRoute(Routes.AIChat, 'zh-CN'));
// 输出: /zh-CN/ai/chat

console.log('en:', getLocalizedRoute(Routes.AIChat, 'en'));
// 输出: /en/ai/chat

console.log('外部链接:', getLocalizedRoute(Routes.Roadmap));
// 输出: https://qiflowai.link/roadmap （保持不变）
```

### 检查 Request 中的 locale

```typescript
// 在 API 路由中
export async function POST(request: Request) {
  // 检查 cookie
  const cookie = request.headers.get('cookie');
  console.log('Cookie:', cookie);
  
  // 检查 Accept-Language
  const acceptLanguage = request.headers.get('accept-language');
  console.log('Accept-Language:', acceptLanguage);
  
  // 使用工具函数
  const url = getLocalizedRouteFromRequest(Routes.AIChat, request);
  console.log('生成的 URL:', url);
  
  return Response.json({ url });
}
```

---

## 📖 相关文档

- [完整使用指南](./i18n-routes-guide.md)
- [实施总结](./i18n-routes-implementation-summary.md)
- [Next.js 国际化](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [next-intl 文档](https://next-intl-docs.vercel.app/)

---

## 💡 小贴士

1. **始终使用 Routes 枚举**，避免硬编码路径字符串
2. **客户端用 LocaleLink**，最简单也最安全
3. **API 路由用 getLocalizedRouteFromRequest**，自动检测 locale
4. **服务端组件记得传入 params.locale**
5. **外部链接和锚点会自动识别**，无需特殊处理

---

**快速上手建议：**

1. 复制对应场景的代码片段
2. 替换路由值为你需要的 Routes 枚举
3. 确保 import 正确
4. 测试跳转是否包含正确的 locale 前缀

**有问题？** 查看 [完整使用指南](./i18n-routes-guide.md) 获取详细说明。
