import { z } from 'zod';

/**
 * 风水算法数据契约 - 玄空飞星体系
 * 确保所有风水分析基于结构化数据
 */

// 输入数据验证
export const FengshuiInputSchema = z.object({
  // 方位信息
  facing: z.number().min(0).max(360).describe('朝向度数'),
  sitting: z.number().min(0).max(360).describe('坐向度数'),
  
  // 时间信息
  buildYear: z.number().min(1800).max(2100),
  moveInYear: z.number().min(1800).max(2100).optional(),
  currentYear: z.number().min(1800).max(2100).optional(),
  
  // 地理位置
  city: z.string(),
  longitude: z.number().min(-180).max(180),
  latitude: z.number().min(-90).max(90),
  
  // 可选信息
  floorPlan: z.string().optional().describe('Base64编码的户型图'),
  floor: z.number().optional().describe('楼层'),
  unit: z.string().optional().describe('单元号'),
});

// 飞星信息
export const StarInfoSchema = z.object({
  number: z.number().min(1).max(9),
  name: z.string(),
  element: z.enum(['metal', 'water', 'wood', 'fire', 'earth']),
  quality: z.enum(['auspicious', 'neutral', 'inauspicious']),
  meaning: z.string(),
});

// 九宫格单元
export const PalaceSchema = z.object({
  position: z.enum(['center', 'north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest']),
  mountainStar: StarInfoSchema,
  waterStar: StarInfoSchema,
  baseStar: StarInfoSchema,
  yearStar: StarInfoSchema.optional(),
  combination: z.object({
    pattern: z.string(),
    quality: z.enum(['excellent', 'good', 'neutral', 'poor', 'terrible']),
    description: z.string(),
  }),
});

// 飞星盘
export const StarChartSchema = z.object({
  period: z.number().min(1).max(9),
  facing: z.string(),
  sitting: z.string(),
  palaces: z.array(PalaceSchema),
  centralPalace: PalaceSchema,
});

// 方位分析
export const DirectionAnalysisSchema = z.object({
  direction: z.string(),
  degree: z.number(),
  quality: z.enum(['auspicious', 'neutral', 'inauspicious']),
  purpose: z.array(z.string()),
  avoid: z.array(z.string()),
  element: z.string(),
});

// 建议项
export const RecommendationSchema = z.object({
  category: z.enum(['layout', 'color', 'element', 'timing', 'remedy']),
  priority: z.enum(['high', 'medium', 'low']),
  area: z.string(),
  suggestion: z.string(),
  reason: z.string(),
  expectedEffect: z.string(),
});

// 特殊格局
export const SpecialPatternSchema = z.object({
  name: z.string(),
  type: z.enum(['auspicious', 'inauspicious']),
  locations: z.array(z.string()),
  description: z.string(),
  remedies: z.array(z.string()).optional(),
});

// 完整输出结构
export const FengshuiOutputSchema = z.object({
  // 核心数据
  flyingStars: StarChartSchema,
  
  // 方位分析
  directions: z.object({
    auspicious: z.array(DirectionAnalysisSchema),
    inauspicious: z.array(DirectionAnalysisSchema),
    neutral: z.array(DirectionAnalysisSchema),
  }),
  
  // 特殊位置
  specialPositions: z.object({
    wealthPosition: z.array(z.string()),
    academicPosition: z.array(z.string()),
    healthPosition: z.array(z.string()),
    relationshipPosition: z.array(z.string()),
  }),
  
  // 建议
  recommendations: z.array(RecommendationSchema),
  
  // 特殊格局
  specialPatterns: z.array(SpecialPatternSchema).optional(),
  
  // 年运分析
  yearlyAnalysis: z.object({
    year: z.number(),
    yearStar: z.number(),
    monthlyStars: z.array(z.object({
      month: z.number(),
      star: z.number(),
    })).optional(),
  }).optional(),
  
  // 计算元数据
  period: z.number(),
  mountain: z.string(),
  facing: z.string(),
  
  // 版本控制
  version: z.string(),
  algorithmVersion: z.string(),
  hash: z.string(),
  timestamp: z.string().datetime(),
  
  // 质量标记
  confidence: z.object({
    overall: z.number().min(0).max(100),
    factors: z.object({
      directionAccuracy: z.number(),
      periodCertainty: z.number(),
      patternRecognition: z.number(),
    }),
  }),
  
  // AI可用解释
  interpretations: z.object({
    overall: z.string().optional(),
    wealth: z.string().optional(),
    health: z.string().optional(),
    relationship: z.string().optional(),
    career: z.string().optional(),
  }).optional(),
});

// 类型导出
export type FengshuiInput = z.infer<typeof FengshuiInputSchema>;
export type FengshuiOutput = z.infer<typeof FengshuiOutputSchema>;
export type StarChart = z.infer<typeof StarChartSchema>;
export type Palace = z.infer<typeof PalaceSchema>;
export type Recommendation = z.infer<typeof RecommendationSchema>;

// 工具函数
export function generateCacheKey(input: FengshuiInput): string {
  const normalized = {
    facing: Math.round(input.facing),
    sitting: Math.round(input.sitting),
    buildYear: input.buildYear,
    moveInYear: input.moveInYear,
    currentYear: input.currentYear || new Date().getFullYear(),
  };
  return Buffer.from(JSON.stringify(normalized)).toString('base64');
}

export function generateHash(input: FengshuiInput): string {
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
export function validateFengshuiInput(data: unknown): FengshuiInput {
  return FengshuiInputSchema.parse(data);
}

export function validateFengshuiOutput(data: unknown): FengshuiOutput {
  return FengshuiOutputSchema.parse(data);
}

// AI护栏验证
export function hasValidFengshuiData(data: unknown): boolean {
  try {
    validateFengshuiOutput(data);
    return true;
  } catch {
    return false;
  }
}

// 错误类型定义
export class FengshuiValidationError extends Error {
  constructor(message: string, public errors?: z.ZodError) {
    super(message);
    this.name = 'FengshuiValidationError';
  }
}

export class FengshuiCalculationError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'FengshuiCalculationError';
  }
}

// 方位转换工具
export function degreeToDirection(degree: number): string {
  const normalized = ((degree % 360) + 360) % 360;
  const directions = [
    { name: '正北', min: 337.5, max: 22.5 },
    { name: '东北', min: 22.5, max: 67.5 },
    { name: '正东', min: 67.5, max: 112.5 },
    { name: '东南', min: 112.5, max: 157.5 },
    { name: '正南', min: 157.5, max: 202.5 },
    { name: '西南', min: 202.5, max: 247.5 },
    { name: '正西', min: 247.5, max: 292.5 },
    { name: '西北', min: 292.5, max: 337.5 },
  ];
  
  for (const dir of directions) {
    if (dir.min > dir.max) {
      // 处理跨越0度的情况（正北）
      if (normalized >= dir.min || normalized < dir.max) {
        return dir.name;
      }
    } else {
      if (normalized >= dir.min && normalized < dir.max) {
        return dir.name;
      }
    }
  }
  
  return '正北'; // 默认值
}

// 元运计算
export function calculatePeriod(year: number): number {
  const periods = [
    { start: 1864, end: 1883, period: 1 },
    { start: 1884, end: 1903, period: 2 },
    { start: 1904, end: 1923, period: 3 },
    { start: 1924, end: 1943, period: 4 },
    { start: 1944, end: 1963, period: 5 },
    { start: 1964, end: 1983, period: 6 },
    { start: 1984, end: 2003, period: 7 },
    { start: 2004, end: 2023, period: 8 },
    { start: 2024, end: 2043, period: 9 },
  ];
  
  const found = periods.find(p => year >= p.start && year <= p.end);
  return found ? found.period : 9; // 默认九运
}