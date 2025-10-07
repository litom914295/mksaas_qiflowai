/**
 * 输入解析器单元测试
 */

import { describe, it, expect } from 'vitest';
import { InputParser } from '../input-parser';

describe('InputParser', () => {
  describe('parseBirthInfo', () => {
    it('应该解析标准日期时间格式', () => {
      const result = InputParser.parseBirthInfo('我是1990年1月1日12点30分出生的男生');
      
      expect(result).not.toBeNull();
      expect(result?.date).toBe('1990-01-01');
      expect(result?.time).toBe('12:30');
      expect(result?.gender).toBe('male');
    });

    it('应该解析ISO日期格式', () => {
      const result = InputParser.parseBirthInfo('1990-01-01 12:30 女');
      
      expect(result).not.toBeNull();
      expect(result?.date).toBe('1990-01-01');
      expect(result?.time).toBe('12:30');
      expect(result?.gender).toBe('female');
    });

    it('应该识别"点半"时间格式', () => {
      const result = InputParser.parseBirthInfo('1990年1月1日12点半');
      
      expect(result).not.toBeNull();
      expect(result?.time).toBe('12:30');
    });

    it('应该识别"点整"时间格式', () => {
      const result = InputParser.parseBirthInfo('1990年1月1日12点整');
      
      expect(result).not.toBeNull();
      expect(result?.time).toBe('12:00');
    });

    it('缺少时间时应该使用默认值12:00', () => {
      const result = InputParser.parseBirthInfo('1990年1月1日出生');
      
      expect(result).not.toBeNull();
      expect(result?.time).toBe('12:00');
    });

    it('应该识别城市地点', () => {
      const result = InputParser.parseBirthInfo('1990年1月1日在北京市出生');
      
      expect(result).not.toBeNull();
      expect(result?.location).toBe('北京市');
    });

    it('无日期信息应该返回null', () => {
      const result = InputParser.parseBirthInfo('我想了解命理');
      
      expect(result).toBeNull();
    });
  });

  describe('parseHouseInfo', () => {
    it('应该解析房屋朝向信息', () => {
      const result = InputParser.parseHouseInfo('我家朝向180度，坐山0度');
      
      expect(result).not.toBeNull();
      expect(result?.facing).toBe(180);
      expect(result?.mountain).toBe(0);
    });

    it('应该解析建造年份', () => {
      const result = InputParser.parseHouseInfo('房子2015年建造，朝向南方');
      
      expect(result).not.toBeNull();
      expect(result?.buildYear).toBe(2015);
    });

    it('应该识别地点', () => {
      const result = InputParser.parseHouseInfo('朝向180度，位于上海市');
      
      expect(result).not.toBeNull();
      expect(result?.location).toBe('上海市');
    });

    it('无房屋信息应该返回null', () => {
      const result = InputParser.parseHouseInfo('我想了解风水');
      
      expect(result).toBeNull();
    });
  });

  describe('parseInput', () => {
    it('应该识别八字类型输入', () => {
      const result = InputParser.parseInput('1990年1月1日12点30分男');
      
      expect(result.type).toBe('bazi');
      expect(result.confidence).toBeGreaterThan(0.6);
      expect(result.data).not.toBeNull();
    });

    it('应该识别风水类型输入', () => {
      const result = InputParser.parseInput('房屋朝向180度');
      
      expect(result.type).toBe('fengshui');
      expect(result.data).not.toBeNull();
    });

    it('应该标记缺失的字段', () => {
      const result = InputParser.parseInput('1990年1月1日');  // 缺少时间和性别
      
      expect(result.type).toBe('bazi');
      expect(result.missingFields).toContain('性别');
      expect(result.missingFields).toContain('出生时间');
    });

    it('信息完整时不应该有缺失字段', () => {
      const result = InputParser.parseInput('1990年1月1日12点30分男');
      
      expect(result.missingFields).toHaveLength(0);
    });

    it('未知类型应该返回unknown', () => {
      const result = InputParser.parseInput('今天天气怎么样');
      
      expect(result.type).toBe('unknown');
      expect(result.confidence).toBe(0);
    });
  });

  describe('generateSupplementPrompt', () => {
    it('应该生成补充信息提示', () => {
      const parsed = InputParser.parseInput('1990年1月1日');
      const prompt = InputParser.generateSupplementPrompt(parsed);
      
      expect(prompt).toContain('性别');
      expect(prompt).toContain('出生时间');
    });

    it('信息完整时应该提示正在分析', () => {
      const parsed = InputParser.parseInput('1990年1月1日12点30分男');
      const prompt = InputParser.generateSupplementPrompt(parsed);
      
      expect(prompt).toContain('正在为您进行分析');
    });

    it('未知类型应该返回空字符串', () => {
      const parsed = InputParser.parseInput('今天天气怎么样');
      const prompt = InputParser.generateSupplementPrompt(parsed);
      
      expect(prompt).toBe('');
    });
  });

  describe('边界情况', () => {
    it('应该处理空字符串', () => {
      const result = InputParser.parseInput('');
      
      expect(result.type).toBe('unknown');
    });

    it('应该处理特殊字符', () => {
      const result = InputParser.parseBirthInfo('1990-01-01 12:30 ♂');
      
      expect(result?.gender).toBe('male');
    });

    it('应该处理不规范的日期', () => {
      const result = InputParser.parseBirthInfo('1990年1月1号');
      
      expect(result?.date).toBe('1990-01-01');
    });

    it('应该处理单数字月份和日期', () => {
      const result = InputParser.parseBirthInfo('1990年1月1日');
      
      expect(result?.date).toBe('1990-01-01');
    });
  });
});
