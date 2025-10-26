# PowerShell script for clean development start
Write-Host "Starting MkSaaS Development Server..." -ForegroundColor Green

# 1. Kill any existing Node processes
Write-Host "Stopping existing Node processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Wait a moment
Start-Sleep -Seconds 2

# 3. Clean build directories
Write-Host "Cleaning build directories..." -ForegroundColor Yellow
@(".next", "node_modules\.cache", ".swc") | ForEach-Object {
    if (Test-Path $_) {
        Write-Host "  Removing $_"
        Remove-Item $_ -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# 4. Set environment variables for Windows
$env:NODE_ENV = "development"
$env:NEXT_TELEMETRY_DISABLED = "1"

# 5. Start development server with standard webpack
Write-Host "Starting development server (webpack mode)..." -ForegroundColor Green
Write-Host "Server will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "It will automatically redirect to: http://localhost:3000/zh-CN" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Run the development server
npm run dev