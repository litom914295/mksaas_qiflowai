import { PALACE_TO_BAGUA } from './luoshu';
import type {
  FlyingStar,
  Mountain,
  PalaceIndex,
  Plate,
  QixingDajieAnalysis,
  QixingDajieType,
  Yun,
} from './types';

/**
 * 七星打劫模块
 *
 * 七星打劫是玄空飞星中的一种特殊催旺格局，主要通过在特定宫位"打劫"旺气来催旺财运或丁运。
 *
 * 成格条件（需全部满足）：
 * 1. 三元龙配置：坐山与向山必须属于同一卦（父母三般卦）
 * 2. 三般卦关系：运星、山星、向星之间形成1-4-7、2-5-8或3-6-9的三般卦关系
 * 3. 生旺星到位：当运星或生旺星飞临特定宫位
 * 4. 水龙配合：需要在打劫位有真实的水或动态元素配合
 */

// 三般卦组定义
const SANBAN_GROUPS: PalaceIndex[][] = [
  [1, 4, 7], // 第一组
  [2, 5, 8], // 第二组
  [3, 6, 9], // 第三组
];

/**
 * 根据当运确定三般卦组
 *
 * @param period - 当运
 * @returns 三般卦组 [1,4,7] | [2,5,8] | [3,6,9]
 */
export function getSanbanGroupByPeriod(period: Yun): PalaceIndex[] {
  for (const group of SANBAN_GROUPS) {
    if (group.includes(period)) {
      return group;
    }
  }
  // 理论上不会到达这里，但为了类型安全返回空数组
  return [];
}

/**
 * 判断是否为生旺星
 *
 * 生旺星定义：当运星 或 当运星±1（环形循环）
 *
 * @param star - 飞星
 * @param period - 当运
 * @returns 是否为生旺星
 */
export function isShengwangStar(star: FlyingStar, period: Yun): boolean {
  // 当运星本身就是生旺星
  if (star === period) return true;

  // 计算生旺星（当运+1，环形循环）
  const nextStar = ((period % 9) + 1) as Yun;
  // 计算退气星（当运-1，环形循环）
  const prevStar = (period === 1 ? 9 : period - 1) as Yun;

  // 生旺星包括当运星的前后星
  return star === nextStar || star === prevStar;
}

/**
 * 验证三般卦条件
 *
 * 三般卦定义：
 * - 1-4-7组（父母三般卦）
 * - 2-5-8组（父母三般卦）
 * - 3-6-9组（父母三般卦）
 *
 * 验证标准：飞星盘中至少有6个星位（2/3）包含当运所属三般卦组的星
 *
 * @param plate - 飞星盘
 * @param period - 当前元运
 * @returns 三般卦验证结果
 */
export function validateSanbanGua(
  plate: Plate,
  period: Yun
): {
  isValid: boolean;
  group: number[];
  matchCount: number;
  details: string[];
} {
  // 确定当运所属的三般卦组
  const targetGroup = getSanbanGroupByPeriod(period);

  // 统计三般卦组中的星在盘中的出现情况
  let matchCount = 0;
  const details: string[] = [];

  for (const cell of plate) {
    const stars = [
      cell.periodStar,
      cell.mountainStar,
      cell.facingStar,
    ].filter(Boolean) as FlyingStar[];

    for (const star of stars) {
      if (targetGroup.includes(star)) {
        matchCount++;
        const bagua = PALACE_TO_BAGUA[cell.palace];
        const starType =
          star === cell.periodStar
            ? '天盘'
            : star === cell.mountainStar
              ? '山盘'
              : '向盘';
        details.push(`${bagua}宫${starType}含三般卦星${star}`);
      }
    }
  }

  // 三般卦有效条件：至少有6个位置（三分之二的九宫格×三盘=27个位置的1/3以上）
  // 实际上每个宫位最多3颗星（天盘、山盘、向盘），9个宫×3=27个星位
  // 要求至少6个星位匹配，约占22%，这是一个相对宽松但有效的标准
  const isValid = matchCount >= 6;

  return {
    isValid,
    group: targetGroup,
    matchCount,
    details,
  };
}

/**
 * 识别打劫位置
 *
 * 打劫位置判断标准：
 * 1. 位置必须在三般卦组宫位中
 * 2. 劫财：向星为当运星或生旺星
 * 3. 劫丁：山星为当运星或生旺星
 *
 * @param plate - 飞星盘
 * @param period - 当运
 * @param sanbanGroup - 三般卦组
 * @returns 打劫位置分析结果
 */
export function identifyDajiePositions(
  plate: Plate,
  period: Yun,
  sanbanGroup: PalaceIndex[]
): {
  jiecaiPositions: PalaceIndex[];
  jiedingPositions: PalaceIndex[];
  allPositions: PalaceIndex[];
} {
  const jiecaiPositions: PalaceIndex[] = [];
  const jiedingPositions: PalaceIndex[] = [];
  const allPositions: PalaceIndex[] = [];

  for (const palaceIndex of sanbanGroup) {
    const cell = plate.find((c) => c.palace === palaceIndex);
    if (!cell) continue;

    let hasJiecai = false;
    let hasJieding = false;

    // 检查劫财条件：向星为当运星或生旺星
    if (
      cell.facingStar === period ||
      isShengwangStar(cell.facingStar, period)
    ) {
      jiecaiPositions.push(palaceIndex);
      hasJiecai = true;
    }

    // 检查劫丁条件：山星为当运星或生旺星
    if (
      cell.mountainStar === period ||
      isShengwangStar(cell.mountainStar, period)
    ) {
      jiedingPositions.push(palaceIndex);
      hasJieding = true;
    }

    // 记录所有打劫位置
    if (hasJiecai || hasJieding) {
      if (!allPositions.includes(palaceIndex)) {
        allPositions.push(palaceIndex);
      }
    }
  }

  return {
    jiecaiPositions,
    jiedingPositions,
    allPositions,
  };
}

/**
 * 评估七星打劫的有效性
 *
 * 评估因素：
 * 1. 三般卦匹配度（40%）- matchCount/27 * 40
 * 2. 当运星到位情况（30%）- 打劫位中当运星的比例
 * 3. 生旺星配合情况（20%）- 打劫位中生旺星的比例
 * 4. 环境配合程度（10%）- 基础分，后续可根据实际环境调整
 *
 * @param plate - 飞星盘
 * @param period - 当运
 * @param positions - 打劫位置列表
 * @param sanbanValidation - 三般卦验证结果
 * @returns 有效性等级
 */
export function analyzeDajieEffectiveness(
  plate: Plate,
  period: Yun,
  positions: PalaceIndex[],
  sanbanValidation: { isValid: boolean; matchCount: number }
): 'peak' | 'high' | 'medium' | 'low' {
  if (positions.length === 0) return 'low';

  let score = 0;

  // 因素1：三般卦匹配度（0-40分）
  // 27个星位（9宫×3盘）中匹配的数量
  const sanbanScore = Math.min((sanbanValidation.matchCount / 27) * 40, 40);
  score += sanbanScore;

  // 因素2：当运星到位情况（0-30分）
  let periodStarCount = 0;
  let totalStarPositions = 0;
  for (const pos of positions) {
    const cell = plate.find((c) => c.palace === pos);
    if (cell) {
      if (cell.periodStar === period) periodStarCount++;
      if (cell.mountainStar === period) periodStarCount++;
      if (cell.facingStar === period) periodStarCount++;
      totalStarPositions += 3; // 每个宫位3个星位
    }
  }
  const periodScore =
    totalStarPositions > 0 ? (periodStarCount / totalStarPositions) * 30 : 0;
  score += periodScore;

  // 因素3：生旺星配合情况（0-20分）
  let shengwangCount = 0;
  let mountainFacingPositions = 0;
  for (const pos of positions) {
    const cell = plate.find((c) => c.palace === pos);
    if (cell) {
      if (isShengwangStar(cell.mountainStar, period)) shengwangCount++;
      if (isShengwangStar(cell.facingStar, period)) shengwangCount++;
      mountainFacingPositions += 2; // 山星+向星
    }
  }
  const shengwangScore =
    mountainFacingPositions > 0
      ? (shengwangCount / mountainFacingPositions) * 20
      : 0;
  score += shengwangScore;

  // 因素4：环境配合程度（基础给10分）
  score += 10;

  // 根据总分确定等级
  if (score >= 85) return 'peak'; // 卓越
  if (score >= 70) return 'high'; // 良好
  if (score >= 50) return 'medium'; // 中等
  return 'low'; // 较低
}

/**
 * 生成七星打劫格局描述
 *
 * @param dajieType - 打劫类型
 * @param effectiveness - 有效性等级
 * @param positions - 打劫位置
 * @returns 格局描述
 */
export function generateDajieDescription(
  dajieType: QixingDajieType | null,
  effectiveness: 'peak' | 'high' | 'medium' | 'low',
  positions: PalaceIndex[]
): string {
  if (!dajieType || positions.length === 0) {
    return '不成七星打劫格局';
  }

  const typeDesc =
    dajieType === 'full'
      ? '全劫格局（同时劫财劫丁）'
      : dajieType === 'jie_cai'
        ? '劫财格局'
        : '劫丁格局';

  const effectDesc =
    effectiveness === 'peak'
      ? '效果卓越'
      : effectiveness === 'high'
        ? '效果良好'
        : effectiveness === 'medium'
          ? '效果中等'
          : '效果较弱';

  const palaceNames = positions
    .map((p) => PALACE_TO_BAGUA[p])
    .join('、');

  return `七星打劫${typeDesc}，打劫位：${palaceNames}宫，${effectDesc}`;
}

/**
 * 生成七星打劫催旺要求
 *
 * @param dajieType - 打劫类型
 * @param positions - 打劫位置
 * @returns 催旺要求列表
 */
export function generateDajieActivationRequirements(
  dajieType: QixingDajieType | null,
  positions: PalaceIndex[]
): string[] {
  if (!dajieType || positions.length === 0) {
    return [];
  }

  const requirements: string[] = [];
  const palaceNames = positions.map((p) => PALACE_TO_BAGUA[p]);

  // 基础要求
  requirements.push('必须满足三般卦条件（1-4-7、2-5-8或3-6-9组）');
  requirements.push('坐山与向山需属于同一卦（父母三般卦）');

  // 根据打劫类型添加特定要求
  if (dajieType === 'jie_cai' || dajieType === 'full') {
    requirements.push(
      `在${palaceNames.join('、')}宫放置流动的水以催旺财运`
    );
    requirements.push('可设置鱼缸、水景或流水装置');
    requirements.push('保持水质清洁，水流不可停滞');
  }

  if (dajieType === 'jie_ding' || dajieType === 'full') {
    requirements.push(
      `在${palaceNames.join('、')}宫安排经常活动的场所以催旺人丁`
    );
    requirements.push('可设置会客区、活动区域或家庭聚会场所');
    requirements.push('保持该方位的人气和动感');
  }

  // 通用要求
  requirements.push('打劫位必须保持清洁整齐，不可堆放杂物');
  requirements.push('避免打劫位有阻挡或压制');
  requirements.push('定期检查和调整布局');

  return requirements;
}

/**
 * 生成七星打劫禁忌事项
 *
 * @param positions - 打劫位置
 * @returns 禁忌事项列表
 */
export function generateDajieTaboos(positions: PalaceIndex[]): string[] {
  if (positions.length === 0) {
    return [];
  }

  const taboos: string[] = [];
  const palaceNames = positions.map((p) => PALACE_TO_BAGUA[p]);

  // 通用禁忌
  taboos.push(`不可在${palaceNames.join('、')}宫堆放杂物或废品`);
  taboos.push(`避免${palaceNames.join('、')}宫过于阴暗或潮湿`);
  taboos.push(`不可让${palaceNames.join('、')}宫有破损或污秽`);
  taboos.push('不可在打劫位放置尖锐、破碎或不吉利的物品');

  // 根据具体宫位添加特殊禁忌
  for (const pos of positions) {
    const bagua = PALACE_TO_BAGUA[pos];
    const baguaTaboos: Record<string, string[]> = {
      坎: ['避免过度干燥', '不可放置火性物品'],
      坤: ['避免过于动荡', '不可放置尖锐物品'],
      震: ['避免过于安静', '不可放置重物压制'],
      巽: ['避免阻挡通风', '不可放置金属利器'],
      中: ['避免杂乱无章', '不可作为储物间'],
      乾: ['避免污秽不净', '不可放置阴性物品'],
      兑: ['避免嘈杂吵闹', '不可放置破损物品'],
      艮: ['避免频繁移动', '不可放置不稳物品'],
      离: ['避免过度阴暗', '不可放置水性太重的物品'],
    };

    if (baguaTaboos[bagua]) {
      taboos.push(...baguaTaboos[bagua].map((t) => `${bagua}宫${t}`));
    }
  }

  // 去重
  return [...new Set(taboos)];
}

/**
 * 计算七星打劫评分
 *
 * @param effectiveness - 有效性等级
 * @param sanbanValidation - 三般卦验证结果
 * @param dajieType - 打劫类型
 * @returns 评分（0-100）
 */
export function calculateDajieScore(
  effectiveness: 'peak' | 'high' | 'medium' | 'low',
  sanbanValidation: { isValid: boolean; matchCount: number },
  dajieType: QixingDajieType | null
): number {
  let score = 0;

  // 基础分：有效性等级
  const effectivenessScores = {
    peak: 50,
    high: 40,
    medium: 30,
    low: 20,
  };
  score += effectivenessScores[effectiveness];

  // 三般卦匹配度加分（0-25分）
  score += Math.min((sanbanValidation.matchCount / 27) * 25, 25);

  // 打劫类型加分
  if (dajieType === 'full') {
    score += 25; // 全劫最高分
  } else if (dajieType === 'jie_cai' || dajieType === 'jie_ding') {
    score += 15; // 单劫次之
  }

  return Math.min(Math.round(score), 100);
}

/**
 * 七星打劫格局完整判断算法
 *
 * @param plate - 飞星盘
 * @param period - 当前元运
 * @param zuo - 坐山
 * @param xiang - 向山
 * @returns 七星打劫分析结果
 */
export function checkQixingDajiePattern(
  plate: Plate,
  period: Yun,
  zuo: Mountain,
  xiang: Mountain
): QixingDajieAnalysis {
  // 步骤1：验证三般卦条件
  const sanbanValidation = validateSanbanGua(plate, period);
  if (!sanbanValidation.isValid) {
    return {
      isQixingDajie: false,
      dajieType: null,
      dajiePositions: [],
      sanbanGuaValidation: sanbanValidation,
      effectiveness: 'low',
      description: '不满足三般卦条件，无法形成七星打劫格局',
      activationRequirements: [],
      taboos: [],
      score: 0,
    };
  }

  // 步骤2：根据当运确定三般卦组
  const sanbanGroup = getSanbanGroupByPeriod(period);

  // 步骤3：识别打劫位置
  const { jiecaiPositions, jiedingPositions, allPositions } =
    identifyDajiePositions(plate, period, sanbanGroup);

  // 步骤4：判断打劫类型
  let dajieType: QixingDajieType | null = null;
  if (jiecaiPositions.length > 0 && jiedingPositions.length > 0) {
    dajieType = 'full'; // 全劫
  } else if (jiecaiPositions.length > 0) {
    dajieType = 'jie_cai'; // 劫财
  } else if (jiedingPositions.length > 0) {
    dajieType = 'jie_ding'; // 劫丁
  }

  const isQixingDajie = allPositions.length > 0 && dajieType !== null;

  if (!isQixingDajie) {
    return {
      isQixingDajie: false,
      dajieType: null,
      dajiePositions: [],
      sanbanGuaValidation: sanbanValidation,
      effectiveness: 'low',
      description: '满足三般卦条件，但无有效打劫位',
      activationRequirements: [],
      taboos: [],
      score: 0,
    };
  }

  // 步骤5：评估有效性
  const effectiveness = analyzeDajieEffectiveness(
    plate,
    period,
    allPositions,
    sanbanValidation
  );

  // 步骤6：生成描述和建议
  const description = generateDajieDescription(
    dajieType,
    effectiveness,
    allPositions
  );
  const activationRequirements = generateDajieActivationRequirements(
    dajieType,
    allPositions
  );
  const taboos = generateDajieTaboos(allPositions);

  // 步骤7：计算评分
  const score = calculateDajieScore(
    effectiveness,
    sanbanValidation,
    dajieType
  );

  return {
    isQixingDajie,
    dajieType,
    dajiePositions: allPositions,
    sanbanGuaValidation: sanbanValidation,
    effectiveness,
    description,
    activationRequirements,
    taboos,
    score,
  };
}

/**
 * 七星打劫实用原则
 */
export const QIXING_DAJIE_PRINCIPLES = {
  basic: [
    '七星打劫贵在三般卦配合，缺一不可',
    '打劫位必须在三般卦组宫位中（1-4-7、2-5-8或3-6-9）',
    '劫财看向星，劫丁看山星，全劫两者兼顾',
    '打劫位需要真实的水或动态元素配合',
  ],
  advanced: [
    '七星打劫是城门诀的高级形式，威力更强',
    '当运星到位的打劫效果最佳',
    '生旺星配合可增强打劫效果',
    '打劫位的环境配合至关重要',
  ],
  practical: [
    '劫财位宜放置流动的水，如鱼缸、水景',
    '劫丁位宜安排活动场所，增加人气',
    '打劫位必须保持清洁整齐，不可杂乱',
    '避免在打劫位放置阻挡、压制的物品',
  ],
  timing: [
    '运的前五年是七星打劫的黄金期',
    '运的中期打劫效果依然强劲',
    '运的后期需要谨慎使用',
    '换运前需要提前调整布局',
  ],
};
