import { Mountain, FlyingStar, Yun, PalaceIndex } from './types';
import { getPalaceByMountain, MOUNTAIN_TO_BAGUA } from './luoshu';

/**
 * 替卦理论实现
 * 
 * 替卦是玄空飞星中处理特殊坐向的重要理论
 * 当某些特定的山向组合出现时，需要用替卦来调整飞星排盘
 * 主要适用于五运和某些特殊的山向组合
 */

// 替卦规则表：定义哪些山向组合需要使用替卦
export interface TiguaRule {
  zuo: Mountain;
  xiang: Mountain;
  period: Yun[];  // 适用的运
  replacementZuo: Mountain;  // 替代坐山
  replacementXiang: Mountain;  // 替代向山
  description: string;
  category: '正替' | '旁替';
}

// 完整的替卦规则表
export const TIGUA_RULES: TiguaRule[] = [
  // 五运的正替卦规则
  {
    zuo: '子', xiang: '午', period: [5], 
    replacementZuo: '壬', replacementXiang: '丙',
    description: '子山午向五运用壬山丙向替',
    category: '正替'
  },
  {
    zuo: '午', xiang: '子', period: [5],
    replacementZuo: '丙', replacementXiang: '壬', 
    description: '午山子向五运用丙山壬向替',
    category: '正替'
  },
  {
    zuo: '卯', xiang: '酉', period: [5],
    replacementZuo: '乙', replacementXiang: '辛',
    description: '卯山酉向五运用乙山辛向替', 
    category: '正替'
  },
  {
    zuo: '酉', xiang: '卯', period: [5],
    replacementZuo: '辛', replacementXiang: '乙',
    description: '酉山卯向五运用辛山乙向替',
    category: '正替'
  },
  
  // 乾巽替卦（特殊情况）
  {
    zuo: '乾', xiang: '巽', period: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    replacementZuo: '亥', replacementXiang: '巳',
    description: '乾山巽向用亥山巳向替',
    category: '正替'
  },
  {
    zuo: '巽', xiang: '乾', period: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    replacementZuo: '巳', replacementXiang: '亥', 
    description: '巽山乾向用巳山亥向替',
    category: '正替'
  },
  
  // 艮坤替卦
  {
    zuo: '艮', xiang: '坤', period: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    replacementZuo: '寅', replacementXiang: '申',
    description: '艮山坤向用寅山申向替',
    category: '正替'
  },
  {
    zuo: '坤', xiang: '艮', period: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    replacementZuo: '申', replacementXiang: '寅',
    description: '坤山艮向用申山寅向替',
    category: '正替'
  },

  // 旁替卦规则（兼向时的替卦）
  {
    zuo: '戌', xiang: '辰', period: [5],
    replacementZuo: '乾', replacementXiang: '巽',
    description: '戌山辰向五运旁替用乾山巽向',
    category: '旁替'
  },
  {
    zuo: '辰', xiang: '戌', period: [5],
    replacementZuo: '巽', replacementXiang: '乾',
    description: '辰山戌向五运旁替用巽山乾向', 
    category: '旁替'
  }
];

// 替卦判断：检查给定的山向是否需要替卦
export function checkTiguaRequired(
  zuo: Mountain, 
  xiang: Mountain, 
  period: Yun,
  isJian: boolean = false
): TiguaRule | null {
  // 查找匹配的替卦规则
  const matchingRule = TIGUA_RULES.find(rule => 
    rule.zuo === zuo && 
    rule.xiang === xiang && 
    rule.period.includes(period)
  );
  
  if (matchingRule) {
    // 如果是兼向，优先考虑旁替
    if (isJian && matchingRule.category === '旁替') {
      return matchingRule;
    }
    // 正常情况使用正替
    if (!isJian && matchingRule.category === '正替') {
      return matchingRule;
    }
  }
  
  return null;
}

// 替卦后的飞星调整
export function applyTiguaAdjustment(
  originalStar: FlyingStar,
  zuo: Mountain,
  xiang: Mountain, 
  period: Yun,
  isJian: boolean = false
): FlyingStar {
  const tiguaRule = checkTiguaRequired(zuo, xiang, period, isJian);
  
  if (!tiguaRule) {
    return originalStar;
  }
  
  // 根据替卦规则调整飞星
  const originalZuoPalace = getPalaceByMountain(zuo);
  const replacementZuoPalace = getPalaceByMountain(tiguaRule.replacementZuo);
  
  // 计算宫位差值来调整飞星
  const palaceDiff = replacementZuoPalace - originalZuoPalace;
  let adjustedStar = originalStar + palaceDiff;
  
  // 确保飞星在1-9范围内
  while (adjustedStar < 1) adjustedStar += 9;
  while (adjustedStar > 9) adjustedStar -= 9;
  
  return adjustedStar as FlyingStar;
}

// 反伏吟替卦的特殊判断
export function checkFanfuyinTigua(
  zuo: Mountain,
  xiang: Mountain,
  period: Yun,
  mountainStar: FlyingStar,
  facingStar: FlyingStar
): {
  isFanfuyinTigua: boolean;
  description: string;
  severity: 'high' | 'medium' | 'low';
} {
  const tiguaRule = checkTiguaRequired(zuo, xiang, period);
  
  if (!tiguaRule) {
    return {
      isFanfuyinTigua: false,
      description: '非替卦格局',
      severity: 'low'
    };
  }
  
  // 检查是否出现反伏吟现象
  const isFuyin = mountainStar === period || facingStar === period;
  const isFanyin = (mountainStar + period === 10) || (facingStar + period === 10);
  
  if (isFuyin || isFanyin) {
    let severity: 'high' | 'medium' | 'low' = 'medium';
    let description = '替卦出现反伏吟';
    
    if (isFuyin && isFanyin) {
      severity = 'high';
      description = '替卦出现严重反伏吟，山向两星均受影响';
    } else if (isFuyin) {
      description = '替卦出现伏吟，需要特别化解';
    } else if (isFanyin) {
      description = '替卦出现反吟，主动荡不安';
    }
    
    return {
      isFanfuyinTigua: true,
      description,
      severity
    };
  }
  
  return {
    isFanfuyinTigua: false,
    description: '替卦格局正常',
    severity: 'low'
  };
}

// 替卦对格局的影响分析
export function analyzeTiguaImpact(
  zuo: Mountain,
  xiang: Mountain,
  period: Yun,
  mountainStar: FlyingStar,
  facingStar: FlyingStar,
  isJian: boolean = false
): {
  hasTigua: boolean;
  rule?: TiguaRule;
  impact: {
    originalPattern: string;
    adjustedPattern: string;
    isImproved: boolean;
    recommendations: string[];
  };
  fanfuyinAnalysis: ReturnType<typeof checkFanfuyinTigua>;
} {
  const tiguaRule = checkTiguaRequired(zuo, xiang, period, isJian);
  const fanfuyinAnalysis = checkFanfuyinTigua(zuo, xiang, period, mountainStar, facingStar);
  
  if (!tiguaRule) {
    return {
      hasTigua: false,
      impact: {
        originalPattern: '无替卦',
        adjustedPattern: '保持原格局',
        isImproved: false,
        recommendations: []
      },
      fanfuyinAnalysis
    };
  }
  
  // 分析替卦前后的格局变化
  const originalMountainStar = mountainStar;
  const originalFacingStar = facingStar;
  
  const adjustedMountainStar = applyTiguaAdjustment(mountainStar, zuo, xiang, period, isJian);
  const adjustedFacingStar = applyTiguaAdjustment(facingStar, zuo, xiang, period, isJian);
  
  // 判断替卦是否改善了格局
  const originalScore = calculatePatternScore(originalMountainStar, originalFacingStar, period);
  const adjustedScore = calculatePatternScore(adjustedMountainStar, adjustedFacingStar, period);
  
  const recommendations: string[] = [];
  
  if (fanfuyinAnalysis.isFanfuyinTigua) {
    recommendations.push('替卦出现反伏吟，建议使用化解物品');
    if (fanfuyinAnalysis.severity === 'high') {
      recommendations.push('情况严重，建议重新选择坐向');
    }
  }
  
  if (adjustedScore > originalScore) {
    recommendations.push('替卦改善了格局，可按替卦布置');
  } else if (adjustedScore < originalScore) {
    recommendations.push('替卦不如原格局，需谨慎处理');
  }
  
  return {
    hasTigua: true,
    rule: tiguaRule,
    impact: {
      originalPattern: `山${originalMountainStar}向${originalFacingStar}`,
      adjustedPattern: `山${adjustedMountainStar}向${adjustedFacingStar}`,
      isImproved: adjustedScore > originalScore,
      recommendations
    },
    fanfuyinAnalysis
  };
}

// 计算格局评分的辅助函数
function calculatePatternScore(mountainStar: FlyingStar, facingStar: FlyingStar, period: Yun): number {
  let score = 0;
  
  // 旺星得分最高
  if (mountainStar === period) score += 3;
  if (facingStar === period) score += 3;
  
  // 生气星次之
  const nextStar = (period % 9) + 1 as FlyingStar;
  if (mountainStar === nextStar) score += 2;
  if (facingStar === nextStar) score += 2;
  
  // 退气星有分但较低
  const prevStar = ((period - 2 + 9) % 9) + 1 as FlyingStar;
  if (mountainStar === prevStar) score += 1;
  if (facingStar === prevStar) score += 1;
  
  // 煞星和死星扣分
  const shaStar = ((period + 1) % 9) + 1 as FlyingStar;
  const siStar = ((period + 2) % 9) + 1 as FlyingStar;
  
  if (mountainStar === shaStar || mountainStar === siStar) score -= 2;
  if (facingStar === shaStar || facingStar === siStar) score -= 2;
  
  // 五黄星特殊处理
  if (mountainStar === 5) score -= 3;
  if (facingStar === 5) score -= 3;
  
  return score;
}

// 替卦吉凶评判标准
export function evaluateTiguaPattern(
  zuo: Mountain,
  xiang: Mountain,
  period: Yun,
  mountainStar: FlyingStar,
  facingStar: FlyingStar,
  isJian: boolean = false
): {
  rating: 'excellent' | 'good' | 'fair' | 'poor' | 'dangerous';
  score: number;
  explanation: string;
  remedyAdvice: string[];
} {
  const tiguaAnalysis = analyzeTiguaImpact(zuo, xiang, period, mountainStar, facingStar, isJian);
  
  let baseScore = calculatePatternScore(mountainStar, facingStar, period);
  
  if (tiguaAnalysis.hasTigua) {
    const adjustedMountainStar = applyTiguaAdjustment(mountainStar, zuo, xiang, period, isJian);
    const adjustedFacingStar = applyTiguaAdjustment(facingStar, zuo, xiang, period, isJian);
    baseScore = calculatePatternScore(adjustedMountainStar, adjustedFacingStar, period);
  }
  
  // 反伏吟的影响
  if (tiguaAnalysis.fanfuyinAnalysis.isFanfuyinTigua) {
    switch (tiguaAnalysis.fanfuyinAnalysis.severity) {
      case 'high':
        baseScore -= 6;
        break;
      case 'medium':
        baseScore -= 3;
        break;
      case 'low':
        baseScore -= 1;
        break;
    }
  }
  
  // 根据得分确定评级
  let rating: 'excellent' | 'good' | 'fair' | 'poor' | 'dangerous';
  let explanation: string;
  const remedyAdvice: string[] = [];
  
  if (baseScore >= 5) {
    rating = 'excellent';
    explanation = '替卦格局优秀，飞星配置理想';
  } else if (baseScore >= 3) {
    rating = 'good'; 
    explanation = '替卦格局良好，整体有利';
  } else if (baseScore >= 0) {
    rating = 'fair';
    explanation = '替卦格局一般，需要适当调整';
    remedyAdvice.push('建议在旺位摆放催旺物品');
  } else if (baseScore >= -3) {
    rating = 'poor';
    explanation = '替卦格局不佳，需要化解';
    remedyAdvice.push('在煞位放置化解物品', '调整室内布局避免直冲');
  } else {
    rating = 'dangerous';
    explanation = '替卦格局凶险，强烈建议重新选择坐向';
    remedyAdvice.push('考虑改变坐向', '请风水师实地勘察', '暂缓重大决策');
  }
  
  // 添加替卦特有的建议
  if (tiguaAnalysis.hasTigua) {
    remedyAdvice.push(`按${tiguaAnalysis.rule?.description}进行布置`);
    remedyAdvice.push(...tiguaAnalysis.impact.recommendations);
  }
  
  return {
    rating,
    score: baseScore,
    explanation,
    remedyAdvice
  };
}

// 获取所有适用的替卦规则（用于分析和展示）
export function getApplicableTiguaRules(period: Yun): TiguaRule[] {
  return TIGUA_RULES.filter(rule => rule.period.includes(period));
}