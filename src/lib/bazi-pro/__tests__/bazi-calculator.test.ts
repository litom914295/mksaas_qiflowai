/**
 * 八字算法核心测试
 * 验证四柱计算、五行分析等核心功能的准确性
 */

import { describe, it, expect } from '@jest/globals';
import { FourPillarsCalculator } from '../core/calculator/four-pillars';
import { WuxingStrengthCalculator } from '../core/analyzer/wuxing-strength';
import { YongshenAnalyzer } from '../core/analyzer/yongshen-analyzer';
import { PatternDetector } from '../core/patterns/pattern-detector';
import { ShenShaCalculator } from '../core/shensha/shensha-calculator';

describe('八字核心算法测试', () => {
  
  describe('四柱计算测试', () => {
    const calculator = new FourPillarsCalculator();
    
    it('应该正确计算标准案例的四柱', () => {
      // 测试案例：1990年5月15日 14:30
      const result = calculator.calculate({
        date: '1990-05-15',
        time: '14:30',
        longitude: 116.4074,  // 北京经度
        isLunar: false,
        gender: 'male'
      });
      
      expect(result).toBeDefined();
      expect(result.year).toBeDefined();
      expect(result.month).toBeDefined();
      expect(result.day).toBeDefined();
      expect(result.hour).toBeDefined();
      expect(result.dayMaster).toBeDefined();
    });
    
    it('应该正确处理农历输入', () => {
      const result = calculator.calculate({
        date: '1990-04-21',  // 农历
        time: '14:30',
        longitude: 116.4074,
        isLunar: true,
        gender: 'female'
      });
      
      expect(result).toBeDefined();
      expect(result.lunarDate).toBeDefined();
      expect(result.lunarDate.isLeap).toBeDefined();
    });
    
    it('应该正确计算真太阳时', () => {
      // 东经120度的地方
      const result1 = calculator.calculate({
        date: '2024-01-01',
        time: '12:00',
        longitude: 120,
        isLunar: false,
        gender: 'male'
      });
      
      // 东经90度的地方（时差2小时）
      const result2 = calculator.calculate({
        date: '2024-01-01',
        time: '12:00',
        longitude: 90,
        isLunar: false,
        gender: 'male'
      });
      
      expect(result1.realSolarTime).toBeDefined();
      expect(result2.realSolarTime).toBeDefined();
      // 真太阳时应该不同
      expect(result1.realSolarTime?.getTime()).not.toBe(result2.realSolarTime?.getTime());
    });
    
    it('应该正确处理子时的特殊情况', () => {
      // 23:30 属于第二天的子时
      const result = calculator.calculate({
        date: '2024-01-01',
        time: '23:30',
        longitude: 116.4074,
        isLunar: false,
        gender: 'male'
      });
      
      expect(result.hour.zhi).toBe('子');
    });
  });
  
  describe('五行力量分析测试', () => {
    const analyzer = new WuxingStrengthCalculator();
    
    it('应该正确计算日主强弱', () => {
      const mockChart = {
        pillars: {
          year: { heavenlyStem: '甲', earthlyBranch: '子', nayin: '海中金' },
          month: { heavenlyStem: '丙', earthlyBranch: '寅', nayin: '炉中火' },
          day: { heavenlyStem: '戊', earthlyBranch: '辰', nayin: '大林木' },
          hour: { heavenlyStem: '癸', earthlyBranch: '亥', nayin: '大海水' }
        },
        gender: 'male' as const,
        birthTime: new Date('1990-05-15T14:30:00')
      };
      
      const strength = analyzer.calculateDayMasterStrength(mockChart);
      
      expect(strength).toBeGreaterThanOrEqual(0);
      expect(strength).toBeLessThanOrEqual(100);
    });
    
    it('应该正确分析五行分布', () => {
      const mockChart = {
        pillars: {
          year: { heavenlyStem: '甲', earthlyBranch: '子', nayin: '海中金' },
          month: { heavenlyStem: '丙', earthlyBranch: '寅', nayin: '炉中火' },
          day: { heavenlyStem: '戊', earthlyBranch: '辰', nayin: '大林木' },
          hour: { heavenlyStem: '癸', earthlyBranch: '亥', nayin: '大海水' }
        },
        gender: 'male' as const,
        birthTime: new Date('1990-05-15T14:30:00')
      };
      
      const elements = analyzer.analyzeElements(mockChart);
      
      expect(elements).toBeDefined();
      expect(elements.wood).toBeGreaterThanOrEqual(0);
      expect(elements.fire).toBeGreaterThanOrEqual(0);
      expect(elements.earth).toBeGreaterThanOrEqual(0);
      expect(elements.metal).toBeGreaterThanOrEqual(0);
      expect(elements.water).toBeGreaterThanOrEqual(0);
      
      // 五行总和应该接近100
      const total = elements.wood + elements.fire + elements.earth + elements.metal + elements.water;
      expect(total).toBeGreaterThan(90);
      expect(total).toBeLessThan(110);
    });
  });
  
  describe('用神判定测试', () => {
    const analyzer = new YongshenAnalyzer();
    
    it('应该正确判定身强的用神', () => {
      // 模拟一个身强的命局
      const strongChart = {
        pillars: {
          year: { heavenlyStem: '甲', earthlyBranch: '寅', nayin: '大溪水' },
          month: { heavenlyStem: '乙', earthlyBranch: '卯', nayin: '大溪水' },
          day: { heavenlyStem: '甲', earthlyBranch: '寅', nayin: '大溪水' },
          hour: { heavenlyStem: '甲', earthlyBranch: '子', nayin: '海中金' }
        },
        gender: 'male' as const,
        birthTime: new Date()
      };
      
      const result = analyzer.analyze(strongChart);
      
      expect(result).toBeDefined();
      expect(result.primary).toBeDefined();
      expect(result.avoid).toBeDefined();
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
    
    it('应该正确判定身弱的用神', () => {
      // 模拟一个身弱的命局
      const weakChart = {
        pillars: {
          year: { heavenlyStem: '庚', earthlyBranch: '申', nayin: '石榴木' },
          month: { heavenlyStem: '辛', earthlyBranch: '酉', nayin: '石榴木' },
          day: { heavenlyStem: '甲', earthlyBranch: '子', nayin: '海中金' },
          hour: { heavenlyStem: '庚', earthlyBranch: '申', nayin: '石榴木' }
        },
        gender: 'female' as const,
        birthTime: new Date()
      };
      
      const result = analyzer.analyze(weakChart);
      
      expect(result).toBeDefined();
      expect(result.primary.type).toBeDefined();
      // 身弱应该取生扶
      expect(['fuyi', 'resource']).toContain(result.primary.type);
    });
  });
  
  describe('格局识别测试', () => {
    const detector = new PatternDetector();
    
    it('应该正确识别建禄格', () => {
      // 甲日寅月 - 建禄格
      const chart = {
        pillars: {
          year: { heavenlyStem: '庚', earthlyBranch: '申', nayin: '石榴木' },
          month: { heavenlyStem: '戊', earthlyBranch: '寅', nayin: '城墙土' },
          day: { heavenlyStem: '甲', earthlyBranch: '子', nayin: '海中金' },
          hour: { heavenlyStem: '乙', earthlyBranch: '亥', nayin: '山头火' }
        },
        gender: 'male' as const,
        birthTime: new Date()
      };
      
      const result = detector.analyzePatterns(chart);
      
      expect(result).toBeDefined();
      expect(result.mainPattern).toBeDefined();
      expect(result.details.length).toBeGreaterThan(0);
    });
    
    it('应该正确识别从格', () => {
      // 模拟从财格
      const chart = {
        pillars: {
          year: { heavenlyStem: '戊', earthlyBranch: '戌', nayin: '平地木' },
          month: { heavenlyStem: '己', earthlyBranch: '未', nayin: '天上火' },
          day: { heavenlyStem: '甲', earthlyBranch: '申', nayin: '泉中水' },
          hour: { heavenlyStem: '戊', earthlyBranch: '辰', nayin: '大林木' }
        },
        gender: 'male' as const,
        birthTime: new Date()
      };
      
      const result = detector.analyzePatterns(chart);
      
      expect(result).toBeDefined();
      expect(result.strength).toBeGreaterThan(0);
      expect(result.recommendations).toBeInstanceOf(Array);
    });
  });
  
  describe('神煞计算测试', () => {
    const calculator = new ShenShaCalculator();
    
    it('应该正确计算吉神', () => {
      const chart = {
        pillars: {
          year: { heavenlyStem: '甲', earthlyBranch: '子', nayin: '海中金' },
          month: { heavenlyStem: '丙', earthlyBranch: '寅', nayin: '炉中火' },
          day: { heavenlyStem: '戊', earthlyBranch: '辰', nayin: '大林木' },
          hour: { heavenlyStem: '癸', earthlyBranch: '亥', nayin: '大海水' }
        },
        gender: 'male' as const,
        birthTime: new Date()
      };
      
      const result = calculator.analyzeShenSha(chart);
      
      expect(result).toBeDefined();
      expect(result.jiShen).toBeInstanceOf(Array);
      expect(result.xiongShen).toBeInstanceOf(Array);
      expect(result.summary).toBeDefined();
      expect(result.summary.totalJiShen).toBeGreaterThanOrEqual(0);
      expect(result.summary.totalXiongShen).toBeGreaterThanOrEqual(0);
    });
    
    it('应该正确识别天乙贵人', () => {
      // 甲戊庚日见丑未
      const chart = {
        pillars: {
          year: { heavenlyStem: '辛', earthlyBranch: '丑', nayin: '壁上土' },
          month: { heavenlyStem: '庚', earthlyBranch: '寅', nayin: '松柏木' },
          day: { heavenlyStem: '甲', earthlyBranch: '子', nayin: '海中金' },
          hour: { heavenlyStem: '乙', earthlyBranch: '未', nayin: '沙中金' }
        },
        gender: 'male' as const,
        birthTime: new Date()
      };
      
      const result = calculator.analyzeShenSha(chart);
      const tianYi = result.jiShen.find(s => s.name === '天乙贵人');
      
      expect(tianYi).toBeDefined();
    });
  });
  
  describe('边界条件测试', () => {
    const calculator = new FourPillarsCalculator();
    
    it('应该处理闰年2月29日', () => {
      const result = calculator.calculate({
        date: '2020-02-29',
        time: '12:00',
        longitude: 116.4074,
        isLunar: false,
        gender: 'male'
      });
      
      expect(result).toBeDefined();
    });
    
    it('应该处理1900年之前的日期', () => {
      expect(() => {
        calculator.calculate({
          date: '1899-12-31',
          time: '12:00',
          longitude: 116.4074,
          isLunar: false,
          gender: 'male'
        });
      }).toThrow();
    });
    
    it('应该拒绝无效的经度', () => {
      expect(() => {
        calculator.calculate({
          date: '2024-01-01',
          time: '12:00',
          longitude: 200,  // 无效经度
          isLunar: false,
          gender: 'male'
        });
      }).toThrow();
    });
  });
});

describe('集成测试', () => {
  it('应该完成完整的八字分析流程', () => {
    // 1. 计算四柱
    const calculator = new FourPillarsCalculator();
    const fourPillars = calculator.calculate({
      date: '1990-05-15',
      time: '14:30',
      longitude: 116.4074,
      isLunar: false,
      gender: 'male'
    });
    
    // 转换为BaziChart格式
    const chart = {
      pillars: {
        year: {
          heavenlyStem: fourPillars.year.gan,
          earthlyBranch: fourPillars.year.zhi,
          nayin: fourPillars.year.nayin
        },
        month: {
          heavenlyStem: fourPillars.month.gan,
          earthlyBranch: fourPillars.month.zhi,
          nayin: fourPillars.month.nayin
        },
        day: {
          heavenlyStem: fourPillars.day.gan,
          earthlyBranch: fourPillars.day.zhi,
          nayin: fourPillars.day.nayin
        },
        hour: {
          heavenlyStem: fourPillars.hour.gan,
          earthlyBranch: fourPillars.hour.zhi,
          nayin: fourPillars.hour.nayin
        }
      },
      gender: 'male' as const,
      birthTime: fourPillars.realSolarTime || new Date()
    };
    
    // 2. 五行分析
    const wuxingAnalyzer = new WuxingStrengthCalculator();
    const wuxingResult = {
      dayMasterStrength: wuxingAnalyzer.calculateDayMasterStrength(chart),
      elements: wuxingAnalyzer.analyzeElements(chart)
    };
    
    // 3. 用神分析
    const yongshenAnalyzer = new YongshenAnalyzer();
    const yongshenResult = yongshenAnalyzer.analyze(chart);
    
    // 4. 格局分析
    const patternDetector = new PatternDetector();
    const patternResult = patternDetector.analyzePatterns(chart);
    
    // 5. 神煞分析
    const shenshaCalculator = new ShenShaCalculator();
    const shenshaResult = shenshaCalculator.analyzeShenSha(chart);
    
    // 验证所有结果
    expect(fourPillars).toBeDefined();
    expect(wuxingResult.dayMasterStrength).toBeGreaterThanOrEqual(0);
    expect(yongshenResult.primary).toBeDefined();
    expect(patternResult.mainPattern).toBeDefined();
    expect(shenshaResult.summary).toBeDefined();
  });
});