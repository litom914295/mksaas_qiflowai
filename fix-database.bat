@echo off
echo 🔧 修复数据库配置...

echo 📝 设置环境变量...
set DATABASE_URL=postgresql://postgres:Sd%%40721204@db.sibwcdadrsbfkblinezj.supabase.co:5432/postgres
set BETTER_AUTH_SECRET=kgkSg5VWhoPyK4skK+EktJskVxqoH3OJ+WknD4yw170=

echo 📡 同步数据库 schema...
npm run db:push

echo 🧪 运行数据库测试...
npx tsx scripts/test-db-registration.ts

echo ✅ 修复完成！
echo 📝 下一步：
echo    1. 重启开发服务器: npm run dev
echo    2. 清除浏览器缓存
echo    3. 尝试注册新用户

pause




