/**
 * 决策增强模块 v2.2
 * 
 * 核心功能：
 * 1. 组合决策路径生成器 - 基于大运流年的时序安排
 * 2. 决策模拟器 - 未来5-10年走向预测
 * 3. 风险预警系统 - 提前3-6个月的风险预警
 * 
 * 与八字命理深度结合：
 * - 基于大运（10年周期）的阶段划分
 * - 基于流年（年度）的运势评分
 * - 基于流月（月度）的风险识别
 * - 五行生克关系的精确计算
 */

import type {
  FiveElement,
  PatternAnalysis,
  LuckPillar,
  BaziStrength,
  TimelineNode,
  DecisionPathStage,
  CombinedDecisionPath,
  YearlySimulation,
  DecisionSimulation,
  RiskWarningNode,
  RiskWarningTimeline,
  RiskType,
  Severity,
  DecisionOption,
  TimeWindow,
} from '@/types/report-v2-2';

// ============ 常量定义 ============

/**
 * 五行相生关系
 * 木生火，火生土，土生金，金生水，水生木
 */
const ELEMENT_GENERATION: Record<FiveElement, FiveElement> = {
  木: '火',
  火: '土',
  土: '金',
  金: '水',
  水: '木',
};

/**
 * 五行相克关系
 * 木克土，土克水，水克火，火克金，金克木
 */
const ELEMENT_RESTRAINT: Record<FiveElement, FiveElement> = {
  木: '土',
  土: '水',
  水: '火',
  火: '金',
  金: '木',
};

/**
 * 五行生克评分表
 * 用于计算大运流年对用神的影响
 */
const ELEMENT_SCORE_TABLE = {
  GENERATE: 20, // 相生：+20分
  SUPPORT: 15, // 同类助力：+15分
  SAME: 10, // 同五行：+10分
  RESTRAIN: -25, // 相克：-25分
  DRAIN: -15, // 泄气：-15分
  NEUTRAL: 0, // 无关系：0分
} as const;

/**
 * 天干到五行的映射
 */
const STEM_TO_ELEMENT: Record<string, FiveElement> = {
  甲: '木',
  乙: '木',
  丙: '火',
  丁: '火',
  戊: '土',
  己: '土',
  庚: '金',
  辛: '金',
  壬: '水',
  癸: '水',
};

/**
 * 地支到五行的映射（主气）
 */
const BRANCH_TO_ELEMENT: Record<string, FiveElement> = {
  子: '水',
  丑: '土',
  寅: '木',
  卢: '木',
  辰: '土',
  巳: '火',
  午: '火',
  未: '土',
  申: '金',
  酉: '金',
  戌: '土',
  亥: '水',
};

/**
 * 天干阴阳属性
 * 阳干：甲丙戊庚壬
 * 阴干：乙丁己辛癸
 */
const STEM_YIN_YANG: Record<string, 'yang' | 'yin'> = {
  甲: 'yang', // 阳木
  乙: 'yin',  // 阴木
  丙: 'yang', // 阳火
  丁: 'yin',  // 阴火
  戊: 'yang', // 阳土
  己: 'yin',  // 阴土
  庚: 'yang', // 阳金
  辛: 'yin',  // 阴金
  壬: 'yang', // 阳水
  癸: 'yin',  // 阴水
};

/**
 * 五行到阴阳天干的映射
 */
const ELEMENT_TO_STEMS: Record<FiveElement, { yang: string; yin: string }> = {
  木: { yang: '甲', yin: '乙' },
  火: { yang: '丙', yin: '丁' },
  土: { yang: '戊', yin: '己' },
  金: { yang: '庚', yin: '辛' },
  水: { yang: '壬', yin: '癸' },
};

/**
 * 六十甲子纳音（干支组合到年份）
 * 用于流年推算
 */
const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/**
 * 大运周期（年）
 */
const LUCK_PILLAR_CYCLE = 10;

/**
 * 转折点阈值：评分波动超过30分认为是转折点
 */
const TURNING_POINT_THRESHOLD = 30;

/**
 * 大运有利阈值：用神得力度超过此值认为大运有利
 */
const FAVORABLE_THRESHOLD = 60;

/**
 * 成功率上限：避免出现100%的极端值
 */
const SUCCESS_RATE_MAX = 95;

/**
 * 成功率下限：避免出现0%的极端值
 */
const SUCCESS_RATE_MIN = 40;

/**
 * 用神权重：综合评分中用神得力度的权重
 */
const OVERALL_SCORE_WEIGHT_USEFULGOD = 0.6;

/**
 * 格局权重：综合评分中格局强度的权重
 */
const OVERALL_SCORE_WEIGHT_PATTERN = 0.4;

/**
 * 大运天干权重：大运天干对用神的影响权重
 */
const LUCK_PILLAR_STEM_WEIGHT = 1.0;

/**
 * 大运地支权重：大运地支对用神的影响权重
 */
const LUCK_PILLAR_BRANCH_WEIGHT = 0.7;

/**
 * 流年天干权重：流年天干对用神的影响权重
 */
const YEAR_STEM_WEIGHT = 0.3;

/**
 * 流年地支权重：流年地支对用神的影响权重
 */
const YEAR_BRANCH_WEIGHT = 0.2;

// ============ 节气和流月对照表 ============

/**
 * 24节气对照表（用于精确计算流月）
 * 每个节气对应一个月份的起点
 * 注：实际应用中应根据具体年份计算节气时间，此处使用平均值
 */
const SOLAR_TERMS_TO_MONTH: Record<number, { name: string; stem: string; branch: string; approxDay: number }> = {
  1: { name: '立春', stem: '甲', branch: '寅', approxDay: 4 },  // 正月（寅月）
  2: { name: '惊蟛', stem: '乙', branch: '卢', approxDay: 5 },  // 二月（卢月）
  3: { name: '清明', stem: '丙', branch: '辰', approxDay: 5 },  // 三月（辰月）
  4: { name: '立夏', stem: '丁', branch: '巳', approxDay: 5 },  // 四月（巳月）
  5: { name: '芒种', stem: '戊', branch: '午', approxDay: 6 },  // 五月（午月）
  6: { name: '小暑', stem: '己', branch: '未', approxDay: 7 },  // 六月（未月）
  7: { name: '立秋', stem: '庚', branch: '申', approxDay: 7 },  // 七月（申月）
  8: { name: '白露', stem: '辛', branch: '酉', approxDay: 8 },  // 八月（酉月）
  9: { name: '寒露', stem: '壬', branch: '戌', approxDay: 8 },  // 九月（戌月）
  10: { name: '立冬', stem: '癸', branch: '亥', approxDay: 7 }, // 十月（亥月）
  11: { name: '大雪', stem: '甲', branch: '子', approxDay: 7 }, // 十一月（子月）
  12: { name: '小寒', stem: '乙', branch: '丑', approxDay: 6 }, // 十二月（丑月）
};

/**
 * 根据公历月份获取流月干支（基于节气）
 * 
 * @param month - 公历月份（1-12）
 * @param year - 公历年份（用于计算天干）
 * @returns 流月干支（如 "甲寅"）
 * @example
 * getMonthGanZhi(1, 2025) // '甲寅' (正月)
 * getMonthGanZhi(2, 2025) // '乙卢' (二月)
 */
function getMonthGanZhi(month: number, year: number): string {
  // 确保月份在有效范围内
  const validMonth = Math.max(1, Math.min(12, month));
  
  // 获取该月的节气信息
  const solarTerm = SOLAR_TERMS_TO_MONTH[validMonth];
  if (!solarTerm) {
    // 降级处理：使用简化计算
    const monthBranch = EARTHLY_BRANCHES[(validMonth + 1) % 12];
    const monthStem = HEAVENLY_STEMS[(validMonth - 1) % 10];
    return monthStem + monthBranch;
  }
  
  // 流月地支固定为节气对应的地支
  const branch = solarTerm.branch;
  
  // 流月天干根据年干计算（五虎遁年起月法）
  // 甲己之年丙作首，乙庚之岁戊为头...
  const yearGanZhi = getYearGanZhi(year);
  const yearStem = yearGanZhi[0];
  const yearStemIndex = HEAVENLY_STEMS.indexOf(yearStem);
  
  // 根据年干确定正月的天干
  const firstMonthStemIndex = (yearStemIndex * 2 + 2) % 10;
  
  // 计算当前月份的天干（从正月开始）
  const monthStemIndex = (firstMonthStemIndex + validMonth - 1) % 10;
  const stem = HEAVENLY_STEMS[monthStemIndex];
  
  return stem + branch;
}

// ============ 缓存机制 ============

/**
 * 八字力量计算缓存
 * 键格式："{usefulElement}|{luckPillarStem}|{luckPillarBranch}|{yearGanZhi}|{patternStrength}"
 */
const baziStrengthCache = new Map<string, BaziStrength>();

/**
 * 清空缓存（用于测试或重置）
 */
export function clearBaziStrengthCache(): void {
  baziStrengthCache.clear();
}

/**
 * 生成缓存键
 */
function generateCacheKey(
  usefulElement: FiveElement | string,
  luckPillarStem: string,
  luckPillarBranch: string,
  yearGanZhi?: string,
  patternStrength?: string
): string {
  return `${usefulElement}|${luckPillarStem}|${luckPillarBranch}|${yearGanZhi || 'none'}|${patternStrength || 'medium'}`;
}

// ============ 类型定义 ============

/**
 * 格局强度类型
 */
export type PatternStrengthType = 'strong' | 'medium' | 'weak';

/**
 * 用神类型（支持多种格式）
 */
export type UsefulGodType = 
  | FiveElement 
  | string 
  | { element?: FiveElement; primary?: string[] }
  | { [key: string]: any };

// ============ 辅助函数 ============

/**
 * 判断两个五行是否同阴阳
 * 
 * @param element1 - 第一个五行
 * @param element2 - 第二个五行
 * @returns 是否同阴阳
 * @example
 * isSameYinYang('木', '木') // false (木包含甲乙，不明确）
 * // 实际使用中需要天干信息，此函数主要用于同五行判断
 */
function isSameYinYang(element1: FiveElement, element2: FiveElement): boolean {
  // 对于五行元素，我们判断它们是否是同一五行
  // 这意味着它们可以相互支持（比如木帮木）
  return element1 === element2;
}

/**
 * 从对象或字符串中提取五行元素
 * @param obj - 用神对象、五行字符串或其他包含 element 字段的对象
 * @returns 五行元素，如果无法提取则返回 null
 * @example
 * extractElement('木') // '木'
 * extractElement({ element: '火' }) // '火'
 * extractElement({ primary: ['食神'] }) // null
 */
function extractElement(obj: UsefulGodType): FiveElement | null {
  if (!obj) return null;
  
  if (typeof obj === 'string') {
    // 如果是五行字符串，直接返回
    const validElements: FiveElement[] = ['木', '火', '土', '金', '水'];
    if (validElements.includes(obj as FiveElement)) {
      return obj as FiveElement;
    }
  }
  
  if (obj && typeof obj === 'object' && 'element' in obj) {
    return obj.element || null;
  }
  
  return null;
}

/**
 * 计算两个五行之间的关系评分
 * 
 * 核心逻辑：
 * 1. 同一五行：+10分（比肩帮身，如木帮木）
 * 2. 相生关系：+20分（如木生火）
 * 3. 相克关系：-25分（如金克木）
 * 4. 泄气关系：-15分（被对方生，如木被火泄）
 * 5. 无关系：0分
 * 
 * @param element1 - 第一个五行（作用方）
 * @param element2 - 第二个五行（被作用方，通常是用神）
 * @returns 评分（-25 到 +20）
 * @example
 * calculateElementRelationScore('木', '木') // 10 (同一五行)
 * calculateElementRelationScore('木', '火') // 20 (木生火)
 * calculateElementRelationScore('金', '木') // -25 (金克木)
 */
function calculateElementRelationScore(
  element1: FiveElement,
  element2: FiveElement
): number {
  // 1. 同一五行：比肩帮身（如木帮木、火帮火）
  if (element1 === element2) {
    return ELEMENT_SCORE_TABLE.SAME;
  }

  // 2. 相生关系：一个五行生另一个五行
  if (ELEMENT_GENERATION[element1] === element2) {
    return ELEMENT_SCORE_TABLE.GENERATE;
  }

  // 3. 相克关系：一个五行克另一个五行
  if (ELEMENT_RESTRAINT[element1] === element2) {
    return ELEMENT_SCORE_TABLE.RESTRAIN;
  }

  // 4. 泄气关系：被另一个五行生（如木生火，则火对木是泄气）
  if (ELEMENT_GENERATION[element2] === element1) {
    return ELEMENT_SCORE_TABLE.DRAIN;
  }

  // 5. 无直接关系
  return ELEMENT_SCORE_TABLE.NEUTRAL;
}

/**
 * 根据年份获取流年干支
 * 
 * 基于1984年（甲子年）为基准，通过天干10年、地支12年的周期性计算流年干支
 * 
 * @param year - 公历年份（如 2025）
 * @returns 天干地支组合（如 "乙巳"）
 * @example
 * getYearGanZhi(2025) // '乙巳'
 * getYearGanZhi(2024) // '甲辰'
 */
function getYearGanZhi(year: number): string {
  // 以1984年（甲子年）为基准
  const baseYear = 1984;
  const offset = year - baseYear;

  const stemIndex = (offset % 10 + 10) % 10;
  const branchIndex = (offset % 12 + 12) % 12;

  return HEAVENLY_STEMS[stemIndex] + EARTHLY_BRANCHES[branchIndex];
}

/**
 * 计算八字力量评估
 * 
 * 核心算法：
 * 1. 提取用神五行元素
 * 2. 计算大运天干地支与用神的生克关系
 * 3. 如有流年，计算流年天干地支的影响
 * 4. 综合评分 = 用神得力度 × 0.6 + 格局强度 × 0.4
 * 
 * @param usefulGod - 用神（支持五行字符串、对象等多种格式）
 * @param luckPillar - 当前大运
 * @param yearGanZhi - 流年干支（可选，如 "乙巳"）
 * @param patternStrength - 格局强度（'strong' | 'medium' | 'weak'）
 * @returns 八字力量评估对象，包含用神得力度、格局强度、综合评分、置信度和命理依据
 */
function calculateBaziStrength(
  usefulGod: UsefulGodType,
  luckPillar: LuckPillar,
  yearGanZhi?: string,
  patternStrength?: PatternStrengthType | string
): BaziStrength {
  const usefulElement = extractElement(usefulGod);
  if (!usefulElement) {
    return {
      usefulGodPower: 50,
      patternStrength: 50,
      overallScore: 50,
      confidence: 30,
      rationale: '用神信息不完整，使用默认评估',
    };
  }

  // 1. 提取大运天干地支的五行
  const stemElement = extractElement(luckPillar.heavenlyStem || luckPillar.stem);
  const branchElement = extractElement(
    luckPillar.earthlyBranch || luckPillar.branch
  );

  // 2. 检查缓存
  const cacheKey = generateCacheKey(
    usefulElement,
    stemElement || 'none',
    branchElement || 'none',
    yearGanZhi,
    patternStrength
  );

  if (baziStrengthCache.has(cacheKey)) {
    return baziStrengthCache.get(cacheKey)!;
  }

  // 2. 计算用神得力度（基于大运）
  let usefulGodPower = 50; // 基准分
  const rationale: string[] = [];

  if (stemElement) {
    const stemScore = calculateElementRelationScore(stemElement, usefulElement);
    usefulGodPower += stemScore * LUCK_PILLAR_STEM_WEIGHT;
    rationale.push(`大运天干${stemElement}对用神${usefulElement}: ${stemScore > 0 ? '+' : ''}${stemScore}分`);
  }

  if (branchElement) {
    const branchScore = calculateElementRelationScore(branchElement, usefulElement);
    usefulGodPower += branchScore * LUCK_PILLAR_BRANCH_WEIGHT;
    rationale.push(`大运地支${branchElement}对用神${usefulElement}: ${branchScore > 0 ? '+' : ''}${Math.round(branchScore * LUCK_PILLAR_BRANCH_WEIGHT)}分`);
  }

  // 3. 如果有流年，进一步调整
  if (yearGanZhi && yearGanZhi.length >= 2) {
    const yearStem = yearGanZhi[0];
    const yearBranch = yearGanZhi[1];
    const yearStemElement = STEM_TO_ELEMENT[yearStem];
    const yearBranchElement = BRANCH_TO_ELEMENT[yearBranch];

    if (yearStemElement) {
      const yearStemScore = calculateElementRelationScore(yearStemElement, usefulElement);
      usefulGodPower += yearStemScore * YEAR_STEM_WEIGHT;
      rationale.push(`流年天干${yearStemElement}: ${yearStemScore > 0 ? '+' : ''}${Math.round(yearStemScore * YEAR_STEM_WEIGHT)}分`);
    }

    if (yearBranchElement) {
      const yearBranchScore = calculateElementRelationScore(yearBranchElement, usefulElement);
      usefulGodPower += yearBranchScore * YEAR_BRANCH_WEIGHT;
      rationale.push(`流年地支${yearBranchElement}: ${yearBranchScore > 0 ? '+' : ''}${Math.round(yearBranchScore * YEAR_BRANCH_WEIGHT)}分`);
    }
  }

  // 4. 归一化到0-100
  usefulGodPower = Math.max(0, Math.min(100, Math.round(usefulGodPower)));

  // 5. 格局强度评分
  const patternStrengthScore =
    patternStrength === 'strong' ? 80 : patternStrength === 'weak' ? 50 : 65;

  // 6. 综合评分（用神得力度权重60%，格局强度权重40%）
  const overallScore = Math.round(
    usefulGodPower * OVERALL_SCORE_WEIGHT_USEFULGOD + patternStrengthScore * OVERALL_SCORE_WEIGHT_PATTERN
  );

  // 7. 置信度（基于数据完整性）
  let confidence = 70;
  if (stemElement && branchElement) confidence += 15;
  if (yearGanZhi) confidence += 10;
  if (patternStrength) confidence += 5;

  const result: BaziStrength = {
    usefulGodPower,
    patternStrength: patternStrengthScore,
    overallScore,
    confidence: Math.min(100, confidence),
    rationale: rationale.join('；'),
  };

  // 8. 存入缓存
  baziStrengthCache.set(cacheKey, result);

  return result;
}

/**
 * 判断大运是否有利
 * 
 * 基于用神得力度阈值（FAVORABLE_THRESHOLD = 60）判断大运是否对用户有利
 * 
 * @param luckPillar - 大运柱
 * @param usefulGod - 用神（支持五行字符串、对象等多种格式）
 * @returns 是否有利（true = 有利，false = 不利）
 * @example
 * isLuckPillarFavorable(pillar, '木') // true/false
 */
function isLuckPillarFavorable(luckPillar: LuckPillar, usefulGod: UsefulGodType): boolean {
  const baziStrength = calculateBaziStrength(usefulGod, luckPillar);
  return baziStrength.usefulGodPower >= FAVORABLE_THRESHOLD;
}

// ============ 核心功能 1: 组合决策路径生成器 ============

/**
 * 生成组合决策路径
 * 
 * 核心算法：
 * 1. 分析用户未来10年的大运分布
 * 2. 对每个大运计算用神得力指数
 * 3. 识别"先A后B"或"分阶段执行"的最佳组合
 * 4. 为每个阶段标注具体的时间窗口（精确到月份）
 * 
 * @param patternAnalysis - 格局分析结果
 * @param luckPillars - 大运列表
 * @param currentAge - 当前年龄
 * @param decisionOptions - 决策选项列表
 * @returns 组合决策路径
 */
export function generateCombinedDecisionPath(
  patternAnalysis: PatternAnalysis,
  luckPillars: LuckPillar[],
  currentAge: number,
  decisionOptions: DecisionOption[]
): CombinedDecisionPath | null {
  try {
    // 1. 参数验证
    if (!luckPillars || luckPillars.length === 0) {
      console.warn('[generateCombinedDecisionPath] 大运数据为空，无法生成组合决策路径');
      return null;
    }

    if (!decisionOptions || decisionOptions.length === 0) {
      console.warn('[generateCombinedDecisionPath] 决策选项为空，无法生成组合决策路径');
      return null;
    }

    if (!patternAnalysis || !patternAnalysis.usefulGod) {
      console.warn('[generateCombinedDecisionPath] 格局分析数据不完整，将使用默认逻辑');
    }

    if (typeof currentAge !== 'number' || currentAge < 0 || currentAge > 150) {
      console.warn(`[generateCombinedDecisionPath] 当前年龄值异常：${currentAge}，将使用默认值30`);
      currentAge = 30;
    }

    const usefulGod = patternAnalysis.usefulGod;
    const patternStrength = patternAnalysis.strength;

  // 1. 找到当前及未来的大运（未来10年内，最多3个大运）
  const relevantLuckPillars = luckPillars.filter((pillar) => {
    const startAge = pillar.startAge || pillar.age || 0;
    const endAge = startAge + LUCK_PILLAR_CYCLE;
    return endAge > currentAge && startAge < currentAge + 10;
  }).slice(0, 3);

  if (relevantLuckPillars.length === 0) {
    return null;
  }

  // 2. 为每个大运阶段生成执行计划
  const stages: DecisionPathStage[] = [];
  const turningPoints: TimelineNode[] = [];
  const currentYear = new Date().getFullYear();

  relevantLuckPillars.forEach((pillar, index) => {
    const startAge = pillar.startAge || pillar.age || 0;
    const endAge = startAge + LUCK_PILLAR_CYCLE - 1;

    // 计算实际年份
    const ageOffset = startAge - currentAge;
    const startYear = currentYear + ageOffset;
    const endYear = startYear + LUCK_PILLAR_CYCLE - 1;

    // 提取大运干支
    const stemElement = extractElement(pillar.heavenlyStem || pillar.stem);
    const branchElement = extractElement(pillar.earthlyBranch || pillar.branch);
    const ganZhi = `${stemElement || ''}${branchElement || ''}`;

    // 计算八字力量
    const baziStrength = calculateBaziStrength(
      usefulGod,
      pillar,
      undefined,
      patternStrength
    );

    // 判断是否有利
    const isFavorable = baziStrength.usefulGodPower >= FAVORABLE_THRESHOLD;

    // 生成执行方案建议
    let action = '';
    let successRate = 0;

    if (isFavorable) {
      if (index === 0) {
        action = '主动进攻期：适合启动新项目、扩展业务、寻求突破';
        successRate = Math.min(SUCCESS_RATE_MAX, baziStrength.overallScore + 10);
      } else {
        action = '持续发展期：巩固成果、扩大优势、布局未来';
        successRate = Math.min(90, baziStrength.overallScore + 5);
      }
    } else {
      if (index === 0) {
        action = '稳健守成期：巩固基础、积累资源、提升能力';
        successRate = Math.max(SUCCESS_RATE_MIN, baziStrength.overallScore - 10);
      } else {
        action = '调整适应期：调整策略、优化流程、寻找新方向';
        successRate = Math.max(SUCCESS_RATE_MIN + 5, baziStrength.overallScore - 5);
      }
    }

    // 时间窗口
    const timeWindow: TimeWindow = {
      from: `${startYear}-01-01`,
      to: `${endYear}-12-31`,
      confidence: baziStrength.confidence,
      note: `${ganZhi}大运，${isFavorable ? '用神得力' : '用神受限'}`,
    };

    // 生成关键流年提示（简化版，每个大运取2-3个关键年份）
    const yearlyHints: DecisionPathStage['yearlyHints'] = [];
    for (let y = startYear; y <= Math.min(startYear + 2, endYear); y++) {
      const yearGanZhi = getYearGanZhi(y);
      const yearBaziStrength = calculateBaziStrength(
        usefulGod,
        pillar,
        yearGanZhi,
        patternStrength
      );

      const impact: 'positive' | 'negative' | 'neutral' =
        yearBaziStrength.usefulGodPower >= FAVORABLE_THRESHOLD + 5
          ? 'positive'
          : yearBaziStrength.usefulGodPower <= SUCCESS_RATE_MIN + 5
            ? 'negative'
            : 'neutral';

      yearlyHints.push({
        year: y,
        ganZhi: yearGanZhi,
        impact,
        note:
          impact === 'positive'
            ? '流年有利，可积极行动'
            : impact === 'negative'
              ? '流年不利，需谨慎保守'
              : '流年平稳，按计划推进',
      });
    }

    stages.push({
      stageIndex: index + 1,
      timePeriod: `${startYear}-${endYear}`,
      timeWindow,
      luckPillar: {
        ganZhi,
        startAge,
        endAge,
        isFavorable,
      },
      action,
      rationale: baziStrength.rationale,
      successRate,
      baziStrength,
      yearlyHints,
      risks: isFavorable
        ? ['运势虽好，仍需注意流年凶煞影响']
        : ['运势不佳，避免重大决策', '可利用此期积累和学习'],
    });

    // 如果是大运交替点，标记为转折点
    if (index > 0) {
      turningPoints.push({
        date: `${startYear}-02-04`, // 大运通常在立春交替
        type: 'luck_pillar',
        ganZhi,
        baziState: isFavorable ? 'favorable' : 'unfavorable',
        score: baziStrength.overallScore,
        label: '大运交替',
        note: `进入${ganZhi}大运，运势${isFavorable ? '转好' : '转弱'}`,
      });
    }
  });

  // 3. 计算路径总体成功率（加权平均）
  const overallSuccessRate = Math.round(
    stages.reduce((sum, stage) => sum + stage.successRate, 0) / stages.length
  );

  // 4. 生成路径优势说明
  const advantages = [
    `分阶段执行，符合大运节奏，成功率提升${Math.round(overallSuccessRate * 0.15)}%`,
    '避开不利大运的重大风险',
    '在有利大运期最大化收益',
    '留有调整余地，灵活应变',
  ];

    return {
      topic: decisionOptions[0]?.name || '决策路径',
      strategy: 'sequential',
      overallSuccessRate,
      stages,
      advantages,
      turningPoints,
    };
  } catch (error) {
    console.error('[generateCombinedDecisionPath] 生成组合决策路径时发生错误:', error);
    return null;
  }
}

// ============ 核心功能 2: 决策模拟器 ============

/**
 * 模拟决策未来走向
 * 
 * 核心算法：
 * 1. 从当前年份开始，逐年推算未来5-10年流年
 * 2. 对每个流年计算运势评分
 * 3. 标注关键转折点
 * 4. 生成概率分布和情景分析
 * 
 * @param patternAnalysis - 格局分析结果
 * @param luckPillars - 大运列表
 * @param currentAge - 当前年龄
 * @param decisionOption - 决策选项
 * @param simulationYears - 模拟年限（默认5年，最多10年）
 * @returns 决策模拟结果
 */
export function simulateDecisionFuture(
  patternAnalysis: PatternAnalysis,
  luckPillars: LuckPillar[],
  currentAge: number,
  decisionOption: DecisionOption,
  simulationYears: number = 5
): DecisionSimulation | null {
  try {
    // 1. 参数验证
    if (!luckPillars || luckPillars.length === 0) {
      console.warn('[simulateDecisionFuture] 大运数据为空，无法模拟决策未来');
      return null;
    }

    if (!decisionOption || !decisionOption.id) {
      console.warn('[simulateDecisionFuture] 决策选项无效，无法模拟未来');
      return null;
    }

    if (!patternAnalysis || !patternAnalysis.usefulGod) {
      console.warn('[simulateDecisionFuture] 格局分析数据不完整，将使用默认逻辑');
    }

    if (typeof currentAge !== 'number' || currentAge < 0 || currentAge > 150) {
      console.warn(`[simulateDecisionFuture] 当前年龄值异常：${currentAge}，将使用默认值30`);
      currentAge = 30;
    }

    // 限制模拟年限
    const years = Math.min(Math.max(simulationYears, 3), 10);
    const usefulGod = patternAnalysis.usefulGod;
    const patternStrength = patternAnalysis.strength;
    const currentYear = new Date().getFullYear();

  // 1. 逐年模拟
  const yearlyTimeline: YearlySimulation[] = [];
  const turningPoints: TimelineNode[] = [];
  let previousScore = 50;

  for (let i = 0; i < years; i++) {
    const year = currentYear + i;
    const age = currentAge + i;
    const yearGanZhi = getYearGanZhi(year);

    // 找到对应的大运
    const luckPillar = luckPillars.find((pillar) => {
      const startAge = pillar.startAge || pillar.age || 0;
      const endAge = startAge + LUCK_PILLAR_CYCLE;
      return age >= startAge && age < endAge;
    });

    if (!luckPillar) continue;

    // 计算八字力量
    const baziStrength = calculateBaziStrength(
      usefulGod,
      luckPillar,
      yearGanZhi,
      patternStrength
    );

    const score = baziStrength.overallScore;

    // 确定运势等级
    const grade: YearlySimulation['grade'] =
      score >= 80
        ? 'excellent'
        : score >= 65
          ? 'good'
          : score >= 50
            ? 'fair'
            : score >= 35
              ? 'poor'
              : 'critical';

    // 生成关键建议
    const suggestions: string[] = [];
    if (grade === 'excellent') {
      suggestions.push('把握机会，积极进取');
      suggestions.push('可考虑扩大投资或启动新项目');
    } else if (grade === 'good') {
      suggestions.push('稳步推进，巩固成果');
      suggestions.push('适度扩展，注意风险控制');
    } else if (grade === 'fair') {
      suggestions.push('保持现状，稳健经营');
      suggestions.push('避免重大决策，积累资源');
    } else if (grade === 'poor') {
      suggestions.push('谨慎保守，避免冒险');
      suggestions.push('可考虑休整或学习提升');
    } else {
      suggestions.push('高度警惕，防守为主');
      suggestions.push('避免重大变动，保存实力');
    }

    // 判断是否为转折点（评分波动超过阈值）
    const isTurningPoint = Math.abs(score - previousScore) >= TURNING_POINT_THRESHOLD;
    const turningPointNote = isTurningPoint
      ? `运势${score > previousScore ? '上升' : '下降'}${Math.abs(score - previousScore)}分`
      : undefined;

    if (isTurningPoint) {
      turningPoints.push({
        date: `${year}-01-01`,
        type: 'year',
        ganZhi: yearGanZhi,
        baziState: score >= 60 ? 'favorable' : score <= 40 ? 'unfavorable' : 'neutral',
        score,
        label: '转折点',
        note: turningPointNote,
      });
    }

    yearlyTimeline.push({
      year,
      ganZhi: yearGanZhi,
      score,
      grade,
      baziStrength,
      suggestions,
      isTurningPoint,
      turningPointNote,
    });

    previousScore = score;
  }

  // 2. 识别高峰期和低谷期
  const scores = yearlyTimeline.map((y) => y.score);
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);

  const peakYears = yearlyTimeline
    .filter((y) => y.score >= maxScore - 5)
    .map((y) => y.year);

  const valleyYears = yearlyTimeline
    .filter((y) => y.score <= minScore + 5)
    .map((y) => y.year);

  // 3. 确定最佳启动时间（第一个好运年份）
  const firstGoodYear = yearlyTimeline.find((y) => y.grade === 'excellent' || y.grade === 'good');
  const bestStartTiming = firstGoodYear
    ? {
        date: `${firstGoodYear.year}-03-15`,
        monthRange: '3-6月',
        reason: `${firstGoodYear.ganZhi}年运势${firstGoodYear.grade === 'excellent' ? '优秀' : '良好'}，${firstGoodYear.baziStrength.rationale}`,
      }
    : {
        date: `${currentYear}-01-01`,
        monthRange: '全年',
        reason: '未来几年运势平平，建议尽早启动以积累经验',
      };

  // 4. 计算整体成功概率（基于年度评分的加权平均）
  const overallSuccessProbability = Math.round(
    yearlyTimeline.reduce((sum, y, i) => {
      // 近期年份权重更高
      const weight = 1 / (i + 1);
      return sum + y.score * weight;
    }, 0) / yearlyTimeline.reduce((sum, _, i) => sum + 1 / (i + 1), 0)
  );

  // 5. 生成风险预警
  const upcomingRisks: DecisionSimulation['upcomingRisks'] = yearlyTimeline
    .filter((y) => y.grade === 'poor' || y.grade === 'critical')
    .map((y) => ({
      timeframe: `${y.year}年`,
      riskType: '运势低谷',
      severity: y.grade === 'critical' ? 'critical' : 'major' as Severity,
      mitigation: y.suggestions.join('；'),
    }));

  // 6. 情景分析
  const scenarios = {
    best: {
      probability: Math.round((peakYears.length / years) * 100),
      outcome: `事业/财运显著提升，收入增长${30 + Math.round((maxScore - 50) * 0.5)}%-${50 + Math.round((maxScore - 50) * 0.8)}%`,
      preconditions: [
        '大运+流年全部配合',
        '按建议执行行动清单',
        '风水布局得当',
        '个人努力充分',
      ],
    },
    baseline: {
      probability: 60,
      outcome: `稳步发展，收入增长${15 + Math.round((overallSuccessProbability - 50) * 0.3)}%-${25 + Math.round((overallSuccessProbability - 50) * 0.5)}%`,
      preconditions: [
        '基本按命理建议执行',
        '避开主要风险期',
        '保持稳健策略',
      ],
    },
    worst: {
      probability: Math.round((valleyYears.length / years) * 100),
      outcome: `遇到困难，可能出现${10 + Math.round((50 - minScore) * 0.3)}%-${20 + Math.round((50 - minScore) * 0.5)}%的收入下降或损失`,
      riskFactors: [
        '在忌神年份做重大决策',
        '未提前布局风险对冲',
        '忽视命理预警',
        '外部环境突变',
      ],
    },
  };

    return {
      optionId: decisionOption.id,
      optionName: decisionOption.name,
      simulationYears: years,
      yearlyTimeline,
      overallSuccessProbability,
      peakYears,
      valleyYears,
      bestStartTiming,
      turningPoints,
      upcomingRisks,
      scenarios,
    };
  } catch (error) {
    console.error('[simulateDecisionFuture] 模拟决策未来时发生错误:', error);
    return null;
  }
}

// ============ 核心功能 3: 风险预警系统 ============

/**
 * 生成风险预警时间线
 * 
 * 核心算法：
 * 1. 基于流年分析，细化到流月
 * 2. 识别风险类型（财务/健康/人际/决策）
 * 3. 提前3-6个月预警
 * 4. 给出具体缓解措施
 * 
 * @param patternAnalysis - 格局分析结果
 * @param luckPillars - 大运列表
 * @param currentAge - 当前年龄
 * @param decisionOption - 决策选项
 * @param monitoringMonths - 监控时长（月）
 * @returns 风险预警时间线
 */
export function generateRiskWarningTimeline(
  patternAnalysis: PatternAnalysis,
  luckPillars: LuckPillar[],
  currentAge: number,
  decisionOption: DecisionOption,
  monitoringMonths: number = 6
): RiskWarningTimeline | null {
  try {
    // 1. 参数验证
    if (!luckPillars || luckPillars.length === 0) {
      console.warn('[generateRiskWarningTimeline] 大运数据为空，无法生成风险预警');
      return null;
    }

    if (!decisionOption || !decisionOption.id) {
      console.warn('[generateRiskWarningTimeline] 决策选项无效，无法生成风险预警');
      return null;
    }

    if (!patternAnalysis || !patternAnalysis.usefulGod) {
      console.warn('[generateRiskWarningTimeline] 格局分析数据不完整，将使用默认逻辑');
    }

    if (typeof currentAge !== 'number' || currentAge < 0 || currentAge > 150) {
      console.warn(`[generateRiskWarningTimeline] 当前年龄值异常：${currentAge}，将使用默认值30`);
      currentAge = 30;
    }

    if (typeof monitoringMonths !== 'number' || monitoringMonths < 1 || monitoringMonths > 24) {
      console.warn(`[generateRiskWarningTimeline] 监控时长异常：${monitoringMonths}，将使用默认值6`);
      monitoringMonths = 6;
    }

    const usefulGod = patternAnalysis.usefulGod;
    const usefulElement = extractElement(usefulGod);
    const patternStrength = patternAnalysis.strength;
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // 1-12

    // 找到当前大运
    const currentLuckPillar = luckPillars.find((pillar) => {
      const startAge = pillar.startAge || pillar.age || 0;
      const endAge = startAge + LUCK_PILLAR_CYCLE;
      return currentAge >= startAge && currentAge < endAge;
    });

    if (!currentLuckPillar || !usefulElement) {
      console.warn('[generateRiskWarningTimeline] 无法找到当前大运或用神元素无效，无法生成风险预警');
      return null;
    }

  // 1. 生成未来N个月的风险节点
  const warnings: RiskWarningNode[] = [];
  const monthlyRiskCalendar: RiskWarningTimeline['monthlyRiskCalendar'] = [];

  for (let i = 0; i < monitoringMonths; i++) {
    const monthOffset = currentMonth + i;
    const year = currentYear + Math.floor((monthOffset - 1) / 12);
    const month = ((monthOffset - 1) % 12) + 1;

    // 流年干支
    const yearGanZhi = getYearGanZhi(year);
    const yearStem = yearGanZhi[0];
    const yearBranch = yearGanZhi[1];

    // 基于节气的精确流月计算
    const monthGanZhi = getMonthGanZhi(month, year);

    // 计算该月八字力量
    const baziStrength = calculateBaziStrength(
      usefulGod,
      currentLuckPillar,
      yearGanZhi,
      patternStrength
    );

    // 识别风险类型和等级
    const riskScore = 100 - baziStrength.usefulGodPower;
    let riskType: RiskType = 'decision';
    let severity: 1 | 2 | 3 | 4 | 5 = 3;
    let title = '';
    let manifestation = '';
    let affectedElements = {};

    // 根据得分判断风险等级
    if (riskScore >= 60) {
      severity = 5;
      title = '高度风险预警';
      manifestation = '运势极度不利，可能面临重大挑战';
    } else if (riskScore >= 50) {
      severity = 4;
      title = '重要风险提示';
      manifestation = '运势明显不利，需要特别谨慎';
    } else if (riskScore >= 40) {
      severity = 3;
      title = '中度风险提醒';
      manifestation = '运势有所波动，建议保持警惕';
    } else if (riskScore >= 30) {
      severity = 2;
      title = '低度风险注意';
      manifestation = '运势略有不利，注意防范';
    } else {
      severity = 1;
      title = '轻微风险提示';
      manifestation = '运势基本平稳，正常推进';
    }

    // 根据五行关系判断具体风险类型
    const yearStemElement = STEM_TO_ELEMENT[yearStem];
    const yearBranchElement = BRANCH_TO_ELEMENT[yearBranch];

    if (yearStemElement === ELEMENT_RESTRAINT[usefulElement]) {
      riskType = 'financial';
      title = '财务风险预警';
      manifestation = '财星受克，可能出现资金链紧张、投资失利';
      affectedElements = { wealthStar: true, usefulGod: true };
    } else if (yearBranchElement === ELEMENT_RESTRAINT[usefulElement]) {
      riskType = 'career';
      title = '事业风险预警';
      manifestation = '事业星受损，可能遇到职业瓶颈、项目受阻';
      affectedElements = { officialStar: true, usefulGod: true };
    } else if (baziStrength.usefulGodPower < SUCCESS_RATE_MIN) {
      riskType = 'decision';
      title = '决策风险预警';
      manifestation = '用神无力，判断力下降，容易做出错误决策';
      affectedElements = { usefulGod: true, dayMaster: true };
    }

    // 只记录中度及以上风险
    if (severity >= 3) {
      const fromDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const toDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

      warnings.push({
        id: `risk-${year}-${month}`,
        timeframe: {
          from: fromDate,
          to: toDate,
          description: `${yearGanZhi}年，${monthGanZhi}月`,
        },
        riskType,
        severity,
        title,
        manifestation,
        rationale: baziStrength.rationale,
        affectedElements,
        advanceWarningDays: Math.max(30, (i + 1) * 30),
        mitigation: {
          immediate: [
            '立即检查现金流状况',
            '暂缓重大决策',
            '加强风险监控',
          ],
          preventive: [
            `提前在${month - 1}月储备资源`,
            '调整行动计划',
            '寻求专业咨询',
          ],
          alternative: [
            '考虑推迟到下个有利月份',
            '寻找替代方案',
            '增强风水布局',
          ],
        },
        consequencesIfIgnored: `可能导致${manifestation}，损失预估10-30%`,
      });
    }

    // 月度汇总
    monthlyRiskCalendar.push({
      month: `${year}-${String(month).padStart(2, '0')}`,
      riskLevel: severity >= 4 ? 'high' : severity >= 3 ? 'medium' : 'low' as Severity,
      riskCount: severity >= 3 ? 1 : 0,
      summary: `${title}，运势评分${baziStrength.overallScore}分`,
    });
  }

  // 2. 统计风险分布
  const highRiskCount = warnings.filter((w) => w.severity >= 4).length;
  const mediumRiskCount = warnings.filter((w) => w.severity === 3).length;
  const lowRiskCount = warnings.filter((w) => w.severity <= 2).length;

  // 3. 确定当前综合风险等级
  const currentOverallRisk: Severity =
    highRiskCount > 0 ? 'high' : mediumRiskCount > 0 ? 'medium' : 'low';

  // 4. 找出最近的高风险
  const nextCriticalWarning = warnings.find((w) => w.severity >= 4);

  // 5. 综合建议
  const overallAdvice: string[] = [];
  if (highRiskCount > 0) {
    overallAdvice.push(`未来${monitoringMonths}个月内有${highRiskCount}个高风险时期，需高度警惕`);
    overallAdvice.push('建议提前布局风险对冲措施');
  }
  if (mediumRiskCount > 0) {
    overallAdvice.push(`有${mediumRiskCount}个中度风险时期，建议保持谨慎`);
  }
  overallAdvice.push('在低风险期积极行动，在高风险期保守防守');
  overallAdvice.push('定期复盘风险状况，动态调整策略');

    return {
      optionId: decisionOption.id,
      optionName: decisionOption.name,
      monitoringMonths,
      currentOverallRisk,
      warnings,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
      nextCriticalWarning,
      monthlyRiskCalendar,
      overallAdvice,
    };
  } catch (error) {
    console.error('[generateRiskWarningTimeline] 生成风险预警时间线时发生错误:', error);
    return null;
  }
}
