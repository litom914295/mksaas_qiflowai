@echo off
chcp 65001 >nul 2>&1
title 推送到主分支 - Warp Workflow

echo ============================================
echo        推送更新到主分支工作流
echo ============================================
echo.

:: 检查是否在正确的目录
if not exist ".git" (
    echo [错误] 当前目录不是Git仓库！
    echo 请在项目根目录运行此脚本
    pause
    exit /b 1
)

:: 获取用户输入的提交消息
set /p commit_msg="请输入提交消息 (直接回车使用默认): "
if "%commit_msg%"=="" set commit_msg=feat: 更新代码

:: 运行PowerShell脚本
echo.
echo 开始执行推送工作流...
echo ----------------------------------------
powershell.exe -ExecutionPolicy Bypass -File ".\.warp\workflows\quick-push-main.ps1" -Message "%commit_msg%"

:: 检查执行结果
if %errorlevel% equ 0 (
    echo.
    echo ============================================
    echo         ✓ 推送成功完成！
    echo ============================================
) else (
    echo.
    echo ============================================
    echo         × 推送过程中出现错误
    echo ============================================
)

echo.
pause