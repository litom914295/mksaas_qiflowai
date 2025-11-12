/**
 * 详细的大运计算调试脚本
 * 追踪整个计算流程
 */

import { createEnhancedBaziCalculator } from '../../src/lib/bazi/enhanced-calculator';

const birthData = {
  datetime: '2024-03-04T11:03:00',
  gender: 'male' as const,
  location: '北京',
  timezone: 'Asia/Shanghai',
};

async function debugDayunCalculation() {
  console.log('====== 完整大运计算调试 ======\n');
  console.log('输入数据:', JSON.stringify(birthData, null, 2));
  console.log('');

  try {
    // 创建计算器
    const calculator = createEnhancedBaziCalculator(birthData);
    console.log('✅ 计算器创建成功\n');

    // 获取完整分析
    const result = await calculator.getCompleteAnalysis();
    console.log('✅ 获取完整分析成功\n');

    // 输出八字信息
    if (result?.pillars) {
      console.log('四柱八字:');
      console.log('  年柱:', result.pillars.year);
      console.log('  月柱:', result.pillars.month);
      console.log('  日柱:', result.pillars.day);
      console.log('  时柱:', result.pillars.hour);
      console.log('');
    }

    // 获取大运信息
    const luckPillars = await calculator.getLuckPillarsAnalysis();
    console.log('大运数量:', luckPillars?.length || 0);
    console.log('');

    if (luckPillars && luckPillars.length > 0) {
      console.log('大运列表详情:');
      luckPillars.forEach((pillar: any, index: number) => {
        console.log(`\n第${index + 1}大运:`);
        console.log('  干支:', pillar.heavenlyStem, pillar.earthlyBranch);
        console.log('  期数:', pillar.period);
        console.log('  起始年龄:', pillar.startAge);
        console.log('  结束年龄:', pillar.endAge);
        console.log('  起始年份:', pillar.startYear);
        console.log('  结束年份:', pillar.endYear);
        console.log('  起始日期:', pillar.startDate);
        console.log('  结束日期:', pillar.endDate);
      });
    }

    // 获取当前大运
    console.log('\n\n====== 当前大运信息 ======');
    const currentLuckPillar = await calculator.getCurrentLuckPillar();
    if (currentLuckPillar) {
      console.log('当前大运:');
      console.log('  干支:', currentLuckPillar.heavenlyStem, currentLuckPillar.earthlyBranch);
      console.log('  年龄范围:', currentLuckPillar.startAge, '-', currentLuckPillar.endAge);
      console.log('  期数:', currentLuckPillar.period);
    } else {
      console.log('❌ 未找到当前大运');
    }

    // 检查birthData
    console.log('\n\n====== 检查内部数据 ======');
    const anyResult = result as any;
    console.log('birthData:', anyResult.birthData);
    console.log('solar:', anyResult.solar);
    
    // 检查luckPillars的原始数据
    console.log('\nluckPillars原始数据:', JSON.stringify(result?.luckPillars?.slice(0, 3), null, 2));

  } catch (error) {
    console.error('❌ 错误:', error);
    if (error instanceof Error) {
      console.error('错误堆栈:', error.stack);
    }
  }
}

debugDayunCalculation();
