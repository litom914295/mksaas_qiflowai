/**
 * 增强版月运分析模块 (v6.0)
 *
 * 提供详细的月度运势分析：
 * - 24节气准确划分
 * - 月度飞星变化
 * - 关键时间节点
 * - 月度吉凶清单
 */

import type {
  EnhancedXuankongPlate,
  FlyingStar,
  FortuneRating,
  PalaceName,
} from './types';

import type { UserProfile } from './personalized-analysis';

// 24节气定义
export type SolarTerm =
  | '立春'
  | '雨水'
  | '惊蛰'
  | '春分'
  | '清明'
  | '谷雨'
  | '立夏'
  | '小满'
  | '芒种'
  | '夏至'
  | '小暑'
  | '大暑'
  | '立秋'
  | '处暑'
  | '白露'
  | '秋分'
  | '寒露'
  | '霜降'
  | '立冬'
  | '小雪'
  | '大雪'
  | '冬至'
  | '小寒'
  | '大寒';

// 月度信息
export interface MonthInfo {
  year: number;
  month: number; // 1-12
  chineseMonth: string; // 如"甲寅月"
  solarTermStart: SolarTerm;
  solarTermEnd: SolarTerm;
  startDate: Date;
  endDate: Date;
  monthStar: FlyingStar; // 月飞星
}

// 月度运势详情
export interface MonthlyFortune {
  month: MonthInfo;

  overall: {
    rating: FortuneRating;
    score: number; // 0-100
    summary: string;
    keyInsights: string[];
  };

  // 九宫月度飞星与影响
  palaceForecasts: Array<{
    palace: PalaceName;
    monthStar: FlyingStar; // 月飞星
    annualStar: FlyingStar; // 年飞星
    baseStar: FlyingStar; // 宅盘飞星（向星）

    combinationAnalysis: {
      description: string;
      impact:
        | 'very_positive'
        | 'positive'
        | 'neutral'
        | 'negative'
        | 'very_negative';
      affectedAreas: string[]; // 影响领域
    };

    recommendations: string[];
  }>;

  // 关键时间节点
  keyDates: Array<{
    date: Date;
    type: 'auspicious' | 'inauspicious' | 'neutral' | 'solar_term';
    event: string;
    description: string;
    activities?: string[]; // 适合活动
  }>;

  // 月度吉凶清单
  checklist: {
    auspiciousActivities: Array<{
      activity: string;
      bestDates: Date[];
      bestDirections: PalaceName[];
      reason: string;
    }>;

    inauspiciousActivities: Array<{
      activity: string;
      avoidDates: Date[];
      avoidDirections: PalaceName[];
      reason: string;
    }>;

    remedies: Array<{
      issue: string;
      solution: string;
      duration: 'daily' | 'weekly' | 'monthly' | 'throughout';
      priority: 'high' | 'medium' | 'low';
    }>;
  };

  // 个性化建议（基于用户信息）
  personalizedAdvice?: {
    health: string[];
    wealth: string[];
    career: string[];
    relationship: string[];
  };
}

// 24节气对应日期（简化版，2024年为例）
const SOLAR_TERMS_2024: Record<SolarTerm, string> = {
  立春: '2024-02-04',
  雨水: '2024-02-19',
  惊蛰: '2024-03-05',
  春分: '2024-03-20',
  清明: '2024-04-04',
  谷雨: '2024-04-19',
  立夏: '2024-05-05',
  小满: '2024-05-20',
  芒种: '2024-06-05',
  夏至: '2024-06-21',
  小暑: '2024-07-06',
  大暑: '2024-07-22',
  立秋: '2024-08-07',
  处暑: '2024-08-22',
  白露: '2024-09-07',
  秋分: '2024-09-22',
  寒露: '2024-10-08',
  霜降: '2024-10-23',
  立冬: '2024-11-07',
  小雪: '2024-11-22',
  大雪: '2024-12-06',
  冬至: '2024-12-21',
  小寒: '2025-01-05',
  大寒: '2025-01-20',
};

// 24节气顺序
const SOLAR_TERMS_ORDER: SolarTerm[] = [
  '立春',
  '雨水',
  '惊蛰',
  '春分',
  '清明',
  '谷雨',
  '立夏',
  '小满',
  '芒种',
  '夏至',
  '小暑',
  '大暑',
  '立秋',
  '处暑',
  '白露',
  '秋分',
  '寒露',
  '霜降',
  '立冬',
  '小雪',
  '大雪',
  '冬至',
  '小寒',
  '大寒',
];

// 月份与节气对应关系
const MONTH_SOLAR_TERMS: Record<number, [SolarTerm, SolarTerm]> = {
  1: ['小寒', '大寒'],
  2: ['立春', '雨水'],
  3: ['惊蛰', '春分'],
  4: ['清明', '谷雨'],
  5: ['立夏', '小满'],
  6: ['芒种', '夏至'],
  7: ['小暑', '大暑'],
  8: ['立秋', '处暑'],
  9: ['白露', '秋分'],
  10: ['寒露', '霜降'],
  11: ['立冬', '小雪'],
  12: ['大雪', '冬至'],
};

/**
 * 获取月度信息（包含节气）
 */
export function getMonthInfo(year: number, month: number): MonthInfo {
  const [startTerm, endTerm] = MONTH_SOLAR_TERMS[month];

  // 计算月飞星
  const monthStar = calculateMonthStar(year, month);

  // 获取节气日期
  const startTermDate = getSolarTermDate(year, startTerm);
  const endTermDate = getSolarTermDate(year, endTerm);

  // 计算农历月干支
  const chineseMonth = calculateChineseMonth(year, month);

  return {
    year,
    month,
    chineseMonth,
    solarTermStart: startTerm,
    solarTermEnd: endTerm,
    startDate: startTermDate,
    endDate: endTermDate,
    monthStar,
  };
}

/**
 * 生成月度运势详情
 */
export function generateMonthlyFortune(
  plate: EnhancedXuankongPlate,
  year: number,
  month: number,
  profile?: UserProfile
): MonthlyFortune {
  const monthInfo = getMonthInfo(year, month);

  // 分析各宫位月度运势
  const palaceForecasts = analyzePalaceForecasts(plate, monthInfo);

  // 计算总体评分
  const overallScore = calculateOverallScore(palaceForecasts);
  const overallRating = scoreToRating(overallScore);

  // 生成总体概述
  const summary = generateOverallSummary(
    monthInfo,
    overallRating,
    palaceForecasts
  );
  const keyInsights = generateKeyInsights(palaceForecasts, monthInfo);

  // 生成关键时间节点
  const keyDates = generateKeyDates(monthInfo, palaceForecasts);

  // 生成吉凶清单
  const checklist = generateMonthlyChecklist(palaceForecasts, monthInfo, plate);

  // 个性化建议
  const personalizedAdvice = profile
    ? generatePersonalizedMonthlyAdvice(palaceForecasts, profile, monthInfo)
    : undefined;

  return {
    month: monthInfo,
    overall: {
      rating: overallRating,
      score: overallScore,
      summary,
      keyInsights,
    },
    palaceForecasts,
    keyDates,
    checklist,
    personalizedAdvice,
  };
}

/**
 * 计算月飞星
 */
function calculateMonthStar(year: number, month: number): FlyingStar {
  // 简化算法：根据年份和月份计算
  // 实际应根据立春、节气准确计算
  const baseYear = 2024;
  const yearOffset = (year - baseYear) % 9;
  const monthOffset = (month - 1) % 9;

  const star = ((yearOffset + monthOffset) % 9) + 1;
  return star as FlyingStar;
}

/**
 * 获取节气日期
 */
function getSolarTermDate(year: number, term: SolarTerm): Date {
  // 简化实现：使用2024年数据
  const dateStr = SOLAR_TERMS_2024[term];
  const baseDate = new Date(dateStr);

  // 根据年份调整（实际应有精确算法）
  const yearDiff = year - 2024;
  baseDate.setFullYear(baseDate.getFullYear() + yearDiff);

  return baseDate;
}

/**
 * 计算农历月干支
 */
function calculateChineseMonth(year: number, month: number): string {
  const tiangans = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const dizhis = [
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

  // 简化算法
  const tgIndex = ((year - 4) * 12 + month - 1) % 10;
  const dzIndex = (month + 1) % 12;

  return `${tiangans[tgIndex]}${dizhis[dzIndex]}月`;
}

/**
 * 分析各宫位月度预测
 */
function analyzePalaceForecasts(
  plate: EnhancedXuankongPlate,
  monthInfo: MonthInfo
): MonthlyFortune['palaceForecasts'] {
  const forecasts: MonthlyFortune['palaceForecasts'] = [];

  Object.entries(plate.palaces).forEach(([palaceName, info]) => {
    const palace = palaceName as PalaceName;

    // 获取各层飞星
    const baseStar = info.facingStar; // 宅盘向星
    const annualStar = (info as any).yearStar; // 年飞星
    const monthStar = monthInfo.monthStar; // 月飞星

    // 分析组合影响
    const combinationAnalysis = analyzeStarCombination(
      baseStar,
      annualStar,
      monthStar
    );

    // 生成建议
    const recommendations = generatePalaceRecommendations(
      palace,
      combinationAnalysis,
      monthInfo
    );

    forecasts.push({
      palace,
      monthStar,
      annualStar,
      baseStar,
      combinationAnalysis,
      recommendations,
    });
  });

  return forecasts;
}

/**
 * 分析飞星组合影响
 */
function analyzeStarCombination(
  baseStar: FlyingStar,
  annualStar: FlyingStar,
  monthStar: FlyingStar
): MonthlyFortune['palaceForecasts'][0]['combinationAnalysis'] {
  const affectedAreas: string[] = [];
  let impact: MonthlyFortune['palaceForecasts'][0]['combinationAnalysis']['impact'] =
    'neutral';

  // 吉星判断
  const auspiciousStars = [1, 4, 6, 8, 9];
  const inauspiciousStars = [2, 3, 5, 7];

  let score = 0;

  if (auspiciousStars.includes(monthStar)) score += 2;
  else if (inauspiciousStars.includes(monthStar)) score -= 2;

  if (auspiciousStars.includes(annualStar)) score += 1;
  else if (inauspiciousStars.includes(annualStar)) score -= 1;

  // 特殊组合
  if (monthStar === 8 && annualStar === 8) {
    score += 3;
    affectedAreas.push('财运', '事业');
  }

  if (monthStar === 5 || annualStar === 5) {
    score -= 3;
    affectedAreas.push('健康', '安全');
  }

  if (monthStar === 2 && annualStar === 5) {
    score -= 4;
    affectedAreas.push('健康', '意外');
  }

  // 确定影响程度
  if (score >= 4) impact = 'very_positive';
  else if (score >= 2) impact = 'positive';
  else if (score <= -4) impact = 'very_negative';
  else if (score <= -2) impact = 'negative';
  else impact = 'neutral';

  // 默认影响领域
  if (affectedAreas.length === 0) {
    affectedAreas.push('综合运势');
  }

  const description = generateCombinationDescription(
    baseStar,
    annualStar,
    monthStar,
    impact
  );

  return {
    description,
    impact,
    affectedAreas,
  };
}

function generateCombinationDescription(
  base: FlyingStar,
  annual: FlyingStar,
  month: FlyingStar,
  impact: string
): string {
  const impactDesc = {
    very_positive: '非常吉利',
    positive: '吉利',
    neutral: '平稳',
    negative: '不利',
    very_negative: '非常不利',
  }[impact];

  return `宅盘${base}、年星${annual}、月星${month}组合，本月${impactDesc}`;
}

/**
 * 生成宫位建议
 */
function generatePalaceRecommendations(
  palace: PalaceName,
  analysis: MonthlyFortune['palaceForecasts'][0]['combinationAnalysis'],
  monthInfo: MonthInfo
): string[] {
  const recommendations: string[] = [];

  if (analysis.impact === 'very_positive' || analysis.impact === 'positive') {
    recommendations.push(`${palace}宫本月吉利，可作为主要活动区域`);
    if (analysis.affectedAreas.includes('财运')) {
      recommendations.push('适合进行财务决策、商务洽谈');
    }
    if (analysis.affectedAreas.includes('事业')) {
      recommendations.push('适合推进重要项目、寻求合作');
    }
  } else if (
    analysis.impact === 'negative' ||
    analysis.impact === 'very_negative'
  ) {
    recommendations.push(`${palace}宫本月不利，减少长时间停留`);
    if (analysis.affectedAreas.includes('健康')) {
      recommendations.push('避免在此方位休息睡眠，注意疾病预防');
    }
    if (analysis.affectedAreas.includes('安全')) {
      recommendations.push('检查此方位安全隐患，避免动土');
    }
  } else {
    recommendations.push(`${palace}宫本月运势平稳`);
  }

  return recommendations;
}

/**
 * 计算总体评分
 */
function calculateOverallScore(
  forecasts: MonthlyFortune['palaceForecasts']
): number {
  const impactScores = {
    very_positive: 5,
    positive: 3,
    neutral: 0,
    negative: -3,
    very_negative: -5,
  };

  const totalScore = forecasts.reduce((sum, f) => {
    return sum + impactScores[f.combinationAnalysis.impact];
  }, 0);

  const avgScore = totalScore / forecasts.length;

  // 转换为 0-100 分数
  return Math.max(0, Math.min(100, 50 + avgScore * 10));
}

function scoreToRating(score: number): FortuneRating {
  if (score >= 80) return '大吉';
  if (score >= 65) return '吉';
  if (score >= 50) return '平';
  if (score >= 35) return '凶';
  return '大凶';
}

/**
 * 生成总体概述
 */
function generateOverallSummary(
  monthInfo: MonthInfo,
  rating: FortuneRating,
  forecasts: MonthlyFortune['palaceForecasts']
): string {
  const ratingDesc: Record<FortuneRating, string> = {
    大吉: '非常吉利',
    吉: '较为吉利',
    次吉: '吉利',
    平: '平稳',
    次凶: '较为不利',
    凶: '不利',
    大凶: '非常不利',
  };
  const desc = ratingDesc[rating] || '平稳';

  const positiveCount = forecasts.filter(
    (f) =>
      f.combinationAnalysis.impact === 'positive' ||
      f.combinationAnalysis.impact === 'very_positive'
  ).length;

  const negativeCount = forecasts.filter(
    (f) =>
      f.combinationAnalysis.impact === 'negative' ||
      f.combinationAnalysis.impact === 'very_negative'
  ).length;

  return (
    `${monthInfo.chineseMonth}（${monthInfo.solarTermStart}至${monthInfo.solarTermEnd}）整体运势${desc}，` +
    `有${positiveCount}个方位吉利，${negativeCount}个方位需要注意。`
  );
}

/**
 * 生成关键洞察
 */
function generateKeyInsights(
  forecasts: MonthlyFortune['palaceForecasts'],
  monthInfo: MonthInfo
): string[] {
  const insights: string[] = [];

  // 找出最吉利的宫位
  const bestPalace = forecasts.reduce((best, current) => {
    const impactOrder = [
      'very_positive',
      'positive',
      'neutral',
      'negative',
      'very_negative',
    ];
    return impactOrder.indexOf(current.combinationAnalysis.impact) <
      impactOrder.indexOf(best.combinationAnalysis.impact)
      ? current
      : best;
  });

  insights.push(
    `最佳方位：${bestPalace.palace}宫，${bestPalace.combinationAnalysis.description}`
  );

  // 找出最不利的宫位
  const worstPalace = forecasts.reduce((worst, current) => {
    const impactOrder = [
      'very_positive',
      'positive',
      'neutral',
      'negative',
      'very_negative',
    ];
    return impactOrder.indexOf(current.combinationAnalysis.impact) >
      impactOrder.indexOf(worst.combinationAnalysis.impact)
      ? current
      : worst;
  });

  if (
    worstPalace.combinationAnalysis.impact === 'negative' ||
    worstPalace.combinationAnalysis.impact === 'very_negative'
  ) {
    insights.push(
      `需注意方位：${worstPalace.palace}宫，${worstPalace.combinationAnalysis.description}`
    );
  }

  // 节气提示
  insights.push(
    `本月节气：${monthInfo.solarTermStart}（${monthInfo.startDate.toLocaleDateString()}）和${monthInfo.solarTermEnd}（${monthInfo.endDate.toLocaleDateString()}）`
  );

  return insights;
}

/**
 * 生成关键时间节点
 */
function generateKeyDates(
  monthInfo: MonthInfo,
  forecasts: MonthlyFortune['palaceForecasts']
): MonthlyFortune['keyDates'] {
  const keyDates: MonthlyFortune['keyDates'] = [];

  // 添加节气
  keyDates.push({
    date: monthInfo.startDate,
    type: 'solar_term',
    event: monthInfo.solarTermStart,
    description: `${monthInfo.solarTermStart}节气，气场转换之时`,
    activities: ['调整布局', '清理空间', '祈福'],
  });

  keyDates.push({
    date: monthInfo.endDate,
    type: 'solar_term',
    event: monthInfo.solarTermEnd,
    description: `${monthInfo.solarTermEnd}节气，气场转换之时`,
    activities: ['调整布局', '清理空间', '祈福'],
  });

  // 添加月度关键日期
  const monthStart = new Date(monthInfo.year, monthInfo.month - 1, 1);
  const monthEnd = new Date(monthInfo.year, monthInfo.month, 0);

  // 月初
  keyDates.push({
    date: monthStart,
    type: 'neutral',
    event: '月初',
    description: '新月开始，适合规划本月事务',
    activities: ['制定计划', '设定目标'],
  });

  // 月中（初八、十五）
  const day8 = new Date(monthInfo.year, monthInfo.month - 1, 8);
  keyDates.push({
    date: day8,
    type: 'auspicious',
    event: '初八吉日',
    description: '发字日，适合开展新事务',
    activities: ['开业', '签约', '动工'],
  });

  const day15 = new Date(monthInfo.year, monthInfo.month - 1, 15);
  keyDates.push({
    date: day15,
    type: 'auspicious',
    event: '十五满月',
    description: '月圆之日，能量充沛',
    activities: ['祈福', '团聚', '重要会议'],
  });

  // 月尾
  const lastDay = new Date(
    monthInfo.year,
    monthInfo.month - 1,
    monthEnd.getDate()
  );
  keyDates.push({
    date: lastDay,
    type: 'neutral',
    event: '月末',
    description: '月底总结，准备下月',
    activities: ['复盘总结', '清理整顿'],
  });

  return keyDates.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * 生成月度吉凶清单
 */
function generateMonthlyChecklist(
  forecasts: MonthlyFortune['palaceForecasts'],
  monthInfo: MonthInfo,
  plate: EnhancedXuankongPlate
): MonthlyFortune['checklist'] {
  const auspiciousActivities: MonthlyFortune['checklist']['auspiciousActivities'] =
    [];
  const inauspiciousActivities: MonthlyFortune['checklist']['inauspiciousActivities'] =
    [];
  const remedies: MonthlyFortune['checklist']['remedies'] = [];

  // 吉利宫位适合的活动
  const auspiciousPalaces = forecasts.filter(
    (f) =>
      f.combinationAnalysis.impact === 'positive' ||
      f.combinationAnalysis.impact === 'very_positive'
  );

  if (auspiciousPalaces.length > 0) {
    auspiciousActivities.push({
      activity: '重要商务活动',
      bestDates: [
        monthInfo.startDate,
        new Date(monthInfo.year, monthInfo.month - 1, 8),
      ],
      bestDirections: auspiciousPalaces.slice(0, 3).map((p) => p.palace),
      reason: '这些方位本月飞星组合吉利，利于商务发展',
    });

    auspiciousActivities.push({
      activity: '搬迁、装修',
      bestDates: [new Date(monthInfo.year, monthInfo.month - 1, 8)],
      bestDirections: auspiciousPalaces.slice(0, 2).map((p) => p.palace),
      reason: '气场和顺，适合进行空间调整',
    });
  }

  // 不利宫位需避免的活动
  const inauspiciousPalaces = forecasts.filter(
    (f) =>
      f.combinationAnalysis.impact === 'negative' ||
      f.combinationAnalysis.impact === 'very_negative'
  );

  if (inauspiciousPalaces.length > 0) {
    inauspiciousActivities.push({
      activity: '长时间停留、睡眠',
      avoidDates: [], // 整月避免
      avoidDirections: inauspiciousPalaces.map((p) => p.palace),
      reason: '这些方位本月飞星不吉，需减少使用',
    });

    if (
      inauspiciousPalaces.some((p) =>
        p.combinationAnalysis.affectedAreas.includes('健康')
      )
    ) {
      inauspiciousActivities.push({
        activity: '动土、装修',
        avoidDates: [],
        avoidDirections: inauspiciousPalaces
          .filter((p) => p.combinationAnalysis.affectedAreas.includes('健康'))
          .map((p) => p.palace),
        reason: '病符或五黄到位，动土易招疾病',
      });
    }
  }

  // 化解建议
  inauspiciousPalaces.forEach((p) => {
    if (p.monthStar === 5 || p.annualStar === 5) {
      remedies.push({
        issue: `${p.palace}宫五黄到位`,
        solution: '放置铜器或六帝钱化解',
        duration: 'throughout',
        priority: 'high',
      });
    }

    if (p.monthStar === 2 || p.annualStar === 2) {
      remedies.push({
        issue: `${p.palace}宫二黑病符`,
        solution: '放置铜葫芦，保持明亮通风',
        duration: 'throughout',
        priority: 'medium',
      });
    }
  });

  return {
    auspiciousActivities,
    inauspiciousActivities,
    remedies,
  };
}

/**
 * 生成个性化月度建议
 */
function generatePersonalizedMonthlyAdvice(
  forecasts: MonthlyFortune['palaceForecasts'],
  profile: UserProfile,
  monthInfo: MonthInfo
): MonthlyFortune['personalizedAdvice'] {
  const advice: MonthlyFortune['personalizedAdvice'] = {
    health: [],
    wealth: [],
    career: [],
    relationship: [],
  };

  // 健康建议
  const healthRiskPalaces = forecasts.filter((f) =>
    f.combinationAnalysis.affectedAreas.includes('健康')
  );

  if (healthRiskPalaces.length > 0) {
    advice.health.push(
      `本月${healthRiskPalaces.map((p) => p.palace).join('、')}方位健康运较弱，避免在此休息`
    );
    advice.health.push('注意身体信号，及时就医检查');
  } else {
    advice.health.push('本月整体健康运平稳，保持良好作息即可');
  }

  // 财运建议
  const wealthGoodPalaces = forecasts.filter((f) =>
    f.combinationAnalysis.affectedAreas.includes('财运')
  );

  if (wealthGoodPalaces.length > 0) {
    advice.wealth.push(
      `本月${wealthGoodPalaces.map((p) => p.palace).join('、')}方位财运旺，可在此处理财务`
    );
    advice.wealth.push('适合进行投资决策、商务洽谈');
  } else {
    advice.wealth.push('本月财运平稳，保守理财为宜');
  }

  // 事业建议
  const careerGoodPalaces = forecasts.filter((f) =>
    f.combinationAnalysis.affectedAreas.includes('事业')
  );

  if (careerGoodPalaces.length > 0) {
    advice.career.push(
      `本月${careerGoodPalaces.map((p) => p.palace).join('、')}方位事业运强，利于项目推进`
    );
    advice.career.push('把握机会，积极进取');
  } else {
    advice.career.push('本月事业运平稳，稳扎稳打');
  }

  // 感情建议
  advice.relationship.push(
    `本月节气${monthInfo.solarTermStart}和${monthInfo.solarTermEnd}，气场变化，适合调整关系`
  );

  return advice;
}

/**
 * 生成年度月运概览
 */
export function generateAnnualMonthlyOverview(
  plate: EnhancedXuankongPlate,
  year: number,
  profile?: UserProfile
): Array<{
  month: number;
  rating: FortuneRating;
  score: number;
  summary: string;
}> {
  const overview = [];

  for (let month = 1; month <= 12; month++) {
    const fortune = generateMonthlyFortune(plate, year, month, profile);
    overview.push({
      month,
      rating: fortune.overall.rating,
      score: fortune.overall.score,
      summary: fortune.overall.summary,
    });
  }

  return overview;
}
