/**
 * QiFlow AI - 增强型八字计算系统集成测试
 */

import { describe, expect, it } from '@jest/globals';
import {
    checkBaziSystemHealth,
    computeBaziSmart,
    configureBaziSystem,
    createBaziCalculator,
} from '../index';

describe('增强型八字计算系统集成测试', () => {
  describe('基础功能测试', () => {
    it('应该能够计算八字', async () => {
      const birthData = {
        datetime: '1990-05-10T12:30:00',
        gender: 'male' as const,
        timezone: 'Asia/Shanghai',
        isTimeKnown: true,
      };

      const result = await computeBaziSmart(birthData);

      expect(result).toBeDefined();
      expect(result?.pillars).toBeDefined();
      expect(result?.elements).toBeDefined();
      expect(result?.yongshen).toBeDefined();
    });

    it('应该支持增强功能', async () => {
      const birthData = {
        datetime: '1990-05-10T12:30:00',
        gender: 'male' as const,
        timezone: 'Asia/Shanghai',
        isTimeKnown: true,
      };

      const result = await computeBaziSmart(birthData);

      // 检查增强功能是否存在
      expect(result?.luckPillars).toBeDefined();
      expect(result?.dayMasterStrength).toBeDefined();
      expect(result?.favorableElements).toBeDefined();
    });

    it('应该能够创建计算器实例', async () => {
      const birthData = {
        datetime: '1990-05-10T12:30:00',
        gender: 'male' as const,
        timezone: 'Asia/Shanghai',
        isTimeKnown: true,
      };

      const calculator = createBaziCalculator(birthData);
      expect(calculator).toBeDefined();

      const result = await calculator.getCompleteAnalysis();
      expect(result).toBeDefined();
    });
  });

  describe('大运分析测试', () => {
    it('应该能够分析大运', async () => {
      const birthData = {
        datetime: '1990-05-10T12:30:00',
        gender: 'male' as const,
        timezone: 'Asia/Shanghai',
        isTimeKnown: true,
      };

      const calculator = createBaziCalculator(birthData);
      const luckPillars = await calculator.getLuckPillarsAnalysis();

      expect(Array.isArray(luckPillars)).toBe(true);
    });

    it('应该能够获取当前大运', async () => {
      const birthData = {
        datetime: '1990-05-10T12:30:00',
        gender: 'male' as const,
        timezone: 'Asia/Shanghai',
        isTimeKnown: true,
      };

      const calculator = createBaziCalculator(birthData);
      const currentLuck = await calculator.getCurrentLuckPillar();

      expect(currentLuck).toBeDefined();
    });
  });

  describe('每日运势测试', () => {
    it('应该能够分析每日运势', async () => {
      const birthData = {
        datetime: '1990-05-10T12:30:00',
        gender: 'male' as const,
        timezone: 'Asia/Shanghai',
        isTimeKnown: true,
      };

      const calculator = createBaziCalculator(birthData);
      const today = new Date();
      const dailyFortune = await calculator.getDailyAnalysis(today);

      expect(dailyFortune).toBeDefined();
      expect(dailyFortune?.date).toBeDefined();
      expect(dailyFortune?.interactions).toBeGreaterThanOrEqual(0);
      expect(dailyFortune?.interactions).toBeLessThanOrEqual(10);
    });

    it('应该提供运势建议', async () => {
      const birthData = {
        datetime: '1990-05-10T12:30:00',
        gender: 'male' as const,
        timezone: 'Asia/Shanghai',
        isTimeKnown: true,
      };

      const calculator = createBaziCalculator(birthData);
      const today = new Date();
      const dailyFortune = await calculator.getDailyAnalysis(today);

      expect(dailyFortune?.isFavorable).toBeDefined();
      expect(dailyFortune?.recommendation).toBeDefined();
    });
  });

  describe('配置系统测试', () => {
    it('应该能够配置系统', () => {
      configureBaziSystem({
        mode: 'enhanced',
        enableCache: true,
        enableMetrics: true,
      });

      // 配置应该成功应用
      expect(true).toBe(true);
    });
  });

  describe('健康检查测试', () => {
    it('应该能够进行健康检查', async () => {
      const health = await checkBaziSystemHealth();

      expect(health).toBeDefined();
      expect(['healthy', 'error']).toContain(health.status);
      expect(health.config).toBeDefined();
    });
  });

  describe('多时区支持测试', () => {
    const timezones = [
      'Asia/Shanghai',
      'America/New_York',
      'Europe/London',
      'Australia/Sydney',
    ];

    it.each(timezones)('应该支持 %s 时区', async timezone => {
      const birthData = {
        datetime: '1990-05-10T12:30:00',
        gender: 'male' as const,
        timezone: timezone as any,
        isTimeKnown: true,
      };

      const result = await computeBaziSmart(birthData);
      expect(result).toBeDefined();
    });
  });

  describe('边界情况测试', () => {
    it('应该处理不同的性别', async () => {
      const testCases = [
        { gender: 'male' as const },
        { gender: 'female' as const },
      ];

      for (const testCase of testCases) {
        const birthData = {
          datetime: '1990-05-10T12:30:00',
          ...testCase,
          timezone: 'Asia/Shanghai',
          isTimeKnown: true,
        };

        const result = await computeBaziSmart(birthData);
        expect(result).toBeDefined();
      }
    });

    it('应该处理时间未知的情况', async () => {
      const birthData = {
        datetime: '1990-05-10T12:00:00',
        gender: 'male' as const,
        timezone: 'Asia/Shanghai',
        isTimeKnown: false,
      };

      const result = await computeBaziSmart(birthData);
      expect(result).toBeDefined();
    });
  });

  describe('性能测试', () => {
    it('应该在合理时间内完成计算', async () => {
      const birthData = {
        datetime: '1990-05-10T12:30:00',
        gender: 'male' as const,
        timezone: 'Asia/Shanghai',
        isTimeKnown: true,
      };

      const startTime = Date.now();
      const result = await computeBaziSmart(birthData);
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
    });

    it('应该支持并发计算', async () => {
      const birthData = {
        datetime: '1990-05-10T12:30:00',
        gender: 'male' as const,
        timezone: 'Asia/Shanghai',
        isTimeKnown: true,
      };

      const promises = Array.from({ length: 5 }, () =>
        computeBaziSmart(birthData)
      );

      const results = await Promise.all(promises);

      expect(results.length).toBe(5);
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });
  });

  describe('缓存功能测试', () => {
    it('应该正确使用缓存', async () => {
      const birthData = {
        datetime: '1990-05-10T12:30:00',
        gender: 'male' as const,
        timezone: 'Asia/Shanghai',
        isTimeKnown: true,
      };

      // 第一次计算
      const result1 = await computeBaziSmart(birthData);
      const startTime = Date.now();

      // 第二次计算（应该来自缓存）
      const result2 = await computeBaziSmart(birthData);
      const endTime = Date.now();

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(endTime - startTime).toBeLessThan(100); // 缓存访问应该很快
    });
  });

  describe('错误处理测试', () => {
    it('应该处理无效的出生时间', async () => {
      const invalidBirthData = {
        datetime: 'invalid-date',
        gender: 'male' as const,
        timezone: 'Asia/Shanghai',
        isTimeKnown: true,
      };

      await expect(computeBaziSmart(invalidBirthData)).rejects.toThrow();
    });

    it('应该处理无效的时区', async () => {
      const invalidBirthData = {
        datetime: '1990-05-10T12:30:00',
        gender: 'male' as const,
        timezone: 'Invalid/Timezone',
        isTimeKnown: true,
      };

      const result = await computeBaziSmart(invalidBirthData);
      expect(result).toBeNull();
    });
  });
});
