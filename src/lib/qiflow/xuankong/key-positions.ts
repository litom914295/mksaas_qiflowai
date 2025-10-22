/**
 * 关键位置统一管理模块 (v6.0)
 *
 * 统一管理所有风水关键位置：
 * - 财位（Wealth Position）
 * - 文昌位（Academic Position）
 * - 桃花位（Romance Position）
 * - 贵人位（Benefactor Position）
 * - 健康位（Health Position）
 */

import type {
  EnhancedXuankongPlate,
  FlyingStar,
  FortuneRating,
  PalaceName,
  PositionRating,
} from './types';

import type { Dizhi, WuxingElement } from './enhanced-bazi-fengshui';
import type { UserProfile } from './personalized-analysis';

// 关键位置类型
export type KeyPositionType =
  | 'wealth'
  | 'academic'
  | 'romance'
  | 'benefactor'
  | 'health';

// 关键位置信息
export interface KeyPosition {
  type: KeyPositionType;
  typeName: string; // 中文名称
  palace: PalaceName;
  rating: PositionRating;
  score: number; // 0-100

  // 详细分析
  analysis: {
    flyingStars: {
      mountainStar: FlyingStar;
      facingStar: FlyingStar;
      yearStar: FlyingStar;
    };
    starCombination: string; // 星组描述
    strengths: string[]; // 优势
    weaknesses: string[]; // 劣势
    energyLevel: 'strong' | 'moderate' | 'weak'; // 能量强度
  };

  // 使用建议
  recommendations: {
    suitable: string[]; // 适合的活动
    unsuitable: string[]; // 不适合的活动
    enhancements: KeyPositionEnhancement[]; // 增强方法
    bestTiming: {
      hours: number[]; // 最佳时辰
      months: number[]; // 最佳月份
      avoidDays: string[]; // 忌用日子
    };
  };

  // 化解方案（如果需要）
  remedies?: KeyPositionRemedy[];
}

// 增强方法
export interface KeyPositionEnhancement {
  category:
    | 'layout'
    | 'decoration'
    | 'color'
    | 'element'
    | 'lighting'
    | 'activity';
  method: string;
  items: string[];
  priority: 'high' | 'medium' | 'low';
  expectedEffect: string;
  cost: 'free' | 'low' | 'medium' | 'high';
}

// 化解方法
export interface KeyPositionRemedy {
  issue: string;
  solution: string;
  items: string[];
  placement: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'moderate' | 'hard';
}

// 所有关键位置汇总
export interface AllKeyPositions {
  wealth: KeyPosition;
  academic: KeyPosition;
  romance: KeyPosition;
  benefactor: KeyPosition;
  health: KeyPosition;

  summary: {
    bestPosition: KeyPositionType; // 最佳位置
    worstPosition: KeyPositionType; // 最差位置
    averageScore: number;
    overallRating: FortuneRating;
  };
}

/**
 * 计算所有关键位置
 */
export function calculateAllKeyPositions(
  plate: EnhancedXuankongPlate,
  profile?: UserProfile
): AllKeyPositions {
  const wealth = calculateWealthPosition(plate, profile);
  const academic = calculateAcademicPosition(plate, profile);
  const romance = calculateRomancePosition(plate, profile);
  const benefactor = calculateBenefactorPosition(plate, profile);
  const health = calculateHealthPosition(plate, profile);

  // 计算汇总信息
  const positions = [wealth, academic, romance, benefactor, health];
  const averageScore =
    positions.reduce((sum, p) => sum + p.score, 0) / positions.length;

  const sortedByScore = [...positions].sort((a, b) => b.score - a.score);
  const bestPosition = sortedByScore[0].type;
  const worstPosition = sortedByScore[sortedByScore.length - 1].type;

  let overallRating: FortuneRating;
  if (averageScore >= 80) overallRating = '大吉' as FortuneRating;
  else if (averageScore >= 65) overallRating = '吉' as FortuneRating;
  else if (averageScore >= 50) overallRating = '平' as FortuneRating;
  else if (averageScore >= 35) overallRating = '次凶' as FortuneRating;
  else overallRating = '凶' as FortuneRating;

  return {
    wealth,
    academic,
    romance,
    benefactor,
    health,
    summary: {
      bestPosition,
      worstPosition,
      averageScore,
      overallRating,
    },
  };
}

/**
 * 计算财位
 */
export function calculateWealthPosition(
  plate: EnhancedXuankongPlate,
  profile?: UserProfile
): KeyPosition {
  // 财位主要看向星8、向星9（当旺、未来）
  const candidates: Array<{ palace: PalaceName; score: number }> = [];

  Object.entries(plate.palaces).forEach(([palaceName, info]) => {
    const palace = palaceName as PalaceName;
    let score = 0;

    // 向星8或9
    if (info.facingStar === 8) score += 40;
    else if (info.facingStar === 9) score += 35;
    else if (info.facingStar === 1)
      score += 25; // 一白贪狼水星
    else if (info.facingStar === 6) score += 20; // 六白武曲金星

    // 山星配合
    if (info.mountainStar === 8) score += 20;
    else if (info.mountainStar === 9) score += 15;
    else if (info.mountainStar === 1) score += 10;

    // 流年星增益
    if ((info as any).yearStar === 8 || (info as any).yearStar === 9)
      score += 15;
    else if ((info as any).yearStar === 1 || (info as any).yearStar === 6)
      score += 10;

    // 特殊组合
    if ((info.combinations as any)?.includes?.('double_eight')) score += 25;
    if ((info.combinations as any)?.includes?.('pearl_string')) score += 20;

    // 吉凶影响
    if ((info as any).rating === 'auspicious') score += 10;
    else if ((info as any).rating === 'inauspicious') score -= 15;

    candidates.push({ palace, score: Math.max(0, score) });
  });

  // 选出最佳财位
  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];
  const palaceInfo = plate.palaces[best.palace];

  // 计算评级
  let rating: PositionRating;
  if (best.score >= 80) rating = 'excellent';
  else if (best.score >= 60) rating = 'good';
  else if (best.score >= 40) rating = 'moderate';
  else if (best.score >= 20) rating = 'weak';
  else rating = 'poor';

  // 生成分析
  const analysis = generateWealthAnalysis(palaceInfo, plate);

  // 生成建议
  const recommendations = generateWealthRecommendations(
    palaceInfo,
    best.palace,
    rating
  );

  // 生成化解方案（如果需要）
  const remedies =
    rating === 'weak' || rating === 'poor'
      ? generateWealthRemedies(palaceInfo, best.palace)
      : undefined;

  return {
    type: 'wealth',
    typeName: '财位',
    palace: best.palace,
    rating,
    score: best.score,
    analysis,
    recommendations,
    remedies,
  };
}

/**
 * 计算文昌位
 */
export function calculateAcademicPosition(
  plate: EnhancedXuankongPlate,
  profile?: UserProfile
): KeyPosition {
  // 文昌位主要看一白、四绿星
  const candidates: Array<{ palace: PalaceName; score: number }> = [];

  Object.entries(plate.palaces).forEach(([palaceName, info]) => {
    const palace = palaceName as PalaceName;
    let score = 0;

    // 向星或山星为1、4
    if (info.facingStar === 4)
      score += 40; // 四绿文曲
    else if (info.facingStar === 1) score += 35; // 一白文昌

    if (info.mountainStar === 4) score += 20;
    else if (info.mountainStar === 1) score += 15;

    // 流年星增益
    if ((info as any).yearStar === 4) score += 15;
    else if ((info as any).yearStar === 1) score += 10;

    // 14组合
    if (
      (info.mountainStar === 1 && info.facingStar === 4) ||
      (info.mountainStar === 4 && info.facingStar === 1)
    ) {
      score += 25;
    }

    // 吉凶影响
    if ((info as any).rating === 'auspicious') score += 10;
    else if ((info as any).rating === 'inauspicious') score -= 15;

    candidates.push({ palace, score: Math.max(0, score) });
  });

  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];
  const palaceInfo = plate.palaces[best.palace];

  let rating: PositionRating;
  if (best.score >= 80) rating = 'excellent';
  else if (best.score >= 60) rating = 'good';
  else if (best.score >= 40) rating = 'moderate';
  else if (best.score >= 20) rating = 'weak';
  else rating = 'poor';

  const analysis = generateAcademicAnalysis(palaceInfo, plate);
  const recommendations = generateAcademicRecommendations(
    palaceInfo,
    best.palace,
    rating
  );
  const remedies =
    rating === 'weak' || rating === 'poor'
      ? generateAcademicRemedies(palaceInfo, best.palace)
      : undefined;

  return {
    type: 'academic',
    typeName: '文昌位',
    palace: best.palace,
    rating,
    score: best.score,
    analysis,
    recommendations,
    remedies,
  };
}

/**
 * 计算桃花位（基于生肖）
 */
export function calculateRomancePosition(
  plate: EnhancedXuankongPlate,
  profile?: UserProfile
): KeyPosition {
  let targetPalace: PalaceName = '离'; // 默认

  // 根据用户生肖确定桃花位
  if (profile?.birthYear) {
    const zodiac = calculateZodiac(profile.birthYear);
    targetPalace = getZodiacRomancePosition(zodiac);
  }

  const palaceInfo = plate.palaces[targetPalace];

  // 计算分数
  let score = 50; // 基础分

  // 根据飞星组合加减分
  if (palaceInfo.facingStar === 4) score += 20; // 四绿桃花星
  if (palaceInfo.facingStar === 9) score += 15; // 九紫喜庆
  if (palaceInfo.facingStar === 1) score += 10; // 一白感情

  if (palaceInfo.mountainStar === 4) score += 10;
  if (palaceInfo.mountainStar === 9) score += 5;

  // 煞气影响
  if (palaceInfo.facingStar === 2 || palaceInfo.facingStar === 5) score -= 20;
  if (palaceInfo.facingStar === 3) score -= 15; // 三碧争执
  if (palaceInfo.facingStar === 7) score -= 10; // 七赤桃花劫

  // 吉凶影响
  if ((palaceInfo as any).rating === 'auspicious') score += 15;
  else if ((palaceInfo as any).rating === 'inauspicious') score -= 20;

  score = Math.max(0, Math.min(100, score));

  let rating: PositionRating;
  if (score >= 80) rating = 'excellent';
  else if (score >= 60) rating = 'good';
  else if (score >= 40) rating = 'moderate';
  else if (score >= 20) rating = 'weak';
  else rating = 'poor';

  const analysis = generateRomanceAnalysis(palaceInfo, plate, targetPalace);
  const recommendations = generateRomanceRecommendations(
    palaceInfo,
    targetPalace,
    rating
  );
  const remedies =
    rating === 'weak' || rating === 'poor'
      ? generateRomanceRemedies(palaceInfo, targetPalace)
      : undefined;

  return {
    type: 'romance',
    typeName: '桃花位',
    palace: targetPalace,
    rating,
    score,
    analysis,
    recommendations,
    remedies,
  };
}

/**
 * 计算贵人位（基于生肖天乙贵人）
 */
export function calculateBenefactorPosition(
  plate: EnhancedXuankongPlate,
  profile?: UserProfile
): KeyPosition {
  let targetPalace: PalaceName = '乾'; // 默认

  // 根据用户生肖确定贵人位
  if (profile?.birthYear) {
    const zodiac = calculateZodiac(profile.birthYear);
    targetPalace = getZodiacBenefactorPosition(zodiac);
  }

  const palaceInfo = plate.palaces[targetPalace];

  // 计算分数
  let score = 50;

  // 六白、八白、一白为贵人星
  if (palaceInfo.facingStar === 6) score += 25;
  if (palaceInfo.facingStar === 8) score += 20;
  if (palaceInfo.facingStar === 1) score += 15;

  if (palaceInfo.mountainStar === 6) score += 15;
  if (palaceInfo.mountainStar === 8) score += 10;

  // 流年星增益
  if ((palaceInfo as any).yearStar === 6 || (palaceInfo as any).yearStar === 8)
    score += 10;

  // 煞气影响
  if (palaceInfo.facingStar === 2 || palaceInfo.facingStar === 5) score -= 25;
  if (palaceInfo.facingStar === 3 || palaceInfo.facingStar === 7) score -= 15;

  if ((palaceInfo as any).rating === 'auspicious') score += 15;
  else if ((palaceInfo as any).rating === 'inauspicious') score -= 20;

  score = Math.max(0, Math.min(100, score));

  let rating: PositionRating;
  if (score >= 80) rating = 'excellent';
  else if (score >= 60) rating = 'good';
  else if (score >= 40) rating = 'moderate';
  else if (score >= 20) rating = 'weak';
  else rating = 'poor';

  const analysis = generateBenefactorAnalysis(palaceInfo, plate, targetPalace);
  const recommendations = generateBenefactorRecommendations(
    palaceInfo,
    targetPalace,
    rating
  );
  const remedies =
    rating === 'weak' || rating === 'poor'
      ? generateBenefactorRemedies(palaceInfo, targetPalace)
      : undefined;

  return {
    type: 'benefactor',
    typeName: '贵人位',
    palace: targetPalace,
    rating,
    score,
    analysis,
    recommendations,
    remedies,
  };
}

/**
 * 计算健康位
 */
export function calculateHealthPosition(
  plate: EnhancedXuankongPlate,
  profile?: UserProfile
): KeyPosition {
  // 健康位主要看山星，求旺山旺向
  const candidates: Array<{ palace: PalaceName; score: number }> = [];

  Object.entries(plate.palaces).forEach(([palaceName, info]) => {
    const palace = palaceName as PalaceName;
    let score = 0;

    // 山星8、9为最佳
    if (info.mountainStar === 8) score += 40;
    else if (info.mountainStar === 9) score += 35;
    else if (info.mountainStar === 1) score += 20;
    else if (info.mountainStar === 6) score += 15;

    // 向星配合
    if (info.facingStar === 8 || info.facingStar === 9) score += 15;

    // 避开煞星
    if (info.mountainStar === 2 || info.mountainStar === 5) score -= 30; // 病符、五黄
    if (info.facingStar === 2 || info.facingStar === 5) score -= 20;
    if (info.mountainStar === 3) score -= 10; // 三碧斗牛

    // 流年星影响
    if ((info as any).yearStar === 2 || (info as any).yearStar === 5)
      score -= 15;

    if ((info as any).rating === 'auspicious') score += 10;
    else if ((info as any).rating === 'inauspicious') score -= 15;

    candidates.push({ palace, score: Math.max(0, score) });
  });

  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];
  const palaceInfo = plate.palaces[best.palace];

  let rating: PositionRating;
  if (best.score >= 80) rating = 'excellent';
  else if (best.score >= 60) rating = 'good';
  else if (best.score >= 40) rating = 'moderate';
  else if (best.score >= 20) rating = 'weak';
  else rating = 'poor';

  const analysis = generateHealthAnalysis(palaceInfo, plate);
  const recommendations = generateHealthRecommendations(
    palaceInfo,
    best.palace,
    rating
  );
  const remedies =
    rating === 'weak' || rating === 'poor'
      ? generateHealthRemedies(palaceInfo, best.palace)
      : undefined;

  return {
    type: 'health',
    typeName: '健康位',
    palace: best.palace,
    rating,
    score: best.score,
    analysis,
    recommendations,
    remedies,
  };
}

// ==================== 辅助函数 ====================

/**
 * 生成财位分析
 */
function generateWealthAnalysis(
  palaceInfo: any,
  plate: EnhancedXuankongPlate
): KeyPosition['analysis'] {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (palaceInfo.facingStar === 8) strengths.push('向星八白当旺，财运极佳');
  if (palaceInfo.facingStar === 9) strengths.push('向星九紫未来星，未来财运强');
  if (palaceInfo.combinations?.includes('double_eight'))
    strengths.push('双八到向，财源广进');

  if (palaceInfo.facingStar === 2 || palaceInfo.facingStar === 5) {
    weaknesses.push('煞星到向，不利财运');
  }
  if (palaceInfo.rating === 'inauspicious') weaknesses.push('宫位整体不吉');

  let energyLevel: 'strong' | 'moderate' | 'weak' = 'moderate';
  if (strengths.length >= 2 && weaknesses.length === 0) energyLevel = 'strong';
  else if (weaknesses.length >= 2) energyLevel = 'weak';

  return {
    flyingStars: {
      mountainStar: palaceInfo.mountainStar,
      facingStar: palaceInfo.facingStar,
      yearStar: palaceInfo.yearStar,
    },
    starCombination: `山星${palaceInfo.mountainStar}、向星${palaceInfo.facingStar}`,
    strengths,
    weaknesses: weaknesses.length > 0 ? weaknesses : ['暂无明显劣势'],
    energyLevel,
  };
}

function generateWealthRecommendations(
  palaceInfo: any,
  palace: PalaceName,
  rating: PositionRating
): KeyPosition['recommendations'] {
  const suitable =
    rating === 'excellent' || rating === 'good'
      ? ['财务办公', '商务洽谈', '投资决策', '收银台']
      : ['储物空间', '文件柜'];

  const unsuitable =
    rating === 'weak' || rating === 'poor'
      ? ['重要财务活动', '收银', '保险箱']
      : [];

  const enhancements: KeyPositionEnhancement[] = [
    {
      category: 'decoration',
      method: '摆放聚财物品',
      items: ['貔貅', '金蟾', '聚宝盆', '水晶洞'],
      priority: 'high',
      expectedEffect: '增强聚财磁场',
      cost: 'medium',
    },
    {
      category: 'color',
      method: '使用旺财颜色',
      items: ['金色', '黄色', '紫色'],
      priority: 'medium',
      expectedEffect: '催旺财运',
      cost: 'low',
    },
    {
      category: 'lighting',
      method: '增加照明',
      items: ['长明灯', '聚光灯'],
      priority: 'medium',
      expectedEffect: '提升阳气，激活财气',
      cost: 'low',
    },
  ];

  return {
    suitable,
    unsuitable,
    enhancements,
    bestTiming: {
      hours: [7, 8, 9, 10, 11], // 上午旺时
      months: [2, 5, 8, 11], // 四季旺月
      avoidDays: ['破日', '败日'],
    },
  };
}

function generateWealthRemedies(
  palaceInfo: any,
  palace: PalaceName
): KeyPositionRemedy[] {
  const remedies: KeyPositionRemedy[] = [];

  if (palaceInfo.facingStar === 2 || palaceInfo.facingStar === 5) {
    remedies.push({
      issue: '煞星到向，破财风险',
      solution: '放置铜器或六帝钱化解',
      items: ['六帝钱', '铜葫芦', '五行八卦镜'],
      placement: `${palace}宫位显眼处`,
      priority: 'urgent',
      difficulty: 'easy',
    });
  }

  if (palaceInfo.rating === 'inauspicious') {
    remedies.push({
      issue: '整体气场不佳',
      solution: '增强光线与流动',
      items: ['长明灯', '流水摆件', '绿植'],
      placement: `${palace}宫位`,
      priority: 'high',
      difficulty: 'easy',
    });
  }

  return remedies;
}

// 类似的生成函数用于其他位置类型...

function generateAcademicAnalysis(
  palaceInfo: any,
  plate: EnhancedXuankongPlate
): KeyPosition['analysis'] {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (palaceInfo.facingStar === 4) strengths.push('四绿文曲星到向，文昌旺盛');
  if (palaceInfo.facingStar === 1) strengths.push('一白贪狼水星，智慧之星');

  if (palaceInfo.facingStar === 2 || palaceInfo.facingStar === 5)
    weaknesses.push('煞星干扰学业');
  if (palaceInfo.rating === 'inauspicious') weaknesses.push('宫位不利学习');

  let energyLevel: 'strong' | 'moderate' | 'weak' = 'moderate';
  if (strengths.length >= 2) energyLevel = 'strong';
  else if (weaknesses.length >= 2) energyLevel = 'weak';

  return {
    flyingStars: {
      mountainStar: palaceInfo.mountainStar,
      facingStar: palaceInfo.facingStar,
      yearStar: palaceInfo.yearStar,
    },
    starCombination: `山星${palaceInfo.mountainStar}、向星${palaceInfo.facingStar}`,
    strengths,
    weaknesses: weaknesses.length > 0 ? weaknesses : ['暂无明显劣势'],
    energyLevel,
  };
}

function generateAcademicRecommendations(
  palaceInfo: any,
  palace: PalaceName,
  rating: PositionRating
): KeyPosition['recommendations'] {
  const enhancements: KeyPositionEnhancement[] = [
    {
      category: 'decoration',
      method: '摆放文昌物品',
      items: ['文昌塔', '毛笔架', '书法作品', '水晶球'],
      priority: 'high',
      expectedEffect: '催旺文昌运',
      cost: 'low',
    },
    {
      category: 'activity',
      method: '学习与创作',
      items: ['书桌朝此方位', '阅读角', '创作空间'],
      priority: 'high',
      expectedEffect: '增强学习效果',
      cost: 'free',
    },
  ];

  return {
    suitable: ['学习', '阅读', '考试准备', '创作'],
    unsuitable: rating === 'poor' ? ['长时间学习'] : [],
    enhancements,
    bestTiming: {
      hours: [5, 6, 7, 8], // 卯辰时
      months: [2, 3, 8, 9],
      avoidDays: [],
    },
  };
}

function generateAcademicRemedies(
  palaceInfo: any,
  palace: PalaceName
): KeyPositionRemedy[] {
  return [
    {
      issue: '文昌气场弱',
      solution: '增加文昌塔或四枝水养富贵竹',
      items: ['文昌塔', '富贵竹（4枝）', '绿色植物'],
      placement: `${palace}宫位书桌或学习区`,
      priority: 'medium',
      difficulty: 'easy',
    },
  ];
}

function generateRomanceAnalysis(
  palaceInfo: any,
  plate: EnhancedXuankongPlate,
  palace: PalaceName
): KeyPosition['analysis'] {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (palaceInfo.facingStar === 4) strengths.push('四绿桃花星到位');
  if (palaceInfo.facingStar === 9) strengths.push('九紫喜庆星，利姻缘');
  if (palaceInfo.facingStar === 3) weaknesses.push('三碧是非星，易争吵');
  if (palaceInfo.facingStar === 7) weaknesses.push('七赤破军，桃花劫');

  let energyLevel: 'strong' | 'moderate' | 'weak' = 'moderate';
  if (strengths.length >= 2) energyLevel = 'strong';
  else if (weaknesses.length >= 2) energyLevel = 'weak';

  return {
    flyingStars: {
      mountainStar: palaceInfo.mountainStar,
      facingStar: palaceInfo.facingStar,
      yearStar: palaceInfo.yearStar,
    },
    starCombination: `山星${palaceInfo.mountainStar}、向星${palaceInfo.facingStar}`,
    strengths,
    weaknesses: weaknesses.length > 0 ? weaknesses : ['暂无明显劣势'],
    energyLevel,
  };
}

function generateRomanceRecommendations(
  palaceInfo: any,
  palace: PalaceName,
  rating: PositionRating
): KeyPosition['recommendations'] {
  const enhancements: KeyPositionEnhancement[] = [
    {
      category: 'decoration',
      method: '摆放桃花物品',
      items: ['粉水晶', '鲜花', '成对装饰品'],
      priority: 'high',
      expectedEffect: '催旺桃花运',
      cost: 'low',
    },
    {
      category: 'color',
      method: '使用桃花颜色',
      items: ['粉色', '红色', '紫色'],
      priority: 'medium',
      expectedEffect: '增强感情磁场',
      cost: 'free',
    },
  ];

  return {
    suitable: ['约会准备', '社交活动', '卧室'],
    unsuitable: rating === 'poor' ? ['长期居住'] : [],
    enhancements,
    bestTiming: {
      hours: [17, 18, 19, 20], // 酉戌时
      months: [2, 5, 8, 11],
      avoidDays: ['孤辰日', '寡宿日'],
    },
  };
}

function generateRomanceRemedies(
  palaceInfo: any,
  palace: PalaceName
): KeyPositionRemedy[] {
  return [
    {
      issue: '桃花运不旺或有桃花劫',
      solution: '摆放粉水晶或水养鲜花',
      items: ['粉水晶球', '鲜花（粉/红）', '成对摆件'],
      placement: `${palace}宫位`,
      priority: 'medium',
      difficulty: 'easy',
    },
  ];
}

function generateBenefactorAnalysis(
  palaceInfo: any,
  plate: EnhancedXuankongPlate,
  palace: PalaceName
): KeyPosition['analysis'] {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (palaceInfo.facingStar === 6) strengths.push('六白武曲星，贵人星');
  if (palaceInfo.facingStar === 8) strengths.push('八白左辅星，贵人助力');
  if (palaceInfo.facingStar === 5) weaknesses.push('五黄煞星，贵人无力');

  let energyLevel: 'strong' | 'moderate' | 'weak' = 'moderate';
  if (strengths.length >= 2) energyLevel = 'strong';
  else if (weaknesses.length >= 1) energyLevel = 'weak';

  return {
    flyingStars: {
      mountainStar: palaceInfo.mountainStar,
      facingStar: palaceInfo.facingStar,
      yearStar: palaceInfo.yearStar,
    },
    starCombination: `山星${palaceInfo.mountainStar}、向星${palaceInfo.facingStar}`,
    strengths,
    weaknesses: weaknesses.length > 0 ? weaknesses : ['暂无明显劣势'],
    energyLevel,
  };
}

function generateBenefactorRecommendations(
  palaceInfo: any,
  palace: PalaceName,
  rating: PositionRating
): KeyPosition['recommendations'] {
  const enhancements: KeyPositionEnhancement[] = [
    {
      category: 'decoration',
      method: '摆放贵人物品',
      items: ['铜马', '贵人符', '黄水晶'],
      priority: 'high',
      expectedEffect: '招贵人助力',
      cost: 'medium',
    },
  ];

  return {
    suitable: ['社交活动', '接待客人', '商务谈判'],
    unsuitable: rating === 'poor' ? ['重要会面'] : [],
    enhancements,
    bestTiming: {
      hours: [9, 10, 11, 13, 14],
      months: [1, 4, 7, 10],
      avoidDays: [],
    },
  };
}

function generateBenefactorRemedies(
  palaceInfo: any,
  palace: PalaceName
): KeyPositionRemedy[] {
  return [
    {
      issue: '贵人运弱或小人干扰',
      solution: '摆放铜马或黄水晶',
      items: ['铜马摆件', '黄水晶球', '贵人符'],
      placement: `${palace}宫位显眼处`,
      priority: 'medium',
      difficulty: 'easy',
    },
  ];
}

function generateHealthAnalysis(
  palaceInfo: any,
  plate: EnhancedXuankongPlate
): KeyPosition['analysis'] {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (palaceInfo.mountainStar === 8) strengths.push('山星八白旺山，健康运强');
  if (palaceInfo.mountainStar === 9) strengths.push('山星九紫，未来健康佳');
  if (palaceInfo.mountainStar === 2)
    weaknesses.push('山星二黑病符星，需防疾病');
  if (palaceInfo.mountainStar === 5) weaknesses.push('山星五黄大煞，健康大忌');

  let energyLevel: 'strong' | 'moderate' | 'weak' = 'moderate';
  if (strengths.length >= 2) energyLevel = 'strong';
  else if (weaknesses.length >= 1) energyLevel = 'weak';

  return {
    flyingStars: {
      mountainStar: palaceInfo.mountainStar,
      facingStar: palaceInfo.facingStar,
      yearStar: palaceInfo.yearStar,
    },
    starCombination: `山星${palaceInfo.mountainStar}、向星${palaceInfo.facingStar}`,
    strengths,
    weaknesses: weaknesses.length > 0 ? weaknesses : ['暂无明显劣势'],
    energyLevel,
  };
}

function generateHealthRecommendations(
  palaceInfo: any,
  palace: PalaceName,
  rating: PositionRating
): KeyPosition['recommendations'] {
  const enhancements: KeyPositionEnhancement[] = [
    {
      category: 'element',
      method: '增强生气',
      items: ['绿植', '空气净化器', '自然光'],
      priority: 'high',
      expectedEffect: '提升健康能量',
      cost: 'low',
    },
  ];

  return {
    suitable: ['休息', '睡眠', '养生', '锻炼'],
    unsuitable: rating === 'poor' ? ['长期居住', '卧室'] : [],
    enhancements,
    bestTiming: {
      hours: [5, 6, 7, 21, 22, 23],
      months: [2, 5, 8, 11],
      avoidDays: [],
    },
  };
}

function generateHealthRemedies(
  palaceInfo: any,
  palace: PalaceName
): KeyPositionRemedy[] {
  const remedies: KeyPositionRemedy[] = [];

  if (palaceInfo.mountainStar === 2 || palaceInfo.facingStar === 2) {
    remedies.push({
      issue: '二黑病符星，易生疾病',
      solution: '放置铜葫芦或六帝钱化解',
      items: ['铜葫芦', '六帝钱', '白色物品'],
      placement: `${palace}宫位`,
      priority: 'urgent',
      difficulty: 'easy',
    });
  }

  if (palaceInfo.mountainStar === 5 || palaceInfo.facingStar === 5) {
    remedies.push({
      issue: '五黄大煞，严重影响健康',
      solution: '放置大铜器或六帝钱',
      items: ['大铜钟', '六帝钱串', '金属摆件'],
      placement: `${palace}宫位中央`,
      priority: 'urgent',
      difficulty: 'moderate',
    });
  }

  return remedies;
}

/**
 * 根据出生年份计算生肖
 */
function calculateZodiac(birthYear: number): Dizhi {
  const zodiacs: Dizhi[] = [
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
  const index = (birthYear - 4) % 12;
  return zodiacs[index];
}

/**
 * 根据生肖获取桃花位
 */
function getZodiacRomancePosition(zodiac: Dizhi): PalaceName {
  // 申子辰桃花在酉，寅午戌桃花在卯，亥卯未桃花在子，巳酉丑桃花在午
  const romanceMap: Record<string, PalaceName> = {
    申: '兑',
    子: '兑',
    辰: '兑',
    寅: '震',
    午: '震',
    戌: '震',
    亥: '坎',
    卯: '坎',
    未: '坎',
    巳: '离',
    酉: '离',
    丑: '离',
  };
  return romanceMap[zodiac] || '离';
}

/**
 * 根据生肖获取贵人位（天乙贵人）
 */
function getZodiacBenefactorPosition(zodiac: Dizhi): PalaceName {
  // 简化：根据生肖五行推算
  const benefactorMap: Record<Dizhi, PalaceName> = {
    子: '坤',
    丑: '坎',
    寅: '乾',
    卯: '坤',
    辰: '乾',
    巳: '兑',
    午: '艮',
    未: '坎',
    申: '艮',
    酉: '艮',
    戌: '乾',
    亥: '兑',
  };
  return benefactorMap[zodiac] || '乾';
}
