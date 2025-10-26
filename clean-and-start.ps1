# Complete cleanup and restart script for MkSaaS
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  MkSaaS Complete Cleanup & Restart" -ForegroundColor Cyan  
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Kill all Node processes
Write-Host "[1/5] Stopping Node processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 1

# Step 2: Clean directories
Write-Host "[2/5] Cleaning build directories..." -ForegroundColor Yellow
$dirsToClean = @(
    ".next",
    "node_modules\.cache", 
    ".swc",
    ".turbo"
)

foreach ($dir in $dirsToClean) {
    if (Test-Path $dir) {
        Write-Host "  → Removing $dir" -ForegroundColor Gray
        Remove-Item $dir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# Step 3: Clean temporary files
Write-Host "[3/5] Cleaning temporary files..." -ForegroundColor Yellow
$filesToClean = @(
    "next.config.compiled.js",
    "*.log",
    "npm-debug.log*",
    "yarn-debug.log*",
    "yarn-error.log*"
)

foreach ($file in $filesToClean) {
    Get-ChildItem -Path . -Filter $file -ErrorAction SilentlyContinue | Remove-Item -Force
}

# Step 4: Set environment variables
Write-Host "[4/5] Setting environment variables..." -ForegroundColor Yellow
$env:NODE_ENV = "development"
$env:NEXT_TELEMETRY_DISABLED = "1"
$env:NODE_OPTIONS = "--max-old-space-size=4096"

Write-Host "  → NODE_ENV: development" -ForegroundColor Gray
Write-Host "  → Memory limit: 4GB" -ForegroundColor Gray
Write-Host "  → Telemetry: disabled" -ForegroundColor Gray

# Step 5: Start development server
Write-Host "[5/5] Starting development server...`n" -ForegroundColor Green

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Server Information" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  URL: " -NoNewline
Write-Host "http://localhost:3000" -ForegroundColor Green
Write-Host "  Auto-redirect to: " -NoNewline  
Write-Host "http://localhost:3000/zh-CN" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Yellow

# Run the dev server
npm run dev