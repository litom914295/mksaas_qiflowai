/**
 * 八字算法类型定义
 */

export interface EnhancedBirthData {
  datetime: string;
  gender: 'male' | 'female';
  timezone: string;
  isTimeKnown: boolean;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface EnhancedBaziResult {
  // 基本信息
  birthInfo: {
    datetime: string;
    gender: string;
    timezone: string;
    isTimeKnown: boolean;
  };
  
  // 八字四柱
  pillars: {
    year: BaziPillar;
    month: BaziPillar;
    day: BaziPillar;
    hour: BaziPillar;
  };
  
  // 十神分析
  tenGods: TenGodsAnalysis;
  
  // 用神分析
  yongshen: YongshenAnalysis;
  
  // 大运流年
  luckPillars: LuckPillar[];
  
  // 格局分析
  pattern: PatternAnalysis;
  
  // 综合评分
  score: {
    overall: number;
    wealth: number;
    career: number;
    health: number;
    relationship: number;
  };
  
  // 建议
  suggestions: string[];
  
  // 元数据
  meta: {
    calculationTime: number;
    algorithm: string;
    version: string;
  };
}

export interface BaziPillar {
  heavenly: string;
  earthly: string;
  element: string;
  yinYang: 'yin' | 'yang';
}

export interface TenGodsAnalysis {
  [key: string]: {
    name: string;
    strength: number;
    influence: string;
  };
}

export interface YongshenAnalysis {
  primary: string;
  secondary: string[];
  strength: number;
  balance: number;
}

export interface LuckPillar {
  age: number;
  pillar: BaziPillar;
  element: string;
  influence: string;
}

export interface PatternAnalysis {
  type: string;
  strength: number;
  characteristics: string[];
  advantages: string[];
  disadvantages: string[];
}

