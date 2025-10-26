# 测试路由配置
Write-Host "Testing MkSaaS Routes..." -ForegroundColor Cyan

# 定义要测试的URL
$urls = @(
    "http://localhost:3000",
    "http://localhost:3000/",
    "http://localhost:3000/zh-CN",
    "http://localhost:3000/zh-CN/",
    "http://localhost:3000/en",
    "http://localhost:3000/zh-TW"
)

Write-Host "`n测试各个路由路径:" -ForegroundColor Yellow

foreach ($url in $urls) {
    Write-Host "`nTesting: $url" -ForegroundColor Gray
    
    try {
        # 允许重定向
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -MaximumRedirection 5 -TimeoutSec 3 -ErrorAction Stop
        
        Write-Host "  [OK] Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "  --> Final URL: $($response.BaseResponse.ResponseUri)" -ForegroundColor Cyan
        
        # 检查是否包含预期的HTML内容
        $titlePattern = '<title>([^<]+)</title>'
        if ($response.Content -match $titlePattern) {
            $title = $matches[1]
            Write-Host "  --> Title: $title" -ForegroundColor DarkGray
        }
    }
    catch {
        $errorMsg = $_.Exception.Message
        
        if ($errorMsg -like "*308*") {
            Write-Host "  [REDIRECT] 308 Permanent Redirect" -ForegroundColor Yellow
        }
        elseif ($errorMsg -like "*404*") {
            Write-Host "  [ERROR] 404 Not Found" -ForegroundColor Red
        }
        elseif ($errorMsg -like "*timeout*") {
            Write-Host "  [ERROR] Timeout" -ForegroundColor Red
        }
        else {
            Write-Host "  [ERROR] $errorMsg" -ForegroundColor Red
        }
    }
}

Write-Host "`n测试完成!" -ForegroundColor Green
