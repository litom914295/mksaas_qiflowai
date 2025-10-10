/**
 * 三维时空分析引擎
 *
 * 整合空间（道路、建筑、室内布局）和时间（流日、流年）两个维度
 * 提供全方位的风水分析和建议
 *
 * @author QiFlow AI Team
 * @version 1.0.0
 */

import type { Element } from '../fengshui/personalized-engine';
import type { FlyingStar, PalaceIndex } from '../xuankong/types';

// ==================== 类型定义 ====================

/**
 * 道路方向类型
 */
export type RoadDirection =
  | 'north'
  | 'south'
  | 'east'
  | 'west'
  | 'northeast'
  | 'northwest'
  | 'southeast'
  | 'southwest';

/**
 * 道路类型
 */
export type RoadType = 'main' | 'secondary' | 'alley' | 'highway';

/**
 * 道路信息
 */
export interface RoadInfo {
  direction: RoadDirection;
  type: RoadType;
  width?: number; // 米
  distance?: number; // 距离房屋的距离（米）
  traffic?: 'heavy' | 'medium' | 'light';
}

/**
 * 建筑类型
 */
export type BuildingType =
  | 'residential' // 住宅
  | 'commercial' // 商业
  | 'industrial' // 工业
  | 'public' // 公共设施
  | 'religious' // 宗教场所
  | 'medical' // 医疗
  | 'educational' // 教育
  | 'entertainment'; // 娱乐

/**
 * 周边建筑信息
 */
export interface SurroundingBuilding {
  direction: RoadDirection;
  type: BuildingType;
  height?: number; // 层数
  distance?: number; // 距离（米）
  description?: string;
}

/**
 * 家具类型
 */
export type FurnitureType =
  | 'bed' // 床
  | 'desk' // 书桌
  | 'sofa' // 沙发
  | 'dining_table' // 餐桌
  | 'wardrobe' // 衣柜
  | 'bookshelf' // 书架
  | 'tv_stand' // 电视柜
  | 'plant'; // 植物

/**
 * 家具摆放信息
 */
export interface FurniturePlacement {
  type: FurnitureType;
  palace: PalaceIndex;
  direction?: RoadDirection; // 朝向
  material?: string;
  color?: string;
}

/**
 * 装修色调
 */
export interface ColorScheme {
  primary: string; // 主色调
  secondary: string; // 辅助色
  accent: string; // 点缀色
  element?: Element; // 对应五行
}

/**
 * 流日信息
 */
export interface DailyInfo {
  year: number;
  month: number;
  day: number;
  dayOfWeek: number; // 0-6 (周日-周六)
  lunarDay?: string; // 农历
  solarTerms?: string; // 节气
}

// ==================== 道路走向分析 ====================

/**
 * 分析道路走向对风水的影响
 */
export function analyzeRoadDirection(
  roads: RoadInfo[],
  houseFacing: number
): {
  overall: 'excellent' | 'good' | 'fair' | 'poor';
  score: number;
  impacts: Array<{
    road: RoadInfo;
    impact: 'positive' | 'neutral' | 'negative';
    reason: string;
    suggestions: string[];
  }>;
  summary: string;
} {
  let totalScore = 0;
  const impacts = [];

  for (const road of roads) {
    let impact: 'positive' | 'neutral' | 'negative' = 'neutral';
    let score = 50;
    const reasons: string[] = [];
    const suggestions: string[] = [];

    // 1. 分析道路方向与房屋朝向的关系
    if (isAuspiciousDirection(road.direction, houseFacing)) {
      impact = 'positive';
      score += 20;
      reasons.push('道路方向与房屋朝向形成吉利格局');
    } else if (isInauspiciousDirection(road.direction, houseFacing)) {
      impact = 'negative';
      score -= 20;
      reasons.push('道路方向形成冲煞格局');
      suggestions.push('建议在此方向设置屏风或绿植化解');
    }

    // 2. 分析道路类型影响
    if (road.type === 'highway' && road.distance && road.distance < 100) {
      impact = 'negative';
      score -= 15;
      reasons.push('高速公路过近，气场不稳');
      suggestions.push('使用厚重窗帘减少影响');
      suggestions.push('在该方向放置镇宅物品');
    } else if (
      road.type === 'alley' &&
      road.direction === getRearDirection(houseFacing)
    ) {
      impact = 'positive';
      score += 10;
      reasons.push('后有小巷，符合"玄武有靠"格局');
    }

    // 3. 分析道路宽度
    if (road.width) {
      if (road.width > 30) {
        score -= 10;
        reasons.push('道路过宽，气场散失');
        suggestions.push('适当增加前方的遮挡物');
      } else if (road.width < 3) {
        score -= 5;
        reasons.push('道路过窄，气流受阻');
      }
    }

    // 4. 分析交通流量
    if (road.traffic === 'heavy') {
      score -= 10;
      reasons.push('交通繁忙，噪音和污染影响气场');
      suggestions.push('加强隔音措施');
      suggestions.push('使用空气净化设备');
    }

    // 综合评分
    score = Math.max(0, Math.min(100, score));
    totalScore += score;

    impacts.push({
      road,
      impact,
      reason: reasons.join('；'),
      suggestions,
    });
  }

  // 计算平均分
  const avgScore = roads.length > 0 ? totalScore / roads.length : 50;

  return {
    overall:
      avgScore >= 80
        ? 'excellent'
        : avgScore >= 65
          ? 'good'
          : avgScore >= 50
            ? 'fair'
            : 'poor',
    score: avgScore,
    impacts,
    summary: generateRoadSummary(avgScore, impacts.length),
  };
}

/**
 * 判断是否为吉利方向
 */
function isAuspiciousDirection(
  roadDir: RoadDirection,
  houseFacing: number
): boolean {
  // 简化逻辑：前方有路为吉
  const facing = degreesToDirection(houseFacing);
  return (
    roadDir === facing ||
    roadDir === getLeftDirection(houseFacing) ||
    roadDir === getRightDirection(houseFacing)
  );
}

/**
 * 判断是否为不利方向
 */
function isInauspiciousDirection(
  roadDir: RoadDirection,
  houseFacing: number
): boolean {
  // 简化逻辑：后方冲路为凶
  return roadDir === getRearDirection(houseFacing);
}

// ==================== 周边建筑分析 ====================

/**
 * 分析周边建筑对风水的影响
 */
export function analyzeSurroundingBuildings(
  buildings: SurroundingBuilding[],
  houseFacing: number
): {
  overall: 'excellent' | 'good' | 'fair' | 'poor';
  score: number;
  impacts: Array<{
    building: SurroundingBuilding;
    impact: 'positive' | 'neutral' | 'negative';
    reason: string;
    suggestions: string[];
  }>;
  summary: string;
} {
  let totalScore = 0;
  const impacts = [];

  for (const building of buildings) {
    let impact: 'positive' | 'neutral' | 'negative' = 'neutral';
    let score = 50;
    const reasons: string[] = [];
    const suggestions: string[] = [];

    // 1. 分析建筑类型影响
    switch (building.type) {
      case 'medical':
        if (building.distance && building.distance < 200) {
          impact = 'negative';
          score -= 20;
          reasons.push('医院阴气较重，影响居住气场');
          suggestions.push('在该方向设置明亮灯光');
          suggestions.push('摆放阳性植物如仙人掌');
        }
        break;
      case 'religious':
        impact = 'positive';
        score += 10;
        reasons.push('宗教场所附近，气场祥和');
        break;
      case 'educational':
        impact = 'positive';
        score += 15;
        reasons.push('学校附近，文昌气旺，利于学业');
        break;
      case 'industrial':
        impact = 'negative';
        score -= 15;
        reasons.push('工业区污染和噪音影响');
        suggestions.push('加强空气净化和隔音');
        break;
      case 'commercial':
        if (building.distance && building.distance < 50) {
          score -= 10;
          reasons.push('商业区过近，人流杂乱');
        } else {
          score += 5;
          reasons.push('商业区适当距离，生气旺盛');
        }
        break;
    }

    // 2. 分析建筑高度
    if (building.height) {
      if (
        building.height > 20 &&
        building.distance &&
        building.distance < building.height * 2
      ) {
        impact = 'negative';
        score -= 15;
        reasons.push('高楼过近，形成压迫感');
        suggestions.push('调整室内布局，避开该方向主要活动区');
      }
    }

    // 3. 分析建筑方位
    const facing = degreesToDirection(houseFacing);
    if (building.direction === facing) {
      if (building.type === 'public' || building.type === 'educational') {
        score += 10;
        reasons.push('前方有公共设施，明堂开阔');
      }
    }

    // 综合评分
    score = Math.max(0, Math.min(100, score));
    totalScore += score;

    impacts.push({
      building,
      impact,
      reason: reasons.join('；'),
      suggestions,
    });
  }

  const avgScore = buildings.length > 0 ? totalScore / buildings.length : 50;

  return {
    overall:
      avgScore >= 80
        ? 'excellent'
        : avgScore >= 65
          ? 'good'
          : avgScore >= 50
            ? 'fair'
            : 'poor',
    score: avgScore,
    impacts,
    summary: generateBuildingSummary(avgScore, impacts.length),
  };
}

// ==================== 家具摆放建议 ====================

/**
 * 生成家具摆放建议
 */
export function generateFurniturePlacement(
  roomType: 'bedroom' | 'living' | 'study' | 'dining',
  palace: PalaceIndex,
  star: FlyingStar,
  userElement?: Element
): {
  suggestions: Array<{
    furniture: FurnitureType;
    position: string;
    direction?: RoadDirection;
    reason: string;
    alternatives?: string[];
  }>;
  avoid: string[];
  enhance: string[];
} {
  const suggestions = [];
  const avoid = [];
  const enhance = [];

  // 根据房间类型给出基础建议
  switch (roomType) {
    case 'bedroom':
      suggestions.push({
        furniture: 'bed',
        position: '靠墙摆放',
        direction: getBestBedDirection(star, userElement),
        reason: '床头靠墙，符合"有靠山"原则',
        alternatives: ['避免床头对门', '避免床头对窗'],
      });

      suggestions.push({
        furniture: 'wardrobe',
        position: '床的左侧或右侧',
        reason: '衣柜宜在床侧，不宜正对床',
      });

      avoid.push('镜子不可正对床');
      avoid.push('床下不宜堆放杂物');
      enhance.push('床头可放置护身符或吉祥物');
      break;

    case 'study':
      suggestions.push({
        furniture: 'desk',
        position: '背靠墙壁，面向门窗',
        direction: 'north',
        reason: '书桌背后有靠，利于学习和工作',
      });

      suggestions.push({
        furniture: 'bookshelf',
        position: '书桌两侧或身后',
        reason: '书架在侧或后，不宜在正前方遮挡视线',
      });

      suggestions.push({
        furniture: 'plant',
        position: '书桌左前方',
        reason: '左青龙位放置绿植，助旺文昌',
      });

      avoid.push('书桌不宜背门而坐');
      avoid.push('避免横梁压顶');
      enhance.push('可在文昌位摆放文昌塔或毛笔');
      break;

    case 'living':
      suggestions.push({
        furniture: 'sofa',
        position: '背靠实墙',
        reason: '沙发有靠，家运稳固',
      });

      suggestions.push({
        furniture: 'tv_stand',
        position: '沙发对面',
        reason: '电视柜与沙发相对，保持合理距离',
      });

      avoid.push('沙发不宜背靠窗户');
      avoid.push('避免沙发与门直冲');
      enhance.push('客厅明堂宜开阔，保持整洁');
      break;

    case 'dining':
      suggestions.push({
        furniture: 'dining_table',
        position: '房间中心位置',
        reason: '餐桌居中，利于聚气',
      });

      avoid.push('餐桌不宜正对厕所门');
      avoid.push('餐桌上方避免横梁');
      enhance.push('可在餐厅摆放水果或鲜花');
      break;
  }

  // 根据飞星调整建议
  if (star.facing === 5 || star.mountain === 5) {
    // 五黄煞
    avoid.push('该宫位不宜摆放过多家具');
    enhance.push('使用金属制品或白色物品化解五黄');
  }

  if (star.facing === 8 || star.mountain === 8) {
    // 当运星
    enhance.push('该位置可摆放重要家具，利于运势');
  }

  return {
    suggestions,
    avoid,
    enhance,
  };
}

/**
 * 获取最佳床头方向
 */
function getBestBedDirection(
  star: FlyingStar,
  userElement?: Element
): RoadDirection {
  // 简化逻辑：根据飞星和个人五行确定
  if (userElement === 'wood') return 'east';
  if (userElement === 'fire') return 'south';
  if (userElement === 'earth') return 'southwest';
  if (userElement === 'metal') return 'west';
  if (userElement === 'water') return 'north';

  // 默认根据飞星
  if (star.facing >= 6) return 'north';
  return 'south';
}

// ==================== 装修色调推荐 ====================

/**
 * 推荐装修色调
 */
export function recommendColorScheme(
  roomType: 'bedroom' | 'living' | 'study' | 'dining' | 'kitchen',
  palace: PalaceIndex,
  star: FlyingStar,
  userElement?: Element
): {
  recommended: ColorScheme[];
  avoid: string[];
  reasons: string[];
} {
  const recommended: ColorScheme[] = [];
  const avoid: string[] = [];
  const reasons: string[] = [];

  // 根据五行确定主色调
  const palaceElement = getPalaceElement(palace);

  // 根据用户五行调整
  if (userElement) {
    if (isElementHarmony(userElement, palaceElement)) {
      reasons.push(
        `您的五行${userElement}与该宫位五行${palaceElement}相生，建议使用协调色系`
      );
      recommended.push(...getHarmoniousColors(userElement));
    } else {
      reasons.push('需要调和五行关系，建议使用中和色调');
      recommended.push(...getBalancingColors(userElement, palaceElement));
    }
  }

  // 根据房间类型调整
  switch (roomType) {
    case 'bedroom':
      recommended.push({
        primary: '米色',
        secondary: '淡蓝色',
        accent: '淡粉色',
        element: 'earth',
      });
      recommended.push({
        primary: '浅灰色',
        secondary: '白色',
        accent: '薄荷绿',
        element: 'metal',
      });
      avoid.push('大红色（过于刺激）');
      avoid.push('纯黑色（过于压抑）');
      reasons.push('卧室宜使用温馨柔和的色调');
      break;

    case 'study':
      recommended.push({
        primary: '米白色',
        secondary: '浅绿色',
        accent: '原木色',
        element: 'wood',
      });
      recommended.push({
        primary: '浅蓝色',
        secondary: '白色',
        accent: '灰色',
        element: 'water',
      });
      avoid.push('过于鲜艳的颜色');
      reasons.push('书房宜使用有助于集中注意力的色调');
      break;

    case 'living':
      recommended.push({
        primary: '米黄色',
        secondary: '浅咖啡色',
        accent: '橙色',
        element: 'earth',
      });
      recommended.push({
        primary: '浅灰色',
        secondary: '白色',
        accent: '天蓝色',
        element: 'metal',
      });
      reasons.push('客厅宜使用温暖明亮的色调');
      break;

    case 'dining':
      recommended.push({
        primary: '暖黄色',
        secondary: '橙色',
        accent: '红色',
        element: 'fire',
      });
      avoid.push('冷色调（影响食欲）');
      reasons.push('餐厅宜使用促进食欲的暖色调');
      break;

    case 'kitchen':
      recommended.push({
        primary: '白色',
        secondary: '浅灰色',
        accent: '银色',
        element: 'metal',
      });
      avoid.push('深色系（不利于清洁）');
      reasons.push('厨房宜使用明亮整洁的色调');
      break;
  }

  return {
    recommended,
    avoid,
    reasons,
  };
}

// ==================== 流日分析 ====================

/**
 * 分析特定日期的吉凶
 */
export function analyzeDailyFortune(
  date: DailyInfo,
  houseFacing: number,
  userBirth: { year: number; month: number; day: number }
): {
  overall: 'excellent' | 'good' | 'fair' | 'poor';
  score: number;
  auspicious: string[];
  inauspicious: string[];
  suitable: string[];
  unsuitable: string[];
  advice: string[];
} {
  let score = 50;
  const auspicious: string[] = [];
  const inauspicious: string[] = [];
  const suitable: string[] = [];
  const unsuitable: string[] = [];
  const advice: string[] = [];

  // 1. 分析星期
  if (date.dayOfWeek === 0 || date.dayOfWeek === 6) {
    score += 5;
    auspicious.push('周末休息日，宜静养');
    suitable.push('家居整理', '休息放松');
  } else {
    suitable.push('工作学习', '商务活动');
  }

  // 2. 分析月相（简化）
  const lunarDay = date.day;
  if (lunarDay === 1 || lunarDay === 15) {
    score += 10;
    auspicious.push('朔望日，宜祈福');
    suitable.push('宗教活动', '许愿祈福');
  }

  // 3. 分析与生日的关系
  if (date.month === userBirth.month && date.day === userBirth.day) {
    score += 15;
    auspicious.push('本命日，宜庆祝');
    suitable.push('生日庆祝', '许愿');
    advice.push('今天是您的本命日，可以进行重要决策');
  }

  // 4. 五黄煞日（简化计算）
  if (isWuHuangDay(date)) {
    score -= 15;
    inauspicious.push('五黄煞日');
    unsuitable.push('动土', '搬家', '装修');
    advice.push('今日宜静不宜动，避免大型工程');
  }

  // 5. 季节分析
  const season = getSeason(date.month);
  if (season === 'spring') {
    auspicious.push('春季生机勃勃');
    suitable.push('种植绿植', '开始新计划');
  } else if (season === 'autumn') {
    auspicious.push('秋季收获时节');
    suitable.push('总结回顾', '收尾工作');
  }

  // 6. 每日宜忌（简化）
  const dayType = getDayType(date.day);
  if (dayType === 'opening') {
    score += 10;
    suitable.push('开业', '签约', '交易');
  } else if (dayType === 'closing') {
    score -= 5;
    unsuitable.push('开业', '远行');
  }

  // 综合评分
  score = Math.max(0, Math.min(100, score));

  return {
    overall:
      score >= 80
        ? 'excellent'
        : score >= 65
          ? 'good'
          : score >= 50
            ? 'fair'
            : 'poor',
    score,
    auspicious,
    inauspicious,
    suitable,
    unsuitable,
    advice,
  };
}

// ==================== 辅助函数 ====================

function degreesToDirection(degrees: number): RoadDirection {
  const normalized = ((degrees % 360) + 360) % 360;
  if (normalized >= 337.5 || normalized < 22.5) return 'north';
  if (normalized >= 22.5 && normalized < 67.5) return 'northeast';
  if (normalized >= 67.5 && normalized < 112.5) return 'east';
  if (normalized >= 112.5 && normalized < 157.5) return 'southeast';
  if (normalized >= 157.5 && normalized < 202.5) return 'south';
  if (normalized >= 202.5 && normalized < 247.5) return 'southwest';
  if (normalized >= 247.5 && normalized < 292.5) return 'west';
  return 'northwest';
}

function getRearDirection(facing: number): RoadDirection {
  return degreesToDirection(facing + 180);
}

function getLeftDirection(facing: number): RoadDirection {
  return degreesToDirection(facing - 90);
}

function getRightDirection(facing: number): RoadDirection {
  return degreesToDirection(facing + 90);
}

function generateRoadSummary(score: number, count: number): string {
  if (score >= 80) return `周边道路格局优良（共${count}条），有利于气场流通`;
  if (score >= 65) return `周边道路格局良好（共${count}条），整体影响积极`;
  if (score >= 50) return `周边道路格局一般（共${count}条），需要适当调整`;
  return `周边道路格局欠佳（共${count}条），建议采取化解措施`;
}

function generateBuildingSummary(score: number, count: number): string {
  if (score >= 80) return `周边建筑环境优秀（共${count}处），气场和谐`;
  if (score >= 65) return `周边建筑环境良好（共${count}处），整体适宜`;
  if (score >= 50) return `周边建筑环境一般（共${count}处），可以接受`;
  return `周边建筑环境较差（共${count}处），需要改善`;
}

function getPalaceElement(palace: PalaceIndex): Element {
  const elementMap: Record<PalaceIndex, Element> = {
    1: 'water',
    2: 'earth',
    3: 'wood',
    4: 'wood',
    5: 'earth',
    6: 'metal',
    7: 'metal',
    8: 'earth',
    9: 'fire',
  };
  return elementMap[palace];
}

function isElementHarmony(element1: Element, element2: Element): boolean {
  const harmony: Record<Element, Element[]> = {
    wood: ['water', 'fire'],
    fire: ['wood', 'earth'],
    earth: ['fire', 'metal'],
    metal: ['earth', 'water'],
    water: ['metal', 'wood'],
  };
  return harmony[element1]?.includes(element2) || false;
}

function getHarmoniousColors(element: Element): ColorScheme[] {
  const colors: Record<Element, ColorScheme[]> = {
    wood: [
      {
        primary: '绿色',
        secondary: '青色',
        accent: '棕色',
        element: 'wood',
      },
    ],
    fire: [
      {
        primary: '红色',
        secondary: '橙色',
        accent: '紫色',
        element: 'fire',
      },
    ],
    earth: [
      {
        primary: '黄色',
        secondary: '米色',
        accent: '咖啡色',
        element: 'earth',
      },
    ],
    metal: [
      {
        primary: '白色',
        secondary: '银色',
        accent: '金色',
        element: 'metal',
      },
    ],
    water: [
      {
        primary: '蓝色',
        secondary: '黑色',
        accent: '灰色',
        element: 'water',
      },
    ],
  };
  return colors[element] || [];
}

function getBalancingColors(
  element1: Element,
  element2: Element
): ColorScheme[] {
  return [
    {
      primary: '米白色',
      secondary: '浅灰色',
      accent: '淡蓝色',
      element: 'metal',
    },
  ];
}

function isWuHuangDay(date: DailyInfo): boolean {
  // 简化：每月的5日、14日、23日为五黄日
  return date.day % 9 === 5;
}

function getSeason(month: number): 'spring' | 'summer' | 'autumn' | 'winter' {
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

function getDayType(day: number): 'opening' | 'closing' | 'neutral' {
  if (day % 3 === 1) return 'opening';
  if (day % 3 === 0) return 'closing';
  return 'neutral';
}
