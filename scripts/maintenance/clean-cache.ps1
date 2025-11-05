# Next.js 快速清理缓存脚本（PowerShell）
Write-Host "🧹 清理 Next.js 缓存..." -ForegroundColor Cyan

# 清理 .next 目录
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "✅ 已清理 .next" -ForegroundColor Green
}

# 清理 .turbo 目录
if (Test-Path ".turbo") {
    Remove-Item -Recurse -Force .turbo
    Write-Host "✅ 已清理 .turbo" -ForegroundColor Green
}

# 清理 node_modules/.cache
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force node_modules/.cache
    Write-Host "✅ 已清理 node_modules/.cache" -ForegroundColor Green
}

# 清理 node_modules/.vite
if (Test-Path "node_modules/.vite") {
    Remove-Item -Recurse -Force node_modules/.vite
    Write-Host "✅ 已清理 node_modules/.vite" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 缓存清理完成！现在可以运行 npm run dev" -ForegroundColor Green
