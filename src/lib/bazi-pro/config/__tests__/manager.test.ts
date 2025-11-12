/**
 * 配置管理器测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BaziConfigManager } from '../manager';
import type { BaziConfig } from '../types';

describe('BaziConfigManager', () => {
  let manager: BaziConfigManager;

  beforeEach(() => {
    manager = BaziConfigManager.getInstance();
    manager.resetToDefault();
  });

  describe('单例模式', () => {
    it('应该返回同一个实例', () => {
      const instance1 = BaziConfigManager.getInstance();
      const instance2 = BaziConfigManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('默认配置', () => {
    it('应该加载默认配置', () => {
      const config = manager.getCurrentConfig();
      expect(config.name).toBe('Modern (Default)');
      expect(config.school).toBe('modern');
      expect(config.version).toBe('1.0.0');
    });

    it('默认配置应该有效', () => {
      const config = manager.getCurrentConfig();
      const validation = manager.validateConfig(config);
      expect(validation.success).toBe(true);
    });
  });

  describe('配置验证', () => {
    it('应该验证有效配置', () => {
      const validConfig: BaziConfig = {
        version: '1.0.0',
        name: 'Test Config',
        wuxingWeights: {
          stemBase: 10,
          branchMainQi: 8,
          branchMiddleQi: 5,
          branchResidualQi: 2,
        },
        rootingCoefficients: {
          year: 1.2,
          month: 1.5,
          day: 1.5,
          hour: 1.1,
        },
        monthlyCoefficients: {
          spring: { wood: 1.5, fire: 1.2, earth: 1.0, metal: 0.8, water: 1.0 },
          summer: { wood: 1.0, fire: 1.5, earth: 1.2, metal: 0.7, water: 0.8 },
          autumn: { wood: 0.8, fire: 0.9, earth: 1.0, metal: 1.5, water: 1.0 },
          winter: { wood: 1.0, fire: 0.8, earth: 1.0, metal: 1.2, water: 1.5 },
        },
        interactionCoefficients: {
          generation: 0.15,
          control: 0.15,
          drainage: 0.1,
          controlled: 0.1,
        },
      };

      const validation = manager.validateConfig(validConfig);
      expect(validation.success).toBe(true);
      expect(validation.config).toBeDefined();
    });

    it('应该拒绝无效的版本格式', () => {
      const invalidConfig = {
        version: 'invalid',
        name: 'Test',
        wuxingWeights: {
          stemBase: 10,
          branchMainQi: 8,
          branchMiddleQi: 5,
          branchResidualQi: 2,
        },
        rootingCoefficients: {
          year: 1.2,
          month: 1.5,
          day: 1.5,
          hour: 1.1,
        },
        monthlyCoefficients: {
          spring: { wood: 1.5, fire: 1.2, earth: 1.0, metal: 0.8, water: 1.0 },
          summer: { wood: 1.0, fire: 1.5, earth: 1.2, metal: 0.7, water: 0.8 },
          autumn: { wood: 0.8, fire: 0.9, earth: 1.0, metal: 1.5, water: 1.0 },
          winter: { wood: 1.0, fire: 0.8, earth: 1.0, metal: 1.2, water: 1.5 },
        },
        interactionCoefficients: {
          generation: 0.15,
          control: 0.15,
          drainage: 0.1,
          controlled: 0.1,
        },
      };

      const validation = manager.validateConfig(invalidConfig);
      expect(validation.success).toBe(false);
      expect(validation.errors).toBeDefined();
      expect(validation.errors?.length).toBeGreaterThan(0);
    });

    it('应该拒绝超出范围的数值', () => {
      const invalidConfig = {
        version: '1.0.0',
        name: 'Test',
        wuxingWeights: {
          stemBase: 100, // 超出最大值 20
          branchMainQi: 8,
          branchMiddleQi: 5,
          branchResidualQi: 2,
        },
        rootingCoefficients: {
          year: 1.2,
          month: 1.5,
          day: 1.5,
          hour: 1.1,
        },
        monthlyCoefficients: {
          spring: { wood: 1.5, fire: 1.2, earth: 1.0, metal: 0.8, water: 1.0 },
          summer: { wood: 1.0, fire: 1.5, earth: 1.2, metal: 0.7, water: 0.8 },
          autumn: { wood: 0.8, fire: 0.9, earth: 1.0, metal: 1.5, water: 1.0 },
          winter: { wood: 1.0, fire: 0.8, earth: 1.0, metal: 1.2, water: 1.5 },
        },
        interactionCoefficients: {
          generation: 0.15,
          control: 0.15,
          drainage: 0.1,
          controlled: 0.1,
        },
      };

      const validation = manager.validateConfig(invalidConfig);
      expect(validation.success).toBe(false);
    });
  });

  describe('配置设置和更新', () => {
    it('应该设置有效配置', () => {
      const newConfig: BaziConfig = {
        version: '1.0.0',
        name: 'New Config',
        wuxingWeights: {
          stemBase: 12,
          branchMainQi: 10,
          branchMiddleQi: 6,
          branchResidualQi: 3,
        },
        rootingCoefficients: {
          year: 1.3,
          month: 1.6,
          day: 1.6,
          hour: 1.2,
        },
        monthlyCoefficients: {
          spring: { wood: 1.5, fire: 1.2, earth: 1.0, metal: 0.8, water: 1.0 },
          summer: { wood: 1.0, fire: 1.5, earth: 1.2, metal: 0.7, water: 0.8 },
          autumn: { wood: 0.8, fire: 0.9, earth: 1.0, metal: 1.5, water: 1.0 },
          winter: { wood: 1.0, fire: 0.8, earth: 1.0, metal: 1.2, water: 1.5 },
        },
        interactionCoefficients: {
          generation: 0.2,
          control: 0.2,
          drainage: 0.15,
          controlled: 0.15,
        },
      };

      manager.setConfig(newConfig);
      const current = manager.getCurrentConfig();
      expect(current.name).toBe('New Config');
      expect(current.wuxingWeights.stemBase).toBe(12);
    });

    it('应该拒绝无效配置', () => {
      const invalidConfig = {
        version: 'invalid',
        name: 'Test',
      } as unknown as BaziConfig;

      expect(() => manager.setConfig(invalidConfig)).toThrow();
    });

    it('应该更新部分配置', () => {
      const originalName = manager.getCurrentConfig().name;
      manager.updateConfig({ name: 'Updated Name' });
      
      const updated = manager.getCurrentConfig();
      expect(updated.name).toBe('Updated Name');
      expect(updated.version).toBe('1.0.0'); // 其他字段保持不变
    });
  });

  describe('配置导入导出', () => {
    it('应该导出配置为JSON', () => {
      const json = manager.exportToJSON();
      expect(json).toBeTruthy();
      
      const parsed = JSON.parse(json);
      expect(parsed.version).toBe('1.0.0');
      expect(parsed.config).toBeDefined();
      expect(parsed.exportedAt).toBeDefined();
    });

    it('应该从JSON导入配置', () => {
      const originalConfig = manager.getCurrentConfig();
      const json = JSON.stringify(originalConfig);
      
      manager.updateConfig({ name: 'Different Name' });
      manager.loadFromJSON(json);
      
      const restoredConfig = manager.getCurrentConfig();
      expect(restoredConfig.name).toBe(originalConfig.name);
    });

    it('应该拒绝无效的JSON', () => {
      expect(() => manager.loadFromJSON('invalid json')).toThrow();
    });
  });

  describe('配置监听器', () => {
    it('应该订阅配置变更', () => {
      let notified = false;
      let newConfig: BaziConfig | null = null;

      const unsubscribe = manager.subscribe((config) => {
        notified = true;
        newConfig = config;
      });

      manager.updateConfig({ name: 'Changed Name' });

      expect(notified).toBe(true);
      expect(newConfig?.name).toBe('Changed Name');

      unsubscribe();
    });

    it('应该取消订阅', () => {
      let notifyCount = 0;

      const unsubscribe = manager.subscribe(() => {
        notifyCount++;
      });

      manager.updateConfig({ name: 'First' });
      expect(notifyCount).toBe(1);

      unsubscribe();
      manager.updateConfig({ name: 'Second' });
      expect(notifyCount).toBe(1); // 不再增加
    });
  });

  describe('配置比较', () => {
    it('应该检测相同配置', () => {
      const config1 = manager.getCurrentConfig();
      const config2 = manager.getCurrentConfig();

      const comparison = manager.compareConfigs(config1, config2);
      expect(comparison.identical).toBe(true);
      expect(comparison.differences).toHaveLength(0);
    });

    it('应该检测不同配置', () => {
      const config1 = manager.getCurrentConfig();
      const config2 = {
        ...config1,
        wuxingWeights: {
          ...config1.wuxingWeights,
          stemBase: 15,
        },
      };

      const comparison = manager.compareConfigs(config1, config2);
      expect(comparison.identical).toBe(false);
      expect(comparison.differences).toContain('wuxingWeights');
    });
  });

  describe('配置摘要', () => {
    it('应该获取配置摘要', () => {
      const summary = manager.getConfigSummary();
      expect(summary.name).toBeTruthy();
      expect(summary.version).toBeTruthy();
      expect(summary.lastUpdated).toBeTruthy();
    });
  });

  describe('重置配置', () => {
    it('应该重置为默认配置', () => {
      manager.updateConfig({ name: 'Changed' });
      expect(manager.getCurrentConfig().name).toBe('Changed');

      manager.resetToDefault();
      expect(manager.getCurrentConfig().name).toBe('Modern (Default)');
    });
  });
});
