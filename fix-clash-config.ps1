# Clash 配置修复脚本
# 用途: 在 Clash 配置文件中添加 Supabase 直连规则

$clashConfigPath = "$env:USERPROFILE\.config\clash\config.yaml"

Write-Host "🔍 正在检查 Clash 配置..." -ForegroundColor Cyan

# 检查文件是否存在
if (-not (Test-Path $clashConfigPath)) {
    Write-Host "❌ 未找到 Clash 配置文件: $clashConfigPath" -ForegroundColor Red
    Write-Host "💡 请确保 Clash for Windows 已安装并至少运行过一次" -ForegroundColor Yellow
    exit 1
}

# 读取当前配置
$content = Get-Content $clashConfigPath -Raw

Write-Host "📄 当前配置文件: $clashConfigPath" -ForegroundColor Green

# 检查是否已有 rules 部分
if ($content -notmatch "rules:") {
    Write-Host "⚠️  配置文件中没有 rules 部分" -ForegroundColor Yellow
    Write-Host "📝 将添加完整的 rules 部分..." -ForegroundColor Cyan
    
    $supabaseRules = @'

# 数据库直连规则
rules:
  # Supabase 数据库直连
  - DOMAIN-SUFFIX,supabase.co,DIRECT
  - DOMAIN-SUFFIX,supabase.net,DIRECT
  - DOMAIN-SUFFIX,supabase.io,DIRECT
  - DOMAIN-KEYWORD,supabase,DIRECT
  
  # 本地开发直连
  - DOMAIN,localhost,DIRECT
  - DOMAIN-SUFFIX,local,DIRECT
  - IP-CIDR,127.0.0.0/8,DIRECT
  - IP-CIDR,192.168.0.0/16,DIRECT
  
  # 国内直连
  - GEOIP,CN,DIRECT
  
  # 其他走代理
  - MATCH,PROXY
'@
    
    $content = $content.TrimEnd() + "`n" + $supabaseRules
    
} else {
    Write-Host "✅ 找到 rules 部分" -ForegroundColor Green
    
    # 检查是否已有 Supabase 规则
    if ($content -match "supabase") {
        Write-Host "✅ Supabase 规则已存在" -ForegroundColor Green
        Write-Host "💡 无需修改配置" -ForegroundColor Yellow
        exit 0
    }
    
    Write-Host "📝 添加 Supabase 直连规则..." -ForegroundColor Cyan
    
    # 在 rules: 后面插入规则
    $supabaseRules = @'
  # Supabase 数据库直连 (自动添加)
  - DOMAIN-SUFFIX,supabase.co,DIRECT
  - DOMAIN-SUFFIX,supabase.net,DIRECT
  - DOMAIN-SUFFIX,supabase.io,DIRECT
  - DOMAIN-KEYWORD,supabase,DIRECT
  
'@
    
    $content = $content -replace "(rules:)", "`$1`n$supabaseRules"
}

# 备份原配置
$backupPath = "$clashConfigPath.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item $clashConfigPath $backupPath -Force
Write-Host "💾 已备份原配置到: $backupPath" -ForegroundColor Green

# 写入新配置
Set-Content $clashConfigPath $content -Encoding UTF8 -NoNewline

Write-Host "✅ 配置文件已更新！" -ForegroundColor Green
Write-Host ""
Write-Host "📋 接下来请执行以下步骤:" -ForegroundColor Cyan
Write-Host "1. 打开 Clash for Windows" -ForegroundColor White
Write-Host "2. 点击 'Profiles' (配置)" -ForegroundColor White
Write-Host "3. 点击当前配置右侧的刷新按钮 🔄" -ForegroundColor White
Write-Host "4. 或者直接重启 Clash" -ForegroundColor White
Write-Host ""
Write-Host "⚡ 然后运行测试脚本验证: .\test-db-connection.ps1" -ForegroundColor Yellow
