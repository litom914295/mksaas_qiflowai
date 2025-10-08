# AI聊天功能测试脚本 (PowerShell + curl)
# 测试算法优先的完整流程

$API_URL = "http://localhost:3000/api/qiflow/chat"
$HEADERS = @{
    "Content-Type" = "application/json"
}

Write-Host "🚀 开始AI聊天功能测试" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Gray

# 测试1: 询问八字问题（无数据）
Write-Host "`n🧪 测试1: 询问八字问题（无数据）" -ForegroundColor Yellow
$body1 = @{
    message = "我的用神是什么？"
    context = @{}
} | ConvertTo-Json -Compress

Write-Host "📤 请求: $body1" -ForegroundColor Gray

try {
    $response1 = Invoke-WebRequest -Uri $API_URL -Method POST -Body $body1 -ContentType "application/json" -ErrorAction Stop
    $result1 = $response1.Content | ConvertFrom-Json
    
    Write-Host "📥 响应类型: $($result1.type)" -ForegroundColor Green
    if ($result1.response) {
        Write-Host "📥 响应内容: $($result1.response.Substring(0, [Math]::Min(100, $result1.response.Length)))..." -ForegroundColor Green
    }
    
    if ($result1.type -eq "need_birth_info") {
        Write-Host "✅ 测试通过: 正确要求提供生辰信息" -ForegroundColor Green
    } else {
        Write-Host "❌ 测试失败: 期望 need_birth_info, 实际 $($result1.type)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 请求失败: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# 测试2: 提供生辰信息
Write-Host "`n🧪 测试2: 提供生辰信息" -ForegroundColor Yellow
$body2 = @{
    message = "1990年1月1日下午3点30分，男，北京"
    context = @{}
} | ConvertTo-Json -Compress

Write-Host "📤 请求: $body2" -ForegroundColor Gray

try {
    $response2 = Invoke-WebRequest -Uri $API_URL -Method POST -Body $body2 -ContentType "application/json" -ErrorAction Stop
    $result2 = $response2.Content | ConvertFrom-Json
    
    Write-Host "📥 响应类型: $($result2.type)" -ForegroundColor Green
    if ($result2.birthInfo) {
        Write-Host "📥 已保存生辰: $($result2.birthInfo.date) $($result2.birthInfo.time)" -ForegroundColor Green
    }
    if ($result2.calculatedBazi) {
        Write-Host "📥 已计算八字" -ForegroundColor Green
    }
    
    if ($result2.type -eq "birth_info_saved") {
        Write-Host "✅ 测试通过: 成功保存生辰并计算八字" -ForegroundColor Green
        
        # 保存数据供下个测试使用
        $savedBirthInfo = $result2.birthInfo
        $savedBazi = $result2.calculatedBazi
    } else {
        Write-Host "⚠️ 响应类型: $($result2.type)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ 请求失败: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# 测试3: 基于已有数据询问
Write-Host "`n🧪 测试3: 基于已有数据询问" -ForegroundColor Yellow

# 构建包含上下文的请求
$contextData = @{
    birthInfo = @{
        date = "1990-01-01"
        time = "15:30"
        gender = "male"
        location = "北京"
    }
}

# 如果有之前的计算结果，使用它
if ($savedBazi) {
    $contextData.calculatedBazi = $savedBazi
}

$body3 = @{
    message = "我的财运如何？"
    context = $contextData
} | ConvertTo-Json -Depth 10 -Compress

Write-Host "📤 请求: 我的财运如何？（带上下文）" -ForegroundColor Gray

try {
    $response3 = Invoke-WebRequest -Uri $API_URL -Method POST -Body $body3 -ContentType "application/json" -ErrorAction Stop
    $result3 = $response3.Content | ConvertFrom-Json
    
    Write-Host "📥 响应类型: $($result3.type)" -ForegroundColor Green
    Write-Host "📥 积分消耗: $($result3.creditsUsed)" -ForegroundColor Green
    if ($result3.response) {
        Write-Host "📥 响应内容: $($result3.response.Substring(0, [Math]::Min(100, $result3.response.Length)))..." -ForegroundColor Green
    }
    
    if ($result3.type -eq "ai_with_algorithm") {
        Write-Host "✅ 测试通过: 基于算法数据的AI回答" -ForegroundColor Green
    } else {
        Write-Host "⚠️ 响应类型: $($result3.type)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ 请求失败: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# 测试4: 混合输入（生辰+问题）
Write-Host "`n🧪 测试4: 混合输入（生辰+问题）" -ForegroundColor Yellow
$body4 = @{
    message = "1973年1月7日2点30分男性岳阳，我的用神是什么？"
    context = @{}
} | ConvertTo-Json -Compress

Write-Host "📤 请求: $body4" -ForegroundColor Gray

try {
    $response4 = Invoke-WebRequest -Uri $API_URL -Method POST -Body $body4 -ContentType "application/json" -ErrorAction Stop
    $result4 = $response4.Content | ConvertFrom-Json
    
    Write-Host "📥 响应类型: $($result4.type)" -ForegroundColor Green
    if ($result4.birthInfo) {
        Write-Host "📥 识别生辰: $($result4.birthInfo.date) $($result4.birthInfo.time)" -ForegroundColor Green
    }
    if ($result4.response) {
        Write-Host "📥 响应内容: $($result4.response.Substring(0, [Math]::Min(100, $result4.response.Length)))..." -ForegroundColor Green
    }
    
    if ($result4.type -eq "ai_with_algorithm" -or $result4.type -eq "birth_info_saved") {
        Write-Host "✅ 测试通过: 自动识别并处理" -ForegroundColor Green
    } else {
        Write-Host "⚠️ 响应类型: $($result4.type)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ 请求失败: $_" -ForegroundColor Red
}

Write-Host "`n================================" -ForegroundColor Gray
Write-Host "✨ 测试完成" -ForegroundColor Cyan

# 测试登录状态
Write-Host "`n📌 提示：如果测试失败，请确保：" -ForegroundColor Yellow
Write-Host "   1. 开发服务器正在运行 (npm run dev)" -ForegroundColor Gray
Write-Host "   2. 已登录系统（访问 http://localhost:3000 并登录）" -ForegroundColor Gray
Write-Host "   3. 配置了AI密钥 (DEEPSEEK_API_KEY 等)" -ForegroundColor Gray