/**
 * 十神关系分析器
 * 分析十神之间的生克制化、组合模式和力量对比
 */

import type { FourPillars } from '../calculator/four-pillars';
import { type TenGodsResult, tenGodsCalculator } from '../calculator/ten-gods';
import { WuxingStrength, wuxingStrengthAnalyzer } from './wuxing-strength';

export interface TenGodRelation {
  source: string; // 源十神
  target: string; // 目标十神
  type: 'generate' | 'control' | 'merge' | 'clash' | 'harm'; // 关系类型
  strength: number; // 关系强度 0-100
  description: string; // 关系描述
}

export interface TenGodCombination {
  gods: string[]; // 参与组合的十神
  type: string; // 组合类型
  pattern: string; // 组合格局
  meaning: string; // 组合含义
  score: number; // 组合评分 0-100
}

export interface TenGodBalance {
  officialKilling: number; // 官杀力量
  wealthFood: number; // 财食力量
  sealLibrary: number; // 印枭力量
  robWealth: number; // 比劫力量
  injuryFood: number; // 伤食力量

  // 平衡分析
  balance: {
    type:
      | 'balanced'
      | 'official_heavy'
      | 'seal_heavy'
      | 'wealth_heavy'
      | 'food_heavy'
      | 'rob_heavy';
    description: string;
    suggestions: string[];
  };
}

export interface TenGodAnalysis {
  relations: TenGodRelation[];
  combinations: TenGodCombination[];
  balance: TenGodBalance;
  patterns: string[];
  personality: PersonalityTraits;
}

export interface PersonalityTraits {
  strengths: string[];
  weaknesses: string[];
  career: string[];
  relationships: string[];
  wealth: string[];
  health: string[];
}

/**
 * 十神关系分析器
 */
export class TenGodRelationAnalyzer {
  // 十神生克关系
  private readonly GENERATING_RELATIONS: Record<string, string[]> = {
    正印: ['比肩', '劫财'],
    偏印: ['比肩', '劫财'],
    比肩: ['食神', '伤官'],
    劫财: ['食神', '伤官'],
    食神: ['正财', '偏财'],
    伤官: ['正财', '偏财'],
    正财: ['正官', '七杀'],
    偏财: ['正官', '七杀'],
    正官: ['正印', '偏印'],
    七杀: ['正印', '偏印'],
  };

  private readonly CONTROLLING_RELATIONS: Record<string, string[]> = {
    正印: ['食神', '伤官'],
    偏印: ['食神', '伤官'],
    比肩: ['正财', '偏财'],
    劫财: ['正财', '偏财'],
    食神: ['正官', '七杀'],
    伤官: ['正官', '七杀'],
    正财: ['正印', '偏印'],
    偏财: ['正印', '偏印'],
    正官: ['比肩', '劫财'],
    七杀: ['比肩', '劫财'],
  };

  // 十神组合模式
  private readonly COMBINATION_PATTERNS = [
    {
      gods: ['正官', '正印'],
      type: '官印相生',
      pattern: '贵格',
      meaning: '官印相生，主贵，利学业事业，有权威地位',
    },
    {
      gods: ['七杀', '正印'],
      type: '杀印相生',
      pattern: '权威格',
      meaning: '杀印相生，化杀为权，主武贵，有管理才能',
    },
    {
      gods: ['食神', '正财'],
      type: '食神生财',
      pattern: '富格',
      meaning: '食神生财，财源广进，善经营，有商业头脑',
    },
    {
      gods: ['伤官', '正财'],
      type: '伤官生财',
      pattern: '技艺生财',
      meaning: '伤官生财，技艺谋生，创新创业，财运佳',
    },
    {
      gods: ['正财', '正官'],
      type: '财官相生',
      pattern: '富贵格',
      meaning: '财官相生，富贵双全，事业财运俱佳',
    },
    {
      gods: ['比肩', '劫财', '食神'],
      type: '比劫食神',
      pattern: '团队合作',
      meaning: '比劫配食神，善于合作，人缘好，团队精神',
    },
    {
      gods: ['伤官', '七杀'],
      type: '伤官制杀',
      pattern: '制杀格',
      meaning: '伤官制杀，聪明果断，有领导力，适合管理',
    },
    {
      gods: ['食神', '七杀'],
      type: '食神制杀',
      pattern: '化煞格',
      meaning: '食神制杀，温和化解压力，逢凶化吉',
    },
    {
      gods: ['正印', '偏印'],
      type: '印星过重',
      pattern: '学术格',
      meaning: '印星重叠，学术研究，但需防思虑过度',
    },
    {
      gods: ['正财', '偏财'],
      type: '财星混杂',
      pattern: '理财格',
      meaning: '正偏财混杂，财源多但需谨慎理财',
    },
    {
      gods: ['正官', '七杀'],
      type: '官杀混杂',
      pattern: '压力格',
      meaning: '官杀混杂，压力大，需要印星化解',
    },
    {
      gods: ['食神', '伤官'],
      type: '食伤并透',
      pattern: '才华格',
      meaning: '食伤并透，才华横溢，表达能力强',
    },
  ];

  // 十神性格特征映射
  private readonly PERSONALITY_TRAITS: Record<string, any> = {
    正官: {
      strengths: ['责任心强', '正直守信', '管理能力强'],
      weaknesses: ['保守谨慎', '缺乏灵活性'],
      career: ['公务员', '管理层', '法律行业'],
      wealth: ['稳定收入', '正财为主'],
    },
    七杀: {
      strengths: ['果断勇敢', '执行力强', '有魄力'],
      weaknesses: ['脾气急躁', '过于强势'],
      career: ['军警', '企业高管', '竞技体育'],
      wealth: ['冒险投资', '高风险高收益'],
    },
    正印: {
      strengths: ['善良慈祥', '有学识', '有修养'],
      weaknesses: ['依赖性强', '缺乏主见'],
      career: ['教育', '文化', '慈善事业'],
      wealth: ['稳定但不丰厚'],
    },
    偏印: {
      strengths: ['聪明机智', '有创意', '独立性强'],
      weaknesses: ['孤僻内向', '猜疑心重'],
      career: ['研发', '艺术', '特殊技能'],
      wealth: ['偏财意外之财'],
    },
    比肩: {
      strengths: ['独立自主', '坚持不懈', '公平正义'],
      weaknesses: ['固执己见', '不善变通'],
      career: ['自由职业', '合作事业'],
      wealth: ['辛苦所得', '稳步积累'],
    },
    劫财: {
      strengths: ['豪爽大方', '交际能力强', '有冲劲'],
      weaknesses: ['冲动鲁莽', '破财风险'],
      career: ['销售', '公关', '投资'],
      wealth: ['财来财去', '需要理财'],
    },
    食神: {
      strengths: ['温和善良', '有口福', '享受生活'],
      weaknesses: ['懒散安逸', '缺乏进取心'],
      career: ['餐饮', '娱乐', '服务业'],
      wealth: ['财运平稳', '知足常乐'],
    },
    伤官: {
      strengths: ['才华横溢', '创新能力强', '表达力好'],
      weaknesses: ['傲慢自大', '不服管教'],
      career: ['艺术', '媒体', '自主创业'],
      wealth: ['技能生财', '财运起伏'],
    },
    正财: {
      strengths: ['勤俭节约', '理财有方', '踏实稳重'],
      weaknesses: ['吝啬小气', '过于保守'],
      career: ['财务', '银行', '稳定行业'],
      wealth: ['正财稳定', '积少成多'],
    },
    偏财: {
      strengths: ['慷慨大方', '人缘好', '有商业头脑'],
      weaknesses: ['浪费挥霍', '投机心理'],
      career: ['商业', '投资', '营销'],
      wealth: ['偏财旺盛', '意外之财'],
    },
  };

  /**
   * 分析十神关系
   */
  public analyzeTenGodRelations(
    fourPillars: FourPillars,
    tenGods: TenGodsResult
  ): TenGodAnalysis {
    // 收集所有十神
    const allGods = this.collectAllTenGods(tenGods);

    // 分析十神之间的关系
    const relations = this.analyzeRelations(allGods);

    // 识别十神组合
    const combinations = this.identifyCombinations(allGods);

    // 分析十神平衡
    const balance = this.analyzeTenGodBalance(allGods, fourPillars);

    // 识别格局
    const patterns = this.identifyPatterns(combinations, balance);

    // 分析性格特征
    const personality = this.analyzePersonality(allGods, combinations);

    return {
      relations,
      combinations,
      balance,
      patterns,
      personality,
    };
  }

  /**
   * 收集所有十神
   */
  private collectAllTenGods(tenGods: any): Map<string, number> {
    const godsCount = new Map<string, number>();

    // tenGods 是一个简单的对象，包含各十神的计数
    // 例如: { 正官: 1, 偏官: 0, 正印: 2, ... }
    if (tenGods && typeof tenGods === 'object') {
      for (const [god, count] of Object.entries(tenGods)) {
        if (typeof count === 'number' && count > 0) {
          godsCount.set(god, count);
        }
      }
    }

    return godsCount;
  }

  /**
   * 分析十神关系
   */
  private analyzeRelations(allGods: Map<string, number>): TenGodRelation[] {
    const relations: TenGodRelation[] = [];
    const gods = Array.from(allGods.keys());

    for (const sourceGod of gods) {
      // 生的关系
      const generated = this.GENERATING_RELATIONS[sourceGod] || [];
      for (const targetGod of generated) {
        if (allGods.has(targetGod)) {
          const sourceStrength = allGods.get(sourceGod) || 0;
          const targetStrength = allGods.get(targetGod) || 0;

          relations.push({
            source: sourceGod,
            target: targetGod,
            type: 'generate',
            strength: Math.min(sourceStrength * 20, 100),
            description: `${sourceGod}生${targetGod}，增强${targetGod}的力量`,
          });
        }
      }

      // 克的关系
      const controlled = this.CONTROLLING_RELATIONS[sourceGod] || [];
      for (const targetGod of controlled) {
        if (allGods.has(targetGod)) {
          const sourceStrength = allGods.get(sourceGod) || 0;
          const targetStrength = allGods.get(targetGod) || 0;

          relations.push({
            source: sourceGod,
            target: targetGod,
            type: 'control',
            strength: Math.min(sourceStrength * 15, 100),
            description: `${sourceGod}克${targetGod}，削弱${targetGod}的力量`,
          });
        }
      }
    }

    return relations;
  }

  /**
   * 识别十神组合
   */
  private identifyCombinations(
    allGods: Map<string, number>
  ): TenGodCombination[] {
    const combinations: TenGodCombination[] = [];
    const presentGods = Array.from(allGods.keys());

    for (const pattern of this.COMBINATION_PATTERNS) {
      // 检查组合中的所有十神是否都存在
      const hasAllGods = pattern.gods.every((god) => presentGods.includes(god));

      if (hasAllGods) {
        // 计算组合强度
        let totalStrength = 0;
        for (const god of pattern.gods) {
          totalStrength += allGods.get(god) || 0;
        }
        const avgStrength = totalStrength / pattern.gods.length;

        combinations.push({
          gods: pattern.gods,
          type: pattern.type,
          pattern: pattern.pattern,
          meaning: pattern.meaning,
          score: Math.min(avgStrength * 20, 100),
        });
      }
    }

    // 按评分排序
    combinations.sort((a, b) => b.score - a.score);

    return combinations;
  }

  /**
   * 分析十神平衡
   */
  private analyzeTenGodBalance(
    allGods: Map<string, number>,
    fourPillars: FourPillars
  ): TenGodBalance {
    // 计算各类十神的总力量
    const officialKilling =
      (allGods.get('正官') || 0) + (allGods.get('七杀') || 0);

    const wealthFood = (allGods.get('正财') || 0) + (allGods.get('偏财') || 0);

    const sealLibrary = (allGods.get('正印') || 0) + (allGods.get('偏印') || 0);

    const robWealth = (allGods.get('比肩') || 0) + (allGods.get('劫财') || 0);

    const injuryFood = (allGods.get('食神') || 0) + (allGods.get('伤官') || 0);

    // 判断平衡类型
    const maxPower = Math.max(
      officialKilling,
      wealthFood,
      sealLibrary,
      robWealth,
      injuryFood
    );

    let balanceType: TenGodBalance['balance']['type'];
    let description: string;
    let suggestions: string[] = [];

    if (maxPower === officialKilling && officialKilling > 3) {
      balanceType = 'official_heavy';
      description = '官杀过重，压力较大';
      suggestions = [
        '需要印星化解官杀压力',
        '加强自身能力建设',
        '学会调节压力',
      ];
    } else if (maxPower === sealLibrary && sealLibrary > 3) {
      balanceType = 'seal_heavy';
      description = '印星过重，依赖性强';
      suggestions = ['需要食伤泄身', '增强独立性', '避免过度依赖他人'];
    } else if (maxPower === wealthFood && wealthFood > 3) {
      balanceType = 'wealth_heavy';
      description = '财星过重，物欲较强';
      suggestions = ['需要比劫帮身', '注意理财规划', '避免过度消费'];
    } else if (maxPower === injuryFood && injuryFood > 3) {
      balanceType = 'food_heavy';
      description = '食伤过重，个性张扬';
      suggestions = ['需要印星制约', '收敛个性', '注意人际关系'];
    } else if (maxPower === robWealth && robWealth > 3) {
      balanceType = 'rob_heavy';
      description = '比劫过重，竞争激烈';
      suggestions = ['需要官杀制约', '学会合作共赢', '避免过度竞争'];
    } else {
      balanceType = 'balanced';
      description = '十神力量相对平衡';
      suggestions = ['继续保持平衡发展', '发挥各方面优势', '注意扬长避短'];
    }

    return {
      officialKilling,
      wealthFood,
      sealLibrary,
      robWealth,
      injuryFood,
      balance: {
        type: balanceType,
        description,
        suggestions,
      },
    };
  }

  /**
   * 识别格局
   */
  private identifyPatterns(
    combinations: TenGodCombination[],
    balance: TenGodBalance
  ): string[] {
    const patterns: string[] = [];

    // 根据组合识别格局
    for (const combo of combinations) {
      if (combo.score > 60) {
        patterns.push(combo.pattern);
      }
    }

    // 根据平衡情况识别格局
    if (balance.balance.type === 'official_heavy') {
      patterns.push('官杀格');
    } else if (balance.balance.type === 'seal_heavy') {
      patterns.push('印绶格');
    } else if (balance.balance.type === 'wealth_heavy') {
      patterns.push('财格');
    } else if (balance.balance.type === 'food_heavy') {
      patterns.push('食伤格');
    } else if (balance.balance.type === 'rob_heavy') {
      patterns.push('比劫格');
    }

    // 去重
    return [...new Set(patterns)];
  }

  /**
   * 分析性格特征
   */
  private analyzePersonality(
    allGods: Map<string, number>,
    combinations: TenGodCombination[]
  ): PersonalityTraits {
    const personality: PersonalityTraits = {
      strengths: [],
      weaknesses: [],
      career: [],
      relationships: [],
      wealth: [],
      health: [],
    };

    // 基于十神分析性格
    for (const [god, strength] of allGods.entries()) {
      if (strength > 1) {
        const traits = this.PERSONALITY_TRAITS[god];
        if (traits) {
          personality.strengths.push(...traits.strengths);
          personality.weaknesses.push(...traits.weaknesses);
          personality.career.push(...traits.career);
          personality.wealth.push(...traits.wealth);
        }
      }
    }

    // 基于组合补充性格分析
    for (const combo of combinations) {
      if (combo.score > 50) {
        // 根据组合类型添加特征
        if (combo.type === '官印相生') {
          personality.strengths.push('学业事业双优');
          personality.career.push('适合公职或学术');
        } else if (combo.type === '食神生财') {
          personality.strengths.push('财运亨通');
          personality.wealth.push('善于理财投资');
        } else if (combo.type === '伤官生财') {
          personality.strengths.push('才华变现能力强');
          personality.career.push('适合创业或自由职业');
        }
      }
    }

    // 关系方面的分析
    if (allGods.get('正财') && allGods.get('正官')) {
      personality.relationships.push('感情稳定专一');
    }
    if (allGods.get('偏财') && allGods.get('偏财')! > 1) {
      personality.relationships.push('异性缘佳但需专一');
    }
    if (allGods.get('比肩') && allGods.get('劫财')) {
      personality.relationships.push('朋友多但需甄别');
    }

    // 健康方面的分析
    if (allGods.get('七杀')! > 2) {
      personality.health.push('注意压力管理');
    }
    if (allGods.get('伤官')! > 2) {
      personality.health.push('注意情绪调节');
    }
    if (allGods.get('食神')) {
      personality.health.push('注意饮食健康');
    }

    // 去重
    personality.strengths = [...new Set(personality.strengths)];
    personality.weaknesses = [...new Set(personality.weaknesses)];
    personality.career = [...new Set(personality.career)];
    personality.relationships = [...new Set(personality.relationships)];
    personality.wealth = [...new Set(personality.wealth)];
    personality.health = [...new Set(personality.health)];

    return personality;
  }
}

// 导出单例
export const tenGodRelationAnalyzer = new TenGodRelationAnalyzer();
