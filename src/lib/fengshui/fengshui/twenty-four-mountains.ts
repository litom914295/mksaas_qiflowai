/**
 * QiFlow AI - 二十四山向风水分析模块
 * 
 * 实现二十四山向的定位、分析和吉凶判断
 */

export type Mountain = 
  | '壬' | '子' | '癸'  // 北方三山
  | '丑' | '艮' | '寅'  // 东北三山
  | '甲' | '卯' | '乙'  // 东方三山
  | '辰' | '巽' | '巳'  // 东南三山
  | '丙' | '午' | '丁'  // 南方三山
  | '未' | '坤' | '申'  // 西南三山
  | '庚' | '酉' | '辛'  // 西方三山
  | '戌' | '乾' | '亥'; // 西北三山

export type Trigram = '乾' | '兑' | '离' | '震' | '巽' | '坎' | '艮' | '坤';
export type Element = '金' | '木' | '水' | '火' | '土';

// 二十四山向度数映射
export const MOUNTAIN_DEGREES: Record<Mountain, { start: number; end: number; center: number }> = {
  // 北方（0°/360°）
  '壬': { start: 337.5, end: 352.5, center: 345 },
  '子': { start: 352.5, end: 7.5, center: 0 },
  '癸': { start: 7.5, end: 22.5, center: 15 },
  
  // 东北（45°）
  '丑': { start: 22.5, end: 37.5, center: 30 },
  '艮': { start: 37.5, end: 52.5, center: 45 },
  '寅': { start: 52.5, end: 67.5, center: 60 },
  
  // 东方（90°）
  '甲': { start: 67.5, end: 82.5, center: 75 },
  '卯': { start: 82.5, end: 97.5, center: 90 },
  '乙': { start: 97.5, end: 112.5, center: 105 },
  
  // 东南（135°）
  '辰': { start: 112.5, end: 127.5, center: 120 },
  '巽': { start: 127.5, end: 142.5, center: 135 },
  '巳': { start: 142.5, end: 157.5, center: 150 },
  
  // 南方（180°）
  '丙': { start: 157.5, end: 172.5, center: 165 },
  '午': { start: 172.5, end: 187.5, center: 180 },
  '丁': { start: 187.5, end: 202.5, center: 195 },
  
  // 西南（225°）
  '未': { start: 202.5, end: 217.5, center: 210 },
  '坤': { start: 217.5, end: 232.5, center: 225 },
  '申': { start: 232.5, end: 247.5, center: 240 },
  
  // 西方（270°）
  '庚': { start: 247.5, end: 262.5, center: 255 },
  '酉': { start: 262.5, end: 277.5, center: 270 },
  '辛': { start: 277.5, end: 292.5, center: 285 },
  
  // 西北（315°）
  '戌': { start: 292.5, end: 307.5, center: 300 },
  '乾': { start: 307.5, end: 322.5, center: 315 },
  '亥': { start: 322.5, end: 337.5, center: 330 }
};

// 二十四山向五行属性
export const MOUNTAIN_ELEMENTS: Record<Mountain, Element> = {
  '壬': '水', '子': '水', '癸': '水',
  '丑': '土', '艮': '土', '寅': '木',
  '甲': '木', '卯': '木', '乙': '木',
  '辰': '土', '巽': '木', '巳': '火',
  '丙': '火', '午': '火', '丁': '火',
  '未': '土', '坤': '土', '申': '金',
  '庚': '金', '酉': '金', '辛': '金',
  '戌': '土', '乾': '金', '亥': '水'
};

// 二十四山向八卦属性
export const MOUNTAIN_TRIGRAMS: Record<Mountain, Trigram> = {
  '壬': '坎', '子': '坎', '癸': '坎',
  '丑': '艮', '艮': '艮', '寅': '艮',
  '甲': '震', '卯': '震', '乙': '震',
  '辰': '巽', '巽': '巽', '巳': '巽',
  '丙': '离', '午': '离', '丁': '离',
  '未': '坤', '坤': '坤', '申': '坤',
  '庚': '兑', '酉': '兑', '辛': '兑',
  '戌': '乾', '乾': '乾', '亥': '乾'
};

// 坐向组合吉凶判断
export interface SittingFacingAnalysis {
  sitting: Mountain;
  facing: Mountain;
  compatibility: 'excellent' | 'good' | 'neutral' | 'bad' | 'terrible';
  description: string;
  effects: {
    wealth: number;      // 财运 (0-100)
    health: number;      // 健康 (0-100)
    relationships: number; // 人际 (0-100)
    career: number;      // 事业 (0-100)
  };
  recommendations: string[];
}

// 龙穴砂水分析
export interface DragonCaveAnalysis {
  dragon: {
    direction: Mountain;
    quality: 'excellent' | 'good' | 'poor';
    description: string;
  };
  cave: {
    position: Mountain;
    energy: 'strong' | 'moderate' | 'weak';
    description: string;
  };
  sand: {
    leftGreenDragon: Mountain | null;
    rightWhiteTiger: Mountain | null;
    balance: 'balanced' | 'left-heavy' | 'right-heavy';
    description: string;
  };
  water: {
    incomingDirection: Mountain | null;
    outgoingDirection: Mountain | null;
    pattern: 'auspicious' | 'neutral' | 'inauspicious';
    description: string;
  };
  overallScore: number;
  recommendations: string[];
}

/**
 * 二十四山向分析器
 */
export class TwentyFourMountainsAnalyzer {
  
  /**
   * 根据度数获取山向
   */
  getMountainByDegree(degree: number): Mountain {
    // 标准化度数到0-360范围
    const normalizedDegree = ((degree % 360) + 360) % 360;
    
    for (const [mountain, range] of Object.entries(MOUNTAIN_DEGREES)) {
      // 处理跨0度的情况（子山）
      if (range.start > range.end) {
        if (normalizedDegree >= range.start || normalizedDegree < range.end) {
          return mountain as Mountain;
        }
      } else {
        if (normalizedDegree >= range.start && normalizedDegree < range.end) {
          return mountain as Mountain;
        }
      }
    }
    
    return '子'; // 默认返回北方
  }

  /**
   * 计算两个山向之间的关系
   */
  analyzeMountainRelationship(mountain1: Mountain, mountain2: Mountain): {
    relationship: 'compatible' | 'generating' | 'controlling' | 'conflicting' | 'neutral';
    description: string;
  } {
    const element1 = MOUNTAIN_ELEMENTS[mountain1];
    const element2 = MOUNTAIN_ELEMENTS[mountain2];
    
    // 五行生克关系
    const generating: Record<Element, Element> = {
      '木': '火',
      '火': '土',
      '土': '金',
      '金': '水',
      '水': '木'
    };
    
    const controlling: Record<Element, Element> = {
      '木': '土',
      '土': '水',
      '水': '火',
      '火': '金',
      '金': '木'
    };
    
    if (element1 === element2) {
      return {
        relationship: 'compatible',
        description: `${element1}与${element2}同气相合，和谐共处`
      };
    }
    
    if (generating[element1] === element2) {
      return {
        relationship: 'generating',
        description: `${element1}生${element2}，相生有情`
      };
    }
    
    if (generating[element2] === element1) {
      return {
        relationship: 'generating',
        description: `${element2}生${element1}，得生扶助`
      };
    }
    
    if (controlling[element1] === element2) {
      return {
        relationship: 'controlling',
        description: `${element1}克${element2}，需要化解`
      };
    }
    
    if (controlling[element2] === element1) {
      return {
        relationship: 'conflicting',
        description: `${element2}克${element1}，受克不利`
      };
    }
    
    return {
      relationship: 'neutral',
      description: '无明显生克关系'
    };
  }

  /**
   * 分析坐向组合
   */
  analyzeSittingFacing(sitting: Mountain, facing: Mountain): SittingFacingAnalysis {
    const relationship = this.analyzeMountainRelationship(sitting, facing);
    const sittingElement = MOUNTAIN_ELEMENTS[sitting];
    const facingElement = MOUNTAIN_ELEMENTS[facing];
    
    let compatibility: SittingFacingAnalysis['compatibility'] = 'neutral';
    let baseScore = 50;
    
    // 根据关系判断吉凶
    switch (relationship.relationship) {
      case 'compatible':
        compatibility = 'excellent';
        baseScore = 90;
        break;
      case 'generating':
        compatibility = 'good';
        baseScore = 75;
        break;
      case 'neutral':
        compatibility = 'neutral';
        baseScore = 50;
        break;
      case 'controlling':
        compatibility = 'bad';
        baseScore = 30;
        break;
      case 'conflicting':
        compatibility = 'terrible';
        baseScore = 15;
        break;
    }
    
    // 特殊坐向组合判断
    const specialCombos: Record<string, { compatibility: SittingFacingAnalysis['compatibility']; description: string }> = {
      '子午': { compatibility: 'excellent', description: '子山午向，正南正北，君子正位' },
      '卯酉': { compatibility: 'excellent', description: '卯山酉向，正东正西，日月对照' },
      '巽乾': { compatibility: 'good', description: '巽山乾向，文昌得位' },
      '坤艮': { compatibility: 'good', description: '坤山艮向，土气稳重' },
      '亥巳': { compatibility: 'bad', description: '亥山巳向，水火相冲' },
      '寅申': { compatibility: 'bad', description: '寅山申向，虎猴相冲' }
    };
    
    const comboKey = sitting + facing;
    const reverseComboKey = facing + sitting;
    
    let description = relationship.description;
    if (specialCombos[comboKey]) {
      compatibility = specialCombos[comboKey].compatibility;
      description = specialCombos[comboKey].description;
    } else if (specialCombos[reverseComboKey]) {
      compatibility = specialCombos[reverseComboKey].compatibility;
      description = specialCombos[reverseComboKey].description;
    }
    
    // 计算各方面影响
    const effects = {
      wealth: this.calculateEffectScore('wealth', sittingElement, facingElement, baseScore),
      health: this.calculateEffectScore('health', sittingElement, facingElement, baseScore),
      relationships: this.calculateEffectScore('relationships', sittingElement, facingElement, baseScore),
      career: this.calculateEffectScore('career', sittingElement, facingElement, baseScore)
    };
    
    // 生成建议
    const recommendations = this.generateRecommendations(sitting, facing, compatibility);
    
    return {
      sitting,
      facing,
      compatibility,
      description,
      effects,
      recommendations
    };
  }

  /**
   * 计算具体影响分数
   */
  private calculateEffectScore(
    aspect: 'wealth' | 'health' | 'relationships' | 'career',
    sittingElement: Element,
    facingElement: Element,
    baseScore: number
  ): number {
    const aspectBonuses: Record<string, Record<string, number>> = {
      wealth: {
        '土金': 20,
        '金水': 15,
        '水木': 10,
        '木火': 5
      },
      health: {
        '木火': 20,
        '火土': 15,
        '土金': 10,
        '金水': 5
      },
      relationships: {
        '水木': 20,
        '木火': 15,
        '火土': 10,
        '土金': 5
      },
      career: {
        '金水': 20,
        '水木': 15,
        '木火': 10,
        '火土': 5
      }
    };
    
    const combo = sittingElement + facingElement;
    const bonus = aspectBonuses[aspect]?.[combo] || 0;
    
    return Math.min(100, Math.max(0, baseScore + bonus));
  }

  /**
   * 生成风水建议
   */
  private generateRecommendations(
    sitting: Mountain,
    facing: Mountain,
    compatibility: SittingFacingAnalysis['compatibility']
  ): string[] {
    const recommendations: string[] = [];
    
    switch (compatibility) {
      case 'excellent':
        recommendations.push('此坐向为上吉之局，宜保持现状');
        recommendations.push('可在面向方位摆放聚财物品增强运势');
        break;
      case 'good':
        recommendations.push('坐向较为理想，稍作调整可更佳');
        recommendations.push('建议在坐山方位加强靠山之势');
        break;
      case 'neutral':
        recommendations.push('坐向平平，需要通过其他风水布局改善');
        recommendations.push('可考虑调整门窗朝向优化气场');
        break;
      case 'bad':
        recommendations.push('坐向欠佳，建议使用五行化解');
        recommendations.push('在关键位置摆放化煞物品');
        break;
      case 'terrible':
        recommendations.push('坐向大凶，须尽快化解');
        recommendations.push('建议请专业人士现场勘察调整');
        break;
    }
    
    // 根据五行属性给出具体建议
    const sittingElement = MOUNTAIN_ELEMENTS[sitting];
    const facingElement = MOUNTAIN_ELEMENTS[facing];
    
    if (sittingElement === '水' || facingElement === '水') {
      recommendations.push('可摆放水晶或玻璃制品增强水气');
    }
    if (sittingElement === '木' || facingElement === '木') {
      recommendations.push('适合摆放绿植或木质装饰');
    }
    if (sittingElement === '火' || facingElement === '火') {
      recommendations.push('可使用红色装饰或照明增强火气');
    }
    if (sittingElement === '土' || facingElement === '土') {
      recommendations.push('适合摆放陶瓷或石材装饰');
    }
    if (sittingElement === '金' || facingElement === '金') {
      recommendations.push('可摆放金属制品或白色装饰');
    }
    
    return recommendations;
  }

  /**
   * 龙穴砂水综合分析
   */
  analyzeDragonCave(params: {
    dragonDirection: Mountain;
    cavePosition: Mountain;
    leftMountain?: Mountain;
    rightMountain?: Mountain;
    waterIncoming?: Mountain;
    waterOutgoing?: Mountain;
  }): DragonCaveAnalysis {
    const { 
      dragonDirection, 
      cavePosition, 
      leftMountain, 
      rightMountain,
      waterIncoming,
      waterOutgoing
    } = params;
    
    // 龙脉分析
    const dragonQuality = this.analyzeDragonQuality(dragonDirection);
    
    // 穴位分析
    const caveEnergy = this.analyzeCaveEnergy(cavePosition, dragonDirection);
    
    // 砂势分析
    const sandBalance = this.analyzeSandBalance(leftMountain, rightMountain);
    
    // 水势分析
    const waterPattern = this.analyzeWaterPattern(waterIncoming, waterOutgoing, cavePosition);
    
    // 综合评分
    const scores = [
      dragonQuality.quality === 'excellent' ? 90 : dragonQuality.quality === 'good' ? 60 : 30,
      caveEnergy.energy === 'strong' ? 90 : caveEnergy.energy === 'moderate' ? 60 : 30,
      sandBalance.balance === 'balanced' ? 90 : 50,
      waterPattern.pattern === 'auspicious' ? 90 : waterPattern.pattern === 'neutral' ? 50 : 20
    ];
    
    const overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    // 综合建议
    const recommendations: string[] = [];
    
    if (overallScore >= 80) {
      recommendations.push('龙真穴的，大吉之地');
    } else if (overallScore >= 60) {
      recommendations.push('地势尚可，稍作调整可成佳局');
    } else {
      recommendations.push('需要重新考虑选址或大幅调整');
    }
    
    if (dragonQuality.quality !== 'excellent') {
      recommendations.push('加强来龙之势，可在龙脉方位设置靠山');
    }
    
    if (sandBalance.balance !== 'balanced') {
      recommendations.push(`调整左右护砂，${sandBalance.balance === 'left-heavy' ? '加强右侧' : '加强左侧'}防护`);
    }
    
    if (waterPattern.pattern !== 'auspicious') {
      recommendations.push('优化水流方向，确保去水有情');
    }
    
    return {
      dragon: dragonQuality,
      cave: caveEnergy,
      sand: sandBalance,
      water: waterPattern,
      overallScore,
      recommendations
    };
  }

  /**
   * 分析龙脉质量
   */
  private analyzeDragonQuality(direction: Mountain): {
    direction: Mountain;
    quality: 'excellent' | 'good' | 'poor';
    description: string;
  } {
    const element = MOUNTAIN_ELEMENTS[direction];
    
    // 根据五行判断龙脉质量
    const qualityMap: Record<Element, 'excellent' | 'good' | 'poor'> = {
      '水': 'good',
      '木': 'excellent',
      '火': 'good',
      '土': 'excellent',
      '金': 'good'
    };
    
    const quality = qualityMap[element];
    
    const descriptions = {
      excellent: `来龙有力，${element}气充沛，主贵`,
      good: `龙脉平稳，${element}气适中，主富`,
      poor: `龙气不足，需要补强`
    };
    
    return {
      direction,
      quality,
      description: descriptions[quality]
    };
  }

  /**
   * 分析穴位能量
   */
  private analyzeCaveEnergy(position: Mountain, dragonDirection: Mountain): {
    position: Mountain;
    energy: 'strong' | 'moderate' | 'weak';
    description: string;
  } {
    const relationship = this.analyzeMountainRelationship(dragonDirection, position);
    
    let energy: 'strong' | 'moderate' | 'weak' = 'moderate';
    
    if (relationship.relationship === 'compatible' || relationship.relationship === 'generating') {
      energy = 'strong';
    } else if (relationship.relationship === 'conflicting' || relationship.relationship === 'controlling') {
      energy = 'weak';
    }
    
    const descriptions = {
      strong: '穴位得龙气滋养，能量充沛',
      moderate: '穴位能量适中，可用',
      weak: '穴位能量不足，需要培补'
    };
    
    return {
      position,
      energy,
      description: descriptions[energy]
    };
  }

  /**
   * 分析砂势平衡
   */
  private analyzeSandBalance(left?: Mountain, right?: Mountain): {
    leftGreenDragon: Mountain | null;
    rightWhiteTiger: Mountain | null;
    balance: 'balanced' | 'left-heavy' | 'right-heavy';
    description: string;
  } {
    if (!left && !right) {
      return {
        leftGreenDragon: null,
        rightWhiteTiger: null,
        balance: 'balanced',
        description: '左右无护砂，需要加强防护'
      };
    }
    
    if (left && right) {
      const leftElement = MOUNTAIN_ELEMENTS[left];
      const rightElement = MOUNTAIN_ELEMENTS[right];
      
      // 判断左右平衡
      const elementStrength: Record<Element, number> = {
        '木': 3,
        '火': 4,
        '土': 5,
        '金': 4,
        '水': 3
      };
      
      const leftStrength = elementStrength[leftElement];
      const rightStrength = elementStrength[rightElement];
      
      let balance: 'balanced' | 'left-heavy' | 'right-heavy' = 'balanced';
      if (Math.abs(leftStrength - rightStrength) <= 1) {
        balance = 'balanced';
      } else if (leftStrength > rightStrength) {
        balance = 'left-heavy';
      } else {
        balance = 'right-heavy';
      }
      
      return {
        leftGreenDragon: left,
        rightWhiteTiger: right,
        balance,
        description: balance === 'balanced' ? '青龙白虎相配，左右护持有力' : '左右失衡，需要调整'
      };
    }
    
    return {
      leftGreenDragon: left || null,
      rightWhiteTiger: right || null,
      balance: left ? 'left-heavy' : 'right-heavy',
      description: left ? '缺右护砂，白虎位空虚' : '缺左护砂，青龙位不足'
    };
  }

  /**
   * 分析水势格局
   */
  private analyzeWaterPattern(
    incoming?: Mountain,
    outgoing?: Mountain,
    cavePosition?: Mountain
  ): {
    incomingDirection: Mountain | null;
    outgoingDirection: Mountain | null;
    pattern: 'auspicious' | 'neutral' | 'inauspicious';
    description: string;
  } {
    if (!incoming && !outgoing) {
      return {
        incomingDirection: null,
        outgoingDirection: null,
        pattern: 'neutral',
        description: '无明显水势，需要引水造势'
      };
    }
    
    if (incoming && outgoing && cavePosition) {
      // 判断来去水的吉凶
      const incomingElement = MOUNTAIN_ELEMENTS[incoming];
      const outgoingElement = MOUNTAIN_ELEMENTS[outgoing];
      const caveElement = MOUNTAIN_ELEMENTS[cavePosition];
      
      // 理想情况：来水生穴，去水有情
      let pattern: 'auspicious' | 'neutral' | 'inauspicious' = 'neutral';
      
      const incomingRelation = this.analyzeMountainRelationship(incoming, cavePosition);
      const outgoingRelation = this.analyzeMountainRelationship(cavePosition, outgoing);
      
      if (incomingRelation.relationship === 'generating' && 
          (outgoingRelation.relationship === 'generating' || outgoingRelation.relationship === 'compatible')) {
        pattern = 'auspicious';
      } else if (incomingRelation.relationship === 'conflicting' || 
                 outgoingRelation.relationship === 'conflicting') {
        pattern = 'inauspicious';
      }
      
      const descriptions = {
        auspicious: '来水有情，去水有力，财源广进',
        neutral: '水势平平，需要调整改善',
        inauspicious: '水势不利，需要化解'
      };
      
      return {
        incomingDirection: incoming,
        outgoingDirection: outgoing,
        pattern,
        description: descriptions[pattern]
      };
    }
    
    return {
      incomingDirection: incoming || null,
      outgoingDirection: outgoing || null,
      pattern: 'neutral',
      description: '水势不完整，需要综合调理'
    };
  }

  /**
   * 根据八字推荐最佳坐向
   */
  recommendOptimalFacing(params: {
    yearElement: Element;
    favorableElements: Element[];
    unfavorableElements: Element[];
  }): {
    recommended: Mountain[];
    avoid: Mountain[];
    bestChoice: Mountain;
    analysis: string;
  } {
    const { yearElement, favorableElements, unfavorableElements } = params;
    
    const recommended: Mountain[] = [];
    const avoid: Mountain[] = [];
    
    // 遍历所有山向，找出有利和不利的方位
    for (const [mountain, element] of Object.entries(MOUNTAIN_ELEMENTS)) {
      if (favorableElements.includes(element)) {
        recommended.push(mountain as Mountain);
      }
      if (unfavorableElements.includes(element)) {
        avoid.push(mountain as Mountain);
      }
    }
    
    // 选择最佳坐向
    let bestChoice: Mountain = recommended[0] || '子';
    
    // 优先选择与年命相生的方位
    for (const mountain of recommended) {
      const element = MOUNTAIN_ELEMENTS[mountain];
      if (this.isGenerating(yearElement, element)) {
        bestChoice = mountain;
        break;
      }
    }
    
    const analysis = `根据命理分析，年命属${yearElement}，宜坐${MOUNTAIN_ELEMENTS[bestChoice]}向，` +
                     `最佳选择为${bestChoice}山${this.getOpposite(bestChoice)}向。` +
                     `应避免${avoid.slice(0, 3).join('、')}等方位。`;
    
    return {
      recommended,
      avoid,
      bestChoice,
      analysis
    };
  }

  /**
   * 判断五行相生关系
   */
  private isGenerating(element1: Element, element2: Element): boolean {
    const generating: Record<Element, Element> = {
      '木': '火',
      '火': '土',
      '土': '金',
      '金': '水',
      '水': '木'
    };
    
    return generating[element1] === element2 || generating[element2] === element1;
  }

  /**
   * 获取对宫山向
   */
  private getOpposite(mountain: Mountain): Mountain {
    const opposites: Record<Mountain, Mountain> = {
      '子': '午', '午': '子',
      '丑': '未', '未': '丑',
      '寅': '申', '申': '寅',
      '卯': '酉', '酉': '卯',
      '辰': '戌', '戌': '辰',
      '巳': '亥', '亥': '巳',
      '癸': '丁', '丁': '癸',
      '艮': '坤', '坤': '艮',
      '甲': '庚', '庚': '甲',
      '乙': '辛', '辛': '乙',
      '巽': '乾', '乾': '巽',
      '丙': '壬', '壬': '丙'
    };
    
    return opposites[mountain] || mountain;
  }
}

/**
 * 创建二十四山向分析器实例
 */
export function createTwentyFourMountainsAnalyzer(): TwentyFourMountainsAnalyzer {
  return new TwentyFourMountainsAnalyzer();
}

/**
 * 快速分析坐向吉凶
 */
export function quickAnalyzeSittingFacing(sitting: Mountain, facing: Mountain): SittingFacingAnalysis {
  const analyzer = createTwentyFourMountainsAnalyzer();
  return analyzer.analyzeSittingFacing(sitting, facing);
}