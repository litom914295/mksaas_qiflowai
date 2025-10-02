/**
 * QiFlow AI - 分析请求检测集成测试
 */

import {
    detectAnalysisRequest,
    extractAnalysisParams
} from '../dist/analysis-detection.js';

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

console.log(
  `${colors.cyan}========== QiFlow AI 分析请求检测测试 ==========${colors.reset}\n`
);

// 测试用例
const testCases = [
  // 八字分析
  {
    msg: '我是1990年3月15日下午2点30分出生的，男性，请帮我看看八字',
    expect: true,
    type: 'bazi',
  },
  { msg: '帮我算算命，1985年农历正月初五子时出生', expect: true, type: 'bazi' },
  {
    msg: '分析一下我的五行缺什么，1992年8月18日生',
    expect: true,
    type: 'bazi',
  },
  { msg: '看看我的运势怎么样', expect: true, type: 'bazi' },

  // 风水分析
  { msg: '我家房子坐北朝南，请帮我看看风水', expect: true, type: 'fengshui' },
  { msg: '子山午向的房子，九宫飞星怎么排', expect: true, type: 'fengshui' },
  { msg: '客厅在西北角，风水上有什么讲究', expect: true, type: 'fengshui' },

  // 综合分析
  {
    msg: '1990年3月15日生，房子坐北朝南，综合分析下',
    expect: true,
    type: 'combined',
  },

  // 非分析请求
  { msg: '什么是八字', expect: false, type: 'none' },
  { msg: '你好', expect: false, type: 'none' },
  { msg: '谢谢', expect: false, type: 'none' },
  { msg: '风水的原理是什么', expect: false, type: 'none' },
];

let passed = 0;
let failed = 0;

for (const test of testCases) {
  const result = detectAnalysisRequest(test.msg);
  const success =
    result.isAnalysisRequest === test.expect &&
    result.analysisType === test.type;

  if (success) {
    passed++;
    console.log(
      `${colors.green}✓${colors.reset} "${test.msg.substring(0, 40)}..."`
    );
    if (result.isAnalysisRequest) {
      console.log(
        `  └─ 类型: ${result.analysisType} | 置信度: ${(result.confidence * 100).toFixed(1)}%`
      );
    }
  } else {
    failed++;
    console.log(`${colors.red}✗${colors.reset} "${test.msg}"`);
    console.log(
      `  期望: ${test.expect} (${test.type}) | 实际: ${result.isAnalysisRequest} (${result.analysisType})`
    );
  }
}

// 参数提取测试
console.log(
  `\n${colors.cyan}========== 参数提取测试 ==========${colors.reset}\n`
);

const paramTests = [
  '我是1990年3月15日下午2点30分出生的，男性，在北京出生',
  '女，1985年农历正月初五子时',
  '房子是子山午向，八运建造',
];

for (const msg of paramTests) {
  console.log(`${colors.yellow}消息:${colors.reset} "${msg}"`);
  const params = extractAnalysisParams(msg);
  console.log('提取结果:', params);
  console.log('');
}

// 性能测试
console.log(`${colors.cyan}========== 性能测试 ==========${colors.reset}\n`);

const perfMsg =
  '我是1990年3月15日下午2点30分出生的，男性，住在北京，房子坐北朝南，请做八字风水分析';
const iterations = 1000;

console.time(`${iterations}次检测耗时`);
for (let i = 0; i < iterations; i++) {
  detectAnalysisRequest(perfMsg);
}
console.timeEnd(`${iterations}次检测耗时`);

console.time(`${iterations}次参数提取耗时`);
for (let i = 0; i < iterations; i++) {
  extractAnalysisParams(perfMsg);
}
console.timeEnd(`${iterations}次参数提取耗时`);

// 结果统计
console.log(`\n${colors.cyan}========== 测试结果 ==========${colors.reset}`);
console.log(`通过: ${colors.green}${passed}${colors.reset}`);
console.log(`失败: ${colors.red}${failed}${colors.reset}`);
console.log(`成功率: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
