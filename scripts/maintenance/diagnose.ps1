# Diagnostic script for Next.js routing issues

Write-Host "`n=== Next.js Routing Diagnostic ===" -ForegroundColor Cyan

# 1. Check app directory structure
Write-Host "`n1. App Directory Structure:" -ForegroundColor Yellow
Get-ChildItem -Path "src\app" -Recurse -Include "page.tsx","layout.tsx" | 
    Select-Object -ExpandProperty FullName | 
    ForEach-Object { $_.Replace("$PWD\src\app\", "  /") }

# 2. Check [locale] directory specifically
Write-Host "`n2. [locale] Directory Contents:" -ForegroundColor Yellow
try {
    [System.IO.Directory]::GetFiles("$PWD\src\app\[locale]") | 
        ForEach-Object { "  " + [System.IO.Path]::GetFileName($_) }
} catch {
    Write-Host "  ERROR: Cannot read [locale] directory" -ForegroundColor Red
}

# 3. Check next.config.ts exists and is valid
Write-Host "`n3. Next.js Configuration:" -ForegroundColor Yellow
if (Test-Path "next.config.ts") {
    Write-Host "  next.config.ts EXISTS" -ForegroundColor Green
    $config = Get-Content "next.config.ts" -Raw
    if ($config -match "createNextIntlPlugin") {
        Write-Host "  i18n plugin: CONFIGURED" -ForegroundColor Green
    } else {
        Write-Host "  i18n plugin: MISSING" -ForegroundColor Red
    }
} else {
    Write-Host "  next.config.ts NOT FOUND" -ForegroundColor Red
}

# 4. Check i18n configuration files
Write-Host "`n4. i18n Configuration Files:" -ForegroundColor Yellow
@("src\i18n\routing.ts", "src\i18n\request.ts") | ForEach-Object {
    if (Test-Path $_) {
        Write-Host "  $_ EXISTS" -ForegroundColor Green
    } else {
        Write-Host "  $_ MISSING" -ForegroundColor Red
    }
}

# 5. Check if .next exists and what routes are built
Write-Host "`n5. Build Output (.next):" -ForegroundColor Yellow
if (Test-Path ".next\server\app-paths-manifest.json") {
    Write-Host "  Build manifest EXISTS" -ForegroundColor Green
    $manifest = Get-Content ".next\server\app-paths-manifest.json" | ConvertFrom-Json
    Write-Host "  Routes found:" -ForegroundColor Cyan
    $manifest.PSObject.Properties | ForEach-Object {
        Write-Host "    $($_.Name)" -ForegroundColor Gray
    }
} else {
    Write-Host "  No build manifest found (need to start dev server)" -ForegroundColor Yellow
}

# 6. Check for TypeScript errors
Write-Host "`n6. TypeScript Check:" -ForegroundColor Yellow
Write-Host "  Running tsc --noEmit..." -ForegroundColor Gray
$tscOutput = & npx tsc --noEmit 2>&1 | Select-Object -First 10
if ($LASTEXITCODE -eq 0) {
    Write-Host "  No TypeScript errors" -ForegroundColor Green
} else {
    Write-Host "  TypeScript errors found:" -ForegroundColor Red
    $tscOutput | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
}

Write-Host "`n=== Diagnostic Complete ===" -ForegroundColor Cyan