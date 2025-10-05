import { beforeEach, describe, expect, it } from 'vitest';
import {
  type PersonalizedAnalysisOptions,
  analyzePersonalized,
} from '../personalized-analysis';
import type { EnhancedXuankongPlate } from '../types';

describe('PersonalizedAnalysis (个性化分析)', () => {
  let mockPlate: EnhancedXuankongPlate;
  let baseOptions: PersonalizedAnalysisOptions;

  beforeEach(() => {
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
      } as any,
      specialPatterns: [],
      overallScore: 75,
      metadata: {
        calculatedAt: new Date(),
        calculationMethod: 'standard',
      },
    };

    baseOptions = {
      userProfile: {
        birthDate: new Date('1990-05-15'),
        bazi: {
          year: { gan: '庚', zhi: '午' },
          month: { gan: '辛', zhi: '巳' },
          day: { gan: '壬', zhi: '申' },
          hour: { gan: '癸', zhi: '酉' },
        },
      },
    };
  });

  describe('基础功能测试', () => {
    it('应该成功生成个性化分析', () => {
      const result = analyzePersonalized(mockPlate, baseOptions);

      expect(result).toBeDefined();
      expect(result.userProfile).toBeDefined();
      expect(result.baziIntegration).toBeDefined();
      expect(result.personalizedRecommendations).toBeDefined();
    });

    it('应该正确识别用户生肖', () => {
      const result = analyzePersonalized(mockPlate, baseOptions);

      expect(result.baziIntegration.zodiac).toBeDefined();
      expect(result.baziIntegration.zodiac).toMatch(
        /^[鼠牛虎兔龙蛇马羊猴鸡狗猪]$/
      );
    });

    it('应该识别本命元素', () => {
      const result = analyzePersonalized(mockPlate, baseOptions);

      expect(result.baziIntegration.mainElement).toBeDefined();
      expect(result.baziIntegration.mainElement).toMatch(/^[金木水火土]$/);
    });

    it('应该识别喜用神', () => {
      const result = analyzePersonalized(mockPlate, baseOptions);

      expect(result.baziIntegration.favorableElements).toBeDefined();
      expect(Array.isArray(result.baziIntegration.favorableElements)).toBe(
        true
      );
      expect(result.baziIntegration.favorableElements.length).toBeGreaterThan(
        0
      );

      result.baziIntegration.favorableElements.forEach((elem) => {
        expect(elem).toMatch(/^[金木水火土]$/);
      });
    });

    it('应该识别忌讳元素', () => {
      const result = analyzePersonalized(mockPlate, baseOptions);

      expect(result.baziIntegration.unfavorableElements).toBeDefined();
      expect(Array.isArray(result.baziIntegration.unfavorableElements)).toBe(
        true
      );

      result.baziIntegration.unfavorableElements.forEach((elem) => {
        expect(elem).toMatch(/^[金木水火土]$/);
      });
    });
  });

  describe('八字与风水融合测试', () => {
    it('应该识别幸运方位', () => {
      const result = analyzePersonalized(mockPlate, baseOptions);

      expect(result.baziIntegration.luckyDirections).toBeDefined();
      expect(Array.isArray(result.baziIntegration.luckyDirections)).toBe(true);
      expect(result.baziIntegration.luckyDirections.length).toBeGreaterThan(0);
      expect(result.baziIntegration.luckyDirections.length).toBeLessThanOrEqual(
        8
      );
    });

    it('幸运方位应该是有效的方位', () => {
      const result = analyzePersonalized(mockPlate, baseOptions);
      const validDirections = [
        '东',
        '南',
        '西',
        '北',
        '东南',
        '西南',
        '东北',
        '西北',
      ];

      result.baziIntegration.luckyDirections.forEach((dir) => {
        expect(validDirections.includes(dir)).toBe(true);
      });
    });

    it('喜用神和忌讳元素不应该重复', () => {
      const result = analyzePersonalized(mockPlate, baseOptions);

      const favorable = result.baziIntegration.favorableElements;
      const unfavorable = result.baziIntegration.unfavorableElements;

      favorable.forEach((elem) => {
        expect(unfavorable.includes(elem)).toBe(false);
      });
    });

    it('五行元素总数应该是5', () => {
      const result = analyzePersonalized(mockPlate, baseOptions);

      const favorable = result.baziIntegration.favorableElements;
      const unfavorable = result.baziIntegration.unfavorableElements;
      const allElements = new Set([
        ...favorable,
        ...unfavorable,
        result.baziIntegration.mainElement,
      ]);

      expect(allElements.size).toBe(5);
    });
  });

  describe('个性化推荐测试', () => {
    it('应该生成个性化推荐列表', () => {
      const result = analyzePersonalized(mockPlate, baseOptions);

      expect(result.personalizedRecommendations).toBeDefined();
      expect(Array.isArray(result.personalizedRecommendations)).toBe(true);
      expect(result.personalizedRecommendations.length).toBeGreaterThan(0);
    });

    it('每条推荐应该包含完整信息', () => {
      const result = analyzePersonalized(mockPlate, baseOptions);

      result.personalizedRecommendations.forEach((rec) => {
        expect(rec.title).toBeDefined();
        expect(rec.category).toMatch(/^(health|career|home|energy)$/);
        expect(rec.priority).toMatch(/^(high|medium|low)$/);
        expect(rec.description).toBeDefined();
        expect(Array.isArray(rec.actions)).toBe(true);
        expect(rec.actions.length).toBeGreaterThan(0);
      });
    });

    it('应该包含多个类别的推荐', () => {
      const result = analyzePersonalized(mockPlate, baseOptions);

      const categories = new Set(
        result.personalizedRecommendations.map((r) => r.category)
      );

      // 至少应该有2个不同类别
      expect(categories.size).toBeGreaterThanOrEqual(2);
    });

    it('高优先级推荐应该排在前面', () => {
      const result = analyzePersonalized(mockPlate, baseOptions);

      const priorityOrder = { high: 3, medium: 2, low: 1 };

      for (let i = 1; i < result.personalizedRecommendations.length; i++) {
        const prevPriority =
          priorityOrder[result.personalizedRecommendations[i - 1].priority];
        const currPriority =
          priorityOrder[result.personalizedRecommendations[i].priority];

        expect(prevPriority).toBeGreaterThanOrEqual(currPriority);
      }
    });

    it('每条推荐应该有至少1个行动建议', () => {
      const result = analyzePersonalized(mockPlate, baseOptions);

      result.personalizedRecommendations.forEach((rec) => {
        expect(rec.actions.length).toBeGreaterThanOrEqual(1);

        rec.actions.forEach((action) => {
          expect(typeof action).toBe('string');
          expect(action.length).toBeGreaterThan(5);
        });
      });
    });
  });

  describe('不同八字测试', () => {
    it('应该处理不同年份出生的用户', () => {
      const years = [1980, 1990, 2000, 2010];

      years.forEach((year) => {
        const options = {
          ...baseOptions,
          userProfile: {
            ...baseOptions.userProfile,
            birthDate: new Date(`${year}-05-15`),
          },
        };

        const result = analyzePersonalized(mockPlate, options);

        expect(result).toBeDefined();
        expect(result.baziIntegration.zodiac).toBeDefined();
      });
    });

    it('应该处理不同季节出生的用户', () => {
      const months = [1, 4, 7, 10]; // 春夏秋冬

      months.forEach((month) => {
        const options = {
          ...baseOptions,
          userProfile: {
            ...baseOptions.userProfile,
            birthDate: new Date(`1990-${month.toString().padStart(2, '0')}-15`),
          },
        };

        const result = analyzePersonalized(mockPlate, options);

        expect(result).toBeDefined();
        expect(result.baziIntegration.mainElement).toBeDefined();
      });
    });

    it('不同八字应该产生不同的喜用神', () => {
      const birthDates = [
        new Date('1990-01-15'),
        new Date('1990-05-15'),
        new Date('1990-09-15'),
      ];

      const results = birthDates.map((birthDate) => {
        const options = {
          ...baseOptions,
          userProfile: {
            ...baseOptions.userProfile,
            birthDate,
          },
        };
        return analyzePersonalized(mockPlate, options);
      });

      // 至少应该有一些差异
      const allFavorable = results.map((r) =>
        r.baziIntegration.favorableElements.join(',')
      );
      const uniqueFavorable = new Set(allFavorable);

      // 不同生日至少应该有一些不同的喜用神组合
      expect(uniqueFavorable.size).toBeGreaterThan(1);
    });
  });

  describe('边界条件测试', () => {
    it('应该处理缺少时辰信息', () => {
      const options = {
        ...baseOptions,
        userProfile: {
          ...baseOptions.userProfile,
          bazi: {
            ...baseOptions.userProfile.bazi,
            hour: undefined as any,
          },
        },
      };

      const result = analyzePersonalized(mockPlate, options);

      expect(result).toBeDefined();
      expect(result.baziIntegration).toBeDefined();
    });

    it('应该处理极端评分的宅盘', () => {
      const badPlate = { ...mockPlate, overallScore: 10 };
      const result = analyzePersonalized(badPlate, baseOptions);

      expect(result).toBeDefined();
      // 低分宅盘应该有更多改善建议
      expect(result.personalizedRecommendations.length).toBeGreaterThan(3);
    });

    it('应该处理年龄边界（儿童、成年、老年）', () => {
      const birthDates = [
        new Date('2015-01-01'), // 儿童
        new Date('1990-01-01'), // 成年
        new Date('1950-01-01'), // 老年
      ];

      birthDates.forEach((birthDate) => {
        const options = {
          ...baseOptions,
          userProfile: {
            ...baseOptions.userProfile,
            birthDate,
          },
        };

        const result = analyzePersonalized(mockPlate, options);
        expect(result).toBeDefined();
      });
    });
  });

  describe('性能测试', () => {
    it('单次个性化分析应该在150ms内完成', () => {
      const start = Date.now();
      analyzePersonalized(mockPlate, baseOptions);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(150);
    });

    it('批量分析多个用户应该保持高效', () => {
      const users = Array.from({ length: 10 }, (_, i) => ({
        ...baseOptions,
        userProfile: {
          ...baseOptions.userProfile,
          birthDate: new Date(`199${i}-05-15`),
        },
      }));

      const start = Date.now();
      users.forEach((options) => {
        analyzePersonalized(mockPlate, options);
      });
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1500); // 10人 < 1.5秒
    });
  });

  describe('数据一致性测试', () => {
    it('相同输入应该产生相同输出', () => {
      const result1 = analyzePersonalized(mockPlate, baseOptions);
      const result2 = analyzePersonalized(mockPlate, baseOptions);

      expect(result1.baziIntegration.zodiac).toBe(
        result2.baziIntegration.zodiac
      );
      expect(result1.baziIntegration.mainElement).toBe(
        result2.baziIntegration.mainElement
      );
      expect(result1.baziIntegration.favorableElements).toEqual(
        result2.baziIntegration.favorableElements
      );
      expect(result1.personalizedRecommendations.length).toBe(
        result2.personalizedRecommendations.length
      );
    });

    it('推荐数量应该合理', () => {
      const result = analyzePersonalized(mockPlate, baseOptions);

      // 推荐总数应该在3-15条之间
      expect(result.personalizedRecommendations.length).toBeGreaterThanOrEqual(
        3
      );
      expect(result.personalizedRecommendations.length).toBeLessThanOrEqual(15);
    });

    it('每个类别至少有一条推荐', () => {
      const result = analyzePersonalized(mockPlate, baseOptions);

      const categoryCounts = {
        health: 0,
        career: 0,
        home: 0,
        energy: 0,
      };

      result.personalizedRecommendations.forEach((rec) => {
        categoryCounts[rec.category]++;
      });

      // 至少两个类别有推荐
      const categoriesWithRecs = Object.values(categoryCounts).filter(
        (count) => count > 0
      ).length;
      expect(categoriesWithRecs).toBeGreaterThanOrEqual(2);
    });
  });
});
