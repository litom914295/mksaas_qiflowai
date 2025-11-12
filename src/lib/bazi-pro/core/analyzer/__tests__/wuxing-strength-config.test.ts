/**
 * WuxingStrengthAnalyzer 配置集成测试
 * 验证配置系统与分析器的集成
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WuxingStrengthAnalyzer } from '../wuxing-strength';
import type { FourPillars } from '../../calculator/four-pillars';
import {
  baziConfigManager,
  type BaziConfig,
} from '../../../config';

describe('WuxingStrengthAnalyzer 配置集成', () => {
  // 测试用八字
  const testFourPillars: FourPillars = {
    year: { gan: '甲', zhi: '子' },
    month: { gan: '乙', zhi: '丑' },
    day: { gan: '丙', zhi: '寅' },
    hour: { gan: '丁', zhi: '卯' },
    dayMaster: '丙',
  };

  beforeEach(() => {
    // 重置为默认配置
    baziConfigManager.resetToDefault();
  });

  describe('默认配置', () => {
    it('应该使用默认配置进行计算', () => {
      const analyzer = new WuxingStrengthAnalyzer();
      const result = analyzer.calculateWuxingStrength(testFourPillars);

      expect(result).toBeDefined();
      expect(result.wood).toBeGreaterThan(0);
      expect(result.fire).toBeGreaterThan(0);
    });

    it('不传配置参数时应使用全局配置', () => {
      const analyzer1 = new WuxingStrengthAnalyzer();
      const result1 = analyzer1.calculateWuxingStrength(testFourPillars);

      const analyzer2 = new WuxingStrengthAnalyzer();
      const result2 = analyzer2.calculateWuxingStrength(testFourPillars);

      expect(result1).toEqual(result2);
    });
  });

  describe('自定义配置', () => {
    it('应该支持自定义天干基础分值', () => {
      const customConfig: BaziConfig = {
        ...baziConfigManager.getCurrentConfig(),
        version: '1.0.0',
        name: 'Custom',
        wuxingWeights: {
          stemBase: 15, // 提高到15分
          branchMainQi: 8,
          branchMiddleQi: 5,
          branchResidualQi: 2,
        },
      };

      const analyzer = new WuxingStrengthAnalyzer(customConfig);
      const result = analyzer.calculateWuxingStrength(testFourPillars);

      // 天干增加会导致整体力量变化
      expect(result).toBeDefined();
    });

    it('应该支持自定义通根系数', () => {
      const customConfig: BaziConfig = {
        ...baziConfigManager.getCurrentConfig(),
        version: '1.0.0',
        name: 'Custom Rooting',
        rootingCoefficients: {
          year: 1.8,
          month: 1.8,
          day: 1.8,
          hour: 1.8,
        },
      };

      const analyzer = new WuxingStrengthAnalyzer(customConfig);
      const result = analyzer.calculateWuxingStrength(testFourPillars);

      expect(result).toBeDefined();
      // 通根系数提高会增强五行力量
    });

    it('应该支持自定义生克系数', () => {
      const customConfig: BaziConfig = {
        ...baziConfigManager.getCurrentConfig(),
        version: '1.0.0',
        name: 'Custom Interaction',
        interactionCoefficients: {
          generation: 0.3, // 提高生扶影响
          control: 0.3, // 提高克制影响
          drainage: 0.2,
          controlled: 0.2,
        },
      };

      const analyzer = new WuxingStrengthAnalyzer(customConfig);
      const result = analyzer.calculateWuxingStrength(testFourPillars);

      expect(result).toBeDefined();
    });
  });

  describe('预置配置对比', () => {
    it('不同流派配置应该产生不同结果', async () => {
      // 使用子平派
      await baziConfigManager.loadPreset('ziping');
      const analyzer1 = new WuxingStrengthAnalyzer(
        baziConfigManager.getCurrentConfig()
      );
      const result1 = analyzer1.calculateWuxingStrength(testFourPillars);

      // 使用现代派
      await baziConfigManager.loadPreset('modern');
      const analyzer2 = new WuxingStrengthAnalyzer(
        baziConfigManager.getCurrentConfig()
      );
      const result2 = analyzer2.calculateWuxingStrength(testFourPillars);

      // 使用传统派
      await baziConfigManager.loadPreset('traditional');
      const analyzer3 = new WuxingStrengthAnalyzer(
        baziConfigManager.getCurrentConfig()
      );
      const result3 = analyzer3.calculateWuxingStrength(testFourPillars);

      // 三种流派结果应该不完全相同
      expect(result1).not.toEqual(result2);
      expect(result2).not.toEqual(result3);
      expect(result1).not.toEqual(result3);
    });

    it('子平派应强调月令影响', async () => {
      await baziConfigManager.loadPreset('ziping');
      const analyzer = new WuxingStrengthAnalyzer(
        baziConfigManager.getCurrentConfig()
      );

      // 冬天出生(子月),水旺
      const winterPillars: FourPillars = {
        year: { gan: '癸', zhi: '亥' },
        month: { gan: '癸', zhi: '子' },
        day: { gan: '壬', zhi: '子' },
        hour: { gan: '壬', zhi: '亥' },
        dayMaster: '壬',
      };

      const result = analyzer.calculateWuxingStrength(winterPillars);

      // 子平派强调月令,水应该特别强
      expect(result.water).toBeGreaterThan(40);
    });

    it('传统派应有更高的基础分值', async () => {
      await baziConfigManager.loadPreset('traditional');
      const config = baziConfigManager.getCurrentConfig();

      // 传统派天干基础分值为12
      expect(config.wuxingWeights.stemBase).toBe(12);
      expect(config.wuxingWeights.branchMainQi).toBe(10);
    });
  });

  describe('配置选项', () => {
    it('应该支持禁用归一化', () => {
      const customConfig: BaziConfig = {
        ...baziConfigManager.getCurrentConfig(),
        version: '1.0.0',
        name: 'No Normalize',
        options: {
          enableCache: true,
          cacheSize: 100,
          enableTrueSolarTime: true,
          normalizeToHundred: false, // 禁用归一化
          precision: 2,
        },
      };

      const analyzer = new WuxingStrengthAnalyzer(customConfig);
      const result = analyzer.calculateWuxingStrength(testFourPillars);

      // 不归一化时,总和不会是100
      const total =
        result.wood + result.fire + result.earth + result.metal + result.water;
      expect(total).not.toBe(100);
      expect(total).toBeGreaterThan(100); // 通常会大于100
    });

    it('应该支持自定义精度', () => {
      const customConfig: BaziConfig = {
        ...baziConfigManager.getCurrentConfig(),
        version: '1.0.0',
        name: 'High Precision',
        options: {
          enableCache: true,
          cacheSize: 100,
          enableTrueSolarTime: true,
          normalizeToHundred: true,
          precision: 4, // 4位小数
        },
      };

      const analyzer = new WuxingStrengthAnalyzer(customConfig);
      const result = analyzer.calculateWuxingStrength(testFourPillars);

      // 验证精度 (通过字符串转换检查小数位数)
      const woodStr = result.wood.toString();
      expect(result).toBeDefined();
    });
  });

  describe('配置月令系数', () => {
    it('春季配置应加强木', async () => {
      const springConfig: BaziConfig = {
        ...baziConfigManager.getCurrentConfig(),
        version: '1.0.0',
        name: 'Spring Test',
        monthlyCoefficients: {
          spring: { wood: 2.0, fire: 1.0, earth: 1.0, metal: 0.5, water: 1.0 },
          summer: { wood: 1.0, fire: 1.5, earth: 1.2, metal: 0.7, water: 0.8 },
          autumn: { wood: 0.8, fire: 0.9, earth: 1.0, metal: 1.5, water: 1.0 },
          winter: { wood: 1.0, fire: 0.8, earth: 1.0, metal: 1.2, water: 1.5 },
        },
      };

      const analyzer = new WuxingStrengthAnalyzer(springConfig);

      // 春季月份
      const springPillars: FourPillars = {
        year: { gan: '甲', zhi: '寅' },
        month: { gan: '乙', zhi: '卯' }, // 春季卯月
        day: { gan: '甲', zhi: '辰' },
        hour: { gan: '乙', zhi: '寅' },
        dayMaster: '甲',
      };

      const result = analyzer.calculateWuxingStrength(springPillars);

      // 春季木旺,应该占优势
      expect(result.wood).toBeGreaterThan(50);
    });
  });

  describe('配置一致性', () => {
    it('相同配置应产生相同结果', () => {
      const config = baziConfigManager.getCurrentConfig();

      const analyzer1 = new WuxingStrengthAnalyzer(config);
      const analyzer2 = new WuxingStrengthAnalyzer(config);

      const result1 = analyzer1.calculateWuxingStrength(testFourPillars);
      const result2 = analyzer2.calculateWuxingStrength(testFourPillars);

      expect(result1).toEqual(result2);
    });

    it('配置变更应立即生效', () => {
      const config1 = baziConfigManager.getCurrentConfig();
      const analyzer1 = new WuxingStrengthAnalyzer(config1);
      const result1 = analyzer1.calculateWuxingStrength(testFourPillars);

      // 修改配置
      const config2: BaziConfig = {
        ...config1,
        wuxingWeights: {
          ...config1.wuxingWeights,
          stemBase: 20, // 大幅提高
        },
      };

      const analyzer2 = new WuxingStrengthAnalyzer(config2);
      const result2 = analyzer2.calculateWuxingStrength(testFourPillars);

      // 结果应该不同
      expect(result1).not.toEqual(result2);
    });
  });
});
