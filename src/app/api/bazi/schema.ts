import { z } from 'zod';

/**
 * 八字算法数据契约 - 确保算法优先原则
 * 所有AI解释必须基于这些结构化数据
 */

// 输入数据验证
export const BaziInputSchema = z.object({
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  timezone: z.string().min(1, 'Timezone is required'),
  longitude: z.number().min(-180).max(180),
  latitude: z.number().min(-90).max(90),
  gender: z.enum(['male', 'female']),
  calendar: z.enum(['solar', 'lunar']).default('solar'),
  name: z.string().optional(),
});

// 天干地支
export const StemBranchSchema = z.object({
  stem: z.string(),
  branch: z.string(),
  hidden: z.array(z.string()).optional(),
  nayin: z.string().optional(),
});

// 四柱结构
export const FourPillarsSchema = z.object({
  year: StemBranchSchema,
  month: StemBranchSchema,
  day: StemBranchSchema,
  hour: StemBranchSchema,
});

// 五行统计
export const ElementStatsSchema = z.object({
  metal: z.number(),
  water: z.number(),
  wood: z.number(),
  fire: z.number(),
  earth: z.number(),
  total: z.number(),
  dominant: z.string(),
  lacking: z.array(z.string()),
});

// 十神分析
export const TenGodAnalysisSchema = z.object({
  正官: z.number(),
  偏官: z.number(),
  正印: z.number(),
  偏印: z.number(),
  比肩: z.number(),
  劫财: z.number(),
  食神: z.number(),
  伤官: z.number(),
  正财: z.number(),
  偏财: z.number(),
  pattern: z.string().optional(),
  strength: z.enum(['weak', 'balanced', 'strong']),
});

// 大运信息
export const LuckPillarSchema = z.object({
  startAge: z.number(),
  endAge: z.number(),
  stem: z.string(),
  branch: z.string(),
  period: z.string(),
  analysis: z.string().optional(),
});

// 边界与误差标记
export const BoundaryMarkersSchema = z.object({
  isDayBoundary: z.boolean(), // 是否接近日期边界
  isMonthBoundary: z.boolean(), // 是否接近月份边界
  trueSolarTimeUsed: z.boolean(), // 是否使用真太阳时
  daylightSavingApplied: z.boolean(), // 是否应用夏令时
  uncertaintyLevel: z.enum(['low', 'medium', 'high']),
  notes: z.array(z.string()).optional(),
});

// 完整输出结构
export const BaziOutputSchema = z.object({
  // 核心数据
  fourPillars: FourPillarsSchema,
  elements: ElementStatsSchema,
  tenGods: TenGodAnalysisSchema,

  // 扩展信息
  luckPillars: z.array(LuckPillarSchema).optional(),
  yongShen: z
    .object({
      primary: z.string(),
      secondary: z.string().optional(),
      avoid: z.array(z.string()),
    })
    .optional(),

  // 计算元数据
  trueSolarTime: z.boolean(),
  dayBoundary: z.string(),
  solarTerm: z.string().optional(),

  // 版本控制与验证
  version: z.string(),
  algorithmVersion: z.string(),
  hash: z.string(), // 输入数据的hash，用于缓存
  timestamp: z.string().datetime(),

  // 边界与误差
  boundaries: BoundaryMarkersSchema,

  // AI可用的解释字段
  interpretations: z
    .object({
      personality: z.array(z.string()).optional(),
      career: z.array(z.string()).optional(),
      wealth: z.array(z.string()).optional(),
      relationship: z.array(z.string()).optional(),
      health: z.array(z.string()).optional(),
    })
    .optional(),
});

// 类型导出
export type BaziInput = z.infer<typeof BaziInputSchema>;
export type BaziOutput = z.infer<typeof BaziOutputSchema>;
export type FourPillars = z.infer<typeof FourPillarsSchema>;
export type ElementStats = z.infer<typeof ElementStatsSchema>;
export type TenGodAnalysis = z.infer<typeof TenGodAnalysisSchema>;

// 工具函数
export function generateCacheKey(input: BaziInput): string {
  const normalized = {
    birthDate: input.birthDate,
    birthTime: input.birthTime,
    longitude: Math.round(input.longitude * 100) / 100,
    latitude: Math.round(input.latitude * 100) / 100,
    gender: input.gender,
    calendar: input.calendar,
  };
  return Buffer.from(JSON.stringify(normalized)).toString('base64');
}

export function generateHash(input: BaziInput): string {
  const crypto = require('crypto');
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(input))
    .digest('hex')
    .substring(0, 16);
}

// 算法版本管理
export const ALGORITHM_VERSION = '1.0.0';
export const SCHEMA_VERSION = '1.0.0';

// 验证辅助函数
export function validateBaziInput(data: unknown): BaziInput {
  return BaziInputSchema.parse(data);
}

export function validateBaziOutput(data: unknown): BaziOutput {
  return BaziOutputSchema.parse(data);
}

// AI护栏验证 - 确保AI只能基于已有数据回答
export function hasValidBaziData(data: unknown): boolean {
  try {
    validateBaziOutput(data);
    return true;
  } catch {
    return false;
  }
}

// 错误类型定义
export class BaziValidationError extends Error {
  constructor(
    message: string,
    public errors?: z.ZodError
  ) {
    super(message);
    this.name = 'BaziValidationError';
  }
}

export class BaziCalculationError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'BaziCalculationError';
  }
}
