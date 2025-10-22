# 🔧 数据库连接问题解决方案

## 当前状态
- ✅ API 路由已创建
- ✅ 登录/注册页面已创建  
- ❌ 数据库连接失败："Tenant or user not found"

## 问题分析

### 错误信息
```
PostgresError: Tenant or user not found
code: 'XX000'
```

### 可能原因
1. 数据库密码不正确
2. Supabase 项目配置变更
3. 数据库实例已暂停或删除

## 🚀 解决方案

### 方案 1：从 Supabase 控制台获取正确的连接字符串

1. **访问 Supabase 控制台**
   https://supabase.com/dashboard

2. **进入项目设置**
   - 选择项目 `sibwcdadrsbfkblinezj`
   - 进入 Settings > Database

3. **获取连接字符串**
   
   找到以下两种连接方式之一：
   
   **A. Transaction Mode (推荐用于 Drizzle)**
   ```
   postgresql://postgres:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```
   
   **B. Session Mode (直连)**
   ```
   postgresql://postgres.sibwcdadrsbfkblinezj:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
   ```
   
   **C. Direct Connection**
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.sibwcdadrsbfkblinezj.supabase.co:5432/postgres
   ```

4. **更新 .env 文件**
   
   将获取的连接字符串替换到 `.env` 和 `.env.local` 中：
   ```env
   DATABASE_URL=<从控制台复制的完整连接字符串>
   ```
   
   ⚠️ **注意**：如果密码包含特殊字符，需要 URL 编码：
   - `@` → `%40`
   - `#` → `%23`
   - `$` → `%24`
   - `%` → `%25`
   - `&` → `%26`

5. **重新运行数据库推送**
   ```powershell
   npm run db:push
   ```

---

### 方案 2：在 Supabase 控制台手动创建表

如果方案 1 仍然失败，可以手动在 Supabase SQL 编辑器中创建表：

1. **访问 SQL 编辑器**
   Supabase Dashboard > SQL Editor > New Query

2. **执行以下 SQL**

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

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
CREATE INDEX IF NOT EXISTS idx_session_token ON session(token);
CREATE INDEX IF NOT EXISTS idx_session_userId ON session("userId");
CREATE INDEX IF NOT EXISTS idx_account_userId ON account("userId");
CREATE INDEX IF NOT EXISTS idx_verification_token ON verification(token);
```

3. **点击 Run 执行 SQL**

4. **验证表创建成功**
   在 Table Editor 中应该能看到这些表：
   - user
   - account
   - session
   - verification

---

### 方案 3：直接测试 UI（跳过数据库）

如果暂时无法解决数据库问题，可以先测试登录/注册 UI：

1. **启动开发服务器**
   ```powershell
   npm run dev
   ```

2. **访问页面**
   - 登录: http://localhost:3000/zh-CN/sign-in
   - 注册: http://localhost:3000/zh-CN/sign-up

3. **测试内容**
   - ✅ 页面渲染
   - ✅ 表单验证
   - ✅ 输入反馈
   - ✅ 按钮状态
   - ❌ 实际登录（需要数据库）

---

## 📋 推荐步骤

### 立即执行：

1. **获取正确的连接字符串**
   - 访问 Supabase 控制台
   - 复制正确的 DATABASE_URL
   - 更新 `.env` 和 `.env.local`

2. **如果还是失败，手动创建表**
   - 使用方案 2 中的 SQL
   - 在 Supabase SQL 编辑器执行

3. **启动开发服务器**
   ```powershell
   npm run dev
   ```

4. **测试完整流程**
   - 访问 http://localhost:3000/zh-CN/sign-up
   - 注册新用户
   - 登录测试

---

## 🎯 快速测试命令

```powershell
# 方案 1: 修复数据库连接后
npm run db:push
npm run dev

# 方案 2: 手动创建表后
npm run dev

# 方案 3: 直接测试 UI
npm run dev
```

---

## 需要的信息

请提供以下信息以帮助诊断：

1. **从 Supabase 控制台复制的连接字符串**（隐藏密码）
2. **Supabase 项目状态**（活跃/暂停/删除）
3. **数据库密码**（用于验证是否正确）

---

**当前建议：先执行方案 3，直接测试 UI！** 🎨
