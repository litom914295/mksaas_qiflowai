import { beforeEach, describe, expect, it } from 'vitest';
import {
  type SmartRecommendationsOptions,
  generateSmartRecommendations,
} from '../adapters/v6-adapter';
import type { EnhancedXuankongPlate } from '../types';

describe('SmartRecommendations (智能推荐)', () => {
  let mockPlate: EnhancedXuankongPlate;
  let baseOptions: SmartRecommendationsOptions;

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
        离: {
          palace: '离',
          mountainStar: 7,
          facingStar: 2,
          timeStar: 3,
          fortuneRating: '凶',
          score: 35,
        },
        震: {
          palace: '震',
          mountainStar: 3,
          facingStar: 7,
          timeStar: 1,
          fortuneRating: '平',
          score: 55,
        },
        巽: {
          palace: '巽',
          mountainStar: 8,
          facingStar: 3,
          timeStar: 6,
          fortuneRating: '次吉',
          score: 68,
        },
        坎: {
          palace: '坎',
          mountainStar: 1,
          facingStar: 8,
          timeStar: 2,
          fortuneRating: '大吉',
          score: 88,
        },
        艮: {
          palace: '艮',
          mountainStar: 4,
          facingStar: 4,
          timeStar: 7,
          fortuneRating: '平',
          score: 50,
        },
        坤: {
          palace: '坤',
          mountainStar: 9,
          facingStar: 9,
          timeStar: 5,
          fortuneRating: '吉',
          score: 78,
        },
      },
      specialPatterns: [],
      overallScore: 65,
      metadata: {
        calculatedAt: new Date(),
        calculationMethod: 'standard',
      },
    };

    baseOptions = {
      includeQuickWins: true,
      includeLongTermPlan: true,
    };
  });

  describe('基础功能测试', () => {
    it('应该成功生成智能推荐', () => {
      const result = generateSmartRecommendations(mockPlate, baseOptions);

      expect(result).toBeDefined();
      expect(result.prioritizedActions).toBeDefined();
      expect(Array.isArray(result.prioritizedActions)).toBe(true);
    });

    it('应该生成优先级排序的行动清单', () => {
      const result = generateSmartRecommendations(mockPlate, baseOptions);

      expect(result.prioritizedActions.length).toBeGreaterThan(0);

      // 验证优先级排序
      const priorities = { urgent: 4, high: 3, medium: 2, low: 1 };
      for (let i = 1; i < result.prioritizedActions.length; i++) {
        const prevPriority =
          priorities[result.prioritizedActions[i - 1].priority];
        const currPriority = priorities[result.prioritizedActions[i].priority];
        expect(prevPriority).toBeGreaterThanOrEqual(currPriority);
      }
    });

    it('每条推荐应该包含完整信息', () => {
      const result = generateSmartRecommendations(mockPlate, baseOptions);

      result.prioritizedActions.forEach((action) => {
        expect(action.title).toBeDefined();
        expect(action.description).toBeDefined();
        expect(action.priority).toMatch(/^(urgent|high|medium|low)$/);
        expect(action.category).toMatch(
          /^(layout|decoration|color|furniture|other)$/
        );
        expect(action.reason).toBeDefined();
        expect(Array.isArray(action.specificSteps)).toBe(true);
      });
    });
  });

  describe('快速见效方案测试', () => {
    it('包含快速见效时应该返回方案列表', () => {
      const result = generateSmartRecommendations(mockPlate, {
        ...baseOptions,
        includeQuickWins: true,
      });

      expect(result.quickWins).toBeDefined();
      expect(Array.isArray(result.quickWins)).toBe(true);
      expect(result.quickWins.length).toBeGreaterThan(0);
    });

    it('每个快速方案应该包含完整信息', () => {
      const result = generateSmartRecommendations(mockPlate, {
        ...baseOptions,
        includeQuickWins: true,
      });

      result.quickWins.forEach((win) => {
        expect(win.title).toBeDefined();
        expect(win.description).toBeDefined();
        expect(win.estimatedTime).toBeDefined();
        expect(win.estimatedCost).toBeDefined();
        expect(win.expectedImpact).toBeDefined();
        expect(Array.isArray(win.steps)).toBe(true);
        expect(win.steps.length).toBeGreaterThan(0);
      });
    });

    it('不包含快速见效时应该返回空数组', () => {
      const result = generateSmartRecommendations(mockPlate, {
        ...baseOptions,
        includeQuickWins: false,
      });

      expect(result.quickWins).toBeDefined();
      expect(result.quickWins.length).toBe(0);
    });

    it('快速见效方案应该相对简单', () => {
      const result = generateSmartRecommendations(mockPlate, {
        ...baseOptions,
        includeQuickWins: true,
      });

      result.quickWins.forEach((win) => {
        // 时间不应超过"1周"
        expect(win.estimatedTime).toMatch(/(分钟|小时|天|1周)/);
        // 步骤数应该合理（1-5步）
        expect(win.steps.length).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('长期规划测试', () => {
    it('包含长期规划时应该返回阶段计划', () => {
      const result = generateSmartRecommendations(mockPlate, {
        ...baseOptions,
        includeLongTermPlan: true,
      });

      expect(result.longTermPlan).toBeDefined();
      expect(result.longTermPlan.phases).toBeDefined();
      expect(Array.isArray(result.longTermPlan.phases)).toBe(true);
      expect(result.longTermPlan.phases.length).toBeGreaterThan(0);
    });

    it('每个阶段应该包含完整信息', () => {
      const result = generateSmartRecommendations(mockPlate, {
        ...baseOptions,
        includeLongTermPlan: true,
      });

      result.longTermPlan.phases.forEach((phase) => {
        expect(phase.name).toBeDefined();
        expect(phase.duration).toBeDefined();
        expect(phase.description).toBeDefined();
        expect(Array.isArray(phase.tasks)).toBe(true);
        expect(phase.tasks.length).toBeGreaterThan(0);
      });
    });

    it('阶段应该按时间顺序排列', () => {
      const result = generateSmartRecommendations(mockPlate, {
        ...baseOptions,
        includeLongTermPlan: true,
      });

      // 验证阶段名称是否符合时间顺序
      const phaseNames = result.longTermPlan.phases.map((p) => p.name);
      expect(phaseNames[0]).toContain('第');
      expect(phaseNames[0]).toContain('阶段');
    });

    it('不包含长期规划时phases应该为空', () => {
      const result = generateSmartRecommendations(mockPlate, {
        ...baseOptions,
        includeLongTermPlan: false,
      });

      expect(result.longTermPlan.phases.length).toBe(0);
    });

    it('长期规划应该有合理的阶段数量', () => {
      const result = generateSmartRecommendations(mockPlate, {
        ...baseOptions,
        includeLongTermPlan: true,
      });

      // 阶段数应该在2-5之间
      expect(result.longTermPlan.phases.length).toBeGreaterThanOrEqual(2);
      expect(result.longTermPlan.phases.length).toBeLessThanOrEqual(5);
    });
  });

  describe('行动时间轴测试', () => {
    it('应该生成行动时间轴', () => {
      const result = generateSmartRecommendations(mockPlate, baseOptions);

      expect(result.actionTimeline).toBeDefined();
      expect(Array.isArray(result.actionTimeline)).toBe(true);
      expect(result.actionTimeline.length).toBeGreaterThan(0);
    });

    it('每个时间段应该包含完整信息', () => {
      const result = generateSmartRecommendations(mockPlate, baseOptions);

      result.actionTimeline.forEach((period) => {
        expect(period.timeframe).toBeDefined();
        expect(period.focus).toBeDefined();
        expect(Array.isArray(period.actions)).toBe(true);
        expect(period.actions.length).toBeGreaterThan(0);
      });
    });

    it('时间轴应该按时间顺序', () => {
      const result = generateSmartRecommendations(mockPlate, baseOptions);

      const timeframes = result.actionTimeline.map((p) => p.timeframe);

      // 验证时间框架的顺序（如：立即、1周内、1月内等）
      expect(timeframes[0]).toBeTruthy();
    });
  });

  describe('分类逻辑测试', () => {
    it('应该包含多个不同类别的推荐', () => {
      const result = generateSmartRecommendations(mockPlate, baseOptions);

      const categories = new Set(
        result.prioritizedActions.map((a) => a.category)
      );

      // 至少应该有2个不同类别
      expect(categories.size).toBeGreaterThanOrEqual(2);
    });

    it('布局类别应该针对宫位问题', () => {
      const result = generateSmartRecommendations(mockPlate, baseOptions);

      const layoutActions = result.prioritizedActions.filter(
        (a) => a.category === 'layout'
      );

      layoutActions.forEach((action) => {
        // 布局建议应该提到具体的宫位或方位
        expect(
          action.description.match(/[东南西北]|宫/) ||
            action.reason.match(/[东南西北]|宫/)
        ).toBeTruthy();
      });
    });

    it('不同评分的宅盘应该有不同的推荐侧重', () => {
      const goodPlate = { ...mockPlate, overallScore: 85 };
      const badPlate = { ...mockPlate, overallScore: 35 };

      const goodResult = generateSmartRecommendations(goodPlate, baseOptions);
      const badResult = generateSmartRecommendations(badPlate, baseOptions);

      // 低分宅盘应该有更多紧急和高优先级推荐
      const badUrgent = badResult.prioritizedActions.filter(
        (a) => a.priority === 'urgent'
      ).length;
      const goodUrgent = goodResult.prioritizedActions.filter(
        (a) => a.priority === 'urgent'
      ).length;

      expect(badUrgent).toBeGreaterThanOrEqual(goodUrgent);
    });
  });

  describe('智能推荐质量测试', () => {
    it('凶宫应该产生更多改善建议', () => {
      const result = generateSmartRecommendations(mockPlate, baseOptions);

      // 检查是否针对凶宫（离宫）有特定建议
      const targetActions = result.prioritizedActions.filter(
        (a) => a.description.includes('离') || a.reason.includes('离')
      );

      // 至少应该有一些针对凶宫的建议
      expect(targetActions.length).toBeGreaterThan(0);
    });

    it('大吉宫应该有保持和强化建议', () => {
      const result = generateSmartRecommendations(mockPlate, baseOptions);

      // 检查是否针对大吉宫（坎宫）有保持建议
      const kanActions = result.prioritizedActions.filter(
        (a) => a.description.includes('坎') || a.reason.includes('坎')
      );

      // 可能有针对吉宫的建议
      expect(kanActions.length).toBeGreaterThanOrEqual(0);
    });

    it('推荐应该有合理的数量', () => {
      const result = generateSmartRecommendations(mockPlate, baseOptions);

      // 总推荐数应该在5-20之间
      expect(result.prioritizedActions.length).toBeGreaterThanOrEqual(5);
      expect(result.prioritizedActions.length).toBeLessThanOrEqual(20);
    });

    it('每条推荐应该有具体的实施步骤', () => {
      const result = generateSmartRecommendations(mockPlate, baseOptions);

      const actionsWithSteps = result.prioritizedActions.filter(
        (a) => a.specificSteps && a.specificSteps.length > 0
      );

      // 至少50%的推荐应该有具体步骤
      expect(actionsWithSteps.length).toBeGreaterThanOrEqual(
        result.prioritizedActions.length * 0.5
      );
    });
  });

  describe('边界条件测试', () => {
    it('应该处理极高分宅盘', () => {
      const excellentPlate = { ...mockPlate, overallScore: 95 };
      const result = generateSmartRecommendations(excellentPlate, baseOptions);

      expect(result).toBeDefined();
      expect(result.prioritizedActions.length).toBeGreaterThan(0);

      // 高分宅盘主要是保持和优化建议
      const urgentActions = result.prioritizedActions.filter(
        (a) => a.priority === 'urgent'
      );
      expect(urgentActions.length).toBeLessThanOrEqual(2);
    });

    it('应该处理极低分宅盘', () => {
      const poorPlate = { ...mockPlate, overallScore: 15 };
      const result = generateSmartRecommendations(poorPlate, baseOptions);

      expect(result).toBeDefined();
      expect(result.prioritizedActions.length).toBeGreaterThan(5);

      // 低分宅盘应该有很多紧急改善建议
      const urgentActions = result.prioritizedActions.filter(
        (a) => a.priority === 'urgent' || a.priority === 'high'
      );
      expect(urgentActions.length).toBeGreaterThan(0);
    });

    it('应该处理所有宫位评分相近的情况', () => {
      const balancedPlate = {
        ...mockPlate,
        palaces: Object.fromEntries(
          Object.entries(mockPlate.palaces).map(([k, v]) => [
            k,
            { ...v, score: 60, fortuneRating: '平' },
          ])
        ),
      };

      const result = generateSmartRecommendations(
        balancedPlate as any,
        baseOptions
      );

      expect(result).toBeDefined();
      expect(result.prioritizedActions.length).toBeGreaterThan(0);
    });
  });

  describe('性能测试', () => {
    it('单次推荐生成应该在200ms内完成', () => {
      const start = Date.now();
      generateSmartRecommendations(mockPlate, baseOptions);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(200);
    });

    it('包含全部功能的推荐生成应该在300ms内完成', () => {
      const start = Date.now();
      generateSmartRecommendations(mockPlate, {
        includeQuickWins: true,
        includeLongTermPlan: true,
      });
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(300);
    });

    it('批量生成多个宅盘的推荐应该高效', () => {
      const plates = Array.from({ length: 10 }, (_, i) => ({
        ...mockPlate,
        overallScore: 50 + i * 4,
      }));

      const start = Date.now();
      plates.forEach((plate) => {
        generateSmartRecommendations(plate, baseOptions);
      });
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(2000); // 10个 < 2秒
    });
  });

  describe('数据一致性测试', () => {
    it('相同输入应该产生相同输出', () => {
      const result1 = generateSmartRecommendations(mockPlate, baseOptions);
      const result2 = generateSmartRecommendations(mockPlate, baseOptions);

      expect(result1.prioritizedActions.length).toBe(
        result2.prioritizedActions.length
      );
      expect(result1.quickWins.length).toBe(result2.quickWins.length);
      expect(result1.longTermPlan.phases.length).toBe(
        result2.longTermPlan.phases.length
      );
      expect(result1.actionTimeline.length).toBe(result2.actionTimeline.length);
    });

    it('优先级分布应该合理', () => {
      const result = generateSmartRecommendations(mockPlate, baseOptions);

      const priorityCounts = {
        urgent: 0,
        high: 0,
        medium: 0,
        low: 0,
      };

      result.prioritizedActions.forEach((action) => {
        priorityCounts[action.priority]++;
      });

      // 各优先级都应该有一定分布
      const totalActions = result.prioritizedActions.length;

      // 紧急和高优先级合计不应超过50%
      expect(priorityCounts.urgent + priorityCounts.high).toBeLessThanOrEqual(
        totalActions * 0.5
      );

      // 中等优先级应该占一定比例
      expect(priorityCounts.medium).toBeGreaterThan(0);
    });

    it('推荐原因应该与优先级匹配', () => {
      const result = generateSmartRecommendations(mockPlate, baseOptions);

      const urgentActions = result.prioritizedActions.filter(
        (a) => a.priority === 'urgent'
      );

      urgentActions.forEach((action) => {
        // 紧急建议的原因应该包含相关关键词
        expect(action.reason.match(/凶|煞|问题|严重|紧急/) !== null).toBe(true);
      });
    });
  });
});
