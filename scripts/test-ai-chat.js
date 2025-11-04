/**
 * AI聊天功能测试脚本
 * 测试算法优先的完整流程
 */

// 使用内置的fetch (Node 18+) 或 axios
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

// 配置
const API_URL = 'http://localhost:3000/api/qiflow/chat';
const AUTH_TOKEN = process.env.AUTH_TOKEN || ''; // 需要设置实际的认证token

// 测试用例
const testCases = [
  {
    name: '测试1: 询问八字问题（无数据）',
    request: {
      message: '我的用神是什么？',
      context: {},
    },
    expected: {
      type: 'need_birth_info',
      hasResponse: true,
      creditsUsed: 0,
    },
  },
  {
    name: '测试2: 提供生辰信息',
    request: {
      message: '1990年1月1日下午3点30分，男，北京',
      context: {},
    },
    expected: {
      type: 'birth_info_saved',
      hasResponse: true,
      hasBirthInfo: true,
      hasCalculatedBazi: true,
    },
  },
  {
    name: '测试3: 基于已有数据询问',
    request: {
      message: '我的财运如何？',
      context: {
        birthInfo: {
          date: '1990-01-01',
          time: '15:30',
          gender: 'male',
          location: '北京',
        },
        calculatedBazi: {}, // 将在测试2后填充
      },
    },
    expected: {
      type: 'ai_with_algorithm',
      hasResponse: true,
      creditsUsed: 5, // AI聊天消耗
    },
  },
  {
    name: '测试4: 混合输入（生辰+问题）',
    request: {
      message: '1973年1月7日2点30分男性岳阳，我的用神是什么？',
      context: {},
    },
    expected: {
      type: 'ai_with_algorithm',
      hasResponse: true,
      hasBirthInfo: true,
      hasCalculatedBazi: true,
    },
  },
];

// 测试函数
async function runTest(testCase, previousResult = null) {
  console.log(`\n🧪 ${testCase.name}`);
  console.log('📤 请求:', JSON.stringify(testCase.request, null, 2));

  // 如果需要使用前一个测试的结果
  if (previousResult && testCase.request.context.calculatedBazi !== undefined) {
    testCase.request.context.calculatedBazi = previousResult.calculatedBazi;
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
      body: JSON.stringify(testCase.request),
    });

    const result = await response.json();
    console.log('📥 响应:', {
      status: response.status,
      type: result.type,
      creditsUsed: result.creditsUsed,
      hasResponse: !!result.response,
      hasBirthInfo: !!result.birthInfo,
      hasCalculatedBazi: !!result.calculatedBazi,
      responsePreview: result.response
        ? result.response.substring(0, 100) + '...'
        : null,
    });

    // 验证结果
    let passed = true;
    const expected = testCase.expected;

    if (expected.type && result.type !== expected.type) {
      console.error(
        `❌ 类型不匹配: 期望 ${expected.type}, 实际 ${result.type}`
      );
      passed = false;
    }

    if (expected.hasResponse && !result.response) {
      console.error('❌ 缺少响应内容');
      passed = false;
    }

    if (
      expected.creditsUsed !== undefined &&
      result.creditsUsed !== expected.creditsUsed
    ) {
      console.error(
        `❌ 积分消耗不匹配: 期望 ${expected.creditsUsed}, 实际 ${result.creditsUsed}`
      );
      passed = false;
    }

    if (expected.hasBirthInfo && !result.birthInfo) {
      console.error('❌ 缺少生辰信息');
      passed = false;
    }

    if (expected.hasCalculatedBazi && !result.calculatedBazi) {
      console.error('❌ 缺少八字计算结果');
      passed = false;
    }

    if (passed) {
      console.log('✅ 测试通过');
    }

    return result;
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    return null;
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('🚀 开始AI聊天功能测试');
  console.log('================================');

  let previousResult = null;

  for (const testCase of testCases) {
    previousResult = await runTest(testCase, previousResult);

    // 等待一秒避免频率限制
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log('\n================================');
  console.log('✨ 测试完成');
}

// 执行测试
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runTest, runAllTests };
