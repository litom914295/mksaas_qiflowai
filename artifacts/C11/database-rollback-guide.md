# 数据库迁移回滚指南

**文档版本**: 1.0  
**创建日期**: 2025-10-02  
**适用范围**: QiFlow数据库迁移回滚

---

## 📋 目录

1. [回滚概述](#回滚概述)
2. [迁移历史](#迁移历史)
3. [回滚方法](#回滚方法)
4. [回滚SQL脚本](#回滚sql脚本)
5. [风险评估](#风险评估)
6. [应急流程](#应急流程)
7. [验证步骤](#验证步骤)

---

## 回滚概述

### 当前迁移状态
- **最新迁移**: `0004_stale_blizzard.sql`
- **QiFlow表**: 4张 (bazi_calculations, fengshui_analysis, pdf_audit, copyright_audit)
- **数据库**: PostgreSQL (Supabase)

### 回滚触发场景
- 生产环境出现严重数据问题
- 迁移脚本执行失败需要回退
- 发现设计缺陷需要重新设计
- 性能问题严重影响系统稳定性

---

## 迁移历史

### 迁移时间线
```
0000_fine_sir_ram.sql       → 基础schema
0001_woozy_jigsaw.sql       → 扩展1
0002_left_grandmaster.sql   → 扩展2
0003_loving_risque.sql      → 扩展3
0004_stale_blizzard.sql     → QiFlow表 ✨ (当前)
```

### 迁移0004内容
- ✅ 创建 `bazi_calculations` 表
- ✅ 创建 `fengshui_analysis` 表
- ✅ 创建 `pdf_audit` 表
- ✅ 创建 `copyright_audit` 表
- ✅ 添加外键约束 (user_id → user.id)
- ✅ 创建8个索引 (user_id, created_at)

---

## 回滚方法

### 方法1: Drizzle Kit Drop (推荐)
**适用场景**: 迁移刚执行，需要完全撤销

```bash
# 1. 检查当前迁移状态
npm run db:studio

# 2. 生成回滚迁移（如果drizzle支持）
npx drizzle-kit drop

# 3. 手动回滚（如果drop不支持）
# 使用方法2的SQL脚本
```

**优点**: 
- 官方推荐方式
- 保持迁移历史完整

**缺点**:
- Drizzle Kit可能不支持自动回滚
- 需要手动编写回滚SQL

### 方法2: 手动SQL回滚 (最可靠)
**适用场景**: 生产环境精确控制

```bash
# 1. 连接到数据库
psql $DATABASE_URL

# 2. 执行回滚SQL脚本
\i artifacts/C11/rollback-0004.sql

# 3. 验证回滚结果
\dt
```

**优点**:
- 完全可控
- 可以分步执行
- 易于审查

**缺点**:
- 需要手动维护回滚脚本
- 人为操作风险

### 方法3: 数据库备份恢复 (最安全)
**适用场景**: 数据损坏严重或回滚失败

```bash
# 前提：迁移前已创建备份
# 1. 停止应用服务
# 2. 恢复数据库备份
pg_restore -d postgres backup_before_0004.dump
# 3. 验证数据完整性
# 4. 重启应用服务
```

**优点**:
- 100%恢复到迁移前状态
- 数据安全有保障

**缺点**:
- 需要提前备份
- 恢复时间较长
- 迁移后产生的数据会丢失

---

## 回滚SQL脚本

### rollback-0004.sql

```sql
-- =============================================
-- 回滚脚本: 0004_stale_blizzard.sql
-- 目标: 删除QiFlow相关表
-- 警告: 此操作不可逆，会删除所有相关数据
-- =============================================

BEGIN;

-- Step 1: 删除索引
DROP INDEX IF EXISTS "bazi_user_id_idx";
DROP INDEX IF EXISTS "bazi_created_at_idx";
DROP INDEX IF EXISTS "fengshui_user_id_idx";
DROP INDEX IF EXISTS "fengshui_created_at_idx";
DROP INDEX IF EXISTS "pdf_audit_user_id_idx";
DROP INDEX IF EXISTS "pdf_audit_created_at_idx";
DROP INDEX IF EXISTS "copyright_audit_user_id_idx";
DROP INDEX IF EXISTS "copyright_audit_created_at_idx";

-- Step 2: 删除外键约束
ALTER TABLE "bazi_calculations" 
  DROP CONSTRAINT IF EXISTS "bazi_calculations_user_id_user_id_fk";

ALTER TABLE "fengshui_analysis" 
  DROP CONSTRAINT IF EXISTS "fengshui_analysis_user_id_user_id_fk";

ALTER TABLE "pdf_audit" 
  DROP CONSTRAINT IF EXISTS "pdf_audit_user_id_user_id_fk";

ALTER TABLE "copyright_audit" 
  DROP CONSTRAINT IF EXISTS "copyright_audit_user_id_user_id_fk";

-- Step 3: 删除表
DROP TABLE IF EXISTS "bazi_calculations" CASCADE;
DROP TABLE IF EXISTS "fengshui_analysis" CASCADE;
DROP TABLE IF EXISTS "pdf_audit" CASCADE;
DROP TABLE IF EXISTS "copyright_audit" CASCADE;

-- Step 4: 验证清理结果
SELECT 
  'QiFlow tables remaining:' as message,
  count(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'bazi_calculations', 
  'fengshui_analysis', 
  'pdf_audit', 
  'copyright_audit'
);

COMMIT;
```

### 执行顺序说明
1. **索引** → 先删除索引（性能影响最小）
2. **外键约束** → 删除外键（避免引用错误）
3. **表** → 最后删除表（使用CASCADE级联删除）

---

## 风险评估

### 🔴 高风险项
1. **数据丢失**
   - **风险**: 回滚后所有QiFlow数据将被永久删除
   - **影响**: 用户历史分析记录、积分消耗记录
   - **缓解**: 
     - 回滚前必须备份数据库
     - 导出关键业务数据到CSV
     - 通知用户服务暂时不可用

2. **外键约束冲突**
   - **风险**: 如果有其他表引用QiFlow表，删除会失败
   - **影响**: 回滚无法完成，数据库状态不一致
   - **缓解**:
     - 使用CASCADE级联删除
     - 提前检查表依赖关系
     - 在事务中执行（失败自动回滚）

### 🟡 中风险项
1. **应用代码依赖**
   - **风险**: 代码仍在访问已删除的表
   - **影响**: 应用报错，功能不可用
   - **缓解**:
     - 同步回滚代码到迁移前版本
     - 使用feature flag禁用QiFlow功能
     - 添加优雅降级处理

2. **积分系统影响**
   - **风险**: credit_transaction表中记录QiFlow消费，但数据源表已删除
   - **影响**: 积分审计不完整
   - **缓解**:
     - 保留credit_transaction记录（不删除）
     - 标记QiFlow相关交易为"已回滚"
     - 考虑退还用户积分

### 🟢 低风险项
1. **索引重建**
   - **风险**: 如果需要重新迁移，索引重建耗时
   - **影响**: 迁移速度稍慢
   - **缓解**: 索引会在重新迁移时自动创建

2. **迁移历史**
   - **风险**: 迁移历史记录不连续
   - **影响**: 可能引起困惑
   - **缓解**: 在_journal.json中记录回滚操作

---

## 应急流程

### 回滚决策树
```
发现问题
    ↓
评估严重程度
    ↓
┌───────────────────┬───────────────────┐
│   严重（P0/P1）   │   一般（P2/P3）   │
└───────────────────┴───────────────────┘
    ↓                       ↓
立即回滚              尝试修复
    ↓                       ↓
备份数据库            修复成功？
    ↓                   ├─是→ 继续监控
停止服务                └─否→ 准备回滚
    ↓
执行回滚SQL
    ↓
验证回滚成功
    ↓
回滚应用代码
    ↓
恢复服务
    ↓
通知相关方
```

### 紧急联系人
- **DBA**: [联系方式]
- **后端负责人**: [联系方式]
- **产品经理**: [联系方式]
- **Supabase支持**: support@supabase.io

---

## 验证步骤

### 回滚前验证
```bash
# 1. 确认当前迁移版本
npx drizzle-kit introspect

# 2. 检查QiFlow表是否存在
psql $DATABASE_URL -c "\dt" | grep -E "bazi|fengshui|pdf_audit|copyright"

# 3. 统计各表数据量
psql $DATABASE_URL -c "
SELECT 
  'bazi_calculations' as table, COUNT(*) as rows FROM bazi_calculations
UNION ALL
SELECT 
  'fengshui_analysis', COUNT(*) FROM fengshui_analysis
UNION ALL
SELECT 
  'pdf_audit', COUNT(*) FROM pdf_audit
UNION ALL
SELECT 
  'copyright_audit', COUNT(*) FROM copyright_audit;
"

# 4. 备份数据库
pg_dump $DATABASE_URL > backup_before_rollback_$(date +%Y%m%d_%H%M%S).sql
```

### 回滚后验证
```bash
# 1. 确认表已删除
psql $DATABASE_URL -c "\dt" | grep -E "bazi|fengshui|pdf_audit|copyright"
# 预期输出: 无结果

# 2. 检查外键约束
psql $DATABASE_URL -c "
SELECT constraint_name, table_name 
FROM information_schema.table_constraints 
WHERE constraint_name LIKE '%qiflow%' OR constraint_name LIKE '%bazi%';
"
# 预期输出: 无结果

# 3. 验证基础表完整性
psql $DATABASE_URL -c "
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
"
# 预期输出: user, session, account等基础表应仍存在

# 4. 测试应用启动
npm run dev
# 预期: 应用正常启动，无数据库连接错误

# 5. 检查日志
tail -f logs/app.log | grep -i error
# 预期: 无QiFlow相关错误
```

---

## 回滚后操作清单

### 代码清理
- [ ] 删除或注释 `src/actions/qiflow/` 目录
- [ ] 删除或注释 `src/lib/qiflow/` 目录
- [ ] 删除或注释 `src/components/qiflow/` 目录
- [ ] 删除或注释 `src/app/[locale]/analysis/` 目录
- [ ] 移除 `src/lib/auth-qiflow.ts` 导入
- [ ] 清理 `package.json` 中QiFlow特定依赖
- [ ] 更新 `src/routes.ts` 移除QiFlow路由

### 配置清理
- [ ] 删除 `src/config/qiflow-pricing.ts`
- [ ] 删除 `src/config/qiflow-thresholds.ts`
- [ ] 清理 `.env` 中QiFlow相关环境变量

### 文档更新
- [ ] 更新README移除QiFlow功能说明
- [ ] 更新CHANGELOG记录回滚操作
- [ ] 通知团队成员回滚完成

### 用户通知
- [ ] 发布公告说明服务变更
- [ ] 说明数据迁移计划（如有）
- [ ] 提供替代方案或补偿措施

---

## 附录

### Drizzle Kit命令参考
```bash
# 查看迁移历史
npx drizzle-kit introspect

# 生成新迁移
npx drizzle-kit generate

# 应用迁移
npx drizzle-kit migrate

# 推送到数据库（危险）
npx drizzle-kit push

# 启动Studio
npm run db:studio
```

### 相关文件路径
```
src/db/
├── schema.ts                 # Schema定义（包含QiFlow表）
├── index.ts                  # 数据库连接
├── migrations/               # 迁移文件目录
│   ├── 0004_stale_blizzard.sql  # QiFlow迁移
│   └── meta/
│       └── _journal.json     # 迁移历史
drizzle.config.ts             # Drizzle配置
.env                          # 数据库连接字符串
```

### 数据库连接信息
```bash
# Supabase连接字符串格式
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres"

# 当前项目
HOST=db.sibwcdadrsbfkblinezj.supabase.co
PORT=5432
DATABASE=postgres
```

---

## 总结

### 回滚要点
1. ✅ **备份优先** - 任何操作前必须备份
2. ✅ **事务保护** - 使用BEGIN/COMMIT包裹SQL
3. ✅ **验证充分** - 回滚前后都要验证
4. ✅ **同步代码** - 数据库和代码同步回滚
5. ✅ **沟通及时** - 通知所有相关方

### 最佳实践
- 在非生产环境先测试回滚流程
- 保留迁移脚本和回滚脚本对应关系
- 记录每次回滚操作到changelog
- 定期演练应急响应流程

---

**文档状态**: ✅ 已完成  
**最后更新**: 2025-10-02  
**维护人**: AI Agent

