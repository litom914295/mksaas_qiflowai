import { LUOSHU_ORDER, PALACE_TO_BAGUA, shunFei } from './luoshu';
import type { FlyingStar, Mountain, PalaceIndex, Plate, Yun } from './types';

/**
 * 流年动态分析模块
 *
 * 核心功能：
 * 1. 流年飞星的精确计算和叠加分析
 * 2. 流月、流日飞星的动态变化
 * 3. 大运与流年的交替影响分析
 * 4. 时间节点的吉凶预测和调整建议
 */

// 流年信息接口
export interface LiunianInfo {
  year: number;
  liunianStar: FlyingStar;
  yearGanzhi: string;
  yearElement: '金' | '木' | '水' | '火' | '土';
  yearYinYang: '阴' | '阳';
  specialEvents?: string[];
}

// 流月信息接口
export interface LiuyueInfo {
  month: number;
  monthStar: FlyingStar;
  monthGanzhi: string;
  monthElement: '金' | '木' | '水' | '火' | '土';
  seasonalInfluence: '春' | '夏' | '秋' | '冬';
}

// 大运交替信息接口
export interface DayunTransition {
  currentPeriod: Yun;
  nextPeriod: Yun;
  transitionYear: number;
  transitionPhase: 'early' | 'middle' | 'late';
  impactLevel: 'high' | 'medium' | 'low';
  recommendations: string[];
}

// 计算流年飞星
export function calculateLiunianStar(year: number): LiunianInfo {
  // 流年飞星计算公式：以甲子年为1白星起始
  const baseYear = 1984; // 甲子年
  const yearOffset = year - baseYear;
  const liunianStar = ((((yearOffset % 9) + 9) % 9) + 1) as FlyingStar;

  // 计算年干支
  const ganzhi = calculateYearGanzhi(year);
  const element = getGanzhiElement(ganzhi);
  const yinyang = getGanzhiYinYang(ganzhi);

  // 特殊年份事件
  const specialEvents: string[] = [];
  if (year % 12 === 0) specialEvents.push('太岁年');
  if (liunianStar === 5) specialEvents.push('五黄流年');
  if (liunianStar === 2) specialEvents.push('二黑流年');

  return {
    year,
    liunianStar,
    yearGanzhi: ganzhi,
    yearElement: element,
    yearYinYang: yinyang,
    specialEvents,
  };
}

// 计算流月飞星
export function calculateLiuyueStar(year: number, month: number): LiuyueInfo {
  const liunianInfo = calculateLiunianStar(year);

  // 流月飞星从流年星开始，按月份顺飞
  let monthStar = liunianInfo.liunianStar;
  for (let i = 1; i < month; i++) {
    monthStar = shunFei(monthStar, 1);
  }

  const monthGanzhi = calculateMonthGanzhi(year, month);
  const monthElement = getGanzhiElement(monthGanzhi);
  const seasonalInfluence = getSeasonalInfluence(month);

  return {
    month,
    monthStar,
    monthGanzhi,
    monthElement,
    seasonalInfluence,
  };
}

// 生成流年飞星盘
export function generateLiunianPlate(year: number): {
  liunianPlate: Plate;
  liunianInfo: LiunianInfo;
  monthlyPlates: Array<{
    month: number;
    plate: Plate;
    monthInfo: LiuyueInfo;
  }>;
} {
  const liunianInfo = calculateLiunianStar(year);

  // 生成流年盘
  const liunianPlate: Plate = [];
  let current = liunianInfo.liunianStar;

  for (let idx = 0; idx < 9; idx++) {
    const palace = LUOSHU_ORDER[idx];
    liunianPlate.push({
      palace,
      mountainStar: current,
      facingStar: current,
      periodStar: current,
    });
    current = shunFei(current, 1);
  }

  // 生成各月飞星盘
  const monthlyPlates: Array<{
    month: number;
    plate: Plate;
    monthInfo: LiuyueInfo;
  }> = [];

  for (let month = 1; month <= 12; month++) {
    const monthInfo = calculateLiuyueStar(year, month);
    const monthPlate: Plate = [];
    let monthCurrent = monthInfo.monthStar;

    for (let idx = 0; idx < 9; idx++) {
      const palace = LUOSHU_ORDER[idx];
      monthPlate.push({
        palace,
        mountainStar: monthCurrent,
        facingStar: monthCurrent,
        periodStar: monthCurrent,
      });
      monthCurrent = shunFei(monthCurrent, 1);
    }

    monthlyPlates.push({
      month,
      plate: monthPlate.sort((a, b) => a.palace - b.palace) as Plate,
      monthInfo,
    });
  }

  return {
    liunianPlate: liunianPlate.sort((a, b) => a.palace - b.palace) as Plate,
    liunianInfo,
    monthlyPlates,
  };
}

// 流年与本命盘叠加分析
export function analyzeLiunianOverlay(
  basePlate: Plate,
  year: number,
  month?: number,
  options: {
    includeMonthly?: boolean;
    focusOnHealth?: boolean;
    focusOnWealth?: boolean;
    focusOnCareer?: boolean;
    focusOnRelationship?: boolean;
  } = {}
): {
  overlayAnalysis: Array<{
    palace: PalaceIndex;
    bagua: string;
    baseStars: { mountain: FlyingStar; facing: FlyingStar };
    liunianStar: FlyingStar;
    monthStar?: FlyingStar;
    overlayEffect: {
      type: 'enhance' | 'conflict' | 'neutral' | 'special';
      intensity: 'high' | 'medium' | 'low';
      description: string;
      implications: string[];
    };
    recommendations: string[];
    timing: {
      favorablePeriods: string[];
      unfavorablePeriods: string[];
      criticalDates: string[];
    };
  }>;
  yearlyTrends: {
    overallLuck: 'excellent' | 'good' | 'fair' | 'challenging';
    healthTrend: 'improving' | 'stable' | 'declining';
    wealthTrend: 'growing' | 'stable' | 'declining';
    careerTrend: 'advancing' | 'stable' | 'challenging';
    relationshipTrend: 'harmonious' | 'stable' | 'turbulent';
    keyMonths: Array<{
      month: number;
      significance: string;
      advice: string;
    }>;
  };
  seasonalAdjustments: Array<{
    season: '春' | '夏' | '秋' | '冬';
    months: number[];
    generalAdvice: string[];
    specificActions: string[];
  }>;
} {
  const liunianResult = generateLiunianPlate(year);
  const overlayAnalysis: Array<any> = [];

  // 分析每个宫位的叠加效果
  for (const baseCell of basePlate) {
    const liunianCell = liunianResult.liunianPlate.find(
      (cell) => cell.palace === baseCell.palace
    );
    if (!liunianCell) continue;

    const bagua = PALACE_TO_BAGUA[baseCell.palace];
    const baseStars = {
      mountain: baseCell.mountainStar || (1 as FlyingStar),
      facing: baseCell.facingStar || (1 as FlyingStar),
    };
    const liunianStar = liunianCell.mountainStar || (1 as FlyingStar);

    let monthStar: FlyingStar | undefined;
    if (options.includeMonthly && month) {
      const monthInfo = calculateLiuyueStar(year, month);
      monthStar = monthInfo.monthStar;
    }

    // 分析叠加效果
    const overlayEffect = analyzeStarOverlay(baseStars, liunianStar, monthStar);

    // 生成建议
    const recommendations = generateOverlayRecommendations(
      baseCell.palace,
      overlayEffect,
      options
    );

    // 时间节点分析
    const timing = analyzeTiming(baseCell.palace, liunianStar, year);

    overlayAnalysis.push({
      palace: baseCell.palace,
      bagua,
      baseStars,
      liunianStar,
      monthStar,
      overlayEffect,
      recommendations,
      timing,
    });
  }

  // 年度趋势分析
  const yearlyTrends = analyzeYearlyTrends(basePlate, liunianResult, options);

  // 季节性调整建议
  const seasonalAdjustments = generateSeasonalAdjustments(
    liunianResult,
    options
  );

  return {
    overlayAnalysis,
    yearlyTrends,
    seasonalAdjustments,
  };
}

// 大运交替分析
export function analyzeDayunTransition(
  currentYear: number,
  basePlate: Plate,
  zuo: Mountain,
  xiang: Mountain
): DayunTransition {
  // 计算当前运和下一运
  const currentPeriod = (Math.floor((currentYear - 1864) / 20) + 1) as Yun;
  const nextPeriod = ((currentPeriod % 9) + 1) as Yun;
  const transitionYear = 1864 + currentPeriod * 20;

  // 判断交替阶段
  const yearsToTransition = transitionYear - currentYear;
  let transitionPhase: 'early' | 'middle' | 'late';
  let impactLevel: 'high' | 'medium' | 'low';

  if (yearsToTransition > 10) {
    transitionPhase = 'early';
    impactLevel = 'low';
  } else if (yearsToTransition > 5) {
    transitionPhase = 'middle';
    impactLevel = 'medium';
  } else {
    transitionPhase = 'late';
    impactLevel = 'high';
  }

  // 生成建议
  const recommendations: string[] = [];

  if (transitionPhase === 'late') {
    recommendations.push('即将进入新运，建议提前调整风水布局');
    recommendations.push('重要决策建议等到新运开始后再做');
  } else if (transitionPhase === 'middle') {
    recommendations.push('运势转换期，宜稳不宜动');
    recommendations.push('可以开始规划新运的风水调整方案');
  } else {
    recommendations.push('当前运势稳定，可以按既定计划进行');
  }

  return {
    currentPeriod,
    nextPeriod,
    transitionYear,
    transitionPhase,
    impactLevel,
    recommendations,
  };
}

// 时间择吉分析
export function analyzeTimeSelection(
  basePlate: Plate,
  targetYear: number,
  eventType: 'moving' | 'renovation' | 'business' | 'marriage' | 'investment',
  options: {
    preferredMonths?: number[];
    avoidMonths?: number[];
    urgency?: 'high' | 'medium' | 'low';
  } = {}
): {
  recommendedPeriods: Array<{
    year: number;
    month: number;
    rating: 'excellent' | 'good' | 'fair' | 'poor';
    reasons: string[];
    specificDates?: string[];
  }>;
  avoidPeriods: Array<{
    year: number;
    month: number;
    reasons: string[];
    severity: 'high' | 'medium' | 'low';
  }>;
  generalGuidelines: string[];
} {
  const recommendedPeriods: Array<any> = [];
  const avoidPeriods: Array<any> = [];
  const generalGuidelines: string[] = [];

  const liunianResult = generateLiunianPlate(targetYear);

  // 分析每个月份
  for (const monthData of liunianResult.monthlyPlates) {
    const { month, monthInfo } = monthData;

    // 跳过用户指定避免的月份
    if (options.avoidMonths?.includes(month)) {
      avoidPeriods.push({
        year: targetYear,
        month,
        reasons: ['用户指定避免此月份'],
        severity: 'low' as const,
      });
      continue;
    }

    // 分析月份适宜性
    const suitability = analyzeMonthSuitability(
      basePlate,
      monthData,
      eventType,
      liunianResult.liunianInfo
    );

    if (suitability.rating === 'poor') {
      avoidPeriods.push({
        year: targetYear,
        month,
        reasons: suitability.reasons,
        severity: suitability.severity,
      });
    } else if (
      suitability.rating === 'good' ||
      suitability.rating === 'excellent'
    ) {
      recommendedPeriods.push({
        year: targetYear,
        month,
        rating: suitability.rating,
        reasons: suitability.reasons,
        specificDates: suitability.specificDates,
      });
    }
  }

  // 生成通用指导原则
  generalGuidelines.push(
    `${targetYear}年流年${liunianResult.liunianInfo.liunianStar}星，整体${getStarCharacteristic(liunianResult.liunianInfo.liunianStar)}`
  );

  if (eventType === 'moving') {
    generalGuidelines.push('搬家宜选择山星旺的月份，避免五黄、二黑飞临的时期');
  } else if (eventType === 'business') {
    generalGuidelines.push('开业宜选择向星旺的月份，注意财星的流年流月位置');
  }

  return {
    recommendedPeriods,
    avoidPeriods,
    generalGuidelines,
  };
}

// 辅助函数：分析星曜叠加效果
function analyzeStarOverlay(
  baseStars: { mountain: FlyingStar; facing: FlyingStar },
  liunianStar: FlyingStar,
  monthStar?: FlyingStar
): {
  type: 'enhance' | 'conflict' | 'neutral' | 'special';
  intensity: 'high' | 'medium' | 'low';
  description: string;
  implications: string[];
} {
  const implications: string[] = [];
  let type: 'enhance' | 'conflict' | 'neutral' | 'special' = 'neutral';
  let intensity: 'high' | 'medium' | 'low' = 'low';
  let description = '';

  // 检查重叠效应
  if (baseStars.mountain === liunianStar || baseStars.facing === liunianStar) {
    type = 'enhance';
    intensity = 'high';
    description = `流年${liunianStar}星与本宫飞星重叠，力量倍增`;
    implications.push('该方位的影响力在本年度显著增强');
  }

  // 检查冲突效应
  else if (
    baseStars.mountain + liunianStar === 10 ||
    baseStars.facing + liunianStar === 10
  ) {
    type = 'conflict';
    intensity = 'medium';
    description = `流年${liunianStar}星与本宫飞星相冲`;
    implications.push('需要通过风水调整化解冲突');
  }

  // 检查特殊组合
  else if (liunianStar === 5) {
    type = 'conflict';
    intensity = 'high';
    description = '流年五黄星飞临，需要特别注意';
    implications.push('本年度此方位容易出现问题，需要化解');
  }

  // 检查吉星效应
  else if ([1, 6, 8, 9].includes(liunianStar)) {
    type = 'enhance';
    intensity = 'low';
    description = `流年吉星${liunianStar}飞临`;
    implications.push('本年度此方位运势有所提升');
  }

  // 月星叠加效果
  if (monthStar) {
    if (monthStar === liunianStar) {
      intensity = 'high';
      implications.push('流年流月同星，效果更加明显');
    }
  }

  return { type, intensity, description, implications };
}

// 辅助函数：生成叠加建议
function generateOverlayRecommendations(
  palace: PalaceIndex,
  overlayEffect: any,
  options: any
): string[] {
  const recommendations: string[] = [];
  const bagua = PALACE_TO_BAGUA[palace];

  if (overlayEffect.type === 'enhance') {
    recommendations.push(`${bagua}宫运势增强，可以多利用此方位`);
    if (options.focusOnWealth && [8, 9].includes(overlayEffect.liunianStar)) {
      recommendations.push('适合在此方位进行财务规划或投资决策');
    }
  } else if (overlayEffect.type === 'conflict') {
    recommendations.push(`${bagua}宫需要化解，建议摆放化解物品`);
    if (overlayEffect.intensity === 'high') {
      recommendations.push('建议暂时减少在此方位的活动时间');
    }
  }

  return recommendations;
}

// 辅助函数：分析时间节点
function analyzeTiming(
  palace: PalaceIndex,
  liunianStar: FlyingStar,
  year: number
): {
  favorablePeriods: string[];
  unfavorablePeriods: string[];
  criticalDates: string[];
} {
  const favorablePeriods: string[] = [];
  const unfavorablePeriods: string[] = [];
  const criticalDates: string[] = [];

  // 根据流年星的特性分析时间节点
  if ([1, 6, 8, 9].includes(liunianStar)) {
    favorablePeriods.push(`${year}年全年`);
  } else if ([2, 5, 7].includes(liunianStar)) {
    unfavorablePeriods.push(`${year}年需要特别注意`);
  }

  // 添加关键日期（简化处理）
  if (liunianStar === 5) {
    criticalDates.push(
      `${year}年立春`,
      `${year}年夏至`,
      `${year}年立秋`,
      `${year}年冬至`
    );
  }

  return { favorablePeriods, unfavorablePeriods, criticalDates };
}

// 辅助函数：分析年度趋势
function analyzeYearlyTrends(
  basePlate: Plate,
  liunianResult: any,
  options: any
): any {
  // 简化的年度趋势分析
  const liunianStar = liunianResult.liunianInfo.liunianStar;
  const year = liunianResult.liunianInfo.year;

  let overallLuck: 'excellent' | 'good' | 'fair' | 'challenging';
  if ([8, 9].includes(liunianStar)) overallLuck = 'excellent';
  else if ([1, 6].includes(liunianStar)) overallLuck = 'good';
  else if ([3, 4].includes(liunianStar)) overallLuck = 'fair';
  else overallLuck = 'challenging';

  // 分析各个方面的趋势
  let healthTrend: 'improving' | 'stable' | 'declining' = 'stable';
  let wealthTrend: 'growing' | 'stable' | 'declining' = 'stable';
  let careerTrend: 'advancing' | 'stable' | 'challenging' = 'stable';
  let relationshipTrend: 'harmonious' | 'stable' | 'turbulent' = 'stable';

  // 根据流年星分析趋势
  if ([8, 9].includes(liunianStar)) {
    wealthTrend = 'growing';
    careerTrend = 'advancing';
  } else if ([1, 6].includes(liunianStar)) {
    careerTrend = 'advancing';
    healthTrend = 'improving';
  } else if ([4].includes(liunianStar)) {
    relationshipTrend = 'harmonious';
  } else if ([2, 5].includes(liunianStar)) {
    healthTrend = 'declining';
    wealthTrend = 'declining';
  } else if ([7].includes(liunianStar)) {
    relationshipTrend = 'turbulent';
  }

  // 生成关键月份
  const keyMonths: Array<{
    month: number;
    significance: string;
    advice: string;
  }> = [];

  // 分析每个月份的流月星
  for (const monthData of liunianResult.monthlyPlates) {
    const month = monthData.month;
    const monthStar = monthData.monthInfo.monthStar;

    // 找出关键月份（五黄、二黑、八白、九紫）
    if (monthStar === 5) {
      keyMonths.push({
        month,
        significance: '五黄凶星飞临，需谨慎处理事务',
        advice: '避免重大决策，多做准备，注意健康和安全',
      });
    } else if (monthStar === 2) {
      keyMonths.push({
        month,
        significance: '二黑病符星当令，注意身体健康',
        advice: '多运动锻炼，注意饮食卫生，避免过度劳累',
      });
    } else if (monthStar === 8) {
      keyMonths.push({
        month,
        significance: '八白财星当旺，财运亨通',
        advice: '适合投资理财、商业洽谈、签约合作',
      });
    } else if (monthStar === 9) {
      keyMonths.push({
        month,
        significance: '九紫喜庆星临门，贵人运佳',
        advice: '适合参加社交活动、求婚娶娣、升职加薪',
      });
    } else if (monthStar === 1 && [2, 3, 4].includes(month)) {
      keyMonths.push({
        month,
        significance: '一白文昌星当令，利于学业和文书',
        advice: '适合考试升学、学习新知识、文化创作',
      });
    } else if (monthStar === 6 && [8, 9, 10].includes(month)) {
      keyMonths.push({
        month,
        significance: '六白武曲星当令，事业运佳',
        advice: '适合开展新项目、寻求升迁、创业发展',
      });
    }
  }

  // 如果关键月份过多，只保留最重要的几个
  if (keyMonths.length > 6) {
    // 优先保留凶星月份和吉星月份
    const importantMonths = keyMonths.filter(
      (km) =>
        km.significance.includes('五黄') ||
        km.significance.includes('二黑') ||
        km.significance.includes('八白') ||
        km.significance.includes('九紫')
    );
    keyMonths.splice(0, keyMonths.length, ...importantMonths.slice(0, 6));
  }

  return {
    overallLuck,
    healthTrend,
    wealthTrend,
    careerTrend,
    relationshipTrend,
    keyMonths,
  };
}

// 辅助函数：生成季节性调整
function generateSeasonalAdjustments(
  liunianResult: any,
  options: any
): Array<{
  season: '春' | '夏' | '秋' | '冬';
  months: number[];
  generalAdvice: string[];
  specificActions: string[];
}> {
  return [
    {
      season: '春',
      months: [2, 3, 4],
      generalAdvice: ['春季万物复苏，适合开始新计划'],
      specificActions: ['清理东方区域', '增加绿色植物'],
    },
    {
      season: '夏',
      months: [5, 6, 7],
      generalAdvice: ['夏季火旺，注意心脏健康'],
      specificActions: ['南方避免过热', '增加水元素'],
    },
    {
      season: '秋',
      months: [8, 9, 10],
      generalAdvice: ['秋季收获季节，适合总结和储蓄'],
      specificActions: ['整理西方区域', '增加金属元素'],
    },
    {
      season: '冬',
      months: [11, 12, 1],
      generalAdvice: ['冬季宜静不宜动，注意保暖'],
      specificActions: ['北方保持温暖', '减少水元素'],
    },
  ];
}

// 辅助函数：分析月份适宜性
function analyzeMonthSuitability(
  basePlate: Plate,
  monthData: any,
  eventType: string,
  liunianInfo: any
): {
  rating: 'excellent' | 'good' | 'fair' | 'poor';
  reasons: string[];
  severity: 'high' | 'medium' | 'low';
  specificDates?: string[];
} {
  const monthStar = monthData.monthInfo.monthStar;
  const reasons: string[] = [];
  let rating: 'excellent' | 'good' | 'fair' | 'poor' = 'fair';
  let severity: 'high' | 'medium' | 'low' = 'low';

  if ([8, 9].includes(monthStar)) {
    rating = 'excellent';
    reasons.push(`流月${monthStar}星，非常吉利`);
  } else if (monthStar === 5) {
    rating = 'poor';
    severity = 'high';
    reasons.push('流月五黄星，不宜重要活动');
  } else if ([1, 6].includes(monthStar)) {
    rating = 'good';
    reasons.push(`流月${monthStar}星，较为吉利`);
  }

  return { rating, reasons, severity };
}

// 辅助函数：获取星曜特征
function getStarCharacteristic(star: FlyingStar): string {
  const characteristics: Record<FlyingStar, string> = {
    1: '智慧文昌，利学习',
    2: '疾病是非，需化解',
    3: '争斗官非，宜谨慎',
    4: '文昌桃花，利考试',
    5: '灾祸疾病，需化解',
    6: '权威财富，大吉利',
    7: '破败口舌，需注意',
    8: '财富田产，大吉利',
    9: '喜庆名声，利事业',
  };
  return characteristics[star];
}

// 辅助函数：计算年干支
function calculateYearGanzhi(year: number): string {
  const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const zhi = [
    '子',
    '丑',
    '寅',
    '卯',
    '辰',
    '巳',
    '午',
    '未',
    '申',
    '酉',
    '戌',
    '亥',
  ];

  const ganIndex = (year - 4) % 10;
  const zhiIndex = (year - 4) % 12;

  return gan[ganIndex] + zhi[zhiIndex];
}

// 辅助函数：计算月干支
function calculateMonthGanzhi(year: number, month: number): string {
  // 简化的月干支计算
  const monthZhi = [
    '寅',
    '卯',
    '辰',
    '巳',
    '午',
    '未',
    '申',
    '酉',
    '戌',
    '亥',
    '子',
    '丑',
  ];
  return '甲' + monthZhi[month - 1]; // 简化处理
}

// 辅助函数：获取干支五行
function getGanzhiElement(ganzhi: string): '金' | '木' | '水' | '火' | '土' {
  const elementMap: Record<string, '金' | '木' | '水' | '火' | '土'> = {
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
  return elementMap[ganzhi[0]] || '土';
}

// 辅助函数：获取干支阴阳
function getGanzhiYinYang(ganzhi: string): '阴' | '阳' {
  const yangGan = ['甲', '丙', '戊', '庚', '壬'];
  return yangGan.includes(ganzhi[0]) ? '阳' : '阴';
}

// 辅助函数：获取季节影响
function getSeasonalInfluence(month: number): '春' | '夏' | '秋' | '冬' {
  if (month >= 2 && month <= 4) return '春';
  if (month >= 5 && month <= 7) return '夏';
  if (month >= 8 && month <= 10) return '秋';
  return '冬';
}

export default {
  calculateLiunianStar,
  calculateLiuyueStar,
  generateLiunianPlate,
  analyzeLiunianOverlay,
  analyzeDayunTransition,
  analyzeTimeSelection,
};
