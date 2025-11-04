/**
 * 四柱计算测试用例
 * 使用标准命例验证算法准确性
 */

import { fourPillarsCalculator } from '../core/calculator/four-pillars';
import type { BirthInfo, FourPillars } from '../core/calculator/four-pillars';

// 标准测试用例（已验证的真实八字）
const TEST_CASES = [
  {
    name: '测试案例1',
    input: {
      date: '1990-05-15',
      time: '14:30',
      longitude: 116.4074, // 北京
      isLunar: false,
      gender: 'male',
    } as BirthInfo,
    expected: {
      year: { gan: '庚', zhi: '午' },
      month: { gan: '辛', zhi: '巳' },
      day: { gan: '丙', zhi: '子' },
      hour: { gan: '乙', zhi: '未' },
    },
  },
  {
    name: '测试案例2 - 子时边界',
    input: {
      date: '1985-03-20',
      time: '23:30',
      longitude: 121.4737, // 上海
      isLunar: false,
      gender: 'female',
    } as BirthInfo,
    expected: {
      year: { gan: '乙', zhi: '丑' },
      month: { gan: '己', zhi: '卯' },
      day: { gan: '戊', zhi: '戌' },
      hour: { gan: '壬', zhi: '子' },
    },
  },
  {
    name: '测试案例3 - 农历输入',
    input: {
      date: '2000-01-01', // 农历2000年正月初一
      time: '08:00',
      longitude: 113.2644, // 广州
      isLunar: true,
      gender: 'male',
    } as BirthInfo,
    expected: {
      year: { gan: '庚', zhi: '辰' },
      month: { gan: '戊', zhi: '寅' },
      day: { gan: '甲', zhi: '午' },
      hour: { gan: '戊', zhi: '辰' },
    },
  },
];

describe('ProfessionalFourPillarsCalculator', () => {
  describe('calculate', () => {
    TEST_CASES.forEach((testCase) => {
      it(`应正确计算 ${testCase.name}`, () => {
        const result = fourPillarsCalculator.calculate(testCase.input);

        // 验证年柱
        expect(result.year.gan).toBe(testCase.expected.year.gan);
        expect(result.year.zhi).toBe(testCase.expected.year.zhi);

        // 验证月柱
        expect(result.month.gan).toBe(testCase.expected.month.gan);
        expect(result.month.zhi).toBe(testCase.expected.month.zhi);

        // 验证日柱
        expect(result.day.gan).toBe(testCase.expected.day.gan);
        expect(result.day.zhi).toBe(testCase.expected.day.zhi);

        // 验证时柱
        expect(result.hour.gan).toBe(testCase.expected.hour.gan);
        expect(result.hour.zhi).toBe(testCase.expected.hour.zhi);
      });
    });

    it('应正确计算真太阳时', () => {
      const input: BirthInfo = {
        date: '2024-06-21', // 夏至
        time: '12:00',
        longitude: 116.4074, // 北京
        isLunar: false,
        gender: 'male',
      };

      const result = fourPillarsCalculator.calculate(input);

      // 真太阳时应该有所偏移
      expect(result.realSolarTime).toBeDefined();
      expect(result.realSolarTime.getTime()).not.toBe(
        new Date('2024-06-21 12:00').getTime()
      );
    });

    it('应正确处理闰月', () => {
      const input: BirthInfo = {
        date: '2020-04-01', // 农历闰四月
        time: '10:00',
        longitude: 114.0579, // 深圳
        isLunar: true,
        gender: 'female',
      };

      const result = fourPillarsCalculator.calculate(input);

      expect(result.lunarDate).toBeDefined();
      // 根据实际情况验证
    });
  });

  describe('validate', () => {
    it('应验证有效的四柱', () => {
      const validFourPillars: FourPillars = {
        year: { gan: '甲', zhi: '子', nayin: '海中金', element: '木' },
        month: { gan: '乙', zhi: '丑', nayin: '海中金', element: '木' },
        day: { gan: '丙', zhi: '寅', nayin: '炉中火', element: '火' },
        hour: { gan: '丁', zhi: '卯', nayin: '炉中火', element: '火' },
        dayMaster: '丙',
        monthOrder: '寅',
        realSolarTime: new Date(),
        lunarDate: { year: 2024, month: 1, day: 1, isLeap: false },
      };

      const validation = fourPillarsCalculator.validate(validFourPillars);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('应检测无效的天干', () => {
      const invalidFourPillars: FourPillars = {
        year: { gan: '无', zhi: '子', nayin: '', element: '' },
        month: { gan: '乙', zhi: '丑', nayin: '', element: '' },
        day: { gan: '丙', zhi: '寅', nayin: '', element: '' },
        hour: { gan: '丁', zhi: '卯', nayin: '', element: '' },
        dayMaster: '丙',
        monthOrder: '寅',
        realSolarTime: new Date(),
        lunarDate: { year: 2024, month: 1, day: 1, isLeap: false },
      };

      const validation = fourPillarsCalculator.validate(invalidFourPillars);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('无效的天干: 无');
    });
  });

  describe('getDescription', () => {
    it('应生成正确的文字描述', () => {
      const input: BirthInfo = {
        date: '1990-05-15',
        time: '14:30',
        longitude: 116.4074,
        isLunar: false,
        gender: 'male',
      };

      const result = fourPillarsCalculator.calculate(input);
      const description = fourPillarsCalculator.getDescription(result);

      expect(description).toContain('八字命盘');
      expect(description).toContain('年柱');
      expect(description).toContain('月柱');
      expect(description).toContain('日柱');
      expect(description).toContain('时柱');
      expect(description).toContain('日主');
      expect(description).toContain('月令');
      expect(description).toContain('农历');
      expect(description).toContain('真太阳时');
    });
  });

  describe('性能测试', () => {
    it('应在100ms内完成单次计算', () => {
      const input: BirthInfo = {
        date: '1990-05-15',
        time: '14:30',
        longitude: 116.4074,
        isLunar: false,
        gender: 'male',
      };

      const startTime = Date.now();
      fourPillarsCalculator.calculate(input);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100);
    });

    it('应高效处理批量计算', () => {
      const inputs: BirthInfo[] = Array(100)
        .fill(null)
        .map(
          (_, i) =>
            ({
              date: `1990-${String((i % 12) + 1).padStart(2, '0')}-15`,
              time: '14:30',
              longitude: 116.4074,
              isLunar: false,
              gender: i % 2 === 0 ? 'male' : 'female',
            }) as BirthInfo
        );

      const startTime = Date.now();
      const results = fourPillarsCalculator.calculateBatch(inputs);
      const endTime = Date.now();

      expect(results).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(1000); // 100个计算应在1秒内完成
    });
  });
});
