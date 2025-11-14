/**
 * 免费基础报告生成器
 *
 * 功能范围（5-8页）：
 * 1. 封面页（用户信息）
 * 2. 命理DNA（四柱、五行、性格速写150字）
 * 3. 住宅能量初探（九宫格、年度吉凶速览）
 * 4. Paywall引导页
 *
 * 成本目标：每份 < $0.02
 */

import {
  addComplianceConstraints,
  checkAICompliance,
} from '@/lib/ai-compliance';
import type { EnhancedBaziResult } from '@/lib/bazi/adapter';
import type { WuxingStrength } from '@/lib/bazi/types/core';
import { resolveModel } from '@/server/ai/providers';
import { generateText } from 'ai';

/**
 * 基础报告输入
 */
export interface BasicReportInput {
  // 用户信息
  userName?: string;

  // 八字数据
  baziData: EnhancedBaziResult;

  // 风水数据（可选，如果有住宅信息）
  fengshuiData?: {
    facing: string;
    mountain: string;
    period: number;
    yearlyStars?: Array<{
      palace: number;
      star: number;
      meaning: string;
    }>;
  };

  // 生成配置
  config?: {
    includePersonalitySummary?: boolean; // 是否包含性格速写（需AI）
    language?: 'zh-CN' | 'en';
  };
}

/**
 * 基础报告输出
 */
export interface BasicReportOutput {
  // 报告元数据
  metadata: {
    reportId: string;
    generatedAt: Date;
    reportType: 'basic';
    estimatedCost: number; // USD
  };

  // 报告内容（按页分组）
  pages: {
    cover: CoverPage;
    baziDNA: BaziDNAPage;
    fengshuiPreview?: FengshuiPreviewPage;
    paywall: PaywallPage;
  };
}

/**
 * 封面页
 */
interface CoverPage {
  userName: string;
  generatedDate: string;
  birthInfo: {
    solarDate: string;
    lunarDate?: string;
    birthTime: string;
    location?: string;
    trueSolarTimeAdjusted: boolean;
  };
  housingInfo?: {
    facing: string;
  };
}

/**
 * 命理DNA页
 */
interface BaziDNAPage {
  fourPillars: {
    year: { stem: string; branch: string };
    month: { stem: string; branch: string };
    day: { stem: string; branch: string };
    hour: { stem: string; branch: string };
  };
  dayMaster: {
    stem: string;
    element: string;
    strength: 'strong' | 'medium' | 'weak';
  };
  elements: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  personalitySummary?: string; // AI生成（约150字）
}

/**
 * 风水预览页
 */
interface FengshuiPreviewPage {
  nineGrid: {
    layout: string; // 九宫格ASCII艺术
    facing: string;
    period: number;
  };
  yearlyHighlights: {
    wealthDirection: string;
    negativeDirection: string;
    upgradeHint: string;
  };
}

/**
 * Paywall页
 */
interface PaywallPage {
  blurredChapters: string[];
  essentialFeatures: string[];
  pricing: {
    original: string;
    current: string;
    credits: number;
  };
}

/**
 * 生成免费基础报告
 */
export async function generateBasicReport(
  input: BasicReportInput
): Promise<BasicReportOutput> {
  const startTime = Date.now();
  let estimatedCost = 0;

  // 1. 生成报告ID
  const reportId = generateReportId();

  // 2. 构建封面页
  const coverPage = buildCoverPage(input);

  // 3. 构建命理DNA页
  const baziDNAPage = await buildBaziDNAPage(input);
  estimatedCost += baziDNAPage.cost;

  // 4. 构建风水预览页（如果有风水数据）
  const fengshuiPreviewPage = input.fengshuiData
    ? buildFengshuiPreviewPage(input.fengshuiData)
    : undefined;

  // 5. 构建Paywall页
  const paywallPage = buildPaywallPage();

  console.log(
    `[BasicReport] 生成完成: ${reportId}, 耗时: ${Date.now() - startTime}ms, 成本: $${estimatedCost.toFixed(4)}`
  );

  return {
    metadata: {
      reportId,
      generatedAt: new Date(),
      reportType: 'basic',
      estimatedCost,
    },
    pages: {
      cover: coverPage,
      baziDNA: baziDNAPage.page,
      fengshuiPreview: fengshuiPreviewPage,
      paywall: paywallPage,
    },
  };
}

/**
 * 构建封面页
 */
function buildCoverPage(input: BasicReportInput): CoverPage {
  const { userName = '尊敬的用户', baziData, fengshuiData } = input;

  const birthInfo = baziData.birthInfo || {};

  return {
    userName,
    generatedDate: new Date().toLocaleDateString('zh-CN'),
    birthInfo: {
      solarDate: birthInfo.solarDate || '未提供',
      lunarDate: birthInfo.lunarDate,
      birthTime: birthInfo.birthTime || '未提供',
      location: birthInfo.location,
      trueSolarTimeAdjusted: birthInfo.trueSolarTimeAdjusted || false,
    },
    housingInfo: fengshuiData
      ? {
          facing: `坐${fengshuiData.mountain}朝${fengshuiData.facing}`,
        }
      : undefined,
  };
}

/**
 * 构建命理DNA页（含AI性格速写）
 */
async function buildBaziDNAPage(
  input: BasicReportInput
): Promise<{ page: BaziDNAPage; cost: number }> {
  const { baziData, config } = input;
  let cost = 0;

  // 提取四柱
  const fourPillars = {
    year: {
      stem: baziData.pillars?.year?.stem || '未知',
      branch: baziData.pillars?.year?.branch || '未知',
    },
    month: {
      stem: baziData.pillars?.month?.stem || '未知',
      branch: baziData.pillars?.month?.branch || '未知',
    },
    day: {
      stem: baziData.pillars?.day?.stem || '未知',
      branch: baziData.pillars?.day?.branch || '未知',
    },
    hour: {
      stem: baziData.pillars?.hour?.stem || '未知',
      branch: baziData.pillars?.hour?.branch || '未知',
    },
  };

  // 日主
  const dayMaster = {
    stem: baziData.pillars?.day?.stem || '未知',
    element: baziData.dayMaster?.element || '未知',
    strength:
      (baziData.dayMaster?.strength as 'strong' | 'medium' | 'weak') ||
      'medium',
  };

  // 五行 - 转换为WuxingStrength格式
  const elements: WuxingStrength = {
    wood: (baziData.elements as any)?.['木'] || (baziData.elements as any)?.wood || 0,
    fire: (baziData.elements as any)?.['火'] || (baziData.elements as any)?.fire || 0,
    earth: (baziData.elements as any)?.['土'] || (baziData.elements as any)?.earth || 0,
    metal: (baziData.elements as any)?.['金'] || (baziData.elements as any)?.metal || 0,
    water: (baziData.elements as any)?.['水'] || (baziData.elements as any)?.water || 0,
  };

  // AI性格速写（可选）
  let personalitySummary: string | undefined;
  if (config?.includePersonalitySummary !== false) {
    const result = await generatePersonalitySummary(baziData as any);
    personalitySummary = result.summary;
    cost = result.cost;
  }

  return {
    page: {
      fourPillars,
      dayMaster,
      elements,
      personalitySummary,
    },
    cost,
  };
}

/**
 * AI生成性格速写（约150字）
 */
async function generatePersonalitySummary(
  baziData: EnhancedBaziResult
): Promise<{ summary: string; cost: number }> {
  const dayMaster = baziData.pillars?.day?.stem || '未知';
  const dayElement = baziData.dayMaster?.element || '未知';
  const strength = baziData.dayMaster?.strength || 'medium';

  // 构建精简的Prompt（控制成本）
  const basePrompt = `你是一位专业的八字命理分析师。请基于以下信息，生成一段简洁的性格速写（严格限制在150字以内）。

【命盘信息】
- 日主: ${dayMaster}（${dayElement}）
- 强弱: ${strength}

【要求】
1. 长度: 严格控制在120-150字
2. 语气: 温和、积极、建设性
3. 风格: 通俗易懂，避免术语堆砌
4. 重点: 突出日主特质与性格优势
5. 结尾: 给予正向建议

请直接输出性格速写内容，不要包含标题或额外说明：`;

  const prompt = addComplianceConstraints(basePrompt);

  try {
    const model = resolveModel('deepseek', 'deepseek-chat');

    const result = await generateText({
      model,
      prompt,
      temperature: 0.7,
      maxOutputTokens: 200, // 限制输出
    });

    // 合规检查
    const complianceCheck = checkAICompliance({
      userInput: `性格速写 ${dayMaster}`,
      aiOutput: result.text,
    });

    const finalSummary = complianceCheck.compliant
      ? result.text.trim()
      : complianceCheck.filtered.trim();

    // 成本估算: DeepSeek ~$0.002/1K tokens output
    const estimatedTokens = finalSummary.length / 2;
    const cost = (estimatedTokens / 1000) * 0.002;

    return {
      summary: finalSummary.substring(0, 200), // 强制截断
      cost,
    };
  } catch (error) {
    console.error('[BasicReport] AI性格速写生成失败:', error);
    // 降级方案：使用模板
    return {
      summary: getFallbackPersonalitySummary(dayMaster, dayElement),
      cost: 0,
    };
  }
}

/**
 * 降级方案：模板化性格速写
 */
function getFallbackPersonalitySummary(
  dayMaster: string,
  element: string
): string {
  const templates: Record<string, string> = {
    甲: '您的日主为甲木，如同参天大树，天性向上、富有开拓精神。您待人真诚，重视承诺，具有很强的责任感。建议在追求目标的同时，学会灵活变通，这将让您的事业更加稳固。',
    乙: '您的日主为乙木，如同花草藤蔓，性格柔韧、适应力强。您善于与人相处，具有艺术气质。建议培养更强的决断力，在关键时刻敢于表达自己的想法。',
    丙: '您的日主为丙火，如同太阳之火，热情开朗、充满活力。您有很强的感染力和领导潜质。建议注意情绪管理，保持稳定的能量输出。',
    丁: '您的日主为丁火，如同烛火灯光，内敛而温暖。您思维细腻，善于洞察人心。建议增强自信，让内在的光芒更加闪耀。',
    戊: '您的日主为戊土，如同高山大地，稳重可靠、包容力强。您是天生的协调者和建设者。建议适度灵活，避免过于固执。',
    己: '您的日主为己土，如同田园湿土，务实勤恳、善于积累。您有很强的耐心和毅力。建议拓宽视野，尝试新的可能性。',
    庚: '您的日主为庚金，如同刀剑铁器，刚毅果断、原则性强。您有很强的执行力和正义感。建议学会柔和处事，刚柔并济。',
    辛: '您的日主为辛金，如同珠宝美玉，细腻精致、追求完美。您有独特的审美和品味。建议降低期待，接纳不完美的美好。',
    壬: '您的日主为壬水，如同江河湖海，智慧灵动、适应性强。您善于学习和变通。建议增强稳定性，避免过于飘忽。',
    癸: '您的日主为癸水，如同雨露甘泉，温柔细腻、润物无声。您有很强的同理心和洞察力。建议建立边界，保护好自己的能量。',
  };

  return (
    templates[dayMaster] ||
    `您的日主为${dayMaster}（${element}），这赋予了您独特的性格特质。建议您发挥优势，保持积极向上的心态，相信自己的潜力。`
  );
}

/**
 * 构建风水预览页
 */
function buildFengshuiPreviewPage(
  fengshuiData: NonNullable<BasicReportInput['fengshuiData']>
): FengshuiPreviewPage {
  // 九宫格ASCII艺术
  const nineGrid = `
┌─────┬─────┬─────┐
│ 东南 │  南  │ 西南 │
├─────┼─────┼─────┤
│  东  │  中  │  西  │
├─────┼─────┼─────┤
│ 东北 │  北  │ 西北 │
└─────┴─────┴─────┘`;

  // 年度吉凶速览（基于流年飞星）
  const currentYear = new Date().getFullYear();
  const wealthStar = fengshuiData.yearlyStars?.find((s) => s.star === 8);
  const negativeStar = fengshuiData.yearlyStars?.find(
    (s) => s.star === 2 || s.star === 5
  );

  return {
    nineGrid: {
      layout: nineGrid,
      facing: `坐${fengshuiData.mountain}朝${fengshuiData.facing}`,
      period: fengshuiData.period,
    },
    yearlyHighlights: {
      wealthDirection: wealthStar
        ? `${getDirectionName(wealthStar.palace)} (八白左辅星)`
        : '待分析',
      negativeDirection: negativeStar
        ? `${getDirectionName(negativeStar.palace)} (${negativeStar.star === 2 ? '二黑巨门' : '五黄灾星'})`
        : '无明显凶位',
      upgradeHint:
        '精华报告将为您详细解读九宫飞星，并结合您的命理给出专属的风水布局建议。',
    },
  };
}

/**
 * 宫位转方向名称
 */
function getDirectionName(palace: number): string {
  const directions: Record<number, string> = {
    1: '北',
    2: '西南',
    3: '东',
    4: '东南',
    5: '中',
    6: '西北',
    7: '西',
    8: '东北',
    9: '南',
  };
  return directions[palace] || '未知';
}

/**
 * 构建Paywall页
 */
function buildPaywallPage(): PaywallPage {
  return {
    blurredChapters: [
      '第三章：事业财富的机遇与挑战 (AI深度解读)',
      '第四章：🌟【核心】您与住宅的能量共鸣分析',
      '第五章：2025年度风水布局方案',
      '第六章：行动清单与幸运元素',
    ],
    essentialFeatures: [
      'AI深度性格与事业财富叙事',
      '玄空飞星九宫全解 + 城门诀催财',
      '🌟 人宅结合AI分析（独家）',
      '2025年专属布局方案',
      '可执行行动清单',
      '专业PDF永久保存',
    ],
    pricing: {
      original: '$29.90',
      current: '$9.90',
      credits: 99,
    },
  };
}

/**
 * 生成报告ID
 */
function generateReportId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `BASIC_${timestamp}_${random}`;
}

/**
 * 成本估算
 */
export function estimateBasicReportCost(includeAI = true): number {
  if (!includeAI) return 0;
  // AI性格速写: ~$0.002 * 150 tokens ≈ $0.0003
  return 0.015; // 安全余量
}
