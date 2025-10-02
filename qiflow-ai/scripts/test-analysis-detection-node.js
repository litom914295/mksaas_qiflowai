/**
 * QiFlow AI - 分析请求检测测试脚本
 *
 * 测试增强版分析请求检测功能的准确性和可靠性
 */

// 由于是TypeScript项目，我们需要先编译或使用 ts-node

// 设置TypeScript环境
import 'ts-node/register';

// 导入检测模块
import {
    AnalysisType,
    detectAnalysisRequest,
    extractAnalysisParams,
} from '../src/lib/ai/analysis-detection.js';

// 定义测试用例
const testCases = [
  // 八字分析请求 - 应该被识别
  {
    category: '八字分析请求',
    shouldDetect: true,
    expectedType: AnalysisType.BAZI,
    cases: [
      '我是1990年3月15日下午2点30分出生的，男性，请帮我看看八字',
      '帮我算算命，1985年农历正月初五子时出生',
      '分析一下我的命理，生辰是1992-08-18 14:30',
      '我想知道我的八字如何，出生于1988年6月20日午时，女',
      '请帮我排个命盘，1995年10月1日早上8点生的',
      '看看我的运势怎么样，1987年2月28日出生',
      '帮我分析下五行缺什么，1991年12月25日晚上10点',
      '我的用神和喜神是什么？1989年7月7日巳时',
      '大运流年分析，1993年4月4日辰时出生的男命',
      '十神分析，坤造1986年9月9日酉时',
    ],
  },

  // 风水分析请求 - 应该被识别
  {
    category: '风水分析请求',
    shouldDetect: true,
    expectedType: AnalysisType.FENGSHUI,
    cases: [
      '我家房子坐北朝南，请帮我看看风水',
      '分析一下子山午向的房屋布局',
      '玄空飞星排盘，癸山丁向，八运房',
      '房子朝向东南，户型是三室两厅，风水如何',
      '帮我看看客厅的布局，房子是西北朝向的',
      '九宫飞星分析，坐东向西的房子',
      '我的卧室在西南方，这个方位好不好',
      '大门朝北，如何化解煞气',
      '厨房在西北角，风水上有什么问题吗',
      '阳台朝南，适合摆放什么风水物品',
    ],
  },

  // 综合分析请求 - 应该被识别
  {
    category: '综合分析请求',
    shouldDetect: true,
    expectedType: AnalysisType.COMBINED,
    cases: [
      '我是1990年3月15日出生，房子坐北朝南，请综合分析',
      '八字风水全面分析，1985年5月20日生，住东向的房子',
      '出生1992-08-18，家里是子山午向，帮我看看运势和风水',
      '命理和家居风水分析，1988年6月生人，房屋朝向西北',
      '1995年10月1日出生，新买的房子坐东朝西，请给建议',
    ],
  },

  // 自然语言请求 - 应该被识别
  {
    category: '自然语言分析请求',
    shouldDetect: true,
    expectedType: AnalysisType.BAZI,
    cases: [
      '帮我看看我的命运如何',
      '我想了解一下自己的运势',
      '最近运气不好，能帮我分析分析吗',
      '想知道今年的财运怎么样',
      '我适合什么样的工作',
      '感情方面有什么建议吗',
      '帮我算算什么时候能转运',
    ],
  },

  // 普通咨询 - 不应该被识别
  {
    category: '普通咨询（非分析）',
    shouldDetect: false,
    expectedType: AnalysisType.NONE,
    cases: [
      '什么是八字',
      '风水的原理是什么',
      '五行相生相克的关系',
      '介绍一下十神',
      '玄空飞星是什么意思',
      '如何学习风水',
      '八字和风水有什么区别',
      '命理学的历史',
    ],
  },

  // 闲聊 - 不应该被识别
  {
    category: '闲聊（非分析）',
    shouldDetect: false,
    expectedType: AnalysisType.NONE,
    cases: [
      '你好',
      '谢谢',
      '再见',
      '今天天气真好',
      '现在几点了',
      '你是谁',
      '你会什么',
      '好的，我知道了',
    ],
  },

  // 系统消息 - 不应该被识别
  {
    category: '系统消息（非分析）',
    shouldDetect: false,
    expectedType: AnalysisType.NONE,
    cases: [
      '你好，我是 QiFlow AI 八字风水大师',
      '请告诉我你的需求',
      'AI 大师正在思考',
      '根据您提供的出生信息',
      '分析完成，以下是结果',
    ],
  },
];

// 颜色输出函数
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// 测试执行函数
function runTests() {
  console.log(
    colorize('\n========== QiFlow AI 分析请求检测测试 ==========\n', 'cyan')
  );

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  for (const testGroup of testCases) {
    console.log(colorize(`\n测试类别: ${testGroup.category}`, 'yellow'));
    console.log(
      colorize(`预期检测结果: ${testGroup.shouldDetect ? '是' : '否'}`, 'blue')
    );
    console.log(colorize(`预期分析类型: ${testGroup.expectedType}`, 'blue'));
    console.log('-'.repeat(60));

    for (const testCase of testGroup.cases) {
      totalTests++;

      // 执行检测
      const result = detectAnalysisRequest(testCase);
      const params = extractAnalysisParams(testCase);

      // 验证结果
      const detectCorrect = result.isAnalysisRequest === testGroup.shouldDetect;
      const typeCorrect = testGroup.shouldDetect
        ? result.analysisType === testGroup.expectedType
        : true;
      const passed = detectCorrect && typeCorrect;

      if (passed) {
        passedTests++;
        console.log(
          colorize('✓', 'green'),
          `"${testCase.substring(0, 50)}..."`
        );
      } else {
        failedTests++;
        console.log(colorize('✗', 'red'), `"${testCase.substring(0, 50)}..."`);
        console.log(
          `  实际: 检测=${result.isAnalysisRequest}, 类型=${result.analysisType}, 置信度=${(result.confidence * 100).toFixed(1)}%`
        );
        console.log(`  原因: ${result.reason}`);
      }

      // 显示详细信息（仅在检测为分析请求时）
      if (result.isAnalysisRequest) {
        console.log(
          `  └─ 置信度: ${colorize((result.confidence * 100).toFixed(1) + '%', 'magenta')}`
        );

        if (result.extractedInfo.keywords.length > 0) {
          console.log(
            `     关键词: ${result.extractedInfo.keywords.slice(0, 5).join(', ')}`
          );
        }

        if (result.extractedInfo.dateFormats.length > 0) {
          console.log(
            `     日期: ${result.extractedInfo.dateFormats.join(', ')}`
          );
        }

        // 显示提取的参数
        if (Object.keys(params).length > 0) {
          console.log(
            `     提取参数:`,
            JSON.stringify(params, null, 2).replace(/\n/g, '\n     ')
          );
        }
      }
    }
  }

  // 显示测试结果统计
  console.log('\n' + '='.repeat(60));
  console.log(colorize('\n测试结果统计:', 'cyan'));
  console.log(`总测试数: ${totalTests}`);
  console.log(`通过: ${colorize(passedTests, 'green')}`);
  console.log(`失败: ${colorize(failedTests, 'red')}`);
  console.log(
    `成功率: ${colorize(((passedTests / totalTests) * 100).toFixed(1) + '%', passedTests === totalTests ? 'green' : 'yellow')}`
  );

  // 性能测试
  console.log(colorize('\n\n性能测试:', 'cyan'));
  console.log('-'.repeat(60));

  const performanceTest =
    '我是1990年3月15日下午2点30分出生的，男性，住在北京朝阳区，房子坐北朝南，请帮我做全面的八字风水分析';

  console.time('检测耗时');
  const perfResult = detectAnalysisRequest(performanceTest);
  console.timeEnd('检测耗时');

  console.time('参数提取耗时');
  const perfParams = extractAnalysisParams(performanceTest);
  console.timeEnd('参数提取耗时');

  console.log('\n测试消息:', performanceTest);
  console.log('检测结果:', {
    isAnalysisRequest: perfResult.isAnalysisRequest,
    analysisType: perfResult.analysisType,
    confidence: (perfResult.confidence * 100).toFixed(1) + '%',
    keywords: perfResult.extractedInfo.keywords.length,
    hasBirthDate: perfResult.extractedInfo.hasBirthDate,
    hasGender: perfResult.extractedInfo.hasGender,
    hasLocation: perfResult.extractedInfo.hasLocation,
    hasHouseInfo: perfResult.extractedInfo.hasHouseInfo,
  });
  console.log('提取参数:', perfParams);

  console.log(colorize('\n========== 测试完成 ==========\n', 'cyan'));
}

// 运行测试
runTests();
