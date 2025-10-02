# Supabase 配置和使用指南

> QiFlow AI v5.1.1  
> 最后更新：2025-09-27

## 🎯 已配置的Supabase信息

### 项目信息
- **项目URL**: https://sibwcdadrsbfkblinezj.supabase.co
- **项目ID**: sibwcdadrsbfkblinezj
- **数据库连接**: postgresql://postgres:Sd@721204@db.sibwcdadrsbfkblinezj.supabase.co:5432/postgres

### API密钥
- **Anon Key** (公开密钥): 已配置在 `.env.production`
- **Service Role Key** (服务端密钥): 已配置在 `.env.production`

## 📊 数据库初始化

### 方法1：使用Supabase SQL编辑器（推荐）

1. 登录Supabase Dashboard: https://app.supabase.com
2. 选择您的项目 (sibwcdadrsbfkblinezj)
3. 进入 SQL Editor
4. 新建查询，粘贴 `mksaas/scripts/supabase-init.sql` 的内容
5. 点击 "Run" 执行

### 方法2：使用命令行

```bash
# 使用psql连接数据库
psql "postgresql://postgres:Sd@721204@db.sibwcdadrsbfkblinezj.supabase.co:5432/postgres"

# 执行初始化脚本
\i mksaas/scripts/supabase-init.sql
```

### 方法3：使用Supabase CLI

```bash
# 安装Supabase CLI
npm install -g supabase

# 链接项目
supabase link --project-ref sibwcdadrsbfkblinezj

# 执行迁移
supabase db push mksaas/scripts/supabase-init.sql
```

## 🔐 安全配置

### 1. 行级安全（RLS）已启用

数据库已配置RLS策略，确保：
- 用户只能访问自己的数据
- 敏感日志对用户不可见
- 数据隔离和隐私保护

### 2. 认证配置

在Supabase Dashboard中配置认证：

1. 进入 Authentication > Providers
2. 启用需要的认证方式：
   - Email/Password ✅ (推荐)
   - Magic Link
   - OAuth (Google, GitHub等)

3. 配置认证设置：
```sql
-- 在SQL编辑器中运行
UPDATE auth.config
SET 
  site_url = 'https://qiflow.ai',
  jwt_exp = 3600,
  enable_signup = true,
  enable_confirmations = true;
```

## 📋 数据库表结构

### 核心表清单

1. **users** - 用户信息和积分系统
2. **bazi_records** - 八字分析记录
3. **xuankong_records** - 玄空风水记录
4. **ai_sessions** - AI对话会话
5. **ai_messages** - AI对话消息
6. **credits_transactions** - 积分交易记录
7. **audit_logs** - 审计日志（GDPR合规）
8. **sensitive_word_logs** - 敏感词检测日志
9. **pdf_exports** - PDF导出记录
10. **system_config** - 系统配置
11. **auth.users** - Supabase认证用户（系统表）

## 🚀 客户端集成

### 1. 安装Supabase客户端

```bash
npm install @supabase/supabase-js
```

### 2. 创建客户端实例

```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})
```

### 3. 服务端客户端（使用Service Role Key）

```typescript
// lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
```

## 📝 常用操作示例

### 用户认证

```typescript
// 注册
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
})

// 登录
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// 登出
await supabase.auth.signOut()
```

### 数据操作

```typescript
// 查询用户信息
const { data: user } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single()

// 创建八字记录
const { data, error } = await supabase
  .from('bazi_records')
  .insert({
    user_id: userId,
    birth_year: 1990,
    birth_month: 5,
    birth_day: 15,
    birth_hour: 14,
    gender: 'male'
  })

// 扣除积分（调用存储过程）
const { data, error } = await supabase
  .rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: 10,
    p_type: 'spend',
    p_description: '八字分析',
    p_reference_type: 'bazi',
    p_reference_id: recordId
  })
```

### 实时订阅

```typescript
// 监听积分变化
const subscription = supabase
  .channel('credits')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'users',
      filter: `id=eq.${userId}`
    },
    (payload) => {
      console.log('积分更新:', payload.new.credits_balance)
    }
  )
  .subscribe()
```

## 🔧 维护和监控

### 1. 数据库备份

Supabase自动提供：
- 每日自动备份（保留7天）
- Point-in-time恢复（Pro计划）

手动备份：
```bash
pg_dump "postgresql://postgres:Sd@721204@db.sibwcdadrsbfkblinezj.supabase.co:5432/postgres" > backup.sql
```

### 2. 性能监控

在Supabase Dashboard查看：
- Database > Performance
- 查看慢查询
- 监控连接数
- 检查索引使用情况

### 3. 存储使用

- 免费计划：500MB数据库 + 1GB文件存储
- 监控路径：Settings > Billing & Usage

## ⚠️ 注意事项

1. **密码安全**
   - 数据库密码包含特殊字符 `@`，在某些工具中可能需要URL编码
   - 编码后：`Sd%40721204`

2. **连接池**
   - Supabase连接池模式端口：6543
   - 直接连接端口：5432（当前配置）
   - 生产环境建议使用连接池

3. **速率限制**
   - 免费计划：每秒最多60个请求
   - 使用熔断器和限流机制保护

4. **SSL连接**
   - 生产环境必须启用SSL
   - 已在环境变量中配置 `DATABASE_SSL=true`

## 📞 支持资源

- Supabase文档：https://supabase.com/docs
- 状态页面：https://status.supabase.com
- Discord社区：https://discord.supabase.com
- GitHub Issues：https://github.com/supabase/supabase/issues

## ✅ 配置检查清单

- [x] 环境变量已配置
- [x] 数据库URL已设置
- [x] Anon Key已配置
- [x] Service Role Key已配置
- [x] 数据库初始化脚本已准备
- [ ] 执行数据库初始化
- [ ] 配置认证提供商
- [ ] 测试数据库连接
- [ ] 验证RLS策略
- [ ] 配置备份策略

---

**下一步操作**：
1. 在Supabase Dashboard执行初始化脚本
2. 配置认证提供商
3. 测试数据库连接
4. 开始使用API进行开发