/**
 * 统一类型系统
 *
 * 桥接 xuankong 系统和 fengshui 系统
 * 提供统一的接口定义，兼容两套系统的数据结构
 *
 * @author QiFlow AI Team
 * @version 1.0.0
 */

import type { Element as FengshuiElement } from '../fengshui/personalized-engine';
import type { UserProfile } from '../xuankong/personalized-analysis';
import type { FlyingStar, Mountain, PalaceIndex, Yun } from '../xuankong/types';

// ==================== 统一的五行类型 ====================

/**
 * 统一五行类型
 * 兼容两套系统的五行表示
 */
export type UnifiedElement = FengshuiElement;

/**
 * 五行映射表
 */
export const ELEMENT_MAPPING = {
  wood: '木',
  fire: '火',
  earth: '土',
  metal: '金',
  water: '水',
} as const;

// ==================== 统一的八字信息 ====================

/**
 * 统一八字信息
 * 兼容 xuankong 的 UserProfile 和 fengshui 的 BaziInfo
 */
export interface UnifiedBaziInfo {
  // 基础信息
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour?: number;
  gender: 'male' | 'female';

  // 八字分析（来自 fengshui 系统）
  dayMaster?: UnifiedElement;
  favorableElements?: UnifiedElement[];
  unfavorableElements?: UnifiedElement[];
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
  strength?: number; // 1-10，5为中和

  // 用户画像（来自 xuankong 系统）
  occupation?: string;
  livingHabits?: {
    workFromHome?: boolean;
    frequentTraveling?: boolean;
    hasChildren?: boolean;
    elderlyLiving?: boolean;
    petsOwner?: boolean;
  };
  healthConcerns?: string[];
  careerGoals?: string[];
  familyStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  financialGoals?: 'stability' | 'growth' | 'investment' | 'retirement';
}

// ==================== 统一的房屋信息 ====================

/**
 * 房间类型
 */
export type RoomType =
  | 'bedroom'
  | 'living'
  | 'kitchen'
  | 'bathroom'
  | 'study'
  | 'dining'
  | 'entrance'
  | 'balcony';

/**
 * 房间布局
 */
export interface UnifiedRoomLayout {
  id: string;
  type: RoomType;
  name: string;
  palace: PalaceIndex; // 使用九宫格位置（1-9）
  area?: number; // 平方米
  isPrimary?: boolean; // 是否为主要房间
  description?: string;
}

/**
 * 统一房屋信息
 * 兼容两套系统的输入
 */
export interface UnifiedHouseInfo {
  // 基础信息
  facing: number; // 朝向度数（0-360）
  facingMountain?: Mountain; // 二十四山朝向
  buildYear: number; // 建造年份
  period?: Yun; // 元运（1-9），如果未提供则自动计算

  // 可选信息
  location?: {
    lat: number;
    lon: number;
    address?: string;
  };
  floor?: number;
  layout?: UnifiedRoomLayout[];

  // 环境信息（用于零正分析）
  environment?: {
    waterPositions?: PalaceIndex[]; // 见水的位置
    mountainPositions?: PalaceIndex[]; // 见山的位置
    description?: string;
  };
}

// ==================== 统一的时间信息 ====================

/**
 * 统一时间信息
 */
export interface UnifiedTimeInfo {
  currentYear: number;
  currentMonth: number;
  currentDay?: number;
  targetDate?: Date; // 择吉目标日期
}

// ==================== 统一的分析选项 ====================

/**
 * 统一分析选项
 */
export interface UnifiedAnalysisOptions {
  // 分析深度
  depth?: 'basic' | 'standard' | 'comprehensive' | 'expert';

  // 启用的功能模块
  includeLiunian?: boolean; // 流年分析
  includePersonalization?: boolean; // 个性化分析
  includeTigua?: boolean; // 替卦分析
  includeLingzheng?: boolean; // 零正理论
  includeChengmenjue?: boolean; // 城门诀
  includeScoring?: boolean; // 智能评分（新增）
  includeWarnings?: boolean; // 智能预警（新增）

  // 分析配置
  config?: {
    applyTiGua?: boolean;
    applyFanGua?: boolean;
    evaluationProfile?: 'standard' | 'conservative' | 'aggressive';
    prioritizeStability?: boolean;
  };

  // 择吉相关
  eventType?: 'moving' | 'renovation' | 'business' | 'marriage' | 'investment';
}

// ==================== 统一的输入 ====================

/**
 * 统一分析输入
 */
export interface UnifiedAnalysisInput {
  bazi: UnifiedBaziInfo;
  house: UnifiedHouseInfo;
  time: UnifiedTimeInfo;
  family?: UnifiedBaziInfo[]; // 家庭成员
  options?: UnifiedAnalysisOptions;
}

// ==================== 统一的评分结果 ====================

/**
 * 评分维度
 */
export interface ScoreDimension {
  name: string;
  score: number; // 0-100
  weight: number; // 权重
  reasons: string[];
  suggestions: string[];
}

/**
 * 统一评分结果
 */
export interface UnifiedScoringResult {
  overall: number; // 总分 0-100
  level: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  dimensions: ScoreDimension[];
  summary: string;
}

// ==================== 统一的预警结果 ====================

/**
 * 预警严重程度
 */
export type WarningSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

/**
 * 统一预警项
 */
export interface UnifiedWarning {
  id: string;
  severity: WarningSeverity;
  urgency: number; // 1-5
  title: string;
  description: string;
  location: string;
  impact: string[];
  consequences: string[];
  recommendations: string[];
}

/**
 * 统一预警结果
 */
export interface UnifiedWarningResult {
  warnings: UnifiedWarning[];
  urgentCount: number;
  criticalCount: number;
  summary: string;
}

// ==================== 统一的关键位置 ====================

/**
 * 关键位置类型
 */
export type KeyPositionType =
  | 'wealth' // 财位
  | 'study' // 文昌位
  | 'romance' // 桃花位
  | 'health' // 健康位
  | 'career' // 事业位
  | 'nobleman' // 贵人位
  | 'wuhuang' // 五黄位
  | 'erhei'; // 二黑位

/**
 * 统一关键位置
 */
export interface UnifiedKeyPosition {
  type: KeyPositionType;
  name: string;
  palace: PalaceIndex;
  direction: string;
  score: number; // 吉凶评分 0-100
  description: string;
  advice: {
    suitable: string[];
    avoid: string[];
    enhance: string[];
    items?: string[];
  };
}

// ==================== 统一的房间建议 ====================

/**
 * 统一房间建议
 */
export interface UnifiedRoomAdvice {
  roomId: string;
  roomType: RoomType;
  roomName: string;
  palace: PalaceIndex;
  score: number; // 适配度评分 0-100
  isIdeal: boolean;
  reason: string;
  suggestions: string[];
  warnings?: string[];
  enhancements?: string[];
}

// ==================== 统一的月运预测 ====================

/**
 * 统一月运预测
 */
export interface UnifiedMonthlyForecast {
  year: number;
  month: number;
  monthName: string;
  favorableDirections: string[];
  unfavorableDirections: string[];
  keyEvents: string[];
  advice: string[];
  score: number;
}

// ==================== 统一的行动计划 ====================

/**
 * 统一行动计划项
 */
export interface UnifiedActionItem {
  id: string;
  priority: 1 | 2 | 3 | 4 | 5;
  title: string;
  description: string;
  category: 'urgent' | 'important' | 'beneficial' | 'optional';
  estimatedCost?: {
    min: number;
    max: number;
    currency: string;
  };
  difficulty?: 'easy' | 'medium' | 'hard';
  timeRequired?: string;
  steps: string[];
  expectedEffect: string;
}

// ==================== 统一的输出结果 ====================

/**
 * 统一分析输出
 */
export interface UnifiedAnalysisOutput {
  // 基础飞星分析（来自 xuankong 系统）
  xuankong: {
    period: Yun;
    facing: Mountain;
    plate: any; // FlyingStarChart
    geju?: any; // GejuAnalysis
    evaluation: any;
  };

  // 智能评分（来自 fengshui 系统）
  scoring?: UnifiedScoringResult;

  // 智能预警（来自 fengshui 系统）
  warnings?: UnifiedWarningResult;

  // 关键位置分析
  keyPositions?: UnifiedKeyPosition[];

  // 房间建议
  roomAdvice?: UnifiedRoomAdvice[];

  // 月运预测
  monthlyForecast?: UnifiedMonthlyForecast[];

  // 行动计划
  actionPlan?: UnifiedActionItem[];

  // 个性化分析（来自 xuankong 系统）
  personalized?: {
    compatibility: any;
    roomRecommendations: any;
    careerEnhancement: any;
    healthAndWellness: any;
    relationshipHarmony: any;
    wealthAndProsperity: any;
  };

  // 综合评估
  assessment: {
    overallScore: number;
    rating: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    strengths: string[];
    weaknesses: string[];
    topPriorities: string[];
    longTermPlan: string[];
  };

  // 元数据
  metadata: {
    analyzedAt: Date;
    version: string;
    depth: string;
    computationTime: number;
  };
}

// ==================== 导出所有类型 ====================

export type {
  // 来自 xuankong
  Mountain,
  Yun,
  PalaceIndex,
  FlyingStar,
  UserProfile,
  // 来自 fengshui
  FengshuiElement,
};
