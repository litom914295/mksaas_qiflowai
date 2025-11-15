/**
 * 职业匹配规则库
 * 
 * 基于传统命理学的十神、五行与现代职业的映射关系
 * 参考文献：《滴天髓》《穷通宝鉴》《子平真诠》
 */

import type { FiveElement, TenGod } from '@/types/report-v2-2';

/**
 * 职业分类与五行属性
 */
export interface CareerCategory {
  name: string;
  element: FiveElement;
  tenGods: TenGod[];
  careers: string[];
  description: string;
  baseScore: number;
}

/**
 * 职业规则映射表
 * 
 * 核心逻辑：
 * 1. 十神组合决定职业大方向（官印→体制内，财星→商业，食伤→创意）
 * 2. 五行属性决定行业细分（木→教育/文化，火→科技/营销）
 * 3. 格局强度影响职业层次（强格局→高端岗位，弱格局→基础岗位）
 */
export const CAREER_RULES: CareerCategory[] = [
  // ===== 官印组合（适合体制内、稳定型职业）=====
  {
    name: '官印相生型',
    element: '水',
    tenGods: ['正官', '正印'],
    careers: [
      '公务员（行政管理）',
      '教师/教授',
      '法官/检察官',
      '国企管理层',
      '医生（公立医院）',
    ],
    description: '正官代表权威、规范；正印代表学识、文化。官印相生，适合需要权威+知识的职业',
    baseScore: 88,
  },
  {
    name: '偏官印星型',
    element: '水',
    tenGods: ['偏官', '偏印'],
    careers: [
      '军警（执法）',
      '技术专家',
      '研究员（理工科）',
      '工程师',
      '安全/风控岗',
    ],
    description: '偏官代表权力、执行力；偏印代表专业技能。适合需要权威+技术的职业',
    baseScore: 85,
  },

  // ===== 财星组合（适合商业、营利型职业）=====
  {
    name: '食神生财型',
    element: '金',
    tenGods: ['食神', '正财'],
    careers: [
      '餐饮业（连锁经营）',
      '服务业（高端会所）',
      '文化创意产业',
      '内容创作者',
      '教育培训（民营）',
    ],
    description: '食神代表才华输出、平和；正财代表稳定收入。适合需要创意+商业的职业',
    baseScore: 82,
  },
  {
    name: '伤官生财型',
    element: '金',
    tenGods: ['伤官', '偏财'],
    careers: [
      '销售（高端产品）',
      '设计师（视觉/产品）',
      '营销策划',
      '投资顾问',
      '自媒体/网红',
    ],
    description: '伤官代表才华外露、创新；偏财代表快速收益。适合需要锋芒+灵活的职业',
    baseScore: 80,
  },
  {
    name: '比劫夺财型',
    element: '木',
    tenGods: ['比肩', '劫财'],
    careers: [
      '创业者（初创期）',
      '竞技运动员',
      '销售（冲业绩）',
      '合伙人',
      '团队管理',
    ],
    description: '比劫代表竞争、协作。适合需要团队合作或激烈竞争的职业',
    baseScore: 75,
  },

  // ===== 食伤组合（适合创意、表达型职业）=====
  {
    name: '食伤旺盛型',
    element: '火',
    tenGods: ['食神', '伤官'],
    careers: [
      '艺术家（绘画/音乐）',
      '作家/编剧',
      '演员/主持人',
      '心理咨询师',
      '创意总监',
    ],
    description: '食伤代表才华、表达欲。食伤旺者，适合需要创造力和表达的职业',
    baseScore: 78,
  },

  // ===== 印星组合（适合学术、研究型职业）=====
  {
    name: '印星强旺型',
    element: '木',
    tenGods: ['正印', '偏印'],
    careers: [
      '学者/研究员',
      '编辑/出版',
      '图书管理员',
      '档案管理',
      '宗教/哲学工作者',
    ],
    description: '印星代表学习、思考、文化。印星强者，适合需要深度思考的职业',
    baseScore: 76,
  },

  // ===== 从格特殊情况 =====
  {
    name: '从财格',
    element: '金',
    tenGods: ['正财', '偏财'],
    careers: [
      '企业家（成熟期）',
      '投资人',
      '金融从业者',
      '房地产经纪',
      '商业顾问',
    ],
    description: '从财格，顺势而为，专注财富积累。适合纯商业、高收益的职业',
    baseScore: 90,
  },
  {
    name: '从官格',
    element: '水',
    tenGods: ['正官', '偏官'],
    careers: [
      '高级公务员',
      '律师',
      '上市公司高管',
      '政治顾问',
      '合规/法务负责人',
    ],
    description: '从官格，追随权威，建立地位。适合需要权威和影响力的高端职业',
    baseScore: 92,
  },

  // ===== 五行特殊职业 =====
  {
    name: '木旺型',
    element: '木',
    tenGods: ['比肩', '食神'],
    careers: [
      '教育培训',
      '园林/绿化',
      '环保行业',
      '中医/养生',
      '图书/出版',
    ],
    description: '木主生发、仁德。木旺者，适合与成长、教育、绿色相关的职业',
    baseScore: 72,
  },
  {
    name: '火旺型',
    element: '火',
    tenGods: ['伤官', '正财'],
    careers: [
      '科技/互联网',
      '电子产品',
      '能源/电力',
      '广告/媒体',
      '娱乐/演艺',
    ],
    description: '火主光明、热情。火旺者，适合与科技、传播、能量相关的职业',
    baseScore: 74,
  },
  {
    name: '土旺型',
    element: '土',
    tenGods: ['正印', '正官'],
    careers: [
      '房地产',
      '建筑/工程',
      '农业/畜牧',
      '物流/仓储',
      '矿产/资源',
    ],
    description: '土主稳重、包容。土旺者，适合与不动产、资源、承载相关的职业',
    baseScore: 73,
  },
  {
    name: '金旺型',
    element: '金',
    tenGods: ['偏财', '伤官'],
    careers: [
      '金融/银行',
      '珠宝/首饰',
      '机械/制造',
      '法律/律师',
      '外科医生',
    ],
    description: '金主刚毅、决断。金旺者，适合与财富、精密、决断相关的职业',
    baseScore: 76,
  },
  {
    name: '水旺型',
    element: '水',
    tenGods: ['正印', '偏印'],
    careers: [
      '信息技术',
      '咨询/顾问',
      '物流/运输',
      '水利/航运',
      '智能/流通',
    ],
    description: '水主智慧、流动。水旺者，适合与信息、流通、智慧相关的职业',
    baseScore: 75,
  },
];

/**
 * 五行相生相克关系（用于职业评分）
 */
export const ELEMENT_COMPATIBILITY: Record<
  FiveElement,
  { strong: FiveElement[]; medium: FiveElement[]; weak: FiveElement[] }
> = {
  木: {
    strong: ['水'], // 水生木，强相关
    medium: ['木', '火'], // 同类、木生火，中等
    weak: ['金', '土'], // 金克木、木克土，弱相关
  },
  火: {
    strong: ['木'], // 木生火
    medium: ['火', '土'], // 同类、火生土
    weak: ['水', '金'], // 水克火、火克金
  },
  土: {
    strong: ['火'], // 火生土
    medium: ['土', '金'], // 同类、土生金
    weak: ['木', '水'], // 木克土、土克水
  },
  金: {
    strong: ['土'], // 土生金
    medium: ['金', '水'], // 同类、金生水
    weak: ['火', '木'], // 火克金、金克木
  },
  水: {
    strong: ['金'], // 金生水
    medium: ['水', '木'], // 同类、水生木
    weak: ['土', '火'], // 土克水、水克火
  },
};

/**
 * 根据用神五行获取相性评分
 * @param usefulElement - 用神五行
 * @param careerElement - 职业五行
 * @returns 评分加成（0-15分）
 */
export function getElementCompatibilityScore(
  usefulElement: FiveElement,
  careerElement: FiveElement
): number {
  const compatibility = ELEMENT_COMPATIBILITY[usefulElement];
  
  if (!compatibility) return 0;

  if (compatibility.strong.includes(careerElement)) {
    return 15; // 强相关：+15分
  } else if (compatibility.medium.includes(careerElement)) {
    return 8; // 中等：+8分
  } else if (compatibility.weak.includes(careerElement)) {
    return -5; // 弱相关：-5分
  }

  return 0;
}

/**
 * 根据格局类型获取特殊加成
 * @param pattern - 格局名称
 * @param careerName - 职业分类名称
 * @returns 评分加成（0-10分）
 */
export function getPatternBonus(pattern: string, careerName: string): number {
  const patternLower = pattern.toLowerCase();
  const careerLower = careerName.toLowerCase();

  // 从格特殊加成
  if (patternLower.includes('从财') && careerLower.includes('从财格')) {
    return 10;
  }
  if (patternLower.includes('从官') && careerLower.includes('从官格')) {
    return 10;
  }
  if (patternLower.includes('从儿') && careerLower.includes('食伤')) {
    return 8;
  }

  // 专旺格加成
  if (patternLower.includes('专旺') || patternLower.includes('曲直')) {
    if (careerLower.includes('木旺型')) return 8;
  }
  if (patternLower.includes('炎上')) {
    if (careerLower.includes('火旺型')) return 8;
  }
  if (patternLower.includes('稼穑')) {
    if (careerLower.includes('土旺型')) return 8;
  }
  if (patternLower.includes('从革')) {
    if (careerLower.includes('金旺型')) return 8;
  }
  if (patternLower.includes('润下')) {
    if (careerLower.includes('水旺型')) return 8;
  }

  return 0;
}

/**
 * 根据格局强度调整评分
 * @param baseScore - 基础分
 * @param patternStrength - 格局强度（strong/medium/weak）
 * @returns 调整后的分数
 */
export function adjustScoreByStrength(
  baseScore: number,
  patternStrength: 'strong' | 'medium' | 'weak'
): number {
  switch (patternStrength) {
    case 'strong':
      return baseScore * 1.15; // +15%
    case 'medium':
      return baseScore * 1.0; // 不变
    case 'weak':
      return baseScore * 0.85; // -15%
    default:
      return baseScore;
  }
}
