# QiFlow Project Cleanup Script v2
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "QiFlow Project Cleanup Tool v2.0" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Create archive directory
$archiveDir = "docs\archive\2025-01"
if (-not (Test-Path $archiveDir)) {
    New-Item -ItemType Directory -Path $archiveDir -Force | Out-Null
    Write-Host "[OK] Created archive directory: $archiveDir" -ForegroundColor Green
}

# Move temp docs
Write-Host ""
Write-Host "Moving temporary documents..." -ForegroundColor Yellow
$movedCount = 0

# List of files to move
$filesToMove = Get-ChildItem -Path . -File | Where-Object {
    $_.Name -match "(FIX|ERROR|REPORT|COMPLETE|PHASE|SUMMARY|GUIDE|SUCCESS|MIGRATION|IMPROVEMENT|FEATURE|CREDITS)" -and
    $_.Extension -eq ".md" -and
    $_.Name -ne "@项目改造方案_2025.md"
}

foreach ($file in $filesToMove) {
    Move-Item -Path $file.FullName -Destination $archiveDir -Force
    Write-Host "  - Moved: $($file.Name)" -ForegroundColor Gray
    $movedCount++
}
Write-Host "[OK] Moved $movedCount documents" -ForegroundColor Green

# Delete backup files
Write-Host ""
Write-Host "Deleting backup files..." -ForegroundColor Yellow
$deletedCount = 0

# Check and delete specific backup files
$backupPaths = @(
    "src\app\[locale]\analysis\bazi\page-backup.tsx",
    "src\app\[locale]\analysis\bazi\page-simple.tsx",
    "build-log.txt",
    "build-log2.txt"
)

foreach ($path in $backupPaths) {
    if (Test-Path $path) {
        Remove-Item -Path $path -Force
        Write-Host "  - Deleted: $path" -ForegroundColor Gray
        $deletedCount++
    }
}
Write-Host "[OK] Deleted $deletedCount backup files" -ForegroundColor Green

# Create test directories
Write-Host ""
Write-Host "Creating test directories..." -ForegroundColor Yellow
$testDirs = @("tests\unit", "tests\e2e", "tests\integration")
foreach ($dir in $testDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  - Created: $dir" -ForegroundColor Gray
    }
}
Write-Host "[OK] Test directories ready" -ForegroundColor Green

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Cleanup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "  - Documents archived: $movedCount" -ForegroundColor Gray
Write-Host "  - Backup files deleted: $deletedCount" -ForegroundColor Gray
Write-Host "  - Archive location: $archiveDir" -ForegroundColor Gray
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. npm run lint:fix" -ForegroundColor Gray
Write-Host "  2. npm run build" -ForegroundColor Gray
Write-Host "  3. npm run dev" -ForegroundColor Gray
Write-Host ""