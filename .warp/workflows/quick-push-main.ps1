#!/usr/bin/env pwsh
# 快速推送到主分支的脚本
# 使用方法: .\.warp\workflows\quick-push-main.ps1 [-Message "提交消息"]

param(
    [Parameter(Position=0)]
    [string]$Message = "feat: 更新代码",
    
    [Parameter()]
    [switch]$SkipVerification = $false,
    
    [Parameter()]
    [switch]$Force = $false
)

# 设置颜色输出
function Show-Separator {
    Write-Host ("=" * 60) -ForegroundColor DarkGray
}

function Show-Step {
    param($StepName)
    Write-Host ""
    Show-Separator
    Write-Host "🔄 $StepName" -ForegroundColor Cyan
    Show-Separator
}

function Show-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Show-Warning {
    param($Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Show-Error {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# 主函数
function Push-ToMain {
    try {
        # 1. 检查Git仓库
        Show-Step "检查Git仓库状态"
        
        if (-not (Test-Path .git)) {
            Show-Error "当前目录不是Git仓库"
            return 1
        }
        
        $currentBranch = git branch --show-current
        Write-Host "当前分支: $currentBranch"
        
        # 2. 显示当前状态
        $status = git status --porcelain
        if ($status) {
            Write-Host ""
            Write-Host "发现以下更改:" -ForegroundColor Yellow
            git status --short
        }
        else {
            Show-Success "工作目录干净，没有需要提交的更改"
            
            if (-not $Force) {
                return 0
            }
        }
        
        # 3. 添加所有更改
        if ($status) {
            Show-Step "添加所有更改到暂存区"
            git add -A
            
            $stagedFiles = git diff --cached --name-only | Measure-Object -Line
            Show-Success "已添加 $($stagedFiles.Lines) 个文件到暂存区"
            
            # 显示将要提交的更改摘要
            Write-Host ""
            Write-Host "更改摘要:" -ForegroundColor Cyan
            git diff --cached --stat
        }
        
        # 4. 提交更改
        if ($status) {
            Show-Step "提交更改"
            
            $commitResult = git commit -m $Message 2>&1
            if ($LASTEXITCODE -eq 0) {
                Show-Success "提交成功"
                Write-Host $commitResult
            }
            elseif ($commitResult -match "nothing to commit") {
                Show-Warning "没有需要提交的更改"
            }
            else {
                Show-Error "提交失败"
                Write-Host $commitResult
                return 1
            }
        }
        
        # 5. 切换到主分支（如果需要）
        if ($currentBranch -ne "main") {
            Show-Step "切换到主分支"
            
            git checkout main
            if ($LASTEXITCODE -ne 0) {
                Show-Error "无法切换到主分支"
                return 1
            }
            
            Show-Success "已切换到主分支"
            
            # 更新主分支
            Write-Host "更新主分支..."
            git pull origin main --rebase
            
            # 合并原分支
            Show-Step "合并 $currentBranch 分支"
            git merge $currentBranch --no-ff -m "Merge branch '$currentBranch' into main"
            
            if ($LASTEXITCODE -ne 0) {
                Show-Error "合并失败，可能存在冲突"
                Write-Host "请手动解决冲突后重新运行脚本"
                return 1
            }
            Show-Success "合并成功"
        }
        
        # 6. 推送到远程
        Show-Step "推送到远程主分支"
        
        $pushResult = git push origin main 2>&1
        if ($LASTEXITCODE -ne 0) {
            Show-Error "推送失败"
            Write-Host $pushResult
            
            # 尝试拉取并重新推送
            Show-Warning "尝试拉取远程更改并重新推送..."
            git pull origin main --rebase
            git push origin main
            
            if ($LASTEXITCODE -ne 0) {
                Show-Error "推送仍然失败，请检查网络连接或权限"
                return 1
            }
        }
        
        Show-Success "成功推送到远程主分支"
        
        # 7. 验证推送（除非跳过）
        if (-not $SkipVerification) {
            Show-Step "验证推送结果"
            
            git fetch origin
            $localCommit = git rev-parse HEAD
            $remoteCommit = git rev-parse origin/main
            
            if ($localCommit -eq $remoteCommit) {
                Show-Success "本地和远程完全同步"
            }
            else {
                Show-Warning "本地和远程存在差异，请检查"
            }
            
            # 显示最新提交
            Write-Host ""
            Write-Host "最新5个提交:" -ForegroundColor Cyan
            git log --oneline -n 5
        }
        
        # 8. 显示摘要
        Show-Step "推送完成摘要"
        
        $url = git remote get-url origin
        if ($url -match "github\.com[:/](.+?)(?:\.git)?$") {
            $repo = $matches[1]
            Write-Host ""
            Write-Host "GitHub 仓库: " -NoNewline
            Write-Host "https://github.com/$repo" -ForegroundColor Yellow
            Write-Host "查看提交: " -NoNewline
            Write-Host "https://github.com/$repo/commits/main" -ForegroundColor Yellow
            Write-Host "查看Actions: " -NoNewline
            Write-Host "https://github.com/$repo/actions" -ForegroundColor Yellow
        }
        
        Write-Host ""
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Show-Success "所有更改已于 $timestamp 成功推送到主分支！"
        
        return 0
    }
    catch {
        Show-Error "发生未预期的错误: $_"
        return 1
    }
}

# 执行主函数
$exitCode = Push-ToMain
exit $exitCode