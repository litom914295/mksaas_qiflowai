# 生产模式快速启动脚本
Write-Host "=== QiFlow Production Mode ===" -ForegroundColor Cyan

# 1. 检查构建Job状态
Write-Host "`n[1/3] Checking build status..." -ForegroundColor Yellow
$buildJob = Get-Job -Id 11 -ErrorAction SilentlyContinue

if ($buildJob -and $buildJob.State -eq "Running") {
    Write-Host "Build is still in progress..." -ForegroundColor Gray
    Write-Host "Waiting for build to complete (checking every 30 seconds)..." -ForegroundColor Gray
    
    $timeout = 600  # 10 minutes timeout
    $elapsed = 0
    
    while ($buildJob.State -eq "Running" -and $elapsed -lt $timeout) {
        Start-Sleep -Seconds 30
        $elapsed += 30
        $buildJob = Get-Job -Id 11
        
        # Show progress
        $progress = Receive-Job -Id 11 -Keep | Select-String "Compiled" | Select-Object -Last 1
        if ($progress) {
            Write-Host "  Progress: $progress" -ForegroundColor Gray
        }
        
        $minutes = [math]::Floor($elapsed / 60)
        $seconds = $elapsed % 60
        Write-Host "  Elapsed: ${minutes}m ${seconds}s" -ForegroundColor Gray
    }
    
    if ($buildJob.State -ne "Completed") {
        Write-Host "Build is taking too long. Starting anyway..." -ForegroundColor Yellow
    }
}

# 2. 检查构建结果
Write-Host "`n[2/3] Checking build output..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Write-Host "Build files found!" -ForegroundColor Green
} else {
    Write-Host "Warning: No build files found. Build may have failed." -ForegroundColor Red
    Write-Host "Run: npm run build" -ForegroundColor Yellow
    exit 1
}

# 3. 启动生产服务器
Write-Host "`n[3/3] Starting production server..." -ForegroundColor Yellow

# 停止旧的服务器
Get-Job | Where-Object { $_.Command -like "*npm*start*" } | Stop-Job
Get-Job | Where-Object { $_.Command -like "*npm*start*" } | Remove-Job -Force

# 启动新服务器
Start-Job -ScriptBlock { 
    Set-Location D:\test\mksaas_qiflowai
    npm run start
} | Out-Null

Start-Sleep -Seconds 5

# 4. 测试服务器
Write-Host "`n[4/4] Testing server..." -ForegroundColor Yellow
$maxRetries = 10
$retryCount = 0
$serverReady = $false

while ($retryCount -lt $maxRetries -and -not $serverReady) {
    try {
        $response = curl.exe http://localhost:3000 --max-time 5 --silent --write-out "%{http_code}" --output nul 2>&1
        if ($response -eq "200") {
            $serverReady = $true
            Write-Host "Server is ready!" -ForegroundColor Green
        } else {
            Write-Host "  Status: $response - waiting..." -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "  Waiting for server..." -ForegroundColor Gray
    }
    
    if (-not $serverReady) {
        $retryCount++
        Start-Sleep -Seconds 3
    }
}

if ($serverReady) {
    Write-Host "`n=== SUCCESS ===" -ForegroundColor Green
    Write-Host "Server running at: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "`nTest pages:" -ForegroundColor Yellow
    Write-Host "  - http://localhost:3000/zh/showcase" -ForegroundColor White
    Write-Host "  - http://localhost:3000/zh/test-flying-star" -ForegroundColor White
    
    Write-Host "`nOpening browser..." -ForegroundColor Yellow
    Start-Process "http://localhost:3000/zh/showcase"
    Start-Sleep -Milliseconds 500
    Start-Process "http://localhost:3000/zh/test-flying-star"
    
    Write-Host "`nProduction mode is MUCH FASTER!" -ForegroundColor Green
} else {
    Write-Host "`n=== FAILED ===" -ForegroundColor Red
    Write-Host "Server did not start properly" -ForegroundColor Red
    Write-Host "Check logs: Receive-Job -Id (Get-Job)[0].Id" -ForegroundColor Yellow
}
