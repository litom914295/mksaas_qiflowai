import { beforeEach, describe, expect, it } from 'vitest';
import {
  type LiunianAnalysisOptions,
  analyzeLiunian,
} from '../adapters/v6-adapter';
import type { EnhancedXuankongPlate } from '../types';

describe('LiunianAnalysis (流年分析)', () => {
  let mockPlate: EnhancedXuankongPlate;
  let baseOptions: LiunianAnalysisOptions;

  beforeEach(() => {
    // 模拟增强飞星盘数据
    mockPlate = {
      period: 9,
      facing: {
        degrees: 180,
        direction: '坐北向南',
        palace: '离',
      },
      palaces: {
        中: {
          palace: '中',
          mountainStar: 5,
          facingStar: 5,
          timeStar: 9,
          fortuneRating: '平',
          score: 60,
        },
        乾: {
          palace: '乾',
          mountainStar: 6,
          facingStar: 1,
          timeStar: 4,
          fortuneRating: '吉',
          score: 75,
        },
        兑: {
          palace: '兑',
          mountainStar: 2,
          facingStar: 6,
          timeStar: 8,
          fortuneRating: '次吉',
          score: 70,
        },
        // ... 其他宫位
      } as any,
      specialPatterns: [],
      overallScore: 75,
      metadata: {
        calculatedAt: new Date(),
        calculationMethod: 'standard',
      },
    };

    baseOptions = {
      year: 2024,
      includeMonthly: true,
    };
  });

  describe('基础功能测试', () => {
    it('应该成功生成流年分析', () => {
      const result = analyzeLiunian(mockPlate, baseOptions);

      expect(result).toBeDefined();
      expect(result.currentYear).toBeDefined();
      expect(result.currentYear.year).toBe(2024);
      expect(result.yearlyFortune).toBeDefined();
      expect(result.yearlyFortune.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.yearlyFortune.overallScore).toBeLessThanOrEqual(100);
    });

    it('应该包含当前年份的基本信息', () => {
      const result = analyzeLiunian(mockPlate, baseOptions);

      expect(result.currentYear.yearStar).toBeDefined();
      expect(result.currentYear.yearStar).toBeGreaterThanOrEqual(1);
      expect(result.currentYear.yearStar).toBeLessThanOrEqual(9);
      expect(result.currentYear.ganZhi).toBeDefined();
      expect(result.currentYear.ganZhi).toMatch(
        /[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]/
      );
    });

    it('应该生成年度运势特征描述', () => {
      const result = analyzeLiunian(mockPlate, baseOptions);

      expect(result.yearlyFortune.characteristics).toBeDefined();
      expect(typeof result.yearlyFortune.characteristics).toBe('string');
      expect(result.yearlyFortune.characteristics.length).toBeGreaterThan(10);
    });

    it('应该识别有利和不利方面', () => {
      const result = analyzeLiunian(mockPlate, baseOptions);

      expect(result.yearlyFortune.favorableAspects).toBeDefined();
      expect(Array.isArray(result.yearlyFortune.favorableAspects)).toBe(true);
      expect(result.yearlyFortune.favorableAspects.length).toBeGreaterThan(0);

      expect(result.yearlyFortune.unfavorableAspects).toBeDefined();
      expect(Array.isArray(result.yearlyFortune.unfavorableAspects)).toBe(true);
    });
  });

  describe('月度分析测试', () => {
    it('包含月度分析时应该返回12个月的数据', () => {
      const result = analyzeLiunian(mockPlate, {
        ...baseOptions,
        includeMonthly: true,
      });

      expect(result.monthlyTrends).toBeDefined();
      expect(result.monthlyTrends.length).toBe(12);
    });

    it('每个月度数据应该包含完整信息', () => {
      const result = analyzeLiunian(mockPlate, {
        ...baseOptions,
        includeMonthly: true,
      });

      result.monthlyTrends.forEach((month, idx) => {
        expect(month.month).toBe(idx + 1);
        expect(month.score).toBeGreaterThanOrEqual(0);
        expect(month.score).toBeLessThanOrEqual(100);
        expect(month.trend).toMatch(/^(improving|declining|stable)$/);
        expect(Array.isArray(month.mainInfluences)).toBe(true);
      });
    });

    it('不包含月度分析时应该返回空数组', () => {
      const result = analyzeLiunian(mockPlate, {
        ...baseOptions,
        includeMonthly: false,
      });

      expect(result.monthlyTrends).toBeDefined();
      expect(result.monthlyTrends.length).toBe(0);
    });

    it('月度评分应该有合理的变化范围', () => {
      const result = analyzeLiunian(mockPlate, {
        ...baseOptions,
        includeMonthly: true,
      });

      const scores = result.monthlyTrends.map((m) => m.score);
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const maxScore = Math.max(...scores);
      const minScore = Math.min(...scores);

      // 最大最小值差异应该合理（不超过50分）
      expect(maxScore - minScore).toBeLessThanOrEqual(50);
      // 平均分应该接近年度总分（误差不超过20分）
      expect(
        Math.abs(avgScore - result.yearlyFortune.overallScore)
      ).toBeLessThanOrEqual(20);
    });
  });

  describe('关键时间节点测试', () => {
    it('应该识别出关键时间节点', () => {
      const result = analyzeLiunian(mockPlate, baseOptions);

      expect(result.criticalPeriods).toBeDefined();
      expect(Array.isArray(result.criticalPeriods)).toBe(true);
      expect(result.criticalPeriods.length).toBeGreaterThan(0);
    });

    it('每个关键时间节点应该包含完整信息', () => {
      const result = analyzeLiunian(mockPlate, baseOptions);

      result.criticalPeriods.forEach((period) => {
        expect(period.period).toBeDefined();
        expect(period.type).toMatch(/^(favorable|unfavorable|neutral)$/);
        expect(period.description).toBeDefined();
        expect(period.suggestions).toBeDefined();
        expect(period.importance).toBeGreaterThanOrEqual(1);
        expect(period.importance).toBeLessThanOrEqual(10);
      });
    });

    it('应该按重要性排序关键时间节点', () => {
      const result = analyzeLiunian(mockPlate, baseOptions);

      for (let i = 1; i < result.criticalPeriods.length; i++) {
        expect(result.criticalPeriods[i - 1].importance).toBeGreaterThanOrEqual(
          result.criticalPeriods[i].importance
        );
      }
    });
  });

  describe('年度建议测试', () => {
    it('应该生成年度建议列表', () => {
      const result = analyzeLiunian(mockPlate, baseOptions);

      expect(result.yearlyFortune.yearlyRecommendations).toBeDefined();
      expect(Array.isArray(result.yearlyFortune.yearlyRecommendations)).toBe(
        true
      );
      expect(result.yearlyFortune.yearlyRecommendations.length).toBeGreaterThan(
        0
      );
    });

    it('每条建议应该有实质性内容', () => {
      const result = analyzeLiunian(mockPlate, baseOptions);

      result.yearlyFortune.yearlyRecommendations.forEach((rec) => {
        expect(typeof rec).toBe('string');
        expect(rec.length).toBeGreaterThan(10);
      });
    });
  });

  describe('边界条件测试', () => {
    it('应该处理历史年份', () => {
      const result = analyzeLiunian(mockPlate, { ...baseOptions, year: 2000 });

      expect(result.currentYear.year).toBe(2000);
      expect(result.currentYear.ganZhi).toBeDefined();
    });

    it('应该处理未来年份', () => {
      const result = analyzeLiunian(mockPlate, { ...baseOptions, year: 2050 });

      expect(result.currentYear.year).toBe(2050);
      expect(result.yearlyFortune).toBeDefined();
    });

    it('应该处理极端评分的宅盘', () => {
      const badPlate = { ...mockPlate, overallScore: 10 };
      const result = analyzeLiunian(badPlate, baseOptions);

      expect(result.yearlyFortune.overallScore).toBeLessThan(50);
      expect(result.yearlyFortune.unfavorableAspects.length).toBeGreaterThan(
        result.yearlyFortune.favorableAspects.length
      );
    });

    it('应该处理不同运期的宅盘', () => {
      const periods = [7, 8, 9];

      periods.forEach((period) => {
        const testPlate = { ...mockPlate, period };
        const result = analyzeLiunian(testPlate, baseOptions);

        expect(result).toBeDefined();
        expect(result.yearlyFortune.overallScore).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('运势趋势测试', () => {
    it('应该正确判断运势趋势', () => {
      const result = analyzeLiunian(mockPlate, baseOptions);

      expect(result.yearlyFortune.trend).toMatch(
        /^(improving|declining|stable)$/
      );
    });

    it('高分宅盘倾向于improving或stable', () => {
      const goodPlate = { ...mockPlate, overallScore: 90 };
      const result = analyzeLiunian(goodPlate, baseOptions);

      expect(['improving', 'stable'].includes(result.yearlyFortune.trend)).toBe(
        true
      );
    });

    it('低分宅盘可能显示declining', () => {
      const badPlate = { ...mockPlate, overallScore: 20 };
      const result = analyzeLiunian(badPlate, baseOptions);

      // 低分宅盘可能是declining，但不绝对
      expect(result.yearlyFortune.trend).toBeDefined();
    });
  });

  describe('性能测试', () => {
    it('基础分析应该在100ms内完成', () => {
      const start = Date.now();
      analyzeLiunian(mockPlate, { ...baseOptions, includeMonthly: false });
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it('包含月度分析应该在200ms内完成', () => {
      const start = Date.now();
      analyzeLiunian(mockPlate, { ...baseOptions, includeMonthly: true });
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(200);
    });

    it('批量分析多年应该保持高效', () => {
      const years = [2020, 2021, 2022, 2023, 2024];

      const start = Date.now();
      years.forEach((year) => {
        analyzeLiunian(mockPlate, { ...baseOptions, year });
      });
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500); // 5年分析 < 500ms
    });
  });

  describe('数据一致性测试', () => {
    it('相同输入应该产生相同输出', () => {
      const result1 = analyzeLiunian(mockPlate, baseOptions);
      const result2 = analyzeLiunian(mockPlate, baseOptions);

      expect(result1.currentYear).toEqual(result2.currentYear);
      expect(result1.yearlyFortune.overallScore).toBe(
        result2.yearlyFortune.overallScore
      );
      expect(result1.monthlyTrends.length).toBe(result2.monthlyTrends.length);
    });

    it('年度评分应该与月度平均评分相关', () => {
      const result = analyzeLiunian(mockPlate, {
        ...baseOptions,
        includeMonthly: true,
      });

      const monthlyAvg =
        result.monthlyTrends.reduce((sum, m) => sum + m.score, 0) / 12;
      const yearlyScore = result.yearlyFortune.overallScore;

      // 两者应该相对接近（允许15%的偏差）
      const deviation = Math.abs(monthlyAvg - yearlyScore) / yearlyScore;
      expect(deviation).toBeLessThan(0.15);
    });

    it('有利和不利方面数量应该平衡', () => {
      const result = analyzeLiunian(mockPlate, baseOptions);

      const favorableCount = result.yearlyFortune.favorableAspects.length;
      const unfavorableCount = result.yearlyFortune.unfavorableAspects.length;
      const total = favorableCount + unfavorableCount;

      // 总数应该合理（3-10条）
      expect(total).toBeGreaterThanOrEqual(3);
      expect(total).toBeLessThanOrEqual(10);

      // 应该至少有一方面的内容
      expect(favorableCount > 0 || unfavorableCount > 0).toBe(true);
    });
  });
});
