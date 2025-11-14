# Phase 2 - 下一步操作指南

**当前进度**: 1/7 任务完成（14%）  
**会话状态**: 准备就绪，等待执行清理

---

## ✅ 已完成

### 1. 快速修复（Quick Wins）
- Biome 自动修复（26 个文件）
- 编码规范错误: 185 → 172 (-7%)
- 修复关键问题（5 个）
- 生成详细清理计划

---

## 🔄 准备就绪的任务

### 2. Scripts 清理（立即可执行）

**已准备好的工具**:
- ✅ `cleanup-unused-scripts.ps1` - 批量删除脚本
- ✅ 未使用文件清单（113 个）
- ✅ 保留文件清单（package.json 引用的 24 个）

**执行步骤**:
```powershell
# 1. 运行清理脚本
.\cleanup-unused-scripts.ps1

# 2. 验证项目可以构建
npm run build

# 3. 提交更改
git add .
git commit -m "chore(cleanup): remove unused scripts files"
```

**预期结果**:
- 删除 ~100 个脚本文件
- 减少项目大小 ~2-5 MB

---

### 3. Content 清理（下一步）

**待执行**:
```bash
# 获取未使用的 content 文件列表
npx knip --no-exit-code 2>&1 | Select-String -Pattern "^content/" > content-to-delete.txt

# 批量删除 MDX 文件
# 注意：105 个文件，需要审查后再删除
```

---

## 📊 当前质量指标

| 指标 | 当前值 | Phase 2 目标 | 进度 |
|------|--------|-------------|------|
| 编码规范错误 | 172 | 0 | 8.5% |
| TypeScript 错误 | 186 | 0 | 0% |
| 未使用文件 | 725 | <100 | 0% |
| 代码重复率 | 7.6% | <5% | 0% |
| 测试覆盖率 | ~40% | 60%+ | 0% |

---

## 📋 剩余任务（按优先级）

### 高优先级

1. **清理 Scripts**（准备就绪）
   - 工具: `cleanup-unused-scripts.ps1`
   - 工时: 15-30 分钟
   - 风险: 低

2. **清理 Content**（需要审查）
   - 工具: Knip + 手动审查
   - 工时: 30-60 分钟
   - 风险: 低

3. **清理 src/ 文件**（需要仔细审查）
   - 493 个文件需要逐个审查
   - 工时: 3-4 小时
   - 风险: 中

4. **修复 TypeScript 错误**（186 个）
   - 按模块修复
   - 工时: 8-12 小时
   - 风险: 低-中

### 中优先级

5. **重构重复代码**
   - 提取 3 大模式
   - 工时: 10-15 小时
   - 风险: 中

6. **增加测试覆盖率**
   - AI/Credits/Payment 模块
   - 工时: 12-16 小时
   - 风险: 低

7. **优化大型组件**
   - >300 行组件拆分
   - 工时: 4-6 小时
   - 风险: 低

8. **集成 CI/CD 质量门禁**
   - GitHub Actions 配置
   - 工时: 3-4 小时
   - 风险: 低

---

## 🚀 立即执行建议

### 选项 A: 快速清理（推荐）

**适合**: 快速见效，立即减少未使用代码

```powershell
# 1. Scripts 清理（15 分钟）
.\cleanup-unused-scripts.ps1
npm run build
git add . && git commit -m "chore: remove unused scripts"

# 2. Content 清理（30 分钟）
# 手动审查并删除未使用的 MDX 文件
git add . && git commit -m "chore: remove unused content files"

# 3. 验证
npm run lint
npm run type-check
```

**预期**: 减少 ~200 个文件（27.6%）

---

### 选项 B: 全面清理（需要更多时间）

**适合**: 深度清理，达到 Phase 2 最终目标

```powershell
# Week 1: 快速清理 + TypeScript 修复
Day 1: Scripts + Content 清理
Day 2-3: 修复 TypeScript 错误（AI 模块）

# Week 2: 重构 + 测试
Day 4-5: 重构重复代码
Day 6-7: 增加测试覆盖率

# Week 3: 优化 + 集成
Day 8: 组件优化
Day 9: CI/CD 集成
```

**预期**: 达成所有 Phase 2 目标

---

## 📞 关键文件参考

### 已生成的文档

1. **UNUSED_CODE_CLEANUP_PLAN.md** - 完整清理策略
2. **PHASE_2_DAY1_PROGRESS.md** - Day 1 进度报告
3. **PHASE_2_START_PLAN.md** - Phase 2 启动计划
4. **COMPLETE_PROJECT_SUMMARY.md** - 项目完整历程

### 清理工具

1. **cleanup-unused-scripts.ps1** - Scripts 批量删除工具
2. **knip-report.json** - Knip 扫描结果（如果存在）

---

## ⚠️ 重要提醒

### 执行前检查

- [x] 已生成清理计划
- [x] 已准备清理脚本
- [ ] 已创建 Git 备份分支
- [ ] 已提交当前更改

### 执行中验证

每次删除文件后：
1. 运行 `npm run build` 确保可以构建
2. 运行 `npm run lint` 检查代码规范
3. 运行 `npm run type-check` 检查类型
4. Git 提交更改（便于回滚）

### 回滚策略

如果出现问题：
```bash
# 立即回滚到上一次提交
git reset --hard HEAD~1

# 或回滚到特定提交
git reset --hard <commit-id>

# 清理未追踪文件
git clean -fd
```

---

## 🎯 本周目标

**Week 1 结束时**:
- 未使用文件 < 300（-425）
- 编码规范错误 < 100（-72）
- TypeScript 错误 < 150（-36）

**Phase 2 完成时**:
- 未使用文件 < 100（-625）
- 编码规范错误 = 0（-172）
- TypeScript 错误 = 0（-186）
- 代码重复率 < 5%（-2.6%）
- 测试覆盖率 60%+（+20%）
- 整体评分 97.5/100（+1.8）

---

**下次会话建议**: 执行 `cleanup-unused-scripts.ps1` 并验证构建
