# 检查数据库表
Write-Host "🔍 检查数据库中的所有表..." -ForegroundColor Green

# 设置环境变量
$env:DATABASE_URL = "postgresql://postgres:Sd%40721204@db.sibwcdadrsbfkblinezj.supabase.co:5432/postgres"

# 运行数据库同步
Write-Host "📡 同步数据库 schema..." -ForegroundColor Yellow
npm run db:push

Write-Host "`n🧪 运行数据库测试..." -ForegroundColor Yellow
npx tsx scripts/test-db-registration.ts

Write-Host "`n✅ 检查完成！" -ForegroundColor Green



