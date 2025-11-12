/**
 * 八字配置系统类型定义
 * 支持不同流派的权重配置
 */

import { z } from 'zod';

/**
 * 五行权重配置
 * 用于天干和地支的基础分值
 */
export const WuxingWeightsConfigSchema = z.object({
  /** 天干基础分值 (默认10分) */
  stemBase: z.number().min(0).max(20).default(10),
  /** 地支主气分值 (默认8分) */
  branchMainQi: z.number().min(0).max(20).default(8),
  /** 地支中气分值 (默认5分) */
  branchMiddleQi: z.number().min(0).max(20).default(5),
  /** 地支余气分值 (默认2分) */
  branchResidualQi: z.number().min(0).max(20).default(2),
});

export type WuxingWeightsConfig = z.infer<typeof WuxingWeightsConfigSchema>;

/**
 * 通根系数配置
 * 不同柱位的通根力度
 */
export const RootingCoefficientsConfigSchema = z.object({
  /** 年柱通根系数 - 远根,力度较小 (默认1.2) */
  year: z.number().min(1.0).max(2.0).default(1.2),
  /** 月柱通根系数 - 中根,力度最强(月令为提纲) (默认1.5) */
  month: z.number().min(1.0).max(2.0).default(1.5),
  /** 日柱通根系数 - 近根,力度最强(坐支最近) (默认1.5) */
  day: z.number().min(1.0).max(2.0).default(1.5),
  /** 时柱通根系数 - 远根,力度较小 (默认1.1) */
  hour: z.number().min(1.0).max(2.0).default(1.1),
});

export type RootingCoefficientsConfig = z.infer<
  typeof RootingCoefficientsConfigSchema
>;

/**
 * 月令系数配置
 * 不同季节对五行的影响
 */
export const MonthlyCoefficientsConfigSchema = z.object({
  /** 春季 (寅卯辰月) */
  spring: z.object({
    wood: z.number().min(0.5).max(2.0).default(1.5),
    fire: z.number().min(0.5).max(2.0).default(1.2),
    earth: z.number().min(0.5).max(2.0).default(1.0),
    metal: z.number().min(0.5).max(2.0).default(0.8),
    water: z.number().min(0.5).max(2.0).default(1.0),
  }),
  /** 夏季 (巳午未月) */
  summer: z.object({
    wood: z.number().min(0.5).max(2.0).default(1.0),
    fire: z.number().min(0.5).max(2.0).default(1.5),
    earth: z.number().min(0.5).max(2.0).default(1.2),
    metal: z.number().min(0.5).max(2.0).default(0.7),
    water: z.number().min(0.5).max(2.0).default(0.8),
  }),
  /** 秋季 (申酉戌月) */
  autumn: z.object({
    wood: z.number().min(0.5).max(2.0).default(0.8),
    fire: z.number().min(0.5).max(2.0).default(0.9),
    earth: z.number().min(0.5).max(2.0).default(1.0),
    metal: z.number().min(0.5).max(2.0).default(1.5),
    water: z.number().min(0.5).max(2.0).default(1.0),
  }),
  /** 冬季 (亥子丑月) */
  winter: z.object({
    wood: z.number().min(0.5).max(2.0).default(1.0),
    fire: z.number().min(0.5).max(2.0).default(0.8),
    earth: z.number().min(0.5).max(2.0).default(1.0),
    metal: z.number().min(0.5).max(2.0).default(1.2),
    water: z.number().min(0.5).max(2.0).default(1.5),
  }),
});

export type MonthlyCoefficientsConfig = z.infer<
  typeof MonthlyCoefficientsConfigSchema
>;

/**
 * 相互作用系数配置
 * 五行生克制化的影响力度
 */
export const InteractionCoefficientsConfigSchema = z.object({
  /** 生扶加成 (我生者,默认15%) */
  generation: z.number().min(0).max(0.5).default(0.15),
  /** 克制惩罚 (我克者,默认15%) */
  control: z.number().min(0).max(0.5).default(0.15),
  /** 泄气减损 (生我者,默认10%) */
  drainage: z.number().min(0).max(0.5).default(0.1),
  /** 被克减损 (克我者,默认10%) */
  controlled: z.number().min(0).max(0.5).default(0.1),
});

export type InteractionCoefficientsConfig = z.infer<
  typeof InteractionCoefficientsConfigSchema
>;

/**
 * 配置选项
 */
export const BaziOptionsSchema = z.object({
  /** 是否启用缓存 (默认true) */
  enableCache: z.boolean().default(true),
  /** 缓存大小 (默认100) */
  cacheSize: z.number().min(10).max(1000).default(100),
  /** 是否启用真太阳时校正 (默认true) */
  enableTrueSolarTime: z.boolean().default(true),
  /** 是否归一化到100分制 (默认true) */
  normalizeToHundred: z.boolean().default(true),
  /** 计算精度 (小数位数,默认2) */
  precision: z.number().min(0).max(4).default(2),
});

export type BaziOptions = z.infer<typeof BaziOptionsSchema>;

/**
 * 完整的八字配置
 */
export const BaziConfigSchema = z.object({
  /** 配置版本 */
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  /** 配置名称 */
  name: z.string().min(1).max(50),
  /** 配置描述 (可选) */
  description: z.string().optional(),
  /** 流派 (可选) */
  school: z.enum(['ziping', 'modern', 'traditional', 'custom']).optional(),
  /** 五行权重配置 */
  wuxingWeights: WuxingWeightsConfigSchema,
  /** 通根系数配置 */
  rootingCoefficients: RootingCoefficientsConfigSchema,
  /** 月令系数配置 */
  monthlyCoefficients: MonthlyCoefficientsConfigSchema,
  /** 相互作用系数配置 */
  interactionCoefficients: InteractionCoefficientsConfigSchema,
  /** 配置选项 */
  options: BaziOptionsSchema.optional(),
  /** 创建时间 (ISO 8601格式) */
  createdAt: z.string().datetime().optional(),
  /** 最后修改时间 (ISO 8601格式) */
  updatedAt: z.string().datetime().optional(),
});

export type BaziConfig = z.infer<typeof BaziConfigSchema>;

/**
 * 配置验证结果
 */
export interface ConfigValidationResult {
  success: boolean;
  config?: BaziConfig;
  errors?: Array<{
    path: string;
    message: string;
  }>;
}

/**
 * 预置配置类型
 */
export type PresetConfigName = 'ziping' | 'modern' | 'traditional';

/**
 * 配置导出格式
 */
export interface ConfigExport {
  version: string;
  exportedAt: string;
  config: BaziConfig;
  metadata?: {
    exportedBy?: string;
    notes?: string;
  };
}
