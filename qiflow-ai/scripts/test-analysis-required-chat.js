import http from 'http';

// 测试分析要求聊天功能
function testAnalysisRequiredChat() {
  console.log('开始测试分析要求聊天功能...');

  // 测试八字分析页面
  testBaziPage();

  // 测试访客分析页面
  testGuestPage();
}

function testBaziPage() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/zh-CN/bazi-analysis',
    method: 'GET',
    headers: {
      'User-Agent': 'Test Script',
    },
  };

  const req = http.request(options, res => {
    console.log(`\n八字分析页面状态码: ${res.statusCode}`);

    let data = '';
    res.on('data', chunk => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('八字分析页面内容长度:', data.length);

      // 检查是否包含新的分析要求聊天组件
      if (data.includes('AnalysisRequiredChatInterface')) {
        console.log('✅ 八字分析页面已使用分析要求聊天组件');
      } else {
        console.log('❌ 八字分析页面未使用分析要求聊天组件');
      }

      if (data.includes('开始算法分析')) {
        console.log('✅ 八字分析页面包含算法分析按钮');
      } else {
        console.log('❌ 八字分析页面未包含算法分析按钮');
      }
    });
  });

  req.on('error', e => {
    console.error(`八字分析页面请求错误: ${e.message}`);
  });

  req.end();
}

function testGuestPage() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/zh-CN/guest-analysis',
    method: 'GET',
    headers: {
      'User-Agent': 'Test Script',
    },
  };

  const req = http.request(options, res => {
    console.log(`\n访客分析页面状态码: ${res.statusCode}`);

    let data = '';
    res.on('data', chunk => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('访客分析页面内容长度:', data.length);

      // 检查是否包含新的分析要求聊天组件
      if (data.includes('AnalysisRequiredChatInterface')) {
        console.log('✅ 访客分析页面已使用分析要求聊天组件');
      } else {
        console.log('❌ 访客分析页面未使用分析要求聊天组件');
      }

      if (data.includes('开始算法分析')) {
        console.log('✅ 访客分析页面包含算法分析按钮');
      } else {
        console.log('❌ 访客分析页面未包含算法分析按钮');
      }
    });
  });

  req.on('error', e => {
    console.error(`访客分析页面请求错误: ${e.message}`);
  });

  req.end();
}

testAnalysisRequiredChat();
