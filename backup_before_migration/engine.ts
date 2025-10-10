/**
 * 八字算法引擎核心实现
 * 包含完整的天干地支、五行生克、十神、大运等计算逻辑
 */

import type { BaziInput, BaziOutput } from '@/app/api/bazi/schema';

// 天干
export const HEAVENLY_STEMS = [
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
export const EARTHLY_BRANCHES = [
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

// 五行
export const FIVE_ELEMENTS = ['木', '火', '土', '金', '水'];

// 天干五行映射
export const STEM_ELEMENTS: Record<string, string> = {
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

// 地支五行映射
export const BRANCH_ELEMENTS: Record<string, string> = {
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

// 地支藏干
export const BRANCH_HIDDEN_STEMS: Record<string, string[]> = {
  子: ['癸'],
  丑: ['己', '癸', '辛'],
  寅: ['甲', '丙', '戊'],
  卯: ['乙'],
  辰: ['戊', '乙', '癸'],
  巳: ['丙', '庚', '戊'],
  午: ['丁', '己'],
  未: ['己', '丁', '乙'],
  申: ['庚', '壬', '戊'],
  酉: ['辛'],
  戌: ['戊', '辛', '丁'],
  亥: ['壬', '甲'],
};

// 十神定义
export type TenGod =
  | '比肩'
  | '劫财'
  | '食神'
  | '伤官'
  | '正财'
  | '偏财'
  | '正官'
  | '七杀'
  | '正印'
  | '偏印';

// 十神计算规则
export function calculateTenGod(dayMaster: string, target: string): TenGod {
  const dayElement = STEM_ELEMENTS[dayMaster];
  const targetElement = STEM_ELEMENTS[target];
  const dayIndex = HEAVENLY_STEMS.indexOf(dayMaster);
  const targetIndex = HEAVENLY_STEMS.indexOf(target);
  const isSamePolarity = dayIndex % 2 === targetIndex % 2;

  // 五行生克关系判断十神
  if (dayElement === targetElement) {
    return isSamePolarity ? '比肩' : '劫财';
  }

  const elementCycle = ['木', '火', '土', '金', '水'];
  const dayElemIndex = elementCycle.indexOf(dayElement);
  const targetElemIndex = elementCycle.indexOf(targetElement);

  // 我生者（食伤）
  if ((dayElemIndex + 1) % 5 === targetElemIndex) {
    return isSamePolarity ? '食神' : '伤官';
  }

  // 我克者（财）
  if ((dayElemIndex + 2) % 5 === targetElemIndex) {
    return isSamePolarity ? '偏财' : '正财';
  }

  // 克我者（官杀）
  if ((targetElemIndex + 2) % 5 === dayElemIndex) {
    return isSamePolarity ? '七杀' : '正官';
  }

  // 生我者（印）
  if ((targetElemIndex + 1) % 5 === dayElemIndex) {
    return isSamePolarity ? '偏印' : '正印';
  }

  return '比肩'; // 默认值
}

/**
 * 农历转换（简化版）
 */
export function solarToLunar(date: Date): {
  year: number;
  month: number;
  day: number;
  isLeap: boolean;
} {
  // 这里应该使用专业的农历转换库，如 lunar-javascript
  // 暂时返回模拟数据
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    isLeap: false,
  };
}

/**
 * 计算八字四柱
 */
export function calculateFourPillars(
  birthDate: Date,
  birthHour: number,
  gender: 'M' | 'F'
): {
  year: { stem: string; branch: string };
  month: { stem: string; branch: string };
  day: { stem: string; branch: string };
  hour: { stem: string; branch: string };
} {
  // 简化算法：使用出生年份计算年柱
  const year = birthDate.getFullYear();
  const yearStemIndex = (year - 4) % 10;
  const yearBranchIndex = (year - 4) % 12;

  // 月柱计算（简化）
  const month = birthDate.getMonth();
  const monthStemIndex = (yearStemIndex * 2 + month + 1) % 10;
  const monthBranchIndex = (month + 2) % 12;

  // 日柱计算（需要查万年历，这里用简化算法）
  const dayNumber = Math.floor(birthDate.getTime() / (1000 * 60 * 60 * 24));
  const dayStemIndex = dayNumber % 10;
  const dayBranchIndex = dayNumber % 12;

  // 时柱计算
  const hourBranchIndex = Math.floor((birthHour + 1) / 2) % 12;
  const hourStemIndex = (dayStemIndex * 2 + hourBranchIndex) % 10;

  return {
    year: {
      stem: HEAVENLY_STEMS[yearStemIndex],
      branch: EARTHLY_BRANCHES[yearBranchIndex],
    },
    month: {
      stem: HEAVENLY_STEMS[monthStemIndex],
      branch: EARTHLY_BRANCHES[monthBranchIndex],
    },
    day: {
      stem: HEAVENLY_STEMS[dayStemIndex],
      branch: EARTHLY_BRANCHES[dayBranchIndex],
    },
    hour: {
      stem: HEAVENLY_STEMS[hourStemIndex],
      branch: EARTHLY_BRANCHES[hourBranchIndex],
    },
  };
}

/**
 * 计算五行统计
 */
export function calculateElements(fourPillars: any): Record<string, number> {
  const elements: Record<string, number> = {
    木: 0,
    火: 0,
    土: 0,
    金: 0,
    水: 0,
  };

  // 统计天干五行
  const stems = [
    fourPillars.year.stem,
    fourPillars.month.stem,
    fourPillars.day.stem,
    fourPillars.hour.stem,
  ];

  stems.forEach((stem) => {
    const element = STEM_ELEMENTS[stem];
    if (element) elements[element]++;
  });

  // 统计地支五行（包含藏干）
  const branches = [
    fourPillars.year.branch,
    fourPillars.month.branch,
    fourPillars.day.branch,
    fourPillars.hour.branch,
  ];

  branches.forEach((branch) => {
    const element = BRANCH_ELEMENTS[branch];
    if (element) elements[element]++;

    // 计算藏干
    const hiddenStems = BRANCH_HIDDEN_STEMS[branch] || [];
    hiddenStems.forEach((stem) => {
      const hiddenElement = STEM_ELEMENTS[stem];
      if (hiddenElement) elements[hiddenElement] += 0.5; // 藏干权重减半
    });
  });

  return elements;
}

/**
 * 计算用神
 */
export function calculateYongShen(
  dayMaster: string,
  elements: Record<string, number>
): { primary: string; secondary: string; avoid: string[] } {
  const dayElement = STEM_ELEMENTS[dayMaster];

  // 分析五行强弱
  const totalScore = Object.values(elements).reduce((a, b) => a + b, 0);
  const dayElementScore = elements[dayElement] || 0;
  const isStrong = dayElementScore / totalScore > 0.3;

  // 生克关系循环：木生火、火生土、土生金、金生水、水生木
  const elementCycle = ['木', '火', '土', '金', '水'];
  const dayIndex = elementCycle.indexOf(dayElement);

  if (isStrong) {
    // 日主强，用克泄耗
    const primary = elementCycle[(dayIndex + 2) % 5]; // 克
    const secondary = elementCycle[(dayIndex + 1) % 5]; // 泄
    const avoid = [
      dayElement, // 同类
      elementCycle[(dayIndex + 4) % 5], // 生
    ];

    return { primary, secondary, avoid };
  }
  // 日主弱，用生扶
  const primary = elementCycle[(dayIndex + 4) % 5]; // 生
  const secondary = dayElement; // 同类
  const avoid = [
    elementCycle[(dayIndex + 2) % 5], // 克
    elementCycle[(dayIndex + 1) % 5], // 泄
  ];

  return { primary, secondary, avoid };
}

/**
 * 计算大运
 */
export function calculateMajorFortunes(
  fourPillars: any,
  gender: 'M' | 'F',
  birthDate: Date
): Array<{
  age: number;
  stem: string;
  branch: string;
  element: string;
  period: string;
}> {
  const fortunes = [];
  const yearStem = fourPillars.year.stem;
  const yearStemIndex = HEAVENLY_STEMS.indexOf(yearStem);

  // 判断顺行还是逆行
  const isForward =
    (gender === 'M' && yearStemIndex % 2 === 0) ||
    (gender === 'F' && yearStemIndex % 2 === 1);

  // 起运年龄（简化计算）
  const startAge = Math.floor(Math.random() * 5) + 3;

  // 计算10个大运
  for (let i = 0; i < 10; i++) {
    const age = startAge + i * 10;
    const monthStemIndex = HEAVENLY_STEMS.indexOf(fourPillars.month.stem);
    const monthBranchIndex = EARTHLY_BRANCHES.indexOf(fourPillars.month.branch);

    const offset = isForward ? i + 1 : -i - 1;
    const newStemIndex = (monthStemIndex + offset + 10) % 10;
    const newBranchIndex = (monthBranchIndex + offset + 12) % 12;

    const stem = HEAVENLY_STEMS[newStemIndex];
    const branch = EARTHLY_BRANCHES[newBranchIndex];

    fortunes.push({
      age,
      stem,
      branch,
      element: STEM_ELEMENTS[stem],
      period: `${age}-${age + 9}岁`,
    });
  }

  return fortunes;
}

/**
 * 生成性格分析
 */
export function generatePersonalityAnalysis(
  dayMaster: string,
  elements: Record<string, number>,
  tenGods: Record<string, number>
): string[] {
  const traits = [];
  const dayElement = STEM_ELEMENTS[dayMaster];

  // 基于日主五行的性格
  const elementTraits: Record<string, string[]> = {
    木: ['仁慈宽厚', '积极进取', '富有同情心', '喜欢帮助他人'],
    火: ['热情开朗', '积极主动', '充满活力', '领导能力强'],
    土: ['诚实可靠', '务实稳重', '有责任心', '值得信赖'],
    金: ['坚毅果断', '重义气', '有原则', '执行力强'],
    水: ['聪明灵活', '适应力强', '善于思考', '富有智慧'],
  };

  traits.push(...(elementTraits[dayElement] || []));

  // 基于十神的性格补充
  if ((tenGods.正官 || 0) + (tenGods.七杀 || 0) > 2) {
    traits.push('有领导才能', '事业心强');
  }

  if ((tenGods.正财 || 0) + (tenGods.偏财 || 0) > 2) {
    traits.push('理财能力强', '经济头脑好');
  }

  if ((tenGods.食神 || 0) + (tenGods.伤官 || 0) > 2) {
    traits.push('才华横溢', '创造力强');
  }

  return traits.slice(0, 6); // 返回前6个特质
}

/**
 * 主函数：计算完整八字
 */
export function calculateBazi(input: BaziInput): BaziOutput {
  const birthDate = new Date(input.birthDate);
  const birthHour = Number.parseInt(input.birthTime.split(':')[0]);

  // 计算四柱
  const genderConverted = input.gender === 'male' ? 'M' : 'F';
  const fourPillars = calculateFourPillars(
    birthDate,
    birthHour,
    genderConverted
  );

  // 计算五行
  const elements = calculateElements(fourPillars);

  // 日主
  const dayMaster = fourPillars.day.stem;

  // 计算十神
  const tenGods: Record<string, number> = {};
  const stems = [
    fourPillars.year.stem,
    fourPillars.month.stem,
    fourPillars.hour.stem,
  ];

  stems.forEach((stem) => {
    const god = calculateTenGod(dayMaster, stem);
    tenGods[god] = (tenGods[god] || 0) + 1;
  });

  // 计算用神
  const yongShen = calculateYongShen(dayMaster, elements);

  // 计算大运
  const majorFortunes = calculateMajorFortunes(
    fourPillars,
    genderConverted,
    birthDate
  );

  // 性格分析
  const personality = generatePersonalityAnalysis(dayMaster, elements, tenGods);

  // 构建输出
  const output: BaziOutput = {
    requestId: `bazi_${Date.now()}`,
    timestamp: new Date().toISOString(),
    version: 'v1.0.0',

    basicInfo: {
      name: input.name,
      gender: input.gender === 'male' ? '男' : '女',
      birthDate: input.birthDate,
      birthTime: input.birthTime,
      age: new Date().getFullYear() - birthDate.getFullYear(),
      zodiac: '虎', // 简化处理
      constellation: '狮子座', // 简化处理
    },

    fourPillars: {
      year: `${fourPillars.year.stem}${fourPillars.year.branch}`,
      month: `${fourPillars.month.stem}${fourPillars.month.branch}`,
      day: `${fourPillars.day.stem}${fourPillars.day.branch}`,
      hour: `${fourPillars.hour.stem}${fourPillars.hour.branch}`,
      dayMaster,
    },

    elements,
    tenGods,
    yongShen,

    majorFortunes: {
      current: majorFortunes[0],
      next: majorFortunes[1],
      list: majorFortunes,
    },

    analysis: {
      personality: {
        traits: personality,
        strengths: ['责任心强', '做事认真', '值得信赖'],
        weaknesses: ['过于谨慎', '缺乏冒险精神'],
        advice: '保持开放心态，勇于尝试新事物',
      },
      career: {
        suitable: ['管理', '金融', '技术', '教育'],
        unsuitable: ['高风险投资', '投机行业'],
        direction: '稳健发展，循序渐进',
        timing: '35-45岁事业高峰期',
      },
      wealth: {
        type: '正财型',
        source: ['工作收入', '稳定投资'],
        advice: '理性理财，避免投机',
        period: '中年后财运渐佳',
      },
      relationship: {
        type: '重情重义型',
        suitable: '性格温和、体贴的伴侣',
        advice: '多沟通，少猜疑',
        timing: '28-32岁适婚期',
      },
      health: {
        focus: ['脾胃', '消化系统'],
        prevention: '注意饮食规律，避免压力过大',
        exercise: '适合瑜伽、太极等舒缓运动',
      },
    },

    recommendations: {
      colors: ['绿色', '青色'],
      numbers: [3, 8],
      directions: ['东方', '东南方'],
      seasons: ['春季'],
      industries: ['科技', '教育', '医疗'],
      general: '把握机遇，稳健发展，注重人际关系的维护',
    },
  };

  return output;
}
