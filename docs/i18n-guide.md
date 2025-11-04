# QiFlow AI 国际化开发规范

## 📋 目录

- [概述](#概述)
- [架构说明](#架构说明)
- [命名规范](#命名规范)
- [使用指南](#使用指南)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)
- [检查清单](#检查清单)

---

## 概述

QiFlow AI 使用 `next-intl` 作为国际化解决方案，支持以下语言：

- 🇨🇳 简体中文 (zh-CN) - 默认语言
- 🇹🇼 繁体中文 (zh-TW)
- 🇬🇧 英语 (en)
- 🇯🇵 日语 (ja)
- 🇰🇷 韩语 (ko)
- 🇲🇾 马来语 (ms)

### 核心原则

1. **禁止硬编码** - 所有用户可见文本必须通过翻译键访问
2. **语义化命名** - 翻译键应清晰表达其含义和用途
3. **分层组织** - 按功能模块组织翻译文件
4. **专业术语统一** - 八字、风水等专业术语使用统一翻译

---

## 架构说明

### 目录结构

```
src/
├── locales/
│   ├── zh-CN/
│   │   ├── common.json      # 通用翻译
│   │   └── chat.json        # 聊天相关翻译
│   ├── en/
│   │   ├── common.json
│   │   └── chat.json
│   └── [其他语言...]
├── app/
│   └── [locale]/            # 动态路由，支持多语言
└── i18n/
    └── request.ts           # next-intl 配置
```

### 命名空间组织

翻译文件按功能模块组织为命名空间：

```json
{
  "QiFlow": {
    "terms": {},              // 专业术语
    "interpretation": {},     // 解读相关
    "userProfile": {},        // 用户资料
    "aiChat": {}             // AI 聊天
  },
  "PricingPage": {},         // 定价页面
  "PricePlans": {},          // 价格方案
  "UnifiedForm": {},         // 统一表单
  "Report": {},              // 报告页面
  "Common": {}               // 通用文本
}
```

---

## 命名规范

### 翻译键命名

#### ✅ 良好示例

```typescript
// 语义清晰的命名
t('UnifiedForm.personalInfo.nameLabel')
t('Common.actions.submit')
t('Report.bazi.pillars')
t('QiFlow.terms.tiangan.items.jia')

// 分层合理
{
  "personalInfo": {
    "title": "...",
    "nameLabel": "...",
    "namePlaceholder": "..."
  }
}
```

#### ❌ 不良示例

```typescript
// 避免无意义的缩写
t('ui.txt1')  // ❌
t('form.n')   // ❌

// 避免过长的嵌套
t('very.long.nested.path.that.is.too.deep')  // ❌

// 避免混淆的命名
t('button')   // ❌ 哪个按钮？
```

### 文件命名规范

- 使用 **kebab-case**（短横线分隔）
- 文件名应简洁且具有描述性

```
✅ common.json
✅ chat.json
✅ admin-dashboard.json

❌ Common.json
❌ chatUI.json
❌ adminDashBoard.json
```

---

## 使用指南

### 1. 在服务端组件中使用

```typescript
import { useTranslations } from 'next-intl';

export default function Page() {
  const t = useTranslations('UnifiedForm');
  
  return (
    <div>
      <h1>{t('hero.title')}</h1>
      <p>{t('hero.subtitle')}</p>
    </div>
  );
}
```

### 2. 在客户端组件中使用

```typescript
'use client';

import { useTranslations } from 'next-intl';

export default function ClientComponent() {
  const t = useTranslations('Common');
  
  return (
    <button>{t('actions.submit')}</button>
  );
}
```

### 3. 带参数的翻译

```json
{
  "welcome": "欢迎, {name}!",
  "credits": "您当前有 {count} 个积分"
}
```

```typescript
t('welcome', { name: 'QiFlow' })
// 输出: "欢迎, QiFlow!"

t('credits', { count: 500 })
// 输出: "您当前有 500 个积分"
```

### 4. 复数形式处理

```json
{
  "items": {
    "zero": "没有项目",
    "one": "{count} 个项目",
    "other": "{count} 个项目"
  }
}
```

```typescript
t('items', { count: 0 })  // "没有项目"
t('items', { count: 1 })  // "1 个项目"
t('items', { count: 5 })  // "5 个项目"
```

### 5. 富文本和 HTML

```typescript
// 使用 t.rich 处理富文本
t.rich('terms', {
  link: (chunks) => <a href="/terms">{chunks}</a>,
  b: (chunks) => <strong>{chunks}</strong>
})
```

### 6. 动态命名空间

```typescript
// 根据条件选择命名空间
const namespace = isBazi ? 'Report.bazi' : 'Report.fengshui';
const t = useTranslations(namespace);
```

---

## 最佳实践

### 1. 翻译文件组织

#### ✅ 推荐

```json
{
  "UnifiedForm": {
    "personalInfo": {
      "title": "个人信息",
      "fields": {
        "name": "姓名",
        "gender": "性别",
        "birthDate": "出生日期"
      }
    },
    "houseInfo": {
      "title": "房屋信息",
      "fields": {
        "address": "地址",
        "direction": "朝向"
      }
    }
  }
}
```

#### ❌ 不推荐

```json
{
  "title1": "个人信息",
  "field1": "姓名",
  "field2": "性别",
  "title2": "房屋信息",
  "field3": "地址"
}
```

### 2. 专业术语使用

对于八字、风水等专业术语，统一使用 `QiFlow.terms` 命名空间：

```typescript
// ✅ 正确
const t = useTranslations('QiFlow.terms');
const tiangan = t('tiangan.items.jia');  // "甲"

// ❌ 错误 - 不要硬编码
const tiangan = '甲';
```

### 3. 错误消息处理

```typescript
// ✅ 使用统一的错误消息
const t = useTranslations('Common.errors');
toast.error(t('networkError'));

// ❌ 避免硬编码错误消息
toast.error('网络错误，请稍后重试');
```

### 4. 日期和数字格式化

```typescript
import { useFormatter } from 'next-intl';

function Component() {
  const format = useFormatter();
  
  // 格式化日期
  const date = format.dateTime(new Date(), {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // 格式化数字
  const number = format.number(1234.56, {
    style: 'currency',
    currency: 'CNY'
  });
  
  return <div>{date} - {number}</div>;
}
```

### 5. 条件渲染

```typescript
// ✅ 根据语言显示不同内容
const locale = useLocale();

if (locale === 'zh-CN') {
  return <ChineseSpecificComponent />;
}
return <DefaultComponent />;
```

---

## 常见问题

### Q1: 何时创建新的命名空间？

**A:** 当一个功能模块的翻译键超过 20 个，或者该模块有独立的语义边界时，应创建新的命名空间。

### Q2: 如何处理动态内容？

**A:** 使用参数化翻译：

```typescript
// 翻译文件
{
  "greeting": "您好，{name}！今天是{date}"
}

// 组件中
t('greeting', { 
  name: user.name, 
  date: format.dateTime(new Date()) 
})
```

### Q3: 专业术语如何翻译？

**A:** 所有八字、风水专业术语已在 `QiFlow.terms` 命名空间中定义，直接引用即可：

```typescript
const t = useTranslations('QiFlow.terms');

// 天干
t('tiangan.items.jia')  // 甲 / Jia
t('tiangan.items.yi')   // 乙 / Yi

// 地支
t('dizhi.items.zi')     // 子 / Zi
```

### Q4: 如何处理长段落文本？

**A:** 对于长段落，可以使用数组或对象：

```json
{
  "instructions": [
    "第一步：填写个人信息",
    "第二步：选择房屋朝向",
    "第三步：确认并提交"
  ]
}
```

```typescript
const instructions = t.raw('instructions');
instructions.map((step, i) => <li key={i}>{step}</li>)
```

### Q5: SEO 元数据如何国际化？

**A:** 在 page 或 layout 中导出 `generateMetadata`：

```typescript
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  
  return {
    title: t('title'),
    description: t('description')
  };
}
```

---

## 检查清单

### 提交代码前检查

- [ ] 所有用户可见文本都已使用翻译键
- [ ] 翻译键命名语义清晰
- [ ] 已为所有支持的语言添加翻译
- [ ] 使用了正确的命名空间
- [ ] 专业术语使用 `QiFlow.terms`
- [ ] 错误消息使用 `Common.errors`
- [ ] 通用操作使用 `Common.actions`
- [ ] 已测试所有语言的显示效果

### 添加新功能时

- [ ] 规划好命名空间结构
- [ ] 创建翻译键骨架（所有语言）
- [ ] 在 zh-CN 中填写中文翻译
- [ ] 在 en 中填写英文翻译
- [ ] 其他语言可先复制英文（标注 TODO）
- [ ] 更新本文档（如有新模式）

---

## 相关资源

- [next-intl 官方文档](https://next-intl-docs.vercel.app/)
- [项目翻译文件目录](../src/locales/)
- [CI 检查脚本](../scripts/check-i18n.js)

---

## 维护者

如有疑问或建议，请联系项目维护者。

**最后更新**: 2025-01-13