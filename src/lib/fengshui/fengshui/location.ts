import { AngleToMountainResult, Mountain } from './types';

// 二十四山完整序列，每山15度
export const MOUNTAINS: readonly Mountain[] = [
  '子', '癸', '丑', '艮', '寅', '甲', '卯', '乙', '辰', '巽', '巳', '丙',
  '午', '丁', '未', '坤', '申', '庚', '酉', '辛', '戌', '乾', '亥', '壬'
] as const;

// 二十四山角度范围定义（参考仓库的定向表）
export interface MountainRange {
  mountain: Mountain;
  leftBound: number;    // 逆左边界
  rightBound: number;   // 顺右边界
  centerLeft: number;   // 正左边界
  centerRight: number;  // 正右边界
}

export const MOUNTAIN_RANGES: MountainRange[] = [
  { mountain: '子', leftBound: 352.5, rightBound: 7.5, centerLeft: 355.5, centerRight: 4.5 },
  { mountain: '癸', leftBound: 7.5, rightBound: 22.5, centerLeft: 10.5, centerRight: 19.5 },
  { mountain: '丑', leftBound: 22.5, rightBound: 37.5, centerLeft: 25.5, centerRight: 34.5 },
  { mountain: '艮', leftBound: 37.5, rightBound: 52.5, centerLeft: 40.5, centerRight: 49.5 },
  { mountain: '寅', leftBound: 52.5, rightBound: 67.5, centerLeft: 55.5, centerRight: 64.5 },
  { mountain: '甲', leftBound: 67.5, rightBound: 82.5, centerLeft: 70.5, centerRight: 79.5 },
  { mountain: '卯', leftBound: 82.5, rightBound: 97.5, centerLeft: 85.5, centerRight: 94.5 },
  { mountain: '乙', leftBound: 97.5, rightBound: 112.5, centerLeft: 100.5, centerRight: 109.5 },
  { mountain: '辰', leftBound: 112.5, rightBound: 127.5, centerLeft: 115.5, centerRight: 124.5 },
  { mountain: '巽', leftBound: 127.5, rightBound: 142.5, centerLeft: 130.5, centerRight: 139.5 },
  { mountain: '巳', leftBound: 142.5, rightBound: 157.5, centerLeft: 145.5, centerRight: 154.5 },
  { mountain: '丙', leftBound: 157.5, rightBound: 172.5, centerLeft: 160.5, centerRight: 169.5 },
  { mountain: '午', leftBound: 172.5, rightBound: 187.5, centerLeft: 175.5, centerRight: 184.5 },
  { mountain: '丁', leftBound: 187.5, rightBound: 202.5, centerLeft: 190.5, centerRight: 199.5 },
  { mountain: '未', leftBound: 202.5, rightBound: 217.5, centerLeft: 205.5, centerRight: 214.5 },
  { mountain: '坤', leftBound: 217.5, rightBound: 232.5, centerLeft: 220.5, centerRight: 229.5 },
  { mountain: '申', leftBound: 232.5, rightBound: 247.5, centerLeft: 235.5, centerRight: 244.5 },
  { mountain: '庚', leftBound: 247.5, rightBound: 262.5, centerLeft: 250.5, centerRight: 259.5 },
  { mountain: '酉', leftBound: 262.5, rightBound: 277.5, centerLeft: 265.5, centerRight: 274.5 },
  { mountain: '辛', leftBound: 277.5, rightBound: 292.5, centerLeft: 280.5, centerRight: 289.5 },
  { mountain: '戌', leftBound: 292.5, rightBound: 307.5, centerLeft: 295.5, centerRight: 304.5 },
  { mountain: '乾', leftBound: 307.5, rightBound: 322.5, centerLeft: 310.5, centerRight: 319.5 },
  { mountain: '亥', leftBound: 322.5, rightBound: 337.5, centerLeft: 325.5, centerRight: 334.5 },
  { mountain: '壬', leftBound: 337.5, rightBound: 352.5, centerLeft: 340.5, centerRight: 349.5 }
];

// 二十四山对应关系（坐山对向山）
export const MOUNTAIN_PAIRS: Record<Mountain, Mountain> = {
  '子': '午', '癸': '丁', '丑': '未', '艮': '坤', '寅': '申', '甲': '庚',
  '卯': '酉', '乙': '辛', '辰': '戌', '巽': '乾', '巳': '亥', '丙': '壬',
  '午': '子', '丁': '癸', '未': '丑', '坤': '艮', '申': '寅', '庚': '甲',
  '酉': '卯', '辛': '乙', '戌': '辰', '乾': '巽', '亥': '巳', '壬': '丙'
};

// 兼向处理：获取相邻的山
export function getAdjacentMountain(mountain: Mountain, direction: 'left' | 'right'): Mountain {
  const index = MOUNTAINS.indexOf(mountain);
  if (direction === 'left') {
    return MOUNTAINS[(index - 1 + MOUNTAINS.length) % MOUNTAINS.length];
  } else {
    return MOUNTAINS[(index + 1) % MOUNTAINS.length];
  }
}

export interface LocationResult {
  zuo: Mountain;        // 坐山
  xiang: Mountain;      // 向山
  jianzuo?: Mountain;   // 兼坐山
  jianxiang?: Mountain; // 兼向山
  isJian: boolean;      // 是否兼向
  ambiguous: boolean;   // 是否在边界模糊区域
}

export function analyzeLocation(degrees: number, toleranceDeg = 0.5): LocationResult {
  const normalized = ((degrees % 360) + 360) % 360;
  
  // 处理子山午向的特殊情况（跨越0度）
  if (normalized <= 7.5 || normalized >= 352.5) {
    const zuo: Mountain = '子';
    const xiang: Mountain = '午';
    let jianzuo: Mountain | undefined;
    let jianxiang: Mountain | undefined;
    let isJian = false;
    
    if (normalized >= 355.5) {
      // 兼癸丁
      jianzuo = '癸';
      jianxiang = '丁';
      isJian = true;
    } else if (normalized <= 4.5) {
      // 兼壬丙
      jianzuo = '壬';
      jianxiang = '丙';
      isJian = true;
    }
    
    return {
      zuo,
      xiang,
      jianzuo,
      jianxiang,
      isJian,
      ambiguous: normalized >= 355.5 || normalized <= 4.5
    };
  }
  
  // 查找对应的山
  for (const range of MOUNTAIN_RANGES) {
    if (normalized >= range.leftBound && normalized <= range.rightBound) {
      const zuo = range.mountain;
      const xiang = MOUNTAIN_PAIRS[zuo];
      let jianzuo: Mountain | undefined;
      let jianxiang: Mountain | undefined;
      let isJian = false;
      
      // 检查是否在兼向范围内
      if (normalized >= range.centerLeft) {
        // 兼左山
        jianzuo = getAdjacentMountain(zuo, 'left');
        jianxiang = MOUNTAIN_PAIRS[jianzuo];
        isJian = true;
      } else if (normalized <= range.centerRight) {
        // 兼右山
        jianzuo = getAdjacentMountain(zuo, 'right');
        jianxiang = MOUNTAIN_PAIRS[jianzuo];
        isJian = true;
      }
      
      return {
        zuo,
        xiang,
        jianzuo,
        jianxiang,
        isJian,
        ambiguous: false
      };
    }
  }
  
  // 默认返回子山午向
  return {
    zuo: '子',
    xiang: '午',
    isJian: false,
    ambiguous: true
  };
}

// 兼容原有接口
export function angleToMountain(degrees: number, toleranceDeg = 0.5): AngleToMountainResult {
  const result = analyzeLocation(degrees, toleranceDeg);
  return {
    mountain: result.zuo,
    ambiguous: result.ambiguous,
    candidates: result.ambiguous ? [result.zuo, result.jianzuo].filter(Boolean) as Mountain[] : undefined
  };
}
