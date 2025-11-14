/**
 * 人生主题故事模板库
 *
 * 用于：根据八字格局、用神、大运生成统一的生命叙事
 * 基于：4种核心人生主题类型
 */

import type { PatternStrength, PatternType, TenGod } from '@/types/report-v2.2';

// ============ 人生主题类型 ============

export type LifeThemeType =
  | 'follow' // 顺势而为型（从格）
  | 'accumulate' // 先蓄力后爆发型（用神受克）
  | 'comeback' // 逆袭型（大运前弱后强）
  | 'specialist'; // 专精型（格局纯粹）

// ============ 人生主题模板 ============

export interface LifeThemeTemplate {
  type: LifeThemeType;
  title: string;
  summary: string;
  keywords: [string, string, string];
  stageTemplates: StageTemplate[];
}

export interface StageTemplate {
  ageRange: string;
  keywords: string[];
  meaningPattern: string;
  lessonPattern: string;
  skillsPattern: string[];
}

// ============ 4种核心主题模板 ============

export const LIFE_THEME_TEMPLATES: Record<LifeThemeType, LifeThemeTemplate> = {
  // 1. 顺势而为型（从格）
  follow: {
    type: 'follow',
    title: '顺势而为，借力使力',
    summary:
      '您的八字格局显示：您天生具有"借力"的智慧，不必逆势而行，顺应环境和时机往往能事半功倍。您的人生课题是：识别并抓住外部机遇，而非单打独斗。',
    keywords: ['顺势', '借力', '灵活'],
    stageTemplates: [
      {
        ageRange: '18-28岁',
        keywords: ['探索', '适应', '学习'],
        meaningPattern: '早年需学会"顺应"而非"对抗"，寻找适合自己的赛道',
        lessonPattern: '学会观察环境、顺应趋势、借助贵人',
        skillsPattern: ['人际敏感度', '机会识别', '资源整合'],
      },
      {
        ageRange: '29-45岁',
        keywords: ['借力', '整合', '上升'],
        meaningPattern: '中年是借力期，通过平台/团队/贵人实现价值',
        lessonPattern: '学会借助外力、整合资源、放大影响',
        skillsPattern: ['平台选择', '团队协作', '资源杠杆'],
      },
      {
        ageRange: '46-60岁',
        keywords: ['稳定', '传承', '影响'],
        meaningPattern: '晚年重在稳固成果，传递经验，扩大影响力',
        lessonPattern: '学会传承、指导后辈、建立长期影响',
        skillsPattern: ['经验总结', '人脉维护', '影响力建设'],
      },
    ],
  },

  // 2. 先蓄力后爆发型（用神受克）
  accumulate: {
    type: 'accumulate',
    title: '先蓄力、后爆发',
    summary:
      '您的八字格局显示：早年需要积累，中年后运势提升。这不是能力问题，而是时机规律。您的人生课题是：在低谷期耐心积累，等待爆发时机。',
    keywords: ['积累', '等待', '爆发'],
    stageTemplates: [
      {
        ageRange: '18-28岁',
        keywords: ['压力', '磨砺', '基础'],
        meaningPattern: '用神未行运，需要蓄力和忍耐',
        lessonPattern: '学会等待、坚持积累、提升内功',
        skillsPattern: ['抗压力', '基础技能', '耐心'],
      },
      {
        ageRange: '29-40岁',
        keywords: ['过渡', '转折', '突破'],
        meaningPattern: '大运开始转好，积累开始转化为成果',
        lessonPattern: '学会把握转折点、主动出击、快速突破',
        skillsPattern: ['时机判断', '决断力', '执行力'],
      },
      {
        ageRange: '41-55岁',
        keywords: ['爆发', '成就', '收获'],
        meaningPattern: '用神得力期，早年积累转化为显著成就',
        lessonPattern: '学会放大成果、建立影响、稳固地位',
        skillsPattern: ['战略思维', '领导力', '资源配置'],
      },
    ],
  },

  // 3. 逆袭型（大运前弱后强）
  comeback: {
    type: 'comeback',
    title: '厚积薄发，晚年发力',
    summary:
      '您的八字格局显示：大运前弱后强，属于"大器晚成"类型。早年挫折是为晚年成功做准备。您的人生课题是：不被早年困境打倒，持续提升，等待后发优势显现。',
    keywords: ['厚积', '薄发', '逆袭'],
    stageTemplates: [
      {
        ageRange: '18-35岁',
        keywords: ['挫折', '探索', '学习'],
        meaningPattern: '大运不利，多遇挑战，但这是积累期',
        lessonPattern: '学会从挫折中学习、调整方向、不放弃',
        skillsPattern: ['挫折应对', '方向调整', '持续学习'],
      },
      {
        ageRange: '36-50岁',
        keywords: ['转机', '上升', '突破'],
        meaningPattern: '大运转好，早年积累开始产生回报',
        lessonPattern: '学会把握机遇、快速成长、建立优势',
        skillsPattern: ['机会把握', '快速行动', '资源整合'],
      },
      {
        ageRange: '51-65岁',
        keywords: ['巅峰', '成就', '影响'],
        meaningPattern: '晚年是巅峰期，事业/财富达到高点',
        lessonPattern: '学会巩固成果、扩大影响、传承经验',
        skillsPattern: ['战略布局', '影响力', '传承'],
      },
    ],
  },

  // 4. 专精型（格局纯粹）
  specialist: {
    type: 'specialist',
    title: '专注一域，成为专家',
    summary:
      '您的八字格局显示：格局纯粹清晰，适合在专业领域深耕。您的人生课题是：找到核心赛道，持续深耕，成为该领域的权威。',
    keywords: ['专注', '深耕', '专家'],
    stageTemplates: [
      {
        ageRange: '18-30岁',
        keywords: ['探索', '定位', '入门'],
        meaningPattern: '早年寻找核心赛道，建立专业基础',
        lessonPattern: '学会选择赛道、建立基础、确立方向',
        skillsPattern: ['方向选择', '专业基础', '持续投入'],
      },
      {
        ageRange: '31-45岁',
        keywords: ['深耕', '专业', '建树'],
        meaningPattern: '中年深耕专业，建立行业地位',
        lessonPattern: '学会持续深化、建立壁垒、形成优势',
        skillsPattern: ['专业深度', '方法论', '专业网络'],
      },
      {
        ageRange: '46-60岁',
        keywords: ['权威', '影响', '传承'],
        meaningPattern: '晚年成为权威，扩大影响，传承经验',
        lessonPattern: '学会建立话语权、培养传人、扩大影响',
        skillsPattern: ['行业洞察', '领导力', '传承能力'],
      },
    ],
  },
};

// ============ 主题类型判断逻辑 ============

/**
 * 根据八字特征判断人生主题类型
 */
export function determineLifeThemeType(params: {
  patternType: PatternType;
  patternStrength: PatternStrength;
  usefulGodSuppressed: boolean; // 用神是否受克
  luckPillarsProgression: 'weak-to-strong' | 'strong-to-weak' | 'stable'; // 大运走势
  patternPurity: 'pure' | 'mixed' | 'broken';
}): LifeThemeType {
  const {
    patternType,
    patternStrength,
    usefulGodSuppressed,
    luckPillarsProgression,
    patternPurity,
  } = params;

  // 1. 从格 → 顺势而为型
  if (patternType === 'follow' || patternType === 'transform') {
    return 'follow';
  }

  // 2. 格局纯粹 + 大运稳定 → 专精型
  if (patternPurity === 'pure' && luckPillarsProgression === 'stable') {
    return 'specialist';
  }

  // 3. 大运前弱后强 → 逆袭型
  if (luckPillarsProgression === 'weak-to-strong') {
    return 'comeback';
  }

  // 4. 用神受克 + 中等强度 → 先蓄力后爆发型
  if (usefulGodSuppressed && patternStrength === 'medium') {
    return 'accumulate';
  }

  // 5. 默认：根据格局强度判断
  if (patternStrength === 'weak') {
    return 'accumulate'; // 弱 → 需要积累
  }
  if (patternStrength === 'strong') {
    return 'specialist'; // 强 → 可以专精
  }

  // 6. 兜底：先蓄力后爆发（最常见）
  return 'accumulate';
}

// ============ 大运走势判断 ============

/**
 * 判断大运走势：前弱后强 / 前强后弱 / 稳定
 */
export function analyzeLuckPillarsProgression(
  luckPillars: any[], // LuckPillar[] 类型
  currentAge: number
): 'weak-to-strong' | 'strong-to-weak' | 'stable' {
  // TODO: 实际实现需要根据用神在各大运中的力量变化判断
  // 这里提供占位逻辑

  if (!luckPillars || luckPillars.length < 3) {
    return 'stable';
  }

  // 简化逻辑：比较前3个大运和后3个大运的平均力量
  // 实际需要根据用神喜忌判断
  const earlyPillars = luckPillars.slice(0, 3);
  const latePillars = luckPillars.slice(-3);

  // 占位：假设有strength属性
  const earlyAvg =
    earlyPillars.reduce((sum: number, p: any) => sum + (p.strength || 50), 0) /
    earlyPillars.length;
  const lateAvg =
    latePillars.reduce((sum: number, p: any) => sum + (p.strength || 50), 0) /
    latePillars.length;

  if (lateAvg - earlyAvg > 20) return 'weak-to-strong';
  if (earlyAvg - lateAvg > 20) return 'strong-to-weak';
  return 'stable';
}

// ============ 用神受克判断 ============

/**
 * 判断用神是否受克
 */
export function isUsefulGodSuppressed(params: {
  usefulGod: TenGod[];
  destructionFactors: string[];
}): boolean {
  const { usefulGod, destructionFactors } = params;

  // TODO: 实际实现需要根据用神和破格因素的关系判断
  // 占位逻辑：如果有破格因素，认为用神受克
  return destructionFactors && destructionFactors.length > 0;
}

// ============ 辅助函数：生成阶段证据 ============

/**
 * 根据大运生成阶段证据
 */
export function generateStageEvidence(
  ageRange: string,
  luckPillars: any[],
  usefulGod: TenGod[]
): string[] {
  // TODO: 实际实现需要根据大运特征生成证据
  // 占位返回
  return [
    `该阶段大运为${luckPillars[0]?.stem || '未知'}${luckPillars[0]?.branch || ''}`,
    `用神${usefulGod[0] || ''}力量${Math.random() > 0.5 ? '较弱' : '得力'}`,
  ];
}
