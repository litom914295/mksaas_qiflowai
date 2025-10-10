@echo off
echo 🔧 设置 SQLite 数据库...

echo 📝 更新 drizzle 配置...
copy drizzle.config.sqlite.ts drizzle.config.ts

echo 📝 更新 .env 文件...
echo NEXT_PUBLIC_BASE_URL="http://localhost:3000" > .env
echo DATABASE_URL="file:./local.db" >> .env
echo BETTER_AUTH_SECRET="kgkSg5VWhoPyK4skK+EktJskVxqoH3OJ+WknD4yw170=" >> .env

echo 📡 同步数据库 schema...
npm run db:push

echo 🧪 运行数据库测试...
npx tsx scripts/test-db-registration.ts

echo ✅ SQLite 设置完成！
echo 📝 下一步：
echo    1. 重启开发服务器: npm run dev
echo    2. 清除浏览器缓存
echo    3. 尝试注册新用户

pause







