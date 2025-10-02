#!/usr/bin/env node

/**
 * 测试分析检测修复效果
 */

import {
  detectAnalysisRequest,
  AnalysisType,
} from './src/lib/ai/analysis-detection.ts';

const testCases = [
  {
    message: '请帮我分析八字：1990年3月15日下午3点，男性，出生在北京',
    expected: {
      isAnalysisRequest: true,
      analysisType: AnalysisType.BAZI,
      isIncomplete: false,
    },
    description: '八字分析请求（完整信息）',
  },
  {
    message: '我想算八字，1985年6月20日早上8点出生',
    expected: {
      isAnalysisRequest: false, // 缺少性别信息
      analysisType: AnalysisType.BAZI,
      isIncomplete: true,
      missingInfo: ['性别'],
    },
    description: '八字分析请求（缺少性别）',
  },
  {
    message: '帮我算算命',
    expected: {
      isAnalysisRequest: false, // 信息不完整
      analysisType: AnalysisType.BAZI,
      isIncomplete: true,
      missingInfo: ['出生日期', '性别'],
    },
    description: '八字分析请求（缺少关键信息）',
  },
  {
    message: '看看我家风水怎么样',
    expected: {
      isAnalysisRequest: false, // 缺少房屋信息
      analysisType: AnalysisType.FENGSHUI,
      isIncomplete: true,
      missingInfo: ['房屋朝向或布局信息'],
    },
    description: '风水分析请求（缺少房屋信息）',
  },
  {
    message: '我的房子坐北朝南，请帮我分析风水',
    expected: {
      isAnalysisRequest: true,
      analysisType: AnalysisType.FENGSHUI,
      isIncomplete: false,
    },
    description: '风水分析请求（完整信息）',
  },
  {
    message: '男，1990年5月15日14时出生于上海，房子是坐北朝南，请综合分析',
    expected: {
      isAnalysisRequest: true,
      analysisType: AnalysisType.COMBINED,
      isIncomplete: false,
    },
    description: '综合分析请求（完整信息）',
  },
  {
    message: '你好',
    expected: {
      isAnalysisRequest: false,
      analysisType: AnalysisType.NONE,
      isIncomplete: false,
    },
    description: '非分析请求（问候）',
  },
  {
    message: '什么是八字',
    expected: {
      isAnalysisRequest: false,
      analysisType: AnalysisType.NONE,
      isIncomplete: false,
    },
    description: '非分析请求（咨询）',
  },
];

console.log('🧪 测试分析检测修复效果\n');
console.log('='.repeat(80));

let passCount = 0;
let failCount = 0;

testCases.forEach((testCase, index) => {
  const result = detectAnalysisRequest(testCase.message);

  console.log(`\n测试 ${index + 1}: ${testCase.description}`);
  console.log(`消息: "${testCase.message}"`);
  console.log(`期望结果:`);
  console.log(`  - 分析请求: ${testCase.expected.isAnalysisRequest}`);
  console.log(`  - 分析类型: ${testCase.expected.analysisType}`);
  if (testCase.expected.isIncomplete !== undefined) {
    console.log(`  - 信息不完整: ${testCase.expected.isIncomplete}`);
  }
  if (testCase.expected.missingInfo) {
    console.log(`  - 缺失信息: ${testCase.expected.missingInfo.join('、')}`);
  }

  console.log(`实际结果:`);
  console.log(`  - 分析请求: ${result.isAnalysisRequest}`);
  console.log(`  - 分析类型: ${result.analysisType}`);
  console.log(`  - 置信度: ${(result.confidence * 100).toFixed(1)}%`);
  console.log(`  - 信息不完整: ${result.isIncomplete || false}`);
  if (result.missingInfo && result.missingInfo.length > 0) {
    console.log(`  - 缺失信息: ${result.missingInfo.join('、')}`);
  }
  console.log(`  - 理由: ${result.reason}`);

  // 检查测试结果
  let passed = true;

  if (result.isAnalysisRequest !== testCase.expected.isAnalysisRequest) {
    console.log(`  ❌ 分析请求判断不匹配`);
    passed = false;
  }

  if (result.analysisType !== testCase.expected.analysisType) {
    console.log(`  ❌ 分析类型判断不匹配`);
    passed = false;
  }

  if (
    testCase.expected.isIncomplete !== undefined &&
    result.isIncomplete !== testCase.expected.isIncomplete
  ) {
    console.log(`  ❌ 完整性判断不匹配`);
    passed = false;
  }

  if (passed) {
    console.log(`  ✅ 测试通过`);
    passCount++;
  } else {
    console.log(`  ❌ 测试失败`);
    failCount++;
  }
});

console.log('\n' + '='.repeat(80));
console.log(`\n📊 测试结果汇总:`);
console.log(`  ✅ 通过: ${passCount}/${testCases.length}`);
console.log(`  ❌ 失败: ${failCount}/${testCases.length}`);
console.log(`  通过率: ${((passCount / testCases.length) * 100).toFixed(1)}%`);

if (failCount === 0) {
  console.log('\n🎉 所有测试通过！');
  process.exit(0);
} else {
  console.log('\n⚠️ 部分测试失败，请检查代码');
  process.exit(1);
}
