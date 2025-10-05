# QiFlow AI 八字风水项目清理脚本
# 执行前请确保已经备份重要文件

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "QiFlow 项目清理工具 v1.0" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 确认执行
$confirmation = Read-Host "即将开始清理项目，确保已备份重要文件。是否继续？(y/n)"
if ($confirmation -ne 'y') {
    Write-Host "操作已取消" -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "开始执行清理任务..." -ForegroundColor Green
Write-Host ""

# 1. 创建归档目录
Write-Host "[1/5] 创建归档目录..." -ForegroundColor Yellow
$archiveDir = "docs\archive\2025-01"
if (-not (Test-Path $archiveDir)) {
    New-Item -ItemType Directory -Path $archiveDir -Force | Out-Null
    Write-Host "✓ 已创建归档目录: $archiveDir" -ForegroundColor Green
} else {
    Write-Host "✓ 归档目录已存在" -ForegroundColor Gray
}

# 2. 移动临时文档
Write-Host ""
Write-Host "[2/5] 移动临时文档到归档目录..." -ForegroundColor Yellow
$tempDocs = @(
    "*FIX*.md",
    "*ERROR*.md", 
    "*REPORT*.md",
    "*COMPLETE*.md",
    "*PHASE*.md",
    "*SUMMARY*.md",
    "*GUIDE*.md",
    "*SUCCESS*.md",
    "*MIGRATION*.md",
    "*IMPROVEMENT*.md",
    "*FEATURE*.md",
    "*CREDITS*.md"
)

$movedCount = 0
foreach ($pattern in $tempDocs) {
    $files = Get-ChildItem -Path . -Filter $pattern -File 2>$null
    foreach ($file in $files) {
        # Skip our new refactor plan document
        if ($file.Name -eq "@项目改造方案_2025.md") {
            continue
        }
        Move-Item -Path $file.FullName -Destination $archiveDir -Force
        Write-Host "  → 已移动: $($file.Name)" -ForegroundColor Gray
        $movedCount++
    }
}
Write-Host "✓ 共移动 $movedCount 个文档" -ForegroundColor Green

# 3. 删除备份文件
Write-Host ""
Write-Host "[3/5] 删除备份文件..." -ForegroundColor Yellow
$backupFiles = @(
    "src\app\[locale]\analysis\bazi\page-backup.tsx",
    "src\app\[locale]\analysis\bazi\page-simple.tsx",
    "build-log.txt",
    "build-log2.txt"
)

$deletedCount = 0
foreach ($file in $backupFiles) {
    if (Test-Path $file) {
        Remove-Item -Path $file -Force
        Write-Host "  × 已删除: $file" -ForegroundColor Gray
        $deletedCount++
    }
}
Write-Host "✓ 共删除 $deletedCount 个备份文件" -ForegroundColor Green

# 4. 创建测试目录结构
Write-Host ""
Write-Host "[4/5] 整理测试文件..." -ForegroundColor Yellow
$testDirs = @("tests\unit", "tests\e2e", "tests\integration")
foreach ($dir in $testDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  + 创建目录: $dir" -ForegroundColor Gray
    }
}

# 移动测试文件
$testFiles = Get-ChildItem -Path "src" -Recurse -Filter "*.test.ts*" 2>$null
$testCount = 0
foreach ($file in $testFiles) {
    $destPath = "tests\unit\$($file.Name)"
    if (-not (Test-Path $destPath)) {
        Copy-Item -Path $file.FullName -Destination $destPath
        Write-Host "  → 复制测试: $($file.Name)" -ForegroundColor Gray
        $testCount++
    }
}
Write-Host "✓ 整理了 $testCount 个测试文件" -ForegroundColor Green

# 5. 生成清理报告
Write-Host ""
Write-Host "[5/5] 生成清理报告..." -ForegroundColor Yellow
$reportPath = "cleanup-report.txt"
$report = @"
QiFlow 项目清理报告
生成时间: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
=====================================

1. 归档文档: $movedCount 个
   位置: $archiveDir

2. 删除备份: $deletedCount 个

3. 整理测试: $testCount 个
   位置: tests\

4. 下一步建议:
   - 运行 npm run lint:fix 修复代码格式
   - 运行 npm run build 验证构建
   - 查看 @项目改造方案_2025.md 了解详细计划

=====================================
"@

$report | Out-File -FilePath $reportPath -Encoding UTF8
Write-Host "✓ 报告已生成: $reportPath" -ForegroundColor Green

# 完成提示
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ 清理完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "建议执行以下命令继续优化：" -ForegroundColor Yellow
Write-Host "  1. npm run lint:fix    # 修复lint错误" -ForegroundColor Gray
Write-Host "  2. npm run build       # 验证构建" -ForegroundColor Gray
Write-Host "  3. npm run dev         # 启动开发服务器" -ForegroundColor Gray
Write-Host ""
Write-Host "详细改造方案请查看: @项目改造方案_2025.md" -ForegroundColor Cyan
Write-Host ""