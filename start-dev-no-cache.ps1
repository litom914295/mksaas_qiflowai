# ========================================
# Next.js 无缓存启动脚本（终极修复版）
# ========================================
# 完全禁用所有缓存，适用于 Windows ENOENT 问题
# 使用：.\start-dev-no-cache.ps1

Write-Host "`n🛠️  Next.js 无缓存启动模式 (ENOENT 终极修复)" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "⚠️  此模式会禁用所有缓存，启动较慢但最稳定" -ForegroundColor Yellow
Write-Host "=" * 70 -ForegroundColor Cyan

# ========================================
# 第 1 步：停止所有进程
# ========================================
Write-Host "`n[1/5] 停止所有 Node 进程..." -ForegroundColor Yellow
$nodes = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodes) {
    Stop-Process -Name node -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 3
    Write-Host "      ✅ 已停止 $($nodes.Count) 个进程" -ForegroundColor Green
} else {
    Write-Host "      ✅ 无运行中的进程" -ForegroundColor Green
}

# ========================================
# 第 2 步：深度清理
# ========================================
Write-Host "`n[2/5] 深度清理缓存..." -ForegroundColor Yellow

$itemsToClean = @(
    ".\.next",
    ".\node_modules\.cache",
    ".\.swc",
    ".\next.config.compiled.js"
)

foreach ($item in $itemsToClean) {
    if (Test-Path $item) {
        Write-Host "      删除 $item..." -ForegroundColor Gray
        Remove-Item $item -Recurse -Force -ErrorAction SilentlyContinue
    }
}

Start-Sleep -Seconds 2
Write-Host "      ✅ 清理完成" -ForegroundColor Green

# ========================================
# 第 3 步：设置环境变量
# ========================================
Write-Host "`n[3/5] 配置环境变量..." -ForegroundColor Yellow

# 完全禁用所有缓存
$env:NEXT_DISABLE_SWC_CACHE = "1"
$env:NEXT_WEBPACK_USEFILENAMECACHING = "false"
$env:NEXT_TELEMETRY_DISABLED = "1"

# Node.js 优化
$env:NODE_OPTIONS = "--dns-result-order=ipv4first --max-old-space-size=4096"
$env:NODE_ENV = "development"

# 文件监听（轮询模式）
$env:WATCHPACK_POLLING = "true"
$env:CHOKIDAR_USEPOLLING = "1"
$env:CHOKIDAR_INTERVAL = "1000"

# 禁用 Turbopack
$env:TURBOPACK = "0"

Write-Host "      ✅ 环境变量已配置" -ForegroundColor Green
Write-Host "         • 已禁用所有缓存机制" -ForegroundColor Gray
Write-Host "         • 已启用文件轮询监听" -ForegroundColor Gray
Write-Host "         • 已禁用 Turbopack" -ForegroundColor Gray

# ========================================
# 第 4 步：DNS 优化
# ========================================
Write-Host "`n[4/5] 刷新 DNS 缓存..." -ForegroundColor Yellow
ipconfig /flushdns | Out-Null
Write-Host "      ✅ DNS 已刷新" -ForegroundColor Green

# ========================================
# 第 5 步：启动服务器
# ========================================
Write-Host "`n[5/5] 启动开发服务器..." -ForegroundColor Yellow
Write-Host "`n" + ("=" * 70) -ForegroundColor Cyan
Write-Host "  模式: Webpack (无缓存)" -ForegroundColor White
Write-Host "  地址: http://localhost:3000" -ForegroundColor White
Write-Host "  说明: 首次启动会较慢，请耐心等待" -ForegroundColor DarkYellow
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host ""

# 使用 Webpack 启动
npm run dev:webpack
