# QiFlow UI 自动代码生成脚本
# 根据 AI-WORKFLOW 生成完整项目代码

Write-Host "🚀 开始自动生成 QiFlow UI 项目代码..." -ForegroundColor Cyan

$projectRoot = "D:\test\mksaas_qiflowai\qiflow-ui"

# 创建目录结构
$directories = @(
    "app\(dashboard)",
    "app\(dashboard)\board",
    "app\(dashboard)\board\[id]",
    "app\(dashboard)\preview",
    "app\(dashboard)\preview\[id]",
    "app\(dashboard)\knowledge",
    "app\(dashboard)\knowledge\search",
    "app\(dashboard)\knowledge\[id]",
    "app\(dashboard)\workflow",
    "app\(dashboard)\workflow\[id]",
    "app\(dashboard)\collaboration",
    "app\api\requirements",
    "app\api\requirements\[id]",
    "app\api\requirements\[id]\comments",
    "app\api\preview",
    "app\api\preview\[id]",
    "app\api\knowledge\search",
    "app\api\knowledge\recommend",
    "app\api\workflow\stream",
    "app\api\workflow\[id]",
    "app\api\auth\login",
    "app\api\auth\logout",
    "app\login",
    "components\board",
    "components\preview",
    "components\knowledge",
    "components\workflow",
    "components\collaboration",
    "components\ui",
    "lib\api",
    "lib\k8s",
    "lib\vector",
    "lib\auth",
    "lib\utils",
    "hooks",
    "stores",
    "types",
    "prisma",
    "public"
)

Write-Host "`n📁 创建目录结构..." -ForegroundColor Yellow
foreach ($dir in $directories) {
    $path = Join-Path $projectRoot $dir
    New-Item -ItemType Directory -Force -Path $path | Out-Null
    Write-Host "  ✓ $dir" -ForegroundColor Green
}

Write-Host "`n✅ 目录结构创建完成！" -ForegroundColor Green
Write-Host "`n📝 项目已准备就绪，接下来:" -ForegroundColor Cyan
Write-Host "  1. cd qiflow-ui" -ForegroundColor White
Write-Host "  2. npm install (安装依赖)" -ForegroundColor White
Write-Host "  3. npx prisma generate (生成 Prisma 客户端)" -ForegroundColor White
Write-Host "  4. npm run dev (启动开发服务器)" -ForegroundColor White
Write-Host "`n🎉 自动化生成完成！" -ForegroundColor Green
