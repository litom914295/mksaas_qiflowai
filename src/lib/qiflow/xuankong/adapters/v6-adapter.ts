/**
 * 玄空飞星 v6.0 API 适配器
 * 将v5.x的API适配到v6.0的接口规范
 */

import type {
  ActionRecommendation,
  BaziIntegration,
  CriticalPeriod,
  CurrentYearInfo,
  EnhancedXuankongPlate,
  FlyingStar,
  LiunianAnalysisOptions,
  LiunianAnalysisResult,
  LongTermPhase,
  MonthlyTrend,
  PalaceName,
  PersonalizedAnalysisOptions,
  PersonalizedAnalysisResult,
  PersonalizedRecommendation,
  QuickWinRecommendation,
  SmartRecommendationResult,
  SmartRecommendationsOptions,
  YearlyFortune,
  Yun,
} from '../types';

import {
  convertEnhancedToPlate,
  extractCaiwei,
  extractWenchangwei,
} from '../converters';

import {
  type SmartRecommendation,
  generateSmartRecommendations as legacyGenerateSmartRecommendations,
} from '../smart-recommendations';

import {
  calculatePersonalGua,
  personalizedFlyingStarAnalysis as legacyPersonalizedAnalysis,
} from '../personalized-analysis';

import {
  calculateLiunianStar,
  calculateLiuyueStar,
  analyzeLiunianOverlay as legacyAnalyzeLiunian,
} from '../liunian-analysis';

/**
 * v6.0 智能推荐生成器
 */
export function generateSmartRecommendations(
  plate: EnhancedXuankongPlate,
  options: SmartRecommendationsOptions = {}
): SmartRecommendationResult {
  // 转换数据结构
  const legacyPlate = convertEnhancedToPlate(plate);
  const period = plate.period as Yun;
  const wenchangwei = extractWenchangwei(plate);
  const caiwei = extractCaiwei(plate);

  // 调用旧版API
  const legacyRecommendations = legacyGenerateSmartRecommendations(
    legacyPlate,
    period,
    wenchangwei,
    caiwei
  );

  // 转换为v6.0格式
  const prioritizedActions: ActionRecommendation[] = legacyRecommendations
    .map(
      (rec): ActionRecommendation => ({
        id: rec.id,
        title: rec.title,
        description: rec.description,
        priority:
          rec.type === 'urgent'
            ? 'urgent'
            : rec.type === 'important'
              ? 'high'
              : rec.type === 'suggestion'
                ? 'medium'
                : 'low',
        category:
          rec.category === 'wealth'
            ? 'decoration'
            : rec.category === 'health'
              ? 'layout'
              : rec.category === 'study'
                ? 'furniture'
                : 'other',
        reason: `基于${rec.palace}宫的分析`,
        specificSteps: rec.actions,
        estimatedTime: rec.timing,
        estimatedCost: estimateCost(rec),
        expectedImpact: `优先级${rec.priority}/10`,
        difficulty:
          rec.priority > 7 ? 'hard' : rec.priority > 4 ? 'medium' : 'easy',
      })
    )
    .sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

  // 生成快速见效方案
  const quickWins: QuickWinRecommendation[] =
    options.includeQuickWins !== false
      ? generateQuickWins(legacyRecommendations)
      : [];

  // 生成长期规划
  const longTermPlan =
    options.includeLongTermPlan !== false
      ? generateLongTermPlan(plate, legacyRecommendations)
      : {
          overview: '暂无长期规划',
          phases: [],
          totalDuration: '0个月',
        };

  // 生成时间轴
  const timeline = options.includeTimeline
    ? generateTimeline(plate.period)
    : undefined;

  return {
    prioritizedActions,
    quickWins,
    longTermPlan,
    timeline,
  };
}

/**
 * v6.0 个性化分析
 */
export function analyzePersonalized(
  plate: EnhancedXuankongPlate,
  options: PersonalizedAnalysisOptions
): PersonalizedAnalysisResult {
  // 转换数据结构
  const legacyPlate = convertEnhancedToPlate(plate);
  const period = plate.period as Yun;

  // 计算个人命卦
  const birthYear = options.userProfile.birthDate.getFullYear();
  const gender = options.userProfile.gender || 'male';
  const personalGua = calculatePersonalGua(birthYear, gender);

  // 生成八字融合分析
  const baziIntegration: BaziIntegration = {
    zodiac: getZodiac(options.userProfile.birthDate.getFullYear()),
    mainElement: getMainElementFromBazi(options.userProfile.bazi),
    favorableElements: [personalGua.element as any],
    unfavorableElements: getUnfavorableElements(personalGua.element as any),
    luckyDirections: personalGua.favorableDirections,
    unluckyDirections: personalGua.unfavorableDirections,
    seasonalInfluence: getSeasonalInfluence(options.userProfile.birthDate),
  };

  // 生成个性化推荐
  const personalizedRecommendations: PersonalizedRecommendation[] =
    generatePersonalizedRecommendations(plate, baziIntegration, options);

  // 生成房间优先级
  const roomPriorities = generateRoomPriorities(plate, baziIntegration);

  // 生成避让区域
  const avoidanceAreas = generateAvoidanceAreas(plate, baziIntegration);

  return {
    userProfile: options.userProfile,
    baziIntegration,
    personalizedRecommendations,
    roomPriorities,
    avoidanceAreas,
  };
}

/**
 * v6.0 流年分析
 */
export function analyzeLiunian(
  plate: EnhancedXuankongPlate,
  options: LiunianAnalysisOptions
): LiunianAnalysisResult {
  // 转换数据结构
  const legacyPlate = convertEnhancedToPlate(plate);

  // 计算流年信息
  const liunianInfo = calculateLiunianStar(options.year);

  // 当前年份信息
  const currentYear: CurrentYearInfo = {
    year: options.year,
    yearStar: liunianInfo.liunianStar,
    ganZhi: liunianInfo.yearGanzhi,
    element: liunianInfo.yearElement,
    characteristics: `${options.year}年为${liunianInfo.yearGanzhi}年，${liunianInfo.liunianStar}白星入中宫`,
  };

  // 调用旧版流年分析
  const legacyAnalysis = legacyAnalyzeLiunian(
    legacyPlate,
    options.year,
    undefined,
    {
      includeMonthly: options.includeMonthly,
    }
  );

  // 生成年度运势
  const yearlyFortune: YearlyFortune = generateYearlyFortune(
    legacyAnalysis,
    plate.overallScore
  );

  // 生成月度趋势
  const monthlyTrends: MonthlyTrend[] = options.includeMonthly
    ? generateMonthlyTrends(options.year, legacyPlate)
    : [];

  // 生成关键时期
  const criticalPeriods: CriticalPeriod[] = generateCriticalPeriods(
    options.year,
    liunianInfo
  );

  // 生成年度指导
  const annualGuidance = generateAnnualGuidance(
    yearlyFortune,
    options.focusAreas
  );

  return {
    currentYear,
    yearlyFortune,
    monthlyTrends,
    criticalPeriods,
    annualGuidance,
  };
}

// ========== 辅助函数 ==========

function estimateCost(rec: SmartRecommendation): string {
  const materials = rec.materials?.length || 0;
  if (materials === 0) return '0-100元';
  if (materials <= 2) return '100-500元';
  if (materials <= 4) return '500-2000元';
  return '2000-10000元';
}

function generateQuickWins(
  recs: SmartRecommendation[]
): QuickWinRecommendation[] {
  return recs
    .filter((rec) => rec.priority >= 7 && rec.actions.length <= 3)
    .slice(0, 3)
    .map((rec) => ({
      title: rec.title,
      description: rec.description,
      estimatedTime: rec.timing || '1-3天',
      estimatedCost: estimateCost(rec),
      expectedImpact: `提升${rec.palace}宫运势`,
      steps: rec.actions,
      materials: rec.materials,
    }));
}

function generateLongTermPlan(
  plate: EnhancedXuankongPlate,
  recs: SmartRecommendation[]
): {
  overview: string;
  phases: LongTermPhase[];
  totalDuration: string;
} {
  const phases: LongTermPhase[] = [
    {
      phase: 1,
      title: '紧急问题处理期',
      duration: '1-2个月',
      goals: ['化解五黄二黑', '处理紧急凶位'],
      actions: recs.filter((r) => r.type === 'urgent').map((r) => r.title),
      expectedOutcomes: ['基本化解凶煞', '止损防灾'],
    },
    {
      phase: 2,
      title: '布局优化期',
      duration: '3-6个月',
      goals: ['优化功能分区', '提升吉位能量'],
      actions: recs.filter((r) => r.type === 'important').map((r) => r.title),
      expectedOutcomes: ['整体运势提升20-30%', '生活品质改善'],
    },
    {
      phase: 3,
      title: '精细调整期',
      duration: '6-12个月',
      goals: ['细节完善', '长期稳定'],
      actions: recs.filter((r) => r.type === 'enhancement').map((r) => r.title),
      expectedOutcomes: ['达到最佳状态', '长期保持良好运势'],
    },
  ];

  return {
    overview: `根据当前${plate.overallScore}分的综合评分，建议分3个阶段进行优化`,
    phases,
    totalDuration: '12个月',
  };
}

function generateTimeline(period: number): {
  period: string;
  milestones: string[];
  criticalDates: string[];
} {
  return {
    period: `九运${period}期`,
    milestones: [
      '第1月：完成紧急化解',
      '第3月：完成基础布局',
      '第6月：中期评估',
      '第12月：全面优化完成',
    ],
    criticalDates: [
      '立春：年度重要节点',
      '春分：季节转换关键',
      '立秋：下半年开始',
      '冬至：年度总结时期',
    ],
  };
}

function getZodiac(year: number): string {
  const zodiacs = [
    '鼠',
    '牛',
    '虎',
    '兔',
    '龙',
    '蛇',
    '马',
    '羊',
    '猴',
    '鸡',
    '狗',
    '猪',
  ];
  return zodiacs[(year - 4) % 12];
}

function getMainElementFromBazi(
  bazi: PersonalizedAnalysisOptions['userProfile']['bazi']
): '金' | '木' | '水' | '火' | '土' {
  // 简化版：根据日干判断
  const ganElements: Record<string, '金' | '木' | '水' | '火' | '土'> = {
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
  return ganElements[bazi.day.gan] || '土';
}

function getUnfavorableElements(
  mainElement: '金' | '木' | '水' | '火' | '土'
): ('金' | '木' | '水' | '火' | '土')[] {
  const restraintRelations: {
    [key: string]: ('金' | '木' | '水' | '火' | '土')[];
  } = {
    金: ['火', '木'],
    木: ['金', '土'],
    水: ['土', '火'],
    火: ['水', '金'],
    土: ['木', '水'],
  };
  return restraintRelations[mainElement] || [];
}

function getSeasonalInfluence(birthDate: Date): string {
  const month = birthDate.getMonth() + 1;
  if (month >= 3 && month <= 5) return '春季出生，木旺';
  if (month >= 6 && month <= 8) return '夏季出生，火旺';
  if (month >= 9 && month <= 11) return '秋季出生，金旺';
  return '冬季出生，水旺';
}

function generatePersonalizedRecommendations(
  plate: EnhancedXuankongPlate,
  bazi: BaziIntegration,
  options: PersonalizedAnalysisOptions
): PersonalizedRecommendation[] {
  const recommendations: PersonalizedRecommendation[] = [];

  // 健康建议
  if (options.includeHealthAnalysis !== false) {
    recommendations.push({
      title: '健康方位建议',
      category: 'health',
      priority: 'high',
      description: `根据您的${bazi.mainElement}命格，建议重点关注${bazi.luckyDirections[0]}方位`,
      actions: [
        `在${bazi.luckyDirections[0]}方位布置休息区`,
        '保持该区域通风明亮',
        '避免在不利方位长时间停留',
      ],
      reasoning: `${bazi.mainElement}命格与${bazi.luckyDirections[0]}方位相生`,
    });
  }

  // 事业建议
  if (options.includeCareerGuidance !== false) {
    recommendations.push({
      title: '事业发展方位',
      category: 'career',
      priority: 'high',
      description: '根据八字和宅盘分析，推荐事业发展布局',
      actions: [
        '在吉位设置工作区',
        '使用有利的颜色和装饰',
        '定期调整以配合流年',
      ],
      reasoning: '结合本命和流年分析',
    });
  }

  return recommendations;
}

function generateRoomPriorities(
  plate: EnhancedXuankongPlate,
  bazi: BaziIntegration
) {
  return Object.entries(plate.palaces)
    .map(([name, info]) => ({
      palace: name as PalaceName,
      suitability: info.score,
      reasons: [
        `宫位评分：${info.score}分`,
        `与您的${bazi.mainElement}命格${bazi.luckyDirections.includes(name) ? '相合' : '一般'}`,
      ],
    }))
    .sort((a, b) => b.suitability - a.suitability);
}

function generateAvoidanceAreas(
  plate: EnhancedXuankongPlate,
  bazi: BaziIntegration
) {
  return Object.entries(plate.palaces)
    .filter(([_, info]) => info.score < 40 || info.fortuneRating.includes('凶'))
    .map(([name, info]) => ({
      palace: name as PalaceName,
      severity: (info.score < 30
        ? 'high'
        : info.score < 40
          ? 'medium'
          : 'low') as 'high' | 'medium' | 'low',
      reasons: [`吉凶评级：${info.fortuneRating}`, `评分过低：${info.score}分`],
    }));
}

function generateYearlyFortune(
  legacyAnalysis: any,
  baseScore: number
): YearlyFortune {
  const score = Math.round(baseScore * 0.9); // 流年影响

  return {
    overallScore: score,
    overallRating:
      score >= 80
        ? 'excellent'
        : score >= 65
          ? 'good'
          : score >= 50
            ? 'fair'
            : 'challenging',
    characteristics: '流年运势综合分析',
    favorableAspects: ['当旺星位旺', '吉星临门'],
    unfavorableAspects: ['注意凶星方位', '避免冲动决策'],
    keyMonths: [1, 3, 7, 11],
    yearlyRecommendations: ['把握吉时良机', '化解凶位影响', '保持稳健发展'],
  };
}

function generateMonthlyTrends(year: number, plate: any): MonthlyTrend[] {
  const trends: MonthlyTrend[] = [];

  for (let month = 1; month <= 12; month++) {
    const monthInfo = calculateLiuyueStar(year, month);
    const baseScore = 50 + Math.sin(month) * 20;

    trends.push({
      month,
      score: Math.round(baseScore),
      trend: month < 6 ? 'improving' : month < 9 ? 'stable' : 'declining',
      mainInfluences: [
        `${monthInfo.monthStar}白星入中宫`,
        monthInfo.monthElement + '月',
      ],
      recommendations: [`注意${monthInfo.seasonalInfluence}季节影响`],
    });
  }

  return trends;
}

function generateCriticalPeriods(
  year: number,
  liunianInfo: any
): CriticalPeriod[] {
  return [
    {
      period: `${year}年3月`,
      type: 'unfavorable',
      description: '五黄临门，需要特别注意',
      suggestions: ['避免动土', '加强化解'],
      importance: 9,
    },
    {
      period: `${year}年7月`,
      type: 'favorable',
      description: '八白财星当旺',
      suggestions: ['把握投资机会', '拓展业务'],
      importance: 8,
    },
  ];
}

function generateAnnualGuidance(
  fortune: YearlyFortune,
  focusAreas?: ('health' | 'wealth' | 'career' | 'relationship')[]
) {
  return {
    health: ['保持规律作息', '注意季节变化'],
    wealth: ['稳健投资', '避免冒进'],
    career: ['把握机遇', '提升专业能力'],
    relationship: ['加强沟通', '增进理解'],
  };
}
