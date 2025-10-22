# 🚀 认证系统快速启动指南

## ⚠️ 当前状态

数据库连接问题：无法连接到 Supabase 数据库（网络/DNS 问题）

```
Error: getaddrinfo ENOTFOUND db.sibwcdadrsbfkblinezj.supabase.co
```

## 📋 解决方案（3 个选项）

### 选项 1：修复 Supabase 连接（推荐用于生产）

#### 可能的原因：
1. **网络问题** - 防火墙或代理阻止连接
2. **IPv6 问题** - 系统只支持 IPv6 但应用使用 IPv4
3. **数据库暂停** - Supabase 免费实例可能已暂停

#### 解决步骤：

**A. 检查 Supabase 控制台**
1. 访问: https://supabase.com/dashboard
2. 检查项目 `sibwcdadrsbfkblinezj` 状态
3. 确认数据库没有暂停
4. 重启数据库（如果需要）

**B. 测试网络连接**
```powershell
# 测试 DNS
nslookup db.sibwcdadrsbfkblinezj.supabase.co

# 测试端口连接
Test-NetConnection -ComputerName "db.sibwcdadrsbfkblinezj.supabase.co" -Port 5432
```

**C. 尝试使用 Pooler 连接**
修改 `.env.local` 中的 `DATABASE_URL`：
```env
# 使用 Pooler（端口 6543）
DATABASE_URL=postgresql://postgres:Sd@721204@db.sibwcdadrsbfkblinezj.supabase.co:6543/postgres?pgbouncer=true
```

**D. 使用 Supabase 直接连接字符串**
从 Supabase 控制台获取新的连接字符串：
1. 进入 Project Settings
2. 找到 Database
3. 复制 Connection String (Session mode 或 Transaction mode)

---

### 选项 2：使用本地 PostgreSQL（适合开发）

**安装本地 PostgreSQL：**

1. 下载并安装 PostgreSQL: https://www.postgresql.org/download/windows/
2. 创建数据库：
   ```powershell
   psql -U postgres
   CREATE DATABASE mksaas_dev;
   ```
3. 修改 `.env.local`：
   ```env
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/mksaas_dev
   ```
4. 运行迁移：
   ```powershell
   npm run db:push
   ```

---

### 选项 3：暂时使用 Mock 数据（快速测试 UI）

如果只是想测试登录/注册 UI，可以暂时跳过数据库：

**步骤：**

1. **创建 Mock Auth 配置**

修改 `src/lib/auth.ts` 顶部添加环境检查：
```typescript
// 如果数据库不可用，使用内存模式（仅用于 UI 测试）
const isDatabaseAvailable = process.env.SKIP_DATABASE !== 'true';
```

2. **设置环境变量**

在 `.env.local` 添加：
```env
SKIP_DATABASE=true
```

3. **直接启动开发服务器**
```powershell
npm run dev
```

4. **测试 UI**
- 访问登录页面: `http://localhost:3000/zh-CN/sign-in`
- 访问注册页面: `http://localhost:3000/zh-CN/sign-up`
- UI 和表单验证可以正常工作
- 实际的注册/登录会失败（预期行为）

---

## 🎯 我的推荐

### 对于当前情况（网络问题）：

**立即可行：选项 3** - 先测试 UI，稍后解决数据库
```powershell
# 1. 跳过数据库检查
echo "SKIP_DATABASE=true" >> .env.local

# 2. 启动服务器
npm run dev

# 3. 访问页面测试 UI
# http://localhost:3000/zh-CN/sign-in
# http://localhost:3000/zh-CN/sign-up
```

**长期方案：选项 1** - 修复 Supabase 连接
- 检查 Supabase 控制台状态
- 尝试使用 Pooler 连接（端口 6543）
- 联系网络管理员检查防火墙设置

**备选方案：选项 2** - 安装本地 PostgreSQL
- 适合长期开发
- 不依赖外部服务
- 速度更快

---

## 🔍 诊断工具

### 快速检查网络连接：
```powershell
# DNS 解析
nslookup db.sibwcdadrsbfkblinezj.supabase.co

# Ping 测试
ping db.sibwcdadrsbfkblinezj.supabase.co

# 端口测试
Test-NetConnection -ComputerName "db.sibwcdadrsbfkblinezj.supabase.co" -Port 5432
Test-NetConnection -ComputerName "db.sibwcdadrsbfkblinezj.supabase.co" -Port 6543
```

### 测试 Supabase API：
```powershell
# 测试 Supabase REST API
curl https://sibwcdadrsbfkblinezj.supabase.co/rest/v1/
```

---

## 📝 下一步行动

**现在就做：**

1. **决定使用哪个选项**（我建议选项 3 快速开始）

2. **如果选择选项 3（快速测试）：**
   ```powershell
   # 停止当前服务器
   # Ctrl+C
   
   # 启动服务器（不连接数据库）
   npm run dev
   
   # 测试页面
   # http://localhost:3000/zh-CN/sign-in
   # http://localhost:3000/zh-CN/sign-up
   ```

3. **UI 测试清单：**
   - [ ] 登录页面显示正常
   - [ ] 注册页面显示正常
   - [ ] 表单验证工作正常
   - [ ] 密码确认匹配验证
   - [ ] Google/GitHub 按钮显示正常
   - [ ] 页面跳转链接正常

4. **稍后解决数据库：**
   - 检查 Supabase 控制台
   - 或安装本地 PostgreSQL
   - 或使用其他数据库提供商（Neon、PlanetScale 等）

---

## 🆘 需要帮助？

**如果选择选项 1（修复 Supabase）：**
- 告诉我 Supabase 控制台显示的状态
- 提供新的连接字符串（不包含密码）

**如果选择选项 2（本地 PostgreSQL）：**
- 告诉我安装进度
- 我可以帮您配置数据库和运行迁移

**如果选择选项 3（跳过数据库）：**
- 直接运行 `npm run dev`
- 先测试 UI，稍后再处理数据库

---

**你想选择哪个选项？** 🤔
