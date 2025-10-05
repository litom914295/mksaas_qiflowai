# 环境变量配置指南 🔐

## 📋 概述

这个项目需要一些环境变量才能完全运行所有功能。本指南将帮助你配置这些变量。

---

## ✅ 已配置（核心功能）

这些环境变量已经配置好，**认证功能可以正常使用**：

| 变量 | 状态 | 用途 |
|------|------|------|
| `NEXT_PUBLIC_BASE_URL` | ✅ 已配置 | 应用基础 URL |
| `DATABASE_URL` | ✅ 已配置 | PostgreSQL 数据库连接 |
| `BETTER_AUTH_SECRET` | ✅ 已配置 | 认证加密密钥 |

---

## ⚠️ 可选配置（扩展功能）

这些环境变量是**可选的**，不影响核心认证功能：

### 1. 邮件服务 (Resend)

**用途**: 发送邮件（新闻订阅、邮箱验证、密码重置等）  
**状态**: ⚠️ 未配置（功能会被禁用）

#### 如何配置：

1. 访问 [Resend](https://resend.com/) 并注册账号
2. 创建 API 密钥
3. 在 `.env` 文件中添加：
   ```env
   RESEND_API_KEY="re_xxxxxxxxxxxxx"
   ```

**如果不配置会怎样？**
- ❌ 新闻订阅功能不可用
- ❌ 邮箱验证邮件无法发送
- ❌ 密码重置邮件无法发送
- ✅ **注册和登录仍然正常**（只是不会发验证邮件）

---

### 2. 社交登录 (GitHub & Google)

**用途**: 允许用户使用 GitHub 或 Google 账号登录  
**状态**: ⚠️ 未配置（社交登录按钮不可用）

#### GitHub OAuth 配置：

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 创建新的 OAuth App
3. 设置回调 URL：`http://localhost:3000/api/auth/callback/github`
4. 在 `.env` 添加：
   ```env
   GITHUB_CLIENT_ID="your_github_client_id"
   GITHUB_CLIENT_SECRET="your_github_client_secret"
   ```

#### Google OAuth 配置：

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建 OAuth 2.0 凭据
3. 设置回调 URL：`http://localhost:3000/api/auth/callback/google`
4. 在 `.env` 添加：
   ```env
   GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your_google_client_secret"
   ```

---

### 3. Cloudflare Turnstile (验证码)

**用途**: 防止机器人注册  
**状态**: ⚠️ 未配置（验证码不会显示）

#### 如何配置：

1. 访问 [Cloudflare Turnstile](https://dash.cloudflare.com/turnstile)
2. 创建站点密钥
3. 在 `.env` 添加：
   ```env
   NEXT_PUBLIC_TURNSTILE_SITE_KEY="0x4AAAAAAAxxx"
   TURNSTILE_SECRET_KEY="0x4AAAAAAAxxx"
   ```

---

## 🔧 当前 .env 文件结构

```env
# ===== 核心配置 (已配置) =====
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="..."

# ===== 可选配置 (未配置) =====

# 邮件服务
RESEND_API_KEY=""

# 社交登录
# GITHUB_CLIENT_ID=""
# GITHUB_CLIENT_SECRET=""
# GOOGLE_CLIENT_ID=""
# GOOGLE_CLIENT_SECRET=""

# 验证码
# NEXT_PUBLIC_TURNSTILE_SITE_KEY=""
# TURNSTILE_SECRET_KEY=""
```

---

## 🚀 快速开始建议

### 最小化配置（开发测试）

如果你只是想测试核心功能，**当前配置已足够**：
- ✅ 用户可以注册
- ✅ 用户可以登录
- ✅ 密码强度指示器正常
- ✅ 错误消息正确显示

**无需额外配置！**

### 完整功能配置（生产环境）

如果要部署到生产环境，建议配置：
1. ✅ Resend API（邮件功能）
2. ✅ Cloudflare Turnstile（防机器人）
3. 可选：社交登录（提升用户体验）

---

## ⚡ 忽略警告的方法

如果你暂时不需要邮件功能，可以忽略 `RESEND_API_KEY` 警告。

### 方法 1: 设置空值（已完成）
```env
RESEND_API_KEY=""
```
这会阻止错误，但功能仍然不可用。

### 方法 2: 修改代码（可选）
在 `src/mail/provider/resend.ts` 和 `src/newsletter/provider/resend.ts` 中，将错误改为警告。

---

## 🐛 故障排除

### 问题 1: "RESEND_API_KEY environment variable is not set"

**原因**: 尝试使用邮件功能但未配置 API 密钥  
**解决方案**:
1. 如果不需要邮件功能 → 忽略此警告
2. 如果需要邮件功能 → 配置 Resend API 密钥

### 问题 2: 社交登录按钮不显示

**原因**: 未配置 OAuth 凭据  
**解决方案**: 按照上述步骤配置 GitHub/Google OAuth

### 问题 3: 验证码不显示

**原因**: 未配置 Turnstile  
**解决方案**: 配置 Cloudflare Turnstile 或在 `website.ts` 中禁用

---

## 📚 相关配置文件

- `.env` - 环境变量（本地开发）
- `src/config/website.ts` - 网站功能开关
- `src/lib/auth.ts` - 认证配置

---

## 🔒 安全提示

1. **永远不要**提交 `.env` 文件到 Git
2. `.env` 已经在 `.gitignore` 中
3. 生产环境使用不同的密钥
4. 定期轮换敏感密钥

---

## 📞 获取帮助

如果遇到配置问题：
1. 检查 `.env` 文件编码为 UTF-8
2. 确保没有多余的空格或引号
3. 重启开发服务器使更改生效

---

**当前状态**: ✅ 核心功能已配置，可以正常使用认证系统！

**可选配置**: 根据需要逐步添加其他功能。
