# 环境变量配置指南

## 📋 概述

本文档说明如何配置项目所需的环境变量，以消除开发环境的警告和错误。

---

## 🔧 基本配置

### 1. 创建 `.env.local` 文件

在项目根目录创建 `.env.local` 文件（如果不存在）：

```bash
# Windows PowerShell
New-Item -Path .env.local -ItemType File -Force

# 或者手动创建
```

---

## ⚠️ 消除警告

### Better Auth 警告

**警告内容：**
```
WARN [Better Auth]: Social provider github is missing clientId or clientSecret
WARN [Better Auth]: Social provider google is missing clientId or clientSecret
```

**原因：** 项目配置了 GitHub 和 Google OAuth 登录，但未提供认证密钥。

**解决方案 1：临时开发（推荐）**

在 `.env.local` 中添加占位符（仅用于消除警告）：

```env
# Better Auth - OAuth Providers (开发环境占位符)
BETTER_AUTH_SECRET=your-development-secret-key-min-32-chars
GITHUB_CLIENT_ID=placeholder
GITHUB_CLIENT_SECRET=placeholder
GOOGLE_CLIENT_ID=placeholder
GOOGLE_CLIENT_SECRET=placeholder
```

**解决方案 2：完整配置（生产环境）**

如果需要实际使用 OAuth 登录：

1. **GitHub OAuth:**
   - 访问 https://github.com/settings/developers
   - 创建新的 OAuth App
   - 获取 Client ID 和 Client Secret

2. **Google OAuth:**
   - 访问 https://console.cloud.google.com/
   - 创建 OAuth 2.0 凭据
   - 获取 Client ID 和 Client Secret

然后在 `.env.local` 中添加真实密钥：

```env
# Better Auth - OAuth Providers
BETTER_AUTH_SECRET=<your-32-char-or-longer-secret>
GITHUB_CLIENT_ID=<your-github-client-id>
GITHUB_CLIENT_SECRET=<your-github-client-secret>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

---

## 🐛 启用中间件调试日志

如果需要查看详细的中间件日志（调试路由问题时）：

```env
# Middleware 调试模式（默认关闭）
MIDDLEWARE_DEBUG=true
```

**注意：** 启用后会显示所有中间件处理的详细日志，仅在需要调试时使用。

---

## 🌐 其他常用环境变量

### 网站基础 URL

```env
# 生产环境 URL（用于 SEO、sitemap 等）
NEXT_PUBLIC_SITE_URL=https://qiflow.ai
```

### 分析和监控

```env
# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# 性能监控端点（如果有自定义分析服务）
NEXT_PUBLIC_ANALYTICS_ENDPOINT=https://your-analytics-api.com/events
```

### 数据库

```env
# PostgreSQL 数据库连接
DATABASE_URL=postgresql://user:password@localhost:5432/database_name
```

### API 密钥

```env
# OpenAI API（用于 AI 功能）
OPENAI_API_KEY=sk-...
OPENAI_API_URL=https://api.openai.com/v1/chat/completions

# 其他 AI 服务
DEEPSEEK_API_KEY=...
```

---

## 📂 完整的 `.env.local` 模板

创建一个包含所有常用配置的模板：

```env
# ============================================
# QiFlow AI - 开发环境配置
# ============================================

# 网站基础信息
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Better Auth
BETTER_AUTH_SECRET=development-secret-key-at-least-32-characters-long
BETTER_AUTH_URL=http://localhost:3000

# OAuth Providers (开发环境占位符)
GITHUB_CLIENT_ID=placeholder
GITHUB_CLIENT_SECRET=placeholder
GOOGLE_CLIENT_ID=placeholder
GOOGLE_CLIENT_SECRET=placeholder

# 数据库
DATABASE_URL=postgresql://postgres:password@localhost:5432/qiflow_dev

# OpenAI API (可选)
# OPENAI_API_KEY=sk-...
# OPENAI_API_URL=https://api.openai.com/v1/chat/completions

# 调试选项
# MIDDLEWARE_DEBUG=true

# 分析和监控 (可选)
# NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
# NEXT_PUBLIC_ANALYTICS_ENDPOINT=

# E2E 测试配置
# E2E_BASE_URL=http://localhost:3000
# E2E_DEV=1
```

---

## 🔒 安全注意事项

### ⚠️ 重要提醒

1. **永远不要提交 `.env.local` 到 Git**
   - 确保 `.env.local` 在 `.gitignore` 中
   - 项目已配置忽略此文件

2. **生产环境密钥**
   - 使用强随机密钥
   - 定期轮换密钥
   - 使用环境变量管理服务（如 Vercel、AWS Secrets Manager）

3. **团队协作**
   - 创建 `.env.example` 文件（不包含真实密钥）
   - 团队成员复制并填充自己的密钥

---

## 📝 `.env.example` 示例

创建一个 `.env.example` 文件供团队参考（可以提交到 Git）：

```env
# 复制此文件为 .env.local 并填充真实值

# Better Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000

# OAuth Providers
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Database
DATABASE_URL=

# APIs (optional)
OPENAI_API_KEY=
```

---

## 🚀 快速开始

```bash
# 1. 复制模板
Copy-Item .env.example .env.local

# 2. 编辑 .env.local，填充必需的值
# 至少需要 BETTER_AUTH_SECRET

# 3. 重启开发服务器
npm run dev
```

---

## 🔍 验证配置

启动开发服务器后，检查控制台：

### ✅ 正确配置
```
✓ Starting...
✓ Ready in 10.6s
```

### ❌ 配置错误
```
WARN [Better Auth]: Social provider github is missing clientId or clientSecret
```
→ 需要添加 OAuth 配置（或使用占位符）

---

## 📚 相关文档

- [Better Auth 文档](https://www.better-auth.com/docs)
- [Next.js 环境变量](https://nextjs.org/docs/basic-features/environment-variables)
- [OAuth 配置指南](https://docs.github.com/en/developers/apps/building-oauth-apps)

---

**最后更新：** 2024年  
**维护者：** QiFlow AI 开发团队
