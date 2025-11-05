# ========================================
# Windows Defender Exclusion Script
# Requires Administrator privileges
# ========================================

$Host.UI.RawUI.WindowTitle = "Windows Defender Exclusion Setup"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Clear screen for better visibility
Clear-Host

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Windows Defender Exclusion Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "[X] ERROR: Administrator privileges required" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please follow these steps:" -ForegroundColor Yellow
    Write-Host "1. Right-click on this file (add-defender-exclusion.ps1)" -ForegroundColor White
    Write-Host "2. Select 'Run with PowerShell' or 'Run as Administrator'" -ForegroundColor White
    Write-Host ""
    Write-Host "Or run in Administrator PowerShell:" -ForegroundColor Yellow
    Write-Host "   cd D:\test\QiFlow AI_qiflowai" -ForegroundColor White
    Write-Host "   .\add-defender-exclusion.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
    exit 1
}

Write-Host "[INFO] Adding Windows Defender exclusion..." -ForegroundColor Cyan
Write-Host ""

$projectPath = "D:\test\QiFlow AI_qiflowai"
Write-Host "Project path: $projectPath" -ForegroundColor White
Write-Host ""

try {
    Write-Host "[STEP 1/2] Adding exclusion to Windows Defender..." -ForegroundColor Yellow
    
    # Add project directory to exclusion list
    Add-MpPreference -ExclusionPath $projectPath
    
    Write-Host "[OK] Successfully added exclusion: $projectPath" -ForegroundColor Green
    Write-Host ""
    
    # Verify exclusion
    Write-Host "[STEP 2/2] Verifying exclusion..." -ForegroundColor Yellow
    Start-Sleep -Milliseconds 500
    
    $exclusions = Get-MpPreference | Select-Object -ExpandProperty ExclusionPath
    
    if ($exclusions -contains $projectPath) {
        Write-Host "[OK] Verification successful! Exclusion is active" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] Unable to verify exclusion" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Benefits:" -ForegroundColor Yellow
    Write-Host "  - Windows Defender will no longer scan this directory" -ForegroundColor White
    Write-Host "  - Significantly faster npm install" -ForegroundColor White
    Write-Host "  - Faster development server startup (20-30% improvement)" -ForegroundColor White
    Write-Host "  - Smoother hot reload" -ForegroundColor White
    Write-Host ""
    Write-Host "To view all exclusions, run:" -ForegroundColor Yellow
    Write-Host "  Get-MpPreference | Select-Object -ExpandProperty ExclusionPath" -ForegroundColor Gray
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "ERROR!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "[X] Failed to add exclusion: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual steps:" -ForegroundColor Yellow
    Write-Host "1. Open Windows Security Center" -ForegroundColor White
    Write-Host "2. Click 'Virus & threat protection'" -ForegroundColor White
    Write-Host "3. Click 'Manage settings'" -ForegroundColor White
    Write-Host "4. Scroll to 'Exclusions' section" -ForegroundColor White
    Write-Host "5. Click 'Add or remove exclusions'" -ForegroundColor White
    Write-Host "6. Click 'Add an exclusion' > 'Folder'" -ForegroundColor White
    Write-Host "7. Select: D:\test\QiFlow AI_qiflowai" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
