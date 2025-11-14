/**
 * 专业报告 v2.2 类型定义
 *
 * 用于：报告生成引擎、八字→策略映射、飞星→Checklist映射
 * 基于：pattern-analysis.ts + lingzheng.ts 输出
 */

// ============ 基础类型 ============

export type FiveElement = '木' | '火' | '土' | '金' | '水';
export type TenGod =
  | '比肩'
  | '劫财'
  | '食神'
  | '伤官'
  | '偏财'
  | '正财'
  | '偏官'
  | '正官'
  | '偏印'
  | '正印';
export type PatternType = 'standard' | 'follow' | 'transform' | 'special';
export type PatternStrength = 'strong' | 'medium' | 'weak';
export type PatternPurity = 'pure' | 'mixed' | 'broken';
export type Severity =
  | 'critical'
  | 'major'
  | 'minor'
  | 'none'
  | 'high'
  | 'medium'
  | 'low';
export type PalaceIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type ActionPriority = 'essential' | 'recommended' | 'optional';

// ============ 五行与用神类型 ============

/**
 * 五行元素对象（可能是字符串或包含element属性的对象）
 */
export interface ElementObject {
  element: FiveElement;
}

export type ElementOrObject = FiveElement | ElementObject | string;

/**
 * 用神定义
 */
export interface UsefulGod {
  element?: FiveElement;
  god?: TenGod;
  strength?: number;
}

/**
 * 大运柱定义
 */
export interface LuckPillar {
  startAge?: number; // 起始年龄
  age?: number; // 年龄（兼容旧格式）
  heavenlyStem?: ElementOrObject; // 天干
  stem?: ElementOrObject; // 天干（兼容旧格式）
  earthlyBranch?: ElementOrObject; // 地支
  branch?: ElementOrObject; // 地支（兼容旧格式）
  isFavorable?: boolean; // 是否有利
}

/**
 * 格局分析输入（来自pattern-analysis.ts）
 */
export interface PatternAnalysis {
  pattern: string; // 格局名称
  patternType?: PatternType;
  patternStrength: PatternStrength;
  patternPurity: PatternPurity;
  patternConfidence?: number;
  usefulGod: UsefulGod | ElementOrObject;
  formationFactors?: string[];
  destructionFactors?: string[];
  seasonalAdjustment?: {
    needed: boolean;
    element: FiveElement;
    reason: string;
  };
}

// ============ 时间窗口 ============

export interface TimeWindow {
  from: string; // ISO date, e.g. '2027-02-04'
  to: string; // ISO date, e.g. '2027-04-20'
  confidence: number; // 0-100
  note?: string;
}

// ============ 八字 → 策略/行动映射 ============

export interface ActionItem {
  id: string;
  title: string;
  reason: string; // 命理依据（用神/调候/五行等）
  expectedImpact: string; // 预期结果
  expectedTimeframe: string; // 见效时间，如 '1-2周'
  relatedElements?: FiveElement[];
  relatedGods?: TenGod[];
  priority?: ActionPriority;
  checklist?: string[]; // 子步骤
}

export interface LifeThemeStage {
  ageRange: string; // 如 '18-25岁'
  likelyEvents: string[]; // 可能经历的事件
  meaning: string; // 命理意义
  lesson: string; // 课题
  skills: string[]; // 习得能力
  evidence?: string[]; // 佐证/历史对照
}

export interface StrategyMapping {
  // 人生主题故事
  lifeTheme: {
    title: string; // 如："先蓄力、后爆发"
    summary: string; // 核心摘要
    stages: LifeThemeStage[];
  };

  // 职业匹配
  careerMatch: Array<{
    career: string;
    score: number; // 0-100
    rationale: string;
  }>;

  // 决策时间窗口
  decisionWindows: Array<{
    topic: string; // 如 '创业' '结婚' '置业'
    window: TimeWindow;
    rationale: string;
  }>;

  // 分级行动方案
  actions: {
    essential: ActionItem[]; // 必做项（1-2周）
    recommended: ActionItem[]; // 推荐项（1-2月）
    optional: ActionItem[]; // 加分项（3-6月）
  };

  // 风险提示
  riskWarnings: string[];

  // 归因分解（用于"卸下自责"）
  attribution: {
    timeFactor: number; // 时间/大运/流年占比（%）
    endowmentFactor: number; // 先天禀赋/五行占比（%）
    environmentFactor: number; // 环境/风水占比（%）
    strategyFactor: number; // 方法/策略占比（%）
    notes?: string[]; // 补充说明
  };
}

// ============ 决策对比 ============

export interface DecisionOption {
  id: string;
  name: string; // 如 '方案A：跳槽'
  matchScore: number; // 匹配度 0-100
  shortTermRisk: string; // 短期风险描述
  longTermBenefit: string; // 长期收益描述
  bestTiming: string; // 最佳时机
  rationale: string;
}

export interface DecisionComparison {
  topic: string; // 如 '事业路径选择'
  options: DecisionOption[]; // A/B/C方案
  recommendation: string; // 倾向性建议
  recommendationRationale: string;
  nonOptimalRemedies?: {
    // 若选非最优的补救
    option: string;
    remedies: string[];
    keyTiming: string;
  };
}

// ============ 飞星 → Checklist映射 ============

export interface EnvironmentalTask {
  id: string;
  palace: PalaceIndex;
  bagua: string; // 如 '乾' '坎' '艮' '巽' '离' '坤' '兑' '震' '中'
  task: string; // 动作：摆放/清理/移动/增亮等
  rationale: string; // 命理/飞星/零正依据
  severity: Severity;
  expectedImpact?: string;
  dueBy?: string; // 截止时间
  recurrence?: 'weekly' | 'monthly' | 'quarterly'; // 周期性任务
}

export interface FengshuiChecklist {
  // 水位布置（零神见水）
  waterPlacement: {
    favorablePalaces: PalaceIndex[];
    unfavorablePalaces: PalaceIndex[];
    actions: EnvironmentalTask[];
  };

  // 山位布置（正神见山）
  mountainPlacement: {
    favorablePalaces: PalaceIndex[];
    unfavorablePalaces: PalaceIndex[];
    actions: EnvironmentalTask[];
  };

  // 综合任务清单
  environmentChecklist: EnvironmentalTask[];

  // 运转变更建议（如从8运到9运）
  timeChangeAdvice: {
    transitionAdvice: string[];
    riskLevel: 'high' | 'medium' | 'low';
    riskDescription: string;
  };

  // 零正审计
  zeroPositiveAudit: {
    isReversed: boolean;
    issues: string[];
    severity: 'critical' | 'major' | 'minor' | 'none';
  };
}

// ============ 希望之光 ============

export interface HopeTimeline {
  shortTerm: {
    timeframe: string; // '6-12个月'
    changes: string[];
  };
  midTerm: {
    timeframe: string; // '1-3年'
    changes: string[];
    turningPoint?: string; // 如 '2027年春季'
  };
  longTerm: {
    timeframe: string; // '3-10年'
    changes: string[];
  };
  whyYouWillImprove: string[]; // 三个理由
}

// ============ 完整报告输出 ============

export interface ReportOutput_v2_2 {
  // 元信息
  meta: {
    name: string;
    genderTitle: string; // 先生/女士
    reportDate: string;
    birthInfo: {
      date: string;
      time: string;
      city: string;
      gender: string;
    };
    analysisHours: number;
    chartsCount: number;
    supportPlan: string;
  };

  // 摘要
  summary: {
    lifeThemeTitle: string;
    keywords: [string, string, string];
    milestones: Array<{ event: string; time: string }>;
    thisWeekActions: [string, string, string];
  };

  // 八字分析
  baziAnalysis: {
    primaryPattern: string;
    patternType: PatternType;
    patternStrength: PatternStrength;
    patternPurity: PatternPurity;
    patternConfidence: number;
    formationList: string[];
    destructionList: string[];
    usefulGod: {
      primary: TenGod[];
      secondary: TenGod[];
      avoidance: TenGod[];
      explanation: string;
    };
    seasonalAdjustment?: {
      needed: boolean;
      element: FiveElement;
      reason: string;
    };
  };

  // 策略映射
  strategyMapping: StrategyMapping;

  // 决策对比
  decisionComparison?: DecisionComparison;

  // 风水清单
  fengshuiChecklist: FengshuiChecklist;

  // 希望之光
  hopeTimeline: HopeTimeline;

  // 六大领域（文本，由AI或模板生成）
  sixDomains: {
    talent: string;
    careerFinance: string;
    relationship: string;
    health: string;
    family: string;
    network: string;
  };

  // 对比与验证
  comparison: {
    populationPercentile: string;
    patternRarity: string;
    similarCases: string[];
    timeMisalignmentNote: string;
  };

  // 可视化图表URL（若生成）
  charts?: {
    timelineUrl?: string;
    radarUrl?: string;
    heatmapUrl?: string;
    waveUrl?: string;
    ganttUrl?: string;
  };

  // 附录
  appendix: {
    glossary: string;
    faq: string;
    supportContact: string;
  };
}

// ============ 辅助函数类型 ============

/**
 * 从 analyzePattern 结果映射到 StrategyMapping
 */
export type BaziToStrategyMapper = (
  patternAnalysis: PatternAnalysis,
  luckPillars: LuckPillar[],
  currentAge: number,
  userContext?: Record<string, unknown>
) => StrategyMapping;

/**
 * 从 analyzeLingzheng 结果映射到 FengshuiChecklist
 */
export type FengshuiToChecklistMapper = (
  lingzhengAnalysis: Record<string, unknown>,
  recommendations: Record<string, unknown>,
  reversedCheck: Record<string, unknown>,
  timeChange?: Record<string, unknown>
) => FengshuiChecklist;
