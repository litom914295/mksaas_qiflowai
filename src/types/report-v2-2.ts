/**
 * 专业报告 v2-2 类型定义（新命名规范）
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
    title: string; // 如：\"先蓄力、后爆发\"
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

  // 归因分解（用于\"卸下自责\"）
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
  // v2.2 增强功能
  enhancedInsights?: {
    combinedPath?: CombinedDecisionPath;
    futureSimulation?: DecisionSimulation;
    riskWarning?: RiskWarningTimeline;
  };
}

// ============ 决策增强模块类型（v2.2 新增）============

/**
 * 八字力量评估
 * 用于计算特定时间段内八字命局的强弱状态
 */
export interface BaziStrength {
  /** 用神得力度（0-100分）：用神在当前时段的力量强度 */
  usefulGodPower: number;
  /** 格局强度（0-100分）：整体格局的稳定性和纯度 */
  patternStrength: number;
  /** 综合评分（0-100分）：用神得力度 × 格局强度 */
  overallScore: number;
  /** 置信度（0-100%）：评估的可靠程度 */
  confidence: number;
  /** 命理依据：具体的天干地支分析 */
  rationale: string;
}

/**
 * 时间节点通用类型
 * 用于标记时间线上的关键节点（大运、流年、流月）
 */
export interface TimelineNode {
  /** 日期（ISO 8601格式）：如 "2025-03-15" */
  date: string;
  /** 节点类型：大运/流年/流月/节气 */
  type: 'luck_pillar' | 'year' | 'month' | 'solar_term';
  /** 天干地支：如 "甲子" */
  ganZhi?: string;
  /** 命理状态：用神得力/用神受克/平和 */
  baziState: 'favorable' | 'unfavorable' | 'neutral';
  /** 运势评分（0-100分）*/
  score: number;
  /** 关键标注：如 "大运交替" "转折点" */
  label?: string;
  /** 详细说明 */
  note?: string;
}

/**
 * 组合决策路径阶段
 * 表示决策执行的一个时间阶段
 */
export interface DecisionPathStage {
  /** 阶段序号 */
  stageIndex: number;
  /** 时间段（ISO日期范围）：如 "2025-03-01 ~ 2027-02-28" */
  timePeriod: string;
  /** 时间窗口对象 */
  timeWindow: TimeWindow;
  /** 大运信息 */
  luckPillar: {
    ganZhi: string; // 如 "庚金"
    startAge: number;
    endAge: number;
    isFavorable: boolean;
  };
  /** 执行方案：该阶段应该做什么 */
  action: string;
  /** 命理依据：为什么这个时段适合这个方案 */
  rationale: string;
  /** 成功率（0-100%）：基于格局强度、用神力量、流年影响综合计算 */
  successRate: number;
  /** 八字力量评估 */
  baziStrength: BaziStrength;
  /** 关键流年提示：该阶段内需要注意的流年 */
  yearlyHints?: Array<{
    year: number; // 如 2025
    ganZhi: string; // 如 "乙巳"
    impact: 'positive' | 'negative' | 'neutral';
    note: string;
  }>;
  /** 风险提示 */
  risks?: string[];
}

/**
 * 组合决策路径
 * 不是简单的二选一，而是"先A后B"或"分阶段执行"的最优路径
 */
export interface CombinedDecisionPath {
  /** 决策主题 */
  topic: string;
  /** 路径策略：组合/时序/混合 */
  strategy: 'combined' | 'sequential' | 'hybrid';
  /** 路径总体成功率（0-100%） */
  overallSuccessRate: number;
  /** 分阶段执行计划 */
  stages: DecisionPathStage[];
  /** 路径优势说明 */
  advantages: string[];
  /** 与直接执行单一方案的对比 */
  comparedToSingle?: {
    singleOptionId: string;
    singleSuccessRate: number;
    improvementRate: number; // 提升幅度（%）
    reason: string;
  };
  /** 关键转折点：需要特别注意的时间节点 */
  turningPoints: TimelineNode[];
}

/**
 * 年度模拟结果
 * 模拟某一年的运势和事件概率
 */
export interface YearlySimulation {
  /** 年份 */
  year: number;
  /** 流年天干地支：如 "乙巳" */
  ganZhi: string;
  /** 运势评分（0-100分）*/
  score: number;
  /** 运势等级：优秀/良好/一般/较差/危险 */
  grade: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  /** 八字力量评估 */
  baziStrength: BaziStrength;
  /** 关键事件概率分布 */
  eventProbabilities?: {
    career_breakthrough: number; // 事业突破概率
    financial_gain: number; // 财运提升概率
    relationship_progress: number; // 感情进展概率
    health_issue: number; // 健康风险概率
    unexpected_change: number; // 意外变动概率
  };
  /** 关键建议 */
  suggestions: string[];
  /** 是否为转折点 */
  isTurningPoint: boolean;
  /** 转折点说明（如果是转折点） */
  turningPointNote?: string;
}

/**
 * 决策模拟结果
 * 模拟未来5-10年的走向和概率分布
 */
export interface DecisionSimulation {
  /** 决策选项ID */
  optionId: string;
  /** 决策名称 */
  optionName: string;
  /** 模拟时长（年） */
  simulationYears: number;
  /** 年度时间线：逐年分析 */
  yearlyTimeline: YearlySimulation[];
  /** 整体成功概率（0-100%） */
  overallSuccessProbability: number;
  /** 高峰期：运势最好的年份 */
  peakYears: number[];
  /** 低谷期：运势最差的年份 */
  valleyYears: number[];
  /** 最佳启动时间（ISO日期+月份范围）*/
  bestStartTiming: {
    date: string; // 如 "2025-03-15"
    monthRange: string; // 如 "3-6月"
    reason: string;
  };
  /** 关键转折点 */
  turningPoints: TimelineNode[];
  /** 风险预警：未来可能遇到的风险 */
  upcomingRisks: Array<{
    timeframe: string; // 如 "2028-2029年"
    riskType: string;
    severity: Severity;
    mitigation: string;
  }>;
  /** 情景分析 */
  scenarios?: {
    best: {
      probability: number;
      outcome: string;
      preconditions: string[];
    };
    baseline: {
      probability: number;
      outcome: string;
      preconditions: string[];
    };
    worst: {
      probability: number;
      outcome: string;
      riskFactors: string[];
    };
  };
}

/**
 * 风险类型枚举
 */
export type RiskType =
  | 'financial' // 财务风险（财星受克）
  | 'health' // 健康风险（日主受伤）
  | 'interpersonal' // 人际风险（官杀过旺）
  | 'decision' // 决策风险（用神无力）
  | 'career' // 事业风险（事业星受损）
  | 'relationship'; // 感情风险（配偶宫受冲）

/**
 * 风险预警节点
 * 标记特定时间段的风险
 */
export interface RiskWarningNode {
  /** 风险ID */
  id: string;
  /** 风险时间段（ISO日期范围） */
  timeframe: {
    from: string; // 如 "2025-07-01"
    to: string; // 如 "2025-09-30"
    description: string; // 如 "乙巳年，壬申-癸酉月"
  };
  /** 风险类型 */
  riskType: RiskType;
  /** 风险等级（1-5星）*/
  severity: 1 | 2 | 3 | 4 | 5;
  /** 风险标题 */
  title: string;
  /** 具体表现：可能发生什么 */
  manifestation: string;
  /** 命理依据：为什么会有这个风险 */
  rationale: string;
  /** 影响八字要素 */
  affectedElements: {
    usefulGod?: boolean; // 是否影响用神
    dayMaster?: boolean; // 是否影响日主
    wealthStar?: boolean; // 是否影响财星
    officialStar?: boolean; // 是否影响官星
  };
  /** 提前预警时间（天数）*/
  advanceWarningDays: number;
  /** 缓解措施 */
  mitigation: {
    immediate: string[]; // 立即措施（1-2周内）
    preventive: string[]; // 预防措施（提前1-3个月）
    alternative: string[]; // 替代方案
  };
  /** 如果不采取措施的后果 */
  consequencesIfIgnored?: string;
}

/**
 * 风险预警时间线
 * 未来3-6个月的风险预警系统
 */
export interface RiskWarningTimeline {
  /** 决策选项ID */
  optionId: string;
  /** 决策名称 */
  optionName: string;
  /** 监控时长（月） */
  monitoringMonths: number;
  /** 当前综合风险等级 */
  currentOverallRisk: Severity;
  /** 风险节点列表（按时间排序） */
  warnings: RiskWarningNode[];
  /** 高风险节点数量 */
  highRiskCount: number;
  /** 中风险节点数量 */
  mediumRiskCount: number;
  /** 低风险节点数量 */
  lowRiskCount: number;
  /** 最近风险（最早的一个高风险）*/
  nextCriticalWarning?: RiskWarningNode;
  /** 风险日历（月度汇总）*/
  monthlyRiskCalendar?: Array<{
    month: string; // 如 "2025-07"
    riskLevel: Severity;
    riskCount: number;
    summary: string;
  }>;
  /** 综合建议 */
  overallAdvice: string[];
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

export interface ReportOutputV22 {
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
    timeMisalignmentNote?: string; // 可选：仅当 timeFactor >= 40% 时显示
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
