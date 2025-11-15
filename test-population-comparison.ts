/**
 * 人群对比分析集成测试
 * 
 * 测试 generatePopulationComparison 是否正确计算百分位、稀有度和时机提示
 */

import { generateFullReportV22 } from './src/lib/report/report-generator-v2.2';

async function testPopulationComparison() {
  console.log('====== 测试：人群对比分析 ======\n');

  // 测试 1: medium + pure （应该是前20%，稀有）
  const report1 = await generateFullReportV22(
    { name: '测试用户1', date: '1990-01-01', time: '10:00', city: '北京', gender: 'male' },
    {},
    {}
  );

  console.log('【测试1: medium + pure】');
  console.log('人群百分位:', report1.comparison.populationPercentile);
  console.log('格局稀有度:', report1.comparison.patternRarity);
  console.log('时机提示:', report1.comparison.timeMisalignmentNote || '无');
  console.log('相似案例:', report1.comparison.similarCases);
  console.log();

  // 验证
  const checks1 = [
    {
      name: '百分位计算',
      passed: report1.comparison.populationPercentile === '前20%',
      expected: '前20%',
      actual: report1.comparison.populationPercentile,
    },
    {
      name: '稀有度计算',
      passed: report1.comparison.patternRarity === '稀有',
      expected: '稀有',
      actual: report1.comparison.patternRarity,
    },
    {
      name: '时机提示生成',
      passed: report1.comparison.timeMisalignmentNote?.includes('45%'),
      expected: '包含45%',
      actual: report1.comparison.timeMisalignmentNote?.slice(0, 50) || '无',
    },
    {
      name: '案例数量',
      passed: report1.comparison.similarCases.length === 2,
      expected: '2',
      actual: report1.comparison.similarCases.length.toString(),
    },
  ];

  console.log('====== 验证结果 ======');
  checks1.forEach((check) => {
    const result = check.passed ? '✅' : '❌';
    console.log(`${result} ${check.name}: 期望=${check.expected}, 实际=${check.actual}`);
  });

  console.log('\n\n====== 完整 comparison 对象 ======');
  console.log(JSON.stringify(report1.comparison, null, 2));
}

testPopulationComparison().catch(console.error);
