# C2: 依赖与配置对齐（最小侵入）
# 运行位置：项目根目录
# 产物：qiflowai/artifacts/C2/{deps.diff,typecheck.txt,install.log}

$ErrorActionPreference = 'Continue'
$ProgressPreference = 'SilentlyContinue'

function Ensure-Dir($p) {
  if (-not (Test-Path $p)) {
    New-Item -ItemType Directory -Path $p | Out-Null
  }
}

Ensure-Dir "qiflowai/artifacts/C2"

# 依赖差异（若源 package.json 不存在则说明情况）
if (Test-Path "qiflow-ai/package.json") {
  try {
    $diff = & git diff --no-index -- "qiflow-ai/package.json" "package.json" 2>$null
    if (-not $diff) { $diff = "(no diff or suppressed by git)" }
    $diff | Set-Content -Encoding UTF8 "qiflowai/artifacts/C2/deps.diff"
  } catch {
    "git diff failed (ignored): $($_.Exception.Message)" | Set-Content -Encoding UTF8 "qiflowai/artifacts/C2/deps.diff"
  }
} else {
  "source qiflow-ai/package.json not found, skip diff" |
    Set-Content -Encoding UTF8 "qiflowai/artifacts/C2/deps.diff"
}

# 确保 pnpm 可用（优先 corepack）
try { corepack enable 2>$null | Out-Null } catch {}

# 安装依赖并记录日志
$installLog = "qiflowai/artifacts/C2/install.log"
try {
  (& pnpm --version) 2>&1 | Out-File -Encoding UTF8 -Append $installLog
  (& pnpm install --frozen-lockfile) 2>&1 | Tee-Object -FilePath $installLog | Out-Null
} catch {
  "pnpm install failed (ignored): $($_.Exception.Message)" | Out-File -Encoding UTF8 -Append $installLog
}

# 类型检查（尽量使用本地 tsc；若失败，尝试 npx）
$typeLog = "qiflowai/artifacts/C2/typecheck.txt"
try {
  (& pnpm exec tsc -p tsconfig.json --noEmit) 2>&1 | Tee-Object -FilePath $typeLog | Out-Null
} catch {
  try {
    (& npx -y typescript tsc -p tsconfig.json --noEmit) 2>&1 | Tee-Object -FilePath $typeLog | Out-Null
  } catch {
    "typecheck failed (ignored): $($_.Exception.Message)" | Out-File -Encoding UTF8 -Append $typeLog
  }
}

Write-Host "[C2] artifacts created at qiflowai/artifacts/C2"
