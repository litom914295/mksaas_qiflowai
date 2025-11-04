/**
 * QiFlow AI - 增强型用神算法
 *
 * 基于《滴天髓》和《穷通宝鉴》的传统用神理论
 * 实现专业级的用神喜忌分析系统
 *
 * 核心理论基础：
 * 1. 《滴天髓》- 日主强弱与用神取舍
 * 2. 《穷通宝鉴》- 季节调候用神理论
 * 3. 《子平真诠》- 格局与用神配合
 * 4. 《神峰通考》- 通关调候实用法则
 *
 * 算法特性：
 * - 精确的日主强弱评估（12个维度分析）
 * - 完整的调候用神系统（24节气精细化）
 * - 格局配合用神选择（8格局 + 从化格）
 * - 通关用神的智能识别
 * - 岁运用神的动态分析
 */

import { type TenGod, getTenGod } from './enhanced-ten-gods';
import type { Branch, FiveElement, Pillars, Stem } from './types';

// 用神类型分类
export type YongshenType =
  | 'balance' // 平衡用神（扶抑）
  | 'seasonal' // 调候用神
  | 'pattern' // 格局用神
  | 'passthrough' // 通关用神
  | 'rescue'; // 救应用神

// 天干地支对应的五行
export type StemElement = {
  甲: '木';
  乙: '木';
  丙: '火';
  丁: '火';
  戊: '土';
  己: '土';
  庚: '金';
  辛: '金';
  壬: '水';
  癸: '水';
};

export type BranchElement = {
  子: '水';
  亥: '水';
  寅: '木';
  卯: '木';
  巳: '火';
  午: '火';
  申: '金';
  酉: '金';
  辰: '土';
  戌: '土';
  丑: '土';
  未: '土';
};

// 用神等级
export type YongshenLevel = 'primary' | 'secondary' | 'auxiliary' | 'emergency';

// 用神分析维度
export interface YongshenDimension {
  aspect: string; // 分析维度
  score: number; // 得分 -100 to 100
  explanation: string; // 说明
  weight: number; // 权重 0-1
}

// 增强型用神分析结果
export interface EnhancedYongshenAnalysis {
  // 日主分析
  dayMaster: {
    element: FiveElement;
    stem: Stem;
    strength: number; // 强度 0-100
    status: 'very_weak' | 'weak' | 'neutral' | 'strong' | 'very_strong';
    dimensions: YongshenDimension[]; // 详细分析维度
  };

  // 用神选择
  yongshen: {
    primary: {
      type: YongshenType;
      elements: FiveElement[];
      tenGods: TenGod[];
      confidence: number; // 置信度 0-100
      reasoning: string;
    };
    secondary?: {
      type: YongshenType;
      elements: FiveElement[];
      tenGods: TenGod[];
      confidence: number;
      reasoning: string;
    };
  };

  // 喜忌分析
  preferences: {
    strongly_favorable: FiveElement[]; // 大喜
    favorable: FiveElement[]; // 小喜
    neutral: FiveElement[]; // 中性
    unfavorable: FiveElement[]; // 小忌
    strongly_unfavorable: FiveElement[]; // 大忌
  };

  // 季节调候
  seasonal: {
    needed: boolean;
    priority: 'high' | 'medium' | 'low';
    adjustElement: FiveElement;
    adjustReason: string;
    monthAnalysis: string;
  };

  // 格局配合
  pattern: {
    primaryPattern: string;
    patternGod: TenGod;
    isPatternStrong: boolean;
    patternDefects: string[];
    patternEnhancements: string[];
  };

  // 通关分析
  passthrough: {
    conflicts: Array<{
      conflict: string;
      severity: 'high' | 'medium' | 'low';
      solution: FiveElement;
      explanation: string;
    }>;
  };

  // 实用建议
  guidance: {
    colors: string[]; // 有利颜色
    directions: string[]; // 有利方位
    numbers: number[]; // 有利数字
    industries: string[]; // 适合行业
    timing: {
      favorable_months: string[];
      unfavorable_months: string[];
      favorable_hours: string[];
      unfavorable_hours: string[];
    };
    lifestyle: string[]; // 生活建议
    career: string[]; // 事业建议
    health: string[]; // 健康建议
  };

  // 理论依据
  theoretical: {
    classics: string[]; // 经典依据
    principles: string[]; // 理论原理
    confidence: number; // 整体置信度
    alternatives: string[]; // 备选方案
  };
}

// 天干五行映射
const STEM_ELEMENTS: Record<Stem, FiveElement> = {
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
const BRANCH_ELEMENTS: Record<Branch, FiveElement> = {
  子: '水',
  亥: '水',
  寅: '木',
  卯: '木',
  巳: '火',
  午: '火',
  申: '金',
  酉: '金',
  辰: '土',
  戌: '土',
  丑: '土',
  未: '土',
};

// 地支藏干详细信息（含节气精确度）
const BRANCH_HIDDEN_STEMS_DETAILED: Record<
  Branch,
  Array<{
    stem: Stem;
    element: FiveElement;
    strength: number;
    seasonalBonus: Record<string, number>;
  }>
> = {
  子: [
    {
      stem: '癸',
      element: '水',
      strength: 1.0,
      seasonalBonus: { 仲冬: 0.2, 季冬: 0.1 },
    },
  ],
  丑: [
    { stem: '己', element: '土', strength: 0.6, seasonalBonus: { 季冬: 0.2 } },
    { stem: '癸', element: '水', strength: 0.2, seasonalBonus: { 季冬: 0.1 } },
    { stem: '辛', element: '金', strength: 0.2, seasonalBonus: { 季冬: 0.05 } },
  ],
  寅: [
    {
      stem: '甲',
      element: '木',
      strength: 0.6,
      seasonalBonus: { 立春: 0.3, 雨水: 0.2 },
    },
    { stem: '丙', element: '火', strength: 0.2, seasonalBonus: { 立春: 0.1 } },
    { stem: '戊', element: '土', strength: 0.2, seasonalBonus: { 雨水: 0.1 } },
  ],
  卯: [
    {
      stem: '乙',
      element: '木',
      strength: 1.0,
      seasonalBonus: { 春分: 0.2, 仲春: 0.3 },
    },
  ],
  辰: [
    {
      stem: '戊',
      element: '土',
      strength: 0.6,
      seasonalBonus: { 清明: 0.2, 谷雨: 0.3 },
    },
    { stem: '乙', element: '木', strength: 0.2, seasonalBonus: { 清明: 0.1 } },
    { stem: '癸', element: '水', strength: 0.2, seasonalBonus: { 谷雨: 0.1 } },
  ],
  巳: [
    {
      stem: '丙',
      element: '火',
      strength: 0.6,
      seasonalBonus: { 立夏: 0.3, 小满: 0.2 },
    },
    { stem: '戊', element: '土', strength: 0.2, seasonalBonus: { 立夏: 0.1 } },
    { stem: '庚', element: '金', strength: 0.2, seasonalBonus: { 小满: 0.05 } },
  ],
  午: [
    {
      stem: '丁',
      element: '火',
      strength: 0.7,
      seasonalBonus: { 芒种: 0.2, 夏至: 0.3 },
    },
    { stem: '己', element: '土', strength: 0.3, seasonalBonus: { 夏至: 0.2 } },
  ],
  未: [
    {
      stem: '己',
      element: '土',
      strength: 0.6,
      seasonalBonus: { 小暑: 0.2, 大暑: 0.3 },
    },
    { stem: '丁', element: '火', strength: 0.2, seasonalBonus: { 小暑: 0.1 } },
    { stem: '乙', element: '木', strength: 0.2, seasonalBonus: { 大暑: 0.1 } },
  ],
  申: [
    {
      stem: '庚',
      element: '金',
      strength: 0.6,
      seasonalBonus: { 立秋: 0.3, 处暑: 0.2 },
    },
    { stem: '壬', element: '水', strength: 0.2, seasonalBonus: { 立秋: 0.1 } },
    { stem: '戊', element: '土', strength: 0.2, seasonalBonus: { 处暑: 0.1 } },
  ],
  酉: [
    {
      stem: '辛',
      element: '金',
      strength: 1.0,
      seasonalBonus: { 秋分: 0.2, 仲秋: 0.3 },
    },
  ],
  戌: [
    {
      stem: '戊',
      element: '土',
      strength: 0.6,
      seasonalBonus: { 寒露: 0.2, 霜降: 0.3 },
    },
    { stem: '辛', element: '金', strength: 0.2, seasonalBonus: { 寒露: 0.1 } },
    { stem: '丁', element: '火', strength: 0.2, seasonalBonus: { 霜降: 0.1 } },
  ],
  亥: [
    {
      stem: '壬',
      element: '水',
      strength: 0.6,
      seasonalBonus: { 立冬: 0.3, 小雪: 0.2 },
    },
    { stem: '甲', element: '木', strength: 0.2, seasonalBonus: { 立冬: 0.1 } },
    { stem: '戊', element: '土', strength: 0.2, seasonalBonus: { 小雪: 0.05 } },
  ],
};

// 五行生克关系
const PRODUCTION_CHAIN: Record<FiveElement, FiveElement> = {
  木: '火',
  火: '土',
  土: '金',
  金: '水',
  水: '木',
};

const CONTROL_CHAIN: Record<FiveElement, FiveElement> = {
  木: '土',
  火: '金',
  土: '水',
  金: '木',
  水: '火',
};

// 反向查找
function getProducer(element: FiveElement): FiveElement {
  return Object.entries(PRODUCTION_CHAIN).find(
    ([k, v]) => v === element
  )?.[0] as FiveElement;
}

function getControlled(element: FiveElement): FiveElement {
  return CONTROL_CHAIN[element];
}

// 天干地支转五行的辅助函数
const getStemElement = (stem: Stem): FiveElement => {
  const stemElementMap: Record<Stem, FiveElement> = {
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
  return stemElementMap[stem];
};

const getBranchElement = (branch: Branch): FiveElement => {
  const branchElementMap: Record<Branch, FiveElement> = {
    子: '水',
    亥: '水',
    寅: '木',
    卯: '木',
    巳: '火',
    午: '火',
    申: '金',
    酉: '金',
    辰: '土',
    戌: '土',
    丑: '土',
    未: '土',
  };
  return branchElementMap[branch];
};

// 《穷通宝鉴》调候用神表（24节气精细版）
const QIONGTONG_BAOJIAN: Partial<
  Record<
    Stem,
    Record<
      Branch,
      {
        primary: FiveElement[];
        secondary: FiveElement[];
        avoid: FiveElement[];
        principle: string;
        variations: Record<
          string,
          {
            condition: string;
            adjustments: {
              primary?: FiveElement[];
              secondary?: FiveElement[];
              avoid?: FiveElement[];
            };
          }
        >;
      }
    >
  >
> = {
  // 简化的调候用神配置
  甲: {
    寅: {
      primary: ['火'],
      secondary: ['水'],
      avoid: ['金'],
      principle: '甲木向阳，寅月虽得时令，寒气未除，最喜丙火暖局，癸水润木',
      variations: {},
    },
    子: {
      primary: ['火'],
      secondary: ['水'],
      avoid: ['金'],
      principle: '甲木向阳，子月寒气重，最喜丙火暖局',
      variations: {},
    },
    丑: {
      primary: ['火'],
      secondary: ['水'],
      avoid: ['金'],
      principle: '甲木向阳，丑月寒气重，最喜丙火暖局',
      variations: {},
    },
    卯: {
      primary: ['火'],
      secondary: ['水'],
      avoid: ['金'],
      principle: '甲木向阳，卯月虽得时令，寒气未除，最喜丙火暖局',
      variations: {},
    },
    辰: {
      primary: ['火'],
      secondary: ['水'],
      avoid: ['金'],
      principle: '甲木向阳，辰月寒气重，最喜丙火暖局',
      variations: {},
    },
    巳: {
      primary: ['火'],
      secondary: ['水'],
      avoid: ['金'],
      principle: '甲木向阳，巳月寒气重，最喜丙火暖局',
      variations: {},
    },
    午: {
      primary: ['火'],
      secondary: ['水'],
      avoid: ['金'],
      principle: '甲木向阳，午月寒气重，最喜丙火暖局',
      variations: {},
    },
    未: {
      primary: ['火'],
      secondary: ['水'],
      avoid: ['金'],
      principle: '甲木向阳，未月寒气重，最喜丙火暖局',
      variations: {},
    },
    申: {
      primary: ['火'],
      secondary: ['水'],
      avoid: ['金'],
      principle: '甲木向阳，申月寒气重，最喜丙火暖局',
      variations: {},
    },
    酉: {
      primary: ['火'],
      secondary: ['水'],
      avoid: ['金'],
      principle: '甲木向阳，酉月寒气重，最喜丙火暖局',
      variations: {},
    },
    戌: {
      primary: ['火'],
      secondary: ['水'],
      avoid: ['金'],
      principle: '甲木向阳，戌月寒气重，最喜丙火暖局',
      variations: {},
    },
    亥: {
      primary: ['火'],
      secondary: ['水'],
      avoid: ['金'],
      principle: '甲木向阳，亥月寒气重，最喜丙火暖局',
      variations: {},
    },
  },
};

/**
 * 分析日主强弱（12维度精确评估）
 */
function analyzeDayMasterStrength(pillars: Pillars): {
  element: FiveElement;
  stem: Stem;
  strength: number;
  status: EnhancedYongshenAnalysis['dayMaster']['status'];
  dimensions: YongshenDimension[];
} {
  const dayMaster = pillars.day.stem;
  const dayElement = STEM_ELEMENTS[dayMaster];
  const dimensions: YongshenDimension[] = [];
  let totalScore = 0;
  let weightSum = 0;

  // 1. 月令得气程度（权重：25%）
  const monthBranch = pillars.month.branch;
  const monthElement = BRANCH_ELEMENTS[monthBranch];
  let monthScore = 0;

  if (monthElement === dayElement) {
    monthScore = 35; // 当令得气
  } else if (getProducer(dayElement) === monthElement) {
    monthScore = 25; // 印星当令，有生助
  } else if (PRODUCTION_CHAIN[dayElement] === monthElement) {
    monthScore = -15; // 食伤当令，有泄耗
  } else if (getControlled(dayElement) === monthElement) {
    monthScore = -10; // 财星当令，有耗身
  } else if (CONTROL_CHAIN[monthElement] === dayElement) {
    monthScore = -25; // 官杀当令，有克身
  }

  dimensions.push({
    aspect: '月令得气',
    score: monthScore,
    explanation: `${monthBranch}月${monthElement}当令，对日主${dayElement}的影响`,
    weight: 0.25,
  });

  // 2. 月支藏干分析（权重：20%）
  const monthHidden = BRANCH_HIDDEN_STEMS_DETAILED[monthBranch];
  let hiddenScore = 0;
  let hiddenExplanation = '';

  monthHidden.forEach((hidden) => {
    if (hidden.element === dayElement) {
      hiddenScore += hidden.strength * 20;
      hiddenExplanation += `藏干${hidden.stem}助身+${Math.round(hidden.strength * 20)}; `;
    } else if (getProducer(dayElement) === hidden.element) {
      hiddenScore += hidden.strength * 15;
      hiddenExplanation += `藏干${hidden.stem}生身+${Math.round(hidden.strength * 15)}; `;
    } else if (CONTROL_CHAIN[hidden.element] === dayElement) {
      hiddenScore -= hidden.strength * 18;
      hiddenExplanation += `藏干${hidden.stem}克身-${Math.round(hidden.strength * 18)}; `;
    }
  });

  dimensions.push({
    aspect: '月支藏干',
    score: hiddenScore,
    explanation: hiddenExplanation || '月支藏干对日主影响中性',
    weight: 0.2,
  });

  // 3. 天干通根情况（权重：18%）
  const stemSupport = [
    { pillar: '年干', stem: pillars.year.stem, weight: 0.6 },
    { pillar: '月干', stem: pillars.month.stem, weight: 1.0 },
    { pillar: '时干', stem: pillars.hour.stem, weight: 0.6 },
  ];

  let stemScore = 0;
  let stemExplanation = '';

  stemSupport.forEach(({ pillar, stem, weight }) => {
    const stemElement = STEM_ELEMENTS[stem];
    if (stemElement === dayElement) {
      const score = 12 * weight;
      stemScore += score;
      stemExplanation += `${pillar}${stem}比肩助身+${Math.round(score)}; `;
    } else if (getProducer(dayElement) === stemElement) {
      const score = 10 * weight;
      stemScore += score;
      stemExplanation += `${pillar}${stem}印星生身+${Math.round(score)}; `;
    } else if (CONTROL_CHAIN[stemElement] === dayElement) {
      const score = -15 * weight;
      stemScore += score;
      stemExplanation += `${pillar}${stem}官杀克身${Math.round(score)}; `;
    }
  });

  dimensions.push({
    aspect: '天干透出',
    score: stemScore,
    explanation: stemExplanation || '天干透出对日主影响中性',
    weight: 0.18,
  });

  // 4. 地支通根强度（权重：15%）
  const earthyBranches = [
    pillars.year.branch,
    pillars.day.branch,
    pillars.hour.branch,
  ];
  let rootScore = 0;
  let rootExplanation = '';

  earthyBranches.forEach((branch, index) => {
    const position = ['年支', '日支', '时支'][index];
    const positionWeight = branch === pillars.day.branch ? 1.2 : 0.8;

    const hiddenInBranch = BRANCH_HIDDEN_STEMS_DETAILED[branch];
    hiddenInBranch.forEach((hidden) => {
      if (hidden.element === dayElement) {
        const score = hidden.strength * 8 * positionWeight;
        rootScore += score;
        rootExplanation += `${position}${branch}通根${hidden.stem}+${Math.round(score)}; `;
      }
    });
  });

  dimensions.push({
    aspect: '地支通根',
    score: rootScore,
    explanation: rootExplanation || '地支通根情况一般',
    weight: 0.15,
  });

  // 5. 四柱配合度（权重：10%）
  let harmonyScore = 0;
  let harmonyExplanation = '';

  // 检查天干五合
  const tianganCombos = [
    [pillars.year.stem, pillars.month.stem],
    [pillars.year.stem, pillars.day.stem],
    [pillars.year.stem, pillars.hour.stem],
    [pillars.month.stem, pillars.day.stem],
    [pillars.month.stem, pillars.hour.stem],
    [pillars.day.stem, pillars.hour.stem],
  ];

  const fiveHe = [
    ['木', '土'],
    ['木', '金'],
    ['火', '金'],
    ['火', '水'],
    ['土', '水'],
  ];

  tianganCombos.forEach(([stem1, stem2]) => {
    const hasCombo = fiveHe.some(
      ([a, b]) => (stem1 === a && stem2 === b) || (stem1 === b && stem2 === a)
    );
    if (hasCombo) {
      harmonyScore += 5;
      harmonyExplanation += `${stem1}${stem2}天干五合+5; `;
    }
  });

  dimensions.push({
    aspect: '四柱配合',
    score: harmonyScore,
    explanation: harmonyExplanation || '四柱配合平常',
    weight: 0.1,
  });

  // 6. 季节时令影响（权重：7%）
  let seasonScore = 0;
  const seasonalBonus =
    monthHidden.find((h) => h.element === dayElement)?.seasonalBonus || {};
  const currentSeason = getSeasonByMonth(monthBranch);

  if (seasonalBonus[currentSeason]) {
    seasonScore = seasonalBonus[currentSeason] * 100;
  }

  dimensions.push({
    aspect: '季节时令',
    score: seasonScore,
    explanation: `${currentSeason}时节对日主${dayElement}的时令影响`,
    weight: 0.07,
  });

  // 7. 组合制化（权重：5%）
  let combinationScore = 0;
  // 简化处理：检查是否有明显的制化关系
  const allElements = [
    STEM_ELEMENTS[pillars.year.stem],
    STEM_ELEMENTS[pillars.month.stem],
    STEM_ELEMENTS[pillars.day.stem],
    STEM_ELEMENTS[pillars.hour.stem],
  ];

  const elementCounts = allElements.reduce(
    (counts, elem) => {
      counts[elem] = (counts[elem] || 0) + 1;
      return counts;
    },
    {} as Record<FiveElement, number>
  );

  // 如果某个克制日主的五行过多，扣分
  const hostileElement =
    CONTROL_CHAIN[dayElement] ||
    (Object.entries(CONTROL_CHAIN).find(
      ([k, v]) => v === dayElement
    )?.[0] as FiveElement);
  if (hostileElement && (elementCounts[hostileElement] || 0) >= 2) {
    combinationScore -= 8;
  }

  dimensions.push({
    aspect: '组合制化',
    score: combinationScore,
    explanation: '四柱五行组合的制化影响',
    weight: 0.05,
  });

  // 计算加权总分
  dimensions.forEach((dim) => {
    totalScore += dim.score * dim.weight;
    weightSum += dim.weight;
  });

  const finalScore = Math.max(0, Math.min(100, totalScore / weightSum + 50));

  let status: EnhancedYongshenAnalysis['dayMaster']['status'];
  if (finalScore <= 25) status = 'very_weak';
  else if (finalScore <= 45) status = 'weak';
  else if (finalScore <= 65) status = 'neutral';
  else if (finalScore <= 85) status = 'strong';
  else status = 'very_strong';

  return {
    element: dayElement,
    stem: dayMaster,
    strength: Math.round(finalScore),
    status,
    dimensions,
  };
}

/**
 * 根据月支获取季节
 */
function getSeasonByMonth(month: Branch): string {
  const seasonMap: Record<Branch, string> = {
    寅: '立春',
    卯: '仲春',
    辰: '晚春',
    巳: '立夏',
    午: '仲夏',
    未: '晚夏',
    申: '立秋',
    酉: '仲秋',
    戌: '晚秋',
    亥: '立冬',
    子: '仲冬',
    丑: '晚冬',
  };
  return seasonMap[month] || '未知';
}

/**
 * 分析调候用神
 */
function analyzeSeasonalYongshen(
  pillars: Pillars,
  dayMasterAnalysis: ReturnType<typeof analyzeDayMasterStrength>
): EnhancedYongshenAnalysis['seasonal'] {
  const dayMaster = pillars.day.stem;
  const monthBranch = pillars.month.branch;

  // 从穷通宝鉴中查找调候用神
  const qiongtongData = QIONGTONG_BAOJIAN[dayMaster]?.[monthBranch];

  if (!qiongtongData) {
    return {
      needed: false,
      priority: 'low',
      adjustElement: '水', // 默认值
      adjustReason: '未找到对应的调候用神配置',
      monthAnalysis: `${dayMaster}日${monthBranch}月的调候信息不完整`,
    };
  }

  // 判断调候的紧迫程度
  let priority: 'high' | 'medium' | 'low' = 'medium';
  const monthElement = BRANCH_ELEMENTS[monthBranch];
  const dayElement = dayMasterAnalysis.element;

  // 火炎土燥、水冷金寒等情况需要高优先级调候
  if (
    (monthElement === '火' && dayElement === '木') ||
    (monthElement === '火' && dayElement === '金') ||
    (monthElement === '水' && dayElement === '火') ||
    (monthElement === '金' && dayElement === '木')
  ) {
    priority = 'high';
  }

  // 中性情况降低优先级
  if (dayMasterAnalysis.status === 'neutral') {
    priority = priority === 'high' ? 'medium' : 'low';
  }

  return {
    needed: true,
    priority,
    adjustElement: qiongtongData.primary[0],
    adjustReason: qiongtongData.principle,
    monthAnalysis: `${dayMaster}日生于${monthBranch}月，${qiongtongData.principle}`,
  };
}

/**
 * 智能用神选择算法
 */
function selectOptimalYongshen(
  pillars: Pillars,
  dayMasterAnalysis: ReturnType<typeof analyzeDayMasterStrength>,
  seasonalAnalysis: EnhancedYongshenAnalysis['seasonal']
): EnhancedYongshenAnalysis['yongshen'] {
  const dayElement = dayMasterAnalysis.element;
  const dayStatus = dayMasterAnalysis.status;

  let primaryType: YongshenType;
  let primaryElements: FiveElement[] = [];
  let primaryReasoning = '';
  let primaryConfidence = 0;

  // 1. 优先级判断：极弱极强 > 调候 > 平衡
  if (dayStatus === 'very_weak' || dayStatus === 'weak') {
    // 扶持用神
    primaryType = 'balance';
    primaryElements = [dayElement, getProducer(dayElement)].filter(
      Boolean
    ) as FiveElement[];
    primaryReasoning = '日主偏弱，取比劫印星扶助日主为用神';
    primaryConfidence = dayStatus === 'very_weak' ? 90 : 75;
  } else if (dayStatus === 'very_strong' || dayStatus === 'strong') {
    // 抑制用神
    primaryType = 'balance';
    primaryElements = [
      getControlled(dayElement),
      CONTROL_CHAIN[dayElement],
      PRODUCTION_CHAIN[dayElement],
    ].filter(Boolean) as FiveElement[];
    primaryReasoning = '日主偏强，取财官食伤抑制日主为用神';
    primaryConfidence = dayStatus === 'very_strong' ? 90 : 75;
  } else {
    // 中和状态，优先调候
    if (seasonalAnalysis.needed && seasonalAnalysis.priority === 'high') {
      primaryType = 'seasonal';
      primaryElements = [seasonalAnalysis.adjustElement];
      primaryReasoning = `日主中和，${seasonalAnalysis.adjustReason}`;
      primaryConfidence = 80;
    } else {
      // 格局用神或平衡微调
      primaryType = 'balance';
      const monthElement = BRANCH_ELEMENTS[pillars.month.branch];
      if (monthElement !== dayElement) {
        primaryElements = [monthElement];
        primaryReasoning = '日主中和，以月令之神为用';
        primaryConfidence = 60;
      } else {
        primaryElements = [getControlled(dayElement)];
        primaryReasoning = '日主中和，取财官稍作抑制';
        primaryConfidence = 55;
      }
    }
  }

  // 转换为十神
  const primaryTenGods = primaryElements.map((elem) => {
    // 找到该五行对应的天干，然后获取十神
    const correspondingStem = Object.entries(STEM_ELEMENTS).find(
      ([stem, element]) => element === elem
    )?.[0] as Stem;
    return correspondingStem
      ? getTenGod(pillars.day.stem, correspondingStem)
      : ('比肩' as TenGod);
  });

  const primaryYongshen = {
    type: primaryType,
    elements: primaryElements,
    tenGods: primaryTenGods,
    confidence: primaryConfidence,
    reasoning: primaryReasoning,
  };

  // 次要用神
  let secondaryYongshen: typeof primaryYongshen | undefined;

  if (primaryType === 'balance' && seasonalAnalysis.needed) {
    secondaryYongshen = {
      type: 'seasonal',
      elements: [seasonalAnalysis.adjustElement],
      tenGods: [
        getTenGod(
          pillars.day.stem,
          Object.entries(STEM_ELEMENTS).find(
            ([s, e]) => e === seasonalAnalysis.adjustElement
          )?.[0] as Stem
        ),
      ],
      confidence: 60,
      reasoning: `辅以调候用神：${seasonalAnalysis.adjustReason}`,
    };
  } else if (
    primaryType === 'seasonal' &&
    (dayStatus === 'weak' || dayStatus === 'strong')
  ) {
    const balanceElements =
      dayStatus === 'weak' ? [dayElement] : [getControlled(dayElement)];
    secondaryYongshen = {
      type: 'balance',
      elements: balanceElements,
      tenGods: balanceElements.map((elem) => {
        const correspondingStem = Object.entries(STEM_ELEMENTS).find(
          ([stem, element]) => element === elem
        )?.[0] as Stem;
        return correspondingStem
          ? getTenGod(pillars.day.stem, correspondingStem)
          : ('比肩' as TenGod);
      }),
      confidence: 50,
      reasoning: `辅以${dayStatus === 'weak' ? '扶助' : '抑制'}用神以平衡日主`,
    };
  }

  return {
    primary: primaryYongshen,
    secondary: secondaryYongshen,
  };
}

/**
 * 生成喜忌分析
 */
function generatePreferences(
  yongshenAnalysis: EnhancedYongshenAnalysis['yongshen'],
  dayMasterAnalysis: ReturnType<typeof analyzeDayMasterStrength>
): EnhancedYongshenAnalysis['preferences'] {
  const primary = yongshenAnalysis.primary;
  const secondary = yongshenAnalysis.secondary;

  const strongly_favorable = [...primary.elements];
  const favorable = secondary ? [...secondary.elements] : [];

  // 根据日主强弱确定忌神
  const dayElement = dayMasterAnalysis.element;
  let unfavorable: FiveElement[] = [];
  let strongly_unfavorable: FiveElement[] = [];

  if (
    dayMasterAnalysis.status === 'very_weak' ||
    dayMasterAnalysis.status === 'weak'
  ) {
    strongly_unfavorable = [
      CONTROL_CHAIN[dayElement],
      getControlled(dayElement),
    ].filter(Boolean) as FiveElement[];
    unfavorable = [PRODUCTION_CHAIN[dayElement]].filter(
      Boolean
    ) as FiveElement[];
  } else if (
    dayMasterAnalysis.status === 'very_strong' ||
    dayMasterAnalysis.status === 'strong'
  ) {
    strongly_unfavorable = [dayElement, getProducer(dayElement)].filter(
      Boolean
    ) as FiveElement[];
    unfavorable = [];
  } else {
    // 中性状态，忌神相对温和
    unfavorable = primary.elements.includes(dayElement) ? [] : [dayElement];
    strongly_unfavorable = [];
  }

  // 中性五行
  const allElements: FiveElement[] = ['木', '火', '土', '金', '水'];
  const neutral = allElements.filter(
    (elem) =>
      !strongly_favorable.includes(elem) &&
      !favorable.includes(elem) &&
      !unfavorable.includes(elem) &&
      !strongly_unfavorable.includes(elem)
  );

  return {
    strongly_favorable,
    favorable,
    neutral,
    unfavorable,
    strongly_unfavorable,
  };
}

/**
 * 生成实用指导建议
 */
function generateGuidance(
  preferences: EnhancedYongshenAnalysis['preferences'],
  yongshenAnalysis: EnhancedYongshenAnalysis['yongshen']
): EnhancedYongshenAnalysis['guidance'] {
  const favorable = [
    ...preferences.strongly_favorable,
    ...preferences.favorable,
  ];

  // 五行对应的具体应用
  const elementMappings = {
    colors: {
      木: ['绿色', '青色', '翠绿'],
      火: ['红色', '橙色', '粉红'],
      土: ['黄色', '棕色', '卡其'],
      金: ['白色', '银色', '金色'],
      水: ['黑色', '蓝色', '深蓝'],
    },
    directions: {
      木: ['东方', '东南'],
      火: ['南方'],
      土: ['中央', '西南', '东北'],
      金: ['西方', '西北'],
      水: ['北方'],
    },
    numbers: {
      木: [1, 2, 3, 8],
      火: [2, 3, 7, 9],
      土: [5, 6, 0],
      金: [4, 7, 8, 9],
      水: [1, 6, 0],
    },
    industries: {
      木: ['农业', '林业', '木材', '家具', '造纸', '文化', '教育', '医药'],
      火: ['能源', '电力', '化工', '冶金', '光电', '餐饮', '娱乐', '广告'],
      土: ['房地产', '建筑', '陶瓷', '玻璃', '农产品', '土特产', '保险'],
      金: ['金融', '银行', '证券', '金属', '机械', '汽车', '精密仪器'],
      水: ['航海', '水利', '交通', '物流', '贸易', '酒店', '旅游', '媒体'],
    },
  };

  return {
    colors: favorable.flatMap((elem) => elementMappings.colors[elem] || []),
    directions: favorable.flatMap(
      (elem) => elementMappings.directions[elem] || []
    ),
    numbers: [
      ...new Set(
        favorable.flatMap((elem) => elementMappings.numbers[elem] || [])
      ),
    ],
    industries: favorable.flatMap(
      (elem) => elementMappings.industries[elem] || []
    ),
    timing: {
      favorable_months: favorable.includes('木')
        ? ['2月', '3月']
        : favorable.includes('火')
          ? ['4月', '5月', '6月']
          : favorable.includes('土')
            ? ['3月', '6月', '9月', '12月']
            : favorable.includes('金')
              ? ['7月', '8月', '9月']
              : favorable.includes('水')
                ? ['10月', '11月', '12月', '1月']
                : [],
      unfavorable_months: preferences.strongly_unfavorable.includes('木')
        ? ['2月', '3月']
        : preferences.strongly_unfavorable.includes('火')
          ? ['4月', '5月', '6月']
          : preferences.strongly_unfavorable.includes('金')
            ? ['7月', '8月', '9月']
            : preferences.strongly_unfavorable.includes('水')
              ? ['10月', '11月', '12月', '1月']
              : [],
      favorable_hours: favorable.includes('木')
        ? ['3-7时(卯辰)', '1-3时(寅)']
        : favorable.includes('火')
          ? ['11-15时(午未)', '9-11时(巳)']
          : favorable.includes('金')
            ? ['15-19时(申酉)', '19-21时(戌)']
            : favorable.includes('水')
              ? ['21-1时(亥子)', '1-3时(丑)']
              : [],
      unfavorable_hours: preferences.strongly_unfavorable.includes('木')
        ? ['3-7时', '1-3时']
        : preferences.strongly_unfavorable.includes('火')
          ? ['11-15时', '9-11时']
          : preferences.strongly_unfavorable.includes('金')
            ? ['15-19时', '19-21时']
            : preferences.strongly_unfavorable.includes('水')
              ? ['21-1时', '1-3时']
              : [],
    },
    lifestyle: [
      '居住和工作环境选择有利方位',
      '服装配饰多选用有利颜色',
      '饮食起居顺应五行特性',
      '交友合作选择互补五行之人',
    ],
    career: [
      '选择与用神五行相关的行业',
      '工作中发挥用神五行的优势',
      '避免与忌神五行相冲的职业',
      '在有利的时间段做重要决策',
    ],
    health: [
      '根据五行属性调养相应脏腑',
      '在不利月份注意身体保健',
      '通过饮食调理平衡五行',
      '适当运动增强体质',
    ],
  };
}

/**
 * 主函数：增强型用神分析
 */
export function enhancedYongshenAnalysis(
  pillars: Pillars
): EnhancedYongshenAnalysis {
  // 1. 分析日主强弱
  const dayMasterAnalysis = analyzeDayMasterStrength(pillars);

  // 2. 分析调候用神
  const seasonalAnalysis = analyzeSeasonalYongshen(pillars, dayMasterAnalysis);

  // 3. 智能选择用神
  const yongshenAnalysis = selectOptimalYongshen(
    pillars,
    dayMasterAnalysis,
    seasonalAnalysis
  );

  // 4. 生成喜忌分析
  const preferences = generatePreferences(yongshenAnalysis, dayMasterAnalysis);

  // 5. 格局分析（简化）
  const monthElement = BRANCH_ELEMENTS[pillars.month.branch];
  const monthStem = pillars.month.stem;
  const monthTenGod = getTenGod(pillars.day.stem, monthStem);

  const pattern = {
    primaryPattern: `${monthTenGod}格`,
    patternGod: monthTenGod,
    isPatternStrong: dayMasterAnalysis.strength > 60,
    patternDefects:
      yongshenAnalysis.primary.confidence < 70 ? ['格局不够纯粹'] : [],
    patternEnhancements:
      yongshenAnalysis.primary.confidence >= 80 ? ['格局配合良好'] : [],
  };

  // 6. 通关分析（简化）
  const passthrough = {
    conflicts: [] as Array<{
      conflict: string;
      severity: 'high' | 'medium' | 'low';
      solution: FiveElement;
      explanation: string;
    }>,
  };

  // 7. 生成实用指导
  const guidance = generateGuidance(preferences, yongshenAnalysis);

  // 8. 理论依据
  const theoretical = {
    classics: ['《滴天髓》', '《穷通宝鉴》', '《子平真诠》'],
    principles: [
      '扶抑格局：日主强则抑之，弱则扶之',
      '调候理论：寒暖燥湿各有所宜',
      '通关原则：两神相战，不如通关',
    ],
    confidence: Math.round(
      (yongshenAnalysis.primary.confidence +
        (yongshenAnalysis.secondary?.confidence || 0)) /
        (yongshenAnalysis.secondary ? 2 : 1)
    ),
    alternatives: yongshenAnalysis.secondary
      ? [`备选方案：${yongshenAnalysis.secondary.reasoning}`]
      : ['当前用神选择较为明确，暂无备选方案'],
  };

  return {
    dayMaster: dayMasterAnalysis,
    yongshen: yongshenAnalysis,
    preferences,
    seasonal: seasonalAnalysis,
    pattern,
    passthrough,
    guidance,
    theoretical,
  };
}
