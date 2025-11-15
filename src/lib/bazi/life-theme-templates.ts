/**
 * 人生主题模板库
 * 
 * 基于格局类型、大运走势、当前年龄生成个性化人生主题故事
 * 核心理念：给用户"苦难意义化"的解释，提供"过去-现在-未来"连贯叙事
 */

import type { LifeThemeStage } from '@/types/report-v2-2';

/**
 * 主题类型枚举
 */
export type ThemeType =
  | 'counter_attack' // 逆袭型：前弱后强
  | 'smooth_sailing' // 顺势而为型：从格或用神得力
  | 'steady_growth' // 稳步成长型：大运平稳
  | 'accumulate_burst' // 先蓄力后爆发型：早年忌神晚年用神
  | 'specialist' // 专精型：格局纯粹
  | 'adaptive'; // 灵活应变型：格局复杂或混杂

/**
 * 主题模板定义
 */
export interface LifeThemeTemplate {
  type: ThemeType;
  title: string;
  summaryTemplate: string; // 占位符：{{age}}, {{pattern}}, {{element}}
  characteristics: string[]; // 特征标签
  stagePatterns: {
    early: { ages: string; theme: string; keyEvents: string[]; lesson: string };
    middle: { ages: string; theme: string; keyEvents: string[]; lesson: string };
    late: { ages: string; theme: string; keyEvents: string[]; lesson: string };
  };
}

/**
 * 人生主题模板库
 */
export const LIFE_THEME_TEMPLATES: Record<ThemeType, LifeThemeTemplate> = {
  counter_attack: {
    type: 'counter_attack',
    title: '破茧成蝶：从逆境到辉煌',
    summaryTemplate:
      '您的八字格局{{pattern}}，用神为{{element}}。您的命格属于"先抑后扬"型，早年磨砺是为中晚年的爆发积蓄能量。' +
      '当前{{age}}岁，正处于{{currentStage}}阶段，前期的艰难是必经之路，转折点即将到来。',
    characteristics: ['大器晚成', '逆袭', '中晚年兴旺', '早年磨砺'],
    stagePatterns: {
      early: {
        ages: '18-35岁',
        theme: '蓄力磨砺期',
        keyEvents: ['职业探索受阻', '经济压力', '人际磨合', '能力积累'],
        lesson: '学会忍耐与坚持，积累经验和资源，不要因挫折而自我否定',
      },
      middle: {
        ages: '36-50岁',
        theme: '突破崛起期',
        keyEvents: ['事业转机出现', '收入显著提升', '社会地位上升', '贵人相助'],
        lesson: '把握机遇，果断行动，前期积累的经验开始转化为成果',
      },
      late: {
        ages: '51-65岁',
        theme: '收获巩固期',
        keyEvents: ['事业稳定', '财富积累', '家庭和睦', '社会影响力'],
        lesson: '享受成果，传承经验，回馈社会，培养后进',
      },
    },
  },

  smooth_sailing: {
    type: 'smooth_sailing',
    title: '顺水行舟：把握天时',
    summaryTemplate:
      '您的八字格局{{pattern}}，属于顺势型格局。您的命格与时运相合，只要顺势而为，就能乘风破浪。' +
      '当前{{age}}岁，天时已至，关键在于策略得当、行动迅速。',
    characteristics: ['天赋异禀', '顺势而为', '早年得志', '持续发展'],
    stagePatterns: {
      early: {
        ages: '18-35岁',
        theme: '快速成长期',
        keyEvents: ['学业顺利', '职业起步快', '早期成功', '人脉积累'],
        lesson: '抓住机会，快速成长，但要避免骄傲自满，保持谦逊',
      },
      middle: {
        ages: '36-50岁',
        theme: '稳定发展期',
        keyEvents: ['事业稳固', '收入稳定增长', '家庭美满', '社会认可'],
        lesson: '稳中求进，拓展版图，注意风险管理，避免盲目扩张',
      },
      late: {
        ages: '51-65岁',
        theme: '持续巅峰期',
        keyEvents: ['行业地位巩固', '财富自由', '影响力扩大', '传承布局'],
        lesson: '维持高位，培养接班人，布局长期价值，注重健康养生',
      },
    },
  },

  steady_growth: {
    type: 'steady_growth',
    title: '稳步前行：踏实积累',
    summaryTemplate:
      '您的八字格局{{pattern}}，用神为{{element}}。您的命格属于"稳健型"，虽无大起大落，但步步为营，最终可达高峰。' +
      '当前{{age}}岁，保持稳定节奏，持续积累，厚积薄发。',
    characteristics: ['稳健', '持续进步', '少波折', '长期主义'],
    stagePatterns: {
      early: {
        ages: '18-35岁',
        theme: '基础积累期',
        keyEvents: ['学业扎实', '职业起步', '技能建设', '人脉建立'],
        lesson: '打好基础，学习核心技能，建立稳定的职业路径',
      },
      middle: {
        ages: '36-50岁',
        theme: '稳步上升期',
        keyEvents: ['职位晋升', '收入增长', '家庭稳定', '社会地位提升'],
        lesson: '继续深耕专业，扩大影响力，注重家庭和健康平衡',
      },
      late: {
        ages: '51-65岁',
        theme: '成熟收获期',
        keyEvents: ['事业成熟', '财务安全', '生活质量提升', '退休规划'],
        lesson: '享受稳定成果，规划退休生活，传承经验给后辈',
      },
    },
  },

  accumulate_burst: {
    type: 'accumulate_burst',
    title: '厚积薄发：等待绽放',
    summaryTemplate:
      '您的八字格局{{pattern}}，用神为{{element}}。您的命格属于"蓄势待发"型，早年的沉淀是为了后期的爆发。' +
      '当前{{age}}岁，{{currentStage}}阶段，积蓄的能量即将释放。',
    characteristics: ['后发制人', '积累型', '中期爆发', '长线投资'],
    stagePatterns: {
      early: {
        ages: '18-35岁',
        theme: '沉淀蓄力期',
        keyEvents: ['学习深造', '能力积累', '经验沉淀', '人脉铺垫'],
        lesson: '专注学习和积累，不要急于求成，耐心等待时机',
      },
      middle: {
        ages: '36-50岁',
        theme: '爆发突破期',
        keyEvents: ['事业爆发', '收入激增', '影响力扩大', '成果显现'],
        lesson: '把握爆发期，全力以赴，前期积累迅速转化为成果',
      },
      late: {
        ages: '51-65岁',
        theme: '稳定享受期',
        keyEvents: ['事业稳固', '财富自由', '生活品质', '社会贡献'],
        lesson: '享受爆发期成果，稳健投资，注重健康和家庭',
      },
    },
  },

  specialist: {
    type: 'specialist',
    title: '专精致胜：深耕细作',
    summaryTemplate:
      '您的八字格局{{pattern}}，格局纯粹有力。您的命格属于"专家型"，适合在特定领域深耕，成为行业专家。' +
      '当前{{age}}岁，专注比广度更重要，深度是您的优势。',
    characteristics: ['专业主义', '深度优先', '行业专家', '精益求精'],
    stagePatterns: {
      early: {
        ages: '18-35岁',
        theme: '专业建立期',
        keyEvents: ['选定领域', '技能深造', '专业认证', '初步成名'],
        lesson: '选择并深耕一个领域，避免频繁跳槽，建立专业口碑',
      },
      middle: {
        ages: '36-50岁',
        theme: '专家确立期',
        keyEvents: ['行业专家', '收入可观', '影响力扩大', '话语权建立'],
        lesson: '巩固专家地位，扩大影响力，成为行业意见领袖',
      },
      late: {
        ages: '51-65岁',
        theme: '大师传承期',
        keyEvents: ['行业泰斗', '著书立说', '培养后进', '社会荣誉'],
        lesson: '传承专业知识，培养接班人，留下学术/技术遗产',
      },
    },
  },

  adaptive: {
    type: 'adaptive',
    title: '灵活应变：多元发展',
    summaryTemplate:
      '您的八字格局{{pattern}}，格局灵活多变。您的命格属于"多面手型"，适合多元化发展，应变能力强。' +
      '当前{{age}}岁，灵活性是您的优势，多尝试、快调整是您的策略。',
    characteristics: ['多面手', '灵活应变', '多元发展', '快速调整'],
    stagePatterns: {
      early: {
        ages: '18-35岁',
        theme: '探索尝试期',
        keyEvents: ['多领域尝试', '跨界学习', '快速迭代', '机会捕捉'],
        lesson: '大胆尝试不同方向，快速试错，找到最适合自己的路径',
      },
      middle: {
        ages: '36-50岁',
        theme: '聚焦突破期',
        keyEvents: ['聚焦主业', '跨界优势', '资源整合', '综合价值'],
        lesson: '在多元经验基础上聚焦，发挥跨界优势，整合资源',
      },
      late: {
        ages: '51-65岁',
        theme: '多元收获期',
        keyEvents: ['多元收入', '投资回报', '跨界影响力', '丰富人生'],
        lesson: '享受多元化布局的成果，平衡投资，丰富退休生活',
      },
    },
  },
};

/**
 * 根据格局和大运走势判断主题类型
 * @param pattern - 格局名称
 * @param luckTrend - 大运走势（'weak_to_strong' | 'strong' | 'stable' | 'weak'）
 * @param patternPurity - 格局纯度
 * @returns 主题类型
 */
export function determineThemeType(
  pattern: string,
  luckTrend: 'weak_to_strong' | 'strong' | 'stable' | 'weak',
  patternPurity: string
): ThemeType {
  const patternLower = pattern.toLowerCase();

  // 1. 从格/专旺格 → 顺势而为型
  if (
    patternLower.includes('从') ||
    patternLower.includes('专旺') ||
    patternLower.includes('炎上') ||
    patternLower.includes('润下') ||
    patternLower.includes('稼穑') ||
    patternLower.includes('从革') ||
    patternLower.includes('曲直')
  ) {
    return 'smooth_sailing';
  }

  // 2. 格局纯粹 → 专精型
  if (patternPurity === 'pure') {
    return 'specialist';
  }

  // 3. 大运前弱后强 → 逆袭型
  if (luckTrend === 'weak_to_strong') {
    return 'counter_attack';
  }

  // 4. 大运当前就强 → 先蓄力后爆发
  if (luckTrend === 'strong') {
    return 'accumulate_burst';
  }

  // 5. 大运平稳 → 稳步成长型
  if (luckTrend === 'stable') {
    return 'steady_growth';
  }

  // 6. 格局复杂/破损 → 灵活应变型
  if (patternPurity === 'broken' || patternPurity === 'mixed') {
    return 'adaptive';
  }

  // 默认：稳步成长型
  return 'steady_growth';
}

/**
 * 分析大运走势
 * @param luckPillars - 大运数组
 * @param currentAge - 当前年龄
 * @param usefulGod - 用神
 * @returns 大运走势类型
 */
export function analyzeLuckTrend(
  luckPillars: any[],
  currentAge: number,
  usefulGod: any
): 'weak_to_strong' | 'strong' | 'stable' | 'weak' {
  if (!luckPillars || luckPillars.length === 0) {
    return 'stable';
  }

  // 找当前及未来3个大运
  const relevantPillars = luckPillars.filter((pillar: any) => {
    const startAge = pillar.startAge || pillar.age || 0;
    return startAge <= currentAge + 30; // 当前+未来30年
  });

  if (relevantPillars.length < 2) {
    return 'stable';
  }

  // 评估每个大运的"好坏"（简化评估：是否含用神）
  const scores: number[] = relevantPillars.map((pillar: any) => {
    const usefulElement =
      typeof usefulGod === 'object' ? usefulGod?.element : usefulGod;
    const stemEl = pillar.heavenlyStem?.element || pillar.stem?.element;
    const branchEl = pillar.earthlyBranch?.element || pillar.branch?.element;

    if (stemEl === usefulElement && branchEl === usefulElement) return 2; // 双重有利
    if (stemEl === usefulElement || branchEl === usefulElement) return 1; // 单项有利
    return 0; // 不利
  });

  // 判断趋势
  const earlyScore = scores.slice(0, Math.ceil(scores.length / 2)).reduce((a, b) => a + b, 0);
  const lateScore = scores.slice(Math.ceil(scores.length / 2)).reduce((a, b) => a + b, 0);

  if (lateScore > earlyScore * 1.5) {
    return 'weak_to_strong'; // 前弱后强
  } else if (earlyScore > lateScore * 1.5) {
    return 'strong'; // 前强后弱（但"先蓄力后爆发"的话术更积极）
  } else if (earlyScore >= scores.length * 0.6) {
    return 'strong'; // 整体强
  } else if (earlyScore <= scores.length * 0.3) {
    return 'weak'; // 整体弱
  } else {
    return 'stable'; // 平稳
  }
}
