/**
 * 八字高级类型定义
 * 包含格局、神煞、十神、大运流年、解读等高级功能的类型
 *
 * @module bazi/types/advanced
 */

import type {
  BaziChart,
  EarthlyBranch,
  Element,
  HeavenlyStem,
  WuxingStrength,
  YongshenResult,
} from './core';

// ===== 用户相关 =====

export type UserLevel = 'beginner' | 'intermediate' | 'expert';

// ===== 格局分析 =====

export enum PatternType {
  NORMAL = 'normal', // 普通格局

  // 正格
  JIAN_LU = 'jianlu', // 建禄格
  YUE_REN = 'yueren', // 月刃格
  ZHENG_GUAN = 'zhengguan', // 正官格
  QI_SHA = 'qisha', // 七杀格
  ZHENG_CAI = 'zhengcai', // 正财格
  PIAN_CAI = 'piancai', // 偏财格
  ZHENG_YIN = 'zhengyin', // 正印格
  PIAN_YIN = 'pianyin', // 偏印格
  SHI_SHEN = 'shishen', // 食神格
  SHANG_GUAN = 'shangguan', // 伤官格

  // 从格
  CONG_CAI = 'congcai', // 从财格
  CONG_GUAN = 'congguan', // 从官格
  CONG_ER = 'conger', // 从儿格
  CONG_SHI = 'congshi', // 从势格

  // 化格
  HUA_TU = 'huatu', // 化土格
  HUA_JIN = 'huajin', // 化金格
  HUA_SHUI = 'huashui', // 化水格
  HUA_MU = 'huamu', // 化木格
  HUA_HUO = 'huahuo', // 化火格

  // 专旺格
  QU_ZHI = 'quzhi', // 曲直格
  YAN_SHANG = 'yanshang', // 炎上格
  JIA_SE = 'jiase', // 稼穑格
  CONG_GE = 'congge', // 从革格
  RUN_XIA = 'runxia', // 润下格

  // 特殊格局
  KUI_GANG = 'kuigang', // 魁罡格
  JIN_SHEN = 'jinshen', // 金神格
  RI_GUI = 'rigui', // 日贵格
  LU_MA = 'luma', // 禄马格
  TIAN_YI = 'tianyi', // 天乙格
}

export interface PatternDetail {
  type: PatternType;
  name: string;
  description: string;
  strength: number;
  characteristics: string[];
}

export interface PatternResult {
  mainPattern: PatternType;
  subPatterns: PatternType[];
  strength: number;
  details: PatternDetail[];
  recommendations: string[];
  conflicts: string[];
  potentials: string[];
}

// ===== 神煞系统 =====

export enum ShenShaType {
  JI_SHEN = 'jishen', // 吉神
  XIONG_SHEN = 'xiongshen', // 凶神
}

export interface ShenShaResult {
  type: ShenShaType;
  name: string;
  description: string;
  location: string[];
  strength: number;
  effects: string[];
  advice: string;
}

export interface ShenSha {
  jiShen: ShenShaResult[];
  xiongShen: ShenShaResult[];
  summary: {
    totalJiShen: number;
    totalXiongShen: number;
    majorInfluences: string[];
    recommendations: string[];
  };
}

// ===== 十神关系 =====

export interface TenGodsDistribution {
  zhengGuan: number; // 正官
  qiSha: number; // 七杀
  zhengCai: number; // 正财
  pianCai: number; // 偏财
  zhengYin: number; // 正印
  pianYin: number; // 偏印
  shiShen: number; // 食神
  shangGuan: number; // 伤官
  biJian: number; // 比肩
  jieZai: number; // 劫财
}

// ===== 五行分析 =====

export interface WuxingAnalysis {
  dayMasterStrength: number;
  elements: WuxingStrength;
  balance: {
    strongest: Element;
    weakest: Element;
    ratio: number;
  };
}

// ===== 大运流年 =====

export interface LiuNian {
  year: number;
  gan: HeavenlyStem;
  zhi: EarthlyBranch;
  element: Element;
  fortune: number; // 0-100
  aspects: {
    career: number;
    wealth: number;
    health: number;
    relationships: number;
  };
}

// ===== 解读结果 =====

export interface InterpretationResult {
  level: UserLevel;
  summary: {
    overview: string;
    keyPoints: string[];
    strengths: string[];
    challenges: string[];
  };
  detailed: {
    personality: string[];
    career: string[];
    wealth: string[];
    relationships: string[];
    health: string[];
    fortune: string[];
  };
  recommendations: string[];
  warnings?: string[];
}

// ===== API 接口 =====

export interface BaziAnalysisRequest {
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm
  longitude: number; // 经度
  latitude?: number; // 纬度
  timezone?: number; // 时区
  isLunar?: boolean; // 是否农历
  gender: 'male' | 'female';
  name?: string;
  analysisDepth?: 'basic' | 'standard' | 'comprehensive';
  userLevel?: UserLevel;
}

export interface BaziAnalysisResponse {
  success: boolean;
  data?: {
    chart: BaziChart;
    wuxing: WuxingAnalysis;
    yongshen: YongshenResult;
    pattern: PatternResult;
    shensha: ShenSha;
    tenGods: TenGodsDistribution;
    interpretation: InterpretationResult;
    dayun?: any[];
    currentYear?: LiuNian;
  };
  error?: {
    code: string;
    message: string;
  };
  metadata?: {
    calculationTime: number;
    version: string;
    credits: number;
  };
}

// ===== 配置相关 =====

export interface BaziConfig {
  apiEndpoint?: string;
  enableCache?: boolean;
  cacheDuration?: number;
  maxRetries?: number;
  timeout?: number;
  language?: 'zh-CN' | 'zh-TW' | 'en';
  timezone?: string;
  credits?: {
    basic: number;
    standard: number;
    comprehensive: number;
  };
}

// ===== 错误类型 =====

export class BaziError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'BaziError';
  }
}

export enum BaziErrorCode {
  INVALID_DATE = 'INVALID_DATE',
  INVALID_TIME = 'INVALID_TIME',
  INVALID_LOCATION = 'INVALID_LOCATION',
  CALCULATION_FAILED = 'CALCULATION_FAILED',
  INSUFFICIENT_CREDITS = 'INSUFFICIENT_CREDITS',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}
