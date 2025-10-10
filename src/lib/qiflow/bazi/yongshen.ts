import type { FiveElement, Pillars } from './types';

type HiddenStemsMap = Record<string, FiveElement[]>; // branch -> hidden stem elements

// 地支藏干（主气为第一位），以五行归类，兼顾通用权威表
const BRANCH_HIDDEN_ELEMENTS: HiddenStemsMap = {
  子: ['水'],
  丑: ['土', '金', '水'],
  寅: ['木', '火', '土'],
  卯: ['木'],
  辰: ['土', '木', '水'],
  巳: ['火', '金'],
  午: ['火', '土'],
  未: ['土', '木', '火'],
  申: ['金', '水'],
  酉: ['金'],
  戌: ['土', '火', '金'],
  亥: ['水', '木'],
};

// 月令季节权重（强化该季主气），近似分配：主气0.45，余气合计0.55按藏干占比分摊
const MONTH_SEASONAL_WEIGHTS: Record<
  string,
  Record<FiveElement, number>
> = (() => {
  const base: Record<string, Record<FiveElement, number>> = {} as any;
  const all: FiveElement[] = ['木', '火', '土', '金', '水'];
  const seasonDominant: Record<string, FiveElement> = {
    寅: '木',
    卯: '木',
    辰: '木',
    巳: '火',
    午: '火',
    未: '火',
    申: '金',
    酉: '金',
    戌: '金',
    亥: '水',
    子: '水',
    丑: '水',
  };
  const branches = Object.keys(seasonDominant);
  for (const b of branches) {
    const dominant = seasonDominant[b];
    const weights: Record<FiveElement, number> = {
      木: 0,
      火: 0,
      土: 0,
      金: 0,
      水: 0,
    };
    weights[dominant] = 0.45;
    const hidden =
      BRANCH_HIDDEN_ELEMENTS[b as keyof typeof BRANCH_HIDDEN_ELEMENTS] || [];
    const rest = all.filter((e) => e !== dominant);
    // 分配0.55给藏干中出现的余气，按出现次数平均
    const present = rest.filter((e) => hidden.includes(e));
    const share = present.length > 0 ? 0.55 / present.length : 0;
    for (const e of present) weights[e] = share;
    base[b] = weights;
  }
  return base;
})();

const STEM_TO_ELEMENT: Record<string, FiveElement> = {
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

const PRODUCTION: Record<FiveElement, FiveElement> = {
  木: '火',
  火: '土',
  土: '金',
  金: '水',
  水: '木',
};

const CONTROL: Record<FiveElement, FiveElement> = {
  木: '土',
  土: '水',
  水: '火',
  火: '金',
  金: '木',
};

export type YongShenAnalysis = {
  dayMaster: FiveElement;
  strengthScore: number; // 0..100
  favorable: FiveElement[];
  unfavorable: FiveElement[];
  rationale: string[];
};

// 估算日主强弱：月令+藏干+透干（年/月/时天干同气助力）
function estimateDayMasterStrength(pillars: Pillars): {
  dm: FiveElement;
  score: number;
  details: string[];
} {
  const dm = STEM_TO_ELEMENT[pillars.day.stem];
  let score = 50; // 基线
  const details: string[] = [];

  // 月令季节加成
  const season = MONTH_SEASONAL_WEIGHTS[pillars.month.branch];
  const seasonBoost = (season?.[dm] ?? 0) * 100;
  score += seasonBoost;
  details.push(`月令季节对${dm}+${seasonBoost.toFixed(0)}`);

  // 藏干同气助力（当月藏干包含同五行）
  const hidden = BRANCH_HIDDEN_ELEMENTS[pillars.month.branch] || [];
  const sameCount = hidden.filter((e) => e === dm).length;
  if (sameCount > 0) {
    const hiddenBoost = sameCount * 8;
    score += hiddenBoost;
    details.push(`月支藏干同气×${sameCount}+${hiddenBoost}`);
  }

  // 透干助力：年/月/时天干与日主同五行
  const helpers = [pillars.year.stem, pillars.month.stem, pillars.hour.stem]
    .map((s) => STEM_TO_ELEMENT[s])
    .filter((e) => e === dm).length;
  if (helpers > 0) {
    const helperBoost = helpers * 6;
    score += helperBoost;
    details.push(`三干同气助日主×${helpers}+${helperBoost}`);
  }

  // 克耗抑制：当月藏干中克日主或泄日主者偏多
  const controller = CONTROL[dm];
  const drain = PRODUCTION[dm];
  const controlCount = hidden.filter((e) => e === controller).length;
  const drainCount = hidden.filter((e) => e === drain).length;
  const penalty = controlCount * 8 + drainCount * 5;
  if (penalty) {
    score -= penalty;
    details.push(`藏干克泄合计-${penalty}`);
  }

  // 归一化
  score = Math.max(0, Math.min(100, Math.round(score)));
  return { dm, score, details };
}

// 用神原则（简化权威法则的工程化近似）：
// - 日主偏弱：取生扶（同我、我生之母）为喜；忌克泄耗
// - 日主偏强：取克制与泄耗为喜；忌再生扶
// - 接近均衡：优先取调候用神（依季节：冬火土、夏水金、春金土、秋木火）与中和
export function computeYongShen(pillars: Pillars): YongShenAnalysis {
  const { dm, score, details } = estimateDayMasterStrength(pillars);
  const weak = score < 45;
  const strong = score > 65;
  const neutral = !weak && !strong;

  const dmGen = PRODUCTION[dm]; // 我生之
  const mother = Object.entries(PRODUCTION).find(
    ([k, v]) => v === dm
  )?.[0] as FiveElement; // 生我的
  const controlled = Object.entries(CONTROL).find(
    ([k, v]) => v === dm
  )?.[0] as FiveElement; // 克我的
  const iControl = CONTROL[dm]; // 我去克

  let favorable: FiveElement[] = [];
  let unfavorable: FiveElement[] = [];

  if (weak) {
    favorable = Array.from(
      new Set<FiveElement>([dm, mother as FiveElement, dmGen])
    ) as FiveElement[];
    unfavorable = Array.from(
      new Set<FiveElement>([controlled as FiveElement, iControl])
    ) as FiveElement[];
    details.push('日主偏弱：取比劫与印为用，忌财官与食伤过多');
  } else if (strong) {
    favorable = Array.from(
      new Set<FiveElement>([controlled as FiveElement, iControl, dmGen])
    ) as FiveElement[];
    unfavorable = Array.from(
      new Set<FiveElement>([dm, mother as FiveElement])
    ) as FiveElement[];
    details.push('日主偏强：取财官与食伤为用，忌比劫与印过旺');
  } else {
    // 调候用神按季节偏好
    const seasonDom = Object.entries(
      MONTH_SEASONAL_WEIGHTS[pillars.month.branch] || {}
    ).sort((a, b) => b[1] - a[1])[0]?.[0] as FiveElement | undefined;
    const adjust: Record<FiveElement, FiveElement> = {
      春: '金',
      夏: '水',
      秋: '木',
      冬: '火',
    } as any;
    // 简化：按季节主气映射调候
    const seasonToAdjust: Record<FiveElement, FiveElement> = {
      木: '金',
      火: '水',
      金: '木',
      水: '火',
      土: '木',
    };
    const tune = seasonDom ? seasonToAdjust[seasonDom] : CONTROL[dm];
    favorable = Array.from(
      new Set<FiveElement>([
        tune as FiveElement,
        controlled as FiveElement,
        iControl,
      ])
    ) as FiveElement[];
    unfavorable = Array.from(
      new Set<FiveElement>([mother as FiveElement, dm])
    ) as FiveElement[];
    details.push(`日主均衡：以调候与中和为先，偏向${tune || controlled}`);
  }

  return {
    dayMaster: dm,
    strengthScore: score,
    favorable,
    unfavorable,
    rationale: details,
  };
}
