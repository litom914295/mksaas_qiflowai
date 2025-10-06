/**
 * QiFlow AI - 简化的日支计算验证测试
 * 
 * 只使用已验证的权威数据进行测试
 */

import { describe, expect, it } from '@jest/globals';
import { createEnhancedBaziCalculator } from '../enhanced-calculator';

describe('日支计算准确性验证 - 已验证数据', () => {
  // 只使用已经通过在线工具验证的日期
  const verifiedSamples = [
    {
      name: '2000年1月1日 - 戊午日（权威基准）',
      input: {
        datetime: '2000-01-01T12:00:00',
        gender: 'male' as const,
        timezone: 'Asia/Shanghai',
        isTimeKnown: true,
      },
      expected: {
        day: '戊午',
        dayBranch: '午'
      }
    },
    {
      name: '2000年1月2日 - 己未日',
      input: {
        datetime: '2000-01-02T12:00:00',
        gender: 'female' as const,
        timezone: 'Asia/Shanghai',
        isTimeKnown: true,
      },
      expected: {
        day: '己未',
        dayBranch: '未'
      }
    },
    {
      name: '2000年1月3日 - 庚申日',
      input: {
        datetime: '2000-01-03T12:00:00',
        gender: 'male' as const,
        timezone: 'Asia/Shanghai',
        isTimeKnown: true,
      },
      expected: {
        day: '庚申',
        dayBranch: '申'
      }
    },
    {
      name: '1990年5月10日 - 乙亥日（搜索验证）',
      input: {
        datetime: '1990-05-10T12:30:00',
        gender: 'male' as const,
        timezone: 'Asia/Shanghai',
        isTimeKnown: true,
      },
      expected: {
        day: '乙亥',
        dayBranch: '亥'
      }
    }
  ];

  // 验证已确认的权威样本
  verifiedSamples.forEach((sample, index) => {
    it(`${sample.name}`, async () => {
      console.log(`\n测试 ${index + 1}: ${sample.name}`);
      console.log(`输入: ${sample.input.datetime}`);
      console.log(`期望: ${sample.expected.day} (日支: ${sample.expected.dayBranch})`);
      
      const calculator = createEnhancedBaziCalculator(sample.input);
      const result = await calculator.getCompleteAnalysis();
      
      expect(result).toBeDefined();
      expect(result?.pillars?.day).toBeDefined();
      
      const actualDay = result?.pillars?.day ? `${result.pillars.day.stem}${result.pillars.day.branch}` : undefined;
      const actualDayBranch = result?.pillars?.day?.branch;
      
      console.log(`实际: ${actualDay} (日支: ${actualDayBranch})`);
      
      // 验证日柱完整性
      expect(actualDay).toBe(sample.expected.day);
      
      // 验证日支准确性 (重点)
      expect(actualDayBranch).toBe(sample.expected.dayBranch);
      
      console.log(`✓ ${sample.name} 验证通过`);
    });
  });

  describe('连续日期一致性验证', () => {
    it('应该在连续的日期产生连续的干支', async () => {
      const dates = [];
      
      // 生成连续7天的日期字符串
      const testDates = [
        '2000-01-01T12:00:00',
        '2000-01-02T12:00:00', 
        '2000-01-03T12:00:00',
        '2000-01-04T12:00:00',
        '2000-01-05T12:00:00',
        '2000-01-06T12:00:00',
        '2000-01-07T12:00:00'
      ];
      
      for (const datetime of testDates) {
        const calculator = createEnhancedBaziCalculator({
          datetime,
          gender: 'male',
          timezone: 'Asia/Shanghai',
          isTimeKnown: true,
        });
        
        const result = await calculator.getCompleteAnalysis();
        dates.push({
          date: datetime.slice(0, 10),
          dayPillar: result?.pillars?.day ? `${result.pillars.day.stem}${result.pillars.day.branch}` : undefined,
          dayBranch: result?.pillars?.day?.branch
        });
      }
      
      console.log('\n连续7天的日柱验证:');
      dates.forEach((d, i) => {
        console.log(`${d.date} => ${d.dayPillar} (${d.dayBranch})`);
      });
      
      // 验证连续性：每一天的日柱都应该不同
      const pillars = dates.map(d => d.dayPillar);
      const uniquePillars = [...new Set(pillars)];
      expect(uniquePillars.length).toBe(pillars.length);
      
      // 验证已知的正确日期
      expect(dates[0].dayPillar).toBe('戊午'); // 2000-01-01
      expect(dates[1].dayPillar).toBe('己未'); // 2000-01-02
      expect(dates[2].dayPillar).toBe('庚申'); // 2000-01-03
    });

    it('应该正确处理子时跨日边界', async () => {
      // 测试子时跨日的关键时间点
      const testTimes = [
        { time: '2000-01-01T22:30:00', desc: '22:30 (当日戌时)', shouldBe: '戊午' },
        { time: '2000-01-01T23:00:00', desc: '23:00 (次日子时)', shouldBe: '己未' },
        { time: '2000-01-01T23:30:00', desc: '23:30 (次日子时)', shouldBe: '己未' },
        { time: '2000-01-02T00:00:00', desc: '00:00 (当日子时)', shouldBe: '己未' },
        { time: '2000-01-02T00:30:00', desc: '00:30 (当日子时)', shouldBe: '己未' },
        { time: '2000-01-02T01:00:00', desc: '01:00 (当日丑时)', shouldBe: '己未' },
      ];
      
      console.log('\n子时跨日边界验证:');
      
      for (const test of testTimes) {
        const calculator = createEnhancedBaziCalculator({
          datetime: test.time,
          gender: 'male',
          timezone: 'Asia/Shanghai',
          isTimeKnown: true,
        });
        
        const result = await calculator.getCompleteAnalysis();
        const actualDayPillar = result?.pillars?.day ? `${result.pillars.day.stem}${result.pillars.day.branch}` : undefined;
        
        console.log(`${test.time} (${test.desc}) => ${actualDayPillar}, 期望: ${test.shouldBe}`);
        
        expect(actualDayPillar).toBe(test.shouldBe);
      }
    });
  });

  describe('甲子周期验证', () => {
    it('应该在60天后回到相同的干支', async () => {
      const baseDate = new Date(2000, 0, 1);
      
      const calculator1 = createEnhancedBaziCalculator({
        datetime: baseDate.toISOString().slice(0, 19),
        gender: 'male',
        timezone: 'Asia/Shanghai',
        isTimeKnown: true,
      });
      
      const result1 = await calculator1.getCompleteAnalysis();
      const baseDayPillar = result1?.pillars?.day ? `${result1.pillars.day.stem}${result1.pillars.day.branch}` : undefined;
      
      // 60天后
      const cycleDate = new Date(baseDate);
      cycleDate.setDate(baseDate.getDate() + 60);
      
      const calculator2 = createEnhancedBaziCalculator({
        datetime: cycleDate.toISOString().slice(0, 19),
        gender: 'male',
        timezone: 'Asia/Shanghai',
        isTimeKnown: true,
      });
      
      const result2 = await calculator2.getCompleteAnalysis();
      const cycleDayPillar = result2?.pillars?.day ? `${result2.pillars.day.stem}${result2.pillars.day.branch}` : undefined;
      
      console.log(`\n甲子周期验证:`);
      console.log(`基准: ${baseDate.toISOString().slice(0, 10)} => ${baseDayPillar}`);
      console.log(`60天后: ${cycleDate.toISOString().slice(0, 10)} => ${cycleDayPillar}`);
      
      expect(cycleDayPillar).toBe(baseDayPillar);
    });

    it('应该在一个甲子周期内产生60个不同的干支', async () => {
      const baseDate = new Date(2000, 0, 1);
      const dayPillars = [];
      
      for (let i = 0; i < 60; i++) {
        const testDate = new Date(baseDate);
        testDate.setDate(baseDate.getDate() + i);
        
        const calculator = createEnhancedBaziCalculator({
          datetime: testDate.toISOString().slice(0, 19),
          gender: 'male',
          timezone: 'Asia/Shanghai',
          isTimeKnown: true,
        });
        
        const result = await calculator.getCompleteAnalysis();
        dayPillars.push(result?.pillars?.day ? `${result.pillars.day.stem}${result.pillars.day.branch}` : undefined);
      }
      
      // 验证60天内没有重复的日柱
      const uniqueDayPillars = [...new Set(dayPillars)];
      
      console.log(`\n60甲子周期验证: 生成了 ${uniqueDayPillars.length}/60 个不同的干支`);
      console.log('前10个:', dayPillars.slice(0, 10));
      console.log('后10个:', dayPillars.slice(-10));
      
      expect(uniqueDayPillars.length).toBe(60);
      
      // 第61天应该回到第1天
      const day61Date = new Date(baseDate);
      day61Date.setDate(baseDate.getDate() + 60);
      
      const calculator61 = createEnhancedBaziCalculator({
        datetime: day61Date.toISOString().slice(0, 19),
        gender: 'male',
        timezone: 'Asia/Shanghai',
        isTimeKnown: true,
      });
      
      const result61 = await calculator61.getCompleteAnalysis();
      const day61Pillar = result61?.pillars?.day ? `${result61.pillars.day.stem}${result61.pillars.day.branch}` : undefined;
      const day1Pillar = dayPillars[0];
      
      console.log(`第61天验证: ${day61Pillar} vs 第1天: ${day1Pillar}`);
      expect(day61Pillar).toBe(day1Pillar);
    });
  });
});