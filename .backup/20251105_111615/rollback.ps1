# 回滚脚本 - Template Alignment Rollback
# 生成时间: 2025-11-05 11:17
# 用途: 快速回滚到对齐前的状态

Write-Host "🔄 Starting rollback process..." -ForegroundColor Yellow
Write-Host ""

$backupDir = ".backup\20251105_111615"

# 1. 恢复配置文件
Write-Host "📝 Restoring configuration files..." -ForegroundColor Cyan
Copy-Item "$backupDir\package.json.bak" "package.json" -Force
Copy-Item "$backupDir\next.config.ts.bak" "next.config.ts" -Force
Copy-Item "$backupDir\drizzle.config.ts.bak" "drizzle.config.ts" -Force
Copy-Item "$backupDir\tsconfig.json.bak" "tsconfig.json" -Force
Copy-Item "$backupDir\config.bak\*" "src\config\" -Recurse -Force
Write-Host "✅ Configuration files restored" -ForegroundColor Green

# 2. 恢复依赖
Write-Host ""
Write-Host "📦 Restoring dependencies..." -ForegroundColor Cyan
npm install
Write-Host "✅ Dependencies restored" -ForegroundColor Green

# 3. 清理构建缓存
Write-Host ""
Write-Host "🧹 Cleaning build cache..." -ForegroundColor Cyan
if (Test-Path ".next") {
    Remove-Item ".next" -Recurse -Force
    Write-Host "✅ .next directory cleaned" -ForegroundColor Green
}
if (Test-Path "node_modules\.cache") {
    Remove-Item "node_modules\.cache" -Recurse -Force
    Write-Host "✅ node_modules cache cleaned" -ForegroundColor Green
}

# 4. 验证
Write-Host ""
Write-Host "✅ Verifying rollback..." -ForegroundColor Cyan
$buildResult = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful - Rollback verified!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Build failed - Please check manually" -ForegroundColor Red
}

Write-Host ""
Write-Host "✨ Rollback completed!" -ForegroundColor Green
Write-Host "⚠️  Please test the application thoroughly." -ForegroundColor Yellow
Write-Host ""
Write-Host "Current branch: $(git branch --show-current)" -ForegroundColor Cyan
Write-Host "To return to main: git checkout main" -ForegroundColor Cyan
