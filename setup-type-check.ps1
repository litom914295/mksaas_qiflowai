# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  PowerShell 版本：Next.js 15 「零反复构建」方案
#  作用：tsc + eslint + next build 三合一，错误一次全暴露
#  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write-Host "🚀 开始配置 Next.js 15 类型检查环境..." -ForegroundColor Green

# 1. 安装必备依赖
Write-Host "`n📦 安装必要的开发依赖..." -ForegroundColor Yellow
npm i -D typescript @types/node @types/react @types/react-dom eslint-config-next@latest 2>&1

# 2. 备份现有的 tsconfig.json
if (Test-Path "tsconfig.json") {
    Copy-Item "tsconfig.json" "tsconfig.json.backup" -Force
    Write-Host "✅ 已备份现有的 tsconfig.json" -ForegroundColor Green
}

# 3. 更新 package.json scripts
Write-Host "`n📝 更新 package.json scripts..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json

# 添加类型检查脚本
if (-not $packageJson.scripts."type-check") {
    $packageJson.scripts | Add-Member -MemberType NoteProperty -Name "type-check" -Value "tsc --noEmit --incremental --tsBuildInfoFile .tsbuildinfo" -Force
}
if (-not $packageJson.scripts."lint:type") {
    $packageJson.scripts | Add-Member -MemberType NoteProperty -Name "lint:type" -Value "tsc --noEmit --pretty" -Force
}
if (-not $packageJson.scripts."check-all") {
    $packageJson.scripts | Add-Member -MemberType NoteProperty -Name "check-all" -Value "npm run type-check && npm run lint" -Force
}

$packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json" -Encoding UTF8
Write-Host "✅ package.json scripts 已更新" -ForegroundColor Green

# 4. 创建 VSCode 配置
if (-not (Test-Path ".vscode")) {
    New-Item -ItemType Directory -Path ".vscode" -Force | Out-Null
}

@"
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "typescript.validate.enable": true,
  "javascript.validate.enable": true,
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
"@ | Set-Content ".vscode/settings.json" -Encoding UTF8
Write-Host "✅ VSCode 配置已创建" -ForegroundColor Green

Write-Host "`n✨ 配置完成！" -ForegroundColor Green
Write-Host @"

使用方法：
  1. 实时类型检查: npm run type-check
  2. ESLint 检查: npm run lint  
  3. 一次检查所有: npm run check-all
  4. 构建项目: npm run build

提示：
  - VSCode 已配置为保存时自动修复
  - 类型错误会实时显示红色波浪线
  - 使用 npm run check-all 在提交前检查所有错误
"@ -ForegroundColor Cyan