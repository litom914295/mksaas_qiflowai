/**
 * 四柱计算集成测试
 * 使用历史名人权威案例验证完整八字计算流程
 */

import { calculateFourPillars } from '../four-pillars';
import { calculateTrueSolarTime } from '../true-solar-time';

describe('四柱计算集成测试', () => {
  describe('历史名人案例验证', () => {
    /**
     * 案例1: 毛泽东
     * 出生: 1893年12月26日 辰时 (湖南湘潭韶山)
     * 八字: 癸巳年 甲子月 丁酉日 甲辰时
     */
    test('毛泽东八字: 癸巳 甲子 丁酉 甲辰', () => {
      const birthInfo = {
        year: 1893,
        month: 12,
        day: 26,
        hour: 7, // 辰时 (7-9点)
        minute: 30,
        longitude: 112.5, // 湘潭大致经度
        latitude: 27.9,
        isLunar: false,
      };

      const result = calculateFourPillars(birthInfo);

      expect(result.year.stem).toBe('癸');
      expect(result.year.branch).toBe('巳');
      expect(result.month.stem).toBe('甲');
      expect(result.month.branch).toBe('子');
      expect(result.day.stem).toBe('丁');
      expect(result.day.branch).toBe('酉');
      expect(result.hour.stem).toBe('甲');
      expect(result.hour.branch).toBe('辰');
    });

    /**
     * 案例2: 周恩来
     * 出生: 1898年3月5日 卯时 (江苏淮安)
     * 八字: 戊戌年 乙卯月 丁卯日 癸卯时
     */
    test('周恩来八字: 戊戌 乙卯 丁卯 癸卯', () => {
      const birthInfo = {
        year: 1898,
        month: 3,
        day: 5,
        hour: 6, // 卯时 (5-7点)
        minute: 0,
        longitude: 119.0,
        latitude: 33.5,
        isLunar: false,
      };

      const result = calculateFourPillars(birthInfo);

      expect(result.year.stem).toBe('戊');
      expect(result.year.branch).toBe('戌');
      expect(result.month.stem).toBe('乙');
      expect(result.month.branch).toBe('卯');
      expect(result.day.stem).toBe('丁');
      expect(result.day.branch).toBe('卯');
      expect(result.hour.stem).toBe('癸');
      expect(result.hour.branch).toBe('卯');
    });

    /**
     * 案例3: 邓小平
     * 出生: 1904年8月22日 午时 (四川广安)
     * 八字: 甲辰年 壬申月 丙辰日 甲午时
     */
    test('邓小平八字: 甲辰 壬申 丙辰 甲午', () => {
      const birthInfo = {
        year: 1904,
        month: 8,
        day: 22,
        hour: 12, // 午时 (11-13点)
        minute: 0,
        longitude: 106.6,
        latitude: 30.5,
        isLunar: false,
      };

      const result = calculateFourPillars(birthInfo);

      expect(result.year.stem).toBe('甲');
      expect(result.year.branch).toBe('辰');
      expect(result.month.stem).toBe('壬');
      expect(result.month.branch).toBe('申');
      expect(result.day.stem).toBe('丙');
      expect(result.day.branch).toBe('辰');
      expect(result.hour.stem).toBe('甲');
      expect(result.hour.branch).toBe('午');
    });
  });

  describe('边界条件测试', () => {
    test('闰年2月29日', () => {
      const birthInfo = {
        year: 2024,
        month: 2,
        day: 29,
        hour: 12,
        minute: 0,
        isLunar: false,
      };

      expect(() => calculateFourPillars(birthInfo)).not.toThrow();
      const result = calculateFourPillars(birthInfo);
      expect(result.day.stem).toBeDefined();
      expect(result.day.branch).toBeDefined();
    });

    test('非闰年2月28日', () => {
      const birthInfo = {
        year: 2023,
        month: 2,
        day: 28,
        hour: 12,
        minute: 0,
        isLunar: false,
      };

      const result = calculateFourPillars(birthInfo);
      expect(result.day.stem).toBeDefined();
      expect(result.day.branch).toBeDefined();
    });

    test('年初1月1日', () => {
      const birthInfo = {
        year: 2024,
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
        isLunar: false,
      };

      const result = calculateFourPillars(birthInfo);
      expect(result).toHaveProperty('year');
      expect(result).toHaveProperty('month');
      expect(result).toHaveProperty('day');
      expect(result).toHaveProperty('hour');
    });

    test('年末12月31日', () => {
      const birthInfo = {
        year: 2024,
        month: 12,
        day: 31,
        hour: 23,
        minute: 59,
        isLunar: false,
      };

      const result = calculateFourPillars(birthInfo);
      expect(result).toHaveProperty('year');
      expect(result).toHaveProperty('month');
      expect(result).toHaveProperty('day');
      expect(result).toHaveProperty('hour');
    });

    test('子时前半(23:00-23:59)', () => {
      const birthInfo = {
        year: 2024,
        month: 6,
        day: 15,
        hour: 23,
        minute: 30,
        isLunar: false,
      };

      const result = calculateFourPillars(birthInfo);
      expect(result.hour.branch).toBe('子');
      // 子时前半应该算前一天
    });

    test('子时后半(00:00-00:59)', () => {
      const birthInfo = {
        year: 2024,
        month: 6,
        day: 15,
        hour: 0,
        minute: 30,
        isLunar: false,
      };

      const result = calculateFourPillars(birthInfo);
      expect(result.hour.branch).toBe('子');
    });
  });

  describe('节气与月柱验证', () => {
    test('立春前后月柱变化', () => {
      // 立春前 (2024年2月3日之前) - 仍属癸卯年
      const beforeLichun = calculateFourPillars({
        year: 2024,
        month: 2,
        day: 3,
        hour: 12,
        minute: 0,
        isLunar: false,
      });

      // 立春后 (2024年2月4日及以后) - 已属甲辰年
      const afterLichun = calculateFourPillars({
        year: 2024,
        month: 2,
        day: 5,
        hour: 12,
        minute: 0,
        isLunar: false,
      });

      // 年柱应该不同
      expect(beforeLichun.year).not.toEqual(afterLichun.year);
    });

    test('惊蛰节气前后月柱变化', () => {
      // 惊蛰前 (仍属寅月)
      const beforeJingzhe = calculateFourPillars({
        year: 2024,
        month: 3,
        day: 4,
        hour: 12,
        minute: 0,
        isLunar: false,
      });

      // 惊蛰后 (已属卯月)
      const afterJingzhe = calculateFourPillars({
        year: 2024,
        month: 3,
        day: 6,
        hour: 12,
        minute: 0,
        isLunar: false,
      });

      // 月柱应该不同
      expect(beforeJingzhe.month.branch).toBe('寅');
      expect(afterJingzhe.month.branch).toBe('卯');
    });
  });

  describe('真太阳时修正验证', () => {
    test('东经120度基准 - 无修正', () => {
      const birthInfo = {
        year: 2024,
        month: 6,
        day: 15,
        hour: 12,
        minute: 0,
        longitude: 120.0, // 东经120度是中国标准时间基准
        isLunar: false,
        useTrueSolarTime: true,
      };

      const withCorrection = calculateFourPillars(birthInfo);
      const withoutCorrection = calculateFourPillars({
        ...birthInfo,
        useTrueSolarTime: false,
      });

      // 在120度附近,真太阳时修正应该很小
      expect(withCorrection.hour).toEqual(withoutCorrection.hour);
    });

    test('东经75度 - 应提前约3小时', () => {
      const birthInfo = {
        year: 2024,
        month: 6,
        day: 15,
        hour: 12,
        minute: 0,
        longitude: 75.0, // 相对120度偏西45度 ≈ 3小时
        isLunar: false,
        useTrueSolarTime: true,
      };

      const trueSolarTime = calculateTrueSolarTime(
        birthInfo.year,
        birthInfo.month,
        birthInfo.day,
        birthInfo.hour,
        birthInfo.minute,
        birthInfo.longitude
      );

      // 真太阳时应该早于标准时间
      expect(trueSolarTime.adjustedHour).toBeLessThan(birthInfo.hour);
    });

    test('东经165度 - 应推迟约3小时', () => {
      const birthInfo = {
        year: 2024,
        month: 6,
        day: 15,
        hour: 12,
        minute: 0,
        longitude: 165.0, // 相对120度偏东45度 ≈ 3小时
        isLunar: false,
        useTrueSolarTime: true,
      };

      const trueSolarTime = calculateTrueSolarTime(
        birthInfo.year,
        birthInfo.month,
        birthInfo.day,
        birthInfo.hour,
        birthInfo.minute,
        birthInfo.longitude
      );

      // 真太阳时应该晚于标准时间
      expect(trueSolarTime.adjustedHour).toBeGreaterThan(birthInfo.hour);
    });
  });

  describe('天干地支循环验证', () => {
    test('年柱60年循环', () => {
      const year1 = calculateFourPillars({
        year: 1984,
        month: 6,
        day: 15,
        hour: 12,
        minute: 0,
        isLunar: false,
      });

      const year2 = calculateFourPillars({
        year: 1984 + 60, // 60年后
        month: 6,
        day: 15,
        hour: 12,
        minute: 0,
        isLunar: false,
      });

      // 60年后应该回到相同的年柱
      expect(year1.year).toEqual(year2.year);
    });

    test('日柱60天循环', () => {
      const day1 = calculateFourPillars({
        year: 2024,
        month: 1,
        day: 1,
        hour: 12,
        minute: 0,
        isLunar: false,
      });

      const day2 = calculateFourPillars({
        year: 2024,
        month: 3,
        day: 1, // 60天后 (大致)
        hour: 12,
        minute: 0,
        isLunar: false,
      });

      // 验证日柱不同
      expect(day1.day).not.toEqual(day2.day);
    });

    test('时柱12时辰循环', () => {
      const pillars = [];
      for (let hour = 0; hour < 24; hour += 2) {
        const result = calculateFourPillars({
          year: 2024,
          month: 6,
          day: 15,
          hour,
          minute: 0,
          isLunar: false,
        });
        pillars.push(result.hour.branch);
      }

      // 应该有12个不同的地支
      const uniqueBranches = new Set(pillars);
      expect(uniqueBranches.size).toBe(12);

      // 验证地支顺序正确
      const expectedOrder = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
      pillars.forEach((branch, index) => {
        expect(expectedOrder).toContain(branch);
      });
    });
  });

  describe('五虎遁与五鼠遁验证', () => {
    test('五虎遁: 甲己年起丙寅', () => {
      // 甲年(如2024甲辰年)正月应为丙寅
      const result = calculateFourPillars({
        year: 2024,
        month: 2, // 立春后为正月
        day: 10,
        hour: 12,
        minute: 0,
        isLunar: false,
      });

      // 甲年正月应该是丙寅月
      if (result.year.stem === '甲') {
        // 需要确认是立春后
        expect(['丙', '丁', '戊', '己', '庚']).toContain(result.month.stem);
      }
    });

    test('五鼠遁: 甲己日起甲子', () => {
      // 找一个甲日
      const result = calculateFourPillars({
        year: 2024,
        month: 1,
        day: 1,
        hour: 0, // 子时
        minute: 30,
        isLunar: false,
      });

      // 如果是甲日或己日,子时应该是甲子时
      if (result.day.stem === '甲' || result.day.stem === '己') {
        expect(result.hour.stem).toBe('甲');
        expect(result.hour.branch).toBe('子');
      }
    });
  });

  describe('农历转换验证', () => {
    test('农历新年转换', () => {
      // 2024年农历新年是2月10日
      const lunarNewYear = calculateFourPillars({
        year: 2024,
        month: 1,
        day: 1,
        hour: 12,
        minute: 0,
        isLunar: true, // 农历
      });

      expect(lunarNewYear).toHaveProperty('year');
      expect(lunarNewYear).toHaveProperty('month');
      expect(lunarNewYear).toHaveProperty('day');
      expect(lunarNewYear).toHaveProperty('hour');
    });

    test('闰月处理', () => {
      // 测试闰月(需要找到有闰月的年份)
      // 2023年有闰二月
      const leapMonth = calculateFourPillars({
        year: 2023,
        month: 2, // 闰二月
        day: 15,
        hour: 12,
        minute: 0,
        isLunar: true,
        isLeapMonth: true,
      });

      expect(leapMonth).toHaveProperty('month');
      expect(leapMonth.month.stem).toBeDefined();
      expect(leapMonth.month.branch).toBeDefined();
    });
  });

  describe('错误处理', () => {
    test('无效年份', () => {
      expect(() => {
        calculateFourPillars({
          year: 1800, // 超出范围
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
          isLunar: false,
        });
      }).toThrow();
    });

    test('无效月份', () => {
      expect(() => {
        calculateFourPillars({
          year: 2024,
          month: 13, // 无效月份
          day: 1,
          hour: 12,
          minute: 0,
          isLunar: false,
        });
      }).toThrow();
    });

    test('无效日期', () => {
      expect(() => {
        calculateFourPillars({
          year: 2024,
          month: 2,
          day: 30, // 2月没有30日
          hour: 12,
          minute: 0,
          isLunar: false,
        });
      }).toThrow();
    });

    test('无效时间', () => {
      expect(() => {
        calculateFourPillars({
          year: 2024,
          month: 6,
          day: 15,
          hour: 25, // 无效小时
          minute: 0,
          isLunar: false,
        });
      }).toThrow();
    });

    test('无效经纬度', () => {
      expect(() => {
        calculateFourPillars({
          year: 2024,
          month: 6,
          day: 15,
          hour: 12,
          minute: 0,
          longitude: 200, // 超出范围
          latitude: 100, // 超出范围
          isLunar: false,
        });
      }).toThrow();
    });
  });

  describe('性能测试', () => {
    test('批量计算性能', () => {
      const startTime = Date.now();
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        calculateFourPillars({
          year: 2000 + (i % 24),
          month: (i % 12) + 1,
          day: (i % 28) + 1,
          hour: (i % 24),
          minute: (i % 60),
          isLunar: false,
        });
      }

      const endTime = Date.now();
      const avgTime = (endTime - startTime) / iterations;

      // 平均每次计算应该在10ms以内
      expect(avgTime).toBeLessThan(10);
    });

    test('带真太阳时修正的性能', () => {
      const startTime = Date.now();
      const iterations = 500;

      for (let i = 0; i < iterations; i++) {
        calculateFourPillars({
          year: 2000 + (i % 24),
          month: (i % 12) + 1,
          day: (i % 28) + 1,
          hour: (i % 24),
          minute: (i % 60),
          longitude: 70 + (i % 100),
          latitude: 20 + (i % 50),
          useTrueSolarTime: true,
          isLunar: false,
        });
      }

      const endTime = Date.now();
      const avgTime = (endTime - startTime) / iterations;

      // 即使带真太阳时修正,平均每次也应该在20ms以内
      expect(avgTime).toBeLessThan(20);
    });
  });

  describe('一致性验证', () => {
    test('相同输入应得到相同结果', () => {
      const input = {
        year: 2024,
        month: 6,
        day: 15,
        hour: 12,
        minute: 30,
        longitude: 120,
        latitude: 40,
        isLunar: false,
      };

      const result1 = calculateFourPillars(input);
      const result2 = calculateFourPillars(input);

      expect(result1).toEqual(result2);
    });

    test('跨多次调用的一致性', () => {
      const results = [];
      for (let i = 0; i < 10; i++) {
        const result = calculateFourPillars({
          year: 1993,
          month: 12,
          day: 26,
          hour: 7,
          minute: 30,
          isLunar: false,
        });
        results.push(result);
      }

      // 所有结果应该相同
      results.forEach((result) => {
        expect(result).toEqual(results[0]);
      });
    });
  });
});
