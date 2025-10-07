# 八字计算详细测试脚本
Write-Host "`n=== 测试八字自动计算功能 ===" -ForegroundColor Cyan

$testData = @{
    message = "1973年1月7日2点30分男性岳阳，我的用神是什么"
    sessionId = "test-detail-$(Get-Date -Format 'HHmmss')"
}

$jsonBody = $testData | ConvertTo-Json
Write-Host "`n请求内容:" -ForegroundColor Yellow
Write-Host $jsonBody

try {
    $response = Invoke-RestMethod `
        -Uri "http://localhost:3000/api/ai/chat" `
        -Method POST `
        -ContentType "application/json;charset=utf-8" `
        -Body ([System.Text.Encoding]::UTF8.GetBytes($jsonBody))
    
    Write-Host "`n✅ 请求成功" -ForegroundColor Green
    
    # 检查响应结构
    Write-Host "`n响应结构:" -ForegroundColor Cyan
    Write-Host "success: $($response.success)"
    
    if ($response.data) {
        Write-Host "`n数据字段:" -ForegroundColor Yellow
        
        # 显示 birthInfo
        if ($response.data.birthInfo) {
            Write-Host "`nbirthInfo:" -ForegroundColor Cyan
            $response.data.birthInfo | Format-List
        }
        
        # 显示 calculatedBazi 结构
        if ($response.data.calculatedBazi) {
            Write-Host "`n✅ 包含 calculatedBazi 数据" -ForegroundColor Green
            
            # 检查四柱
            if ($response.data.calculatedBazi.fourPillars) {
                Write-Host "`n四柱八字:" -ForegroundColor Cyan
                $fp = $response.data.calculatedBazi.fourPillars
                if ($fp.year) { Write-Host "  年: $($fp.year.stem)$($fp.year.branch)" }
                if ($fp.month) { Write-Host "  月: $($fp.month.stem)$($fp.month.branch)" }
                if ($fp.day) { Write-Host "  日: $($fp.day.stem)$($fp.day.branch)" }
                if ($fp.hour) { Write-Host "  时: $($fp.hour.stem)$($fp.hour.branch)" }
            } elseif ($response.data.calculatedBazi.pillars) {
                Write-Host "`n四柱八字 (pillars):" -ForegroundColor Cyan
                $p = $response.data.calculatedBazi.pillars
                if ($p.year) { Write-Host "  年: $($p.year.stem)$($p.year.branch)" }
                if ($p.month) { Write-Host "  月: $($p.month.stem)$($p.month.branch)" }
                if ($p.day) { Write-Host "  日: $($p.day.stem)$($p.day.branch)" }
                if ($p.hour) { Write-Host "  时: $($p.hour.stem)$($p.hour.branch)" }
            }
            
            # 检查用神
            if ($response.data.calculatedBazi.yongShen) {
                Write-Host "`n用神分析:" -ForegroundColor Cyan
                $ys = $response.data.calculatedBazi.yongShen
                Write-Host "  primary: $($ys.primary)"
                Write-Host "  favorable: $($ys.favorable -join ', ')"
                Write-Host "  unfavorable: $($ys.unfavorable -join ', ')"
            }
        } else {
            Write-Host "`n❌ 没有 calculatedBazi 数据" -ForegroundColor Red
        }
        
        # 显示响应内容（解码后）
        Write-Host "`n响应内容 (UTF-8):" -ForegroundColor Cyan
        $responseText = $response.data.response
        
        # 尝试显示前500个字符
        if ($responseText.Length -gt 500) {
            Write-Host $responseText.Substring(0, 500)
            Write-Host "... (内容已截断，总长度: $($responseText.Length))"
        } else {
            Write-Host $responseText
        }
    }
    
} catch {
    Write-Host "`n❌ 请求失败: $_" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "`n"