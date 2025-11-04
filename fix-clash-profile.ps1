# 修复 Clash Profile 配置脚本
# 在激活的 profile 中添加 Supabase 直连规则

$profilePath = "$env:USERPROFILE\.config\clash\profiles\1723257388119.yml"

Write-Host "🔍 正在修复 Clash Profile 配置..." -ForegroundColor Cyan
Write-Host "文件: $profilePath" -ForegroundColor Gray
Write-Host ""

# 检查文件是否存在
if (-not (Test-Path $profilePath)) {
    Write-Host "❌ 未找到配置文件" -ForegroundColor Red
    exit 1
}

# 读取配置
$content = Get-Content $profilePath -Raw

# 检查是否已有 Supabase 规则
if ($content -match "supabase") {
    Write-Host "✅ Supabase 规则已存在" -ForegroundColor Green
    Write-Host "💡 无需修改" -ForegroundColor Yellow
    exit 0
}

Write-Host "📝 添加 Supabase 直连规则..." -ForegroundColor Yellow

# 在 rules: 后面的第一行添加规则
$supabaseRules = "  - DOMAIN-SUFFIX,supabase.co,DIRECT`n  - DOMAIN-SUFFIX,supabase.net,DIRECT`n  - DOMAIN-SUFFIX,supabase.io,DIRECT`n  - DOMAIN-KEYWORD,supabase,DIRECT`n  - DOMAIN,localhost,DIRECT`n  - DOMAIN-SUFFIX,local,DIRECT`n  - IP-CIDR,127.0.0.0/8,DIRECT`n  - IP-CIDR,192.168.0.0/16,DIRECT`n"

# 替换
$newContent = $content -replace "(rules:`r?`n)", "`$1$supabaseRules"

# 备份
$backupPath = "$profilePath.backup_$(Get-Date -Format 'yyyyMMddHHmmss')"
Copy-Item $profilePath $backupPath -Force
Write-Host "💾 已备份到: $backupPath" -ForegroundColor Green

# 写入
Set-Content $profilePath $newContent -Encoding UTF8 -NoNewline

Write-Host "✅ 配置已更新！" -ForegroundColor Green
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "📋 接下来请执行:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 在 Clash for Windows 中刷新配置:" -ForegroundColor White
Write-Host "   - 打开 Clash 主窗口" -ForegroundColor Gray
Write-Host "   - 点击 Profiles" -ForegroundColor Gray
Write-Host "   - 点击当前配置右侧的刷新按钮 🔄" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 或者重启 Clash:" -ForegroundColor White
Write-Host "   - 右键任务栏图标 → 退出" -ForegroundColor Gray
Write-Host "   - 重新启动 Clash for Windows" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 运行测试脚本:" -ForegroundColor White
Write-Host "   .\test-db-connection.ps1" -ForegroundColor Gray
Write-Host ""
