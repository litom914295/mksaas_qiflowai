import { PALACE_TO_BAGUA } from './luoshu';
import type { Mountain, PalaceIndex, Plate, Yun } from './types';

/**
 * 个性化分析模块
 *
 * 核心功能：
 * 1. 结合用户生辰八字的个性化风水分析
 * 2. 基于用户职业和生活习惯的定制建议
 * 3. 动态的运势预测和调整方案
 * 4. 智能的风水布局推荐系统
 */

// 用户个人信息接口
export interface UserProfile {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour?: number;
  gender: 'male' | 'female';
  occupation: string;
  livingHabits: {
    workFromHome: boolean;
    frequentTraveling: boolean;
    hasChildren: boolean;
    elderlyLiving: boolean;
    petsOwner: boolean;
  };
  healthConcerns?: string[];
  careerGoals?: string[];
  familyStatus: 'single' | 'married' | 'divorced' | 'widowed';
  financialGoals?: 'stability' | 'growth' | 'investment' | 'retirement';
}

// 个人命卦计算
export function calculatePersonalGua(
  birthYear: number,
  gender: 'male' | 'female'
): {
  mingGua: number;
  guaName: string;
  element: '金' | '木' | '水' | '火' | '土';
  group: '东四命' | '西四命';
  favorableDirections: string[];
  unfavorableDirections: string[];
  characteristics: string[];
} {
  // 计算命卦（简化版八宅法）
  let mingGua: number;

  if (gender === 'male') {
    mingGua = 11 - (birthYear % 9);
    if (mingGua > 9) mingGua -= 9;
    if (mingGua === 5) mingGua = 2; // 男性五为坤
  } else {
    mingGua = 4 + (birthYear % 9);
    if (mingGua > 9) mingGua -= 9;
    if (mingGua === 5) mingGua = 8; // 女性五为艮
  }

  const guaInfo = getGuaInfo(mingGua);

  return {
    mingGua,
    guaName: guaInfo.name,
    element: guaInfo.element,
    group: guaInfo.group,
    favorableDirections: guaInfo.favorableDirections,
    unfavorableDirections: guaInfo.unfavorableDirections,
    characteristics: guaInfo.characteristics,
  };
}

// 卦象信息表
function getGuaInfo(gua: number): {
  name: string;
  element: '金' | '木' | '水' | '火' | '土';
  group: '东四命' | '西四命';
  favorableDirections: string[];
  unfavorableDirections: string[];
  characteristics: string[];
} {
  const guaInfoMap: Record<number, any> = {
    1: {
      name: '坎卦',
      element: '水',
      group: '东四命',
      favorableDirections: ['北', '东', '东南', '南'],
      unfavorableDirections: ['西南', '西', '西北', '东北'],
      characteristics: ['智慧', '流动', '适应性强', '善于沟通'],
    },
    2: {
      name: '坤卦',
      element: '土',
      group: '西四命',
      favorableDirections: ['西南', '西', '西北', '东北'],
      unfavorableDirections: ['北', '东', '东南', '南'],
      characteristics: ['包容', '稳重', '务实', '善于合作'],
    },
    3: {
      name: '震卦',
      element: '木',
      group: '东四命',
      favorableDirections: ['东', '东南', '南', '北'],
      unfavorableDirections: ['西', '西北', '东北', '西南'],
      characteristics: ['积极', '进取', '创新', '领导力'],
    },
    4: {
      name: '巽卦',
      element: '木',
      group: '东四命',
      favorableDirections: ['东南', '南', '北', '东'],
      unfavorableDirections: ['西北', '东北', '西南', '西'],
      characteristics: ['温和', '细致', '善于规划', '人际关系好'],
    },
    6: {
      name: '乾卦',
      element: '金',
      group: '西四命',
      favorableDirections: ['西北', '东北', '西南', '西'],
      unfavorableDirections: ['南', '北', '东', '东南'],
      characteristics: ['权威', '决断', '目标明确', '责任感强'],
    },
    7: {
      name: '兑卦',
      element: '金',
      group: '西四命',
      favorableDirections: ['西', '西南', '西北', '东北'],
      unfavorableDirections: ['东', '东南', '南', '北'],
      characteristics: ['表达力强', '社交能力', '乐观', '善于交流'],
    },
    8: {
      name: '艮卦',
      element: '土',
      group: '西四命',
      favorableDirections: ['东北', '西', '西南', '西北'],
      unfavorableDirections: ['东南', '南', '北', '东'],
      characteristics: ['稳定', '专注', '深思熟虑', '持之以恒'],
    },
    9: {
      name: '离卦',
      element: '火',
      group: '东四命',
      favorableDirections: ['南', '北', '东', '东南'],
      unfavorableDirections: ['东北', '西南', '西', '西北'],
      characteristics: ['热情', '聪明', '有魅力', '善于表现'],
    },
  };

  return guaInfoMap[gua];
}

// 个性化飞星分析
export function personalizedFlyingStarAnalysis(
  plate: Plate,
  userProfile: UserProfile,
  zuo: Mountain,
  xiang: Mountain,
  period: Yun
): {
  personalCompatibility: {
    overall: 'excellent' | 'good' | 'fair' | 'poor';
    score: number;
    reasons: string[];
  };
  roomRecommendations: Array<{
    palace: PalaceIndex;
    bagua: string;
    suitableFor: string[];
    avoidFor: string[];
    personalizedTips: string[];
    priority: 'high' | 'medium' | 'low';
  }>;
  careerEnhancement: {
    bestWorkArea: PalaceIndex;
    studyArea: PalaceIndex;
    meetingArea: PalaceIndex;
    tips: string[];
  };
  healthAndWellness: {
    restArea: PalaceIndex;
    exerciseArea: PalaceIndex;
    meditationArea: PalaceIndex;
    healthWarnings: string[];
  };
  relationshipHarmony: {
    coupleArea: PalaceIndex;
    familyArea: PalaceIndex;
    socialArea: PalaceIndex;
    relationshipTips: string[];
  };
  wealthAndProsperity: {
    wealthCorner: PalaceIndex;
    investmentArea: PalaceIndex;
    savingsArea: PalaceIndex;
    financialAdvice: string[];
  };
} {
  const personalGua = calculatePersonalGua(
    userProfile.birthYear,
    userProfile.gender
  );

  // 计算个人兼容性
  const compatibility = calculatePersonalCompatibility(
    plate,
    personalGua,
    userProfile
  );

  // 房间功能推荐
  const roomRecommendations = generateRoomRecommendations(
    plate,
    personalGua,
    userProfile
  );

  // 事业增强建议
  const careerEnhancement = generateCareerEnhancement(
    plate,
    personalGua,
    userProfile
  );

  // 健康养生建议
  const healthAndWellness = generateHealthWellness(
    plate,
    personalGua,
    userProfile
  );

  // 感情和谐建议
  const relationshipHarmony = generateRelationshipHarmony(
    plate,
    personalGua,
    userProfile
  );

  // 财富繁荣建议
  const wealthAndProsperity = generateWealthProsperity(
    plate,
    personalGua,
    userProfile
  );

  return {
    personalCompatibility: compatibility,
    roomRecommendations,
    careerEnhancement,
    healthAndWellness,
    relationshipHarmony,
    wealthAndProsperity,
  };
}

// 计算生肖（根据出生年份）
function getChineseZodiac(birthYear: number): string {
  const zodiacs = [
    '鼠',
    '牛',
    '虎',
    '兔',
    '龙',
    '蛇',
    '马',
    '羊',
    '猴',
    '鸡',
    '狗',
    '猪',
  ];
  const baseYear = 1900; // 鼠年
  const index = (birthYear - baseYear) % 12;
  return zodiacs[index >= 0 ? index : index + 12];
}

// 计算不利元素（五行相克关系）
function getUnfavorableElements(
  element: '金' | '木' | '水' | '火' | '土'
): string[] {
  const 克制关系: { [key: string]: string[] } = {
    金: ['火', '木'], // 金克木，火克金
    木: ['金', '土'], // 木克土，金克木
    水: ['土', '火'], // 水克火，土克水
    火: ['水', '金'], // 火克金，水克火
    土: ['木', '水'], // 土克水，木克土
  };
  return 克制关系[element] || [];
}

// 计算个人兼容性
function calculatePersonalCompatibility(
  plate: Plate,
  personalGua: ReturnType<typeof calculatePersonalGua>,
  userProfile: UserProfile
): {
  overall: 'excellent' | 'good' | 'fair' | 'poor';
  score: number;
  reasons: string[];
  // 新增：八字相关信息
  zodiac?: string;
  element?: string;
  favorableElements?: string[];
  unfavorableElements?: string[];
  luckyDirections?: string[];
  favorableDirections?: string[];
  guaName?: string;
  guaGroup?: string;
} {
  let score = 0;
  const reasons: string[] = [];

  // 检查命卦与住宅的匹配度
  for (const cell of plate) {
    const bagua = PALACE_TO_BAGUA[cell.palace];
    const direction = getBaguaDirection(bagua);

    if (personalGua.favorableDirections.includes(direction)) {
      if (cell.mountainStar && cell.facingStar) {
        const cellScore = (cell.mountainStar + cell.facingStar) / 2;
        score += cellScore * 0.5;
        reasons.push(`${bagua}宫为个人吉方，飞星组合有利`);
      }
    } else if (personalGua.unfavorableDirections.includes(direction)) {
      if (cell.mountainStar === 5 || cell.facingStar === 5) {
        score -= 3;
        reasons.push(`${bagua}宫为个人凶方，且有五黄星，需要化解`);
      }
    }
  }

  // 根据职业特点调整
  if (
    userProfile.occupation.includes('创意') ||
    userProfile.occupation.includes('艺术')
  ) {
    const liGong = plate.find((cell) => cell.palace === 9);
    if (liGong && (liGong.mountainStar === 9 || liGong.facingStar === 9)) {
      score += 2;
      reasons.push('离宫九星有利于创意工作');
    }
  }

  // 根据家庭状况调整
  if (userProfile.livingHabits.hasChildren) {
    const zhenGong = plate.find((cell) => cell.palace === 3);
    if (zhenGong?.mountainStar && zhenGong.mountainStar >= 6) {
      score += 1;
      reasons.push('震宫山星旺，有利于子女成长');
    }
  }

  // 确定整体评级
  let overall: 'excellent' | 'good' | 'fair' | 'poor';
  if (score >= 8) overall = 'excellent';
  else if (score >= 5) overall = 'good';
  else if (score >= 2) overall = 'fair';
  else overall = 'poor';

  // 计算生肖（基于出生年份）
  const zodiac = getChineseZodiac(userProfile.birthYear);

  // 计算不利元素（与命卦元素相克的元素）
  const unfavorableElements = getUnfavorableElements(personalGua.element);

  return {
    overall,
    score,
    reasons,
    // 新增的八字信息
    zodiac,
    element: personalGua.element,
    favorableElements: [personalGua.element], // 喜用神为命卦元素
    unfavorableElements,
    luckyDirections: personalGua.favorableDirections,
    favorableDirections: personalGua.favorableDirections,
    guaName: personalGua.guaName,
    guaGroup: personalGua.group,
  };
}

// 生成房间功能推荐
function generateRoomRecommendations(
  plate: Plate,
  personalGua: ReturnType<typeof calculatePersonalGua>,
  userProfile: UserProfile
): Array<{
  palace: PalaceIndex;
  bagua: string;
  suitableFor: string[];
  avoidFor: string[];
  personalizedTips: string[];
  priority: 'high' | 'medium' | 'low';
}> {
  const recommendations: Array<{
    palace: PalaceIndex;
    bagua: string;
    suitableFor: string[];
    avoidFor: string[];
    personalizedTips: string[];
    priority: 'high' | 'medium' | 'low';
  }> = [];

  for (const cell of plate) {
    const bagua = PALACE_TO_BAGUA[cell.palace];
    const direction = getBaguaDirection(bagua);
    const isPersonalFavorable =
      personalGua.favorableDirections.includes(direction);

    const suitableFor: string[] = [];
    const avoidFor: string[] = [];
    const personalizedTips: string[] = [];
    let priority: 'high' | 'medium' | 'low' = 'medium';

    // 基础房间功能判断
    if (cell.mountainStar && cell.facingStar) {
      const mountainStar = cell.mountainStar;
      const facingStar = cell.facingStar;

      // 根据飞星组合推荐房间功能
      if (mountainStar >= 6 && facingStar >= 6) {
        suitableFor.push('主卧室', '书房', '客厅');
        priority = 'high';
      } else if (mountainStar === 5 || facingStar === 5) {
        avoidFor.push('主卧室', '书房');
        suitableFor.push('储物间', '卫生间');
        priority = 'low';
      }

      // 个性化建议
      if (isPersonalFavorable) {
        personalizedTips.push('此方位为您的个人吉方，适合长时间停留');
        if (userProfile.livingHabits.workFromHome) {
          suitableFor.push('家庭办公室');
        }
      } else {
        personalizedTips.push('此方位为您的个人凶方，建议短暂停留');
        avoidFor.push('长期工作区域');
      }

      // 根据用户特殊需求调整
      if (userProfile.livingHabits.hasChildren && bagua === '震') {
        suitableFor.push('儿童房', '游戏室');
        personalizedTips.push('震卦主长子，有利于孩子成长');
      }

      if (userProfile.livingHabits.elderlyLiving && bagua === '乾') {
        suitableFor.push('长辈房间');
        personalizedTips.push('乾卦主父亲，适合长辈居住');
      }
    }

    recommendations.push({
      palace: cell.palace,
      bagua,
      suitableFor,
      avoidFor,
      personalizedTips,
      priority,
    });
  }

  return recommendations;
}

// 生成事业增强建议
function generateCareerEnhancement(
  plate: Plate,
  personalGua: ReturnType<typeof calculatePersonalGua>,
  userProfile: UserProfile
): {
  bestWorkArea: PalaceIndex;
  studyArea: PalaceIndex;
  meetingArea: PalaceIndex;
  tips: string[];
} {
  let bestWorkArea: PalaceIndex = 1;
  let studyArea: PalaceIndex = 4;
  let meetingArea: PalaceIndex = 6;
  const tips: string[] = [];

  // 寻找最佳工作区域
  let bestScore = -10;
  for (const cell of plate) {
    if (cell.mountainStar && cell.facingStar) {
      const score = cell.mountainStar + cell.facingStar;
      const bagua = PALACE_TO_BAGUA[cell.palace];
      const direction = getBaguaDirection(bagua);

      let adjustedScore = score;
      if (personalGua.favorableDirections.includes(direction)) {
        adjustedScore += 3;
      }

      if (adjustedScore > bestScore) {
        bestScore = adjustedScore;
        bestWorkArea = cell.palace;
      }
    }
  }

  // 寻找最佳学习区域（文昌位）
  const wenchang = findWenchangPosition(plate);
  if (wenchang) {
    studyArea = wenchang;
    tips.push(`${PALACE_TO_BAGUA[wenchang]}宫为文昌位，最适合学习和思考`);
  }

  // 寻找最佳会议区域
  const qianGong = plate.find((cell) => cell.palace === 6);
  if (qianGong?.mountainStar && qianGong.mountainStar >= 6) {
    meetingArea = 6;
    tips.push('乾宫适合重要会议和决策');
  }

  // 根据职业特点给出建议
  if (
    userProfile.occupation.includes('销售') ||
    userProfile.occupation.includes('市场')
  ) {
    tips.push('建议在向星旺的区域进行客户沟通');
  }

  if (
    userProfile.occupation.includes('管理') ||
    userProfile.occupation.includes('领导')
  ) {
    tips.push('建议办公桌背靠山星旺的方位');
  }

  return {
    bestWorkArea,
    studyArea,
    meetingArea,
    tips,
  };
}

// 生成健康养生建议
function generateHealthWellness(
  plate: Plate,
  personalGua: ReturnType<typeof calculatePersonalGua>,
  userProfile: UserProfile
): {
  restArea: PalaceIndex;
  exerciseArea: PalaceIndex;
  meditationArea: PalaceIndex;
  healthWarnings: string[];
} {
  let restArea: PalaceIndex = 2;
  let exerciseArea: PalaceIndex = 3;
  let meditationArea: PalaceIndex = 1;
  const healthWarnings: string[] = [];

  // 寻找最佳休息区域
  const kunGong = plate.find((cell) => cell.palace === 2);
  if (kunGong?.mountainStar && kunGong.mountainStar >= 6) {
    restArea = 2;
  }

  // 寻找最佳运动区域
  const zhenGong = plate.find((cell) => cell.palace === 3);
  if (zhenGong?.facingStar && zhenGong.facingStar >= 6) {
    exerciseArea = 3;
  }

  // 寻找最佳冥想区域
  const kanGong = plate.find((cell) => cell.palace === 1);
  if (kanGong?.mountainStar && kanGong.mountainStar >= 6) {
    meditationArea = 1;
  }

  // 健康警告
  for (const cell of plate) {
    if (cell.mountainStar === 5 || cell.facingStar === 5) {
      const bagua = PALACE_TO_BAGUA[cell.palace];
      healthWarnings.push(`${bagua}宫有五黄星，注意该方位的健康影响`);
    }

    if (cell.mountainStar === 2 || cell.facingStar === 2) {
      const bagua = PALACE_TO_BAGUA[cell.palace];
      healthWarnings.push(`${bagua}宫有二黑星，注意疾病预防`);
    }
  }

  // 根据用户健康关注点给出建议
  if (userProfile.healthConcerns) {
    for (const concern of userProfile.healthConcerns) {
      if (concern.includes('心脏') || concern.includes('血压')) {
        healthWarnings.push('注意离宫（南方）的风水布局，避免过于燥热');
      }
      if (concern.includes('肾脏') || concern.includes('泌尿')) {
        healthWarnings.push('注意坎宫（北方）的风水布局，保持清洁整齐');
      }
    }
  }

  return {
    restArea,
    exerciseArea,
    meditationArea,
    healthWarnings,
  };
}

// 生成感情和谐建议
function generateRelationshipHarmony(
  plate: Plate,
  personalGua: ReturnType<typeof calculatePersonalGua>,
  userProfile: UserProfile
): {
  coupleArea: PalaceIndex;
  familyArea: PalaceIndex;
  socialArea: PalaceIndex;
  relationshipTips: string[];
} {
  let coupleArea: PalaceIndex = 2;
  let familyArea: PalaceIndex = 8;
  let socialArea: PalaceIndex = 7;
  const relationshipTips: string[] = [];

  // 夫妻关系区域（坤宫）
  const kunGong = plate.find((cell) => cell.palace === 2);
  if (kunGong) {
    coupleArea = 2;
    if (kunGong.mountainStar && kunGong.facingStar) {
      if (kunGong.mountainStar + kunGong.facingStar === 10) {
        relationshipTips.push('坤宫山向合十，有利于夫妻和谐');
      }
    }
  }

  // 家庭关系区域（艮宫）
  const genGong = plate.find((cell) => cell.palace === 8);
  if (genGong) {
    familyArea = 8;
    if (genGong.mountainStar && genGong.mountainStar >= 6) {
      relationshipTips.push('艮宫山星旺，有利于家庭稳定');
    }
  }

  // 社交关系区域（兑宫）
  const duiGong = plate.find((cell) => cell.palace === 7);
  if (duiGong) {
    socialArea = 7;
    if (duiGong.facingStar && duiGong.facingStar >= 6) {
      relationshipTips.push('兑宫向星旺，有利于社交和沟通');
    }
  }

  // 根据婚姻状况给出建议
  if (userProfile.familyStatus === 'single') {
    relationshipTips.push('建议在桃花位摆放鲜花或粉色物品以增进桃花运');
  } else if (userProfile.familyStatus === 'married') {
    relationshipTips.push('建议在夫妻宫位保持整洁，摆放成对物品');
  }

  return {
    coupleArea,
    familyArea,
    socialArea,
    relationshipTips,
  };
}

// 生成财富繁荣建议
function generateWealthProsperity(
  plate: Plate,
  personalGua: ReturnType<typeof calculatePersonalGua>,
  userProfile: UserProfile
): {
  wealthCorner: PalaceIndex;
  investmentArea: PalaceIndex;
  savingsArea: PalaceIndex;
  financialAdvice: string[];
} {
  let wealthCorner: PalaceIndex = 4;
  let investmentArea: PalaceIndex = 9;
  let savingsArea: PalaceIndex = 8;
  const financialAdvice: string[] = [];

  // 寻找财位
  const caiwei = findCaiweiPosition(plate);
  if (caiwei) {
    wealthCorner = caiwei;
    financialAdvice.push(
      `${PALACE_TO_BAGUA[caiwei]}宫为财位，建议摆放招财物品`
    );
  }

  // 投资区域（离宫）
  const liGong = plate.find((cell) => cell.palace === 9);
  if (liGong?.facingStar && liGong.facingStar >= 6) {
    investmentArea = 9;
    financialAdvice.push('离宫向星旺，适合进行投资决策');
  }

  // 储蓄区域（艮宫）
  const genGong = plate.find((cell) => cell.palace === 8);
  if (genGong?.mountainStar && genGong.mountainStar >= 6) {
    savingsArea = 8;
    financialAdvice.push('艮宫山星旺，有利于财富积累');
  }

  // 根据财务目标给出建议
  if (userProfile.financialGoals === 'growth') {
    financialAdvice.push('建议在向星旺的区域进行财务规划');
  } else if (userProfile.financialGoals === 'stability') {
    financialAdvice.push('建议在山星旺的区域保管重要财务文件');
  }

  return {
    wealthCorner,
    investmentArea,
    savingsArea,
    financialAdvice,
  };
}

// 辅助函数：获取八卦对应方向
function getBaguaDirection(bagua: string): string {
  const directionMap: Record<string, string> = {
    坎: '北',
    坤: '西南',
    震: '东',
    巽: '东南',
    中: '中',
    乾: '西北',
    兑: '西',
    艮: '东北',
    离: '南',
  };
  return directionMap[bagua] || '';
}

// 辅助函数：寻找文昌位
function findWenchangPosition(plate: Plate): PalaceIndex | null {
  // 简化的文昌位查找（实际需要更复杂的算法）
  for (const cell of plate) {
    if (
      cell.mountainStar === 1 ||
      cell.facingStar === 1 ||
      cell.mountainStar === 4 ||
      cell.facingStar === 4
    ) {
      return cell.palace;
    }
  }
  return null;
}

// 辅助函数：寻找财位
function findCaiweiPosition(plate: Plate): PalaceIndex | null {
  // 简化的财位查找（实际需要更复杂的算法）
  for (const cell of plate) {
    if (cell.facingStar === 8 || cell.facingStar === 9) {
      return cell.palace;
    }
  }
  return null;
}

export default {
  calculatePersonalGua,
  personalizedFlyingStarAnalysis,
};
