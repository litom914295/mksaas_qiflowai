# C1: 结构盘点与映射（ASCII 安全版）
# 运行位置：项目根目录
# 产物：qiflowai/artifacts/C1/{source_files.txt,target_dirs.txt,mapping.md}

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

function Ensure-Dir($p) {
  if (-not (Test-Path $p)) {
    New-Item -ItemType Directory -Path $p | Out-Null
  }
}

Ensure-Dir "qiflowai/artifacts/C1"

# 源文件清单（若不存在则生成空文件）
if (Test-Path "qiflow-ai") {
  Get-ChildItem -Recurse -File -Path "qiflow-ai" |
    Sort-Object FullName |
    Select-Object -ExpandProperty FullName |
    Set-Content -Encoding UTF8 "qiflowai/artifacts/C1/source_files.txt"
} else {
  "" | Set-Content -Encoding UTF8 "qiflowai/artifacts/C1/source_files.txt"
}

# 目标目录清单（仅目录）
if (Test-Path "src") {
  Get-ChildItem -Recurse -Directory -Path "src" |
    Sort-Object FullName |
    Select-Object -ExpandProperty FullName |
    Set-Content -Encoding UTF8 "qiflowai/artifacts/C1/target_dirs.txt"
} else {
  "" | Set-Content -Encoding UTF8 "qiflowai/artifacts/C1/target_dirs.txt"
}

# 映射说明（使用 ASCII 内容避免编码问题）
$mapping = @(
  "# qiflow-ai -> qiflowai mapping (static)",
  "- algorithms: qiflow-ai/lib/** -> src/lib/qiflow/**",
  "- ui-components: qiflow-ai/components/** -> src/components/qiflow/**",
  "- server/actions: qiflow-ai/(api|server|actions)/** -> src/actions/qiflow/** or app/api/**",
  "- app routes (App Router + i18n): qiflow-ai/app/** -> src/app/[locale]/(dashboard|analysis)/**",
  "- database: schema fragments -> src/db/schema-qiflow.ts and export via src/db/index.ts"
)
$mapping | Set-Content -Encoding UTF8 "qiflowai/artifacts/C1/mapping.md"

Write-Host "[C1] artifacts created at qiflowai/artifacts/C1"

