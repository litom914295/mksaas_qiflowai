import {
    getBaguaByStar,
    getBaguaYinYang,
    LUOSHU_ORDER,
    shunFei,
} from './luoshu';
import { FlyingStar, Mountain, PalaceIndex, Plate, Yun } from './types';

/**
 * 增强版挨星算法
 *
 * 核心改进：
 * 1. 精确的元龙判断和顺逆飞规则
 * 2. 完善的兼向处理机制
 * 3. 动态的流年飞星叠加
 * 4. 精细化的星曜力量计算
 */

// 元龙精确分类表
export const PRECISE_YUANLONG_TABLE: Record<
  Mountain,
  {
    category: '天' | '人' | '地';
    subCategory: '正' | '兼';
    strength: number; // 力量强度 1-10
    specialRules?: string[];
  }
> = {
  // 天元龙（正位）
  子: { category: '天', subCategory: '正', strength: 10 },
  午: { category: '天', subCategory: '正', strength: 10 },
  卯: { category: '天', subCategory: '正', strength: 10 },
  酉: { category: '天', subCategory: '正', strength: 10 },
  乾: {
    category: '天',
    subCategory: '正',
    strength: 9,
    specialRules: ['需要替卦'],
  },
  坤: {
    category: '天',
    subCategory: '正',
    strength: 9,
    specialRules: ['需要替卦'],
  },
  艮: {
    category: '天',
    subCategory: '正',
    strength: 9,
    specialRules: ['需要替卦'],
  },
  巽: {
    category: '天',
    subCategory: '正',
    strength: 9,
    specialRules: ['需要替卦'],
  },

  // 人元龙
  癸: { category: '人', subCategory: '正', strength: 8 },
  丁: { category: '人', subCategory: '正', strength: 8 },
  乙: { category: '人', subCategory: '正', strength: 8 },
  辛: { category: '人', subCategory: '正', strength: 8 },

  // 地元龙
  壬: { category: '地', subCategory: '正', strength: 7 },
  丙: { category: '地', subCategory: '正', strength: 7 },
  甲: { category: '地', subCategory: '正', strength: 7 },
  庚: { category: '地', subCategory: '正', strength: 7 },
  丑: { category: '地', subCategory: '正', strength: 6 },
  未: { category: '地', subCategory: '正', strength: 6 },
  辰: { category: '地', subCategory: '正', strength: 6 },
  戌: { category: '地', subCategory: '正', strength: 6 },
  寅: { category: '地', subCategory: '正', strength: 5 },
  申: { category: '地', subCategory: '正', strength: 5 },
  巳: { category: '地', subCategory: '正', strength: 5 },
  亥: { category: '地', subCategory: '正', strength: 5 },
};

// 兼向处理规则
export interface JianxiangRule {
  mainMountain: Mountain;
  jianMountain: Mountain;
  jianDegree: number; // 兼向度数
  effect: 'strengthen' | 'weaken' | 'neutral';
  adjustmentFactor: number; // 调整系数
  specialHandling?: string;
}

// 兼向规则表
export const JIANXIANG_RULES: JianxiangRule[] = [
  // 子山兼向规则
  {
    mainMountain: '子',
    jianMountain: '癸',
    jianDegree: 3,
    effect: 'strengthen',
    adjustmentFactor: 1.2,
  },
  {
    mainMountain: '子',
    jianMountain: '壬',
    jianDegree: 3,
    effect: 'weaken',
    adjustmentFactor: 0.8,
  },

  // 午山兼向规则
  {
    mainMountain: '午',
    jianMountain: '丁',
    jianDegree: 3,
    effect: 'strengthen',
    adjustmentFactor: 1.2,
  },
  {
    mainMountain: '午',
    jianMountain: '丙',
    jianDegree: 3,
    effect: 'weaken',
    adjustmentFactor: 0.8,
  },

  // 卯山兼向规则
  {
    mainMountain: '卯',
    jianMountain: '乙',
    jianDegree: 3,
    effect: 'strengthen',
    adjustmentFactor: 1.2,
  },
  {
    mainMountain: '卯',
    jianMountain: '甲',
    jianDegree: 3,
    effect: 'weaken',
    adjustmentFactor: 0.8,
  },

  // 酉山兼向规则
  {
    mainMountain: '酉',
    jianMountain: '辛',
    jianDegree: 3,
    effect: 'strengthen',
    adjustmentFactor: 1.2,
  },
  {
    mainMountain: '酉',
    jianMountain: '庚',
    jianDegree: 3,
    effect: 'weaken',
    adjustmentFactor: 0.8,
  },

  // 其他山向的兼向规则...
];

// 星曜力量计算
export function calculateStarPower(
  star: FlyingStar,
  period: Yun,
  palace: PalaceIndex,
  mountain?: Mountain,
  isJian: boolean = false,
  jianDegree: number = 0
): {
  basePower: number;
  timePower: number;
  spacePower: number;
  totalPower: number;
  status: '旺' | '生' | '退' | '煞' | '死';
  description: string;
} {
  // 基础力量（根据星曜本身属性）
  const starBasePower: Record<FlyingStar, number> = {
    1: 8,
    2: 4,
    3: 3,
    4: 7,
    5: 1,
    6: 9,
    7: 2,
    8: 8,
    9: 9,
  };

  let basePower = starBasePower[star];

  // 时间力量（根据当运关系）
  let timePower = 0;
  let status: '旺' | '生' | '退' | '煞' | '死';

  if (star === period) {
    timePower = 10;
    status = '旺';
  } else if (star === (((period % 9) + 1) as FlyingStar)) {
    timePower = 8;
    status = '生';
  } else if (star === ((((period - 2 + 9) % 9) + 1) as FlyingStar)) {
    timePower = 6;
    status = '退';
  } else if (star === ((((period + 1) % 9) + 1) as FlyingStar)) {
    timePower = 2;
    status = '煞';
  } else {
    timePower = 1;
    status = '死';
  }

  // 空间力量（根据宫位匹配度）
  let spacePower = 5; // 基础空间力量

  // 如果星曜与宫位相配（如1星在坎宫），增加空间力量
  if (star === palace) {
    spacePower += 3;
  }

  // 兼向调整
  if (isJian && mountain) {
    const jianRule = JIANXIANG_RULES.find(
      rule =>
        rule.mainMountain === mountain &&
        Math.abs(rule.jianDegree - jianDegree) <= 1
    );

    if (jianRule) {
      basePower *= jianRule.adjustmentFactor;
      spacePower *= jianRule.adjustmentFactor;
    }
  }

  const totalPower = (basePower + timePower + spacePower) / 3;

  const description = `${star}星在${palace}宫，当${period}运为${status}星，综合力量${totalPower.toFixed(1)}`;

  return {
    basePower,
    timePower,
    spacePower,
    totalPower,
    status,
    description,
  };
}

// 增强版顺逆飞判断
export function enhancedShunNiFeiJudgment(
  star: FlyingStar,
  mountain: Mountain,
  period: Yun,
  isJian: boolean = false,
  jianDegree: number = 0
): {
  direction: 'shun' | 'ni';
  confidence: number; // 判断置信度 0-1
  reasoning: string[];
  adjustments: string[];
} {
  const yuanLongInfo = PRECISE_YUANLONG_TABLE[mountain];
  const bagua = getBaguaByStar(star);
  const baguaYinYang = getBaguaYinYang(bagua);

  const reasoning: string[] = [];
  const adjustments: string[] = [];
  let confidence = 0.9; // 默认高置信度

  // 基础规则判断
  const basicRule =
    (baguaYinYang === '阳' && yuanLongInfo.category === '天') ||
    (baguaYinYang === '阴' && yuanLongInfo.category === '人');

  const direction: 'shun' | 'ni' = basicRule ? 'shun' : 'ni';

  reasoning.push(
    `${star}星属${bagua}卦（${baguaYinYang}），${mountain}山属${yuanLongInfo.category}元龙`
  );
  reasoning.push(
    `基础规则：${baguaYinYang}星配${yuanLongInfo.category}元龙 → ${direction}飞`
  );

  // 特殊规则调整
  if (yuanLongInfo.specialRules) {
    for (const rule of yuanLongInfo.specialRules) {
      if (rule === '需要替卦') {
        confidence *= 0.8;
        adjustments.push('此山向可能需要替卦处理');
      }
    }
  }

  // 兼向调整
  if (isJian) {
    const jianRule = JIANXIANG_RULES.find(
      rule =>
        rule.mainMountain === mountain &&
        Math.abs(rule.jianDegree - jianDegree) <= 1
    );

    if (jianRule) {
      if (jianRule.effect === 'strengthen') {
        confidence *= 1.1;
        adjustments.push(
          `兼向${jianRule.jianMountain}，增强${direction}飞效果`
        );
      } else if (jianRule.effect === 'weaken') {
        confidence *= 0.9;
        adjustments.push(
          `兼向${jianRule.jianMountain}，削弱${direction}飞效果`
        );
      }

      if (jianRule.specialHandling) {
        adjustments.push(jianRule.specialHandling);
      }
    }
  }

  // 五运特殊处理
  if (period === 5) {
    confidence *= 0.7;
    adjustments.push('五运期间，建议检查是否需要替卦');
  }

  return {
    direction,
    confidence: Math.min(confidence, 1),
    reasoning,
    adjustments,
  };
}

// 流年飞星叠加算法
export function calculateLiunianOverlay(
  basePlate: Plate,
  currentYear: number,
  currentMonth?: number
): {
  liunianPlate: Plate;
  liunianStar: FlyingStar;
  monthStar?: FlyingStar;
  overlayEffects: Array<{
    palace: PalaceIndex;
    effect: 'enhance' | 'conflict' | 'neutral';
    description: string;
    severity: 'high' | 'medium' | 'low';
  }>;
} {
  // 计算流年飞星（简化算法，实际需要更复杂的计算）
  const liunianStar = (((currentYear - 1984) % 9) + 1) as FlyingStar;

  // 计算流月飞星
  let monthStar: FlyingStar | undefined;
  if (currentMonth) {
    monthStar = (((liunianStar + currentMonth - 1) % 9) + 1) as FlyingStar;
  }

  // 生成流年盘
  const liunianPlate: Plate = [];
  let current = liunianStar;

  for (let idx = 0; idx < 9; idx++) {
    const palace = LUOSHU_ORDER[idx];
    liunianPlate.push({
      palace,
      mountainStar: current,
      facingStar: current,
      periodStar: current,
    });
    current = shunFei(current, 1);
  }

  // 分析叠加效果
  const overlayEffects: Array<{
    palace: PalaceIndex;
    effect: 'enhance' | 'conflict' | 'neutral';
    description: string;
    severity: 'high' | 'medium' | 'low';
  }> = [];

  for (const baseCell of basePlate) {
    const liunianCell = liunianPlate.find(
      cell => cell.palace === baseCell.palace
    );
    if (!liunianCell) continue;

    const baseMountain = baseCell.mountainStar || 0;
    const baseFacing = baseCell.facingStar || 0;
    const liunianOverlay = liunianCell.mountainStar || 0;

    let effect: 'enhance' | 'conflict' | 'neutral' = 'neutral';
    let severity: 'high' | 'medium' | 'low' = 'low';
    let description = '';

    // 判断叠加效果
    if (baseMountain === liunianOverlay || baseFacing === liunianOverlay) {
      effect = 'enhance';
      severity = 'high';
      description = `流年${liunianOverlay}星与本宫飞星重叠，力量倍增`;
    } else if (
      baseMountain + liunianOverlay === 10 ||
      baseFacing + liunianOverlay === 10
    ) {
      effect = 'conflict';
      severity = 'medium';
      description = `流年${liunianOverlay}星与本宫飞星相冲，需要化解`;
    } else if (liunianOverlay === 5) {
      effect = 'conflict';
      severity = 'high';
      description = `流年五黄星飞临，需要特别注意化解`;
    } else if ([1, 6, 8, 9].includes(liunianOverlay)) {
      effect = 'enhance';
      severity = 'low';
      description = `流年吉星${liunianOverlay}飞临，有助运势`;
    }

    overlayEffects.push({
      palace: baseCell.palace,
      effect,
      description,
      severity,
    });
  }

  return {
    liunianPlate: liunianPlate.sort((a, b) => a.palace - b.palace) as Plate,
    liunianStar,
    monthStar,
    overlayEffects,
  };
}

// 动态挨星调整
export function dynamicAixingAdjustment(
  plate: Plate,
  zuo: Mountain,
  xiang: Mountain,
  period: Yun,
  options: {
    considerJianxiang?: boolean;
    jianDegree?: number;
    includeLiunian?: boolean;
    currentYear?: number;
    environmentFactors?: Array<{
      factor: string;
      impact: number; // -1 到 1
      description: string;
    }>;
  } = {}
): {
  adjustedPlate: Plate;
  adjustmentLog: Array<{
    palace: PalaceIndex;
    originalStar: FlyingStar;
    adjustedStar: FlyingStar;
    reason: string;
    confidence: number;
  }>;
  recommendations: string[];
} {
  const adjustmentLog: Array<{
    palace: PalaceIndex;
    originalStar: FlyingStar;
    adjustedStar: FlyingStar;
    reason: string;
    confidence: number;
  }> = [];

  const recommendations: string[] = [];
  const adjustedPlate: Plate = JSON.parse(JSON.stringify(plate)); // 深拷贝

  // 兼向调整
  if (options.considerJianxiang && options.jianDegree !== undefined) {
    const jianRule = JIANXIANG_RULES.find(
      rule =>
        rule.mainMountain === zuo &&
        Math.abs(rule.jianDegree - options.jianDegree!) <= 1
    );

    if (jianRule) {
      recommendations.push(
        `检测到兼向${jianRule.jianMountain}，建议按兼向规则调整`
      );

      // 这里可以添加具体的兼向调整逻辑
      for (const cell of adjustedPlate) {
        if (cell.mountainStar) {
          const power = calculateStarPower(
            cell.mountainStar,
            period,
            cell.palace,
            zuo,
            true,
            options.jianDegree
          );

          if (power.totalPower < 5) {
            recommendations.push(`${cell.palace}宫山星力量偏弱，建议加强化解`);
          }
        }
      }
    }
  }

  // 流年叠加
  if (options.includeLiunian && options.currentYear) {
    const liunianResult = calculateLiunianOverlay(plate, options.currentYear);

    for (const effect of liunianResult.overlayEffects) {
      if (effect.severity === 'high') {
        recommendations.push(`${effect.palace}宫：${effect.description}`);
      }
    }
  }

  // 环境因素调整
  if (options.environmentFactors) {
    for (const factor of options.environmentFactors) {
      if (Math.abs(factor.impact) > 0.5) {
        recommendations.push(
          `环境因素"${factor.factor}"：${factor.description}`
        );
      }
    }
  }

  return {
    adjustedPlate,
    adjustmentLog,
    recommendations,
  };
}

const enhancedAixing = {
  calculateStarPower,
  enhancedShunNiFeiJudgment,
  calculateLiunianOverlay,
  dynamicAixingAdjustment,
  PRECISE_YUANLONG_TABLE,
  JIANXIANG_RULES,
};

export default enhancedAixing;
