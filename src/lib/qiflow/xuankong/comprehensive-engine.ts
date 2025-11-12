import { analyzeChengmenjue } from './chengmenjue';
import { convertPlateToEnhanced as plateToEnhancedXuankongPlate } from './converters';
import {
  type AlertLevel,
  type DiagnosticReport,
  performDiagnostics,
} from './diagnostic-system';
import { calculateLiunianOverlay, calculateStarPower } from './enhanced-aixing';
import { intelligentTiguaJudgment } from './enhanced-tigua';
import { analyzeGeju } from './geju';
import { generateFlyingStar } from './index';
import { analyzeLingzheng } from './lingzheng';
import { checkQixingDajiePattern } from './qixing-dajie';
import {
  analyzeDayunTransition,
  analyzeLiunianOverlay,
  analyzeTimeSelection,
} from './liunian-analysis';
import { PALACE_TO_BAGUA } from './luoshu';
import {
  type UserProfile,
  calculatePersonalGua,
  personalizedFlyingStarAnalysis,
} from './personalized-analysis';
import {
  type ComprehensiveRemedyPlan,
  type RemedyLevel,
  generateComprehensiveRemedyPlans,
} from './remedy-generator';
import {
  generateSmartRecommendations,
  getTodayRecommendations,
  getUrgentRecommendations,
} from './smart-recommendations';
import { getStarInterpretation } from './star-interpretations';
import type {
  EnhancedPlate,
  FlyingStar,
  FlyingStarAnalysisData,
  GenerateFlyingStarOutput,
  Mountain,
  PalaceIndex,
  Plate,
  QixingDajieAnalysis,
  Yun,
} from './types';

/**
 * 玄空飞星综合分析引擎
 *
 * 整合所有高级功能，提供一站式完整分析服务
 * 包括：基础飞星、流年叠加、个性化分析、智能推荐、替卦分析、零正理论、城门诀
 */

// 综合分析选项
export interface ComprehensiveAnalysisOptions {
  // 基础信息
  observedAt: Date;
  facing: { degrees: number };
  location?: { lat: number; lon: number };

  // 用户个性化信息
  userProfile?: UserProfile;

  // 分析选项
  includeLiunian?: boolean; // 包含流年分析
  includePersonalization?: boolean; // 包含个性化分析
  includeTiguaAnalysis?: boolean; // 包含替卦分析
  includeLingzheng?: boolean; // 包含零正理论
  includeChengmenjue?: boolean; // 包含城门诀
  includeQixingdajie?: boolean; // 包含七星打劫
  includeTimeSelection?: boolean; // 包含择吉时间

  // P1 新增分析选项
  includeDiagnostics?: boolean; // 包含智能诊断预警
  includeRemedyPlans?: boolean; // 包含分级化解方案
  remedyLevel?: RemedyLevel; // 化解方案级别（basic/standard/advanced/master/ultimate）
  maxRemedyBudget?: number; // 化解方案最大预算

  // 环境信息（用于零正理论）
  environmentInfo?: {
    waterPositions?: PalaceIndex[];
    mountainPositions?: PalaceIndex[];
    description?: string;
  };

  // 时间相关
  targetYear?: number; // 目标年份（用于流年分析）
  targetMonth?: number; // 目标月份
  eventType?: 'moving' | 'renovation' | 'business' | 'marriage' | 'investment';

  // 配置选项
  config?: {
    applyTiGua?: boolean;
    applyFanGua?: boolean;
    evaluationProfile?: 'standard' | 'conservative' | 'aggressive';
    prioritizeStability?: boolean;
  };
}

// 综合分析结果
export interface ComprehensiveAnalysisResult {
  // 基础飞星分析
  basicAnalysis: GenerateFlyingStarOutput;

  // 增强版飞星数据
  enhancedPlate: EnhancedPlate;

  // 流年分析
  liunianAnalysis?: {
    overlayAnalysis: any;
    yearlyTrends: any;
    seasonalAdjustments: any;
    dayunTransition?: any;
  };

  // 个性化分析
  personalizedAnalysis?: {
    compatibility: any;
    roomRecommendations: any;
    careerEnhancement: any;
    healthAndWellness: any;
    relationshipHarmony: any;
    wealthAndProsperity: any;
  };

  // 智能推荐
  smartRecommendations: {
    all: any[];
    urgent: any[];
    today: any[];
    byCategory: Record<string, any[]>;
  };

  // 替卦分析
  tiguaAnalysis?: {
    applicableRules: any[];
    recommendedRule: any;
    analysis: any;
    personalizedRecommendation: any;
  };

  // 零正理论
  lingzhengAnalysis?: any;

  // 城门诀
  chengmenjueAnalysis?: any;

  // 七星打劫
  qixingdajieAnalysis?: QixingDajieAnalysis;

  // 择吉时间
  timeSelection?: {
    recommendedPeriods: any[];
    avoidPeriods: any[];
    generalGuidelines: string[];
  };

  // P1 新增：诊断预警
  diagnosticReport?: DiagnosticReport;

  // P1 新增：分级化解方案
  remedyPlans?: ComprehensiveRemedyPlan;

  // 综合评分和总结
  overallAssessment: {
    score: number; // 综合评分 0-100
    rating: 'excellent' | 'good' | 'fair' | 'poor';
    strengths: string[]; // 优势
    weaknesses: string[]; // 劣势
    topPriorities: string[]; // 优先处理事项
    longTermPlan: string[]; // 长期规划建议
  };

  // 元数据
  metadata: {
    analyzedAt: Date;
    version: string;
    analysisDepth: 'basic' | 'standard' | 'comprehensive' | 'expert';
    computationTime: number; // 计算耗时（毫秒）
  };
}

/**
 * 综合分析主函数
 */
export async function comprehensiveAnalysis(
  options: ComprehensiveAnalysisOptions
): Promise<ComprehensiveAnalysisResult> {
  const startTime = Date.now();

  // 参数验证
  if (!options) {
    throw new Error('[comprehensive-engine] options is required');
  }
  if (!options.observedAt) {
    throw new Error('[comprehensive-engine] options.observedAt is required');
  }
  if (!options.facing || typeof options.facing.degrees !== 'number') {
    throw new Error(
      '[comprehensive-engine] options.facing.degrees must be a number'
    );
  }

  // 1. 基础飞星分析
  let basicAnalysis;
  try {
    basicAnalysis = generateFlyingStar({
      observedAt: options.observedAt,
      facing: options.facing,
      location: options.location,
      config: options.config,
    });
  } catch (error) {
    throw new Error(
      `[comprehensive-engine] generateFlyingStar failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  // 验证 basicAnalysis 结构
  if (!basicAnalysis) {
    throw new Error('[comprehensive-engine] basicAnalysis is null or undefined');
  }
  if (!basicAnalysis.plates) {
    throw new Error('[comprehensive-engine] basicAnalysis.plates is missing');
  }
  if (!basicAnalysis.plates.period) {
    throw new Error(
      '[comprehensive-engine] basicAnalysis.plates.period is missing'
    );
  }

  const { period, plates, evaluation, geju, wenchangwei, caiwei } =
    basicAnalysis;
  const basePlate = plates.period;

  // 验证 basePlate
  if (!basePlate || !Array.isArray(basePlate)) {
    throw new Error(
      `[comprehensive-engine] Invalid basePlate: ${typeof basePlate}, expected array`
    );
  }
  if (basePlate.length === 0) {
    throw new Error('[comprehensive-engine] basePlate is empty');
  }

  // 提取坐向信息
  const zuo = extractZuo(options.facing.degrees);
  const xiang = extractXiang(options.facing.degrees);

  // 2. 生成增强版飞星数据
  const enhancedPlate = generateEnhancedPlate(basePlate, period, evaluation);

  // 3. 流年分析（如果启用）
  let liunianAnalysis;
  if (options.includeLiunian) {
    const targetYear = options.targetYear || new Date().getFullYear();
    const targetMonth = options.targetMonth;

    const overlayResult = analyzeLiunianOverlay(
      basePlate,
      targetYear,
      targetMonth,
      {
        includeMonthly: !!targetMonth,
        focusOnHealth: options.userProfile?.healthConcerns !== undefined,
        focusOnWealth: options.userProfile?.financialGoals !== undefined,
        focusOnCareer: options.userProfile?.careerGoals !== undefined,
        focusOnRelationship: options.userProfile?.familyStatus !== 'single',
      }
    );

    const dayunTransition = analyzeDayunTransition(
      targetYear,
      basePlate,
      zuo,
      xiang
    );

    liunianAnalysis = {
      overlayAnalysis: overlayResult.overlayAnalysis,
      yearlyTrends: overlayResult.yearlyTrends,
      seasonalAdjustments: overlayResult.seasonalAdjustments,
      dayunTransition,
    };
  }

  // 4. 个性化分析（如果启用）
  let personalizedAnalysis;
  if (options.includePersonalization && options.userProfile) {
    const personalResult = personalizedFlyingStarAnalysis(
      basePlate,
      options.userProfile,
      zuo,
      xiang,
      period
    );

    personalizedAnalysis = {
      compatibility: personalResult.personalCompatibility,
      roomRecommendations: personalResult.roomRecommendations,
      careerEnhancement: personalResult.careerEnhancement,
      healthAndWellness: personalResult.healthAndWellness,
      relationshipHarmony: personalResult.relationshipHarmony,
      wealthAndProsperity: personalResult.wealthAndProsperity,
    };
  }

  // 5. 智能推荐
  const allRecommendations = generateSmartRecommendations(
    basePlate,
    period,
    wenchangwei || '',
    caiwei || ''
  );

  const smartRecommendations = {
    all: allRecommendations,
    urgent: getUrgentRecommendations(allRecommendations),
    today: getTodayRecommendations(allRecommendations),
    byCategory: {
      health: allRecommendations.filter((r) => r.category === 'health'),
      wealth: allRecommendations.filter((r) => r.category === 'wealth'),
      career: allRecommendations.filter((r) => r.category === 'career'),
      relationship: allRecommendations.filter(
        (r) => r.category === 'relationship'
      ),
      study: allRecommendations.filter((r) => r.category === 'study'),
      general: allRecommendations.filter((r) => r.category === 'general'),
    },
  };

  // 6. 替卦分析（如果启用）
  let tiguaAnalysis;
  if (options.includeTiguaAnalysis) {
    const mainCell =
      basePlate.find((cell) => cell.palace === 5) || basePlate[0];
    const mountainStar = mainCell.mountainStar || (1 as FlyingStar);
    const facingStar = mainCell.facingStar || (1 as FlyingStar);

    tiguaAnalysis = intelligentTiguaJudgment(
      zuo,
      xiang,
      period,
      mountainStar,
      facingStar,
      {
        considerPersonalBazi: !!options.userProfile,
        userBirthYear: options.userProfile?.birthYear,
        prioritizeStability: options.config?.prioritizeStability,
      }
    );
  }

  // 7. 零正理论分析（如果启用）
  let lingzhengAnalysis;
  if (options.includeLingzheng) {
    lingzhengAnalysis = analyzeLingzheng(
      basePlate,
      period,
      zuo,
      xiang,
      options.environmentInfo
    );
  }

  // 8. 城门诀分析（如果启用）
  let chengmenjueAnalysis;
  if (options.includeChengmenjue) {
    chengmenjueAnalysis = analyzeChengmenjue(basePlate, period, zuo, xiang);
  }

  // 8.5. 七星打劫分析（如果启用）
  let qixingdajieAnalysis;
  if (options.includeQixingdajie) {
    qixingdajieAnalysis = checkQixingDajiePattern(
      basePlate,
      period,
      zuo,
      xiang
    );
  }

  // 9. 择吉时间（如果启用）
  let timeSelection;
  if (options.includeTimeSelection && options.eventType) {
    const targetYear = options.targetYear || new Date().getFullYear();
    timeSelection = analyzeTimeSelection(
      basePlate,
      targetYear,
      options.eventType
    );
  }

  // 10. P1新增：智能诊断预警（如果启用）
  let diagnosticReport;
  if (options.includeDiagnostics) {
    const enhancedXuankongPlate = plateToEnhancedXuankongPlate(
      basePlate,
      period,
      { zuo, xiang, geju } as any
    );

    diagnosticReport = performDiagnostics(enhancedXuankongPlate, {
      includeMinorIssues: true,
      focusAreas: [
        options.userProfile?.healthConcerns ? 'health' : undefined,
        options.userProfile?.financialGoals ? 'wealth' : undefined,
        options.userProfile?.careerGoals ? 'career' : undefined,
        options.userProfile?.familyStatus !== 'single'
          ? 'relationship'
          : undefined,
      ].filter((a): a is any => a !== undefined),
    });
  }

  // 11. P1新增：分级化解方案（如果启用）
  let remedyPlans;
  if (options.includeRemedyPlans && diagnosticReport) {
    remedyPlans = generateComprehensiveRemedyPlans(
      plateToEnhancedXuankongPlate(basePlate, period, {
        zuo,
        xiang,
        geju,
      } as any),
      diagnosticReport,
      {
        maxBudget: options.maxRemedyBudget,
        preferredLevel: options.remedyLevel || 'standard',
        focusAreas: [
          options.userProfile?.healthConcerns ? 'health' : undefined,
          options.userProfile?.financialGoals ? 'wealth' : undefined,
          options.userProfile?.careerGoals ? 'career' : undefined,
          options.userProfile?.familyStatus !== 'single'
            ? 'relationship'
            : undefined,
        ].filter((a): a is any => a !== undefined),
      }
    );
  }

  // 12. 综合评估（整合所有分析结果）
  const overallAssessment = generateOverallAssessment({
    basicAnalysis,
    enhancedPlate,
    liunianAnalysis,
    personalizedAnalysis,
    smartRecommendations,
    tiguaAnalysis,
    lingzhengAnalysis,
    chengmenjueAnalysis,
    qixingdajieAnalysis,
    timeSelection,
    geju,
    diagnosticReport,
    remedyPlans,
  });

  const computationTime = Date.now() - startTime;

  // 确定分析深度
  let analysisDepth: 'basic' | 'standard' | 'comprehensive' | 'expert' =
    'basic';
  if (
    options.includePersonalization &&
    options.includeLiunian &&
    options.includeTiguaAnalysis
  ) {
    analysisDepth = 'expert';
  } else if (options.includeLiunian && options.includePersonalization) {
    analysisDepth = 'comprehensive';
  } else if (options.includeLiunian || options.includePersonalization) {
    analysisDepth = 'standard';
  }

  return {
    basicAnalysis,
    enhancedPlate,
    liunianAnalysis,
    personalizedAnalysis,
    smartRecommendations,
    tiguaAnalysis,
    lingzhengAnalysis,
    chengmenjueAnalysis,
    qixingdajieAnalysis,
    timeSelection,
    diagnosticReport,
    remedyPlans,
    overallAssessment,
    metadata: {
      analyzedAt: new Date(),
      version: '6.1.0', // 升级到 v6.1 - 添加七星打劫
      analysisDepth,
      computationTime,
    },
  };
}

/**
 * 生成增强版飞星盘
 */
function generateEnhancedPlate(
  basePlate: Plate,
  period: Yun,
  evaluation: Record<PalaceIndex, any>
): EnhancedPlate {
  // 参数验证
  if (!basePlate || !Array.isArray(basePlate)) {
    throw new Error(
      `[generateEnhancedPlate] Invalid basePlate: ${typeof basePlate}`
    );
  }
  if (!evaluation || typeof evaluation !== 'object') {
    throw new Error(
      `[generateEnhancedPlate] Invalid evaluation: ${typeof evaluation}`
    );
  }

  return basePlate.map((cell, index) => {
    // 验证每个 cell
    if (!cell) {
      throw new Error(
        `[generateEnhancedPlate] cell at index ${index} is null or undefined`
      );
    }
    if (typeof cell.palace === 'undefined') {
      throw new Error(
        `[generateEnhancedPlate] cell at index ${index} missing palace property`
      );
    }

    const bagua = PALACE_TO_BAGUA[cell.palace];
    const mountainStarInfo = getStarInterpretation(cell.mountainStar, period);
    const facingStarInfo = getStarInterpretation(cell.facingStar, period);
    const periodStarInfo = cell.periodStar
      ? getStarInterpretation(cell.periodStar, period)
      : undefined;

    // 计算星曜组合分析
    const mountainPower = calculateStarPower(
      cell.mountainStar,
      period,
      cell.palace
    );
    const facingPower = calculateStarPower(
      cell.facingStar,
      period,
      cell.palace
    );

    const combinationScore =
      (mountainPower.totalPower + facingPower.totalPower) / 2;
    let verdict: '大吉' | '吉' | '平' | '凶' | '大凶';
    if (combinationScore >= 8) verdict = '大吉';
    else if (combinationScore >= 6) verdict = '吉';
    else if (combinationScore >= 4) verdict = '平';
    else if (combinationScore >= 2) verdict = '凶';
    else verdict = '大凶';

    const combinationAnalysis = {
      mountainFacing: `山星${cell.mountainStar}（${mountainStarInfo.name}）+ 向星${cell.facingStar}（${facingStarInfo.name}）`,
      verdict,
      confidence: 0.8, // 固定值，可以后期根据实际情况调整
    };

    // 生成房间推荐
    const roomRecommendations = generateRoomRecommendations(
      cell,
      mountainStarInfo,
      facingStarInfo,
      bagua
    );

    return {
      ...cell,
      displayConfig: {
        name: bagua,
        direction: getDirection(bagua),
        element: getElement(bagua),
        color: getColorTheme(bagua),
      },
      evaluation: evaluation[cell.palace],
      mountainStarInfo,
      facingStarInfo,
      periodStarInfo,
      combinationAnalysis,
      roomRecommendations,
    };
  }) as EnhancedPlate;
}

/**
 * 生成综合评估
 */
function generateOverallAssessment(data: any): any {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const topPriorities: string[] = [];
  const longTermPlan: string[] = [];
  let score = 50; // 基础分数

  // 分析基础飞星格局
  if (data.geju) {
    if (data.geju.isFavorable) {
      score += 15;
      strengths.push(`形成${data.geju.types.join('、')}等有利格局`);
    } else {
      score -= 10;
      weaknesses.push(`存在${data.geju.types.join('、')}等不利格局`);
      topPriorities.push('优先化解不利格局');
    }
  }

  // 分析智能推荐
  if (data.smartRecommendations) {
    const urgentCount = data.smartRecommendations.urgent.length;
    if (urgentCount > 0) {
      score -= urgentCount * 2;
      weaknesses.push(`有${urgentCount}项紧急问题需要处理`);
      topPriorities.push('立即处理紧急风水问题');
    }

    const enhancementCount = data.smartRecommendations.all.filter(
      (r: any) => r.type === 'enhancement'
    ).length;
    if (enhancementCount > 0) {
      strengths.push(`有${enhancementCount}个可以增强的方位`);
    }
  }

  // 分析个性化匹配度
  if (data.personalizedAnalysis?.compatibility) {
    const compatScore = data.personalizedAnalysis.compatibility.score;
    score += compatScore;

    if (compatScore >= 8) {
      strengths.push('住宅与个人命卦高度契合');
    } else if (compatScore < 3) {
      weaknesses.push('住宅与个人命卦匹配度较低');
      longTermPlan.push('考虑调整主要活动区域或重新选址');
    }
  }

  // 分析流年运势
  if (data.liunianAnalysis?.yearlyTrends) {
    const trends = data.liunianAnalysis.yearlyTrends;
    if (trends.overallLuck === 'excellent' || trends.overallLuck === 'good') {
      score += 10;
      strengths.push(
        `流年运势${trends.overallLuck === 'excellent' ? '极佳' : '良好'}`
      );
    } else if (trends.overallLuck === 'challenging') {
      score -= 5;
      weaknesses.push('流年运势具有挑战');
      topPriorities.push('加强流年化解措施');
    }
  }

  // 分析替卦建议
  if (data.tiguaAnalysis?.recommendedRule) {
    longTermPlan.push('考虑采用替卦方法优化格局');
  }

  // 分析零正理论
  if (data.lingzhengAnalysis?.isZeroPositiveReversed) {
    score -= 15;
    weaknesses.push('存在零正颠倒现象');
    topPriorities.push('调整水山位置，修正零正颠倒');
  }

  // 分析城门诀
  if (data.chengmenjueAnalysis?.hasChengmen) {
    score += 5;
    strengths.push('具备城门诀催旺条件');
    longTermPlan.push('利用城门诀催旺财丁运');
  }

  // 分析七星打劫
  if (data.qixingdajieAnalysis?.isQixingDajie) {
    const dajie = data.qixingdajieAnalysis;
    
    // 根据有效性等级计分
    const effectivenessScores: Record<string, number> = {
      peak: 20,
      high: 15,
      medium: 10,
      low: 5,
    };
    score += effectivenessScores[dajie.effectiveness] || 0;
    
    // 根据打劫类型进一步计分
    if (dajie.dajieType === 'full') {
      score += 10;
      strengths.push('形成七星打劫全劫格局（同时劫财劫丁）');
    } else if (dajie.dajieType === 'jie_cai') {
      score += 5;
      strengths.push('形成七星打劫劫财格局');
    } else if (dajie.dajieType === 'jie_ding') {
      score += 5;
      strengths.push('形成七星打劫劫丁格局');
    }
    
    // 根据评分等级添加建议
    if (dajie.effectiveness === 'peak' || dajie.effectiveness === 'high') {
      topPriorities.push('优先利用七星打劫格局催旺');
      longTermPlan.push('在打劫位布置动水或增加活动频率');
    } else {
      longTermPlan.push('七星打劫格局存在但效果较弱，谨慎应用');
    }
  }

  // P1新增：分析诊断预警
  if (data.diagnosticReport) {
    const report = data.diagnosticReport;

    // 整合诊断分数
    const diagnosticScore = report.overall.score;
    score = (score + diagnosticScore) / 2; // 取平均

    // 整合危险级预警
    if (report.statistics.criticalCount > 0) {
      score -= report.statistics.criticalCount * 5;
      weaknesses.push(`发现${report.statistics.criticalCount}个危险级风水问题`);
      topPriorities.push(...report.priorityActions.now.slice(0, 3));
    }

    // 整合警告级预警
    if (report.statistics.warningCount > 0) {
      weaknesses.push(`存在${report.statistics.warningCount}个警告级问题`);
      topPriorities.push(...report.priorityActions.thisWeek.slice(0, 2));
    }

    // 整合优势
    if (report.alerts.excellent.length > 0) {
      strengths.push(`有${report.alerts.excellent.length}个优秀方位可利用`);
    }
    if (report.alerts.good.length > 0) {
      strengths.push(`有${report.alerts.good.length}个良好方位`);
    }

    // 整合长期规划
    longTermPlan.push(...report.priorityActions.longTerm.slice(0, 2));
  }

  // P1新增：分析化解方案
  if (data.remedyPlans) {
    const plans = data.remedyPlans;

    if (plans.overall.priority === 'immediate') {
      topPriorities.unshift('立即启动紧急化解方案');
    }

    // 添加预算建议
    const budget = plans.overall.totalBudget;
    longTermPlan.push(
      `建议化解预算：${budget.min}-${budget.max}元（可分阶段实施）`
    );

    // 添加专家建议
    longTermPlan.push(...plans.expertAdvice.slice(0, 2));
  }

  // 确定评级
  let rating: 'excellent' | 'good' | 'fair' | 'poor';
  if (score >= 80) rating = 'excellent';
  else if (score >= 60) rating = 'good';
  else if (score >= 40) rating = 'fair';
  else rating = 'poor';

  // 确保有基本建议
  if (topPriorities.length === 0) {
    topPriorities.push('保持现有布局，定期检查和维护');
  }

  if (longTermPlan.length === 0) {
    longTermPlan.push('持续关注流年变化，适时调整');
    longTermPlan.push('每年进行一次全面风水检查');
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    rating,
    strengths,
    weaknesses,
    topPriorities: topPriorities.slice(0, 5),
    longTermPlan: longTermPlan.slice(0, 5),
  };
}

/**
 * 辅助函数：提取坐山
 */
function extractZuo(degrees: number): Mountain {
  // 简化实现，实际需要更精确的计算
  const mountainMap: Record<number, Mountain> = {
    0: '子',
    15: '丑',
    30: '寅',
    45: '卯',
    60: '辰',
    75: '巳',
    90: '午',
    105: '未',
    120: '申',
    135: '酉',
    150: '戌',
    165: '亥',
  };

  const normalizedDegrees = (degrees + 180) % 360;
  const closest = Object.keys(mountainMap)
    .map(Number)
    .reduce((prev, curr) =>
      Math.abs(curr - normalizedDegrees) < Math.abs(prev - normalizedDegrees)
        ? curr
        : prev
    );

  return mountainMap[closest] || '子';
}

/**
 * 辅助函数：提取向山
 */
function extractXiang(degrees: number): Mountain {
  const mountainMap: Record<number, Mountain> = {
    0: '子',
    15: '丑',
    30: '寅',
    45: '卯',
    60: '辰',
    75: '巳',
    90: '午',
    105: '未',
    120: '申',
    135: '酉',
    150: '戌',
    165: '亥',
  };

  const normalizedDegrees = degrees % 360;
  const closest = Object.keys(mountainMap)
    .map(Number)
    .reduce((prev, curr) =>
      Math.abs(curr - normalizedDegrees) < Math.abs(prev - normalizedDegrees)
        ? curr
        : prev
    );

  return mountainMap[closest] || '午';
}

/**
 * 辅助函数：生成房间推荐
 */
function generateRoomRecommendations(
  cell: any,
  mountainStarInfo: any,
  facingStarInfo: any,
  bagua: string
): any {
  const suitable: string[] = [];
  const unsuitable: string[] = [];
  const enhancements: string[] = [];

  // 基于飞星组合推荐
  const totalScore =
    (mountainStarInfo.basePower || 5) + (facingStarInfo.basePower || 5);

  if (totalScore >= 14) {
    suitable.push('主卧室', '书房', '客厅', '办公室');
    enhancements.push('此方位能量充沛，适合长时间活动');
  } else if (totalScore >= 10) {
    suitable.push('次卧室', '餐厅', '会客区');
    enhancements.push('此方位能量平稳，适合日常活动');
  } else if (totalScore < 6) {
    unsuitable.push('主卧室', '书房', '长时间工作区');
    suitable.push('储物间', '卫生间', '走廊');
    enhancements.push('此方位能量较弱，建议短暂停留或作为辅助空间');
  }

  // 基于八卦方位特性推荐
  const baguaRecommendations: Record<
    string,
    { suitable: string[]; unsuitable: string[]; enhancements: string[] }
  > = {
    坎: {
      suitable: ['浴室', '水景区'],
      unsuitable: ['厨房'],
      enhancements: ['适合放置水元素装饰'],
    },
    坤: {
      suitable: ['主卧', '休息区'],
      unsuitable: ['健身房'],
      enhancements: ['适合放置土元素装饰'],
    },
    震: {
      suitable: ['书房', '活动室'],
      unsuitable: ['安静休息区'],
      enhancements: ['适合放置木元素装饰'],
    },
    巽: {
      suitable: ['学习区', '会客厅'],
      unsuitable: ['储藏室'],
      enhancements: ['保持通风和采光'],
    },
    中: {
      suitable: ['客厅', '餐厅'],
      unsuitable: ['卧室'],
      enhancements: ['保持中心区域整洁'],
    },
    乾: {
      suitable: ['父亲房', '办公室'],
      unsuitable: ['儿童房'],
      enhancements: ['适合放置金元素装饰'],
    },
    兑: {
      suitable: ['交际区', '娱乐室'],
      unsuitable: ['安静工作区'],
      enhancements: ['适合放置金元素装饰'],
    },
    艮: {
      suitable: ['冥想室', '储物间'],
      unsuitable: ['活动频繁区'],
      enhancements: ['保持稳定和整洁'],
    },
    离: {
      suitable: ['客厅', '展示区'],
      unsuitable: ['水景区'],
      enhancements: ['适合放置火元素装饰'],
    },
  };

  const baguaRec = baguaRecommendations[bagua];
  if (baguaRec) {
    suitable.push(...baguaRec.suitable);
    unsuitable.push(...baguaRec.unsuitable);
    enhancements.push(...baguaRec.enhancements);
  }

  return {
    suitable: [...new Set(suitable)],
    unsuitable: [...new Set(unsuitable)],
    enhancements: [...new Set(enhancements)],
  };
}

/**
 * 辅助函数：获取方位
 */
function getDirection(bagua: string): string {
  const directionMap: Record<string, string> = {
    坎: '北',
    坤: '西南',
    震: '东',
    巽: '东南',
    中: '中',
    乾: '西北',
    兑: '西',
    艮: '东北',
    离: '南',
  };
  return directionMap[bagua] || '';
}

/**
 * 辅助函数：获取五行
 */
function getElement(bagua: string): string {
  const elementMap: Record<string, string> = {
    坎: '水',
    坤: '土',
    震: '木',
    巽: '木',
    中: '土',
    乾: '金',
    兑: '金',
    艮: '土',
    离: '火',
  };
  return elementMap[bagua] || '';
}

/**
 * 辅助函数：获取颜色主题
 */
function getColorTheme(bagua: string): string {
  const colorMap: Record<string, string> = {
    坎: '#1a73e8',
    坤: '#f9ab00',
    震: '#34a853',
    巽: '#0f9d58',
    中: '#ffca28',
    乾: '#ea4335',
    兑: '#ea4335',
    艮: '#fbbc04',
    离: '#ea4335',
  };
  return colorMap[bagua] || '#757575';
}

// 别名导出，兼容旧名称
export const runComprehensiveAnalysis = comprehensiveAnalysis;

export default {
  comprehensiveAnalysis,
  generateEnhancedPlate,
  generateOverallAssessment,
};
