/**
 * 测试2021年女性案例
 * 性别：女
 * 阳历：2021-04-05 10:00
 * 预期：当前年龄4岁（未满5岁），应该在第一个大运周期
 */

import { createEnhancedBaziCalculator } from '../../src/lib/bazi/enhanced-calculator';

const birthData = {
  datetime: '2021-04-05T10:00:00',
  gender: 'female' as const,
  location: '北京',
  timezone: 'Asia/Shanghai',
};

async function testCase() {
  console.log('====== 测试2021年女性案例 ======\n');
  console.log('输入数据:', JSON.stringify(birthData, null, 2));
  console.log('');

  const now = new Date();
  const birthDate = new Date(birthData.datetime);
  let currentAge = now.getFullYear() - birthDate.getFullYear();
  if (
    now.getMonth() < birthDate.getMonth() ||
    (now.getMonth() === birthDate.getMonth() && now.getDate() < birthDate.getDate())
  ) {
    currentAge--;
  }
  console.log('当前日期:', now.toISOString().split('T')[0]);
  console.log('实际年龄:', currentAge, '岁\n');

  try {
    const calculator = createEnhancedBaziCalculator(birthData);
    console.log('✅ 计算器创建成功\n');

    const result = await calculator.getCompleteAnalysis();
    console.log('✅ 获取完整分析成功\n');

    if (result?.pillars) {
      console.log('四柱八字:');
      console.log('  年柱:', result.pillars.year?.heavenlyStem, result.pillars.year?.earthlyBranch);
      console.log('  月柱:', result.pillars.month?.heavenlyStem, result.pillars.month?.earthlyBranch);
      console.log('  日柱:', result.pillars.day?.heavenlyStem, result.pillars.day?.earthlyBranch);
      console.log('  时柱:', result.pillars.hour?.heavenlyStem, result.pillars.hour?.earthlyBranch);
      console.log('');
    }

    const luckPillars = await calculator.getLuckPillarsAnalysis();
    console.log('大运数量:', luckPillars?.length || 0);
    console.log('');

    if (luckPillars && luckPillars.length > 0) {
      console.log('前5个大运:');
      luckPillars.slice(0, 5).forEach((pillar: any) => {
        console.log(
          `  第${pillar.period}大运: ${pillar.heavenlyStem}${pillar.earthlyBranch}  ${pillar.startAge}-${pillar.endAge}岁  (${pillar.startDate?.getFullYear()}-${pillar.endDate?.getFullYear()}年)`
        );
      });
      console.log('');
    }

    const currentLuckPillar = await calculator.getCurrentLuckPillar();
    console.log('====== 当前大运 ======');
    if (currentLuckPillar) {
      console.log('干支:', currentLuckPillar.heavenlyStem + currentLuckPillar.earthlyBranch);
      console.log('年龄范围:', currentLuckPillar.startAge, '-', currentLuckPillar.endAge, '岁');
      console.log('期数:', currentLuckPillar.period);
      console.log('');
      
      // 检查是否为乙未
      if (currentLuckPillar.heavenlyStem === '乙' && currentLuckPillar.earthlyBranch === '未') {
        console.log('⚠️ 当前大运确实是乙未');
        console.log('⚠️ 但年龄范围显示:', currentLuckPillar.startAge, '-', currentLuckPillar.endAge);
        if (currentLuckPillar.startAge === 24) {
          console.log('❌ 错误！显示24-33岁，但实际年龄才', currentAge, '岁');
        }
      }
    } else {
      console.log('❌ 未找到当前大运');
    }

  } catch (error) {
    console.error('❌ 错误:', error);
    if (error instanceof Error) {
      console.error('错误堆栈:', error.stack);
    }
  }
}

testCase();
