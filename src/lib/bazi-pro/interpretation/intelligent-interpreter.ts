/**
 * 八字智能解读引擎
 * 基于AI的个性化命理解释系统
 * 支持多层次输出：小白、进阶、专业
 */

import { TenGodRelationAnalyzer } from '../core/analyzer/ten-gods-relations';
import { WuxingStrengthAnalyzer as WuxingStrengthCalculator } from '../core/analyzer/wuxing-strength';
import { YongshenAnalyzer } from '../core/analyzer/yongshen-analyzer';
import { FourPillarsCalculator } from '../core/calculator/four-pillars';
import { PatternDetector } from '../core/patterns/pattern-detector';
import { ShenShaCalculator } from '../core/shensha/shensha-calculator';
import {
  type BaziChart,
  InterpretationResult,
  type UserLevel,
} from '../types/index';

export interface InterpretationOptions {
  userLevel: UserLevel; // 用户水平：beginner | intermediate | expert
  includeDetails: boolean; // 是否包含详细分析
  focusAreas?: string[]; // 重点关注领域
  language?: 'zh-CN' | 'zh-TW'; // 语言设置
}

export interface ComprehensiveInterpretation {
  summary: {
    overview: string; // 总体概述
    keyPoints: string[]; // 关键要点
    strengths: string[]; // 优势特点
    challenges: string[]; // 挑战建议
  };
  personality: {
    traits: string[]; // 性格特征
    behavior: string[]; // 行为模式
    mindset: string[]; // 思维方式
    emotions: string[]; // 情感表达
  };
  career: {
    suitable: string[]; // 适合职业
    talents: string[]; // 天赋才能
    workStyle: string[]; // 工作风格
    development: string[]; // 发展建议
  };
  wealth: {
    patterns: string[]; // 财运模式
    opportunities: string[]; // 机会领域
    risks: string[]; // 风险提示
    advice: string[]; // 理财建议
  };
  relationships: {
    love: string[]; // 感情婚姻
    family: string[]; // 家庭关系
    social: string[]; // 社交人际
    compatibility: string[]; // 匹配建议
  };
  health: {
    constitution: string[]; // 体质特点
    vulnerabilities: string[]; // 易患疾病
    wellness: string[]; // 养生建议
    mental: string[]; // 心理健康
  };
  fortune: {
    current: string[]; // 当前运势
    upcoming: string[]; // 近期预测
    critical: string[]; // 关键时期
    guidance: string[]; // 行动指导
  };
  spirituality: {
    insights: string[]; // 人生感悟
    purpose: string[]; // 人生使命
    growth: string[]; // 成长方向
    wisdom: string[]; // 智慧提示
  };
}

export class IntelligentInterpreter {
  private calculator: FourPillarsCalculator;
  private strengthAnalyzer: WuxingStrengthCalculator;
  private yongshenAnalyzer: YongshenAnalyzer;
  private patternDetector: PatternDetector;
  private shenshaCalculator: ShenShaCalculator;
  private tenGodsAnalyzer: TenGodRelationAnalyzer;

  constructor() {
    this.calculator = new FourPillarsCalculator();
    this.strengthAnalyzer = new WuxingStrengthCalculator();
    this.yongshenAnalyzer = new YongshenAnalyzer();
    this.patternDetector = new PatternDetector();
    this.shenshaCalculator = new ShenShaCalculator();
    this.tenGodsAnalyzer = new TenGodRelationAnalyzer();
  }

  /**
   * 综合解读主入口
   */
  async interpret(
    analysisData: any,
    options: InterpretationOptions = {
      userLevel: 'beginner',
      includeDetails: true,
      language: 'zh-CN',
    }
  ): Promise<ComprehensiveInterpretation> {
    // 直接使用传入的分析数据
    // 根据用户水平生成解读
    const interpretation = await this.generateInterpretation(
      analysisData,
      options
    );

    return interpretation;
  }

  /**
   * 收集所有分析数据
   */
  private async collectAnalysisData(chart: BaziChart) {
    // 注意: IntelligentInterpreter 接收的是已经计算完成的数据，不需要重新计算
    // 这里返回默认值，实际数据由调用方传入
    return {
      strength: null,
      elements: null,
      yongshen: null,
      pattern: null,
      shensha: null,
      tenGods: null,
    };
  }

  /**
   * 生成综合解读
   */
  private async generateInterpretation(
    data: any,
    options: InterpretationOptions
  ): Promise<ComprehensiveInterpretation> {
    const interpretation: ComprehensiveInterpretation = {
      summary: await this.generateSummary(data, options),
      personality: await this.interpretPersonality(data, options),
      career: await this.interpretCareer(data, options),
      wealth: await this.interpretWealth(data, options),
      relationships: await this.interpretRelationships(data, options),
      health: await this.interpretHealth(data, options),
      fortune: await this.interpretFortune(data, options),
      spirituality: await this.interpretSpirituality(data, options),
    };

    return interpretation;
  }

  /**
   * 生成总体概述
   */
  private async generateSummary(data: any, options: InterpretationOptions) {
    const { pattern, yongshen, strength } = data;

    const overview = this.createOverview(
      pattern,
      yongshen,
      strength,
      options.userLevel
    );
    const keyPoints = this.extractKeyPoints(data, options.userLevel);
    const strengths = this.identifyStrengths(data);
    const challenges = this.identifyChallenges(data);

    return {
      overview,
      keyPoints,
      strengths,
      challenges,
    };
  }

  /**
   * 解读性格特征
   */
  private async interpretPersonality(
    data: any,
    options: InterpretationOptions
  ) {
    const { tenGods, elements, pattern } = data;

    const traits = this.analyzePersonalityTraits(
      tenGods,
      elements,
      options.userLevel
    );
    const behavior = this.analyzeBehaviorPatterns(pattern, tenGods);
    const mindset = this.analyzeMindset(elements, pattern);
    const emotions = this.analyzeEmotionalPatterns(elements, tenGods);

    return {
      traits,
      behavior,
      mindset,
      emotions,
    };
  }

  /**
   * 解读事业发展
   */
  private async interpretCareer(data: any, options: InterpretationOptions) {
    const { pattern, yongshen, tenGods } = data;

    const suitable = this.identifySuitableCareers(
      pattern,
      tenGods,
      options.userLevel
    );
    const talents = this.identifyTalents(tenGods, pattern);
    const workStyle = this.analyzeWorkStyle(pattern, tenGods);
    const development = this.generateCareerAdvice(yongshen, pattern);

    return {
      suitable,
      talents,
      workStyle,
      development,
    };
  }

  /**
   * 解读财运状况
   */
  private async interpretWealth(data: any, options: InterpretationOptions) {
    const { tenGods, yongshen, pattern } = data;

    const patterns = this.analyzeWealthPatterns(tenGods, pattern);
    const opportunities = this.identifyWealthOpportunities(yongshen, pattern);
    const risks = this.identifyFinancialRisks(tenGods, pattern);
    const advice = this.generateWealthAdvice(
      yongshen,
      pattern,
      options.userLevel
    );

    return {
      patterns,
      opportunities,
      risks,
      advice,
    };
  }

  /**
   * 解读感情关系
   */
  private async interpretRelationships(
    data: any,
    options: InterpretationOptions
  ) {
    const { tenGods, shensha, pattern } = data;

    const love = this.analyzeLoveRelationships(
      tenGods,
      shensha,
      options.userLevel
    );
    const family = this.analyzeFamilyRelationships(tenGods, pattern);
    const social = this.analyzeSocialRelationships(pattern, tenGods);
    const compatibility = this.generateCompatibilityAdvice(pattern, tenGods);

    return {
      love,
      family,
      social,
      compatibility,
    };
  }

  /**
   * 解读健康状况
   */
  private async interpretHealth(data: any, options: InterpretationOptions) {
    const { elements, pattern, shensha } = data;

    const constitution = this.analyzeConstitution(elements, pattern);
    const vulnerabilities = this.identifyHealthVulnerabilities(
      elements,
      shensha
    );
    const wellness = this.generateWellnessAdvice(
      elements,
      pattern,
      options.userLevel
    );
    const mental = this.analyzeMentalHealth(pattern, elements);

    return {
      constitution,
      vulnerabilities,
      wellness,
      mental,
    };
  }

  /**
   * 解读运势预测
   */
  private async interpretFortune(data: any, options: InterpretationOptions) {
    const { yongshen, pattern, shensha } = data;

    const current = this.analyzeCurrentFortune(yongshen, shensha);
    const upcoming = this.predictUpcomingFortune(pattern, yongshen);
    const critical = this.identifyCriticalPeriods(pattern, yongshen);
    const guidance = this.generateFortuneGuidance(
      yongshen,
      pattern,
      options.userLevel
    );

    return {
      current,
      upcoming,
      critical,
      guidance,
    };
  }

  /**
   * 解读精神层面
   */
  private async interpretSpirituality(
    data: any,
    options: InterpretationOptions
  ) {
    const { pattern, elements, yongshen } = data;

    const insights = this.generateLifeInsights(
      pattern,
      elements,
      options.userLevel
    );
    const purpose = this.identifyLifePurpose(pattern, yongshen);
    const growth = this.identifyGrowthDirections(yongshen, pattern);
    const wisdom = this.generateWisdomTips(pattern, elements);

    return {
      insights,
      purpose,
      growth,
      wisdom,
    };
  }

  /**
   * 个性化内容调整
   */
  private personalizeContent(
    interpretation: ComprehensiveInterpretation,
    chart: BaziChart,
    options: InterpretationOptions
  ): ComprehensiveInterpretation {
    // 根据用户水平调整专业术语
    if (options.userLevel === 'beginner') {
      return this.simplifyTerminology(interpretation);
    }
    if (options.userLevel === 'expert') {
      return this.addTechnicalDetails(interpretation);
    }

    return interpretation;
  }

  // ===== 辅助方法 =====

  private createOverview(
    pattern: any,
    yongshen: any,
    strength: number,
    level: UserLevel
  ): string {
    if (level === 'beginner') {
      return `您的命格属于${pattern.mainPattern.name}，整体运势${strength > 50 ? '偏强' : '偏弱'}。
              这种命格的人${pattern.details[0]?.characteristics[0] || '具有独特的个性'}，
              建议重点关注${yongshen.primary.element}方面的发展。`;
    }
    if (level === 'expert') {
      return `命主日元${strength}分，${pattern.mainPattern.name}成格。
              用神取${yongshen.primary.element}，忌神为${yongshen.avoid.element}。
              格局纯粹度${pattern.strength}%，${pattern.conflicts.join('；')}`;
    }
    return `您的八字格局为${pattern.mainPattern.name}，日主力量评分${strength}。
              主要用神为${yongshen.primary.element}，适合${yongshen.recommendations[0]}。
              格局特点：${pattern.details[0]?.description || '格局良好'}`;
  }

  private extractKeyPoints(data: any, level: UserLevel): string[] {
    const points: string[] = [];

    // 根据不同水平提取要点
    if (level === 'beginner') {
      points.push('性格特征：' + this.getSimplePersonality(data));
      points.push('事业方向：' + this.getSimpleCareer(data));
      points.push('健康提醒：' + this.getSimpleHealth(data));
    } else {
      points.push(`格局：${data.pattern.mainPattern.name}`);
      points.push(`用神：${data.yongshen.primary.type}`);
      points.push(`优势：${data.pattern.potentials[0]}`);
      points.push(`注意：${data.pattern.conflicts[0] || '无明显冲突'}`);
    }

    return points;
  }

  private identifyStrengths(data: any): string[] {
    const strengths: string[] = [];

    // 从格局中提取优势
    if (data.pattern.mainPattern) {
      strengths.push(...data.pattern.recommendations.slice(0, 3));
    }

    // 从吉神中提取优势
    if (data.shensha.jiShen.length > 0) {
      data.shensha.jiShen.slice(0, 2).forEach((js: any) => {
        strengths.push(js.effects[0]);
      });
    }

    return strengths;
  }

  private identifyChallenges(data: any): string[] {
    const challenges: string[] = [];

    // 从格局冲突中提取挑战
    if (data.pattern.conflicts.length > 0) {
      challenges.push('化解' + data.pattern.conflicts[0]);
    }

    // 从凶神中提取挑战
    if (data.shensha.xiongShen.length > 0) {
      data.shensha.xiongShen.slice(0, 2).forEach((xs: any) => {
        challenges.push(xs.advice);
      });
    }

    // 用神建议
    challenges.push(data.yongshen.recommendations[0]);

    return challenges;
  }

  private analyzePersonalityTraits(
    tenGods: any,
    elements: any,
    level: UserLevel
  ): string[] {
    const traits: string[] = [];

    // 根据十神分析性格
    if (tenGods.zhengGuan > 2) {
      traits.push(level === 'beginner' ? '正直守规' : '正官旺，品行端正');
    }
    if (tenGods.qiSha > 2) {
      traits.push(level === 'beginner' ? '勇敢果断' : '七杀强，性格刚毅');
    }
    if (tenGods.zhengCai > 2) {
      traits.push(level === 'beginner' ? '踏实稳重' : '正财显，勤俭务实');
    }
    if (tenGods.shiShen > 2) {
      traits.push(level === 'beginner' ? '温和善良' : '食神透，心地善良');
    }

    return traits;
  }

  private analyzeBehaviorPatterns(pattern: any, tenGods: any): string[] {
    const behaviors: string[] = [];

    // 根据格局分析行为模式
    const patternBehaviors = pattern.details[0]?.characteristics || [];
    behaviors.push(...patternBehaviors.slice(0, 3));

    return behaviors;
  }

  private analyzeMindset(elements: any, pattern: any): string[] {
    const mindset: string[] = [];

    // 根据五行和格局分析思维方式
    if (elements.wood > 30) mindset.push('思维活跃，富有创造力');
    if (elements.fire > 30) mindset.push('热情洋溢，积极向上');
    if (elements.earth > 30) mindset.push('稳重务实，深思熟虑');
    if (elements.metal > 30) mindset.push('逻辑清晰，坚持原则');
    if (elements.water > 30) mindset.push('智慧灵活，适应力强');

    return mindset;
  }

  private analyzeEmotionalPatterns(elements: any, tenGods: any): string[] {
    const emotions: string[] = [];

    // 根据五行分析情感模式
    if (elements.water > elements.fire) {
      emotions.push('情感内敛，不轻易表露');
    } else {
      emotions.push('情感外露，表达直接');
    }

    if (tenGods.shangGuan > 2) {
      emotions.push('情绪波动较大，需要调节');
    }

    if (tenGods.zhengYin > 2) {
      emotions.push('情感细腻，富有同情心');
    }

    return emotions;
  }

  private identifySuitableCareers(
    pattern: any,
    tenGods: any,
    level: UserLevel
  ): string[] {
    const careers: string[] = [];

    // pattern.mainPattern 本身就是类型字符串，不是对象
    const type =
      typeof pattern?.mainPattern === 'string' ? pattern.mainPattern : '';

    // 根据格局推荐职业
    switch (type) {
      case 'zhengguan':
        careers.push('公务员', '管理岗位', '法律相关');
        break;
      case 'zhengcai':
        careers.push('金融理财', '商业经营', '财务管理');
        break;
      case 'shishen':
        careers.push('艺术创作', '教育培训', '服务行业');
        break;
      default:
        careers.push('技术专业', '自由职业', '创新创业');
        break;
    }

    return careers;
  }

  private identifyTalents(tenGods: any, pattern: any): string[] {
    const talents: string[] = [];

    if (tenGods.shiShen > 2) talents.push('艺术天赋');
    if (tenGods.zhengGuan > 2) talents.push('管理才能');
    if (tenGods.zhengCai > 2) talents.push('理财能力');
    if (tenGods.zhengYin > 2) talents.push('学习能力');
    if (tenGods.qiSha > 2) talents.push('执行力强');

    return talents;
  }

  private analyzeWorkStyle(pattern: any, tenGods: any): string[] {
    const styles: string[] = [];

    // pattern.mainPattern 本身就是类型字符串，不是对象
    const type =
      typeof pattern?.mainPattern === 'string' ? pattern.mainPattern : '';

    if (type.includes('jian') || type.includes('yue')) {
      styles.push('独立自主', '追求卓越', '勇于担当');
    } else if (type.includes('cong')) {
      styles.push('团队合作', '善于配合', '灵活应变');
    } else {
      styles.push('稳健务实', '注重细节', '持续改进');
    }

    return styles;
  }

  private generateCareerAdvice(yongshen: any, pattern: any): string[] {
    const recs: string[] = Array.isArray(pattern?.recommendations)
      ? pattern.recommendations
      : [];
    const careerRec = recs.find(
      (r: string) => typeof r === 'string' && r.includes('事业')
    );
    return [
      `发展${yongshen.primary.element}相关行业更有利`,
      `避免${yongshen.avoid.element}属性过重的工作`,
      careerRec || '稳步发展，把握机遇',
    ];
  }

  private analyzeWealthPatterns(tenGods: any, pattern: any): string[] {
    const patterns: string[] = [];

    if (tenGods.zhengCai > tenGods.pianCai) {
      patterns.push('正财为主，收入稳定');
    } else if (tenGods.pianCai > tenGods.zhengCai) {
      patterns.push('偏财运强，有意外之财');
    }

    if (tenGods.shiShen > 2) {
      patterns.push('食神生财，财源广进');
    }

    return patterns;
  }

  private identifyWealthOpportunities(yongshen: any, pattern: any): string[] {
    return [
      `${yongshen.primary.element}行业财运旺盛`,
      '把握流年大运中的财运高峰期',
      '多元化投资分散风险',
    ];
  }

  private identifyFinancialRisks(tenGods: any, pattern: any): string[] {
    const risks: string[] = [];

    if (tenGods.biJian > 3) risks.push('比劫夺财，需防破财');
    if (tenGods.shangGuan > 3) risks.push('伤官见官，投资需谨慎');

    return risks;
  }

  private generateWealthAdvice(
    yongshen: any,
    pattern: any,
    level: UserLevel
  ): string[] {
    if (level === 'beginner') {
      return ['理性消费，量入为出', '建立应急储备金', '学习投资理财知识'];
    }
    const recs: string[] = Array.isArray(pattern?.recommendations)
      ? pattern.recommendations
      : [];
    const wealthRec = recs.find(
      (r: string) => typeof r === 'string' && r.includes('财')
    );
    return [
      `加强${yongshen.primary.element}属性提升财运`,
      `流年遇${yongshen.primary.element}运财运更佳`,
      wealthRec || '稳健理财',
    ];
  }

  private analyzeLoveRelationships(
    tenGods: any,
    shensha: any,
    level: UserLevel
  ): string[] {
    const love: string[] = [];

    // 检查桃花
    const peachBlossom = shensha.jiShen.find((s: any) =>
      s.name.includes('桃花')
    );
    if (peachBlossom) {
      love.push(level === 'beginner' ? '异性缘佳' : '命带桃花，异性缘旺');
    }

    // 检查孤辰寡宿
    const lonely = shensha.xiongShen.find(
      (s: any) => s.name.includes('孤') || s.name.includes('寡')
    );
    if (lonely) {
      love.push(level === 'beginner' ? '需主动社交' : lonely.advice);
    }

    return love;
  }

  private analyzeFamilyRelationships(tenGods: any, pattern: any): string[] {
    const family: string[] = [];

    if (tenGods.zhengYin > 2) family.push('与母亲关系亲密');
    if (tenGods.pianYin > 2) family.push('长辈缘分深厚');
    if (tenGods.biJian > 2) family.push('兄弟姐妹关系重要');

    return family;
  }

  private analyzeSocialRelationships(pattern: any, tenGods: any): string[] {
    const social: string[] = [];

    if (tenGods.zhengGuan > 2) social.push('人际关系和谐');
    if (tenGods.qiSha > 2) social.push('领导能力强');
    if (tenGods.shiShen > 2) social.push('人缘极佳');

    return social;
  }

  private generateCompatibilityAdvice(pattern: any, tenGods: any): string[] {
    return ['寻找性格互补的伴侣', '注重沟通理解', '共同成长进步'];
  }

  private analyzeConstitution(elements: any, pattern: any): string[] {
    const constitution: string[] = [];

    // 根据五行分析体质
    const dominant = Object.entries(elements).sort(
      ([, a]: any, [, b]: any) => b - a
    )[0][0];

    switch (dominant) {
      case 'wood':
        constitution.push('肝胆系统需要关注');
        break;
      case 'fire':
        constitution.push('心血管系统需要保养');
        break;
      case 'earth':
        constitution.push('脾胃消化需要调理');
        break;
      case 'metal':
        constitution.push('呼吸系统需要保护');
        break;
      case 'water':
        constitution.push('肾脏泌尿系统需关注');
        break;
    }

    return constitution;
  }

  private identifyHealthVulnerabilities(elements: any, shensha: any): string[] {
    const vulnerabilities: string[] = [];

    // 五行失衡导致的健康问题
    Object.entries(elements).forEach(([element, value]: any) => {
      if (value < 10) {
        vulnerabilities.push(`${element}不足，需要补充`);
      } else if (value > 40) {
        vulnerabilities.push(`${element}过旺，需要泄化`);
      }
    });

    return vulnerabilities;
  }

  private generateWellnessAdvice(
    elements: any,
    pattern: any,
    level: UserLevel
  ): string[] {
    if (level === 'beginner') {
      return ['保持规律作息', '均衡饮食营养', '适度运动锻炼', '调节情绪压力'];
    }
    const advice: string[] = [];

    // 根据五行给出具体建议
    const weak = Object.entries(elements).sort(
      ([, a]: any, [, b]: any) => a - b
    )[0][0];

    advice.push(`补充${weak}属性食物和活动`);
    advice.push('根据季节调整养生方法');
    advice.push('选择适合的运动方式');

    return advice;
  }

  private analyzeMentalHealth(pattern: any, elements: any): string[] {
    const mental: string[] = [];

    if (elements.water < 20) mental.push('容易焦虑，需要放松');
    if (elements.fire > 35) mental.push('情绪激动，需要冷静');
    if (elements.earth < 15) mental.push('缺乏安全感，需要稳定');

    mental.push('保持积极乐观的心态');

    return mental;
  }

  private analyzeCurrentFortune(yongshen: any, shensha: any): string[] {
    const fortune: string[] = [];

    fortune.push(
      `当前运势${shensha.summary.totalJiShen > shensha.summary.totalXiongShen ? '吉利' : '需谨慎'}`
    );
    fortune.push(...shensha.summary.majorInfluences.slice(0, 2));

    return fortune;
  }

  private predictUpcomingFortune(pattern: any, yongshen: any): string[] {
    return [
      '近期适合稳步发展',
      `关注${yongshen.primary.element}相关机会`,
      '避免冒进决策',
    ];
  }

  private identifyCriticalPeriods(pattern: any, yongshen: any): string[] {
    return ['流年遇冲需谨慎', '大运交接期注意调整', '用神受克时需防范'];
  }

  private generateFortuneGuidance(
    yongshen: any,
    pattern: any,
    level: UserLevel
  ): string[] {
    return yongshen.recommendations;
  }

  private generateLifeInsights(
    pattern: any,
    elements: any,
    level: UserLevel
  ): string[] {
    if (level === 'beginner') {
      return ['人生是一场修行', '顺应自然规律', '把握当下机遇'];
    }
    return [
      `${pattern.mainPattern.name}者，宜${pattern.recommendations[0]}`,
      '命运可以改变，关键在于选择',
      '知命而不认命，才是智慧',
    ];
  }

  private identifyLifePurpose(pattern: any, yongshen: any): string[] {
    return [
      '发挥天赋才能，创造价值',
      '帮助他人，回馈社会',
      '不断学习成长，完善自我',
    ];
  }

  private identifyGrowthDirections(yongshen: any, pattern: any): string[] {
    return [
      `加强${yongshen.primary.element}方面的修养`,
      '克服性格中的不足',
      '拓展人生的可能性',
    ];
  }

  private generateWisdomTips(pattern: any, elements: any): string[] {
    return [
      '中庸之道，过犹不及',
      '天时地利人和，缺一不可',
      '积善之家，必有余庆',
    ];
  }

  private simplifyTerminology(
    interpretation: ComprehensiveInterpretation
  ): ComprehensiveInterpretation {
    // 简化专业术语为通俗易懂的语言
    return interpretation;
  }

  private addTechnicalDetails(
    interpretation: ComprehensiveInterpretation
  ): ComprehensiveInterpretation {
    // 添加更多专业技术细节
    return interpretation;
  }

  private getSimplePersonality(data: any): string {
    const traits = [];
    if (data.tenGods.zhengGuan > 2) traits.push('正直');
    if (data.tenGods.shiShen > 2) traits.push('善良');
    if (data.tenGods.qiSha > 2) traits.push('果断');
    return traits.join('、') || '独特';
  }

  private getSimpleCareer(data: any): string {
    return (
      data.pattern.recommendations.find(
        (r: string) => r.includes('事业') || r.includes('适合')
      ) || '多元发展'
    );
  }

  private getSimpleHealth(data: any): string {
    return '注意养生，保持健康';
  }
}
