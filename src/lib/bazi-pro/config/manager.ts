/**
 * 八字配置管理器
 * 管理配置的加载、验证、切换和持久化
 */

import type {
  BaziConfig,
  ConfigExport,
  ConfigValidationResult,
  PresetConfigName,
} from './types';
import { BaziConfigSchema } from './types';

/**
 * 配置管理器
 * 单例模式,管理全局配置状态
 */
export class BaziConfigManager {
  private static instance: BaziConfigManager;
  private currentConfig: BaziConfig;
  private presetConfigs: Map<PresetConfigName, BaziConfig> = new Map();
  private listeners: Set<(config: BaziConfig) => void> = new Set();

  private constructor() {
    // 初始化时加载默认配置 (modern)
    this.currentConfig = this.createDefaultConfig();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): BaziConfigManager {
    if (!BaziConfigManager.instance) {
      BaziConfigManager.instance = new BaziConfigManager();
    }
    return BaziConfigManager.instance;
  }

  /**
   * 创建默认配置 (现代派)
   */
  private createDefaultConfig(): BaziConfig {
    return {
      version: '1.0.0',
      name: 'Modern (Default)',
      description: '现代平衡算法,综合考虑各项因素',
      school: 'modern',
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
      options: {
        enableCache: true,
        cacheSize: 100,
        enableTrueSolarTime: true,
        normalizeToHundred: true,
        precision: 2,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * 验证配置
   */
  public validateConfig(config: unknown): ConfigValidationResult {
    try {
      const validatedConfig = BaziConfigSchema.parse(config);
      return {
        success: true,
        config: validatedConfig,
      };
    } catch (error) {
      if (error instanceof Error && 'errors' in error) {
        const zodError = error as {
          errors: Array<{ path: Array<string | number>; message: string }>;
        };
        return {
          success: false,
          errors: zodError.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        };
      }
      return {
        success: false,
        errors: [
          {
            path: 'unknown',
            message: error instanceof Error ? error.message : 'Unknown error',
          },
        ],
      };
    }
  }

  /**
   * 获取当前配置
   */
  public getCurrentConfig(): BaziConfig {
    return { ...this.currentConfig };
  }

  /**
   * 设置当前配置
   */
  public setConfig(config: BaziConfig): void {
    const validation = this.validateConfig(config);
    if (!validation.success) {
      throw new Error(
        `Invalid configuration: ${validation.errors?.map((e) => `${e.path}: ${e.message}`).join(', ')}`
      );
    }

    this.currentConfig = {
      ...config,
      updatedAt: new Date().toISOString(),
    };
    this.notifyListeners();
  }

  /**
   * 更新部分配置
   */
  public updateConfig(updates: Partial<BaziConfig>): void {
    const newConfig = {
      ...this.currentConfig,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.setConfig(newConfig);
  }

  /**
   * 加载预置配置
   */
  public async loadPreset(preset: PresetConfigName): Promise<void> {
    // 先从缓存中查找
    const cached = this.presetConfigs.get(preset);
    if (cached) {
      this.setConfig(cached);
      return;
    }

    // 动态导入预置配置
    try {
      const module = await import(`./presets/${preset}.json`);
      const config = module.default as BaziConfig;

      const validation = this.validateConfig(config);
      if (!validation.success) {
        throw new Error(
          `Invalid preset configuration: ${validation.errors?.map((e) => `${e.path}: ${e.message}`).join(', ')}`
        );
      }

      // 缓存配置
      this.presetConfigs.set(preset, validation.config!);
      this.setConfig(validation.config!);
    } catch (error) {
      throw new Error(
        `Failed to load preset '${preset}': ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * 从JSON加载配置
   */
  public loadFromJSON(json: string): void {
    try {
      const config = JSON.parse(json) as BaziConfig;
      this.setConfig(config);
    } catch (error) {
      throw new Error(
        `Failed to parse configuration JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * 导出当前配置为JSON
   */
  public exportToJSON(pretty = true): string {
    const exportData: ConfigExport = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      config: this.currentConfig,
    };
    return JSON.stringify(exportData, null, pretty ? 2 : 0);
  }

  /**
   * 重置为默认配置
   */
  public resetToDefault(): void {
    this.currentConfig = this.createDefaultConfig();
    this.notifyListeners();
  }

  /**
   * 订阅配置变更
   */
  public subscribe(listener: (config: BaziConfig) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 通知所有订阅者
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.getCurrentConfig());
      } catch (error) {
        console.error('Error in config listener:', error);
      }
    });
  }

  /**
   * 获取配置摘要
   */
  public getConfigSummary(): {
    name: string;
    school?: string;
    version: string;
    lastUpdated: string;
  } {
    return {
      name: this.currentConfig.name,
      school: this.currentConfig.school,
      version: this.currentConfig.version,
      lastUpdated: this.currentConfig.updatedAt || 'Unknown',
    };
  }

  /**
   * 比较两个配置
   */
  public compareConfigs(
    config1: BaziConfig,
    config2: BaziConfig
  ): {
    identical: boolean;
    differences: string[];
  } {
    const differences: string[] = [];

    // 比较五行权重
    if (
      JSON.stringify(config1.wuxingWeights) !==
      JSON.stringify(config2.wuxingWeights)
    ) {
      differences.push('wuxingWeights');
    }

    // 比较通根系数
    if (
      JSON.stringify(config1.rootingCoefficients) !==
      JSON.stringify(config2.rootingCoefficients)
    ) {
      differences.push('rootingCoefficients');
    }

    // 比较月令系数
    if (
      JSON.stringify(config1.monthlyCoefficients) !==
      JSON.stringify(config2.monthlyCoefficients)
    ) {
      differences.push('monthlyCoefficients');
    }

    // 比较相互作用系数
    if (
      JSON.stringify(config1.interactionCoefficients) !==
      JSON.stringify(config2.interactionCoefficients)
    ) {
      differences.push('interactionCoefficients');
    }

    // 比较选项
    if (JSON.stringify(config1.options) !== JSON.stringify(config2.options)) {
      differences.push('options');
    }

    return {
      identical: differences.length === 0,
      differences,
    };
  }
}

/**
 * 导出单例实例
 */
export const baziConfigManager = BaziConfigManager.getInstance();

/**
 * 便捷函数:获取当前配置
 */
export function getCurrentConfig(): BaziConfig {
  return baziConfigManager.getCurrentConfig();
}

/**
 * 便捷函数:加载预置配置
 */
export async function loadPreset(preset: PresetConfigName): Promise<void> {
  return baziConfigManager.loadPreset(preset);
}

/**
 * 便捷函数:验证配置
 */
export function validateConfig(config: unknown): ConfigValidationResult {
  return baziConfigManager.validateConfig(config);
}
