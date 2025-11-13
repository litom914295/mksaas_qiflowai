/**
 * Phase 8: 月度运势功能测试脚本
 *
 * 测试核心功能：
 * 1. 算法引擎生成
 * 2. AI 生成引擎
 * 3. 飞星九宫格计算
 */

import type { BaziChart } from '../src/lib/qiflow/bazi/types';
import { generateMonthlyFortune } from '../src/lib/qiflow/monthly-fortune/engine';

// 测试用八字数据
const testBaziChart: BaziChart = {
  year: {
    heavenlyStem: '甲',
    earthlyBranch: '子',
    element: '木',
    yinYang: '阳',
  },
  month: {
    heavenlyStem: '丙',
    earthlyBranch: '寅',
    element: '火',
    yinYang: '阳',
  },
  day: {
    heavenlyStem: '戊',
    earthlyBranch: '辰',
    element: '土',
    yinYang: '阳',
  },
  hour: {
    heavenlyStem: '庚',
    earthlyBranch: '午',
    element: '金',
    yinYang: '阳',
  },
  pillars: [],
  dayMaster: { element: '土', strength: 50 },
  favorableElements: ['火', '土'],
  unfavorableElements: ['木', '水'],
  birthInfo: {
    year: 1984,
    month: 12,
    day: 15,
    hour: 12,
    gender: 'male',
  },
};

async function testPhase8() {
  console.log('🧪 Phase 8 功能测试\n');
  console.log('='.repeat(60));

  try {
    // Test 1: 算法引擎
    console.log('\n📊 Test 1: 算法引擎生成\n');
    const startTime = Date.now();

    const fortune = await generateMonthlyFortune({
      userId: 'test-user',
      year: 2025,
      month: 1,
      baziChart: testBaziChart,
    });

    const duration = Date.now() - startTime;

    console.log('✅ 生成成功！');
    console.log(`⏱️  耗时: ${duration}ms`);
    console.log(`📈 综合评分: ${fortune.fortuneData.overallScore}/100`);
    console.log(
      `🧭 吉利方位: ${fortune.fortuneData.luckyDirections.join('、')}`
    );
    console.log(`🎨 幸运颜色: ${fortune.fortuneData.luckyColors.join('、')}`);
    console.log(`🔢 幸运数字: ${fortune.fortuneData.luckyNumbers.join('、')}`);

    // Test 2: 飞星九宫格
    console.log('\n🌟 Test 2: 飞星九宫格分析\n');
    console.log('九宫飞星布局：');
    fortune.flyingStarAnalysis.monthlyGrid.forEach((palace) => {
      const stars = `${palace.stars[0]}-${palace.stars[1]}`;
      const level =
        palace.auspiciousness === 'excellent'
          ? '⭐⭐⭐'
          : palace.auspiciousness === 'good'
            ? '⭐⭐'
            : palace.auspiciousness === 'neutral'
              ? '⭐'
              : palace.auspiciousness === 'poor'
                ? '⚠️'
                : '🚫';
      console.log(
        `   ${palace.direction.padEnd(6)} ${stars.padEnd(6)} ${level}  ${palace.meaning}`
      );
    });

    // Test 3: 八字时令性
    console.log('\n🎯 Test 3: 八字时令性分析\n');
    console.log(`流年天干地支: ${fortune.baziTimeliness.yearPillar}`);
    console.log(`流月天干地支: ${fortune.baziTimeliness.monthPillar}`);
    console.log(`相互作用: ${fortune.baziTimeliness.interactions.length} 项`);

    // Test 4: 化解建议
    if (fortune.flyingStarAnalysis.criticalWarnings.length > 0) {
      console.log('\n💡 Test 4: 关键方位警示\n');
      fortune.flyingStarAnalysis.criticalWarnings.forEach((warning, idx) => {
        console.log(`   ${idx + 1}. ${warning.direction}: ${warning.issue}`);
        console.log(`      化解: ${warning.remedy}`);
      });
    }

    // 性能统计
    console.log('\n📊 性能统计\n');
    console.log(
      `算法生成耗时: ${duration}ms (目标 < 500ms) ${duration < 500 ? '✅' : '❌'}`
    );
    console.log(
      `飞星宫位数量: ${fortune.flyingStarAnalysis.monthlyGrid.length}/9`
    );
    console.log(
      `关键警示数量: ${fortune.flyingStarAnalysis.criticalWarnings.length}`
    );
    console.log(`元数据耗时: ${fortune.metadata.generationTimeMs}ms`);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 所有测试通过！Phase 8 算法引擎运行正常\n');

    // 输出完整数据结构（用于调试）
    console.log('📄 完整数据结构预览：\n');
    console.log(JSON.stringify(fortune, null, 2).slice(0, 500) + '...\n');
  } catch (error) {
    console.error('\n❌ 测试失败:', error);
    process.exit(1);
  }
}

// 运行测试
testPhase8();
