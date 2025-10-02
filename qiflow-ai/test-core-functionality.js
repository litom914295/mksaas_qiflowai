import { detectAnalysisRequest } from './src/lib/ai/analysis-detection.js';
import { computeBaziSmart } from './src/lib/bazi/index.js';

console.log('测试核心功能...\n');

// 测试分析请求检测
console.log('1. 测试分析请求检测:');
const testMessages = [
  '请帮我分析八字：1990年3月15日下午3点，男性，出生在北京',
  '我想算八字，1985年6月20日早上8点出生',
  '帮我算算命',
  '什么是八字？',
];

testMessages.forEach((msg, i) => {
  try {
    const result = detectAnalysisRequest(msg);
    console.log(`  消息 ${i + 1}: "${msg.substring(0, 30)}..."`);
    console.log(`    分析类型: ${result.analysisType}`);
    console.log(`    置信度: ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`    信息完整: ${!result.isIncomplete}`);
    if (result.isIncomplete) {
      console.log(`    缺失信息: ${result.missingInfo?.join(', ')}`);
    }
    console.log('');
  } catch (error) {
    console.log(`    错误: ${error.message}`);
  }
});

// 测试八字计算
console.log('\n2. 测试八字计算:');
const testBirthData = {
  year: 1990,
  month: 3,
  day: 15,
  hour: 15,
  minute: 0,
  timezone: 'Asia/Shanghai',
  calendarType: 'solar',
  gender: 'male',
};

try {
  computeBaziSmart(testBirthData)
    .then(result => {
      if (result) {
        console.log('  八字计算成功:');
        console.log(
          `    年柱: ${result.fourPillars.year.stem}${result.fourPillars.year.branch}`
        );
        console.log(
          `    月柱: ${result.fourPillars.month.stem}${result.fourPillars.month.branch}`
        );
        console.log(
          `    日柱: ${result.fourPillars.day.stem}${result.fourPillars.day.branch}`
        );
        console.log(
          `    时柱: ${result.fourPillars.hour.stem}${result.fourPillars.hour.branch}`
        );
        console.log(
          `    日主: ${result.dayMaster.stem} (${result.dayMaster.element})`
        );
      } else {
        console.log('  八字计算返回空结果');
      }
    })
    .catch(error => {
      console.log(`  八字计算错误: ${error.message}`);
    });
} catch (error) {
  console.log(`  八字计算错误: ${error.message}`);
}

console.log('\n测试完成。');
