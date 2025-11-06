# 项目清理计划

**日期**: 2025-01-24  
**项目**: QiFlow AI  
**目标**: 安全清理无效和多余代码，不影响功能

---

## 🎯 清理目标汇总

| 类别 | 数量 | 占用空间 | 风险等级 |
|------|------|----------|----------|
| 归档目录 | 5 | ~18 MB | 低 |
| 测试输出 | 2 | ~0.5 MB | 低 |
| 临时文件 | 2 | ~0.03 MB | 低 |
| 参考模板 | 2 | ~0.02 MB | 低 |
| **总计** | **11** | **~18.5 MB** | **低** |

---

## 📂 第一步：归档/备份目录清理

### ✅ 可安全删除的目录 (低风险)

#### 1. `.archived/` (17.96 MB, 277 文件)
**状态**: ✅ 可删除  
**原因**:
- 已在 `.gitignore` 中配置忽略
- 内容为旧的备份和构建日志
- 保留了重要报告 `CLEANUP_REPORT.md`（已在 .gitignore 中设置例外）

**子目录结构**:
```
.archived/
├── backups/          # 旧备份
├── build-logs/       # 构建日志
├── reference-data/   # 参考数据
├── temp-scripts/     # 临时脚本
└── CLEANUP_REPORT.md # 保留此文件
```

**操作**: 
```powershell
# 方案1：完全删除（最彻底）
Remove-Item -Path .archived -Recurse -Force

# 方案2：仅保留报告文件
$report = Get-Content .archived/CLEANUP_REPORT.md
Remove-Item -Path .archived -Recurse -Force
New-Item -Path .archived -ItemType Directory -Force
$report | Out-File .archived/CLEANUP_REPORT.md
```

---

#### 2. `.archive/` (0 MB, 0 文件 - 但有子目录结构)
**状态**: ⚠️ 需确认  
**原因**:
- 显示为空但包含 `mksaas-migration` 子目录
- 可能是迁移历史记录

**子目录结构**:
```
.archive/
└── mksaas-migration/
    ├── artifacts/
    ├── checklists/
    ├── dashboards/
    └── docs/
```

**操作**: 
```powershell
# 先检查内容
Get-ChildItem -Path .archive/mksaas-migration -Recurse -File | Measure-Object -Property Length -Sum

# 如果确认无重要内容再删除
Remove-Item -Path .archive -Recurse -Force
```

---

#### 3. `.attic/` (0 MB, 0 文件 - 但有日期目录)
**状态**: ✅ 可删除  
**原因**:
- 时间归档目录 (2025-10-26, 2025-10-27)
- 未在配置中引用

**子目录结构**:
```
.attic/
├── 2025-10-26/
│   ├── components/
│   ├── lib/
│   └── public/
└── 2025-10-27/
```

**操作**: 
```powershell
Remove-Item -Path .attic -Recurse -Force
```

---

#### 4. `.backup/` (0.12 MB, 24 文件)
**状态**: ✅ 可删除  
**原因**:
- 小型备份文件
- 未在配置中引用

**操作**: 
```powershell
Remove-Item -Path .backup -Recurse -Force
```

---

#### 5. `backup/` (0 MB, 但有子目录 logos_20251103_231505)
**状态**: ⚠️ 需确认  
**原因**:
- 仅包含 logo 备份
- 可能是资产历史版本

**操作**: 
```powershell
# 检查是否有当前未使用的 logo
Get-ChildItem -Path backup/logos_20251103_231505 -Recurse

# 如果确认删除
Remove-Item -Path backup -Recurse -Force
```

---

## 🧪 第二步：测试输出文件清理

### ✅ 可安全删除的目录 (低风险)

#### 6. `test-results/` (0 MB, 1 文件)
**状态**: ✅ 可删除  
**原因**:
- 测试运行的输出
- 会在下次测试时重新生成

**操作**: 
```powershell
Remove-Item -Path test-results -Recurse -Force
```

---

#### 7. `playwright-report/` (0.49 MB, 1 文件)
**状态**: ✅ 可删除  
**原因**:
- Playwright 测试报告
- 会在下次测试时重新生成

**操作**: 
```powershell
Remove-Item -Path playwright-report -Recurse -Force
```

---

## 📄 第三步：临时和参考文件清理

### ✅ 可安全删除的目录 (低风险)

#### 8. `.source/` (0.03 MB, 2 文件)
**状态**: ✅ 可删除  
**原因**:
- 已在 `.gitignore` 中配置忽略（Fumadocs 临时文件）
- 会自动重新生成

**操作**: 
```powershell
Remove-Item -Path .source -Recurse -Force
```

---

#### 9. `artifacts/` (0.01 MB, 2 文件)
**状态**: ⚠️ 需确认  
**原因**:
- 包含 `C2` 子目录
- 在 `next.config.ts` watchOptions 中被忽略
- 可能是构建或开发输出

**子目录**: `artifacts/C2`

**操作**: 
```powershell
# 先查看内容
Get-ChildItem -Path artifacts -Recurse

# 如果无关键内容则删除
Remove-Item -Path artifacts -Recurse -Force
```

---

#### 10. `mksaas/` (0 MB, 1 文件)
**状态**: ⚠️ 需确认  
**原因**:
- 可能是模板参考
- 在 tsconfig.json 中未被排除

**操作**: 
```powershell
# 先查看文件内容
Get-Content mksaas/*

# 如果无关键依赖则删除
Remove-Item -Path mksaas -Recurse -Force
```

---

#### 11. `openspec/` (0.02 MB, 2 文件)
**状态**: ⚠️ 需确认  
**原因**:
- 可能是 API 规范文件
- 需确认是否被代码引用

**操作**: 
```powershell
# 搜索代码中的引用
Get-ChildItem -Path src -Recurse -Include "*.ts","*.tsx","*.js" | Select-String -Pattern "openspec" -List

# 如果无引用则删除
Remove-Item -Path openspec -Recurse -Force
```

---

## 🔍 第四步：验证引用

### 搜索代码引用的命令

```powershell
# 搜索所有可能的引用
$dirs = @('.archive', '.archived', '.attic', '.backup', 'backup', '.source', 'artifacts', 'mksaas', 'openspec')
foreach ($dir in $dirs) {
    Write-Host "`n=== 搜索 $dir 的引用 ==="
    Get-ChildItem -Path src -Recurse -Include "*.ts","*.tsx","*.js","*.json" | 
        Select-String -Pattern $dir -List
}
```

---

## ✅ 第五步：执行清理

### 阶段 1: 安全删除 (无需确认)

```powershell
# 测试输出
Remove-Item -Path test-results -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path playwright-report -Recurse -Force -ErrorAction SilentlyContinue

# 临时文件
Remove-Item -Path .source -Recurse -Force -ErrorAction SilentlyContinue

# 旧归档
Remove-Item -Path .attic -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path .backup -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "✅ 阶段 1 完成 - 删除了安全的临时文件和测试输出"
```

### 阶段 2: 需要确认的删除

```powershell
# .archived - 保留报告文件
if (Test-Path .archived/CLEANUP_REPORT.md) {
    $report = Get-Content .archived/CLEANUP_REPORT.md
    Remove-Item -Path .archived -Recurse -Force
    New-Item -Path .archived -ItemType Directory -Force
    $report | Out-File .archived/CLEANUP_REPORT.md
    Write-Host "✅ 清理 .archived，保留了报告文件"
}

# .archive - 需要先检查内容
Write-Host "`n⚠️ 请检查 .archive/mksaas-migration 内容："
Get-ChildItem -Path .archive/mksaas-migration -Recurse -File | 
    Select-Object FullName, Length | 
    Format-Table -AutoSize

Read-Host "按 Enter 继续删除，或 Ctrl+C 取消"
Remove-Item -Path .archive -Recurse -Force
```

### 阶段 3: 参考文件清理 (需要验证)

```powershell
# 检查 artifacts, mksaas, openspec 的内容和引用
$checkDirs = @('artifacts', 'mksaas', 'openspec', 'backup')
foreach ($dir in $checkDirs) {
    Write-Host "`n=== 检查 $dir ==="
    if (Test-Path $dir) {
        Get-ChildItem -Path $dir -Recurse
        
        # 搜索引用
        $refs = Get-ChildItem -Path src -Recurse -Include "*.ts","*.tsx","*.js" -ErrorAction SilentlyContinue | 
            Select-String -Pattern $dir -List
        
        if ($refs) {
            Write-Host "⚠️ 发现引用:"
            $refs | ForEach-Object { Write-Host "  - $($_.Path)" }
        } else {
            Write-Host "✅ 未发现引用"
            $confirm = Read-Host "删除 $dir ? (y/n)"
            if ($confirm -eq 'y') {
                Remove-Item -Path $dir -Recurse -Force
                Write-Host "✅ 已删除 $dir"
            }
        }
    }
}
```

---

## 📊 第六步：生成最终报告

```powershell
# 清理前后对比
$before = Get-ChildItem -Recurse -File | Measure-Object -Property Length -Sum
# ... 执行清理 ...
$after = Get-ChildItem -Recurse -File | Measure-Object -Property Length -Sum

Write-Host "`n=== 清理完成报告 ==="
Write-Host "删除文件数: $($before.Count - $after.Count)"
Write-Host "释放空间: $([math]::Round(($before.Sum - $after.Sum) / 1MB, 2)) MB"
```

---

## ⚠️ 注意事项

1. **版本控制**: 所有删除的目录都不在版本控制中（已在 .gitignore）
2. **可恢复性**: 如果需要，可以从 Git 历史恢复
3. **测试验证**: 清理后运行：
   ```powershell
   npm run build
   npm run type-check
   npm run test
   ```
4. **逐步执行**: 建议按阶段执行，每阶段后验证功能

---

## 🎯 预期结果

- 删除约 **18.5 MB** 的冗余文件
- 清理 **~300 个**文件
- 保留所有功能性代码
- 提升项目可维护性

---

## 📝 后续建议

1. 在 `.gitignore` 中添加更多临时文件模式
2. 设置 CI/CD 自动清理测试输出
3. 定期审查和清理归档目录
4. 考虑使用 `knip` 工具查找未使用的代码

---

**批准状态**: ⏳ 等待确认  
**执行状态**: ⏳ 未开始
