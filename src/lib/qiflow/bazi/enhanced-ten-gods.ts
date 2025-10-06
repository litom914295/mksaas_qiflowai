/**
 * QiFlow AI - 增强型十神分析系统
 * 
 * 基于传统命理学的完整十神分析引擎
 * 实现十神关系矩阵、组合效应、力量分析等核心功能
 * 
 * 核心特性：
 * 1. 完整的十神关系矩阵和相互作用分析
 * 2. 十神组合效应评估（如官印相生、伤官见官等）
 * 3. 十神力量分布和影响权重计算
 * 4. 柱位作用效果分析（年月日时不同影响）
 * 5. 动态十神评估和人生阶段分析
 */

import type { Branch, FiveElement, Pillars, Stem } from './types';

// 十神枚举
export type TenGod = 
  | '比肩' | '劫财'         // 比劫系统
  | '食神' | '伤官'         // 食伤系统  
  | '偏财' | '正财'         // 财星系统
  | '偏官' | '正官'         // 官杀系统
  | '偏印' | '正印';        // 印星系统

// 十神系统分类
export type TenGodCategory = '比劫' | '食伤' | '财星' | '官杀' | '印星';

// 十神关系类型
export type TenGodRelation = 
  | '生助' | '克制' | '泄耗' | '相合' | '相冲' | '中性';

// 十神组合类型
export type TenGodCombination = 
  | '官印相生' | '财官相生' | '食神生财' | '印制食伤'
  | '伤官见官' | '财破印' | '比劫夺财' | '枭神夺食'
  | '杀印相生' | '伤官配印' | '食伤制杀' | '劫财合财';

// 十神力量等级
export type TenGodStrength = 'very_strong' | 'strong' | 'medium' | 'weak' | 'very_weak';

// 十神位置信息
export interface TenGodPosition {
  pillar: 'year' | 'month' | 'day' | 'hour';
  position: 'stem' | 'branch' | 'hidden';
  strength: number;  // 0-100
  visibility: number;  // 透干程度 0-100
}

// 十神详细信息
export interface TenGodInfo {
  god: TenGod;
  category: TenGodCategory;
  positions: TenGodPosition[];
  totalStrength: number;
  influence: TenGodStrength;
  characteristics: string[];
  meanings: {
    positive: string[];    // 正面含义
    negative: string[];    // 负面含义
    career: string[];      // 事业影响
    relationship: string[]; // 人际关系
    wealth: string[];      // 财运影响
    health: string[];      // 健康影响
  };
}

// 十神组合效应
export interface TenGodCombinationEffect {
  combination: TenGodCombination;
  gods: TenGod[];
  effect: 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative';
  strength: number;  // 0-100
  description: string;
  conditions: string[];  // 成立条件
  suggestions: string[]; // 应用建议
}

// 完整的十神分析结果
export interface EnhancedTenGodsAnalysis {
  // 基础十神信息
  tenGodsInfo: TenGodInfo[];
  
  // 十神分布统计
  distribution: {
    category: TenGodCategory;
    count: number;
    strength: number;
    dominance: number;  // 主导程度
  }[];
  
  // 十神组合分析
  combinations: TenGodCombinationEffect[];
  
  // 柱位分析
  pillarAnalysis: {
    year: { primary: TenGod; influence: string; meaning: string };
    month: { primary: TenGod; influence: string; meaning: string };
    day: { primary: TenGod; influence: string; meaning: string };
    hour: { primary: TenGod; influence: string; meaning: string };
  };
  
  // 生克关系分析
  relations: {
    beneficial: Array<{gods: TenGod[], relation: string, effect: string}>;
    detrimental: Array<{gods: TenGod[], relation: string, effect: string}>;
    neutral: Array<{gods: TenGod[], relation: string, effect: string}>;
  };
  
  // 人生阶段分析
  lifePhases: {
    youth: { dominant: TenGod[], traits: string[], guidance: string[] };
    middle: { dominant: TenGod[], traits: string[], guidance: string[] };
    elder: { dominant: TenGod[], traits: string[], guidance: string[] };
  };
  
  // 整体评估
  overallAssessment: {
    balance: number;        // 平衡度 0-100
    potential: number;      // 潜力指数 0-100
    challenges: string[];   // 主要挑战
    strengths: string[];    // 主要优势
    recommendations: string[];
  };
}

// 天干五行映射
const STEM_ELEMENTS: Record<Stem, FiveElement> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
};

// 地支藏干系统（含力量权重）
const BRANCH_HIDDEN_STEMS: Record<Branch, Array<{stem: Stem, strength: number}>> = {
  '子': [{stem: '癸', strength: 1.0}],
  '丑': [{stem: '己', strength: 0.6}, {stem: '癸', strength: 0.2}, {stem: '辛', strength: 0.2}],
  '寅': [{stem: '甲', strength: 0.6}, {stem: '丙', strength: 0.2}, {stem: '戊', strength: 0.2}],
  '卯': [{stem: '乙', strength: 1.0}],
  '辰': [{stem: '戊', strength: 0.6}, {stem: '乙', strength: 0.2}, {stem: '癸', strength: 0.2}],
  '巳': [{stem: '丙', strength: 0.6}, {stem: '戊', strength: 0.2}, {stem: '庚', strength: 0.2}],
  '午': [{stem: '丁', strength: 0.7}, {stem: '己', strength: 0.3}],
  '未': [{stem: '己', strength: 0.6}, {stem: '丁', strength: 0.2}, {stem: '乙', strength: 0.2}],
  '申': [{stem: '庚', strength: 0.6}, {stem: '壬', strength: 0.2}, {stem: '戊', strength: 0.2}],
  '酉': [{stem: '辛', strength: 1.0}],
  '戌': [{stem: '戊', strength: 0.6}, {stem: '辛', strength: 0.2}, {stem: '丁', strength: 0.2}],
  '亥': [{stem: '壬', strength: 0.7}, {stem: '甲', strength: 0.3}]
};

// 完整的十神关系矩阵
const TEN_GOD_MATRIX: Record<Stem, Record<Stem, TenGod>> = {
  '甲': {
    '甲': '比肩', '乙': '劫财', '丙': '食神', '丁': '伤官',
    '戊': '偏财', '己': '正财', '庚': '偏官', '辛': '正官',
    '壬': '偏印', '癸': '正印'
  },
  '乙': {
    '甲': '劫财', '乙': '比肩', '丙': '伤官', '丁': '食神',
    '戊': '正财', '己': '偏财', '庚': '正官', '辛': '偏官',
    '壬': '正印', '癸': '偏印'
  },
  '丙': {
    '甲': '偏印', '乙': '正印', '丙': '比肩', '丁': '劫财',
    '戊': '食神', '己': '伤官', '庚': '偏财', '辛': '正财',
    '壬': '偏官', '癸': '正官'
  },
  '丁': {
    '甲': '正印', '乙': '偏印', '丙': '劫财', '丁': '比肩',
    '戊': '伤官', '己': '食神', '庚': '正财', '辛': '偏财',
    '壬': '正官', '癸': '偏官'
  },
  '戊': {
    '甲': '偏官', '乙': '正官', '丙': '偏印', '丁': '正印',
    '戊': '比肩', '己': '劫财', '庚': '食神', '辛': '伤官',
    '壬': '偏财', '癸': '正财'
  },
  '己': {
    '甲': '正官', '乙': '偏官', '丙': '正印', '丁': '偏印',
    '戊': '劫财', '己': '比肩', '庚': '伤官', '辛': '食神',
    '壬': '正财', '癸': '偏财'
  },
  '庚': {
    '甲': '偏财', '乙': '正财', '丙': '偏官', '丁': '正官',
    '戊': '偏印', '己': '正印', '庚': '比肩', '辛': '劫财',
    '壬': '食神', '癸': '伤官'
  },
  '辛': {
    '甲': '正财', '乙': '偏财', '丙': '正官', '丁': '偏官',
    '戊': '正印', '己': '偏印', '庚': '劫财', '辛': '比肩',
    '壬': '伤官', '癸': '食神'
  },
  '壬': {
    '甲': '食神', '乙': '伤官', '丙': '偏财', '丁': '正财',
    '戊': '偏官', '己': '正官', '庚': '偏印', '辛': '正印',
    '壬': '比肩', '癸': '劫财'
  },
  '癸': {
    '甲': '伤官', '乙': '食神', '丙': '正财', '丁': '偏财',
    '戊': '正官', '己': '偏官', '庚': '正印', '辛': '偏印',
    '壬': '劫财', '癸': '比肩'
  }
};

// 十神分类映射
const TEN_GOD_CATEGORIES: Record<TenGod, TenGodCategory> = {
  '比肩': '比劫', '劫财': '比劫',
  '食神': '食伤', '伤官': '食伤', 
  '偏财': '财星', '正财': '财星',
  '偏官': '官杀', '正官': '官杀',
  '偏印': '印星', '正印': '印星'
};

// 十神关系评判
const TEN_GOD_RELATIONS: Record<string, TenGodRelation> = {
  // 生助关系
  '印星-比劫': '生助', '比劫-食伤': '生助', '食伤-财星': '生助', 
  '财星-官杀': '生助', '官杀-印星': '生助',
  
  // 克制关系  
  '比劫-财星': '克制', '财星-印星': '克制', '印星-食伤': '克制',
  '食伤-官杀': '克制', '官杀-比劫': '克制',
  
  // 泄耗关系
  '比劫-食伤-泄耗': '泄耗', '食伤-财星-泄耗': '泄耗', '财星-官杀-泄耗': '泄耗',
  '官杀-印星-泄耗': '泄耗', '印星-比劫-泄耗': '泄耗'
};

// 重要的十神组合配置
const IMPORTANT_COMBINATIONS: Record<TenGodCombination, {
  gods: TenGod[];
  conditions: string[];
  positive_effects: string[];
  negative_effects: string[];
  suggestions: string[];
}> = {
  '官印相生': {
    gods: ['正官', '正印'],
    conditions: ['正官与正印同时出现', '正印在月令或年柱', '正官有根有力'],
    positive_effects: ['利于考学升职', '权威地位稳固', '名声良好', '学识渊博'],
    negative_effects: ['过于保守', '缺乏创新精神', '依赖性强'],
    suggestions: ['适合从事管理、教育、公务等工作', '注重学习和修养', '培养独立思考能力']
  },
  '财官相生': {
    gods: ['正财', '正官'],
    conditions: ['财星有力', '正官透干', '财官不被破坏'],
    positive_effects: ['财运亨通', '事业有成', '社会地位高', '生活富裕'],
    negative_effects: ['可能贪财忘义', '压力较大', '应酬繁多'],
    suggestions: ['适合经商或从政', '注意财务规划', '保持清廉作风']
  },
  '食神生财': {
    gods: ['食神', '正财'],
    conditions: ['食神旺相', '财星有根', '不被偏印夺食'],
    positive_effects: ['财源广进', '生活安逸', '有艺术天赋', '人缘好'],
    negative_effects: ['可能贪图享受', '缺乏进取心', '理财能力需提升'],
    suggestions: ['发展才艺特长', '注重储蓄理财', '保持勤奋品质']
  },
  '伤官见官': {
    gods: ['伤官', '正官'],
    conditions: ['伤官强旺', '正官亦有力', '金水伤官除外'],
    positive_effects: ['才华横溢', '创新能力强', '敢于挑战'],
    negative_effects: ['容易与权威冲突', '官非诉讼', '人际关系紧张', '事业不稳'],
    suggestions: ['选择创新型职业', '避免正面冲突', '培养耐心和谦逊', '慎重选择合作伙伴']
  },
  '财破印': {
    gods: ['正财', '正印'],
    conditions: ['财星克制印星', '印星失力', '学业或名声受阻'],
    positive_effects: ['实用主义', '重视物质', '商业头脑'],
    negative_effects: ['学业中断', '文凭不高', '与长辈关系不佳', '健康问题'],
    suggestions: ['重视实用技能', '加强与母亲关系', '注意身体健康', '通过努力弥补学历不足']
  },
  '印制食伤': {
    gods: ['正印', '食神'],
    conditions: ['印星有力', '食神被制', '学习能力受限'],
    positive_effects: ['学习能力强', '有贵人相助', '知识渊博'],
    negative_effects: ['创造力受限', '表达能力弱', '过于保守'],
    suggestions: ['培养创新思维', '加强表达能力', '寻找平衡点']
  },
  '比劫夺财': {
    gods: ['比肩', '正财'],
    conditions: ['比劫强旺', '财星被夺', '财运不佳'],
    positive_effects: ['朋友多', '义气重', '团队精神'],
    negative_effects: ['破财', '竞争激烈', '财务压力'],
    suggestions: ['谨慎理财', '避免合伙', '培养独立能力']
  },
  '枭神夺食': {
    gods: ['偏印', '食神'],
    conditions: ['偏印强旺', '食神被夺', '才华受限'],
    positive_effects: ['学习能力强', '有特殊才能', '直觉敏锐'],
    negative_effects: ['创造力受限', '表达能力弱', '情绪不稳定'],
    suggestions: ['培养表达能力', '寻找创作机会', '保持情绪稳定']
  },
  '杀印相生': {
    gods: ['偏官', '正印'],
    conditions: ['七杀有力', '正印化杀', '权威与智慧结合'],
    positive_effects: ['权威地位', '智慧过人', '领导能力强'],
    negative_effects: ['压力大', '责任重', '容易疲劳'],
    suggestions: ['合理分配时间', '培养团队', '保持身心健康']
  },
  '伤官配印': {
    gods: ['伤官', '正印'],
    conditions: ['伤官强旺', '正印制伤', '才华与智慧平衡'],
    positive_effects: ['才华横溢', '智慧过人', '创新能力强'],
    negative_effects: ['容易骄傲', '人际关系复杂', '情绪波动'],
    suggestions: ['保持谦逊', '培养耐心', '平衡人际关系']
  },
  '食伤制杀': {
    gods: ['食神', '偏官'],
    conditions: ['食神有力', '七杀被制', '智慧战胜权威'],
    positive_effects: ['智慧过人', '解决问题能力强', '创新思维'],
    negative_effects: ['容易挑战权威', '人际关系紧张', '压力大'],
    suggestions: ['学会妥协', '培养沟通能力', '寻找平衡']
  },
  '劫财合财': {
    gods: ['劫财', '正财'],
    conditions: ['劫财合财', '财运被分', '合作与竞争并存'],
    positive_effects: ['合作能力强', '朋友多', '资源共享'],
    negative_effects: ['财运分散', '竞争激烈', '容易破财'],
    suggestions: ['谨慎合作', '明确分工', '保护自身利益']
  }
};

/**
 * 获取十神关系
 */
export function getTenGod(dayMaster: Stem, targetStem: Stem): TenGod {
  return TEN_GOD_MATRIX[dayMaster]?.[targetStem] || '比肩';
}

/**
 * 获取十神分类
 */
export function getTenGodCategory(god: TenGod): TenGodCategory {
  return TEN_GOD_CATEGORIES[god];
}

/**
 * 计算十神位置和力量
 */
function analyzeTenGodPositions(pillars: Pillars): Map<TenGod, TenGodPosition[]> {
  const dayMaster = pillars.day.stem;
  const positions = new Map<TenGod, TenGodPosition[]>();
  
  // 分析天干
  const stemPillars = [
    { pillar: 'year' as const, stem: pillars.year.stem },
    { pillar: 'month' as const, stem: pillars.month.stem },
    { pillar: 'hour' as const, stem: pillars.hour.stem }  // 不计日主自身
  ];
  
  stemPillars.forEach(({ pillar, stem }) => {
    const god = getTenGod(dayMaster, stem);
    const strength = pillar === 'month' ? 80 : pillar === 'year' ? 60 : 50;
    
    if (!positions.has(god)) {
      positions.set(god, []);
    }
    
    positions.get(god)!.push({
      pillar,
      position: 'stem',
      strength,
      visibility: 100  // 天干完全透出
    });
  });
  
  // 分析地支藏干
  const branchPillars = [
    { pillar: 'year' as const, branch: pillars.year.branch },
    { pillar: 'month' as const, branch: pillars.month.branch },
    { pillar: 'day' as const, branch: pillars.day.branch },
    { pillar: 'hour' as const, branch: pillars.hour.branch }
  ];
  
  branchPillars.forEach(({ pillar, branch }) => {
    const hiddenStems = BRANCH_HIDDEN_STEMS[branch];
    
    hiddenStems.forEach(({ stem, strength: hiddenStrength }) => {
      const god = getTenGod(dayMaster, stem);
      const baseStrength = pillar === 'month' ? 60 : pillar === 'day' ? 50 : 40;
      const adjustedStrength = baseStrength * hiddenStrength;
      
      // 检查是否透干（影响visibility）
      const isTransparent = stemPillars.some(sp => sp.stem === stem);
      const visibility = isTransparent ? 80 : hiddenStrength * 60;
      
      if (!positions.has(god)) {
        positions.set(god, []);
      }
      
      positions.get(god)!.push({
        pillar,
        position: 'hidden',
        strength: adjustedStrength,
        visibility
      });
    });
  });
  
  return positions;
}

/**
 * 计算十神总体力量
 */
function calculateTenGodStrength(positions: TenGodPosition[]): {
  totalStrength: number;
  influence: TenGodStrength;
} {
  const totalStrength = positions.reduce((sum, pos) => {
    // 力量计算：基础力量 × 透干系数 × 位置权重
    const transparentMultiplier = pos.visibility / 100;
    const positionWeight = pos.pillar === 'month' ? 1.2 : 
                          pos.pillar === 'day' ? 1.1 : 1.0;
    
    return sum + (pos.strength * transparentMultiplier * positionWeight);
  }, 0);
  
  let influence: TenGodStrength;
  if (totalStrength >= 120) influence = 'very_strong';
  else if (totalStrength >= 80) influence = 'strong';
  else if (totalStrength >= 50) influence = 'medium';
  else if (totalStrength >= 20) influence = 'weak';
  else influence = 'very_weak';
  
  return { totalStrength, influence };
}

/**
 * 获取十神含义解释
 */
function getTenGodMeanings(god: TenGod, strength: TenGodStrength): TenGodInfo['meanings'] {
  const baseMeanings: Record<TenGod, TenGodInfo['meanings']> = {
    '比肩': {
      positive: ['坚毅果断', '独立自主', '责任感强', '原则性强'],
      negative: ['固执己见', '不善合作', '孤立无援', '争强好胜'],
      career: ['适合独立创业', '管理职位', '技术专家'],
      relationship: ['朋友关系平等', '不喜依赖他人', '重视友谊'],
      wealth: ['理财保守', '不善投机', '稳定收入'],
      health: ['体质较好', '抗压能力强', '需注意过劳']
    },
    '劫财': {
      positive: ['行动力强', '敢于冒险', '适应力好', '有领导才能'],
      negative: ['冲动易怒', '破财损失', '人际冲突', '婚姻不顺'],
      career: ['销售业务', '竞争性行业', '体育运动'],
      relationship: ['容易与同性竞争', '异性缘佳', '朋友关系复杂'],
      wealth: ['财运起伏', '投资风险大', '易受人拖累'],
      health: ['精力充沛', '易受外伤', '注意心血管']
    },
    '食神': {
      positive: ['才华横溢', '生活安逸', '人缘好', '有艺术天赋'],
      negative: ['贪图享受', '缺乏进取心', '理想化', '依赖性强'],
      career: ['艺术创作', '餐饮服务', '教育培训', '自由职业'],
      relationship: ['善于表达', '讨人喜欢', '异性缘好'],
      wealth: ['财源稳定', '生活富裕', '不愁吃穿'],
      health: ['消化系统好', '长寿相', '注意肥胖']
    },
    '伤官': {
      positive: ['聪明机智', '创新能力强', '多才多艺', '敢于表现'],
      negative: ['叛逆心强', '容易得罪人', '心高气傲', '变化无常'],
      career: ['创新行业', '艺术表演', '自媒体', '设计创作'],
      relationship: ['表达能力强', '容易与上级冲突', '异性缘复杂'],
      wealth: ['收入不稳', '靠才华赚钱', '投资眼光好'],
      health: ['神经敏感', '易失眠', '注意呼吸系统']
    },
    '偏财': {
      positive: ['商业头脑', '交际能力强', '机会把握好', '生活享受'],
      negative: ['贪心不足', '用情不专', '投机心重', '挥霍无度'],
      career: ['商业贸易', '投资理财', '服务行业', '娱乐业'],
      relationship: ['异性缘佳', '容易有外遇', '朋友众多'],
      wealth: ['偏财运好', '投资收益', '意外之财'],
      health: ['应酬多', '易劳累', '注意肝胆']
    },
    '正财': {
      positive: ['勤劳节俭', '理财有方', '生活稳定', '责任心强'],
      negative: ['过于吝啬', '缺乏冒险精神', '保守固执', '压力大'],
      career: ['财会金融', '传统行业', '实体经济', '管理职位'],
      relationship: ['重视家庭', '专一忠诚', '异性缘一般'],
      wealth: ['正财稳定', '积累财富', '投资保守'],
      health: ['体质稳定', '工作压力', '注意脾胃']
    },
    '偏官': {
      positive: ['魄力十足', '执行力强', '不畏困难', '有威严'],
      negative: ['脾气急躁', '压力很大', '容易树敌', '健康问题'],
      career: ['军警司法', '企业高管', '竞争行业', '技术专家'],
      relationship: ['威严但缺温情', '异性敬畏', '部下敬重'],
      wealth: ['收入不稳', '压力换财', '投资激进'],
      health: ['压力大', '易生病', '注意心脏血压']
    },
    '正官': {
      positive: ['品德高尚', '受人尊敬', '事业稳定', '有权威'],
      negative: ['保守刻板', '压力沉重', '缺乏创新', '过于拘谨'],
      career: ['政府机关', '大型企业', '教育机构', '传统行业'],
      relationship: ['受人尊敬', '异性缘佳', '婚姻稳定'],
      wealth: ['收入稳定', '社会地位', '福利待遇'],
      health: ['生活规律', '工作压力', '注意颈椎']
    },
    '偏印': {
      positive: ['学识渊博', '思维敏锐', '直觉力强', '有特殊技能'],
      negative: ['孤僻冷漠', '缺乏温情', '思虑过度', '人际关系差'],
      career: ['研究工作', '技术开发', '占卜医学', '特殊行业'],
      relationship: ['不善表达', '朋友不多', '容易孤独'],
      wealth: ['收入不稳', '靠技能赚钱', '理财一般'],
      health: ['体质偏弱', '精神压力', '注意神经系统']
    },
    '正印': {
      positive: ['仁慈宽厚', '学习能力强', '有贵人相助', '文化修养高'],
      negative: ['依赖性强', '缺乏主见', '行动迟缓', '容易满足'],
      career: ['教育文化', '医疗卫生', '宗教慈善', '学术研究'],
      relationship: ['长辈缘好', '得人疼爱', '贵人运强'],
      wealth: ['财运平稳', '不愁吃穿', '理财保守'],
      health: ['体质较好', '长寿', '注意消化系统']
    }
  };
  
  const base = baseMeanings[god];
  
  // 根据强弱调整含义的强度
  if (strength === 'very_strong') {
    base.negative = [...base.negative, '过于极端', '失去平衡'];
  } else if (strength === 'very_weak') {
    base.positive = base.positive.map(p => `偶尔${p}`);
    base.negative = [...base.negative, '发挥不足', '缺乏此方面能力'];
  }
  
  return base;
}

/**
 * 分析十神组合效应
 */
function analyzeTenGodCombinations(
  tenGodsInfo: TenGodInfo[], 
  pillars: Pillars
): TenGodCombinationEffect[] {
  const effects: TenGodCombinationEffect[] = [];
  const dayMaster = pillars.day.stem;
  
  // 检查重要组合
  for (const [combName, config] of Object.entries(IMPORTANT_COMBINATIONS)) {
    const combination = combName as TenGodCombination;
    const requiredGods = config.gods;
    
    // 检查所需十神是否都存在且有一定力量
    const presentGods = tenGodsInfo.filter(info => 
      requiredGods.includes(info.god) && info.influence !== 'very_weak'
    );
    
    if (presentGods.length === requiredGods.length) {
      // 计算组合强度
      const avgStrength = presentGods.reduce((sum, info) => sum + info.totalStrength, 0) 
                         / presentGods.length;
      
      // 检查成立条件
      const metConditions = checkCombinationConditions(combination, pillars, presentGods);
      
      let effect: TenGodCombinationEffect['effect'] = 'neutral';
      let description = '';
      
      if (metConditions >= 0.8) {
        effect = config.positive_effects.length > config.negative_effects.length ? 
                'very_positive' : 'positive';
        description = `${combination}格局成立，${config.positive_effects.join('，')}`;
      } else if (metConditions >= 0.5) {
        effect = 'positive';
        description = `${combination}格局基本成立，${config.positive_effects.slice(0, 2).join('，')}`;
      } else {
        effect = config.negative_effects.length > 2 ? 'negative' : 'neutral';
        description = `${combination}格局不完整，${config.negative_effects.slice(0, 2).join('，')}`;
      }
      
      effects.push({
        combination,
        gods: requiredGods,
        effect,
        strength: Math.min(100, avgStrength * metConditions),
        description,
        conditions: config.conditions,
        suggestions: config.suggestions
      });
    }
  }
  
  return effects;
}

/**
 * 检查组合成立条件
 */
function checkCombinationConditions(
  combination: TenGodCombination,
  pillars: Pillars,
  presentGods: TenGodInfo[]
): number {
  let score = 0.5;  // 基础分
  
  switch (combination) {
    case '官印相生':
      // 正官正印配合，印在月令更佳
      const hasMonthPrint = presentGods.some(god => 
        god.god === '正印' && god.positions.some(pos => pos.pillar === 'month')
      );
      const hasStrongOfficial = presentGods.some(god => 
        god.god === '正官' && god.influence !== 'weak'
      );
      if (hasMonthPrint) score += 0.2;
      if (hasStrongOfficial) score += 0.2;
      break;
      
    case '财官相生':
      // 财星生官星，财官都要有力
      const strongWealth = presentGods.find(god => god.god === '正财')?.influence;
      const strongOfficial2 = presentGods.find(god => god.god === '正官')?.influence;
      if (strongWealth && ['strong', 'very_strong'].includes(strongWealth)) score += 0.2;
      if (strongOfficial2 && ['strong', 'very_strong'].includes(strongOfficial2)) score += 0.2;
      break;
      
    case '伤官见官':
      // 这是凶组合，需要特殊处理
      const dayElement = STEM_ELEMENTS[pillars.day.stem];
      const monthBranch = pillars.month.branch;
      
      // 金水伤官见官不忌
      if (dayElement === '金' && ['子', '亥'].includes(monthBranch)) {
        score = 0.8;
      } else {
        score = 0.2;  // 其他情况多为凶
      }
      break;
      
    default:
      // 通用评判：看十神力量和配置
      const avgStrength = presentGods.reduce((sum, god) => {
        const strengthValue = god.influence === 'very_strong' ? 5 :
                            god.influence === 'strong' ? 4 :
                            god.influence === 'medium' ? 3 :
                            god.influence === 'weak' ? 2 : 1;
        return sum + strengthValue;
      }, 0) / presentGods.length;
      
      score += (avgStrength - 2.5) * 0.1;
      break;
  }
  
  return Math.max(0, Math.min(1, score));
}

/**
 * 分析柱位影响
 */
function analyzePillarInfluence(pillars: Pillars): EnhancedTenGodsAnalysis['pillarAnalysis'] {
  const dayMaster = pillars.day.stem;
  
  return {
    year: {
      primary: getTenGod(dayMaster, pillars.year.stem),
      influence: '祖辈、早年环境、社会背景',
      meaning: '代表出身环境和早年际遇，影响人生格局基础'
    },
    month: {
      primary: getTenGod(dayMaster, pillars.month.stem), 
      influence: '父母、中年事业、主要格局',
      meaning: '最重要的格局来源，决定事业方向和人生主题'
    },
    day: {
      primary: '比肩',  // 日主本身
      influence: '自身、配偶、核心性格',
      meaning: '代表自身特质和夫妻宫，是命局的核心'
    },
    hour: {
      primary: getTenGod(dayMaster, pillars.hour.stem),
      influence: '子女、晚年、发展方向',
      meaning: '代表发展潜力和晚年运势，子女关系'
    }
  };
}

/**
 * 主函数：增强型十神分析
 */
export function enhancedTenGodsAnalysis(pillars: Pillars): EnhancedTenGodsAnalysis {
  // 分析十神位置和力量
  const tenGodPositions = analyzeTenGodPositions(pillars);
  
  // 构建十神信息
  const tenGodsInfo: TenGodInfo[] = [];
  for (const [god, positions] of tenGodPositions.entries()) {
    const { totalStrength, influence } = calculateTenGodStrength(positions);
    const meanings = getTenGodMeanings(god, influence);
    
    tenGodsInfo.push({
      god,
      category: getTenGodCategory(god),
      positions,
      totalStrength,
      influence,
      characteristics: [], // 可以根据需要添加特征描述
      meanings
    });
  }
  
  // 统计分布
  const categoryStats = new Map<TenGodCategory, {count: number, strength: number}>();
  for (const info of tenGodsInfo) {
    const current = categoryStats.get(info.category) || {count: 0, strength: 0};
    categoryStats.set(info.category, {
      count: current.count + 1,
      strength: current.strength + info.totalStrength
    });
  }
  
  const totalStrength = tenGodsInfo.reduce((sum, info) => sum + info.totalStrength, 0);
  const distribution = Array.from(categoryStats.entries()).map(([category, stats]) => ({
    category,
    count: stats.count,
    strength: stats.strength,
    dominance: stats.strength / Math.max(totalStrength, 1) * 100
  }));
  
  // 分析组合效应
  const combinations = analyzeTenGodCombinations(tenGodsInfo, pillars);
  
  // 柱位分析
  const pillarAnalysis = analyzePillarInfluence(pillars);
  
  // 生克关系分析
  const relations = {
    beneficial: [] as Array<{gods: TenGod[], relation: string, effect: string}>,
    detrimental: [] as Array<{gods: TenGod[], relation: string, effect: string}>,
    neutral: [] as Array<{gods: TenGod[], relation: string, effect: string}>
  };
  
  // 人生阶段分析
  const lifePhases = {
    youth: { 
      dominant: [pillarAnalysis.year.primary], 
      traits: ['受家庭环境影响较大', '性格形成期'], 
      guidance: ['重视教育', '培养良好习惯'] 
    },
    middle: { 
      dominant: [pillarAnalysis.month.primary], 
      traits: ['事业发展期', '承担主要责任'], 
      guidance: ['专注事业发展', '平衡家庭工作'] 
    },
    elder: { 
      dominant: [pillarAnalysis.hour.primary], 
      traits: ['享受生活', '关注子女'], 
      guidance: ['保持健康', '传承经验'] 
    }
  };
  
  // 整体评估
  const balance = Math.min(100, 100 - (Math.max(...distribution.map(d => d.dominance)) - 20));
  const potential = tenGodsInfo.reduce((sum, info) => {
    const bonus = info.influence === 'very_strong' ? 15 : 
                 info.influence === 'strong' ? 10 : 
                 info.influence === 'medium' ? 5 : 0;
    return sum + bonus;
  }, 50);
  
  const challenges: string[] = [];
  const strengths: string[] = [];
  const recommendations: string[] = [];
  
  // 根据分析结果生成建议
  if (balance < 50) {
    challenges.push('十神分布不平衡，某方面过强或过弱');
    recommendations.push('注意培养弱势领域，节制优势方面');
  }
  
  combinations.forEach(combo => {
    if (combo.effect === 'very_positive' || combo.effect === 'positive') {
      strengths.push(combo.description);
      recommendations.push(...combo.suggestions.slice(0, 2));
    } else if (combo.effect === 'negative') {
      challenges.push(combo.description);
      recommendations.push(...combo.suggestions.slice(0, 1));
    }
  });
  
  return {
    tenGodsInfo,
    distribution,
    combinations,
    pillarAnalysis,
    relations,
    lifePhases,
    overallAssessment: {
      balance,
      potential: Math.min(100, potential),
      challenges,
      strengths,
      recommendations: [...new Set(recommendations)].slice(0, 8)  // 去重并限制数量
    }
  };
}

/**
 * 获取十神简要说明
 */
export function getTenGodBriefDescription(god: TenGod): string {
  const descriptions: Record<TenGod, string> = {
    '比肩': '代表自我、朋友、竞争，主独立自主',
    '劫财': '代表兄弟、合作、争夺，主行动力强',
    '食神': '代表才华、享受、子女，主生活安逸',
    '伤官': '代表创新、表现、叛逆，主才华横溢',
    '偏财': '代表投资、机遇、情人，主商业头脑',
    '正财': '代表工作、妻子、财产，主勤劳节俭',
    '偏官': '代表权力、压力、威严，主魄力十足',
    '正官': '代表职位、名声、丈夫，主品德高尚',
    '偏印': '代表学问、技能、孤独，主思维敏锐',
    '正印': '代表文化、母亲、贵人，主仁慈宽厚'
  };
  
  return descriptions[god];
}