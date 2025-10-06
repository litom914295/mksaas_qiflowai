/**
 * API 限流测试脚本
 * 验证不同端点的限流策略是否正常工作
 */

const axios = require('axios').default;

// 配置
const BASE_URL = 'http://localhost:3000';
const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// 测试端点配置
const TEST_ENDPOINTS = [
  {
    name: 'AI Chat API',
    endpoint: '/api/ai/chat',
    method: 'POST',
    rateLimit: { requests: 5, window: '1分钟' },
    data: {
      messages: [{ role: 'user', content: 'test' }],
      model: 'test'
    }
  },
  {
    name: 'Bazi API',
    endpoint: '/api/qiflow/bazi',
    method: 'POST',
    rateLimit: { requests: 10, window: '1分钟' },
    data: {
      birthDate: '1990-01-01',
      birthTime: '12:00',
      gender: 'male'
    }
  },
  {
    name: 'FengShui API',
    endpoint: '/api/qiflow/fengshui',
    method: 'POST',
    rateLimit: { requests: 10, window: '1分钟' },
    data: {
      direction: 'north',
      type: 'home'
    }
  },
  {
    name: 'General API (Health Check)',
    endpoint: '/api/health',
    method: 'GET',
    rateLimit: { requests: 20, window: '1分钟' },
    data: null
  }
];

// 辅助函数
function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 测试单个端点
async function testEndpoint(config) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`测试端点: ${config.name}`, 'cyan');
  log(`端点: ${config.endpoint}`, 'cyan');
  log(`限流策略: ${config.rateLimit.requests} 次/${config.rateLimit.window}`, 'cyan');
  log('='.repeat(60), 'cyan');
  
  const results = {
    successful: 0,
    rateLimited: 0,
    errors: 0,
    responseTimes: []
  };
  
  // 发送请求直到被限流
  const maxAttempts = config.rateLimit.requests + 5; // 尝试超过限制
  
  for (let i = 1; i <= maxAttempts; i++) {
    const startTime = Date.now();
    
    try {
      const requestConfig = {
        method: config.method,
        url: `${BASE_URL}${config.endpoint}`,
        data: config.data,
        headers: {
          'Content-Type': 'application/json',
          'X-Test-Request': 'true' // 标记为测试请求
        },
        validateStatus: () => true // 接受所有状态码
      };
      
      const response = await axios(requestConfig);
      const responseTime = Date.now() - startTime;
      results.responseTimes.push(responseTime);
      
      if (response.status === 429) {
        results.rateLimited++;
        log(`  请求 #${i}: ❌ 被限流 (429) - ${responseTime}ms`, 'yellow');
        
        // 检查限流响应头
        const remaining = response.headers['x-ratelimit-remaining'];
        const reset = response.headers['x-ratelimit-reset'];
        const retryAfter = response.headers['retry-after'];
        
        if (remaining !== undefined) {
          log(`    剩余请求数: ${remaining}`, 'yellow');
        }
        if (reset) {
          const resetDate = new Date(parseInt(reset) * 1000);
          log(`    重置时间: ${resetDate.toLocaleTimeString()}`, 'yellow');
        }
        if (retryAfter) {
          log(`    建议等待: ${retryAfter} 秒`, 'yellow');
        }
      } else if (response.status >= 200 && response.status < 300) {
        results.successful++;
        log(`  请求 #${i}: ✅ 成功 (${response.status}) - ${responseTime}ms`, 'green');
      } else {
        results.errors++;
        log(`  请求 #${i}: ⚠️ 错误 (${response.status}) - ${responseTime}ms`, 'red');
      }
      
    } catch (error) {
      results.errors++;
      log(`  请求 #${i}: ❌ 错误 - ${error.message}`, 'red');
    }
    
    // 短暂延迟避免过快发送
    if (i < maxAttempts) {
      await sleep(100);
    }
  }
  
  // 分析结果
  log('\n📊 测试结果分析:', 'blue');
  log(`  成功请求: ${results.successful}`, results.successful > 0 ? 'green' : 'red');
  log(`  被限流: ${results.rateLimited}`, results.rateLimited > 0 ? 'green' : 'yellow');
  log(`  错误: ${results.errors}`, results.errors === 0 ? 'green' : 'red');
  
  if (results.responseTimes.length > 0) {
    const avgTime = Math.round(results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length);
    const minTime = Math.min(...results.responseTimes);
    const maxTime = Math.max(...results.responseTimes);
    
    log(`\n  响应时间统计:`, 'blue');
    log(`    平均: ${avgTime}ms`);
    log(`    最快: ${minTime}ms`);
    log(`    最慢: ${maxTime}ms`);
  }
  
  // 验证限流是否正常工作
  const expectedSuccessful = Math.min(config.rateLimit.requests, maxAttempts);
  const isWorkingCorrectly = 
    results.successful <= expectedSuccessful && 
    results.rateLimited > 0;
  
  log('\n🎯 限流验证:', 'blue');
  if (isWorkingCorrectly) {
    log(`  ✅ 限流正常工作！`, 'green');
    log(`  - 成功请求数 (${results.successful}) ≤ 限制 (${config.rateLimit.requests})`, 'green');
    log(`  - 正确触发了限流响应`, 'green');
  } else {
    log(`  ⚠️ 限流可能存在问题`, 'yellow');
    if (results.successful > expectedSuccessful) {
      log(`  - 成功请求数 (${results.successful}) 超过了限制 (${config.rateLimit.requests})`, 'yellow');
    }
    if (results.rateLimited === 0) {
      log(`  - 未触发限流响应`, 'yellow');
    }
  }
  
  return {
    endpoint: config.endpoint,
    passed: isWorkingCorrectly,
    details: results
  };
}

// 测试限流重置
async function testRateLimitReset(config) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`测试限流重置: ${config.name}`, 'cyan');
  log('='.repeat(60), 'cyan');
  
  // 第一阶段：触发限流
  log('\n📍 第一阶段: 触发限流', 'blue');
  const requests = config.rateLimit.requests + 2;
  let rateLimitHit = false;
  
  for (let i = 1; i <= requests; i++) {
    try {
      const response = await axios({
        method: config.method,
        url: `${BASE_URL}${config.endpoint}`,
        data: config.data,
        validateStatus: () => true
      });
      
      if (response.status === 429) {
        log(`  请求 #${i}: 触发限流`, 'yellow');
        rateLimitHit = true;
        break;
      } else {
        log(`  请求 #${i}: 成功`, 'green');
      }
    } catch (error) {
      log(`  请求 #${i}: 错误 - ${error.message}`, 'red');
    }
    await sleep(100);
  }
  
  if (!rateLimitHit) {
    log('  ⚠️ 未能触发限流', 'yellow');
    return false;
  }
  
  // 第二阶段：等待重置
  log('\n📍 第二阶段: 等待限流重置 (60秒)...', 'blue');
  log('  ⏳ 等待中...', 'yellow');
  
  // 显示倒计时
  for (let i = 60; i > 0; i -= 10) {
    await sleep(10000);
    log(`  ⏳ 剩余 ${i - 10} 秒...`, 'yellow');
  }
  
  // 第三阶段：验证重置
  log('\n📍 第三阶段: 验证重置', 'blue');
  try {
    const response = await axios({
      method: config.method,
      url: `${BASE_URL}${config.endpoint}`,
      data: config.data,
      validateStatus: () => true
    });
    
    if (response.status === 429) {
      log('  ❌ 限流未重置', 'red');
      return false;
    } else {
      log('  ✅ 限流已重置，请求成功', 'green');
      return true;
    }
  } catch (error) {
    log(`  ❌ 请求错误 - ${error.message}`, 'red');
    return false;
  }
}

// 并发测试
async function testConcurrentRequests(config, concurrency = 10) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`并发测试: ${config.name}`, 'cyan');
  log(`并发数: ${concurrency}`, 'cyan');
  log('='.repeat(60), 'cyan');
  
  const promises = [];
  for (let i = 0; i < concurrency; i++) {
    promises.push(
      axios({
        method: config.method,
        url: `${BASE_URL}${config.endpoint}`,
        data: config.data,
        validateStatus: () => true
      }).then(response => ({
        status: response.status,
        limited: response.status === 429
      })).catch(error => ({
        status: 'error',
        error: error.message
      }))
    );
  }
  
  const results = await Promise.all(promises);
  
  const successful = results.filter(r => r.status >= 200 && r.status < 300).length;
  const limited = results.filter(r => r.limited).length;
  const errors = results.filter(r => r.status === 'error').length;
  
  log(`\n📊 并发测试结果:`, 'blue');
  log(`  成功: ${successful}/${concurrency}`, successful > 0 ? 'green' : 'red');
  log(`  被限流: ${limited}/${concurrency}`, limited > 0 ? 'green' : 'yellow');
  log(`  错误: ${errors}/${concurrency}`, errors === 0 ? 'green' : 'red');
  
  const expectedSuccessful = Math.min(config.rateLimit.requests, concurrency);
  if (successful <= expectedSuccessful && limited > 0) {
    log(`\n  ✅ 并发限流正常工作`, 'green');
  } else {
    log(`\n  ⚠️ 并发限流可能存在问题`, 'yellow');
  }
  
  return { successful, limited, errors };
}

// 主测试函数
async function runAllTests() {
  log(`\n${'='.repeat(60)}`, 'blue');
  log('🚀 开始 API 限流测试', 'blue');
  log(`测试时间: ${new Date().toLocaleString()}`, 'blue');
  log(`目标服务器: ${BASE_URL}`, 'blue');
  log('='.repeat(60), 'blue');
  
  // 检查服务器是否运行
  log('\n🔍 检查服务器状态...', 'yellow');
  try {
    await axios.get(`${BASE_URL}/`);
    log('✅ 服务器正在运行', 'green');
  } catch (error) {
    log('❌ 无法连接到服务器，请确保开发服务器正在运行', 'red');
    log('运行命令: npm run dev', 'yellow');
    process.exit(1);
  }
  
  const testResults = [];
  
  // 1. 基础限流测试
  log('\n\n📋 1. 基础限流测试', 'blue');
  log('测试每个端点的基本限流功能', 'blue');
  
  for (const endpoint of TEST_ENDPOINTS) {
    const result = await testEndpoint(endpoint);
    testResults.push(result);
    await sleep(2000); // 端点之间等待
  }
  
  // 2. 并发测试（仅测试一个端点）
  log('\n\n📋 2. 并发请求测试', 'blue');
  log('测试并发请求下的限流行为', 'blue');
  
  const concurrentTestEndpoint = TEST_ENDPOINTS[0];
  await testConcurrentRequests(concurrentTestEndpoint, 15);
  
  // 3. 重置测试（可选，需要等待时间）
  log('\n\n📋 3. 限流重置测试', 'blue');
  const runResetTest = false; // 设置为 true 启用（需要等待60秒）
  
  if (runResetTest) {
    log('⚠️ 此测试需要等待60秒', 'yellow');
    const resetTestEndpoint = TEST_ENDPOINTS[0];
    await testRateLimitReset(resetTestEndpoint);
  } else {
    log('⏭️ 跳过重置测试（需要等待60秒）', 'yellow');
    log('如需运行，请设置 runResetTest = true', 'yellow');
  }
  
  // 总结
  log(`\n\n${'='.repeat(60)}`, 'blue');
  log('📊 测试总结', 'blue');
  log('='.repeat(60), 'blue');
  
  const passedTests = testResults.filter(r => r.passed).length;
  const totalTests = testResults.length;
  
  log(`\n通过测试: ${passedTests}/${totalTests}`, passedTests === totalTests ? 'green' : 'yellow');
  
  testResults.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    const color = result.passed ? 'green' : 'red';
    log(`  ${status} ${result.endpoint}`, color);
  });
  
  if (passedTests === totalTests) {
    log('\n🎉 所有限流测试通过！', 'green');
  } else {
    log('\n⚠️ 部分限流测试未通过，请检查配置', 'yellow');
  }
  
  log('\n💡 建议:', 'cyan');
  log('1. 在生产环境中，考虑使用 Redis 进行分布式限流', 'cyan');
  log('2. 根据实际流量调整限流阈值', 'cyan');
  log('3. 为不同用户级别设置不同的限流策略', 'cyan');
  log('4. 监控限流指标，及时发现异常', 'cyan');
}

// 运行测试
if (require.main === module) {
  runAllTests().catch(error => {
    log(`\n❌ 测试失败: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  testEndpoint,
  testRateLimitReset,
  testConcurrentRequests,
  runAllTests
};