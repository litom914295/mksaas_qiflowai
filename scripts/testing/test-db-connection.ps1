# 数据库连接测试脚本
# 用途: 验证 Supabase 数据库是否可以正常连接

$supabaseHost = "db.sibwcdadrsbfkblinezj.supabase.co"
$poolerHost = "sibwcdadrsbfkblinezj.pooler.supabase.net"

Write-Host "🔍 开始测试 Supabase 数据库连接..." -ForegroundColor Cyan
Write-Host ""

# 测试 1: DNS 解析
Write-Host "📡 测试 1: DNS 解析" -ForegroundColor Yellow
Write-Host "主机名: $supabaseHost" -ForegroundColor White

try {
    $dnsResult = Resolve-DnsName $supabaseHost -ErrorAction Stop
    Write-Host "✅ DNS 解析成功" -ForegroundColor Green
    
    foreach ($record in $dnsResult) {
        if ($record.Type -eq "A") {
            Write-Host "   IPv4: $($record.IPAddress)" -ForegroundColor Gray
        } elseif ($record.Type -eq "AAAA") {
            Write-Host "   IPv6: $($record.IPAddress)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "❌ DNS 解析失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 测试 2: Pooler DNS 解析
Write-Host "📡 测试 2: Pooler DNS 解析" -ForegroundColor Yellow
Write-Host "主机名: $poolerHost" -ForegroundColor White

try {
    $poolerDnsResult = Resolve-DnsName $poolerHost -ErrorAction Stop
    Write-Host "✅ Pooler DNS 解析成功" -ForegroundColor Green
    
    foreach ($record in $poolerDnsResult) {
        if ($record.Type -eq "A") {
            Write-Host "   IPv4: $($record.IPAddress)" -ForegroundColor Gray
        } elseif ($record.Type -eq "AAAA") {
            Write-Host "   IPv6: $($record.IPAddress)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "❌ Pooler DNS 解析失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 测试 3: Ping 连接
Write-Host "🏓 测试 3: Ping 连接" -ForegroundColor Yellow
Write-Host "主机名: $supabaseHost" -ForegroundColor White

$pingResult = Test-Connection -ComputerName $supabaseHost -Count 2 -ErrorAction SilentlyContinue

if ($pingResult) {
    Write-Host "✅ Ping 成功" -ForegroundColor Green
    $avgTime = ($pingResult | Measure-Object -Property ResponseTime -Average).Average
    Write-Host "   平均响应时间: $([math]::Round($avgTime, 2)) ms" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Ping 超时（这是正常的，Supabase 可能禁用了 ICMP）" -ForegroundColor Yellow
    Write-Host "   只要 DNS 解析成功，数据库就应该能连接" -ForegroundColor Gray
}

Write-Host ""

# 测试 4: 端口连接
Write-Host "🔌 测试 4: PostgreSQL 端口 5432 连接" -ForegroundColor Yellow

try {
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $connection = $tcpClient.BeginConnect($supabaseHost, 5432, $null, $null)
    $wait = $connection.AsyncWaitHandle.WaitOne(3000, $false)
    
    if ($wait -and $tcpClient.Connected) {
        Write-Host "✅ 端口 5432 可访问" -ForegroundColor Green
        $tcpClient.Close()
    } else {
        Write-Host "⚠️  端口 5432 连接超时" -ForegroundColor Yellow
        Write-Host "   可能是防火墙或网络策略限制" -ForegroundColor Gray
        $tcpClient.Close()
    }
} catch {
    Write-Host "❌ 端口测试失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# 总结
Write-Host ""
Write-Host "📊 测试总结" -ForegroundColor Cyan

$allPassed = $true

if (-not $dnsResult) {
    Write-Host "❌ DNS 解析失败 - 需要修复 Clash 配置" -ForegroundColor Red
    $allPassed = $false
}

if ($allPassed) {
    Write-Host "✅ 所有关键测试通过！" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 数据库连接应该可以正常工作" -ForegroundColor Green
    Write-Host "💡 现在可以启动开发服务器: npm run dev" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "🔧 修复建议:" -ForegroundColor Yellow
    Write-Host "1. 运行修复脚本: .\fix-clash-config.ps1" -ForegroundColor White
    Write-Host "2. 重启 Clash for Windows" -ForegroundColor White
    Write-Host "3. 再次运行此测试脚本" -ForegroundColor White
}

Write-Host ""
