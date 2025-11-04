# QiFlow AI 品牌验证守门脚本
# 用途：确保没有遗留的 qiflowai 引用

$ErrorActionPreference = "Stop"

Write-Host "正在验证品牌一致性..." -ForegroundColor Cyan

$exclude = '\.(git|next|turbo)|\\node_modules\\|\\dist\\|\\build\\|\\.archive\\'

try {
    $files = Get-ChildItem -Recurse -File | Where-Object { 
        $_.FullName -notmatch $exclude 
    }
    
    $fail = $files | Select-String -Pattern '(?i)qiflowai' -ErrorAction SilentlyContinue
    
    if ($fail) {
        $grouped = $fail | Group-Object Path
        Write-Host ""
        Write-Error "❌ 发现残留的 'qiflowai' 引用。请在提交前移除它们。"
        Write-Host ""
        Write-Host "受影响的文件（前 20 个）：" -ForegroundColor Yellow
        
        $grouped | Select-Object -First 20 | ForEach-Object {
            $relativePath = $_.Name.Replace($PWD.Path + "\", "")
            Write-Host "  - $relativePath ($($_.Count) 处)" -ForegroundColor Gray
        }
        
        if ($grouped.Count -gt 20) {
            Write-Host "  ... 以及其他 $($grouped.Count - 20) 个文件" -ForegroundColor Gray
        }
        
        Write-Host ""
        Write-Host "总共发现 $($fail.Count) 处匹配" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "✓ 品牌验证通过！未发现 qiflowai 残留。" -ForegroundColor Green
    exit 0
    
} catch {
    Write-Host "⚠ 验证过程中出现错误：$($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
