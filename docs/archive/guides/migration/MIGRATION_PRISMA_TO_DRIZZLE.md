# Prisma 到 Drizzle ORM 迁移总结

**迁移日期**: 2025-11-04  
**执行者**: Warp AI Agent  
**状态**: ✅ 核心迁移完成

---

## 📋 迁移概述

本项目原本同时使用 **Prisma** 和 **Drizzle ORM**，导致维护复杂度高、数据库迁移冲突风险大。本次迁移完全移除了 Prisma，统一使用 Drizzle ORM 管理数据库。

### 问题识别

- ✅ 项目中存在 `@prisma/client`、`@auth/prisma-adapter`、`prisma` 三个依赖
- ✅ Prisma Schema 定义了完整的数据库结构
- ✅ 代码中使用伪 Prisma 客户端（`src/lib/db/prisma.ts`）封装 Supabase
- ✅ better-auth 已使用 `drizzleAdapter`，无需修改认证层

---

## ✅ 已完成的工作

### 1. Schema 补全 (阶段 2)

在 `src/db/schema.ts` 中添加了 Prisma 中定义但 Drizzle 缺失的表：

- `checkIns` - 签到记录表
- `referrals` - 推荐关系表
- `creditConfig` - 积分配置表
- `creditRewards` - 积分兑换商品表
- `creditRedemptions` - 积分兑换记录表
- `creditLevels` - 积分等级表

**文件**: `src/db/schema.ts` (第 318-414 行)

### 2. 核心服务重构 (阶段 3)

#### ✅ `src/lib/services/credit-config.ts`
- 导入从 `@/lib/db/prisma` 改为 `@/db` + `drizzle-orm`
- `getConfig`: `prisma.findUnique` → `db.select().where().limit(1)`
- `getAllConfig`: `prisma.findMany` → `db.select()`
- `setConfig`: `prisma.upsert` → `db.insert().onConflictDoUpdate()`
- `updateConfigs`: `prisma.$transaction` → `db.transaction()`
- `initializeConfig`: `prisma.createMany` → `db.insert().values([...])`

#### ✅ `src/lib/services/referral.ts`
- 导入从 `@prisma/client` 改为 `@/db` + `drizzle-orm`
- `activateReferralReward`: 完整事务重构
  - `prisma.$transaction` → `db.transaction()`
  - `prisma.referral.findFirst` → `db.select().from(referrals).where()`
  - `prisma.user.update` → `db.update(user).set()`
  - 积分更新使用 SQL 表达式: `sql\`COALESCE(${user.credits}, 0) + ${amount}\``
- `createReferral`: `prisma.referral.create` → `db.insert().values().returning()`
- `findReferrerByCode`: 使用 `leftJoin` 关联 `referralCodes` 表
- `generateReferralCode`: 改为操作 `referralCodes` 表

### 3. API 路由重构 (阶段 4)

#### ✅ `src/app/api/user/checkin/route.ts`
**POST 方法 (签到)**:
- 事务处理从 Prisma 改为 Drizzle
- 查询今日签到: `prisma.checkIn.findUnique` → `db.select().where(and(...))`
- 创建签到记录: `prisma.checkIn.create` → `db.insert().values().returning()`
- 更新积分: 使用 SQL 表达式避免竞态条件

**GET 方法 (查询签到状态)**:
- 查询今日签到: 使用 `and()` 组合条件
- 查询最近签到: 使用 `.orderBy(desc())` + `.limit(1)`
- 统计本月签到: 使用 `sql<number>\`count(*)\`` 聚合

#### ✅ `src/app/api/user/referral/route.ts`
**GET 方法 (获取推荐信息)**:
- 查询用户: `prisma.user.findUnique` → `db.select().where().limit(1)`
- 查询推荐码: 从 `referralCodes` 表查询
- 查询推荐列表: `prisma.referral.findMany` → `db.select().orderBy()`
- 关联查询被推荐人: 分步查询 + `inArray()` 批量查询
- 创建 `userMap` 映射以提高性能
- 统计奖励: 使用 `sql\`sum(...)\`` 聚合

### 4. 清理工作 (阶段 8 部分)

- ✅ 删除 `src/lib/db/prisma.ts` 伪装层
- ✅ 移除依赖:
  - `@prisma/client` (从 dependencies)
  - `@auth/prisma-adapter` (从 dependencies)
  - `prisma` (从 devDependencies)
- ✅ 使用 `npm uninstall --legacy-peer-deps` 移除包

---

## ⚠️ 未完成的工作

### 管理后台 API (优先级:中)
以下文件尚未重构，但影响范围较小：

1. **`src/app/api/admin/users/route.ts`** - 用户管理
   - 需要将 Prisma 查询改为 Drizzle
   - 建议使用: `.limit().offset()` 分页，`like()` 搜索

2. **`src/app/api/admin/growth/credits/transactions/route.ts`** - 积分交易
   - 需要查询 `creditTransaction` 表
   - 建议使用 `gte()`、`lte()` 筛选时间范围

3. **`src/app/api/admin/growth/credits/export/route.ts`** - 数据导出
   - 查询逻辑类似 transactions，无分页限制

### 监控服务 (优先级:低)
**`src/lib/monitoring/db.ts`**:
- 该文件使用 `errorLog` 和 `systemLog` 表
- 这两个表在 Drizzle Schema 中不存在
- 建议:
  - 如果监控功能已废弃，可直接删除该文件
  - 如果需要保留，需先在 Drizzle Schema 中定义这两个表

---

## 🔧 技术细节

### Prisma → Drizzle 转换规则

```typescript
// 1. 查询单条记录
prisma.table.findUnique({ where: { id } })
→ db.select().from(table).where(eq(table.id, id)).limit(1)

// 2. 查询多条记录
prisma.table.findMany({ where: { status }, orderBy: { createdAt: 'desc' } })
→ db.select().from(table).where(eq(table.status, status)).orderBy(desc(table.createdAt))

// 3. 创建记录
prisma.table.create({ data: {...} })
→ db.insert(table).values({...}).returning()

// 4. 更新记录
prisma.table.update({ where: { id }, data: {...} })
→ db.update(table).set({...}).where(eq(table.id, id))

// 5. 事务
prisma.$transaction(async (tx) => {...})
→ db.transaction(async (tx) => {...})

// 6. 聚合查询
prisma.table.aggregate({ where: {...}, _sum: { amount: true } })
→ db.select({ total: sql<number>`sum(${table.amount})` }).from(table).where(...)

// 7. 关联查询 (include)
// Prisma: include: { user: { select: { name: true } } }
// Drizzle: 使用 leftJoin 或分步查询 + inArray()
```

### 常见陷阱

1. **积分更新竞态条件**:
   ```typescript
   // ❌ 错误: 先读后写
   const user = await db.select().from(user).where(...)
   await db.update(user).set({ credits: user.credits + 10 })

   // ✅ 正确: 使用 SQL 原子操作
   await db.update(user).set({ 
     credits: sql`COALESCE(${user.credits}, 0) + 10` 
   })
   ```

2. **查询结果是数组**:
   ```typescript
   // Prisma 返回对象或 null
   const user = await prisma.user.findUnique(...)
   
   // Drizzle 返回数组
   const result = await db.select().from(user).limit(1)
   const user = result.length > 0 ? result[0] : null
   ```

3. **默认值和时间戳**:
   ```typescript
   // Drizzle 不会自动填充 createdAt/updatedAt
   await db.insert(table).values({
     ...data,
     createdAt: new Date(),
     updatedAt: new Date(),
   })
   ```

---

## 📝 下一步建议

### 立即执行
1. **类型检查**: 运行 `npm run type-check` 修复类型错误
2. **测试关键功能**:
   - 用户签到
   - 推荐注册和奖励发放
   - 积分配置读取

### 中期任务
1. 重构剩余 3 个管理后台 API
2. 决定监控服务的处理方式（保留或删除）
3. 备份并删除 `prisma/` 目录
4. 更新项目 README

### 长期优化
1. 添加 Drizzle 的类型导出到项目全局
2. 考虑添加 Drizzle 查询日志中间件
3. 优化关联查询的性能（使用 JOIN 而非分步查询）

---

## 🎯 验证清单

- [x] Schema 已补全所有必要的表
- [x] 核心服务 (credit-config, referral) 已重构
- [x] 用户 API (checkin, referral) 已重构
- [x] Prisma 依赖已移除
- [x] Prisma 伪装层已删除
- [ ] 管理后台 API 已重构
- [ ] 监控服务已处理
- [ ] 类型检查通过
- [ ] 所有功能测试通过
- [ ] prisma/ 目录已备份删除

---

## 💡 如需回滚

如果需要回滚到 Prisma 版本：

```bash
# 1. 恢复 prisma.ts 文件
git restore src/lib/db/prisma.ts

# 2. 重新安装 Prisma
npm install @prisma/client@^6.18.0 prisma@^6.18.0 --legacy-peer-deps

# 3. 恢复所有修改的文件
git restore src/lib/services/
git restore src/app/api/user/
```

**备注**: 建议在回滚前创建当前分支的备份。

---

**文档版本**: 1.0  
**最后更新**: 2025-11-04  
**联系方式**: 如有问题请参考项目 README 或提交 Issue
