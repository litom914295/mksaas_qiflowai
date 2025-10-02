#!/usr/bin/env node

/**
 * QiFlow AI - 简单的分析请求检测测试
 *
 * 直接测试分析检测函数的基本功能
 */

import fs from 'fs';
import path from 'path';

// 读取并执行TypeScript代码（简单转换）
const detectionCode = fs.readFileSync(
  path.join(__dirname, '../src/lib/ai/analysis-detection.ts'),
  'utf-8'
);

// 简单的TypeScript到JavaScript转换（移除类型注解）
const jsCode = detectionCode
  .replace(/export enum/g, 'const')
  .replace(/export interface[\s\S]*?\{[\s\S]*?\}\n/g, '')
  .replace(/:\s*\w+(\[\])?/g, '')
  .replace(/\s*\|\s*\w+/g, '')
  .replace(/export function/g, 'function')
  .replace(/export \{[^}]*\}/g, '')
  .replace(/process\.env\.NODE_ENV === 'development'/g, 'false');

// 执行转换后的代码
eval(jsCode);

// 定义AnalysisType枚举
const AnalysisType = {
  BAZI: 'bazi',
  FENGSHUI: 'fengshui',
  COMBINED: 'combined',
  NONE: 'none',
};

// 测试用例
const testMessages = [
  // 八字分析请求
  {
    message: '我是1990年3月15日下午2点30分出生的，男性，请帮我看看八字',
    expectedDetect: true,
    expectedType: AnalysisType.BAZI,
    description: '完整的八字分析请求',
  },
  {
    message: '帮我算算命，1985年农历正月初五子时出生',
    expectedDetect: true,
    expectedType: AnalysisType.BAZI,
    description: '农历时间的算命请求',
  },
  {
    message: '分析一下我的五行缺什么',
    expectedDetect: true,
    expectedType: AnalysisType.BAZI,
    description: '五行分析请求',
  },

  // 风水分析请求
  {
    message: '我家房子坐北朝南，请帮我看看风水',
    expectedDetect: true,
    expectedType: AnalysisType.FENGSHUI,
    description: '房屋风水分析',
  },
  {
    message: '子山午向的房子，九宫飞星怎么排',
    expectedDetect: true,
    expectedType: AnalysisType.FENGSHUI,
    description: '飞星风水分析',
  },

  // 综合分析
  {
    message: '我是1990年3月15日生，房子坐北朝南，综合分析下',
    expectedDetect: true,
    expectedType: AnalysisType.COMBINED,
    description: '八字+风水综合分析',
  },

  // 自然语言请求
  {
    message: '帮我看看运势',
    expectedDetect: true,
    expectedType: AnalysisType.BAZI,
    description: '口语化运势请求',
  },
  {
    message: '最近运气不好，能帮我分析分析吗',
    expectedDetect: true,
    expectedType: AnalysisType.BAZI,
    description: '自然语言分析请求',
  },

  // 非分析请求
  {
    message: '什么是八字',
    expectedDetect: false,
    expectedType: AnalysisType.NONE,
    description: '知识咨询',
  },
  {
    message: '你好',
    expectedDetect: false,
    expectedType: AnalysisType.NONE,
    description: '问候语',
  },
  {
    message: '谢谢你的帮助',
    expectedDetect: false,
    expectedType: AnalysisType.NONE,
    description: '感谢语',
  },
];

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

console.log(
  `${colors.cyan}========== QiFlow AI 分析请求检测测试 ==========${colors.reset}\n`
);

let passed = 0;
let failed = 0;

// 执行测试
for (const test of testMessages) {
  const result = detectAnalysisRequest(test.message);

  const detectCorrect = result.isAnalysisRequest === test.expectedDetect;
  const typeCorrect = test.expectedDetect
    ? result.analysisType === test.expectedType
    : true;
  const success = detectCorrect && typeCorrect;

  if (success) {
    passed++;
    console.log(`${colors.green}✓${colors.reset} ${test.description}`);
    console.log(`  消息: "${test.message.substring(0, 50)}..."`);
    if (result.isAnalysisRequest) {
      console.log(
        `  检测结果: 是分析请求 | 类型: ${result.analysisType} | 置信度: ${(result.confidence * 100).toFixed(1)}%`
      );
    }
  } else {
    failed++;
    console.log(`${colors.red}✗${colors.reset} ${test.description}`);
    console.log(`  消息: "${test.message}"`);
    console.log(
      `  预期: 检测=${test.expectedDetect}, 类型=${test.expectedType}`
    );
    console.log(
      `  实际: 检测=${result.isAnalysisRequest}, 类型=${result.analysisType}`
    );
    console.log(`  原因: ${result.reason}`);
  }
  console.log('');
}

// 测试参数提取
console.log(
  `${colors.cyan}========== 参数提取测试 ==========${colors.reset}\n`
);

const extractTests = [
  '我是1990年3月15日下午2点30分出生的，男性',
  '1985年农历正月初五子时出生，女',
  '房子坐北朝南，子山午向',
  '八运房，癸山丁向',
];

for (const msg of extractTests) {
  const params = extractAnalysisParams(msg);
  console.log(`消息: "${msg}"`);
  console.log('提取参数:', JSON.stringify(params, null, 2));
  console.log('');
}

// 显示结果统计
console.log(`${colors.cyan}========== 测试结果 ==========${colors.reset}`);
console.log(`通过: ${colors.green}${passed}${colors.reset}`);
console.log(`失败: ${colors.red}${failed}${colors.reset}`);
console.log(`总计: ${passed + failed}`);
console.log(`成功率: ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`);
