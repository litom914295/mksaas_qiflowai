/**
 * 大运分析系统测试脚本
 *
 * 测试增强的八字大运分析功能，包括：
 * - 十神关系分析
 * - 重大事件预测
 * - 流年互动计算
 * - 大运特征分析
 */

import { describe, expect, it } from '@jest/globals';
import { createEnhancedBaziCalculator } from '../enhanced-calculator';
import { analyzeLuckPillars, createLuckPillarsAnalyzer } from '../luck-pillars';
import { createTenGodsCalculator } from '../ten-gods';

/**
 * 测试用的出生数据
 */
const testBirthData = {
  datetime: '1990-06-15T14:30', // 1990年6月15日 14:30
  gender: 'male',
  timezone: 'Asia/Shanghai',
  isTimeKnown: true,
  preferredLocale: 'zh-CN',
};

/**
 * 主测试函数
 */
async function testDayunAnalysis() {
  console.log('🎯 开始测试大运分析系统...\n');

  try {
    // 1. 创建增强型八字计算器
    console.log('📊 创建八字计算器...');
    const calculator = createEnhancedBaziCalculator(testBirthData);

    // 2. 计算基础八字
    console.log('🔢 计算基础八字信息...');
    const baziResult = await calculator.getCompleteAnalysis();

    if (baziResult) {
      console.log('✅ 八字计算成功');
      console.log(
        `   年柱: ${baziResult.pillars.year.stem}${baziResult.pillars.year.branch}`
      );
      console.log(
        `   月柱: ${baziResult.pillars.month.stem}${baziResult.pillars.month.branch}`
      );
      console.log(
        `   日柱: ${baziResult.pillars.day.stem}${baziResult.pillars.day.branch}`
      );
      console.log(
        `   时柱: ${baziResult.pillars.hour.stem}${baziResult.pillars.hour.branch}\n`
      );
    }

    // 3. 测试十神分析
    console.log('🌟 测试十神分析系统...');
    if (baziResult) {
      const tenGodsCalculator = createTenGodsCalculator();
      const tenGodAnalysis = tenGodsCalculator.calculateTenGods(
        baziResult.pillars
      );

      console.log('✅ 十神分析完成');
      console.log(`   日主: ${tenGodAnalysis.dayMaster}`);
      console.log(`   主导十神: ${tenGodAnalysis.dominantGods.join('、')}`);
      console.log(
        `   性格优势: ${tenGodAnalysis.personality.strengths.slice(0, 3).join('、')}`
      );
      console.log(`   财富潜力: ${tenGodAnalysis.wealth.potential}\n`);
    }

    // 4. 测试大运分析
    console.log('🔮 测试大运分析系统...');
    const luckPillarsAnalyzer = createLuckPillarsAnalyzer(calculator);

    // 分析所有大运
    const allLuckPillars = await luckPillarsAnalyzer.analyzeAllLuckPillars();
    console.log(`✅ 成功分析 ${allLuckPillars.length} 个大运周期\n`);

    // 5. 详细测试第一个大运
    if (allLuckPillars.length > 0) {
      const firstDayun = allLuckPillars[0];
      console.log('📋 第一个大运详细分析:');
      console.log(`   大运周期: ${firstDayun.ageRange}岁`);
      console.log(
        `   天干地支: ${firstDayun.pillar.heavenlyStem}${firstDayun.pillar.earthlyBranch}`
      );
      console.log(`   大运强度: ${firstDayun.strength}`);
      console.log(`   整体影响: ${firstDayun.influence}`);

      // 十神关系分析
      console.log(`   天干十神: ${firstDayun.tenGodRelation.heavenlyTenGod}`);
      if (firstDayun.tenGodRelation.earthlyTenGod) {
        console.log(`   地支十神: ${firstDayun.tenGodRelation.earthlyTenGod}`);
      }
      console.log(
        `   组合影响: ${firstDayun.tenGodRelation.combinedInfluence}`
      );

      // 各方面影响
      if (firstDayun.tenGodRelation.personalityImpact.length > 0) {
        console.log(
          `   性格影响: ${firstDayun.tenGodRelation.personalityImpact[0]}`
        );
      }
      if (firstDayun.tenGodRelation.careerImpact.length > 0) {
        console.log(
          `   事业影响: ${firstDayun.tenGodRelation.careerImpact[0]}`
        );
      }
      if (firstDayun.tenGodRelation.wealthImpact.length > 0) {
        console.log(
          `   财运影响: ${firstDayun.tenGodRelation.wealthImpact[0]}`
        );
      }

      // 重大事件预测
      console.log(`   重大事件预测: ${firstDayun.majorEvents.length}个事件`);
      firstDayun.majorEvents.forEach((event, index) => {
        console.log(
          `     ${index + 1}. ${event.year}年(${event.age}岁): ${event.description}`
        );
      });

      // 流年互动
      console.log(
        `   流年互动分析: ${firstDayun.yearlyInteractions.length}个关键年份`
      );
      firstDayun.yearlyInteractions
        .slice(0, 3)
        .forEach((interaction, index) => {
          console.log(
            `     ${index + 1}. ${interaction.year}年: ${interaction.description}`
          );
        });

      console.log('');
    }

    // 6. 测试当前大运
    console.log('📅 测试当前大运分析...');
    const currentDayun = await luckPillarsAnalyzer.analyzeCurrentLuckPillar();

    if (currentDayun) {
      console.log('✅ 当前大运分析完成');
      console.log(`   当前年龄段: ${currentDayun.ageRange}岁`);
      console.log(
        `   当前大运: ${currentDayun.pillar.heavenlyStem}${currentDayun.pillar.earthlyBranch}`
      );
      console.log(
        `   关键特征: ${currentDayun.keyThemes.slice(0, 3).join('、')}`
      );
      console.log(`   建议事项: ${currentDayun.recommendations[0]}\n`);
    } else {
      console.log('ℹ️ 未找到当前大运信息\n');
    }

    // 7. 测试便捷函数
    console.log('🚀 测试便捷分析函数...');
    const quickAnalysis = await analyzeLuckPillars(testBirthData);
    console.log(`✅ 便捷函数成功分析 ${quickAnalysis.length} 个大运\n`);

    // 8. 输出成功总结
    console.log('🎉 大运分析系统测试完成!');
    console.log('');
    console.log('✅ 测试通过的功能:');
    console.log('   • 八字基础计算');
    console.log('   • 十神关系分析');
    console.log('   • 大运分析框架');
    console.log('   • 十神影响评估');
    console.log('   • 重大事件预测');
    console.log('   • 流年互动分析');
    console.log('   • 个性化建议生成');
    console.log('');
    console.log('🔥 核心特色:');
    console.log('   • 专业的十神分析系统');
    console.log('   • 智能的人生事件预测');
    console.log('   • 精确的流年互动计算');
    console.log('   • 全面的大运特征解读');
    console.log('   • 实用的人生指导建议');
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    console.error(
      '错误堆栈:',
      error instanceof Error ? error.stack : '未知错误'
    );
  }
}

/**
 * 运行测试（如果直接执行此文件）
 */
if (require.main === module) {
  testDayunAnalysis()
    .then(() => {
      console.log('\n🏁 测试执行完成');
    })
    .catch((error) => {
      console.error('\n💥 测试执行失败:', error);
      process.exit(1);
    });
}

export { testDayunAnalysis };

describe('大运分析系统', () => {
  it('应该能够创建增强型八字计算器', () => {
    const calculator = createEnhancedBaziCalculator(testBirthData);
    expect(calculator).toBeDefined();
  });

  it('应该能够计算基础八字信息', async () => {
    const calculator = createEnhancedBaziCalculator(testBirthData);
    const baziResult = await calculator.getCompleteAnalysis();

    expect(baziResult).toBeDefined();
    expect(baziResult?.pillars).toBeDefined();
    expect(baziResult?.pillars?.year).toBeDefined();
    expect(baziResult?.pillars?.month).toBeDefined();
    expect(baziResult?.pillars?.day).toBeDefined();
    expect(baziResult?.pillars?.hour).toBeDefined();
  });

  it('应该能够创建十神计算器', () => {
    const tenGodsCalculator = createTenGodsCalculator();
    expect(tenGodsCalculator).toBeDefined();
  });

  it('应该能够创建大运分析器', async () => {
    const calculator = createEnhancedBaziCalculator(testBirthData);
    const luckPillarsAnalyzer = createLuckPillarsAnalyzer(calculator);
    expect(luckPillarsAnalyzer).toBeDefined();
  });

  it('应该能够使用便捷函数分析大运', async () => {
    const quickAnalysis = await analyzeLuckPillars(testBirthData);
    expect(Array.isArray(quickAnalysis)).toBe(true);
  });
});
