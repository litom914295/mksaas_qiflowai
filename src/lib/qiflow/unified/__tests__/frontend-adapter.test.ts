/**
 * 前端适配器测试
 *
 * 验证 unified 输出到前端组件格式的转换
 */

import { describe, expect, it } from '@jest/globals';
import {
  adaptScoringToDisplay,
  adaptToFrontend,
  adaptWarningsToDisplay,
} from '../adapters/frontend-adapter';
import type { UnifiedAnalysisOutput } from '../types';

describe('前端适配器测试', () => {
  // 模拟 unified 输出数据
  const mockUnifiedOutput: UnifiedAnalysisOutput = {
    xuankong: {
      period: 8,
      facing: 'zi' as any,
      plate: {
        center: { period: 8, mountain: 8, facing: 8 },
        palaces: {} as any,
      },
      evaluation: {
        isWangShan: false,
        isWangShui: false,
        isShangShan: false,
        isShangShui: false,
        isQiShanQiShui: false,
        isReverseLiuYin: false,
        rating: 'good',
      },
    },
    scoring: {
      overall: 75,
      level: 'good',
      dimensions: [
        {
          name: '财运',
          score: 80,
          weight: 0.3,
          reasons: ['财位适中', '水位合理'],
          suggestions: ['加强财位布局', '保持清洁'],
        },
        {
          name: '健康',
          score: 70,
          weight: 0.3,
          reasons: ['宫位一般'],
          suggestions: ['注意通风'],
        },
      ],
      summary: '综合评分良好，有提升空间',
    },
    warnings: {
      warnings: [
        {
          id: 'w1',
          severity: 'high',
          urgency: 4,
          title: '五黄煞',
          description: '五黄位于主卧',
          location: '东南',
          impact: ['影响健康'],
          consequences: ['可能导致疾病'],
          recommendations: ['放置化解物品'],
        },
        {
          id: 'w2',
          severity: 'medium',
          urgency: 3,
          title: '二黑病符',
          description: '二黑位于厨房',
          location: '西南',
          impact: ['影响健康'],
          consequences: ['可能引发小病'],
          recommendations: ['保持整洁'],
        },
      ],
      urgentCount: 1,
      criticalCount: 0,
      summary: '发现2个预警项目，需要关注',
    },
    keyPositions: [
      {
        type: 'wealth',
        name: '财位',
        palace: 6,
        direction: '西北',
        score: 85,
        description: '当运旺财位',
        advice: {
          suitable: ['放置鱼缸', '摆放植物'],
          avoid: ['堆放杂物', '设置厕所'],
          enhance: ['加强照明', '保持整洁'],
          items: ['聚宝盆', '水晶球'],
        },
      },
      {
        type: 'study',
        name: '文昌位',
        palace: 4,
        direction: '东南',
        score: 78,
        description: '利于学习和工作',
        advice: {
          suitable: ['设置书桌', '摆放文昌塔'],
          avoid: ['放置电器'],
          enhance: ['充足照明'],
        },
      },
    ],
    actionPlan: [
      {
        id: 'a1',
        priority: 1,
        title: '化解五黄煞',
        description: '在主卧放置化解物品',
        category: 'urgent',
        difficulty: 'easy',
        timeRequired: '1天',
        steps: ['购买化解物品', '摆放到指定位置'],
        expectedEffect: '减少健康风险',
      },
      {
        id: 'a2',
        priority: 2,
        title: '布置财位',
        description: '在西北方增强财运',
        category: 'important',
        difficulty: 'medium',
        timeRequired: '2-3天',
        steps: ['清理财位', '摆放招财物品'],
        expectedEffect: '提升财运',
      },
    ],
    monthlyForecast: [
      {
        year: 2024,
        month: 12,
        monthName: '12月',
        favorableDirections: ['西北', '东南'],
        unfavorableDirections: ['东北', '西南'],
        keyEvents: ['适合投资', '注意健康'],
        advice: ['多活动西北方', '避免东北方'],
        score: 72,
      },
    ],
    assessment: {
      overallScore: 75,
      rating: 'good',
      strengths: ['财位较好', '文昌位适中'],
      weaknesses: ['健康位较弱', '有煞气'],
      topPriorities: ['化解五黄', '加强财位'],
      longTermPlan: ['定期调整布局', '关注流年变化'],
    },
    metadata: {
      analyzedAt: new Date('2024-12-01'),
      version: '1.0.0',
      depth: 'comprehensive',
      computationTime: 150,
    },
  };

  it('应该正确适配基础分析数据', () => {
    const result = adaptToFrontend(mockUnifiedOutput);

    // 检查基础结构
    expect(result).toHaveProperty('basicAnalysis');
    expect(result).toHaveProperty('enhancedPlate');
    expect(result).toHaveProperty('overallAssessment');
    expect(result).toHaveProperty('metadata');

    // 检查基础分析
    expect(result.basicAnalysis.period).toBe(8);
    expect(result.basicAnalysis.facingDirection).toBe('zi');
  });

  it('应该正确提取文昌位和财位', () => {
    const result = adaptToFrontend(mockUnifiedOutput);

    // 检查文昌位
    expect(result.basicAnalysis.wenchangwei).toHaveLength(1);
    expect(result.basicAnalysis.wenchangwei[0].palace).toBe(4);
    expect(result.basicAnalysis.wenchangwei[0].direction).toBe('东南');

    // 检查财位
    expect(result.basicAnalysis.caiwei).toHaveLength(1);
    expect(result.basicAnalysis.caiwei[0].palace).toBe(6);
    expect(result.basicAnalysis.caiwei[0].direction).toBe('西北');
  });

  it('应该正确构建智能推荐', () => {
    const result = adaptToFrontend(mockUnifiedOutput);

    expect(result.smartRecommendations).toBeDefined();
    expect(result.smartRecommendations.all).toHaveLength(2);
    expect(result.smartRecommendations.urgent).toHaveLength(1);
    expect(result.smartRecommendations.urgent[0].category).toBe('urgent');
    expect(result.smartRecommendations.byCategory.urgent).toHaveLength(1);
    expect(result.smartRecommendations.byCategory.important).toHaveLength(1);
  });

  it('应该正确构建综合评估', () => {
    const result = adaptToFrontend(mockUnifiedOutput);

    expect(result.overallAssessment.score).toBe(75);
    expect(result.overallAssessment.rating).toBe('good');
    expect(result.overallAssessment.strengths).toHaveLength(2);
    expect(result.overallAssessment.weaknesses).toHaveLength(2);
    expect(result.overallAssessment.topPriorities).toHaveLength(2);
  });

  it('应该正确构建流年分析', () => {
    const result = adaptToFrontend(mockUnifiedOutput);

    expect(result.liunianAnalysis).toBeDefined();
    expect(result.liunianAnalysis?.overlayAnalysis).toHaveLength(1);
    expect(result.liunianAnalysis?.overlayAnalysis[0].year).toBe(2024);
    expect(result.liunianAnalysis?.overlayAnalysis[0].month).toBe(12);
  });

  it('应该正确构建元数据', () => {
    const result = adaptToFrontend(mockUnifiedOutput);

    expect(result.metadata.version).toBe('1.0.0');
    expect(result.metadata.analysisDepth).toBe('comprehensive');
    expect(result.metadata.computationTime).toBe(150);
  });

  it('应该正确适配评分结果为显示格式', () => {
    const displayScoring = adaptScoringToDisplay(mockUnifiedOutput.scoring);

    expect(displayScoring).not.toBeNull();
    expect(displayScoring?.overall).toBe(75);
    expect(displayScoring?.level).toBe('good');
    expect(displayScoring?.dimensions).toHaveLength(2);

    // 检查第一个维度
    const firstDim = displayScoring?.dimensions[0];
    expect(firstDim?.name).toBe('财运');
    expect(firstDim?.score).toBe(80);
    expect(firstDim?.status).toBe('good');
    expect(firstDim?.details.reasons).toContain('财位适中');
  });

  it('应该正确适配预警结果为显示格式', () => {
    const displayWarnings = adaptWarningsToDisplay(mockUnifiedOutput.warnings);

    expect(displayWarnings).not.toBeNull();
    expect(displayWarnings?.total).toBe(2);
    expect(displayWarnings?.urgent).toBe(1);
    expect(displayWarnings?.critical).toBe(0);
    expect(displayWarnings?.items).toHaveLength(2);

    // 检查第一个预警
    const firstWarning = displayWarnings?.items[0];
    expect(firstWarning?.severity).toBe('high');
    expect(firstWarning?.title).toBe('五黄煞');
    expect(firstWarning?.icon).toBe('⚠️');
    expect(firstWarning?.color).toBe('orange');
  });

  it('应该正确处理评分状态', () => {
    const testCases = [
      { score: 90, expected: 'excellent' },
      { score: 85, expected: 'excellent' },
      { score: 75, expected: 'good' },
      { score: 70, expected: 'good' },
      { score: 60, expected: 'fair' },
      { score: 50, expected: 'fair' },
      { score: 40, expected: 'poor' },
    ];

    testCases.forEach(({ score, expected }) => {
      const mockOutput = {
        ...mockUnifiedOutput,
        scoring: {
          ...mockUnifiedOutput.scoring!,
          dimensions: [
            {
              name: '测试',
              score,
              weight: 1,
              reasons: [],
              suggestions: [],
            },
          ],
        },
      };

      const result = adaptScoringToDisplay(mockOutput.scoring);
      expect(result?.dimensions[0].status).toBe(expected);
    });
  });

  it('应该正确处理预警图标和颜色', () => {
    const severityTests = [
      { severity: 'critical', icon: '🚨', color: 'red' },
      { severity: 'high', icon: '⚠️', color: 'orange' },
      { severity: 'medium', icon: '⚡', color: 'yellow' },
      { severity: 'low', icon: 'ℹ️', color: 'blue' },
      { severity: 'info', icon: '💡', color: 'gray' },
    ];

    severityTests.forEach(({ severity, icon, color }) => {
      const mockOutput = {
        ...mockUnifiedOutput,
        warnings: {
          warnings: [
            {
              ...mockUnifiedOutput.warnings!.warnings[0],
              severity: severity as any,
            },
          ],
          urgentCount: 0,
          criticalCount: 0,
          summary: 'Test',
        },
      };

      const result = adaptWarningsToDisplay(mockOutput.warnings);
      expect(result?.items[0].icon).toBe(icon);
      expect(result?.items[0].color).toBe(color);
    });
  });

  it('应该处理没有个性化分析的情况', () => {
    const mockOutputWithoutPersonalized = {
      ...mockUnifiedOutput,
      personalized: undefined,
    };

    const result = adaptToFrontend(mockOutputWithoutPersonalized);
    expect(result.personalizedAnalysis).toBeUndefined();
  });

  it('应该处理没有流年分析的情况', () => {
    const mockOutputWithoutMonthly = {
      ...mockUnifiedOutput,
      monthlyForecast: undefined,
    };

    const result = adaptToFrontend(mockOutputWithoutMonthly);
    expect(result.liunianAnalysis).toBeUndefined();
  });

  it('应该处理空的行动计划', () => {
    const mockOutputWithoutActions = {
      ...mockUnifiedOutput,
      actionPlan: [],
    };

    const result = adaptToFrontend(mockOutputWithoutActions);
    expect(result.smartRecommendations.all).toHaveLength(0);
    expect(result.smartRecommendations.urgent).toHaveLength(0);
    expect(result.smartRecommendations.today).toHaveLength(0);
  });

  it('应该正确分组行动计划', () => {
    const mockOutputWithVariedActions = {
      ...mockUnifiedOutput,
      actionPlan: [
        { ...mockUnifiedOutput.actionPlan![0], category: 'urgent' as const },
        { ...mockUnifiedOutput.actionPlan![1], category: 'important' as const },
        {
          ...mockUnifiedOutput.actionPlan![0],
          id: 'a3',
          category: 'beneficial' as const,
        },
        {
          ...mockUnifiedOutput.actionPlan![1],
          id: 'a4',
          category: 'optional' as const,
        },
      ],
    };

    const result = adaptToFrontend(mockOutputWithVariedActions);
    expect(result.smartRecommendations.byCategory.urgent).toHaveLength(1);
    expect(result.smartRecommendations.byCategory.important).toHaveLength(1);
    expect(result.smartRecommendations.byCategory.beneficial).toHaveLength(1);
    expect(result.smartRecommendations.byCategory.optional).toHaveLength(1);
  });

  it('应该保持元数据的完整性', () => {
    const result = adaptToFrontend(mockUnifiedOutput);

    expect(result.metadata.analyzedAt).toEqual(
      mockUnifiedOutput.metadata.analyzedAt
    );
    expect(result.metadata.version).toBe(mockUnifiedOutput.metadata.version);
    expect(result.metadata.analysisDepth).toBe(
      mockUnifiedOutput.metadata.depth
    );
    expect(result.metadata.computationTime).toBe(
      mockUnifiedOutput.metadata.computationTime
    );
  });
});
