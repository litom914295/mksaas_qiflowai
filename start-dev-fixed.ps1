# ========================================
# Next.js 开发服务器优化启动脚本
# ========================================
# 用途：修复 DNS 解析问题和 ENOENT 构建错误
# 使用：在项目根目录执行 .\start-dev-fixed.ps1

Write-Host "🚀 启动 Next.js 开发服务器（优化版）`n" -ForegroundColor Cyan

# ========================================
# 第 1 步：DNS 刷新
# ========================================
Write-Host "📡 步骤 1/4: 刷新 DNS 缓存..." -ForegroundColor Yellow
ipconfig /flushdns | Out-Null
Write-Host "   ✅ DNS 缓存已刷新`n" -ForegroundColor Green

# ========================================
# 第 2 步：设置 Node.js 环境变量
# ========================================
Write-Host "⚙️  步骤 2/4: 配置 Node.js 环境变量..." -ForegroundColor Yellow

# 优先使用 IPv4 解析（修复 IPv6 环境下的 DNS 问题）
$env:NODE_OPTIONS = "--dns-result-order=ipv4first"

# 稳定文件监听（降低 Windows 上的 ENOENT 错误概率）
$env:WATCHPACK_POLLING = "true"
$env:CHOKIDAR_USEPOLLING = "1"

Write-Host "   ✅ 环境变量已设置:" -ForegroundColor Green
Write-Host "      • NODE_OPTIONS = $env:NODE_OPTIONS"
Write-Host "      • WATCHPACK_POLLING = $env:WATCHPACK_POLLING"
Write-Host "      • CHOKIDAR_USEPOLLING = $env:CHOKIDAR_USEPOLLING`n"

# ========================================
# 第 3 步：数据库连通性预检
# ========================================
Write-Host "🔍 步骤 3/4: 数据库连通性预检..." -ForegroundColor Yellow

# 检查 Direct Connection
Write-Host "   检查直连数据库 (db.sibwcdadrsbfkblinezj.supabase.co:5432)..."
$directTest = Test-NetConnection -ComputerName "db.sibwcdadrsbfkblinezj.supabase.co" -Port 5432 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
if ($directTest.TcpTestSucceeded) {
    Write-Host "   ✅ 直连数据库可访问" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  直连数据库不可访问，将自动降级到 Session Pooler" -ForegroundColor DarkYellow
}

# 检查 Session Pooler (虽然 DNS 可能失败，但我们尝试)
Write-Host "   检查 Session Pooler (sibwcdadrsbfkblinezj.pooler.supabase.net:6543)..."
$poolerTest = Test-NetConnection -ComputerName "sibwcdadrsbfkblinezj.pooler.supabase.net" -Port 6543 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
if ($poolerTest.TcpTestSucceeded) {
    Write-Host "   ✅ Session Pooler 可访问" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Session Pooler 不可访问（预期内，DNS 问题）`n" -ForegroundColor DarkYellow
}

# ========================================
# 第 4 步：启动开发服务器
# ========================================
Write-Host "🎯 步骤 4/4: 启动开发服务器...`n" -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "开发服务器启动中..." -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# 启动 Next.js 开发服务器（使用 Webpack 而非 Turbopack 以避免 Windows 文件竞争）
Write-Host "⚠️  使用 Webpack 模式启动（避免 Turbopack 的 Windows 文件系统问题）`n" -ForegroundColor DarkYellow
npm run dev:webpack
