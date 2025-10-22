# 创建新 Supabase 项目 - 详细步骤

## 📋 准备工作
- 时间: 5-10 分钟
- 需要: 电子邮件账号
- 费用: 完全免费

---

## 🚀 步骤 1: 访问 Supabase

打开浏览器，访问:
```
https://supabase.com/dashboard
```

- 如果已登录，跳到步骤 2
- 如果未登录，点击 "Sign In" 登录

---

## 🆕 步骤 2: 创建新项目

1. 点击右上角的 **"New Project"** 按钮

2. 选择组织 (Organization)
   - 如果是第一次使用，会提示创建组织
   - 输入组织名称 (例如: "My Organization")

3. 填写项目信息:
   ```
   Project name: qiflow-ai
   Database Password: [设置一个强密码]
   Region: Southeast Asia (Singapore)
   Pricing Plan: Free
   ```

   **重要**: 记住你设置的密码！ 写在这里: _______________

4. 点击 **"Create new project"**

5. 等待 2-3 分钟，项目会自动初始化

---

## 📝 步骤 3: 获取连接信息

### A. 获取 API 密钥

1. 项目创建完成后，点击左侧菜单 **Settings** (齿轮图标)

2. 点击 **API**

3. 复制以下内容:

   **Project URL** (看起来像 `https://xxxxx.supabase.co`):
   ```
   _______________________________________
   ```

   **anon public** (很长的字符串):
   ```
   _______________________________________
   ```

   点击 "Reveal" 按钮，复制 **service_role** key:
   ```
   _______________________________________
   ```

### B. 获取数据库连接字符串

1. 点击左侧菜单 **Settings** → **Database**

2. 滚动到 **"Connection string"** 部分

3. 选择 **"URI"** 模式

4. 复制 **Session pooler** 连接字符串:
   ```
   postgresql://postgres.[REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```
   替换 `[YOUR-PASSWORD]` 为你设置的密码

5. 复制 **Direct connection** 连接字符串:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[REF].supabase.co:5432/postgres
   ```
   同样替换密码

---

## 🔧 步骤 4: 更新配置文件

打开 `D:\test\mksaas_qiflowai\.env.local` 文件

**替换这些行**（保持其他配置不变）:

```bash
# ===========================================
# Supabase 配置 (必需)
# ===========================================
NEXT_PUBLIC_SUPABASE_URL=https://你的项目REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你复制的anon_public_key
SUPABASE_SERVICE_ROLE_KEY=你复制的service_role_key

# ===========================================
# 数据库配置 (必需)
# ===========================================
# 直连地址（将 [YOUR-PASSWORD] 替换为你的密码）
DIRECT_DATABASE_URL=postgresql://postgres:你的密码@db.你的项目REF.supabase.co:5432/postgres?sslmode=require

# 会话池地址（将 [YOUR-PASSWORD] 替换为你的密码）
SESSION_DATABASE_URL=postgresql://postgres:你的密码@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres

# 兜底地址（与 DIRECT_DATABASE_URL 相同）
DATABASE_URL=postgresql://postgres:你的密码@db.你的项目REF.supabase.co:5432/postgres?sslmode=require
```

**示例**（假设你的项目 REF 是 `abcdefghijk`，密码是 `MyPass123`）:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
DIRECT_DATABASE_URL=postgresql://postgres:MyPass123@db.abcdefghijk.supabase.co:5432/postgres?sslmode=require
SESSION_DATABASE_URL=postgresql://postgres:MyPass123@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
DATABASE_URL=postgresql://postgres:MyPass123@db.abcdefghijk.supabase.co:5432/postgres?sslmode=require
```

保存文件 (Ctrl+S)

---

## 🗄️ 步骤 5: 初始化数据库

打开终端（PowerShell 或 CMD），运行:

```bash
# 进入项目目录
cd D:\test\mksaas_qiflowai

# 推送数据库架构
npm run db:push
```

**预期输出**:
```
✅ Database schema pushed successfully
```

如果出错，检查:
- 密码是否正确（注意特殊字符需要 URL 编码）
- 网络是否正常

---

## 🚀 步骤 6: 启动应用

```bash
# 重启开发服务器
npm run dev
```

**预期输出**:
```
Connecting to database...
✅ Database connection established
✓ Ready in 5s
```

现在访问 http://localhost:3000 测试登录！

---

## 🎯 步骤 7: 创建管理员账号（可选）

```bash
npm run seed:admin
```

这会创建一个管理员账号:
- 邮箱: admin@mksaas.com
- 密码: admin123456

---

## ✅ 完成检查清单

- [ ] Supabase 项目创建成功
- [ ] 获取了所有 API 密钥和连接字符串
- [ ] 更新了 `.env.local` 文件
- [ ] 运行了 `npm run db:push`
- [ ] 应用成功连接数据库
- [ ] 可以正常登录/注册

---

## 🔧 密码包含特殊字符？

如果你的数据库密码包含特殊字符（如 `@`, `#`, `$`, `&` 等），需要进行 URL 编码:

| 字符 | 编码 |
|------|------|
| `@`  | `%40` |
| `#`  | `%23` |
| `$`  | `%24` |
| `&`  | `%26` |
| `=`  | `%3D` |
| `+`  | `%2B` |
| ` `  | `%20` |

**示例**:
- 原密码: `Pass@123#`
- 编码后: `Pass%40123%23`
- 连接字符串: `postgresql://postgres:Pass%40123%23@db...`

---

## ❓ 常见问题

### Q: 提示 "Invalid database password"
**A**: 
1. 检查密码是否正确
2. 特殊字符是否已 URL 编码
3. 尝试重置密码: Settings → Database → "Reset database password"

### Q: 数据库 push 失败
**A**:
```bash
# 先检查连接
npm run db:studio

# 如果能打开，说明连接正常，再试
npm run db:push --force
```

### Q: 项目 REF 在哪里找？
**A**: 在 Supabase 项目 URL 中，例如:
- URL: `https://abcdefghijk.supabase.co`
- REF: `abcdefghijk`

---

## 🆘 需要帮助？

如果遇到问题:
1. 检查 Supabase Dashboard 项目状态是否为 "Active"
2. 测试网络连接: `ping db.你的REF.supabase.co`
3. 查看错误日志: 终端中的完整错误信息

---

**完成后，你就可以正常使用所有功能了！** 🎉
