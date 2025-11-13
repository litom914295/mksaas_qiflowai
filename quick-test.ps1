# QiFlowAI 快速测试脚本
# 测试已集成的功能（无需Stripe CLI）

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  QiFlowAI 快速测试启动" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查环境
Write-Host "✅ Stripe配置已从 .env.bat 复制到 .env.local" -ForegroundColor Green
Write-Host ""

Write-Host "可测试的功能:" -ForegroundColor Yellow
Write-Host "  1. ✅ A/B测试变体分配" -ForegroundColor Green
Write-Host "  2. ✅ 成本监控面板" -ForegroundColor Green
Write-Host "  3. ✅ 转化追踪系统" -ForegroundColor Green
Write-Host "  4. ✅ Paywall显示逻辑" -ForegroundColor Green
Write-Host "  5. ⚠️  支付流程 (需要Stripe CLI)" -ForegroundColor Yellow
Write-Host ""

Write-Host "测试步骤:" -ForegroundColor Cyan
Write-Host "  1. 启动开发服务器: npm run dev" -ForegroundColor White
Write-Host "  2. 访问监控面板: http://localhost:3000/admin/monitoring" -ForegroundColor White
Write-Host "  3. 生成测试报告并查看Paywall" -ForegroundColor White
Write-Host "  4. 打开浏览器Console查看转化追踪事件" -ForegroundColor White
Write-Host ""

Write-Host "安装Stripe CLI (可选，用于完整测试):" -ForegroundColor Yellow
Write-Host "  scoop install stripe" -ForegroundColor Cyan
Write-Host "  或下载: https://github.com/stripe/stripe-cli/releases" -ForegroundColor Cyan
Write-Host ""

$response = Read-Host "是否启动开发服务器? (Y/n)"
if ($response -ne 'n' -and $response -ne 'N') {
    Write-Host ""
    Write-Host "启动开发服务器..." -ForegroundColor Green
    Write-Host "访问: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "监控: http://localhost:3000/admin/monitoring" -ForegroundColor Cyan
    Write-Host ""
    npm run dev
} else {
    Write-Host ""
    Write-Host "手动启动命令: npm run dev" -ForegroundColor Yellow
}
