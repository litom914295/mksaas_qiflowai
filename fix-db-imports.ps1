# 修复所有 db 导入的脚本
# 将 import { db } 改为 import { getDb }
# 将 db.xxx 改为 (await getDb()).xxx

$files = @(
    "src\actions\chat\create-chat-session.ts",
    "src\actions\chat\end-chat-session.ts",
    "src\actions\chat\get-chat-session-status.ts",
    "src\actions\chat\renew-chat-session.ts",
    "src\actions\qiflow\claim-ab-test-reward.ts",
    "src\actions\qiflow\generate-monthly-fortune.ts",
    "src\actions\qiflow\purchase-report-with-credits.ts",
    "src\app\(dashboard)\reports\[reportId]\page.tsx",
    "src\app\(dashboard)\reports\essential\buy\page.tsx",
    "src\app\(dashboard)\reports\page.tsx",
    "src\cron\generate-monthly-fortunes.ts",
    "src\lib\ab-test\manager.ts",
    "src\lib\audit\logAudit.ts",
    "src\lib\rag\rag-generator.ts",
    "src\lib\rag\vector-search.ts"
)

foreach ($file in $files) {
    $fullPath = "D:\test\mksaas_qiflowai\$file"
    if (Test-Path $fullPath) {
        Write-Host "Processing: $file"
        $content = Get-Content $fullPath -Raw
        
        # 1. 修改 import 语句
        $content = $content -replace "import \{ db \} from '@/db';", "import { getDb } from '@/db';"
        
        # 2. 添加 const db = await getDb(); 在函数开头(这一步需要手动精确处理)
        # 我们先标记需要修改的位置
        
        Set-Content $fullPath $content -NoNewline
        Write-Host "  ✓ Updated imports"
    } else {
        Write-Host "  ✗ File not found: $file"
    }
}

Write-Host "`nPhase 1 complete: imports updated"
Write-Host 'Next: manually add const db = await getDb(); at the start of each async function'
