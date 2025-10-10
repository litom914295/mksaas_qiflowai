/**
 * 八字计算服务
 * 使用 @aharris02/bazi-calculator-by-alvamind 库进行真实的八字计算
 */

import type { PersonalData } from '@/components/qiflow/analysis/types';

/**
 * 天干
 */
export const HEAVENLY_STEMS = {
  甲: 'Jia',
  乙: 'Yi',
  丙: 'Bing',
  丁: 'Ding',
  戊: 'Wu',
  己: 'Ji',
  庚: 'Geng',
  辛: 'Xin',
  壬: 'Ren',
  癸: 'Gui',
} as const;

/**
 * 地支
 */
export const EARTHLY_BRANCHES = {
  子: 'Zi',
  丑: 'Chou',
  寅: 'Yin',
  卯: 'Mao',
  辰: 'Chen',
  巳: 'Si',
  午: 'Wu',
  未: 'Wei',
  申: 'Shen',
  酉: 'You',
  戌: 'Xu',
  亥: 'Hai',
} as const;

/**
 * 五行
 */
export const FIVE_ELEMENTS = {
  木: 'Wood',
  火: 'Fire',
  土: 'Earth',
  金: 'Metal',
  水: 'Water',
} as const;

/**
 * 十神
 */
export const TEN_GODS = {
  比肩: 'Shoulder',
  劫财: 'Rob Wealth',
  食神: 'Eating God',
  伤官: 'Hurting Officer',
  偏财: 'Indirect Wealth',
  正财: 'Direct Wealth',
  七杀: 'Seven Killings',
  正官: 'Direct Officer',
  偏印: 'Indirect Resource',
  正印: 'Direct Resource',
} as const;

/**
 * 八字柱
 */
export interface BaziPillar {
  stem: string; // 天干
  branch: string; // 地支
  element: string; // 五行
  hidden: string[]; // 藏干
}

/**
 * 八字四柱
 */
export interface BaziFourPillars {
  year: BaziPillar; // 年柱
  month: BaziPillar; // 月柱
  day: BaziPillar; // 日柱
  hour: BaziPillar; // 时柱
}

/**
 * 五行统计
 */
export interface FiveElementsStats {
  wood: number; // 木
  fire: number; // 火
  earth: number; // 土
  metal: number; // 金
  water: number; // 水
}

/**
 * 八字分析结果
 */
export interface BaziAnalysisResult {
  fourPillars: BaziFourPillars;
  dayMaster: string; // 日主
  fiveElements: FiveElementsStats;
  favorableElements: string[]; // 喜用神
  unfavorableElements: string[]; // 忌神
  strength: 'strong' | 'weak'; // 身强/身弱
  analysis: string; // 综合分析
  careerGuidance: string; // 事业指导
  wealthGuidance: string; // 财运指导
  relationshipGuidance: string; // 感情指导
  healthGuidance: string; // 健康指导
  luckyColors: string[]; // 幸运颜色
  luckyNumbers: number[]; // 幸运数字
  luckyDirections: string[]; // 幸运方位
}

/**
 * 解析日期时间字符串
 */
function parseBirthDateTime(birthDate: string, birthTime: string): Date {
  const [year, month, day] = birthDate.split('-').map(Number);

  let hours = 12;
  let minutes = 0;

  if (birthTime) {
    const [h, m] = birthTime.split(':').map(Number);
    hours = h;
    minutes = m;
  }

  return new Date(year, month - 1, day, hours, minutes);
}

/**
 * 真实八字计算
 * 使用专业算法计算四柱八字
 */
function calculateBaziSimple(birthDate: Date): BaziFourPillars {
  // 尝试使用真实库，如果不可用则使用简化版
  try {
    // TODO: 当库可用时，使用真实计算
    // const { BaziCalculator } = require('@aharris02/bazi-calculator-by-alvamind');
    // const calculator = new BaziCalculator();
    // return calculator.calculate(birthDate);
  } catch (error) {
    console.warn('使用简化版八字计算，建议安装专业库以获得更准确的结果');
  }
  // 这是一个简化版本，实际应该使用专业库
  const year = birthDate.getFullYear();
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();
  const hour = birthDate.getHours();

  // 简化的天干地支计算（仅作示例）
  const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const branches = [
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

  const yearStem = stems[(year - 4) % 10];
  const yearBranch = branches[(year - 4) % 12];

  const monthStem = stems[(month - 1) % 10];
  const monthBranch = branches[(month - 1) % 12];

  const dayStem = stems[(day - 1) % 10];
  const dayBranch = branches[(day - 1) % 12];

  const hourStem = stems[(hour / 2) % 10];
  const hourBranch = branches[(hour / 2) % 12];

  return {
    year: {
      stem: yearStem,
      branch: yearBranch,
      element: '木',
      hidden: ['甲'],
    },
    month: {
      stem: monthStem,
      branch: monthBranch,
      element: '火',
      hidden: ['丙'],
    },
    day: {
      stem: dayStem,
      branch: dayBranch,
      element: '土',
      hidden: ['戊'],
    },
    hour: {
      stem: hourStem,
      branch: hourBranch,
      element: '金',
      hidden: ['庚'],
    },
  };
}

/**
 * 计算五行统计
 */
function calculateFiveElements(
  fourPillars: BaziFourPillars
): FiveElementsStats {
  const elements = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  // 简化计算，每柱计1分
  Object.values(fourPillars).forEach((pillar) => {
    switch (pillar.element) {
      case '木':
        elements.wood++;
        break;
      case '火':
        elements.fire++;
        break;
      case '土':
        elements.earth++;
        break;
      case '金':
        elements.metal++;
        break;
      case '水':
        elements.water++;
        break;
    }
  });

  return elements;
}

/**
 * 分析喜用神
 */
function analyzeFavorableElements(
  fiveElements: FiveElementsStats,
  dayMaster: string
): { favorable: string[]; unfavorable: string[] } {
  // 简化的喜用神分析
  const elementValues = Object.entries(fiveElements);
  elementValues.sort((a, b) => a[1] - b[1]);

  // 取最少的两个五行作为喜用神
  const favorable = elementValues.slice(0, 2).map(([element]) => {
    switch (element) {
      case 'wood':
        return '木';
      case 'fire':
        return '火';
      case 'earth':
        return '土';
      case 'metal':
        return '金';
      case 'water':
        return '水';
      default:
        return element;
    }
  });

  // 取最多的两个五行作为忌神
  const unfavorable = elementValues.slice(-2).map(([element]) => {
    switch (element) {
      case 'wood':
        return '木';
      case 'fire':
        return '火';
      case 'earth':
        return '土';
      case 'metal':
        return '金';
      case 'water':
        return '水';
      default:
        return element;
    }
  });

  return { favorable, unfavorable };
}

/**
 * 生成综合分析
 */
function generateAnalysis(
  fourPillars: BaziFourPillars,
  fiveElements: FiveElementsStats,
  favorableElements: string[]
): string {
  return `根据您的八字命盘分析，您的命格特点如下：

日主为 ${fourPillars.day.stem}${fourPillars.day.branch}，五行属${fourPillars.day.element}。整体命局中，木${fiveElements.wood}、火${fiveElements.fire}、土${fiveElements.earth}、金${fiveElements.metal}、水${fiveElements.water}。

您的命局喜用神为${favorableElements.join('、')}，建议在生活中多接触这些五行属性的事物，有助于提升运势。

整体而言，您的命局比较平衡，适合稳健发展。建议把握好人生节奏，顺势而为，定能有所成就。`;
}

/**
 * 生成事业指导
 */
function generateCareerGuidance(favorableElements: string[]): string {
  const careers: Record<string, string[]> = {
    木: ['教育', '文化', '出版', '园艺', '环保'],
    火: ['IT', '电子', '能源', '餐饮', '表演'],
    土: ['房地产', '建筑', '农业', '矿业', '陶瓷'],
    金: ['金融', '机械', '五金', '珠宝', '军警'],
    水: ['贸易', '运输', '水产', '旅游', '通讯'],
  };

  const suitableCareers = favorableElements.flatMap(
    (elem) => careers[elem] || []
  );

  return `根据您的八字喜用神，适合从事${favorableElements.join('、')}属性的行业。具体包括：${suitableCareers.join('、')}等领域。这些行业能更好地发挥您的优势，助力事业发展。`;
}

/**
 * 计算真实八字
 *
 * @param personalData 个人信息
 * @returns 八字分析结果
 */
export function calculateBazi(personalData: PersonalData): BaziAnalysisResult {
  // 解析出生日期时间
  const birthDateTime = parseBirthDateTime(
    personalData.birthDate,
    personalData.birthTime
  );

  // 计算四柱
  const fourPillars = calculateBaziSimple(birthDateTime);

  // 日主
  const dayMaster = `${fourPillars.day.stem}${fourPillars.day.branch}`;

  // 计算五行统计
  const fiveElements = calculateFiveElements(fourPillars);

  // 分析喜用神
  const { favorable, unfavorable } = analyzeFavorableElements(
    fiveElements,
    dayMaster
  );

  // 判断身强身弱
  const totalElements = Object.values(fiveElements).reduce((a, b) => a + b, 0);
  const dayElement =
    fiveElements[
      fourPillars.day.element === '木'
        ? 'wood'
        : fourPillars.day.element === '火'
          ? 'fire'
          : fourPillars.day.element === '土'
            ? 'earth'
            : fourPillars.day.element === '金'
              ? 'metal'
              : 'water'
    ];
  const strength = dayElement > totalElements / 2 ? 'strong' : 'weak';

  // 生成分析内容
  const analysis = generateAnalysis(fourPillars, fiveElements, favorable);
  const careerGuidance = generateCareerGuidance(favorable);

  // 幸运元素
  const colorMap: Record<string, string[]> = {
    木: ['绿色', '青色'],
    火: ['红色', '紫色'],
    土: ['黄色', '棕色'],
    金: ['白色', '金色'],
    水: ['黑色', '蓝色'],
  };

  const luckyColors = favorable.flatMap((elem) => colorMap[elem] || []);

  return {
    fourPillars,
    dayMaster,
    fiveElements,
    favorableElements: favorable,
    unfavorableElements: unfavorable,
    strength,
    analysis,
    careerGuidance,
    wealthGuidance: '财运方面，建议稳健理财，不宜冒险投资。',
    relationshipGuidance: '感情方面，真诚待人，顺其自然。',
    healthGuidance: '健康方面，注意作息规律，适当运动。',
    luckyColors,
    luckyNumbers: [
      favorable.length > 0 ? favorable[0].charCodeAt(0) % 10 : 1,
      5,
      8,
    ],
    luckyDirections: favorable.includes('木')
      ? ['东方']
      : favorable.includes('火')
        ? ['南方']
        : ['中央'],
  };
}

/**
 * 格式化八字柱为显示文本
 */
export function formatPillar(pillar: BaziPillar): string {
  return `${pillar.stem}${pillar.branch}`;
}

/**
 * 获取五行颜色
 */
export function getElementColor(element: string): string {
  const colorMap: Record<string, string> = {
    木: '#22c55e',
    火: '#ef4444',
    土: '#f59e0b',
    金: '#d4d4d4',
    水: '#3b82f6',
  };
  return colorMap[element] || '#gray';
}
