# QiFlow AI 品牌迁移脚本
# 用途：将所有 qiflowai 品牌痕迹替换为 QiFlow AI
# 作者：AI Agent
# 日期：2025-10-27

param(
    [switch]$DryRun = $false,
    [switch]$SkipScan = $false
)

$ErrorActionPreference = "Stop"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  QiFlow AI 品牌迁移工具" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "[DRY RUN 模式] 仅模拟，不会实际修改文件" -ForegroundColor Yellow
    Write-Host ""
}

# 排除模式
$exclude = '\\.(git|next|turbo)|\\node_modules\\|\\dist\\|\\build\\|\\.archive\\'

# 步骤 1: 初始扫描（如果需要）
if (-not $SkipScan) {
    Write-Host "[1/7] 扫描 qiflowai 引用..." -ForegroundColor Green
    try {
        $files = Get-ChildItem -Recurse -File | Where-Object { 
            $_.FullName -notmatch $exclude 
        }
        $matches = Select-String -Path $files.FullName -Pattern '(?i)qiflowai' -ErrorAction SilentlyContinue
        
        if ($matches) {
            $grouped = $matches | Group-Object Path
            Write-Host "  发现 $($grouped.Count) 个文件包含 qiflowai 引用" -ForegroundColor Yellow
            Write-Host "  总共 $($matches.Count) 处匹配" -ForegroundColor Yellow
        } else {
            Write-Host "  未发现 qiflowai 引用" -ForegroundColor Green
        }
    } catch {
        Write-Host "  扫描过程中出现警告：$($_.Exception.Message)" -ForegroundColor Yellow
    }
    Write-Host ""
}

# 步骤 2: 批量文本替换（代码、配置、文档）
Write-Host "[2/7] 批量文本替换..." -ForegroundColor Green

$ext = @(".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".mdx", ".yml", ".yaml", ".txt", ".css", ".scss")
$filter = Get-ChildItem -Recurse -File | Where-Object {
    $_.FullName -notmatch $exclude -and
    $ext -contains $_.Extension
}

$replacedCount = 0
$fileCount = 0

foreach ($f in $filter) {
    try {
        $content = Get-Content -Raw -Encoding UTF8 $f.FullName -ErrorAction Stop
        $originalContent = $content
        
        # 替换品牌名称（保持大小写）
        $content = [regex]::Replace($content, '\bQiFlow AI\b', 'QiFlow AI')
        $content = [regex]::Replace($content, '\bQiFlow AI\b', 'QiFlow AI')
        
        # 替换 slug/标识符
        $content = [regex]::Replace($content, '\bQiFlow AI\b', 'qiflowai')
        
        # 替换组件与资源名
        $content = $content -replace 'logo-qiflowai', 'logo-qiflowai'
        $content = $content -replace 'qiflowai\.png', 'qiflowai.png'
        $content = $content -replace 'qiflowai\.svg', 'qiflowai.svg'
        
        # 替换 "Built with" 文案
        $content = $content -creplace 'Built with', 'Powered by QiFlow AI'
        $content = $content -creplace 'built with', 'Powered by QiFlow AI'
        
        # 替换 URL 和邮箱
        $content = $content -replace 'https?://qiflowai\.com', 'https://qiflow.ai'
        $content = $content -replace '@qiflowai\.com', '@qiflow.ai'
        $content = $content -replace 'QiFlow AIHQ', 'qiflowai'
        
        if ($content -ne $originalContent) {
            if (-not $DryRun) {
                Set-Content -Path $f.FullName -Value $content -Encoding UTF8 -NoNewline
            }
            $replacedCount++
            Write-Host "  ✓ $($f.FullName.Substring($PWD.Path.Length + 1))" -ForegroundColor Gray
        }
        $fileCount++
    } catch {
        Write-Host "  ✗ 处理失败: $($f.Name) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "  处理了 $fileCount 个文件，修改了 $replacedCount 个文件" -ForegroundColor Cyan
Write-Host ""

# 步骤 3: 环境变量前缀替换
Write-Host "[3/7] 替换环境变量前缀..." -ForegroundColor Green

$envFiles = Get-ChildItem -Recurse -File -Include ".env*", "*.env", "*.env.*" | 
    Where-Object { $_.FullName -notmatch '\\.archive\\' }

$envReplacedCount = 0

foreach ($f in $envFiles) {
    try {
        $content = Get-Content -Raw -Encoding UTF8 $f.FullName
        $originalContent = $content
        
        $content = $content -replace '(?m)^QiFlow AI_', 'QIFLOWAI_'
        $content = $content -replace '(?m)^NEXT_PUBLIC_QiFlow AI_', 'NEXT_PUBLIC_QIFLOWAI_'
        
        if ($content -ne $originalContent) {
            if (-not $DryRun) {
                Set-Content -Path $f.FullName -Value $content -Encoding UTF8 -NoNewline
            }
            $envReplacedCount++
            Write-Host "  ✓ $($f.Name)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  ✗ 处理失败: $($f.Name) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "  修改了 $envReplacedCount 个环境文件" -ForegroundColor Cyan
Write-Host ""

# 步骤 4: 重命名特殊文件
Write-Host "[4/7] 重命名特殊文件..." -ForegroundColor Green

$renames = @(
    @{ From = "src/components/layout/logo-qiflowai.tsx"; To = "src/components/layout/logo-qiflowai.tsx" },
    @{ From = "content/author/qiflowai.mdx"; To = "content/author/qiflowai.mdx" },
    @{ From = "content/author/qiflowai.zh.mdx"; To = "content/author/qiflowai.zh.mdx" },
    @{ From = "public/qiflowai.png"; To = "public/qiflowai.png" },
    @{ From = "public/images/avatars/qiflowai.png"; To = "public/images/avatars/qiflowai.png" }
)

$renameCount = 0

foreach ($rename in $renames) {
    if (Test-Path $rename.From) {
        if (-not $DryRun) {
            $dir = Split-Path $rename.To -Parent
            if (-not (Test-Path $dir)) {
                New-Item -ItemType Directory -Path $dir -Force | Out-Null
            }
            git mv $rename.From $rename.To 2>&1 | Out-Null
            if ($LASTEXITCODE -ne 0) {
                Move-Item -Path $rename.From -Destination $rename.To -Force
            }
        }
        Write-Host "  ✓ $($rename.From) → $($rename.To)" -ForegroundColor Gray
        $renameCount++
    }
}

Write-Host "  重命名了 $renameCount 个文件" -ForegroundColor Cyan
Write-Host ""

# 步骤 5: 更新 package.json
Write-Host "[5/7] 更新 package.json..." -ForegroundColor Green

if (Test-Path "package.json") {
    try {
        $pkg = Get-Content "package.json" -Raw | ConvertFrom-Json -AsHashtable
        
        $pkg.name = "qiflowai"
        $pkg.description = "QiFlow AI - AI-powered BaZi and Feng Shui analysis platform"
        $pkg.homepage = "https://qiflow.ai"
        $pkg.author = "QiFlow AI Team"
        
        if (-not $pkg.repository) {
            $pkg.repository = @{}
        }
        $pkg.repository.type = "git"
        $pkg.repository.url = "https://github.com/litom914295/QiFlow AI_qiflowai.git"
        
        if (-not $pkg.bugs) {
            $pkg.bugs = @{}
        }
        $pkg.bugs.url = "https://github.com/litom914295/QiFlow AI_qiflowai/issues"
        
        $pkg.keywords = @("qiflowai", "bazi", "fengshui", "ai", "astrology", "nextjs", "xuankong")
        
        if (-not $pkg.scripts) {
            $pkg.scripts = @{}
        }
        $pkg.scripts."brand:verify" = "pwsh -File scripts/gates/verify-brand.ps1"
        $pkg.scripts."brand:assets" = "pwsh -File scripts/brand/generate-assets.ps1"
        
        if (-not $DryRun) {
            $pkg | ConvertTo-Json -Depth 10 | Set-Content "package.json" -Encoding UTF8
        }
        
        Write-Host "  ✓ package.json 已更新" -ForegroundColor Gray
    } catch {
        Write-Host "  ✗ 更新 package.json 失败: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# 步骤 6: 更新站点配置
Write-Host "[6/7] 更新站点配置..." -ForegroundColor Green

$configFiles = @(
    "src/config/website.tsx",
    "src/config/site.ts",
    "src/config/seo.ts"
)

$configUpdated = 0

foreach ($configFile in $configFiles) {
    if (Test-Path $configFile) {
        try {
            $content = Get-Content -Raw -Encoding UTF8 $configFile
            $originalContent = $content
            
            # 替换社交媒体链接
            $content = $content -replace 'https://github\.com/QiFlow AIHQ', 'https://github.com/qiflowai'
            $content = $content -replace 'https://qiflowai\.link/[^''\"]+', 'https://qiflow.ai'
            
            # 替换邮箱
            $content = $content -replace 'support@qiflowai\.com', 'support@qiflow.ai'
            $content = $content -replace 'qiflowai <support@qiflowai\.com>', 'QiFlow AI <support@qiflow.ai>'
            
            if ($content -ne $originalContent) {
                if (-not $DryRun) {
                    Set-Content -Path $configFile -Value $content -Encoding UTF8 -NoNewline
                }
                $configUpdated++
                Write-Host "  ✓ $configFile" -ForegroundColor Gray
            }
        } catch {
            Write-Host "  ✗ 处理失败: $configFile - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "  更新了 $configUpdated 个配置文件" -ForegroundColor Cyan
Write-Host ""

# 步骤 7: 验证扫描
Write-Host "[7/7] 验证扫描..." -ForegroundColor Green

try {
    $files = Get-ChildItem -Recurse -File | Where-Object { 
        $_.FullName -notmatch $exclude 
    }
    $remaining = Select-String -Path $files.FullName -Pattern '(?i)qiflowai' -ErrorAction SilentlyContinue
    
    if ($remaining) {
        $grouped = $remaining | Group-Object Path
        Write-Host "  ⚠ 仍有 $($grouped.Count) 个文件包含 qiflowai 引用" -ForegroundColor Yellow
        Write-Host "  总共 $($remaining.Count) 处匹配" -ForegroundColor Yellow
        
        Write-Host "`n  详细列表（前 10 项）：" -ForegroundColor Yellow
        $grouped | Select-Object -First 10 | ForEach-Object {
            Write-Host "    - $($_.Name): $($_.Count) 处" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ✓ 所有 qiflowai 引用已替换完成！" -ForegroundColor Green
    }
} catch {
    Write-Host "  ⚠ 验证扫描出现警告：$($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  品牌迁移完成！" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "这是 DRY RUN 模式的结果。要实际执行，请运行：" -ForegroundColor Yellow
    Write-Host "  pwsh scripts/migrate-brand-to-qiflowai.ps1" -ForegroundColor Cyan
} else {
    Write-Host "下一步：" -ForegroundColor Yellow
    Write-Host "  1. 检查更改：git status" -ForegroundColor Cyan
    Write-Host "  2. 测试构建：npm run build" -ForegroundColor Cyan
    Write-Host "  3. 提交更改：git add -A && git commit -m 'chore(brand): migrate to QiFlow AI'" -ForegroundColor Cyan
}

Write-Host ""
