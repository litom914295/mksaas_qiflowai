# 项目清理后提交到 GitHub 指南

## 📋 提交前检查清单

在提交之前，请确保：

- [ ] ✅ 已运行 `.\cleanup-project.ps1` 完成清理
- [ ] ✅ 已运行 `npm run dev` 测试项目能正常启动
- [ ] ✅ 已检查 `.archived/CLEANUP_REPORT.md` 确认清理内容
- [ ] ✅ 核心功能测试通过
- [ ] ✅ 已阅读本指南

---

## 🚀 提交步骤

### 第一步：检查 Git 状态

```powershell
# 查看所有变更
git status
```

你应该会看到：
- 新增：`.archived/` 目录及其内容
- 新增：`docs/archive/` 重组的目录
- 新增：`scripts/` 下的新子目录
- 删除：旧的备份目录（`.attic/`, `.archive/`, `backup/`）
- 删除：Jest 配置文件
- 删除：大量根目录的临时文件
- 修改：`.gitignore`

### 第二步：查看具体变更

```powershell
# 查看删除的文件
git ls-files --deleted

# 查看新增的文件
git ls-files --others --exclude-standard

# 查看修改的文件
git diff --name-only
```

### 第三步：分阶段提交（推荐）

为了让提交历史更清晰，建议分几次提交：

#### 提交 1：更新 .gitignore

```powershell
git add .gitignore
git commit -m "chore: 添加 .archived 目录到 gitignore"
```

#### 提交 2：删除过期配置

```powershell
git add -u
git commit -m "chore: 删除过期的 Jest 配置文件

- 删除 jest.config.js 和 jest.setup.js
- 项目已迁移到 Vitest 和 Playwright
- 删除冗余的 defender 脚本文件
"
```

#### 提交 3：重组项目结构

```powershell
# 添加所有变更（新增和删除）
git add -A

git commit -m "refactor: 重组项目文件结构

主要变更：
- 合并备份目录到 .archived/backups/
- 归档 70+ 个报告文档到 docs/archive/
- 重组 scripts 目录，按功能分类
- 归档 TypeScript 编译日志到 .archived/build-logs/
- 整理根目录临时脚本到 .archived/temp-scripts/

详细信息见 .archived/CLEANUP_REPORT.md
"
```

### 第四步：推送到 GitHub

```powershell
# 推送到远程仓库
git push origin main

# 如果你的默认分支是 master，使用：
# git push origin master
```

---

## 📝 一次性提交（简化方式）

如果你不想分多次提交，可以一次性提交所有变更：

```powershell
# 添加所有变更
git add -A

# 提交
git commit -m "chore: 清理和重组项目文件结构

执行项目清理，移除过期文件，重组目录结构：

🗑️ 删除内容：
- 删除 jest.config.js 和 jest.setup.js（已迁移到 Vitest）
- 删除冗余的 defender 脚本文件
- 移除 .attic, .archive, backup 等旧备份目录

📁 新增归档目录：
- .archived/ - 统一归档目录（已加入 gitignore）
  - backups/ - 合并的备份文件
  - build-logs/ - TypeScript 编译日志
  - temp-scripts/ - 临时测试脚本
  - reference-data/ - 参考数据
  
📚 文档重组：
- docs/archive/reports/ - 英文报告文档
- docs/archive/reports-zh/ - 中文报告文档
- 根目录保留核心文档，70+ 个报告文档已归档

🔧 脚本重组：
- scripts/testing/ - 测试相关脚本
- scripts/diagnostics/ - 诊断检查脚本
- scripts/maintenance/ - 维护清理脚本
- scripts/network/ - 网络相关脚本

详细清理报告：.archived/CLEANUP_REPORT.md
"

# 推送到 GitHub
git push origin main
```

---

## ⚠️ 重要提示

### 1. 关于 .archived 目录

由于 `.archived/` 已添加到 `.gitignore`，这个目录**不会被提交到 GitHub**。这是设计的行为，因为：
- 归档内容是历史记录，不需要版本控制
- 可以节省仓库空间
- 本地保留即可，方便后续审查

如果你确实想保留某些归档内容到 Git，可以：

```powershell
# 选择性添加某个文件（忽略 gitignore）
git add -f .archived/CLEANUP_REPORT.md

# 或者修改 .gitignore，排除特定文件
# 在 .gitignore 中添加：
# .archived/*
# !.archived/CLEANUP_REPORT.md
```

### 2. 检查是否有遗漏的重要文件

```powershell
# 查看即将被删除的文件列表
git status | Select-String "deleted"

# 如果发现误删除重要文件，可以恢复：
git restore <文件路径>
```

### 3. 大型提交处理

如果提交涉及的文件非常多，GitHub 可能需要一些时间处理：

```powershell
# 如果推送失败，可以尝试增加超时时间
git config http.postBuffer 524288000

# 或者分批推送
git push origin main --verbose
```

---

## 🔍 提交后验证

推送成功后，在 GitHub 上检查：

1. **访问你的 GitHub 仓库**
   - 检查文件结构是否正确
   - 确认旧文件已删除
   - 确认新目录结构已创建

2. **检查 .gitignore 是否生效**
   - `.archived/` 目录应该不可见
   - 这是正常的，表示 gitignore 工作正常

3. **克隆测试（可选）**
   ```powershell
   # 在另一个目录测试克隆
   cd D:\test\
   git clone <你的仓库地址> test_clone
   cd test_clone
   npm install
   npm run dev
   ```

---

## 🎯 团队协作提示

如果你的项目有其他协作者：

### 1. 通知团队成员

在提交后，建议通知团队成员：

```markdown
📢 项目结构重组通知

我们刚刚完成了项目文件的清理和重组。请在拉取最新代码后执行：

1. 拉取最新代码：`git pull origin main`
2. 清理本地缓存：`npm run clean-cache`（如果有）
3. 重新安装依赖：`npm install`
4. 测试项目启动：`npm run dev`

主要变更：
- 删除了过期的 Jest 配置
- 重组了 scripts 目录结构
- 归档了历史文档和日志

详见：.archived/CLEANUP_REPORT.md
```

### 2. 处理合并冲突

如果有其他分支正在开发，可能需要：

```powershell
# 切换到功能分支
git checkout feature-branch

# 合并主分支的清理变更
git merge main

# 解决可能的路径冲突
# 更新脚本路径引用等
```

---

## 📊 提交统计

清理后的项目变更统计（大致）：
- 📁 删除目录：3 个（.attic, .archive, backup）
- 🗑️ 删除文件：200+ 个
- ➕ 新增目录：10+ 个
- 📦 移动文件：300+ 个
- 📝 修改文件：1-2 个

---

## 🆘 常见问题

### Q: 推送失败怎么办？

```powershell
# 检查远程仓库状态
git remote -v

# 拉取最新代码后再推送
git pull origin main --rebase
git push origin main
```

### Q: 如何撤销提交？

如果发现问题，可以撤销：

```powershell
# 撤销最后一次提交（保留文件变更）
git reset --soft HEAD~1

# 撤销最后一次提交（不保留变更，慎用！）
git reset --hard HEAD~1

# 如果已推送，需要强制推送（慎用！）
git push origin main --force
```

### Q: 如何查看提交差异？

```powershell
# 查看最近一次提交的详细变更
git show HEAD

# 查看文件数量统计
git diff --stat HEAD~1 HEAD
```

---

## ✅ 完成

提交完成后，你的项目将：
- ✨ 根目录更加整洁
- 📚 文档结构更清晰
- 🔧 脚本组织更合理
- 🗃️ 历史文件妥善归档
- 🚀 更容易维护和开发

---

*如有疑问，可以查看 .archived/CLEANUP_REPORT.md 获取详细信息*
