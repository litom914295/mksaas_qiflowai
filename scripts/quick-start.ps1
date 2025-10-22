# MkSaaS Quick Start Script (Windows PowerShell)
# Usage: .\scripts\quick-start.ps1

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  MkSaaS Admin Panel Starter   " -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "[1/6] Checking Node.js..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "OK Node.js installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "ERROR Node.js not found. Please install Node.js 20+" -ForegroundColor Red
    Write-Host "Download: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check package manager
Write-Host "[2/6] Checking package manager..." -ForegroundColor Yellow
if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    $pnpmVersion = pnpm --version
    Write-Host "OK pnpm installed: $pnpmVersion" -ForegroundColor Green
    $packageManager = "pnpm"
} elseif (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-Host "OK npm installed" -ForegroundColor Green
    Write-Host "TIP: Install pnpm for faster builds: npm install -g pnpm" -ForegroundColor Yellow
    $packageManager = "npm"
} else {
    Write-Host "ERROR Package manager not found" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "[3/6] Installing dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing packages, this may take a few minutes..." -ForegroundColor Cyan
    if ($packageManager -eq "pnpm") {
        pnpm install
    } else {
        npm install
    }
    Write-Host "OK Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "OK Dependencies already exist" -ForegroundColor Green
}

# Check environment configuration
Write-Host "[4/6] Checking environment..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    if (Test-Path ".env.example") {
        Write-Host "Copying .env.example to .env.local..." -ForegroundColor Cyan
        Copy-Item ".env.example" ".env.local"
        Write-Host "OK Environment file created" -ForegroundColor Green
        Write-Host "NOTICE Please edit .env.local to configure environment variables" -ForegroundColor Yellow
    } else {
        Write-Host "NOTICE .env.example not found, please create .env.local manually" -ForegroundColor Yellow
    }
} else {
    Write-Host "OK Environment file exists" -ForegroundColor Green
}

# Check database (optional)
Write-Host "[5/6] Checking database..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match "DATABASE_URL=") {
        Write-Host "OK Database configured" -ForegroundColor Green
        Write-Host "NOTICE Make sure database service is running" -ForegroundColor Yellow
    } else {
        Write-Host "NOTICE Database not configured (will use mock data)" -ForegroundColor Yellow
    }
}

# Start dev server
Write-Host "[6/6] Starting dev server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Server Starting...           " -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access URLs:" -ForegroundColor Green
Write-Host "  - Admin Login: http://localhost:3000/admin/login" -ForegroundColor Cyan
Write-Host "  - Admin Dashboard: http://localhost:3000/admin/dashboard" -ForegroundColor Cyan
Write-Host ""
Write-Host "Demo Accounts:" -ForegroundColor Green
Write-Host "  Super Admin" -ForegroundColor Cyan
Write-Host "    Email: admin@mksaas.com" -ForegroundColor Gray
Write-Host "    Password: admin123456" -ForegroundColor Gray
Write-Host ""
Write-Host "  Manager" -ForegroundColor Cyan
Write-Host "    Email: manager@mksaas.com" -ForegroundColor Gray
Write-Host "    Password: manager123456" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop server" -ForegroundColor Yellow
Write-Host ""

# Start server
if ($packageManager -eq "pnpm") {
    pnpm dev
} else {
    npm run dev
}
