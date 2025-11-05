# Clash 自动重启脚本

Write-Host "🔄 正在重启 Clash for Windows..." -ForegroundColor Cyan
Write-Host ""

# 1. 查找 Clash 进程
$clashProcesses = Get-Process | Where-Object {$_.ProcessName -like "*clash*"}

if ($clashProcesses) {
    Write-Host "📋 找到以下 Clash 进程:" -ForegroundColor Yellow
    $clashProcesses | Select-Object ProcessName, Id | Format-Table
    
    # 2. 停止 Clash 进程
    Write-Host "⏸️  正在停止 Clash 进程..." -ForegroundColor Yellow
    try {
        Stop-Process -Name "Clash for Windows" -Force -ErrorAction SilentlyContinue
        Stop-Process -Name "clash-win64" -Force -ErrorAction SilentlyContinue
        Write-Host "✅ Clash 进程已停止" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  停止进程时出错: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
    # 3. 等待进程完全关闭
    Write-Host "⏳ 等待进程完全关闭..." -ForegroundColor Cyan
    Start-Sleep -Seconds 3
    
} else {
    Write-Host "⚠️  未找到运行中的 Clash 进程" -ForegroundColor Yellow
}

# 4. 查找 Clash 安装位置
Write-Host ""
Write-Host "🔍 正在查找 Clash 安装位置..." -ForegroundColor Cyan

$possiblePaths = @(
    "C:\Program Files\Clash for Windows\Clash for Windows.exe",
    "C:\Program Files (x86)\Clash for Windows\Clash for Windows.exe",
    "$env:LOCALAPPDATA\Programs\Clash for Windows\Clash for Windows.exe",
    "$env:APPDATA\..\Local\Programs\Clash for Windows\Clash for Windows.exe"
)

$clashPath = $null
foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $clashPath = $path
        break
    }
}

if ($clashPath) {
    Write-Host "✅ 找到 Clash: $clashPath" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 正在启动 Clash..." -ForegroundColor Cyan
    
    try {
        Start-Process $clashPath
        Write-Host "✅ Clash 已启动！" -ForegroundColor Green
        Write-Host ""
        Write-Host "⏳ 等待 Clash 完全启动..." -ForegroundColor Cyan
        Start-Sleep -Seconds 5
        
        # 验证启动
        $newProcess = Get-Process | Where-Object {$_.ProcessName -like "*clash*"}
        if ($newProcess) {
            Write-Host "✅ Clash 运行正常" -ForegroundColor Green
            Write-Host ""
            Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
            Write-Host ""
            Write-Host "🎉 Clash 重启完成！" -ForegroundColor Green
            Write-Host ""
            Write-Host "📋 接下来请执行:" -ForegroundColor Cyan
            Write-Host "1. 运行测试脚本: .\test-db-connection.ps1" -ForegroundColor White
            Write-Host "2. 如果测试通过，重启开发服务器: npm run dev" -ForegroundColor White
        } else {
            Write-Host "⚠️  Clash 可能没有正常启动，请手动检查" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "❌ 启动失败: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "💡 请手动启动 Clash for Windows" -ForegroundColor Yellow
    }
    
} else {
    Write-Host "❌ 未找到 Clash 安装路径" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 请按以下步骤手动重启:" -ForegroundColor Yellow
    Write-Host "1. 右键点击任务栏 Clash 图标" -ForegroundColor White
    Write-Host "2. 选择 '退出' 或 'Quit'" -ForegroundColor White
    Write-Host "3. 从开始菜单重新启动 Clash for Windows" -ForegroundColor White
    Write-Host "4. 运行测试脚本: .\test-db-connection.ps1" -ForegroundColor White
}

Write-Host ""
