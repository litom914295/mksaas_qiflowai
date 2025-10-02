import http from 'http';

// 测试八字分析页面
function testBaziPage() {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/zh-CN/bazi-analysis',
    method: 'GET',
    headers: {
      'User-Agent': 'Test Script',
    },
  };

  const req = http.request(options, res => {
    console.log(`状态码: ${res.statusCode}`);
    console.log(`响应头:`, res.headers);

    let data = '';
    res.on('data', chunk => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('页面内容长度:', data.length);

      // 检查是否包含AI对话相关的内容
      if (data.includes('与AI大师对话')) {
        console.log('✅ AI对话按钮已添加');
      } else {
        console.log('❌ 未找到AI对话按钮');
      }

      if (data.includes('EnhancedChatInterface')) {
        console.log('✅ AI聊天组件已导入');
      } else {
        console.log('❌ 未找到AI聊天组件');
      }

      if (data.includes('AI对话功能已就绪')) {
        console.log('✅ AI就绪提示已添加');
      } else {
        console.log('❌ 未找到AI就绪提示');
      }

      console.log('\n页面测试完成！');
    });
  });

  req.on('error', e => {
    console.error(`请求错误: ${e.message}`);
  });

  req.end();
}

console.log('开始测试八字分析页面...');
testBaziPage();
