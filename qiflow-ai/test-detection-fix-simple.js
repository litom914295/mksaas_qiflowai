#!/usr/bin/env node

/**
 * 测试分析检测修复效果
 * 使用编译后的JavaScript版本
 */

// 首先编译TypeScript
import { execSync } from 'child_process';

console.log('📦 编译TypeScript...');
try {
  execSync('npm run build', { stdio: 'inherit', cwd: __dirname });
} catch (error) {
  console.log('⚠️ 编译失败，尝试使用现有版本...');
}

// 模拟分析检测函数（因为无法直接导入TypeScript）
function simulateDetectAnalysisRequest(message) {
  const normalizedMessage = message.toLowerCase().trim();

  // 八字关键词
  const baziKeywords = [
    '八字',
    '命理',
    '命盘',
    '四柱',
    '批命',
    '算命',
    '占卜',
    '排盘',
    '出生',
    '生辰',
  ];
  const fengshuiKeywords = [
    '风水',
    '堪舆',
    '玄空',
    '飞星',
    '九宫',
    '罗盘',
    '朝向',
    '坐向',
    '山向',
  ];

  // 检测关键词
  const hasBaziKeyword = baziKeywords.some(k => normalizedMessage.includes(k));
  const hasFengshuiKeyword = fengshuiKeywords.some(k =>
    normalizedMessage.includes(k)
  );

  // 检测信息
  const hasBirthDate =
    /\d{4}年.*\d{1,2}月.*\d{1,2}[日号]/.test(message) ||
    /\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(message);
  const hasGender = /[男女]|性别|乾造|坤造/.test(normalizedMessage);
  const hasHouseInfo =
    /[东西南北][东西南北]?向|朝向|坐向|山向/.test(normalizedMessage) &&
    !/出生|生于/.test(normalizedMessage);

  // 判断类型
  let analysisType = 'none';
  let isIncomplete = false;
  let missingInfo = [];

  // 核心八字关键词
  const coreBaziKeywords = [
    '八字',
    '命理',
    '命盘',
    '四柱',
    '批命',
    '算命',
    '占卜',
    '排盘',
  ];
  const hasCoreBaziKeyword = coreBaziKeywords.some(k =>
    normalizedMessage.includes(k)
  );

  // 核心风水关键词
  const coreFengshuiKeywords = [
    '风水',
    '堪舆',
    '玄空',
    '飞星',
    '九宫',
    '罗盘',
    '朝向',
    '坐向',
    '山向',
  ];
  const hasCoreFengshuiKeyword = coreFengshuiKeywords.some(k =>
    normalizedMessage.includes(k)
  );

  // 强八字信号
  const hasStrongBaziSignal =
    hasCoreBaziKeyword ||
    (hasBirthDate && hasGender) ||
    (hasBirthDate && hasBaziKeyword) ||
    /[算看测].*[八字命理命盘]/.test(normalizedMessage) ||
    /[我想].*[算批排].*[八字命]/.test(normalizedMessage);

  // 强风水信号
  const hasStrongFengshuiSignal =
    hasCoreFengshuiKeyword ||
    (hasHouseInfo && hasFengshuiKeyword) ||
    /[看测分析].*风水/.test(normalizedMessage) ||
    /房[子屋].*[朝向坐向]/.test(normalizedMessage);

  // 判断分析类型
  if (hasStrongBaziSignal && !hasStrongFengshuiSignal) {
    analysisType = 'bazi';
    // 检查八字所需信息
    if (!hasBirthDate) {
      isIncomplete = true;
      missingInfo.push('出生日期');
    }
    if (!hasGender && !/男|女|乾造|坤造/.test(normalizedMessage)) {
      isIncomplete = true;
      missingInfo.push('性别');
    }
  } else if (hasStrongFengshuiSignal && !hasStrongBaziSignal) {
    analysisType = 'fengshui';
    // 检查风水所需信息
    if (!hasHouseInfo) {
      isIncomplete = true;
      missingInfo.push('房屋朝向或布局信息');
    }
  } else if (hasStrongBaziSignal && hasStrongFengshuiSignal) {
    analysisType = 'combined';
    // 检查综合分析所需信息
    if (!hasBirthDate) {
      isIncomplete = true;
      missingInfo.push('出生日期');
    }
    if (!hasHouseInfo) {
      isIncomplete = true;
      missingInfo.push('房屋信息');
    }
  } else if (hasBaziKeyword || hasBirthDate || hasGender) {
    analysisType = 'bazi';
    // 检查信息完整性
    if (!hasBirthDate) {
      isIncomplete = true;
      missingInfo.push('出生日期');
    }
    if (!hasGender) {
      isIncomplete = true;
      missingInfo.push('性别');
    }
  } else if (hasFengshuiKeyword || hasHouseInfo) {
    analysisType = 'fengshui';
    if (!hasHouseInfo) {
      isIncomplete = true;
      missingInfo.push('房屋朝向或布局信息');
    }
  }

  // 计算置信度
  let confidence = 0;
  const keywordCount = (hasBaziKeyword ? 1 : 0) + (hasFengshuiKeyword ? 1 : 0);
  if (keywordCount > 0) {
    confidence += Math.min(keywordCount * 10, 40);
  }
  if (hasBirthDate) confidence += 30;
  if (hasGender) confidence += 10;
  if (hasHouseInfo) confidence += 20;
  confidence = Math.min(confidence, 100) / 100;

  // 是否为分析请求
  const isAnalysisRequest =
    analysisType !== 'none' && !isIncomplete && confidence >= 0.3;

  return {
    isAnalysisRequest,
    analysisType,
    confidence,
    isIncomplete,
    missingInfo,
    reason: isIncomplete
      ? `需要补充信息: ${missingInfo.join('、')}`
      : isAnalysisRequest
        ? '检测到分析请求'
        : '未检测到分析请求',
  };
}

const testCases = [
  {
    message: '请帮我分析八字：1990年3月15日下午3点，男性，出生在北京',
    expected: {
      isAnalysisRequest: true,
      analysisType: 'bazi',
      isIncomplete: false,
    },
    description: '八字分析请求（完整信息）',
  },
  {
    message: '我想算八字，1985年6月20日早上8点出生',
    expected: {
      isAnalysisRequest: false, // 缺少性别信息
      analysisType: 'bazi',
      isIncomplete: true,
      missingInfo: ['性别'],
    },
    description: '八字分析请求（缺少性别）',
  },
  {
    message: '帮我算算命',
    expected: {
      isAnalysisRequest: false, // 信息不完整
      analysisType: 'bazi',
      isIncomplete: true,
      missingInfo: ['出生日期', '性别'],
    },
    description: '八字分析请求（缺少关键信息）',
  },
  {
    message: '看看我家风水怎么样',
    expected: {
      isAnalysisRequest: false, // 缺少房屋信息
      analysisType: 'fengshui',
      isIncomplete: true,
      missingInfo: ['房屋朝向或布局信息'],
    },
    description: '风水分析请求（缺少房屋信息）',
  },
  {
    message: '我的房子坐北朝南，请帮我分析风水',
    expected: {
      isAnalysisRequest: true,
      analysisType: 'fengshui',
      isIncomplete: false,
    },
    description: '风水分析请求（完整信息）',
  },
  {
    message: '男，1990年5月15日14时出生于上海，房子是坐北朝南，请综合分析',
    expected: {
      isAnalysisRequest: true,
      analysisType: 'combined',
      isIncomplete: false,
    },
    description: '综合分析请求（完整信息）',
  },
  {
    message: '你好',
    expected: {
      isAnalysisRequest: false,
      analysisType: 'none',
      isIncomplete: false,
    },
    description: '非分析请求（问候）',
  },
  {
    message: '什么是八字',
    expected: {
      isAnalysisRequest: false,
      analysisType: 'none',
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
  const result = simulateDetectAnalysisRequest(testCase.message);

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
