# 简化版推送脚本
param(
    [string]$Message = "feat: 更新代码"
)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "        Warp 推送工作流" -ForegroundColor Cyan  
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# 1. 检查状态
Write-Host "📋 检查仓库状态..." -ForegroundColor Yellow
$status = git status --porcelain

if ($status) {
    Write-Host "发现更改，准备提交..." -ForegroundColor Green
    
    # 2. 添加所有更改
    Write-Host "➕ 添加所有更改..." -ForegroundColor Yellow
    git add -A
    
    # 3. 提交
    Write-Host "💾 提交更改..." -ForegroundColor Yellow
    git commit -m $Message
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 提交失败" -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "✅ 没有需要提交的更改" -ForegroundColor Green
}

# 4. 推送
Write-Host "🚀 推送到远程主分支..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  首次推送失败，尝试拉取后再推送..." -ForegroundColor Yellow
    git pull origin main --rebase
    git push origin main
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "✅ 推送成功完成！" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
    
    # 显示最新提交
    Write-Host ""
    Write-Host "最新提交：" -ForegroundColor Cyan
    git log --oneline -n 3
    
    # 显示GitHub链接
    $url = git remote get-url origin
    if ($url -match "github\.com[:/]([^/]+)/([^\.]+)") {
        $owner = $matches[1]
        $repo = $matches[2]
        Write-Host ""
        Write-Host "🔗 GitHub: https://github.com/$owner/$repo" -ForegroundColor Yellow
    }
}
else {
    Write-Host "❌ 推送失败，请检查网络或权限" -ForegroundColor Red
    exit 1
}