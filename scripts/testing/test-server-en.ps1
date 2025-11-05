# Server Comprehensive Test Script
$baseUrl = "http://localhost:3000"

Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "QiFlow AI Server Testing" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test counters
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
    Write-Host "[Test $totalTests] $Name" -NoNewline
    
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
            Write-Host " [PASS] ($statusCode - Expected)" -ForegroundColor Green
            $global:passedTests++
            return $true
        } else {
            Write-Host " [FAIL] Error" -ForegroundColor Red
            $global:failedTests++
            return $false
        }
    }
}

# 1. Basic Health Checks
Write-Host "`n=== Basic Health Checks ===" -ForegroundColor Yellow
Test-Endpoint -Name "Health endpoint" -Url "$baseUrl/api/health"
Test-Endpoint -Name "Home page (root)" -Url "$baseUrl/"
Test-Endpoint -Name "Chinese home" -Url "$baseUrl/zh"
Test-Endpoint -Name "English home" -Url "$baseUrl/en"

# 2. I18n Routes
Write-Host "`n=== I18n Routes ===" -ForegroundColor Yellow
Test-Endpoint -Name "Chinese pricing" -Url "$baseUrl/zh/pricing"
Test-Endpoint -Name "English pricing" -Url "$baseUrl/en/pricing"
Test-Endpoint -Name "Chinese about" -Url "$baseUrl/zh/about"
Test-Endpoint -Name "English about" -Url "$baseUrl/en/about"

# 3. Core Feature Pages
Write-Host "`n=== Core Feature Pages ===" -ForegroundColor Yellow
Test-Endpoint -Name "Bazi analysis page" -Url "$baseUrl/zh/bazi-analysis"
Test-Endpoint -Name "Compass analysis page" -Url "$baseUrl/zh/compass-analysis"
Test-Endpoint -Name "Room layout page" -Url "$baseUrl/zh/room-layout"

# 4. API Endpoint Tests
Write-Host "`n=== API Endpoint Tests ===" -ForegroundColor Yellow

# AI Chat API
$chatBody = @{
    messages = @(
        @{
            role = "user"
            content = "Test message"
        }
    )
}
Test-Endpoint -Name "AI Chat API" -Url "$baseUrl/api/ai/chat" -Method "POST" -Body $chatBody

# Auth required endpoints (expect 401)
Test-Endpoint -Name "Analysis history (no auth)" -Url "$baseUrl/api/analysis/check-history" -ExpectedStatus @(401)
Test-Endpoint -Name "Admin users (no auth)" -Url "$baseUrl/api/admin/users" -ExpectedStatus @(401)

# 5. Static Resources
Write-Host "`n=== Static Resources ===" -ForegroundColor Yellow
Test-Endpoint -Name "robots.txt" -Url "$baseUrl/robots.txt"
Test-Endpoint -Name "favicon.ico" -Url "$baseUrl/favicon.ico"

# 6. Error Handling
Write-Host "`n=== Error Handling ===" -ForegroundColor Yellow
Test-Endpoint -Name "404 page" -Url "$baseUrl/zh/this-page-does-not-exist" -ExpectedStatus @(404)

# Test Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor Red

$successRate = [math]::Round(($passedTests / $totalTests) * 100, 2)
Write-Host "Success rate: $successRate%" -ForegroundColor $(if ($successRate -ge 90) { "Green" } elseif ($successRate -ge 70) { "Yellow" } else { "Red" })

if ($failedTests -eq 0) {
    Write-Host "`n[SUCCESS] All tests passed! Server is running normally." -ForegroundColor Green
} else {
    Write-Host "`n[WARNING] $failedTests tests failed. Please check." -ForegroundColor Red
}

Write-Host "`nServer URL: $baseUrl" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
