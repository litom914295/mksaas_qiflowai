import { describe, it, expect } from 'vitest';
import { generateDecisionComparison } from '../report-generator-v2.2';

/**
 * 确定性微调测试
 * 
 * 验证相同输入产生相同输出（无随机性）
 */

describe('决策对比确定性测试', () => {
  const mockPatternAnalysis = {
    patternStrength: 'medium',
    patternPurity: 'mixed',
    formationFactors: ['正财', '食神'],
    pattern: { type: 'normal' },
    usefulGod: { element: '木' },
  };

  const mockLuckPillars = [
    { startAge: 28, age: 28, heavenlyStem: '甲', earthlyBranch: '寅' },
    { startAge: 38, age: 38, heavenlyStem: '乙', earthlyBranch: '卯' },
  ];

  const decisionOptions = [
    { id: 'A', name: '创业开公司', description: '自主创业' },
    { id: 'B', name: '跳槽到大厂', description: '换工作' },
    { id: 'C', name: '继续深造MBA', description: '提升学历' },
  ];

  it('相同输入应该产生相同的匹配分数（运行多次）', () => {
    const results = [];

    // 运行 10 次
    for (let i = 0; i < 10; i++) {
      const result = generateDecisionComparison(
        decisionOptions,
        mockPatternAnalysis,
        mockLuckPillars,
        30
      );
      results.push(result.options.map((opt) => opt.matchScore));
    }

    // 所有结果应该完全相同
    const firstResult = results[0];
    results.forEach((result, index) => {
      expect(result).toEqual(firstResult);
    });
  });

  it('不同方案名称应该产生不同的微调值', () => {
    const option1 = { id: 'A', name: '创业开公司' };
    const option2 = { id: 'B', name: '跳槽到大厂' };
    const option3 = { id: 'C', name: '继续深造MBA' };

    const result1 = generateDecisionComparison(
      [option1, option2],
      mockPatternAnalysis,
      mockLuckPillars,
      30
    );

    const result2 = generateDecisionComparison(
      [option1, option3],
      mockPatternAnalysis,
      mockLuckPillars,
      30
    );

    // 方案1的分数在两次调用中应该相同（确定性）
    const score1_run1 = result1.options.find((o) => o.id === 'A')?.matchScore;
    const score1_run2 = result2.options.find((o) => o.id === 'A')?.matchScore;
    expect(score1_run1).toBe(score1_run2);

    // 但方案2和方案3的分数应该不同（不同名称产生不同微调）
    const score2 = result1.options.find((o) => o.id === 'B')?.matchScore;
    const score3 = result2.options.find((o) => o.id === 'C')?.matchScore;
    expect(score2).not.toBe(score3);
  });

  it('方案顺序改变不应影响各自的分数', () => {
    const options1 = [
      { id: 'A', name: '创业开公司' },
      { id: 'B', name: '跳槽到大厂' },
      { id: 'C', name: '继续深造MBA' },
    ];

    const options2 = [
      { id: 'C', name: '继续深造MBA' },
      { id: 'A', name: '创业开公司' },
      { id: 'B', name: '跳槽到大厂' },
    ];

    const result1 = generateDecisionComparison(
      options1,
      mockPatternAnalysis,
      mockLuckPillars,
      30
    );

    const result2 = generateDecisionComparison(
      options2,
      mockPatternAnalysis,
      mockLuckPillars,
      30
    );

    // 每个方案的分数应该相同，不受顺序影响
    expect(result1.options.find((o) => o.id === 'A')?.matchScore).toBe(
      result2.options.find((o) => o.id === 'A')?.matchScore
    );
    expect(result1.options.find((o) => o.id === 'B')?.matchScore).toBe(
      result2.options.find((o) => o.id === 'B')?.matchScore
    );
    expect(result1.options.find((o) => o.id === 'C')?.matchScore).toBe(
      result2.options.find((o) => o.id === 'C')?.matchScore
    );
  });
});
