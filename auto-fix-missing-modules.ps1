# 自动修复缺失模块脚本
# 自动搜索并复制 xuankong 目录中的组件到 analysis 目录

Write-Host "🔍 自动修复缺失模块工具" -ForegroundColor Cyan
Write-Host "====================================`n"

# 定义源目录和目标目录
$sourceDir = "D:\test\mksaas_qiflowai\src\components\qiflow\xuankong"
$targetDir = "D:\test\mksaas_qiflowai\src\components\qiflow\analysis"

# 获取 xuankong 目录中的所有 .tsx 文件
Write-Host "📂 扫描 xuankong 目录..." -ForegroundColor Yellow
$xuankongFiles = Get-ChildItem -Path $sourceDir -Filter "*.tsx" -File | Where-Object { $_.Name -notlike "*.backup" }

Write-Host "找到 $($xuankongFiles.Count) 个组件文件`n" -ForegroundColor Green

# 显示文件列表
Write-Host "📋 文件列表:" -ForegroundColor Cyan
$xuankongFiles | ForEach-Object {
    Write-Host "  - $($_.Name)" -ForegroundColor Gray
}

Write-Host "`n"

# 检查哪些文件在 analysis 目录中不存在
$missingFiles = @()
foreach ($file in $xuankongFiles) {
    $targetPath = Join-Path $targetDir $file.Name
    if (-not (Test-Path $targetPath)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -eq 0) {
    Write-Host "✅ 所有文件都已存在于 analysis 目录！" -ForegroundColor Green
    Write-Host "`n无需复制。" -ForegroundColor Gray
    exit 0
}

Write-Host "🔍 发现 $($missingFiles.Count) 个缺失的文件:`n" -ForegroundColor Yellow
$missingFiles | ForEach-Object {
    Write-Host "  ❌ $($_.Name)" -ForegroundColor Red
}

Write-Host "`n"

# 询问是否继续
$response = Read-Host "是否复制这些文件到 analysis 目录? (Y/N)"
if ($response -ne 'Y' -and $response -ne 'y') {
    Write-Host "❌ 操作已取消" -ForegroundColor Red
    exit 0
}

Write-Host "`n"

# 执行复制
Write-Host "📦 开始复制文件..." -ForegroundColor Cyan
$successCount = 0
$failCount = 0

foreach ($file in $missingFiles) {
    $sourcePath = $file.FullName
    $targetPath = Join-Path $targetDir $file.Name
    
    try {
        Copy-Item -Path $sourcePath -Destination $targetPath -Force
        Write-Host "  ✅ 已复制: $($file.Name)" -ForegroundColor Green
        $successCount++
    }
    catch {
        Write-Host "  ❌ 失败: $($file.Name) - $($_.Exception.Message)" -ForegroundColor Red
        $failCount++
    }
}

Write-Host "`n"

# 显示结果
Write-Host "====================================`n" -ForegroundColor Cyan
Write-Host "📊 复制结果:" -ForegroundColor Cyan
Write-Host "  ✅ 成功: $successCount" -ForegroundColor Green
Write-Host "  ❌ 失败: $failCount" -ForegroundColor Red
Write-Host "  📁 总计: $($successCount + $failCount)`n"

if ($successCount -gt 0) {
    Write-Host "✨ 复制完成！现在可以运行:" -ForegroundColor Green
    Write-Host "   npm run build`n" -ForegroundColor Yellow
}

if ($failCount -gt 0) {
    Write-Host "⚠️  有 $failCount 个文件复制失败，请检查错误信息。`n" -ForegroundColor Yellow
}
