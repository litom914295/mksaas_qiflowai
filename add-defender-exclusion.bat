@echo off
chcp 65001 >nul
SETLOCAL EnableDelayedExpansion

echo ========================================
echo Windows Defender Exclusion Setup
echo ========================================
echo.
echo Adding exclusion for:
echo D:\test\QiFlow AI_qiflowai
echo.
echo Requesting administrator privileges...
echo.

:: Check for admin rights
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Administrator privileges granted
    echo.
    powershell.exe -NoExit -ExecutionPolicy Bypass -Command "& '%~dp0add-defender-exclusion.ps1'; Write-Host ''; Write-Host 'Press any key to exit...' -ForegroundColor Gray; $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')"
) else (
    echo [INFO] Requesting administrator privileges...
    powershell.exe -Command "Start-Process cmd.exe -ArgumentList '/c chcp 65001 >nul & powershell.exe -NoExit -ExecutionPolicy Bypass -File \"%~dp0add-defender-exclusion.ps1\"' -Verb RunAs"
)

ENDLOCAL
