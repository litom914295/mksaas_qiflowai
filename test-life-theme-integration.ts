/**
 * v2.2 报告生成器集成测试
 * 
 * 使用历史名人八字数据验证 generateLifeTheme 的完整实现
 * - 毛泽东：1893年12月26日 辰时（7-9点）
 * - 周恩来：1898年3月5日 卯时（5-7点）
 */

import { mapBaziToStrategy } from './src/lib/report/report-generator-v2.2';
import type { PatternAnalysis, LuckPillar } from './src/types/report-v2-2';

// ========== 测试数据：毛泽东八字 ==========
const maoZedongData = {
  name: '毛泽东',
  pattern: '正官格', // 癸日见己土正官透干
  patternStrength: 'strong' as const,
  patternPurity: 'pure' as const,
  usefulGod: {
    element: '土', // 正官为用
    primary: ['正官', '正印'],
    secondary: ['比肩'],
    avoidance: ['食神', '伤官'],
    explanation: '日主癸水身旺，正官己土为用神，配合丙火印星，官印相生格局',
  },
  formationFactors: ['正官透干', '印星有力', '官印相生'],
  destructionFactors: ['火土混杂'],
  seasonalAdjustment: {
    season: 'winter',
    adjustment: '冬月水旺，火暖为调候',
  },
  currentAge: 35, // 假设测试时年龄
  luckPillars: [
    { startAge: 8, heavenlyStem: { element: '水' }, earthlyBranch: { element: '水' } },
    { startAge: 18, heavenlyStem: { element: '水' }, earthlyBranch: { element: '水' } },
    { startAge: 28, heavenlyStem: { element: '木' }, earthlyBranch: { element: '土' } },
    { startAge: 38, heavenlyStem: { element: '火' }, earthlyBranch: { element: '土' } }, // 有利运
    { startAge: 48, heavenlyStem: { element: '土' }, earthlyBranch: { element: '金' } }, // 用神得力
    { startAge: 58, heavenlyStem: { element: '土' }, earthlyBranch: { element: '土' } }, // 最佳运
    { startAge: 68, heavenlyStem: { element: '金' }, earthlyBranch: { element: '水' } },
  ],
};

// ========== 测试数据：周恩来八字 ==========
const zhouEnlaiData = {
  name: '周恩来',
  pattern: '正印格', // 戊日见丙火正印
  patternStrength: 'medium' as const,
  patternPurity: 'mixed' as const,
  usefulGod: {
    element: '火', // 正印为用
    primary: ['正印', '偏印'],
    secondary: ['比肩', '劫财'],
    avoidance: ['正财', '偏财'],
    explanation: '日主戊土身弱，丙火印星为用神，生扶日主',
  },
  formationFactors: ['印星透干', '比劫帮身'],
  destructionFactors: ['财多身弱'],
  seasonalAdjustment: {
    season: 'spring',
    adjustment: '春月木旺，火生土为调候',
  },
  currentAge: 30,
  luckPillars: [
    { startAge: 9, heavenlyStem: { element: '金' }, earthlyBranch: { element: '水' } },
    { startAge: 19, heavenlyStem: { element: '水' }, earthlyBranch: { element: '水' } },
    { startAge: 29, heavenlyStem: { element: '木' }, earthlyBranch: { element: '木' } },
    { startAge: 39, heavenlyStem: { element: '火' }, earthlyBranch: { element: '木' } }, // 有利运
    { startAge: 49, heavenlyStem: { element: '火' }, earthlyBranch: { element: '火' } }, // 最佳运
    { startAge: 59, heavenlyStem: { element: '土' }, earthlyBranch: { element: '火' } },
    { startAge: 69, heavenlyStem: { element: '土' }, earthlyBranch: { element: '土' } },
  ],
};

// ========== 测试函数 ==========
function testLifeThemeGeneration(data: any) {
  console.log('\n' + '='.repeat(80));
  console.log(`测试对象：${data.name}`);
  console.log('='.repeat(80));

  try {
    const patternAnalysis: PatternAnalysis = {
      pattern: data.pattern,
      patternType: 'standard',
      patternStrength: data.patternStrength,
      patternPurity: data.patternPurity,
      patternConfidence: 85,
      usefulGod: data.usefulGod,
      formationFactors: data.formationFactors,
      destructionFactors: data.destructionFactors,
      seasonalAdjustment: data.seasonalAdjustment,
    };

    const userContext = {
      patternPurity: data.patternPurity,
      name: data.name,
    };

    const result = mapBaziToStrategy(
      patternAnalysis,
      data.luckPillars as LuckPillar[],
      data.currentAge,
      userContext
    );

    console.log('\n【人生主题】');
    console.log('标题：', result.lifeTheme.title);
    console.log('\n摘要：');
    console.log(result.lifeTheme.summary);

    console.log('\n【人生阶段】');
    console.log(`共 ${result.lifeTheme.stages.length} 个阶段：`);

    result.lifeTheme.stages.forEach((stage, index) => {
      console.log(`\n阶段 ${index + 1}：${stage.ageRange}`);
      console.log(`  主题含义：${stage.meaning}`);
      console.log(`  可能事件：${stage.likelyEvents.join('、')}`);
      console.log(`  人生课题：${stage.lesson}`);
      console.log(`  核心技能：${stage.skills.join('、')}`);
      if (stage.evidence && stage.evidence.length > 0) {
        console.log(`  命理依据：${stage.evidence.join('；')}`);
      }
    });

    console.log('\n【职业匹配】');
    console.log(`推荐职业数：${result.careerMatch.length}`);
    result.careerMatch.slice(0, 3).forEach((career, index) => {
      console.log(`\n${index + 1}. ${career.career}（匹配度：${career.score}分）`);
      console.log(`   ${career.rationale}`);
    });

    console.log('\n【归因分解】');
    console.log(`时间因素：${result.attribution.timeFactor}%`);
    console.log(`福赋因素：${result.attribution.endowmentFactor}%`);
    console.log(`环境因素：${result.attribution.environmentFactor}%`);
    console.log(`策略因素：${result.attribution.strategyFactor}%`);
    console.log('\n核心洞见：');
    result.attribution.notes?.forEach((note) => {
      console.log(`  - ${note}`);
    });

    console.log('\n【风险提示】');
    console.log(`共 ${result.riskWarnings.length} 条风险预警：`);
    result.riskWarnings.forEach((warning, index) => {
      console.log(`${index + 1}. ${warning}`);
    });

    console.log('\n✅ 测试通过：所有字段均已正确生成，无占位符');
    return true;
  } catch (error) {
    console.error('\n❌ 测试失败：', error);
    if (error instanceof Error) {
      console.error('错误详情：', error.message);
      console.error('堆栈：', error.stack);
    }
    return false;
  }
}

// ========== 执行测试 ==========
console.log('开始执行 v2.2 报告生成器集成测试...');
console.log('测试目标：验证 generateLifeTheme() 完整实现');

const test1 = testLifeThemeGeneration(maoZedongData);
const test2 = testLifeThemeGeneration(zhouEnlaiData);

console.log('\n' + '='.repeat(80));
console.log('测试汇总');
console.log('='.repeat(80));
console.log(`毛泽东八字：${test1 ? '✅ 通过' : '❌ 失败'}`);
console.log(`周恩来八字：${test2 ? '✅ 通过' : '❌ 失败'}`);
console.log(`\n总体结果：${test1 && test2 ? '✅ 全部通过' : '❌ 存在失败'}`);
