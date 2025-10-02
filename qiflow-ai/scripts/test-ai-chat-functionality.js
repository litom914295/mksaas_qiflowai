import http from 'http';

// 测试AI聊天功能
function testAIChatFunctionality() {
  console.log('开始测试AI聊天功能...');

  // 测试分析请求
  testAnalysisRequest();
}

function testAnalysisRequest() {
  const postData = JSON.stringify({
    message: '请分析我的八字：1990年5月15日14时男',
    sessionId: 'test-session-123',
    userId: 'test-user',
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/chat',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const req = http.request(options, res => {
    console.log(`\n分析请求状态码: ${res.statusCode}`);

    let data = '';
    res.on('data', chunk => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('响应结构:', Object.keys(response));

        if (response.success) {
          console.log('✅ 分析请求成功');

          if (response.data.analysisResult) {
            console.log('✅ 包含分析结果');
            console.log('分析类型:', response.data.analysisResult.type);
            console.log('分析成功:', response.data.analysisResult.success);
          }

          if (response.data.aiEnhancement) {
            console.log('✅ 包含AI增强');
            console.log(
              'AI解释:',
              response.data.aiEnhancement.explanation?.substring(0, 100) + '...'
            );
          }

          if (response.data.redirectTo) {
            console.log('✅ 包含重定向信息');
            console.log('重定向路径:', response.data.redirectTo.path);
          }

          if (response.data.reply) {
            console.log('✅ 包含回复内容');
            console.log(
              '回复内容:',
              response.data.reply.substring(0, 100) + '...'
            );
          }
        } else {
          console.log('❌ 分析请求失败:', response.message);
        }
      } catch (error) {
        console.log('❌ 解析响应失败:', error.message);
        console.log('原始响应:', data.substring(0, 500));
      }
    });
  });

  req.on('error', e => {
    console.error(`分析请求错误: ${e.message}`);
  });

  req.write(postData);
  req.end();
}

testAIChatFunctionality();
