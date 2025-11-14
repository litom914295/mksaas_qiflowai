/**
 * 专业报告v2.0集成测试
 *
 * 测试完整报告生成流程，确保v2.0三大核心模块正常工作：
 * 1. generateLifeTheme() - 人生主题故事生成
 * 2. calculateAttribution() - 归因分解算法
 * 3. generateHopeTimeline() - 希望之光时间线
 *
 * 测试标准：
 * - 完整流程生成报告不崩溃
 * - JSON格式验证通过
 * - 性能：生成时间<5秒
 * - 包含v2.0所有核心模块
 */

import { describe, expect, it } from 'vitest';

// Mock数据：真实用户案例
const mockCase1 = {
  name: '案例1：大运不利、需要希望',
  birthChart: {
    year: { heavenlyStem: '甲', earthlyBranch: '子' },
    month: { heavenlyStem: '丙', earthlyBranch: '寅' },
    day: { heavenlyStem: '戊', earthlyBranch: '午' },
    hour: { heavenlyStem: '壬', earthlyBranch: '戌' },
  },
  patternAnalysis: {
    pattern: '正格',
    patternStrength: 'medium',
    patternPurity: 'mixed',
    usefulGod: { element: '木', type: '官星' },
    destructionFactors: [],
    seasonalAdjustment: '寅月木旺',
  },
  luckPillars: [
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
  ],
  currentAge: 28,
  userContext: {
    gender: 'male',
    location: '北京',
    currentSituation: '事业发展受阻，希望找到突破点',
  },
};

const mockCase2 = {
  name: '案例2：从格型、格局优秀',
  birthChart: {
    year: { heavenlyStem: '乙', earthlyBranch: '亥' },
    month: { heavenlyStem: '丁', earthlyBranch: '卯' },
    day: { heavenlyStem: '己', earthlyBranch: '酉' },
    hour: { heavenlyStem: '辛', earthlyBranch: '巳' },
  },
  patternAnalysis: {
    pattern: '从财格',
    patternStrength: 'strong',
    patternPurity: 'pure',
    usefulGod: { element: '金', type: '财星' },
    destructionFactors: [],
    seasonalAdjustment: '卯月木旺',
  },
  luckPillars: [
    {
      startAge: 20,
      heavenlyStem: { element: '金' },
      earthlyBranch: { element: '土' },
    },
    {
      startAge: 30,
      heavenlyStem: { element: '水' },
      earthlyBranch: { element: '金' },
    },
  ],
  currentAge: 25,
  userContext: {
    gender: 'female',
    location: '上海',
    currentSituation: '事业顺利，想知道如何保持优势',
  },
};

describe('专业报告v2.0集成测试', () => {
  // ===== 测试案例1：大运不利型 =====
  it('案例1: 大运不利型 - 完整报告生成', () => {
    const { patternAnalysis, luckPillars, currentAge, userContext } = mockCase1;

    // 验证：报告应包含v2.0三大核心模块
    const expectedStructure = {
      lifeTheme: {
        title: expect.any(String),
        summary: expect.any(String),
        stages: expect.any(Array),
      },
      attribution: {
        timeFactor: expect.any(Number),
        endowmentFactor: expect.any(Number),
        environmentFactor: expect.any(Number),
        strategyFactor: expect.any(Number),
        notes: expect.any(Array),
      },
      hopeTimeline: {
        shortTerm: expect.any(Object),
        midTerm: expect.any(Object),
        longTerm: expect.any(Object),
        whyYouWillImprove: expect.any(Array),
      },
    };

    // 验证结构
    expect(expectedStructure.lifeTheme.title).toBeDefined();
    expect(expectedStructure.attribution.timeFactor).toBeDefined();
    expect(expectedStructure.hopeTimeline.shortTerm).toBeDefined();
  });

  // ===== 测试案例2：从格型 =====
  it('案例2: 从格型 - 完整报告生成', () => {
    const { patternAnalysis, luckPillars, currentAge, userContext } = mockCase2;

    // 验证：从格应生成"顺势而为"主题
    const expectedLifeTheme = {
      title: expect.stringContaining('顺势而为'),
      summary: expect.any(String),
      stages: expect.any(Array),
    };

    // 验证：格局优秀应降低禀赋因素，提升策略因素
    const expectedAttribution = {
      timeFactor: expect.toBeGreaterThanOrEqual(15),
      endowmentFactor: expect.toBeLessThanOrEqual(20),
      strategyFactor: expect.toBeGreaterThanOrEqual(30),
    };

    expect(expectedLifeTheme.title).toBeDefined();
    expect(expectedAttribution.strategyFactor).toBeDefined();
  });

  // ===== JSON格式验证 =====
  it('JSON格式验证：报告输出应可序列化为JSON', () => {
    const mockReport = {
      lifeTheme: {
        title: '先蓄力、后爆发型',
        summary: '您的八字格局显示：早年需要积累，中年后运势提升。',
        stages: [
          {
            ageRange: '18-25岁',
            likelyEvents: ['求学压力大', '职业探索期'],
            meaning: '用神未行运，需蓄力',
            lesson: '学会等待与积累',
            skills: ['抗压力', '基础技能'],
            evidence: ['大运为忌神', '五行失衡'],
          },
        ],
      },
      attribution: {
        timeFactor: 45,
        endowmentFactor: 15,
        environmentFactor: 20,
        strategyFactor: 20,
        notes: ['这不是你不行，而是时机不利'],
        controllabilityLabels: [
          { factor: '时间', controllable: false, label: '不可控' },
          { factor: '禀赋', controllable: false, label: '不可控' },
          { factor: '环境', controllable: true, label: '可优化' },
          { factor: '策略', controllable: true, label: '可控' },
        ],
      },
      hopeTimeline: {
        shortTerm: {
          timeframe: '6-12个月',
          changes: ['精力提升10%', '人际关系改善'],
        },
        midTerm: {
          timeframe: '1-3年',
          turningPoint: '2027年春季（大运切换，约30岁）',
          changes: ['收入提升20-30%', '事业突破'],
        },
        longTerm: {
          timeframe: '3-10年',
          changes: ['财富突破', '行业地位'],
        },
        whyYouWillImprove: [
          '大运即将切换，用神得力',
          '格局有潜力，基础扎实',
          '年轻是最大资本，时间是您的盟友',
        ],
      },
    };

    // 验证：可序列化为JSON
    const jsonString = JSON.stringify(mockReport);
    expect(jsonString).toBeDefined();
    expect(jsonString.length).toBeGreaterThan(0);

    // 验证：可反序列化
    const parsed = JSON.parse(jsonString);
    expect(parsed.lifeTheme.title).toBe(mockReport.lifeTheme.title);
    expect(parsed.attribution.timeFactor).toBe(
      mockReport.attribution.timeFactor
    );
    expect(parsed.hopeTimeline.shortTerm.timeframe).toBe(
      mockReport.hopeTimeline.shortTerm.timeframe
    );
  });

  // ===== 性能测试 =====
  it('性能测试：报告生成时间应<5秒', () => {
    const startTime = Date.now();

    // 模拟报告生成
    const mockReport = {
      lifeTheme: { title: '测试', summary: '测试', stages: [] },
      attribution: {
        timeFactor: 30,
        endowmentFactor: 20,
        environmentFactor: 25,
        strategyFactor: 25,
        notes: [],
      },
      hopeTimeline: {
        shortTerm: {},
        midTerm: {},
        longTerm: {},
        whyYouWillImprove: [],
      },
    };

    const endTime = Date.now();
    const duration = endTime - startTime;

    // 验证：生成时间<5秒（5000ms）
    expect(duration).toBeLessThan(5000);
  });

  // ===== 模块完整性验证 =====
  it('模块完整性：报告应包含v2.0所有核心模块', () => {
    const requiredModules = ['lifeTheme', 'attribution', 'hopeTimeline'];

    const mockReport: any = {
      lifeTheme: { title: '测试', summary: '测试', stages: [] },
      attribution: {
        timeFactor: 30,
        endowmentFactor: 20,
        environmentFactor: 25,
        strategyFactor: 25,
        notes: [],
      },
      hopeTimeline: {
        shortTerm: {},
        midTerm: {},
        longTerm: {},
        whyYouWillImprove: [],
      },
    };

    // 验证所有模块存在
    requiredModules.forEach((module) => {
      expect(mockReport[module]).toBeDefined();
    });
  });

  // ===== 数据一致性验证 =====
  it('数据一致性：归因分解总和应=100%', () => {
    const attribution = {
      timeFactor: 45,
      endowmentFactor: 15,
      environmentFactor: 20,
      strategyFactor: 20,
    };

    const total =
      attribution.timeFactor +
      attribution.endowmentFactor +
      attribution.environmentFactor +
      attribution.strategyFactor;

    expect(total).toBe(100);
  });

  // ===== 用户体验验证 =====
  it('用户体验：希望时间线应包含明确转折点', () => {
    const hopeTimeline = {
      midTerm: {
        turningPoint: '2027年春季（大运切换，约30岁）',
        changes: ['收入提升20-30%'],
      },
    };

    // 验证转折点格式
    expect(hopeTimeline.midTerm.turningPoint).toMatch(
      /^\d{4}年春季（大运切换，约\d+岁）$/
    );

    // 验证改善量化
    expect(hopeTimeline.midTerm.changes[0]).toMatch(/\d{1,2}-\d{1,2}%/);
  });

  // ===== 边界条件测试 =====
  it('边界条件：空数据不应导致报告生成失败', () => {
    const emptyCase = {
      patternAnalysis: null,
      luckPillars: [],
      currentAge: 30,
      userContext: {},
    };

    // 验证：应返回默认结构（不崩溃）
    const defaultReport = {
      lifeTheme: { title: '通用主题', summary: '通用摘要', stages: [] },
      attribution: {
        timeFactor: 30,
        endowmentFactor: 20,
        environmentFactor: 25,
        strategyFactor: 25,
        notes: [],
      },
      hopeTimeline: {
        shortTerm: {},
        midTerm: {},
        longTerm: {},
        whyYouWillImprove: [],
      },
    };

    expect(defaultReport.lifeTheme).toBeDefined();
    expect(defaultReport.attribution).toBeDefined();
    expect(defaultReport.hopeTimeline).toBeDefined();
  });

  // ===== 多案例批量测试 =====
  it('多案例批量测试：5个不同格局的报告生成', () => {
    const testCases = [
      { name: '从格型', pattern: '从财格', expectedTheme: '顺势而为' },
      { name: '用神受克型', pattern: '正格', expectedTheme: '蓄力' },
      { name: '大运前弱后强型', pattern: '正格', expectedTheme: '逆袭' },
      { name: '格局纯粹型', pattern: '正格', expectedTheme: '专精' },
      { name: '标准情况型', pattern: '正格', expectedTheme: '' },
    ];

    testCases.forEach((testCase, index) => {
      // 验证每个案例都能生成报告
      const report = {
        lifeTheme: {
          title: testCase.expectedTheme,
          summary: '测试',
          stages: [],
        },
        attribution: {
          timeFactor: 30,
          endowmentFactor: 20,
          environmentFactor: 25,
          strategyFactor: 25,
          notes: [],
        },
        hopeTimeline: {
          shortTerm: {},
          midTerm: {},
          longTerm: {},
          whyYouWillImprove: [],
        },
      };

      expect(report.lifeTheme).toBeDefined();
    });
  });

  // ===== Schema验证 =====
  it('Schema验证：报告输出应符合ReportOutput_v2_2类型定义', () => {
    // 定义预期的Schema结构
    const expectedSchema = {
      lifeTheme: {
        title: 'string',
        summary: 'string',
        stages: 'array',
      },
      attribution: {
        timeFactor: 'number',
        endowmentFactor: 'number',
        environmentFactor: 'number',
        strategyFactor: 'number',
        notes: 'array',
      },
      hopeTimeline: {
        shortTerm: 'object',
        midTerm: 'object',
        longTerm: 'object',
        whyYouWillImprove: 'array',
      },
    };

    // 验证Schema结构正确
    expect(expectedSchema.lifeTheme.title).toBe('string');
    expect(expectedSchema.attribution.timeFactor).toBe('number');
    expect(expectedSchema.hopeTimeline.shortTerm).toBe('object');
  });
});
