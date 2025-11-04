# 数据库设置指南

## 问题诊断

你遇到的错误：
```
Error: getaddrinfo ENOTFOUND db.sibwcdadrsbfkblinezj.supabase.co
```

**原因**: Supabase 项目不存在或无法访问

---

## 解决方案 1: 使用 Supabase（推荐）

### 步骤 1: 创建 Supabase 项目

1. 访问 https://supabase.com/dashboard
2. 登录或注册账号（免费）
3. 点击 **"New Project"**
4. 填写项目信息：
   - Name: `qiflow-ai` (任意名称)
   - Database Password: 设置一个强密码（记住它！）
   - Region: 选择 `Southeast Asia (Singapore)` 或最近的区域
5. 点击 **"Create new project"**
6. 等待约 2 分钟完成初始化

### 步骤 2: 获取连接信息

1. 进入项目后，点击左侧 **Settings** → **Database**
2. 找到 **Connection string** 部分
3. 复制以下内容：
   - **URI** (Session Pooler)
   - **Connection string** (Direct connection)

4. 点击 **Settings** → **API**
5. 复制：
   - **Project URL** (例如：https://xxxxx.supabase.co)
   - **anon public** key
   - **service_role** key (需要点击"Reveal"显示)

### 步骤 3: 更新环境变量

编辑 `.env.local` 文件，替换以下内容：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://你的项目ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon_key
SUPABASE_SERVICE_ROLE_KEY=你的service_role_key

# 数据库连接 - Direct Connection
DIRECT_DATABASE_URL=postgresql://postgres:你的密码@db.你的项目ID.supabase.co:5432/postgres?sslmode=require

# 数据库连接 - Session Pooler
SESSION_DATABASE_URL=postgresql://postgres:你的密码@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres

# 默认连接
DATABASE_URL=postgresql://postgres:你的密码@db.你的项目ID.supabase.co:5432/postgres?sslmode=require
```

### 步骤 4: 运行数据库迁移

```bash
# 推送数据库架构
npm run db:push

# 或生成迁移文件
npm run db:generate
npm run db:migrate
```

### 步骤 5: 重启开发服务器

```bash
# 停止当前服务器 (Ctrl+C)
# 重新启动
npm run dev
```

---

## 解决方案 2: 使用本地 PostgreSQL

### 前提条件

安装 PostgreSQL:
- Windows: https://www.postgresql.org/download/windows/
- Mac: `brew install postgresql`
- Linux: `sudo apt-get install postgresql`

### 步骤 1: 创建数据库

```bash
# 启动 PostgreSQL
# Windows: 从开始菜单启动
# Mac/Linux: 
sudo service postgresql start

# 创建数据库
psql -U postgres
CREATE DATABASE qiflow_ai;
\q
```

### 步骤 2: 配置环境变量

编辑 `.env.local`:

```bash
# 本地 PostgreSQL
DATABASE_URL=postgresql://postgres:你的密码@localhost:5432/qiflow_ai
DIRECT_DATABASE_URL=postgresql://postgres:你的密码@localhost:5432/qiflow_ai
SESSION_DATABASE_URL=postgresql://postgres:你的密码@localhost:5432/qiflow_ai

# Supabase 相关可以暂时注释掉或使用假值
# NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
# NEXT_PUBLIC_SUPABASE_ANON_KEY=fake-key-for-local
# SUPABASE_SERVICE_ROLE_KEY=fake-key-for-local
```

### 步骤 3: 运行迁移

```bash
npm run db:push
npm run dev
```

---

## 解决方案 3: 快速测试（临时禁用数据库）

如果只是想快速测试 UI，可以临时修改代码跳过数据库连接。

**不推荐用于生产环境！**

### 修改 `src/db/index.ts`:

```typescript
export async function getDb() {
  if (db) return db;

  // 临时: 跳过数据库连接
  console.warn('⚠️  数据库连接已禁用（开发模式）');
  
  // 返回一个模拟的数据库对象
  const mockClient = {} as any;
  db = drizzle(mockClient, { schema });
  return db;
}
```

---

## 常见问题

### Q: 忘记了数据库密码怎么办？

**Supabase**: 
1. 进入项目 Settings → Database
2. 点击 "Reset database password"

**本地 PostgreSQL**:
1. 修改 `pg_hba.conf` 文件
2. 重启 PostgreSQL 服务

### Q: 连接超时

检查：
1. 网络连接是否正常
2. 防火墙是否阻止了数据库端口
3. Supabase 项目是否处于暂停状态（免费项目闲置7天会暂停）

### Q: 如何查看数据库内容？

**Supabase**:
- 使用 Supabase Dashboard 的 Table Editor
- 或使用 SQL Editor 运行查询

**本地**:
```bash
psql -U postgres -d qiflow_ai
\dt  # 查看所有表
SELECT * FROM users;  # 查询用户表
```

---

## 推荐工具

- **数据库客户端**: 
  - DBeaver (免费)
  - TablePlus
  - pgAdmin

- **Supabase CLI**:
```bash
npm install -g supabase
supabase login
supabase link --project-ref 你的项目ID
```

---

## 下一步

完成数据库设置后，你需要：

1. ✅ 确认数据库连接成功
2. ✅ 运行数据库迁移 (`npm run db:push`)
3. ✅ 可选：运行种子数据 (`npm run seed:admin`)
4. ✅ 重启开发服务器

---

**需要帮助？** 查看完整文档或提交问题到项目 GitHub。
