# 认证问题解决方案

## 问题描述
使用 admin@mksaas.com 登录管理后台时出现错误：
- PostgreSQL 报错: "Tenant or user not found"
- Better Auth 无法正常连接到数据库

## 问题原因
1. Supabase 数据库使用了特殊的连接模式（Transaction Mode Pooler）
2. Better Auth 与 Supabase 的集成存在兼容性问题
3. 数据库表结构列名格式不一致（驼峰 vs 下划线）

## 解决步骤

### 1. 创建管理员账户 ✅
```bash
# 在 Supabase Auth 中创建管理员
npx tsx scripts/test-supabase.ts

# 结果: 管理员用户创建成功
# ID: 5d7b9abc-78d6-4513-b397-60c2ffeb175b
# Email: admin@mksaas.com
# Password: admin123456
```

### 2. 同步到数据库表 ✅
```bash
# 插入管理员到 user 表
npx tsx scripts/insert-admin.ts
```

### 3. 使用 Supabase Auth 登录 ✅
创建了备用登录API：`/api/auth-fallback/login`
- 可以成功使用 admin@mksaas.com 登录
- Session 正常创建

## 临时解决方案

### 方案 1：使用 Supabase Auth（推荐）
- 已创建 `/src/lib/auth-supabase-fallback.ts`
- 已创建 `/api/auth-fallback/login` API
- 管理员账户可以正常登录

### 方案 2：修复 Better Auth 连接
需要在 Supabase Dashboard 中：
1. 访问 https://supabase.com/dashboard/project/sibwcdadrsbfkblinezj/sql/new
2. 执行 `scripts/init-better-auth-tables.sql`
3. 配置正确的数据库连接字符串

## 登录凭据
- **邮箱**: admin@mksaas.com
- **密码**: admin123456
- **登录地址**: http://localhost:3000/zh-CN/auth/login

## 后续建议
1. **短期**: 使用 Supabase Auth 作为主要认证系统
2. **长期**: 考虑以下选项之一：
   - 完全迁移到 Supabase Auth
   - 修复 Better Auth 与 Supabase 的兼容性问题
   - 使用其他数据库服务（如 Neon）

## 相关文件
- `/scripts/test-supabase.ts` - 测试 Supabase 连接
- `/scripts/insert-admin.ts` - 插入管理员用户
- `/scripts/test-login.ts` - 测试登录功能
- `/src/lib/auth-supabase-fallback.ts` - Supabase Auth 封装
- `/src/app/api/auth-fallback/login/route.ts` - 备用登录 API