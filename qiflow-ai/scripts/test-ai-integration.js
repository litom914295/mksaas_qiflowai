/**
 * QiFlow AI - AI对话系统集成测试脚本
 *
 * 测试算法优先原则的完整流程
 */

import fetch from 'node-fetch';

// 配置
const API_URL = process.env.API_URL || 'http://localhost:3001/api/chat';
const TEST_USER_ID = 'test-user-' + Date.now();
const TEST_SESSION_ID = 'test-session-' + Date.now();

// 测试用例
const testCases = [
  {
    name: '完整的八字分析请求',
    message: '请帮我分析八字：1990年3月15日下午3点，男性，出生在北京',
    expectedType: 'bazi',
    shouldTriggerAnalysis: true,
  },
  {
    name: '简单的八字请求',
    message: '我想算八字，1985年6月20日早上8点出生',
    expectedType: 'bazi',
    shouldTriggerAnalysis: true,
  },
  {
    name: '风水分析请求',
    message: '请分析我家的风水，房子坐北朝南，建于2010年',
    expectedType: 'fengshui',
    shouldTriggerAnalysis: true,
  },
  {
    name: '综合分析请求',
    message:
      '我1992年10月8日下午2点出生，女性，房子朝向东南，请帮我做个综合分析',
    expectedType: 'combined',
    shouldTriggerAnalysis: true,
  },
  {
    name: '普通聊天（不应触发分析）',
    message: '什么是八字？',
    expectedType: 'none',
    shouldTriggerAnalysis: false,
  },
  {
    name: '问候语（不应触发分析）',
    message: '你好，请问你能做什么？',
    expectedType: 'none',
    shouldTriggerAnalysis: false,
  },
  {
    name: '不完整的信息请求',
    message: '帮我算算命',
    expectedType: 'bazi',
    shouldTriggerAnalysis: true,
    expectError: true,
  },
];

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 发送聊天请求
async function sendChatRequest(message, sessionId, userId) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-qiflow-trace': `test-${Date.now()}`,
      },
      body: JSON.stringify({
        message,
        sessionId,
        userId,
        locale: 'zh-CN',
      }),
    });

    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

// 验证响应
function validateResponse(testCase, response) {
  const issues = [];

  if (response.status === 0) {
    issues.push(`网络错误: ${response.error}`);
    return issues;
  }

  const { data } = response;

  // 检查基本响应结构
  if (!data.success && !data.error) {
    issues.push('响应缺少success或error字段');
  }

  // 检查是否正确触发分析
  if (testCase.shouldTriggerAnalysis) {
    if (!data.data?.analysisResult && !testCase.expectError) {
      issues.push('应该触发分析但没有返回analysisResult');
    }

    if (data.data?.analysisResult) {
      // 检查分析类型
      if (data.data.analysisResult.type !== testCase.expectedType) {
        issues.push(
          `分析类型不匹配: 期望 ${testCase.expectedType}, 实际 ${data.data.analysisResult.type}`
        );
      }

      // 检查AI增强
      if (!data.data.aiEnhancement && !testCase.expectError) {
        issues.push('缺少AI增强解释');
      }
    }
  } else {
    // 不应该触发分析的情况
    if (data.data?.analysisResult) {
      issues.push('不应该触发分析但返回了analysisResult');
    }

    if (!data.data?.reply) {
      issues.push('普通对话应该返回reply字段');
    }
  }

  // 检查错误处理
  if (testCase.expectError && data.success) {
    issues.push('期望返回错误但请求成功了');
  }

  return issues;
}

// 运行测试
async function runTests() {
  log('\n========== QiFlow AI 对话系统集成测试 ==========\n', 'cyan');
  log(`API URL: ${API_URL}`, 'blue');
  log(`User ID: ${TEST_USER_ID}`, 'blue');
  log(`Session ID: ${TEST_SESSION_ID}\n`, 'blue');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  for (const testCase of testCases) {
    totalTests++;
    log(`\n测试 ${totalTests}: ${testCase.name}`, 'yellow');
    log(`消息: "${testCase.message}"`, 'blue');
    log(
      `期望: ${testCase.shouldTriggerAnalysis ? '触发' : '不触发'}${testCase.expectedType}分析`,
      'blue'
    );

    const startTime = Date.now();
    const response = await sendChatRequest(
      testCase.message,
      `${TEST_SESSION_ID}-${totalTests}`,
      TEST_USER_ID
    );
    const duration = Date.now() - startTime;

    log(`响应时间: ${duration}ms`, 'magenta');

    const issues = validateResponse(testCase, response);

    if (issues.length === 0) {
      passedTests++;
      log('✓ 测试通过', 'green');

      // 显示关键信息
      if (response.data?.data?.analysisResult) {
        log(`  - 分析类型: ${response.data.data.analysisResult.type}`, 'green');
        log(
          `  - 分析成功: ${response.data.data.analysisResult.success}`,
          'green'
        );
        if (response.data.data.aiEnhancement) {
          log(
            `  - AI置信度: ${(response.data.data.aiEnhancement.confidence * 100).toFixed(1)}%`,
            'green'
          );
        }
      }
    } else {
      failedTests++;
      log('✗ 测试失败', 'red');
      issues.forEach(issue => {
        log(`  - ${issue}`, 'red');
      });

      // 显示响应详情
      if (process.env.DEBUG) {
        log('\n响应详情:', 'yellow');
        console.log(JSON.stringify(response.data, null, 2));
      }
    }

    // 避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 测试总结
  log('\n========== 测试总结 ==========', 'cyan');
  log(`总测试数: ${totalTests}`, 'blue');
  log(`通过: ${passedTests}`, 'green');
  log(`失败: ${failedTests}`, failedTests > 0 ? 'red' : 'green');
  log(
    `通过率: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`,
    passedTests === totalTests ? 'green' : 'yellow'
  );

  // 返回状态码
  process.exit(failedTests > 0 ? 1 : 0);
}

// 处理错误
process.on('unhandledRejection', error => {
  log(`\n未处理的错误: ${error.message}`, 'red');
  if (error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});

// 运行测试
runTests().catch(error => {
  log(`\n测试运行失败: ${error.message}`, 'red');
  if (error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});
