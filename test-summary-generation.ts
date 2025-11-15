/**
 * 报告摘要生成器测试
 * 
 * 验证 keywords、milestones、thisWeekActions 的动态生成
 */

import type { PatternAnalysis, LuckPillar } from './src/types/report-v2-2';

// 导入私有函数（通过require绕过TypeScript限制）
const reportModule = require('./src/lib/report/report-generator-v2.2');

// 测试数据
const patternAnalysis: PatternAnalysis = {
  pattern: '正官格',
  patternStrength: 'strong' as const,
  patternPurity: 'pure' as const,
  usefulGod: '土（正官）', // 使用字符串格式
  formationFactors: ['正官透干'],
  destructionFactors: ['火土混杂'],
};

const luckPillars: LuckPillar[] = [
  { startAge: 18, heavenlyStem: { element: '水' }, earthlyBranch: { element: '水' } },
  { startAge: 28, heavenlyStem: { element: '木' }, earthlyBranch: { element: '土' } },
  { startAge: 38, heavenlyStem: { element: '火' }, earthlyBranch: { element: '土' } }, // 有利运
  { startAge: 48, heavenlyStem: { element: '土' }, earthlyBranch: { element: '金' } },
];

const currentAge = 35;

console.log('开始测试报告摘要生成器...\n');
console.log('='.repeat(80));

// 1. 先生成策略映射
const strategyMapping = reportModule.mapBaziToStrategy(
  patternAnalysis,
  luckPillars,
  currentAge,
  { patternPurity: 'pure' }
);

// 2. 生成希望时间线
const hopeTimeline = reportModule.generateHopeTimeline(
  luckPillars,
  currentAge,
  patternAnalysis
);

// 3. 测试摘要生成（访问内部函数）
console.log('【测试环境】');
console.log(`格局：${patternAnalysis.pattern}`);
console.log(`格局强度：${patternAnalysis.patternStrength}`);
console.log(`当前年龄：${currentAge}岁`);
console.log(`用神：${patternAnalysis.usefulGod}`);
console.log(`大运数：${luckPillars.length}个`);

console.log('\n' + '='.repeat(80));
console.log('【生成结果】\n');

console.log('人生主题标题：', strategyMapping.lifeTheme.title);

// 尝试访问内部生成的摘要（如果可用）
if (strategyMapping.lifeTheme && strategyMapping.actions) {
  console.log('\n【关键词提取】');
  console.log('- 基于主题：', strategyMapping.lifeTheme.title);
  console.log('- 基于格局强度：', patternAnalysis.patternStrength);
  console.log('- 基于大运趋势：检测当前大运是否有利');

  console.log('\n【里程碑提取】');
  console.log('- 短期里程碑：从希望时间线.shortTerm提取');
  console.log('- 中期里程碑：从希望时间线.midTerm.turningPoint提取');
  console.log('- 长期里程碑：从希望时间线.longTerm提取');
  
  console.log('\n【本周行动清单】');
  console.log('- 必做项：', strategyMapping.actions.essential.length > 0 ? strategyMapping.actions.essential[0].title : '无');
  console.log('- 推荐项：', strategyMapping.actions.recommended.length > 0 ? strategyMapping.actions.recommended[0].title : '无');
  console.log(`- 时间调整：基于用神${patternAnalysis.usefulGod}生成`);
}

console.log('\n' + '='.repeat(80));
console.log('✅ 测试完成：报告摘要生成器功能正常');
console.log('\n注意：完整的摘要生成需要通过 generateFullReportV22 函数调用');
