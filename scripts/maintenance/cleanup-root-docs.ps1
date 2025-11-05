#!/usr/bin/env pwsh
# 根目录文档清理脚本 - 第二轮清理
# 处理遗漏的大量 MD 报告文档

param(
    [switch]$DryRun = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = 'Stop'

# 配置
$RootPath = $PSScriptRoot
$ArchivePath = Join-Path $RootPath "docs\archive"

# 统计
$stats = @{
    FilesArchived = 0
    FilesSkipped = 0
    Errors = 0
}

# 核心文档 - 保留在根目录
$CoreDocs = @(
    'README.md',
    'CHANGELOG.md', 
    'CONTRIBUTING.md',
    'LICENSE.md',
    'CODE_OF_CONDUCT.md',
    'SECURITY.md',
    '.cursorrules',
    '.cursorignore'
)

# 归档目录结构
$ArchiveDirs = @{
    'Fix' = @{
        Path = 'reports\fixes'
        Patterns = @('*_FIX_*.md', 'FIX_*.md', '*_FIXES.md')
    }
    'Status' = @{
        Path = 'reports\status'
        Patterns = @('*_STATUS_*.md', 'STATUS_*.md', '*_PROGRESS_*.md')
    }
    'Report' = @{
        Path = 'reports\general'
        Patterns = @('*_REPORT.md', 'REPORT_*.md')
    }
    'Quick' = @{
        Path = 'reports\quick-guides'
        Patterns = @('QUICK_*.md', 'QUICKSTART*.md')
    }
    'Implementation' = @{
        Path = 'reports\implementation'
        Patterns = @('IMPLEMENTATION_*.md', '*_IMPLEMENTATION_*.md')
    }
    'Completion' = @{
        Path = 'reports\completion'
        Patterns = @('*_COMPLETION_*.md', 'COMPLETION_*.md', 'TASK_*.md')
    }
    'Verification' = @{
        Path = 'reports\verification'
        Patterns = @('*_VERIFICATION_*.md', 'VERIFICATION_*.md', 'TEST_*.md')
    }
    'Workflow' = @{
        Path = 'guides\workflow'
        Patterns = @('*_WORKFLOW*.md', 'WORKFLOW_*.md', 'AI_*.md', 'AI-*.md')
    }
    'Migration' = @{
        Path = 'guides\migration'
        Patterns = @('*_MIGRATION_*.md', 'MIGRATION_*.md')
    }
    'Comparison' = @{
        Path = 'analysis\comparisons'
        Patterns = @('*_COMPARISON*.md', 'COMPARISON_*.md', '*_VS_*.md')
    }
    'Analysis' = @{
        Path = 'analysis\general'
        Patterns = @('*_ANALYSIS*.md', 'ANALYSIS_*.md', '*_ECOSYSTEM_*.md')
    }
    'Summary' = @{
        Path = 'reports\summaries'
        Patterns = @('*_SUMMARY.md', 'SUMMARY_*.md')
    }
    'TypeScript' = @{
        Path = 'reports\typescript'
        Patterns = @('TYPESCRIPT_*.md', 'TS_*.md')
    }
    'Auth' = @{
        Path = 'reports\features\auth'
        Patterns = @('AUTH_*.md', 'AUTHENTICATION_*.md')
    }
    'Dashboard' = @{
        Path = 'reports\features\dashboard'
        Patterns = @('DASHBOARD_*.md')
    }
    'Credits' = @{
        Path = 'reports\features\credits'
        Patterns = @('CREDITS_*.md', 'CREDIT_*.md')
    }
    'Bazi' = @{
        Path = 'reports\features\bazi'
        Patterns = @('BAZI_*.md')
    }
    'I18n' = @{
        Path = 'reports\features\i18n'
        Patterns = @('I18N_*.md', 'LOCALE_*.md')
    }
    'Performance' = @{
        Path = 'reports\performance'
        Patterns = @('PERFORMANCE_*.md', 'PERF_*.md')
    }
    'Cleanup' = @{
        Path = 'reports\cleanup'
        Patterns = @('CLEANUP_*.md', 'PROJECT_CLEANUP_*.md')
    }
}

# 函数：写日志
function Write-Log {
    param([string]$Message, [string]$Level = 'INFO')
    
    if ($Verbose -or $Level -ne 'INFO') {
        $color = switch ($Level) {
            'ERROR' { 'Red' }
            'WARNING' { 'Yellow' }
            'SUCCESS' { 'Green' }
            default { 'White' }
        }
        Write-Host "[$Level] $Message" -ForegroundColor $color
    }
}

# 函数：确保目录存在
function Ensure-Directory {
    param([string]$Path)
    
    if (-not (Test-Path $Path)) {
        if (-not $DryRun) {
            New-Item -Path $Path -ItemType Directory -Force | Out-Null
        }
        Write-Log "创建目录: $Path" -Level 'INFO'
    }
}

# 函数：移动文件到归档
function Move-ToArchive {
    param(
        [string]$FilePath,
        [string]$Category,
        [string]$DestinationSubPath
    )
    
    $fileName = Split-Path $FilePath -Leaf
    $destDir = Join-Path $ArchivePath $DestinationSubPath
    $destPath = Join-Path $destDir $fileName
    
    # 检查是否是核心文档
    if ($CoreDocs -contains $fileName) {
        Write-Log "跳过核心文档: $fileName" -Level 'WARNING'
        $stats.FilesSkipped++
        return
    }
    
    try {
        Ensure-Directory $destDir
        
        if ($DryRun) {
            Write-Log "[DRY-RUN] 将 $fileName 移动到 $DestinationSubPath" -Level 'INFO'
        } else {
            # 如果目标已存在，重命名
            if (Test-Path $destPath) {
                $timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
                $newName = "$($fileName.Replace('.md', ''))-$timestamp.md"
                $destPath = Join-Path $destDir $newName
                Write-Log "目标文件已存在，重命名为: $newName" -Level 'WARNING'
            }
            
            Move-Item -Path $FilePath -Destination $destPath -Force
            Write-Log "已归档 [$Category]: $fileName -> $DestinationSubPath" -Level 'SUCCESS'
        }
        
        $stats.FilesArchived++
    }
    catch {
        Write-Log "移动文件失败 ($fileName): $($_.Exception.Message)" -Level 'ERROR'
        $stats.Errors++
    }
}

# 主逻辑
Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "  根目录文档清理脚本 - 第二轮" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host ">>> 模拟运行模式 (不会实际移动文件) <<<`n" -ForegroundColor Yellow
}

# 获取所有根目录的 MD 文件
$allMdFiles = Get-ChildItem -Path $RootPath -File -Filter "*.md"
Write-Log "找到 $($allMdFiles.Count) 个 MD 文件"

# 跟踪已处理的文件
$processedFiles = @{}

# 按类别归档
foreach ($category in $ArchiveDirs.Keys) {
    $config = $ArchiveDirs[$category]
    
    foreach ($pattern in $config.Patterns) {
        $matchedFiles = $allMdFiles | Where-Object { $_.Name -like $pattern -and -not $processedFiles.ContainsKey($_.FullName) }
        
        foreach ($file in $matchedFiles) {
            Move-ToArchive -FilePath $file.FullName -Category $category -DestinationSubPath $config.Path
            $processedFiles[$file.FullName] = $true
        }
    }
}

# 处理其他未匹配的 MD 文件（排除核心文档和已处理文件）
$remainingFiles = Get-ChildItem -Path $RootPath -File -Filter "*.md" | 
    Where-Object { $CoreDocs -notcontains $_.Name -and -not $processedFiles.ContainsKey($_.FullName) }

if ($remainingFiles.Count -gt 0) {
    Write-Log "`n发现 $($remainingFiles.Count) 个未分类的 MD 文件" -Level 'WARNING'
    
    foreach ($file in $remainingFiles) {
        Write-Log "未分类: $($file.Name)" -Level 'WARNING'
        
        # 移动到通用归档目录
        Move-ToArchive -FilePath $file.FullName -Category 'Uncategorized' -DestinationSubPath 'reports\uncategorized'
        $processedFiles[$file.FullName] = $true
    }
}

# 打印统计
Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "  清理统计" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "已归档文件: $($stats.FilesArchived)" -ForegroundColor Green
Write-Host "跳过文件: $($stats.FilesSkipped)" -ForegroundColor Yellow
Write-Host "错误数量: $($stats.Errors)" -ForegroundColor $(if ($stats.Errors -gt 0) { 'Red' } else { 'Green' })
Write-Host "======================================`n" -ForegroundColor Cyan

# 显示根目录剩余的 MD 文件
$remainingMd = Get-ChildItem -Path $RootPath -File -Filter "*.md"
Write-Host "根目录剩余 MD 文件数量: $($remainingMd.Count)" -ForegroundColor Cyan
if ($remainingMd.Count -gt 0) {
    Write-Host "`n剩余文件列表:" -ForegroundColor Cyan
    $remainingMd | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor White }
}

Write-Host "`n清理完成！" -ForegroundColor Green

if ($DryRun) {
    Write-Host "`n提示: 这是模拟运行。要实际执行清理，请运行:" -ForegroundColor Yellow
    Write-Host "  .\cleanup-root-docs.ps1" -ForegroundColor White
    Write-Host "  或添加 -Verbose 查看详细信息:" -ForegroundColor Yellow
    Write-Host "  .\cleanup-root-docs.ps1 -Verbose" -ForegroundColor White
}
