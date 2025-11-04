# i18n 优化脚本使用说明

本目录包含用于优化和管理项目国际化（i18n）翻译文件的实用脚本。

## 📜 可用脚本

### 1. `merge-i18n.ts` - 合并翻译文件

**用途**: 合并重复的翻译文件（如 `en.json` + `en-qiflow.json`）

**使用场景**:
- 项目合并或重构时有多个翻译文件源
- 需要整合来自不同分支的翻译

**运行方式**:
```bash
npx tsx scripts/merge-i18n.ts
```

**功能**:
- 深度合并多个 JSON 对象
- 自动删除冗余的源文件
- 显示合并后的键数量统计

---

### 2. `fill-i18n-keys.ts` - 自动补齐翻译键

**用途**: 根据基准语言（英文）自动补齐其他语言文件缺失的翻译键

**使用场景**:
- 在英文文件中添加了新的翻译键
- 需要快速为所有语言创建占位符

**运行方式**:
```bash
npx tsx scripts/fill-i18n-keys.ts
```

**功能**:
- 检测所有语言文件缺失的键
- 使用英文原文作为占位符自动填充
- 删除多余的键（不在基准语言中的键）
- 显示每种语言新增/删除的键数量

**注意**: 补齐后需要人工或 AI 翻译英文占位符

---

### 3. `fix-i18n-issues.ts` - 修复结构问题

**用途**: 修复翻译文件中的结构性问题

**使用场景**:
- 修复大小写冲突的重复键
- 统一数组结构
- 确保所有语言文件结构一致

**运行方式**:
```bash
npx tsx scripts/fix-i18n-issues.ts
```

**功能**:
- 检测并修复重复键（如 `Metadata` vs `metadata`）
- 将对象形式的数组（`keywords.0`, `keywords.1`）转换为真正的 JSON 数组
- 标准化所有语言文件的数据结构

---

### 4. `validate-i18n.ts` - 验证翻译完整性

**用途**: 验证所有语言文件的翻译键完整性

**使用场景**:
- 在提交代码前检查翻译完整性
- CI/CD 流程中自动化检查

**运行方式**:
```bash
npm run validate:i18n
# 或
npx tsx scripts/validate-i18n.ts
```

**功能**:
- 比对所有语言与基准语言（英文）的键结构
- 报告缺失的键
- 报告多余的键
- 显示友好的彩色输出

---

## 🚀 推荐工作流程

### 场景 1: 项目初始化或大规模重构

```bash
# 1. 合并所有重复的翻译文件
npx tsx scripts/merge-i18n.ts

# 2. 补齐所有缺失的键
npx tsx scripts/fill-i18n-keys.ts

# 3. 修复结构问题
npx tsx scripts/fix-i18n-issues.ts

# 4. 验证结果
npm run validate:i18n
```

### 场景 2: 添加新的翻译键

```bash
# 1. 在 messages/en.json 中手动添加新键

# 2. 自动为其他语言补齐
npx tsx scripts/fill-i18n-keys.ts

# 3. 翻译占位符内容（手动或使用 AI）

# 4. 验证
npm run validate:i18n
```

### 场景 3: 日常维护

```bash
# 定期运行验证，确保翻译完整性
npm run validate:i18n
```

---

## ⚠️ 注意事项

### 文件备份
在运行任何脚本前，建议先备份 `messages/` 目录：
```bash
cp -r messages messages.backup
```

### 文件锁定问题
如果脚本报告文件写入失败（UNKNOWN error），请：
1. 关闭所有编辑器和文件浏览器
2. 等待几秒后重新运行
3. 或重启电脑

### Git 冲突
合并或修复脚本会直接修改文件，可能导致 Git 冲突。建议：
1. 在单独的分支上运行脚本
2. 仔细审查 `git diff`
3. 确保没有意外丢失翻译内容

---

## 📊 输出示例

### `merge-i18n.ts`
```
🚀 开始优化 i18n 翻译文件...

📝 步骤 1: 合并英文翻译文件
─────────────────────────────────
✅ 已写入: en.json
📊 英文翻译键总数: 2413
🗑️  已删除: en-qiflow.json
```

### `fill-i18n-keys.ts`
```
📝 处理 zh-CN...
─────────────────────────────────
✅ 已写入: zh-CN.json
📊 最终键数: 2413
✅ 新增: 769 个键
🗑️  删除: 63 个多余键
```

### `validate-i18n.ts`
```
🌐 Validating i18n translations...

✓ en       2413 keys (complete)
✓ zh-CN    2413 keys (complete)
✓ zh-TW    2413 keys (complete)
✓ ja       2413 keys (complete)
✓ ko       2413 keys (complete)
✓ ms-MY    2413 keys (complete)

✅ All translations validated successfully!
```

---

## 🔧 自定义配置

脚本默认使用以下配置：

- **基准语言**: `en`
- **支持的语言**: `['en', 'zh-CN', 'zh-TW', 'ja', 'ko', 'ms-MY']`
- **翻译文件目录**: `messages/`

要修改这些配置，请编辑对应的脚本文件。

---

## 📚 相关文档

- [i18n 使用指南](../docs/i18n-guide.md) - 如何在项目中使用国际化
- [i18n 优化总结](../docs/i18n-optimization-summary.md) - 本次优化的详细总结
- [i18n 迁移报告](../docs/i18n-migration-report.md) - 原始迁移报告

---

**最后更新**: 2025-10-05
