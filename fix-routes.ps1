# 修复路由结构脚本

Write-Host "开始修复路由结构..." -ForegroundColor Green

# 定义路径
$localeDir = "D:\test\mksaas_qiflowai\src\app\`[locale`]"
$aiChatOld = Join-Path $localeDir "ai-chat"
$analysisOld = Join-Path $localeDir "analysis"

Write-Host "检查当前路径..." -ForegroundColor Yellow

# 检查 ai-chat 是否在错误位置
if (Test-Path $aiChatOld) {
    Write-Host "✓ 找到 ai-chat 目录: $aiChatOld" -ForegroundColor Cyan
    Write-Host "  状态: 在 [locale] 内（正确）" -ForegroundColor Green
} else {
    Write-Host "✗ 未找到 ai-chat 目录" -ForegroundColor Red
}

# 检查 analysis 目录
if (Test-Path $analysisOld) {
    Write-Host "✓ 找到 analysis 目录: $analysisOld" -ForegroundColor Cyan
    Write-Host "  状态: 在 [locale] 内（正确）" -ForegroundColor Green
} else {
    Write-Host "✗ 未找到 analysis 目录" -ForegroundColor Red
}

Write-Host "`n路由应该是：" -ForegroundColor Yellow
Write-Host "  • /zh/ai-chat       → src/app/[locale]/ai-chat"
Write-Host "  • /zh/analysis/bazi → src/app/[locale]/analysis/bazi"
Write-Host "  • /ai-chat          → 需要中间件重定向到 /zh/ai-chat"

Write-Host "`n检查中间件配置..." -ForegroundColor Yellow
$middlewarePath = "D:\test\mksaas_qiflowai\src\middleware.ts"
if (Test-Path $middlewarePath) {
    Write-Host "✓ 找到 middleware.ts" -ForegroundColor Green
} else {
    Write-Host "✗ middleware.ts 不存在" -ForegroundColor Red
}

Write-Host "`n完成！" -ForegroundColor Green
