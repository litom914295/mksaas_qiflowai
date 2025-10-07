# 快速测试八字计算功能
Write-Host "`n🧪 测试八字自动计算功能`n" -ForegroundColor Cyan

# 测试：一次性输入生辰信息 + 问题
Write-Host "测试输入: 1973年1月7日2点30分男性岳阳，我的用神是什么" -ForegroundColor Yellow

$body = @{
    message = "1973年1月7日2点30分男性岳阳，我的用神是什么"
    sessionId = "test-bazi-$(Get-Date -Format 'HHmmss')"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/ai/chat" -Method POST -ContentType "application/json; charset=utf-8" -Body $body
    
    if ($response.success) {
        Write-Host "`n✅ 请求成功!" -ForegroundColor Green
        
        # 检查是否返回了八字数据
        if ($response.data.calculatedBazi) {
            Write-Host "`n🎯 已计算八字数据!" -ForegroundColor Green
            
            # 显示四柱
            if ($response.data.calculatedBazi.fourPillars) {
                Write-Host "`n四柱八字:" -ForegroundColor Cyan
                $fp = $response.data.calculatedBazi.fourPillars
                Write-Host "  年柱: $($fp.year.stem)$($fp.year.branch)" -ForegroundColor White
                Write-Host "  月柱: $($fp.month.stem)$($fp.month.branch)" -ForegroundColor White
                Write-Host "  日柱: $($fp.day.stem)$($fp.day.branch)" -ForegroundColor White
                Write-Host "  时柱: $($fp.hour.stem)$($fp.hour.branch)" -ForegroundColor White
            }
            
            # 显示用神
            if ($response.data.calculatedBazi.yongShen) {
                Write-Host "`n用神分析:" -ForegroundColor Cyan
                $ys = $response.data.calculatedBazi.yongShen
                Write-Host "  用神: $($ys.primary)" -ForegroundColor Yellow
                Write-Host "  喜用: $($ys.favorable -join ', ')" -ForegroundColor White
                Write-Host "  忌用: $($ys.unfavorable -join ', ')" -ForegroundColor White
            }
        } else {
            Write-Host "`n⚠️ 没有返回八字计算数据" -ForegroundColor Yellow
        }
        
        # 显示AI回复（前500字）
        Write-Host "`n💬 AI回复:" -ForegroundColor Cyan
        $reply = $response.data.response
        if ($reply.Length -gt 500) {
            Write-Host $reply.Substring(0, 500) -ForegroundColor White
            Write-Host "...(回复已截断)" -ForegroundColor Gray
        } else {
            Write-Host $reply -ForegroundColor White
        }
        
        # 检查关键内容
        if ($reply -match "八字|四柱|用神|五行") {
            Write-Host "`n✅ 回复包含八字分析内容!" -ForegroundColor Green
        } else {
            Write-Host "`n❌ 回复没有包含八字分析内容!" -ForegroundColor Red
        }
        
    } else {
        Write-Host "❌ 请求失败: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 测试失败: $_" -ForegroundColor Red
    Write-Host "`n请确保开发服务器正在运行: npm run dev" -ForegroundColor Yellow
}

Write-Host "`n"