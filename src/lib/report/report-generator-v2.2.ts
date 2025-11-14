/**
 * 专业报告 v2.2 生成引擎
 *
 * 功能：
 * 1. 从 analyzePattern() 输出映射到 StrategyMapping
 * 2. 从 analyzeLingzheng() 输出映射到 FengshuiChecklist
 * 3. 生成 HopeTimeline、DecisionComparison
 * 4. 组装完整 ReportOutput_v2_2
 */

import type {
  ActionItem,
  BaziToStrategyMapper,
  DecisionComparison,
  DecisionOption,
  EnvironmentalTask,
  FengshuiChecklist,
  FengshuiToChecklistMapper,
  HopeTimeline,
  LifeThemeStage,
  ReportOutput_v2_2,
  StrategyMapping,
} from '@/types/report-v2.2';

// 依赖现有模块（需要调整导入路径）
// import { analyzePattern } from '@/lib/bazi/pattern-analysis';
// import { analyzeLingzheng, generateLingzhengRecommendations, checkZeroPositiveReversed } from '@/lib/qiflow/xuankong/lingzheng';

// ============ 八字 → 策略映射 ============

export const mapBaziToStrategy: BaziToStrategyMapper = (
  patternAnalysis,
  luckPillars,
  currentAge,
  userContext = {}
) => {
  // TODO: 实际实现需根据 patternAnalysis 结构调整

  // 示例：提取用神、十神、大运
  const {
    pattern,
    patternStrength,
    patternPurity,
    usefulGod,
    formationFactors,
    destructionFactors,
    seasonalAdjustment,
  } = patternAnalysis;

  // 1. 生成人生主题故事
  const lifeTheme = generateLifeTheme(
    pattern,
    usefulGod,
    luckPillars,
    currentAge,
    userContext
  );

  // 2. 职业匹配
  const careerMatch = generateCareerMatches(
    usefulGod,
    pattern,
    patternStrength
  );

  // 3. 决策时间窗口
  const decisionWindows = generateDecisionWindows(
    luckPillars,
    currentAge,
    usefulGod
  );

  // 4. 分级行动方案
  const actions = generateActionPlan(
    usefulGod,
    seasonalAdjustment,
    patternStrength
  );

  // 5. 归因分解
  const attribution = calculateAttribution(
    patternAnalysis,
    luckPillars,
    currentAge
  );

  // 6. 风险提示
  const riskWarnings = generateRiskWarnings(destructionFactors, luckPillars);

  return {
    lifeTheme,
    careerMatch,
    decisionWindows,
    actions,
    riskWarnings,
    attribution,
  };
};

// ---- 辅助函数 ----

function generateLifeTheme(
  pattern: any,
  usefulGod: any,
  luckPillars: any[],
  currentAge: number,
  userContext: any
): StrategyMapping['lifeTheme'] {
  // TODO: 根据格局类型、用神、大运生成人生主题

  // 示例：若是"从格"→"顺势而为型"
  // 示例：若用神受克→"先蓄力、后爆发型"
  // 示例：若大运前弱后强→"逆袭型"

  const title = '先蓄力、后爆发'; // 占位
  const summary = '您的八字格局显示：早年需要积累，中年后运势提升...'; // 占位

  const stages: LifeThemeStage[] = [
    {
      ageRange: '18-25岁',
      likelyEvents: ['求学压力大', '职业探索期', '人际挫折'],
      meaning: '用神未行运，需蓄力',
      lesson: '学会等待与积累',
      skills: ['抗压力', '基础技能'],
      evidence: ['大运为忌神', '五行失衡'],
    },
    // ... 其他阶段
  ];

  return { title, summary, stages };
}

function generateCareerMatches(
  usefulGod: any,
  pattern: any,
  patternStrength: any
) {
  // TODO: 基于用神、格局推荐职业
  // 如：正官+印→公务员、教师；伤官+财→创意、销售

  return [
    { career: '管理咨询', score: 85, rationale: '正官+食神组合' },
    { career: '教育培训', score: 78, rationale: '印星透干' },
  ];
}

/**
 * 五行相生相克关系
 */
const ELEMENT_RELATIONS = {
  木: { generates: '火', controls: '土', generatedBy: '水', controlledBy: '金' },
  火: { generates: '土', controls: '金', generatedBy: '木', controlledBy: '水' },
  土: { generates: '金', controls: '水', generatedBy: '火', controlledBy: '木' },
  金: { generates: '水', controls: '木', generatedBy: '土', controlledBy: '火' },
  水: { generates: '木', controls: '火', generatedBy: '金', controlledBy: '土' },
};

/**
 * 月令五行旺相休囚死
 * - 春季（寅卯辰 2-4月）：木旺、火相、水休、金囚、土死
 * - 夏季（巳午未 5-7月）：火旺、土相、木休、水囚、金死
 * - 秋季（申酉戌 8-10月）：金旺、水相、土休、火囚、木死
 * - 冬季（亥子丑 11-1月）：水旺、木相、金休、土囚、火死
 */
const MONTH_ELEMENT_STRENGTH = {
  spring: { 木: 5, 火: 3, 水: 2, 金: 1, 土: 0 },
  summer: { 火: 5, 土: 3, 木: 2, 水: 1, 金: 0 },
  autumn: { 金: 5, 水: 3, 土: 2, 火: 1, 木: 0 },
  winter: { 水: 5, 木: 3, 金: 2, 土: 1, 火: 0 },
};

/**
 * 获取月份对应的季节
 */
function getSeason(month: number): 'spring' | 'summer' | 'autumn' | 'winter' {
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter'; // 11, 12, 1
}

/**
 * 计算月令对用神的影响强度（0-5）
 */
function getMonthStrength(month: number, element: string): number {
  const season = getSeason(month);
  return MONTH_ELEMENT_STRENGTH[season][element] || 0;
}

/**
 * 计算五行互动得分（生克制化）
 * @param element1 - 五行1
 * @param element2 - 五行2
 * @returns 互动得分：相生+10，相克-10，其他0
 */
function calculateElementInteraction(
  element1: string,
  element2: string
): number {
  if (!element1 || !element2) return 0;

  const relation = ELEMENT_RELATIONS[element1];
  if (!relation) return 0;

  if (relation.generates === element2) {
    return 10; // element1 生 element2
  } else if (relation.controls === element2) {
    return -10; // element1 克 element2
  }

  return 0; // 无直接关系
}

/**
 * 生成决策时间窗口（增强版）
 *
 * 功能：根据大运、流年、月令计算关键决策的最佳时机
 * - 遍历未来10年的大运/流年
 * - 找用神得力 + 五行相合的时间段
 * - 分析月令对用神的影响（春夏秋冬五行强弱）
 * - 计算五行互动（生克制化）
 * - 计算置信度（基于格局强度、用神力量、月令、五行关系）
 * - 转换为ISO日期格式（solar calendar）
 *
 * @param luckPillars - 大运信息
 * @param currentAge - 当前年龄
 * @param usefulGod - 用神信息
 * @returns 5个决策主题的时间窗口
 */
function generateDecisionWindows(
  luckPillars: any[],
  currentAge: number,
  usefulGod: any
) {
  const Lunar = require('lunar-javascript').Lunar;
  const Solar = require('lunar-javascript').Solar;

  // 提取用神五行
  const usefulElement = usefulGod?.element || usefulGod;

  if (!usefulElement || !luckPillars || luckPillars.length === 0) {
    // 如果没有足够信息，返回空数组
    return [];
  }

  // 定义5个决策主题
  const topics = [
    {
      id: 'entrepreneurship',
      name: '创业/跳槽',
      relatedElements: ['财', '官', '食'],
    },
    { id: 'marriage', name: '结婚/生子', relatedElements: ['官', '财', '印'] },
    { id: 'property', name: '置业/投资', relatedElements: ['财', '印', '比'] },
    { id: 'education', name: '学业深造', relatedElements: ['印', '官', '食'] },
    {
      id: 'contract',
      name: '重大合同/合作',
      relatedElements: ['官', '财', '伤'],
    },
  ];

  // 当前年份
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // 遍历未来10年，找用神得力的时间段（分析每个月）
  const favorablePeriods: any[] = [];

  for (let yearOffset = 0; yearOffset < 10; yearOffset++) {
    const targetYear = currentYear + yearOffset;

    // 查找该年的大运信息（简化处理：假设luckPillars包含startAge和element）
    const currentLuckPillar = luckPillars.find((lp: any) => {
      const startAge = lp.startAge || 0;
      const endAge = startAge + 10;
      const targetAge = currentAge + yearOffset;
      return targetAge >= startAge && targetAge < endAge;
    });

    // 如果大运中包含用神五行，认为这一年有利
    const isLuckPillarFavorable =
      currentLuckPillar?.heavenlyStem?.element === usefulElement ||
      currentLuckPillar?.earthlyBranch?.element === usefulElement;

    if (isLuckPillarFavorable) {
      // 该年有利，分析每个季节找最佳时间窗口
      // 遍历四个季节，找月令对用神最有利的季节
      const seasons = [
        { name: 'spring', start: 2, end: 4, label: '春季' },
        { name: 'summer', start: 5, end: 7, label: '夏季' },
        { name: 'autumn', start: 8, end: 10, label: '秋季' },
        { name: 'winter', start: 11, end: 1, label: '冬季' },
      ];

      let bestSeason = seasons[0];
      let bestMonthStrength = 0;

      // 找到对用神最有利的季节
      seasons.forEach((season) => {
        const monthStrength = getMonthStrength(season.start, usefulElement);
        if (monthStrength > bestMonthStrength) {
          bestMonthStrength = monthStrength;
          bestSeason = season;
        }
      });

      try {
        // 转换为ISO格式（公历）
        let periodStart: any;
        let periodEnd: any;

        if (bestSeason.name === 'winter') {
          // 冬季跨年：11月-次年1月
          periodStart = Solar.fromYmd(targetYear, 11, 1);
          periodEnd = Solar.fromYmd(targetYear + 1, 1, 31);
        } else {
          periodStart = Solar.fromYmd(targetYear, bestSeason.start, 1);
          periodEnd = Solar.fromYmd(
            targetYear,
            bestSeason.end,
            bestSeason.end === 2 ? 28 : 30
          );
        }

        // 计算置信度（65-95范围）
        let confidence = 70; // 基础置信度

        // 1. 大运匹配得分（最高+15分）
        if (
          currentLuckPillar?.heavenlyStem?.element === usefulElement &&
          currentLuckPillar?.earthlyBranch?.element === usefulElement
        ) {
          confidence += 15; // 天干地支都匹配
        } else if (
          currentLuckPillar?.heavenlyStem?.element === usefulElement ||
          currentLuckPillar?.earthlyBranch?.element === usefulElement
        ) {
          confidence += 8; // 天干或地支匹配
        }

        // 2. 月令强度得分（最高+10分）
        // bestMonthStrength范围0-5，映射为0-10分
        confidence += bestMonthStrength * 2;

        // 3. 五行互动得分（最高+5分）
        // 检查大运天干/地支与用神的五行互动
        const stemElement = currentLuckPillar?.heavenlyStem?.element;
        const branchElement = currentLuckPillar?.earthlyBranch?.element;

        let interactionBonus = 0;
        if (stemElement) {
          const stemInteraction = calculateElementInteraction(
            stemElement,
            usefulElement
          );
          if (stemInteraction > 0) {
            interactionBonus += 3; // 天干生用神
          }
        }
        if (branchElement) {
          const branchInteraction = calculateElementInteraction(
            branchElement,
            usefulElement
          );
          if (branchInteraction > 0) {
            interactionBonus += 2; // 地支生用神
          }
        }
        confidence += Math.min(interactionBonus, 5);

        // 4. 根据距离现在的时间调整置信度（远期不确定性高）
        if (yearOffset > 5) {
          confidence -= 5; // 远期降低5分
        } else if (yearOffset > 3) {
          confidence -= 3; // 中期降低3分
        }

        // 确保置信度在65-95范围内
        confidence = Math.max(65, Math.min(95, confidence));

        // 生成详细说明
        let detailedNote = `${targetYear}年${bestSeason.label}（${bestSeason.start}-${bestSeason.end}月）`;
        detailedNote += `，大运支持，用神${usefulElement}得力`;
        if (bestMonthStrength >= 4) {
          detailedNote += `，该季节${usefulElement}旺相，时机极佳`;
        } else if (bestMonthStrength >= 3) {
          detailedNote += `，该季节${usefulElement}相气，时机良好`;
        }
        if (interactionBonus > 0) {
          detailedNote += `，五行相生，助力明显`;
        }

        favorablePeriods.push({
          year: targetYear,
          from: periodStart.toYmd(), // ISO格式：YYYY-MM-DD
          to: periodEnd.toYmd(),
          confidence,
          note: detailedNote,
          season: bestSeason.label,
          monthStrength: bestMonthStrength,
          luckPillar: currentLuckPillar,
        });
      } catch (error) {
        // 日期转换失败，跳过该年
        console.error(`日期转换失败: ${targetYear}年`, error);
      }
    }
  }

  // 如果没有找到有利时间段，至少返回最近的3年（置信度较低）
  if (favorablePeriods.length === 0) {
    for (let i = 0; i < 3; i++) {
      const targetYear = currentYear + i;
      try {
        const springStart = Solar.fromYmd(targetYear, 2, 4);
        const springEnd = Solar.fromYmd(targetYear, 4, 30);

        favorablePeriods.push({
          year: targetYear,
          from: springStart.toYmd(),
          to: springEnd.toYmd(),
          confidence: 65 + i * 2, // 65, 67, 69
          note: `${targetYear}年运势平稳，可尝试`,
          luckPillar: null,
        });
      } catch (error) {
        console.error(`日期转换失败: ${targetYear}年`, error);
      }
    }
  }

  // 为每个主题分配时间窗口（取前5个有利时间段）
  const decisionWindows: any[] = [];

  topics.forEach((topic, index) => {
    // 为每个主题取不同的时间窗口（如果有多个）
    const periodIndex = index % favorablePeriods.length;
    const period = favorablePeriods[periodIndex];

    if (period) {
      decisionWindows.push({
        topic: topic.name,
        window: {
          from: period.from,
          to: period.to,
          confidence: period.confidence,
          note: period.note,
        },
        rationale: `该时段用神${usefulElement}得力，适合${topic.name}类决策。${period.note}`,
      });
    }
  });

  return decisionWindows;
}

/**
 * 生成分级行动清单
 *
 * 功能：根据用神、调候、格局强度生成三级行动方案
 * - 必做项（essential）：1-3项，1-2周见效，高影响+低成本
 * - 推荐项（recommended）：3-5项，1-2月见效，中影响+中成本
 * - 加分项（optional）：5-10项，3-6月见效，长期收益
 *
 * @param usefulGod - 用神信息（含element字段）
 * @param seasonalAdjustment - 调候信息（暂未使用，预留）
 * @param patternStrength - 格局强度（strong/medium/weak）
 * @returns 三级行动方案
 */
function generateActionPlan(
  usefulGod: any,
  seasonalAdjustment: any,
  patternStrength: any
): StrategyMapping['actions'] {
  // 导入行动模板库
  const {
    getActionsByElement,
    filterActionsByPriority,
    filterActionsByCost,
    convertToActionItem,
  } = require('@/lib/bazi/action-templates');

  // 提取用神五行
  const usefulElement = usefulGod?.element || usefulGod;

  if (!usefulElement) {
    // 如果没有用神信息，返回空
    return {
      essential: [],
      recommended: [],
      optional: [],
    };
  }

  // 获取该用神的所有行动模板
  const allActions = getActionsByElement(usefulElement);

  if (allActions.length === 0) {
    // 如果没有对应的模板，返回空
    return {
      essential: [],
      recommended: [],
      optional: [],
    };
  }

  // 1. 筛选必做项（essential）：取前2项（保证1-3项）
  const essentialTemplates = filterActionsByPriority(allActions, 'essential');
  const essential: ActionItem[] = essentialTemplates
    .slice(0, 2) // 取前2项
    .map(convertToActionItem);

  // 2. 筛选推荐项（recommended）：取前3项（保证3-5项）
  const recommendedTemplates = filterActionsByPriority(
    allActions,
    'recommended'
  );
  const recommended: ActionItem[] = recommendedTemplates
    .slice(0, 3) // 取前3项
    .map(convertToActionItem);

  // 3. 筛选加分项（optional）：根据格局强度动态调整数量
  let optionalCount = 5; // 默认5项

  if (patternStrength === 'strong') {
    optionalCount = 7; // 格局强，多给些选项
  } else if (patternStrength === 'weak') {
    optionalCount = 3; // 格局弱，避免过多选择（执行力有限）
  }

  const optionalTemplates = filterActionsByPriority(allActions, 'optional');
  const optional: ActionItem[] = optionalTemplates
    .slice(0, optionalCount)
    .map(convertToActionItem);

  // 4. 根据调候信息微调（如果有）
  // TODO: 如果seasonalAdjustment包含寒热信息，可以调整行动优先级
  // 例如：寒重→优先温热类行动；热重→优先清凉类行动

  return {
    essential,
    recommended,
    optional,
  };
}

/**
 * 归因分解算法
 *
 * 将当前困境/成就分解为4个因素：
 * - 时间因素（30-50%）：大运/流年是否有利
 * - 禀赋因素（10-30%）：先天格局强度/用神力量
 * - 环境因素（20-30%）：外部条件（风水、社会环境等）
 * - 策略因素（20-30%）：个人选择/行动
 *
 * 核心话术："这不是你不行，而是时机不利"
 *
 * @param patternAnalysis - 格局分析结果（需包含 patternStrength, patternPurity, usefulGod 等）
 * @param luckPillars - 大运数组
 * @param currentAge - 当前年龄
 * @returns 归因分解结果
 */
function calculateAttribution(
  patternAnalysis: any,
  luckPillars: any[],
  currentAge: number
): StrategyMapping['attribution'] {
  // 初始化基准值（确保总和=100%）
  let timeFactor = 30; // 时间因素基准
  let endowmentFactor = 20; // 禀赋因素基准
  let environmentFactor = 25; // 环境因素基准
  let strategyFactor = 25; // 策略因素基准

  const notes: string[] = [];
  const controllabilityLabels: {
    factor: string;
    controllable: boolean;
    label: string;
  }[] = [];

  // 提取关键信息
  const {
    patternStrength = 'medium',
    patternPurity = 'mixed',
    usefulGod,
    destructionFactors = [],
  } = patternAnalysis || {};

  // ===== 1. 计算当前大运状态 =====
  const currentLuckPillar = getCurrentLuckPillar(luckPillars, currentAge);
  const isUsefulGodFavorable = checkUsefulGodInLuckPillar(
    currentLuckPillar,
    usefulGod
  );
  const nextFavorablePillar = getNextFavorableLuckPillar(
    luckPillars,
    currentAge,
    usefulGod
  );

  // 大运不利 → 时间因素增加
  if (!isUsefulGodFavorable) {
    timeFactor += 15;
    environmentFactor -= 5;
    strategyFactor -= 5;
    endowmentFactor -= 5;

    controllabilityLabels.push({
      factor: '时间',
      controllable: false,
      label: '不可控',
    });

    if (nextFavorablePillar) {
      const yearsUntilTurning = nextFavorablePillar.startAge - currentAge;
      notes.push(
        `时间因素（${timeFactor}%）：当前大运不利用神，暂时受限。` +
          `但${yearsUntilTurning}年后（约${nextFavorablePillar.startAge}岁时）运势转好，` +
          '届时各方面将有10-30%的提升。**这不是你不行，而是时机不利。**'
      );
    } else {
      notes.push(
        `时间因素（${timeFactor}%）：当前大运对用神支持不足，需依靠策略与环境优化来弥补。` +
          '**困难是暂时的，方法得当仍可改善。**'
      );
    }
  } else {
    // 大运有利 → 时间因素减少，策略因素增加
    timeFactor -= 10;
    strategyFactor += 10;

    controllabilityLabels.push({
      factor: '时间',
      controllable: false,
      label: '有利（不可控但当前支持）',
    });

    notes.push(
      `时间因素（${timeFactor}%）：当前大运有利，天时在握。` +
        '此时若配合正确策略，成功率可提升20-40%。**抓住时机，主动出击。**'
    );
  }

  // ===== 2. 计算先天禀赋因素 =====
  // 格局破损严重 → 禀赋因素增加
  if (patternPurity === 'broken' || destructionFactors.length >= 2) {
    endowmentFactor += 10;
    strategyFactor -= 5;
    environmentFactor -= 5;

    controllabilityLabels.push({
      factor: '禀赋',
      controllable: false,
      label: '不可控（先天条件）',
    });

    notes.push(
      `禀赋因素（${endowmentFactor}%）：格局存在破损，先天条件受限。` +
        '但这并非终点，历史上许多成功者也是格局不佳，关键在于**找到自己的优势领域，专精突破**。'
    );
  } else if (patternStrength === 'strong' && patternPurity === 'pure') {
    // 格局优秀 → 禀赋因素正常，但强调"天赋需配合行动"
    endowmentFactor -= 5;
    strategyFactor += 5;

    controllabilityLabels.push({
      factor: '禀赋',
      controllable: false,
      label: '不可控（但条件优越）',
    });

    notes.push(
      `禀赋因素（${endowmentFactor}%）：您的格局清纯有力，先天条件优越。` +
        '但需注意：**天赋只是起点，行动才能变现价值**。避免因条件好而懈怠。'
    );
  } else {
    // 格局中等 → 正常分配
    controllabilityLabels.push({
      factor: '禀赋',
      controllable: false,
      label: '不可控（中等水平）',
    });

    notes.push(
      `禀赋因素（${endowmentFactor}%）：格局属中等水平，既非顶尖也非最差。` +
        '这意味着**成败更多取决于后天努力与选择，您有充分的可塑空间**。'
    );
  }

  // ===== 3. 环境因素 =====
  controllabilityLabels.push({
    factor: '环境',
    controllable: true,
    label: '部分可控（风水、人脉、地域等）',
  });

  notes.push(
    `环境因素（${environmentFactor}%）：包括家居风水、工作环境、人脉圈层、所在城市等。` +
      '这是**最容易优化的可控因素**，建议参考本报告的风水布局与行动清单。' +
      '预期可带来10-20%的改善。'
  );

  // ===== 4. 策略因素 =====
  controllabilityLabels.push({
    factor: '策略',
    controllable: true,
    label: '完全可控（个人选择）',
  });

  notes.push(
    `策略因素（${strategyFactor}%）：包括职业选择、社交策略、时间管理、学习方向等。` +
      '这是**您完全可掌控的领域**，也是短期内见效最快的突破口。' +
      '本报告提供的分级行动清单将帮助您优化策略，预期可带来15-30%的提升。'
  );

  // ===== 5. 确保总和=100% =====
  const total =
    timeFactor + endowmentFactor + environmentFactor + strategyFactor;
  if (total !== 100) {
    // 微调策略因素以保证总和=100%
    strategyFactor += 100 - total;
  }

  // ===== 6. 添加核心话术 =====
  notes.unshift(
    '**核心洞见：这不是你不行，而是时机不利。** ' +
      `当前困境/挑战中，有${timeFactor + endowmentFactor}%来自不可控因素（时间+禀赋），` +
      `而${environmentFactor + strategyFactor}%是可优化的（环境+策略）。` +
      '调整可控部分，等待时机转换，您的局面将会改善。'
  );

  return {
    timeFactor,
    endowmentFactor,
    environmentFactor,
    strategyFactor,
    notes,
  };
}

// ===== 辅助函数 =====

/**
 * 获取当前所处的大运
 */
function getCurrentLuckPillar(
  luckPillars: any[],
  currentAge: number
): any | null {
  if (!luckPillars || luckPillars.length === 0) return null;

  for (const pillar of luckPillars) {
    const startAge = pillar.startAge || pillar.age || 0;
    const endAge = startAge + 10; // 假设每个大运10年

    if (currentAge >= startAge && currentAge < endAge) {
      return pillar;
    }
  }

  return null;
}

/**
 * 检查当前大运是否有利用神
 */
function checkUsefulGodInLuckPillar(luckPillar: any, usefulGod: any): boolean {
  if (!luckPillar || !usefulGod) return false;

  // 简化逻辑：检查大运天干/地支是否包含用神五行
  const usefulElement = usefulGod.element || usefulGod; // 用神的五行
  const pillarHeavenlyStem =
    luckPillar.heavenlyStem?.element || luckPillar.stem?.element;
  const pillarEarthlyBranch =
    luckPillar.earthlyBranch?.element || luckPillar.branch?.element;

  // 如果大运天干或地支包含用神五行，则认为有利
  return (
    pillarHeavenlyStem === usefulElement ||
    pillarEarthlyBranch === usefulElement
  );
}

/**
 * 获取下一个有利用神的大运
 */
function getNextFavorableLuckPillar(
  luckPillars: any[],
  currentAge: number,
  usefulGod: any
): any | null {
  if (!luckPillars || luckPillars.length === 0 || !usefulGod) return null;

  const usefulElement = usefulGod.element || usefulGod;

  for (const pillar of luckPillars) {
    const startAge = pillar.startAge || pillar.age || 0;

    if (startAge > currentAge) {
      const pillarHeavenlyStem =
        pillar.heavenlyStem?.element || pillar.stem?.element;
      const pillarEarthlyBranch =
        pillar.earthlyBranch?.element || pillar.branch?.element;

      if (
        pillarHeavenlyStem === usefulElement ||
        pillarEarthlyBranch === usefulElement
      ) {
        return pillar;
      }
    }
  }

  return null;
}

function generateRiskWarnings(destructionFactors: any, luckPillars: any[]) {
  // TODO: 根据破格因素、不利大运提示风险

  return ['未来3年忌神当令，需谨慎投资', '健康方面注意消化系统（土弱）'];
}

// ============ 飞星 → Checklist映射 ============

export const mapFengshuiToChecklist: FengshuiToChecklistMapper = (
  lingzhengAnalysis,
  recommendations,
  reversedCheck,
  timeChange
) => {
  // TODO: 实际实现需根据 lingzhengAnalysis 结构调整

  const { zeroGodPalaces, positiveGodPalaces } = lingzhengAnalysis;

  // 1. 水位布置
  const waterPlacement = {
    favorablePalaces: zeroGodPalaces || [1, 4],
    unfavorablePalaces: positiveGodPalaces || [6, 8],
    actions: generateWaterActions(zeroGodPalaces, positiveGodPalaces),
  };

  // 2. 山位布置
  const mountainPlacement = {
    favorablePalaces: positiveGodPalaces || [6, 8],
    unfavorablePalaces: zeroGodPalaces || [1, 4],
    actions: generateMountainActions(positiveGodPalaces, zeroGodPalaces),
  };

  // 3. 综合任务清单
  const environmentChecklist = [
    ...waterPlacement.actions,
    ...mountainPlacement.actions,
  ];

  // 4. 运转变更建议
  const timeChangeAdvice = {
    transitionAdvice: timeChange?.advice || ['2024年进入9运，需调整布局'],
    riskLevel: timeChange?.riskLevel || ('medium' as const),
    riskDescription: timeChange?.description || '运转交替期，需尽快适配',
  };

  // 5. 零正审计
  const zeroPositiveAudit = {
    isReversed: reversedCheck?.isReversed || false,
    issues: reversedCheck?.issues || [],
    severity: reversedCheck?.severity || ('none' as const),
  };

  return {
    waterPlacement,
    mountainPlacement,
    environmentChecklist,
    timeChangeAdvice,
    zeroPositiveAudit,
  };
};

// ---- 辅助函数 ----

function generateWaterActions(
  favorablePalaces: number[],
  unfavorablePalaces: number[]
): EnvironmentalTask[] {
  // 集成物品库：使用fengshui-items-templates.ts
  const {
    getItemsByPalaceAndType,
    getPalaceLocation,
    filterItemsByCost,
  } = require('@/lib/qiflow/fengshui-items-templates');

  const tasks: EnvironmentalTask[] = [];

  favorablePalaces.forEach((palace, index) => {
    // 获取该宫位的推荐水位物品（优先级：essential > recommended > optional）
    let items = getItemsByPalaceAndType(palace, 'water', 'essential');
    if (items.length === 0) {
      items = getItemsByPalaceAndType(palace, 'water', 'recommended');
    }
    if (items.length === 0) {
      items = getItemsByPalaceAndType(palace, 'water', 'optional');
    }

    // 如果没有匹配的物品，使用通用水位物品
    if (items.length === 0) {
      items = require('@/lib/qiflow/fengshui-items-templates').WATER_ITEMS.slice(
        0,
        1
      );
    }

    // 取第一个物品作为主要建议
    const item = items[0];
    const location = getPalaceLocation(palace);

    // 计算截止日期（根据优先级）
    const dueDate = new Date();
    if (item.priority === 'essential') {
      dueDate.setMonth(dueDate.getMonth() + 1); // 1个月内完成
    } else if (item.priority === 'recommended') {
      dueDate.setMonth(dueDate.getMonth() + 2); // 2个月内完成
    } else {
      dueDate.setMonth(dueDate.getMonth() + 3); // 3个月内完成
    }

    const dueBy = dueDate.toISOString().split('T')[0]; // YYYY-MM-DD

    // 映射优先级到severity
    const severityMap: Record<string, 'high' | 'medium' | 'low'> = {
      essential: 'high',
      recommended: 'medium',
      optional: 'low',
    };

    tasks.push({
      id: `water-${palace}`,
      palace: palace as any,
      bagua: location.bagua,
      task: `在${palace}宫（${location.bagua}位，${location.typical}）摆放${item.name}。${item.description}`,
      rationale: `该宫位为零神，见水旺财。${item.placement}`,
      severity: severityMap[item.priority] || 'medium',
      expectedImpact: item.expectedImpact,
      dueBy,
      recurrence: 'quarterly' as const,
    });
  });

  return tasks;
}

function generateMountainActions(
  favorablePalaces: number[],
  unfavorablePalaces: number[]
): EnvironmentalTask[] {
  // 集成物品库：使用fengshui-items-templates.ts
  const {
    getItemsByPalaceAndType,
    getPalaceLocation,
    filterItemsByCost,
  } = require('@/lib/qiflow/fengshui-items-templates');

  const tasks: EnvironmentalTask[] = [];

  favorablePalaces.forEach((palace, index) => {
    // 获取该宫位的推荐山位物品（优先级：essential > recommended > optional）
    let items = getItemsByPalaceAndType(palace, 'mountain', 'essential');
    if (items.length === 0) {
      items = getItemsByPalaceAndType(palace, 'mountain', 'recommended');
    }
    if (items.length === 0) {
      items = getItemsByPalaceAndType(palace, 'mountain', 'optional');
    }

    // 如果没有匹配的物品，使用通用山位物品
    if (items.length === 0) {
      items = require('@/lib/qiflow/fengshui-items-templates').MOUNTAIN_ITEMS.slice(
        0,
        1
      );
    }

    // 取第一个物品作为主要建议
    const item = items[0];
    const location = getPalaceLocation(palace);

    // 计算截止日期（根据优先级）
    const dueDate = new Date();
    if (item.priority === 'essential') {
      dueDate.setMonth(dueDate.getMonth() + 1); // 1个月内完成
    } else if (item.priority === 'recommended') {
      dueDate.setMonth(dueDate.getMonth() + 2); // 2个月内完成
    } else {
      dueDate.setMonth(dueDate.getMonth() + 3); // 3个月内完成
    }

    const dueBy = dueDate.toISOString().split('T')[0]; // YYYY-MM-DD

    // 映射优先级到severity
    const severityMap: Record<string, 'high' | 'medium' | 'low'> = {
      essential: 'high',
      recommended: 'medium',
      optional: 'low',
    };

    tasks.push({
      id: `mountain-${palace}`,
      palace: palace as any,
      bagua: location.bagua,
      task: `在${palace}宫（${location.bagua}位，${location.typical}）摆放${item.name}。${item.description}`,
      rationale: `该宫位为正神，宜见山。${item.placement}`,
      severity: severityMap[item.priority] || 'medium',
      expectedImpact: item.expectedImpact,
      dueBy,
      recurrence: item.maintenance.includes('季度') ? ('quarterly' as const) : undefined,
    });
  });

  return tasks;
}

// ============ 希望之光生成 ============

/**
 * 生成希望之光时间线
 *
 * 功能：
 * - 短期（6-12月）：小的改善，给用户即时反馈
 * - 中期（1-3年）：关键转折点，明确时间+量化改善
 * - 长期（3-10年）：人生高峰，给予远期希望
 * - 3个“为什么会好”的命理依据
 *
 * 核心话术：“还有XX个月，就会好起来”
 *
 * @param luckPillars - 大运数组
 * @param currentAge - 当前年龄
 * @param patternAnalysis - 格局分析结果
 * @returns 希望时间线
 */
export function generateHopeTimeline(
  luckPillars: any[],
  currentAge: number,
  patternAnalysis: any
): HopeTimeline {
  const {
    patternStrength = 'medium',
    patternPurity = 'mixed',
    usefulGod,
    pattern,
  } = patternAnalysis || {};

  const currentYear = new Date().getFullYear();
  const currentLuckPillar = getCurrentLuckPillar(luckPillars, currentAge);
  const isCurrentFavorable = checkUsefulGodInLuckPillar(
    currentLuckPillar,
    usefulGod
  );
  const nextFavorablePillar = getNextFavorableLuckPillar(
    luckPillars,
    currentAge,
    usefulGod
  );

  // ===== 1. 短期（6-12月） =====
  const shortTerm = generateShortTermHope(
    currentYear,
    currentAge,
    isCurrentFavorable,
    patternStrength
  );

  // ===== 2. 中期（1-3年） =====
  const midTerm = generateMidTermHope(
    currentYear,
    currentAge,
    nextFavorablePillar,
    patternStrength,
    isCurrentFavorable
  );

  // ===== 3. 长期（3-10年） =====
  const longTerm = generateLongTermHope(
    currentYear,
    currentAge,
    luckPillars,
    patternStrength,
    pattern
  );

  // ===== 4. 为什么会好（3个理由） =====
  const whyYouWillImprove = generateWhyYouWillImprove(
    nextFavorablePillar,
    currentAge,
    patternStrength,
    patternPurity,
    pattern,
    isCurrentFavorable
  );

  return {
    shortTerm,
    midTerm,
    longTerm,
    whyYouWillImprove,
  };
}

// ===== 辅助函数 =====

/**
 * 生成短期希望（6-12月）
 * 特点：小的改善，给用户即时反馈和信心
 */
function generateShortTermHope(
  currentYear: number,
  currentAge: number,
  isCurrentFavorable: boolean,
  patternStrength: string
): HopeTimeline['shortTerm'] {
  const changes: string[] = [];

  if (isCurrentFavorable) {
    // 当前大运有利 → 短期就会有改善
    changes.push(
      `${currentYear}年春夏季：人际关系改善，贵人出现概猇65%`,
      `${currentYear}年下半年：工作/项目进展顺利，收入提升10-15%`
    );
  } else {
    // 当前大运不利 → 短期改善有限，但要给希望
    changes.push(
      `${currentYear}年下半年：小的积极信号出现，如贵人提点、新机会浮现`,
      `${currentYear + 1}年上半年：状态调整后，精力/效率提升10%左右`
    );
  }

  // 添加可控部分的改善
  if (patternStrength === 'weak') {
    changes.push('调整风水和行动策略后，6个月内状态可改善5-10%');
  }

  return {
    timeframe: '6-12个月',
    changes,
  };
}

/**
 * 生成中期希望（1-3年）
 * 特点：关键转折点，明确时间+量化改善
 */
function generateMidTermHope(
  currentYear: number,
  currentAge: number,
  nextFavorablePillar: any | null,
  patternStrength: string,
  isCurrentFavorable: boolean
): HopeTimeline['midTerm'] {
  const changes: string[] = [];
  let turningPoint: string | undefined;

  if (nextFavorablePillar) {
    // 找到了下一个有利大运
    const turningAge = nextFavorablePillar.startAge || nextFavorablePillar.age;
    const yearsUntilTurning = turningAge - currentAge;
    const turningYear = currentYear + yearsUntilTurning;

    // 转折点时间
    turningPoint = `${turningYear}年春季（大运切换，约${turningAge}岁）`;

    // 根据格局强度量化改善幅度
    let improvementRange = '20-30%';
    if (patternStrength === 'strong') {
      improvementRange = '30-50%';
    } else if (patternStrength === 'weak') {
      improvementRange = '15-25%';
    }

    changes.push(
      `${turningYear}年春夏季：**运势转折点**，职业升迁/创业机会出现`,
      `${turningYear}-${turningYear + 2}年：收入提升${improvementRange}，事业进入上升通道`
    );

    // 强调时间感
    if (yearsUntilTurning <= 2) {
      changes.push(`**还有${yearsUntilTurning}年，您的局面就会明显好转。**`);
    }
  } else if (isCurrentFavorable) {
    // 当前已经在好运中，没有下一个转折点
    turningPoint = undefined;
    changes.push(
      `${currentYear + 1}-${currentYear + 3}年：当前好运持续，事业稳步上升`,
      `${currentYear + 2}年：收入提升20-35%，社会地位提高`
    );
  } else {
    // 当前不利且找不到下一个有利大运 → 强调“策略+环境”可改善
    turningPoint = undefined;
    changes.push(
      `${currentYear + 1}-${currentYear + 3}年：虽无明显天时，但通过策略优化，可改喆15-25%`,
      `${currentYear + 2}年：积累期，为未来爆发做准备`
    );
  }

  return {
    timeframe: '1-3年',
    changes,
    turningPoint,
  };
}

/**
 * 生成长期希望（3-10年）
 * 特点：人生高峰，给予远期希望
 */
function generateLongTermHope(
  currentYear: number,
  currentAge: number,
  luckPillars: any[],
  patternStrength: string,
  pattern: any
): HopeTimeline['longTerm'] {
  const changes: string[] = [];

  // 查找未来5-10年内的有利大运
  const futureFavorablePillars = luckPillars.filter((pillar: any) => {
    const startAge = pillar.startAge || pillar.age || 0;
    return startAge > currentAge && startAge <= currentAge + 10;
  });

  if (futureFavorablePillars.length >= 2) {
    // 有多个有利大运 → 高峰期
    const peakStartYear = currentYear + 5;
    const peakEndYear = currentYear + 10;

    changes.push(
      `${peakStartYear}-${peakEndYear}年：**人生高峰期**，连续好运，事业达到顶峰`,
      `${peakStartYear + 2}年左右：财富积累突破，有机会实现财务自由或行业地位`
    );
  } else if (futureFavorablePillars.length === 1) {
    // 有一个有利大运
    const peakYear = currentYear + 6;
    changes.push(
      `${peakYear}年左右：事业高峰期，收入45-60%以上`,
      `${peakYear + 2}-${peakYear + 5}年：进入稳定期，享受前期积累的成果`
    );
  } else {
    // 没有明显有利大运 → 强调“积累型”
    const peakYear = currentYear + 7;
    changes.push(
      `${peakYear}年左右：积累到一定程度，质变引发量变，迎来突破`,
      `${currentYear + 8}-${currentYear + 10}年：进入成熟期，事业达到相对稳定的高度`
    );
  }

  // 根据格局类型添加特定话术
  if (pattern?.type === 'follow') {
    changes.push('您的格局属于顺势型，长期看利用大环境，有机会成为行业领导者');
  } else if (patternStrength === 'strong') {
    changes.push('格局强劲，长期成就可期，有机会成为所在领域的佼佼者');
  }

  return {
    timeframe: '3-10年',
    changes,
  };
}

/**
 * 生成“为什么会好”的3个理由
 * 特点：命理依据，增强可信度
 */
function generateWhyYouWillImprove(
  nextFavorablePillar: any | null,
  currentAge: number,
  patternStrength: string,
  patternPurity: string,
  pattern: any,
  isCurrentFavorable: boolean
): string[] {
  const reasons: string[] = [];

  // 理由1：大运角度
  if (nextFavorablePillar) {
    const turningAge = nextFavorablePillar.startAge || nextFavorablePillar.age;
    const yearsUntilTurning = turningAge - currentAge;

    if (yearsUntilTurning <= 3) {
      reasons.push(
        `**大运即将切换**：还有${yearsUntilTurning}年（${turningAge}岁时），` +
          '用神得力，天时转向有利，是命理学上的自然周期。'
      );
    } else {
      reasons.push(
        `**大运周期规律**：${turningAge}岁后进入新大运，` +
          '用神得力，是命理上的转折点。'
      );
    }
  } else if (isCurrentFavorable) {
    reasons.push(
      '**当前大运有利**：您正处于用神得力的大运期，' +
        '天时支持，只要策略得当，就会持续改善。'
    );
  } else {
    reasons.push(
      '**时间是您的盟友**：即使当前大运不利，' +
        '但随着时间推移，总会迎来有利期。历史规律如此。'
    );
  }

  // 理由2：格局角度
  if (patternStrength === 'strong' && patternPurity === 'pure') {
    reasons.push(
      '**格局先天优势**：您的格局清纯有力，' +
        '属于人群15%的优质格局，一旦天时到来，爆发力强。'
    );
  } else if (pattern?.type === 'follow') {
    reasons.push(
      '**从格特殊优势**：您是从格，属于顺势型格局，' +
        '历史上许多从格者都是中晚年大器晚成。'
    );
  } else if (patternStrength === 'weak') {
    reasons.push(
      '**后天可塑性强**：格局虽弱，但可塑空间大，' +
        '通过策略优化和环境调整，改善空间大，反而更灵活。'
    );
  } else {
    reasons.push(
      '**格局均衡有潜力**：您的格局属中等水平，' +
        '这意味着后天努力和机遇把握同等重要，有很大上升空间。'
    );
  }

  // 理由3：积累角度
  if (currentAge < 35) {
    reasons.push(
      '**年轻是最大资本**：您还年轻，当前的积累和磨练，' +
        '都会在未来3-5年转化为经验优势，届时爆发力更强。'
    );
  } else if (currentAge >= 35 && currentAge < 50) {
    reasons.push(
      '**中年经验优势**：您已积累了丰富的经验和资源，' +
        '一旦天时转好，这些积累将迅速转化为成果，进入收获期。'
    );
  } else {
    reasons.push(
      '**成熟智慧优势**：您的人生阅历和智慧是年轻人无法比拟的，' +
        '这些优势会帮助您在未来的机会中更稳健地把握。'
    );
  }

  return reasons;
}

// ============ 决策对比生成 ============

export function generateDecisionComparison(
  options: Array<{ name: string; description?: string }>,
  patternAnalysis: any,
  luckPillars: any[],
  currentAge: number
): DecisionComparison {
  // TODO: 根据用户提供的决策选项，结合八字分析生成对比

  const decisionOptions: DecisionOption[] = options.map((opt, index) => {
    const id = String.fromCharCode(65 + index); // A, B, C, ...

    return {
      id,
      name: `方案${id}：${opt.name}`,
      matchScore: 75 + index * 5, // 占位
      shortTermRisk: '短期压力较大',
      longTermBenefit: '长期发展空间广阔',
      bestTiming: '2027年春季',
      rationale: '该方案与您的用神匹配度较高',
    };
  });

  return {
    topic: '事业路径选择',
    options: decisionOptions,
    recommendation: '方案A ≈ 方案C > 方案B',
    recommendationRationale: '方案A与C的命理匹配度相近，方案B短期风险较高',
    nonOptimalRemedies: {
      option: '方案B',
      remedies: [
        '选择2027年春季启动，避开忌神期',
        '增加贵人助力（多参与行业活动）',
        '调整家居风水，增强财位',
      ],
      keyTiming: '2027年2-4月',
    },
  };
}

// ============ 完整报告组装 ============

export async function generateFullReport_v2_2(
  baziInput: any, // 八字输入（日期、时间、性别等）
  fengshuiInput: any, // 风水输入（房屋朝向、出生年份等）
  userContext?: any // 用户额外信息（职业、决策选项等）
): Promise<ReportOutput_v2_2> {
  // 1. 调用现有分析函数
  // const patternAnalysis = analyzePattern(baziInput);
  // const luckPillars = calculateLuckPillars(baziInput);
  // const lingzhengAnalysis = analyzeLingzheng(fengshuiInput);
  // const recommendations = generateLingzhengRecommendations(lingzhengAnalysis);
  // const reversedCheck = checkZeroPositiveReversed(lingzhengAnalysis);

  // 占位数据
  const patternAnalysis: any = {};
  const luckPillars: any[] = [];
  const lingzhengAnalysis: any = {};
  const recommendations: any = {};
  const reversedCheck: any = {};
  const currentAge = 30;

  // 2. 映射到新结构
  const strategyMapping = mapBaziToStrategy(
    patternAnalysis,
    luckPillars,
    currentAge,
    userContext
  );
  const fengshuiChecklist = mapFengshuiToChecklist(
    lingzhengAnalysis,
    recommendations,
    reversedCheck
  );
  const hopeTimeline = generateHopeTimeline(
    luckPillars,
    currentAge,
    patternAnalysis
  );

  // 3. 生成决策对比（如果用户提供了选项）
  const decisionComparison = userContext?.decisionOptions
    ? generateDecisionComparison(
        userContext.decisionOptions,
        patternAnalysis,
        luckPillars,
        currentAge
      )
    : undefined;

  // 4. 组装完整报告
  const report: ReportOutput_v2_2 = {
    meta: {
      name: baziInput.name || '用户',
      genderTitle: baziInput.gender === 'male' ? '先生' : '女士',
      reportDate: new Date().toISOString().split('T')[0],
      birthInfo: {
        date: baziInput.date,
        time: baziInput.time,
        city: baziInput.city,
        gender: baziInput.gender,
      },
      analysisHours: 48,
      chartsCount: 12,
      supportPlan: '180天跟踪服务',
    },

    summary: {
      lifeThemeTitle: strategyMapping.lifeTheme.title,
      keywords: ['稳健', '晚发', '专业'] as [string, string, string],
      milestones: [
        { event: '职业转型', time: '2027年春季' },
        { event: '收入突破', time: '2028年' },
      ],
      thisWeekActions: [
        '每日6-7点晨跑（补木火）',
        '调整书桌位置到东南',
        '参加1次行业活动',
      ] as [string, string, string],
    },

    baziAnalysis: {
      primaryPattern: '食神生财',
      patternType: 'standard',
      patternStrength: 'medium',
      patternPurity: 'pure',
      patternConfidence: 85,
      formationList: ['食神透干', '财星得气'],
      destructionList: ['官杀混杂'],
      usefulGod: {
        primary: ['食神', '正财'],
        secondary: ['偏财'],
        avoidance: ['正官', '偏官'],
        explanation: '以食神生财为用，忌官杀克身',
      },
    },

    strategyMapping,
    decisionComparison,
    fengshuiChecklist,
    hopeTimeline,

    sixDomains: {
      talent: '您的核心优势是...',
      careerFinance: '事业财运分析...',
      relationship: '人际感情分析...',
      health: '健康建议...',
      family: '家庭关系...',
      network: '社交网络...',
    },

    comparison: {
      populationPercentile: '前15%',
      patternRarity: '中等偏上',
      similarCases: ['案例1：某企业高管', '案例2：某创业者'],
      timeMisalignmentNote: '您的当前困境主要源于时机不利（40%），而非能力不足',
    },

    appendix: {
      glossary: '【用神】八字中对命主有利的五行...',
      faq: 'Q: 如何执行行动清单？\nA: 从必做项开始...',
      supportContact: '客服微信：qiflow_support',
    },
  };

  return report;
}
