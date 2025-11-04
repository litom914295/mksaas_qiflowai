# QiFlow AI - 国际化 (i18n) 配置完成

## 🎉 配置状态：完成 ✅

您的 QiFlow AI 项目现在已经完全支持 6 种语言的国际化功能！

### 🆕 最新完善内容
- ✅ 统一了所有命名空间格式（避免重复）
- ✅ 添加了核心功能翻译（Common、Navigation、Analysis）
- ✅ 创建了完整的使用示例组件
- ✅ 清理了重复的 metadata 项

## 📚 支持的语言

| 语言 | 代码 | 应用名称 | 状态 |
|------|------|----------|------|
| 简体中文 | zh-CN | QiFlow AI | ✅ 已配置 |
| 繁體中文 | zh-TW | QiFlow AI | ✅ 已配置 |
| English | en | QiFlow AI | ✅ 已配置 |
| 日本語 | ja | QiFlow AI | ✅ 已配置 |
| 한국어 | ko | QiFlow AI | ✅ 已配置 |
| Bahasa Melayu | ms-MY | QiFlow AI | ✅ 已配置 |

## 🗂️ 文件结构

```
messages/
├── zh-CN.json    # 简体中文翻译
├── zh-TW.json    # 繁體中文翻译
├── en.json       # English translations
├── ja.json       # 日本語翻訳
├── ko.json       # 한국어 번역
└── ms-MY.json    # Bahasa Melayu terjemahan

src/
├── i18n/
│   ├── config.ts      # i18n 配置
│   ├── messages.ts    # 消息加载器
│   ├── navigation.ts  # 导航配置
│   ├── request.ts     # 请求处理
│   ├── routing.ts     # 路由配置
│   └── url.ts         # URL 处理
└── config/
    └── website.ts     # 网站配置（包含语言设置）
```

## 🔧 关键配置

### 1. 默认语言设置
- **默认语言**: `zh-CN` (简体中文)
- **备用语言**: `en` (English)

### 2. Metadata 翻译
每种语言都包含完整的 Metadata 翻译：
- `Metadata.name`: 应用名称
- `Metadata.title`: 完整标题
- `Metadata.description`: 应用描述

### 3. 路由配置
- 所有路由都包含语言前缀 (localePrefix: 'always')
- URL 格式: `/zh-CN/dashboard`, `/en/dashboard` 等

## 🌍 如何切换语言

### 在代码中使用翻译

```typescript
import { useTranslations } from 'next-intl';

const MyComponent = () => {
  const t = useTranslations();
  
  return (
    <h1>{t('Metadata.name')}</h1>
  );
};
```

### 在用户界面中切换

项目中已包含语言切换器组件：
- `src/components/layout/locale-selector.tsx`
- `src/components/layout/locale-switcher.tsx`

## 📱 测试语言切换

您可以通过以下方式测试语言切换：

1. **URL 访问**:
   - 中文: `http://localhost:3000/zh-CN`
   - English: `http://localhost:3000/en`
   - 日本語: `http://localhost:3000/ja`
   - 한국어: `http://localhost:3000/ko`
   - 繁體中文: `http://localhost:3000/zh-TW`
   - Bahasa Melayu: `http://localhost:3000/ms-MY`

2. **语言选择器**: 使用页面右上角的语言切换器

## 🎯 品牌名称一致性

应用在所有语言中都保持一致的品牌名称：
- **所有语言**: **QiFlow AI** (品牌名称保持一致)

📝 **原则**: 品牌名称不应该翻译，以保持：
- 品牌认知度和一致性
- 商标保护和法律一致性  
- 用户在不同地区的熟悉度

只有描述性内容才需要本地化（如 "- 智能风水分析平台")

## 🛠️ 维护指南

### 添加新的翻译键

1. 在 `messages/en.json` 中添加新键
2. 在所有其他语言文件中添加对应翻译
3. 重启开发服务器以更新类型

### 可用的翻译命名空间

- **Metadata**: 应用元信息（name, title, description）
- **Common**: 通用UI元素（loading, error, success, save, cancel等）
- **Navigation**: 导航菜单（home, dashboard, analysis, reports等）
- **Analysis**: 分析功能（bazi, fengshui, xuankong, startAnalysis等）

### 添加新语言

1. 在 `messages/` 目录中创建新的 JSON 文件
2. 更新 `src/config/website.ts` 中的 `locales` 配置
3. 更新 `src/i18n/routing.ts` 中的语言列表

### 验证配置

运行以下命令验证 i18n 配置：

```bash
# 检查所有语言文件是否存在
ls messages/

# 验证特定语言的应用名称
grep "name.*气流AI" messages/zh-CN.json

# 检查核心翻译命名空间
grep -E "(Common|Navigation|Analysis)" messages/zh-CN.json
```

### 查看使用示例

项目中包含了完整的 i18n 使用示例组件：

```bash
# 查看示例组件
cat src/components/examples/i18n-example.tsx
```

该组件演示了如何正确使用各种翻译命名空间。

## ✨ 特色功能

- ✅ **完整的 TypeScript 支持**: 所有翻译键都有类型检查
- ✅ **SSR 支持**: 服务器端渲染完整支持多语言
- ✅ **自动语言检测**: 基于浏览器语言自动选择
- ✅ **SEO 友好**: 每种语言都有独立的 URL
- ✅ **一致品牌名称**: 品牌名称 "QiFlow AI" 在所有语言中保持一致
- ✅ **回退机制**: 缺失翻译时自动使用英文
- ✅ **核心功能翻译**: 包含 Common、Navigation、Analysis 三大核心命名空间
- ✅ **使用示例**: 提供完整的组件使用示例 (`src/components/examples/i18n-example.tsx`)

## 🚀 生产部署注意事项

1. **环境变量**: 确保所有语言的翻译都已完整
2. **构建验证**: 部署前运行 `npm run build` 验证类型正确
3. **SEO 设置**: 每种语言都有独立的 meta 标签
4. **CDN 配置**: 如使用 CDN，确保支持多语言路径

---

**恭喜！** 🎉 您的 QiFlow AI 项目现在已经完全支持多语言国际化，用户可以在 6 种语言之间无缝切换，获得最佳的本地化体验！