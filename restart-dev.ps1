# 重启开发服务器脚本

Write-Host "🛑 停止所有Node进程..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "🗑️  清除.next缓存..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "✓ 缓存已清除" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 启动开发服务器..." -ForegroundColor Cyan
Write-Host "请等待编译完成后，访问: http://localhost:3000/zh-CN/ai-chat" -ForegroundColor Cyan
Write-Host ""

npm run dev
