/**
 * 测试用户提供的案例
 * 性别：女
 * 阳历：2023-04-03 11:02
 */

import { createEnhancedBaziCalculator } from '../../src/lib/bazi/enhanced-calculator';
import { normalizeBaziResult } from '../../src/lib/bazi/normalize';

const birthData = {
  datetime: '2023-04-03T11:02:00',
  gender: 'female' as const,
  timezone: 'Asia/Shanghai',
};

async function testCase() {
  console.log('====== 测试2023年女性案例 ======\n');
  console.log('出生日期:', birthData.datetime);
  console.log('性别:', birthData.gender);
  console.log('');

  // 计算当前年龄
  const now = new Date();
  const birthDate = new Date(birthData.datetime);
  let currentAge = now.getFullYear() - birthDate.getFullYear();
  if (
    now.getMonth() < birthDate.getMonth() ||
    (now.getMonth() === birthDate.getMonth() &&
      now.getDate() < birthDate.getDate())
  ) {
    currentAge--;
  }
  console.log('当前日期:', now.toISOString().split('T')[0]);
  console.log('当前年龄:', currentAge, '岁\n');

  try {
    const calculator = createEnhancedBaziCalculator(birthData);
    const rawResult = await calculator.getCompleteAnalysis();

    console.log('========== 底层计算结果 ==========');
    const luckPillars = await calculator.getLuckPillarsAnalysis();
    if (luckPillars) {
      console.log('\n底层返回的大运（前5个）:');
      luckPillars.slice(0, 5).forEach((p, i) => {
        console.log(
          `  ${i + 1}. ${p.heavenlyStem}${p.earthlyBranch}  ${p.startAge}-${p.endAge}岁  period=${p.period}`
        );
      });
    }

    console.log('\n========== 归一化后的结果 ==========');
    const normalized = normalizeBaziResult({
      ...rawResult!,
      birthData,
    } as any);

    console.log('\n归一化后的大运时间线（前5个）:');
    normalized.luck.daYunTimeline.slice(0, 5).forEach((d, i) => {
      console.log(
        `  ${i + 1}. ${d.heavenlyStem}${d.earthlyBranch}  ${d.ageRange[0]}-${d.ageRange[1]}岁  (${d.yearRange[0]}-${d.yearRange[1]}年)  period=${d.period}`
      );
    });

    console.log('\n当前大运:');
    if (normalized.luck.currentDaYun) {
      const curr = normalized.luck.currentDaYun;
      console.log(
        `  ${curr.heavenlyStem}${curr.earthlyBranch}  ${curr.ageRange[0]}-${curr.ageRange[1]}岁  (${curr.yearRange[0]}-${curr.yearRange[1]}年)`
      );
    } else {
      console.log('  无（尚未起运或未匹配到）');
    }

    console.log('\n========== 问题分析 ==========');
    console.log('实际年龄:', currentAge, '岁');

    // 检查是否有大运匹配当前年龄
    const shouldMatch = normalized.luck.daYunTimeline.find(
      (d) => currentAge >= d.ageRange[0] && currentAge <= d.ageRange[1]
    );

    if (shouldMatch) {
      console.log(
        '✅ 应该匹配的大运:',
        `${shouldMatch.heavenlyStem}${shouldMatch.earthlyBranch} ${shouldMatch.ageRange[0]}-${shouldMatch.ageRange[1]}岁`
      );
      if (normalized.luck.currentDaYun) {
        const curr = normalized.luck.currentDaYun;
        if (curr.period === shouldMatch.period) {
          console.log('✅ 当前大运匹配正确');
        } else {
          console.log('❌ 当前大运匹配错误！');
          console.log(
            '   期望:',
            `${shouldMatch.heavenlyStem}${shouldMatch.earthlyBranch}`
          );
          console.log('   实际:', `${curr.heavenlyStem}${curr.earthlyBranch}`);
        }
      } else {
        console.log('❌ 当前大运为空！');
      }
    } else {
      console.log(
        'ℹ️  当前年龄',
        currentAge,
        '岁，尚未起运或不在任何大运范围内'
      );
    }
  } catch (error) {
    console.error('错误:', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
  }
}

testCase();
