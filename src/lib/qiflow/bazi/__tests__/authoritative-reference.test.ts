/**
 * 权威数据验证测试
 */

import { describe, expect, it } from '@jest/globals';
import { 
  validateAuthoritativeData, 
  calculateAuthoritativeDayPillar,
  AUTHORITATIVE_DAY_PILLARS,
  generateSixtyJiazi 
} from '../authoritative-reference';

describe('权威干支数据验证', () => {
  it('应该生成正确的60甲子表', () => {
    const jiazi = generateSixtyJiazi();
    
    expect(jiazi.length).toBe(60);
    expect(jiazi[0]).toBe('甲子'); // 第1个
    expect(jiazi[1]).toBe('乙丑'); // 第2个
    expect(jiazi[59]).toBe('癸亥'); // 第60个
    
    // 检查是否有重复
    const uniqueJiazi = [...new Set(jiazi)];
    expect(uniqueJiazi.length).toBe(60);
    
    console.log('60甲子表 (前10个):', jiazi.slice(0, 10));
    console.log('60甲子表 (后10个):', jiazi.slice(-10));
  });

  it('应该正确计算基准日期', () => {
    const baseDate = new Date(1900, 0, 31); // 1900年1月31日
    const calculated = calculateAuthoritativeDayPillar(baseDate);
    
    expect(calculated).toBe('甲子');
    console.log('基准日期验证: 1900-01-31 =>', calculated);
  });

  it('应该验证所有权威数据的准确性', () => {
    const results = validateAuthoritativeData();
    
    console.log('\n权威数据验证结果:');
    let matchCount = 0;
    let totalCount = 0;
    
    for (const [dateStr, result] of Object.entries(results)) {
      console.log(`${dateStr}: 期望=${result.expected}, 计算=${result.calculated}, 匹配=${result.match ? '✓' : '✗'}`);
      if (result.match) matchCount++;
      totalCount++;
    }
    
    console.log(`\n匹配率: ${matchCount}/${totalCount} (${(matchCount/totalCount*100).toFixed(1)}%)`);
    
    // 要求至少90%的匹配率
    expect(matchCount / totalCount).toBeGreaterThanOrEqual(0.9);
  });

  it('应该处理连续日期的正确性', () => {
    // 测试连续几天的日柱计算
    const testDates = [
      '2000-01-01',
      '2000-01-02', 
      '2000-01-03',
      '2000-01-04',
      '2000-01-05'
    ];
    
    console.log('\n连续日期测试:');
    const results = [];
    
    for (const dateStr of testDates) {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      const pillar = calculateAuthoritativeDayPillar(date);
      results.push({ date: dateStr, pillar });
      console.log(`${dateStr} => ${pillar}`);
    }
    
    // 验证连续日期不应该有重复（在5天内不应该重复）
    const pillars = results.map(r => r.pillar);
    const uniquePillars = [...new Set(pillars)];
    expect(uniquePillars.length).toBe(pillars.length);
  });

  it('应该正确处理跨月跨年的日期', () => {
    const testCases = [
      { date: '1999-12-31', desc: '1999年最后一天' },
      { date: '2000-01-01', desc: '2000年第一天' },
      { date: '2000-02-28', desc: '2000年2月最后一天' },
      { date: '2000-02-29', desc: '2000年闰年2月29日' },
      { date: '2000-03-01', desc: '2000年3月第一天' },
    ];
    
    console.log('\n跨月跨年测试:');
    for (const testCase of testCases) {
      const [year, month, day] = testCase.date.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      const pillar = calculateAuthoritativeDayPillar(date);
      console.log(`${testCase.date} (${testCase.desc}) => ${pillar}`);
      
      expect(pillar).toBeDefined();
      expect(pillar.length).toBe(2); // 应该是两个字符
    }
  });
});

describe('甲子周期验证', () => {
  it('应该在60天后回到相同的日柱', () => {
    const baseDate = new Date(2000, 0, 1); // 2000年1月1日
    const basePillar = calculateAuthoritativeDayPillar(baseDate);
    
    // 60天后
    const cycleDate = new Date(baseDate);
    cycleDate.setDate(baseDate.getDate() + 60);
    const cyclePillar = calculateAuthoritativeDayPillar(cycleDate);
    
    console.log(`基准日期: ${baseDate.toISOString().slice(0, 10)} => ${basePillar}`);
    console.log(`60天后: ${cycleDate.toISOString().slice(0, 10)} => ${cyclePillar}`);
    
    expect(cyclePillar).toBe(basePillar);
  });

  it('应该测试多个甲子周期', () => {
    const baseDate = new Date(1900, 0, 31); // 甲子基准日
    const basePillar = calculateAuthoritativeDayPillar(baseDate);
    
    // 测试1甲子、2甲子、3甲子后的情况
    [1, 2, 3, 5, 10].forEach(cycles => {
      const testDate = new Date(baseDate);
      testDate.setDate(baseDate.getDate() + cycles * 60);
      const testPillar = calculateAuthoritativeDayPillar(testDate);
      
      console.log(`${cycles}甲子后 (${cycles * 60}天): ${testDate.toISOString().slice(0, 10)} => ${testPillar}`);
      expect(testPillar).toBe(basePillar);
    });
  });
});