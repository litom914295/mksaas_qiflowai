/**
 * 人宅合一AI分析 - 核心差异化功能
 *
 * 功能：将用户的八字命理与住宅风水进行深度综合分析
 * 核心价值：发现"超级吉位"、识别"风险区域"、给出"可执行布局建议"
 *
 * 成本目标：每次分析 < $0.30
 */

import {
  addComplianceConstraints,
  checkAICompliance,
} from '@/lib/ai-compliance';
import type { EnhancedBaziResult } from '@/lib/bazi/adapter';
import { resolveModel } from '@/server/ai/providers';
import { generateText } from 'ai';

/**
 * 风水数据接口
 */
export interface FengshuiData {
  // 基本坐向
  mountain: string;
  facing: string;
  period: number;

  // 飞星盘数据
  flyingStars?: {
    palace: number;
    mountainStar: number;
    facingStar: number;
    periodStar: number;
    meaning?: string;
  }[];

  // 特殊方位
  specialPositions?: {
    wealthPosition?: string;
    academicPosition?: string;
    healthPosition?: string;
  };
}

/**
 * 人宅合一分析输入
 */
export interface SynthesisInput {
  // 八字数据
  baziData: EnhancedBaziResult;

  // 风水数据
  fengshuiData: FengshuiData;

  // 分析配置
  config?: {
    year?: number; // 分析年份，默认当前年
    includeChengmen?: boolean; // 是否包含城门诀
    language?: 'zh-CN' | 'en';
  };
}

/**
 * 人宅合一分析输出
 */
export interface SynthesisOutput {
  // 超级吉位发现
  superLuckySpots: LuckySpot[];

  // 风险区域警报
  riskZones: RiskZone[];

  // 核心布局建议
  layoutAdvice: LayoutAdvice[];

  // 分析摘要
  summary: string;

  // 元数据
  metadata: {
    generatedAt: Date;
    estimatedCost: number;
    qualityScore: number; // 0-100
  };
}

/**
 * 超级吉位
 */
interface LuckySpot {
  // 位置
  location: string; // 例如："客厅正东"
  palace: number; // 九宫格宫位

  // 能量分析
  energyAnalysis: {
    baziElement: string; // 八字喜用神
    fengshuiStar: number; // 飞星吉星
    resonanceType: string; // 共振类型：如"相生"、"同属性"
    resonanceStrength: number; // 1-10
  };

  // 具体利用建议
  utilizationAdvice: string[];

  // 预期效果
  expectedEffects: {
    aspects: string[]; // 影响方面：如"事业"、"财运"
    timeline: string; // 时间周期：如"30-60日内"
  };
}

/**
 * 风险区域
 */
interface RiskZone {
  // 位置
  location: string;
  palace: number;

  // 冲突分析
  conflictAnalysis: {
    baziTaboo: string; // 八字忌神
    fengshuiNegativity: string; // 风水凶星
    conflictType: string; // 冲突类型
    severity: 'low' | 'medium' | 'high'; // 严重程度
  };

  // 可能影响
  potentialImpacts: {
    aspects: string[];
    timeframe: string; // 如"2月-3月最需注意"
  };

  // 化解方案（优先级排序）
  resolutionMethods: ResolutionMethod[];
}

/**
 * 化解方案
 */
interface ResolutionMethod {
  priority: number; // 1最高
  difficulty: '⭐' | '⭐⭐' | '⭐⭐⭐'; // 难度
  method: string; // 方法名称
  steps: string[]; // 具体步骤
  principle: string; // 五行原理
  estimatedCost?: string; // 预估成本
}

/**
 * 布局建议
 */
interface LayoutAdvice {
  id: number;
  title: string; // 如"催旺财运布局"
  priority: number; // 执行优先级
  difficulty: '⭐' | '⭐⭐' | '⭐⭐⭐';

  // 执行区域
  targetArea: {
    location: string;
    reason: string; // 为什么选这个区域
  };

  // 具体行动
  actions: string[];

  // 原理说明
  principle: string;

  // 预期效果
  expectedResults: {
    effects: string[];
    timeline: string;
  };

  // 投入成本
  investment: {
    cost: string;
    timeRequired: string;
  };
}

/**
 * 生成人宅合一AI分析（主入口）
 */
export async function generateSynthesisAnalysis(
  input: SynthesisInput
): Promise<SynthesisOutput> {
  const startTime = Date.now();
  let totalCost = 0;

  console.log('[Synthesis] 开始人宅合一AI分析...');

  // 1. 提取核心数据
  const coreData = extractCoreData(input);

  // 2. 发现超级吉位（并行）
  const luckySpots = await findSuperLuckySpots(coreData);
  totalCost += luckySpots.cost;

  // 3. 识别风险区域（并行）
  const riskZones = await detectRiskZones(coreData);
  totalCost += riskZones.cost;

  // 4. 生成布局建议（基于前两步结果）
  const layoutAdvice = await generateLayoutAdvice({
    ...coreData,
    luckySpots: luckySpots.data,
    riskZones: riskZones.data,
  });
  totalCost += layoutAdvice.cost;

  // 5. 生成分析摘要
  const summary = generateSummary(
    luckySpots.data,
    riskZones.data,
    layoutAdvice.data
  );

  // 6. 质量评分
  const qualityScore = calculateQualityScore(
    luckySpots.data,
    riskZones.data,
    layoutAdvice.data
  );

  const timeTaken = Date.now() - startTime;
  console.log(
    `[Synthesis] 分析完成，耗时: ${timeTaken}ms, 成本: $${totalCost.toFixed(4)}, 质量分: ${qualityScore}`
  );

  return {
    superLuckySpots: luckySpots.data,
    riskZones: riskZones.data,
    layoutAdvice: layoutAdvice.data,
    summary,
    metadata: {
      generatedAt: new Date(),
      estimatedCost: totalCost,
      qualityScore,
    },
  };
}

/**
 * 提取核心数据
 */
interface CoreData {
  // 八字相关
  dayMaster: string;
  favorableElements: string[]; // 喜用神
  tabooElements: string[]; // 忌神
  elementsDistribution: Record<string, number>;

  // 风水相关
  mountain: string;
  facing: string;
  period: number;
  flyingStarsPalaces: Map<
    number,
    {
      mountainStar: number;
      facingStar: number;
      periodStar: number;
    }
  >;

  // 年份
  targetYear: number;
}

function extractCoreData(input: SynthesisInput): CoreData {
  const { baziData, fengshuiData, config } = input;

  // 提取喜用神和忌神
  const favorableElements = extractFavorableElements(baziData);
  const tabooElements = extractTabooElements(baziData);

  // 构建飞星宫位映射
  const flyingStarsPalaces = new Map<number, any>();
  if (fengshuiData.flyingStars) {
    fengshuiData.flyingStars.forEach((star) => {
      flyingStarsPalaces.set(star.palace, {
        mountainStar: star.mountainStar,
        facingStar: star.facingStar,
        periodStar: star.periodStar,
      });
    });
  }

  return {
    dayMaster: baziData.pillars?.day?.stem || '未知',
    favorableElements,
    tabooElements,
    elementsDistribution: baziData.elements || {},
    mountain: fengshuiData.mountain,
    facing: fengshuiData.facing,
    period: fengshuiData.period,
    flyingStarsPalaces,
    targetYear: config?.year || new Date().getFullYear(),
  };
}

/**
 * 提取喜用神（五行）
 */
function extractFavorableElements(baziData: EnhancedBaziResult): string[] {
  const favorable: string[] = [];

  // 从用神系统提取
  if (baziData.yongshen?.primary) {
    const p: any = baziData.yongshen.primary as any;
    Array.isArray(p) ? favorable.push(...p) : favorable.push(p);
  }
  if (baziData.yongshen?.secondary) {
    const s: any = baziData.yongshen.secondary as any;
    Array.isArray(s) ? favorable.push(...s) : favorable.push(s);
  }

  // 如果没有用神数据，根据日主强弱推断
  if (favorable.length === 0) {
    const dayElement = (baziData.dayMaster as any)?.element || '';
    const strength = (baziData.dayMaster as any)?.strength || 'medium';

    if (strength === 'strong') {
      // 日主强，需要泄和耗
      favorable.push(...getExhaustingElements(dayElement));
    } else if (strength === 'weak') {
      // 日主弱，需要生和帮
      favorable.push(...getSupportingElements(dayElement));
    }
  }

  return [...new Set(favorable)]; // 去重
}

/**
 * 提取忌神（五行）
 */
function extractTabooElements(baziData: EnhancedBaziResult): string[] {
  const taboo: string[] = [];

  // 从用神系统提取
  if (baziData.yongshen?.avoid) {
    taboo.push(...baziData.yongshen.avoid);
  }

  // 如果没有忌神数据，根据日主强弱推断
  if (taboo.length === 0) {
    const dayElement = (baziData.dayMaster as any)?.element || '';
    const strength = (baziData.dayMaster as any)?.strength || 'medium';

    if (strength === 'strong') {
      // 日主强，忌生扶
      taboo.push(...getSupportingElements(dayElement));
    } else if (strength === 'weak') {
      // 日主弱，忌克泄
      taboo.push(...getWeakeningElements(dayElement));
    }
  }

  return [...new Set(taboo)]; // 去重
}

/**
 * 获取泄耗元素
 */
function getExhaustingElements(element: string): string[] {
  const exhausting: Record<string, string[]> = {
    木: ['火', '金'], // 木生火（泄），金克木（耗）
    火: ['土', '水'],
    土: ['金', '木'],
    金: ['水', '火'],
    水: ['木', '土'],
  };
  return exhausting[element] || [];
}

/**
 * 获取生扶元素
 */
function getSupportingElements(element: string): string[] {
  const supporting: Record<string, string[]> = {
    木: ['水', '木'], // 水生木，木帮木
    火: ['木', '火'],
    土: ['火', '土'],
    金: ['土', '金'],
    水: ['金', '水'],
  };
  return supporting[element] || [];
}

/**
 * 获取削弱元素
 */
function getWeakeningElements(element: string): string[] {
  const weakening: Record<string, string[]> = {
    木: ['金', '火'], // 金克木，木生火
    火: ['水', '土'],
    土: ['木', '金'],
    金: ['火', '水'],
    水: ['土', '木'],
  };
  return weakening[element] || [];
}

/**
 * 飞星五行属性映射
 */
const STAR_ELEMENTS: Record<number, string> = {
  1: '水', // 一白贪狼
  2: '土', // 二黑巨门
  3: '木', // 三碧禄存
  4: '木', // 四绿文曲
  5: '土', // 五黄廉贞
  6: '金', // 六白武曲
  7: '金', // 七赤破军
  8: '土', // 八白左辅
  9: '火', // 九紫右弼
};

/**
 * 发现超级吉位
 */
async function findSuperLuckySpots(
  coreData: CoreData
): Promise<{ data: LuckySpot[]; cost: number }> {
  const luckySpots: LuckySpot[] = [];

  // 遍历九宫，寻找喜用神与吉星的交集
  for (const [palace, stars] of coreData.flyingStarsPalaces.entries()) {
    const facingStarElement = STAR_ELEMENTS[stars.facingStar];

    // 判断是否为吉星（当旺星或生气星）
    const isLuckyStar = [8, 9, 1].includes(stars.facingStar);

    // 判断是否与喜用神匹配
    const matchesFavorable =
      coreData.favorableElements.includes(facingStarElement);

    if (isLuckyStar && matchesFavorable) {
      // 发现超级吉位！
      const location = getPalaceLocation(palace);
      const resonanceType = getResonanceType(
        coreData.favorableElements[0],
        facingStarElement
      );

      luckySpots.push({
        location,
        palace,
        energyAnalysis: {
          baziElement: coreData.favorableElements[0],
          fengshuiStar: stars.facingStar,
          resonanceType,
          resonanceStrength: 9, // 高强度共振
        },
        utilizationAdvice: [
          `将重要活动区域（如办公桌、沙发）布置在${location}`,
          '每日在此区域停留至少1小时以上',
          '在此进行重要决策、洽谈、学习等活动',
        ],
        expectedEffects: {
          aspects:
            stars.facingStar === 8
              ? ['财运', '事业']
              : stars.facingStar === 1
                ? ['文昌', '智慧']
                : ['喜庆', '人缘'],
          timeline: '30-60日内可见效果',
        },
      });
    }
  }

  // 如果没有找到完美匹配，降级寻找次优位置
  if (luckySpots.length === 0) {
    luckySpots.push(...findSecondaryLuckySpots(coreData));
  }

  return {
    data: luckySpots.slice(0, 3), // 最多返回3个
    cost: 0, // 这一步主要是算法，无AI成本
  };
}

/**
 * 寻找次优吉位
 */
function findSecondaryLuckySpots(coreData: CoreData): LuckySpot[] {
  const spots: LuckySpot[] = [];

  // 寻找只匹配吉星的位置
  for (const [palace, stars] of coreData.flyingStarsPalaces.entries()) {
    if ([8, 9, 1].includes(stars.facingStar)) {
      spots.push({
        location: getPalaceLocation(palace),
        palace,
        energyAnalysis: {
          baziElement: '通用',
          fengshuiStar: stars.facingStar,
          resonanceType: '吉星催旺',
          resonanceStrength: 6,
        },
        utilizationAdvice: [
          `在${getPalaceLocation(palace)}布置绿植或流动水景`,
          '保持此区域整洁明亮',
        ],
        expectedEffects: {
          aspects: ['整体运势'],
          timeline: '60-90日内',
        },
      });
    }
  }

  return spots.slice(0, 2);
}

/**
 * 识别风险区域
 */
async function detectRiskZones(
  coreData: CoreData
): Promise<{ data: RiskZone[]; cost: number }> {
  const riskZones: RiskZone[] = [];

  // 遍历九宫，寻找忌神与凶星的交集
  for (const [palace, stars] of coreData.flyingStarsPalaces.entries()) {
    const facingStarElement = STAR_ELEMENTS[stars.facingStar];

    // 判断是否为凶星
    const isNegativeStar = [2, 5, 3, 7].includes(stars.facingStar);

    // 判断是否与忌神匹配
    const matchesTaboo = coreData.tabooElements.includes(facingStarElement);

    if (isNegativeStar && matchesTaboo) {
      // 发现风险区域！
      const severity: 'low' | 'medium' | 'high' =
        stars.facingStar === 5
          ? 'high'
          : stars.facingStar === 2
            ? 'high'
            : 'medium';

      riskZones.push({
        location: getPalaceLocation(palace),
        palace,
        conflictAnalysis: {
          baziTaboo: coreData.tabooElements[0],
          fengshuiNegativity: getStarName(stars.facingStar),
          conflictType: '双重负能量叠加',
          severity,
        },
        potentialImpacts: {
          aspects:
            stars.facingStar === 2
              ? ['健康', '疾病']
              : stars.facingStar === 5
                ? ['意外', '灾祸']
                : ['是非', '争执'],
          timeframe: `${coreData.targetYear}年2-8月最需注意`,
        },
        resolutionMethods: generateResolutionMethods(
          palace,
          stars.facingStar,
          facingStarElement
        ),
      });
    }
  }

  return {
    data: riskZones.slice(0, 2), // 最多返回2个
    cost: 0,
  };
}

/**
 * 生成化解方案
 */
function generateResolutionMethods(
  palace: number,
  star: number,
  element: string
): ResolutionMethod[] {
  const methods: ResolutionMethod[] = [];

  // 方法1：五行泄法（优先）
  const exhaustElement = getExhaustingElementForNegative(element);
  methods.push({
    priority: 1,
    difficulty: '⭐',
    method: `五行"泄"法化解`,
    steps: [
      `在${getPalaceLocation(palace)}放置${exhaustElement}属性物品`,
      `例如：${getElementItems(exhaustElement)}`,
      '保持区域通风、整洁',
    ],
    principle: `${element}生${exhaustElement}，通过泄耗削弱凶星力量`,
    estimatedCost: '约50-200元',
  });

  // 方法2：减少停留时间
  methods.push({
    priority: 2,
    difficulty: '⭐',
    method: '减少停留时间',
    steps: [
      `避免在${getPalaceLocation(palace)}长时间停留`,
      '不要在此区域进行重要决策',
      '改至其他吉位活动',
    ],
    principle: '减少负能量接触，降低影响',
  });

  return methods;
}

/**
 * 获取泄化元素
 */
function getExhaustingElementForNegative(element: string): string {
  const exhaust: Record<string, string> = {
    土: '金', // 土生金，泄土
    木: '火',
    火: '土',
    金: '水',
    水: '木',
  };
  return exhaust[element] || '金';
}

/**
 * 获取元素对应物品
 */
function getElementItems(element: string): string {
  const items: Record<string, string> = {
    金: '金属风铃、铜制品、圆形金属摆件',
    木: '绿色植物、木质家具、竹制品',
    水: '鱼缸、流水装置、蓝色饰品',
    火: '红色装饰、灯具、电器',
    土: '陶瓷摆件、黄色饰品、方形物品',
  };
  return items[element] || '相应属性物品';
}

/**
 * 生成布局建议（使用AI）
 */
async function generateLayoutAdvice(
  data: CoreData & { luckySpots: LuckySpot[]; riskZones: RiskZone[] }
): Promise<{ data: LayoutAdvice[]; cost: number }> {
  // 构建AI Prompt
  const prompt = buildLayoutAdvicePrompt(data);

  try {
    const model = resolveModel('deepseek', 'deepseek-chat');

      const result = await generateText({
      model,
      prompt,
      temperature: 0.7,
      maxOutputTokens: 1500,
    });

    // 解析AI返回的JSON
    const parsedAdvice = parseLayoutAdviceFromAI(result.text);

    // 合规检查
    const complianceCheck = checkAICompliance({
      userInput: '布局建议',
      aiOutput: result.text,
    });

    if (!complianceCheck.compliant) {
      console.warn('[Synthesis] AI布局建议不合规，使用降级方案');
      return {
        data: generateFallbackLayoutAdvice(data),
        cost: 0,
      };
    }

    // 成本估算
    const cost = (result.text.length / 2 / 1000) * 0.002;

    return {
      data: parsedAdvice,
      cost,
    };
  } catch (error) {
    console.error('[Synthesis] AI布局建议生成失败:', error);
    return {
      data: generateFallbackLayoutAdvice(data),
      cost: 0,
    };
  }
}

/**
 * 构建AI Prompt
 */
function buildLayoutAdvicePrompt(
  data: CoreData & { luckySpots: LuckySpot[]; riskZones: RiskZone[] }
): string {
  const basePrompt = `你是一位专业的八字风水综合分析师。请基于以下信息，生成3-5条具体可执行的风水布局建议。

【用户八字信息】
- 日主: ${data.dayMaster}
- 喜用神: ${data.favorableElements.join('、')}
- 忌神: ${data.tabooElements.join('、')}

【住宅风水信息】
- 坐向: 坐${data.mountain}朝${data.facing}
- 运势: ${data.period}运

【已发现的超级吉位】
${data.luckySpots.map((spot, i) => `${i + 1}. ${spot.location} - ${spot.energyAnalysis.fengshuiStar}星（${spot.energyAnalysis.baziElement}）`).join('\n')}

【已发现的风险区域】
${data.riskZones.map((zone, i) => `${i + 1}. ${zone.location} - ${zone.conflictAnalysis.fengshuiNegativity}`).join('\n')}

【要求】
1. 生成3-5条布局建议，按优先级排序
2. 每条建议必须包含：标题、目标区域、具体行动步骤、五行原理、预期效果、难度等级
3. 建议必须具体可执行，避免模糊表述
4. 标注每条建议的难度：⭐（简单）、⭐⭐（中等）、⭐⭐⭐（复杂）
5. 语气积极、建设性，避免恐吓性表述

请以JSON格式返回（严格遵守格式）：
\`\`\`json
[
  {
    "title": "催旺财运布局",
    "priority": 1,
    "difficulty": "⭐⭐",
    "targetArea": {
      "location": "客厅正东",
      "reason": "八白财星 + 喜用神水，吉上加吉"
    },
    "actions": [
      "在正东角放置流动水景或鱼缸",
      "鱼缸尺寸约60cm×40cm",
      "养6条金鱼，每周换水一次"
    ],
    "principle": "水生木，木生火，激活财运能量循环",
    "expectedResults": {
      "effects": ["加薪机会增多", "投资收益提升"],
      "timeline": "30-60日内"
    },
    "investment": {
      "cost": "约500-1000元",
      "timeRequired": "2小时"
    }
  }
]
\`\`\``;

  return addComplianceConstraints(basePrompt);
}

/**
 * 解析AI返回的布局建议
 */
function parseLayoutAdviceFromAI(aiOutput: string): LayoutAdvice[] {
  try {
    // 提取JSON部分
    const jsonMatch =
      aiOutput.match(/```json\s*([\s\S]*?)\s*```/) ||
      aiOutput.match(/\[\s*\{[\s\S]*\}\s*\]/);

    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonStr);

      return parsed.map((item: any, index: number) => ({
        id: index + 1,
        title: item.title || '布局建议',
        priority: item.priority || index + 1,
        difficulty: item.difficulty || '⭐⭐',
        targetArea: item.targetArea || { location: '待定', reason: '待定' },
        actions: item.actions || [],
        principle: item.principle || '',
        expectedResults: item.expectedResults || { effects: [], timeline: '' },
        investment: item.investment || {
          cost: '待估算',
          timeRequired: '待估算',
        },
      }));
    }
  } catch (error) {
    console.error('[Synthesis] 解析AI布局建议失败:', error);
  }

  return [];
}

/**
 * 降级方案：模板化布局建议
 */
function generateFallbackLayoutAdvice(
  data: CoreData & { luckySpots: LuckySpot[]; riskZones: RiskZone[] }
): LayoutAdvice[] {
  const advice: LayoutAdvice[] = [];

  // 基于超级吉位生成建议
  if (data.luckySpots.length > 0) {
    const topSpot = data.luckySpots[0];
    advice.push({
      id: 1,
      title: '催旺运势核心布局',
      priority: 1,
      difficulty: '⭐⭐',
      targetArea: {
        location: topSpot.location,
        reason: `${topSpot.energyAnalysis.fengshuiStar}星飞临，与您的喜用神${topSpot.energyAnalysis.baziElement}形成共振`,
      },
      actions: [
        `将主要活动区域移至${topSpot.location}`,
        `在此区域放置${topSpot.energyAnalysis.baziElement}属性物品`,
        '每日在此停留1小时以上',
      ],
      principle: `${topSpot.energyAnalysis.resonanceType}，能量相互增强`,
      expectedResults: {
        effects: topSpot.expectedEffects.aspects,
        timeline: topSpot.expectedEffects.timeline,
      },
      investment: {
        cost: '0-300元',
        timeRequired: '1-2小时',
      },
    });
  }

  // 基于风险区域生成化解建议
  if (data.riskZones.length > 0) {
    const topRisk = data.riskZones[0];
    advice.push({
      id: 2,
      title: '风险区域化解方案',
      priority: 2,
      difficulty: '⭐',
      targetArea: {
        location: topRisk.location,
        reason: `${topRisk.conflictAnalysis.fengshuiNegativity}飞临，需要化解`,
      },
      actions: topRisk.resolutionMethods[0]?.steps || ['减少停留时间'],
      principle: topRisk.resolutionMethods[0]?.principle || '五行化解',
      expectedResults: {
        effects: [
          `降低${topRisk.potentialImpacts.aspects.join('、')}方面的负面影响`,
        ],
        timeline: '立即生效',
      },
      investment: {
        cost: topRisk.resolutionMethods[0]?.estimatedCost || '约100元',
        timeRequired: '1小时',
      },
    });
  }

  return advice;
}

/**
 * 生成分析摘要
 */
function generateSummary(
  luckySpots: LuckySpot[],
  riskZones: RiskZone[],
  layoutAdvice: LayoutAdvice[]
): string {
  let summary = '【人宅合一分析摘要】\n\n';

  if (luckySpots.length > 0) {
    summary += `✨ 发现 ${luckySpots.length} 个超级吉位，其中${luckySpots[0].location}能量最强，建议重点利用。\n\n`;
  }

  if (riskZones.length > 0) {
    summary += `⚠️ 识别 ${riskZones.length} 个风险区域，需要采取化解措施。\n\n`;
  }

  summary += `💡 已为您生成 ${layoutAdvice.length} 条可执行布局建议，请按优先级依次实施。`;

  return summary;
}

/**
 * 计算质量评分
 */
function calculateQualityScore(
  luckySpots: LuckySpot[],
  riskZones: RiskZone[],
  layoutAdvice: LayoutAdvice[]
): number {
  let score = 60; // 基础分

  // 吉位数量加分
  score += luckySpots.length * 10;

  // 风险识别加分
  score += riskZones.length * 5;

  // 布局建议加分
  score += layoutAdvice.length * 5;

  return Math.min(100, score);
}

/**
 * 辅助函数：获取宫位位置名称
 */
function getPalaceLocation(palace: number): string {
  const locations: Record<number, string> = {
    1: '北方',
    2: '西南方',
    3: '东方',
    4: '东南方',
    5: '中宫',
    6: '西北方',
    7: '西方',
    8: '东北方',
    9: '南方',
  };
  return locations[palace] || '未知方位';
}

/**
 * 辅助函数：获取飞星名称
 */
function getStarName(star: number): string {
  const names: Record<number, string> = {
    1: '一白贪狼',
    2: '二黑巨门',
    3: '三碧禄存',
    4: '四绿文曲',
    5: '五黄廉贞',
    6: '六白武曲',
    7: '七赤破军',
    8: '八白左辅',
    9: '九紫右弼',
  };
  return names[star] || `${star}星`;
}

/**
 * 辅助函数：获取共振类型
 */
function getResonanceType(element1: string, element2: string): string {
  if (element1 === element2) return '同属性共振';

  const sheng: Record<string, string> = {
    木: '火',
    火: '土',
    土: '金',
    金: '水',
    水: '木',
  };

  if (sheng[element1] === element2) return '相生共振';
  if (sheng[element2] === element1) return '相生共振';

  return '能量交融';
}

/**
 * 成本估算
 */
export function estimateSynthesisCost(): number {
  // AI布局建议生成: ~$0.20
  // 其他算法计算: $0
  return 0.25; // 安全余量
}
