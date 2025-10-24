/**
 * 八字分析结果类型定义
 * 用于修复 TypeScript 类型错误并统一类型定义
 */

// 基础八字信息
export interface BaziInfo {
  year?: {
    gan: string;
    zhi: string;
  };
  month?: {
    gan: string;
    zhi: string;
  };
  day?: {
    gan: string;
    zhi: string;
  };
  hour?: {
    gan: string;
    zhi: string;
  };
}

// 输入数据
export interface InputData {
  name?: string;
  gender?: 'male' | 'female';
  birthDate?: string;
  birthTime?: string;
  location?: string;
}

// 五行分析
export interface WuxingAnalysis {
  wood?: number;
  fire?: number;
  earth?: number;
  metal?: number;
  water?: number;
  analysis?: string;
  balance?: string;
  favorable?: string[];
}

// 性格分析
export interface PersonalityAnalysis {
  summary?: string;
  traits?: string[];
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
}

// 事业分析
export interface CareerAnalysis {
  suitable?: string[];
  direction?: string;
  timing?: string;
  potential?: string;
  challenges?: string;
}

// 财运分析
export interface WealthAnalysis {
  overall?: string;
  advice?: string;
  timing?: string;
  opportunities?: string[];
  risks?: string[];
}

// 健康分析
export interface HealthAnalysis {
  concerns?: string[];
  advice?: string;
  prevention?: string;
  wellness?: string[];
}

// 人际关系分析
export interface RelationshipsAnalysis {
  love?: string;
  family?: string;
  friends?: string;
  social?: string;
  compatibility?: string;
}

// 大运流年
export interface LuckCycle {
  period?: number;
  startAge?: number;
  endAge?: number;
  heavenlyStem?: string;
  earthlyBranch?: string;
  evaluation?: string;
  fortune?: {
    career?: string;
    wealth?: string;
    health?: string;
    relationship?: string;
  };
}

// 今日运势
export interface DailyFortune {
  date?: string;
  overall?: number;
  lucky?: {
    color?: string;
    number?: string;
    direction?: string;
    time?: string;
  };
  advice?: string;
}

// 完整的分析结果
export interface AnalysisResult {
  // 基础信息
  inputData?: InputData;
  bazi?: BaziInfo;

  // 五行分析
  wuxing?: WuxingAnalysis;

  // 性格分析
  personality?: PersonalityAnalysis;

  // 事业财运
  career?: CareerAnalysis;
  wealth?: WealthAnalysis;

  // 健康情感
  health?: HealthAnalysis;
  relationships?: RelationshipsAnalysis;

  // 大运流年
  luckCycles?: LuckCycle[];
  currentLuck?: LuckCycle;

  // 今日运势
  dailyFortune?: DailyFortune;

  // 专业建议
  advice?: {
    shortTerm?: string[];
    longTerm?: string[];
    improvement?: string[];
  };

  // 元数据
  metadata?: {
    calculatedAt?: string;
    version?: string;
    accuracy?: number;
    mode?: 'standard' | 'professional' | 'enhanced';
  };

  // 错误信息
  error?: {
    message?: string;
    code?: string;
  };
}

// API 响应类型
export interface BaziAnalysisResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
  timestamp?: string;
}

// 表单输入类型
export interface BaziFormData {
  name: string;
  gender: 'male' | 'female';
  birthDate: string;
  birthTime: string;
  birthPlace?: string;
  isTimeKnown?: boolean;
  timezone?: string;
}

// 导出所有类型
export type { AnalysisResult as default };
