# 服务器综合测试脚本
$baseUrl = "http://localhost:3000"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "QiFlow AI 服务器测试" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 测试计数器
$totalTests = 0
$passedTests = 0
$failedTests = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Body = $null,
        [int[]]$ExpectedStatus = @(200)
    )
    
    $global:totalTests++
    Write-Host "[测试 $totalTests] $Name" -NoNewline
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $params.ContentType = "application/json"
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-WebRequest @params -ErrorAction Stop
        
        if ($response.StatusCode -in $ExpectedStatus) {
            Write-Host " [PASS] ($($response.StatusCode))" -ForegroundColor Green
            $global:passedTests++
            return $true
        } else {
            Write-Host " [FAIL] (Status: $($response.StatusCode))" -ForegroundColor Red
            $global:failedTests++
            return $false
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -in $ExpectedStatus) {
            Write-Host " [PASS] ($statusCode - Expected error)" -ForegroundColor Green
            $global:passedTests++
            return $true
        } else {
            Write-Host " [FAIL] ($($_.Exception.Message))" -ForegroundColor Red
            $global:failedTests++
            return $false
        }
    }
}

# 1. 基础健康检查
Write-Host "`n=== 基础健康检查 ===" -ForegroundColor Yellow
Test-Endpoint -Name "健康检查端点" -Url "$baseUrl/api/health"
Test-Endpoint -Name "首页 (根路径)" -Url "$baseUrl/"
Test-Endpoint -Name "中文首页" -Url "$baseUrl/zh"
Test-Endpoint -Name "英文首页" -Url "$baseUrl/en"

# 2. 国际化路由测试
Write-Host "`n=== 国际化路由测试 ===" -ForegroundColor Yellow
Test-Endpoint -Name "中文定价页面" -Url "$baseUrl/zh/pricing"
Test-Endpoint -Name "英文定价页面" -Url "$baseUrl/en/pricing"
Test-Endpoint -Name "中文关于页面" -Url "$baseUrl/zh/about"
Test-Endpoint -Name "英文关于页面" -Url "$baseUrl/en/about"

# 3. 核心功能页面
Write-Host "`n=== 核心功能页面 ===" -ForegroundColor Yellow
Test-Endpoint -Name "八字分析页面" -Url "$baseUrl/zh/bazi-analysis"
Test-Endpoint -Name "罗盘分析页面" -Url "$baseUrl/zh/compass-analysis"
Test-Endpoint -Name "房屋布局分析页面" -Url "$baseUrl/zh/room-layout"

# 4. API端点测试
Write-Host "`n=== API端点测试 ===" -ForegroundColor Yellow

# AI聊天API
$chatBody = @{
    messages = @(
        @{
            role = "user"
            content = "测试消息"
        }
    )
}
Test-Endpoint -Name "AI聊天API" -Url "$baseUrl/api/ai/chat" -Method "POST" -Body $chatBody

# 需要授权的端点 (预期401)
Test-Endpoint -Name "分析历史API (未授权)" -Url "$baseUrl/api/analysis/check-history" -ExpectedStatus @(401)
Test-Endpoint -Name "管理员用户API (未授权)" -Url "$baseUrl/api/admin/users" -ExpectedStatus @(401)

# 5. 静态资源
Write-Host "`n=== 静态资源 ===" -ForegroundColor Yellow
Test-Endpoint -Name "robots.txt" -Url "$baseUrl/robots.txt"
Test-Endpoint -Name "favicon.ico" -Url "$baseUrl/favicon.ico"

# 6. 错误处理
Write-Host "`n=== 错误处理 ===" -ForegroundColor Yellow
Test-Endpoint -Name "404页面" -Url "$baseUrl/zh/this-page-does-not-exist" -ExpectedStatus @(404)

# 测试结果汇总
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "测试结果汇总" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "总测试数: $totalTests" -ForegroundColor White
Write-Host "通过: $passedTests" -ForegroundColor Green
Write-Host "失败: $failedTests" -ForegroundColor Red

$successRate = [math]::Round(($passedTests / $totalTests) * 100, 2)
Write-Host "成功率: $successRate%" -ForegroundColor $(if ($successRate -ge 90) { "Green" } elseif ($successRate -ge 70) { "Yellow" } else { "Red" })

if ($failedTests -eq 0) {
    Write-Host "`n[SUCCESS] All tests passed! Server is running normally." -ForegroundColor Green
} else {
    Write-Host "`n[WARNING] $failedTests tests failed. Please check." -ForegroundColor Red
}

Write-Host "`n服务器地址: $baseUrl" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
