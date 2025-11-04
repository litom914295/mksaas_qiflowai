/**
 * 风水布局建议数据库
 *
 * 根据山星-向星组合提供详细的房间布置建议
 */

export interface LayoutSuggestion {
  type: 'auspicious' | 'inauspicious' | 'neutral' | 'general';
  title: string;
  enhance?: string[]; // 增强建议（吉星用）
  dissolve?: string[]; // 化解建议（凶星用）
  description: string;
  suitableRooms: string[]; // 适合的房间类型
  avoidRooms?: string[]; // 避免的房间类型
  colorScheme?: string[]; // 推荐颜色
  items?: string[]; // 推荐摆放物品
}

/**
 * 吉星组合的布局建议
 */
const auspiciousCombinations: Record<string, LayoutSuggestion> = {
  // 一白水星相关组合
  '1-6': {
    type: 'auspicious',
    title: '文昌位',
    enhance: ['书桌', '书柜', '文房四宝', '紫水晶', '文昌塔'],
    description:
      '一白水星配六白金星，金水相生，文昌大旺。适合设置学习区域，有助于学业和事业发展，利于考试升学。',
    suitableRooms: ['书房', '学习区', '儿童房', '工作室'],
    colorScheme: ['白色', '金色', '淡蓝色'],
    items: ['书桌', '书柜', '台灯', '文竹', '水晶摆件'],
  },
  '1-8': {
    type: 'auspicious',
    title: '财位',
    enhance: ['鱼缸', '流水摆件', '水晶', '铜钱', '聚宝盆'],
    description:
      '一白水星配八白土星，财源广进。有利于财运，适合放置招财物品，利于经商置业。',
    suitableRooms: ['客厅', '财位区', '办公室', '商铺'],
    colorScheme: ['黄色', '金色', '蓝色'],
    items: ['鱼缸', '水晶', '金元宝', '招财树'],
  },
  '6-1': {
    type: 'auspicious',
    title: '事业位',
    enhance: ['事业靠山画', '山水画', '盆栽', '文昌塔', '水晶球'],
    description:
      '六白金星配一白水星，金水相生，事业运旺。有助于事业发展和升职加薪，利于领导力提升。',
    suitableRooms: ['办公室', '书房', '客厅', '工作区'],
    colorScheme: ['白色', '金色', '灰色'],
    items: ['办公桌', '靠背椅', '山水画', '印章'],
  },
  '8-1': {
    type: 'auspicious',
    title: '财运位',
    enhance: ['水晶', '金元宝', '聚宝盆', '绿植', '鱼缸'],
    description:
      '八白土星配一白水星，土水和合，财运亨通。有利于财富积累和置业发展。',
    suitableRooms: ['财位', '客厅', '玄关', '办公室'],
    colorScheme: ['黄色', '土黄', '金色'],
    items: ['聚宝盆', '发财树', '黄水晶', '金蟾'],
  },

  // 四绿木星相关组合
  '4-9': {
    type: 'auspicious',
    title: '桃花位',
    enhance: ['鲜花', '粉色装饰', '成对物品', '水晶', '鸳鸯摆件'],
    description:
      '四绿木星配九紫火星，木火通明，桃花大旺。有利于感情和人际关系，适合单身人士催旺姻缘。',
    suitableRooms: ['卧室', '客厅', '会客区'],
    avoidRooms: ['厨房', '卫生间'],
    colorScheme: ['粉色', '红色', '绿色'],
    items: ['鲜花', '成对装饰', '粉晶', '玫瑰花'],
  },
  '4-1': {
    type: 'auspicious',
    title: '文艺位',
    enhance: ['乐器', '艺术品', '书籍', '绿植', '文房四宝'],
    description:
      '四绿木星配一白水星，水木相生，文艺兴旺。有利于文艺创作和才华发挥。',
    suitableRooms: ['工作室', '书房', '琴房', '画室'],
    colorScheme: ['绿色', '青色', '白色'],
    items: ['艺术品', '乐器', '绿植', '书籍'],
  },

  // 八白土星相关组合
  '8-8': {
    type: 'auspicious',
    title: '双财位',
    enhance: ['水晶', '金元宝', '铜钱', '聚宝盆', '黄玉'],
    description:
      '双八白土星入中，双财星聚会，财源广进。大利财富积累和置业投资。',
    suitableRooms: ['财位', '客厅', '办公室', '商铺'],
    colorScheme: ['黄色', '金色', '土黄'],
    items: ['黄水晶', '聚宝盆', '金元宝', '貔貅'],
  },
  '8-6': {
    type: 'auspicious',
    title: '财文位',
    enhance: ['书桌', '文房四宝', '水晶', '绿植', '文昌塔'],
    description:
      '八白土星配六白金星，土金相生，财文双美。有利于财运和学业，适合商务人士。',
    suitableRooms: ['书房', '办公室', '会议室'],
    colorScheme: ['黄色', '白色', '金色'],
    items: ['办公桌', '书柜', '文昌塔', '黄水晶'],
  },
  '6-8': {
    type: 'auspicious',
    title: '文财位',
    enhance: ['书桌', '文房四宝', '水晶', '绿植', '印章'],
    description:
      '六白金星配八白土星，土金相生，文财双收。有利于学业和财运，适合设置书房或办公区。',
    suitableRooms: ['书房', '办公室', '工作区'],
    colorScheme: ['白色', '黄色', '金色'],
    items: ['书桌', '文昌塔', '水晶球', '印章'],
  },

  // 九紫火星相关组合
  '9-4': {
    type: 'auspicious',
    title: '贵人位',
    enhance: ['紫晶洞', '紫色装饰', '水晶', '铜龟', '贵人符'],
    description:
      '九紫火星配四绿木星，木火通明，贵人运旺。有助于获得贵人相助，事业顺利。',
    suitableRooms: ['客厅', '书房', '会客区'],
    colorScheme: ['紫色', '红色', '绿色'],
    items: ['紫晶洞', '贵人画', '紫水晶', '龟摆件'],
  },
  '9-9': {
    type: 'auspicious',
    title: '双喜位',
    enhance: ['红色装饰', '喜庆物品', '成对物品', '水晶', '灯具'],
    description:
      '双九紫火星入中，喜上加喜，双喜临门。有利于各方面运势，特别利于喜事和名声。',
    suitableRooms: ['客厅', '餐厅', '玄关'],
    colorScheme: ['红色', '紫色', '粉色'],
    items: ['红色装饰', '灯具', '成对摆件', '鲜花'],
  },
  '9-8': {
    type: 'auspicious',
    title: '喜财位',
    enhance: ['水晶', '金元宝', '铜钱', '聚宝盆', '红黄装饰'],
    description:
      '九紫火星配八白土星，火土相生，喜事财运两旺。有利于财运和喜庆之事。',
    suitableRooms: ['客厅', '餐厅', '财位'],
    colorScheme: ['红色', '黄色', '金色'],
    items: ['红黄摆件', '黄水晶', '聚宝盆', '灯具'],
  },

  // 一白水星组合
  '1-1': {
    type: 'auspicious',
    title: '文昌贵人位',
    enhance: ['书桌', '文房四宝', '水晶', '绿植', '文昌塔'],
    description:
      '双一白水星入中，文昌大旺，智慧聪明。有利于学业和事业发展，适合设置书房。',
    suitableRooms: ['书房', '学习区', '儿童房'],
    colorScheme: ['白色', '淡蓝色', '银色'],
    items: ['书桌', '文昌塔', '水晶', '文竹'],
  },
};

/**
 * 凶星组合的化解建议
 */
const inauspiciousCombinations: Record<string, LayoutSuggestion> = {
  // 二黑病星相关
  '2-5': {
    type: 'inauspicious',
    title: '病灾位',
    dissolve: ['金属风铃', '铜葫芦', '六帝钱', '白水晶', '五帝钱'],
    description:
      '二黑土星配五黄土星，双土叠加，病灾严重。极易引起健康问题和意外伤害，必须化解。',
    suitableRooms: ['储藏室', '杂物间'],
    avoidRooms: ['卧室', '儿童房', '老人房', '餐厅'],
    colorScheme: ['白色', '金色', '银色'],
    items: ['铜葫芦', '五帝钱', '白水晶', '金属风铃'],
  },
  '5-2': {
    type: 'inauspicious',
    title: '疾病位',
    dissolve: ['铜葫芦', '五帝钱', '金属饰品', '白水晶', '六帝钱'],
    description:
      '五黄土星配二黑土星，双煞并临，疾病丛生。易引起严重健康问题，家人体弱多病。',
    suitableRooms: ['储藏室', '卫生间', '杂物间'],
    avoidRooms: ['卧室', '儿童房', '老人房'],
    colorScheme: ['白色', '金色'],
    items: ['铜葫芦', '六帝钱', '白水晶球', '金属摆件'],
  },
  '2-2': {
    type: 'inauspicious',
    title: '双病位',
    dissolve: ['铜葫芦', '五帝钱', '金属饰品', '白水晶', '盐灯'],
    description:
      '双二黑土星入中，病星重叠，健康大忌。严重影响健康，易有慢性疾病，必须化解。',
    suitableRooms: ['储藏室', '杂物间'],
    avoidRooms: ['卧室', '儿童房', '老人房', '餐厅', '厨房'],
    colorScheme: ['白色', '金色'],
    items: ['铜葫芦', '六帝钱', '盐灯', '白水晶'],
  },

  // 三碧是非星相关
  '3-7': {
    type: 'inauspicious',
    title: '口舌位',
    dissolve: ['金属风铃', '六帝钱', '铜制品', '红水晶', '粉晶'],
    description:
      '三碧木星配七赤金星，金木交战，口舌是非。易引起争吵、官司和人际纠纷。',
    suitableRooms: ['储藏室', '卫生间'],
    avoidRooms: ['客厅', '书房', '办公室', '会客区'],
    colorScheme: ['红色', '粉色', '金色'],
    items: ['红水晶', '六帝钱', '粉晶', '铜风铃'],
  },
  '7-3': {
    type: 'inauspicious',
    title: '是非位',
    dissolve: ['金属风铃', '六帝钱', '铜制品', '红水晶', '火焰摆件'],
    description:
      '七赤金星配三碧木星，金克木，是非不断。易引起争吵、破财和官非，需要化解。',
    suitableRooms: ['储藏室', '杂物间'],
    avoidRooms: ['客厅', '书房', '办公室'],
    colorScheme: ['红色', '紫色'],
    items: ['红水晶', '火焰灯', '六帝钱', '粉晶'],
  },
  '3-3': {
    type: 'inauspicious',
    title: '双是非位',
    dissolve: ['金属风铃', '六帝钱', '铜制品', '红水晶', '红灯'],
    description:
      '双三碧木星入中，是非星重叠，官非不断。易引起严重争吵、诉讼和人际问题。',
    suitableRooms: ['储藏室'],
    avoidRooms: ['客厅', '书房', '办公室', '会客区'],
    colorScheme: ['红色', '紫色', '粉色'],
    items: ['红水晶', '六帝钱', '红灯', '火焰摆件'],
  },

  // 五黄煞星相关
  '5-5': {
    type: 'inauspicious',
    title: '重病位',
    dissolve: ['铜葫芦', '铜钱', '金属风铃', '白水晶', '六帝钱'],
    description:
      '双五黄土星入中，煞气极重，大凶之位。严重影响健康、财运和家宅平安，必须重点化解。',
    suitableRooms: ['储藏室'],
    avoidRooms: ['卧室', '儿童房', '老人房', '客厅', '餐厅', '厨房', '书房'],
    colorScheme: ['白色', '金色', '银色'],
    items: ['大铜葫芦', '六帝钱', '白水晶簇', '金属风铃'],
  },

  // 七赤破军星相关
  '7-7': {
    type: 'inauspicious',
    title: '双煞位',
    dissolve: ['金属风铃', '六帝钱', '铜制品', '红水晶', '水晶球'],
    description:
      '双七赤金星入中，肃杀之气过重。易引起严重争吵、官非、血光之灾，必须化解。',
    suitableRooms: ['储藏室', '杂物间'],
    avoidRooms: ['卧室', '客厅', '书房', '办公室'],
    colorScheme: ['红色', '蓝色'],
    items: ['红水晶', '六帝钱', '水晶球', '蓝色摆件'],
  },
};

/**
 * 一般星组合的建议
 */
const neutralCombinations: Record<string, LayoutSuggestion> = {
  '1-4': {
    type: 'neutral',
    title: '文思位',
    enhance: ['书籍', '绿植', '文房四宝', '艺术品'],
    description: '一白水星配四绿木星，水木相生，文思敏捷。有利于学习和创作。',
    suitableRooms: ['书房', '工作室', '学习区'],
    colorScheme: ['绿色', '蓝色', '白色'],
    items: ['书桌', '绿植', '书籍', '文竹'],
  },
  '4-6': {
    type: 'neutral',
    title: '文武位',
    enhance: ['书籍', '运动器材', '奖杯', '绿植'],
    description: '四绿木星配六白金星，金木交错，文武兼备。适合多功能使用。',
    suitableRooms: ['书房', '健身房', '多功能室'],
    colorScheme: ['绿色', '白色', '金色'],
    items: ['书桌', '绿植', '运动器材', '奖杯'],
  },
  '6-9': {
    type: 'neutral',
    title: '权贵位',
    enhance: ['印章', '奖杯', '荣誉证书', '紫晶'],
    description: '六白金星配九紫火星，金火相克但可调和。有利于权力和名声。',
    suitableRooms: ['办公室', '书房', '客厅'],
    colorScheme: ['金色', '红色', '黄色'],
    items: ['印章', '奖杯', '紫晶', '荣誉摆件'],
  },
  '1-9': {
    type: 'neutral',
    title: '水火位',
    enhance: ['鱼缸', '红色装饰', '绿植', '水晶'],
    description: '一白水星配九紫火星，水火既济，需要调和。可用木通关化解。',
    suitableRooms: ['客厅', '餐厅'],
    dissolve: ['绿色植物', '木质家具'],
    colorScheme: ['绿色', '蓝色', '红色'],
    items: ['绿植', '鱼缸', '木质摆件'],
  },
};

/**
 * 根据山星和向星组合获取布局建议
 */
export function getLayoutSuggestion(
  mountainStar: number,
  facingStar: number
): LayoutSuggestion {
  const combination = `${mountainStar}-${facingStar}`;

  // 先检查吉星组合
  if (auspiciousCombinations[combination]) {
    return auspiciousCombinations[combination];
  }

  // 再检查凶星组合
  if (inauspiciousCombinations[combination]) {
    return inauspiciousCombinations[combination];
  }

  // 检查一般星组合
  if (neutralCombinations[combination]) {
    return neutralCombinations[combination];
  }

  // 返回通用建议
  return {
    type: 'general',
    title: '一般位置',
    enhance: ['绿植', '适当装饰', '保持整洁'],
    dissolve: [],
    description:
      '此方位无特殊吉凶影响，可正常使用。建议保持整洁明亮，适当摆放绿植装饰。',
    suitableRooms: ['次卧', '书房', '餐厅', '储藏室'],
    colorScheme: ['根据个人喜好'],
    items: ['绿植', '装饰画', '照片墙'],
  };
}

/**
 * 获取所有预设的布局建议（用于参考）
 */
export function getAllSuggestions() {
  return {
    auspicious: auspiciousCombinations,
    inauspicious: inauspiciousCombinations,
    neutral: neutralCombinations,
  };
}
