/**
 * QiFlow AI - 十神系统 (Ten Gods System)
 *
 * 八字命理中的十神系统，用于分析命格特征、性格倾向、运势变化等
 * 十神：比肩、劫财、食神、伤官、偏财、正财、七杀、正官、偏印、正印
 */

import type { Branch, FiveElement, Pillars, Stem } from './types';

export type TenGod =
  | '比肩' // 劫财 (Rob Wealth) - 与日干同阴阳的同五行
  | '劫财' // 比肩 (Equal)      - 与日干异阴阳的同五行
  | '食神' // 食神 (Food God)   - 日干生且同阴阳
  | '伤官' // 伤官 (Hurting Officer) - 日干生且异阴阳
  | '偏财' // 偏财 (Indirect Wealth) - 日干克且同阴阳
  | '正财' // 正财 (Direct Wealth)   - 日干克且异阴阳
  | '七杀' // 七杀 (Seven Killings)  - 克日干且同阴阳
  | '正官' // 正官 (Direct Officer)   - 克日干且异阴阳
  | '偏印' // 偏印 (Indirect Seal)   - 生日干且同阴阳
  | '正印'; // 正印 (Direct Seal)     - 生日干且异阴阳

export interface TenGodRelationship {
  god: TenGod;
  stem: Stem;
  pillar: 'year' | 'month' | 'day' | 'hour';
  strength: number; // 0-100
  influence: 'strong' | 'moderate' | 'weak';
}

export interface TenGodAnalysis {
  dayMaster: Stem; // 日干
  tenGodRelationships: TenGodRelationship[];
  dominantGods: TenGod[];
  personality: {
    strengths: string[];
    weaknesses: string[];
    talents: string[];
    challenges: string[];
  };
  career: {
    suitable: string[];
    unsuitable: string[];
    advice: string[];
  };
  relationships: {
    marriage: string[];
    friendship: string[];
    family: string[];
  };
  health: {
    strongAspects: string[];
    weakAspects: string[];
    advice: string[];
  };
  wealth: {
    potential: 'high' | 'medium' | 'low';
    sources: string[];
    advice: string[];
  };
}

/**
 * 十神计算器
 */
export class TenGodsCalculator {
  /**
   * 天干阴阳属性映射
   */
  private readonly stemPolarity: Record<Stem, 'yang' | 'yin'> = {
    甲: 'yang',
    乙: 'yin', // 木
    丙: 'yang',
    丁: 'yin', // 火
    戊: 'yang',
    己: 'yin', // 土
    庚: 'yang',
    辛: 'yin', // 金
    壬: 'yang',
    癸: 'yin', // 水
  };

  /**
   * 天干五行属性映射
   */
  private readonly stemElement: Record<Stem, FiveElement> = {
    甲: '木',
    乙: '木',
    丙: '火',
    丁: '火',
    戊: '土',
    己: '土',
    庚: '金',
    辛: '金',
    壬: '水',
    癸: '水',
  };

  /**
   * 五行相生相克关系
   */
  private readonly elementRelations = {
    generate: {
      // 相生
      木: '火',
      火: '土',
      土: '金',
      金: '水',
      水: '木',
    },
    control: {
      // 相克
      木: '土',
      火: '金',
      土: '水',
      金: '木',
      水: '火',
    },
  };

  /**
   * 计算四柱的十神关系
   */
  calculateTenGods(pillars: Pillars): TenGodAnalysis {
    const dayMaster = pillars.day.stem;
    const relationships: TenGodRelationship[] = [];

    // 分析年柱、月柱、时柱的天干与日干的关系
    const pillarNames = ['year', 'month', 'hour'] as const;

    for (const pillarName of pillarNames) {
      const pillar = pillars[pillarName];
      const god = this.calculateTenGod(dayMaster, pillar.stem);
      const strength = this.calculateInfluenceStrength(
        pillarName,
        pillar.stem,
        pillars
      );

      relationships.push({
        god,
        stem: pillar.stem,
        pillar: pillarName,
        strength,
        influence: this.getInfluenceLevel(strength),
      });
    }

    // 分析地支藏干（简化版）
    const hiddenStems = this.getHiddenStems(pillars);
    for (const hidden of hiddenStems) {
      const god = this.calculateTenGod(dayMaster, hidden.stem);
      relationships.push({
        god,
        stem: hidden.stem,
        pillar: hidden.pillar,
        strength: hidden.strength * 0.6, // 藏干影响力打折
        influence: this.getInfluenceLevel(hidden.strength * 0.6),
      });
    }

    // 统计主要十神
    const dominantGods = this.findDominantGods(relationships);

    return {
      dayMaster,
      tenGodRelationships: relationships,
      dominantGods,
      personality: this.analyzePersonality(relationships, dominantGods),
      career: this.analyzeCareer(relationships, dominantGods),
      relationships: this.analyzeRelationships(relationships, dominantGods),
      health: this.analyzeHealth(relationships, dominantGods),
      wealth: this.analyzeWealth(relationships, dominantGods),
    };
  }

  /**
   * 计算单个天干与日干的十神关系
   */
  private calculateTenGod(dayMaster: Stem, otherStem: Stem): TenGod {
    if (dayMaster === otherStem) {
      return '比肩';
    }

    const dayElement = this.stemElement[dayMaster];
    const dayPolarity = this.stemPolarity[dayMaster];
    const otherElement = this.stemElement[otherStem];
    const otherPolarity = this.stemPolarity[otherStem];
    const samePolarity = dayPolarity === otherPolarity;

    // 同五行
    if (dayElement === otherElement) {
      return samePolarity ? '比肩' : '劫财';
    }

    // 日干生其他干
    if (this.elementRelations.generate[dayElement] === otherElement) {
      return samePolarity ? '食神' : '伤官';
    }

    // 日干克其他干
    if (this.elementRelations.control[dayElement] === otherElement) {
      return samePolarity ? '偏财' : '正财';
    }

    // 其他干克日干
    if (this.elementRelations.control[otherElement] === dayElement) {
      return samePolarity ? '七杀' : '正官';
    }

    // 其他干生日干
    if (this.elementRelations.generate[otherElement] === dayElement) {
      return samePolarity ? '偏印' : '正印';
    }

    // 默认返回比肩（理论上不应该到达这里）
    return '比肩';
  }

  /**
   * 计算影响强度
   */
  private calculateInfluenceStrength(
    pillar: 'year' | 'month' | 'hour',
    stem: Stem,
    pillars: Pillars
  ): number {
    let baseStrength = 50;

    // 月柱影响力最强
    if (pillar === 'month') {
      baseStrength = 80;
    } else if (pillar === 'year') {
      baseStrength = 60;
    } else if (pillar === 'hour') {
      baseStrength = 40;
    }

    // 考虑地支的支撑作用（简化）
    const pillarBranch = pillars[pillar].branch;
    if (this.branchSupportsElement(pillarBranch, this.stemElement[stem])) {
      baseStrength += 20;
    }

    return Math.min(100, baseStrength);
  }

  /**
   * 获取影响等级
   */
  private getInfluenceLevel(strength: number): 'strong' | 'moderate' | 'weak' {
    if (strength >= 70) return 'strong';
    if (strength >= 40) return 'moderate';
    return 'weak';
  }

  /**
   * 获取地支藏干（简化版）
   */
  private getHiddenStems(pillars: Pillars): Array<{
    stem: Stem;
    pillar: 'year' | 'month' | 'day' | 'hour';
    strength: number;
  }> {
    // 简化的地支藏干映射
    const hiddenStemsMap: Record<Branch, { main: Stem; others?: Stem[] }> = {
      子: { main: '癸' },
      丑: { main: '己', others: ['癸', '辛'] },
      寅: { main: '甲', others: ['丙', '戊'] },
      卯: { main: '乙' },
      辰: { main: '戊', others: ['乙', '癸'] },
      巳: { main: '丙', others: ['庚', '戊'] },
      午: { main: '丁', others: ['己'] },
      未: { main: '己', others: ['丁', '乙'] },
      申: { main: '庚', others: ['壬', '戊'] },
      酉: { main: '辛' },
      戌: { main: '戊', others: ['辛', '丁'] },
      亥: { main: '壬', others: ['甲'] },
    };

    const result: Array<{
      stem: Stem;
      pillar: 'year' | 'month' | 'day' | 'hour';
      strength: number;
    }> = [];

    const pillarNames = ['year', 'month', 'day', 'hour'] as const;

    for (const pillarName of pillarNames) {
      const branch = pillars[pillarName].branch;
      const hiddenInfo = hiddenStemsMap[branch];

      if (hiddenInfo) {
        // 主气
        result.push({
          stem: hiddenInfo.main,
          pillar: pillarName,
          strength: 70,
        });

        // 余气（如果存在）
        if (hiddenInfo.others) {
          hiddenInfo.others.forEach((stem) => {
            result.push({
              stem,
              pillar: pillarName,
              strength: 30,
            });
          });
        }
      }
    }

    return result;
  }

  /**
   * 判断地支是否支撑该五行
   */
  private branchSupportsElement(branch: Branch, element: FiveElement): boolean {
    const branchElements: Record<Branch, FiveElement[]> = {
      子: ['水'],
      丑: ['土', '金', '水'],
      寅: ['木', '火', '土'],
      卯: ['木'],
      辰: ['土', '木', '水'],
      巳: ['火', '金', '土'],
      午: ['火', '土'],
      未: ['土', '火', '木'],
      申: ['金', '水', '土'],
      酉: ['金'],
      戌: ['土', '金', '火'],
      亥: ['水', '木'],
    };

    return branchElements[branch]?.includes(element) || false;
  }

  /**
   * 找出主导十神
   */
  private findDominantGods(relationships: TenGodRelationship[]): TenGod[] {
    const godCounts: Record<TenGod, { count: number; totalStrength: number }> =
      {} as any;

    relationships.forEach((rel) => {
      if (!godCounts[rel.god]) {
        godCounts[rel.god] = { count: 0, totalStrength: 0 };
      }
      godCounts[rel.god].count++;
      godCounts[rel.god].totalStrength += rel.strength;
    });

    // 按综合影响力排序
    const sorted = Object.entries(godCounts)
      .map(([god, data]) => ({
        god: god as TenGod,
        influence: data.count * 10 + data.totalStrength / data.count,
      }))
      .sort((a, b) => b.influence - a.influence);

    return sorted.slice(0, 3).map((item) => item.god);
  }

  /**
   * 分析性格特征
   */
  private analyzePersonality(
    relationships: TenGodRelationship[],
    dominantGods: TenGod[]
  ) {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const talents: string[] = [];
    const challenges: string[] = [];

    for (const god of dominantGods) {
      switch (god) {
        case '比肩':
          strengths.push('独立自主', '意志坚定', '不轻易妥协');
          talents.push('领导能力', '自我管理');
          weaknesses.push('固执己见', '缺乏合作精神');
          challenges.push('学会团队协作', '倾听他人意见');
          break;

        case '劫财':
          strengths.push('行动力强', '敢于竞争', '不畏挑战');
          talents.push('销售能力', '危机处理');
          weaknesses.push('冲动行事', '容易与人争执');
          challenges.push('控制脾气', '三思而后行');
          break;

        case '食神':
          strengths.push('创造力丰富', '乐观开朗', '善于表达');
          talents.push('艺术创作', '美食鉴赏', '儿童教育');
          weaknesses.push('缺乏恒心', '容易分散注意力');
          challenges.push('培养专注力', '坚持长期目标');
          break;

        case '伤官':
          strengths.push('聪明伶俐', '反应敏捷', '善于创新');
          talents.push('技术研发', '艺术表演', '写作能力');
          weaknesses.push('叛逆心理', '易得罪人');
          challenges.push('学会收敛锋芒', '尊重传统');
          break;

        case '正财':
          strengths.push('务实稳重', '善于理财', '注重实际');
          talents.push('财务管理', '投资理财', '商业经营');
          weaknesses.push('保守谨慎', '缺乏冒险精神');
          challenges.push('适度冒险', '抓住机遇');
          break;

        case '偏财':
          strengths.push('机敏灵活', '善于把握机会', '交际广泛');
          talents.push('投机交易', '资源整合', '人际关系');
          weaknesses.push('投机心理', '财务不稳定');
          challenges.push('建立稳定收入', '理性投资');
          break;

        case '正官':
          strengths.push('正直公正', '有责任感', '遵纪守法');
          talents.push('管理能力', '公务工作', '法律事务');
          weaknesses.push('过分拘谨', '缺乏创新');
          challenges.push('适度灵活变通', '培养创新思维');
          break;

        case '七杀':
          strengths.push('决断力强', '威严有力', '不畏困难');
          talents.push('军事指挥', '危机管理', '执法工作');
          weaknesses.push('脾气暴躁', '手段激烈');
          challenges.push('温和待人', '以德服人');
          break;

        case '正印':
          strengths.push('学习能力强', '有长者风范', '乐于助人');
          talents.push('教育工作', '学术研究', '文化传承');
          weaknesses.push('依赖性强', '缺乏主见');
          challenges.push('培养独立性', '勇于决断');
          break;

        case '偏印':
          strengths.push('思维独特', '直觉敏锐', '善于钻研');
          talents.push('宗教哲学', '神秘学研究', '心理分析');
          weaknesses.push('孤僻偏执', '不善交际');
          challenges.push('增进人际交往', '保持开放心态');
          break;
      }
    }

    return {
      strengths: [...new Set(strengths)],
      weaknesses: [...new Set(weaknesses)],
      talents: [...new Set(talents)],
      challenges: [...new Set(challenges)],
    };
  }

  /**
   * 分析职业倾向
   */
  private analyzeCareer(
    relationships: TenGodRelationship[],
    dominantGods: TenGod[]
  ) {
    const suitable: string[] = [];
    const unsuitable: string[] = [];
    const advice: string[] = [];

    for (const god of dominantGods) {
      switch (god) {
        case '比肩':
        case '劫财':
          suitable.push('创业', '自由职业', '销售', '体育运动');
          unsuitable.push('需要团队合作的工作', '文职工作');
          advice.push('适合独当一面的工作', '避免过多依赖他人');
          break;

        case '食神':
        case '伤官':
          suitable.push('艺术设计', '娱乐表演', '技术创新', '教育培训');
          unsuitable.push('机械化重复工作', '严格规范的工作');
          advice.push('发挥创意才能', '寻找有挑战性的工作');
          break;

        case '正财':
        case '偏财':
          suitable.push('商业贸易', '金融投资', '房地产', '零售业');
          unsuitable.push('纯技术工作', '非营利组织');
          advice.push('选择与财富相关的行业', '培养商业敏感度');
          break;

        case '正官':
        case '七杀':
          suitable.push('政府机关', '管理职位', '法律工作', '军警');
          unsuitable.push('自由散漫的工作', '艺术创作');
          advice.push('追求权威职位', '展现领导才能');
          break;

        case '正印':
        case '偏印':
          suitable.push('教育科研', '文化传媒', '宗教哲学', '医疗保健');
          unsuitable.push('高强度竞争工作', '体力劳动');
          advice.push('从事知识型工作', '发挥智慧优势');
          break;
      }
    }

    return {
      suitable: [...new Set(suitable)],
      unsuitable: [...new Set(unsuitable)],
      advice: [...new Set(advice)],
    };
  }

  /**
   * 分析人际关系
   */
  private analyzeRelationships(
    relationships: TenGodRelationship[],
    dominantGods: TenGod[]
  ) {
    const marriage: string[] = [];
    const friendship: string[] = [];
    const family: string[] = [];

    // 查找具体的十神关系
    const hasStrongWealth = relationships.some(
      (r) => (r.god === '正财' || r.god === '偏财') && r.influence === 'strong'
    );
    const hasStrongOfficer = relationships.some(
      (r) => (r.god === '正官' || r.god === '七杀') && r.influence === 'strong'
    );
    const hasStrongSeal = relationships.some(
      (r) => (r.god === '正印' || r.god === '偏印') && r.influence === 'strong'
    );

    // 婚姻分析
    if (hasStrongWealth) {
      marriage.push('财星旺，易得配偶助力');
      marriage.push('注重物质基础，选择务实伴侣');
    }
    if (hasStrongOfficer) {
      marriage.push('官星旺，配偶有能力有地位');
      marriage.push('婚姻关系较为正统稳定');
    }

    // 友谊分析
    friendship.push('善于结交志同道合的朋友');
    if (dominantGods.includes('食神')) {
      friendship.push('朋友圈广泛，社交能力强');
    }
    if (dominantGods.includes('比肩') || dominantGods.includes('劫财')) {
      friendship.push('朋友义气为重，但需防小人');
    }

    // 家庭分析
    if (hasStrongSeal) {
      family.push('与长辈关系良好，受长辈庇护');
      family.push('重视家庭传统和文化传承');
    }
    family.push('家庭责任感强，孝顺父母');

    return { marriage, friendship, family };
  }

  /**
   * 分析健康状况
   */
  private analyzeHealth(
    relationships: TenGodRelationship[],
    dominantGods: TenGod[]
  ) {
    const strongAspects: string[] = [];
    const weakAspects: string[] = [];
    const advice: string[] = [];

    // 根据主导十神分析健康倾向
    for (const god of dominantGods) {
      switch (god) {
        case '比肩':
        case '劫财':
          strongAspects.push('体质较强', '恢复能力佳');
          weakAspects.push('容易外伤', '肌肉骨骼问题');
          advice.push('注意运动安全', '避免过度劳累');
          break;

        case '食神':
          strongAspects.push('消化系统良好', '食欲旺盛');
          advice.push('保持规律饮食', '适量运动');
          break;

        case '伤官':
          weakAspects.push('神经系统敏感', '容易焦虑');
          advice.push('学会放松心情', '调节情绪');
          break;

        case '正印':
        case '偏印':
          weakAspects.push('思虑过度', '睡眠质量不佳');
          advice.push('注意休息', '避免用脑过度');
          break;
      }
    }

    return {
      strongAspects: [...new Set(strongAspects)],
      weakAspects: [...new Set(weakAspects)],
      advice: [...new Set(advice)],
    };
  }

  /**
   * 分析财富运势
   */
  private analyzeWealth(
    relationships: TenGodRelationship[],
    dominantGods: TenGod[]
  ) {
    let potential: 'high' | 'medium' | 'low' = 'medium';
    const sources: string[] = [];
    const advice: string[] = [];

    // 检查财星强弱
    const wealthGods = relationships.filter(
      (r) => r.god === '正财' || r.god === '偏财'
    );
    const strongWealth = wealthGods.some((r) => r.influence === 'strong');
    const weakWealth = wealthGods.every((r) => r.influence === 'weak');

    if (strongWealth) {
      potential = 'high';
      advice.push('财星旺盛，适合投资理财');
    } else if (weakWealth) {
      potential = 'low';
      advice.push('财星较弱，宜守不宜攻');
    }

    // 根据主导十神分析财源
    for (const god of dominantGods) {
      switch (god) {
        case '正财':
          sources.push('正当经营', '稳定工作', '不动产投资');
          advice.push('通过正当途径积累财富');
          break;

        case '偏财':
          sources.push('投机交易', '中介服务', '意外之财');
          advice.push('把握投资机会，但需谨慎');
          break;

        case '食神':
        case '伤官':
          sources.push('技能才艺', '创意产业', '知识产权');
          advice.push('将才能转化为财富');
          break;

        case '正官':
        case '七杀':
          sources.push('权力地位', '管理收益', '权威咨询');
          advice.push('通过地位权威获得财富');
          break;
      }
    }

    return {
      potential,
      sources: [...new Set(sources)],
      advice: [...new Set(advice)],
    };
  }
}

/**
 * 创建十神计算器实例
 */
export function createTenGodsCalculator(): TenGodsCalculator {
  return new TenGodsCalculator();
}

/**
 * 便捷函数：直接计算四柱十神
 */
export function calculateTenGodsAnalysis(pillars: Pillars): TenGodAnalysis {
  const calculator = createTenGodsCalculator();
  return calculator.calculateTenGods(pillars);
}
