/**
 * 风水物品库
 *
 * 功能：为水位和山位任务提供具体的物品建议、位置描述和预期影响量化
 *
 * 使用场景：
 * - 水位任务（零神位）：增加财运、流动性
 * - 山位任务（正神位）：增强健康、事业稳定性
 * - 飞星调理：化解煞气、增强吉星
 */

/**
 * 物品类型定义
 */
export type FengshuiItemType =
  | 'water'
  | 'mountain'
  | 'metal'
  | 'light'
  | 'plant'
  | 'crystal';

/**
 * 物品优先级
 */
export type ItemPriority = 'essential' | 'recommended' | 'optional';

/**
 * 物品成本
 */
export type ItemCost = 'zero' | 'low' | 'medium' | 'high';

/**
 * 风水物品接口
 */
export interface FengshuiItem {
  id: string;
  name: string; // 物品名称（如"鱼缸"）
  category: FengshuiItemType; // 物品类型
  description: string; // 详细描述
  specifications: string[]; // 规格要求（如"长度60-80cm"）
  placement: string; // 摆放要求（如"靠墙放置"）
  maintenance: string; // 维护要求（如"每周换水1次"）
  cost: ItemCost; // 成本等级
  priority: ItemPriority; // 优先级
  expectedImpact: string; // 预期影响（量化）
  timeframe: string; // 见效时间
  relatedElements: string[]; // 相关五行
  relatedPalaces: number[]; // 适用宫位（1-9）
  alternatives: string[]; // 替代品（如果主物品不可用）
}

/**
 * 宫位到具体房间的映射
 */
export const PALACE_TO_ROOM_MAP: Record<
  number,
  { bagua: string; typical: string; alternatives: string[] }
> = {
  1: {
    bagua: '坎',
    typical: '客厅东北角',
    alternatives: ['玄关入口处', '书房北侧', '卫生间（如有）'],
  },
  2: {
    bagua: '坤',
    typical: '客厅西南角',
    alternatives: ['主卧西南角', '餐厅西南侧'],
  },
  3: {
    bagua: '震',
    typical: '客厅东侧',
    alternatives: ['书房东侧', '次卧东侧'],
  },
  4: {
    bagua: '巽',
    typical: '客厅东南角',
    alternatives: ['阳台东南角', '书房东南侧'],
  },
  5: {
    bagua: '中宫',
    typical: '客厅中央',
    alternatives: ['餐厅中央', '走廊中央'],
  },
  6: {
    bagua: '乾',
    typical: '客厅西北角',
    alternatives: ['主卧西北角', '书房西北侧'],
  },
  7: {
    bagua: '兑',
    typical: '客厅西侧',
    alternatives: ['儿童房西侧', '客厅西墙'],
  },
  8: {
    bagua: '艮',
    typical: '客厅东北角',
    alternatives: ['书房东北侧', '次卧东北角'],
  },
  9: {
    bagua: '离',
    typical: '客厅南侧',
    alternatives: ['阳台南侧', '主卧南侧'],
  },
};

/**
 * 水位物品库（零神位，见水旺财）
 */
export const WATER_ITEMS: FengshuiItem[] = [
  {
    id: 'water-01',
    name: '生态鱼缸',
    category: 'water',
    description: '小型生态鱼缸（60-80cm长），养6或8条金鱼，水质清澈流动',
    specifications: [
      '长度：60-80cm',
      '高度：40-50cm',
      '配备过滤器和增氧泵',
      '鱼的数量：6条（六白金）或8条（八白土）',
    ],
    placement: '靠墙放置，避免正对门口或座位背后',
    maintenance: '每周换水1次（1/3水量），每天喂食2次',
    cost: 'medium',
    priority: 'essential',
    expectedImpact: '提升财运10-15%，改善人际关系',
    timeframe: '1-2个月见效',
    relatedElements: ['水', '金'],
    relatedPalaces: [1, 4, 6],
    alternatives: ['流水摆件', '水培植物', '饮水机'],
  },
  {
    id: 'water-02',
    name: '流水摆件',
    category: 'water',
    description: '桌面流水摆件，带循环水泵，水流潺潺',
    specifications: [
      '尺寸：30-40cm高',
      '材质：陶瓷或树脂',
      '配备LED灯（可选）',
      '水流方向：向内（不向外流）',
    ],
    placement: '放置在财位、书桌或茶几上',
    maintenance: '每周添加水1次，每月清洗水泵',
    cost: 'low',
    priority: 'recommended',
    expectedImpact: '提升财运5-8%，增强运势流动性',
    timeframe: '2-4周见效',
    relatedElements: ['水'],
    relatedPalaces: [1, 4],
    alternatives: ['小型喷泉', '水培植物', '山水画（带水）'],
  },
  {
    id: 'water-03',
    name: '饮水机',
    category: 'water',
    description: '家用或办公饮水机，常年使用，水流活跃',
    specifications: [
      '类型：立式或台式',
      '功能：冷热水或常温水',
      '位置：靠墙放置',
    ],
    placement: '放置在零神位，方便日常使用',
    maintenance: '每月更换滤芯，每周清洗水桶',
    cost: 'low',
    priority: 'optional',
    expectedImpact: '提升财运3-5%，增加家庭气场流动',
    timeframe: '持续见效（日常使用）',
    relatedElements: ['水'],
    relatedPalaces: [1, 4, 6, 7],
    alternatives: ['茶具（常用）', '水晶球（清洗后）'],
  },
  {
    id: 'water-04',
    name: '水培植物',
    category: 'water',
    description: '绿萝、富贵竹等水培植物，根系在水中生长',
    specifications: [
      '植物：绿萝、富贵竹、白掌',
      '容器：透明玻璃瓶',
      '水位：根系1/2-2/3浸入水中',
      '数量：6株或8株',
    ],
    placement: '放置在窗台、书桌或茶几上',
    maintenance: '每周换水1次，每月添加营养液',
    cost: 'zero',
    priority: 'optional',
    expectedImpact: '提升财运3-5%，改善室内空气',
    timeframe: '1-2个月见效',
    relatedElements: ['水', '木'],
    relatedPalaces: [1, 3, 4],
    alternatives: ['水仙花（冬季）', '风信子（春季）'],
  },
  {
    id: 'water-05',
    name: '山水画（带水景）',
    category: 'water',
    description: '客厅或书房挂画，含瀑布、河流、湖泊等水景',
    specifications: [
      '尺寸：80-120cm宽',
      '主题：山水画（水为主，山为辅）',
      '水流方向：向内（流入家中）',
      '避免：汹涌瀑布、断崖、枯水',
    ],
    placement: '挂在客厅或书房主墙面，视线平齐',
    maintenance: '每季度清洁画面',
    cost: 'medium',
    priority: 'optional',
    expectedImpact: '提升财运5-8%，增强空间美感',
    timeframe: '2-3个月见效',
    relatedElements: ['水', '土'],
    relatedPalaces: [1, 4, 6],
    alternatives: ['摄影作品（海洋、湖泊）', '蓝色装饰画'],
  },
];

/**
 * 山位物品库（正神位，见山旺人丁/健康）
 */
export const MOUNTAIN_ITEMS: FengshuiItem[] = [
  {
    id: 'mountain-01',
    name: '高大绿植',
    category: 'plant',
    description: '发财树、幸福树、平安树等高大绿植（1.5-2米高）',
    specifications: [
      '高度：1.5-2米',
      '种类：发财树、幸福树、平安树、琴叶榕',
      '盆径：30-40cm',
      '土壤：疏松肥沃',
    ],
    placement: '靠墙角放置，避免阻挡通道',
    maintenance: '每周浇水1-2次，每月施肥1次',
    cost: 'medium',
    priority: 'essential',
    expectedImpact: '提升健康运10-15%，增强事业稳定性',
    timeframe: '1-2个月见效',
    relatedElements: ['木', '土'],
    relatedPalaces: [2, 6, 8],
    alternatives: ['龟背竹', '橡皮树', '富贵竹（土培）'],
  },
  {
    id: 'mountain-02',
    name: '实木书柜',
    category: 'mountain',
    description: '高大实木书柜（1.8-2.2米高），放满书籍',
    specifications: [
      '高度：1.8-2.2米',
      '材质：实木（胡桃木、橡木）',
      '宽度：80-120cm',
      '书籍：填满至少70%空间',
    ],
    placement: '靠墙放置，形成"靠山"，避免正对座位',
    maintenance: '每月清洁书柜，每季度整理书籍',
    cost: 'high',
    priority: 'recommended',
    expectedImpact: '提升事业运10-12%，增强家族气场',
    timeframe: '2-3个月见效',
    relatedElements: ['木', '土'],
    relatedPalaces: [2, 6, 8],
    alternatives: ['实木衣柜', '组合柜', '展示柜'],
  },
  {
    id: 'mountain-03',
    name: '泰山石',
    category: 'mountain',
    description: '天然泰山石摆件（30-50cm高），镇宅化煞',
    specifications: [
      '高度：30-50cm',
      '重量：10-20kg',
      '材质：天然泰山石',
      '底座：实木或陶瓷',
    ],
    placement: '放置在正神位角落，形成"靠山"',
    maintenance: '每月擦拭清洁',
    cost: 'medium',
    priority: 'recommended',
    expectedImpact: '提升健康运8-10%，化解煞气',
    timeframe: '1-2个月见效',
    relatedElements: ['土', '金'],
    relatedPalaces: [2, 5, 6, 8],
    alternatives: ['灵璧石', '昆仑石', '水晶簇'],
  },
  {
    id: 'mountain-04',
    name: '山景装饰画',
    category: 'mountain',
    description: '客厅或书房挂画，含高山、山峦、山脉等',
    specifications: [
      '尺寸：100-150cm宽',
      '主题：山景画（山为主，少见水）',
      '山形：圆润、稳重（避免尖锐、崩塌）',
      '色调：棕色、绿色、黄色（土属性）',
    ],
    placement: '挂在座位背后墙面，形成"靠山"',
    maintenance: '每季度清洁画面',
    cost: 'medium',
    priority: 'recommended',
    expectedImpact: '提升事业运8-10%，增强安全感',
    timeframe: '2-3个月见效',
    relatedElements: ['土', '木'],
    relatedPalaces: [2, 6, 8],
    alternatives: ['长城摄影作品', '山水画（山为主）'],
  },
  {
    id: 'mountain-05',
    name: '实心柜体',
    category: 'mountain',
    description: '电视柜、储物柜等实心柜体（避免镂空）',
    specifications: [
      '高度：60-80cm',
      '材质：实木或密度板',
      '结构：实心（避免镂空、玻璃门）',
      '宽度：120-180cm',
    ],
    placement: '靠墙放置，形成稳固基础',
    maintenance: '每月擦拭清洁',
    cost: 'medium',
    priority: 'optional',
    expectedImpact: '提升健康运5-8%，增强家庭稳定性',
    timeframe: '2-4个月见效',
    relatedElements: ['土', '木'],
    relatedPalaces: [2, 5, 8],
    alternatives: ['餐边柜', '斗柜', '床头柜'],
  },
  {
    id: 'mountain-06',
    name: '盆景（松柏类）',
    category: 'plant',
    description: '松树、柏树、罗汉松等盆景（50-80cm高）',
    specifications: [
      '高度：50-80cm',
      '树种：松树、柏树、罗汉松、榕树',
      '盆器：陶瓷或紫砂',
      '造型：古朴、稳重',
    ],
    placement: '放置在茶几、书桌或柜台上',
    maintenance: '每周浇水1-2次，每月修剪',
    cost: 'high',
    priority: 'optional',
    expectedImpact: '提升健康运5-8%，增强品位',
    timeframe: '3-6个月见效',
    relatedElements: ['木', '土'],
    relatedPalaces: [2, 6, 8],
    alternatives: ['龟背竹盆景', '金钱树', '玉树'],
  },
];

/**
 * 飞星化解物品库（针对煞星）
 */
export const FLYING_STAR_ITEMS: FengshuiItem[] = [
  {
    id: 'star-01',
    name: '铜葫芦',
    category: 'metal',
    description: '纯铜葫芦摆件，化解五黄煞、二黑病符星',
    specifications: [
      '材质：纯铜',
      '高度：10-15cm',
      '口径：葫芦口需打开',
      '数量：1个或一对',
    ],
    placement: '放置在煞星飞临宫位',
    maintenance: '每月擦拭，保持光泽',
    cost: 'low',
    priority: 'essential',
    expectedImpact: '化解煞气70-80%，提升健康运',
    timeframe: '1个月见效',
    relatedElements: ['金'],
    relatedPalaces: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    alternatives: ['五帝钱', '六帝钱', '铜钱剑'],
  },
  {
    id: 'star-02',
    name: '六帝钱',
    category: 'metal',
    description: '清朝六帝铜钱（顺治/康熙/雍正/乾隆/嘉庆/道光），化煞旺财',
    specifications: [
      '材质：铜质古钱',
      '数量：6枚',
      '穿绳：红绳或黄绳',
      '尺寸：每枚直径2-3cm',
    ],
    placement: '挂在门口、窗户或放置在煞位',
    maintenance: '每季度清洁',
    cost: 'low',
    priority: 'recommended',
    expectedImpact: '化解煞气60-70%，提升财运5%',
    timeframe: '1-2个月见效',
    relatedElements: ['金'],
    relatedPalaces: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    alternatives: ['五帝钱', '铜葫芦', '貔貅'],
  },
  {
    id: 'star-03',
    name: '水晶簇',
    category: 'crystal',
    description: '紫晶簇或白水晶簇，化解煞气，提升正能量',
    specifications: [
      '材质：天然水晶',
      '重量：1-3kg',
      '颜色：紫色或白色',
      '底座：木质或陶瓷',
    ],
    placement: '放置在煞位或凶位',
    maintenance: '每月用清水冲洗，阳光下晾晒2小时',
    cost: 'high',
    priority: 'optional',
    expectedImpact: '化解煞气50-60%，提升气场',
    timeframe: '2-3个月见效',
    relatedElements: ['土', '金'],
    relatedPalaces: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    alternatives: ['黄水晶球', '白水晶柱', '黑曜石'],
  },
];

/**
 * 辅助函数：根据宫位和物品类型获取推荐物品
 */
export function getItemsByPalaceAndType(
  palace: number,
  type: 'water' | 'mountain' | 'flyingstar',
  priority?: ItemPriority
): FengshuiItem[] {
  let items: FengshuiItem[] = [];

  if (type === 'water') {
    items = WATER_ITEMS.filter((item) => item.relatedPalaces.includes(palace));
  } else if (type === 'mountain') {
    items = MOUNTAIN_ITEMS.filter((item) =>
      item.relatedPalaces.includes(palace)
    );
  } else if (type === 'flyingstar') {
    items = FLYING_STAR_ITEMS;
  }

  if (priority) {
    items = items.filter((item) => item.priority === priority);
  }

  return items;
}

/**
 * 辅助函数：根据宫位获取具体位置描述
 */
export function getPalaceLocation(palace: number): {
  bagua: string;
  typical: string;
  alternatives: string[];
} {
  return (
    PALACE_TO_ROOM_MAP[palace] || {
      bagua: '未知',
      typical: '客厅',
      alternatives: [],
    }
  );
}

/**
 * 辅助函数：根据预算筛选物品
 */
export function filterItemsByCost(
  items: FengshuiItem[],
  maxCost: ItemCost
): FengshuiItem[] {
  const costOrder: ItemCost[] = ['zero', 'low', 'medium', 'high'];
  const maxIndex = costOrder.indexOf(maxCost);

  return items.filter((item) => {
    const itemIndex = costOrder.indexOf(item.cost);
    return itemIndex <= maxIndex;
  });
}

/**
 * 辅助函数：生成物品摆放任务描述
 */
export function generateItemTaskDescription(
  item: FengshuiItem,
  palace: number,
  rationale: string
): string {
  const location = getPalaceLocation(palace);

  return `在${palace}宫（${location.bagua}位，${location.typical}）摆放${item.name}。${item.description}。${rationale}`;
}
