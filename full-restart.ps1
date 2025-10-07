#!/usr/bin/env pwsh
# 完整清理并重启Next.js开发服务器

Write-Host "🔧 开始完整清理和重启流程..." -ForegroundColor Cyan

# 1. 停止所有Node进程
Write-Host "`n1️⃣  停止所有Node进程..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# 验证进程已停止
$remainingProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($remainingProcesses) {
    Write-Host "   ⚠️  还有 $($remainingProcesses.Count) 个Node进程在运行，尝试强制结束..." -ForegroundColor Yellow
    taskkill /F /IM node.exe /T
    Start-Sleep -Seconds 2
}

Write-Host "   ✅ Node进程已停止" -ForegroundColor Green

# 2. 清除Next.js构建缓存
Write-Host "`n2️⃣  清除Next.js构建缓存..." -ForegroundColor Yellow
$cachePaths = @(
    ".next",
    "node_modules/.cache",
    ".next-build",
    "out"
)

foreach ($path in $cachePaths) {
    $fullPath = Join-Path $PSScriptRoot $path
    if (Test-Path $fullPath) {
        Write-Host "   清除: $path" -ForegroundColor Gray
        Remove-Item -Path $fullPath -Recurse -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "   ✅ 缓存已清除" -ForegroundColor Green

# 3. 清除系统临时文件
Write-Host "`n3️⃣  清除系统临时文件..." -ForegroundColor Yellow
Remove-Item -Path "$env:TEMP\next-*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:TEMP\webpack-*" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "   ✅ 临时文件已清除" -ForegroundColor Green

# 4. 验证代码文件
Write-Host "`n4️⃣  验证代码文件..." -ForegroundColor Yellow
$routeFile = Join-Path $PSScriptRoot "src\app\api\ai\chat\route.ts"
if (Test-Path $routeFile) {
    $hasInputParser = Select-String -Path $routeFile -Pattern "InputParser" -Quiet
    $hasCalculateBazi = Select-String -Path $routeFile -Pattern "calculateBazi" -Quiet
    $hasDebugLog = Select-String -Path $routeFile -Pattern "📝 \[DEBUG\]" -Quiet
    
    if ($hasInputParser -and $hasCalculateBazi -and $hasDebugLog) {
        Write-Host "   ✅ 智能解析代码已正确集成" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  代码可能不完整！" -ForegroundColor Red
        Write-Host "      InputParser: $hasInputParser" -ForegroundColor Gray
        Write-Host "      calculateBazi: $hasCalculateBazi" -ForegroundColor Gray
        Write-Host "      DEBUG日志: $hasDebugLog" -ForegroundColor Gray
    }
} else {
    Write-Host "   ❌ 找不到route.ts文件！" -ForegroundColor Red
}

# 5. 检查端口占用
Write-Host "`n5️⃣  检查端口占用..." -ForegroundColor Yellow
$port3000 = netstat -ano | Select-String ":3000" | Select-String "LISTENING"
if ($port3000) {
    Write-Host "   ⚠️  端口3000仍被占用，尝试释放..." -ForegroundColor Yellow
    $port3000 | ForEach-Object {
        if ($_ -match "(\d+)$") {
            $pid = $matches[1]
            Write-Host "      终止进程: $pid" -ForegroundColor Gray
            taskkill /F /PID $pid
        }
    }
    Start-Sleep -Seconds 2
}
Write-Host "   ✅ 端口已释放" -ForegroundColor Green

# 6. 启动开发服务器
Write-Host "`n6️⃣  启动开发服务器..." -ForegroundColor Yellow
Write-Host "   这可能需要15-30秒..." -ForegroundColor Gray

# 在新窗口启动服务器
$startInfo = New-Object System.Diagnostics.ProcessStartInfo
$startInfo.FileName = "cmd.exe"
$startInfo.Arguments = "/c npm run dev"
$startInfo.WorkingDirectory = $PSScriptRoot
$startInfo.UseShellExecute = $true
$startInfo.WindowStyle = "Normal"

$process = [System.Diagnostics.Process]::Start($startInfo)

Write-Host "   ✅ 开发服务器已启动（PID: $($process.Id)）" -ForegroundColor Green

# 7. 等待服务器就绪
Write-Host "`n7️⃣  等待服务器就绪..." -ForegroundColor Yellow
$maxWait = 60
$waited = 0
$ready = $false

while ($waited -lt $maxWait) {
    Start-Sleep -Seconds 2
    $waited += 2
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -ErrorAction SilentlyContinue
        $ready = $true
        break
    } catch {
        Write-Host "   等待中... ($waited 秒)" -ForegroundColor Gray
    }
}

if ($ready) {
    Write-Host "   ✅ 服务器已就绪！" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  服务器启动超时，请手动检查" -ForegroundColor Yellow
}

# 8. 最终说明
Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ 清理和重启完成！" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 下一步操作：" -ForegroundColor Yellow
Write-Host "   1. 等待编译完成（查看服务器窗口显示 '✓ Ready'）"
Write-Host "   2. 访问: http://localhost:3000/zh-CN/ai-chat"
Write-Host "   3. 输入测试消息: 1973年1月7日2点30分男性岳阳"
Write-Host ""
Write-Host "🧪 或者运行API测试脚本：" -ForegroundColor Yellow
Write-Host "   .\test-ai-chat-api.ps1"
Write-Host ""
Write-Host "📊 查看服务器日志以确认智能解析是否执行" -ForegroundColor Yellow
Write-Host "   应该看到类似的日志："
Write-Host "   [DEBUG] User message: ..." -ForegroundColor Gray
Write-Host "   [DEBUG] Parsed result: ..." -ForegroundColor Gray
Write-Host ""
