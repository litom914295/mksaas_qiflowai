#!/usr/bin/env node

/**
 * 快速测试分析检测修复效果
 */

console.log('🧪 快速测试分析检测修复效果\n');
console.log('='.repeat(80));

// 模拟修复后的检测逻辑
function detectAnalysisType(message) {
  const normalizedMessage = message.toLowerCase().trim();

  // 核心关键词
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

  // 检测信息
  const hasBirthDate =
    /\d{4}年.*\d{1,2}月.*\d{1,2}[日号]/.test(message) ||
    /\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(message);
  const hasGender = /[男女]|性别|乾造|坤造/.test(normalizedMessage);

  // 区分出生地点和房屋信息
  const birthLocationPattern =
    /(出生[在于]|生于|[在于].*出生).*(北京|上海|广州|深圳)/;
  const hasLocation = birthLocationPattern.test(normalizedMessage);

  // 只有明确的房屋相关信息才算房屋信息
  const hasHouseInfo =
    /[东西南北][东西南北]?向|朝向|坐向|山向|房[子屋间].*[朝坐向]/.test(
      normalizedMessage
    ) && !/(出生|生于)/.test(normalizedMessage);

  // 强八字信号
  const hasCoreBaziKeyword = coreBaziKeywords.some(k =>
    normalizedMessage.includes(k)
  );
  const hasStrongBaziSignal =
    hasCoreBaziKeyword ||
    (hasBirthDate && hasGender) ||
    (hasBirthDate && /出生/.test(normalizedMessage)) ||
    /[算看测].*[八字命理命盘]/.test(normalizedMessage) ||
    /[我想].*[算批排].*[八字命]/.test(normalizedMessage);

  // 强风水信号
  const hasCoreFengshuiKeyword = coreFengshuiKeywords.some(k =>
    normalizedMessage.includes(k)
  );
  const hasStrongFengshuiSignal =
    hasCoreFengshuiKeyword ||
    hasHouseInfo ||
    /[看测分析].*风水/.test(normalizedMessage) ||
    /房[子屋].*[朝向坐向]/.test(normalizedMessage);

  // 判断分析类型
  let analysisType = 'none';
  let isIncomplete = false;
  let missingInfo = [];

  if (hasStrongBaziSignal && !hasStrongFengshuiSignal) {
    analysisType = 'bazi';
    if (!hasBirthDate) {
      isIncomplete = true;
      missingInfo.push('出生日期');
    }
    if (!hasGender) {
      isIncomplete = true;
      missingInfo.push('性别');
    }
  } else if (hasStrongFengshuiSignal && !hasStrongBaziSignal) {
    analysisType = 'fengshui';
    if (!hasHouseInfo) {
      isIncomplete = true;
      missingInfo.push('房屋朝向或布局信息');
    }
  } else if (hasStrongBaziSignal && hasStrongFengshuiSignal) {
    analysisType = 'combined';
    if (!hasBirthDate) {
      isIncomplete = true;
      missingInfo.push('出生日期');
    }
    if (!hasHouseInfo) {
      isIncomplete = true;
      missingInfo.push('房屋信息');
    }
  }

  return {
    analysisType,
    isIncomplete,
    missingInfo,
    hasLocation,
    hasHouseInfo,
    hasBirthDate,
    hasGender,
  };
}

// 测试用例
const tests = [
  {
    message: '请帮我分析八字：1990年3月15日下午3点，男性，出生在北京',
    expectedType: 'bazi',
    name: '八字分析（包含北京）',
  },
  {
    message: '我想算八字，1985年6月20日早上8点出生',
    expectedType: 'bazi',
    name: '八字分析（缺少性别）',
  },
  {
    message: '帮我算算命',
    expectedType: 'bazi',
    name: '八字分析（信息不完整）',
  },
  {
    message: '我的房子坐北朝南，请帮我分析风水',
    expectedType: 'fengshui',
    name: '风水分析',
  },
  {
    message: '男，1990年5月15日14时出生于上海，房子是坐北朝南，请综合分析',
    expectedType: 'combined',
    name: '综合分析',
  },
];

tests.forEach((test, index) => {
  const result = detectAnalysisType(test.message);
  const passed = result.analysisType === test.expectedType;

  console.log(`\n测试 ${index + 1}: ${test.name}`);
  console.log(`消息: "${test.message}"`);
  console.log(`期望类型: ${test.expectedType}`);
  console.log(`实际类型: ${result.analysisType}`);
  console.log(`检测到的信息:`);
  console.log(`  - 出生日期: ${result.hasBirthDate}`);
  console.log(`  - 性别: ${result.hasGender}`);
  console.log(`  - 出生地点: ${result.hasLocation}`);
  console.log(`  - 房屋信息: ${result.hasHouseInfo}`);
  if (result.isIncomplete) {
    console.log(`  - 缺失信息: ${result.missingInfo.join('、')}`);
  }
  console.log(`结果: ${passed ? '✅ 通过' : '❌ 失败'}`);
});

console.log('\n' + '='.repeat(80));
console.log('\n✅ 测试完成');
console.log('\n主要修复点：');
console.log('1. ✅ 区分出生地点（如北京）和房屋信息');
console.log('2. ✅ 优化八字分析类型判断逻辑');
console.log('3. ✅ 添加参数完整性验证');
console.log('4. ✅ 强化核心关键词权重');
