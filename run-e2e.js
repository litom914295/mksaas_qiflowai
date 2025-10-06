// 运行E2E测试（假设服务器已经在运行）
const { exec } = require('child_process');

console.log('Running E2E tests (assuming server is already running on port 3000)...\n');

// 设置环境变量以跳过webServer配置
process.env.E2E_BASE_URL = 'http://localhost:3000';
process.env.CI = 'true'; // 这会让它重用现有服务器

exec('npx playwright test --reporter=list', (error, stdout, stderr) => {
  console.log(stdout);
  if (stderr) console.error(stderr);
  if (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
});