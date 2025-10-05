# 注册错误修复指南

## 问题症状
用户注册时出现错误：`register, error: {}`

## 根本原因

### 1. 数据库连接问题（主要原因）
从 `npm run db:push` 输出可以看到：
```
Error: getaddrinfo ENOTFOUND sibwcdadrsbfkblinezj.supabase.copostgresql
```

数据库主机名格式不正确。正确的格式应该是：
```
sibwcdadrsbfkblinezj.supabase.co
```

但实际连接字符串可能变成了：
```
sibwcdadrsbfkblinezj.supabase.copostgresql
```

### 2. 错误处理不健壮
注册表单的错误处理代码假设 `ctx.error` 有固定的结构，但实际上可能是空对象。

## 修复步骤

### ✅ 步骤 1：修复错误处理（已完成）
已修改 `src/components/auth/register-form.tsx` 中的错误处理逻辑，使其能够：
- 处理空对象错误
- 处理字符串错误
- 处理不同格式的错误对象
- 提供默认错误信息

### ⚠️ 步骤 2：检查并修复数据库连接（需要手动操作）

#### 2.1 检查 `.env` 文件
打开项目根目录的 `.env` 文件，查找 `DATABASE_URL` 配置：

```bash
# 错误的配置示例（可能的问题）
DATABASE_URL="postgresql://user:pass@sibwcdadrsbfkblinezj.supabase.copostgresql:5432/db"

# 正确的配置示例
DATABASE_URL="postgresql://user:pass@sibwcdadrsbfkblinezj.supabase.co:5432/db"
```

#### 2.2 从 Supabase 获取正确的连接字符串
1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** → **Database**
4. 在 **Connection string** 部分找到 **URI** 格式的连接字符串
5. 选择 **Pooling** 模式（推荐）或 **Direct connection**
6. 复制连接字符串并替换 `.env` 文件中的 `DATABASE_URL`

#### 2.3 正确的连接字符串格式
```bash
# Pooling 模式（推荐，用于 Serverless）
DATABASE_URL="postgresql://postgres.sibwcdadrsbfkblinezj:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"

# 或 Direct connection 模式
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.sibwcdadrsbfkblinezj.supabase.co:5432/postgres"
```

**注意事项：**
- 将 `[YOUR-PASSWORD]` 替换为实际密码
- 如果密码包含特殊字符，需要进行 URL 编码
- Pooling 模式使用端口 6543
- Direct connection 使用端口 5432

### 步骤 3：同步数据库 Schema

修复连接字符串后，运行以下命令：

```bash
# 方式 1：推送 schema 到数据库（开发环境推荐）
npm run db:push

# 或方式 2：生成并应用迁移（生产环境推荐）
npm run db:generate
npm run db:migrate
```

### 步骤 4：验证数据库表

运行以下命令检查数据库状态：

```bash
# 打开 Drizzle Studio 可视化查看数据库
npm run db:studio
```

确保以下表存在：
- ✅ `user` - 用户表
- ✅ `user_credit` - 用户积分余额表
- ✅ `credit_transaction` - 积分交易记录表
- ✅ `bazi_calculations` - 八字计算记录表
- ✅ `fengshui_analysis` - 风水分析记录表
- ✅ `pdf_audit` - PDF 审计表
- ✅ `copyright_audit` - 版权审计表

### 步骤 5：重启开发服务器

```bash
# 停止当前服务器（Ctrl+C）
# 然后重新启动
npm run dev
```

### 步骤 6：测试注册功能

1. 清除浏览器缓存和 cookies
2. 打开注册页面
3. 填写注册信息：
   - 姓名：测试用户
   - 邮箱：test@example.com
   - 密码：至少 8 位
4. 提交注册

**预期结果：**
- ✅ 注册成功
- ✅ 用户自动获得 100 积分
- ✅ 显示"请检查邮箱验证"的提示
- ✅ 控制台无错误日志

## 常见问题排查

### 问题 1：仍然提示 `register, error: {}`

**可能原因：**
- 数据库连接字符串仍然不正确
- 网络无法连接到 Supabase
- 数据库表未创建

**解决方案：**
```bash
# 1. 测试数据库连接
npm run db:studio

# 2. 如果连接成功但表不存在，推送 schema
npm run db:push

# 3. 检查后台日志
# 查看终端中 Next.js 服务器的完整错误信息
```

### 问题 2：密码包含特殊字符导致连接失败

**症状：** 数据库连接字符串中的密码包含 `@`, `#`, `:` 等特殊字符

**解决方案：** 对密码进行 URL 编码
```javascript
// 使用 Node.js 编码密码
const password = 'my@pass#word';
const encoded = encodeURIComponent(password);
console.log(encoded); // my%40pass%23word

// 在连接字符串中使用编码后的密码
DATABASE_URL="postgresql://postgres:my%40pass%23word@db.xxx.supabase.co:5432/postgres"
```

### 问题 3：注册成功但没有获得积分

**检查步骤：**
1. 确认积分系统已启用（`src/config/website.tsx`）：
   ```typescript
   credits: {
     enableCredits: true,
     registerGiftCredits: {
       enable: true,
       amount: 100,
     }
   }
   ```

2. 检查用户积分：
   ```bash
   npm run db:studio
   # 查看 user_credit 表
   ```

3. 检查后台日志是否有积分相关错误

### 问题 4：QiFlow 档案初始化失败

**症状：** 控制台显示 "Failed to initialize QiFlow profiles"

**解决方案：**
1. 确保所有 QiFlow 相关表已创建
2. 检查 `src/lib/auth-qiflow.ts` 中的表名与 schema 一致
3. 重新推送 schema：`npm run db:push`

## 验证检查清单

完成所有修复后，请确认：

- [ ] `.env` 文件中的 `DATABASE_URL` 格式正确
- [ ] 数据库连接成功（`npm run db:studio` 可以打开）
- [ ] 所有必需的表都已创建
- [ ] 开发服务器已重启
- [ ] 注册功能正常工作
- [ ] 新用户可以获得 100 积分
- [ ] 控制台没有错误日志

## 预防措施

### 1. 使用环境变量验证
在 `src/db/index.ts` 中添加连接验证：

```typescript
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

if (!process.env.DATABASE_URL.includes('supabase.co')) {
  console.warn('⚠️ DATABASE_URL format may be incorrect. Please verify.');
}
```

### 2. 添加数据库健康检查
创建 API 端点 `/api/health/db` 检查数据库连接状态

### 3. 改进错误日志
在 `onCreateUser` 钩子中添加更详细的日志：

```typescript
try {
  await addRegisterGiftCredits(user.id);
  console.log(`✅ Added register gift credits for user ${user.id}`);
} catch (error) {
  console.error('❌ Register gift credits error:', {
    userId: user.id,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined
  });
}
```

## 相关文件

- ✅ `src/components/auth/register-form.tsx` - 注册表单（已修复）
- ⚠️ `.env` - 环境变量配置（需要检查）
- `src/lib/auth.ts` - 认证配置和 `onCreateUser` 钩子
- `src/lib/auth-qiflow.ts` - QiFlow 用户初始化
- `src/credits/credits.ts` - 积分系统逻辑
- `src/db/schema.ts` - 数据库 schema 定义
- `drizzle.config.ts` - Drizzle ORM 配置

---

**修复时间：** 2025-10-03  
**修复人员：** AI Assistant

如果问题仍然存在，请提供：
1. 完整的数据库连接错误信息
2. `.env` 文件中 `DATABASE_URL` 的格式（隐藏密码）
3. `npm run db:studio` 的输出结果




