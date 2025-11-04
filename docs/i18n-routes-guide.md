# 国际化路由使用指南

## 概述

本项目使用 `next-intl` 实现国际化路由，所有路由都需要带上 locale 前缀（如 `/zh-CN/dashboard`）。为了确保路由的一致性和类型安全，我们创建了 `@/lib/i18n-routes` 工具库。

## 核心问题

`@/routes.ts` 中定义的 `Routes` 枚举都是不带 locale 前缀的原始路径：

```typescript
export enum Routes {
  AIChat = '/ai/chat',
  Dashboard = '/dashboard',
  QiflowBazi = '/analysis/bazi',
  // ...
}
```

但在实际的文件结构中，所有页面都位于 `app/[locale]/` 下，需要带上 locale 前缀才能正确访问。

## 解决方案

使用 `@/lib/i18n-routes` 提供的工具函数，自动为 Routes 枚举值添加正确的 locale 前缀。

---

## 使用场景

### 1. 客户端组件 - 使用 `LocaleLink`

**推荐做法：**对于所有内部链接，使用 `LocaleLink` 代替 `next/link` 的 `Link`：

```tsx
'use client'
import { LocaleLink } from '@/i18n/navigation';
import { Routes } from '@/routes';

function MyComponent() {
  return (
    <LocaleLink href="/ai/chat">
      AI Chat
    </LocaleLink>
  );
}
```

`LocaleLink` 会自动根据当前 locale 添加前缀，无需手动处理。

**不推荐：**直接使用 Routes 枚举值作为字符串

```tsx
// ❌ 错误做法
<a href={Routes.AIChat}>AI Chat</a>  // 会跳转到 /ai/chat（缺少 locale）
```

---

### 2. 客户端组件 - 使用 `useLocaleRoute`

如果需要在客户端组件中获取带 locale 的完整 URL（例如用于 JavaScript 导航或动态 URL 构建）：

```tsx
'use client'
import { useLocaleRoute } from '@/lib/i18n-routes';
import { Routes } from '@/routes';

function MyComponent() {
  const chatUrl = useLocaleRoute(Routes.AIChat);
  // chatUrl = '/zh-CN/ai/chat'（自动检测当前 locale）
  
  const handleClick = () => {
    window.location.href = chatUrl;
  };
  
  return <button onClick={handleClick}>Go to Chat</button>;
}
```

---

### 3. 服务端组件 - 使用 `getLocalizedRoute`

在服务端组件或服务端函数中，使用 `getLocalizedRoute` 并显式传入 locale：

```tsx
import { getLocalizedRoute } from '@/lib/i18n-routes';
import { Routes } from '@/routes';

export default function ServerComponent({ 
  params 
}: { 
  params: { locale: string } 
}) {
  const chatUrl = getLocalizedRoute(Routes.AIChat, params.locale);
  // chatUrl = '/zh-CN/ai/chat'
  
  return (
    <div>
      <a href={chatUrl}>AI Chat</a>
    </div>
  );
}
```

**注意：**`getLocalizedRoute` 需要显式传入 locale 参数，不会自动检测。

---

### 4. API Routes - 使用 `getLocalizedRouteFromRequest`

在 API 路由中，使用 `getLocalizedRouteFromRequest` 根据请求头自动检测 locale：

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getLocalizedRouteFromRequest } from '@/lib/i18n-routes';
import { Routes } from '@/routes';

export async function POST(request: NextRequest) {
  // 自动从 cookie 或 Accept-Language header 检测 locale
  const chatUrl = getLocalizedRouteFromRequest(Routes.AIChat, request);
  
  return NextResponse.json({
    redirectUrl: chatUrl, // '/zh-CN/ai/chat' 或 '/en/ai/chat'
  });
}
```

**检测优先级：**

1. Cookie 中的 `NEXT_LOCALE`
2. `Accept-Language` header（支持 `zh` → `zh-CN` 的智能匹配）
3. 默认 locale (`zh-CN`)

---

### 5. Server Actions - 使用 `getLocalizedRoute`

在 Server Actions 中，可以从表单数据或其他来源获取 locale：

```typescript
'use server'
import { redirect } from 'next/navigation';
import { getLocalizedRoute } from '@/lib/i18n-routes';
import { Routes } from '@/routes';

export async function submitForm(formData: FormData) {
  const locale = formData.get('locale') as string || 'zh-CN';
  
  // 处理表单...
  
  redirect(getLocalizedRoute(Routes.Dashboard, locale));
}
```

---

### 6. 使用 `createLocalizedRoutes` (高级)

如果需要批量生成某个 locale 下的所有路由：

```typescript
import { createLocalizedRoutes } from '@/lib/i18n-routes';

const zhRoutes = createLocalizedRoutes('zh-CN');
console.log(zhRoutes.AIChat);      // '/zh-CN/ai/chat'
console.log(zhRoutes.Dashboard);    // '/zh-CN/dashboard'

const enRoutes = createLocalizedRoutes('en');
console.log(enRoutes.AIChat);      // '/en/ai/chat'
```

---

## 常见场景示例

### 场景 1: 导航菜单

```tsx
'use client'
import { LocaleLink } from '@/i18n/navigation';
import { Routes } from '@/routes';

const navItems = [
  { label: 'Dashboard', href: Routes.Dashboard },
  { label: 'AI Chat', href: Routes.AIChat },
  { label: 'BaZi Analysis', href: Routes.QiflowBazi },
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

### 场景 2: 条件跳转

```tsx
'use client'
import { useLocaleRouter } from '@/i18n/navigation';
import { useLocaleRoute } from '@/lib/i18n-routes';
import { Routes } from '@/routes';

export function AuthButton({ isLoggedIn }: { isLoggedIn: boolean }) {
  const router = useLocaleRouter();
  const loginUrl = useLocaleRoute(Routes.Login);
  const dashboardUrl = useLocaleRoute(Routes.Dashboard);
  
  const handleClick = () => {
    router.push(isLoggedIn ? dashboardUrl : loginUrl);
  };
  
  return <button onClick={handleClick}>进入系统</button>;
}
```

### 场景 3: 动态重定向 (API)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getLocalizedRouteFromRequest } from '@/lib/i18n-routes';
import { Routes } from '@/routes';

export async function GET(request: NextRequest) {
  const isAuthenticated = await checkAuth(request);
  
  if (!isAuthenticated) {
    const loginUrl = getLocalizedRouteFromRequest(Routes.Login, request);
    return NextResponse.redirect(new URL(loginUrl, request.url));
  }
  
  const dashboardUrl = getLocalizedRouteFromRequest(Routes.Dashboard, request);
  return NextResponse.redirect(new URL(dashboardUrl, request.url));
}
```

---

## 特殊情况处理

### 外部链接

外部链接会被自动识别并原样返回：

```typescript
import { getLocalizedRoute } from '@/lib/i18n-routes';
import { Routes } from '@/routes';

const url = getLocalizedRoute(Routes.Roadmap); 
// 返回: 'https://qiflowai.link/roadmap'（保持不变）
```

### 锚点链接

锚点链接也会被保持不变：

```typescript
const url = getLocalizedRoute(Routes.FAQ); 
// Routes.FAQ = '/#faq'
// 返回: '/#faq'（保持不变）
```

### 已经带有 locale 的路径

如果路径已经包含 locale 前缀，不会重复添加：

```typescript
const url = getLocalizedRoute('/zh-CN/dashboard' as Routes);
// 返回: '/zh-CN/dashboard'（不会变成 /zh-CN/zh-CN/dashboard）
```

---

## 迁移指南

### 从 `next/link` 迁移

**之前：**
```tsx
import Link from 'next/link';
<Link href="/ai/chat">AI Chat</Link>
```

**之后：**
```tsx
import { LocaleLink } from '@/i18n/navigation';
<LocaleLink href="/ai/chat">AI Chat</LocaleLink>
```

### 从硬编码路径迁移

**之前：**
```tsx
<a href="/analysis/bazi">八字分析</a>
```

**之后：**
```tsx
import { LocaleLink } from '@/i18n/navigation';
import { Routes } from '@/routes';

<LocaleLink href={Routes.QiflowBazi}>八字分析</LocaleLink>
```

### 从动态路径迁移

**之前：**
```tsx
const url = `/analysis/${type}`;
window.location.href = url;
```

**之后：**
```tsx
import { useLocaleRoute } from '@/lib/i18n-routes';
import { Routes } from '@/routes';

const routes = {
  bazi: Routes.QiflowBazi,
  xuankong: Routes.QiflowXuankong,
};

const url = useLocaleRoute(routes[type]);
window.location.href = url;
```

---

## 检查清单

在代码审查时，检查以下几点：

- [ ] 所有内部链接使用 `LocaleLink` 而不是 `<a>` 或 `Link`
- [ ] 客户端导航使用 `useLocaleRoute()` 或 `useLocaleRouter()`
- [ ] API 路由中的 URL 生成使用 `getLocalizedRouteFromRequest()`
- [ ] 服务端组件使用 `getLocalizedRoute()` 并传入正确的 locale
- [ ] 没有硬编码的路径字符串（如 `'/ai/chat'`），而是使用 `Routes` 枚举
- [ ] 重定向页面 (`app/*/page.tsx`) 正确使用国际化路由

---

## 常见错误

### ❌ 错误 1: 直接使用 Routes 枚举作为 href

```tsx
<a href={Routes.AIChat}>Chat</a>  // 会跳转到 /ai/chat（缺少 locale）
```

**✅ 正确做法:**
```tsx
<LocaleLink href={Routes.AIChat}>Chat</LocaleLink>
```

---

### ❌ 错误 2: 在客户端使用 getLocalizedRoute 但不传 locale

```tsx
'use client'
const url = getLocalizedRoute(Routes.AIChat); // locale 是 undefined
```

**✅ 正确做法:**
```tsx
'use client'
const url = useLocaleRoute(Routes.AIChat); // 自动检测当前 locale
```

---

### ❌ 错误 3: 在 API 路由中硬编码 locale

```typescript
export async function POST(request: Request) {
  const url = '/zh-CN/ai/chat'; // 硬编码，不考虑用户偏好
  return Response.json({ url });
}
```

**✅ 正确做法:**
```typescript
export async function POST(request: Request) {
  const url = getLocalizedRouteFromRequest(Routes.AIChat, request);
  return Response.json({ url });
}
```

---

## 总结

| 场景 | 推荐工具 | 示例 |
|------|---------|------|
| 客户端链接 | `LocaleLink` | `<LocaleLink href="/ai/chat">` |
| 客户端 URL 生成 | `useLocaleRoute()` | `const url = useLocaleRoute(Routes.AIChat)` |
| 服务端组件 | `getLocalizedRoute(route, locale)` | `getLocalizedRoute(Routes.AIChat, 'zh-CN')` |
| API 路由 | `getLocalizedRouteFromRequest(route, request)` | `getLocalizedRouteFromRequest(Routes.AIChat, req)` |
| Server Actions | `getLocalizedRoute(route, locale)` | 从 formData 或 cookies 获取 locale |
| 批量生成 | `createLocalizedRoutes(locale)` | `const routes = createLocalizedRoutes('en')` |

遵循这些最佳实践，可以确保整个应用的路由都正确支持国际化，避免因缺少 locale 前缀导致的 404 错误。
