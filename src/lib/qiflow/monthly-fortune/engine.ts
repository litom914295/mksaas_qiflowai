/**
 * Phase 8: Pro 月度运势生成引擎
 *
 * 功能：
 * 1. 月度飞星布局计算（复用 xuankong 算法）
 * 2. 八字流年流月分析
 * 3. 个性化吉凶判断
 * 4. 生成月度运势报告
 */

import type { BaziChart } from '../bazi/types';
import {
  calculateLiunianStar,
  calculateLiuyueStar,
  generateLiunianPlate,
} from '../xuankong/liunian-analysis';
import type { Plate } from '../xuankong/types';

// ==================== 类型定义 ====================

export interface MonthlyFortuneInput {
  userId: string;
  year: number;
  month: number;
  baziChart: BaziChart; // 用户八字信息
  birthLocation?: {
    // 可选：出生地信息（用于飞星方位）
    latitude: number;
    longitude: number;
  };
}

export interface MonthlyFortuneResult {
  // 运势数据
  fortuneData: {
    overallScore: number; // 综合评分 0-100
    luckyDirections: string[]; // 吉方位
    luckyColors: string[]; // 幸运色
    luckyNumbers: number[]; // 幸运数字
    careerForecast: string; // 事业运势
    healthWarnings: string[]; // 健康警示
    relationshipTips: string[]; // 感情建议
    wealthAdvice: string; // 财运建议
  };

  // 飞星分析
  flyingStarAnalysis: {
    monthlyGrid: Array<{
      direction: string;
      stars: number[];
      meaning: string;
      auspiciousness: 'excellent' | 'good' | 'neutral' | 'poor' | 'dangerous';
    }>;
    criticalWarnings: Array<{
      direction: string;
      issue: string;
      remedy: string;
    }>;
  };

  // 八字流年流月分析
  baziTimeliness: {
    yearPillar: string; // 流年天干地支
    monthPillar: string; // 流月天干地支
    interactions: Array<{
      type: string; // '冲', '合', '刑', '克', '泄'
      target: string;
      impact: string;
    }>;
    strengthAnalysis: Record<string, number>; // 五行强弱变化
  };

  // 生成元数据
  metadata: {
    aiModel?: string;
    generationTimeMs?: number;
    aiCostUSD?: number;
    generationMethod: 'manual' | 'auto_cron';
  };
}

// ==================== 核心引擎 ====================

/**
 * 生成月度运势
 */
export async function generateMonthlyFortune(
  input: MonthlyFortuneInput
): Promise<MonthlyFortuneResult> {
  const startTime = Date.now();

  // 1. 计算流年流月飞星
  const flyingStarData = calculateMonthlyFlyingStar(input.year, input.month);

  // 2. 八字流年流月分析
  const baziAnalysis = analyzeBaziTimeliness(
    input.baziChart,
    input.year,
    input.month
  );

  // 3. 综合评分计算
  const overallScore = calculateOverallScore(flyingStarData, baziAnalysis);

  // 4. 生成吉祥元素
  const luckyElements = generateLuckyElements(flyingStarData, baziAnalysis);

  // 5. 生成各方面运势
  const forecasts = generateDetailedForecasts(
    flyingStarData,
    baziAnalysis,
    input.baziChart
  );

  const generationTimeMs = Date.now() - startTime;

  return {
    fortuneData: {
      overallScore,
      ...luckyElements,
      ...forecasts,
    },
    flyingStarAnalysis: flyingStarData,
    baziTimeliness: baziAnalysis,
    metadata: {
      generationTimeMs,
      generationMethod: 'manual',
    },
  };
}

// ==================== 飞星计算 ====================

function calculateMonthlyFlyingStar(year: number, month: number) {
  const liunianInfo = calculateLiunianStar(year);
  const liuyueInfo = calculateLiuyueStar(year, month);
  const { monthlyPlates } = generateLiunianPlate(year);

  // 获取当月飞星盘
  const monthPlate = monthlyPlates.find((m) => m.month === month)?.plate;

  if (!monthPlate) {
    throw new Error(`无法生成 ${year}年${month}月 的飞星盘`);
  }

  // 九宫格飞星布局
  const monthlyGrid = monthPlate.map((palace) => {
    const direction = getDirectionName(palace.palace);
    const auspiciousness = evaluateAuspiciousness(
      palace.mountainStar,
      palace.facingStar
    );

    return {
      direction,
      stars: [
        palace.mountainStar || 0,
        palace.facingStar || 0,
        palace.periodStar || 0,
      ],
      meaning: getStarMeaning(palace.mountainStar, palace.facingStar),
      auspiciousness,
    };
  });

  // 识别凶方位
  const criticalWarnings = identifyCriticalDirections(monthPlate);

  return {
    monthlyGrid,
    criticalWarnings,
  };
}

// 方位映射
function getDirectionName(palace: number): string {
  const directionMap: Record<number, string> = {
    1: '正北',
    2: '西南',
    3: '正东',
    4: '东南',
    5: '中宫',
    6: '西北',
    7: '正西',
    8: '东北',
    9: '正南',
  };
  return directionMap[palace] || '未知';
}

// 吉凶判断
function evaluateAuspiciousness(
  mountainStar: number,
  facingStar: number
): 'excellent' | 'good' | 'neutral' | 'poor' | 'dangerous' {
  // 当旺星 (8, 9, 1)
  const auspiciousStars = [8, 9, 1];
  // 失运星 (5, 2, 3)
  const inauspiciousStars = [5, 2, 3];

  const isAuspicious =
    auspiciousStars.includes(mountainStar) &&
    auspiciousStars.includes(facingStar);
  const isInauspicious =
    inauspiciousStars.includes(mountainStar) ||
    inauspiciousStars.includes(facingStar);
  const isDangerous =
    (mountainStar === 5 && facingStar === 2) ||
    (mountainStar === 2 && facingStar === 5);

  if (isDangerous) return 'dangerous';
  if (isAuspicious) return 'excellent';
  if (isInauspicious) return 'poor';

  // 中等吉星 (6, 7)
  if ([6, 7].includes(mountainStar) || [6, 7].includes(facingStar)) {
    return 'good';
  }

  return 'neutral';
}

// 星曜含义
function getStarMeaning(mountainStar: number, facingStar: number): string {
  const meanings: Record<number, string> = {
    1: '一白贪狼星 - 人缘财运',
    2: '二黑巨门星 - 病符凶星',
    3: '三碧禄存星 - 是非口舌',
    4: '四绿文昌星 - 文昌学业',
    5: '五黄廉贞星 - 大凶之星',
    6: '六白武曲星 - 权威财运',
    7: '七赤破军星 - 破财劫运',
    8: '八白左辅星 - 大吉财星',
    9: '九紫右弼星 - 喜庆吉星',
  };

  return `${meanings[mountainStar]}, ${meanings[facingStar]}`;
}

// 识别凶方位
function identifyCriticalDirections(plate: Plate) {
  const warnings: Array<{
    direction: string;
    issue: string;
    remedy: string;
  }> = [];

  for (const palace of plate) {
    const direction = getDirectionName(palace.palace);

    // 五黄二黑组合
    if (
      (palace.mountainStar === 5 && palace.facingStar === 2) ||
      (palace.mountainStar === 2 && palace.facingStar === 5)
    ) {
      warnings.push({
        direction,
        issue: '五黄二黑煞气极重，易有病灾意外',
        remedy: '放置铜葫芦、六帝钱化解，避免动土装修',
      });
    }

    // 单独五黄
    else if (palace.mountainStar === 5 || palace.facingStar === 5) {
      warnings.push({
        direction,
        issue: '五黄煞到，容易有健康或意外问题',
        remedy: '放置六帝钱或铜铃铛，保持此方位清净',
      });
    }

    // 单独二黑
    else if (palace.mountainStar === 2 || palace.facingStar === 2) {
      warnings.push({
        direction,
        issue: '二黑病符星临门，注意健康',
        remedy: '放置铜葫芦或音乐盒，多通风采光',
      });
    }

    // 七赤破军
    else if (palace.mountainStar === 7 || palace.facingStar === 7) {
      warnings.push({
        direction,
        issue: '七赤破军星，易有破财或口舌是非',
        remedy: '放置蓝色水晶或鱼缸化解，避免冲动决策',
      });
    }
  }

  return warnings;
}

// ==================== 八字流年流月分析 ====================

function analyzeBaziTimeliness(
  baziChart: BaziChart,
  year: number,
  month: number
) {
  // 计算流年干支
  const yearGanzhi = calculateYearGanzhi(year);
  const monthGanzhi = calculateMonthGanzhi(year, month);

  // 分析与命局的刑冲合害
  const interactions = analyzeInteractions(baziChart, yearGanzhi, monthGanzhi);

  // 五行强弱变化
  const strengthAnalysis = analyzeElementStrength(
    baziChart,
    yearGanzhi,
    monthGanzhi
  );

  return {
    yearPillar: yearGanzhi,
    monthPillar: monthGanzhi,
    interactions,
    strengthAnalysis,
  };
}

// 天干地支对照表
const HEAVENLY_STEMS = [
  '甲',
  '乙',
  '丙',
  '丁',
  '戊',
  '己',
  '庚',
  '辛',
  '壬',
  '癸',
];
const EARTHLY_BRANCHES = [
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

function calculateYearGanzhi(year: number): string {
  const stemIndex = (year - 4) % 10;
  const branchIndex = (year - 4) % 12;
  return `${HEAVENLY_STEMS[stemIndex]}${EARTHLY_BRANCHES[branchIndex]}`;
}

function calculateMonthGanzhi(year: number, month: number): string {
  // 简化版：基于年干和月份推算
  const yearStemIndex = (year - 4) % 10;
  const monthStemBase = (yearStemIndex * 2 + month - 1) % 10;
  const monthBranchIndex = (month + 1) % 12;

  return `${HEAVENLY_STEMS[monthStemBase]}${EARTHLY_BRANCHES[monthBranchIndex]}`;
}

function analyzeInteractions(
  baziChart: BaziChart,
  yearGanzhi: string,
  monthGanzhi: string
) {
  const interactions: Array<{
    type: string;
    target: string;
    impact: string;
  }> = [];

  // 这里简化处理，实际应该详细分析刑冲合害
  // TODO: 完整实现需要参考 bazi 库的刑冲合害规则

  return interactions;
}

function analyzeElementStrength(
  baziChart: BaziChart,
  yearGanzhi: string,
  monthGanzhi: string
) {
  // 返回五行力量变化
  return {
    金: 0,
    木: 0,
    水: 0,
    火: 0,
    土: 0,
  };
}

// ==================== 综合评分 ====================

function calculateOverallScore(flyingStarData: any, baziAnalysis: any): number {
  let score = 50; // 基础分

  // 飞星评分 (30分)
  const excellentCount = flyingStarData.monthlyGrid.filter(
    (g: any) => g.auspiciousness === 'excellent'
  ).length;
  const dangerousCount = flyingStarData.monthlyGrid.filter(
    (g: any) => g.auspiciousness === 'dangerous'
  ).length;

  score += excellentCount * 5;
  score -= dangerousCount * 10;

  // 凶煞扣分 (最多-20分)
  score -= Math.min(flyingStarData.criticalWarnings.length * 5, 20);

  // 确保范围在 0-100
  return Math.max(0, Math.min(100, score));
}

// ==================== 吉祥元素 ====================

function generateLuckyElements(flyingStarData: any, baziAnalysis: any) {
  // 吉祥方位
  const luckyDirections = flyingStarData.monthlyGrid
    .filter((g: any) => ['excellent', 'good'].includes(g.auspiciousness))
    .map((g: any) => g.direction)
    .slice(0, 3);

  // 幸运色（基于当月飞星五行）
  const luckyColors = ['红色', '紫色', '金色']; // 简化版

  // 幸运数字（基于吉星）
  const luckyNumbers = [1, 6, 8, 9];

  return {
    luckyDirections,
    luckyColors,
    luckyNumbers,
  };
}

// ==================== 详细运势预测 ====================

function generateDetailedForecasts(
  flyingStarData: any,
  baziAnalysis: any,
  baziChart: BaziChart
) {
  return {
    careerForecast: '本月事业运势平稳，适合稳扎稳打推进项目。', // 简化版
    healthWarnings: flyingStarData.criticalWarnings.map((w: any) => w.issue),
    relationshipTips: ['保持沟通，避免误会', '多关心家人健康'],
    wealthAdvice: '财运尚可，但需注意理性消费，避免冲动投资。',
  };
}

// ==================== 导出 ====================

// 注：移除重复导出，避免与上文导出冲突
