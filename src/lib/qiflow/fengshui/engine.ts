/**
 * @deprecated 此文件已弃用！请使用统一系统代替。
 *
 * ⚠️ 重要提示：
 * - 本文件已整合到 unified/ 系统
 * - 请改用：`src/lib/qiflow/unified/engine.ts`
 * - 迁移指南：`MIGRATION_GUIDE.md`
 *
 * 原文档：
 * 玄空飞星风水算法引擎
 * 包含九宫飞星、山向分析、吉凶判断等核心逻辑
 *
 * @deprecated 使用 unified/ 系统代替
 */

import type { FengshuiInput, FengshuiOutput } from '@/app/api/fengshui/schema';

// 九宫数字与方位对应
export const PALACE_POSITIONS = {
  1: { name: '坎', direction: '北', element: '水', color: '白' },
  2: { name: '坤', direction: '西南', element: '土', color: '黑' },
  3: { name: '震', direction: '东', element: '木', color: '碧' },
  4: { name: '巽', direction: '东南', element: '木', color: '绿' },
  5: { name: '中', direction: '中央', element: '土', color: '黄' },
  6: { name: '乾', direction: '西北', element: '金', color: '白' },
  7: { name: '兑', direction: '西', element: '金', color: '赤' },
  8: { name: '艮', direction: '东北', element: '土', color: '白' },
  9: { name: '离', direction: '南', element: '火', color: '紫' },
};

// 二十四山向
export const TWENTY_FOUR_MOUNTAINS = [
  { name: '壬', angle: 337.5, palace: 1 },
  { name: '子', angle: 0, palace: 1 },
  { name: '癸', angle: 22.5, palace: 1 },
  { name: '丑', angle: 37.5, palace: 8 },
  { name: '艮', angle: 45, palace: 8 },
  { name: '寅', angle: 52.5, palace: 8 },
  { name: '甲', angle: 67.5, palace: 3 },
  { name: '卯', angle: 90, palace: 3 },
  { name: '乙', angle: 112.5, palace: 3 },
  { name: '辰', angle: 127.5, palace: 4 },
  { name: '巽', angle: 135, palace: 4 },
  { name: '巳', angle: 142.5, palace: 4 },
  { name: '丙', angle: 157.5, palace: 9 },
  { name: '午', angle: 180, palace: 9 },
  { name: '丁', angle: 202.5, palace: 9 },
  { name: '未', angle: 217.5, palace: 2 },
  { name: '坤', angle: 225, palace: 2 },
  { name: '申', angle: 232.5, palace: 2 },
  { name: '庚', angle: 247.5, palace: 7 },
  { name: '酉', angle: 270, palace: 7 },
  { name: '辛', angle: 292.5, palace: 7 },
  { name: '戌', angle: 307.5, palace: 6 },
  { name: '乾', angle: 315, palace: 6 },
  { name: '亥', angle: 322.5, palace: 6 },
];

// 元运周期（每运20年）
export const PERIODS = {
  1: { years: '1864-1883', element: '水' },
  2: { years: '1884-1903', element: '土' },
  3: { years: '1904-1923', element: '木' },
  4: { years: '1924-1943', element: '木' },
  5: { years: '1944-1963', element: '土' },
  6: { years: '1964-1983', element: '金' },
  7: { years: '1984-2003', element: '金' },
  8: { years: '2004-2023', element: '土' },
  9: { years: '2024-2043', element: '火' },
};

// 飞星吉凶性质
export const STAR_NATURE = {
  1: { name: '贪狼星', nature: '吉', aspect: '官运、文昌' },
  2: { name: '巨门星', nature: '凶', aspect: '病符、是非' },
  3: { name: '禄存星', nature: '凶', aspect: '是非、官非' },
  4: { name: '文曲星', nature: '吉', aspect: '文昌、智慧' },
  5: { name: '廉贞星', nature: '凶', aspect: '灾煞、凶险' },
  6: { name: '武曲星', nature: '吉', aspect: '官运、权力' },
  7: { name: '破军星', nature: '凶', aspect: '破财、盗贼' },
  8: { name: '左辅星', nature: '吉', aspect: '财运、地产' },
  9: { name: '右弼星', nature: '吉', aspect: '喜庆、桃花' },
};

/**
 * 计算当前元运
 */
export function calculatePeriod(year?: number): number {
  const currentYear = year || new Date().getFullYear();

  if (currentYear >= 2024 && currentYear <= 2043) return 9;
  if (currentYear >= 2004 && currentYear <= 2023) return 8;
  if (currentYear >= 1984 && currentYear <= 2003) return 7;
  if (currentYear >= 1964 && currentYear <= 1983) return 6;

  // 默认返回当前九运
  return 9;
}

/**
 * 根据角度获取山向
 */
export function getMountainDirection(degrees: number): {
  mountain: string;
  facing: string;
  mountainPalace: number;
  facingPalace: number;
} {
  // 标准化角度到0-360
  const normalizedDegree = ((degrees % 360) + 360) % 360;

  // 找到最接近的山向
  let closestMountain = TWENTY_FOUR_MOUNTAINS[0];
  let minDiff = 360;

  for (const mountain of TWENTY_FOUR_MOUNTAINS) {
    const diff = Math.abs(normalizedDegree - mountain.angle);
    const adjustedDiff = Math.min(diff, 360 - diff);

    if (adjustedDiff < minDiff) {
      minDiff = adjustedDiff;
      closestMountain = mountain;
    }
  }

  // 坐山（背后）
  const mountainIndex = TWENTY_FOUR_MOUNTAINS.indexOf(closestMountain);
  const mountain = closestMountain.name;
  const mountainPalace = closestMountain.palace;

  // 朝向（对面，相差180度）
  const facingIndex = (mountainIndex + 12) % 24;
  const facing = TWENTY_FOUR_MOUNTAINS[facingIndex].name;
  const facingPalace = TWENTY_FOUR_MOUNTAINS[facingIndex].palace;

  return { mountain, facing, mountainPalace, facingPalace };
}

/**
 * 生成洛书九宫格
 */
export function generateLuoshuGrid(): number[][] {
  return [
    [4, 9, 2],
    [3, 5, 7],
    [8, 1, 6],
  ];
}

/**
 * 飞星排布算法
 */
export function calculateFlyingStars(
  period: number,
  mountain: string,
  facing: string,
  isYangDirection = true
): {
  periodStars: number[][];
  mountainStars: number[][];
  facingStars: number[][];
  combinedStars: Array<{
    palace: number;
    period: number;
    mountain: number;
    facing: number;
    combination: string;
  }>;
} {
  // 运盘飞星（以当运星入中）
  const periodStars = flyStars(period, true);

  // 获取山向对应的宫位
  const mountainInfo = TWENTY_FOUR_MOUNTAINS.find((m) => m.name === mountain);
  const facingInfo = TWENTY_FOUR_MOUNTAINS.find((m) => m.name === facing);

  const mountainPalace = mountainInfo?.palace || 1;
  const facingPalace = facingInfo?.palace || 9;

  // 山盘飞星（以坐山宫位的运星入中）
  const mountainCenterStar = getStarAtPalace(periodStars, mountainPalace);
  const mountainStars = flyStars(mountainCenterStar, !isYangDirection);

  // 向盘飞星（以朝向宫位的运星入中）
  const facingCenterStar = getStarAtPalace(periodStars, facingPalace);
  const facingStars = flyStars(facingCenterStar, isYangDirection);

  // 组合飞星
  const combinedStars = [];
  for (let palace = 1; palace <= 9; palace++) {
    const periodStar = getStarAtPalace(periodStars, palace);
    const mountainStar = getStarAtPalace(mountainStars, palace);
    const facingStar = getStarAtPalace(facingStars, palace);

    combinedStars.push({
      palace,
      period: periodStar,
      mountain: mountainStar,
      facing: facingStar,
      combination: `${mountainStar}${facingStar}`,
    });
  }

  return { periodStars, mountainStars, facingStars, combinedStars };
}

/**
 * 飞星排布核心算法
 */
function flyStars(centerNumber: number, isClockwise = true): number[][] {
  const grid: number[][] = Array(3)
    .fill(null)
    .map(() => Array(3).fill(0));

  // 飞星顺序（顺时针）
  const sequence = isClockwise
    ? [5, 6, 7, 8, 9, 1, 2, 3, 4] // 中→西北→西→东北→南→北→西南→东→东南
    : [5, 4, 3, 2, 1, 9, 8, 7, 6]; // 逆飞

  // 九宫位置映射
  const positions = [
    [1, 2],
    [0, 2],
    [0, 1],
    [0, 0],
    [1, 0],
    [2, 0],
    [2, 1],
    [2, 2],
    [1, 1],
  ];

  for (let i = 0; i < 9; i++) {
    const starNumber = ((centerNumber - 1 + i) % 9) + 1;
    const [row, col] = positions[sequence.indexOf(i + 1)];
    grid[row][col] = starNumber;
  }

  return grid;
}

/**
 * 获取指定宫位的飞星
 */
function getStarAtPalace(grid: number[][], palace: number): number {
  const positions: Record<number, [number, number]> = {
    1: [2, 1], // 北
    2: [2, 0], // 西南
    3: [1, 0], // 东
    4: [0, 0], // 东南
    5: [1, 1], // 中
    6: [0, 2], // 西北
    7: [1, 2], // 西
    8: [0, 1], // 东北
    9: [2, 2], // 南
  };

  const [row, col] = positions[palace] || [1, 1];
  return grid[row][col];
}

/**
 * 分析飞星组合吉凶
 */
export function analyzeFlyingStarCombination(
  mountain: number,
  facing: number,
  period: number
): {
  nature: '大吉' | '吉' | '平' | '凶' | '大凶';
  description: string;
  advice: string;
} {
  const combo = `${mountain}${facing}`;

  // 九运特殊组合
  const auspiciousCombos: Record<
    string,
    { nature: '大吉' | '吉'; description: string; advice: string }
  > = {
    '68': {
      nature: '大吉',
      description: '富贵双全',
      advice: '财官两旺，事业财运俱佳',
    },
    '86': {
      nature: '大吉',
      description: '富贵双全',
      advice: '财官两旺，事业财运俱佳',
    },
    '14': {
      nature: '吉',
      description: '文昌聚会',
      advice: '利于学业、考试、创作',
    },
    '41': {
      nature: '吉',
      description: '文昌聚会',
      advice: '利于学业、考试、创作',
    },
    '16': {
      nature: '吉',
      description: '金水相生',
      advice: '利于智慧、人缘、财运',
    },
    '61': {
      nature: '吉',
      description: '金水相生',
      advice: '利于智慧、人缘、财运',
    },
    '49': {
      nature: '吉',
      description: '风火家声',
      advice: '利于名声、创意、艺术',
    },
    '94': {
      nature: '吉',
      description: '风火家声',
      advice: '利于名声、创意、艺术',
    },
  };

  const inauspiciousCombos: Record<
    string,
    { nature: '凶' | '大凶'; description: string; advice: string }
  > = {
    '25': {
      nature: '大凶',
      description: '二五交加',
      advice: '主病灾，需化解土煞',
    },
    '52': {
      nature: '大凶',
      description: '二五交加',
      advice: '主病灾，需化解土煞',
    },
    '23': { nature: '凶', description: '斗牛煞', advice: '是非官非，需化解' },
    '32': { nature: '凶', description: '斗牛煞', advice: '是非官非，需化解' },
    '67': {
      nature: '凶',
      description: '交剑煞',
      advice: '口舌是非，需化解金煞',
    },
    '76': {
      nature: '凶',
      description: '交剑煞',
      advice: '口舌是非，需化解金煞',
    },
    '95': {
      nature: '凶',
      description: '火炼毒土',
      advice: '火灾、疾病，需化解',
    },
    '59': {
      nature: '凶',
      description: '火炼毒土',
      advice: '火灾、疾病，需化解',
    },
  };

  if (auspiciousCombos[combo]) {
    return auspiciousCombos[combo];
  }

  if (inauspiciousCombos[combo]) {
    return inauspiciousCombos[combo];
  }

  // 分析单星性质
  const mountainNature = (STAR_NATURE as any)[mountain].nature;
  const facingNature = (STAR_NATURE as any)[facing].nature;

  if (mountainNature === '吉' && facingNature === '吉') {
    return { nature: '吉', description: '双星到位', advice: '整体运势良好' };
  }

  if (mountainNature === '凶' && facingNature === '凶') {
    return { nature: '凶', description: '凶星汇聚', advice: '需要风水化解' };
  }

  return {
    nature: '平',
    description: '吉凶参半',
    advice: '趋吉避凶，合理布局',
  };
}

/**
 * 计算特殊方位
 */
export function calculateSpecialPositions(flyingStars: any): {
  wealthPosition: string[];
  academicPosition: string[];
  relationshipPosition: string[];
  healthPosition: string[];
} {
  const positions: {
    wealthPosition: string[];
    academicPosition: string[];
    relationshipPosition: string[];
    healthPosition: string[];
  } = {
    wealthPosition: [],
    academicPosition: [],
    relationshipPosition: [],
    healthPosition: [],
  };

  // 查找财位（8白星位置）
  flyingStars.combinedStars.forEach((star: any) => {
    if (star.facing === 8 || star.mountain === 8) {
      positions.wealthPosition.push(
        (PALACE_POSITIONS as any)[star.palace].direction
      );
    }
    if (star.facing === 1 || star.facing === 4) {
      positions.academicPosition.push(
        (PALACE_POSITIONS as any)[star.palace].direction
      );
    }
    if (star.facing === 9) {
      positions.relationshipPosition.push(
        (PALACE_POSITIONS as any)[star.palace].direction
      );
    }
  });

  // 默认值
  if (positions.wealthPosition.length === 0)
    positions.wealthPosition = ['西北'];
  if (positions.academicPosition.length === 0)
    positions.academicPosition = ['东南'];
  if (positions.relationshipPosition.length === 0)
    positions.relationshipPosition = ['西南'];
  if (positions.healthPosition.length === 0)
    positions.healthPosition = ['东方'];

  return positions;
}

/**
 * 生成风水建议
 */
export function generateFengshuiRecommendations(
  analysis: any,
  specialPositions: any
): {
  layout: string[];
  enhancement: string[];
  avoidance: string[];
  colors: string[];
  elements: string[];
  items: string[];
} {
  const recommendations: {
    layout: string[];
    enhancement: string[];
    avoidance: string[];
    colors: string[];
    elements: string[];
    items: string[];
  } = {
    layout: [],
    enhancement: [],
    avoidance: [],
    colors: [],
    elements: [],
    items: [],
  };

  // 基于飞星组合生成建议
  if (analysis.nature === '大吉' || analysis.nature === '吉') {
    recommendations.layout.push('保持当前格局，强化吉位能量');
    recommendations.enhancement.push(
      `在${specialPositions.wealthPosition}方位摆放水晶或金属摆件增强财运`
    );
    recommendations.colors.push('金色', '白色', '蓝色');
    recommendations.elements.push('金', '水');
    recommendations.items.push('铜钱', '水晶球', '金属风铃');
  } else if (analysis.nature === '凶' || analysis.nature === '大凶') {
    recommendations.layout.push('需要调整布局化解凶煞');
    recommendations.avoidance.push('避免在凶位长时间停留');
    recommendations.enhancement.push('使用五行化解法平衡能量');
    recommendations.colors.push('绿色', '棕色');
    recommendations.elements.push('木', '土');
    recommendations.items.push('绿植', '陶瓷摆件', '木质装饰');
  } else {
    recommendations.layout.push('合理利用空间，趋吉避凶');
    recommendations.enhancement.push('强化吉位，弱化凶位');
    recommendations.colors.push('米色', '浅黄色');
    recommendations.elements.push('土');
    recommendations.items.push('天然水晶', '陶瓷花瓶');
  }

  // 特殊方位建议
  recommendations.layout.push(
    `主卧室宜设在${specialPositions.healthPosition.join('、')}方位`,
    `书房宜设在${specialPositions.academicPosition.join('、')}方位`,
    `客厅财位在${specialPositions.wealthPosition.join('、')}方位`
  );

  recommendations.avoidance.push(
    '避免在凶位设置床头',
    '避免在五黄二黑方位长期活动',
    '避免背对凶位办公'
  );

  return recommendations;
}

/**
 * 主函数：计算完整风水分析
 */
export function calculateFengshui(input: FengshuiInput): FengshuiOutput {
  // 获取山向信息
  const { mountain, facing, mountainPalace, facingPalace } =
    getMountainDirection(input.facing);

  // 计算元运
  const period = calculatePeriod(input.buildYear);

  // 计算飞星
  const flyingStars = calculateFlyingStars(period, mountain, facing);

  // 分析当前宫位
  const centerPalace = flyingStars.combinedStars.find((s) => s.palace === 5);
  const analysis = analyzeFlyingStarCombination(
    centerPalace?.mountain || 5,
    centerPalace?.facing || 5,
    period
  );

  // 计算特殊方位
  const specialPositions = calculateSpecialPositions(flyingStars);

  // 生成建议
  const recommendations = generateFengshuiRecommendations(
    analysis,
    specialPositions
  );

  // 构建输出
  const output = {
    requestId: `fengshui_${Date.now()}`,
    timestamp: new Date().toISOString(),
    version: 'v1.0.0',

    basicInfo: {
      address: (input as any).address || '未提供',
      facing: input.facing,
      mountain: mountain,
      buildYear: input.buildYear,
      floorPlan: input.floorPlan,
    },

    period,
    mountain,
    facing,

    flyingStars: {
      period: flyingStars.periodStars as any,
      mountain: flyingStars.mountainStars as any,
      facing: flyingStars.facingStars as any,
      combined: flyingStars.combinedStars,
    },

    palaceAnalysis: flyingStars.combinedStars.map((star) => ({
      palace: star.palace,
      direction: (PALACE_POSITIONS as any)[star.palace].direction,
      periodStar: star.period,
      mountainStar: star.mountain,
      facingStar: star.facing,
      combination: star.combination,
      nature: analyzeFlyingStarCombination(star.mountain, star.facing, period)
        .nature,
      description: analyzeFlyingStarCombination(
        star.mountain,
        star.facing,
        period
      ).description,
    })),

    specialPositions,

    recommendations,

    analysis: {
      overall: analysis.nature,
      description: analysis.description,
      details: {
        wealth: `财位在${specialPositions.wealthPosition.join('、')}，宜摆放招财物品`,
        career: `事业发展宜面向${facing}方向`,
        relationship: `桃花位在${specialPositions.relationshipPosition.join('、')}`,
        health: `健康方位在${specialPositions.healthPosition.join('、')}，宜作卧室`,
        academic: `文昌位在${specialPositions.academicPosition.join('、')}，宜作书房`,
      },
    },
  } as unknown as FengshuiOutput;

  return output;
}
