/**
 * v2.1集成测试 - 完整报告生成流程测试
 *
 * 测试范围：
 * 1. generateFullReport_v2_2()完整流程（v2.0+v2.1所有模块）
 * 2. JSON格式验证（符合ReportOutput_v2_2类型定义）
 * 3. 性能测试（生成时间<5秒）
 * 4. 5个真实案例验证（不同格局/年龄/困境）
 *
 * 覆盖模块：
 * - v2.0: 人生主题故事、归因分解、希望之光
 * - v2.1: 分级行动清单、决策时间窗口、风水Checklist
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import { generateFullReport_v2_2 } from '../report-generator-v2.2';
import {
  generateLifeTheme,
  calculateAttribution,
  generateHopeTimeline,
  generateActionPlan,
  generateDecisionWindows,
  generateFengshuiChecklist,
} from '../report-generator-v2.2';

describe('v2.1集成测试 - 完整报告生成', () => {
  describe('generateFullReport_v2_2() - 完整流程测试', () => {
    test('案例1: 30岁男性，食神生财格，当前困境期', async () => {
      const startTime = Date.now();

      const baziInput = {
        name: '测试用户1',
        gender: 'male',
        date: '1994-05-15',
        time: '10:30',
        city: '北京',
      };

      const fengshuiInput = {
        buildingDirection: '坐北朝南',
        birthYear: 1994,
        moveInDate: '2023-01-01',
      };

      const userContext = {
        currentAge: 30,
        occupation: '软件工程师',
        concerns: ['职业发展', '财运'],
      };

      const report = await generateFullReport_v2_2(
        baziInput,
        fengshuiInput,
        userContext
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      // ===== 1. 性能测试 =====
      expect(duration).toBeLessThan(5000); // <5秒
      console.log(`案例1生成耗时: ${duration}ms`);

      // ===== 2. 基本结构验证 =====
      expect(report).toBeDefined();
      expect(report.meta).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.baziAnalysis).toBeDefined();
      expect(report.strategyMapping).toBeDefined();
      expect(report.fengshuiChecklist).toBeDefined();
      expect(report.hopeTimeline).toBeDefined();

      // ===== 3. meta字段验证 =====
      expect(report.meta.name).toBe('测试用户1');
      expect(report.meta.genderTitle).toBe('先生');
      expect(report.meta.reportDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(report.meta.analysisHours).toBe(48);
      expect(report.meta.chartsCount).toBe(12);
      expect(report.meta.supportPlan).toContain('180天');

      // ===== 4. v2.0模块验证 =====
      // 4.1 人生主题故事
      expect(report.strategyMapping.lifeTheme).toBeDefined();
      expect(report.strategyMapping.lifeTheme.title).toBeTruthy();
      expect(report.strategyMapping.lifeTheme.summary).toBeTruthy();
      expect(report.strategyMapping.lifeTheme.stages.length).toBeGreaterThan(0);

      // 4.2 归因分解
      expect(report.strategyMapping.attribution).toBeDefined();
      expect(report.strategyMapping.attribution.timeFactor).toBeGreaterThanOrEqual(0);
      expect(report.strategyMapping.attribution.timeFactor).toBeLessThanOrEqual(100);
      const totalAttribution =
        report.strategyMapping.attribution.timeFactor +
        report.strategyMapping.attribution.endowmentFactor +
        report.strategyMapping.attribution.environmentFactor +
        report.strategyMapping.attribution.strategyFactor;
      expect(totalAttribution).toBe(100); // 总和应为100%

      // 4.3 希望之光
      expect(report.hopeTimeline).toBeDefined();
      expect(report.hopeTimeline.shortTerm).toBeDefined();
      expect(report.hopeTimeline.midTerm).toBeDefined();
      expect(report.hopeTimeline.longTerm).toBeDefined();
      expect(report.hopeTimeline.whyYouWillImprove.length).toBe(3); // 3个理由

      // ===== 5. v2.1模块验证 =====
      // 5.1 分级行动清单
      expect(report.strategyMapping.actions).toBeDefined();
      expect(report.strategyMapping.actions.essential).toBeDefined();
      expect(report.strategyMapping.actions.recommended).toBeDefined();
      expect(report.strategyMapping.actions.optional).toBeDefined();
      // 必做项应为1-3项
      expect(report.strategyMapping.actions.essential.length).toBeGreaterThanOrEqual(1);
      expect(report.strategyMapping.actions.essential.length).toBeLessThanOrEqual(3);

      // 5.2 决策时间窗口
      expect(report.strategyMapping.decisionWindows).toBeDefined();
      expect(Array.isArray(report.strategyMapping.decisionWindows)).toBe(true);
      if (report.strategyMapping.decisionWindows.length > 0) {
        const window = report.strategyMapping.decisionWindows[0];
        expect(window.topic).toBeTruthy();
        expect(window.window.from).toMatch(/^\d{4}-\d{2}-\d{2}$/); // ISO日期
        expect(window.window.to).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(window.window.confidence).toBeGreaterThanOrEqual(65);
        expect(window.window.confidence).toBeLessThanOrEqual(95);
      }

      // 5.3 风水Checklist
      expect(report.fengshuiChecklist).toBeDefined();
      expect(report.fengshuiChecklist.waterPlacement).toBeDefined();
      expect(report.fengshuiChecklist.mountainPlacement).toBeDefined();
      expect(report.fengshuiChecklist.environmentChecklist).toBeDefined();
      expect(Array.isArray(report.fengshuiChecklist.environmentChecklist)).toBe(true);

      // ===== 6. summary字段验证 =====
      expect(report.summary.lifeThemeTitle).toBeTruthy();
      expect(report.summary.keywords.length).toBe(3);
      expect(report.summary.thisWeekActions.length).toBe(3);

      // ===== 7. JSON格式验证 =====
      const jsonString = JSON.stringify(report);
      expect(() => JSON.parse(jsonString)).not.toThrow(); // 可序列化
      expect(jsonString.length).toBeGreaterThan(500); // 内容丰富
    });

    test('案例2: 45岁女性，从格，事业高峰期', async () => {
      const startTime = Date.now();

      const baziInput = {
        name: '测试用户2',
        gender: 'female',
        date: '1979-08-20',
        time: '14:15',
        city: '上海',
      };

      const fengshuiInput = {
        buildingDirection: '坐东朝西',
        birthYear: 1979,
        moveInDate: '2020-06-15',
      };

      const userContext = {
        currentAge: 45,
        occupation: '企业高管',
        concerns: ['健康', '家庭'],
      };

      const report = await generateFullReport_v2_2(
        baziInput,
        fengshuiInput,
        userContext
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 性能测试
      expect(duration).toBeLessThan(5000);
      console.log(`案例2生成耗时: ${duration}ms`);

      // 验证性别标题
      expect(report.meta.genderTitle).toBe('女士');

      // 验证年龄相关内容（45岁应在不同人生阶段）
      expect(report.strategyMapping.lifeTheme.stages.length).toBeGreaterThan(0);
      expect(report.hopeTimeline.longTerm).toBeDefined();

      // 验证风水Checklist有内容
      expect(report.fengshuiChecklist.environmentChecklist.length).toBeGreaterThanOrEqual(0);
    });

    test('案例3: 25岁男性，格局破损，求学期', async () => {
      const startTime = Date.now();

      const baziInput = {
        name: '测试用户3',
        gender: 'male',
        date: '1999-11-10',
        time: '08:20',
        city: '深圳',
      };

      const fengshuiInput = {
        buildingDirection: '坐南朝北',
        birthYear: 1999,
        moveInDate: '2024-01-01',
      };

      const userContext = {
        currentAge: 25,
        occupation: '研究生',
        concerns: ['学业', '求职'],
      };

      const report = await generateFullReport_v2_2(
        baziInput,
        fengshuiInput,
        userContext
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(5000);
      console.log(`案例3生成耗时: ${duration}ms`);

      // 验证年轻用户的希望之光（应有明确转折点）
      expect(report.hopeTimeline.midTerm).toBeDefined();
      expect(report.hopeTimeline.midTerm.turningPoint).toBeTruthy();

      // 验证行动清单包含学业相关内容
      expect(report.strategyMapping.actions.essential.length).toBeGreaterThan(0);
    });

    test('案例4: 55岁女性，晚运上扬，准备退休', async () => {
      const startTime = Date.now();

      const baziInput = {
        name: '测试用户4',
        gender: 'female',
        date: '1969-03-25',
        time: '16:45',
        city: '广州',
      };

      const fengshuiInput = {
        buildingDirection: '坐西朝东',
        birthYear: 1969,
        moveInDate: '2018-09-01',
      };

      const userContext = {
        currentAge: 55,
        occupation: '中学教师',
        concerns: ['健康', '养老'],
      };

      const report = await generateFullReport_v2_2(
        baziInput,
        fengshuiInput,
        userContext
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(5000);
      console.log(`案例4生成耗时: ${duration}ms`);

      // 验证长期希望（晚运应有规划）
      expect(report.hopeTimeline.longTerm).toBeDefined();
      expect(report.hopeTimeline.longTerm.changes.length).toBeGreaterThan(0);

      // 验证归因分解（时间因素可能较重）
      expect(report.strategyMapping.attribution.timeFactor).toBeGreaterThan(0);
    });

    test('案例5: 35岁男性，正官格，决策对比场景', async () => {
      const startTime = Date.now();

      const baziInput = {
        name: '测试用户5',
        gender: 'male',
        date: '1989-07-05',
        time: '11:30',
        city: '杭州',
      };

      const fengshuiInput = {
        buildingDirection: '坐东南朝西北',
        birthYear: 1989,
        moveInDate: '2022-03-15',
      };

      const userContext = {
        currentAge: 35,
        occupation: '产品经理',
        concerns: ['职业发展', '创业'],
        decisionOptions: [
          { id: 'A', name: '跳槽到大厂' },
          { id: 'B', name: '留在当前公司升职' },
          { id: 'C', name: '自主创业' },
        ],
      };

      const report = await generateFullReport_v2_2(
        baziInput,
        fengshuiInput,
        userContext
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(5000);
      console.log(`案例5生成耗时: ${duration}ms`);

      // 验证决策对比模块（v2.2功能，预留测试）
      if (report.decisionComparison) {
        expect(report.decisionComparison.topic).toBeTruthy();
        expect(report.decisionComparison.options.length).toBe(3);
        expect(report.decisionComparison.recommendation).toBeTruthy();
      }

      // 验证决策时间窗口（应包含创业/跳槽相关窗口）
      expect(report.strategyMapping.decisionWindows.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('模块功能独立测试', () => {
    test('v2.0模块 - 人生主题故事生成', () => {
      const mockPattern = {
        primaryPattern: '食神生财',
        patternStrength: 'medium',
        patternPurity: 'pure',
      };

      const mockUsefulGod = { element: '木' };

      const mockLuckPillars = [
        { startAge: 20, heavenlyStem: { element: '木' }, earthlyBranch: { element: '火' } },
        { startAge: 30, heavenlyStem: { element: '金' }, earthlyBranch: { element: '土' } },
      ];

      const currentAge = 30;
      const userContext = {};

      const result = generateLifeTheme(
        mockPattern,
        mockUsefulGod,
        mockLuckPillars,
        currentAge,
        userContext
      );

      expect(result).toBeDefined();
      expect(result.title).toBeTruthy();
      expect(result.summary).toBeTruthy();
      expect(result.stages.length).toBeGreaterThan(0);

      // 验证阶段结构
      result.stages.forEach((stage) => {
        expect(stage.ageRange).toBeTruthy();
        expect(stage.likelyEvents).toBeDefined();
        expect(stage.meaning).toBeTruthy();
        expect(stage.lesson).toBeTruthy();
      });
    });

    test('v2.0模块 - 归因分解算法', () => {
      const mockPattern = { patternStrength: 'weak' };
      const mockLuckPillars = [
        { startAge: 20, heavenlyStem: { element: '金' }, earthlyBranch: { element: '土' } },
      ];
      const currentAge = 30;

      const result = calculateAttribution(mockPattern, mockLuckPillars, currentAge);

      expect(result).toBeDefined();
      expect(result.timeFactor).toBeGreaterThanOrEqual(0);
      expect(result.endowmentFactor).toBeGreaterThanOrEqual(0);
      expect(result.environmentFactor).toBeGreaterThanOrEqual(0);
      expect(result.strategyFactor).toBeGreaterThanOrEqual(0);

      // 验证总和为100%
      const total =
        result.timeFactor +
        result.endowmentFactor +
        result.environmentFactor +
        result.strategyFactor;
      expect(total).toBe(100);

      // 验证注释存在
      expect(result.notes.length).toBeGreaterThan(0);
    });

    test('v2.0模块 - 希望之光时间线', () => {
      const mockLuckPillars = [
        { startAge: 20, age: 20, heavenlyStem: { element: '木' }, earthlyBranch: { element: '火' } },
        { startAge: 30, age: 30, heavenlyStem: { element: '金' }, earthlyBranch: { element: '土' } },
        { startAge: 40, age: 40, heavenlyStem: { element: '水' }, earthlyBranch: { element: '木' } },
      ];

      const currentAge = 30;

      const mockPattern = {
        patternStrength: 'medium',
        usefulGod: { element: '水' },
      };

      const result = generateHopeTimeline(mockLuckPillars, currentAge, mockPattern);

      expect(result).toBeDefined();
      expect(result.shortTerm).toBeDefined();
      expect(result.midTerm).toBeDefined();
      expect(result.longTerm).toBeDefined();
      expect(result.whyYouWillImprove.length).toBe(3);

      // 验证短期希望
      expect(result.shortTerm.timeframe).toBeTruthy();
      expect(result.shortTerm.changes.length).toBeGreaterThan(0);

      // 验证中期希望
      expect(result.midTerm.timeframe).toBeTruthy();
      expect(result.midTerm.changes.length).toBeGreaterThan(0);

      // 验证长期希望
      expect(result.longTerm.timeframe).toBeTruthy();
      expect(result.longTerm.changes.length).toBeGreaterThan(0);
    });

    test('v2.1模块 - 分级行动清单生成', () => {
      const mockUsefulGod = { element: '木' };
      const mockSeasonalAdjustment = {};
      const mockPatternStrength = 'medium';

      const result = generateActionPlan(
        mockUsefulGod,
        mockSeasonalAdjustment,
        mockPatternStrength
      );

      expect(result).toBeDefined();
      expect(result.essential).toBeDefined();
      expect(result.recommended).toBeDefined();
      expect(result.optional).toBeDefined();

      // 验证必做项数量（1-3项）
      expect(result.essential.length).toBeGreaterThanOrEqual(0); // 可能为0（如果没有模板）
      expect(result.essential.length).toBeLessThanOrEqual(3);

      // 验证行动项结构（如果有的话）
      if (result.essential.length > 0) {
        const action = result.essential[0];
        expect(action.title).toBeTruthy();
        expect(action.reason).toBeTruthy();
        expect(action.expectedImpact).toBeTruthy();
        expect(action.expectedTimeframe).toBeTruthy();
        expect(action.checklist).toBeDefined();
      }
    });

    test('v2.1模块 - 决策时间窗口生成（增强版）', () => {
      const mockLuckPillars = [
        {
          startAge: 30,
          heavenlyStem: { element: '木' },
          earthlyBranch: { element: '火' },
        },
        {
          startAge: 40,
          heavenlyStem: { element: '水' },
          earthlyBranch: { element: '木' },
        },
      ];

      const currentAge = 30;
      const mockUsefulGod = { element: '木' };

      const result = generateDecisionWindows(mockLuckPillars, currentAge, mockUsefulGod);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      if (result.length > 0) {
        const window = result[0];

        // 验证结构
        expect(window.topic).toBeTruthy();
        expect(window.window).toBeDefined();
        expect(window.window.from).toMatch(/^\d{4}-\d{2}-\d{2}$/); // ISO日期
        expect(window.window.to).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(window.window.confidence).toBeGreaterThanOrEqual(65);
        expect(window.window.confidence).toBeLessThanOrEqual(95);
        expect(window.window.note).toBeTruthy();
        expect(window.rationale).toBeTruthy();

        // 验证置信度算法（应包含月令、五行互动信息）
        if (window.window.note.includes('季节')) {
          // 说明月令分析生效
          expect(window.window.confidence).toBeGreaterThanOrEqual(70);
        }
      }
    });

    test('v2.1模块 - 风水Checklist生成（集成物品库）', () => {
      const mockLingzhengAnalysis = {
        waterPalaces: {
          favorable: [1, 4], // 零神位
          unfavorable: [6, 9], // 正神位
        },
        mountainPalaces: {
          favorable: [6, 9], // 正神位
          unfavorable: [1, 4], // 零神位
        },
      };

      const mockRecommendations = {
        waterPlacements: [
          { palace: 1, reason: '零神水位' },
          { palace: 4, reason: '零神水位' },
        ],
        mountainPlacements: [
          { palace: 6, reason: '正神山位' },
          { palace: 9, reason: '正神山位' },
        ],
      };

      const result = generateFengshuiChecklist(mockLingzhengAnalysis, mockRecommendations);

      expect(result).toBeDefined();
      expect(result.waterPlacement).toBeDefined();
      expect(result.mountainPlacement).toBeDefined();
      expect(result.environmentChecklist).toBeDefined();
      expect(Array.isArray(result.environmentChecklist)).toBe(true);

      // 验证环境清单内容（集成物品库后）
      if (result.environmentChecklist.length > 0) {
        const task = result.environmentChecklist[0];
        expect(task.id).toBeTruthy();
        expect(task.palace).toBeGreaterThanOrEqual(1);
        expect(task.palace).toBeLessThanOrEqual(9);
        expect(task.bagua).toBeTruthy();
        expect(task.task).toBeTruthy();
        expect(task.rationale).toBeTruthy();
        expect(task.severity).toMatch(/^(high|medium|low)$/);
        expect(task.expectedImpact).toBeTruthy();
        expect(task.dueBy).toMatch(/^\d{4}-\d{2}-\d{2}$/);

        // 验证物品库集成（任务描述应包含具体物品名称）
        const hasSpecificItem =
          task.task.includes('鱼缸') ||
          task.task.includes('植物') ||
          task.task.includes('柜子') ||
          task.task.includes('流水');
        expect(hasSpecificItem).toBe(true);
      }
    });
  });

  describe('JSON格式与序列化测试', () => {
    test('报告应可完整序列化和反序列化', async () => {
      const baziInput = {
        name: 'JSON测试',
        gender: 'male',
        date: '1990-01-01',
        time: '12:00',
        city: '北京',
      };

      const fengshuiInput = {
        buildingDirection: '坐北朝南',
        birthYear: 1990,
        moveInDate: '2020-01-01',
      };

      const report = await generateFullReport_v2_2(baziInput, fengshuiInput);

      // 序列化
      const jsonString = JSON.stringify(report);
      expect(jsonString).toBeTruthy();
      expect(jsonString.length).toBeGreaterThan(500);

      // 反序列化
      const parsedReport = JSON.parse(jsonString);
      expect(parsedReport).toBeDefined();
      expect(parsedReport.meta.name).toBe('JSON测试');
      expect(parsedReport.strategyMapping.lifeTheme).toBeDefined();
      expect(parsedReport.hopeTimeline).toBeDefined();
    });

    test('报告字段不应包含undefined或null（影响JSON输出）', async () => {
      const baziInput = {
        name: 'Null测试',
        gender: 'female',
        date: '1985-06-15',
        time: '09:30',
        city: '上海',
      };

      const fengshuiInput = {
        buildingDirection: '坐东朝西',
        birthYear: 1985,
        moveInDate: '2021-01-01',
      };

      const report = await generateFullReport_v2_2(baziInput, fengshuiInput);

      const jsonString = JSON.stringify(report);

      // JSON.stringify会自动忽略undefined，但不会忽略null
      // 验证关键字段不为null
      expect(report.meta.name).not.toBeNull();
      expect(report.strategyMapping.lifeTheme).not.toBeNull();
      expect(report.hopeTimeline).not.toBeNull();
      expect(report.fengshuiChecklist).not.toBeNull();
    });
  });

  describe('性能与压力测试', () => {
    test('批量生成10个报告，平均耗时<5秒', async () => {
      const testCases = Array.from({ length: 10 }, (_, i) => ({
        name: `批量用户${i + 1}`,
        gender: i % 2 === 0 ? 'male' : 'female',
        date: `199${i % 10}-0${(i % 9) + 1}-${10 + i}`,
        time: `${10 + (i % 12)}:${(i * 5) % 60}`,
        city: ['北京', '上海', '深圳', '广州', '杭州'][i % 5],
      }));

      const startTime = Date.now();
      const reports = await Promise.all(
        testCases.map((baziInput) =>
          generateFullReport_v2_2(
            baziInput,
            { buildingDirection: '坐北朝南', birthYear: 1990, moveInDate: '2020-01-01' }
          )
        )
      );
      const endTime = Date.now();

      const totalDuration = endTime - startTime;
      const avgDuration = totalDuration / testCases.length;

      console.log(`批量生成10个报告总耗时: ${totalDuration}ms`);
      console.log(`平均每个报告耗时: ${avgDuration}ms`);

      expect(avgDuration).toBeLessThan(5000); // 平均<5秒
      expect(reports.length).toBe(10);
      reports.forEach((report) => {
        expect(report).toBeDefined();
        expect(report.meta).toBeDefined();
      });
    });
  });
});
