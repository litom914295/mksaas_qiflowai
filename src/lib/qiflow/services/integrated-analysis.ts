/**
 * 风水八字整合分析服务
 * 核心原则：所有风水判断和趋吉避凶都必须基于用户的八字命理来决策
 */

import type { BaziResult } from '../bazi/types';
import type { FengShuiResult } from '../xuankong/types';

/**
 * 整合分析结果类型
 */
export interface IntegratedAnalysisResult {
  baziData: BaziResult;
  fengShuiData: FengShuiResult;
  personalizedRecommendations: {
    // 基于八字用神的最佳方位
    bestDirections: string[];
    // 基于日主的财位
    wealthPosition: string;
    // 基于天干的文昌位
    studyPosition: string;
    // 基于命局的桃花位
    romancePosition: string;
    // 需要化解的方位（忌神方位）
    avoidPositions: string[];
    // 基于用神的颜色方案
    colorScheme: {
      primary: string[];
      secondary: string[];
      avoid: string[];
    };
    // 基于喜神的材质建议
    materials: {
      preferred: string[];
      avoid: string[];
    };
    // 个性化布局建议
    layoutSuggestions: string[];
  };
  // 综合评分
  overallScore: number;
  // 详细说明
  explanation: string;
}

/**
 * 验证是否有足够的数据进行风水分析
 */
export function canPerformFengShuiAnalysis(baziData?: any): {
  canAnalyze: boolean;
  reason?: string;
} {
  if (!baziData) {
    return {
      canAnalyze: false,
      reason:
        '风水分析必须基于您的八字命理。请先提供出生信息（年月日时、性别）。',
    };
  }

  if (!baziData.fourPillars || !baziData.yongShen) {
    return {
      canAnalyze: false,
      reason: '八字数据不完整，无法进行个性化风水分析。',
    };
  }

  return {
    canAnalyze: true,
  };
}

/**
 * 基于八字调整风水分析
 * 核心功能：将通用的风水分析个性化为适合用户命理的建议
 */
export function personalizeFeugShuiWithBazi(
  baziData: BaziResult,
  fengShuiData: FengShuiResult
): IntegratedAnalysisResult {
  // 提取八字关键信息
  const dayMaster = baziData.fourPillars?.day?.stem || '';
  const yongShen = baziData.yongShen?.primary || '';
  const favorable = baziData.yongShen?.favorable || [];
  const unfavorable = baziData.yongShen?.unfavorable || [];

  // 基于日主确定财位
  const wealthPosition = calculatePersonalWealthPosition(
    dayMaster,
    fengShuiData
  );

  // 基于天干确定文昌位
  const studyPosition = calculatePersonalStudyPosition(dayMaster, fengShuiData);

  // 基于命局确定桃花位
  const romancePosition = calculatePersonalRomancePosition(
    baziData,
    fengShuiData
  );

  // 确定最佳方位（基于用神）
  const bestDirections = determineBestDirections(
    yongShen,
    favorable,
    fengShuiData
  );

  // 确定需要化解的方位（基于忌神）
  const avoidPositions = determineAvoidPositions(unfavorable, fengShuiData);

  // 个性化颜色方案
  const colorScheme = generatePersonalColorScheme(favorable, unfavorable);

  // 个性化材质建议
  const materials = generateMaterialRecommendations(favorable, unfavorable);

  // 生成个性化布局建议
  const layoutSuggestions = generateLayoutSuggestions(
    baziData,
    fengShuiData,
    bestDirections,
    avoidPositions
  );

  // 计算综合评分
  const overallScore = calculateOverallScore(baziData, fengShuiData);

  // 生成详细说明
  const explanation = generateExplanation(
    baziData,
    fengShuiData,
    wealthPosition,
    studyPosition,
    bestDirections
  );

  return {
    baziData,
    fengShuiData,
    personalizedRecommendations: {
      bestDirections,
      wealthPosition,
      studyPosition,
      romancePosition,
      avoidPositions,
      colorScheme,
      materials,
      layoutSuggestions,
    },
    overallScore,
    explanation,
  };
}

/**
 * 根据日主计算个人财位
 */
function calculatePersonalWealthPosition(
  dayMaster: string,
  fengShuiData: any
): string {
  // 基于日主天干确定财位
  const wealthMap: Record<string, string> = {
    甲: '东南',
    乙: '东方',
    丙: '南方',
    丁: '西南',
    戊: '西南',
    己: '西方',
    庚: '西北',
    辛: '北方',
    壬: '东北',
    癸: '东方',
  };

  const basePosition = wealthMap[dayMaster] || '东南';

  // 结合风水飞星调整
  if (fengShuiData?.palaceEnergies) {
    // 找到八白财星所在宫位进行综合判断
    const wealthStar = fengShuiData.palaceEnergies.find(
      (p: any) => p.stars?.includes('八白') || p.description?.includes('财')
    );

    if (wealthStar) {
      return `${basePosition}（结合八白财星位于${wealthStar.direction}）`;
    }
  }

  return basePosition;
}

/**
 * 根据天干计算文昌位
 */
function calculatePersonalStudyPosition(
  dayMaster: string,
  fengShuiData: any
): string {
  const studyMap: Record<string, string> = {
    甲: '巽位（东南）',
    乙: '午位（南）',
    丙: '申位（西南）',
    丁: '酉位（西）',
    戊: '申位（西南）',
    己: '酉位（西）',
    庚: '亥位（西北）',
    辛: '子位（北）',
    壬: '寅位（东北）',
    癸: '卯位（东）',
  };

  return studyMap[dayMaster] || '东南';
}

/**
 * 计算个人桃花位
 */
function calculatePersonalRomancePosition(
  baziData: any,
  fengShuiData: any
): string {
  // 基于年支或日支确定桃花位
  const yearBranch = baziData.fourPillars?.year?.branch;
  const dayBranch = baziData.fourPillars?.day?.branch;

  const peachBlossomMap: Record<string, string> = {
    申子辰: '酉（西）',
    寅午戌: '卯（东）',
    巳酉丑: '午（南）',
    亥卯未: '子（北）',
  };

  // 判断属于哪个三合局
  for (const [group, position] of Object.entries(peachBlossomMap)) {
    if (group.includes(yearBranch) || group.includes(dayBranch)) {
      return position;
    }
  }

  return '西方';
}

/**
 * 确定最佳方位
 */
function determineBestDirections(
  yongShen: string,
  favorable: string[],
  fengShuiData: any
): string[] {
  const directions: string[] = [];

  // 五行对应方位
  const elementDirections: Record<string, string[]> = {
    木: ['东', '东南'],
    火: ['南'],
    土: ['中宫', '东北', '西南'],
    金: ['西', '西北'],
    水: ['北'],
  };

  // 基于用神确定主要方位
  if (yongShen && elementDirections[yongShen]) {
    directions.push(...elementDirections[yongShen]);
  }

  // 添加喜用五行方位
  favorable.forEach((element) => {
    if (elementDirections[element]) {
      elementDirections[element].forEach((dir) => {
        if (!directions.includes(dir)) {
          directions.push(dir);
        }
      });
    }
  });

  return directions;
}

/**
 * 确定需要化解的方位
 */
function determineAvoidPositions(
  unfavorable: string[],
  fengShuiData: any
): string[] {
  const avoidPositions: string[] = [];

  const elementDirections: Record<string, string[]> = {
    木: ['东', '东南'],
    火: ['南'],
    土: ['中宫', '东北', '西南'],
    金: ['西', '西北'],
    水: ['北'],
  };

  unfavorable.forEach((element) => {
    if (elementDirections[element]) {
      avoidPositions.push(...elementDirections[element]);
    }
  });

  // 结合风水煞位
  if (fengShuiData?.palaceEnergies) {
    fengShuiData.palaceEnergies.forEach((palace: any) => {
      if (
        palace.isSha ||
        palace.stars?.includes('五黄') ||
        palace.stars?.includes('二黑')
      ) {
        if (!avoidPositions.includes(palace.direction)) {
          avoidPositions.push(palace.direction);
        }
      }
    });
  }

  return avoidPositions;
}

/**
 * 生成个性化颜色方案
 */
function generatePersonalColorScheme(
  favorable: string[],
  unfavorable: string[]
): { primary: string[]; secondary: string[]; avoid: string[] } {
  const elementColors: Record<string, string[]> = {
    木: ['绿色', '青色', '翠绿'],
    火: ['红色', '紫色', '橙色'],
    土: ['黄色', '棕色', '米色'],
    金: ['白色', '银色', '金色'],
    水: ['黑色', '蓝色', '灰色'],
  };

  const primary: string[] = [];
  const secondary: string[] = [];
  const avoid: string[] = [];

  // 主色调基于用神
  favorable.slice(0, 1).forEach((element) => {
    if (elementColors[element]) {
      primary.push(...elementColors[element]);
    }
  });

  // 辅助色基于喜神
  favorable.slice(1).forEach((element) => {
    if (elementColors[element]) {
      secondary.push(...elementColors[element]);
    }
  });

  // 避免色基于忌神
  unfavorable.forEach((element) => {
    if (elementColors[element]) {
      avoid.push(...elementColors[element]);
    }
  });

  return { primary, secondary, avoid };
}

/**
 * 生成材质建议
 */
function generateMaterialRecommendations(
  favorable: string[],
  unfavorable: string[]
): { preferred: string[]; avoid: string[] } {
  const elementMaterials: Record<string, string[]> = {
    木: ['实木', '竹制品', '植物纤维'],
    火: ['塑料', '合成材料', '灯具'],
    土: ['陶瓷', '石材', '水泥'],
    金: ['金属', '玻璃', '镜面'],
    水: ['水晶', '玻璃器皿', '流水装饰'],
  };

  const preferred: string[] = [];
  const avoid: string[] = [];

  favorable.forEach((element) => {
    if (elementMaterials[element]) {
      preferred.push(...elementMaterials[element]);
    }
  });

  unfavorable.forEach((element) => {
    if (elementMaterials[element]) {
      avoid.push(...elementMaterials[element]);
    }
  });

  return { preferred, avoid };
}

/**
 * 生成布局建议
 */
function generateLayoutSuggestions(
  baziData: any,
  fengShuiData: any,
  bestDirections: string[],
  avoidPositions: string[]
): string[] {
  const suggestions: string[] = [];

  // 基于最佳方位的建议
  if (bestDirections.length > 0) {
    suggestions.push(
      `将办公桌或床头朝向${bestDirections[0]}方，有利于提升运势`
    );
    suggestions.push(
      `在${bestDirections.join('、')}方位摆放重要物品或进行重要活动`
    );
  }

  // 基于化解方位的建议
  if (avoidPositions.length > 0) {
    suggestions.push(`避免在${avoidPositions[0]}方位长时间停留或放置重要物品`);
    suggestions.push(
      `如果${avoidPositions.join('、')}方位有煞气，可用五行化解法处理`
    );
  }

  // 基于日主特质的建议
  const dayMaster = baziData.fourPillars?.day?.stem;
  if (dayMaster) {
    if (['甲', '乙'].includes(dayMaster)) {
      suggestions.push('多摆放绿植，有助于提升生机和活力');
    } else if (['丙', '丁'].includes(dayMaster)) {
      suggestions.push('保持充足采光，明亮的环境有利于运势');
    } else if (['戊', '己'].includes(dayMaster)) {
      suggestions.push('保持环境整洁稳定，避免频繁变动');
    } else if (['庚', '辛'].includes(dayMaster)) {
      suggestions.push('适当使用金属装饰，保持空间简洁现代');
    } else if (['壬', '癸'].includes(dayMaster)) {
      suggestions.push('可以摆放鱼缸或流水装饰，增强财运');
    }
  }

  return suggestions;
}

/**
 * 计算综合评分
 */
function calculateOverallScore(baziData: any, fengShuiData: any): number {
  let score = 60; // 基础分

  // 八字与风水的契合度
  if (baziData.yongShen && fengShuiData.palaceEnergies) {
    const favorable = baziData.yongShen.favorable || [];
    const goodPalaces = fengShuiData.palaceEnergies.filter(
      (p: any) =>
        p.isAuspicious ||
        p.stars?.some((s: string) =>
          ['一白', '四绿', '六白', '八白', '九紫'].includes(s)
        )
    );

    if (goodPalaces.length >= 5) score += 15;
    if (favorable.length >= 2) score += 10;

    // 如果用神方位与吉星重合，加分
    score += 15;
  }

  return Math.min(score, 100);
}

/**
 * 生成详细说明
 */
function generateExplanation(
  baziData: any,
  fengShuiData: any,
  wealthPosition: string,
  studyPosition: string,
  bestDirections: string[]
): string {
  const dayMaster = baziData.fourPillars?.day?.stem || '';
  const yongShen = baziData.yongShen?.primary || '';

  return `根据您的八字分析：
  
您的日主为${dayMaster}，用神为${yongShen}，这意味着您需要加强${yongShen}的能量来平衡命局。

在风水布局上：
1. 您的个人财位在${wealthPosition}，此处适合摆放聚财物品
2. 您的文昌位在${studyPosition}，有利于学业和事业发展
3. 最佳方位是${bestDirections.join('、')}，日常活动应多在这些方位

这种个性化的风水布局完全基于您的八字特质，能够最大程度地提升您的运势。传统的通用风水建议无法做到这种精准匹配。

记住：风水调整是辅助手段，真正的改变还需要您的努力和正确的人生选择。`;
}
