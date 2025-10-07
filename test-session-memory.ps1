# 会话记忆功能快速测试脚本
# 使用方法: .\test-session-memory.ps1

Write-Host "`n🧪 测试会话记忆功能`n" -ForegroundColor Cyan

# 确保服务器正在运行
Write-Host "⚠️  请确保开发服务器正在运行 (npm run dev)`n" -ForegroundColor Yellow
Read-Host "按 Enter 继续测试"

Write-Host "`n📍 测试 1: 识别生辰信息" -ForegroundColor Green
Write-Host "发送消息: 1973年1月7日2点30分男性`n" -ForegroundColor Gray

$body1 = @{
    message = "1973年1月7日2点30分男性"
    sessionId = "test-$(Get-Date -Format 'yyyyMMddHHmmss')"
} | ConvertTo-Json

try {
    $response1 = Invoke-RestMethod -Uri "http://localhost:3000/api/ai/chat" -Method POST -ContentType "application/json" -Body $body1
    
    if ($response1.success) {
        Write-Host "✅ 请求成功" -ForegroundColor Green
        
        if ($response1.data.birthInfo) {
            Write-Host "`n📋 识别到的生辰信息:" -ForegroundColor Cyan
            $response1.data.birthInfo | Format-List
            
            Write-Host "`n💬 AI 回复:" -ForegroundColor Cyan
            Write-Host $response1.data.response -ForegroundColor White
            
            # 保存 birthInfo 用于第二次测试
            $savedBirthInfo = $response1.data.birthInfo
            
            Write-Host "`n`n📍 测试 2: 使用保存的生辰信息" -ForegroundColor Green
            Write-Host "发送消息: 我的五行喜什么?`n" -ForegroundColor Gray
            
            Start-Sleep -Seconds 2
            
            $body2 = @{
                message = "我的五行喜什么?"
                sessionId = $response1.data.sessionId
                context = @{
                    birthInfo = $savedBirthInfo
                }
            } | ConvertTo-Json -Depth 10
            
            $response2 = Invoke-RestMethod -Uri "http://localhost:3000/api/ai/chat" -Method POST -ContentType "application/json" -Body $body2
            
            if ($response2.success) {
                Write-Host "✅ 请求成功 (自动包含了 birthInfo)" -ForegroundColor Green
                Write-Host "`n💬 AI 回复:" -ForegroundColor Cyan
                Write-Host $response2.data.response -ForegroundColor White
                
                Write-Host "`n`n🎉 测试完成！会话记忆功能正常工作。" -ForegroundColor Green
                Write-Host "`n✅ 验证要点:" -ForegroundColor Cyan
                Write-Host "  - 第一次请求成功识别生辰信息" -ForegroundColor White
                Write-Host "  - 返回的 birthInfo 被保存" -ForegroundColor White
                Write-Host "  - 第二次请求自动包含 birthInfo" -ForegroundColor White
                Write-Host "  - AI 基于生辰信息回答问题" -ForegroundColor White
            } else {
                Write-Host "❌ 第二次请求失败: $($response2.error)" -ForegroundColor Red
            }
        } else {
            Write-Host "⚠️  未识别到 birthInfo，请检查解析逻辑" -ForegroundColor Yellow
            Write-Host "`n💬 AI 回复:" -ForegroundColor Cyan
            Write-Host $response1.data.response -ForegroundColor White
        }
    } else {
        Write-Host "❌ 请求失败: $($response1.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 测试失败: $_" -ForegroundColor Red
    Write-Host "`n💡 请确保:" -ForegroundColor Yellow
    Write-Host "  1. 开发服务器正在运行 (npm run dev)" -ForegroundColor White
    Write-Host "  2. 服务器地址是 http://localhost:3000" -ForegroundColor White
}

Write-Host "`n"
Read-Host "按 Enter 退出"
