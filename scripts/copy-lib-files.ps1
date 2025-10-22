# 一键复制所有缺失的 lib 文件
# Copy all missing lib files from qiflow-ai to current project

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  完整八字分析组件 Lib 文件复制脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$sourceRoot = "D:\test\mksaas_qiflowai\qiflow-ai\src\lib"
$targetRoot = "D:\test\mksaas_qiflowai\src\lib"

# 定义需要复制的库目录
$libDirs = @(
    "fengshui",
    "compass",
    "bazi",
    "space-mapping",
    "image-processing",
    "reports"
)

$copiedCount = 0
$skippedCount = 0
$errorCount = 0

foreach ($dir in $libDirs) {
    $sourcePath = Join-Path $sourceRoot $dir
    $targetPath = Join-Path $targetRoot $dir
    
    Write-Host "检查: $dir" -ForegroundColor Yellow
    
    if (Test-Path $sourcePath) {
        if (Test-Path $targetPath) {
            Write-Host "  ⚠️  目标已存在，跳过: $dir" -ForegroundColor Gray
            $skippedCount++
        }
        else {
            try {
                Copy-Item $sourcePath $targetPath -Recurse -Force
                Write-Host "  ✅ 成功复制: $dir" -ForegroundColor Green
                $copiedCount++
            }
            catch {
                Write-Host "  ❌ 复制失败: $dir" -ForegroundColor Red
                Write-Host "     错误: $_" -ForegroundColor Red
                $errorCount++
            }
        }
    }
    else {
        Write-Host "  ⚠️  源文件不存在，跳过: $dir" -ForegroundColor Gray
        $skippedCount++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  复制完成" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ 成功复制: $copiedCount 个库" -ForegroundColor Green
Write-Host "⚠️  跳过: $skippedCount 个库" -ForegroundColor Yellow
Write-Host "❌ 失败: $errorCount 个库" -ForegroundColor Red
Write-Host ""

if ($errorCount -eq 0 -and $copiedCount -gt 0) {
    Write-Host "🎉 所有库文件复制成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "下一步:" -ForegroundColor Cyan
    Write-Host "1. 运行 npm run dev 启动开发服务器" -ForegroundColor White
    Write-Host "2. 访问 http://localhost:3001/zh-CN/guest-analysis" -ForegroundColor White
    Write-Host "3. 测试完整的八字分析功能" -ForegroundColor White
}
elseif ($copiedCount -eq 0 -and $skippedCount -gt 0) {
    Write-Host "ℹ️  所有文件已存在，无需复制" -ForegroundColor Blue
}
else {
    Write-Host "⚠️  部分文件复制失败，请检查错误信息" -ForegroundColor Yellow
}

Write-Host ""
