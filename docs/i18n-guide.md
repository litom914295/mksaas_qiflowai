# i18n 国际化使用指南

本文档介绍 mksaas 项目的国际化（i18n）实现与最佳实践。

## 概述

mksaas 项目支持 **6 种语言**：
- 🇺🇸 **en** - English（英语，默认）
- 🇨🇳 **zh-CN** - 简体中文
- 🇹🇼 **zh-TW** - 繁体中文
- 🇯🇵 **ja** - 日本語（日语）
- 🇰🇷 **ko** - 한국어（韩语）
- 🇲🇾 **ms-MY** - Bahasa Melayu（马来语）

### 技术栈
- **next-intl**: RSC 友好的 Next.js 国际化库
- **Intl APIs**: 浏览器原生的格式化 API（货币、日期、数字等）
- **URL 策略**: 路径前缀模式（`localePrefix: 'as-needed'`），默认语言不显示前缀

### 目录结构
```
mksaas/
├── messages/                     # 翻译资源目录
│   ├── en.json                   # 英文（基准）
│   ├── zh-CN.json                # 简体中文
│   ├── zh-TW.json                # 繁体中文
│   ├── ja.json                   # 日语
│   ├── ko.json                   # 韩语
│   └── ms-MY.json                # 马来语
├── src/
│   ├── components/
│   │   └── language-switcher.tsx # 语言切换组件
│   ├── config/
│   │   └── website.tsx           # i18n 配置（locales 定义）
│   ├── i18n/
│   │   ├── routing.ts            # next-intl routing 配置
│   │   ├── request.ts            # 服务端翻译配置
│   │   ├── navigation.ts         # 客户端导航封装
│   │   └── messages.ts           # 消息加载与 fallback
│   └── lib/
│       └── i18n/
│           ├── meta.ts           # 语言元数据与 RTL 支持
│           └── format.ts         # 本地化格式化工具
└── scripts/
    └── validate-i18n.ts          # 翻译资源校验脚本
```

---

## 快速开始

### 1. 在组件中使用翻译

#### 客户端组件（'use client'）
```tsx
'use client';

import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('Common');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      <button>{t('save')}</button>
    </div>
  );
}
```

#### 服务端组件（RSC）
```tsx
import { getTranslations } from 'next-intl/server';

export default async function MyPage() {
  const t = await getTranslations('Common');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

### 2. 使用格式化工具

```tsx
import { useLocale } from 'next-intl';
import { fmtCurrency, fmtDate, fmtPercent } from '@/lib/i18n/format';
import type { LocaleCode } from '@/lib/i18n/meta';

export function PriceDisplay({ price }: { price: number }) {
  const locale = useLocale() as LocaleCode;

  return (
    <div>
      <p>价格: {fmtCurrency(price, locale)}</p>
      <p>日期: {fmtDate(new Date(), locale)}</p>
      <p>折扣: {fmtPercent(0.2, locale)}</p>
    </div>
  );
}
```

### 3. 使用语言切换组件

语言切换组件已集成到顶部导航栏（`src/components/layout/navbar.tsx`），无需额外配置。用户点击右上角的语言按钮即可切换 6 种语言。

如需在其他位置使用：
```tsx
import { LanguageSwitcher } from '@/components/language-switcher';

export function MyLayout() {
  return (
    <div>
      {/* 其他内容 */}
      <LanguageSwitcher />
    </div>
  );
}
```

---

## 翻译资源管理

### 翻译文件结构

翻译文件采用嵌套 JSON 格式，支持模块化组织：

```json
{
  "Common": {
    "login": "Log in",
    "logout": "Log out",
    "save": "Save",
    "cancel": "Cancel"
  },
  "PricingPage": {
    "title": "Pricing",
    "monthly": "Monthly",
    "yearly": "Yearly"
  },
  "Bazi": {
    "title": "Bazi Analysis",
    "tabs": {
      "overview": "Overview",
      "fourPillars": "Four Pillars",
      "insights": "Insights"
    }
  }
}
```

### 添加新翻译 key

1. **在基准语言文件（`messages/en.json`）中添加 key**：
   ```json
   {
     "MyModule": {
       "newFeature": {
         "title": "New Feature",
         "description": "This is a brand new feature"
       }
     }
   }
   ```

2. **在所有其他语言文件中添加对应翻译**：
   - `messages/zh-CN.json`: `"title": "新功能"`
   - `messages/ja.json`: `"title": "新機能"`
   - ...（其他 4 种语言）

3. **运行校验脚本确认完整性**：
   ```bash
   npm run validate:i18n
   ```

### 缺失 key 的 Fallback 行为

next-intl 会自动回退到默认语言（en）的翻译，并在开发环境中显示警告。生产环境建议启用缺失 key 监控。

---

## 格式化最佳实践

### 货币格式化

```tsx
import { fmtCurrency } from '@/lib/i18n/format';

// 使用默认货币（根据 locale 自动选择）
fmtCurrency(9.99, 'en');      // "$9.99"
fmtCurrency(9.99, 'zh-CN');   // "¥9.99"
fmtCurrency(9.99, 'ja');      // "¥10"（日元无小数）
fmtCurrency(9.99, 'ko');      // "₩10"（韩元无小数）

// 指定货币
fmtCurrency(9.99, 'en', 'EUR');  // "€9.99"
```

### 日期与时间格式化

```tsx
import { fmtDate, fmtDateTime, fmtRelativeTime } from '@/lib/i18n/format';

const date = new Date('2024-01-15');

fmtDate(date, 'en');      // "Jan 15, 2024"
fmtDate(date, 'zh-CN');   // "2024年1月15日"
fmtDate(date, 'ja');      // "2024年1月15日"

fmtDateTime(date, 'en');  // "Jan 15, 2024, 12:00 PM"

const yesterday = new Date(Date.now() - 86400000);
fmtRelativeTime(yesterday, new Date(), 'en');     // "yesterday"
fmtRelativeTime(yesterday, new Date(), 'zh-CN'); // "昨天"
```

### 数字与百分比

```tsx
import { fmtNumber, fmtPercent } from '@/lib/i18n/format';

fmtNumber(1234.56, 'en');      // "1,234.56"
fmtNumber(1234.56, 'zh-CN');   // "1,234.56"

fmtPercent(0.5, 'en');         // "50%"
fmtPercent(0.1234, 'zh-CN', { maximumFractionDigits: 2 }); // "12.34%"
```

---

## 新增语言支持

### 步骤 1：更新配置

在 `src/config/website.tsx` 中添加新语言：

```tsx
i18n: {
  defaultLocale: 'en',
  locales: {
    // ... 现有语言
    'ar': {
      flag: '🇸🇦',
      name: 'العربية',
    },
  },
}
```

### 步骤 2：更新元数据

在 `src/lib/i18n/meta.ts` 中添加：

```tsx
export type LocaleCode = 'en' | 'zh-CN' | 'zh-TW' | 'ja' | 'ko' | 'ms-MY' | 'ar';

export const locales: readonly LocaleMeta[] = [
  // ... 现有语言
  {
    code: 'ar',
    label: 'Arabic',
    flag: '🇸🇦',
    dir: 'rtl',  // 注意 RTL 语言需设置为 'rtl'
    nativeName: 'العربية',
  },
];
```

### 步骤 3：创建翻译文件

复制 `messages/en.json` 为 `messages/ar.json` 并翻译所有词条。

### 步骤 4：验证

```bash
npm run validate:i18n
```

---

## 开发与测试

### 运行翻译校验

```bash
npm run validate:i18n
```

校验脚本会：
- 检查所有 6 种语言文件是否存在
- 比对 key 结构与基准语言（en）是否一致
- 报告缺失或多余的 key

### 本地测试语言切换

1. 启动开发服务器：
   ```bash
   npm run dev
   ```

2. 访问不同语言的 URL：
   - 英文（默认）: `http://localhost:3000/`
   - 简体中文: `http://localhost:3000/zh-CN/`
   - 日语: `http://localhost:3000/ja/`
   - 韩语: `http://localhost:3000/ko/`
   - 马来语: `http://localhost:3000/ms-MY/`
   - 繁体中文: `http://localhost:3000/zh-TW/`

3. 或使用右上角语言切换按钮

### 调试翻译问题

开发环境中，next-intl 会在控制台输出缺失 key 警告：
```
[next-intl] Missing message: "Bazi.newFeature.title" for locale "ja"
```

---

## 常见问题 (FAQ)

### Q: 如何处理复数与占位符？

next-intl 支持 ICU MessageFormat：

```json
{
  "items": {
    "count": "{count, plural, =0 {No items} one {# item} other {# items}}"
  }
}
```

使用：
```tsx
const t = useTranslations('items');
t('count', { count: 0 });  // "No items"
t('count', { count: 1 });  // "1 item"
t('count', { count: 5 });  // "5 items"
```

### Q: 如何在翻译中嵌入链接或加粗文本？

使用富文本：

```json
{
  "terms": "By signing up, you agree to our <link>Terms of Service</link>"
}
```

```tsx
const t = useTranslations('Auth');

t.rich('terms', {
  link: (chunks) => <Link href="/terms">{chunks}</Link>
});
```

### Q: 如何避免文本溢出？

为长文本组件添加 Tailwind 类：

```tsx
<div className="break-words hyphens-auto min-w-0 max-w-full">
  {t('longText')}
</div>

<h2 className="text-base md:text-lg font-medium leading-tight line-clamp-2">
  {t('card.title')}
</h2>
```

### Q: RTL 语言支持吗？

框架已预留 RTL 支持（`src/lib/i18n/meta.ts` 中的 `isRtl` 函数），但当前 6 种语言均为 LTR。未来添加阿拉伯语/希伯来语等 RTL 语言时，需在根布局中设置 `dir` 属性：

```tsx
export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const dir = isRtl(locale) ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir}>
      <body>{children}</body>
    </html>
  );
}
```

---

## 性能优化

### 翻译资源缓存

next-intl 自动缓存翻译资源，RSC 下预取当前语言包，无需手动配置。

### 代码分割

使用动态导入懒加载非首屏模块：

```tsx
const HeavyComponent = dynamic(() => import('./heavy-component'), {
  loading: () => <Skeleton />,
});
```

### LCP 与 CLS 优化

- 确保翻译在 SSR 阶段完成，避免客户端闪烁
- 为动态文本预留空间，避免布局抖动（CLS）
- 使用 `line-clamp` 限制多行文本高度

---

## 参考资源

- [next-intl 官方文档](https://next-intl.dev/)
- [Intl APIs (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)
- [ICU MessageFormat](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

## 变更日志

- **v1.0.0** (2025-03): 初始版本，支持 6 种语言（zh-CN, en, ja, ko, ms-MY, zh-TW）
