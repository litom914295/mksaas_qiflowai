# 🚨 数据库连接错误 - 快速修复

## 你的错误
```
Error: getaddrinfo ENOTFOUND db.sibwcdadrsbfkblinezj.supabase.co
```

## ⚡ 立即解决（3种方案）

### 方案 1: 临时跳过（已应用 ✅）

**当前状态**: 代码已自动修改，现在会显示警告但不会阻止应用运行

**重启应用即可**:
```bash
# Ctrl+C 停止当前服务器
# 然后重启
npm run dev
```

**效果**:
- ⚠️ 会看到警告信息，但应用能正常启动
- ✅ 可以测试 UI 界面
- ❌ 数据库功能不可用（登录、注册等）

---

### 方案 2: 创建新的 Supabase 项目（推荐）

#### 5分钟完成设置

1. **打开浏览器**
   ```
   https://supabase.com/dashboard
   ```

2. **创建项目**
   - 点击 "New Project"
   - 项目名称: `qiflow-ai`
   - 数据库密码: 设置并记住（例如: `MySecurePass123!`）
   - 区域: Southeast Asia (Singapore)
   - 点击 "Create new project"
   - 等待2分钟

3. **复制配置**
   
   进入项目后：
   
   **A. 获取 API 密钥**
   - Settings → API
   - 复制 `Project URL`
   - 复制 `anon public` key
   - 点击 "Reveal" 复制 `service_role` key
   
   **B. 获取数据库连接**
   - Settings → Database
   - 滚动到 "Connection string"
   - 复制 "URI" (Session pooler)
   - 复制 "Connection string" (Direct connection)

4. **更新 `.env.local`**
   
   用文本编辑器打开 `D:\test\mksaas_qiflowai\.env.local`
   
   替换这些行（注意替换 `YOUR_XXX` 部分）:
   
   ```bash
   # Supabase 配置
   NEXT_PUBLIC_SUPABASE_URL=https://你的项目ID.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon_key（很长的字符串）
   SUPABASE_SERVICE_ROLE_KEY=你的service_role_key（很长的字符串）
   
   # 数据库连接
   DIRECT_DATABASE_URL=postgresql://postgres:你的密码@db.你的项目ID.supabase.co:5432/postgres?sslmode=require
   SESSION_DATABASE_URL=postgresql://postgres:你的密码@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   DATABASE_URL=postgresql://postgres:你的密码@db.你的项目ID.supabase.co:5432/postgres?sslmode=require
   ```

5. **初始化数据库**
   ```bash
   npm run db:push
   ```

6. **重启应用**
   ```bash
   npm run dev
   ```

✅ **完成！现在应该能正常登录了**

---

### 方案 3: 使用本地数据库

如果你已经安装了 PostgreSQL:

1. **创建数据库**
   ```bash
   psql -U postgres
   CREATE DATABASE qiflow_ai;
   \q
   ```

2. **更新 `.env.local`**
   ```bash
   DATABASE_URL=postgresql://postgres:你的密码@localhost:5432/qiflow_ai
   DIRECT_DATABASE_URL=postgresql://postgres:你的密码@localhost:5432/qiflow_ai
   SESSION_DATABASE_URL=postgresql://postgres:你的密码@localhost:5432/qiflow_ai
   ```

3. **运行迁移**
   ```bash
   npm run db:push
   npm run dev
   ```

---

## 🔍 当前应用状态

由于已应用临时修复，重启后你会看到：

```
⚠️  数据库连接失败！请检查：
1. Supabase 项目是否存在
2. .env.local 中的数据库配置是否正确
3. 查看 DATABASE_SETUP_GUIDE.md 获取详细指导

⚠️  使用模拟数据库模式（仅用于测试）
⚠️  数据库功能将不可用，仅能测试 UI
```

**可用功能**: 
- ✅ UI 界面正常显示
- ✅ 前端交互正常

**不可用功能**:
- ❌ 登录/注册
- ❌ 数据保存
- ❌ 用户管理

---

## 📚 详细文档

需要更多帮助？查看:
- `DATABASE_SETUP_GUIDE.md` - 完整的数据库设置指南
- `.env.local.template` - 环境变量配置模板

---

## ❓ 常见问题

**Q: 我没有 Supabase 账号怎么办？**
A: 访问 supabase.com 免费注册，提供 500MB 免费存储

**Q: 忘记数据库密码了？**
A: Supabase Dashboard → Settings → Database → "Reset database password"

**Q: 能用其他数据库吗？**
A: 可以，任何 PostgreSQL 数据库都可以

**Q: 临时修复安全吗？**
A: 仅用于开发测试，不要在生产环境使用

---

**下一步**: 选择一个方案，5分钟内让应用正常运行！
