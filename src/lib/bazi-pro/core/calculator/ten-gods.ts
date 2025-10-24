/**
 * 十神计算器
 */

export interface TenGod {
  name: string;
  count: number;
}

export interface TenGodsResult {
  正官: number;
  偏官: number;
  正印: number;
  偏印: number;
  比肩: number;
  劫财: number;
  食神: number;
  伤官: number;
  正财: number;
  偏财: number;
}

// 天干五行映射
const STEM_ELEMENTS: Record<string, string> = {
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
};

// 天干阴阳
const STEM_POLARITY: Record<string, string> = {
  甲: '阳',
  乙: '阴',
  丙: '阳',
  丁: '阴',
  戊: '阳',
  己: '阴',
  庚: '阳',
  辛: '阴',
  壬: '阳',
  癸: '阴',
};

// 五行生克关系
const ELEMENT_RELATIONS: Record<string, Record<string, string>> = {
  木: { 生: '火', 克: '土' },
  火: { 生: '土', 克: '金' },
  土: { 生: '金', 克: '水' },
  金: { 生: '水', 克: '木' },
  水: { 生: '木', 克: '火' },
};

/**
 * 根据日主和其他天干的关系计算十神
 */
function getTenGod(dayStem: string, otherStem: string): string {
  const dayElement = STEM_ELEMENTS[dayStem];
  const otherElement = STEM_ELEMENTS[otherStem];
  const dayPolarity = STEM_POLARITY[dayStem];
  const otherPolarity = STEM_POLARITY[otherStem];
  const samePolarity = dayPolarity === otherPolarity;

  // 同类：比肩、劫财
  if (dayElement === otherElement) {
    return samePolarity ? '比肩' : '劫财';
  }

  // 我生：食神、伤官
  if (ELEMENT_RELATIONS[dayElement]['生'] === otherElement) {
    return samePolarity ? '食神' : '伤官';
  }

  // 我克：正财、偏财
  if (ELEMENT_RELATIONS[dayElement]['克'] === otherElement) {
    return samePolarity ? '偏财' : '正财';
  }

  // 克我：正官、七杀（偏官）
  if (ELEMENT_RELATIONS[otherElement]['克'] === dayElement) {
    return samePolarity ? '偏官' : '正官';
  }

  // 生我：正印、偏印
  if (ELEMENT_RELATIONS[otherElement]['生'] === dayElement) {
    return samePolarity ? '偏印' : '正印';
  }

  return '未知';
}

export function calculateTenGods(fourPillars: any): TenGodsResult {
  const result: TenGodsResult = {
    正官: 0,
    偏官: 0,
    正印: 0,
    偏印: 0,
    比肩: 0,
    劫财: 0,
    食神: 0,
    伤官: 0,
    正财: 0,
    偏财: 0,
  };

  if (!fourPillars || !fourPillars.day || !fourPillars.day.gan) {
    return result;
  }

  const dayStem = fourPillars.day.gan;

  // 计算年干、月干、时干的十神
  const stems = [
    fourPillars.year?.gan,
    fourPillars.month?.gan,
    fourPillars.hour?.gan,
  ];

  for (const stem of stems) {
    if (stem && stem !== dayStem) {
      const tenGod = getTenGod(dayStem, stem);
      if (tenGod in result) {
        (result as any)[tenGod]++;
      }
    }
  }

  return result;
}

export const tenGodsCalculator = {
  calculate: calculateTenGods,
};
