# Migrate fengshui duplicates to xuankong

Write-Host "Starting migration..." -ForegroundColor Green

# Step 1: Delete fengshui/fengshui subdirectory
$subdir = "src\lib\fengshui\fengshui"
if (Test-Path $subdir) {
    Write-Host "Deleting $subdir..." -ForegroundColor Yellow
    Remove-Item -Path $subdir -Recurse -Force
    Write-Host "Deleted $subdir" -ForegroundColor Green
}

# Step 2: Delete duplicate files in src/lib/fengshui
$filesToDelete = @(
    "chengmenjue.ts", "enhanced-aixing.ts", "enhanced-tigua.ts", "evaluate.ts",
    "explanation.ts", "flying-star.ts", "geju.ts", "layering.ts", "lingzheng.ts",
    "liunian-analysis.ts", "location.ts", "luoshu.ts", "mountain.ts",
    "palace-profiles.ts", "personalized-analysis.ts", "plate.ts", "positions.ts",
    "smart-recommendations.ts", "stack.ts", "tigua.ts", "twenty-four-mountains.ts",
    "types.ts", "yun.ts", "README.md"
)

$deleted = 0
foreach ($file in $filesToDelete) {
    $path = "src\lib\fengshui\$file"
    if (Test-Path $path) {
        Remove-Item -Path $path -Force
        $deleted++
        Write-Host "Deleted: $file" -ForegroundColor Gray
    }
}
Write-Host "Deleted $deleted files" -ForegroundColor Green

# Step 3: Create alias index.ts
$aliasContent = @"
/**
 * Fengshui Module Alias
 * 
 * This module has been merged into @/lib/qiflow/xuankong
 * This file provides backward compatibility
 */

// Re-export everything from xuankong
export * from '@/lib/qiflow/xuankong';

// Named exports for common functions
export {
  generateFlyingStar,
  analyzeFengShui,
  calculateXuankongChart,
  evaluateFengshuiScore
} from '@/lib/qiflow/xuankong';
"@

$indexPath = "src\lib\fengshui\index.ts"
Set-Content -Path $indexPath -Value $aliasContent -Encoding UTF8
Write-Host "Created alias: $indexPath" -ForegroundColor Green

Write-Host "`nMigration completed successfully!" -ForegroundColor Green
Write-Host "Files moved: fengshui -> xuankong" -ForegroundColor Cyan
Write-Host "Next: Run 'npm run test:unit' to verify" -ForegroundColor Cyan
