# AI Chat Test Script (English Version)
# Test algorithm-first complete flow

$API_URL = "http://localhost:3000/api/qiflow/chat"

Write-Host "Starting AI Chat Function Test" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Gray

# Test 1: Ask Bazi question without data
Write-Host "`nTest 1: Ask Bazi question without data" -ForegroundColor Yellow
$body1 = @{
    message = "What is my favorable element?"
    context = @{}
} | ConvertTo-Json -Compress

Write-Host "Request: $body1" -ForegroundColor Gray

try {
    $response1 = Invoke-WebRequest -Uri $API_URL -Method POST -Body $body1 -ContentType "application/json" -ErrorAction Stop
    $result1 = $response1.Content | ConvertFrom-Json
    
    Write-Host "Response type: $($result1.type)" -ForegroundColor Green
    if ($result1.response) {
        $preview = $result1.response.Substring(0, [Math]::Min(100, $result1.response.Length))
        Write-Host "Response preview: $preview..." -ForegroundColor Green
    }
    
    if ($result1.type -eq "need_birth_info") {
        Write-Host "Test PASSED: Correctly asks for birth info" -ForegroundColor Green
    } else {
        Write-Host "Test FAILED: Expected need_birth_info, got $($result1.type)" -ForegroundColor Red
    }
} catch {
    Write-Host "Request FAILED: $_" -ForegroundColor Red
    Write-Host "Make sure the dev server is running and you are logged in" -ForegroundColor Yellow
}

Start-Sleep -Seconds 1

# Test 2: Provide birth information
Write-Host "`nTest 2: Provide birth information" -ForegroundColor Yellow
$body2 = @{
    message = "1990-01-01 15:30, male, Beijing"
    context = @{}
} | ConvertTo-Json -Compress

Write-Host "Request: $body2" -ForegroundColor Gray

try {
    $response2 = Invoke-WebRequest -Uri $API_URL -Method POST -Body $body2 -ContentType "application/json" -ErrorAction Stop
    $result2 = $response2.Content | ConvertFrom-Json
    
    Write-Host "Response type: $($result2.type)" -ForegroundColor Green
    if ($result2.birthInfo) {
        Write-Host "Birth info saved: $($result2.birthInfo.date) $($result2.birthInfo.time)" -ForegroundColor Green
    }
    if ($result2.calculatedBazi) {
        Write-Host "Bazi calculated successfully" -ForegroundColor Green
    }
    
    if ($result2.type -eq "birth_info_saved") {
        Write-Host "Test PASSED: Birth info saved and Bazi calculated" -ForegroundColor Green
        $global:savedBirthInfo = $result2.birthInfo
        $global:savedBazi = $result2.calculatedBazi
    } else {
        Write-Host "Response type: $($result2.type)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Request FAILED: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Test 3: Ask with existing data
Write-Host "`nTest 3: Ask question with existing data" -ForegroundColor Yellow

$contextData = @{
    birthInfo = @{
        date = "1990-01-01"
        time = "15:30"
        gender = "male"
        location = "Beijing"
    }
}

if ($global:savedBazi) {
    $contextData.calculatedBazi = $global:savedBazi
}

$body3 = @{
    message = "How is my wealth fortune?"
    context = $contextData
} | ConvertTo-Json -Depth 10 -Compress

Write-Host "Request: How is my wealth fortune? (with context)" -ForegroundColor Gray

try {
    $response3 = Invoke-WebRequest -Uri $API_URL -Method POST -Body $body3 -ContentType "application/json" -ErrorAction Stop
    $result3 = $response3.Content | ConvertFrom-Json
    
    Write-Host "Response type: $($result3.type)" -ForegroundColor Green
    Write-Host "Credits used: $($result3.creditsUsed)" -ForegroundColor Green
    if ($result3.response) {
        $preview = $result3.response.Substring(0, [Math]::Min(100, $result3.response.Length))
        Write-Host "Response preview: $preview..." -ForegroundColor Green
    }
    
    if ($result3.type -eq "ai_with_algorithm") {
        Write-Host "Test PASSED: AI response based on algorithm data" -ForegroundColor Green
    } else {
        Write-Host "Response type: $($result3.type)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Request FAILED: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Test 4: Mixed input (birth info + question)
Write-Host "`nTest 4: Mixed input (birth info + question)" -ForegroundColor Yellow
$body4 = @{
    message = "1973-01-07 02:30, male, Yueyang. What is my favorable element?"
    context = @{}
} | ConvertTo-Json -Compress

Write-Host "Request: $body4" -ForegroundColor Gray

try {
    $response4 = Invoke-WebRequest -Uri $API_URL -Method POST -Body $body4 -ContentType "application/json" -ErrorAction Stop
    $result4 = $response4.Content | ConvertFrom-Json
    
    Write-Host "Response type: $($result4.type)" -ForegroundColor Green
    if ($result4.birthInfo) {
        Write-Host "Birth info recognized: $($result4.birthInfo.date) $($result4.birthInfo.time)" -ForegroundColor Green
    }
    if ($result4.response) {
        $preview = $result4.response.Substring(0, [Math]::Min(100, $result4.response.Length))
        Write-Host "Response preview: $preview..." -ForegroundColor Green
    }
    
    if ($result4.type -eq "ai_with_algorithm" -or $result4.type -eq "birth_info_saved") {
        Write-Host "Test PASSED: Auto recognized and processed" -ForegroundColor Green
    } else {
        Write-Host "Response type: $($result4.type)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Request FAILED: $_" -ForegroundColor Red
}

Write-Host "`n================================" -ForegroundColor Gray
Write-Host "Test Complete" -ForegroundColor Cyan

Write-Host "`nNote: If tests failed, make sure:" -ForegroundColor Yellow
Write-Host "   1. Dev server is running (npm run dev)" -ForegroundColor Gray
Write-Host "   2. You are logged in (visit http://localhost:3000 and login)" -ForegroundColor Gray
Write-Host "   3. AI keys configured (DEEPSEEK_API_KEY, etc.)" -ForegroundColor Gray