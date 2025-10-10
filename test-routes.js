const http = require('http');

const routes = [
  '/zh',
  '/zh/showcase',
  '/zh/ai-chat',
  '/zh/analysis/bazi',
  '/en',
  '/en/showcase',
  '/en/ai-chat',
  '/en/analysis/bazi',
];

console.log('Testing routes...\n');

routes.forEach((route) => {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: route,
    method: 'GET',
  };

  const req = http.request(options, (res) => {
    const status = res.statusCode === 200 ? '✅' : '❌';
    console.log(`${status} ${route} - Status: ${res.statusCode}`);
  });

  req.on('error', (error) => {
    console.log(`❌ ${route} - Error: ${error.message}`);
  });

  req.end();
});
