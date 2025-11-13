/**
 * 测试完整数据流 - 模拟前端获取数据的过程
 * 案例：2021-04-05 10:00 女性
 */

import { createEnhancedBaziCalculator } from '../../src/lib/bazi/enhanced-calculator';
import { normalizeBaziResult } from '../../src/lib/bazi/normalize';

const birthData = {
  datetime: '2021-04-05T10:00:00',
  gender: 'female' as const,
  location: '北京',
  timezone: 'Asia/Shanghai',
};

async function testFullDataFlow() {
  console.log('====== 完整数据流测试 ======\n');
  console.log('模拟前端获取八字分析数据\n');

  try {
    // Step 1: 创建计算器（和前端一样）
    const calculator = createEnhancedBaziCalculator(birthData);

    // Step 2: 获取完整分析
    const rawResult = await calculator.getCompleteAnalysis();
    console.log('Step 1: 获取原始分析结果');
    console.log('  luckPillars数量:', rawResult?.luckPillars?.length || 0);
    console.log('');

    // Step 3: 归一化（前端会调用这个）
    console.log('Step 2: 归一化处理（前端调用）');
    const normalized = normalizeBaziResult({
      ...rawResult!,
      birthData,
    } as any);

    console.log('  归一化后的结构:');
    console.log('  - base.birth.datetime:', normalized.base.birth.datetime);
    console.log(
      '  - luck.daYunTimeline数量:',
      normalized.luck.daYunTimeline?.length || 0
    );
    console.log(
      '  - luck.currentDaYun:',
      normalized.luck.currentDaYun ? '存在' : '不存在'
    );
    console.log('');

    // Step 4: 检查大运时间线
    console.log('Step 3: 检查大运时间线 (前端显示的数据)');
    if (normalized.luck.daYunTimeline) {
      console.log('前5个大运:');
      normalized.luck.daYunTimeline.slice(0, 5).forEach((dayun, index) => {
        console.log(
          `  ${index + 1}. ${dayun.heavenlyStem}${dayun.earthlyBranch}  ${dayun.ageRange[0]}-${dayun.ageRange[1]}岁  (${dayun.yearRange[0]}-${dayun.yearRange[1]}年)`
        );

        // 特别标记乙未
        if (dayun.heavenlyStem === '乙' && dayun.earthlyBranch === '未') {
          console.log(
            `     ⭐ 这就是乙未！年龄范围: ${dayun.ageRange[0]}-${dayun.ageRange[1]}岁`
          );
        }
      });
      console.log('');

      // 找出所有乙未大运
      const yiweiList = normalized.luck.daYunTimeline.filter(
        (d) => d.heavenlyStem === '乙' && d.earthlyBranch === '未'
      );
      console.log('所有乙未大运:');
      yiweiList.forEach((d) => {
        console.log(
          `  period ${d.period}: ${d.ageRange[0]}-${d.ageRange[1]}岁`
        );
      });
      console.log('');
    }

    // Step 5: 检查当前大运
    console.log('Step 4: 检查当前大运');
    if (normalized.luck.currentDaYun) {
      const curr = normalized.luck.currentDaYun;
      console.log(`  当前大运: ${curr.heavenlyStem}${curr.earthlyBranch}`);
      console.log(`  年龄范围: ${curr.ageRange[0]}-${curr.ageRange[1]}岁`);
    } else {
      console.log('  ❌ 当前大运不存在（可能还未起运）');
    }
    console.log('');

    // Step 6: 计算当前年龄
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
    console.log('Step 5: 验证');
    console.log(`  实际年龄: ${currentAge}岁`);
    console.log(`  应该显示: ${currentAge < 10 ? '尚未起运' : '已起运'}`);
  } catch (error) {
    console.error('错误:', error);
  }
}

testFullDataFlow();
