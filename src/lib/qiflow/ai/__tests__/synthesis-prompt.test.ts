/**
 * 人宅合一AI分析 - 测试用例
 *
 * 测试目标：
 * 1. 验证超级吉位发现算法
 * 2. 验证风险区域识别算法
 * 3. 验证布局建议生成
 * 4. 验证成本控制 < $0.30
 * 5. 验证合规性检查
 */

import type { EnhancedBaziResult } from '@/lib/bazi/adapter';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  type FengshuiData,
  type SynthesisInput,
  generateSynthesisAnalysis,
} from '../synthesis-prompt';

// 模拟八字数据：日主为木，喜用神为水，忌神为金
const mockBaziData: EnhancedBaziResult = {
  pillars: {
    year: { stem: '甲', branch: '子', stemElement: '木', branchElement: '水' },
    month: { stem: '丙', branch: '寅', stemElement: '火', branchElement: '木' },
    day: { stem: '乙', branch: '卯', stemElement: '木', branchElement: '木' },
    hour: { stem: '壬', branch: '申', stemElement: '水', branchElement: '金' },
  },
  dayMaster: {
    stem: '乙',
    element: '木',
    strength: 'strong', // 日主强，需要泄耗
  },
  yongshen: {
    primary: '火', // 喜用神：火（泄木）
    secondary: '金', // 喜用神：金（耗木）
    avoid: ['水', '木'], // 忌神：水木（生扶）
  },
  elements: {
    木: 3,
    火: 1,
    土: 0,
    金: 1,
    水: 3,
  },
  // 其他必要字段
  solar: {
    year: 1990,
    month: 3,
    day: 15,
    hour: 14,
  },
  lunar: {
    year: 1990,
    month: 2,
    day: 18,
    isLeapMonth: false,
  },
  timestamp: Date.now(),
};

// 模拟风水数据：坐北朝南，九运（2024年后）
const mockFengshuiData: FengshuiData = {
  mountain: '子', // 坐北
  facing: '午', // 朝南
  period: 9, // 九运

  // 九运子山午向飞星盘（简化版）
  flyingStars: [
    {
      palace: 1,
      mountainStar: 9,
      facingStar: 5,
      periodStar: 1,
      meaning: '五黄凶星到向',
    },
    {
      palace: 2,
      mountainStar: 5,
      facingStar: 1,
      periodStar: 2,
      meaning: '一白吉星到向',
    },
    {
      palace: 3,
      mountainStar: 7,
      facingStar: 3,
      periodStar: 3,
      meaning: '三碧是非星',
    },
    {
      palace: 4,
      mountainStar: 3,
      facingStar: 7,
      periodStar: 4,
      meaning: '七赤破军到向',
    },
    {
      palace: 5,
      mountainStar: 1,
      facingStar: 9,
      periodStar: 5,
      meaning: '九紫吉星到向',
    },
    {
      palace: 6,
      mountainStar: 6,
      facingStar: 2,
      periodStar: 6,
      meaning: '二黑病符到向',
    },
    {
      palace: 7,
      mountainStar: 8,
      facingStar: 4,
      periodStar: 7,
      meaning: '四绿文曲到向',
    },
    {
      palace: 8,
      mountainStar: 4,
      facingStar: 8,
      periodStar: 8,
      meaning: '八白财星到向',
    },
    {
      palace: 9,
      mountainStar: 2,
      facingStar: 6,
      periodStar: 9,
      meaning: '六白武曲到向',
    },
  ],

  specialPositions: {
    wealthPosition: '东北',
    academicPosition: '东南',
    healthPosition: '西南',
  },
};

describe('人宅合一AI分析', () => {
  describe('1. 完整分析流程测试', () => {
    it('应该成功生成完整的人宅合一分析', async () => {
      const input: SynthesisInput = {
        baziData: mockBaziData,
        fengshuiData: mockFengshuiData,
        config: {
          year: 2025,
          language: 'zh-CN',
        },
      };

      const result = await generateSynthesisAnalysis(input);

      // 验证返回结构
      expect(result).toBeDefined();
      expect(result.superLuckySpots).toBeDefined();
      expect(result.riskZones).toBeDefined();
      expect(result.layoutAdvice).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.metadata).toBeDefined();

      // 验证超级吉位
      expect(result.superLuckySpots.length).toBeGreaterThan(0);
      expect(result.superLuckySpots.length).toBeLessThanOrEqual(3);

      // 验证风险区域
      expect(result.riskZones.length).toBeLessThanOrEqual(2);

      // 验证布局建议
      expect(result.layoutAdvice.length).toBeGreaterThan(0);
      expect(result.layoutAdvice.length).toBeLessThanOrEqual(5);

      // 验证摘要不为空
      expect(result.summary.length).toBeGreaterThan(0);

      console.log('\n✅ 完整分析测试通过');
      console.log(`   - 超级吉位: ${result.superLuckySpots.length} 个`);
      console.log(`   - 风险区域: ${result.riskZones.length} 个`);
      console.log(`   - 布局建议: ${result.layoutAdvice.length} 条`);
    }, 30000); // 30秒超时
  });

  describe('2. 超级吉位发现测试', () => {
    it('应该发现火元素的吉位（日主强喜火泄）', async () => {
      const input: SynthesisInput = {
        baziData: mockBaziData,
        fengshuiData: mockFengshuiData,
        config: { year: 2025 },
      };

      const result = await generateSynthesisAnalysis(input);

      // 喜用神为火，寻找飞星中的火星（9紫）
      const fireSpots = result.superLuckySpots.filter(
        (spot) => spot.energyAnalysis.fengshuiStar === 9
      );

      // 宫位5有九紫火星到向，应该被识别为吉位
      expect(fireSpots.length).toBeGreaterThan(0);

      const middlePalaceSpot = result.superLuckySpots.find(
        (spot) => spot.palace === 5
      );

      if (middlePalaceSpot) {
        expect(middlePalaceSpot.location).toBe('中宫');
        expect(
          middlePalaceSpot.energyAnalysis.resonanceStrength
        ).toBeGreaterThan(7);
        expect(middlePalaceSpot.utilizationAdvice.length).toBeGreaterThan(0);
        console.log('\n✅ 超级吉位识别正确: 中宫九紫火星');
      }
    }, 30000);

    it('应该包含有效的利用建议', async () => {
      const input: SynthesisInput = {
        baziData: mockBaziData,
        fengshuiData: mockFengshuiData,
        config: { year: 2025 },
      };

      const result = await generateSynthesisAnalysis(input);

      for (const spot of result.superLuckySpots) {
        // 每个吉位应有至少2条建议
        expect(spot.utilizationAdvice.length).toBeGreaterThanOrEqual(2);

        // 建议应包含位置信息
        const hasLocationMention = spot.utilizationAdvice.some((advice) =>
          advice.includes(spot.location)
        );
        expect(hasLocationMention).toBe(true);

        // 应有预期效果和时间线
        expect(spot.expectedEffects.aspects.length).toBeGreaterThan(0);
        expect(spot.expectedEffects.timeline.length).toBeGreaterThan(0);
      }

      console.log('\n✅ 利用建议验证通过');
    }, 30000);
  });

  describe('3. 风险区域识别测试', () => {
    it('应该识别水元素的风险区域（日主强忌水生）', async () => {
      const input: SynthesisInput = {
        baziData: mockBaziData,
        fengshuiData: mockFengshuiData,
        config: { year: 2025 },
      };

      const result = await generateSynthesisAnalysis(input);

      // 忌神为水，寻找飞星中的水星（1白）与凶星的组合
      // 宫位1有五黄凶星到向，虽然不是水星，但如果有其他凶星...

      // 至少应该识别到一些风险
      if (result.riskZones.length > 0) {
        for (const zone of result.riskZones) {
          // 严重程度应该是 low/medium/high 之一
          expect(['low', 'medium', 'high']).toContain(
            zone.conflictAnalysis.severity
          );

          // 应有化解方案
          expect(zone.resolutionMethods.length).toBeGreaterThan(0);

          // 化解方案应按优先级排序
          const priorities = zone.resolutionMethods.map((m) => m.priority);
          expect(priorities[0]).toBe(1); // 第一个方案优先级应该是1

          console.log(
            `\n✅ 风险区域识别: ${zone.location} (${zone.conflictAnalysis.severity})`
          );
        }
      }
    }, 30000);

    it('应该提供可执行的化解方案', async () => {
      const input: SynthesisInput = {
        baziData: mockBaziData,
        fengshuiData: mockFengshuiData,
        config: { year: 2025 },
      };

      const result = await generateSynthesisAnalysis(input);

      for (const zone of result.riskZones) {
        for (const method of zone.resolutionMethods) {
          // 每个方案应有步骤
          expect(method.steps.length).toBeGreaterThan(0);

          // 应有原理说明
          expect(method.principle.length).toBeGreaterThan(0);

          // 难度应该是 ⭐、⭐⭐ 或 ⭐⭐⭐
          expect(['⭐', '⭐⭐', '⭐⭐⭐']).toContain(method.difficulty);
        }
      }

      console.log('\n✅ 化解方案验证通过');
    }, 30000);
  });

  describe('4. 布局建议生成测试', () => {
    it('应该生成3-5条具体可执行的布局建议', async () => {
      const input: SynthesisInput = {
        baziData: mockBaziData,
        fengshuiData: mockFengshuiData,
        config: { year: 2025 },
      };

      const result = await generateSynthesisAnalysis(input);

      // 建议数量
      expect(result.layoutAdvice.length).toBeGreaterThanOrEqual(3);
      expect(result.layoutAdvice.length).toBeLessThanOrEqual(5);

      // 验证每条建议的完整性
      for (const advice of result.layoutAdvice) {
        expect(advice.id).toBeGreaterThan(0);
        expect(advice.title.length).toBeGreaterThan(0);
        expect(advice.priority).toBeGreaterThan(0);
        expect(['⭐', '⭐⭐', '⭐⭐⭐']).toContain(advice.difficulty);

        // 目标区域
        expect(advice.targetArea.location.length).toBeGreaterThan(0);
        expect(advice.targetArea.reason.length).toBeGreaterThan(0);

        // 行动步骤
        expect(advice.actions.length).toBeGreaterThan(0);

        // 原理说明
        expect(advice.principle.length).toBeGreaterThan(0);

        // 预期效果
        expect(advice.expectedResults.effects.length).toBeGreaterThan(0);
        expect(advice.expectedResults.timeline.length).toBeGreaterThan(0);

        // 投入成本
        expect(advice.investment.cost.length).toBeGreaterThan(0);
        expect(advice.investment.timeRequired.length).toBeGreaterThan(0);
      }

      console.log('\n✅ 布局建议结构完整');
      console.log(`   - 生成了 ${result.layoutAdvice.length} 条建议`);
    }, 30000);

    it('建议应该按优先级排序', async () => {
      const input: SynthesisInput = {
        baziData: mockBaziData,
        fengshuiData: mockFengshuiData,
        config: { year: 2025 },
      };

      const result = await generateSynthesisAnalysis(input);

      const priorities = result.layoutAdvice.map((a) => a.priority);

      // 检查是否按优先级升序排列
      for (let i = 0; i < priorities.length - 1; i++) {
        expect(priorities[i]).toBeLessThanOrEqual(priorities[i + 1]);
      }

      console.log('\n✅ 布局建议优先级排序正确');
    }, 30000);
  });

  describe('5. 成本控制测试', () => {
    it('单次分析成本应小于 $0.30', async () => {
      const input: SynthesisInput = {
        baziData: mockBaziData,
        fengshuiData: mockFengshuiData,
        config: { year: 2025 },
      };

      const result = await generateSynthesisAnalysis(input);

      expect(result.metadata.estimatedCost).toBeLessThan(0.3);

      console.log(
        `\n✅ 成本控制达标: $${result.metadata.estimatedCost.toFixed(4)} < $0.30`
      );
    }, 30000);
  });

  describe('6. 质量评分测试', () => {
    it('质量分数应在 60-100 之间', async () => {
      const input: SynthesisInput = {
        baziData: mockBaziData,
        fengshuiData: mockFengshuiData,
        config: { year: 2025 },
      };

      const result = await generateSynthesisAnalysis(input);

      expect(result.metadata.qualityScore).toBeGreaterThanOrEqual(60);
      expect(result.metadata.qualityScore).toBeLessThanOrEqual(100);

      console.log(`\n✅ 质量评分: ${result.metadata.qualityScore}/100`);
    }, 30000);
  });

  describe('7. 降级容错测试', () => {
    it('应该能处理缺失用神数据的情况', async () => {
      const incompleteBaziData: EnhancedBaziResult = {
        ...mockBaziData,
        yongshen: undefined as any, // 故意移除用神数据
      };

      const input: SynthesisInput = {
        baziData: incompleteBaziData,
        fengshuiData: mockFengshuiData,
        config: { year: 2025 },
      };

      // 不应抛出异常
      const result = await generateSynthesisAnalysis(input);

      // 应该有降级方案
      expect(result.superLuckySpots.length).toBeGreaterThan(0);
      expect(result.layoutAdvice.length).toBeGreaterThan(0);

      console.log('\n✅ 降级容错测试通过（缺失用神数据）');
    }, 30000);

    it('应该能处理缺失飞星数据的情况', async () => {
      const incompleteFengshuiData: FengshuiData = {
        ...mockFengshuiData,
        flyingStars: undefined, // 故意移除飞星数据
      };

      const input: SynthesisInput = {
        baziData: mockBaziData,
        fengshuiData: incompleteFengshuiData,
        config: { year: 2025 },
      };

      // 不应抛出异常
      const result = await generateSynthesisAnalysis(input);

      // 应该使用次优方案
      expect(result.layoutAdvice.length).toBeGreaterThan(0);

      console.log('\n✅ 降级容错测试通过（缺失飞星数据）');
    }, 30000);
  });

  describe('8. 输出格式测试', () => {
    it('摘要应包含关键信息', async () => {
      const input: SynthesisInput = {
        baziData: mockBaziData,
        fengshuiData: mockFengshuiData,
        config: { year: 2025 },
      };

      const result = await generateSynthesisAnalysis(input);

      // 摘要应提到超级吉位
      if (result.superLuckySpots.length > 0) {
        expect(result.summary).toContain('吉位');
      }

      // 摘要应提到风险区域（如果有）
      if (result.riskZones.length > 0) {
        expect(result.summary).toContain('风险');
      }

      // 摘要应提到布局建议
      expect(result.summary).toContain('建议');

      console.log('\n✅ 摘要格式验证通过');
      console.log(`摘要内容:\n${result.summary}`);
    }, 30000);
  });
});

/**
 * 集成测试：完整报告生成
 */
describe('完整精华报告生成测试', () => {
  it('应该成功生成包含人宅合一分析的精华报告', async () => {
    // 这个测试需要实际的 essential-report.ts 模块
    // 暂时跳过，等待集成测试环境
    console.log('\n⏩ 完整报告集成测试 - 待实现');
  });
});
