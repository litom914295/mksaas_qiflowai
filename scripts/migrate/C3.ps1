# C3: 数据库扩展迁移（生成与应用）
# 运行位置：项目根目录
# 产物：qiflowai/artifacts/C3/migrate.log

$ErrorActionPreference = 'Continue'
$ProgressPreference = 'SilentlyContinue'

function Ensure-Dir($p) {
  if (-not (Test-Path $p)) {
    New-Item -ItemType Directory -Path $p | Out-Null
  }
}

Ensure-Dir "qiflowai/artifacts/C3"
$log = "qiflowai/artifacts/C3/migrate.log"

"==== C3 Migration Start $(Get-Date -Format o) ====\n" | Out-File -Encoding UTF8 $log

try {
  corepack enable 2>&1 | Tee-Object -FilePath $log -Append | Out-Null
  corepack prepare pnpm@latest --activate 2>&1 | Tee-Object -FilePath $log -Append | Out-Null
} catch {
  "[warn] corepack step failed: $($_.Exception.Message)" | Out-File -Encoding UTF8 -Append $log
}

try { (& pnpm --version) 2>&1 | Tee-Object -FilePath $log -Append | Out-Null } catch { "[warn] pnpm not found" | Out-File -Encoding UTF8 -Append $log }
try { (& node -v) 2>&1 | Tee-Object -FilePath $log -Append | Out-Null } catch {}

"\n-- db:generate --\n" | Out-File -Encoding UTF8 -Append $log
try {
  (& pnpm db:generate) 2>&1 | Tee-Object -FilePath $log -Append | Out-Null
} catch {
  "[error] db:generate failed: $($_.Exception.Message)" | Out-File -Encoding UTF8 -Append $log
}

"\n-- db:migrate --\n" | Out-File -Encoding UTF8 -Append $log
try {
  (& pnpm db:migrate) 2>&1 | Tee-Object -FilePath $log -Append | Out-Null
} catch {
  "[error] db:migrate failed: $($_.Exception.Message)" | Out-File -Encoding UTF8 -Append $log
}

"\n==== C3 Migration End $(Get-Date -Format o) ====\n" | Out-File -Encoding UTF8 -Append $log

Write-Host "[C3] migration attempted; see $log"






