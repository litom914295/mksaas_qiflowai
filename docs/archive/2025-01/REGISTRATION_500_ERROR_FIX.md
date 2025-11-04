# 注册 500 错误修复指南

## 问题症状
用户注册时显示 **错误代码 500**，表示服务器内部错误。

## 已完成的修复 ✅

### 1. 改进错误日志
我已经更新了所有注册钩子的错误处理，现在会显示详细的错误信息：

**修改的文件：**
- ✅ `src/lib/auth.ts` - 添加了详细的错误日志

**新的日志格式：**
```typescript
// 成功的操作会显示
✅ Added register gift credits for user xxx
✅ Added Free monthly credits for user xxx
✅ QiFlow profiles initialized for user xxx

// 失败的操作会显示详细信息
❌ Register gift credits error: {
  userId: 'xxx',
  error: '具体错误信息',
  stack: '错误堆栈...'
}
```

### 2. 防止钩子错误影响注册
已修改 `databaseHooks` 配置，即使某些钩子失败，也不会阻止用户注册成功：

```typescript
databaseHooks: {
  user: {
    create: {
      after: async (user) => {
        try {
          await onCreateUser(user);
        } catch (error) {
          // 记录错误但不影响注册流程
          console.error('❌ onCreateUser hook failed:', {...});
          // 不抛出错误，允许注册继续
        }
      },
    },
  },
}
```

## 诊断步骤

### 步骤 1：运行数据库测试脚本

我已创建了一个测试脚本，用于检查数据库连接和表结构：

```bash
npx tsx scripts/test-db-registration.ts
```

**这个脚本会检查：**
1. ✅ 数据库连接是否正常
2. ✅ `user` 表是否存在
3. ✅ `userCredit` 表是否存在
4. ✅ `creditTransaction` 表是否存在
5. ✅ 数据库写入权限是否正常

### 步骤 2：查看详细的注册错误日志

1. **启动开发服务器：**
   ```bash
   npm run dev
   ```

2. **尝试注册新用户**

3. **查看终端输出，寻找错误标记：**
   - 🔍 查找 `❌` 符号，表示某个步骤失败
   - 📝 记录完整的错误信息和堆栈跟踪

### 步骤 3：根据错误类型修复

#### 错误类型 A：数据库连接失败

**错误示例：**
```
❌ onCreateUser hook failed: {
  error: 'getaddrinfo ENOTFOUND xxx.supabase.co'
}
```

**解决方案：**
1. 检查 `.env` 文件中的 `DATABASE_URL`
2. 从 Supabase 获取正确的连接字符串
3. 确保网络可以访问 Supabase

#### 错误类型 B：表不存在

**错误示例：**
```
❌ Register gift credits error: {
  error: 'relation "user_credit" does not exist'
}
```

**解决方案：**
```bash
# 同步数据库 schema
npm run db:push
```

#### 错误类型 C：权限不足

**错误示例：**
```
❌ onCreateUser hook failed: {
  error: 'permission denied for table user_credit'
}
```

**解决方案：**
1. 检查数据库用户权限
2. 在 Supabase Dashboard 中确认用户有写入权限

#### 错误类型 D：QiFlow 表不存在

**错误示例：**
```
❌ QiFlow profile initialization error: {
  error: 'relation "bazi_calculations" does not exist'
}
```

**解决方案：**
```bash
# 确保所有表都已创建
npm run db:push

# 检查 schema 文件
# 确认 src/db/schema.ts 包含所有 QiFlow 表定义
```

## 常见问题排查

### Q1: 注册成功但没有获得积分

**检查步骤：**
1. 查看终端日志，确认是否有 `✅ Added register gift credits` 消息
2. 如果有错误，根据错误类型修复
3. 运行数据库检查：
   ```bash
   npm run db:studio
   # 查看 user_credit 表
   ```

### Q2: QiFlow 档案初始化失败

**症状：** 看到 `❌ QiFlow profile initialization error`

**解决方案：**
1. 确保以下表存在：
   - `bazi_calculations`
   - `fengshui_analysis`
   - `pdf_audit`
   - `copyright_audit`

2. 运行：
   ```bash
   npm run db:push
   ```

### Q3: 仍然显示 500 错误但没有详细日志

**可能原因：** 错误发生在钩子之前（数据库连接失败）

**解决方案：**
1. 检查 `.env` 文件中的环境变量：
   ```bash
   DATABASE_URL="postgresql://..."
   BETTER_AUTH_SECRET="..."
   ```

2. 测试数据库连接：
   ```bash
   npx tsx scripts/test-db-registration.ts
   ```

## 完整的修复流程

### 1. 测试数据库
```bash
npx tsx scripts/test-db-registration.ts
```

### 2. 如果数据库测试失败

**检查数据库连接字符串：**
```bash
# 查看 .env 文件
cat .env | grep DATABASE_URL

# 正确格式示例：
DATABASE_URL="postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres"
```

**同步数据库 schema：**
```bash
npm run db:push
```

### 3. 重启开发服务器
```bash
# 停止当前服务器 (Ctrl+C)
npm run dev
```

### 4. 测试注册
1. 清除浏览器缓存和 cookies
2. 打开注册页面
3. 填写注册信息并提交
4. **同时查看：**
   - 浏览器控制台（用户端错误）
   - 终端输出（服务器端日志）

### 5. 分析日志

**成功的注册日志应该显示：**
```
✅ Added register gift credits for user xxx
✅ Added Free monthly credits for user xxx
✅ QiFlow profiles initialized for user xxx
```

**如果有失败：**
```
❌ Register gift credits error: {
  userId: 'xxx',
  error: 'relation "user_credit" does not exist',
  stack: '...'
}
```
根据错误信息采取相应的修复措施。

## 环境变量检查清单

确保 `.env` 文件包含所有必需的变量：

```bash
# 必需
DATABASE_URL="postgresql://..."          # ✅ 数据库连接
BETTER_AUTH_SECRET="..."                 # ✅ 认证密钥
NEXT_PUBLIC_BASE_URL="http://localhost:3000"  # ✅ 基础 URL

# 可选（取决于功能）
GITHUB_CLIENT_ID="..."                   # OAuth
GITHUB_CLIENT_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
RESEND_API_KEY="..."                     # 邮件服务
```

## 数据库表检查清单

使用 `npm run db:studio` 检查以下表是否存在：

**核心表：**
- [x] `user` - 用户表
- [x] `session` - 会话表
- [x] `account` - 账户表

**积分系统表：**
- [x] `user_credit` - 用户积分余额
- [x] `credit_transaction` - 积分交易记录

**QiFlow 表：**
- [x] `bazi_calculations` - 八字计算
- [x] `fengshui_analysis` - 风水分析
- [x] `pdf_audit` - PDF 审计
- [x] `copyright_audit` - 版权审计

## 预防措施

### 1. 添加健康检查 API

创建 `src/app/api/health/route.ts`：

```typescript
import { getDb } from '@/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const db = await getDb()
    // 简单查询测试连接
    await db.execute('SELECT 1')
    
    return NextResponse.json({ 
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 503 })
  }
}
```

访问 `http://localhost:3000/api/health` 检查系统状态。

### 2. 添加数据库连接验证

在 `src/db/index.ts` 中添加：

```typescript
if (!process.env.DATABASE_URL) {
  throw new Error('❌ DATABASE_URL environment variable is not set')
}

if (!process.env.DATABASE_URL.includes('supabase.co') && 
    !process.env.DATABASE_URL.includes('localhost')) {
  console.warn('⚠️ DATABASE_URL format may be incorrect. Please verify.')
}
```

## 成功标志

完成所有修复后，注册成功应该显示：

**浏览器端：**
- ✅ 显示"请检查邮箱验证"消息
- ✅ 没有错误提示

**服务器端日志：**
```
✅ Added register gift credits for user [userId]
✅ Added Free monthly credits for user [userId]
✅ QiFlow profiles initialized for user [userId]
```

**数据库：**
- ✅ `user` 表中有新用户记录
- ✅ `user_credit` 表中该用户有 100 积分
- ✅ `credit_transaction` 表中有积分赠送记录

## 相关文件

- ✅ `src/lib/auth.ts` - 认证配置和注册钩子（已修复）
- ✅ `src/components/auth/register-form.tsx` - 注册表单（已修复）
- ✅ `scripts/test-db-registration.ts` - 数据库测试脚本（新建）
- `src/lib/auth-qiflow.ts` - QiFlow 用户初始化
- `src/credits/credits.ts` - 积分系统
- `src/db/schema.ts` - 数据库 schema

---

**修复时间：** 2025-10-03  
**修复人员：** AI Assistant

如果问题仍然存在，请提供：
1. `npx tsx scripts/test-db-registration.ts` 的完整输出
2. 注册时终端的完整错误日志（包括 ❌ 标记的部分）
3. 浏览器控制台的错误信息




