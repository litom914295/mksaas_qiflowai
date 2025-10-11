# 🔧 立即修复数据库连接

## 当前状态
- ✅ **UI 完全正常** - 注册页面显示完美
- ❌ **数据库连接失败** - `Tenant or user not found` 错误

## 🚨 问题原因

数据库密码或连接配置不正确。

**当前连接字符串**:
```
postgresql://postgres:Sd%40721204@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

---

## 🎯 解决方案（2 选 1）

### 方案 A：从 Supabase 获取正确的连接字符串（推荐）

#### 步骤 1: 访问 Supabase Dashboard

```
https://supabase.com/dashboard/project/sibwcdadrsbfkblinezj
```

#### 步骤 2: 进入数据库设置

1. 点击左侧菜单 **"Settings"** (齿轮图标)
2. 点击 **"Database"**
3. 向下滚动到 **"Connection string"** 部分

#### 步骤 3: 复制连接字符串

你会看到几种连接方式，选择 **"Transaction Mode"** (推荐):

```
Connection pooling (Recommended)
┌─────────────────────────────────────┐
│ Transaction Mode                    │
│ postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres │
└─────────────────────────────────────┘
```

**重要提示**:
- `[YOUR-PASSWORD]` 需要替换为你的实际数据库密码
- 如果忘记密码，点击 **"Reset Database Password"**

#### 步骤 4: 更新环境变量

将正确的连接字符串复制到这两个文件：

**文件 1**: `.env`
```env
DATABASE_URL=<从 Supabase 复制的完整连接字符串>
```

**文件 2**: `.env.local`
```env
DATABASE_URL=<从 Supabase 复制的完整连接字符串>
```

**注意**: 如果密码包含特殊字符，需要 URL 编码：
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `!` → `%21`

#### 步骤 5: 重启开发服务器

```powershell
# 停止服务器 (Ctrl+C)
# 然后重新启动
npm run dev
```

---

### 方案 B：在 Supabase 手动创建数据库表（更快）

如果连接字符串正确但还是失败，可以直接在 Supabase 创建表：

#### 步骤 1: 访问 SQL Editor

```
https://supabase.com/dashboard/project/sibwcdadrsbfkblinezj/sql
```

或者：
1. 在 Dashboard 左侧点击 **"SQL Editor"**
2. 点击 **"New Query"**

#### 步骤 2: 执行以下 SQL

复制并粘贴这个完整的 SQL 脚本，然后点击 **"Run"**:

```sql
-- 创建用户表
CREATE TABLE IF NOT EXISTS "user" (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  "emailVerified" BOOLEAN DEFAULT false,
  image TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "customerId" TEXT,
  role TEXT DEFAULT 'user',
  banned BOOLEAN DEFAULT false,
  "banReason" TEXT,
  "banExpires" TIMESTAMP
);

-- 创建账户表 (OAuth)
CREATE TABLE IF NOT EXISTS account (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "expiresAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 创建会话表
CREATE TABLE IF NOT EXISTS session (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "expiresAt" TIMESTAMP NOT NULL,
  token TEXT NOT NULL UNIQUE,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 创建验证令牌表
CREATE TABLE IF NOT EXISTS verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 创建索引以提升性能
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
CREATE INDEX IF NOT EXISTS idx_session_token ON session(token);
CREATE INDEX IF NOT EXISTS idx_session_userId ON session("userId");
CREATE INDEX IF NOT EXISTS idx_account_userId ON account("userId");
CREATE INDEX IF NOT EXISTS idx_verification_token ON verification(token);

-- 验证表创建成功
SELECT 
  'Tables created successfully!' as message,
  COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('user', 'account', 'session', 'verification');
```

#### 步骤 3: 验证表已创建

执行 SQL 后，你应该看到：
```
message: "Tables created successfully!"
table_count: 4
```

然后访问 **"Table Editor"** (左侧菜单)，你应该看到这 4 个新表：
- ✅ user
- ✅ account
- ✅ session
- ✅ verification

#### 步骤 4: 测试注册

现在回到注册页面，重新尝试注册！

---

## 🧪 测试步骤

### 1. 访问注册页面
```
http://localhost:3000/zh-CN/sign-up
```

### 2. 填写注册信息

```
姓名: 测试用户
邮箱: test@example.com
密码: test12345678
确认密码: test12345678
```

### 3. 点击"注册"按钮

**成功的表现**:
- ✅ 显示 "注册成功！欢迎加入！" 消息
- ✅ 自动跳转到首页
- ✅ 用户已登录

**如果还是失败**:
- 检查浏览器控制台错误
- 检查终端服务器日志
- 继续看下面的故障排除

---

## 🐛 故障排除

### 问题 1: 仍然显示 "Tenant or user not found"

**原因**: 数据库连接字符串不正确

**解决**:
1. 在 Supabase Dashboard 重置数据库密码
2. 获取新的连接字符串
3. 更新 `.env` 和 `.env.local`
4. 重启服务器

### 问题 2: "Permission denied" 或类似错误

**原因**: 数据库权限问题

**解决**:
1. 确保使用的是 `postgres` 用户（服务角色）
2. 检查 Supabase 项目是否处于活跃状态
3. 确认数据库没有被暂停

### 问题 3: "relation does not exist"

**原因**: 数据库表未创建

**解决**:
使用方案 B 手动创建表

### 问题 4: OAuth 警告 (github/google)

**这个警告可以忽略！**

```
WARN [Better Auth]: Social provider github is missing clientId or clientSecret
WARN [Better Auth]: Social provider google is missing clientId or clientSecret
```

这不会影响邮箱注册功能。如果以后需要 OAuth 登录，可以配置：

在 `.env.local` 添加：
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

---

## 📊 快速诊断

运行这个命令测试数据库连接：

```powershell
# 测试连接（需要安装 PostgreSQL 客户端）
$env:DATABASE_URL = "your_connection_string_here"
psql $env:DATABASE_URL -c "SELECT version();"
```

如果连接成功，会显示 PostgreSQL 版本信息。

---

## 🎯 推荐的完整流程

### 现在立即做：

1. **方案 B 最快！** 
   - 访问 Supabase SQL Editor
   - 执行上面的 SQL 脚本
   - 验证表创建成功

2. **重新测试注册**
   - 访问 `/zh-CN/sign-up`
   - 填写表单
   - 提交注册

3. **如果成功**
   - ✅ 用户已创建
   - ✅ 可以登录
   - ✅ 认证系统完全可用

4. **验证数据**
   - 在 Supabase Table Editor 查看 `user` 表
   - 应该看到新创建的用户记录

---

## 📝 检查清单

执行方案 B:
- [ ] 访问 Supabase SQL Editor
- [ ] 复制并执行 SQL 脚本
- [ ] 验证 4 个表已创建
- [ ] 重新测试注册功能
- [ ] 确认用户数据保存成功

或执行方案 A:
- [ ] 访问 Supabase Database Settings
- [ ] 获取正确的连接字符串
- [ ] 更新 `.env` 和 `.env.local`
- [ ] 重启开发服务器
- [ ] 运行 `npm run db:push`
- [ ] 测试注册功能

---

## 💡 提示

**我强烈建议使用方案 B（手动创建表）**，因为：
- ✅ 更快（5 分钟内完成）
- ✅ 不需要调试连接字符串
- ✅ 立即可以测试功能
- ✅ 100% 可靠

稍后你可以修复连接字符串用于其他用途（如数据库迁移），但现在先让注册功能工作起来！

---

**准备好了吗？** 

👉 访问: https://supabase.com/dashboard/project/sibwcdadrsbfkblinezj/sql

复制 SQL 脚本，点击 Run，然后测试注册！🚀
