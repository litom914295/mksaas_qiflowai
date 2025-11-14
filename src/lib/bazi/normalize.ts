/**
 * 八字数据归一化层
 * 将不同来源的八字计算结果统一为UI友好的结构
 */

import type {
  DayMasterStrengthResult,
  EnhancedBaziResult,
  FavorableElementsResult,
} from './enhanced-calculator';

// ========== 农历日期格式化 ==========

/**
 * 农历日期对象结构
 */
export type LunarDateLike = {
  year: number;
  month: number;
  day: number;
  isLeap?: boolean;
};

/**
 * 格式化农历日期为可读字符串
 * @param lunar 农历日期对象
 * @param options 格式化选项
 * @returns 格式化后的农历日期字符串，例如："2024年闰04月08日"
 */
export function formatLunarDate(
  lunar: LunarDateLike | null | undefined,
  options?: { padZero?: boolean; showLeap?: boolean }
): string {
  if (!lunar) return '';

  const { padZero = true, showLeap = true } = options || {};

  try {
    const year = lunar.year;
    const month = lunar.month;
    const day = lunar.day;
    const isLeap = lunar.isLeap || false;

    // 验证输入有效性
    if (
      typeof year !== 'number' ||
      typeof month !== 'number' ||
      typeof day !== 'number'
    ) {
      console.warn('[formatLunarDate] 无效的输入数据:', lunar);
      return '';
    }

    // 格式化月份
    const monthStr = padZero ? String(month).padStart(2, '0') : String(month);

    // 格式化日期
    const dayStr = padZero ? String(day).padStart(2, '0') : String(day);

    // 添加闰月标识
    const leapPrefix = showLeap && isLeap ? '闰' : '';

    return `${year}年${leapPrefix}${monthStr}月${dayStr}日`;
  } catch (error) {
    console.error('[formatLunarDate] 格式化失败:', error);
    return '';
  }
}

// ========== 统一的数据模型定义 ==========

/**
 * 八字分析统一数据模型
 */
export interface BaziAnalysisModel {
  // 基础信息
  base: {
    name?: string;
    gender: 'male' | 'female';
    birth: {
      datetime: string; // ISO格式
      lunar?: string; // 农历日期
      timezone: string;
      location?: string;
    };
    pillars: {
      year: PillarInfo;
      month: PillarInfo;
      day: PillarInfo;
      hour: PillarInfo;
    };
    dayMaster: {
      stem: string;
      element: string;
      chinese: string;
    };
  };

  // 核心指标
  metrics: {
    overall: {
      score: number;
      level: string;
      description: string;
    };
    dayMasterStrength: {
      level: 'strong' | 'weak' | 'balanced';
      score: number;
      description: string;
    };
    elementScores: {
      wood: number;
      fire: number;
      earth: number;
      metal: number;
      water: number;
    };
    balance: {
      status: 'balanced' | 'imbalanced';
      shortage?: string[];
      excess?: string[];
    };
  };

  // 用神分析
  useful: {
    favorableElements: ElementInfo[];
    unfavorableElements: ElementInfo[];
    remedies: ActionItem[];
    avoidance: ActionItem[];
  };

  // 十神分析
  tenGods: {
    profile: TenGodItem[];
    dominant: string[];
    characteristics: string[];
  };

  // 格局分析
  patterns: {
    main: PatternInfo;
    secondary: PatternInfo[];
    stability: number;
    rationale: string;
  };

  // 运势分析
  luck: {
    currentDaYun?: DaYunPeriod;
    daYunTimeline: DaYunPeriod[];
    currentYear?: AnnualLuck;
    annualForecast?: AnnualLuck[];
  };

  // 领域洞察
  insights: {
    personality: PersonalityInsight;
    careerWealth: CareerInsight;
    healthMarriage: HealthMarriageInsight;
    dailyFortune?: DailyFortune;
  };

  // 专业建议
  advice: {
    actionableTips: ActionItem[];
    cautions: ActionItem[];
    yearlyFocus?: string[];
  };
}

// ========== 子类型定义 ==========

interface PillarInfo {
  heavenlyStem: string;
  earthlyBranch: string;
  element: string;
  hiddenStems?: string[];
  naYin?: string;
  tenGod?: string;
}

interface ElementInfo {
  element: string;
  chinese: string;
  priority: number;
  reason: string;
  suggestions?: {
    colors?: string[];
    directions?: string[];
    industries?: string[];
    items?: string[];
  };
}

interface ActionItem {
  category: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

interface TenGodItem {
  name: string;
  chinese: string;
  count: number;
  strength: number;
  trend: 'rising' | 'stable' | 'declining';
  keywords: string[];
  opportunities?: string[];
  risks?: string[];
}

interface PatternInfo {
  name: string;
  chinese: string;
  type: string;
  score: number;
  conditions: string[];
  breakingFactors?: string[];
}

interface DaYunPeriod {
  period: number;
  ageRange: [number, number];
  yearRange: [number, number];
  heavenlyStem: string;
  earthlyBranch: string;
  element: string;
  theme: string;
  fortune: {
    overall: number;
    career: number;
    wealth: number;
    relationship: number;
    health: number;
  };
}

interface AnnualLuck {
  year: number;
  age: number;
  heavenlyStem: string;
  earthlyBranch: string;
  zodiac: string;
  score: number;
  theme: string;
  favorable: string[];
  unfavorable: string[];
}

interface PersonalityInsight {
  strengths: string[];
  weaknesses: string[];
  communicationStyle: string;
  decisionMaking: string;
  growthAdvice: string[];
}

interface CareerInsight {
  suitableFields: string[];
  positions: string[];
  workStyle: string;
  wealthPattern: string;
  opportunities: string[];
  risks: string[];
  keyPeriods: string[];
}

interface HealthMarriageInsight {
  healthFocus: {
    organs: string[];
    concerns: string[];
    lifestyle: string[];
  };
  marriage: {
    partnerProfile?: string;
    timing?: string[];
    advice: string[];
    cautions: string[];
  };
}

interface DailyFortune {
  date: string;
  score: number;
  theme: string;
  favorable: string[];
  unfavorable: string[];
  advice: string;
}

// ========== 归一化函数 ==========

/**
 * 将增强型八字结果归一化为统一模型
 */
export function normalizeBaziResult(
  result: EnhancedBaziResult | null,
  additionalInfo?: {
    name?: string;
    location?: string;
    datetime?: string;
    gender?: 'male' | 'female';
  }
): BaziAnalysisModel | null {
  if (!result) return null;

  // 调试：输出完整的原始数据结构
  console.log('[normalize] 原始 EnhancedBaziResult 数据:', {
    pillars: result.pillars,
    elements: result.elements,
    tenGodsAnalysis: result.tenGodsAnalysis,
    pattern: result.pattern,
    luckPillars: result.luckPillars,
    keys: Object.keys(result),
  });

  try {
    // 提取基础信息
    const base = extractBaseInfo(result, additionalInfo);

    // 提取核心指标
    const metrics = extractMetrics(result);

    // 提取用神信息
    const useful = extractUsefulGods(result);

    // 提取十神信息
    const tenGods = extractTenGods(result);

    // 提取格局信息
    const patterns = extractPatterns(result);

    // 提取运势信息
    const luck = extractLuckInfo(result);

    // 提取领域洞察
    const insights = extractInsights(result);

    // 提取专业建议
    const advice = extractAdvice(result);

    return {
      base,
      metrics,
      useful,
      tenGods,
      patterns,
      luck,
      insights,
      advice,
    };
  } catch (error) {
    console.error('[normalizeBaziResult] 归一化失败:', error);
    return null;
  }
}

// ========== 内部提取函数 ==========

function extractBaseInfo(
  result: EnhancedBaziResult,
  additionalInfo?: any
): BaziAnalysisModel['base'] {
  const pillars = result.pillars || {};

  // 调试日志：输出原始四柱数据
  console.log('[normalize] 原始四柱数据:', {
    year: pillars.year,
    month: pillars.month,
    day: pillars.day,
    hour: pillars.hour,
  });

  return {
    name: additionalInfo?.name,
    gender: additionalInfo?.gender || 'male',
    birth: {
      datetime: additionalInfo?.datetime || '',
      lunar:
        (result as any).lunarText ||
        formatLunarDate((result as any).lunar) ||
        '',
      timezone: additionalInfo?.timezone || 'Asia/Shanghai',
      location: additionalInfo?.location,
    },
    pillars: {
      year: extractPillarInfo(pillars.year),
      month: extractPillarInfo(pillars.month),
      day: extractPillarInfo(pillars.day),
      hour: extractPillarInfo(pillars.hour),
    },
    dayMaster: {
      stem: pillars.day?.stem || pillars.day?.gan || '',
      element: (pillars.day as any)?.element || '',
      chinese:
        (pillars.day?.stem || pillars.day?.gan || '') +
        (pillars.day?.branch || pillars.day?.zhi || ''),
    },
  };
}

function extractPillarInfo(pillar: any): PillarInfo {
  if (!pillar) {
    console.warn('[extractPillarInfo] 柱信息为空');
    return {
      heavenlyStem: '',
      earthlyBranch: '',
      element: '',
    };
  }

  const extracted = {
    // 兼容 gan/zhi 和 stem/branch 两种命名
    heavenlyStem: pillar.stem || pillar.gan || '',
    earthlyBranch: pillar.branch || pillar.zhi || '',
    element: pillar.element || '',
    hiddenStems: pillar.hiddenStems || [],
    naYin: pillar.naYin || pillar.nayin,
    tenGod: pillar.tenGod,
  };

  console.log('[extractPillarInfo] 提取结果:', extracted);

  return extracted;
}

function extractMetrics(
  result: EnhancedBaziResult
): BaziAnalysisModel['metrics'] {
  const elements: any = result.elements || {};
  const dayMasterStrength = (result.dayMasterStrength ||
    {}) as Partial<DayMasterStrengthResult>;

  // 计算整体评分
  const overallScore = calculateOverallScore(result);

  return {
    overall: {
      score: overallScore,
      level: getScoreLevel(overallScore),
      description: getScoreDescription(overallScore),
    },
    dayMasterStrength: {
      level: (dayMasterStrength.strength as any) || 'balanced',
      score: (dayMasterStrength.score as any) || 50,
      description: (dayMasterStrength.factors as any)?.join('；') || '',
    },
    elementScores: {
      wood: elements.wood || elements.木 || 0,
      fire: elements.fire || elements.火 || 0,
      earth: elements.earth || elements.土 || 0,
      metal: elements.metal || elements.金 || 0,
      water: elements.water || elements.水 || 0,
    },
    balance: {
      status: elements.balance?.status || 'balanced',
      shortage: elements.balance?.shortage || [],
      excess: elements.balance?.excess || [],
    },
  };
}

function extractUsefulGods(
  result: EnhancedBaziResult
): BaziAnalysisModel['useful'] {
  const favorableElements = (result.favorableElements ||
    {}) as Partial<FavorableElementsResult>;
  const yongshen = (result as any).yongshen || {};

  // 构建有利元素列表
  const favorable: ElementInfo[] = [
    ...(favorableElements.primary || []),
    ...(favorableElements.secondary || []),
  ]
    .filter((elem) => elem && typeof elem === 'string') // 过滤无效元素
    .map((elem, index) => ({
      element: elem,
      chinese: getElementChinese(elem),
      priority: index + 1,
      reason: favorableElements.explanation || '',
      suggestions: getElementSuggestions(elem),
    }));

  // 构建不利元素列表
  const unfavorable: ElementInfo[] = (
    favorableElements.unfavorable ||
    yongshen.unfavorable ||
    []
  )
    .filter((elem: any) => elem && typeof elem === 'string') // 过滤无效元素
    .map((elem: string, index: number) => ({
      element: elem,
      chinese: getElementChinese(elem),
      priority: index + 1,
      reason: '需要避免或减少',
      suggestions: getElementAvoidance(elem),
    }));

  return {
    favorableElements: favorable,
    unfavorableElements: unfavorable,
    remedies: generateRemedies(favorable),
    avoidance: generateAvoidance(unfavorable),
  };
}

function extractTenGods(
  result: EnhancedBaziResult
): BaziAnalysisModel['tenGods'] {
  const tenGodsAnalysis = result.tenGodsAnalysis || {};
  const profile: TenGodItem[] = [];
  const dominant: string[] = [];

  // 调试：输出十神数据结构
  console.log('[extractTenGods] 十神原始数据:', tenGodsAnalysis);
  console.log(
    '[extractTenGods] 是否为对象:',
    typeof tenGodsAnalysis,
    Array.isArray(tenGodsAnalysis)
  );

  // 如果 tenGodsAnalysis 为空或不是对象，生成默认数据
  if (
    !tenGodsAnalysis ||
    typeof tenGodsAnalysis !== 'object' ||
    Object.keys(tenGodsAnalysis).length === 0
  ) {
    console.warn('[extractTenGods] 十神数据为空，生成默认数据');
    return {
      profile: generateDefaultTenGods(),
      dominant: [],
      characteristics: ['数据加载中', '请稍候'],
    };
  }

  // 处理十神数据
  Object.entries(tenGodsAnalysis).forEach(([name, data]: [string, any]) => {
    const item: TenGodItem = {
      name,
      chinese: getTenGodChinese(name),
      count: data.count || 0,
      strength: data.strength || 0,
      trend: data.trend || 'stable',
      keywords: data.keywords || [],
      opportunities: data.opportunities,
      risks: data.risks,
    };

    profile.push(item);

    if (data.strength > 70) {
      dominant.push(name);
    }
  });

  // 如果 profile 为空，生成默认数据
  if (profile.length === 0) {
    console.warn('[extractTenGods] profile 为空，生成默认数据');
    return {
      profile: generateDefaultTenGods(),
      dominant: [],
      characteristics: ['数据加载中', '请稍候'],
    };
  }

  return {
    profile,
    dominant,
    characteristics: generateCharacteristics(dominant),
  };
}

function extractPatterns(
  result: EnhancedBaziResult
): BaziAnalysisModel['patterns'] {
  const pattern: any = result.pattern || {};

  return {
    main: {
      name: pattern.primary || '未定格',
      chinese: pattern.primary || '未定格',
      type: '',
      score: pattern.stability || 0,
      conditions: [],
      breakingFactors: undefined,
    },
    secondary: (Array.isArray(pattern.secondary) ? pattern.secondary : []).map(
      (p: any) => ({
        name: typeof p === 'string' ? p : p.name || '',
        chinese: typeof p === 'string' ? p : p.chinese || '',
        type: '',
        score: 0,
        conditions: [],
      })
    ),
    stability: pattern.stability || 0,
    rationale: pattern.rationale || '',
  };
}

function extractLuckInfo(
  result: EnhancedBaziResult
): BaziAnalysisModel['luck'] {
  const luckPillars = result.luckPillars || [];
  const currentAge = calculateAge(result);

  // 获取出生年份
  const _anyResult = result as any;
  const birthYear = _anyResult.birthData?.datetime
    ? new Date(_anyResult.birthData.datetime).getFullYear()
    : new Date().getFullYear() - 30; // 默认30岁

  // 过滤重复的大运（与 enhanced-calculator.ts 保持一致）
  const uniquePillars: any[] = [];
  const seenPeriods = new Set<number>();
  const seenAgeRanges = new Set<string>();

  for (const pillar of luckPillars) {
    const period = pillar.period;
    const ageStart = pillar.startAge || 0;
    const ageRangeKey = `${ageStart}`;

    // 过滤重复的period或重复的年龄范围
    if (!seenPeriods.has(period) && !seenAgeRanges.has(ageRangeKey)) {
      seenPeriods.add(period);
      seenAgeRanges.add(ageRangeKey);
      uniquePillars.push(pillar);
    }
  }

  console.log(
    '[normalize] 过滤后大运数量:',
    uniquePillars.length,
    '(原始:',
    luckPillars.length,
    ')'
  );

  // 构建大运时间线
  const daYunTimeline: DaYunPeriod[] = uniquePillars.map(
    (pillar: any, index: number) => {
      // 计算年份范围
      const startYear = pillar.startYear || birthYear + pillar.startAge;
      const endYear = pillar.endYear || birthYear + pillar.endAge;

      return {
        period: pillar.period || index + 1,
        ageRange: [pillar.startAge || 0, pillar.endAge || 0],
        yearRange: [startYear, endYear],
        heavenlyStem: pillar.heavenlyStem || '',
        earthlyBranch: pillar.earthlyBranch || '',
        element: pillar.element || pillar.stemElement || '',
        theme: pillar.theme || pillar.description || generateDaYunTheme(pillar),
        fortune: {
          overall: pillar.score || 60,
          career: pillar.careerScore || 60,
          wealth: pillar.wealthScore || 60,
          relationship: pillar.relationshipScore || 60,
          health: pillar.healthScore || 60,
        },
      };
    }
  );

  // 找出当前大运
  const currentDaYun = daYunTimeline.find(
    (d) => currentAge >= d.ageRange[0] && currentAge <= d.ageRange[1]
  );

  return {
    currentDaYun,
    daYunTimeline: daYunTimeline,
    currentYear: generateCurrentYearLuck(result),
    annualForecast: generateAnnualForecast(result, 5), // 未来5年
  };
}

function extractInsights(
  result: EnhancedBaziResult
): BaziAnalysisModel['insights'] {
  // 优先从 interpretation 中提取真实的 AI 生成数据
  const interpretation = (result as any).interpretation;

  if (interpretation) {
    return {
      personality: {
        strengths: interpretation.personality?.traits || [],
        weaknesses:
          interpretation.personality?.behavior?.filter(
            (b: string) => b.includes('避免') || b.includes('注意')
          ) || [],
        communicationStyle:
          interpretation.personality?.mindset?.[0] || '直接坦率，注重逻辑',
        decisionMaking:
          interpretation.personality?.mindset?.[1] || '理性分析，谨慎决策',
        growthAdvice: interpretation.spirituality?.growth || [],
      },
      careerWealth: {
        suitableFields: interpretation.career?.suitable || [],
        positions: interpretation.career?.talents || [],
        workStyle: interpretation.career?.workStyle?.[0] || '目标导向',
        wealthPattern: interpretation.wealth?.patterns?.[0] || '稳健积累型',
        opportunities: interpretation.wealth?.opportunities || [],
        risks: interpretation.wealth?.risks || [],
        keyPeriods: interpretation.fortune?.critical || [],
      },
      healthMarriage: {
        healthFocus: {
          organs: interpretation.health?.vulnerabilities?.slice(0, 3) || [],
          concerns: interpretation.health?.constitution || [],
          lifestyle: interpretation.health?.wellness || [],
        },
        marriage: {
          partnerProfile: interpretation.relationships?.love?.[0] || undefined,
          timing: interpretation.relationships?.compatibility || undefined,
          advice: interpretation.relationships?.love?.slice(1) || [],
          cautions: interpretation.relationships?.social || [],
        },
      },
      dailyFortune: generateDailyFortune(result),
    };
  }

  // 回退到基于八字数据的生成（如果没有 interpretation）
  const tenGods = result.tenGodsAnalysis || {};
  const elements = result.elements || {};
  const pattern = result.pattern || {};

  return {
    personality: generatePersonalityInsight(tenGods, elements),
    careerWealth: generateCareerInsight(result),
    healthMarriage: generateHealthMarriageInsight(result),
    dailyFortune: generateDailyFortune(result),
  };
}

function extractAdvice(
  result: EnhancedBaziResult
): BaziAnalysisModel['advice'] {
  const favorable = result.favorableElements || {};
  const pattern = result.pattern || {};

  return {
    actionableTips: generateActionableTips(result),
    cautions: generateCautions(result),
    yearlyFocus: generateYearlyFocus(result),
  };
}

// ========== 辅助函数 ==========

function calculateOverallScore(result: EnhancedBaziResult): number {
  // 综合评分算法
  let score = 60; // 基础分

  // 日主强弱加分
  if (result.dayMasterStrength?.strength === 'balanced') {
    score += 10;
  }

  // 格局加分
  const pattern: any = result.pattern || {};
  if (pattern.stability) {
    score += pattern.stability * 0.2;
  }

  // 五行平衡加分
  const elements: any = result.elements || {};
  if (elements.balance?.status === 'balanced') {
    score += 10;
  }

  return Math.min(100, Math.max(0, score));
}

function getScoreLevel(score: number): string {
  if (score >= 85) return '优秀';
  if (score >= 70) return '良好';
  if (score >= 60) return '中等';
  if (score >= 40) return '一般';
  return '较差';
}

function getScoreDescription(score: number): string {
  if (score >= 85) return '命格优越，运势亨通';
  if (score >= 70) return '命格良好，运势平稳';
  if (score >= 60) return '命格中等，需要努力';
  if (score >= 40) return '命格一般，多加注意';
  return '命格较弱，需要调整';
}

function getElementChinese(element: string): string {
  const map: Record<string, string> = {
    wood: '木',
    fire: '火',
    earth: '土',
    metal: '金',
    water: '水',
    WOOD: '木',
    FIRE: '火',
    EARTH: '土',
    METAL: '金',
    WATER: '水',
  };
  return map[element] || element;
}

function getElementSuggestions(element: string): any {
  // 检查 element 是否存在
  if (!element || typeof element !== 'string') {
    return {};
  }

  const suggestions: Record<string, any> = {
    wood: {
      colors: ['绿色', '青色'],
      directions: ['东方', '东南'],
      industries: ['教育', '医疗', '园艺'],
      items: ['植物', '木质家具'],
    },
    fire: {
      colors: ['红色', '紫色'],
      directions: ['南方'],
      industries: ['科技', '传媒', '餐饮'],
      items: ['灯具', '电器'],
    },
    earth: {
      colors: ['黄色', '棕色'],
      directions: ['中央', '东北', '西南'],
      industries: ['房地产', '建筑', '农业'],
      items: ['陶瓷', '石材'],
    },
    metal: {
      colors: ['白色', '金色'],
      directions: ['西方', '西北'],
      industries: ['金融', '机械', '珠宝'],
      items: ['金属制品', '钟表'],
    },
    water: {
      colors: ['黑色', '蓝色'],
      directions: ['北方'],
      industries: ['物流', '旅游', '水产'],
      items: ['水景', '鱼缸'],
    },
  };

  return suggestions[element.toLowerCase()] || {};
}

function getElementAvoidance(element: string): any {
  // 返回需要避免的建议
  if (!element || typeof element !== 'string') {
    return {};
  }
  return getElementSuggestions(element);
}

function getTenGodChinese(name: string): string {
  const map: Record<string, string> = {
    bijian: '比肩',
    jiecai: '劫财',
    shishen: '食神',
    shangguan: '伤官',
    zhengcai: '正财',
    piancai: '偏财',
    zhengguan: '正官',
    qisha: '七杀',
    zhengyin: '正印',
    pianyin: '偏印',
  };
  return map[name] || name;
}

function generateRemedies(favorable: ElementInfo[]): ActionItem[] {
  return favorable.slice(0, 3).map((elem) => ({
    category: '五行补救',
    title: `增强${elem.chinese}元素`,
    description: `建议多接触${elem.suggestions?.colors?.join('、')}等颜色，选择${elem.suggestions?.directions?.join('、')}方位`,
    priority: 'high' as const,
  }));
}

function generateAvoidance(unfavorable: ElementInfo[]): ActionItem[] {
  return unfavorable.slice(0, 2).map((elem) => ({
    category: '五行避忌',
    title: `减少${elem.chinese}元素`,
    description: `避免过多${elem.chinese}属性的环境和物品`,
    priority: 'medium' as const,
  }));
}

function generateCharacteristics(dominant: string[]): string[] {
  const characteristics: string[] = [];

  if (dominant.includes('bijian')) characteristics.push('独立自主');
  if (dominant.includes('shishen')) characteristics.push('才华横溢');
  if (dominant.includes('zhengcai')) characteristics.push('稳重务实');
  if (dominant.includes('zhengguan')) characteristics.push('责任心强');
  if (dominant.includes('zhengyin')) characteristics.push('学习能力强');

  return characteristics;
}

function calculateAge(result: any): number {
  // 从结果中提取出生日期，计算周岁年龄（考虑月日）
  const now = new Date();
  let birthDate: Date | null = null;

  // 尝试从多个可能的位置获取出生日期
  if (result?.birthData?.datetime) {
    birthDate = new Date(result.birthData.datetime);
  } else if (
    result?.solar?.year &&
    result?.solar?.month &&
    result?.solar?.day
  ) {
    birthDate = new Date(
      result.solar.year,
      result.solar.month - 1,
      result.solar.day
    );
  } else if (result?.fourPillars?.year?.year) {
    // 如果只有年份，使用年份的1月1日作为默认
    birthDate = new Date(result.fourPillars.year.year, 0, 1);
  } else {
    // 完全没有出生信息，使用默认值（当前年份-30岁）
    birthDate = new Date(now.getFullYear() - 30, 0, 1);
  }

  // 计算周岁年龄：考虑月份和日期
  let age = now.getFullYear() - birthDate.getFullYear();

  // 如果今年生日还没到，年龄减1
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();
  const birthMonth = birthDate.getMonth();
  const birthDay = birthDate.getDate();

  if (
    currentMonth < birthMonth ||
    (currentMonth === birthMonth && currentDay < birthDay)
  ) {
    age--;
  }

  // 确保年龄不为负数
  return Math.max(0, age);
}

function generateDaYunTheme(pillar: any): string {
  // 根据大运的天干地支生成主题描述
  if (!pillar) return '运势发展期';

  const themes: Record<string, string> = {
    甲子: '开拓创新期',
    乙丑: '稳健发展期',
    丙寅: '光明进取期',
    丁卯: '灵活变通期',
    戊辰: '稳固基础期',
    己巳: '转型提升期',
    庚午: '果断决策期',
    辛未: '精细管理期',
    壬申: '流动发展期',
    癸酉: '深度积累期',
    甲戌: '突破创新期',
    乙亥: '合作共赢期',
    // 添加更多组合...
  };

  // 尝试获取天干地支
  let ganZhi = '';
  if (pillar.stem && pillar.branch) {
    ganZhi = pillar.stem + pillar.branch;
  } else if (pillar.gan && pillar.zhi) {
    ganZhi = pillar.gan + pillar.zhi;
  } else if (typeof pillar === 'string') {
    ganZhi = pillar;
  }

  // 返回对应主题或默认主题
  if (themes[ganZhi]) {
    return themes[ganZhi];
  }

  // 根据天干生成默认主题
  const stemThemes: Record<string, string> = {
    甲: '成长发展期',
    乙: '柔韧适应期',
    丙: '光明向上期',
    丁: '内在提升期',
    戊: '稳定积累期',
    己: '转化调整期',
    庚: '坚定执行期',
    辛: '精进完善期',
    壬: '智慧流动期',
    癸: '深度沉淀期',
  };

  const firstChar = ganZhi[0] || pillar.stem || pillar.gan || '';
  return stemThemes[firstChar] || '运势发展期';
}

function generateCurrentYearLuck(result: any): AnnualLuck {
  const currentYear = new Date().getFullYear();
  return {
    year: currentYear,
    age: calculateAge(result),
    heavenlyStem: '甲',
    earthlyBranch: '辰',
    zodiac: '龙',
    score: 75,
    theme: '稳步前进',
    favorable: ['事业发展', '人际关系'],
    unfavorable: ['健康注意'],
  };
}

function generateAnnualForecast(result: any, years: number): AnnualLuck[] {
  const forecast: AnnualLuck[] = [];
  const currentYear = new Date().getFullYear();

  for (let i = 0; i < years; i++) {
    forecast.push({
      year: currentYear + i,
      age: calculateAge(result) + i,
      heavenlyStem: '甲',
      earthlyBranch: '辰',
      zodiac: '龙',
      score: 70 + Math.random() * 20,
      theme: '平稳发展',
      favorable: ['工作'],
      unfavorable: [],
    });
  }

  return forecast;
}

function generatePersonalityInsight(
  tenGods: any,
  elements: any
): PersonalityInsight {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const growthAdvice: string[] = [];
  let communicationStyle = '待分析';
  let decisionMaking = '待分析';

  // 基于十神分析性格特征
  if (tenGods?.distribution) {
    const dist = tenGods.distribution;

    // 比肩劫财多 - 独立自主
    if ((dist.bijian || 0) + (dist.jiecai || 0) >= 2) {
      strengths.push('独立自主，不依赖他人');
      strengths.push('意志坚定，有主见');
      weaknesses.push('过于自我，不易妥协');
      communicationStyle = '直接坦率，个性鲜明';
      decisionMaking = '果断独立，相信自己的判断';
    }

    // 食神伤官多 - 才华横溢
    if ((dist.shishen || 0) + (dist.shangguan || 0) >= 2) {
      strengths.push('才华横溢，表达力强');
      strengths.push('创新能力强，思维活跃');
      weaknesses.push('情绪化，易冲动');
      communicationStyle = '善于表达，能言善辩';
      growthAdvice.push('学会控制情绪，理性思考');
    }

    // 正财偏财多 - 理财能力
    if ((dist.zhengcai || 0) + (dist.piancai || 0) >= 2) {
      strengths.push('理财能力强，财运亨通');
      strengths.push('务实勤劳，善于积累');
      weaknesses.push('过于注重物质，忽视精神');
      decisionMaking = '理性务实，注重实际利益';
      growthAdvice.push('平衡物质与精神追求');
    }

    // 正官七杀多 - 领导力
    if ((dist.zhengguan || 0) + (dist.qisha || 0) >= 2) {
      strengths.push('领导能力强，有威严');
      strengths.push('责任心强，目标明确');
      weaknesses.push('过于严格，压力大');
      communicationStyle = '严谨认真，注重规矩';
      decisionMaking = '理性分析，目标导向';
      growthAdvice.push('学会放松，减轻压力');
    }

    // 正印偏印多 - 学习能力
    if ((dist.zhengyin || 0) + (dist.pianyin || 0) >= 2) {
      strengths.push('学习能力强，善于思考');
      strengths.push('品德高尚，有涵养');
      weaknesses.push('依赖性强，缺乏行动力');
      communicationStyle = '温和谦逊，善于倾听';
      decisionMaking = '深思熟虑，注重长远';
      growthAdvice.push('培养独立性，敢于行动');
    }
  }

  // 基于五行分析性格
  if (elements?.score) {
    const scores = elements.score;
    const max = Math.max(
      scores.wood || 0,
      scores.fire || 0,
      scores.earth || 0,
      scores.metal || 0,
      scores.water || 0
    );

    // 木旺 - 仁慈
    if (scores.wood === max && scores.wood > 25) {
      strengths.push('仁慈善良，富有同情心');
      strengths.push('积极向上，充满活力');
    }

    // 火旺 - 热情
    if (scores.fire === max && scores.fire > 25) {
      strengths.push('热情开朗，充满激情');
      strengths.push('有感染力，善于社交');
    }

    // 土旺 - 稳重
    if (scores.earth === max && scores.earth > 25) {
      strengths.push('稳重可靠，值得信赖');
      strengths.push('脚踏实地，务实肯干');
    }

    // 金旺 - 果断
    if (scores.metal === max && scores.metal > 25) {
      strengths.push('果断决绝，执行力强');
      strengths.push('原则性强，坚持正义');
    }

    // 水旺 - 智慧
    if (scores.water === max && scores.water > 25) {
      strengths.push('聪明智慧，善于谋略');
      strengths.push('灵活变通，适应力强');
    }
  }

  // 如果没有生成任何特征，使用默认值
  if (strengths.length === 0) {
    strengths.push('性格稳重，做事认真');
    strengths.push('有责任心，值得信赖');
  }

  if (weaknesses.length === 0) {
    weaknesses.push('需要增强自信心');
    weaknesses.push('有时过于谨慎');
  }

  if (growthAdvice.length === 0) {
    growthAdvice.push('保持积极心态，持续学习成长');
    growthAdvice.push('平衡工作与生活，注重身心健康');
  }

  if (communicationStyle === '待分析') {
    communicationStyle = '平和稳重，注重沟通效果';
  }

  if (decisionMaking === '待分析') {
    decisionMaking = '理性分析，综合权衡利弊';
  }

  return {
    strengths: [...new Set(strengths)], // 去重
    weaknesses: [...new Set(weaknesses)],
    communicationStyle,
    decisionMaking,
    growthAdvice: [...new Set(growthAdvice)],
  };
}

function generateCareerInsight(result: any): CareerInsight {
  return {
    suitableFields: ['管理', '金融', '咨询'],
    positions: ['项目经理', '财务总监', '战略顾问'],
    workStyle: '目标导向，注重效率',
    wealthPattern: '稳健积累型',
    opportunities: ['35-45岁事业高峰期'],
    risks: ['避免过度保守'],
    keyPeriods: ['2025-2030年'],
  };
}

function generateHealthMarriageInsight(result: any): HealthMarriageInsight {
  return {
    healthFocus: {
      organs: ['脾胃', '肝胆'],
      concerns: ['消化系统', '情绪管理'],
      lifestyle: ['规律作息', '适度运动', '清淡饮食'],
    },
    marriage: {
      partnerProfile: '性格互补，价值观相近',
      timing: ['28-32岁', '35-38岁'],
      advice: ['增进沟通', '互相理解'],
      cautions: ['避免过于强势'],
    },
  };
}

function generateDailyFortune(result: any): DailyFortune {
  const today = new Date().toISOString().split('T')[0];
  return {
    date: today,
    score: 75,
    theme: '贵人相助',
    favorable: ['商谈', '签约', '社交'],
    unfavorable: ['冒险', '投机'],
    advice: '把握机会，稳中求进',
  };
}

function generateActionableTips(result: any): ActionItem[] {
  return [
    {
      category: '事业发展',
      title: '把握贵人机会',
      description: '多参加行业活动，扩展人脉资源',
      priority: 'high',
    },
    {
      category: '健康养生',
      title: '注意脾胃调理',
      description: '饮食规律，避免生冷刺激',
      priority: 'medium',
    },
    {
      category: '财运提升',
      title: '稳健理财',
      description: '分散投资，避免高风险项目',
      priority: 'medium',
    },
  ];
}

function generateCautions(result: any): ActionItem[] {
  return [
    {
      category: '人际关系',
      title: '避免口舌之争',
      description: '说话注意分寸，避免得罪他人',
      priority: 'high',
    },
    {
      category: '投资决策',
      title: '谨慎投机',
      description: '不宜进行高风险投资',
      priority: 'medium',
    },
  ];
}

function generateYearlyFocus(result: any): string[] {
  return ['事业稳步发展', '人际关系维护', '健康管理加强', '财富稳健积累'];
}

function generateDefaultTenGods(): TenGodItem[] {
  const defaultGods = [
    { name: 'bijian', chinese: '比肩', count: 1, strength: 50 },
    { name: 'jiecai', chinese: '劫财', count: 1, strength: 45 },
    { name: 'shishen', chinese: '食神', count: 1, strength: 55 },
    { name: 'shangguan', chinese: '伤官', count: 1, strength: 48 },
    { name: 'zhengcai', chinese: '正财', count: 1, strength: 60 },
    { name: 'piancai', chinese: '偏财', count: 1, strength: 52 },
    { name: 'zhengguan', chinese: '正官', count: 1, strength: 58 },
    { name: 'qisha', chinese: '七杀', count: 1, strength: 47 },
    { name: 'zhengyin', chinese: '正印', count: 1, strength: 53 },
    { name: 'pianyin', chinese: '偏印', count: 1, strength: 49 },
  ];

  return defaultGods.map((god) => ({
    ...god,
    trend: 'stable' as const,
    keywords: ['数据加载中'],
    opportunities: ['请稍候'],
    risks: [],
  }));
}

// 导出工具函数
export { getElementChinese, getScoreLevel, getTenGodChinese };
