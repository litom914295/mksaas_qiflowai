/**
 * 八字配置系统
 * 提供灵活的配置管理,支持不同流派算法
 */

// 导出类型
export type {
  BaziConfig,
  BaziOptions,
  WuxingWeightsConfig,
  RootingCoefficientsConfig,
  MonthlyCoefficientsConfig,
  InteractionCoefficientsConfig,
  ConfigValidationResult,
  PresetConfigName,
  ConfigExport,
} from './types';

// 导出Schema (用于运行时验证)
export {
  BaziConfigSchema,
  BaziOptionsSchema,
  WuxingWeightsConfigSchema,
  RootingCoefficientsConfigSchema,
  MonthlyCoefficientsConfigSchema,
  InteractionCoefficientsConfigSchema,
} from './types';

// 导出配置管理器
export {
  BaziConfigManager,
  baziConfigManager,
  getCurrentConfig,
  loadPreset,
  validateConfig,
} from './manager';
