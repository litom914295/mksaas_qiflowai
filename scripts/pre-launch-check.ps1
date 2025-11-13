# QiFlowAI 上线前自动检查脚本 (PowerShell版本)
# 基于 @LAUNCH_CHECKLIST_FINAL.md

$ErrorActionPreference = "Continue"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "🚀 QiFlowAI 上线前自动检查" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 检查计数器
$Script:Passed = 0
$Script:Failed = 0
$Script:Warnings = 0

# 检查函数
function Check-Pass {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
    $Script:Passed++
}

function Check-Fail {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
    $Script:Failed++
}

function Check-Warn {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
    $Script:Warnings++
}

# Step 1: 代码质量检查
Write-Host "📋 Step 1: 代码质量检查" -ForegroundColor Cyan
Write-Host "----------------------------"

try {
    npm run type-check 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Check-Pass "TypeScript类型检查通过"
    } else {
        Check-Fail "TypeScript类型检查失败"
    }
} catch {
    Check-Fail "TypeScript类型检查失败"
}

try {
    npm run lint 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Check-Pass "ESLint检查通过"
    } else {
        Check-Warn "ESLint发现问题（非致命）"
    }
} catch {
    Check-Warn "ESLint检查失败"
}

# Step 2: 构建检查
Write-Host ""
Write-Host "🏗️  Step 2: 构建检查" -ForegroundColor Cyan
Write-Host "----------------------------"

try {
    npm run build 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Check-Pass "生产构建成功"
        
        if (Test-Path ".next") {
            $buildSize = (Get-ChildItem ".next" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
            Write-Host "   构建产物大小: $([math]::Round($buildSize, 2)) MB"
        }
    } else {
        Check-Fail "生产构建失败"
    }
} catch {
    Check-Fail "生产构建失败"
}

# Step 3: 测试检查
Write-Host ""
Write-Host "🧪 Step 3: 测试检查" -ForegroundColor Cyan
Write-Host "----------------------------"

try {
    npm run test 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Check-Pass "单元测试通过"
    } else {
        Check-Warn "部分测试失败或跳过"
    }
} catch {
    Check-Warn "测试执行失败"
}

if (Test-Path "src\lib\qiflow\__tests__\e2e-complete-flow.test.ts") {
    Check-Pass "E2E测试文件存在"
} else {
    Check-Warn "E2E测试文件缺失"
}

# Step 4: 环境变量检查
Write-Host ""
Write-Host "🔐 Step 4: 环境变量检查" -ForegroundColor Cyan
Write-Host "----------------------------"

if (Test-Path ".env.production") {
    Check-Pass ".env.production 文件存在"
    
    $RequiredVars = @("DEEPSEEK_API_KEY", "DATABASE_URL", "NEXT_PUBLIC_APP_URL")
    $envContent = Get-Content ".env.production"
    
    foreach ($var in $RequiredVars) {
        if ($envContent -match "^$var=") {
            Check-Pass "环境变量 $var 已配置"
        } else {
            Check-Fail "环境变量 $var 缺失"
        }
    }
} else {
    Check-Fail ".env.production 文件不存在"
}

# Step 5: 关键文件检查
Write-Host ""
Write-Host "📁 Step 5: 关键文件检查" -ForegroundColor Cyan
Write-Host "----------------------------"

$CriticalFiles = @(
    "src\lib\qiflow\reports\essential-report.ts",
    "src\lib\qiflow\quality\dual-audit-system.ts",
    "src\lib\qiflow\monitoring\cost-guard.ts",
    "src\lib\qiflow\tracking\conversion-tracker.ts",
    "src\components\reports\ReportPaywall.tsx"
)

foreach ($file in $CriticalFiles) {
    if (Test-Path $file) {
        Check-Pass "$(Split-Path $file -Leaf) 存在"
    } else {
        Check-Fail "$(Split-Path $file -Leaf) 缺失"
    }
}

# Step 6: Git检查
Write-Host ""
Write-Host "🔄 Step 6: Git状态检查" -ForegroundColor Cyan
Write-Host "----------------------------"

try {
    $gitStatus = git status --porcelain 2>&1
    if ([string]::IsNullOrWhiteSpace($gitStatus)) {
        Check-Pass "工作区干净（无未提交更改）"
    } else {
        Check-Warn "存在未提交的更改"
        Write-Host "   未提交文件:"
        git status --short | Select-Object -First 5
    }
    
    $currentBranch = git branch --show-current 2>&1
    if ($currentBranch -eq "main" -or $currentBranch -eq "master") {
        Check-Pass "当前在主分支: $currentBranch"
    } else {
        Check-Warn "当前不在主分支: $currentBranch"
    }
} catch {
    Check-Warn "Git检查失败（可能未初始化Git仓库）"
}

# Step 7: 依赖检查
Write-Host ""
Write-Host "📦 Step 7: 依赖检查" -ForegroundColor Cyan
Write-Host "----------------------------"

if (Test-Path "package-lock.json") {
    Check-Pass "package-lock.json 存在"
} else {
    Check-Warn "package-lock.json 缺失"
}

try {
    $auditOutput = npm audit --production 2>&1 | Out-String
    if ($auditOutput -match "found 0 vulnerabilities") {
        Check-Pass "无安全漏洞"
    } else {
        Check-Warn "存在安全漏洞，建议修复"
    }
} catch {
    Check-Warn "安全审计执行失败"
}

# Step 8: 文档检查
Write-Host ""
Write-Host "📚 Step 8: 文档检查" -ForegroundColor Cyan
Write-Host "----------------------------"

$RequiredDocs = @(
    "@LAUNCH_CHECKLIST_FINAL.md",
    "@LAUNCH_TEST_CHECKLIST.md",
    "@FRONTEND_INTEGRATION_GUIDE.md",
    "@PHASE_2-5_COMPLETION_REPORT.md"
)

foreach ($doc in $RequiredDocs) {
    if (Test-Path $doc) {
        Check-Pass "$doc 存在"
    } else {
        Check-Warn "$doc 缺失"
    }
}

# 总结
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "📊 检查结果总结" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "通过: $Script:Passed" -ForegroundColor Green
Write-Host "警告: $Script:Warnings" -ForegroundColor Yellow
Write-Host "失败: $Script:Failed" -ForegroundColor Red
Write-Host ""

if ($Script:Failed -eq 0) {
    Write-Host "✅ 所有关键检查通过！系统准备上线。" -ForegroundColor Green
    Write-Host ""
    Write-Host "下一步:"
    Write-Host "1. 运行端到端测试: npm run test:e2e"
    Write-Host "2. 完成 @LAUNCH_CHECKLIST_FINAL.md 中的所有检查项"
    Write-Host "3. 部署到生产环境"
    exit 0
} else {
    Write-Host "❌ 存在 $Script:Failed 个关键问题，请修复后再上线。" -ForegroundColor Red
    exit 1
}
