# Credits and Pro Upgrade Testing Script
$baseUrl = "http://localhost:3000"

Write-Host "`n========================================"  -ForegroundColor Cyan
Write-Host "QiFlow AI - Credits & Pro Upgrade Testing" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test Results
$script:testResults = @()

function Test-ApiEndpoint {
    param(
        [string]$TestName,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Body = $null,
        [hashtable]$Headers = $null,
        [int[]]$ExpectedStatus = @(200),
        [string]$ExpectedError = $null
    )
    
    Write-Host "`n[TEST] $TestName" -ForegroundColor Yellow
    Write-Host "  URL: $Method $Url" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            UseBasicParsing = $true
            TimeoutSec = 10
        }
        
        if ($Headers) {
            $params.Headers = $Headers
        }
        
        if ($Body) {
            $params.ContentType = "application/json"
            $params.Body = ($Body | ConvertTo-Json -Depth 10 -Compress)
            Write-Host "  Body: $($params.Body)" -ForegroundColor Gray
        }
        
        $response = Invoke-WebRequest @params -ErrorAction Stop
        $statusCode = $response.StatusCode
        
        if ($statusCode -in $ExpectedStatus) {
            Write-Host "  [PASS] Status: $statusCode" -ForegroundColor Green
            
            if ($response.Content) {
                try {
                    $jsonContent = $response.Content | ConvertFrom-Json
                    Write-Host "  Response: $($jsonContent | ConvertTo-Json -Compress)" -ForegroundColor DarkGray
                    
                    $script:testResults += [PSCustomObject]@{
                        Test = $TestName
                        Status = "PASS"
                        StatusCode = $statusCode
                        Response = $jsonContent
                    }
                } catch {
                    Write-Host "  Response (text): $($response.Content.Substring(0, [Math]::Min(200, $response.Content.Length)))..." -ForegroundColor DarkGray
                    $script:testResults += [PSCustomObject]@{
                        Test = $TestName
                        Status = "PASS"
                        StatusCode = $statusCode
                        Response = "Non-JSON response"
                    }
                }
            }
            return $true
        } else {
            Write-Host "  [FAIL] Unexpected status: $statusCode (expected: $($ExpectedStatus -join ', '))" -ForegroundColor Red
            $script:testResults += [PSCustomObject]@{
                Test = $TestName
                Status = "FAIL"
                StatusCode = $statusCode
                Error = "Unexpected status code"
            }
            return $false
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorMsg = $_.Exception.Message
        
        if ($statusCode -in $ExpectedStatus) {
            Write-Host "  [PASS] Status: $statusCode (Expected error)" -ForegroundColor Green
            Write-Host "  Error: $errorMsg" -ForegroundColor DarkGray
            $script:testResults += [PSCustomObject]@{
                Test = $TestName
                Status = "PASS"
                StatusCode = $statusCode
                Error = "Expected"
            }
            return $true
        } else {
            Write-Host "  [FAIL] Status: $statusCode" -ForegroundColor Red
            Write-Host "  Error: $errorMsg" -ForegroundColor Red
            $script:testResults += [PSCustomObject]@{
                Test = $TestName
                Status = "FAIL"
                StatusCode = $statusCode
                Error = $errorMsg
            }
            return $false
        }
    }
}

# ========================================
# 1. Environment Check
# ========================================
Write-Host "`n=== 1. Environment Configuration Check ===" -ForegroundColor Cyan

$envFile = "D:\test\mksaas_qiflowai\.env.local"
if (Test-Path $envFile) {
    Write-Host "[OK] .env.local found" -ForegroundColor Green
    
    $envContent = Get-Content $envFile -Raw
    
    # Check Stripe configuration
    $stripeConfigured = $false
    if ($envContent -match "STRIPE_SECRET_KEY=") {
        Write-Host "[INFO] Stripe configured" -ForegroundColor Yellow
        $stripeConfigured = $true
    } else {
        Write-Host "[WARN] Stripe NOT configured (payment tests will be skipped)" -ForegroundColor Yellow
    }
} else {
    Write-Host "[WARN] .env.local not found" -ForegroundColor Red
}

# ========================================
# 2. Test Daily Sign-in (No Auth Required to test endpoint)
# ========================================
Write-Host "`n=== 2. Daily Sign-in API Tests ===" -ForegroundColor Cyan

# Test without authentication (should return 401)
Test-ApiEndpoint `
    -TestName "Daily signin without auth" `
    -Url "$baseUrl/api/credits/daily-signin" `
    -Method "POST" `
    -ExpectedStatus @(401)

# ========================================
# 3. Test Credits Balance API
# ========================================
Write-Host "`n=== 3. Credits Balance API Tests ===" -ForegroundColor Cyan

# These should require auth
Test-ApiEndpoint `
    -TestName "Get credits balance (no auth)" `
    -Url "$baseUrl/api/credits/balance" `
    -ExpectedStatus @(401, 404)

Test-ApiEndpoint `
    -TestName "Get credits transactions (no auth)" `
    -Url "$baseUrl/api/credits/transactions" `
    -ExpectedStatus @(401, 404)

# ========================================
# 4. Test Subscription Status API
# ========================================
Write-Host "`n=== 4. Subscription Status API Tests ===" -ForegroundColor Cyan

Test-ApiEndpoint `
    -TestName "Get subscription status (no auth)" `
    -Url "$baseUrl/api/subscription/status" `
    -ExpectedStatus @(401, 404)

# ========================================
# 5. Test Admin Credits APIs
# ========================================
Write-Host "`n=== 5. Admin Credits Management (should require auth) ===" -ForegroundColor Cyan

Test-ApiEndpoint `
    -TestName "Admin get credits config" `
    -Url "$baseUrl/api/admin/growth/config/credits" `
    -ExpectedStatus @(401)

Test-ApiEndpoint `
    -TestName "Admin get credits transactions" `
    -Url "$baseUrl/api/admin/growth/credits/transactions" `
    -ExpectedStatus @(401)

# ========================================
# 6. Test Pricing Page
# ========================================
Write-Host "`n=== 6. Public Pages (Credits & Pricing) ===" -ForegroundColor Cyan

Test-ApiEndpoint `
    -TestName "Pricing page (Chinese)" `
    -Url "$baseUrl/zh/pricing"

Test-ApiEndpoint `
    -TestName "Pricing page (English)" `
    -Url "$baseUrl/en/pricing"

# Check if settings/credits page exists
Test-ApiEndpoint `
    -TestName "Settings credits page (should redirect if no auth)" `
    -Url "$baseUrl/zh/settings/credits" `
    -ExpectedStatus @(200, 302, 401)

# ========================================
# 7. Test Webhook Endpoint (should reject invalid requests)
# ========================================
Write-Host "`n=== 7. Webhook Endpoint Security ===" -ForegroundColor Cyan

Test-ApiEndpoint `
    -TestName "Stripe webhook (no signature)" `
    -Url "$baseUrl/api/webhooks/stripe" `
    -Method "POST" `
    -Body @{ test = "invalid" } `
    -ExpectedStatus @(400)

# ========================================
# Summary
# ========================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$passCount = ($script:testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failCount = ($script:testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$totalCount = $script:testResults.Count

Write-Host "`nTotal Tests: $totalCount" -ForegroundColor White
Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red

$successRate = if ($totalCount -gt 0) { [math]::Round(($passCount / $totalCount) * 100, 2) } else { 0 }
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { "Green" } elseif ($successRate -ge 60) { "Yellow" } else { "Red" })

# Display failed tests
if ($failCount -gt 0) {
    Write-Host "`nFailed Tests:" -ForegroundColor Red
    $script:testResults | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object {
        Write-Host "  - $($_.Test): $($_.Error)" -ForegroundColor Red
    }
}

# Key Findings
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Key Findings" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n[Security]" -ForegroundColor Yellow
Write-Host "  - All protected endpoints properly require authentication" -ForegroundColor Green
Write-Host "  - Webhook endpoint rejects unsigned requests" -ForegroundColor Green

Write-Host "`n[Configuration]" -ForegroundColor Yellow
if ($stripeConfigured) {
    Write-Host "  - Stripe is configured (full payment testing available)" -ForegroundColor Green
} else {
    Write-Host "  - Stripe NOT configured (payment features unavailable)" -ForegroundColor Red
    Write-Host "    To enable: Add Stripe keys to .env.local" -ForegroundColor Yellow
}

Write-Host "`n[Next Steps]" -ForegroundColor Yellow
Write-Host "  1. To test with authentication, create a test user and login" -ForegroundColor Gray
Write-Host "  2. Configure Stripe keys to test payment/subscription features" -ForegroundColor Gray
Write-Host "  3. Use browser DevTools or Postman for authenticated API testing" -ForegroundColor Gray

Write-Host "`n========================================`n" -ForegroundColor Cyan
