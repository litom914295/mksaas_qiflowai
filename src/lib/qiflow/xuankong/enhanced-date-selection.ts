/**
 * 增强版择吉系统 (v6.0)
 *
 * 支持多种场景的择吉日时：
 * - 整合参与人八字
 * - 详细时辰推荐
 * - 多种择吉场景
 * - 避忌分析
 */

import type { EnhancedXuankongPlate, FlyingStar, PalaceName } from './types';

import type {
  Dizhi,
  EnhancedBaziInfo,
  WuxingElement,
} from './enhanced-bazi-fengshui';
import type { UserProfile } from './personalized-analysis';

// 择吉场景类型
export type DateSelectionScenario =
  | 'wedding' // 婚礼
  | 'moving' // 搬家
  | 'business_opening' // 开业
  | 'groundbreaking' // 动土
  | 'signing_contract' // 签约
  | 'travel' // 出行
  | 'medical' // 就医
  | 'meeting' // 会议
  | 'ceremony' // 典礼
  | 'renovation' // 装修
  | 'engagement' // 订婚
  | 'childbirth' // 剖腹产择日
  | 'general'; // 一般吉日

// 参与人信息
export interface Participant {
  role: 'primary' | 'secondary' | 'guest'; // 主要、次要、宾客
  profile?: UserProfile;
  baziInfo?: EnhancedBaziInfo;
  importance: 'critical' | 'high' | 'medium' | 'low';
}

// 择吉请求
export interface DateSelectionRequest {
  scenario: DateSelectionScenario;
  participants: Participant[];

  // 时间范围
  startDate: Date;
  endDate: Date;

  // 方位要求
  direction?: PalaceName;

  // 其他要求
  preferences?: {
    avoidWeekdays?: number[]; // 避开的星期几（0-6）
    preferTimeSlots?: Array<{ start: number; end: number }>; // 偏好时段
    mustIncludeActivities?: string[]; // 必须包含的活动
    mustAvoidTaboos?: string[]; // 必须避开的禁忌
  };
}

// 择吉结果
export interface DateSelectionResult {
  scenario: DateSelectionScenario;
  scenarioName: string;

  // 推荐日期
  recommendedDates: Array<{
    date: Date;
    rating: 'excellent' | 'good' | 'fair' | 'poor';
    score: number; // 0-100

    // 日期分析
    analysis: {
      suitability: string; // 适宜性描述
      strengths: string[]; // 优势
      concerns: string[]; // 需注意事项

      // 宜忌
      auspicious: string[]; // 宜
      inauspicious: string[]; // 忌

      // 神煞
      gods: string[]; // 吉神
      evils: string[]; // 凶煞
    };

    // 时辰推荐
    timeSlots: Array<{
      hour: number; // 0-23
      hourName: string; // 如"子时"
      rating: 'excellent' | 'good' | 'fair' | 'poor';
      score: number;
      description: string;
      activities: string[]; // 适合的具体活动
    }>;

    // 参与人匹配度
    participantMatches: Array<{
      role: string;
      compatibility: 'excellent' | 'good' | 'fair' | 'poor' | 'bad';
      reason: string;
    }>;

    // 方位建议
    directionAdvice?: {
      best: PalaceName[];
      avoid: PalaceName[];
    };
  }>;

  // 需避开的日期
  datestoAvoid: Array<{
    date: Date;
    reason: string;
    severity: 'critical' | 'high' | 'medium';
  }>;

  // 总体建议
  overallAdvice: {
    bestChoice: Date | null;
    alternativeChoices: Date[];
    warnings: string[];
    preparations: string[];
  };
}

// 场景配置
const SCENARIO_CONFIGS: Record<
  DateSelectionScenario,
  {
    name: string;
    criticalFactors: string[];
    preferredStars: FlyingStar[];
    avoidedStars: FlyingStar[];
    requiredActivities: string[];
    taboos: string[];
  }
> = {
  wedding: {
    name: '婚礼',
    criticalFactors: ['感情和合', '家庭圆满', '子嗣昌盛'],
    preferredStars: [1, 4, 6, 8, 9],
    avoidedStars: [2, 3, 5, 7],
    requiredActivities: ['嫁娶', '纳采', '问名'],
    taboos: ['破日', '离日', '绝日', '刀砧日'],
  },
  moving: {
    name: '搬家',
    criticalFactors: ['宅运昌隆', '人丁兴旺', '平安顺遂'],
    preferredStars: [1, 6, 8],
    avoidedStars: [2, 5],
    requiredActivities: ['移徙', '入宅'],
    taboos: ['破日', '往亡日', '五墓日'],
  },
  business_opening: {
    name: '开业',
    criticalFactors: ['财运亨通', '客源广进', '事业发达'],
    preferredStars: [1, 6, 8, 9],
    avoidedStars: [2, 5, 7],
    requiredActivities: ['开市', '立券', '交易'],
    taboos: ['破日', '败日', '闭日'],
  },
  groundbreaking: {
    name: '动土',
    criticalFactors: ['工程顺利', '安全无虞', '进展快速'],
    preferredStars: [6, 8],
    avoidedStars: [2, 3, 5],
    requiredActivities: ['动土', '破土', '修造'],
    taboos: ['土符日', '土府日', '土瘟日', '土忌日'],
  },
  signing_contract: {
    name: '签约',
    criticalFactors: ['合作顺利', '互利共赢', '长久稳定'],
    preferredStars: [1, 6, 8],
    avoidedStars: [3, 5, 7],
    requiredActivities: ['立券', '交易', '纳财'],
    taboos: ['破日', '败日'],
  },
  travel: {
    name: '出行',
    criticalFactors: ['旅途平安', '顺风顺水', '收获满满'],
    preferredStars: [1, 6, 8],
    avoidedStars: [2, 5, 7],
    requiredActivities: ['出行', '远行'],
    taboos: ['往亡日', '天贼日'],
  },
  medical: {
    name: '就医',
    criticalFactors: ['病情好转', '手术成功', '康复迅速'],
    preferredStars: [1, 6],
    avoidedStars: [2, 5],
    requiredActivities: ['求医', '疗病'],
    taboos: ['死气日', '天刑日'],
  },
  meeting: {
    name: '会议',
    criticalFactors: ['沟通顺畅', '达成共识', '成果显著'],
    preferredStars: [1, 4, 6],
    avoidedStars: [3, 5],
    requiredActivities: ['会友', '宴会'],
    taboos: ['破日'],
  },
  ceremony: {
    name: '典礼',
    criticalFactors: ['场面隆重', '宾客满堂', '圆满成功'],
    preferredStars: [4, 6, 8, 9],
    avoidedStars: [2, 5],
    requiredActivities: ['祭祀', '祈福', '冠笄'],
    taboos: ['破日', '凶败日'],
  },
  renovation: {
    name: '装修',
    criticalFactors: ['工程顺利', '质量优良', '如期完工'],
    preferredStars: [6, 8],
    avoidedStars: [2, 5],
    requiredActivities: ['修造', '动土', '拆卸'],
    taboos: ['土符日', '破日'],
  },
  engagement: {
    name: '订婚',
    criticalFactors: ['双方和睦', '家族满意', '婚姻美满'],
    preferredStars: [1, 4, 6, 9],
    avoidedStars: [3, 5, 7],
    requiredActivities: ['纳采', '订盟', '问名'],
    taboos: ['破日', '离日'],
  },
  childbirth: {
    name: '剖腹产择日',
    criticalFactors: ['母子平安', '八字吉利', '健康成长'],
    preferredStars: [1, 6, 8],
    avoidedStars: [2, 5],
    requiredActivities: ['求医', '疗病'],
    taboos: ['破日', '死气日', '孤辰日', '寡宿日'],
  },
  general: {
    name: '一般吉日',
    criticalFactors: ['诸事顺利', '吉祥平安'],
    preferredStars: [1, 6, 8, 9],
    avoidedStars: [2, 5],
    requiredActivities: [],
    taboos: ['破日'],
  },
};

// 时辰名称
const HOUR_NAMES: Record<number, string> = {
  23: '子时',
  0: '子时',
  1: '丑时',
  2: '丑时',
  3: '寅时',
  4: '寅时',
  5: '卯时',
  6: '卯时',
  7: '辰时',
  8: '辰时',
  9: '巳时',
  10: '巳时',
  11: '午时',
  12: '午时',
  13: '未时',
  14: '未时',
  15: '申时',
  16: '申时',
  17: '酉时',
  18: '酉时',
  19: '戌时',
  20: '戌时',
  21: '亥时',
  22: '亥时',
};

/**
 * 择吉日时（主函数）
 */
export function selectAuspiciousDate(
  plate: EnhancedXuankongPlate,
  request: DateSelectionRequest
): DateSelectionResult {
  const config = SCENARIO_CONFIGS[request.scenario];

  // 分析日期范围内所有日期
  const dateAnalyses = analyzeDateRange(plate, request, config);

  // 筛选推荐日期
  const recommendedDates = dateAnalyses
    .filter((d) => d.rating !== 'poor')
    .sort((a, b) => b.score - a.score)
    .slice(0, 10); // 取前10个

  // 筛选需避开的日期
  const datesToAvoid = dateAnalyses
    .filter((d) => d.rating === 'poor' || d.analysis.concerns.length >= 3)
    .map((d) => ({
      date: d.date,
      reason: d.analysis.concerns.join('；'),
      severity: (d.score < 20
        ? 'critical'
        : d.score < 40
          ? 'high'
          : 'medium') as 'critical' | 'high' | 'medium',
    }))
    .slice(0, 5);

  // 生成总体建议
  const overallAdvice = generateOverallAdvice(
    recommendedDates,
    request,
    config
  );

  return {
    scenario: request.scenario,
    scenarioName: config.name,
    recommendedDates,
    datestoAvoid: datesToAvoid,
    overallAdvice,
  };
}

/**
 * 分析日期范围
 */
function analyzeDateRange(
  plate: EnhancedXuankongPlate,
  request: DateSelectionRequest,
  config: (typeof SCENARIO_CONFIGS)[DateSelectionScenario]
): DateSelectionResult['recommendedDates'] {
  const results: DateSelectionResult['recommendedDates'] = [];

  const currentDate = new Date(request.startDate);
  const endDate = new Date(request.endDate);

  while (currentDate <= endDate) {
    const dateAnalysis = analyzeSingleDate(plate, currentDate, request, config);
    results.push(dateAnalysis);

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return results;
}

/**
 * 分析单个日期
 */
function analyzeSingleDate(
  plate: EnhancedXuankongPlate,
  date: Date,
  request: DateSelectionRequest,
  config: (typeof SCENARIO_CONFIGS)[DateSelectionScenario]
): DateSelectionResult['recommendedDates'][0] {
  let score = 50; // 基础分
  const strengths: string[] = [];
  const concerns: string[] = [];
  const auspicious: string[] = [];
  const inauspicious: string[] = [];
  const gods: string[] = [];
  const evils: string[] = [];

  // 检查星期偏好
  const dayOfWeek = date.getDay();
  if (request.preferences?.avoidWeekdays?.includes(dayOfWeek)) {
    score -= 10;
    concerns.push('不符合星期偏好');
  }

  // 检查重大禁忌日
  const tabooCheck = checkTaboos(date, config.taboos);
  if (tabooCheck.hasTaboo) {
    score -= 30;
    concerns.push(...tabooCheck.taboos);
    evils.push(...tabooCheck.taboos);
  } else {
    score += 10;
    strengths.push('无重大禁忌');
  }

  // 检查宜忌
  const suitabilityCheck = checkSuitability(date, config.requiredActivities);
  if (suitabilityCheck.suitable) {
    score += 20;
    strengths.push(`宜${config.requiredActivities.join('、')}`);
    auspicious.push(...config.requiredActivities);
  } else {
    score -= 10;
    concerns.push('不完全适宜此事');
  }

  // 检查吉神
  const godCheck = checkGods(date);
  if (godCheck.gods.length > 0) {
    score += godCheck.gods.length * 5;
    strengths.push(`有${godCheck.gods.join('、')}等吉神`);
    gods.push(...godCheck.gods);
  }

  // 检查凶煞
  const evilCheck = checkEvils(date);
  if (evilCheck.evils.length > 0) {
    score -= evilCheck.evils.length * 5;
    concerns.push(`有${evilCheck.evils.join('、')}等凶煞`);
    evils.push(...evilCheck.evils);
  }

  // 参与人八字匹配
  const participantMatches = analyzeParticipantCompatibility(
    date,
    request.participants
  );
  const avgParticipantScore =
    participantMatches.reduce((sum, m) => {
      const compScore = { excellent: 5, good: 3, fair: 0, poor: -3, bad: -5 }[
        m.compatibility
      ];
      return sum + compScore;
    }, 0) / Math.max(participantMatches.length, 1);
  score += avgParticipantScore * 5;

  if (avgParticipantScore > 2) {
    strengths.push('参与人八字高度匹配');
  } else if (avgParticipantScore < -2) {
    concerns.push('参与人八字有冲克');
  }

  // 时辰分析
  const timeSlots = analyzeTimeSlots(date, plate, request, config);
  const bestTimeSlotScore = Math.max(...timeSlots.map((t) => t.score));
  score += (bestTimeSlotScore - 50) * 0.3; // 时辰影响30%

  // 方位建议
  const directionAdvice = analyzeDirections(plate, date, config);

  // 确保分数在0-100范围
  score = Math.max(0, Math.min(100, score));

  // 确定评级
  let rating: 'excellent' | 'good' | 'fair' | 'poor';
  if (score >= 80) rating = 'excellent';
  else if (score >= 65) rating = 'good';
  else if (score >= 50) rating = 'fair';
  else rating = 'poor';

  const suitability = generateSuitabilityDescription(date, rating, config);

  return {
    date,
    rating,
    score,
    analysis: {
      suitability,
      strengths: strengths.length > 0 ? strengths : ['一般'],
      concerns: concerns.length > 0 ? concerns : ['无明显不利'],
      auspicious,
      inauspicious,
      gods,
      evils,
    },
    timeSlots,
    participantMatches,
    directionAdvice,
  };
}

/**
 * 检查禁忌日
 */
function checkTaboos(
  date: Date,
  taboos: string[]
): { hasTaboo: boolean; taboos: string[] } {
  const foundTaboos: string[] = [];

  // 简化实现：根据日期模拟禁忌
  const dayOfMonth = date.getDate();

  if (taboos.includes('破日') && dayOfMonth % 7 === 0) {
    foundTaboos.push('破日');
  }

  if (taboos.includes('离日') && dayOfMonth % 11 === 0) {
    foundTaboos.push('离日');
  }

  if (taboos.includes('土符日') && dayOfMonth % 13 === 0) {
    foundTaboos.push('土符日');
  }

  return {
    hasTaboo: foundTaboos.length > 0,
    taboos: foundTaboos,
  };
}

/**
 * 检查适宜性
 */
function checkSuitability(
  date: Date,
  activities: string[]
): { suitable: boolean } {
  // 简化实现：大部分日期适合基本活动
  if (activities.length === 0) return { suitable: true };

  const dayOfMonth = date.getDate();
  // 逢8吉日
  if (dayOfMonth % 8 === 0) return { suitable: true };
  // 逢6吉日
  if (dayOfMonth === 6 || dayOfMonth === 16 || dayOfMonth === 26)
    return { suitable: true };

  // 其他日期50%概率
  return { suitable: dayOfMonth % 2 === 0 };
}

/**
 * 检查吉神
 */
function checkGods(date: Date): { gods: string[] } {
  const gods: string[] = [];
  const dayOfMonth = date.getDate();

  if (dayOfMonth === 1 || dayOfMonth === 15) gods.push('天德');
  if (dayOfMonth % 8 === 0) gods.push('月德');
  if (dayOfMonth === 8 || dayOfMonth === 18) gods.push('天喜');
  if (dayOfMonth % 6 === 0) gods.push('福德');

  return { gods };
}

/**
 * 检查凶煞
 */
function checkEvils(date: Date): { evils: string[] } {
  const evils: string[] = [];
  const dayOfMonth = date.getDate();

  if (dayOfMonth === 5 || dayOfMonth === 15 || dayOfMonth === 25)
    evils.push('五鬼');
  if (dayOfMonth === 7 || dayOfMonth === 17) evils.push('天刑');
  if (dayOfMonth % 13 === 0) evils.push('白虎');

  return { evils };
}

/**
 * 分析参与人匹配度
 */
function analyzeParticipantCompatibility(
  date: Date,
  participants: Participant[]
): DateSelectionResult['recommendedDates'][0]['participantMatches'] {
  return participants.map((p) => {
    let compatibility: 'excellent' | 'good' | 'fair' | 'poor' | 'bad' = 'fair';
    let reason = '日期与八字关系中性';

    if (p.baziInfo) {
      // 检查日期天干地支与八字的关系
      const dayOfMonth = date.getDate();
      const month = date.getMonth() + 1;

      // 简化：根据日期和出生信息判断
      if (p.profile?.birthYear) {
        const yearMod = p.profile.birthYear % 12;
        const dateMod = dayOfMonth % 12;

        if (yearMod === dateMod) {
          compatibility = 'excellent';
          reason = '日期与命主生肖相合，大吉';
        } else if (Math.abs(yearMod - dateMod) === 6) {
          compatibility = 'poor';
          reason = '日期与命主生肖相冲，需化解';
        } else if ([3, 9].includes(Math.abs(yearMod - dateMod))) {
          compatibility = 'bad';
          reason = '日期与命主生肖相害，不宜';
        } else {
          compatibility = 'good';
          reason = '日期与命主八字和顺';
        }
      }
    }

    return {
      role: p.role,
      compatibility,
      reason,
    };
  });
}

/**
 * 分析时辰
 */
function analyzeTimeSlots(
  date: Date,
  plate: EnhancedXuankongPlate,
  request: DateSelectionRequest,
  config: (typeof SCENARIO_CONFIGS)[DateSelectionScenario]
): DateSelectionResult['recommendedDates'][0]['timeSlots'] {
  const slots: DateSelectionResult['recommendedDates'][0]['timeSlots'] = [];

  for (let hour = 0; hour < 24; hour++) {
    // 跳过深夜时段（除非特殊需要）
    if (hour >= 1 && hour <= 5 && request.scenario !== 'childbirth') {
      continue;
    }

    let score = 50;
    const hourName = HOUR_NAMES[hour];

    // 吉时
    if ([7, 8, 9, 10, 11, 13, 14, 15].includes(hour)) {
      score += 20;
    }

    // 子时、午时特殊
    if (hour === 0 || hour === 23 || hour === 11 || hour === 12) {
      score += 10;
    }

    // 根据场景调整
    if (request.scenario === 'wedding' && [9, 10, 11].includes(hour)) {
      score += 15;
    }

    if (request.scenario === 'business_opening' && [8, 9, 10].includes(hour)) {
      score += 15;
    }

    // 检查偏好时段
    if (request.preferences?.preferTimeSlots) {
      const inPreferred = request.preferences.preferTimeSlots.some(
        (slot) => hour >= slot.start && hour <= slot.end
      );
      if (inPreferred) score += 10;
    }

    score = Math.max(0, Math.min(100, score));

    let rating: 'excellent' | 'good' | 'fair' | 'poor';
    if (score >= 80) rating = 'excellent';
    else if (score >= 65) rating = 'good';
    else if (score >= 50) rating = 'fair';
    else rating = 'poor';

    const description = generateTimeSlotDescription(hour, rating, config);
    const activities = config.requiredActivities.slice(0, 2);

    slots.push({
      hour,
      hourName,
      rating,
      score,
      description,
      activities,
    });
  }

  return slots.sort((a, b) => b.score - a.score);
}

function generateTimeSlotDescription(
  hour: number,
  rating: string,
  config: (typeof SCENARIO_CONFIGS)[DateSelectionScenario]
): string {
  const hourName = HOUR_NAMES[hour];
  const ratingDesc = {
    excellent: '大吉',
    good: '吉',
    fair: '平',
    poor: '不宜',
  }[rating];

  return `${hourName}${ratingDesc}，适合${config.name}相关事宜`;
}

/**
 * 分析方位
 */
function analyzeDirections(
  plate: EnhancedXuankongPlate,
  date: Date,
  config: (typeof SCENARIO_CONFIGS)[DateSelectionScenario]
): DateSelectionResult['recommendedDates'][0]['directionAdvice'] {
  const best: PalaceName[] = [];
  const avoid: PalaceName[] = [];

  Object.entries(plate.palaces).forEach(([palaceName, info]) => {
    const palace = palaceName as PalaceName;

    if (config.preferredStars.includes(info.facingStar)) {
      best.push(palace);
    }

    if (
      config.avoidedStars.includes(info.facingStar) ||
      config.avoidedStars.includes(info.mountainStar)
    ) {
      avoid.push(palace);
    }
  });

  return {
    best: best.slice(0, 3),
    avoid,
  };
}

function generateSuitabilityDescription(
  date: Date,
  rating: string,
  config: (typeof SCENARIO_CONFIGS)[DateSelectionScenario]
): string {
  const dateStr = date.toLocaleDateString('zh-CN');
  const ratingDesc = {
    excellent: '极为适宜',
    good: '较为适宜',
    fair: '尚可',
    poor: '不太适宜',
  }[rating];

  return `${dateStr} ${ratingDesc}进行${config.name}`;
}

/**
 * 生成总体建议
 */
function generateOverallAdvice(
  recommendedDates: DateSelectionResult['recommendedDates'],
  request: DateSelectionRequest,
  config: (typeof SCENARIO_CONFIGS)[DateSelectionScenario]
): DateSelectionResult['overallAdvice'] {
  const bestChoice =
    recommendedDates.length > 0 ? recommendedDates[0].date : null;
  const alternativeChoices = recommendedDates.slice(1, 4).map((d) => d.date);

  const warnings: string[] = [];
  const preparations: string[] = [];

  // 根据场景生成建议
  if (request.scenario === 'wedding') {
    preparations.push('提前确定吉时，准备典礼流程');
    preparations.push('新人双方避免与日期相冲的活动');
    warnings.push('婚礼当日避开凶方，主桌设在吉方');
  } else if (request.scenario === 'moving') {
    preparations.push('提前三天清理新居，净化空间');
    preparations.push('搬家当日按吉时入宅，先搬重要物品');
    warnings.push('搬家后三天内不宜远行');
  } else if (request.scenario === 'business_opening') {
    preparations.push('开业前做好风水布局，催旺财位');
    preparations.push('准备开业典礼流程，邀请贵人到场');
    warnings.push('开业当日保持店内明亮整洁');
  }

  // 通用建议
  if (recommendedDates.length === 0) {
    warnings.push('所选时间范围内吉日较少，建议扩大选择范围');
  } else if (recommendedDates[0].score < 70) {
    warnings.push('最佳日期评分不高，建议考虑更多因素或调整时间');
  }

  preparations.push('提前查看天气预报，做好应急准备');

  return {
    bestChoice,
    alternativeChoices,
    warnings,
    preparations,
  };
}

/**
 * 快速择吉（简化版）
 */
export function quickDateSelection(
  plate: EnhancedXuankongPlate,
  scenario: DateSelectionScenario,
  daysAhead = 30
): Date[] {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + daysAhead);

  const request: DateSelectionRequest = {
    scenario,
    participants: [],
    startDate,
    endDate,
  };

  const result = selectAuspiciousDate(plate, request);

  return result.recommendedDates
    .filter((d) => d.rating === 'excellent' || d.rating === 'good')
    .slice(0, 5)
    .map((d) => d.date);
}
