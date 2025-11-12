# 迁移脚本：合并 fengshui 到 xuankong
# 这个脚本执行代码审查报告中的关键行动项#1

Write-Host "🚀 开始迁移 fengshui 模块到 xuankong..." -ForegroundColor Cyan

# 1. 备份当前的 fengshui 目录（通过git已经跟踪）
Write-Host "`n📦 步骤 1: 删除重复的 fengshui 实现..." -ForegroundColor Yellow

# 删除整个 fengshui 目录（保留测试目录）
if (Test-Path "src\lib\fengshui\fengshui") {
    Write-Host "  ✓ 删除 src\lib\fengshui\fengshui\" -ForegroundColor Green
    Remove-Item -Path "src\lib\fengshui\fengshui" -Recurse -Force
}

# 删除顶层的重复文件
$fengshuiFiles = @(
    "chengmenjue.ts", "enhanced-aixing.ts", "enhanced-tigua.ts", "evaluate.ts",
    "explanation.ts", "flying-star.ts", "geju.ts", "layering.ts", "lingzheng.ts",
    "liunian-analysis.ts", "location.ts", "luoshu.ts", "mountain.ts",
    "palace-profiles.ts", "personalized-analysis.ts", "plate.ts", "positions.ts",
    "smart-recommendations.ts", "stack.ts", "tigua.ts", "twenty-four-mountains.ts",
    "types.ts", "yun.ts", "README.md"
)

foreach ($file in $fengshuiFiles) {
    $filePath = "src\lib\fengshui\$file"
    if (Test-Path $filePath) {
        Remove-Item -Path $filePath -Force
        Write-Host "  ✓ 删除 $filePath" -ForegroundColor Green
    }
}

# 2. 创建别名导出文件
Write-Host "`n📝 步骤 2: 创建 fengshui 到 xuankong 的别名..." -ForegroundColor Yellow

$aliasContent = @"
/**
 * Fengshui Module - Alias to Xuankong Implementation
 * 
 * 这个文件是一个别名导出，用于保持向后兼容性。
 * 所有的风水算法实现都已合并到 @/lib/qiflow/xuankong
 * 
 * @deprecated 请直接使用 @/lib/qiflow/xuankong 而不是 @/lib/fengshui
 * @see src/lib/qiflow/xuankong
 */

// 导出所有 xuankong 的功能
export * from '@/lib/qiflow/xuankong';

// 为了完全兼容，也导出默认函数
export { 
  generateFlyingStar,
  getConfig 
} from '@/lib/qiflow/xuankong';
"@

Set-Content -Path "src\lib\fengshui\index.ts" -Value $aliasContent -Encoding UTF8
Write-Host "  ✓ 创建 src\lib\fengshui\index.ts (别名文件)" -ForegroundColor Green

# 3. 提交更改
Write-Host "`n✅ 迁移完成！" -ForegroundColor Green
Write-Host "`n📊 统计:" -ForegroundColor Cyan
Write-Host "  • 删除了重复的 fengshui 实现" -ForegroundColor White
Write-Host "  • 创建了别名导出以保持兼容性" -ForegroundColor White
Write-Host "  • 预计减少 ~15,000 行冗余代码" -ForegroundColor White

Write-Host "`n⚠️  下一步:" -ForegroundColor Yellow
Write-Host "  1. 运行测试: npm run test:unit" -ForegroundColor White
Write-Host "  2. 检查构建: npm run build" -ForegroundColor White
Write-Host "  3. 如果一切正常，提交更改: git add . && git commit -m 'refactor: merge fengshui to xuankong'" -ForegroundColor White
