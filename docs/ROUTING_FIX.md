# 🔧 路由修复说明

## 问题描述

项目使用了 Next.js 的国际化路由（i18n），所有页面都需要包含 locale 前缀（如 `/zh-CN/` 或 `/en/`）。

之前创建的页面位于 `app/(routes)/unified-form/page.tsx`，没有包含 `[locale]` 动态段，导致访问 `/unified-form` 时返回404错误。

## 已执行的修复

### 1. 目录结构调整

**修改前**:
```
app/
└── (routes)/
    └── unified-form/
        └── page.tsx
```

**修改后**:
```
app/
└── [locale]/
    ├── layout.tsx                    # 全局布局（新增）
    ├── page.tsx                      # 首页（新增）
    └── (routes)/
        └── unified-form/
            └── page.tsx              # 移动到此处
```

### 2. 新增文件

#### `app/[locale]/layout.tsx`
- 国际化路由的根布局
- 支持 zh-CN 和 en 两种语言
- 集成 NextIntlClientProvider

#### `app/[locale]/page.tsx`
- 项目首页
- 提供导航到主要功能的入口
- 包含平台特色介绍

#### `src/config/website.ts`
- 网站配置文件
- 定义支持的语言和默认语言

### 3. 路由说明

现在所有路由都必须包含 locale 前缀：

| 路径 | 访问URL | 说明 |
|------|---------|------|
| `/` | `http://localhost:3000/` | 自动重定向到 `/zh-CN` |
| `/[locale]` | `http://localhost:3000/zh-CN` | 首页 |
| `/[locale]/unified-form` | `http://localhost:3000/zh-CN/unified-form` | 一页式表单 |

### 4. Middleware 工作原理

项目的 `src/middleware.ts` 会自动处理 locale 重定向：

1. 用户访问 `/unified-form`
2. Middleware 检测到缺少 locale 前缀
3. 根据以下优先级确定 locale：
   - Cookie (`NEXT_LOCALE`)
   - `Accept-Language` header
   - 默认值 (`zh-CN`)
4. 重定向到 `/zh-CN/unified-form`

## 测试步骤

1. **启动开发服务器**:
   ```bash
   npm run dev
   ```

2. **访问首页**:
   ```
   http://localhost:3000/
   ```
   应该自动重定向到 `http://localhost:3000/zh-CN`

3. **访问表单页面**:
   ```
   http://localhost:3000/zh-CN/unified-form
   ```
   应该正常显示一页式表单

4. **访问无前缀路径**:
   ```
   http://localhost:3000/unified-form
   ```
   应该自动重定向到 `http://localhost:3000/zh-CN/unified-form`

## 常见问题

### Q: 为什么访问 `/unified-form` 会重定向？

A: 项目使用国际化路由，所有页面都需要 locale 前缀。Middleware 会自动为无前缀的路径添加 locale。

### Q: 如何添加新的语言？

A: 需要修改以下文件：
1. `src/config/website.ts` - 添加新的 locale 配置
2. `messages/[locale].json` - 创建翻译文件
3. `app/[locale]/layout.tsx` - 更新 LOCALES 数组

### Q: 如何禁用国际化？

A: 不建议禁用，因为项目已深度集成 next-intl。如果确实需要：
1. 移除 `src/middleware.ts` 中的 locale 处理逻辑
2. 将 `app/[locale]/*` 移动到 `app/*`
3. 移除 next-intl 相关依赖

## 相关文件

- `src/middleware.ts` - 路由中间件
- `src/i18n/routing.ts` - i18n 路由配置
- `src/config/website.ts` - 网站配置
- `messages/*.json` - 翻译文件

## 更新日志

- **2024-01-XX**: 修复国际化路由404问题
- **2024-01-XX**: 创建首页和全局布局
- **2024-01-XX**: 移动 unified-form 到正确的目录结构

---

**文档版本**: v1.0  
**最后更新**: 2024-01-XX  
**作者**: 气流AI开发团队
