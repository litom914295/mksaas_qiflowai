# 启用增强版个性化风水报告
# 作用：将 xuankong 的优秀风水分析整合进 unified-form 流程

Write-Host "================================" -ForegroundColor Cyan
Write-Host "启用个性化风水分析增强版" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$reportDir = "app\[locale]\(routes)\report"
$currentFile = "$reportDir\page.tsx"
$enhancedFile = "$reportDir\page-enhanced.tsx"
$backupFile = "$reportDir\page.backup.tsx"

# 检查文件是否存在
if (-not (Test-Path $enhancedFile)) {
    Write-Host "❌ 错误：找不到增强版文件 $enhancedFile" -ForegroundColor Red
    exit 1
}

# 备份原文件
if (Test-Path $currentFile) {
    Write-Host "📦 备份原文件..." -ForegroundColor Yellow
    Copy-Item $currentFile $backupFile -Force
    Write-Host "✅ 备份完成: $backupFile" -ForegroundColor Green
} else {
    Write-Host "⚠️  原文件不存在，直接创建新文件" -ForegroundColor Yellow
}

# 替换文件
Write-Host ""
Write-Host "🔄 替换为增强版..." -ForegroundColor Yellow
Copy-Item $enhancedFile $currentFile -Force
Write-Host "✅ 替换完成!" -ForegroundColor Green

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✨ 增强功能已启用！" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "新增功能：" -ForegroundColor Cyan
Write-Host "  ✅ 三个标签页：八字命理 | 个性化风水 | 整合建议" -ForegroundColor White
Write-Host "  ✅ 基于用户八字五行的个性化风水分析" -ForegroundColor White
Write-Host "  ✅ 喜用神 + 风水吉位 = 双重增强" -ForegroundColor White
Write-Host "  ✅ 忌神 + 风水凶位 = 智能规避" -ForegroundColor White
Write-Host "  ✅ 具体可执行的优化步骤" -ForegroundColor White
Write-Host ""

Write-Host "下一步：" -ForegroundColor Cyan
Write-Host "  1. 运行 'npm run dev' 启动开发服务器" -ForegroundColor White
Write-Host "  2. 访问 http://localhost:3000/zh-CN/unified-form" -ForegroundColor White
Write-Host "  3. 填写完整表单（包括房屋信息）" -ForegroundColor White
Write-Host "  4. 查看个性化分析报告" -ForegroundColor White
Write-Host ""

Write-Host "如需回退：" -ForegroundColor Yellow
Write-Host "  运行 'Copy-Item $backupFile $currentFile -Force'" -ForegroundColor White
Write-Host ""

Write-Host "💡 提示：记得更新 BaziAnalysisResult 组件以支持 onAnalysisComplete 回调" -ForegroundColor Magenta
Write-Host ""
