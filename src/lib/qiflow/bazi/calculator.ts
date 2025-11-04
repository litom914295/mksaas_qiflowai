/**
 * 八字计算核心模块
 * 负责四柱八字的精确计算
 */

import { getSolarTerm } from './solar-lunar';

// 天干
export const TIANGAN = [
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

// 地支
export const DIZHI = [
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

// 五行对应关系
export const WUXING_MAP = {
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

// 十神对应关系
export const SHISHEN_MAP = {
  same: '比肩',
  sameYin: '劫财',
  born: '食神',
  bornYin: '伤官',
  wealth: '偏财',
  wealthYin: '正财',
  control: '七杀',
  controlYin: '正官',
  parent: '偏印',
  parentYin: '正印',
};

/**
 * 计算年柱
 */
export function calculateYearPillar(year: number): {
  stem: string;
  branch: string;
} {
  // 年干支计算（以立春为界）
  const ganIndex = (year - 4) % 10;
  const zhiIndex = (year - 4) % 12;

  return {
    stem: TIANGAN[ganIndex],
    branch: DIZHI[zhiIndex],
  };
}

/**
 * 计算月柱
 */
export function calculateMonthPillar(
  year: number,
  month: number,
  day: number,
  yearStem: string
): { stem: string; branch: string } {
  // 月支固定对应
  const monthBranches = [
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
    '子',
    '丑',
  ];

  // 根据节气调整月份
  const solarTerm = getSolarTerm(year, month, day);
  const adjustedMonth = month - 1; // 农历月份

  // 月干计算：年干决定月干
  const yearGanIndex = TIANGAN.indexOf(yearStem);
  const monthGanStart = (yearGanIndex * 2 + 2) % 10;
  const monthGanIndex = (monthGanStart + adjustedMonth) % 10;

  return {
    stem: TIANGAN[monthGanIndex],
    branch: monthBranches[adjustedMonth],
  };
}

/**
 * 计算日柱
 */
export function calculateDayPillar(
  year: number,
  month: number,
  day: number
): { stem: string; branch: string } {
  // 使用公式计算日柱（简化版）
  const baseDate = new Date(1900, 0, 1); // 庚子日
  const targetDate = new Date(year, month - 1, day);
  const daysDiff = Math.floor(
    (targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const ganIndex = (daysDiff + 6) % 10; // 1900年1月1日是庚子日，庚是第6个天干
  const zhiIndex = daysDiff % 12; // 子是第0个地支

  return {
    stem: TIANGAN[ganIndex],
    branch: DIZHI[zhiIndex],
  };
}

/**
 * 计算时柱
 */
export function calculateHourPillar(
  hour: number,
  dayStem: string
): { stem: string; branch: string } {
  // 时支对应
  const hourBranches = [
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

  // 根据小时确定时支
  const hourIndex = Math.floor((hour + 1) / 2) % 12;
  const hourBranch = hourBranches[hourIndex];

  // 根据日干确定时干
  const dayGanIndex = TIANGAN.indexOf(dayStem);
  const hourGanStart = (dayGanIndex * 2) % 10;
  const hourGanIndex = (hourGanStart + hourIndex) % 10;

  return {
    stem: TIANGAN[hourGanIndex],
    branch: hourBranch,
  };
}

/**
 * 计算五行强弱
 */
export function analyzeFiveElements(pillars: any): Record<string, number> {
  const elements: Record<string, number> = {
    木: 0,
    火: 0,
    土: 0,
    金: 0,
    水: 0,
  };

  // 统计四柱中的五行
  const allElements = [
    pillars.year.stem,
    pillars.year.branch,
    pillars.month.stem,
    pillars.month.branch,
    pillars.day.stem,
    pillars.day.branch,
    pillars.hour.stem,
    pillars.hour.branch,
  ];

  allElements.forEach((item) => {
    const element = WUXING_MAP[item as keyof typeof WUXING_MAP];
    if (element) {
      elements[element]++;
    }
  });

  return elements;
}

/**
 * 计算用神
 */
export function calculateYongShen(
  dayMaster: string,
  fiveElements: Record<string, number>
): {
  primary: string;
  favorable: string[];
  unfavorable: string[];
  colors: string[];
  directions: string[];
  numbers: number[];
} {
  const dayElement = WUXING_MAP[dayMaster as keyof typeof WUXING_MAP];

  // 简化的用神判断逻辑
  const elementStrength = { ...fiveElements };
  const totalElements = Object.values(elementStrength).reduce(
    (sum, val) => sum + val,
    0
  );

  // 判断日主强弱
  const dayMasterStrength = elementStrength[dayElement] / totalElements;
  const isStrong = dayMasterStrength > 0.3;

  // 五行生克关系
  const generating = {
    木: '火',
    火: '土',
    土: '金',
    金: '水',
    水: '木',
  };

  const controlling = {
    木: '土',
    火: '金',
    土: '水',
    金: '木',
    水: '火',
  };

  // 确定用神
  let primary = '';
  const favorable: string[] = [];
  const unfavorable: string[] = [];

  if (isStrong) {
    // 日主强，取克泄耗为用
    primary = controlling[dayElement as keyof typeof controlling];
    favorable.push(primary);
    favorable.push(generating[dayElement as keyof typeof generating]);
    unfavorable.push(dayElement);
  } else {
    // 日主弱，取生扶为用
    const generatingElement = Object.entries(generating).find(
      ([_, v]) => v === dayElement
    )?.[0];
    if (generatingElement) {
      primary = generatingElement;
      favorable.push(primary);
      favorable.push(dayElement);
    }
    unfavorable.push(controlling[dayElement as keyof typeof controlling]);
  }

  // 对应的颜色、方位、数字
  const elementAttributes = {
    木: {
      colors: ['绿色', '青色'],
      directions: ['东', '东南'],
      numbers: [3, 8],
    },
    火: {
      colors: ['红色', '紫色'],
      directions: ['南'],
      numbers: [2, 7],
    },
    土: {
      colors: ['黄色', '棕色'],
      directions: ['中', '西南', '东北'],
      numbers: [5, 0],
    },
    金: {
      colors: ['白色', '金色'],
      directions: ['西', '西北'],
      numbers: [4, 9],
    },
    水: {
      colors: ['黑色', '蓝色'],
      directions: ['北'],
      numbers: [1, 6],
    },
  };

  const primaryAttrs =
    elementAttributes[primary as keyof typeof elementAttributes] ||
    elementAttributes.土;

  return {
    primary,
    favorable,
    unfavorable,
    colors: primaryAttrs.colors,
    directions: primaryAttrs.directions,
    numbers: primaryAttrs.numbers,
  };
}

/**
 * 计算大运
 */
export function calculateDaYun(
  gender: 'male' | 'female',
  yearPillar: { stem: string; branch: string },
  monthPillar: { stem: string; branch: string }
): Array<{ age: number; stem: string; branch: string }> {
  const dayun: Array<{ age: number; stem: string; branch: string }> = [];

  // 判断顺逆
  const yearStemIndex = TIANGAN.indexOf(yearPillar.stem);
  const isYang = yearStemIndex % 2 === 0;
  const isForward =
    (gender === 'male' && isYang) || (gender === 'female' && !isYang);

  // 计算起运年龄（简化）
  const startAge = 8; // 实际需要根据出生日期到节气的天数计算

  // 生成大运
  const monthStemIndex = TIANGAN.indexOf(monthPillar.stem);
  const monthBranchIndex = DIZHI.indexOf(monthPillar.branch);

  for (let i = 0; i < 8; i++) {
    const age = startAge + i * 10;
    const direction = isForward ? 1 : -1;

    const stemIndex = (monthStemIndex + direction * (i + 1) + 10) % 10;
    const branchIndex = (monthBranchIndex + direction * (i + 1) + 12) % 12;

    dayun.push({
      age,
      stem: TIANGAN[stemIndex],
      branch: DIZHI[branchIndex],
    });
  }

  return dayun;
}

/**
 * 计算流年
 */
export function calculateLiuNian(year: number): {
  stem: string;
  branch: string;
} {
  return calculateYearPillar(year);
}

/**
 * 计算十神
 */
export function calculateShiShen(dayStem: string, targetStem: string): string {
  const dayElement = WUXING_MAP[dayStem as keyof typeof WUXING_MAP];
  const targetElement = WUXING_MAP[targetStem as keyof typeof WUXING_MAP];

  const dayIndex = TIANGAN.indexOf(dayStem);
  const targetIndex = TIANGAN.indexOf(targetStem);
  const isSameYinYang = dayIndex % 2 === targetIndex % 2;

  // 五行生克关系判断十神
  if (dayElement === targetElement) {
    return isSameYinYang ? '比肩' : '劫财';
  }

  // 其他十神关系...（简化）
  return '正财';
}

export default {
  calculateYearPillar,
  calculateMonthPillar,
  calculateDayPillar,
  calculateHourPillar,
  analyzeFiveElements,
  calculateYongShen,
  calculateDaYun,
  calculateLiuNian,
  calculateShiShen,
};
