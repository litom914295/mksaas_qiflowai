/**
 * 行动模板库：用神 → 具体可执行行动
 *
 * 功能：根据用神、调候、格局强度生成三级行动方案
 * - 必做项（essential）：1-3项，1-2周见效，高影响+低成本
 * - 推荐项（recommended）：3-5项，1-2月见效，中影响+中成本
 * - 加分项（optional）：5-10项，3-6月见效，长期收益
 *
 * 核心原则：
 * 1. 具体可执行（避免"多运动"等抽象建议）
 * 2. 时效明确（1-2周/1-2月/3-6月）
 * 3. 预期量化（"精力提升15-20%"而非"变得更好"）
 * 4. 成本友好（优先低成本/零成本方案）
 */

import type { ActionItem } from '@/types/report-v2.2';

// ===== 类型定义 =====

/**
 * 用神五行
 */
export type UsefulElement = '木' | '火' | '土' | '金' | '水';

/**
 * 行动优先级
 */
export type ActionPriority = 'essential' | 'recommended' | 'optional';

/**
 * 行动模板
 */
export interface ActionTemplate {
  id: string;
  title: string;
  reason: string;
  expectedImpact: string;
  expectedTimeframe: string;
  relatedElements: string[];
  relatedGods?: string[];
  checklist: string[];
  priority: ActionPriority;
  cost: 'zero' | 'low' | 'medium' | 'high'; // 成本标记
  difficulty: 'easy' | 'medium' | 'hard'; // 执行难度
}

// ===== 用神：木 =====

export const actionsForWood: ActionTemplate[] = [
  // 必做项（1-3项）
  {
    id: 'wood-essential-1',
    title: '每天早晨6-7点晨跑或快走30分钟（补木火）',
    reason: '您的用神为木，早晨（卯时5-7点）木气最旺，配合运动助阳气',
    expectedImpact: '1-2周内精力提升15-20%，肝气疏泄更顺畅',
    expectedTimeframe: '1-2周',
    relatedElements: ['木', '火'],
    relatedGods: ['食神', '比劫'],
    checklist: [
      '选择公园/绿地（树木多的地方）',
      '穿绿色或青色运动服',
      '坚持打卡记录（建议使用运动APP）',
    ],
    priority: 'essential',
    cost: 'zero',
    difficulty: 'easy',
  },
  {
    id: 'wood-essential-2',
    title: '在工作区域摆放绿植（如绿萝、富贵竹）',
    reason: '木主生发，绿植可增强木气，改善工作环境气场',
    expectedImpact: '1周内工作注意力提升10-15%，情绪更稳定',
    expectedTimeframe: '1周',
    relatedElements: ['木'],
    relatedGods: ['印星'],
    checklist: [
      '选择生命力强的绿植（如绿萝）',
      '摆放在办公桌左侧（青龙位）',
      '每3天浇水一次，保持生机',
    ],
    priority: 'essential',
    cost: 'low',
    difficulty: 'easy',
  },
  // 推荐项（3-5项）
  {
    id: 'wood-recommended-1',
    title: '调整饮食：增加绿色蔬菜（菠菜、西兰花、青菜）',
    reason: '绿色入肝，肝属木，通过饮食调理增强木气',
    expectedImpact: '1个月内肝功能改善，消化系统更健康',
    expectedTimeframe: '1-2月',
    relatedElements: ['木'],
    relatedGods: ['食神'],
    checklist: [
      '每餐至少一份绿色蔬菜',
      '减少油腻食物（肝负担重）',
      '可配合酸味食物（醋、柠檬）养肝',
    ],
    priority: 'recommended',
    cost: 'low',
    difficulty: 'easy',
  },
  {
    id: 'wood-recommended-2',
    title: '培养创意型爱好（绘画/写作/音乐）',
    reason: '木主疏泄，创意活动可疏通肝气，缓解压力',
    expectedImpact: '1-2月内压力感降低20-30%，睡眠质量改善',
    expectedTimeframe: '1-2月',
    relatedElements: ['木', '火'],
    relatedGods: ['食神', '伤官'],
    checklist: [
      '每周至少2次创意活动（30分钟/次）',
      '选择感兴趣的领域（降低坚持难度）',
      '记录进步过程（增强成就感）',
    ],
    priority: 'recommended',
    cost: 'low',
    difficulty: 'medium',
  },
  {
    id: 'wood-recommended-3',
    title: '调整作息：23点前睡觉，养肝血',
    reason: '肝主藏血，23-1点（子时）是肝经修复时间，晚睡伤肝',
    expectedImpact: '2周内精力恢复速度加快，面色更好',
    expectedTimeframe: '2周',
    relatedElements: ['木'],
    checklist: [
      '22:30开始准备睡觉（洗漱/关灯）',
      '睡前1小时不看手机',
      '可泡脚15分钟助眠（加艾叶更佳）',
    ],
    priority: 'recommended',
    cost: 'zero',
    difficulty: 'medium',
  },
  // 加分项（5-10项）
  {
    id: 'wood-optional-1',
    title: '学习新技能或深造（补充知识木气）',
    reason: '木主生长，学习新知识可增强木的生发之气',
    expectedImpact: '3-6月内职业竞争力提升，收入有望增长',
    expectedTimeframe: '3-6月',
    relatedElements: ['木'],
    relatedGods: ['印星'],
    checklist: [
      '选择与职业相关的技能（实用性高）',
      '报名在线课程或培训班',
      '每周学习5小时以上',
    ],
    priority: 'optional',
    cost: 'medium',
    difficulty: 'hard',
  },
  {
    id: 'wood-optional-2',
    title: '定期去森林/公园散步（每周2次以上）',
    reason: '树木茂盛的地方木气充足，可补充能量场',
    expectedImpact: '3个月内心情更愉悦，免疫力增强',
    expectedTimeframe: '3-6月',
    relatedElements: ['木'],
    checklist: [
      '选择周末或下班后去公园',
      '深呼吸，感受自然气息',
      '可配合冥想或太极',
    ],
    priority: 'optional',
    cost: 'zero',
    difficulty: 'easy',
  },
];

// ===== 用神：火 =====

export const actionsForFire: ActionTemplate[] = [
  {
    id: 'fire-essential-1',
    title: '每天中午11-13点晒太阳15-20分钟（补火）',
    reason: '您的用神为火，中午（午时）火气最旺，晒太阳可补充阳气',
    expectedImpact: '1周内精神状态改善，冬季不易感冒',
    expectedTimeframe: '1周',
    relatedElements: ['火'],
    relatedGods: ['官星', '伤官'],
    checklist: [
      '选择室外阳光充足的地方',
      '避开夏季烈日（防中暑）',
      '可配合散步或站桩',
    ],
    priority: 'essential',
    cost: 'zero',
    difficulty: 'easy',
  },
  {
    id: 'fire-essential-2',
    title: '多穿红色/紫色/橙色衣服（补火气）',
    reason: '火对应红色系，衣着颜色可影响气场',
    expectedImpact: '立即见效，气场更明亮，人际关系改善',
    expectedTimeframe: '立即',
    relatedElements: ['火'],
    checklist: [
      '购买2-3件红色系衣服（上衣优先）',
      '配饰也可选择红色（围巾/包包）',
      '避免全身黑色/深蓝（克火）',
    ],
    priority: 'essential',
    cost: 'low',
    difficulty: 'easy',
  },
  {
    id: 'fire-recommended-1',
    title: '增加社交活动频率（每周2次以上）',
    reason: '火主礼，社交活动可增强火的热情能量',
    expectedImpact: '1-2月内人脉扩展，贵人运提升',
    expectedTimeframe: '1-2月',
    relatedElements: ['火'],
    relatedGods: ['伤官', '食神'],
    checklist: [
      '主动参加聚会/行业活动',
      '每周至少约2个朋友见面',
      '提升沟通表达能力（可学习演讲）',
    ],
    priority: 'recommended',
    cost: 'low',
    difficulty: 'medium',
  },
  {
    id: 'fire-recommended-2',
    title: '调整饮食：增加温热性食物（羊肉/辣椒/姜）',
    reason: '温热食物可补充火气，改善体质',
    expectedImpact: '1个月内手脚冰凉改善，体力增强',
    expectedTimeframe: '1-2月',
    relatedElements: ['火'],
    checklist: [
      '每周2-3次温热食物（适量）',
      '可喝红茶/姜茶（养阳）',
      '避免过度寒凉食物（冰饮/西瓜）',
    ],
    priority: 'recommended',
    cost: 'low',
    difficulty: 'easy',
  },
];

// ===== 用神：土 =====

export const actionsForEarth: ActionTemplate[] = [
  {
    id: 'earth-essential-1',
    title: '规律三餐，养护脾胃（土主脾胃）',
    reason: '您的用神为土，脾胃健康直接影响运势',
    expectedImpact: '2周内消化改善，精力更充沛',
    expectedTimeframe: '2周',
    relatedElements: ['土'],
    relatedGods: ['印星'],
    checklist: [
      '固定时间吃饭（早7点/午12点/晚18点）',
      '每餐七八分饱（不过饱）',
      '细嚼慢咽，少吃生冷',
    ],
    priority: 'essential',
    cost: 'zero',
    difficulty: 'easy',
  },
  {
    id: 'earth-essential-2',
    title: '每天赤脚接触土地15分钟（如公园草地）',
    reason: '土主稳定，直接接触土地可补充土气能量',
    expectedImpact: '1周内情绪更稳定，睡眠改善',
    expectedTimeframe: '1周',
    relatedElements: ['土'],
    checklist: [
      '选择干净的草地或沙滩',
      '早晨或傍晚进行（避开烈日）',
      '可配合冥想或深呼吸',
    ],
    priority: 'essential',
    cost: 'zero',
    difficulty: 'easy',
  },
  {
    id: 'earth-recommended-1',
    title: '建立稳定的作息习惯（固定时间起床/睡觉）',
    reason: '土主稳定，规律作息可增强土的能量',
    expectedImpact: '1个月内生活掌控感增强，效率提升',
    expectedTimeframe: '1-2月',
    relatedElements: ['土'],
    checklist: [
      '每天同一时间起床（含周末）',
      '建立晨间/晚间仪式感',
      '使用习惯追踪APP（如小习惯）',
    ],
    priority: 'recommended',
    cost: 'zero',
    difficulty: 'medium',
  },
];

// ===== 用神：金 =====

export const actionsForMetal: ActionTemplate[] = [
  {
    id: 'metal-essential-1',
    title: '每天深呼吸练习10分钟（补肺金）',
    reason: '您的用神为金，肺属金，深呼吸可养肺',
    expectedImpact: '1周内呼吸顺畅，精神集中力增强',
    expectedTimeframe: '1周',
    relatedElements: ['金'],
    relatedGods: ['官星'],
    checklist: [
      '选择空气清新的地方（公园/阳台）',
      '腹式呼吸：吸气4秒→屏息4秒→呼气8秒',
      '每天早晚各5分钟',
    ],
    priority: 'essential',
    cost: 'zero',
    difficulty: 'easy',
  },
  {
    id: 'metal-essential-2',
    title: '佩戴金属饰品（金/银/白金）',
    reason: '金属饰品可直接补充金气',
    expectedImpact: '立即见效，气场更利落，决断力提升',
    expectedTimeframe: '立即',
    relatedElements: ['金'],
    checklist: [
      '选择金属手表/项链/戒指',
      '优先白色/金色金属',
      '避免木质饰品（金克木）',
    ],
    priority: 'essential',
    cost: 'low',
    difficulty: 'easy',
  },
  {
    id: 'metal-recommended-1',
    title: '整理收纳，断舍离（金主收敛）',
    reason: '金主收敛，整理环境可增强金的能量',
    expectedImpact: '1-2周内思维更清晰，决策效率提升',
    expectedTimeframe: '1-2周',
    relatedElements: ['金'],
    checklist: [
      '每周至少整理一次房间',
      '扔掉1年内未用的物品',
      '保持桌面整洁（工作区域优先）',
    ],
    priority: 'recommended',
    cost: 'zero',
    difficulty: 'medium',
  },
];

// ===== 用神：水 =====

export const actionsForWater: ActionTemplate[] = [
  {
    id: 'water-essential-1',
    title: '每天喝足2000ml水，养肾水',
    reason: '您的用神为水，肾属水，充足水分可养肾',
    expectedImpact: '1周内精力恢复速度加快，皮肤更好',
    expectedTimeframe: '1周',
    relatedElements: ['水'],
    relatedGods: ['印星'],
    checklist: [
      '早起空腹喝300ml温水',
      '每2小时喝一次水（200ml）',
      '睡前1小时不喝水（避免夜尿）',
    ],
    priority: 'essential',
    cost: 'zero',
    difficulty: 'easy',
  },
  {
    id: 'water-essential-2',
    title: '多穿黑色/深蓝色衣服（补水气）',
    reason: '水对应黑色系，衣着颜色可影响气场',
    expectedImpact: '立即见效，气场更沉稳，智慧感提升',
    expectedTimeframe: '立即',
    relatedElements: ['水'],
    checklist: [
      '购买2-3件黑色/深蓝衣服',
      '配饰也可选择黑色系',
      '避免土黄色/黄色（土克水）',
    ],
    priority: 'essential',
    cost: 'low',
    difficulty: 'easy',
  },
  {
    id: 'water-recommended-1',
    title: '增加学习时间，补充知识储备',
    reason: '水主智，学习可增强水的智慧能量',
    expectedImpact: '3-6月内专业能力提升，职业发展更顺',
    expectedTimeframe: '3-6月',
    relatedElements: ['水'],
    relatedGods: ['印星'],
    checklist: [
      '每天至少学习1小时',
      '选择与职业相关的知识',
      '建立知识管理系统（笔记/总结）',
    ],
    priority: 'recommended',
    cost: 'low',
    difficulty: 'medium',
  },
];

// ===== 主函数：根据用神获取行动模板 =====

/**
 * 根据用神获取行动模板
 */
export function getActionsByElement(element: UsefulElement): ActionTemplate[] {
  switch (element) {
    case '木':
      return actionsForWood;
    case '火':
      return actionsForFire;
    case '土':
      return actionsForEarth;
    case '金':
      return actionsForMetal;
    case '水':
      return actionsForWater;
    default:
      return [];
  }
}

/**
 * 按优先级过滤行动
 */
export function filterActionsByPriority(
  actions: ActionTemplate[],
  priority: ActionPriority
): ActionTemplate[] {
  return actions.filter((action) => action.priority === priority);
}

/**
 * 按成本过滤行动
 */
export function filterActionsByCost(
  actions: ActionTemplate[],
  maxCost: 'zero' | 'low' | 'medium' | 'high'
): ActionTemplate[] {
  const costOrder = ['zero', 'low', 'medium', 'high'];
  const maxCostIndex = costOrder.indexOf(maxCost);

  return actions.filter((action) => {
    const actionCostIndex = costOrder.indexOf(action.cost);
    return actionCostIndex <= maxCostIndex;
  });
}

/**
 * 转换为ActionItem格式（用于报告输出）
 */
export function convertToActionItem(template: ActionTemplate): ActionItem {
  return {
    id: template.id,
    title: template.title,
    reason: template.reason,
    expectedImpact: template.expectedImpact,
    expectedTimeframe: template.expectedTimeframe,
    relatedElements: template.relatedElements as any,
    relatedGods: template.relatedGods as any,
    checklist: template.checklist,
  };
}
