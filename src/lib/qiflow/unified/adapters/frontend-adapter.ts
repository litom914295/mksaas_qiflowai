/**
 * 前端适配器
 *
 * 将 UnifiedAnalysisOutput 转换为前端组件期望的格式
 * 确保与现有 UI 组件（如 ComprehensiveAnalysisPanel）的兼容性
 *
 * @author QiFlow AI Team
 * @version 1.0.0
 */

import type { ComprehensiveAnalysisResult } from '../../xuankong/comprehensive-engine';
import type { UnifiedAnalysisOutput } from '../types';

/**
 * 将 unified 输出适配为前端组件格式
 *
 * @param unifiedOutput - unified 系统的输出
 * @returns 前端组件期望的 ComprehensiveAnalysisResult 格式
 */
export function adaptToFrontend(
  unifiedOutput: UnifiedAnalysisOutput
): ComprehensiveAnalysisResult {
  // 提取基础分析数据
  const {
    xuankong,
    personalized,
    scoring,
    warnings,
    keyPositions,
    roomAdvice,
    monthlyForecast,
    actionPlan,
    assessment,
    metadata,
  } = unifiedOutput;

  // 调试日志：检查 plate 类型
  console.log('[adaptToFrontend] xuankong.plate 类型:', {
    isArray: Array.isArray(xuankong.plate),
    type: typeof xuankong.plate,
    keys: xuankong.plate ? Object.keys(xuankong.plate) : [],
  });

  // 构建基础分析结果
  // 确保 plate是数组格式
  let plateArray: any[];
  if (Array.isArray(xuankong.plate)) {
    plateArray = xuankong.plate;
  } else if (xuankong.plate && typeof xuankong.plate === 'object') {
    // 如果是对象，尝试转换为数组
    plateArray = Object.values(xuankong.plate);
  } else {
    // 如果都不是，返回空数组
    console.warn('[adaptToFrontend] xuankong.plate 不是有效格式，使用空数组');
    plateArray = [];
  }

  console.log('[adaptToFrontend] 转换后的 plateArray:', {
    length: plateArray.length,
    first: plateArray[0],
  });

  const basicAnalysis = {
    period: xuankong.period,
    facingDirection: xuankong.facing,
    plates: {
      period: plateArray,
      liunian: plateArray, // 流年盘可能在别处
    },
    evaluation: xuankong.evaluation,
    geju: xuankong.geju,
    // 继承其他必要字段
    wenchangwei: [] as any[], // 从 keyPositions 中提取
    caiwei: [] as any[], // 从 keyPositions 中提取
  };

  // 从 keyPositions 提取文昌位和财位
  if (keyPositions) {
    basicAnalysis.wenchangwei = keyPositions
      .filter((kp) => kp.type === 'study')
      .map((kp) => ({
        palace: kp.palace,
        direction: kp.direction,
        description: kp.description,
        advice: kp.advice,
      }));

    basicAnalysis.caiwei = keyPositions
      .filter((kp) => kp.type === 'wealth')
      .map((kp) => ({
        palace: kp.palace,
        direction: kp.direction,
        description: kp.description,
        advice: kp.advice,
      }));
  }

  // 构建增强版飞星数据
  // 如果plate是对象,转换为数组
  let enhancedPlate = Array.isArray(xuankong.plate)
    ? xuankong.plate
    : Object.values(xuankong.plate || {});

  // 确保每个 cell 都有所有必需字段
  enhancedPlate = enhancedPlate.map((cell: any) => {
    // 宫位配置映射
    const palaceConfigMap: Record<number, any> = {
      1: { name: '坎', direction: '北', element: '水', color: 'blue' },
      2: { name: '坤', direction: '西南', element: '土', color: 'yellow' },
      3: { name: '震', direction: '东', element: '木', color: 'green' },
      4: { name: '巽', direction: '东南', element: '木', color: 'green' },
      5: { name: '中', direction: '中央', element: '土', color: 'yellow' },
      6: { name: '乾', direction: '西北', element: '金', color: 'white' },
      7: { name: '兑', direction: '西', element: '金', color: 'white' },
      8: { name: '艮', direction: '东北', element: '土', color: 'yellow' },
      9: { name: '离', direction: '南', element: '火', color: 'red' },
    };

    // 星曜信息默认值
    const getDefaultStarInfo = (star: number) => ({
      number: star,
      name: `${star}星`,
      alias: `${star}`,
      wuxing: '未知',
      jixiong: '吉' as const,
      status: '旺' as const,
      meaning: {
        wang: '旺时吉利',
        shuai: '衰时不利',
      },
    });

    return {
      ...cell,
      // 确保有 displayConfig
      displayConfig: cell.displayConfig ||
        palaceConfigMap[cell.palace] || {
          name: '未知',
          direction: '未知',
          element: '未知',
          color: 'gray',
        },
      // 确保有 evaluation
      evaluation: cell.evaluation || {
        score: 50,
        tags: [],
        reasons: [],
      },
      // 确保有 combinationAnalysis
      combinationAnalysis: cell.combinationAnalysis || {
        mountainFacing: `${cell.mountainStar || '?'}-${cell.facingStar || '?'}`,
        verdict: '平' as const,
        confidence: 0.5,
      },
      // 确保有星曜信息
      mountainStarInfo:
        cell.mountainStarInfo || getDefaultStarInfo(cell.mountainStar),
      facingStarInfo:
        cell.facingStarInfo || getDefaultStarInfo(cell.facingStar),
      periodStarInfo: cell.periodStar
        ? cell.periodStarInfo || getDefaultStarInfo(cell.periodStar)
        : undefined,
    };
  });

  // 添加其他属性
  if (Array.isArray(enhancedPlate)) {
    (enhancedPlate as any).starPowers = {};
    (enhancedPlate as any).keyPositions = keyPositions || [];
  }

  // 构建智能推荐（整合评分和预警）
  const smartRecommendations = {
    all: actionPlan || [],
    urgent: actionPlan?.filter((item) => item.category === 'urgent') || [],
    today: actionPlan?.filter((item) => item.priority <= 2) || [],
    byCategory: groupByCategory(actionPlan || []),
  };

  // 构建综合评估
  const overallAssessment = {
    score: assessment.overallScore,
    rating: assessment.rating as 'excellent' | 'good' | 'fair' | 'poor',
    strengths: assessment.strengths,
    weaknesses: assessment.weaknesses,
    topPriorities: assessment.topPriorities,
    longTermPlan: assessment.longTermPlan,
  };

  // 构建个性化分析
  const personalizedAnalysis = personalized
    ? {
        compatibility: personalized.compatibility,
        roomRecommendations: personalized.roomRecommendations,
        careerEnhancement: personalized.careerEnhancement,
        healthAndWellness: personalized.healthAndWellness,
        relationshipHarmony: personalized.relationshipHarmony,
        wealthAndProsperity: personalized.wealthAndProsperity,
      }
    : undefined;

  // 从 geju 中提取替卦、零正和城门诀分析
  const tiguaAnalysis = xuankong.geju?.tiguaAnalysis;
  const lingzhengAnalysis = xuankong.geju?.lingzhengAnalysis;
  const chengmenjueAnalysis = xuankong.geju?.chengmenjueAnalysis;

  // 调试日志：检查分析数据
  console.log('[adaptToFrontend] 分析数据检查:', {
    hasPersonalized: !!personalized,
    hasMonthlyForecast: !!monthlyForecast,
    hasTiguaAnalysis: !!tiguaAnalysis,
    hasLingzhengAnalysis: !!lingzhengAnalysis,
    hasChengmenjueAnalysis: !!chengmenjueAnalysis,
    personalized,
    monthlyForecast,
    tiguaAnalysis,
    lingzhengAnalysis,
    chengmenjueAnalysis,
  });

  // 返回适配后的结果
  const result = {
    basicAnalysis,
    enhancedPlate,
    liunianAnalysis: monthlyForecast
      ? {
          overlayAnalysis: monthlyForecast,
          yearlyTrends: monthlyForecast,
          seasonalAdjustments: [],
        }
      : undefined,
    personalizedAnalysis,
    smartRecommendations,
    tiguaAnalysis,
    lingzhengAnalysis,
    chengmenjueAnalysis,
    timeSelection: undefined, // 暂时未实现
    overallAssessment,
    metadata: {
      analyzedAt: metadata.analyzedAt,
      version: metadata.version,
      analysisDepth: metadata.depth as
        | 'basic'
        | 'standard'
        | 'comprehensive'
        | 'expert',
      computationTime: metadata.computationTime,
    },
  };

  console.log('[adaptToFrontend] 最终返回结果:', {
    hasLiunianAnalysis: !!result.liunianAnalysis,
    hasPersonalizedAnalysis: !!result.personalizedAnalysis,
    hasTiguaAnalysis: !!result.tiguaAnalysis,
    hasLingzhengAnalysis: !!result.lingzhengAnalysis,
    hasChengmenjueAnalysis: !!result.chengmenjueAnalysis,
  });

  return result as any;
}

/**
 * 按类别分组行动计划
 */
function groupByCategory(items: any[]): Record<string, any[]> {
  const grouped: Record<string, any[]> = {
    urgent: [],
    important: [],
    beneficial: [],
    optional: [],
  };

  items.forEach((item) => {
    if (grouped[item.category]) {
      grouped[item.category].push(item);
    }
  });

  return grouped;
}

/**
 * 适配评分结果为前端可读格式
 */
export function adaptScoringToDisplay(scoring: any) {
  if (!scoring) return null;

  return {
    overall: scoring.overall,
    level: scoring.level,
    dimensions: scoring.dimensions.map((dim: any) => ({
      name: dim.name,
      score: dim.score,
      weight: dim.weight,
      status: getScoreStatus(dim.score),
      details: {
        reasons: dim.reasons,
        suggestions: dim.suggestions,
      },
    })),
    summary: scoring.summary,
  };
}

/**
 * 适配预警结果为前端可读格式
 */
export function adaptWarningsToDisplay(warnings: any) {
  if (!warnings) return null;

  return {
    total: warnings.warnings.length,
    urgent: warnings.urgentCount,
    critical: warnings.criticalCount,
    items: warnings.warnings.map((warning: any) => ({
      id: warning.id,
      severity: warning.severity,
      urgency: warning.urgency,
      title: warning.title,
      description: warning.description,
      location: warning.location,
      impact: warning.impact,
      consequences: warning.consequences,
      recommendations: warning.recommendations,
      icon: getWarningIcon(warning.severity),
      color: getWarningColor(warning.severity),
    })),
    summary: warnings.summary,
  };
}

/**
 * 获取评分状态
 */
function getScoreStatus(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'fair';
  return 'poor';
}

/**
 * 获取预警图标
 */
function getWarningIcon(severity: string): string {
  const icons: Record<string, string> = {
    critical: '🚨',
    high: '⚠️',
    medium: '⚡',
    low: 'ℹ️',
    info: '💡',
  };
  return icons[severity] || 'ℹ️';
}

/**
 * 获取预警颜色
 */
function getWarningColor(severity: string): string {
  const colors: Record<string, string> = {
    critical: 'red',
    high: 'orange',
    medium: 'yellow',
    low: 'blue',
    info: 'gray',
  };
  return colors[severity] || 'gray';
}
