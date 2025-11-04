# ========================================
# Next.js 稳定版开发服务器启动脚本
# ========================================
# 专为 Windows 环境优化，解决 ENOENT 和文件竞争问题
# 使用：.\start-dev-stable.ps1

Write-Host "`n🔧 Next.js 稳定版启动脚本 (Windows 优化)" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# ========================================
# 第 0 步：确保管理员权限（可选但推荐）
# ========================================
$currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
$isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  未以管理员权限运行（可能影响性能优化）" -ForegroundColor DarkYellow
    Write-Host "   建议：右键点击 PowerShell -> '以管理员身份运行'`n" -ForegroundColor DarkYellow
}

# ========================================
# 第 1 步：彻底停止所有 Node 进程
# ========================================
Write-Host "`n📛 步骤 1/6: 停止所有 Node.js 进程..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "   发现 $($nodeProcesses.Count) 个运行中的 Node 进程，正在停止..." -ForegroundColor DarkYellow
    Stop-Process -Name node -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "   ✅ 所有 Node 进程已停止" -ForegroundColor Green
} else {
    Write-Host "   ✅ 没有运行中的 Node 进程" -ForegroundColor Green
}

# ========================================
# 第 2 步：彻底清理构建缓存
# ========================================
Write-Host "`n🧹 步骤 2/6: 清理构建缓存..." -ForegroundColor Yellow

# 删除 .next
if (Test-Path .\.next) {
    Write-Host "   删除 .next 目录..."
    try {
        # 先尝试快速删除
        Remove-Item .\.next -Recurse -Force -ErrorAction Stop
        Write-Host "   ✅ .next 目录已删除" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  部分文件删除失败（可能被占用），尝试强制删除..." -ForegroundColor DarkYellow
        Start-Sleep -Seconds 1
        Remove-Item .\.next -Recurse -Force -ErrorAction SilentlyContinue
    }
} else {
    Write-Host "   ℹ️  .next 目录不存在" -ForegroundColor Gray
}

# 删除 node_modules/.cache
if (Test-Path .\node_modules\.cache) {
    Write-Host "   删除 node_modules\.cache..."
    Remove-Item .\node_modules\.cache -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ node_modules\.cache 已删除" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  node_modules\.cache 不存在" -ForegroundColor Gray
}

Start-Sleep -Seconds 1

# ========================================
# 第 3 步：DNS 和网络优化
# ========================================
Write-Host "`n📡 步骤 3/6: DNS 和网络优化..." -ForegroundColor Yellow
ipconfig /flushdns | Out-Null
Write-Host "   ✅ DNS 缓存已刷新" -ForegroundColor Green

# ========================================
# 第 4 步：设置环境变量（针对 Windows 优化）
# ========================================
Write-Host "`n⚙️  步骤 4/6: 配置环境变量..." -ForegroundColor Yellow

# Node.js 优化
$env:NODE_OPTIONS = "--dns-result-order=ipv4first --max-old-space-size=4096"
$env:NODE_ENV = "development"

# 文件监听优化（关键：解决 Windows ENOENT 问题）
$env:WATCHPACK_POLLING = "true"
$env:CHOKIDAR_USEPOLLING = "1"
$env:CHOKIDAR_INTERVAL = "1000"

# Next.js 优化
$env:NEXT_TELEMETRY_DISABLED = "1"
$env:TURBOPACK = "0"  # 明确禁用 Turbopack

Write-Host "   ✅ 环境变量已配置:" -ForegroundColor Green
Write-Host "      • NODE_OPTIONS = $env:NODE_OPTIONS" -ForegroundColor Gray
Write-Host "      • WATCHPACK_POLLING = $env:WATCHPACK_POLLING" -ForegroundColor Gray
Write-Host "      • CHOKIDAR_USEPOLLING = $env:CHOKIDAR_USEPOLLING" -ForegroundColor Gray
Write-Host "      • TURBOPACK = $env:TURBOPACK (禁用以避免文件竞争)" -ForegroundColor Gray

# ========================================
# 第 5 步：Windows Defender 排除（可选，需管理员）
# ========================================
Write-Host "`n🛡️  步骤 5/6: Windows Defender 优化..." -ForegroundColor Yellow
if ($isAdmin) {
    try {
        $projectPath = (Get-Location).Path
        Add-MpPreference -ExclusionPath "$projectPath\.next" -ErrorAction Stop
        Add-MpPreference -ExclusionPath "$projectPath\node_modules\.cache" -ErrorAction Stop
        Write-Host "   ✅ 已将构建目录添加到 Defender 排除列表" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  无法配置 Defender 排除（可能影响性能）" -ForegroundColor DarkYellow
    }
} else {
    Write-Host "   ⏭️  跳过（需要管理员权限）" -ForegroundColor Gray
}

# ========================================
# 第 6 步：启动开发服务器（Webpack 模式）
# ========================================
Write-Host "`n🚀 步骤 6/6: 启动开发服务器..." -ForegroundColor Yellow
Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "使用 Webpack 模式（稳定性优先）" -ForegroundColor Cyan
Write-Host "端口: http://localhost:3000" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "`n⏳ 正在启动，请稍候...`n"

# 使用 Webpack 而非 Turbopack（避免 Windows 文件系统问题）
npm run dev:webpack
