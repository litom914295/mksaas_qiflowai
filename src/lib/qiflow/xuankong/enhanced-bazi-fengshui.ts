/**
 * 增强版八字风水融合系统 (v6.0)
 *
 * 深度整合八字命理与玄空风水，提供个性化分析
 */

import type {
  Element,
  EnhancedXuankongPlate,
  FlyingStar,
  FortuneRating,
  PalaceName,
} from './types';

import type { UserProfile } from './personalized-analysis';

// 五行元素
export type WuxingElement = '木' | '火' | '土' | '金' | '水';

// 天干地支
export type Tiangan =
  | '甲'
  | '乙'
  | '丙'
  | '丁'
  | '戊'
  | '己'
  | '庚'
  | '辛'
  | '壬'
  | '癸';
export type Dizhi =
  | '子'
  | '丑'
  | '寅'
  | '卯'
  | '辰'
  | '巳'
  | '午'
  | '未'
  | '申'
  | '酉'
  | '戌'
  | '亥';

// 增强版八字信息
export interface EnhancedBaziInfo {
  // 基础四柱
  year: { tiangan: Tiangan; dizhi: Dizhi };
  month: { tiangan: Tiangan; dizhi: Dizhi };
  day: { tiangan: Tiangan; dizhi: Dizhi };
  hour: { tiangan: Tiangan; dizhi: Dizhi };

  // 日元信息
  dayMaster: {
    tiangan: Tiangan;
    element: WuxingElement;
    strength: 'strong' | 'weak' | 'balanced';
    score: number; // 身强弱分数 0-100
  };

  // 五行喜忌
  favorableElements: WuxingElement[]; // 喜用神
  unfavorableElements: WuxingElement[]; // 忌神

  // 用神
  yongshen: {
    primary: WuxingElement; // 主用神
    secondary?: WuxingElement; // 副用神
    description: string;
  };

  // 季节
  season: 'spring' | 'summer' | 'autumn' | 'winter';

  // 生肖
  zodiac: Dizhi;

  // 纳音五行
  nayin: {
    year: string;
    day: string;
  };
}

// 宫位五行属性
export const PALACE_WUXING: Record<PalaceName, WuxingElement> = {
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

// 飞星五行属性
export const STAR_WUXING: Record<FlyingStar, WuxingElement> = {
  1: '水',
  2: '土',
  3: '木',
  4: '木',
  5: '土',
  6: '金',
  7: '金',
  8: '土',
  9: '火',
};

// 五行生克关系
export const WUXING_RELATION = {
  生: {
    木: '火',
    火: '土',
    土: '金',
    金: '水',
    水: '木',
  } as Record<WuxingElement, WuxingElement>,
  克: {
    木: '土',
    火: '金',
    土: '水',
    金: '木',
    水: '火',
  } as Record<WuxingElement, WuxingElement>,
};

// 八字风水匹配结果
export interface BaziFengshuiMatch {
  palace: PalaceName;
  matchScore: number; // 匹配度 0-100
  level: 'excellent' | 'good' | 'fair' | 'poor' | 'bad';

  elementAnalysis: {
    palaceElement: WuxingElement;
    mountainStarElement: WuxingElement;
    facingStarElement: WuxingElement;

    palaceMatch: 'favorable' | 'neutral' | 'unfavorable';
    mountainMatch: 'favorable' | 'neutral' | 'unfavorable';
    facingMatch: 'favorable' | 'neutral' | 'unfavorable';

    description: string;
  };

  recommendations: {
    suitable: string[]; // 适合活动
    unsuitable: string[]; // 不适合活动
    enhancements: string[]; // 增强建议
    remedies: string[]; // 化解建议
  };

  colorScheme: {
    favorable: string[]; // 有利颜色
    unfavorable: string[]; // 不利颜色
  };

  bestTimeSlots: {
    hours: number[]; // 最佳时辰
    months: number[]; // 最佳月份
  };
}

// 个性化化解方案
export interface PersonalizedRemedy {
  baziBasedItems: {
    name: string;
    element: WuxingElement;
    reason: string;
    placement: string;
    priority: 'high' | 'medium' | 'low';
  }[];

  colorRecommendations: {
    clothingColors: string[];
    decorationColors: string[];
    avoidColors: string[];
  };

  directionGuidance: {
    favorableDirections: PalaceName[];
    unfavorableDirections: PalaceName[];
    workDirection: PalaceName; // 工作朝向
    sleepDirection: PalaceName; // 睡眠朝向
  };

  activitySchedule: {
    bestHours: Array<{
      hour: number;
      activities: string[];
    }>;
    avoidHours: number[];
  };
}

/**
 * 计算八字与风水的深度匹配
 */
export function calculateBaziFengshuiMatch(
  plate: EnhancedXuankongPlate,
  baziInfo: EnhancedBaziInfo
): BaziFengshuiMatch[] {
  const matches: BaziFengshuiMatch[] = [];

  Object.entries(plate.palaces).forEach(([palaceName, info]) => {
    const palace = palaceName as PalaceName;
    const palaceElement = PALACE_WUXING[palace];
    const mountainElement = STAR_WUXING[info.mountainStar];
    const facingElement = STAR_WUXING[info.facingStar];

    // 分析宫位元素匹配
    const palaceMatch = analyzeElementMatch(palaceElement, baziInfo);
    const mountainMatch = analyzeElementMatch(mountainElement, baziInfo);
    const facingMatch = analyzeElementMatch(facingElement, baziInfo);

    // 计算综合匹配分数
    let matchScore = 50; // 基础分

    if (palaceMatch === 'favorable') matchScore += 20;
    else if (palaceMatch === 'unfavorable') matchScore -= 20;

    if (mountainMatch === 'favorable') matchScore += 15;
    else if (mountainMatch === 'unfavorable') matchScore -= 15;

    if (facingMatch === 'favorable') matchScore += 15;
    else if (facingMatch === 'unfavorable') matchScore -= 15;

    // 确保分数在 0-100 范围内
    matchScore = Math.max(0, Math.min(100, matchScore));

    // 确定匹配等级
    let level: BaziFengshuiMatch['level'];
    if (matchScore >= 80) level = 'excellent';
    else if (matchScore >= 65) level = 'good';
    else if (matchScore >= 50) level = 'fair';
    else if (matchScore >= 35) level = 'poor';
    else level = 'bad';

    // 生成描述
    const description = generateMatchDescription(
      palace,
      palaceElement,
      palaceMatch,
      mountainMatch,
      facingMatch,
      baziInfo
    );

    // 生成推荐
    const recommendations = generateRecommendations(
      palace,
      palaceMatch,
      mountainMatch,
      facingMatch,
      baziInfo
    );

    // 生成颜色方案
    const colorScheme = generateColorScheme(
      palaceElement,
      mountainElement,
      facingElement,
      baziInfo
    );

    // 生成最佳时间
    const bestTimeSlots = generateBestTimeSlots(palaceElement, baziInfo);

    matches.push({
      palace,
      matchScore,
      level,
      elementAnalysis: {
        palaceElement,
        mountainStarElement: mountainElement,
        facingStarElement: facingElement,
        palaceMatch,
        mountainMatch,
        facingMatch,
        description,
      },
      recommendations,
      colorScheme,
      bestTimeSlots,
    });
  });

  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * 分析元素匹配度
 */
function analyzeElementMatch(
  element: WuxingElement,
  baziInfo: EnhancedBaziInfo
): 'favorable' | 'neutral' | 'unfavorable' {
  // 检查是否为喜用神
  if (baziInfo.favorableElements.includes(element)) {
    return 'favorable';
  }

  // 检查是否为忌神
  if (baziInfo.unfavorableElements.includes(element)) {
    return 'unfavorable';
  }

  // 检查是否生喜用神
  for (const favorable of baziInfo.favorableElements) {
    if (WUXING_RELATION.生[element] === favorable) {
      return 'favorable';
    }
  }

  // 检查是否克忌神
  for (const unfavorable of baziInfo.unfavorableElements) {
    if (WUXING_RELATION.克[element] === unfavorable) {
      return 'favorable';
    }
  }

  // 检查是否生忌神
  for (const unfavorable of baziInfo.unfavorableElements) {
    if (WUXING_RELATION.生[element] === unfavorable) {
      return 'unfavorable';
    }
  }

  // 检查是否克喜用神
  for (const favorable of baziInfo.favorableElements) {
    if (WUXING_RELATION.克[element] === favorable) {
      return 'unfavorable';
    }
  }

  return 'neutral';
}

/**
 * 生成匹配描述
 */
function generateMatchDescription(
  palace: PalaceName,
  palaceElement: WuxingElement,
  palaceMatch: string,
  mountainMatch: string,
  facingMatch: string,
  baziInfo: EnhancedBaziInfo
): string {
  const yongshen = baziInfo.yongshen.primary;

  let description = `${palace}宫五行属${palaceElement}，`;

  if (palaceMatch === 'favorable') {
    description += `与您的用神${yongshen}相生或相合，`;
  } else if (palaceMatch === 'unfavorable') {
    description += `与您的用神${yongshen}相克或不利，`;
  } else {
    description += `与您的用神${yongshen}关系中性，`;
  }

  if (mountainMatch === 'favorable' && facingMatch === 'favorable') {
    description += '山向飞星皆为有利五行，非常适合您。';
  } else if (mountainMatch === 'unfavorable' || facingMatch === 'unfavorable') {
    description += '部分飞星对您不利，需要适当化解。';
  } else {
    description += '整体能量平稳。';
  }

  return description;
}

/**
 * 生成推荐
 */
function generateRecommendations(
  palace: PalaceName,
  palaceMatch: string,
  mountainMatch: string,
  facingMatch: string,
  baziInfo: EnhancedBaziInfo
): BaziFengshuiMatch['recommendations'] {
  const suitable: string[] = [];
  const unsuitable: string[] = [];
  const enhancements: string[] = [];
  const remedies: string[] = [];

  if (palaceMatch === 'favorable') {
    suitable.push('主要活动区域', '长时间停留', '重要决策');
    enhancements.push(
      `摆放${baziInfo.yongshen.primary}属性物品`,
      `使用与${baziInfo.yongshen.primary}相应的颜色`
    );
  } else if (palaceMatch === 'unfavorable') {
    unsuitable.push('长时间停留', '重要活动', '休息睡眠');
    remedies.push(
      `增加${baziInfo.yongshen.primary}属性物品化解`,
      '避免在此方位进行重要活动',
      '可以作为储物或次要空间'
    );
  }

  return { suitable, unsuitable, enhancements, remedies };
}

/**
 * 生成颜色方案
 */
function generateColorScheme(
  palaceElement: WuxingElement,
  mountainElement: WuxingElement,
  facingElement: WuxingElement,
  baziInfo: EnhancedBaziInfo
): BaziFengshuiMatch['colorScheme'] {
  const elementColors: Record<WuxingElement, string[]> = {
    木: ['绿色', '青色', '碧色'],
    火: ['红色', '紫色', '粉色'],
    土: ['黄色', '棕色', '米色'],
    金: ['白色', '金色', '银色'],
    水: ['黑色', '蓝色', '灰色'],
  };

  const favorable = new Set<string>();
  const unfavorable = new Set<string>();

  // 喜用神颜色
  baziInfo.favorableElements.forEach((element) => {
    elementColors[element].forEach((color) => favorable.add(color));
  });

  // 忌神颜色
  baziInfo.unfavorableElements.forEach((element) => {
    elementColors[element].forEach((color) => unfavorable.add(color));
  });

  return {
    favorable: Array.from(favorable),
    unfavorable: Array.from(unfavorable),
  };
}

/**
 * 生成最佳时间段
 */
function generateBestTimeSlots(
  palaceElement: WuxingElement,
  baziInfo: EnhancedBaziInfo
): BaziFengshuiMatch['bestTimeSlots'] {
  // 时辰与地支对应
  const hourToDizhi: Record<number, Dizhi> = {
    23: '子',
    0: '子',
    1: '丑',
    2: '丑',
    3: '寅',
    4: '寅',
    5: '卯',
    6: '卯',
    7: '辰',
    8: '辰',
    9: '巳',
    10: '巳',
    11: '午',
    12: '午',
    13: '未',
    14: '未',
    15: '申',
    16: '申',
    17: '酉',
    18: '酉',
    19: '戌',
    20: '戌',
    21: '亥',
    22: '亥',
  };

  // 地支五行
  const dizhiElement: Record<Dizhi, WuxingElement> = {
    子: '水',
    丑: '土',
    寅: '木',
    卯: '木',
    辰: '土',
    巳: '火',
    午: '火',
    未: '土',
    申: '金',
    酉: '金',
    戌: '土',
    亥: '水',
  };

  const hours: number[] = [];

  // 查找有利时辰
  for (let hour = 0; hour < 24; hour++) {
    const dizhi = hourToDizhi[hour];
    const element = dizhiElement[dizhi];

    if (baziInfo.favorableElements.includes(element)) {
      hours.push(hour);
    }
  }

  // 季节对应月份
  const seasonMonths: Record<typeof baziInfo.season, number[]> = {
    spring: [2, 3, 4],
    summer: [5, 6, 7],
    autumn: [8, 9, 10],
    winter: [11, 12, 1],
  };

  return {
    hours: hours.length > 0 ? hours : [7, 8, 9, 10, 11], // 默认上午
    months: seasonMonths[baziInfo.season],
  };
}

/**
 * 生成个性化化解方案
 */
export function generatePersonalizedRemedy(
  plate: EnhancedXuankongPlate,
  baziInfo: EnhancedBaziInfo,
  targetPalace: PalaceName
): PersonalizedRemedy {
  const match = calculateBaziFengshuiMatch(plate, baziInfo).find(
    (m) => m.palace === targetPalace
  );

  if (!match) {
    throw new Error(`Palace ${targetPalace} not found`);
  }

  // 基于八字的化解物品
  const baziBasedItems = generateBaziBasedItems(baziInfo, match);

  // 颜色推荐
  const colorRecommendations = {
    clothingColors: match.colorScheme.favorable.slice(0, 3),
    decorationColors: match.colorScheme.favorable,
    avoidColors: match.colorScheme.unfavorable,
  };

  // 方位指导
  const allMatches = calculateBaziFengshuiMatch(plate, baziInfo);
  const favorableDirections = allMatches
    .filter((m) => m.level === 'excellent' || m.level === 'good')
    .map((m) => m.palace)
    .slice(0, 3);

  const unfavorableDirections = allMatches
    .filter((m) => m.level === 'poor' || m.level === 'bad')
    .map((m) => m.palace);

  const directionGuidance = {
    favorableDirections,
    unfavorableDirections,
    workDirection: favorableDirections[0] || '中',
    sleepDirection: favorableDirections[1] || favorableDirections[0] || '中',
  };

  // 活动安排
  const activitySchedule = {
    bestHours: match.bestTimeSlots.hours.slice(0, 6).map((hour) => ({
      hour,
      activities: ['重要决策', '商务谈判', '学习工作', '健身运动'].slice(0, 2),
    })),
    avoidHours: [1, 2, 3, 4, 13, 14], // 一般不利时辰
  };

  return {
    baziBasedItems,
    colorRecommendations,
    directionGuidance,
    activitySchedule,
  };
}

/**
 * 生成基于八字的化解物品
 */
function generateBaziBasedItems(
  baziInfo: EnhancedBaziInfo,
  match: BaziFengshuiMatch
): PersonalizedRemedy['baziBasedItems'] {
  const items: PersonalizedRemedy['baziBasedItems'] = [];
  const yongshen = baziInfo.yongshen.primary;

  // 根据用神推荐物品
  const elementItems: Record<
    WuxingElement,
    Array<{ name: string; description: string }>
  > = {
    木: [
      { name: '绿色植物', description: '生旺木气，增强生命力' },
      { name: '木质家具', description: '增强木属性能量' },
      { name: '竹制品', description: '清新雅致，催旺文昌' },
    ],
    火: [
      { name: '红色装饰', description: '催旺火气，增加活力' },
      { name: '灯具照明', description: '光明温暖，驱散阴气' },
      { name: '电器设备', description: '现代火属性物品' },
    ],
    土: [
      { name: '陶瓷摆件', description: '稳定能量，增强土气' },
      { name: '玉石水晶', description: '天然土属性，能量纯正' },
      { name: '山石盆景', description: '象征山岳，稳重踏实' },
    ],
    金: [
      { name: '金属摆件', description: '催旺金气，增加贵气' },
      { name: '铜制品', description: '纯铜制品，化煞催财' },
      { name: '白色装饰', description: '金的代表色，清净高雅' },
    ],
    水: [
      { name: '水养植物', description: '水生木，流动能量' },
      { name: '鱼缸', description: '活水催财，增加灵动' },
      { name: '蓝色装饰', description: '水的代表色，宁静智慧' },
    ],
  };

  // 主用神物品
  elementItems[yongshen].forEach((item) => {
    items.push({
      name: item.name,
      element: yongshen,
      reason: `您的用神为${yongshen}，${item.description}`,
      placement: `放置在${match.palace}宫位`,
      priority: 'high',
    });
  });

  // 副用神物品（如果有）
  if (baziInfo.yongshen.secondary) {
    const secondary = baziInfo.yongshen.secondary;
    elementItems[secondary].slice(0, 2).forEach((item) => {
      items.push({
        name: item.name,
        element: secondary,
        reason: `副用神${secondary}，${item.description}`,
        placement: `放置在${match.palace}宫位或相生方位`,
        priority: 'medium',
      });
    });
  }

  return items;
}

/**
 * 简化版：从 UserProfile 提取八字信息
 */
export function extractBaziFromUserProfile(
  profile: UserProfile
): EnhancedBaziInfo | null {
  if (!profile.birthYear) return null;

  // 简化实现：根据出生年份推算基础信息
  const yearGanzhi = calculateYearGanzhi(profile.birthYear);
  const zodiac = yearGanzhi.dizhi;

  // 根据年份推算喜用神（简化版本）
  const dayMasterElement = inferDayMasterElement(
    profile.birthYear,
    profile.gender
  );
  const favorableElements = inferFavorableElements(dayMasterElement);
  const unfavorableElements = inferUnfavorableElements(dayMasterElement);

  return {
    year: yearGanzhi,
    month: yearGanzhi, // 简化
    day: yearGanzhi, // 简化
    hour: yearGanzhi, // 简化
    dayMaster: {
      tiangan: yearGanzhi.tiangan,
      element: dayMasterElement,
      strength: 'balanced',
      score: 50,
    },
    favorableElements,
    unfavorableElements,
    yongshen: {
      primary: favorableElements[0],
      secondary: favorableElements[1],
      description: `用神${favorableElements[0]}，调候为主`,
    },
    season: inferSeason(profile.birthYear),
    zodiac,
    nayin: {
      year: '海中金', // 简化
      day: '海中金',
    },
  };
}

// 辅助函数

function calculateYearGanzhi(year: number): { tiangan: Tiangan; dizhi: Dizhi } {
  const tiangans: Tiangan[] = [
    '甲',
    '乙',
    '丙',
    '丁',
    '戊',
    '己',
    '庚',
    '辛',
    '壬',
    '癸',
  ];
  const dizhis: Dizhi[] = [
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

  const tgIndex = (year - 4) % 10;
  const dzIndex = (year - 4) % 12;

  return {
    tiangan: tiangans[tgIndex],
    dizhi: dizhis[dzIndex],
  };
}

function inferDayMasterElement(
  year: number,
  gender?: 'male' | 'female'
): WuxingElement {
  const elements: WuxingElement[] = ['木', '火', '土', '金', '水'];
  return elements[year % 5];
}

function inferFavorableElements(dayMaster: WuxingElement): WuxingElement[] {
  const favorable: WuxingElement[] = [];

  // 简化规则：生我、助我为喜
  for (const [key, value] of Object.entries(WUXING_RELATION.生)) {
    if (value === dayMaster) {
      favorable.push(key as WuxingElement);
    }
  }
  favorable.push(dayMaster); // 比劫帮身

  return favorable.slice(0, 2);
}

function inferUnfavorableElements(dayMaster: WuxingElement): WuxingElement[] {
  const unfavorable: WuxingElement[] = [];

  // 简化规则：克我、泄我为忌
  unfavorable.push(WUXING_RELATION.克[dayMaster]); // 我克者
  unfavorable.push(WUXING_RELATION.生[dayMaster]); // 我生者

  return unfavorable;
}

function inferSeason(year: number): 'spring' | 'summer' | 'autumn' | 'winter' {
  const seasons = ['spring', 'summer', 'autumn', 'winter'] as const;
  return seasons[Math.floor((year % 12) / 3)];
}
