/**
 * 玄空飞星数据结构转换工具
 * 用于v5.x和v6.0版本之间的数据转换
 */

import type {
  EnhancedPalaceInfo,
  EnhancedXuankongPlate,
  FlyingStar,
  FortuneRating,
  Mountain,
  PalaceIndex,
  PalaceName,
  Plate,
  PlateCell,
  Yun,
} from './types';

// 宫位索引到宫位名称的映射
const PALACE_INDEX_TO_NAME: Record<PalaceIndex, PalaceName> = {
  1: '坎',
  2: '坤',
  3: '震',
  4: '巽',
  5: '中',
  6: '乾',
  7: '兑',
  8: '艮',
  9: '离',
};

// 宫位名称到宫位索引的映射
const PALACE_NAME_TO_INDEX: Record<PalaceName, PalaceIndex> = {
  坎: 1,
  坤: 2,
  震: 3,
  巽: 4,
  中: 5,
  乾: 6,
  兑: 7,
  艮: 8,
  离: 9,
};

// 方位映射
const PALACE_TO_DIRECTION: Record<PalaceName, string> = {
  坎: '北',
  坤: '西南',
  震: '东',
  巽: '东南',
  中: '中央',
  乾: '西北',
  兑: '西',
  艮: '东北',
  离: '南',
};

/**
 * 根据评分计算吉凶等级
 */
function calculateFortuneRating(score: number): FortuneRating {
  if (score >= 90) return '大吉';
  if (score >= 80) return '吉';
  if (score >= 70) return '次吉';
  if (score >= 50) return '平';
  if (score >= 40) return '次凶';
  if (score >= 30) return '凶';
  return '大凶';
}

/**
 * 计算宫位评分 (简化版)
 */
function calculatePalaceScore(cell: PlateCell, period: Yun): number {
  let score = 50; // 基础分

  // 当旺星加分
  if (cell.mountainStar === period) score += 20;
  if (cell.facingStar === period) score += 20;

  // 八白、九紫加分
  if (cell.mountainStar === 8 || cell.mountainStar === 9) score += 10;
  if (cell.facingStar === 8 || cell.facingStar === 9) score += 10;

  // 五黄、二黑减分
  if (cell.mountainStar === 5) score -= 30;
  if (cell.facingStar === 5) score -= 30;
  if (cell.mountainStar === 2) score -= 15;
  if (cell.facingStar === 2) score -= 15;

  // 山向合十加分
  if (cell.mountainStar + cell.facingStar === 10) score += 15;

  return Math.max(0, Math.min(100, score));
}

/**
 * 将v5.x的Plate转换为v6.0的EnhancedXuankongPlate
 */
export function convertPlateToEnhanced(
  plate: Plate,
  period: Yun,
  facing?: {
    degrees: number;
    direction: string;
  }
): EnhancedXuankongPlate {
  const palaces: Record<PalaceName, EnhancedPalaceInfo> = {} as Record<
    PalaceName,
    EnhancedPalaceInfo
  >;

  let totalScore = 0;

  // 转换每个宫位
  plate.forEach((cell) => {
    const palaceName = PALACE_INDEX_TO_NAME[cell.palace];
    const score = calculatePalaceScore(cell, period);
    totalScore += score;

    palaces[palaceName] = {
      palace: palaceName,
      mountainStar: cell.mountainStar,
      facingStar: cell.facingStar,
      timeStar: period,
      fortuneRating: calculateFortuneRating(score),
      score,
    };
  });

  const overallScore = Math.round(totalScore / plate.length);

  // 识别特殊格局 (简化版)
  const specialPatterns: string[] = [];
  const hasMountainFacingCombination = plate.some(
    (cell) => cell.mountainStar + cell.facingStar === 10
  );
  if (hasMountainFacingCombination) {
    specialPatterns.push('山向合十');
  }

  return {
    period,
    facing:
      facing ||
      ({
        degrees: 180,
        direction: '坐北向南',
        palace: '离',
      } as any),
    palaces,
    specialPatterns,
    overallScore,
    metadata: {
      calculatedAt: new Date(),
      calculationMethod: 'standard',
    },
  };
}

/**
 * 将v6.0的EnhancedXuankongPlate转换为v5.x的Plate
 */
export function convertEnhancedToPlate(enhanced: EnhancedXuankongPlate): Plate {
  const plate: Plate = [];

  // 遍历所有宫位
  Object.entries(enhanced.palaces).forEach(([palaceName, info]) => {
    const palaceIndex = PALACE_NAME_TO_INDEX[palaceName as PalaceName];

    plate.push({
      palace: palaceIndex,
      mountainStar: info.mountainStar,
      facingStar: info.facingStar,
      periodStar: info.timeStar,
    });
  });

  // 按宫位索引排序
  return plate.sort((a, b) => a.palace - b.palace) as Plate;
}

/**
 * 从EnhancedXuankongPlate提取文昌位
 */
export function extractWenchangwei(plate: EnhancedXuankongPlate): string {
  // 简化版：四绿文昌星所在宫位
  const wenchangPalaces: string[] = [];

  Object.entries(plate.palaces).forEach(([palaceName, info]) => {
    if (info.mountainStar === 4 || info.facingStar === 4) {
      wenchangPalaces.push(palaceName);
    }
  });

  return wenchangPalaces.join(',') || '震'; // 默认东方
}

/**
 * 从EnhancedXuankongPlate提取财位
 */
export function extractCaiwei(plate: EnhancedXuankongPlate): string {
  // 简化版：八白财星所在宫位
  const caiPalaces: string[] = [];

  Object.entries(plate.palaces).forEach(([palaceName, info]) => {
    if (info.mountainStar === 8 || info.facingStar === 8) {
      caiPalaces.push(palaceName);
    }
  });

  return caiPalaces.join(',') || '艮'; // 默认东北
}

/**
 * 从角度获取朝向描述
 */
export function getDirectionFromDegrees(degrees: number): string {
  degrees = ((degrees % 360) + 360) % 360; // 标准化到0-360

  if (degrees >= 337.5 || degrees < 22.5) return '坐南向北';
  if (degrees >= 22.5 && degrees < 67.5) return '坐西南向东北';
  if (degrees >= 67.5 && degrees < 112.5) return '坐西向东';
  if (degrees >= 112.5 && degrees < 157.5) return '坐西北向东南';
  if (degrees >= 157.5 && degrees < 202.5) return '坐北向南';
  if (degrees >= 202.5 && degrees < 247.5) return '坐东北向西南';
  if (degrees >= 247.5 && degrees < 292.5) return '坐东向西';
  if (degrees >= 292.5 && degrees < 337.5) return '坐东南向西北';

  return '坐北向南';
}

/**
 * 从角度获取向宫
 */
export function getPalaceFromDegrees(degrees: number): PalaceName {
  degrees = ((degrees % 360) + 360) % 360;

  if (degrees >= 337.5 || degrees < 22.5) return '离';
  if (degrees >= 22.5 && degrees < 67.5) return '坤';
  if (degrees >= 67.5 && degrees < 112.5) return '兑';
  if (degrees >= 112.5 && degrees < 157.5) return '乾';
  if (degrees >= 157.5 && degrees < 202.5) return '坎';
  if (degrees >= 202.5 && degrees < 247.5) return '艮';
  if (degrees >= 247.5 && degrees < 292.5) return '震';
  if (degrees >= 292.5 && degrees < 337.5) return '巽';

  return '离';
}

/**
 * 获取宫位的方位描述
 */
export function getDirectionForPalace(palace: PalaceName): string {
  return PALACE_TO_DIRECTION[palace] || '未知';
}

/**
 * 创建空的EnhancedXuankongPlate (用于测试)
 */
export function createEmptyEnhancedPlate(
  period: Yun = 9
): EnhancedXuankongPlate {
  const palaces: Record<PalaceName, EnhancedPalaceInfo> = {} as Record<
    PalaceName,
    EnhancedPalaceInfo
  >;

  const palaceNames: PalaceName[] = [
    '中',
    '乾',
    '兑',
    '离',
    '震',
    '巽',
    '坎',
    '艮',
    '坤',
  ];

  palaceNames.forEach((name, idx) => {
    palaces[name] = {
      palace: name,
      mountainStar: (idx + 1) as FlyingStar,
      facingStar: (idx + 1) as FlyingStar,
      timeStar: period,
      fortuneRating: '平',
      score: 50,
    };
  });

  return {
    period,
    facing: {
      degrees: 180,
      direction: '坐北向南',
      palace: '离',
    },
    palaces,
    specialPatterns: [],
    overallScore: 50,
    metadata: {
      calculatedAt: new Date(),
      calculationMethod: 'standard',
    },
  };
}
