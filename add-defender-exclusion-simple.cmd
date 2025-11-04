@echo off
:: Simple Windows Defender Exclusion Tool
:: Run as Administrator

echo.
echo ========================================
echo Windows Defender Exclusion Setup
echo ========================================
echo.
echo Project: D:\test\QiFlow AI_qiflowai
echo.

:: Check admin rights
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Administrator privileges required!
    echo.
    echo Right-click this file and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo [OK] Running as Administrator
echo.
echo Adding exclusion...

:: Add exclusion using PowerShell
powershell -Command "try { Add-MpPreference -ExclusionPath 'D:\test\QiFlow AI_qiflowai'; Write-Host '[OK] Exclusion added successfully!' -ForegroundColor Green } catch { Write-Host '[ERROR] Failed: ' + $_.Exception.Message -ForegroundColor Red }"

echo.
echo Verifying...
powershell -Command "$exclusions = Get-MpPreference | Select-Object -ExpandProperty ExclusionPath; if ($exclusions -contains 'D:\test\QiFlow AI_qiflowai') { Write-Host '[OK] Verified! Exclusion is active' -ForegroundColor Green } else { Write-Host '[WARNING] Could not verify' -ForegroundColor Yellow }"

echo.
echo ========================================
echo Done!
echo ========================================
echo.
echo Benefits:
echo - Faster npm install
echo - Faster dev server startup (20-30%% improvement)
echo - Smoother development experience
echo.
pause
