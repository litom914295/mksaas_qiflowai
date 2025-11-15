/**
 * 决策增强模块单元测试
 * 
 * 测试覆盖：
 * 1. 基础工具函数（五行提取、流年流月计算）
 * 2. 八字力量评估算法
 * 3. 三大核心功能（组合路径、决策模拟、风险预警）
 * 4. 缓存机制
 * 5. 错误处理
 */

import {
  generateCombinedDecisionPath,
  simulateDecisionFuture,
  generateRiskWarningTimeline,
  clearBaziStrengthCache,
} from '../decision-enhancements';

import type {
  PatternAnalysis,
  LuckPillar,
  DecisionOption,
} from '@/types/report-v2-2';

// ============ 测试数据 ============

/**
 * 模拟八字格局数据（甲木日主，生于冬季，用神为火）
 */
const mockPatternAnalysis: PatternAnalysis = {
  patternName: '食神生财',
  usefulGod: {
    element: '火',
    primary: ['食神', '正财'],
  },
  strength: 'medium',
  purity: 'pure',
  confidence: 85,
};

/**
 * 模拟大运数据（包含有利和不利大运）
 */
const mockLuckPillars: LuckPillar[] = [
  {
    startAge: 25,
    age: 25,
    heavenlyStem: { element: '木' },
    earthlyBranch: { element: '火' },
    stem: { element: '木' },
    branch: { element: '火' },
    influence: '木火通明，利于事业发展',
    isFavorable: true,
  },
  {
    startAge: 35,
    age: 35,
    heavenlyStem: { element: '火' },
    earthlyBranch: { element: '土' },
    stem: { element: '火' },
    branch: { element: '土' },
    influence: '火土相生，财运亨通',
    isFavorable: true,
  },
  {
    startAge: 45,
    age: 45,
    heavenlyStem: { element: '金' },
    earthlyBranch: { element: '水' },
    stem: { element: '金' },
    branch: { element: '水' },
    influence: '金水寒冷，需谨慎行事',
    isFavorable: false,
  },
];

/**
 * 模拟决策选项
 */
const mockDecisionOptions: DecisionOption[] = [
  {
    id: 'option-1',
    name: '转行进入科技行业',
    matchScore: 75,
    shortTermRisk: '需要学习新技能，初期收入可能下降',
    longTermBenefit: '行业前景好，长期收入增长潜力大',
    bestTiming: '2025-2027年',
    rationale: '木火通明，利于学习和发展',
  },
  {
    id: 'option-2',
    name: '创业开设工作室',
    matchScore: 68,
    shortTermRisk: '资金投入大，风险较高',
    longTermBenefit: '自主性强，收益上限高',
    bestTiming: '2028-2030年',
    rationale: '火土相生，利于积累财富',
  },
];

// ============ 测试套件 ============

describe('决策增强模块 - 基础功能测试', () => {
  beforeEach(() => {
    // 每个测试前清空缓存
    clearBaziStrengthCache();
  });

  describe('组合决策路径生成器', () => {
    test('应该成功生成组合决策路径', () => {
      const result = generateCombinedDecisionPath(
        mockPatternAnalysis,
        mockLuckPillars,
        30,
        mockDecisionOptions
      );

      expect(result).not.toBeNull();
      expect(result?.stages).toBeDefined();
      expect(result?.stages.length).toBeGreaterThan(0);
      expect(result?.strategy).toBe('sequential');
      expect(result?.overallSuccessRate).toBeGreaterThanOrEqual(40);
      expect(result?.overallSuccessRate).toBeLessThanOrEqual(95);
    });

    test('应该正确识别有利和不利大运', () => {
      const result = generateCombinedDecisionPath(
        mockPatternAnalysis,
        mockLuckPillars,
        30,
        mockDecisionOptions
      );

      expect(result).not.toBeNull();
      const firstStage = result?.stages[0];
      expect(firstStage?.luckPillar.isFavorable).toBe(true);
      
      // 检查成功率范围
      if (firstStage?.luckPillar.isFavorable) {
        expect(firstStage.successRate).toBeGreaterThanOrEqual(60);
      }
    });

    test('应该包含时间窗口信息', () => {
      const result = generateCombinedDecisionPath(
        mockPatternAnalysis,
        mockLuckPillars,
        30,
        mockDecisionOptions
      );

      expect(result).not.toBeNull();
      const firstStage = result?.stages[0];
      expect(firstStage?.timeWindow).toBeDefined();
      expect(firstStage?.timeWindow.from).toMatch(/\d{4}-\d{2}-\d{2}/);
      expect(firstStage?.timeWindow.to).toMatch(/\d{4}-\d{2}-\d{2}/);
      expect(firstStage?.timeWindow.confidence).toBeGreaterThan(0);
    });

    test('应该在参数无效时返回 null', () => {
      const result = generateCombinedDecisionPath(
        mockPatternAnalysis,
        [],
        30,
        mockDecisionOptions
      );

      expect(result).toBeNull();
    });

    test('应该处理异常年龄值', () => {
      const result = generateCombinedDecisionPath(
        mockPatternAnalysis,
        mockLuckPillars,
        -10, // 异常年龄
        mockDecisionOptions
      );

      // 应该自动修正年龄并继续执行
      expect(result).not.toBeNull();
    });
  });

  describe('决策模拟器', () => {
    test('应该成功生成未来模拟结果', () => {
      const result = simulateDecisionFuture(
        mockPatternAnalysis,
        mockLuckPillars,
        30,
        mockDecisionOptions[0],
        5
      );

      expect(result).not.toBeNull();
      expect(result?.yearlyTimeline).toBeDefined();
      expect(result?.yearlyTimeline.length).toBe(5);
      expect(result?.simulationYears).toBe(5);
      expect(result?.overallSuccessProbability).toBeGreaterThanOrEqual(0);
      expect(result?.overallSuccessProbability).toBeLessThanOrEqual(100);
    });

    test('应该识别高峰期和低谷期', () => {
      const result = simulateDecisionFuture(
        mockPatternAnalysis,
        mockLuckPillars,
        30,
        mockDecisionOptions[0],
        5
      );

      expect(result).not.toBeNull();
      expect(result?.peakYears).toBeDefined();
      expect(result?.valleyYears).toBeDefined();
      expect(Array.isArray(result?.peakYears)).toBe(true);
      expect(Array.isArray(result?.valleyYears)).toBe(true);
    });

    test('应该包含最佳启动时间建议', () => {
      const result = simulateDecisionFuture(
        mockPatternAnalysis,
        mockLuckPillars,
        30,
        mockDecisionOptions[0],
        5
      );

      expect(result).not.toBeNull();
      expect(result?.bestStartTiming).toBeDefined();
      expect(result?.bestStartTiming.date).toMatch(/\d{4}-\d{2}-\d{2}/);
      expect(result?.bestStartTiming.reason).toBeTruthy();
    });

    test('应该限制模拟年限在合理范围', () => {
      const result = simulateDecisionFuture(
        mockPatternAnalysis,
        mockLuckPillars,
        30,
        mockDecisionOptions[0],
        20 // 超过最大限制
      );

      expect(result).not.toBeNull();
      expect(result?.simulationYears).toBeLessThanOrEqual(10);
    });

    test('应该包含情景分析', () => {
      const result = simulateDecisionFuture(
        mockPatternAnalysis,
        mockLuckPillars,
        30,
        mockDecisionOptions[0],
        5
      );

      expect(result).not.toBeNull();
      expect(result?.scenarios).toBeDefined();
      expect(result?.scenarios?.best).toBeDefined();
      expect(result?.scenarios?.baseline).toBeDefined();
      expect(result?.scenarios?.worst).toBeDefined();
    });

    test('应该在决策选项无效时返回 null', () => {
      const result = simulateDecisionFuture(
        mockPatternAnalysis,
        mockLuckPillars,
        30,
        { id: '', name: '', matchScore: 0, shortTermRisk: '', longTermBenefit: '', bestTiming: '', rationale: '' },
        5
      );

      expect(result).toBeNull();
    });
  });

  describe('风险预警系统', () => {
    test('应该成功生成风险预警时间线', () => {
      const result = generateRiskWarningTimeline(
        mockPatternAnalysis,
        mockLuckPillars,
        30,
        mockDecisionOptions[0],
        6
      );

      expect(result).not.toBeNull();
      expect(result?.warnings).toBeDefined();
      expect(result?.monthlyRiskCalendar).toBeDefined();
      expect(result?.monitoringMonths).toBe(6);
    });

    test('应该正确统计风险分布', () => {
      const result = generateRiskWarningTimeline(
        mockPatternAnalysis,
        mockLuckPillars,
        30,
        mockDecisionOptions[0],
        6
      );

      expect(result).not.toBeNull();
      expect(result?.highRiskCount).toBeGreaterThanOrEqual(0);
      expect(result?.mediumRiskCount).toBeGreaterThanOrEqual(0);
      expect(result?.lowRiskCount).toBeGreaterThanOrEqual(0);
      
      // 总数应该等于监控月数（因为每个月都会有评估）
      const totalRiskEvaluations = result?.monthlyRiskCalendar?.length || 0;
      expect(totalRiskEvaluations).toBe(6);
    });

    test('应该识别不同类型的风险', () => {
      const result = generateRiskWarningTimeline(
        mockPatternAnalysis,
        mockLuckPillars,
        30,
        mockDecisionOptions[0],
        6
      );

      expect(result).not.toBeNull();
      
      // 检查风险类型是否有效
      result?.warnings.forEach((warning) => {
        expect(['financial', 'health', 'interpersonal', 'decision', 'career', 'relationship']).toContain(warning.riskType);
        expect(warning.severity).toBeGreaterThanOrEqual(1);
        expect(warning.severity).toBeLessThanOrEqual(5);
      });
    });

    test('应该提供缓解措施', () => {
      const result = generateRiskWarningTimeline(
        mockPatternAnalysis,
        mockLuckPillars,
        30,
        mockDecisionOptions[0],
        6
      );

      expect(result).not.toBeNull();
      
      result?.warnings.forEach((warning) => {
        expect(warning.mitigation).toBeDefined();
        expect(warning.mitigation.immediate).toBeInstanceOf(Array);
        expect(warning.mitigation.preventive).toBeInstanceOf(Array);
        expect(warning.mitigation.alternative).toBeInstanceOf(Array);
      });
    });

    test('应该限制监控时长在合理范围', () => {
      const result = generateRiskWarningTimeline(
        mockPatternAnalysis,
        mockLuckPillars,
        30,
        mockDecisionOptions[0],
        50 // 超过最大限制
      );

      // 应该自动修正为默认值6
      expect(result).not.toBeNull();
      expect(result?.monitoringMonths).toBeLessThanOrEqual(24);
    });

    test('应该在无法找到当前大运时返回 null', () => {
      const result = generateRiskWarningTimeline(
        mockPatternAnalysis,
        mockLuckPillars,
        100, // 超出所有大运范围的年龄
        mockDecisionOptions[0],
        6
      );

      expect(result).toBeNull();
    });
  });

  describe('缓存机制', () => {
    test('应该缓存八字力量计算结果', () => {
      // 第一次调用
      const result1 = generateCombinedDecisionPath(
        mockPatternAnalysis,
        mockLuckPillars,
        30,
        mockDecisionOptions
      );

      // 第二次调用相同参数（应该使用缓存）
      const result2 = generateCombinedDecisionPath(
        mockPatternAnalysis,
        mockLuckPillars,
        30,
        mockDecisionOptions
      );

      expect(result1).toEqual(result2);
    });

    test('应该能够清空缓存', () => {
      // 调用以填充缓存
      generateCombinedDecisionPath(
        mockPatternAnalysis,
        mockLuckPillars,
        30,
        mockDecisionOptions
      );

      // 清空缓存
      clearBaziStrengthCache();

      // 再次调用应该重新计算（无异常）
      const result = generateCombinedDecisionPath(
        mockPatternAnalysis,
        mockLuckPillars,
        30,
        mockDecisionOptions
      );

      expect(result).not.toBeNull();
    });
  });

  describe('边界情况测试', () => {
    test('应该处理空大运数据', () => {
      const result = generateCombinedDecisionPath(
        mockPatternAnalysis,
        [],
        30,
        mockDecisionOptions
      );

      expect(result).toBeNull();
    });

    test('应该处理空决策选项', () => {
      const result = generateCombinedDecisionPath(
        mockPatternAnalysis,
        mockLuckPillars,
        30,
        []
      );

      expect(result).toBeNull();
    });

    test('应该处理缺失用神的格局分析', () => {
      const invalidPatternAnalysis = {
        ...mockPatternAnalysis,
        usefulGod: null as any,
      };

      const result = generateCombinedDecisionPath(
        invalidPatternAnalysis,
        mockLuckPillars,
        30,
        mockDecisionOptions
      );

      // 应该使用默认逻辑继续执行
      expect(result).not.toBeNull();
    });

    test('应该处理极端年龄值', () => {
      const result1 = generateCombinedDecisionPath(
        mockPatternAnalysis,
        mockLuckPillars,
        0, // 最小边界
        mockDecisionOptions
      );

      const result2 = generateCombinedDecisionPath(
        mockPatternAnalysis,
        mockLuckPillars,
        200, // 超出范围
        mockDecisionOptions
      );

      // 应该自动修正并继续执行
      expect(result1).not.toBeNull();
      expect(result2).not.toBeNull();
    });
  });
});

// ============ 性能测试（可选） ============

describe('决策增强模块 - 性能测试', () => {
  test('1000次组合路径生成应在2秒内完成', () => {
    const start = performance.now();

    for (let i = 0; i < 1000; i++) {
      generateCombinedDecisionPath(
        mockPatternAnalysis,
        mockLuckPillars,
        30,
        mockDecisionOptions
      );
    }

    const end = performance.now();
    const duration = end - start;

    console.log(`1000次组合路径生成耗时: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(2000);
  });

  test('缓存应该显著提升性能', () => {
    clearBaziStrengthCache();

    // 第一次运行（无缓存）
    const start1 = performance.now();
    for (let i = 0; i < 100; i++) {
      generateCombinedDecisionPath(
        mockPatternAnalysis,
        mockLuckPillars,
        30,
        mockDecisionOptions
      );
    }
    const duration1 = performance.now() - start1;

    clearBaziStrengthCache();

    // 第二次运行（有缓存）
    const start2 = performance.now();
    for (let i = 0; i < 100; i++) {
      generateCombinedDecisionPath(
        mockPatternAnalysis,
        mockLuckPillars,
        30,
        mockDecisionOptions
      );
    }
    const duration2 = performance.now() - start2;

    console.log(`无缓存: ${duration1.toFixed(2)}ms, 有缓存: ${duration2.toFixed(2)}ms`);
    
    // 第二次应该显著更快（至少快50%）
    expect(duration2).toBeLessThan(duration1 * 0.5);
  });
});
