# 下一会话工作计划

**准备时间**: 2025-01-24  
**当前状态**: Phase 2 - 43% 完成  
**剩余工作**: 57%

---

## 🎯 优先级排序

### Priority 1: 修复 db 类型系统 🔴

**重要性**: ⭐⭐⭐⭐⭐（最高）  
**影响范围**: ~50 个 TypeScript 错误  
**预估时间**: 2-3 小时  
**难度**: 中-高

#### 问题描述

当前 `db` 导入返回的是包装对象而不是数据库实例，导致无法直接调用 `.select()`, `.insert()` 等方法。

**错误示例**:
```
error TS2339: Property 'insert' does not exist on type 
'{ db: DbType | null; connectionClient: Sql<{}> | null; 
connectionPromise: Promise<DbType> | null; }'
```

**影响文件**:
- `src/actions/chat/*.ts` (4 个)
- `src/actions/qiflow/*.ts` (3 个)
- `src/app/api/admin/**/*.ts` (~20 个)
- `src/lib/**/*.ts` (~15 个)
- `src/cron/*.ts` (2 个)

#### 解决方案选项

**方案 A: 修复 db 导出（推荐）**

检查 `src/db/index.ts`，确保导出的是数据库实例而不是包装对象。

```typescript
// 当前可能是:
export const db = {
  db: actualDbInstance,
  connectionClient: ...,
  connectionPromise: ...
};

// 应该改为:
export const db = actualDbInstance;
// 或
export async function getDb() {
  return actualDbInstance;
}
```

**执行步骤**:
1. 读取 `src/db/index.ts`
2. 理解当前导出结构
3. 修改导出为正确的数据库实例
4. 或统一使用 `getDb()` 并修改所有导入

**方案 B: 统一使用 getDb()**

如果包装对象设计是有意的，则恢复所有文件使用 `getDb()` 并正确等待。

```typescript
// 在所有文件中:
import { getDb } from '@/db';

// 在函数开始:
const db = await getDb();
```

**执行步骤**:
1. 确认 `getDb()` 的正确用法
2. 批量恢复所有文件的 `const db = await getDb();`
3. 验证类型正确

#### 快速诊断命令

```bash
# 查看 db/index.ts 导出
cat src/db/index.ts | Select-String -Pattern "export"

# 统计 db 类型错误
npm run type-check 2>&1 | Select-String -Pattern "Property .* does not exist on type.*db" | Measure-Object -Line

# 查找所有 db 使用模式
grep -r "from '@/db'" src/ | wc -l
```

---

### Priority 2: 批量修复 Schema 导入 🟠

**重要性**: ⭐⭐⭐⭐  
**影响范围**: ~15 个错误  
**预估时间**: 30-45 分钟  
**难度**: 低

#### 常见错误

1. **`users` vs `user`**
   ```typescript
   // 错误
   import { users } from '@/db/schema';
   // 正确
   import { user } from '@/db/schema';
   ```

2. **`auditLog` vs `auditLogs`**
   ```typescript
   // 错误
   import { auditLog } from '@/db/schema';
   // 正确
   import { auditLogs } from '@/db/schema';
   ```

3. **不存在的 `analysis`**
   ```typescript
   // 删除此导入
   import { analysis } from '@/db/schema';
   ```

#### 批量修复命令

```powershell
# 查找所有 users 导入
Select-String -Path "src/**/*.ts" -Pattern "import.*users.*from '@/db/schema'"

# 批量替换（谨慎执行）
Get-ChildItem -Path src -Recurse -Filter "*.ts" | ForEach-Object {
  (Get-Content $_.FullName) -replace ", users ", ", user " | Set-Content $_.FullName
}
```

---

### Priority 3: 继续清理 src/ 文件 🟡

**重要性**: ⭐⭐⭐  
**影响范围**: 473 个未使用文件  
**预估时间**: 3-4 小时  
**难度**: 中（需要仔细审查）

#### 策略

**不要批量删除！需要逐个或分批审查！**

#### 执行步骤

1. **按目录分批审查**
   ```bash
   # 查看 src/ 下未使用文件分布
   npx knip --no-exit-code 2>&1 | Select-String -Pattern "^src/" | Group-Object { $_.Line.Split('/')[1] }
   ```

2. **优先删除明显未使用的目录**
   - 旧的测试文件
   - 重复的组件
   - 实验性功能

3. **保留可能有用的文件**
   - 动态导入的文件
   - 配置文件
   - 类型定义文件

#### 审查清单

每批删除前检查：
- [ ] 是否有动态导入？
- [ ] 是否在配置文件中引用？
- [ ] 是否是公共 API？
- [ ] 删除后是否影响构建？

---

### Priority 4: 重构重复代码 🟢

**重要性**: ⭐⭐  
**影响范围**: 代码重复率 7.6% → <5%  
**预估时间**: 10-15 小时  
**难度**: 高

#### 主要重复模式

根据之前的代码审查，top 3 重复模式：

1. **表单验证逻辑**
   - 提取为自定义 Hook
   - 统一验证规则

2. **API 客户端调用**
   - 统一错误处理
   - 统一响应格式

3. **数据转换函数**
   - 提取公共工具函数
   - 类型安全保证

#### 检测重复代码

```bash
# 使用 jscpd 检测重复
npx jscpd src/ --min-lines 5 --min-tokens 50 --format markdown > duplicates.md
```

---

## 📋 执行顺序建议

### Session 1: db 类型系统修复（2-3h）

1. ✅ 诊断 db 导出问题（15min）
2. ✅ 选择并实施修复方案（1h）
3. ✅ 验证修复效果（30min）
4. ✅ 批量修复 Schema 导入（30min）
5. ✅ 运行类型检查验证（15min）

**预期结果**: TypeScript 错误从 ~150 → ~80

### Session 2: 清理 src/ 文件（3-4h）

1. ✅ 分析未使用文件分布（30min）
2. ✅ 第一批删除：明显未使用（1h）
3. ✅ 第二批删除：审查后确认（1h）
4. ✅ 第三批删除：最终清理（1h）
5. ✅ 验证构建和功能（30min）

**预期结果**: 未使用文件从 573 → <100

### Session 3: 重构重复代码（分多次）

计划后续会话

---

## 🛠️ 准备工作

### 在开始前确保

1. **当前更改已提交**
   ```bash
   git status
   git add .
   git commit -m "docs: add next session plan"
   ```

2. **创建新分支**（可选）
   ```bash
   git checkout -b fix/db-types
   ```

3. **备份当前状态**
   ```bash
   git tag phase2-checkpoint-1
   ```

4. **清理构建缓存**
   ```bash
   rm -rf .next
   rm -rf node_modules/.cache
   ```

---

## 📊 当前状态快照

### 质量指标

| 指标 | 当前值 | 本会话目标 | Phase 2 最终目标 |
|------|--------|-----------|-----------------|
| TypeScript 错误 | ~150 | ~80 | 0 |
| 未使用文件 | 573 | <100 | <100 |
| 编码规范错误 | 172 | <100 | 0 |
| 代码重复率 | 7.6% | 7.6% | <5% |

### Git 状态

- 当前分支: `main`
- 最新提交: `6aec656`
- 未提交更改: 1 个文件（本文档）

---

## 🔍 调试技巧

### 快速定位 db 类型问题

```typescript
// 在任意 TypeScript 文件中测试
import { db } from '@/db';
type DbType = typeof db;
// 查看推断出的类型
```

### 验证修复效果

```bash
# 只检查特定目录
npx tsc --noEmit src/actions/**/*.ts

# 统计错误减少
npm run type-check 2>&1 | Select-String "error TS" | Measure-Object -Line
```

---

## 💡 注意事项

### ⚠️ 风险控制

1. **db 修复是架构级变更**
   - 可能影响整个项目
   - 需要完整测试
   - 建议在新分支进行

2. **删除文件不可逆**
   - 每批删除后立即提交
   - 便于回滚
   - 保留删除清单

3. **重构需要测试**
   - 每次重构后运行测试
   - 确保功能不变
   - 注意边界情况

### ✅ 成功标准

**Session 1 完成标准**:
- [ ] db 类型错误全部修复
- [ ] Schema 导入错误全部修复
- [ ] TypeScript 错误 < 80
- [ ] 项目可以正常构建
- [ ] 核心功能正常

---

## 📞 快速参考

### 关键文件

- **db 相关**: `src/db/index.ts`
- **Schema**: `src/db/schema.ts`, `src/db/schema-*.ts`
- **类型定义**: `src/db/types.ts`

### 关键命令

```bash
# 类型检查
npm run type-check

# 构建
npm run build

# 测试
npm run test

# Lint
npm run lint
```

### 文档位置

- 所有报告: `code-review-output/`
- 本文档: `code-review-output/NEXT_SESSION_PLAN.md`

---

**文档创建时间**: 2025-01-24  
**建议开始时间**: 下次会话  
**预计完成**: Session 1 后 TypeScript 错误降至 ~80  

**祝工作顺利！🚀**
