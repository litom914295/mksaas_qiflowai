# QiFlow AI - 国际化 (i18n) 实施指南

**由 AI-WORKFLOW v5.0 自动生成**  
**版本：v5.1.1**  
**最后更新：2025-01-23**

---

## 📋 概述

本指南介绍如何在 QiFlow AI 项目中实现完整、严格的多语言支持（6种语言），确保：

- ✅ **零语言混合** - 每个用户只看到选定语言
- ✅ **100% 翻译覆盖** - 所有 UI 文本完全翻译
- ✅ **语言隔离路由** - URL 包含语言前缀
- ✅ **流畅切换体验** - 平滑的语言切换动画
- ✅ **用户偏好记忆** - 自动保存和恢复语言选择

---

## 🌍 支持的语言

| 语言代码 | 语言名称 | 本地化名称 |
|---------|---------|-----------|
| `zh-CN` | Simplified Chinese | 简体中文 |
| `zh-TW` | Traditional Chinese | 繁體中文 |
| `en` | English | English |
| `ja` | Japanese | 日本語 |
| `ko` | Korean | 한국어 |
| `ms-MY` | Malay | Bahasa Melayu |

默认语言：**zh-CN** (简体中文)

---

## 📁 项目结构

```
src/
├── locales/                    # 翻译文件目录
│   ├── zh-CN/
│   │   ├── common.json        # 通用翻译
│   │   ├── auth.json          # 认证相关
│   │   ├── dashboard.json     # 仪表板
│   │   ├── errors.json        # 错误信息
│   │   └── chat.json          # 聊天界面
│   ├── zh-TW/
│   ├── en/
│   ├── ja/
│   ├── ko/
│   └── ms-MY/
├── lib/i18n/
│   ├── config.ts              # 语言配置
│   └── translations.ts        # 翻译加载工具
├── components/
│   ├── language-switcher/     # 语言切换器
│   └── providers/
│       └── translation-provider.tsx
├── middleware/
│   └── locale-isolation.ts    # 语言隔离中间件
├── hooks/
│   └── use-language-switcher.ts
└── styles/
    └── language-switcher.css
```

---

## 🚀 快速开始

### 1. 在根布局中集成

```typescript
// app/[locale]/layout.tsx
import { TranslationProvider } from '@/components/providers/translation-provider';
import { loadTranslations } from '@/lib/i18n/translations';
import { Locale } from '@/lib/i18n/config';
import { LanguageSwitcher } from '@/components/language-switcher';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  // 服务端加载翻译
  const translations = await loadTranslations(params.locale, ['common', 'auth']);

  return (
    <html lang={params.locale}>
      <body>
        <TranslationProvider locale={params.locale} translations={translations}>
          {/* 全局导航栏中添加语言切换器 */}
          <nav>
            <LanguageSwitcher />
          </nav>
          
          {children}
        </TranslationProvider>
      </body>
    </html>
  );
}
```

### 2. 在客户端组件中使用翻译

```typescript
'use client';

import { useTranslation } from '@/components/providers/translation-provider';

export function WelcomeMessage() {
  const { t, locale } = useTranslation();

  return (
    <div>
      <h1>{t('common.welcome.title')}</h1>
      <p>{t('common.welcome.description', '欢迎使用 QiFlow AI')}</p>
      <span>当前语言: {locale}</span>
    </div>
  );
}
```

### 3. 在服务端组件中使用翻译

```typescript
import { loadTranslations, createTranslator } from '@/lib/i18n/translations';
import { Locale } from '@/lib/i18n/config';

export default async function HomePage({ params }: { params: { locale: Locale } }) {
  const translations = await loadTranslations(params.locale);
  const t = createTranslator(translations);

  return (
    <div>
      <h1>{t('common.home.title')}</h1>
      <p>{t('common.home.subtitle')}</p>
    </div>
  );
}
```

---

## 🔧 核心组件说明

### 1. 语言隔离中间件

**文件：`src/middleware/locale-isolation.ts`**

**功能：**
- 自动检测和重定向无语言前缀的请求
- 优先级：Cookie > Accept-Language Header > 默认语言
- 跳过 API、静态资源等公共路径

**集成：**

```typescript
// middleware.ts
import { localeIsolationMiddleware } from '@/middleware/locale-isolation';

export function middleware(request: NextRequest) {
  return localeIsolationMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### 2. 语言切换器 Hook

**文件：`src/hooks/use-language-switcher.ts`**

**功能：**
- 获取当前语言
- 切换语言（带动画）
- 保存用户偏好到 localStorage
- 自动刷新页面以应用新语言

**使用示例：**

```typescript
const { currentLocale, switchLanguage, isChanging, availableLocales } = useLanguageSwitcher();

// 切换到英语
await switchLanguage('en');
```

### 3. 翻译加载工具

**文件：`src/lib/i18n/translations.ts`**

**功能：**
- 按需加载翻译文件
- 内置缓存机制
- 支持嵌套翻译键（如 `common.welcome.title`）
- 类型安全

**API：**

```typescript
// 加载翻译
const translations = await loadTranslations('zh-CN', ['common', 'auth']);

// 获取翻译值
const value = getTranslation(translations, 'common.welcome.title', '默认值');

// 创建翻译函数
const t = createTranslator(translations);
const title = t('common.welcome.title');
```

---

## 📝 翻译文件管理

### 文件命名规范

- **文件名：** `{namespace}.json`（如 `common.json`, `auth.json`）
- **路径：** `src/locales/{locale}/{namespace}.json`

### 翻译键命名规范

使用点分隔的嵌套结构：

```json
{
  "common": {
    "welcome": {
      "title": "欢迎使用 QiFlow AI",
      "description": "智能八字风水分析平台"
    },
    "actions": {
      "submit": "提交",
      "cancel": "取消"
    }
  }
}
```

### 自动化审计和修复

**审计脚本：**

```bash
node scripts/i18n-audit-fix.js
```

**自动修复缺失翻译：**

```bash
node scripts/i18n-audit-fix.js --fix
```

**查看审计报告：**

```bash
cat qiflowai/dashboards/i18n-audit-report.json
```

---

## 🎨 样式和动画

### 语言切换动画

**文件：`src/styles/language-switcher.css`**

在全局样式中引入：

```typescript
// app/[locale]/layout.tsx
import '@/styles/language-switcher.css';
```

**动画特性：**
- 淡入淡出效果（300ms）
- 防止布局抖动
- 支持无障碍（`prefers-reduced-motion`）
- 高对比度模式优化

---

## ✅ 最佳实践

### 1. 始终使用翻译键，避免硬编码

❌ **错误：**
```typescript
<button>提交</button>
```

✅ **正确：**
```typescript
<button>{t('common.actions.submit')}</button>
```

### 2. 为翻译键提供后备值

```typescript
t('common.unknown.key', '默认文本')
```

### 3. 按功能模块拆分翻译文件

- `common.json` - 通用文本（按钮、标签等）
- `auth.json` - 认证相关（登录、注册）
- `dashboard.json` - 仪表板专用
- `errors.json` - 错误信息
- `chat.json` - 聊天界面

### 4. 服务端组件优先加载翻译

服务端组件应在服务端加载翻译，减少客户端 JavaScript 负担：

```typescript
// 服务端组件
export default async function Page({ params }: { params: { locale: Locale } }) {
  const translations = await loadTranslations(params.locale);
  const t = createTranslator(translations);
  
  return <div>{t('common.title')}</div>;
}
```

### 5. 确保所有语言覆盖率 100%

定期运行审计脚本，确保所有语言文件完整：

```bash
npm run i18n:audit
```

---

## 🔍 故障排查

### 问题 1: 翻译键返回键名而非翻译值

**可能原因：**
- 翻译文件缺失或未加载
- 翻译键路径错误

**解决方法：**
1. 检查 `src/locales/{locale}/{namespace}.json` 是否存在
2. 验证翻译键路径（如 `common.welcome.title`）
3. 运行审计脚本检查覆盖率

### 问题 2: 语言切换后内容未更新

**可能原因：**
- 缓存问题
- 路由未正确更新

**解决方法：**
1. 清除浏览器缓存
2. 确认 `router.refresh()` 在 `switchLanguage` 中被调用
3. 检查中间件是否正确配置

### 问题 3: 语言混合（部分内容显示错误语言）

**可能原因：**
- 某些组件使用了硬编码文本
- 翻译未正确传递到子组件

**解决方法：**
1. 搜索项目中的硬编码文本
2. 确保所有组件都在 `TranslationProvider` 内
3. 使用 `grep` 搜索非翻译键的文本

---

## 📊 性能优化

### 1. 翻译缓存

翻译文件在首次加载后会被缓存，避免重复加载：

```typescript
// 自动缓存
const translations = await loadTranslations('zh-CN');
```

### 2. 按需加载

只加载当前页面需要的翻译文件：

```typescript
// 只加载通用和认证翻译
const translations = await loadTranslations('zh-CN', ['common', 'auth']);
```

### 3. 服务端渲染

优先在服务端加载翻译，减少客户端 Bundle 大小：

```typescript
// 服务端组件
export default async function Page({ params }: { params: { locale: Locale } }) {
  const translations = await loadTranslations(params.locale);
  // ...
}
```

---

## 🚢 部署检查清单

- [ ] 所有语言翻译文件完整（运行 `npm run i18n:audit`）
- [ ] 中间件配置正确（`middleware.ts`）
- [ ] 语言切换器集成到导航栏
- [ ] 所有硬编码文本替换为翻译键
- [ ] 测试每种语言的切换流程
- [ ] 验证 SEO 元标签是否本地化
- [ ] 确认错误页面也已国际化

---

## 📚 相关资源

- **翻译审计脚本：** `scripts/i18n-audit-fix.js`
- **审计报告：** `qiflowai/dashboards/i18n-audit-report.json`
- **PRD 文档：** `@PRD_i18n_optimization_v5.1.1.md`
- **技术指南：** `@TECH_GUIDE_i18n_optimization_v5.1.1.md`

---

## 🤝 贡献

如需添加新语言或翻译，请：

1. 在 `src/locales/` 创建新语言目录
2. 复制 `zh-CN/` 的所有翻译文件
3. 更新 `src/config/website.ts` 添加新语言配置
4. 更新 `src/lib/i18n/config.ts` 添加 `localeNames` 映射
5. 运行审计脚本验证完整性

---

**© 2025 QiFlow AI - AI-WORKFLOW v5.0 自动生成**
