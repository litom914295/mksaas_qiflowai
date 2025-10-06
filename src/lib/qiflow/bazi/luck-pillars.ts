/**
 * QiFlow AI - 大运分析模块
 *
 * 基于增强型八字计算引擎
 * 提供专业级大运分析功能
 */

import {
    EnhancedBaziCalculator,
    type LuckPillarResult,
} from './enhanced-calculator';
import {
    createTenGodsCalculator,
    TenGodsCalculator,
    type TenGod,
    type TenGodAnalysis
} from './ten-gods';
import type { Branch, Stem } from './types';

export interface LuckPillarAnalysis {
  pillar: LuckPillarResult;
  period: number;
  ageRange: string;
  duration: number; // 年数
  startDate: Date;
  endDate: Date;
  strength: 'strong' | 'weak' | 'balanced';
  influence: 'positive' | 'negative' | 'neutral';
  keyThemes: string[];
  recommendations: string[];
  compatibleElements: string[];
  challengingElements: string[];
  // 新增十神分析
  tenGodRelation: {
    heavenlyTenGod: TenGod;        // 天干十神
    earthlyTenGod?: TenGod;       // 地支藏干主气十神
    combinedInfluence: string;     // 天干地支组合影响
    personalityImpact: string[];   // 对性格的影响
    careerImpact: string[];        // 对事业的影响
    relationshipImpact: string[];  // 对人际关系的影响
    healthImpact: string[];        // 对健康的影响
    wealthImpact: string[];        // 对财运的影响
  };
  // 大事预测
  majorEvents: {
    year: number;
    age: number;
    eventType: 'career' | 'wealth' | 'relationship' | 'health' | 'family' | 'study';
    probability: 'high' | 'medium' | 'low';
    description: string;
    advice: string;
  }[];
  // 流年互动
  yearlyInteractions: {
    year: number;
    interaction: 'favorable' | 'unfavorable' | 'neutral';
    description: string;
    recommendations: string[];
  }[];
}

/**
 * 大运分析器
 */
export class LuckPillarsAnalyzer {
  private calculator: EnhancedBaziCalculator;
  private tenGodsCalculator: TenGodsCalculator;
  private birthPillars: any | null = null; // 使用any类型以处理实际的数据结构
  private tenGodAnalysis: TenGodAnalysis | null = null;

  constructor(calculator: EnhancedBaziCalculator) {
    this.calculator = calculator;
    this.tenGodsCalculator = createTenGodsCalculator();
    // 不在构造函数中调用异步方法，改为在需要时调用
  }

  /**
   * 初始化出生数据
   */
  private async initializeBirthData(): Promise<void> {
    try {
      console.log('[LuckPillarsAnalyzer] 开始初始化出生数据...');
      console.log('[LuckPillarsAnalyzer] 计算器实例:', this.calculator);
      
      const baziResult = await this.calculator.getCompleteAnalysis();
      console.log('[LuckPillarsAnalyzer] 获取到的八字结果:', baziResult);
      
      if (baziResult) {
        console.log('[LuckPillarsAnalyzer] 八字结果中的pillars:', baziResult.pillars);
        this.birthPillars = baziResult.pillars;
        console.log('[LuckPillarsAnalyzer] 设置birthPillars:', this.birthPillars);
        
        if (baziResult.pillars) {
          this.tenGodAnalysis = this.tenGodsCalculator.calculateTenGods(baziResult.pillars);
          console.log('[LuckPillarsAnalyzer] 初始化完成');
        } else {
          console.error('[LuckPillarsAnalyzer] pillars为空，无法计算十神');
        }
      } else {
        console.error('[LuckPillarsAnalyzer] 八字计算结果为空');
        throw new Error('无法获取八字分析结果');
      }
    } catch (error) {
      console.error('[LuckPillarsAnalyzer] 初始化失败:', error);
      throw error; // 重新抛出错误以便上层处理
    }
  }

  /**
   * 分析所有大运
   */
  async analyzeAllLuckPillars(): Promise<LuckPillarAnalysis[]> {
    // 确保初始化完成
    if (!this.birthPillars || !this.tenGodAnalysis) {
      console.log('[LuckPillarsAnalyzer] 在analyzeAllLuckPillars中初始化...');
      try {
        await this.initializeBirthData();
      } catch (error) {
        console.error('[LuckPillarsAnalyzer] 初始化失败:', error);
        throw new Error(`大运分析初始化失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    }

    const luckPillars = await this.calculator.getLuckPillarsAnalysis();

    if (!luckPillars) {
      return [];
    }

    const analyses = [];
    for (const pillar of luckPillars) {
      const analysis = await this.analyzeLuckPillar(pillar);
      analyses.push(analysis);
    }

    return analyses;
  }

  /**
   * 分析当前大运
   */
  async analyzeCurrentLuckPillar(): Promise<LuckPillarAnalysis | null> {
    // 确保初始化完成
    if (!this.birthPillars || !this.tenGodAnalysis) {
      console.log('[LuckPillarsAnalyzer] 在analyzeCurrentLuckPillar中初始化...');
      try {
        await this.initializeBirthData();
      } catch (error) {
        console.error('[LuckPillarsAnalyzer] 初始化失败:', error);
        throw new Error(`大运分析初始化失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    }

    const currentPillar = await this.calculator.getCurrentLuckPillar();

    if (!currentPillar) {
      return null;
    }

    return this.analyzeLuckPillar(currentPillar);
  }

  /**
   * 分析指定大运
   */
  async analyzeLuckPillarByPeriod(
    period: number
  ): Promise<LuckPillarAnalysis | null> {
    const luckPillars = await this.calculator.getLuckPillarsAnalysis();

    if (!luckPillars) {
      return null;
    }

    const pillar = luckPillars.find(lp => lp.period === period);

    if (!pillar) {
      return null;
    }

    return this.analyzeLuckPillar(pillar);
  }

  /**
   * 计算十神关系
   */
  private calculateTenGodFromStems(dayMaster: Stem, otherStem: Stem): TenGod {
    // 十神关系计算逻辑
    const stemRelations: Record<string, Record<string, TenGod>> = {
      '甲': { '甲': '比肩', '乙': '劫财', '丙': '食神', '丁': '伤官', '戊': '偏财', '己': '正财', '庚': '七杀', '辛': '正官', '壬': '偏印', '癸': '正印' },
      '乙': { '甲': '劫财', '乙': '比肩', '丙': '伤官', '丁': '食神', '戊': '正财', '己': '偏财', '庚': '正官', '辛': '七杀', '壬': '正印', '癸': '偏印' },
      '丙': { '甲': '偏印', '乙': '正印', '丙': '比肩', '丁': '劫财', '戊': '食神', '己': '伤官', '庚': '偏财', '辛': '正财', '壬': '七杀', '癸': '正官' },
      '丁': { '甲': '正印', '乙': '偏印', '丙': '劫财', '丁': '比肩', '戊': '伤官', '己': '食神', '庚': '正财', '辛': '偏财', '壬': '正官', '癸': '七杀' },
      '戊': { '甲': '七杀', '乙': '正官', '丙': '偏印', '丁': '正印', '戊': '比肩', '己': '劫财', '庚': '食神', '辛': '伤官', '壬': '偏财', '癸': '正财' },
      '己': { '甲': '正官', '乙': '七杀', '丙': '正印', '丁': '偏印', '戊': '劫财', '己': '比肩', '庚': '伤官', '辛': '食神', '壬': '正财', '癸': '偏财' },
      '庚': { '甲': '偏财', '乙': '正财', '丙': '七杀', '丁': '正官', '戊': '偏印', '己': '正印', '庚': '比肩', '辛': '劫财', '壬': '食神', '癸': '伤官' },
      '辛': { '甲': '正财', '乙': '偏财', '丙': '正官', '丁': '七杀', '戊': '正印', '己': '偏印', '庚': '劫财', '辛': '比肩', '壬': '伤官', '癸': '食神' },
      '壬': { '甲': '食神', '乙': '伤官', '丙': '偏财', '丁': '正财', '戊': '七杀', '己': '正官', '庚': '偏印', '辛': '正印', '壬': '比肩', '癸': '劫财' },
      '癸': { '甲': '伤官', '乙': '食神', '丙': '正财', '丁': '偏财', '戊': '正官', '己': '七杀', '庚': '正印', '辛': '偏印', '壬': '劫财', '癸': '比肩' }
    };
    
    return stemRelations[dayMaster]?.[otherStem] || '比肩';
  }

  /**
   * 分析十神关系
   */
  private analyzeTenGodRelation(pillar: LuckPillarResult): {
    heavenlyTenGod: TenGod;
    earthlyTenGod?: TenGod;
    combinedInfluence: string;
    personalityImpact: string[];
    careerImpact: string[];
    relationshipImpact: string[];
    healthImpact: string[];
    wealthImpact: string[];
  } {
    // 获取大运天干地支
    const luckStem = this.convertToStem(pillar.heavenlyStem);
    const luckBranch = this.convertToBranch(pillar.earthlyBranch);
    
    // 计算十神关系（相对于日主）
    // 尝试多种可能的数据结构来获取日主
    let dayMaster = null;
    if (this.birthPillars?.day?.stem) {
      dayMaster = this.birthPillars.day.stem;
    } else if (this.birthPillars?.day?.heavenlyStem) {
      dayMaster = this.birthPillars.day.heavenlyStem;
    } else if (this.birthPillars?.day?.chinese && this.birthPillars.day.chinese.length >= 2) {
      dayMaster = this.birthPillars.day.chinese[0]; // 第一个字符为天干
    }
    
    if (!dayMaster) {
      console.error('[LuckPillarsAnalyzer] 日主信息缺失，birthPillars结构:', this.birthPillars);
      console.error('[LuckPillarsAnalyzer] 日柱数据:', this.birthPillars?.day);
      throw new Error('日主信息缺失，无法计算十神关系');
    }
    
    const dayMasterStem = this.convertToStem(dayMaster);
    
    // 计算天干十神
    const heavenlyTenGod = this.calculateTenGodFromStems(dayMasterStem, luckStem);
    
    // 计算地支藏干主气的十神
    const branchMainStem = this.getBranchMainStem(luckBranch);
    const earthlyTenGod = branchMainStem ? this.calculateTenGodFromStems(dayMasterStem, branchMainStem) : undefined;
    
    // 分析组合影响
    const combinedInfluence = this.analyzeCombinedInfluence(heavenlyTenGod, earthlyTenGod);
    
    // 分析各方面影响
    const personalityImpact = this.analyzePersonalityImpact(heavenlyTenGod, earthlyTenGod);
    const careerImpact = this.analyzeCareerImpact(heavenlyTenGod, earthlyTenGod);
    const relationshipImpact = this.analyzeRelationshipImpact(heavenlyTenGod, earthlyTenGod);
    const healthImpact = this.analyzeHealthImpact(heavenlyTenGod, earthlyTenGod);
    const wealthImpact = this.analyzeWealthImpact(heavenlyTenGod, earthlyTenGod);
    
    return {
      heavenlyTenGod,
      earthlyTenGod,
      combinedInfluence,
      personalityImpact,
      careerImpact,
      relationshipImpact,
      healthImpact,
      wealthImpact
    };
  }

  /**
   * 预测重大事件
   */
  private predictMajorEvents(pillar: LuckPillarResult): {
    year: number;
    age: number;
    eventType: 'career' | 'wealth' | 'relationship' | 'health' | 'family' | 'study';
    probability: 'high' | 'medium' | 'low';
    description: string;
    advice: string;
  }[] {
    const events: any[] = [];
    const startAge = pillar.startAge;
    const endAge = pillar.endAge;
    
    // 预测大运期间的重要年份事件
    for (let age = startAge; age <= endAge; age += 2) {
      const year = new Date().getFullYear() + (age - this.calculateCurrentAge());
      const yearEvents = this.predictEventsForAge(pillar, age, year);
      events.push(...yearEvents);
    }
    
    return events;
  }

  /**
   * 计算流年互动
   */
  private calculateYearlyInteractions(pillar: LuckPillarResult): {
    year: number;
    age: number;
    interaction: 'favorable' | 'unfavorable' | 'neutral';
    description: string;
    recommendations: string[];
  }[] {
    const interactions: any[] = [];
    const startAge = pillar.startAge;
    const endAge = pillar.endAge;
    
    // 计算大运期间每年的流年互动
    for (let age = startAge; age <= endAge; age++) {
      const year = new Date().getFullYear() + (age - this.calculateCurrentAge());
      const yearStem = this.getYearStem(year);
      const yearBranch = this.getYearBranch(year);
      const interaction = this.analyzeYearlyInteraction(pillar, yearStem, yearBranch, year);
      if (interaction) {
        interactions.push(interaction);
      }
    }
    
    return interactions;
  }

  /**
   * 分析指定大运
   */
  private async analyzeLuckPillar(pillar: LuckPillarResult): Promise<LuckPillarAnalysis> {
    // 确保初始化完成
    if (!this.birthPillars || !this.tenGodAnalysis) {
      console.log('[LuckPillarsAnalyzer] 在analyzeLuckPillar中重新初始化...');
      await this.initializeBirthData();
      
      // 再次检查初始化结果
      if (!this.birthPillars || !this.tenGodAnalysis) {
        console.error('[LuckPillarsAnalyzer] 初始化后仍然失败，birthPillars:', this.birthPillars);
        throw new Error('无法初始化出生数据');
      }
    }

    const tenGodRelation = this.analyzeTenGodRelation(pillar);
    const majorEvents = this.predictMajorEvents(pillar);
    const yearlyInteractions = this.calculateYearlyInteractions(pillar);

    const analysis: LuckPillarAnalysis = {
      pillar,
      period: pillar.period,
      ageRange: `${pillar.startAge}-${pillar.endAge}`,
      duration: 10, // 大运通常为10年
      startDate: pillar.startDate || new Date(),
      endDate: pillar.endDate || new Date(),
      strength: pillar.strength,
      influence: this.evaluateInfluence(pillar),
      keyThemes: this.generateKeyThemes(pillar),
      recommendations: this.generateRecommendations(pillar),
      compatibleElements: this.getCompatibleElements(pillar),
      challengingElements: this.getChallengingElements(pillar),
      tenGodRelation,
      majorEvents,
      yearlyInteractions,
    };

    return analysis;
  }

  /**
   * 评估大运影响力
   */
  private evaluateInfluence(
    pillar: LuckPillarResult
  ): 'positive' | 'negative' | 'neutral' {
    // 根据五行相生相克关系评估
    // 这里可以根据实际的天干地支关系进行更复杂的计算
    return 'neutral';
  }

  /**
   * 生成大运关键词
   */
  private generateKeyThemes(pillar: LuckPillarResult): string[] {
    const themes: string[] = [];

    // 根据天干地支的五行属性生成主题
    const heavenlyStem = pillar.heavenlyStem.toLowerCase();
    const earthlyBranch = pillar.earthlyBranch.toLowerCase();

    // 天干主题
    if (heavenlyStem.includes('jia') || heavenlyStem.includes('yi')) {
      themes.push('成长', '创新', '领导力');
    } else if (heavenlyStem.includes('bing') || heavenlyStem.includes('ding')) {
      themes.push('热情', '行动', '影响力');
    } else if (heavenlyStem.includes('wu') || heavenlyStem.includes('ji')) {
      themes.push('稳定', '责任', '包容');
    } else if (heavenlyStem.includes('geng') || heavenlyStem.includes('xin')) {
      themes.push('变革', '决断', '独立');
    } else if (heavenlyStem.includes('ren') || heavenlyStem.includes('gui')) {
      themes.push('智慧', '适应', '和谐');
    }

    // 地支主题
    if (earthlyBranch.includes('rat') || earthlyBranch.includes('dragon')) {
      themes.push('创新', '冒险');
    } else if (earthlyBranch.includes('ox') || earthlyBranch.includes('goat')) {
      themes.push('踏实', '耐心');
    } else if (
      earthlyBranch.includes('tiger') ||
      earthlyBranch.includes('horse')
    ) {
      themes.push('行动', '活力');
    }

    return [...new Set(themes)]; // 去重
  }

  /**
   * 生成大运建议
   */
  private generateRecommendations(pillar: LuckPillarResult): string[] {
    const recommendations: string[] = [];
    const strength = pillar.strength;
    const themes = this.generateKeyThemes(pillar);

    if (strength === 'strong') {
      recommendations.push('把握机会，大胆行动');
      recommendations.push('注意平衡，避免过度自信');
    } else if (strength === 'weak') {
      recommendations.push('谨慎行事，寻求支持');
      recommendations.push('加强有利五行的运用');
    } else {
      recommendations.push('保持平衡，稳步前进');
      recommendations.push('关注细节，把握时机');
    }

    // 根据主题添加具体建议
    if (themes.includes('成长')) {
      recommendations.push('适合学习新技能，拓展人脉');
    }
    if (themes.includes('创新')) {
      recommendations.push('适合创业或开展创新项目');
    }
    if (themes.includes('稳定')) {
      recommendations.push('适合建立稳定的事业基础');
    }

    return recommendations;
  }

  /**
   * 获取相容五行元素
   */
  private getCompatibleElements(pillar: LuckPillarResult): string[] {
    // 根据大运的天干地支五行属性计算相容元素
    const elements: string[] = [];

    // 简化的五行相生关系
    const heavenlyElement = this.getElementFromStem(pillar.heavenlyStem);
    const earthlyElement = this.getElementFromBranch(pillar.earthlyBranch);

    // 相生关系
    if (heavenlyElement) {
      elements.push(...this.getGeneratingElements(heavenlyElement));
    }
    if (earthlyElement) {
      elements.push(...this.getGeneratingElements(earthlyElement));
    }

    return [...new Set(elements)];
  }

  /**
   * 获取挑战性五行元素
   */
  private getChallengingElements(pillar: LuckPillarResult): string[] {
    // 根据大运的天干地支五行属性计算挑战元素
    const elements: string[] = [];

    // 简化的五行相克关系
    const heavenlyElement = this.getElementFromStem(pillar.heavenlyStem);
    const earthlyElement = this.getElementFromBranch(pillar.earthlyBranch);

    // 相克关系
    if (heavenlyElement) {
      elements.push(...this.getControllingElements(heavenlyElement));
    }
    if (earthlyElement) {
      elements.push(...this.getControllingElements(earthlyElement));
    }

    return [...new Set(elements)];
  }

  /**
   * 从天干获取五行元素
   */
  private getElementFromStem(stem: string): string | null {
    const stemElements: Record<string, string> = {
      jia: 'wood',
      yi: 'wood',
      bing: 'fire',
      ding: 'fire',
      wu: 'earth',
      ji: 'earth',
      geng: 'metal',
      xin: 'metal',
      ren: 'water',
      gui: 'water',
    };

    const key = stem.toLowerCase();
    return stemElements[key] || null;
  }

  /**
   * 从地支获取五行元素
   */
  private getElementFromBranch(branch: string): string | null {
    const branchElements: Record<string, string> = {
      rat: 'water',
      pig: 'water',
      ox: 'earth',
      dragon: 'earth',
      goat: 'earth',
      dog: 'earth',
      tiger: 'wood',
      rabbit: 'wood',
      snake: 'fire',
      horse: 'fire',
      monkey: 'metal',
      rooster: 'metal',
    };

    const key = branch.toLowerCase();
    return branchElements[key] || null;
  }

  /**
   * 获取相生元素
   */
  private getGeneratingElements(element: string): string[] {
    const generatingMap: Record<string, string[]> = {
      wood: ['fire'],
      fire: ['earth'],
      earth: ['metal'],
      metal: ['water'],
      water: ['wood'],
    };

    return generatingMap[element] || [];
  }

  /**
   * 获取相克元素
   */
  private getControllingElements(element: string): string[] {
    const controllingMap: Record<string, string[]> = {
      wood: ['earth'],
      fire: ['water'],
      earth: ['wood'],
      metal: ['fire'],
      water: ['earth'],
    };

    return controllingMap[element] || [];
  }

  /**
   * 辅助方法：转换字符串为天干类型
   */
  private convertToStem(stemStr: string): Stem {
    const stemMap: Record<string, Stem> = {
      '甲': '甲', '乙': '乙', '丙': '丙', '丁': '丁', '戊': '戊',
      '己': '己', '庚': '庚', '辛': '辛', '壬': '壬', '癸': '癸'
    };
    return stemMap[stemStr] || '甲';
  }

  /**
   * 辅助方法：转换字符串为地支类型
   */
  private convertToBranch(branchStr: string): Branch {
    const branchMap: Record<string, Branch> = {
      '子': '子', '丑': '丑', '寅': '寅', '卯': '卯', '辰': '辰', '巳': '巳',
      '午': '午', '未': '未', '申': '申', '酉': '酉', '戌': '戌', '亥': '亥'
    };
    return branchMap[branchStr] || '子';
  }

  /**
   * 获取地支藏干主气
   */
  private getBranchMainStem(branch: Branch): Stem | null {
    const branchMainStemMap: Record<Branch, Stem> = {
      '子': '癸', '丑': '己', '寅': '甲', '卯': '乙', '辰': '戊', '巳': '丙',
      '午': '丁', '未': '己', '申': '庚', '酉': '辛', '戌': '戊', '亥': '壬'
    };
    return branchMainStemMap[branch] || null;
  }

  /**
   * 分析天干地支组合影响
   */
  private analyzeCombinedInfluence(heavenlyTenGod: TenGod, earthlyTenGod?: TenGod): string {
    if (!earthlyTenGod) {
      return `天干${heavenlyTenGod}主导，影响性格和行为模式`;
    }

    if (heavenlyTenGod === earthlyTenGod) {
      return `天干地支同为${heavenlyTenGod}，力量强化，影响深远持久`;
    }

    // 分析不同十神组合的影响
    const combinationAnalysis = this.getTenGodCombinationAnalysis(heavenlyTenGod, earthlyTenGod);
    return combinationAnalysis;
  }

  /**
   * 获取十神组合分析
   */
  private getTenGodCombinationAnalysis(heavenly: TenGod, earthly: TenGod): string {
    const combinations: Record<string, string> = {
      '正官-正印': '权威与学识并重，适合学术或公职发展',
      '正财-食神': '财源广进，通过才能获得财富',
      '七杀-劫财': '竞争激烈，需要谨慎处理人际关系',
      '伤官-偏印': '创新思维活跃，但易偏执独行',
      '比肩-正财': '通过自身努力获得稳定收入',
      // 可以继续扩展更多组合
    };

    const key = `${heavenly}-${earthly}`;
    return combinations[key] || `${heavenly}与${earthly}的组合，需要平衡两种能量`;
  }

  /**
   * 分析对性格的影响
   */
  private analyzePersonalityImpact(heavenly: TenGod, earthly?: TenGod): string[] {
    const impacts = new Set<string>();
    
    // 基于天干十神分析
    const heavenlyImpacts = this.getPersonalityImpactByTenGod(heavenly);
    heavenlyImpacts.forEach(impact => impacts.add(impact));
    
    // 基于地支十神分析（如果存在）
    if (earthly) {
      const earthlyImpacts = this.getPersonalityImpactByTenGod(earthly);
      earthlyImpacts.forEach(impact => impacts.add(`内在${impact}`));
    }

    return Array.from(impacts);
  }

  /**
   * 根据十神获取性格影响
   */
  private getPersonalityImpactByTenGod(tenGod: TenGod): string[] {
    const impacts: Record<TenGod, string[]> = {
      '比肩': ['独立自主增强', '自我意识强化', '不轻易妥协'],
      '劫财': ['竞争意识激发', '行动力提升', '易与人争执'],
      '食神': ['创造力活跃', '表达能力增强', '乐观情绪提升'],
      '伤官': ['创新思维活跃', '叛逆心理增强', '表现欲强烈'],
      '正财': ['务实态度增强', '理财意识提升', '稳重性格凸显'],
      '偏财': ['机变能力增强', '投机心理活跃', '交际能力提升'],
      '正官': ['责任感增强', '规范意识提升', '领导能力显现'],
      '七杀': ['决断力增强', '威严气质提升', '压力承受力强'],
      '正印': ['学习能力提升', '包容心增强', '依赖性可能增强'],
      '偏印': ['直觉力增强', '独特思维活跃', '可能趋于孤僻']
    };

    return impacts[tenGod] || [];
  }

  /**
   * 分析对事业的影响
   */
  private analyzeCareerImpact(heavenly: TenGod, earthly?: TenGod): string[] {
    const impacts = new Set<string>();
    
    const heavenlyCareer = this.getCareerImpactByTenGod(heavenly);
    heavenlyCareer.forEach(impact => impacts.add(impact));
    
    if (earthly) {
      const earthlyCareer = this.getCareerImpactByTenGod(earthly);
      earthlyCareer.forEach(impact => impacts.add(`${impact}（潜在机会）`));
    }

    return Array.from(impacts);
  }

  /**
   * 根据十神获取事业影响
   */
  private getCareerImpactByTenGod(tenGod: TenGod): string[] {
    const impacts: Record<TenGod, string[]> = {
      '比肩': ['适合独立创业', '自主经营能力强', '不宜合伙事业'],
      '劫财': ['竞争激烈的行业', '销售业务能力强', '需防合伙纠纷'],
      '食神': ['文艺创作有利', '教育培训适合', '服务行业发展好'],
      '伤官': ['技术创新领域', '艺术表演行业', '需注意与上司关系'],
      '正财': ['商业贸易有利', '稳定收入来源', '财务管理能力强'],
      '偏财': ['投资机会增多', '多元化发展', '需控制投机风险'],
      '正官': ['公职发展有利', '管理职位适合', '权威地位提升'],
      '七杀': ['竞争性职业', '执法军警适合', '需注意工作压力'],
      '正印': ['教育学术领域', '文化传媒行业', '需防过分依赖'],
      '偏印': ['研究开发工作', '神秘学领域', '独特专业技能']
    };

    return impacts[tenGod] || [];
  }

  /**
   * 分析对人际关系的影响
   */
  private analyzeRelationshipImpact(heavenly: TenGod, earthly?: TenGod): string[] {
    const impacts = new Set<string>();
    
    const heavenlyRelation = this.getRelationshipImpactByTenGod(heavenly);
    heavenlyRelation.forEach(impact => impacts.add(impact));
    
    if (earthly) {
      const earthlyRelation = this.getRelationshipImpactByTenGod(earthly);
      earthlyRelation.forEach(impact => impacts.add(`${impact}（深层关系）`));
    }

    return Array.from(impacts);
  }

  /**
   * 根据十神获取人际关系影响
   */
  private getRelationshipImpactByTenGod(tenGod: TenGod): string[] {
    const impacts: Record<TenGod, string[]> = {
      '比肩': ['同辈朋友关系良好', '容易找到知音', '婚姻需要平等沟通'],
      '劫财': ['异性缘分复杂', '容易出现三角关系', '需防朋友背叛'],
      '食神': ['人际关系和谐', '容易得到晚辈喜爱', '婚姻生活幸福'],
      '伤官': ['容易得罪权威', '与长辈关系紧张', '异性关系复杂'],
      '正财': ['配偶关系稳定', '经济往来较多', '重视实际利益'],
      '偏财': ['异性缘分旺盛', '社交圈子广泛', '容易有外遇机会'],
      '正官': ['长辈关系良好', '权威人士支持', '婚姻关系正统'],
      '七杀': ['人际关系紧张', '容易树敌', '配偶性格强势'],
      '正印': ['长辈庇护较多', '母亲关系密切', '容易受人照顾'],
      '偏印': ['人际关系较少', '容易孤独', '与继母关系不佳']
    };

    return impacts[tenGod] || [];
  }

  /**
   * 分析对健康的影响
   */
  private analyzeHealthImpact(heavenly: TenGod, earthly?: TenGod): string[] {
    const impacts = new Set<string>();
    
    const heavenlyHealth = this.getHealthImpactByTenGod(heavenly);
    heavenlyHealth.forEach(impact => impacts.add(impact));
    
    if (earthly) {
      const earthlyHealth = this.getHealthImpactByTenGod(earthly);
      earthlyHealth.forEach(impact => impacts.add(`${impact}（慢性影响）`));
    }

    return Array.from(impacts);
  }

  /**
   * 根据十神获取健康影响
   */
  private getHealthImpactByTenGod(tenGod: TenGod): string[] {
    const impacts: Record<TenGod, string[]> = {
      '比肩': ['体质较强', '恢复能力佳', '注意肌肉劳损'],
      '劫财': ['容易外伤', '血液循环问题', '需防意外伤害'],
      '食神': ['消化系统良好', '食欲旺盛', '注意饮食过量'],
      '伤官': ['神经系统敏感', '容易失眠', '注意精神压力'],
      '正财': ['身体状况稳定', '慢性疾病较少', '注意过劳'],
      '偏财': ['体质变化较大', '需注意泌尿系统', '防止过度透支'],
      '正官': ['身体管理良好', '作息规律', '注意高血压'],
      '七杀': ['身体压力较大', '易有创伤', '注意心脏健康'],
      '正印': ['身体保养较好', '长辈照顾多', '注意消化问题'],
      '偏印': ['身体状况不稳', '易有慢性病', '注意心理健康']
    };

    return impacts[tenGod] || [];
  }

  /**
   * 分析对财运的影响
   */
  private analyzeWealthImpact(heavenly: TenGod, earthly?: TenGod): string[] {
    const impacts = new Set<string>();
    
    const heavenlyWealth = this.getWealthImpactByTenGod(heavenly);
    heavenlyWealth.forEach(impact => impacts.add(impact));
    
    if (earthly) {
      const earthlyWealth = this.getWealthImpactByTenGod(earthly);
      earthlyWealth.forEach(impact => impacts.add(`${impact}（隐藏财源）`));
    }

    return Array.from(impacts);
  }

  /**
   * 根据十神获取财运影响
   */
  private getWealthImpactByTenGod(tenGod: TenGod): string[] {
    const impacts: Record<TenGod, string[]> = {
      '比肩': ['财运平稳', '靠自己努力', '不宜合伙投资'],
      '劫财': ['财运不稳', '容易破财', '需防朋友借贷'],
      '食神': ['财源稳定', '通过才华赚钱', '投资眼光不错'],
      '伤官': ['财来财去', '投资收益不稳', '需控制消费'],
      '正财': ['正财运旺', '收入稳定', '理财能力强'],
      '偏财': ['偏财机会多', '投资获利', '需防投机风险'],
      '正官': ['通过地位获财', '公职收入稳定', '财务管理规范'],
      '七杀': ['财运起伏大', '高风险高收益', '需谨慎理财'],
      '正印': ['财运较弱', '花钱大方', '容易为他人破财'],
      '偏印': ['非正常财源', '收入不规律', '理财观念独特']
    };

    return impacts[tenGod] || [];
  }

  /**
   * 预测特定年龄的重大事件
   */
  private predictEventsForAge(pillar: LuckPillarResult, age: number, year: number) {
    const events = [];
    
    // 基于大运天干地支的组合预测不同类型的事件
    const stem = pillar.heavenlyStem;
    const branch = pillar.earthlyBranch;
    
    // 根据年龄段预测不同类型的事件
    if (age >= 18 && age <= 30) {
      // 青年期：学业、初入社会、恋爱结婚
      events.push(...this.predictYouthEvents(stem, branch, age, year));
    } else if (age >= 31 && age <= 50) {
      // 中年期：事业发展、家庭建设、财富积累
      events.push(...this.predictMiddleAgeEvents(stem, branch, age, year));
    } else if (age >= 51 && age <= 70) {
      // 中老年期：事业巅峰、健康关注、子女成家
      events.push(...this.predictSeniorEvents(stem, branch, age, year));
    } else if (age > 70) {
      // 老年期：健康、家庭和谐、享受天伦
      events.push(...this.predictElderlyEvents(stem, branch, age, year));
    }

    return events;
  }

  /**
   * 预测青年期事件（18-30岁）
   */
  private predictYouthEvents(stem: string, branch: string, age: number, year: number) {
    const events = [];
    
    // 基于天干预测学业和职业事件
    if (stem.includes('甲') || stem.includes('乙')) {
      if (age <= 25) {
        events.push({
          year,
          age,
          eventType: 'study' as const,
          probability: 'high' as const,
          description: '学业有重大突破或转变',
          advice: '把握学习机会，积极进取'
        });
      }
      events.push({
        year,
        age,
        eventType: 'career' as const,
        probability: 'medium' as const,
        description: '适合创新创业或技术发展',
        advice: '发挥创造才能，寻求成长机会'
      });
    }

    // 基于地支预测情感事件
    if (branch.includes('午') || branch.includes('卯')) {
      events.push({
        year,
        age,
        eventType: 'relationship' as const,
        probability: 'high' as const,
        description: '重要的感情关系或婚姻机会',
        advice: '把握情感机会，慎重选择伴侣'
      });
    }

    // 财运事件
    if (stem.includes('戊') || stem.includes('己')) {
      events.push({
        year,
        age,
        eventType: 'wealth' as const,
        probability: 'medium' as const,
        description: '收入稳定增长或投资机会',
        advice: '理性理财，建立财富基础'
      });
    }

    return events;
  }

  /**
   * 预测中年期事件（31-50岁）
   */
  private predictMiddleAgeEvents(stem: string, branch: string, age: number, year: number) {
    const events = [];

    // 事业发展
    if (stem.includes('庚') || stem.includes('辛')) {
      events.push({
        year,
        age,
        eventType: 'career' as const,
        probability: 'high' as const,
        description: '事业有重大变革或突破',
        advice: '把握机会，勇于变革创新'
      });
    }

    // 财富积累
    if (branch.includes('辰') || branch.includes('戌') || branch.includes('丑') || branch.includes('未')) {
      events.push({
        year,
        age,
        eventType: 'wealth' as const,
        probability: 'high' as const,
        description: '财富显著增长或重大投资',
        advice: '稳健投资，多元化发展'
      });
    }

    // 家庭事件
    if (stem.includes('丙') || stem.includes('丁')) {
      events.push({
        year,
        age,
        eventType: 'family' as const,
        probability: 'medium' as const,
        description: '家庭结构变化或子女重要事件',
        advice: '平衡事业与家庭，关注子女成长'
      });
    }

    return events;
  }

  /**
   * 预测中老年期事件（51-70岁）
   */
  private predictSeniorEvents(stem: string, branch: string, age: number, year: number) {
    const events = [];

    // 健康关注
    if (branch.includes('子') || branch.includes('亥')) {
      events.push({
        year,
        age,
        eventType: 'health' as const,
        probability: 'medium' as const,
        description: '需要特别关注身体健康',
        advice: '定期体检，注意养生保健'
      });
    }

    // 事业巅峰或退休准备
    if (stem.includes('壬') || stem.includes('癸')) {
      events.push({
        year,
        age,
        eventType: 'career' as const,
        probability: 'high' as const,
        description: '事业达到巅峰或开始规划退休',
        advice: '总结经验，培养接班人'
      });
    }

    // 子女成家
    if (age >= 55) {
      events.push({
        year,
        age,
        eventType: 'family' as const,
        probability: 'medium' as const,
        description: '子女成家立业或添丁进口',
        advice: '给予支持，享受天伦之乐'
      });
    }

    return events;
  }

  /**
   * 预测老年期事件（70岁以上）
   */
  private predictElderlyEvents(stem: string, branch: string, age: number, year: number) {
    const events = [];

    // 健康养生
    events.push({
      year,
      age,
      eventType: 'health' as const,
      probability: 'high' as const,
      description: '身体健康需要特别关注',
      advice: '注重养生，保持良好心态'
    });

    // 家庭和谐
    events.push({
      year,
      age,
      eventType: 'family' as const,
      probability: 'high' as const,
      description: '享受家庭和谐，儿孙满堂',
      advice: '安享晚年，传承家风'
    });

    return events;
  }

  /**
   * 分析流年互动
   */
  private analyzeYearlyInteraction(
    pillar: LuckPillarResult, 
    yearStem: string, 
    yearBranch: string, 
    year: number
  ) {
    const luckStem = pillar.heavenlyStem;
    const luckBranch = pillar.earthlyBranch;

    // 天干互动分析
    const stemInteraction = this.analyzeStemInteraction(luckStem, yearStem);
    // 地支互动分析  
    const branchInteraction = this.analyzeBranchInteraction(luckBranch, yearBranch);

    // 综合评估
    let overallInteraction: 'favorable' | 'unfavorable' | 'neutral' = 'neutral';
    if (stemInteraction === 'favorable' && branchInteraction === 'favorable') {
      overallInteraction = 'favorable';
    } else if (stemInteraction === 'unfavorable' || branchInteraction === 'unfavorable') {
      overallInteraction = 'unfavorable';
    }

    const description = this.generateInteractionDescription(
      stemInteraction, 
      branchInteraction, 
      luckStem, 
      luckBranch, 
      yearStem, 
      yearBranch
    );

    const recommendations = this.generateInteractionRecommendations(overallInteraction);

    return {
      interaction: overallInteraction,
      description,
      recommendations
    };
  }

  /**
   * 分析天干互动
   */
  private analyzeStemInteraction(luckStem: string, yearStem: string): 'favorable' | 'unfavorable' | 'neutral' {
    // 简化的天干互动分析
    const favorableCombinations = [
      '甲-己', '乙-庚', '丙-辛', '丁-壬', '戊-癸'  // 天干合化
    ];

    const unfavorableCombinations = [
      '甲-庚', '乙-辛', '丙-壬', '丁-癸'  // 天干相冲
    ];

    const combination = `${luckStem}-${yearStem}`;
    const reverseCombination = `${yearStem}-${luckStem}`;

    if (favorableCombinations.includes(combination) || favorableCombinations.includes(reverseCombination)) {
      return 'favorable';
    }
    
    if (unfavorableCombinations.includes(combination) || unfavorableCombinations.includes(reverseCombination)) {
      return 'unfavorable';
    }

    return 'neutral';
  }

  /**
   * 分析地支互动
   */
  private analyzeBranchInteraction(luckBranch: string, yearBranch: string): 'favorable' | 'unfavorable' | 'neutral' {
    // 简化的地支互动分析
    const clashPairs = [
      '子-午', '丑-未', '寅-申', '卯-酉', '辰-戌', '巳-亥'
    ];
 
    const harmonyCombinations = [
      '子-丑', '寅-亥', '卯-戌', '辰-酉', '巳-申', '午-未'  // 地支六合
    ];

    const combination = `${luckBranch}-${yearBranch}`;
    const reverseCombination = `${yearBranch}-${luckBranch}`;

    if (clashPairs.includes(combination) || clashPairs.includes(reverseCombination)) {
      return 'unfavorable';
    }

    if (harmonyCombinations.includes(combination) || harmonyCombinations.includes(reverseCombination)) {
      return 'favorable';
    }

    return 'neutral';
  }

  /**
   * 生成互动描述
   */
  private generateInteractionDescription(
    stemInteraction: string,
    branchInteraction: string, 
    luckStem: string,
    luckBranch: string,
    yearStem: string,
    yearBranch: string
  ): string {
    if (stemInteraction === 'favorable' && branchInteraction === 'favorable') {
      return `${luckStem}${luckBranch}与${yearStem}${yearBranch}天合地合，运势极佳`;
    }
    
    if (stemInteraction === 'unfavorable' && branchInteraction === 'unfavorable') {
      return `${luckStem}${luckBranch}与${yearStem}${yearBranch}天冲地克，需要格外谨慎`;
    }

    if (stemInteraction === 'favorable') {
      return `天干${luckStem}与${yearStem}相合，有贵人助力`;
    }

    if (branchInteraction === 'favorable') {
      return `地支${luckBranch}与${yearBranch}和谐，基础稳固`;
    }

    if (stemInteraction === 'unfavorable') {
      return `天干${luckStem}与${yearStem}相冲，事业需谨慎`;
    }

    if (branchInteraction === 'unfavorable') {
      return `地支${luckBranch}与${yearBranch}相冲，根基不稳`;
    }

    return `${luckStem}${luckBranch}与${yearStem}${yearBranch}互动平和，维持现状`;
  }

  /**
   * 生成互动建议
   */
  private generateInteractionRecommendations(interaction: 'favorable' | 'unfavorable' | 'neutral'): string[] {
    switch (interaction) {
      case 'favorable':
        return [
          '把握良机，积极进取',
          '扩展人脉，寻求合作',
          '重要决策可在此时进行',
          '投资理财较为有利'
        ];
      
      case 'unfavorable':
        return [
          '谨慎行事，避免冲动',
          '延缓重大决策',
          '注意人际关系维护',
          '防范意外风险',
          '保持低调，韬光养晦'
        ];
      
      default:
        return [
          '维持现状，稳步发展',
          '适度调整，不宜激进',
          '关注细节，踏实工作'
        ];
    }
  }

  /**
   * 计算当前年龄
   */
  private calculateCurrentAge(): number {
    // 这里需要根据实际的出生数据计算
    // 暂时返回一个默认值，实际使用时需要从calculator获取
    const currentYear = new Date().getFullYear();
    const birthYear = 1990; // 这应该从calculator中获取实际出生年份
    return currentYear - birthYear;
  }

  /**
   * 获取年份天干
   */
  private getYearStem(year: number): string {
    const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    // 1984年为甲子年，以此为基准计算
    const baseYear = 1984;
    const index = (year - baseYear) % 10;
    return stems[index >= 0 ? index : index + 10];
  }

  /**
   * 获取年份地支
   */
  private getYearBranch(year: number): string {
    const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    // 1984年为甲子年，以此为基准计算  
    const baseYear = 1984;
    const index = (year - baseYear) % 12;
    return branches[index >= 0 ? index : index + 12];
  }
}

/**
 * 每日运势分析器
 */
export class DailyFortuneAnalyzer {
  private calculator: EnhancedBaziCalculator;

  constructor(calculator: EnhancedBaziCalculator) {
    this.calculator = calculator;
  }

  /**
   * 分析指定日期的运势
   */
  async analyzeDailyFortune(targetDate: Date): Promise<{
    date: string;
    overallRating: number; // 1-10
    luckyActivities: string[];
    unluckyActivities: string[];
    luckyDirections: string[];
    recommendations: string[];
    dayMasterInfluence: string;
  } | null> {
    const dailyAnalysis = await this.calculator.getDailyAnalysis(targetDate);

    if (!dailyAnalysis) {
      return null;
    }

    // 计算综合评分
    const overallRating = this.calculateOverallRating(dailyAnalysis);

    // 生成建议
    const luckyActivities = this.generateLuckyActivities(dailyAnalysis);
    const unluckyActivities = this.generateUnluckyActivities(dailyAnalysis);
    const luckyDirections = this.generateLuckyDirections(dailyAnalysis);

    return {
      date: dailyAnalysis.date,
      overallRating,
      luckyActivities,
      unluckyActivities,
      luckyDirections,
      recommendations: this.generateRecommendations(dailyAnalysis),
      dayMasterInfluence: this.getDayMasterInfluence(dailyAnalysis),
    };
  }

  /**
   * 计算综合评分
   */
  private calculateOverallRating(analysis: any): number {
    let score = 5; // 基准分

    // 根据互动数量调整评分
    const interactionCount = analysis.interactions?.length || 0;

    if (interactionCount > 10) {
      score -= 2; // 过多互动，运势偏弱
    } else if (interactionCount > 5) {
      score -= 1;
    } else if (interactionCount < 2) {
      score += 1; // 少量互动，运势较好
    } else {
      score += 0.5;
    }

    // 根据是否吉利调整评分
    if (analysis.isFavorable) {
      score += 1.5;
    } else {
      score -= 1.5;
    }

    // 限制在1-10范围内
    return Math.max(1, Math.min(10, Math.round(score)));
  }

  /**
   * 生成吉利活动
   */
  private generateLuckyActivities(analysis: any): string[] {
    const activities: string[] = [];

    if (analysis.isFavorable) {
      activities.push('重要会议或谈判');
      activities.push('签订合同');
      activities.push('投资理财');
      activities.push('社交聚会');
    } else {
      activities.push('学习充电');
      activities.push('整理规划');
      activities.push('运动健身');
    }

    // 根据日柱元素添加特定活动
    const dayElement = analysis.pillars?.day?.element;
    if (dayElement === 'WOOD') {
      activities.push('户外活动');
    } else if (dayElement === 'FIRE') {
      activities.push('社交活动');
    } else if (dayElement === 'EARTH') {
      activities.push('稳定事务');
    } else if (dayElement === 'METAL') {
      activities.push('执行计划');
    } else if (dayElement === 'WATER') {
      activities.push('创意工作');
    }

    return activities.slice(0, 5); // 最多返回5个
  }

  /**
   * 生成不利活动
   */
  private generateUnluckyActivities(analysis: any): string[] {
    const activities: string[] = [];

    if (!analysis.isFavorable) {
      activities.push('重要决策');
      activities.push('签订协议');
      activities.push('高风险投资');
      activities.push('大型活动');
    } else {
      activities.push('处理纠纷');
      activities.push('强制执行');
    }

    return activities.slice(0, 3);
  }

  /**
   * 生成吉利方向
   */
  private generateLuckyDirections(analysis: any): string[] {
    // 简化的方向建议，实际应该基于八宅风水计算
    const directions = ['东南', '正南', '西南', '东北'];

    // 根据日柱元素调整方向
    const dayElement = analysis.pillars?.day?.element;
    if (dayElement === 'WOOD') {
      return ['东南', '正南'];
    } else if (dayElement === 'FIRE') {
      return ['正南', '西南'];
    } else if (dayElement === 'EARTH') {
      return ['西南', '东北'];
    } else if (dayElement === 'METAL') {
      return ['西北', '正西'];
    } else if (dayElement === 'WATER') {
      return ['正北', '东北'];
    }

    return directions.slice(0, 2);
  }

  /**
   * 生成建议
   */
  private generateRecommendations(analysis: any): string[] {
    const recommendations: string[] = [];

    if (analysis.isFavorable) {
      recommendations.push('适合开展重要事务');
      recommendations.push('把握机会，积极行动');
    } else {
      recommendations.push('宜守不宜进，谨慎行事');
      recommendations.push('适合处理日常事务');
    }

    // 添加通用建议
    recommendations.push('保持良好心态');
    recommendations.push('注意人身安全');

    return recommendations;
  }

  /**
   * 获取日主影响力
   */
  private getDayMasterInfluence(analysis: any): string {
    const interactionCount = analysis.interactions?.length || 0;

    if (interactionCount > 10) {
      return '日主受到较多干扰，需谨慎处理';
    } else if (interactionCount > 5) {
      return '日主有一定影响，适度调整';
    } else {
      return '日主相对稳定，可正常行事';
    }
  }
}

/**
 * 创建大运分析器
 */
export function createLuckPillarsAnalyzer(
  calculator: EnhancedBaziCalculator
): LuckPillarsAnalyzer {
  return new LuckPillarsAnalyzer(calculator);
}

/**
 * 创建每日运势分析器
 */
export function createDailyFortuneAnalyzer(
  calculator: EnhancedBaziCalculator
): DailyFortuneAnalyzer {
  return new DailyFortuneAnalyzer(calculator);
}

/**
 * 便捷的大运分析函数
 */
export async function analyzeLuckPillars(
  birthData: any
): Promise<LuckPillarAnalysis[]> {
  const { createEnhancedBaziCalculator } = await import(
    './enhanced-calculator'
  );
  const calculator = createEnhancedBaziCalculator(birthData);
  const analyzer = createLuckPillarsAnalyzer(calculator);

  return await analyzer.analyzeAllLuckPillars();
}

/**
 * 便捷的每日运势分析函数
 */
export async function analyzeDailyFortune(birthData: any, targetDate: Date) {
  const { createEnhancedBaziCalculator } = await import(
    './enhanced-calculator'
  );
  const calculator = createEnhancedBaziCalculator(birthData);
  const analyzer = createDailyFortuneAnalyzer(calculator);

  return await analyzer.analyzeDailyFortune(targetDate);
}
