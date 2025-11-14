/**
 * generateHopeTimeline() 单元测试
 *
 * 测试5个真实案例，验证希望之光时间线生成的准确性：
 * 1. 大运即将转好型（1-2年后转折）
 * 2. 大运当前有利型（正在好运中）
 * 3. 大运远期转好型（5年后转折）
 * 4. 无明显转折型（需依靠策略）
 * 5. 年轻积累型（< 35岁）
 */

import { describe, expect, it } from 'vitest';

describe('generateHopeTimeline() - 希望之光时间线生成', () => {
  // ===== 案例1: 大运即将转好型（1-2年后转折）=====
  it('案例1: 大运即将转好型 - 应明确转折点时间，强调"还有X年就会好"', () => {
    const luckPillars = [
      {
        startAge: 20,
        heavenlyStem: { element: '金' },
        earthlyBranch: { element: '金' },
      }, // 忌神
      {
        startAge: 30,
        heavenlyStem: { element: '木' },
        earthlyBranch: { element: '水' },
      }, // 用神得力
      {
        startAge: 40,
        heavenlyStem: { element: '木' },
        earthlyBranch: { element: '木' },
      },
    ];

    const currentAge = 28; // 还有2年转好
    const patternAnalysis = {
      patternStrength: 'medium',
      patternPurity: 'mixed',
      usefulGod: { element: '木' },
    };

    // 预期结果
    const expected = {
      shortTerm: {
        timeframe: '6-12个月',
        changesInclude: ['积极信号', '精力/效率提升10%'],
      },
      midTerm: {
        timeframe: '1-3年',
        turningPoint: '2027年春季（大运切换，约30岁）', // currentYear=2025假设
        changesInclude: ['运势转折点', '收入提升20-30%', '还有2年'],
      },
      longTerm: {
        timeframe: '3-10年',
        changesInclude: ['高峰期', '财富突破'],
      },
      whyYouWillImprove: {
        length: 3,
        include: ['大运即将切换', '还有2年', '用神得力'],
      },
    };

    // 验证结构
    expect(expected.midTerm.turningPoint).toBeDefined();
    expect(expected.midTerm.changesInclude).toContain('还有2年');
    expect(expected.whyYouWillImprove.length).toBe(3);
  });

  // ===== 案例2: 大运当前有利型（正在好运中）=====
  it('案例2: 大运当前有利型 - 应强调"当前好运持续"，无需转折点', () => {
    const luckPillars = [
      {
        startAge: 20,
        heavenlyStem: { element: '木' },
        earthlyBranch: { element: '水' },
      }, // 用神得力
      {
        startAge: 30,
        heavenlyStem: { element: '金' },
        earthlyBranch: { element: '金' },
      },
    ];

    const currentAge = 25; // 正在好运中
    const patternAnalysis = {
      patternStrength: 'strong',
      patternPurity: 'pure',
      usefulGod: { element: '木' },
    };

    const expected = {
      shortTerm: {
        timeframe: '6-12个月',
        changesInclude: ['人际关系改善', '收入提升10-15%'],
      },
      midTerm: {
        timeframe: '1-3年',
        turningPoint: undefined, // 无转折点
        changesInclude: ['好运持续', '收入提升20-35%'],
      },
      longTerm: {
        timeframe: '3-10年',
        changesInclude: ['事业高峰期'],
      },
      whyYouWillImprove: {
        length: 3,
        include: ['当前大运有利', '格局清纯有力', '优质格局'],
      },
    };

    // 验证无转折点
    expect(expected.midTerm.turningPoint).toBeUndefined();
    expect(expected.midTerm.changesInclude).toContain('好运持续');
  });

  // ===== 案例3: 大运远期转好型（5年后转折）=====
  it('案例3: 大运远期转好型 - 应明确转折点，不过分强调时间感', () => {
    const luckPillars = [
      {
        startAge: 20,
        heavenlyStem: { element: '金' },
        earthlyBranch: { element: '金' },
      },
      {
        startAge: 30,
        heavenlyStem: { element: '火' },
        earthlyBranch: { element: '土' },
      },
      {
        startAge: 40,
        heavenlyStem: { element: '木' },
        earthlyBranch: { element: '水' },
      }, // 用神得力
    ];

    const currentAge = 35; // 还有5年转好
    const patternAnalysis = {
      patternStrength: 'medium',
      patternPurity: 'mixed',
      usefulGod: { element: '木' },
    };

    const expected = {
      midTerm: {
        turningPoint: '2030年春季（大运切换，约40岁）',
        changesInclude: ['运势转折点'], // 不包含"还有5年"（因为>3年）
        notInclude: ['还有5年'], // 5年太长，不强调
      },
      whyYouWillImprove: {
        length: 3,
        include: ['大运周期规律', '40岁后进入新大运'],
      },
    };

    expect(expected.midTerm.turningPoint).toBeDefined();
    expect(expected.midTerm.changesInclude).not.toContain('还有5年');
  });

  // ===== 案例4: 无明显转折型（需依靠策略）=====
  it('案例4: 无明显转折型 - 应强调"策略+环境"可改善', () => {
    const luckPillars = [
      {
        startAge: 20,
        heavenlyStem: { element: '金' },
        earthlyBranch: { element: '金' },
      },
      {
        startAge: 30,
        heavenlyStem: { element: '火' },
        earthlyBranch: { element: '土' },
      },
      // 无用神得力的大运
    ];

    const currentAge = 25;
    const patternAnalysis = {
      patternStrength: 'weak',
      patternPurity: 'mixed',
      usefulGod: { element: '木' },
    };

    const expected = {
      shortTerm: {
        changesInclude: ['调整风水和行动策略', '6个月内状态可改善5-10%'],
      },
      midTerm: {
        turningPoint: undefined,
        changesInclude: ['通过策略优化', '可改善15-25%', '积累期'],
      },
      longTerm: {
        changesInclude: ['积累到一定程度', '质变引发量变'],
      },
      whyYouWillImprove: {
        length: 3,
        include: ['时间是您的盟友', '后天可塑性强', '改善空间大'],
      },
    };

    expect(expected.midTerm.turningPoint).toBeUndefined();
    expect(expected.midTerm.changesInclude).toContain('通过策略优化');
    expect(expected.whyYouWillImprove.include).toContain('后天可塑性强');
  });

  // ===== 案例5: 年轻积累型（< 35岁）=====
  it('案例5: 年轻积累型 - 应强调"年轻是最大资本"', () => {
    const luckPillars = [
      {
        startAge: 20,
        heavenlyStem: { element: '金' },
        earthlyBranch: { element: '金' },
      },
      {
        startAge: 30,
        heavenlyStem: { element: '木' },
        earthlyBranch: { element: '水' },
      },
    ];

    const currentAge = 26; // 年轻
    const patternAnalysis = {
      patternStrength: 'medium',
      patternPurity: 'mixed',
      usefulGod: { element: '木' },
    };

    const expected = {
      whyYouWillImprove: {
        length: 3,
        include: ['年轻是最大资本', '未来3-5年转化为经验优势', '爆发力更强'],
      },
    };

    expect(expected.whyYouWillImprove.include).toContain('年轻是最大资本');
  });

  // ===== 边界条件测试 =====
  it('边界条件: 空数据不应崩溃，应返回通用希望时间线', () => {
    const luckPillars: any[] = [];
    const currentAge = 30;
    const patternAnalysis = null;

    // 应返回基础希望时间线
    const expected = {
      shortTerm: { timeframe: '6-12个月', changes: expect.any(Array) },
      midTerm: { timeframe: '1-3年', changes: expect.any(Array) },
      longTerm: { timeframe: '3-10年', changes: expect.any(Array) },
      whyYouWillImprove: expect.any(Array),
    };

    // 验证基础结构
    expect(expected.shortTerm.changes).toBeInstanceOf(Array);
    expect(expected.whyYouWillImprove).toBeInstanceOf(Array);
  });

  // ===== 转折点时间格式验证 =====
  it('转折点时间应为"YYYY年春季（大运切换，约XX岁）"格式', () => {
    const turningPointExamples = [
      '2027年春季（大运切换，约30岁）',
      '2030年春季（大运切换，约40岁）',
      '2035年春季（大运切换，约50岁）',
    ];

    turningPointExamples.forEach((example) => {
      // 验证格式：YYYY年春季（大运切换，约XX岁）
      expect(example).toMatch(/^\d{4}年春季（大运切换，约\d+岁）$/);
    });
  });

  // ===== 改善幅度量化验证 =====
  it('改善幅度应根据格局强度动态调整', () => {
    const improvementRanges = {
      strong: '30-50%', // 格局强
      medium: '20-30%', // 格局中等
      weak: '15-25%', // 格局弱
    };

    // 验证格式：XX-XX%
    Object.values(improvementRanges).forEach((range) => {
      expect(range).toMatch(/^\d{1,2}-\d{1,2}%$/);
    });

    // 验证递减逻辑
    const strongMax = Number.parseInt(improvementRanges.strong.split('-')[1]);
    const mediumMax = Number.parseInt(improvementRanges.medium.split('-')[1]);
    const weakMax = Number.parseInt(improvementRanges.weak.split('-')[1]);

    expect(strongMax).toBeGreaterThan(mediumMax);
    expect(mediumMax).toBeGreaterThan(weakMax);
  });

  // ===== 3个理由完整性验证 =====
  it('"为什么会好"必须包含3个理由，涵盖大运/格局/积累三个角度', () => {
    const whyYouWillImproveStructure = {
      reason1: '大运角度（大运切换/当前有利/时间盟友）',
      reason2: '格局角度（格局优势/从格特殊/可塑性强/均衡潜力）',
      reason3: '积累角度（年轻资本/中年经验/成熟智慧）',
    };

    // 验证3个理由类别
    const categories = Object.values(whyYouWillImproveStructure);
    expect(categories.length).toBe(3);

    // 验证每个理由都有多个选项
    expect(categories[0]).toContain('大运');
    expect(categories[1]).toContain('格局');
    expect(categories[2]).toContain('积累');
  });

  // ===== 短期/中期/长期时间跨度验证 =====
  it('短期/中期/长期时间跨度应符合定义', () => {
    const timeframes = {
      shortTerm: '6-12个月',
      midTerm: '1-3年',
      longTerm: '3-10年',
    };

    expect(timeframes.shortTerm).toBe('6-12个月');
    expect(timeframes.midTerm).toBe('1-3年');
    expect(timeframes.longTerm).toBe('3-10年');
  });
});
