# QiFlowAI 开发服务器启动脚本
# 用于端到端测试

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  QiFlowAI 开发服务器启动" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查Node.js
Write-Host "检查Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js未安装或未添加到PATH" -ForegroundColor Red
    Write-Host "请访问: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Node.js版本: $nodeVersion" -ForegroundColor Green

# 检查依赖
Write-Host "检查node_modules..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  未找到node_modules，正在安装依赖..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 依赖安装失败" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ 依赖已就绪" -ForegroundColor Green

# 检查环境变量
Write-Host "检查环境配置..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ 未找到.env.local文件" -ForegroundColor Red
    Write-Host "请参考 @E2E_TEST_EXECUTION_REPORT.md 配置Stripe环境" -ForegroundColor Yellow
    exit 1
}

$envContent = Get-Content ".env.local" -Raw
if ($envContent -notmatch "STRIPE_SECRET_KEY") {
    Write-Host "⚠️  .env.local中缺少Stripe配置" -ForegroundColor Yellow
    Write-Host "请添加以下配置:" -ForegroundColor Yellow
    Write-Host "  STRIPE_SECRET_KEY=sk_test_..." -ForegroundColor Cyan
    Write-Host "  STRIPE_WEBHOOK_SECRET=whsec_..." -ForegroundColor Cyan
    Write-Host "  NEXT_PUBLIC_PRICE_ESSENTIAL_REPORT=price_..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "参考: @E2E_TEST_EXECUTION_REPORT.md" -ForegroundColor Yellow
}

Write-Host "✅ 环境配置文件存在" -ForegroundColor Green
Write-Host ""

# 启动开发服务器
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  启动Next.js开发服务器" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "访问: http://localhost:3000" -ForegroundColor Green
Write-Host "监控: http://localhost:3000/admin/monitoring" -ForegroundColor Green
Write-Host ""
Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Yellow
Write-Host ""

npm run dev
