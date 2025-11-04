/**
 * @deprecated 此文件已弃用！请使用统一系统代替。
 *
 * ⚠️ 重要提示：
 * - 本功能已存在于 xuankong/ 系统
 * - 请改用：`src/lib/qiflow/xuankong/personalization.ts`
 * - 迁移指南：`MIGRATION_GUIDE.md`
 *
 * 原文档：
 * 个性化风水引擎
 *
 * 核心功能：深度整合八字命理与玄空风水，提供个性化的风水分析和布局建议
 *
 * @author 玄空风水大师团队
 * @version 6.0.0
 * @deprecated 使用 xuankong/personalization.ts 代替
 */

import { ScoreCalculator } from './score-calculator';
import { WarningSystem } from './warning-system';

// ==================== 类型定义 ====================

/**
 * 五行元素
 */
export type Element = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

/**
 * 五行中文名称映射
 */
export const ELEMENT_NAMES: Record<Element, string> = {
  wood: '木',
  fire: '火',
  earth: '土',
  metal: '金',
  water: '水',
};

/**
 * 五行颜色映射
 */
export const ELEMENT_COLORS: Record<Element, string[]> = {
  wood: ['绿色', '青色', '碧色'],
  fire: ['红色', '紫色', '粉色'],
  earth: ['黄色', '棕色', '土色'],
  metal: ['白色', '金色', '银色'],
  water: ['黑色', '蓝色', '灰色'],
};

/**
 * 五行方位映射
 */
export const ELEMENT_DIRECTIONS: Record<Element, string[]> = {
  wood: ['东', '东南'],
  fire: ['南'],
  earth: ['中', '西南', '东北'],
  metal: ['西', '西北'],
  water: ['北'],
};

/**
 * 季节
 */
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

/**
 * 八字信息
 */
export interface BaziInfo {
  /** 日元五行 */
  dayMaster: Element;

  /** 喜用神（有利的五行）*/
  favorableElements: Element[];

  /** 忌神（不利的五行）*/
  unfavorableElements: Element[];

  /** 出生季节 */
  season: Season;

  /** 身强身弱（1-10，5为中和）*/
  strength: number;

  /** 原始八字数据（可选）*/
  raw?: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
}

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
  | 'entrance';

/**
 * 房间布局
 */
export interface RoomLayout {
  id: string;
  type: RoomType;
  name: string;
  /** 在九宫格中的位置（1-9）*/
  position: number;
  /** 面积（平方米）*/
  area?: number;
  /** 是否为主要房间 */
  isPrimary?: boolean;
}

/**
 * 房屋信息
 */
export interface HouseInfo {
  /** 朝向（度数，0-360）*/
  facing: number;

  /** 坐向（度数，0-360，缺省为 facing+180）*/
  mountain?: number;

  /** 元运（1-9）*/
  period: number;

  /** 建造年份 */
  buildYear: number;

  /** 楼层 */
  floor?: number;

  /** 房间布局 */
  layout?: RoomLayout[];

  /** 地址（可选）*/
  address?: string;
}

/**
 * 时间信息
 */
export interface TimeInfo {
  /** 当前年份 */
  currentYear: number;

  /** 当前月份（1-12）*/
  currentMonth: number;

  /** 择吉目标日期（可选）*/
  targetDate?: Date;
}

/**
 * 个性化风水引擎输入
 */
export interface PersonalizedFengshuiInput {
  /** 八字信息 */
  bazi: BaziInfo;

  /** 房屋信息 */
  house: HouseInfo;

  /** 时间信息 */
  time: TimeInfo;

  /** 家庭成员（可选，用于综合分析）*/
  family?: BaziInfo[];
}

// ==================== 输出类型定义 ====================

/**
 * 问题严重程度
 */
export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

/**
 * 紧急问题
 */
export interface UrgentIssue {
  id: string;
  severity: IssueSeverity;
  title: string;
  description: string;
  location: string;
  impact: string[];
  /** 如果不处理的后果 */
  consequences: string[];
  /** 处理紧急度（1-5，5最紧急）*/
  urgency: number;
}

/**
 * 关键位置类型
 */
export type KeyPositionType =
  | 'wealth' // 财位
  | 'study' // 文昌位
  | 'romance' // 桃花位
  | 'health' // 健康位
  | 'sickness' // 病位
  | 'wuhuang' // 五黄位
  | 'nobleman'; // 贵人位

/**
 * 关键位置
 */
export interface KeyPosition {
  type: KeyPositionType;
  name: string;
  position: number; // 九宫格位置（1-9）
  direction: string; // 方位（如"东"、"西北"）
  stars?: {
    mountain: number;
    facing: number;
    period: number;
  };
  score: number; // 吉凶评分（0-100）
  isPersonalized: boolean; // 是否结合了八字个性化
  advice: {
    suitable: string[]; // 适合摆放/做什么
    avoid: string[]; // 避免摆放/做什么
    enhance: string[]; // 催旺方法
    items?: string[]; // 推荐物品
  };
}

/**
 * 房间建议
 */
export interface RoomAdvice {
  roomId: string;
  roomType: RoomType;
  roomName: string;
  position: number;
  score: number; // 适配度评分（0-100）
  isIdeal: boolean; // 是否为理想位置
  reason: string; // 评分原因
  suggestions: string[]; // 具体建议
  warnings?: string[]; // 警告事项
  enhancements?: string[]; // 增强方法
}

/**
 * 月运预测
 */
export interface MonthlyForecast {
  year: number;
  month: number;
  monthName: string;
  favorableDirections: string[]; // 吉方
  unfavorableDirections: string[]; // 凶方
  keyEvents: string[]; // 关键事项
  advice: string[]; // 月度建议
  score: number; // 月运评分（0-100）
}

/**
 * 行动计划项
 */
export interface ActionPlanItem {
  id: string;
  priority: 1 | 2 | 3 | 4 | 5; // 优先级（5最高）
  title: string;
  description: string;
  category: 'urgent' | 'important' | 'beneficial' | 'optional';
  estimatedCost: {
    min: number;
    max: number;
    currency: string;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  timeRequired: string; // 如"1-2小时"、"1天"
  steps: string[]; // 具体步骤
  expectedEffect: string; // 预期效果
  verificationMethod?: string; // 验证方法
}

/**
 * 购物清单项
 */
export interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  purpose: string; // 用途
  material: string; // 材质要求
  specification: string; // 规格要求
  quantity: number;
  priceRange: {
    min: number;
    max: number;
  };
  placement: string; // 摆放位置
  purchaseLinks?: {
    platform: string;
    url: string;
    price: number;
  }[];
  importance: 'required' | 'recommended' | 'optional';
}

/**
 * 评分明细
 */
export interface ScoreBreakdown {
  layout: number; // 格局得分（30%权重）
  baziMatch: number; // 八字匹配度（25%权重）
  annual: number; // 流年吉凶（20%权重）
  roomFunction: number; // 房间功能（15%权重）
  remedy: number; // 化解措施（10%权重）
}

/**
 * 评分等级
 */
export type ScoreLevel = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

/**
 * 个性化风水引擎输出
 */
export interface PersonalizedFengshuiOutput {
  /** 总体评分（0-100，分数越高越好）*/
  overallScore: number;

  /** 评分等级 */
  scoreLevel: ScoreLevel;

  /** 评分明细 */
  scoreBreakdown: ScoreBreakdown;

  /** 紧急问题列表（按严重程度排序）*/
  urgentIssues: UrgentIssue[];

  /** 关键位置分析 */
  keyPositions: KeyPosition[];

  /** 房间建议 */
  roomAdvice: RoomAdvice[];

  /** 月运预测（未来12个月）*/
  monthlyForecast: MonthlyForecast[];

  /** 行动计划（按优先级排序）*/
  actionPlan: ActionPlanItem[];

  /** 购物清单 */
  shoppingList: ShoppingItem[];

  /** 综合建议 */
  summary: {
    strengths: string[]; // 优势
    weaknesses: string[]; // 劣势
    opportunities: string[]; // 机会
    threats: string[]; // 威胁
    topPriority: string; // 最优先处理事项
  };

  /** 个性化说明 */
  personalization: {
    isPersonalized: boolean;
    baziConsidered: boolean;
    favorableElementsUsed: Element[];
    unfavorableElementsAvoided: Element[];
    customizations: string[];
  };
}

// ==================== 核心引擎类 ====================

/**
 * 个性化风水引擎
 */
export class PersonalizedFengshuiEngine {
  /**
   * 分析入口
   */
  static async analyze(
    input: PersonalizedFengshuiInput
  ): Promise<PersonalizedFengshuiOutput> {
    console.log('[个性化风水引擎] 开始分析...', {
      dayMaster: input.bazi.dayMaster,
      favorableElements: input.bazi.favorableElements,
      facing: input.house.facing,
      period: input.house.period,
    });

    // 1. 计算总体评分
    const scoreBreakdown =
      await PersonalizedFengshuiEngine.calculateScore(input);
    const overallScore =
      PersonalizedFengshuiEngine.getOverallScore(scoreBreakdown);
    const scoreLevel = PersonalizedFengshuiEngine.getScoreLevel(overallScore);

    // 2. 识别紧急问题
    const urgentIssues =
      await PersonalizedFengshuiEngine.identifyUrgentIssues(input);

    // 3. 分析关键位置
    const keyPositions =
      await PersonalizedFengshuiEngine.analyzeKeyPositions(input);

    // 4. 生成房间建议
    const roomAdvice =
      await PersonalizedFengshuiEngine.generateRoomAdvice(input);

    // 5. 预测月运
    const monthlyForecast =
      await PersonalizedFengshuiEngine.forecastMonthly(input);

    // 6. 制定行动计划
    const actionPlan = await PersonalizedFengshuiEngine.createActionPlan(
      input,
      urgentIssues,
      keyPositions
    );

    // 7. 生成购物清单
    const shoppingList =
      await PersonalizedFengshuiEngine.generateShoppingList(actionPlan);

    // 8. 生成综合建议
    const summary = await PersonalizedFengshuiEngine.generateSummary(
      input,
      scoreBreakdown,
      urgentIssues
    );

    // 9. 个性化说明
    const personalization = {
      isPersonalized: true,
      baziConsidered: true,
      favorableElementsUsed: input.bazi.favorableElements,
      unfavorableElementsAvoided: input.bazi.unfavorableElements,
      customizations: PersonalizedFengshuiEngine.getCustomizations(input),
    };

    const output: PersonalizedFengshuiOutput = {
      overallScore,
      scoreLevel,
      scoreBreakdown,
      urgentIssues,
      keyPositions,
      roomAdvice,
      monthlyForecast,
      actionPlan,
      shoppingList,
      summary,
      personalization,
    };

    console.log('[个性化风水引擎] 分析完成', {
      overallScore,
      scoreLevel,
      urgentIssuesCount: urgentIssues.length,
      keyPositionsCount: keyPositions.length,
    });

    return output;
  }

  /**
   * 计算评分
   */
  private static async calculateScore(
    input: PersonalizedFengshuiInput
  ): Promise<ScoreBreakdown> {
    const report = await ScoreCalculator.calculate(input);
    return report.breakdown;
  }

  /**
   * 计算总体评分
   */
  private static getOverallScore(breakdown: ScoreBreakdown): number {
    const score =
      breakdown.layout * 0.3 +
      breakdown.baziMatch * 0.25 +
      breakdown.annual * 0.2 +
      breakdown.roomFunction * 0.15 +
      breakdown.remedy * 0.1;
    return Math.round(score);
  }

  /**
   * 获取评分等级
   */
  private static getScoreLevel(score: number): ScoreLevel {
    if (score >= 85) return 'excellent'; // 优秀
    if (score >= 70) return 'good'; // 良好
    if (score >= 55) return 'fair'; // 一般
    if (score >= 40) return 'poor'; // 较差
    return 'critical'; // 危险
  }

  /**
   * 识别紧急问题
   */
  private static async identifyUrgentIssues(
    input: PersonalizedFengshuiInput
  ): Promise<UrgentIssue[]> {
    return await WarningSystem.identifyIssues(input);
  }

  /**
   * 分析关键位置
   */
  private static async analyzeKeyPositions(
    input: PersonalizedFengshuiInput
  ): Promise<KeyPosition[]> {
    // TODO: 实现关键位置分析逻辑
    // 后续在 key-positions.ts 中实现
    return [];
  }

  /**
   * 生成房间建议
   */
  private static async generateRoomAdvice(
    input: PersonalizedFengshuiInput
  ): Promise<RoomAdvice[]> {
    // TODO: 实现房间建议生成逻辑
    return [];
  }

  /**
   * 预测月运
   */
  private static async forecastMonthly(
    input: PersonalizedFengshuiInput
  ): Promise<MonthlyForecast[]> {
    // TODO: 实现月运预测逻辑
    return [];
  }

  /**
   * 制定行动计划
   */
  private static async createActionPlan(
    input: PersonalizedFengshuiInput,
    issues: UrgentIssue[],
    positions: KeyPosition[]
  ): Promise<ActionPlanItem[]> {
    // TODO: 实现行动计划制定逻辑
    return [];
  }

  /**
   * 生成购物清单
   */
  private static async generateShoppingList(
    actionPlan: ActionPlanItem[]
  ): Promise<ShoppingItem[]> {
    // TODO: 实现购物清单生成逻辑
    return [];
  }

  /**
   * 生成综合建议
   */
  private static async generateSummary(
    input: PersonalizedFengshuiInput,
    breakdown: ScoreBreakdown,
    issues: UrgentIssue[]
  ): Promise<PersonalizedFengshuiOutput['summary']> {
    // TODO: 实现综合建议生成逻辑
    return {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: [],
      topPriority: '暂无',
    };
  }

  /**
   * 获取个性化定制项
   */
  private static getCustomizations(input: PersonalizedFengshuiInput): string[] {
    const customizations: string[] = [];

    // 根据喜用神定制
    if (input.bazi.favorableElements.length > 0) {
      customizations.push(
        `强化 ${input.bazi.favorableElements.map((e) => ELEMENT_NAMES[e]).join('、')} 能量`
      );
    }

    // 根据忌神定制
    if (input.bazi.unfavorableElements.length > 0) {
      customizations.push(
        `规避 ${input.bazi.unfavorableElements.map((e) => ELEMENT_NAMES[e]).join('、')} 能量`
      );
    }

    // 根据身强身弱定制
    if (input.bazi.strength > 7) {
      customizations.push('针对身强命格调整');
    } else if (input.bazi.strength < 4) {
      customizations.push('针对身弱命格调整');
    }

    return customizations;
  }
}

// ==================== 导出 ====================
