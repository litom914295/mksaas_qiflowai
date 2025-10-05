Write-Host "=== QiFlow Page Test ===" -ForegroundColor Cyan

$port = 3000
$baseUrl = "http://localhost:$port"

Write-Host "`nChecking server..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri $baseUrl -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    Write-Host "Server is ready on port $port" -ForegroundColor Green
}
catch {
    Write-Host "Server not responding" -ForegroundColor Red
    exit 1
}

$pages = @(
    "/zh/showcase",
    "/zh/test-flying-star",
    "/zh/analysis/bazi"
)

Write-Host "`nTesting pages..." -ForegroundColor Yellow

foreach ($path in $pages) {
    $url = "$baseUrl$path"
    try {
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        Write-Host "  OK: $path ($($response.Content.Length) bytes)" -ForegroundColor Green
    }
    catch {
        Write-Host "  FAIL: $path - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nOpening browser..." -ForegroundColor Yellow
Start-Process "$baseUrl/zh/showcase"
Start-Sleep -Milliseconds 500
Start-Process "$baseUrl/zh/test-flying-star"

Write-Host "`nTest complete!" -ForegroundColor Cyan
