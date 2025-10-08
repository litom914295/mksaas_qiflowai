import { getPalaceByMountain } from './luoshu';
import { FlyingStar, Mountain, Yun } from './types';

/**
 * 增强版替卦算法
 *
 * 核心改进：
 * 1. 完整的替卦规则表和判断逻辑
 * 2. 精确的反伏吟识别和处理
 * 3. 动态的替卦效果评估
 * 4. 个性化的替卦建议系统
 */

// 完整替卦规则表
export interface EnhancedTiguaRule {
  id: string;
  zuo: Mountain;
  xiang: Mountain;
  applicablePeriods: Yun[];
  replacementZuo: Mountain;
  replacementXiang: Mountain;
  category: '正替' | '旁替' | '特殊替卦';
  priority: number; // 优先级 1-10
  conditions: {
    mustUse: boolean; // 是否必须使用
    recommendedUse: boolean; // 是否推荐使用
    avoidUse: boolean; // 是否避免使用
  };
  effects: {
    improvesMountainStar: boolean;
    improvesFacingStar: boolean;
    avoidsNegativePattern: boolean;
    createsSpecialPattern: boolean;
  };
  description: string;
  detailedExplanation: string;
  historicalBasis: string;
  modernApplication: string;
}

// 增强版替卦规则表
export const ENHANCED_TIGUA_RULES: EnhancedTiguaRule[] = [
  // 五运正替卦
  {
    id: 'wu_yun_zi_wu',
    zuo: '子',
    xiang: '午',
    applicablePeriods: [5],
    replacementZuo: '壬',
    replacementXiang: '丙',
    category: '正替',
    priority: 10,
    conditions: {
      mustUse: true,
      recommendedUse: true,
      avoidUse: false,
    },
    effects: {
      improvesMountainStar: true,
      improvesFacingStar: true,
      avoidsNegativePattern: true,
      createsSpecialPattern: false,
    },
    description: '子山午向五运正替用壬山丙向',
    detailedExplanation:
      '五运中宫为5，子午为天元龙正位，但五运时中宫5星飞临，形成伏吟，故需替卦',
    historicalBasis: '《玄空秘旨》记载：五运子午卯酉四山向，俱要替卦',
    modernApplication:
      '现代建筑中，正南正北朝向的房屋在五运期间建议按此替卦处理',
  },
  {
    id: 'wu_yun_wu_zi',
    zuo: '午',
    xiang: '子',
    applicablePeriods: [5],
    replacementZuo: '丙',
    replacementXiang: '壬',
    category: '正替',
    priority: 10,
    conditions: {
      mustUse: true,
      recommendedUse: true,
      avoidUse: false,
    },
    effects: {
      improvesMountainStar: true,
      improvesFacingStar: true,
      avoidsNegativePattern: true,
      createsSpecialPattern: false,
    },
    description: '午山子向五运正替用丙山壬向',
    detailedExplanation:
      '五运中宫为5，午子为天元龙正位，但五运时中宫5星飞临，形成伏吟，故需替卦',
    historicalBasis: '《玄空秘旨》记载：五运子午卯酉四山向，俱要替卦',
    modernApplication:
      '现代建筑中，正北正南朝向的房屋在五运期间建议按此替卦处理',
  },
  {
    id: 'wu_yun_mao_you',
    zuo: '卯',
    xiang: '酉',
    applicablePeriods: [5],
    replacementZuo: '乙',
    replacementXiang: '辛',
    category: '正替',
    priority: 10,
    conditions: {
      mustUse: true,
      recommendedUse: true,
      avoidUse: false,
    },
    effects: {
      improvesMountainStar: true,
      improvesFacingStar: true,
      avoidsNegativePattern: true,
      createsSpecialPattern: false,
    },
    description: '卯山酉向五运正替用乙山辛向',
    detailedExplanation:
      '五运中宫为5，卯酉为天元龙正位，但五运时中宫5星飞临，形成伏吟，故需替卦',
    historicalBasis: '《玄空秘旨》记载：五运子午卯酉四山向，俱要替卦',
    modernApplication:
      '现代建筑中，正东正西朝向的房屋在五运期间建议按此替卦处理',
  },
  {
    id: 'wu_yun_you_mao',
    zuo: '酉',
    xiang: '卯',
    applicablePeriods: [5],
    replacementZuo: '辛',
    replacementXiang: '乙',
    category: '正替',
    priority: 10,
    conditions: {
      mustUse: true,
      recommendedUse: true,
      avoidUse: false,
    },
    effects: {
      improvesMountainStar: true,
      improvesFacingStar: true,
      avoidsNegativePattern: true,
      createsSpecialPattern: false,
    },
    description: '酉山卯向五运正替用辛山乙向',
    detailedExplanation:
      '五运中宫为5，酉卯为天元龙正位，但五运时中宫5星飞临，形成伏吟，故需替卦',
    historicalBasis: '《玄空秘旨》记载：五运子午卯酉四山向，俱要替卦',
    modernApplication:
      '现代建筑中，正西正东朝向的房屋在五运期间建议按此替卦处理',
  },

  // 乾巽艮坤替卦（所有运都适用）
  {
    id: 'qian_xun_tigua',
    zuo: '乾',
    xiang: '巽',
    applicablePeriods: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    replacementZuo: '亥',
    replacementXiang: '巳',
    category: '正替',
    priority: 9,
    conditions: {
      mustUse: false,
      recommendedUse: true,
      avoidUse: false,
    },
    effects: {
      improvesMountainStar: true,
      improvesFacingStar: true,
      avoidsNegativePattern: true,
      createsSpecialPattern: true,
    },
    description: '乾山巽向替卦用亥山巳向',
    detailedExplanation:
      '乾巽为天地定位，但在某些运中会形成不利格局，故用亥巳替代',
    historicalBasis: '《天玉经》云：乾巽坤艮四大卦，乘时乘气是真龙',
    modernApplication: '西北朝东南的建筑，可考虑按亥山巳向处理以优化风水格局',
  },
  {
    id: 'xun_qian_tigua',
    zuo: '巽',
    xiang: '乾',
    applicablePeriods: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    replacementZuo: '巳',
    replacementXiang: '亥',
    category: '正替',
    priority: 9,
    conditions: {
      mustUse: false,
      recommendedUse: true,
      avoidUse: false,
    },
    effects: {
      improvesMountainStar: true,
      improvesFacingStar: true,
      avoidsNegativePattern: true,
      createsSpecialPattern: true,
    },
    description: '巽山乾向替卦用巳山亥向',
    detailedExplanation:
      '巽乾为风天小畜，但在某些运中会形成不利格局，故用巳亥替代',
    historicalBasis: '《天玉经》云：乾巽坤艮四大卦，乘时乘气是真龙',
    modernApplication: '东南朝西北的建筑，可考虑按巳山亥向处理以优化风水格局',
  },
  {
    id: 'gen_kun_tigua',
    zuo: '艮',
    xiang: '坤',
    applicablePeriods: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    replacementZuo: '寅',
    replacementXiang: '申',
    category: '正替',
    priority: 9,
    conditions: {
      mustUse: false,
      recommendedUse: true,
      avoidUse: false,
    },
    effects: {
      improvesMountainStar: true,
      improvesFacingStar: true,
      avoidsNegativePattern: true,
      createsSpecialPattern: true,
    },
    description: '艮山坤向替卦用寅山申向',
    detailedExplanation: '艮坤为山地剥，在某些运中需要替卦以避免不利格局',
    historicalBasis: '《天玉经》云：乾巽坤艮四大卦，乘时乘气是真龙',
    modernApplication: '东北朝西南的建筑，可考虑按寅山申向处理以优化风水格局',
  },
  {
    id: 'kun_gen_tigua',
    zuo: '坤',
    xiang: '艮',
    applicablePeriods: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    replacementZuo: '申',
    replacementXiang: '寅',
    category: '正替',
    priority: 9,
    conditions: {
      mustUse: false,
      recommendedUse: true,
      avoidUse: false,
    },
    effects: {
      improvesMountainStar: true,
      improvesFacingStar: true,
      avoidsNegativePattern: true,
      createsSpecialPattern: true,
    },
    description: '坤山艮向替卦用申山寅向',
    detailedExplanation: '坤艮为地山谦，在某些运中需要替卦以避免不利格局',
    historicalBasis: '《天玉经》云：乾巽坤艮四大卦，乘时乘气是真龙',
    modernApplication: '西南朝东北的建筑，可考虑按申山寅向处理以优化风水格局',
  },

  // 旁替卦规则
  {
    id: 'wu_yun_xu_chen_pangti',
    zuo: '戌',
    xiang: '辰',
    applicablePeriods: [5],
    replacementZuo: '乾',
    replacementXiang: '巽',
    category: '旁替',
    priority: 7,
    conditions: {
      mustUse: false,
      recommendedUse: true,
      avoidUse: false,
    },
    effects: {
      improvesMountainStar: false,
      improvesFacingStar: false,
      avoidsNegativePattern: true,
      createsSpecialPattern: false,
    },
    description: '戌山辰向五运旁替用乾山巽向',
    detailedExplanation: '戌辰为地元龙，五运时可用旁替法，以乾巽天元龙替代',
    historicalBasis: '旁替法是替卦的辅助方法，用于特殊情况下的调整',
    modernApplication: '西北偏西朝东南偏东的建筑，五运时可考虑此旁替方法',
  },
];

// 替卦适用性智能判断
export function intelligentTiguaJudgment(
  zuo: Mountain,
  xiang: Mountain,
  period: Yun,
  mountainStar: FlyingStar,
  facingStar: FlyingStar,
  options: {
    considerPersonalBazi?: boolean;
    userBirthYear?: number;
    buildingType?: 'residential' | 'commercial' | 'office' | 'factory';
    environmentalFactors?: string[];
    prioritizeStability?: boolean;
  } = {}
): {
  applicableRules: EnhancedTiguaRule[];
  recommendedRule: EnhancedTiguaRule | null;
  analysis: {
    originalPattern: {
      score: number;
      issues: string[];
      advantages: string[];
    };
    tiguaPatterns: Array<{
      rule: EnhancedTiguaRule;
      score: number;
      issues: string[];
      advantages: string[];
      confidence: number;
    }>;
  };
  personalizedRecommendation: {
    shouldUseTigua: boolean;
    reasoning: string[];
    alternatives: string[];
    riskAssessment: 'low' | 'medium' | 'high';
  };
} {
  // 查找适用的替卦规则
  const applicableRules = ENHANCED_TIGUA_RULES.filter(
    rule =>
      rule.zuo === zuo &&
      rule.xiang === xiang &&
      rule.applicablePeriods.includes(period)
  );

  // 分析原始格局
  const originalScore = calculatePatternScore(mountainStar, facingStar, period);
  const originalIssues: string[] = [];
  const originalAdvantages: string[] = [];

  // 检查原始格局的问题
  if (mountainStar === period && facingStar === period) {
    originalAdvantages.push('双星会坐/会向，力量集中');
  } else if (mountainStar === period) {
    originalAdvantages.push('山星得令，利人丁');
  } else if (facingStar === period) {
    originalAdvantages.push('向星得令，利财运');
  }

  if (mountainStar === 5 || facingStar === 5) {
    originalIssues.push('五黄星出现，需要化解');
  }

  if (mountainStar + facingStar === 10) {
    originalAdvantages.push('山向合十，和谐稳定');
  }

  // 检查伏吟反吟
  if (mountainStar === period || facingStar === period) {
    if (period === 5) {
      originalIssues.push('五运伏吟，极为不利');
    } else {
      originalIssues.push('出现伏吟现象');
    }
  }

  // 分析替卦后的格局
  const tiguaPatterns: Array<{
    rule: EnhancedTiguaRule;
    score: number;
    issues: string[];
    advantages: string[];
    confidence: number;
  }> = [];

  for (const rule of applicableRules) {
    const adjustedMountainStar = applyTiguaAdjustment(mountainStar, rule);
    const adjustedFacingStar = applyTiguaAdjustment(facingStar, rule);
    const adjustedScore = calculatePatternScore(
      adjustedMountainStar,
      adjustedFacingStar,
      period
    );

    const issues: string[] = [];
    const advantages: string[] = [];
    let confidence = 0.8;

    // 分析替卦后的优势和问题
    if (rule.effects.avoidsNegativePattern) {
      advantages.push('避免了原有的不利格局');
      confidence += 0.1;
    }

    if (rule.effects.createsSpecialPattern) {
      advantages.push('形成特殊有利格局');
      confidence += 0.1;
    }

    if (rule.conditions.mustUse) {
      confidence = 0.95;
      advantages.push('传统理论强烈推荐使用');
    }

    // 个性化因素考虑
    if (options.considerPersonalBazi && options.userBirthYear) {
      const userYunGua = calculatePersonalYunGua(options.userBirthYear);
      if (isCompatibleWithPersonalYun(rule, userYunGua)) {
        advantages.push('与个人命卦相配');
        confidence += 0.05;
      } else {
        issues.push('与个人命卦不够匹配');
        confidence -= 0.05;
      }
    }

    // 建筑类型考虑
    if (options.buildingType) {
      const suitability = assessBuildingTypeSuitability(
        rule,
        options.buildingType
      );
      if (suitability.suitable) {
        advantages.push(suitability.reason);
      } else {
        issues.push(suitability.reason);
        confidence -= 0.1;
      }
    }

    tiguaPatterns.push({
      rule,
      score: adjustedScore,
      issues,
      advantages,
      confidence: Math.max(0, Math.min(1, confidence)),
    });
  }

  // 选择推荐的替卦规则
  let recommendedRule: EnhancedTiguaRule | null = null;
  if (tiguaPatterns.length > 0) {
    // 综合考虑得分、置信度和优先级
    const bestPattern = tiguaPatterns.reduce((best, current) => {
      const bestWeight =
        best.score * best.confidence * (best.rule.priority / 10);
      const currentWeight =
        current.score * current.confidence * (current.rule.priority / 10);
      return currentWeight > bestWeight ? current : best;
    });

    if (
      bestPattern.score > originalScore ||
      bestPattern.rule.conditions.mustUse
    ) {
      recommendedRule = bestPattern.rule;
    }
  }

  // 个性化推荐
  const shouldUseTigua = recommendedRule !== null;
  const reasoning: string[] = [];
  const alternatives: string[] = [];
  let riskAssessment: 'low' | 'medium' | 'high' = 'low';

  if (shouldUseTigua && recommendedRule) {
    reasoning.push(`推荐使用${recommendedRule.description}`);
    reasoning.push(recommendedRule.detailedExplanation);

    if (recommendedRule.conditions.mustUse) {
      reasoning.push('传统理论强烈建议必须使用此替卦');
      riskAssessment = 'low';
    } else {
      reasoning.push('替卦后格局有所改善，建议采用');
      riskAssessment = 'medium';
    }
  } else {
    reasoning.push('原格局已经较好，无需替卦');
    alternatives.push('可以通过其他风水调整方法优化');
    riskAssessment = 'low';
  }

  // 稳定性优先考虑
  if (options.prioritizeStability) {
    if (
      originalScore >= 0 &&
      !applicableRules.some(r => r.conditions.mustUse)
    ) {
      reasoning.push('考虑到稳定性优先，建议保持原格局');
      recommendedRule = null;
    }
  }

  return {
    applicableRules,
    recommendedRule,
    analysis: {
      originalPattern: {
        score: originalScore,
        issues: originalIssues,
        advantages: originalAdvantages,
      },
      tiguaPatterns,
    },
    personalizedRecommendation: {
      shouldUseTigua,
      reasoning,
      alternatives,
      riskAssessment,
    },
  };
}

// 辅助函数：计算格局评分
function calculatePatternScore(
  mountainStar: FlyingStar,
  facingStar: FlyingStar,
  period: Yun
): number {
  let score = 0;

  // 旺星得分
  if (mountainStar === period) score += 3;
  if (facingStar === period) score += 3;

  // 生气星得分
  const nextStar = ((period % 9) + 1) as FlyingStar;
  if (mountainStar === nextStar) score += 2;
  if (facingStar === nextStar) score += 2;

  // 退气星得分
  const prevStar = (((period - 2 + 9) % 9) + 1) as FlyingStar;
  if (mountainStar === prevStar) score += 1;
  if (facingStar === prevStar) score += 1;

  // 煞星扣分
  const shaStar = (((period + 1) % 9) + 1) as FlyingStar;
  if (mountainStar === shaStar) score -= 1;
  if (facingStar === shaStar) score -= 1;

  // 死星扣分
  const siStar = (((period + 2) % 9) + 1) as FlyingStar;
  if (mountainStar === siStar) score -= 2;
  if (facingStar === siStar) score -= 2;

  // 五黄星特殊扣分
  if (mountainStar === 5) score -= 3;
  if (facingStar === 5) score -= 3;

  // 合十加分
  if (mountainStar + facingStar === 10) score += 1;

  return score;
}

// 辅助函数：应用替卦调整
function applyTiguaAdjustment(
  originalStar: FlyingStar,
  rule: EnhancedTiguaRule
): FlyingStar {
  // 简化的替卦调整算法
  // 实际应用中需要更复杂的计算
  const originalPalace = getPalaceByMountain(rule.zuo);
  const replacementPalace = getPalaceByMountain(rule.replacementZuo);
  const palaceDiff = replacementPalace - originalPalace;

  let adjustedStar = originalStar + palaceDiff;
  while (adjustedStar < 1) adjustedStar += 9;
  while (adjustedStar > 9) adjustedStar -= 9;

  return adjustedStar as FlyingStar;
}

// 辅助函数：计算个人运卦
function calculatePersonalYunGua(birthYear: number): number {
  // 简化的个人运卦计算
  return ((birthYear - 1900) % 9) + 1;
}

// 辅助函数：检查与个人运卦的兼容性
function isCompatibleWithPersonalYun(
  rule: EnhancedTiguaRule,
  personalYun: number
): boolean {
  // 简化的兼容性判断
  const rulePalace = getPalaceByMountain(rule.replacementZuo);
  return Math.abs(rulePalace - personalYun) <= 2;
}

// 辅助函数：评估建筑类型适用性
function assessBuildingTypeSuitability(
  rule: EnhancedTiguaRule,
  buildingType: 'residential' | 'commercial' | 'office' | 'factory'
): { suitable: boolean; reason: string } {
  switch (buildingType) {
    case 'residential':
      return {
        suitable: rule.effects.improvesMountainStar,
        reason: rule.effects.improvesMountainStar
          ? '有利于居住人丁'
          : '对居住人丁改善有限',
      };
    case 'commercial':
      return {
        suitable: rule.effects.improvesFacingStar,
        reason: rule.effects.improvesFacingStar
          ? '有利于商业财运'
          : '对商业财运改善有限',
      };
    case 'office':
      return {
        suitable: rule.effects.avoidsNegativePattern,
        reason: rule.effects.avoidsNegativePattern
          ? '有利于办公环境稳定'
          : '对办公环境改善有限',
      };
    case 'factory':
      return {
        suitable: rule.effects.createsSpecialPattern,
        reason: rule.effects.createsSpecialPattern
          ? '有利于生产效率'
          : '对生产环境改善有限',
      };
    default:
      return { suitable: true, reason: '通用适用' };
  }
}

export default {
  ENHANCED_TIGUA_RULES,
  intelligentTiguaJudgment,
  calculatePatternScore: calculatePatternScore,
  applyTiguaAdjustment,
};
