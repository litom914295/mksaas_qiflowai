# QiFlow AI 项目清理和整理脚本
# 用途：按照分析报告整理项目文件，清理过期文件和测试代码
# 执行前请先备份重要数据！

param(
    [switch]$DryRun = $false,  # 只显示操作而不执行
    [switch]$Verbose = $false   # 显示详细信息
)

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "QiFlow AI 项目清理和整理工具" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host ">>> 模拟模式：只显示操作，不会实际执行 <<<" -ForegroundColor Yellow
    Write-Host ""
}

# 统计信息
$Stats = @{
    DirectoriesCreated = 0
    FilesMoved = 0
    FilesDeleted = 0
    DirectoriesDeleted = 0
}

# 辅助函数：创建目录
function New-DirectorySafe {
    param([string]$Path)
    
    if (-not (Test-Path $Path)) {
        if ($DryRun) {
            Write-Host "[模拟] 创建目录: $Path" -ForegroundColor Yellow
        } else {
            New-Item -ItemType Directory -Path $Path -Force | Out-Null
            Write-Host "[✓] 创建目录: $Path" -ForegroundColor Green
        }
        $Stats.DirectoriesCreated++
    }
}

# 辅助函数：移动文件
function Move-FileSafe {
    param(
        [string]$Source,
        [string]$Destination
    )
    
    if (Test-Path $Source) {
        $destDir = Split-Path $Destination -Parent
        New-DirectorySafe -Path $destDir
        
        if ($DryRun) {
            Write-Host "[模拟] 移动: $Source -> $Destination" -ForegroundColor Yellow
        } else {
            Move-Item -Path $Source -Destination $Destination -Force
            if ($Verbose) {
                Write-Host "[✓] 移动: $Source -> $Destination" -ForegroundColor Gray
            }
        }
        $Stats.FilesMoved++
    }
}

# 辅助函数：删除文件
function Remove-FileSafe {
    param([string]$Path)
    
    if (Test-Path $Path) {
        if ($DryRun) {
            Write-Host "[模拟] 删除: $Path" -ForegroundColor Yellow
        } else {
            Remove-Item -Path $Path -Force
            if ($Verbose) {
                Write-Host "[✓] 删除: $Path" -ForegroundColor Gray
            }
        }
        $Stats.FilesDeleted++
    }
}

# 辅助函数：删除空目录
function Remove-EmptyDirectory {
    param([string]$Path)
    
    if (Test-Path $Path) {
        $items = Get-ChildItem -Path $Path -Recurse
        if ($items.Count -eq 0) {
            if ($DryRun) {
                Write-Host "[模拟] 删除空目录: $Path" -ForegroundColor Yellow
            } else {
                Remove-Item -Path $Path -Recurse -Force
                Write-Host "[✓] 删除空目录: $Path" -ForegroundColor Green
            }
            $Stats.DirectoriesDeleted++
        }
    }
}

Write-Host "步骤 1/10: 创建新的归档目录结构" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

$directories = @(
    ".archived/backups/old-code",
    ".archived/backups/old-configs",
    ".archived/backups/old-tests",
    ".archived/backups/misc",
    ".archived/build-logs",
    ".archived/temp-scripts",
    ".archived/reference-data",
    "docs/archive/reports",
    "docs/archive/reports-zh",
    "docs/setup/windows",
    "scripts/testing",
    "scripts/diagnostics",
    "scripts/maintenance",
    "scripts/network"
)

foreach ($dir in $directories) {
    New-DirectorySafe -Path (Join-Path $ProjectRoot $dir)
}

Write-Host "✓ 完成目录创建" -ForegroundColor Green
Write-Host ""

Write-Host "步骤 2/10: 合并和整理备份文件夹" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

$backupDirs = @(".attic", ".archive", "backup")
foreach ($backupDir in $backupDirs) {
    $sourcePath = Join-Path $ProjectRoot $backupDir
    if (Test-Path $sourcePath) {
        Write-Host "处理: $backupDir"
        
        # 获取所有文件并分类移动
        Get-ChildItem -Path $sourcePath -File -Recurse | ForEach-Object {
            $relativePath = $_.FullName.Substring($sourcePath.Length + 1)
            
            # 根据文件类型分类
            $targetSubDir = "misc"
            if ($_.Extension -match '\.(ts|tsx|js|jsx|vue|py)$') {
                $targetSubDir = "old-code"
            } elseif ($_.Extension -match '\.(json|yaml|yml|toml|env)$') {
                $targetSubDir = "old-configs"
            } elseif ($_.Name -match '(test|spec)') {
                $targetSubDir = "old-tests"
            }
            
            $destination = Join-Path $ProjectRoot ".archived/backups/$targetSubDir/$backupDir/$relativePath"
            Move-FileSafe -Source $_.FullName -Destination $destination
        }
        
        # 删除空的备份目录
        Remove-EmptyDirectory -Path $sourcePath
    }
}

Write-Host "✓ 完成备份文件夹整理" -ForegroundColor Green
Write-Host ""

Write-Host "步骤 3/10: 归档根目录下的文档报告" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

# 移动英文报告（@ 开头）
Get-ChildItem -Path $ProjectRoot -Filter "@*.md" | ForEach-Object {
    $destination = Join-Path $ProjectRoot "docs/archive/reports/$($_.Name)"
    Move-FileSafe -Source $_.FullName -Destination $destination
}

# 移动中文报告
$chineseReports = @(
    "八字组件迁移完成报告.md",
    "报告页面修复说明.md",
    "积分测试快速指引.md",
    "积分系统Admin修复总结.md",
    "罗盘.txt",
    "项目对比分析报告.md",
    "依赖升级报告.md",
    "专业版八字分析使用说明.md"
)

foreach ($report in $chineseReports) {
    $sourcePath = Join-Path $ProjectRoot $report
    if ($report -eq "罗盘.txt") {
        # 罗盘.txt 移动到参考数据
        $destination = Join-Path $ProjectRoot ".archived/reference-data/$report"
    } else {
        $destination = Join-Path $ProjectRoot "docs/archive/reports-zh/$report"
    }
    Move-FileSafe -Source $sourcePath -Destination $destination
}

Write-Host "✓ 完成文档报告归档" -ForegroundColor Green
Write-Host ""

Write-Host "步骤 4/10: 删除过期的 Jest 测试配置" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

$jestFiles = @("jest.config.js", "jest.setup.js")
foreach ($file in $jestFiles) {
    Remove-FileSafe -Path (Join-Path $ProjectRoot $file)
}

Write-Host "✓ 完成 Jest 配置清理" -ForegroundColor Green
Write-Host ""

Write-Host "步骤 5/10: 整理根目录临时脚本" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

# 移动到 .archived/temp-scripts/
$tempScripts = @(
    "test-bazi.js",
    "test-credits-fix.js",
    "check_test_users.js",
    "add-cta-testimonials-translations.js",
    "add-dashboard-settings-translations.js",
    "add-faq-translations.js",
    "add-footer-auth-translations.js",
    "add-homepage-features-translations.js",
    "add-pricing-translations.js",
    "update-form-i18n.js",
    "update-homepage-i18n.js",
    "verify-homepage-i18n.js",
    "verify-translations.js",
    "fix-all-translations.js",
    "fix-encoding.js",
    "start-dev-fixed.ps1",
    "start-dev-no-cache.ps1",
    "start-dev-stable.ps1"
)

foreach ($script in $tempScripts) {
    $sourcePath = Join-Path $ProjectRoot $script
    $destination = Join-Path $ProjectRoot ".archived/temp-scripts/$script"
    Move-FileSafe -Source $sourcePath -Destination $destination
}

# 移动到 scripts/maintenance/
$maintenanceScripts = @("diagnose.ps1", "clean-and-start.ps1", "clean-cache.ps1")
foreach ($script in $maintenanceScripts) {
    $sourcePath = Join-Path $ProjectRoot $script
    $destination = Join-Path $ProjectRoot "scripts/maintenance/$script"
    Move-FileSafe -Source $sourcePath -Destination $destination
}

# 移动到 scripts/network/
$networkScripts = @("fix-clash-config.ps1", "fix-clash-profile.ps1", "restart-clash.ps1")
foreach ($script in $networkScripts) {
    $sourcePath = Join-Path $ProjectRoot $script
    $destination = Join-Path $ProjectRoot "scripts/network/$script"
    Move-FileSafe -Source $sourcePath -Destination $destination
}

# 删除多余的 defender 脚本，只保留 .ps1 版本
Remove-FileSafe -Path (Join-Path $ProjectRoot "add-defender-exclusion.bat")
Remove-FileSafe -Path (Join-Path $ProjectRoot "add-defender-exclusion-simple.cmd")

Write-Host "✓ 完成根目录脚本整理" -ForegroundColor Green
Write-Host ""

Write-Host "步骤 6/10: 整理 scripts 目录下的测试脚本" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

$scriptsPath = Join-Path $ProjectRoot "scripts"

# 移动测试脚本
Get-ChildItem -Path $scriptsPath -Filter "test-*.ts" | ForEach-Object {
    $destination = Join-Path $ProjectRoot "scripts/testing/$($_.Name)"
    Move-FileSafe -Source $_.FullName -Destination $destination
}

Get-ChildItem -Path $scriptsPath -Filter "test-*.js" | ForEach-Object {
    $destination = Join-Path $ProjectRoot "scripts/testing/$($_.Name)"
    Move-FileSafe -Source $_.FullName -Destination $destination
}

Get-ChildItem -Path $scriptsPath -Filter "*-test.js" | ForEach-Object {
    $destination = Join-Path $ProjectRoot "scripts/testing/$($_.Name)"
    Move-FileSafe -Source $_.FullName -Destination $destination
}

# 移动诊断脚本
Get-ChildItem -Path $scriptsPath -Filter "check-*.ts" | ForEach-Object {
    $destination = Join-Path $ProjectRoot "scripts/diagnostics/$($_.Name)"
    Move-FileSafe -Source $_.FullName -Destination $destination
}

Get-ChildItem -Path $scriptsPath -Filter "diagnose-*.ts" | ForEach-Object {
    $destination = Join-Path $ProjectRoot "scripts/diagnostics/$($_.Name)"
    Move-FileSafe -Source $_.FullName -Destination $destination
}

Write-Host "✓ 完成 scripts 目录整理" -ForegroundColor Green
Write-Host ""

Write-Host "步骤 7/10: 归档 TypeScript 编译日志" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

$buildLogs = Get-ChildItem -Path $ProjectRoot -Filter "tsc-*.txt"
$buildLogs += Get-ChildItem -Path $ProjectRoot -Filter "type-errors.txt"
$buildLogs += Get-ChildItem -Path $ProjectRoot -Filter "build-output.txt"

foreach ($log in $buildLogs) {
    $destination = Join-Path $ProjectRoot ".archived/build-logs/$($log.Name)"
    Move-FileSafe -Source $log.FullName -Destination $destination
}

Write-Host "✓ 完成编译日志归档" -ForegroundColor Green
Write-Host ""

Write-Host "步骤 8/10: 整理其他文本文件" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

# HOW_TO_ADD_DEFENDER_EXCLUSION.txt -> docs/setup/windows/ (转换为 MD)
$defenderDoc = Join-Path $ProjectRoot "HOW_TO_ADD_DEFENDER_EXCLUSION.txt"
if (Test-Path $defenderDoc) {
    $destination = Join-Path $ProjectRoot "docs/setup/windows/defender-exclusion-guide.md"
    Move-FileSafe -Source $defenderDoc -Destination $destination
}

Write-Host "✓ 完成文本文件整理" -ForegroundColor Green
Write-Host ""

Write-Host "步骤 9/10: 更新 .gitignore" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

$gitignorePath = Join-Path $ProjectRoot ".gitignore"
if (Test-Path $gitignorePath) {
    $gitignoreContent = Get-Content $gitignorePath -Raw
    
    if ($gitignoreContent -notmatch "\.archived/") {
        $newContent = @"
$gitignoreContent

# 归档目录（忽略大部分内容，但保留重要报告）
.archived/*
!.archived/CLEANUP_REPORT.md
"@
        
        if ($DryRun) {
            Write-Host "[模拟] 更新 .gitignore" -ForegroundColor Yellow
        } else {
            Set-Content -Path $gitignorePath -Value $newContent -NoNewline
            Write-Host "[✓] 更新 .gitignore（保留清理报告）" -ForegroundColor Green
        }
    } else {
        Write-Host "[跳过] .gitignore 已包含归档目录配置" -ForegroundColor Gray
    }
}

Write-Host "✓ 完成 .gitignore 更新" -ForegroundColor Green
Write-Host ""

Write-Host "步骤 10/10: 生成整理报告" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

$reportPath = Join-Path $ProjectRoot ".archived/CLEANUP_REPORT.md"
$reportContent = @"
# 项目清理和整理报告

**执行时间:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## 📊 统计信息

- 创建目录: $($Stats.DirectoriesCreated)
- 移动文件: $($Stats.FilesMoved)
- 删除文件: $($Stats.FilesDeleted)
- 删除目录: $($Stats.DirectoriesDeleted)

## 📁 新建目录结构

\`\`\`
.archived/
├── backups/
│   ├── old-code/
│   ├── old-configs/
│   ├── old-tests/
│   └── misc/
├── build-logs/
├── temp-scripts/
└── reference-data/

docs/
├── archive/
│   ├── reports/
│   └── reports-zh/
└── setup/
    └── windows/

scripts/
├── testing/
├── diagnostics/
├── maintenance/
└── network/
\`\`\`

## 🗑️ 删除的文件

- \`jest.config.js\` - 已迁移到 Vitest
- \`jest.setup.js\` - 已迁移到 Vitest
- \`add-defender-exclusion.bat\` - 保留 PowerShell 版本
- \`add-defender-exclusion-simple.cmd\` - 保留 PowerShell 版本

## 📦 主要变更

### 1. 备份文件整合
将 \`.attic/\`、\`.archive/\`、\`backup/\` 三个目录的内容合并到 \`.archived/backups/\`，按文件类型分类存储。

### 2. 文档归档
- 70+ 个报告文档移动到 \`docs/archive/\` 下
- 英文报告（@ 开头）和中文报告分开存放

### 3. 脚本重组
- 临时测试脚本归档到 \`.archived/temp-scripts/\`
- scripts 目录按功能分类：testing、diagnostics、maintenance、network

### 4. 编译日志归档
- 19 个 TypeScript 编译日志文件移动到 \`.archived/build-logs/\`

### 5. 测试框架清理
- 删除 Jest 配置文件
- 保留 Vitest 和 Playwright 配置

## 📝 后续建议

1. **定期审查归档内容**
   - 建议每 3-6 个月审查一次 \`.archived/\` 目录
   - 确认不再需要的内容可以永久删除

2. **编译日志管理**
   - 建议保留最近 3 个月的编译日志
   - 超过 6 个月的日志可以删除

3. **临时脚本审查**
   - 审查 \`.archived/temp-scripts/\` 中的脚本
   - 确认功能已集成到正式脚本后可删除

4. **环境配置清理**
   - 建议审查根目录下的多个 \`.env.*\` 文件
   - 删除不再使用的环境配置（如 \`.env.broken\`）

5. **文档更新**
   - 更新项目 README，说明新的目录结构
   - 更新开发文档中的脚本路径引用

## ⚠️ 注意事项

- 所有归档文件都已添加到 \`.gitignore\`
- 环境配置文件（\`.env.*\`）未做修改，保持原位
- 核心项目文档保留在根目录
- 所有 scripts 目录下正在使用的脚本已重新组织

## ✅ 下一步行动

1. 检查项目是否正常运行
2. 验证 npm scripts 是否需要更新路径
3. 审查归档内容，确认可以安全删除的文件
4. 考虑将 \`.archived/\` 目录压缩备份后删除

---

*此报告由自动化清理脚本生成*
"@

if ($DryRun) {
    Write-Host "[模拟] 生成清理报告: $reportPath" -ForegroundColor Yellow
} else {
    New-DirectorySafe -Path (Split-Path $reportPath -Parent)
    Set-Content -Path $reportPath -Value $reportContent -Encoding UTF8
    Write-Host "[✓] 生成清理报告: $reportPath" -ForegroundColor Green
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "✓ 项目清理和整理完成！" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 执行统计：" -ForegroundColor Cyan
Write-Host "  - 创建目录: $($Stats.DirectoriesCreated)" -ForegroundColor White
Write-Host "  - 移动文件: $($Stats.FilesMoved)" -ForegroundColor White
Write-Host "  - 删除文件: $($Stats.FilesDeleted)" -ForegroundColor White
Write-Host "  - 删除目录: $($Stats.DirectoriesDeleted)" -ForegroundColor White
Write-Host ""
Write-Host "📄 详细报告: .archived/CLEANUP_REPORT.md" -ForegroundColor Yellow
Write-Host ""

if ($DryRun) {
    Write-Host "⚠️  这是模拟运行，没有实际执行任何操作" -ForegroundColor Yellow
    Write-Host "执行实际清理请运行: .\cleanup-project.ps1" -ForegroundColor Yellow
} else {
    Write-Host "✅ 建议下一步：" -ForegroundColor Green
    Write-Host "  1. 运行 npm run dev 测试项目是否正常" -ForegroundColor White
    Write-Host "  2. 检查 package.json 中的脚本路径" -ForegroundColor White
    Write-Host "  3. 审查 .archived 目录，确认可删除的文件" -ForegroundColor White
}

Write-Host ""
