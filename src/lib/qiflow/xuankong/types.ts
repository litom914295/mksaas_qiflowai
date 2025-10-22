export type Yun = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type FlyingStar = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type PalaceIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type Layer = 'period' | 'year' | 'month' | 'day';

export type LuoPanAngle = {
  degrees: number;
  toleranceDeg?: number;
};

export type PlateCell = {
  palace: PalaceIndex;
  mountainStar: FlyingStar;
  facingStar: FlyingStar;
  periodStar?: FlyingStar;
};

export type Plate = PlateCell[];

export type StackedPlates = Record<Layer, Plate>;

export type Evaluation = {
  score: number;
  tags: string[];
  reasons: string[];
};

export type GenerateFlyingStarInput = {
  observedAt: Date;
  facing: LuoPanAngle;
  location?: { lat: number; lon: number; declinationDeg?: number };
  config?: Partial<FlyingStarConfig>;
  // 新增：支持兼向信息
  jianzuo?: Mountain;
  jianxiang?: Mountain;
};

export type GenerateFlyingStarOutput = {
  period: Yun;
  plates: StackedPlates;
  evaluation: Record<PalaceIndex, Evaluation>;
  meta: { rulesApplied: string[]; ambiguous: boolean };
  // 新增：格局分析结果
  geju?: GejuAnalysis;
  wenchangwei?: string;
  caiwei?: string;
};

// 格局分析类型
export type GejuType =
  | '旺山旺水'
  | '上山下水'
  | '双星会坐'
  | '双星会向'
  | '全局合十'
  | '对宫合十'
  | '连珠三般'
  | '父母三般'
  | '离宫打劫'
  | '坎宫打劫'
  | '山星伏吟'
  | '向星伏吟'
  | '单宫伏吟'
  | '单宫反吟'
  | '替卦反伏吟'
  | '七星打劫'
  | '三般卦'
  | '零正颠倒'
  | '城门诀';

export type GejuAnalysis = {
  types: GejuType[];
  descriptions: string[];
  isFavorable: boolean;
  // 新增：替卦分析
  tiguaAnalysis?: TiguaAnalysis;
  // 新增：零正分析
  lingzhengAnalysis?: LingzhengAnalysis;
  // 新增：城门诀分析
  chengmenjueAnalysis?: ChengmenjueAnalysis;
};

// 替卦分析结果
export type TiguaAnalysis = {
  hasTigua: boolean;
  rule?: {
    zuo: Mountain;
    xiang: Mountain;
    replacementZuo: Mountain;
    replacementXiang: Mountain;
    description: string;
    category: '正替' | '旁替';
  };
  impact: {
    originalPattern: string;
    adjustedPattern: string;
    isImproved: boolean;
    recommendations: string[];
  };
  fanfuyinAnalysis: {
    isFanfuyinTigua: boolean;
    description: string;
    severity: 'high' | 'medium' | 'low';
  };
  rating: 'excellent' | 'good' | 'fair' | 'poor' | 'dangerous';
  score: number;
};

// 零正理论分析
export type LingzhengAnalysis = {
  zeroGodPosition: PalaceIndex[]; // 零神位
  positiveGodPosition: PalaceIndex[]; // 正神位
  isZeroPositiveReversed: boolean; // 是否零正颠倒
  waterPlacement: {
    favorable: PalaceIndex[]; // 宜见水的位置
    unfavorable: PalaceIndex[]; // 忌见水的位置
  };
  mountainPlacement: {
    favorable: PalaceIndex[]; // 宜见山的位置
    unfavorable: PalaceIndex[]; // 忌见山的位置
  };
  recommendations: string[];
};

// 城门诀分析
export type ChengmenjueAnalysis = {
  hasChengmen: boolean; // 是否有城门
  chengmenPositions: {
    palace: PalaceIndex;
    description: string;
    effectiveness: 'high' | 'medium' | 'low';
  }[];
  activationMethods: string[]; // 催旺方法
  taboos: string[]; // 禁忌事项
};

// 九星生旺死煞退状态
export type StarStatus = '旺' | '生' | '死' | '煞' | '退';

// 九星信息
export type StarInfo = {
  number: FlyingStar;
  name: string;
  alias: string;
  wuxing: string;
  jixiong: '吉' | '凶';
  status: StarStatus;
  meaning: {
    wang: string; // 旺时寓意
    shuai: string; // 衰时寓意
  };
};

export const DEFAULT_TOLERANCE_DEG = 0.5 as const;

export type FlyingStarConfig = {
  toleranceDeg: number;
  applyTiGua: boolean;
  applyFanGua: boolean;
  evaluationProfile: 'standard' | 'conservative' | 'aggressive';
};

export const DEFAULT_FLYING_STAR_CONFIG: FlyingStarConfig = {
  toleranceDeg: DEFAULT_TOLERANCE_DEG,
  applyTiGua: false,
  applyFanGua: false,
  evaluationProfile: 'standard',
};

// Authority 24 mountains sequence (each 15°):
// 子(0°), 癸(7.5°), 丑(15°), 艮(22.5°), 寅(30°), 甲(37.5°), 卯(45°), 乙(52.5°),
// 辰(60°), 巽(67.5°), 巳(75°), 丙(82.5°), 午(90°), 丁(97.5°), 未(105°), 坤(112.5°),
// 申(120°), 庚(127.5°), 酉(135°), 辛(142.5°), 戌(150°), 乾(157.5°), 亥(165°), 壬(172.5°)
export type Mountain =
  | '子'
  | '癸'
  | '丑'
  | '艮'
  | '寅'
  | '甲'
  | '卯'
  | '乙'
  | '辰'
  | '巽'
  | '巳'
  | '丙'
  | '午'
  | '丁'
  | '未'
  | '坤'
  | '申'
  | '庚'
  | '酉'
  | '辛'
  | '戌'
  | '乾'
  | '亥'
  | '壬';

export type AngleToMountainResult = {
  mountain: Mountain;
  ambiguous: boolean;
  candidates?: Mountain[];
};

// ========== 统一飞星可视化接口 ==========

// 飞星颜色主题配置
export type StarColorTheme = {
  1: { bg: string; text: string; border: string };
  2: { bg: string; text: string; border: string };
  3: { bg: string; text: string; border: string };
  4: { bg: string; text: string; border: string };
  5: { bg: string; text: string; border: string };
  6: { bg: string; text: string; border: string };
  7: { bg: string; text: string; border: string };
  8: { bg: string; text: string; border: string };
  9: { bg: string; text: string; border: string };
};

// 宫位显示配置
export type PalaceDisplayConfig = {
  name: string; // 宫位名称（如：坎、坤、震等）
  direction: string; // 方位（如：北、西南、东等）
  element: string; // 五行属性
  color: string; // 主题色彩
};

// 统一的飞星单元格数据
export type EnhancedPlateCell = PlateCell & {
  // 可视化属性
  displayConfig: PalaceDisplayConfig;
  evaluation: Evaluation;

  // 扩展的星曜信息
  mountainStarInfo: StarInfo;
  facingStarInfo: StarInfo;
  periodStarInfo?: StarInfo;

  // 组合分析
  combinationAnalysis: {
    mountainFacing: string; // 山向组合分析
    verdict: '大吉' | '吉' | '平' | '凶' | '大凶';
    confidence: number; // 分析置信度 0-1
  };

  // 房间适配信息（可选）
  roomRecommendations?: {
    suitable: string[]; // 适宜用途
    unsuitable: string[]; // 不宜用途
    enhancements: string[]; // 布局优化建议
  };
};

// 统一的九宫格数据
export type EnhancedPlate = EnhancedPlateCell[];

// 飞星网格的交互事件
export type FlyingStarGridEvents = {
  onCellClick?: (palace: PalaceIndex, cell: EnhancedPlateCell) => void;
  onCellHover?: (palace: PalaceIndex, cell: EnhancedPlateCell) => void;
  onCellDoubleClick?: (palace: PalaceIndex, cell: EnhancedPlateCell) => void;
};

// 飞星网格的显示选项
export type FlyingStarGridOptions = {
  // 显示控制
  showStarNumbers: boolean;
  showStarNames: boolean;
  showDirections: boolean;
  showEvaluations: boolean;

  // 交互控制
  enableHover: boolean;
  enableSelection: boolean;
  enableTooltips: boolean;

  // 样式控制
  colorTheme: StarColorTheme;
  cellSize: 'small' | 'medium' | 'large';
  borderStyle: 'solid' | 'dashed' | 'none';

  // 动画控制
  enableAnimations: boolean;
  hoverTransition: string;
};

// 飞星分析页面的完整数据结构
export type FlyingStarAnalysisData = {
  // 基础数据
  period: Yun;
  plates: StackedPlates;
  enhancedPlate: EnhancedPlate;

  // 分析结果
  evaluation: Record<PalaceIndex, Evaluation>;
  geju: GejuAnalysis;

  // 高级分析
  tiguaAnalysis?: TiguaAnalysis;
  lingzhengAnalysis?: LingzhengAnalysis;
  chengmenjueAnalysis?: ChengmenjueAnalysis;

  // 元数据
  meta: {
    rulesApplied: string[];
    ambiguous: boolean;
    calculatedAt: Date;
    version: string;
  };
};

// 房间风水分析结果
export type RoomFengshuiAnalysis = {
  roomId: string;
  roomName: string;
  mappedPalace: PalaceIndex;
  score: number;
  verdict: '大吉' | '吉' | '平' | '凶' | '大凶';

  // 详细分析
  mountainStarInfluence: {
    star: FlyingStar;
    influence: string;
    isPositive: boolean;
  };
  facingStarInfluence: {
    star: FlyingStar;
    influence: string;
    isPositive: boolean;
  };

  // 个人化建议（基于八字）
  personalRecommendations?: {
    favorable: string[]; // 有利因素
    unfavorable: string[]; // 不利因素
    adjustments: string[]; // 调整建议
    confidence: number; // 分析置信度
  };

  // 使用建议
  usageRecommendations: {
    primary: string[]; // 主要用途推荐
    avoid: string[]; // 避免用途
    timing: string[]; // 时间建议
    colors: string[]; // 颜色建议
    directions: string[]; // 朝向建议
  };
};

// ========== v6.0 增强类型定义 ==========

// 宫位名称类型
export type PalaceName =
  | '中'
  | '乾'
  | '兑'
  | '离'
  | '震'
  | '巽'
  | '坎'
  | '艮'
  | '坤';

// 吉凶等级
export type FortuneRating =
  | '大吉'
  | '吉'
  | '次吉'
  | '平'
  | '次凶'
  | '凶'
  | '大凶';

export type PositionRating =
  | 'excellent'
  | 'good'
  | 'moderate'
  | 'weak'
  | 'poor';

export type Element = '木' | '火' | '土' | '金' | '水';

// v6.0 增强宫位信息
export type EnhancedPalaceInfo = {
  palace: PalaceName;
  mountainStar: FlyingStar;
  facingStar: FlyingStar;
  timeStar: FlyingStar; // 运盘星
  fortuneRating: FortuneRating;
  score: number; // 0-100

  // 兼容字段（部分模块会读取这些可选属性）
  yearStar?: FlyingStar; // 年飞星
  rating?: 'auspicious' | 'neutral' | 'inauspicious'; // 宫位吉凶评级

  // 可选详细信息
  starNames?: {
    mountain: string;
    facing: string;
    time: string;
  };
  combinations?: {
    type: string;
    description: string;
    isFavorable: boolean;
  }[];
  warnings?: string[];
  recommendations?: string[];
};

// v6.0 增强飞星盘
export type EnhancedXuankongPlate = {
  period: number;
  facing: {
    degrees: number;
    direction: string;
    palace: PalaceName;
  };
  palaces: Record<PalaceName, EnhancedPalaceInfo>;
  specialPatterns: string[];
  overallScore: number;
  metadata: {
    calculatedAt: Date;
    calculationMethod: 'standard' | 'tigua' | 'chengmenjue';
    appliedRules?: string[];
  };
};

// v6.0 智能推荐选项
export type SmartRecommendationsOptions = {
  includeQuickWins?: boolean; // 包含快速见效方案
  includeLongTermPlan?: boolean; // 包含长期规划
  includeTimeline?: boolean; // 包含时间轴
  budgetRange?: {
    min: number;
    max: number;
  };
  focusAreas?: ('health' | 'wealth' | 'career' | 'relationship' | 'study')[];
};

// v6.0 行动建议
export type ActionRecommendation = {
  id: string;
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  category: 'layout' | 'decoration' | 'color' | 'furniture' | 'other';
  reason: string;
  specificSteps: string[];
  estimatedTime?: string;
  estimatedCost?: string;
  expectedImpact?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
};

// v6.0 快速见效方案
export type QuickWinRecommendation = {
  title: string;
  description: string;
  estimatedTime: string;
  estimatedCost: string;
  expectedImpact: string;
  steps: string[];
  materials?: string[];
};

// v6.0 长期规划阶段
export type LongTermPhase = {
  phase: number;
  title: string;
  duration: string;
  goals: string[];
  actions: string[];
  expectedOutcomes: string[];
};

// v6.0 智能推荐结果
export type SmartRecommendationResult = {
  prioritizedActions: ActionRecommendation[];
  quickWins: QuickWinRecommendation[];
  longTermPlan: {
    overview: string;
    phases: LongTermPhase[];
    totalDuration: string;
  };
  timeline?: {
    period: string;
    milestones: string[];
    criticalDates: string[];
  };
};

// v6.0 个性化分析选项
export type PersonalizedAnalysisOptions = {
  userProfile: {
    birthDate: Date;
    bazi: {
      year: { gan: string; zhi: string };
      month: { gan: string; zhi: string };
      day: { gan: string; zhi: string };
      hour: { gan: string; zhi: string };
    };
    gender?: 'male' | 'female';
    occupation?: string;
  };
  includeHealthAnalysis?: boolean;
  includeCareerGuidance?: boolean;
  includeRelationshipAdvice?: boolean;
};

// v6.0 八字融合分析
export type BaziIntegration = {
  zodiac: string; // 生肖
  mainElement: '金' | '木' | '水' | '火' | '土'; // 日元五行
  favorableElements: ('金' | '木' | '水' | '火' | '土')[]; // 喜用神
  unfavorableElements: ('金' | '木' | '水' | '火' | '土')[]; // 忌神
  luckyDirections: string[]; // 幸运方位
  unluckyDirections: string[]; // 不利方位
  seasonalInfluence: string; // 季节影响
};

// v6.0 个性化推荐
export type PersonalizedRecommendation = {
  title: string;
  category: 'health' | 'career' | 'home' | 'energy';
  priority: 'high' | 'medium' | 'low';
  description: string;
  actions: string[];
  reasoning: string;
  timeline?: string;
};

// v6.0 个性化分析结果
export type PersonalizedAnalysisResult = {
  userProfile: PersonalizedAnalysisOptions['userProfile'];
  baziIntegration: BaziIntegration;
  personalizedRecommendations: PersonalizedRecommendation[];
  roomPriorities: {
    palace: PalaceName;
    suitability: number; // 0-100
    reasons: string[];
  }[];
  avoidanceAreas: {
    palace: PalaceName;
    severity: 'high' | 'medium' | 'low';
    reasons: string[];
  }[];
};

// v6.0 流年分析选项
export type LiunianAnalysisOptions = {
  year: number;
  includeMonthly?: boolean;
  includeDailyGuidance?: boolean;
  focusAreas?: ('health' | 'wealth' | 'career' | 'relationship')[];
};

// v6.0 当前年份信息
export type CurrentYearInfo = {
  year: number;
  yearStar: FlyingStar;
  ganZhi: string; // 干支
  element: '金' | '木' | '水' | '火' | '土';
  characteristics: string;
};

// v6.0 年度运势
export type YearlyFortune = {
  overallScore: number;
  overallRating: 'excellent' | 'good' | 'fair' | 'challenging';
  characteristics: string;
  favorableAspects: string[];
  unfavorableAspects: string[];
  keyMonths: number[];
  yearlyRecommendations: string[];
};

// v6.0 月度趋势
export type MonthlyTrend = {
  month: number;
  score: number;
  trend: 'improving' | 'declining' | 'stable';
  mainInfluences: string[];
  recommendations: string[];
};

// v6.0 关键时期
export type CriticalPeriod = {
  period: string; // 如 "2024年3月"
  type: 'favorable' | 'unfavorable' | 'neutral';
  description: string;
  suggestions: string[];
  importance: number; // 1-10
};

// v6.0 流年分析结果
export type LiunianAnalysisResult = {
  currentYear: CurrentYearInfo;
  yearlyFortune: YearlyFortune;
  monthlyTrends: MonthlyTrend[];
  criticalPeriods: CriticalPeriod[];
  annualGuidance: {
    health: string[];
    wealth: string[];
    career: string[];
    relationship: string[];
  };
};
