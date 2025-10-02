# Git分支回滚指南

**文档版本**: 1.0  
**创建日期**: 2025-10-02  
**适用范围**: QiFlow代码回滚

---

## 📋 目录

1. [回滚概述](#回滚概述)
2. [当前Git状态](#当前git状态)
3. [回滚方法](#回滚方法)
4. [详细步骤](#详细步骤)
5. [验证检查](#验证检查)
6. [常见问题](#常见问题)

---

## 回滚概述

### 当前分支状态
```bash
分支: chore/migrate-qiflow-into-mksaas
最新提交: 69c5577b7a7e2a7c99f99afeb8c3f8c3c13d5d7a
提交信息: feat(qiflow): Complete QiFlow AI migration into MKSaaS template
```

### 回滚目标
完全撤销QiFlow迁移代码，恢复到迁移前的干净状态。

---

## 当前Git状态

### 提交历史
```bash
git log --oneline -5

69c5577 (HEAD -> chore/migrate-qiflow-into-mksaas) feat(qiflow): Complete QiFlow AI migration
[previous commits...]
```

### 文件统计
```bash
git diff --stat main...HEAD

# 结果（预期）：
# ~1500 files changed
# ~150 QiFlow core files added
# ~10 config files modified
```

---

## 回滚方法

### 方法对比

| 方法 | 适用场景 | 优点 | 缺点 | 推荐度 |
|-----|---------|------|------|-------|
| **git revert** | 保留历史记录 | 安全、可追溯 | 生成新提交 | ⭐⭐⭐⭐⭐ |
| **git reset --hard** | 完全撤销 | 彻底干净 | 丢失历史 | ⭐⭐⭐ |
| **git checkout -b** | 创建新分支 | 保留原分支 | 占用空间 | ⭐⭐⭐⭐ |
| **分支删除重建** | 全新开始 | 最干净 | 最激进 | ⭐⭐ |

---

## 详细步骤

### 方法1: Git Revert (推荐)

**特点**: 创建反向提交撤销更改，保留完整历史

```bash
# Step 1: 确认当前状态
git status
git log --oneline -3

# Step 2: Revert最新提交
git revert HEAD --no-edit

# 或者使用提交hash
git revert 69c5577 --no-edit

# Step 3: 检查结果
git log --oneline -3
# 应该看到一个新的revert提交

# Step 4: 验证文件变更
git status
# 应该看到clean working tree

# Step 5: 推送到远程（如果需要）
git push origin chore/migrate-qiflow-into-mksaas

# Step 6: 合并到main（如果需要）
git checkout main
git merge chore/migrate-qiflow-into-mksaas
git push origin main
```

**优点**:
- ✅ 保留完整历史记录
- ✅ 可以随时再次revert回来
- ✅ 适合生产环境
- ✅ 团队协作友好

**缺点**:
- ❌ 生成额外提交
- ❌ 历史略显冗长

**推荐指数**: ⭐⭐⭐⭐⭐

---

### 方法2: Git Reset --hard

**特点**: 直接重置到指定提交，丢弃所有后续更改

```bash
# ⚠️ 警告: 此操作会永久丢失未推送的提交

# Step 1: 查找迁移前的提交hash
git log --oneline --all
# 找到QiFlow迁移之前的提交

# Step 2: 创建备份分支（安全起见）
git branch backup-before-reset

# Step 3: 重置到指定提交
git reset --hard <commit-hash-before-migration>

# 例如:
# git reset --hard abc123def456

# Step 4: 验证结果
git log --oneline -3
git status

# Step 5: 强制推送到远程（如果需要）
# ⚠️ 谨慎: 会覆盖远程历史
git push --force origin chore/migrate-qiflow-into-mksaas
```

**优点**:
- ✅ 彻底干净
- ✅ 代码库回到迁移前状态
- ✅ 执行简单

**缺点**:
- ❌ 丢失提交历史
- ❌ 无法恢复
- ❌ 需要force push
- ❌ 团队协作不友好

**推荐指数**: ⭐⭐⭐

**使用场景**: 个人分支，确定不需要保留历史

---

### 方法3: 创建新分支重新开始

**特点**: 保留原分支，从main创建新分支

```bash
# Step 1: 切换到main
git checkout main
git pull origin main

# Step 2: 创建新的工作分支
git checkout -b chore/clean-start

# Step 3: （可选）标记旧分支
git branch -m chore/migrate-qiflow-into-mksaas chore/migrate-qiflow-ARCHIVED

# Step 4: 推送新分支
git push origin chore/clean-start

# Step 5: 设置上游分支
git branch --set-upstream-to=origin/chore/clean-start

# Step 6: （可选）删除旧分支
# 本地删除
git branch -D chore/migrate-qiflow-ARCHIVED

# 远程删除
git push origin --delete chore/migrate-qiflow-into-mksaas
```

**优点**:
- ✅ 保留原分支作为参考
- ✅ 全新干净的起点
- ✅ 无破坏性操作
- ✅ 可以选择性cherry-pick有用的提交

**缺点**:
- ❌ 占用额外空间
- ❌ 分支管理复杂

**推荐指数**: ⭐⭐⭐⭐

**使用场景**: 需要保留迁移代码作为参考

---

### 方法4: 分支删除重建

**特点**: 完全删除分支并从头重建

```bash
# Step 1: 切换到main
git checkout main

# Step 2: 删除本地分支
git branch -D chore/migrate-qiflow-into-mksaas

# Step 3: 删除远程分支
git push origin --delete chore/migrate-qiflow-into-mksaas

# Step 4: 重新创建分支
git checkout -b chore/migrate-qiflow-into-mksaas

# Step 5: 推送新分支
git push origin chore/migrate-qiflow-into-mksaas

# Step 6: 设置上游
git branch --set-upstream-to=origin/chore/migrate-qiflow-into-mksaas
```

**优点**:
- ✅ 最干净的方式
- ✅ 从零开始
- ✅ 无历史包袱

**缺点**:
- ❌ 最激进
- ❌ 丢失所有历史
- ❌ 需要团队同步

**推荐指数**: ⭐⭐

**使用场景**: 确定需要完全推倒重来

---

## 验证检查

### 回滚后检查清单

```bash
# 1. Git状态
git status
# 预期: On branch xxx, nothing to commit, working tree clean

# 2. 分支对比
git diff main
# 预期: 无差异或只有预期的差异

# 3. QiFlow文件检查
ls src/lib/qiflow/
# 预期: 目录不存在或文件已删除

ls src/actions/qiflow/
# 预期: 目录不存在或文件已删除

ls src/components/qiflow/
# 预期: 目录不存在或文件已删除

# 4. 配置文件检查
git diff HEAD src/db/schema.ts
# 预期: 无QiFlow表定义

git diff HEAD package.json
# 预期: 无QiFlow依赖

# 5. 提交历史
git log --oneline -10
# 预期: 看到回滚提交或历史已重置

# 6. 远程同步状态
git status
# 预期: Your branch is up to date with 'origin/xxx'
```

### 应用验证

```bash
# 1. 依赖安装
npm install
# 预期: 成功安装，无QiFlow相关依赖

# 2. TypeScript编译
npm run build
# 预期: 无QiFlow相关类型错误

# 3. 应用启动
npm run dev
# 预期: 成功启动，无QiFlow路由

# 4. 测试运行
npm run test
# 预期: 通过或跳过QiFlow相关测试

# 5. 数据库连接
npm run db:studio
# 预期: 能连接，不显示QiFlow表（如果数据库也已回滚）
```

---

## 常见问题

### Q1: Revert失败，出现merge conflict怎么办？

**答**: 手动解决冲突

```bash
# 1. 查看冲突文件
git status

# 2. 编辑冲突文件，选择保留迁移前的代码
code <conflicted-file>

# 3. 标记为已解决
git add <conflicted-file>

# 4. 继续revert
git revert --continue

# 5. 如果无法解决，放弃revert
git revert --abort
```

### Q2: Reset后想恢复怎么办？

**答**: 使用reflog恢复

```bash
# 1. 查看reflog找到reset前的提交
git reflog

# 2. 恢复到指定提交
git reset --hard HEAD@{n}
# 或
git reset --hard <commit-hash>

# 3. 验证恢复成功
git log --oneline -5
```

### Q3: Force push被拒绝怎么办？

**答**: 检查保护规则或权限

```bash
# 1. 确认分支没有保护
# 在GitHub/GitLab检查分支保护规则

# 2. 确认有推送权限
git remote -v
git config user.name
git config user.email

# 3. 使用lease选项更安全
git push --force-with-lease origin <branch>
```

### Q4: 如何只回滚部分文件？

**答**: 使用checkout恢复特定文件

```bash
# 1. 从特定提交恢复文件
git checkout <commit-hash> -- <file-path>

# 例如: 只恢复schema.ts
git checkout abc123 -- src/db/schema.ts

# 2. 提交更改
git add src/db/schema.ts
git commit -m "Rollback schema.ts to pre-migration state"
```

### Q5: 多人协作时如何安全回滚？

**答**: 使用revert并通知团队

```bash
# 1. 使用revert而不是reset
git revert HEAD

# 2. 推送到远程
git push origin <branch>

# 3. 通知团队成员
# 发送消息: "已回滚QiFlow迁移，请执行 git pull"

# 4. 团队成员同步
git pull origin <branch>
```

---

## 回滚脚本

### 自动化回滚脚本

```bash
#!/bin/bash
# rollback-git.sh - 自动化Git回滚脚本

set -e  # 遇到错误立即退出

echo "========================================="
echo "QiFlow Git Rollback Script"
echo "========================================="

# 1. 检查当前分支
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "chore/migrate-qiflow-into-mksaas" ]; then
    echo "❌ Error: Not on migration branch"
    exit 1
fi

# 2. 确认操作
read -p "Are you sure you want to rollback? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "Rollback cancelled"
    exit 0
fi

# 3. 创建备份分支
echo "Creating backup branch..."
git branch backup-$(date +%Y%m%d-%H%M%S)

# 4. 执行回滚（选择方法）
read -p "Choose rollback method (1=revert, 2=reset): " METHOD

if [ "$METHOD" == "1" ]; then
    echo "Using git revert..."
    git revert HEAD --no-edit
elif [ "$METHOD" == "2" ]; then
    read -p "Enter commit hash to reset to: " COMMIT_HASH
    echo "Using git reset --hard to $COMMIT_HASH..."
    git reset --hard $COMMIT_HASH
else
    echo "Invalid method"
    exit 1
fi

# 5. 验证结果
echo "========================================="
echo "Rollback completed!"
echo "========================================="
echo "Next steps:"
echo "1. Verify changes: git status"
echo "2. Test application: npm run dev"
echo "3. Push changes: git push [--force]"

git log --oneline -5
```

### 使用脚本

```bash
# 1. 给脚本执行权限
chmod +x artifacts/C11/rollback-git.sh

# 2. 运行脚本
./artifacts/C11/rollback-git.sh

# 3. 按提示选择回滚方法
```

---

## 最佳实践

### ✅ DO - 推荐做法

1. **回滚前备份**
   ```bash
   git branch backup-before-rollback
   ```

2. **使用revert而不是reset（生产环境）**
   ```bash
   git revert HEAD
   ```

3. **验证再推送**
   ```bash
   npm run build && npm run test
   git push
   ```

4. **通知团队**
   - 发送回滚通知
   - 说明回滚原因
   - 提供同步步骤

5. **记录到changelog**
   ```markdown
   ## [Unreleased]
   ### Reverted
   - Rollback QiFlow migration due to [reason]
   ```

### ❌ DON'T - 避免做法

1. **不要在main分支直接reset**
   ```bash
   # ❌ 危险
   git checkout main
   git reset --hard HEAD~1
   ```

2. **不要force push到保护分支**
   ```bash
   # ❌ 会被拒绝
   git push --force origin main
   ```

3. **不要跳过验证直接推送**
   ```bash
   # ❌ 可能引入新问题
   git revert HEAD
   git push  # 没有验证
   ```

4. **不要忘记同步数据库回滚**
   - Git回滚 ✅
   - 数据库回滚 ❌  <- 这会导致不一致

---

## 总结

### 推荐流程

1. **评估**: 确定需要回滚的范围
2. **备份**: 创建备份分支
3. **选择方法**: 根据场景选择revert或reset
4. **执行回滚**: 按步骤操作
5. **验证**: 全面测试
6. **同步**: 数据库+代码同步回滚
7. **通知**: 告知团队
8. **文档**: 更新changelog

### 关键要点
- ✅ **安全第一** - 备份再操作
- ✅ **验证充分** - 回滚后全面测试
- ✅ **沟通及时** - 通知所有相关方
- ✅ **文档更新** - 记录回滚操作

---

**文档状态**: ✅ 已完成  
**最后更新**: 2025-10-02  
**维护人**: AI Agent

