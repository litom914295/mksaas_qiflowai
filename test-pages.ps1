# 页面测试脚本
Write-Host "=== QiFlow 页面测试 ===" -ForegroundColor Cyan

# 测试端口
$port = 3000
$baseUrl = "http://localhost:$port"

# 等待服务器就绪
Write-Host "`n1. 检查服务器状态..." -ForegroundColor Yellow
$maxRetries = 5
$retryCount = 0
$serverReady = $false

while ($retryCount -lt $maxRetries -and -not $serverReady) {
    try {
        $response = Invoke-WebRequest -Uri $baseUrl -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $serverReady = $true
            Write-Host "   ✓ 服务器就绪 (端口: $port)" -ForegroundColor Green
        }
    }
    catch {
        $retryCount++
        if ($retryCount -lt $maxRetries) {
            Write-Host "   尝试 $retryCount/$maxRetries - 等待服务器启动..." -ForegroundColor Gray
            Start-Sleep -Seconds 3
        }
    }
}

if (-not $serverReady) {
    Write-Host "   ✗ 服务器未响应，请检查是否正在运行" -ForegroundColor Red
    exit 1
}

# 测试页面列表
$pages = @(
    @{ Name = "首页"; Path = "/" }
    @{ Name = "Showcase"; Path = "/zh/showcase" }
    @{ Name = "飞星测试"; Path = "/zh/test-flying-star" }
    @{ Name = "八字分析"; Path = "/zh/analysis/bazi" }
    @{ Name = "玄空风水"; Path = "/zh/analysis/xuankong" }
)

Write-Host "`n2. 测试页面访问..." -ForegroundColor Yellow
$results = @()

foreach ($page in $pages) {
    $url = "$baseUrl$($page.Path)"
    try {
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        $status = $response.StatusCode
        $size = $response.Content.Length
        
        if ($status -eq 200) {
            Write-Host "   ✓ $($page.Name) - 成功 (大小: $size bytes)" -ForegroundColor Green
            $results += @{ Page = $page.Name; Status = "成功"; Code = $status; Size = $size }
        }
        else {
            Write-Host "   ⚠ $($page.Name) - 状态码: $status" -ForegroundColor Yellow
            $results += @{ Page = $page.Name; Status = "警告"; Code = $status; Size = $size }
        }
    }
    catch {
        Write-Host "   ✗ $($page.Name) - 失败: $($_.Exception.Message)" -ForegroundColor Red
        $results += @{ Page = $page.Name; Status = "失败"; Code = "N/A"; Size = 0 }
    }
    Start-Sleep -Milliseconds 500
}

# 汇总结果
Write-Host "`n3. 测试结果汇总:" -ForegroundColor Yellow
$successCount = ($results | Where-Object { $_.Status -eq "成功" }).Count
$totalCount = $results.Count

Write-Host "   成功: $successCount / $totalCount" -ForegroundColor $(if ($successCount -eq $totalCount) { "Green" } else { "Yellow" })

# 详细结果表格
Write-Host "`n详细结果:" -ForegroundColor Cyan
$results | ForEach-Object {
    Write-Host ("   {0,-15} {1,-8} {2,-10} {3,10} bytes" -f $_.Page, $_.Status, "[$($_.Code)]", $_.Size)
}

# 打开浏览器
Write-Host "`n4. 打开浏览器测试..." -ForegroundColor Yellow
$testUrls = @(
    "$baseUrl/zh/showcase",
    "$baseUrl/zh/test-flying-star"
)

foreach ($url in $testUrls) {
    Write-Host "   打开: $url" -ForegroundColor Gray
    Start-Process $url
    Start-Sleep -Milliseconds 500
}

Write-Host "`n=== 测试完成 ===" -ForegroundColor Cyan
Write-Host "请在浏览器中手动验证页面功能" -ForegroundColor Gray
