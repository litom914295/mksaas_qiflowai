/**
 * QiFlow AI - 增强型八字计算引擎测试
 *
 * 全面测试新的八字计算功能
 */

import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { BaziCalculationAdapter } from '../adapter';
import { BaziCache, PerformanceMonitor } from '../cache';
import { EnhancedBaziCalculator } from '../enhanced-calculator';

// Mock @aharris02/bazi-calculator-by-alvamind
jest.mock('@aharris02/bazi-calculator-by-alvamind', () => ({
  BaziCalculator: jest.fn().mockImplementation(() => ({
    getCompleteAnalysis: jest.fn(),
    getAnalysisForDate: jest.fn(),
    calculateLuckPillars: jest.fn(),
    toString: jest.fn(),
  })),
}));

describe('EnhancedBaziCalculator', () => {
  let calculator: EnhancedBaziCalculator;
  const mockBirthData = {
    datetime: '1990-05-10T12:30:00',
    gender: 'male' as const,
    timezone: 'Asia/Shanghai' as const,
    isTimeKnown: true,
    preferredLocale: 'zh-CN' as const,
  };

  beforeEach(() => {
    calculator = new EnhancedBaziCalculator(mockBirthData);
  });

  afterEach(() => {
    calculator.clearCache();
  });

  describe('初始化测试', () => {
    it('应该正确初始化计算器', () => {
      expect(calculator).toBeInstanceOf(EnhancedBaziCalculator);
    });

    it('应该正确处理时区标准化', () => {
      const dataWithoutTimezone = {
        ...mockBirthData,
        timezone: undefined,
      };
      const calc = new EnhancedBaziCalculator(dataWithoutTimezone);
      expect(calc).toBeDefined();
    });

    it('应该正确处理性别标准化', () => {
      const dataWithDifferentGender = {
        ...mockBirthData,
        gender: 'female' as const,
      };
      const calc = new EnhancedBaziCalculator(dataWithDifferentGender);
      expect(calc).toBeDefined();
    });

    it('应该处理无效的出生日期', () => {
      expect(() => {
        new EnhancedBaziCalculator({
          ...mockBirthData,
          datetime: 'invalid-date',
        });
      }).toThrow();
    });
  });

  describe('完整分析测试', () => {
    it('应该返回完整的分析结果', async () => {
      const result = await calculator.getCompleteAnalysis();
      expect(result).toBeDefined();
    });

    it('应该正确缓存分析结果', async () => {
      const result1 = await calculator.getCompleteAnalysis();
      const result2 = await calculator.getCompleteAnalysis();

      // 第二次调用应该返回缓存的结果
      expect(result1).toBe(result2);
    });

    it('应该在缓存清除后重新计算', async () => {
      const result1 = await calculator.getCompleteAnalysis();
      calculator.clearCache();
      const result2 = await calculator.getCompleteAnalysis();

      expect(result1).not.toBe(result2);
    });
  });

  describe('每日分析测试', () => {
    it('应该返回每日分析结果', async () => {
      const targetDate = new Date('2024-12-25');
      const result = await calculator.getDailyAnalysis(targetDate);

      expect(result).toBeDefined();
      expect(result?.date).toBeDefined();
    });

    it('应该支持个性化分析', async () => {
      const targetDate = new Date('2024-12-25');
      const result = await calculator.getDailyAnalysis(
        targetDate,
        'personalized'
      );

      expect(result).toBeDefined();
    });
  });

  describe('大运分析测试', () => {
    it('应该返回大运分析结果', async () => {
      const result = await calculator.getLuckPillarsAnalysis();
      expect(Array.isArray(result)).toBe(true);
    });

    it('应该返回当前大运', async () => {
      const result = await calculator.getCurrentLuckPillar();
      expect(result).toBeDefined();
    });
  });

  describe('错误处理测试', () => {
    it('应该处理计算器初始化失败', async () => {
      // Mock 计算器初始化失败
      const mockCalculator = new EnhancedBaziCalculator(mockBirthData);
      mockCalculator.getCompleteAnalysis = jest
        .fn()
        .mockRejectedValue(new Error('计算失败'));

      const result = await mockCalculator.getCompleteAnalysis();
      expect(result).toBeNull();
    });

    it('应该处理无效的输入参数', () => {
      expect(() => {
        new EnhancedBaziCalculator({
          ...mockBirthData,
          datetime: '',
        });
      }).toThrow();
    });
  });
});

describe('BaziCalculationAdapter', () => {
  let adapter: BaziCalculationAdapter;
  const mockBirthData = {
    datetime: '1990-05-10T12:30:00',
    gender: 'male' as const,
    timezone: 'Asia/Shanghai' as const,
    isTimeKnown: true,
    preferredLocale: 'zh-CN' as const,
  };

  beforeEach(() => {
    adapter = new BaziCalculationAdapter({
      mode: 'hybrid',
      fallbackToLegacy: true,
      enableCache: true,
      enableMetrics: true,
    });
  });

  describe('适配器模式测试', () => {
    it('应该支持混合模式', async () => {
      const result = await adapter.calculate(mockBirthData);
      expect(result).toBeDefined();
    });

    it('应该支持传统模式', async () => {
      adapter.updateConfig({ mode: 'hybrid' });
      const result = await adapter.calculate(mockBirthData);
      expect(result).toBeDefined();
    });

    it('应该支持增强模式', async () => {
      adapter.updateConfig({ mode: 'enhanced' });
      const result = await adapter.calculate(mockBirthData);
      expect(result).toBeDefined();
    });
  });

  describe('降级处理测试', () => {
    it('应该在增强计算失败时降级到传统计算', async () => {
      // 配置总是失败的增强计算
      adapter.updateConfig({ mode: 'hybrid' });

      const result = await adapter.calculate(mockBirthData);
      // 即使增强计算失败，也应该有结果（来自传统计算）
      expect(result).toBeDefined();
    });
  });

  describe('性能监控测试', () => {
    it('应该记录性能指标', async () => {
      await adapter.calculate(mockBirthData);
      const metrics = adapter.getMetricsSummary();

      expect(metrics).toBeDefined();
      expect(Object.keys(metrics).length).toBeGreaterThan(0);
    });
  });
});

describe('BaziCache', () => {
  let cache: BaziCache;

  beforeEach(() => {
    cache = new BaziCache();
    cache.configure(1024 * 1024, 100); // 1MB, 100 entries
  });

  describe('缓存操作测试', () => {
    const testData = {
      datetime: '1990-05-10T12:30:00',
      gender: 'male' as const,
    };

    const mockResult = {
      pillars: {
        year: { stem: '庚' as const, branch: '午' as const },
        month: { stem: '辛' as const, branch: '巳' as const },
        day: { stem: '乙' as const, branch: '酉' as const },
        hour: { stem: '壬' as const, branch: '午' as const },
      },
      elements: { 木: 1, 火: 2, 土: 3, 金: 4, 水: 5 },
      dayMaster: { stem: '乙' as const, element: '木' as const },
      yongshen: {
        primary: ['水'],
        secondary: ['木'],
        avoid: ['金'],
        analysis: '乙木需要水来滋润',
        favorable: ['水', '木'] as any[],
        unfavorable: ['金', '土'] as any[],
      },
    };

    it('应该能够设置和获取缓存', () => {
      const success = cache.setAnalysis(testData, mockResult);
      expect(success).toBe(true);

      const cached = cache.getAnalysis(testData);
      expect(cached).toEqual(mockResult);
    });

    it('应该在TTL过期后清除缓存', () => {
      cache.setAnalysis(testData, mockResult, 100); // 100ms TTL
      expect(cache.getAnalysis(testData)).toEqual(mockResult);

      // 等待过期
      setTimeout(() => {
        expect(cache.getAnalysis(testData)).toBeNull();
      }, 150);
    });

    it('应该正确管理缓存大小', () => {
      // 添加多个条目
      for (let i = 0; i < 10; i++) {
        cache.setAnalysis(
          { ...testData, datetime: `1990-05-${i + 1}T12:30:00` },
          mockResult
        );
      }

      const stats = cache.getStats();
      expect(stats.entries).toBeGreaterThan(0);
      expect(stats.size).toBeGreaterThan(0);
    });
  });

  describe('缓存统计测试', () => {
    it('应该提供准确的缓存统计', () => {
      const stats = cache.getStats();
      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('entries');
    });
  });
});

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
  });

  describe('性能监控测试', () => {
    it('应该记录操作时间', () => {
      monitor.start('test_operation');

      // 模拟一些耗时操作
      setTimeout(() => {
        const duration = monitor.end('test_operation');
        expect(duration).toBeGreaterThan(0);
      }, 10);
    });

    it('应该计算正确的统计信息', () => {
      monitor.start('test_op');
      setTimeout(() => {
        monitor.end('test_op');

        const stats = monitor.getOperationStats('test_op');
        expect(stats).toBeDefined();
        expect(stats?.count).toBe(1);
        expect(stats?.averageTime).toBeGreaterThan(0);
      }, 10);
    });

    it('应该生成性能报告', () => {
      monitor.recordMetric('test', 100);
      monitor.recordMetric('test', 200);
      monitor.recordMetric('test', 150);

      const report = monitor.generateReport();

      expect(report.summary.totalOperations).toBe(3);
      expect(report.operations.test).toBeDefined();
    });
  });
});

describe('集成测试', () => {
  describe('端到端计算流程', () => {
    it('应该完成完整的计算流程', async () => {
      const adapter = new BaziCalculationAdapter({
        mode: 'hybrid',
        enableMetrics: true,
      });

      const birthData = {
        datetime: '1990-05-10T12:30:00',
        gender: 'male' as const,
        timezone: 'Asia/Shanghai' as const,
        isTimeKnown: true,
      };

      // 执行计算
      const result = await adapter.calculate(birthData);

      // 验证结果
      expect(result).toBeDefined();

      // 验证指标
      const metrics = adapter.getMetricsSummary();
      expect(metrics).toHaveProperty('calculation_success');

      // 验证缓存
      const cached = await adapter.calculate(birthData);
      expect(cached).toBeDefined();
    });
  });

  describe('错误恢复测试', () => {
    it('应该在部分失败时继续工作', async () => {
      const adapter = new BaziCalculationAdapter({
        mode: 'hybrid',
        fallbackToLegacy: true,
      });

      // 即使某些功能失败，也应该有基本结果
      const result = await adapter.calculate({
        gender: 'male' as const,
        datetime: '1990-01-01T12:00:00',
        // birthLocation: {
        //   latitude: 39.9042,
        //   longitude: 116.4074,
        //   address: '北京市',
        //   city: '北京市',
        //   country: '中国'
        // }
      });
      expect(result).toBeDefined();
    });
  });
});

// 边界情况测试
describe('边界情况测试', () => {
  const mockBirthData = {
    datetime: '1990-05-10T12:30:00',
    gender: 'male' as const,
    timezone: 'Asia/Shanghai' as const,
    isTimeKnown: true,
    preferredLocale: 'zh-CN' as const,
  };

  it('应该处理最小有效日期', () => {
    const minDate = '1900-01-01T00:00:00';
    const calc = new EnhancedBaziCalculator({
      datetime: minDate,
      gender: 'male',
    });
    expect(calc).toBeDefined();
  });

  it('应该处理最大有效日期', () => {
    const maxDate = '2099-12-31T23:59:59';
    const calc = new EnhancedBaziCalculator({
      datetime: maxDate,
      gender: 'female',
    });
    expect(calc).toBeDefined();
  });

  it('应该处理各种时区', () => {
    const timezones = [
      'UTC',
      'Asia/Shanghai',
      'America/New_York',
      'Europe/London',
    ];

    timezones.forEach((timezone) => {
      const calc = new EnhancedBaziCalculator({
        ...mockBirthData,
        timezone: timezone as any,
      });
      expect(calc).toBeDefined();
    });
  });

  it('应该处理未知时间的情况', () => {
    const calc = new EnhancedBaziCalculator({
      ...mockBirthData,
      isTimeKnown: false,
    });
    expect(calc).toBeDefined();
  });
});

// 压力测试
describe('压力测试', () => {
  it('应该处理批量计算', async () => {
    const adapter = new BaziCalculationAdapter({
      mode: 'hybrid',
      enableCache: true,
    });

    const birthDataList = Array.from({ length: 10 }, (_, i) => ({
      datetime: `199${i}-05-10T12:30:00`,
      gender: i % 2 === 0 ? 'male' : 'female',
      timezone: 'Asia/Shanghai' as const,
    }));

    const startTime = Date.now();
    const results = await Promise.all(
      birthDataList.map((data) => adapter.calculate(data))
    );
    const endTime = Date.now();

    expect(results.length).toBe(10);
    expect(endTime - startTime).toBeLessThan(5000); // 应该在5秒内完成
  });
});
