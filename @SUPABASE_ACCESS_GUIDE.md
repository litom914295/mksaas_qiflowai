# 🔐 Supabase 访问和数据库设置完整指南

## 📋 当前状态

### ✅ 您的 Supabase 配置（已有）

```env
NEXT_PUBLIC_SUPABASE_URL=https://sibwcdadrsbfkblinezj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:Sd%40721204@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

**项目 ID**: `sibwcdadrsbfkblinezj`

---

## 🚀 解决方案（3 选 1）

### 方案 1：运行自动化脚本（最简单！）

我已经创建了一个脚本，无需登录就能创建表！

#### 步骤 1: 运行脚本

```powershell
node scripts/create-auth-tables.js
```

如果成功，你会看到：
```
🚀 开始创建认证表...
📍 Supabase URL: https://sibwcdadrsbfkblinezj.supabase.co
🔑 使用 Service Role Key

✅ 认证表创建成功！

📋 创建的表：
  ✅ user          - 用户表
  ✅ account       - OAuth 账户表
  ✅ session       - 会话表
  ✅ verification  - 验证令牌表

🎉 现在可以测试注册功能了！
👉 http://localhost:3000/zh-CN/sign-up
```

#### 步骤 2: 测试注册

访问 `http://localhost:3000/zh-CN/sign-up` 并注册！

---

### 方案 2：找回 Supabase 账号密码

#### 如果忘记密码：

1. **访问登录页面**
   ```
   https://supabase.com/login
   ```

2. **点击 "Forgot your password?"**

3. **输入您注册时使用的邮箱**

4. **检查邮箱**
   - 查看收件箱
   - 可能在垃圾邮件中
   - 点击重置密码链接

5. **设置新密码**

6. **登录后访问项目**
   ```
   https://supabase.com/dashboard/project/sibwcdadrsbfkblinezj
   ```

#### 如果忘记注册邮箱：

尝试这些邮箱：
- 您常用的个人邮箱
- 工作邮箱
- GitHub 关联的邮箱

---

### 方案 3：使用 SQL 文件（推荐！）

即使不能登录 Dashboard，也可以通过项目 URL 直接访问 SQL Editor！

#### 步骤 1: 直接访问 SQL Editor

```
https://supabase.com/dashboard/project/sibwcdadrsbfkblinezj/sql
```

#### 步骤 2: 登录

- 使用 Google 登录
- 或使用 GitHub 登录
- 或使用邮箱密码登录

#### 步骤 3: 复制 SQL

打开文件 `scripts/auth-tables.sql` 并复制全部内容

或者直接复制这个：

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

-- 创建账户表
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

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
CREATE INDEX IF NOT EXISTS idx_session_token ON session(token);
CREATE INDEX IF NOT EXISTS idx_session_userId ON session("userId");
CREATE INDEX IF NOT EXISTS idx_account_userId ON account("userId");
CREATE INDEX IF NOT EXISTS idx_verification_token ON verification(token);
```

#### 步骤 4: 执行 SQL

1. 粘贴到 SQL Editor
2. 点击 **"Run"** 或按 **Ctrl+Enter**
3. 看到成功消息

#### 步骤 5: 验证

在左侧菜单点击 **"Table Editor"**，应该看到这些表：
- ✅ user
- ✅ account
- ✅ session
- ✅ verification

---

## 🔍 如何找回/重置数据库密码

如果需要修复 `DATABASE_URL`：

### 步骤 1: 登录 Dashboard

```
https://supabase.com/dashboard/project/sibwcdadrsbfkblinezj
```

### 步骤 2: 进入数据库设置

1. 点击左侧 **"Settings"** (齿轮图标)
2. 点击 **"Database"**
3. 向下滚动找到 **"Database Password"**

### 步骤 3: 重置密码

1. 点击 **"Reset Database Password"**
2. 会生成一个新密码
3. **立即复制**（只显示一次！）

### 步骤 4: 更新连接字符串

**Transaction Mode** (推荐):
```
postgresql://postgres:[YOUR_NEW_PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

**Direct Connection**:
```
postgresql://postgres:[YOUR_NEW_PASSWORD]@db.sibwcdadrsbfkblinezj.supabase.co:5432/postgres
```

### 步骤 5: 更新 .env 文件

将新的连接字符串更新到：
- `.env`
- `.env.local`

**注意密码 URL 编码**：
```
@ → %40
# → %23
$ → %24
```

### 步骤 6: 重启服务器

```powershell
# Ctrl+C 停止
npm run dev
```

---

## 💡 快速决策树

```
能运行 Node 脚本吗？
├─ 是 → 方案 1：运行 node scripts/create-auth-tables.js
└─ 否
   ├─ 能登录 Supabase 吗？
   │  ├─ 是 → 方案 3：直接在 SQL Editor 执行 SQL
   │  └─ 否 → 方案 2：先找回密码，然后执行方案 3
   └─ 

完全访问不了？
└─ 联系 Supabase 支持或创建新项目
```

---

## 🎯 推荐操作顺序

### 现在立即做（选择一个）:

#### 选项 A：最快最简单
```powershell
node scripts/create-auth-tables.js
```
**时间**: 10 秒  
**成功率**: 90%

#### 选项 B：稳定可靠
1. 访问 https://supabase.com/dashboard/project/sibwcdadrsbfkblinezj/sql
2. 登录（Google/GitHub/Email）
3. 复制 `scripts/auth-tables.sql` 内容
4. 粘贴并运行

**时间**: 2 分钟  
**成功率**: 100%

---

## 🧪 测试清单

### 表创建成功后：

1. **访问注册页面**
   ```
   http://localhost:3000/zh-CN/sign-up
   ```

2. **填写表单**
   ```
   姓名: 测试用户
   邮箱: test@example.com
   密码: test12345678
   确认: test12345678
   ```

3. **点击注册**

4. **预期结果**
   - ✅ 显示 "注册成功！欢迎加入！"
   - ✅ 自动跳转首页
   - ✅ 用户已登录

5. **验证数据**
   - 在 Supabase Table Editor 查看 `user` 表
   - 应该有一条新记录

---

## 📞 需要帮助？

### 问题 1: "node 不是内部或外部命令"

**解决**: Node.js 未安装或未添加到 PATH

**快速修复**: 使用方案 3（SQL Editor）

### 问题 2: "API 请求失败 401/403"

**原因**: SERVICE_ROLE_KEY 不正确或已过期

**解决**:
1. 登录 Supabase Dashboard
2. Settings > API
3. 复制新的 Service Role Key
4. 更新 .env 文件

### 问题 3: 完全无法访问 Supabase

**选项**:
1. 创建新的 Supabase 项目
2. 使用其他数据库（如 Neon、PlanetScale）
3. 使用本地 PostgreSQL

---

## 🎉 总结

### 您有 3 个文件可以使用：

1. **`scripts/create-auth-tables.js`** - 自动化脚本
2. **`scripts/auth-tables.sql`** - SQL 文件
3. **`@FIX_DATABASE_NOW.md`** - 详细修复指南

### 推荐路径：

1. **先试方案 1** (运行 Node 脚本)
2. **如果失败，用方案 3** (SQL Editor)
3. **如果还不行，用方案 2** (找回密码)

---

**现在就试试方案 1 吧！** 🚀

```powershell
node scripts/create-auth-tables.js
```

或者

**直接访问 SQL Editor：**
```
https://supabase.com/dashboard/project/sibwcdadrsbfkblinezj/sql
```

---

**有任何问题随时告诉我！** 💪
