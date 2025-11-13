# QiFlowAI Stripe Webhook监听启动脚本
# 用于端到端测试

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Stripe Webhook 监听启动" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查Stripe CLI
Write-Host "检查Stripe CLI..." -ForegroundColor Yellow
$stripeVersion = stripe --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Stripe CLI未安装" -ForegroundColor Red
    Write-Host ""
    Write-Host "安装方法:" -ForegroundColor Yellow
    Write-Host "  1. 使用Scoop: scoop install stripe" -ForegroundColor Cyan
    Write-Host "  2. 手动下载: https://github.com/stripe/stripe-cli/releases" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}
Write-Host "✅ Stripe CLI版本: $stripeVersion" -ForegroundColor Green

# 检查Stripe登录状态
Write-Host "检查Stripe登录状态..." -ForegroundColor Yellow
stripe config --list 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  未登录Stripe，正在启动登录..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "请在浏览器中完成授权" -ForegroundColor Cyan
    Write-Host ""
    stripe login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Stripe登录失败" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Stripe已登录" -ForegroundColor Green
Write-Host ""

# 启动Webhook监听
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  启动Webhook监听" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "监听地址: http://localhost:3000/api/webhooks/stripe" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  重要: 复制下方的 webhook signing secret 并更新到 .env.local" -ForegroundColor Yellow
Write-Host "格式: STRIPE_WEBHOOK_SECRET=whsec_xxxxx" -ForegroundColor Cyan
Write-Host ""
Write-Host "按 Ctrl+C 停止监听" -ForegroundColor Yellow
Write-Host ""

stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
