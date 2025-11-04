# mksaas 模板对照检查报告

生成时间: 2025-10-31 16:05:38

## ⚠️ 关键差异需要修复

### 1. auth.ts 配置问题

**问题 1: 邮箱验证被禁用**
- 模板: equireEmailVerification: true
- 你的项目: equireEmailVerification: false
- 影响: 用户无需验证邮箱即可登录，可能导致垃圾注册
- 建议: 改回 	rue

**问题 2: 自定义密码验证函数**
- 你的项目添加了自定义 erifyPassword 函数使用 bcrypt
- 模板没有这个
- 影响: Better Auth 默认已经处理密码哈希，自定义可能导致问题
- 建议: **删除此自定义函数**，Better Auth 会自动处理

**问题 3: 使用了自定义 schema 映射**
- 你的项目: schema: mappedSchema
- 模板: 没有 schema 参数
- 影响: 增加了不必要的复杂性
- 建议: **移除 schema: mappedSchema，让 Better Auth 使用默认映射**

### 2. schema.ts 数据库结构问题

**问题 1: payment 表缺少字段**
缺少以下字段:
- scene - 支付场景 ('lifetime', 'credit', 'subscription')
- invoiceId - 发票 ID (unique, 防止重复处理)
- paid - 是否已支付 (boolean, default false)

这些字段对支付流程很重要！

**问题 2: user 表多了 password 字段**
- 你的项目: 有 password 字段
- 模板: **没有** password 字段
- 注意: Better Auth 的密码存储在 ccount 表，不是 user 表
- 建议: 可以保留（不影响功能），但不是必需的

## ✅ 正确的部分

1. ccount.password 字段存在 ✅
2. erification.token 已修复 ✅  
3. Social providers 配置更安全 ✅
4. QiFlow 自定义功能（referral, share, task, achievements 表）✅

## 📋 修复优先级

### P0 - 立即修复
1. 移除 auth.ts 中的自定义 erifyPassword 函数
2. 移除 auth.ts 中的 schema: mappedSchema 参数
3. 添加 payment 表缺失的 3 个字段

### P1 - 建议修复
1. 将 equireEmailVerification 改回 	rue
2. 移除 user.password 字段（可选，不影响功能）
3. 删除不需要的 uth-schema-mapper.ts 文件

## 🔧 具体修复步骤

见下一个消息...
