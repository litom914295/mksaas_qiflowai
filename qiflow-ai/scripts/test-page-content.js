import http from 'http';

function testPageContent() {
  console.log('测试页面内容...');

  // 测试八字分析页面
  testPage('http://localhost:3000/zh-CN/bazi-analysis', '八字分析页面');

  // 测试访客分析页面
  testPage('http://localhost:3000/zh-CN/guest-analysis', '访客分析页面');
}

function testPage(url, pageName) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: url.replace('http://localhost:3000', ''),
    method: 'GET',
    headers: {
      'User-Agent': 'Test Script',
    },
  };

  const req = http.request(options, res => {
    console.log(`\n${pageName}状态码: ${res.statusCode}`);

    let data = '';
    res.on('data', chunk => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`${pageName}内容长度: ${data.length}`);

      // 检查关键组件
      const checks = [
        {
          name: 'AnalysisRequiredChatInterface',
          pattern: 'AnalysisRequiredChatInterface',
        },
        { name: '开始算法分析', pattern: '开始算法分析' },
        { name: 'AI 八字大师', pattern: 'AI 八字大师' },
        { name: '与AI大师对话', pattern: '与AI大师对话' },
        { name: '算法分析', pattern: '算法分析' },
      ];

      checks.forEach(check => {
        if (data.includes(check.pattern)) {
          console.log(`✅ ${pageName}包含: ${check.name}`);
        } else {
          console.log(`❌ ${pageName}不包含: ${check.name}`);
        }
      });

      // 检查是否有错误信息
      if (data.includes('Error') || data.includes('error')) {
        console.log(`⚠️ ${pageName}可能包含错误信息`);
      }
    });
  });

  req.on('error', e => {
    console.error(`${pageName}请求错误: ${e.message}`);
  });

  req.end();
}

testPageContent();
