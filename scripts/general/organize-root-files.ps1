#!/usr/bin/env pwsh
# 整理根目录文件：
# 1. 将 PS1 脚本移动到 scripts/ 目录
# 2. 将 AI 编程配置文件恢复到根目录

param(
    [switch]$DryRun = $false
)

$ErrorActionPreference = 'Stop'

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "  整理根目录文件" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host ">>> 模拟运行模式 <<<`n" -ForegroundColor Yellow
}

# 统计
$stats = @{
    ScriptsMoved = 0
    AIFilesMoved = 0
}

# ============================================
# 第一部分：整理 PS1 脚本到 scripts/
# ============================================

Write-Host "第一部分：整理 PS1 脚本" -ForegroundColor Green
Write-Host "----------------------------`n" -ForegroundColor Green

# 需要保留在根目录的脚本（如果有的话）
$keepInRoot = @()

# 脚本分类映射
$scriptCategories = @{
    'test-' = 'testing'
    'start-' = 'development'
    'cleanup-' = 'maintenance'
    'add-defender-' = 'setup'
    'auto-generate-' = 'automation'
}

# 获取根目录的 PS1 脚本
$ps1Scripts = Get-ChildItem -Path . -File -Filter "*.ps1" | 
    Where-Object { $keepInRoot -notcontains $_.Name }

foreach ($script in $ps1Scripts) {
    $scriptName = $script.Name
    
    # 确定目标子目录
    $targetSubDir = 'general'
    foreach ($prefix in $scriptCategories.Keys) {
        if ($scriptName -like "$prefix*") {
            $targetSubDir = $scriptCategories[$prefix]
            break
        }
    }
    
    $targetDir = "scripts\$targetSubDir"
    $targetPath = Join-Path $targetDir $scriptName
    
    if ($DryRun) {
        Write-Host "[DRY-RUN] 移动: $scriptName -> $targetDir" -ForegroundColor Yellow
    } else {
        # 确保目标目录存在
        if (-not (Test-Path $targetDir)) {
            New-Item -Path $targetDir -ItemType Directory -Force | Out-Null
        }
        
        # 如果目标已存在，重命名
        if (Test-Path $targetPath) {
            $timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
            $newName = "$($scriptName.Replace('.ps1', ''))-$timestamp.ps1"
            $targetPath = Join-Path $targetDir $newName
            Write-Host "  目标已存在，重命名为: $newName" -ForegroundColor Yellow
        }
        
        Move-Item -Path $script.FullName -Destination $targetPath -Force
        Write-Host "✓ 已移动: $scriptName -> $targetDir" -ForegroundColor Green
    }
    
    $stats.ScriptsMoved++
}

# ============================================
# 第二部分：恢复 AI 编程配置文件到根目录
# ============================================

Write-Host "`n第二部分：恢复 AI 编程配置文件" -ForegroundColor Green
Write-Host "----------------------------`n" -ForegroundColor Green

# AI 编程工具配置文件列表
$aiConfigFiles = @(
    @{
        Source = 'docs\archive\reports\uncategorized\CLAUDE.md'
        Target = 'CLAUDE.md'
        Description = 'Claude AI 编程助手配置'
    },
    @{
        Source = 'docs\archive\reports\uncategorized\AGENTS.md'
        Target = 'AGENTS.md'
        Description = 'OpenSpec AI 代理配置'
    }
)

foreach ($fileInfo in $aiConfigFiles) {
    $sourcePath = $fileInfo.Source
    $targetPath = $fileInfo.Target
    $description = $fileInfo.Description
    
    if (-not (Test-Path $sourcePath)) {
        Write-Host "⚠ 源文件不存在，跳过: $sourcePath" -ForegroundColor Yellow
        continue
    }
    
    if ($DryRun) {
        Write-Host "[DRY-RUN] 恢复: $targetPath ($description)" -ForegroundColor Yellow
    } else {
        # 如果根目录已存在同名文件，备份
        if (Test-Path $targetPath) {
            $timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
            $backupName = "$targetPath.backup-$timestamp"
            Copy-Item -Path $targetPath -Destination $backupName -Force
            Write-Host "  已备份现有文件为: $backupName" -ForegroundColor Yellow
        }
        
        Move-Item -Path $sourcePath -Destination $targetPath -Force
        Write-Host "✓ 已恢复: $targetPath ($description)" -ForegroundColor Green
    }
    
    $stats.AIFilesMoved++
}

# ============================================
# 统计信息
# ============================================

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "  整理统计" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "PS1 脚本已整理: $($stats.ScriptsMoved)" -ForegroundColor Green
Write-Host "AI 配置文件已恢复: $($stats.AIFilesMoved)" -ForegroundColor Green
Write-Host "======================================`n" -ForegroundColor Cyan

# 显示根目录当前状态
Write-Host "根目录当前文件统计:" -ForegroundColor Cyan
$rootFiles = Get-ChildItem -Path . -File
Write-Host "  总文件数: $($rootFiles.Count)" -ForegroundColor White
Write-Host "  MD 文档: $(($rootFiles | Where-Object { $_.Extension -eq '.md' }).Count)" -ForegroundColor White
Write-Host "  PS1 脚本: $(($rootFiles | Where-Object { $_.Extension -eq '.ps1' }).Count)" -ForegroundColor White
Write-Host "  配置文件: $(($rootFiles | Where-Object { $_.Name -match '^\.' -or $_.Extension -match '^\.json$|^\.config\.' }).Count)" -ForegroundColor White

Write-Host "`n整理完成！" -ForegroundColor Green

if ($DryRun) {
    Write-Host "`n提示: 这是模拟运行。要实际执行整理，请运行:" -ForegroundColor Yellow
    Write-Host "  .\organize-root-files.ps1" -ForegroundColor White
}
