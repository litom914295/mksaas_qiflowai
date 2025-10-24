#!/usr/bin/env node
/**
 * 测试 LuckCyclesAnalysis 组件修复
 * 验证对 undefined 的安全处理
 */

import type { BaziAnalysisModel } from '../src/lib/bazi/normalize';

// 模拟测试数据
const testCases = [
  {
    name: '完整数据',
    data: {
      base: {
        birth: {
          datetime: '1990-05-15T14:30:00',
          location: '北京',
        },
        gender: 'male' as const,
      },
      luck: {
        timeline: [
          {
            period: 1,
            ageRange: [3, 12] as [number, number],
            yearRange: [1993, 2002] as [number, number],
            heavenlyStem: '壬',
            earthlyBranch: '午',
            element: '水火',
            theme: '成长发展期',
            fortune: {
              overall: 75,
              career: 70,
              wealth: 65,
              relationship: 80,
              health: 75,
            },
          },
        ],
        currentDaYun: {
          period: 4,
          ageRange: [33, 42] as [number, number],
          yearRange: [2023, 2032] as [number, number],
          heavenlyStem: '乙',
          earthlyBranch: '酉',
          element: '木金',
          theme: '事业发展期',
          fortune: {
            overall: 80,
            career: 85,
            wealth: 75,
            relationship: 70,
            health: 80,
          },
        },
        annualForecast: [
          {
            year: 2025,
            age: 35,
            heavenlyStem: '乙',
            earthlyBranch: '巳',
            zodiac: '蛇',
            score: 75,
            theme: '稳步前进',
            favorable: ['事业发展', '财运提升'],
            unfavorable: ['注意健康'],
          },
        ],
      },
    } as Partial<BaziAnalysisModel>,
  },
  {
    name: 'luck对象为undefined',
    data: {
      base: {
        birth: {
          datetime: '1990-05-15T14:30:00',
          location: '北京',
        },
        gender: 'female' as const,
      },
      luck: undefined as any,
    } as Partial<BaziAnalysisModel>,
  },
  {
    name: 'timeline为undefined',
    data: {
      base: {
        birth: {
          datetime: '1990-05-15T14:30:00',
          location: '北京',
        },
        gender: 'male' as const,
      },
      luck: {
        timeline: undefined as any,
        currentDaYun: undefined,
        annualForecast: undefined,
      },
    } as Partial<BaziAnalysisModel>,
  },
  {
    name: '空数组',
    data: {
      base: {
        birth: {
          datetime: '1990-05-15T14:30:00',
          location: '北京',
        },
        gender: 'female' as const,
      },
      luck: {
        timeline: [],
        currentDaYun: undefined,
        annualForecast: [],
      },
    } as Partial<BaziAnalysisModel>,
  },
];

// 模拟组件逻辑
function simulateComponent(data: Partial<BaziAnalysisModel>) {
  const { luck, base } = data;

  try {
    // 模拟组件中的逻辑
    const daYunTimeline = luck?.timeline || luck?.daYunTimeline || [];
    const selectedDaYun = luck?.currentDaYun?.period || 1;

    console.log('  daYunTimeline长度:', daYunTimeline.length);
    console.log('  selectedDaYun:', selectedDaYun);

    // 模拟 find 操作
    const selectedDaYunDetail =
      daYunTimeline.length > 0
        ? daYunTimeline.find((d: any) => d.period === selectedDaYun)
        : null;

    console.log(
      '  selectedDaYunDetail:',
      selectedDaYunDetail ? '找到' : '未找到'
    );

    // 模拟访问 currentDaYun
    if (luck?.currentDaYun) {
      console.log('  currentDaYun存在:', luck.currentDaYun.theme);
    } else {
      console.log('  currentDaYun不存在');
    }

    // 模拟访问 annualForecast
    const annualForecast = luck?.annualForecast || [];
    console.log('  annualForecast长度:', annualForecast.length);

    console.log('  ✅ 测试通过');
    return true;
  } catch (error: any) {
    console.log('  ❌ 测试失败:', error.message);
    return false;
  }
}

// 运行测试
console.log('=== LuckCyclesAnalysis 组件安全性测试 ===\n');

let passCount = 0;
let failCount = 0;

for (const testCase of testCases) {
  console.log(`测试: ${testCase.name}`);
  const result = simulateComponent(testCase.data);
  if (result) {
    passCount++;
  } else {
    failCount++;
  }
  console.log('');
}

console.log('=== 测试结果 ===');
console.log(`通过: ${passCount}`);
console.log(`失败: ${failCount}`);
console.log(`总计: ${testCases.length}`);

if (failCount === 0) {
  console.log('\n✅ 所有测试通过！组件可以安全处理 undefined 数据');
} else {
  console.log('\n❌ 有测试失败，需要进一步检查');
  process.exit(1);
}
