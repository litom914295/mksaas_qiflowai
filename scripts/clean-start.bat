@echo off
echo Cleaning development environment...

REM Kill all Node processes
taskkill /F /IM node.exe 2>nul

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Remove .next directory
if exist .next (
    echo Removing .next directory...
    rmdir /s /q .next 2>nul
)

REM Remove node_modules cache
if exist node_modules\.cache (
    echo Removing node_modules cache...
    rmdir /s /q node_modules\.cache 2>nul
)

REM Remove other temp files
if exist .swc (
    echo Removing .swc directory...
    rmdir /s /q .swc 2>nul
)

echo Starting development server...
npm run dev