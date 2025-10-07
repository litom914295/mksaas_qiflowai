# 测试AI Chat API智能解析功能
Write-Host "🧪 测试AI Chat API智能解析..." -ForegroundColor Cyan

$body = @{
    message = "1973年1月7日2点30分男性岳阳"
    sessionId = "test-session-123"
} | ConvertTo-Json

Write-Host "`n📤 发送请求..." -ForegroundColor Yellow
Write-Host "URL: http://localhost:3000/api/ai/chat"
Write-Host "Body: $body"

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/ai/chat" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -TimeoutSec 30
    
    Write-Host "`n✅ 响应成功！" -ForegroundColor Green
    Write-Host "`n📥 响应内容：" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10
    
    if ($response.data.response -like "*已为您自动完成八字分析*") {
        Write-Host "`n🎉 智能解析成功！自动完成了八字分析！" -ForegroundColor Green
    } elseif ($response.data.response -like "*请先进行八字分析*") {
        Write-Host "`n❌ 智能解析失败！还是返回了旧的提示消息！" -ForegroundColor Red
        Write-Host "   这说明代码没有被执行或者有错误" -ForegroundColor Yellow
    } else {
        Write-Host "`n⚠️  收到了其他响应" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "`n❌ 请求失败！" -ForegroundColor Red
    Write-Host "错误信息: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n请确保开发服务器正在运行 (npm run dev)" -ForegroundColor Yellow
}

Write-Host "`n" -NoNewline
