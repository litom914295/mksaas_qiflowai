# QiFlow AI 环境变量配置指南

## 📋 概述

本指南将帮助您配置 QiFlow AI 项目所需的所有环境变量。请按照以下步骤操作。

## 🔧 必需的环境变量

### 1. Supabase 配置

首先，您需要创建一个 Supabase 项目：

1. 访问 [Supabase](https://supabase.com)
2. 创建新项目
3. 进入项目设置 > API
4. 复制以下信息：

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
```

### 2. AI 服务提供商配置

选择您想要使用的 AI 服务提供商：

#### OpenAI (推荐)

```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_BASE_URL=https://api.openai.com/v1
```

#### Anthropic Claude

```bash
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
ANTHROPIC_BASE_URL=https://api.anthropic.com/v1
```

#### Google Gemini

```bash
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
```

#### DeepSeek

```bash
DEEPSEEK_API_KEY=sk-your-deepseek-key-here
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
```

### 3. 应用配置

```bash
# 认证密钥（生成随机字符串）
NEXTAUTH_SECRET=your-random-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# 游客会话密钥（生成随机字符串）
GUEST_SESSION_SECRET=your-guest-session-secret-key-here
```

### 4. 地图服务配置

根据您的目标用户地区选择地图服务：

#### 高德地图（中国大陆）

```bash
NEXT_PUBLIC_GAODE_MAP_API_KEY=your-gaode-api-key-here
```

#### Google Maps（国际）

```bash
NEXT_PUBLIC_GOOGLE_MAP_API_KEY=your-google-maps-api-key-here
```

## 🚀 快速开始

### 步骤 1: 复制环境变量模板

```bash
cp env.example .env.local
```

### 步骤 2: 配置 Supabase

1. 创建 Supabase 项目
2. 运行数据库迁移：

```bash
npm run db:push
```

3. 配置环境变量

### 步骤 3: 配置 AI 服务

选择至少一个 AI 服务提供商并配置相应的 API 密钥。

### 步骤 4: 生成密钥

```bash
# 生成 NextAuth 密钥
openssl rand -base64 32

# 生成游客会话密钥
openssl rand -hex 32
```

## 🔍 验证配置

运行以下命令验证配置是否正确：

```bash
# 检查环境变量
npm run dev

# 测试数据库连接
npm run db:studio

# 运行测试
npm run test
```

## ⚠️ 安全注意事项

1. **永远不要提交 `.env.local` 文件到版本控制**
2. **在生产环境中使用强密码**
3. **定期轮换 API 密钥**
4. **限制服务角色密钥的使用范围**

## 🆘 故障排除

### 常见问题

#### 1. Supabase 连接失败

- 检查项目 URL 和 API 密钥是否正确
- 确认网络连接正常
- 检查防火墙设置

#### 2. AI 服务不可用

- 验证 API 密钥是否有效
- 检查账户余额
- 确认服务地区限制

#### 3. 地图服务不工作

- 验证 API 密钥
- 检查服务配额
- 确认域名白名单设置

### 获取帮助

如果您在配置过程中遇到问题，请：

1. 检查浏览器开发者工具的控制台错误
2. 查看服务器日志
3. 参考 Supabase 和 AI 提供商的官方文档
4. 在项目 Issues 中提交问题

## 📝 下一步

配置完成后，您可以：

1. 运行 `npm run dev` 启动开发服务器
2. 访问 `http://localhost:3000` 查看应用
3. 开始测试各项功能

---

**注意**: 请根据您的具体需求和部署环境调整这些配置。
