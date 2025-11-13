/**
 * 真太阳时计算测试
 * 验证计算精度和边界情况处理
 */

import { TrueSolarTimeCalculator } from '../true-solar-time';

describe('TrueSolarTimeCalculator', () => {
  const calculator = new TrueSolarTimeCalculator();

  describe('基本计算功能', () => {
    test('标准案例: 北京时间 2024-01-01 12:00', () => {
      const result = calculator.calculate({
        date: new Date('2024-01-01T12:00:00'),
        longitude: 116.4074, // 北京
      });

      // 北京经度 116.4 与标准经度 120 差 -3.6度
      // 时差约 -14.4分钟
      // 1月1日时间方程约 -3分钟
      // 总计约 -17分钟
      // 预期真太阳时约 11:43

      expect(result.getHours()).toBe(11);
      expect(result.getMinutes()).toBeCloseTo(43, 0); // 允许±1分钟误差
    });

    test('标准案例: 上海时间 2024-06-21 12:00', () => {
      const result = calculator.calculate({
        date: new Date('2024-06-21T12:00:00'),
        longitude: 121.4737, // 上海
      });

      // 上海经度 121.5 与标准经度 120 差 1.5度
      // 时差约 +6分钟
      // 6月21日时间方程约 -2分钟
      // 总计约 +4分钟
      // 预期真太阳时约 12:04

      expect(result.getHours()).toBe(12);
      expect(result.getMinutes()).toBeCloseTo(4, 1);
    });

    test('极端案例: 乌鲁木齐 2024-03-21 14:00', () => {
      const result = calculator.calculate({
        date: new Date('2024-03-21T14:00:00'),
        longitude: 87.6177, // 乌鲁木齐
      });

      // 乌鲁木齐经度 87.6 与标准经度 120 差 -32.4度
      // 时差约 -129.6分钟 (约-2小时10分钟)
      // 预期真太阳时约 11:50

      expect(result.getHours()).toBe(11);
      expect(result.getMinutes()).toBeCloseTo(50, 5);
    });
  });

  describe('增强版计算 - calculateDetailed', () => {
    test('标准案例: 返回详细校正信息', () => {
      const result = calculator.calculateDetailed({
        date: new Date('2024-01-01T12:00:00'),
        longitude: 116.4074,
      });

      // 验证返回结构
      expect(result).toHaveProperty('trueSolarTime');
      expect(result).toHaveProperty('corrections');
      expect(result).toHaveProperty('warnings');

      // 验证校正值
      expect(result.corrections.longitudeMinutes).toBeCloseTo(-14.4, 1);
      expect(result.corrections.equationMinutes).toBeCloseTo(-3, 1);
      expect(result.corrections.totalMinutes).toBeCloseTo(-17, 1);

      // 正常情况不应有警告
      expect(result.warnings.length).toBe(0);
    });

    test('边界警告: 接近子时 (22:59)', () => {
      const result = calculator.calculateDetailed({
        date: new Date('2024-06-15T22:59:00'),
        longitude: 121.5,
      });

      // 应该有边界警告
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some((w) => w.includes('接近时辰边界'))).toBe(
        true
      );
    });

    test('边界警告: 子时前半 (23:30)', () => {
      const result = calculator.calculateDetailed({
        date: new Date('2024-06-15T23:30:00'),
        longitude: 120,
      });

      // 应该有子时前半警告
      expect(result.warnings.some((w) => w.includes('子时前半'))).toBe(true);
    });

    test('边界警告: 子时后半 (00:30)', () => {
      const result = calculator.calculateDetailed({
        date: new Date('2024-06-15T00:30:00'),
        longitude: 120,
      });

      // 应该有子时后半警告
      expect(result.warnings.some((w) => w.includes('子时后半'))).toBe(true);
    });

    test('边界警告: 极端经度差', () => {
      const result = calculator.calculateDetailed({
        date: new Date('2024-03-21T14:00:00'),
        longitude: 87.6,
      });

      // 应该有经度差警告
      expect(result.warnings.some((w) => w.includes('经度差'))).toBe(true);
    });
  });

  describe('精度验证 - 与已知天文数据对比', () => {
    // 测试案例来源: USNO (美国海军天文台) 数据
    const testCases = [
      {
        date: '2024-02-11', // 时间方程最大负值日
        longitude: 120,
        expectedEquation: -14, // 约-14分钟
        description: '时间方程最大负值',
      },
      {
        date: '2024-11-03', // 时间方程最大正值日
        longitude: 120,
        expectedEquation: +16, // 约+16分钟
        description: '时间方程最大正值',
      },
      {
        date: '2024-04-15', // 时间方程约为0
        longitude: 120,
        expectedEquation: 0,
        description: '时间方程接近零',
      },
    ];

    testCases.forEach(({ date, longitude, expectedEquation, description }) => {
      test(description, () => {
        const result = calculator.calculateDetailed({
          date: new Date(`${date}T12:00:00`),
          longitude,
        });

        // 验证时间方程的精度（允许±2分钟误差）
        expect(result.corrections.equationMinutes).toBeCloseTo(
          expectedEquation,
          0
        );
      });
    });
  });

  describe('辅助功能测试', () => {
    test('获取城市经度', () => {
      expect(calculator.getCityLongitude('北京')).toBeCloseTo(116.4074, 4);
      expect(calculator.getCityLongitude('上海')).toBeCloseTo(121.4737, 4);
      expect(calculator.getCityLongitude('广州')).toBeCloseTo(113.2644, 4);
      expect(calculator.getCityLongitude('不存在的城市')).toBeNull();
    });

    test('验证经度有效性', () => {
      expect(calculator.isValidLongitude(120)).toBe(true);
      expect(calculator.isValidLongitude(180)).toBe(true);
      expect(calculator.isValidLongitude(-180)).toBe(true);
      expect(calculator.isValidLongitude(181)).toBe(false);
      expect(calculator.isValidLongitude(-181)).toBe(false);
    });

    test('获取时区偏移', () => {
      expect(calculator.getTimezoneOffset(120)).toBe(8); // UTC+8
      expect(calculator.getTimezoneOffset(0)).toBe(0); // UTC
      expect(calculator.getTimezoneOffset(-75)).toBe(-5); // UTC-5
    });
  });

  describe('性能测试', () => {
    test('单次计算耗时 < 10ms', () => {
      const start = performance.now();

      calculator.calculate({
        date: new Date('2024-01-01T12:00:00'),
        longitude: 116.4074,
      });

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(10);
    });

    test('批量计算 1000次 < 1s', () => {
      const configs = Array.from({ length: 1000 }, (_, i) => ({
        date: new Date(`2024-01-01T${String(i % 24).padStart(2, '0')}:00:00`),
        longitude: 116.4074,
      }));

      const start = performance.now();
      calculator.calculateBatch(configs);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(1000);
      console.log(`批量计算1000次耗时: ${duration.toFixed(2)}ms`);
    });
  });

  describe('边界条件测试', () => {
    test('最小年份: 1900', () => {
      expect(() => {
        calculator.calculate({
          date: new Date('1900-01-01T12:00:00'),
          longitude: 120,
        });
      }).not.toThrow();
    });

    test('最大年份: 2100', () => {
      expect(() => {
        calculator.calculate({
          date: new Date('2100-12-31T12:00:00'),
          longitude: 120,
        });
      }).not.toThrow();
    });

    test('闰年2月29日', () => {
      expect(() => {
        calculator.calculate({
          date: new Date('2024-02-29T12:00:00'),
          longitude: 120,
        });
      }).not.toThrow();
    });

    test('东西经交界: 180度', () => {
      const result = calculator.calculate({
        date: new Date('2024-01-01T12:00:00'),
        longitude: 180,
      });

      expect(result).toBeInstanceOf(Date);
      expect(isNaN(result.getTime())).toBe(false);
    });

    test('东西经交界: -180度', () => {
      const result = calculator.calculate({
        date: new Date('2024-01-01T12:00:00'),
        longitude: -180,
      });

      expect(result).toBeInstanceOf(Date);
      expect(isNaN(result.getTime())).toBe(false);
    });
  });

  describe('精度对比: 改进前vs改进后', () => {
    test('验证5项傅里叶级数的精度提升', () => {
      // 使用已知的天文数据作为基准
      const testDate = new Date('2024-02-11T12:00:00'); // 时间方程最大负值日

      const result = calculator.calculateDetailed({
        date: testDate,
        longitude: 120,
      });

      // 改进前的简化公式精度约±2分钟
      // 改进后的5项级数精度约±30秒
      // 验证计算结果在合理范围内
      expect(Math.abs(result.corrections.equationMinutes - -14)).toBeLessThan(
        0.5
      );
    });
  });
});
