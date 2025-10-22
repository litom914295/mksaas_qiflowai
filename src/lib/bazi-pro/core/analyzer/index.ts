/**
 * 八字专业分析器主模块
 * 整合所有分析功能，提供统一接口
 */

import {
  type FourPillars,
  fourPillarsCalculator,
} from '../calculator/four-pillars';
import {
  type TenGodsResult as TenGods,
  tenGodsCalculator,
} from '../calculator/ten-gods';
import { HiddenStem, hiddenStemsAnalyzer } from './hidden-stems';
import {
  type PersonalityTraits,
  type TenGodAnalysis,
  tenGodRelationAnalyzer,
} from './ten-gods-relations';
import {
  type DayMasterStrength,
  type WuxingStrength,
  wuxingStrengthAnalyzer,
} from './wuxing-strength';

// 综合分析结果
export interface BaziAnalysisResult {
  // 基础信息
  basicInfo: {
    name?: string;
    gender: '男' | '女';
    birthDate: string;
    birthTime: string;
    location?: {
      province?: string;
      city?: string;
      longitude?: number;
      latitude?: number;
    };
    solarTime: string; // 真太阳时
    lunarDate: string; // 农历日期
  };

  // 四柱信息
  fourPillars: FourPillars & {
    nayin: {
      year: string;
      month: string;
      day: string;
      hour: string;
    };
  };

  // 十神信息
  tenGods: TenGods;

  // 五行分析
  wuxing: {
    strength: WuxingStrength;
    dayMaster: DayMasterStrength;
    balance: string;
    yongShen: string[]; // 用神
    xiShen: string[]; // 喜神
    jiShen: string[]; // 忌神
    chouShen: string[]; // 仇神
  };

  // 十神分析
  tenGodAnalysis: TenGodAnalysis;

  // 格局判断
  pattern: {
    mainPattern: string; // 主格局
    subPatterns: string[]; // 副格局
    special: boolean; // 是否特殊格局
    description: string; // 格局说明
    score: number; // 格局评分 0-100
  };

  // 性格分析
  personality: PersonalityTraits & {
    summary: string; // 性格总结
    advice: string[]; // 发展建议
  };

  // 事业财运
  career: {
    suitable: string[]; // 适合行业
    unsuitable: string[]; // 不适合行业
    direction: string[]; // 发展方向
    timing: string[]; // 事业时机
    wealth: {
      type: string; // 财运类型
      level: number; // 财运等级 1-10
      advice: string[]; // 理财建议
    };
  };

  // 婚姻感情
  marriage: {
    type: string; // 感情类型
    quality: number; // 婚姻质量 1-10
    timing: string[]; // 婚姻时机
    advice: string[]; // 感情建议
  };

  // 健康状况
  health: {
    concerns: string[]; // 健康隐患
    organs: string[]; // 注意器官
    prevention: string[]; // 预防建议
  };

  // 大运流年（简要）
  fortune: {
    currentDayun?: {
      age: string;
      period: string;
      ganZhi: string;
      influence: string;
    };
    currentYear?: {
      year: number;
      ganZhi: string;
      influence: string;
    };
    keyYears: number[]; // 关键年份
  };

  // 综合建议
  recommendations: {
    colors: string[]; // 吉利颜色
    numbers: number[]; // 吉利数字
    directions: string[]; // 吉利方位
    elements: string[]; // 补充五行
    lifestyle: string[]; // 生活建议
  };

  // 分析评分
  scores: {
    overall: number; // 综合评分 0-100
    career: number; // 事业评分
    wealth: number; // 财运评分
    marriage: number; // 婚姻评分
    health: number; // 健康评分
  };

  // 元数据
  metadata: {
    version: string;
    analysisTime: string;
    accuracy: number; // 准确度评估 0-100
  };
}

/**
 * 八字综合分析器
 */
export class BaziAnalyzer {
  /**
   * 执行完整的八字分析
   */
  public async analyze(params: {
    name?: string;
    gender: '男' | '女';
    year: number;
    month: number;
    day: number;
    hour: number;
    minute?: number;
    longitude?: number;
    latitude?: number;
  }): Promise<BaziAnalysisResult> {
    // Step 1: 计算四柱
    const fourPillars = await fourPillarsCalculator.calculate({
      year: params.year,
      month: params.month,
      day: params.day,
      hour: params.hour,
      minute: params.minute || 0,
      longitude: params.longitude || 120, // 默认东经120度（北京）
      latitude: params.latitude || 39.9, // 默认39.9度
    });

    // Step 2: 计算十神
    const tenGods = tenGodsCalculator.calculate(fourPillars);

    // Step 3: 五行力量分析
    const wuxingStrength =
      wuxingStrengthAnalyzer.calculateWuxingStrength(fourPillars);
    const dayMasterStrength = wuxingStrengthAnalyzer.calculateDayMasterStrength(
      fourPillars,
      wuxingStrength
    );

    // Step 4: 十神关系分析
    const tenGodAnalysis = tenGodRelationAnalyzer.analyzeTenGodRelations(
      fourPillars,
      tenGods
    );

    // Step 5: 计算用神喜忌
    const godPreferences = this.calculateGodPreferences(
      fourPillars,
      wuxingStrength,
      dayMasterStrength
    );

    // Step 6: 格局判断
    const pattern = this.analyzePattern(
      fourPillars,
      tenGods,
      tenGodAnalysis,
      dayMasterStrength
    );

    // Step 7: 性格分析
    const personality = this.analyzePersonality(
      tenGodAnalysis.personality,
      pattern
    );

    // Step 8: 事业财运分析
    const career = this.analyzeCareer(tenGodAnalysis, pattern, godPreferences);

    // Step 9: 婚姻感情分析
    const marriage = this.analyzeMarriage(
      tenGods,
      tenGodAnalysis,
      params.gender
    );

    // Step 10: 健康分析
    const health = this.analyzeHealth(wuxingStrength, tenGodAnalysis);

    // Step 11: 综合建议
    const recommendations = this.generateRecommendations(
      godPreferences,
      wuxingStrength
    );

    // Step 12: 计算评分
    const scores = this.calculateScores(
      pattern,
      tenGodAnalysis,
      dayMasterStrength
    );

    // 构建返回结果
    return {
      basicInfo: {
        name: params.name,
        gender: params.gender,
        birthDate: `${params.year}-${String(params.month).padStart(2, '0')}-${String(params.day).padStart(2, '0')}`,
        birthTime: `${String(params.hour).padStart(2, '0')}:${String(params.minute || 0).padStart(2, '0')}`,
        location: params.longitude
          ? {
              longitude: params.longitude,
              latitude: params.latitude,
            }
          : undefined,
        solarTime: (fourPillars as any).solarTime || '',
        lunarDate: (fourPillars as any).lunarDate || '',
      },

      fourPillars: {
        ...fourPillars,
        nayin: this.calculateNayin(fourPillars),
      },

      tenGods,

      wuxing: {
        strength: wuxingStrength,
        dayMaster: dayMasterStrength,
        balance: this.describeWuxingBalance(wuxingStrength),
        ...godPreferences,
      },

      tenGodAnalysis,
      pattern,
      personality,
      career,
      marriage,
      health,

      fortune: {
        keyYears: this.calculateKeyYears(params.year),
      },

      recommendations,
      scores,

      metadata: {
        version: '5.1.1',
        analysisTime: new Date().toISOString(),
        accuracy: this.evaluateAccuracy(fourPillars),
      },
    };
  }

  /**
   * 计算用神喜忌
   */
  private calculateGodPreferences(
    fourPillars: FourPillars,
    wuxingStrength: WuxingStrength,
    dayMasterStrength: DayMasterStrength
  ): {
    yongShen: string[];
    xiShen: string[];
    jiShen: string[];
    chouShen: string[];
  } {
    const yongShen: string[] = [];
    const xiShen: string[] = [];
    const jiShen: string[] = [];
    const chouShen: string[] = [];

    const dayElement = dayMasterStrength.element;

    if (dayMasterStrength.strength === 'weak') {
      // 身弱：喜印比，忌官杀财
      yongShen.push(this.getGeneratingElement(dayElement)); // 印
      yongShen.push(dayElement); // 比劫

      xiShen.push(this.getGeneratedElement(dayElement)); // 食伤（泄气适度）

      jiShen.push(this.getControllingElement(dayElement)); // 官杀
      jiShen.push(this.getControlledElement(dayElement)); // 财
    } else if (dayMasterStrength.strength === 'strong') {
      // 身强：喜财官食伤，忌印比
      yongShen.push(this.getControlledElement(dayElement)); // 财
      yongShen.push(this.getGeneratedElement(dayElement)); // 食伤

      xiShen.push(this.getControllingElement(dayElement)); // 官杀

      jiShen.push(this.getGeneratingElement(dayElement)); // 印
      jiShen.push(dayElement); // 比劫
    } else {
      // 中和：需要具体分析
      const elements = ['木', '火', '土', '金', '水'];
      const weakest = this.findWeakestElement(wuxingStrength);
      yongShen.push(weakest);
      xiShen.push(this.getGeneratingElement(weakest));
    }

    return { yongShen, xiShen, jiShen, chouShen };
  }

  /**
   * 分析格局
   */
  private analyzePattern(
    fourPillars: FourPillars,
    tenGods: TenGods,
    tenGodAnalysis: TenGodAnalysis,
    dayMasterStrength: DayMasterStrength
  ): BaziAnalysisResult['pattern'] {
    let mainPattern = '';
    const subPatterns: string[] = [];
    let special = false;
    let description = '';
    let score = 50;

    // 检查特殊格局
    if (this.checkSpecialPattern(fourPillars, tenGods)) {
      special = true;
      mainPattern = this.identifySpecialPattern(fourPillars, tenGods);
      description = `特殊格局：${mainPattern}，需要特殊分析方法`;
      score = 80;
    } else {
      // 普通格局
      if (tenGodAnalysis.patterns.length > 0) {
        mainPattern = tenGodAnalysis.patterns[0];
        subPatterns.push(...tenGodAnalysis.patterns.slice(1));
      }

      // 根据十神组合评分
      const bestCombo = tenGodAnalysis.combinations[0];
      if (bestCombo) {
        score = bestCombo.score;
        description = bestCombo.meaning;
      }
    }

    // 补充格局描述
    if (!mainPattern) {
      if (dayMasterStrength.strength === 'strong') {
        mainPattern = '身强格';
      } else if (dayMasterStrength.strength === 'weak') {
        mainPattern = '身弱格';
      } else {
        mainPattern = '中和格';
      }
    }

    return {
      mainPattern,
      subPatterns,
      special,
      description:
        description ||
        `${mainPattern}，${dayMasterStrength.factors.join('，')}`,
      score,
    };
  }

  /**
   * 分析性格
   */
  private analyzePersonality(
    traits: PersonalityTraits,
    pattern: BaziAnalysisResult['pattern']
  ): BaziAnalysisResult['personality'] {
    const summary = this.generatePersonalitySummary(traits, pattern);
    const advice = this.generatePersonalityAdvice(traits);

    return {
      ...traits,
      summary,
      advice,
    };
  }

  /**
   * 分析事业财运
   */
  private analyzeCareer(
    tenGodAnalysis: TenGodAnalysis,
    pattern: BaziAnalysisResult['pattern'],
    godPreferences: any
  ): BaziAnalysisResult['career'] {
    const suitable = [...new Set(tenGodAnalysis.personality.career)];
    const unsuitable: string[] = [];

    // 根据忌神判断不适合的行业
    for (const jiShen of godPreferences.jiShen) {
      if (jiShen === '木') {
        unsuitable.push('木材', '园林', '教育');
      } else if (jiShen === '火') {
        unsuitable.push('电子', '能源', '娱乐');
      } else if (jiShen === '土') {
        unsuitable.push('房地产', '建筑', '农业');
      } else if (jiShen === '金') {
        unsuitable.push('金融', '机械', '五金');
      } else if (jiShen === '水') {
        unsuitable.push('水产', '运输', '贸易');
      }
    }

    const direction = this.analyzeCareerDirection(pattern, tenGodAnalysis);
    const timing = this.analyzeCareerTiming(godPreferences);

    // 财运分析
    const wealthAnalysis = this.analyzeWealth(tenGodAnalysis);

    return {
      suitable,
      unsuitable,
      direction,
      timing,
      wealth: wealthAnalysis,
    };
  }

  /**
   * 分析婚姻感情
   */
  private analyzeMarriage(
    tenGods: TenGods,
    tenGodAnalysis: TenGodAnalysis,
    gender: '男' | '女'
  ): BaziAnalysisResult['marriage'] {
    let type = '平稳型';
    let quality = 6;
    const timing: string[] = [];
    const advice: string[] = [];

    // 根据性别分析配偶星
    if (gender === '男') {
      // 男命看财星
      const hasZhengCai = tenGodAnalysis.balance.wealthFood > 0;
      if (hasZhengCai) {
        type = '专一稳定型';
        quality = 8;
        advice.push('感情专一，适合稳定关系');
      }
    } else {
      // 女命看官星
      const hasZhengGuan = tenGodAnalysis.balance.officialKilling > 0;
      if (hasZhengGuan) {
        type = '传统稳定型';
        quality = 8;
        advice.push('适合传统婚姻模式');
      }
    }

    // 添加关系建议
    advice.push(...tenGodAnalysis.personality.relationships);

    return {
      type,
      quality,
      timing,
      advice,
    };
  }

  /**
   * 分析健康
   */
  private analyzeHealth(
    wuxingStrength: WuxingStrength,
    tenGodAnalysis: TenGodAnalysis
  ): BaziAnalysisResult['health'] {
    const concerns: string[] = [];
    const organs: string[] = [];
    const prevention: string[] = [];

    // 根据五行失衡判断健康问题
    if (wuxingStrength.wood < 10) {
      concerns.push('肝胆系统需要关注');
      organs.push('肝', '胆');
      prevention.push('保持情绪稳定，避免熬夜');
    }

    if (wuxingStrength.fire < 10) {
      concerns.push('心血管系统需要关注');
      organs.push('心脏', '小肠');
      prevention.push('适度运动，控制血压');
    }

    if (wuxingStrength.earth < 10) {
      concerns.push('脾胃系统需要关注');
      organs.push('脾', '胃');
      prevention.push('规律饮食，避免生冷');
    }

    if (wuxingStrength.metal < 10) {
      concerns.push('呼吸系统需要关注');
      organs.push('肺', '大肠');
      prevention.push('注意空气质量，增强免疫');
    }

    if (wuxingStrength.water < 10) {
      concerns.push('泌尿系统需要关注');
      organs.push('肾', '膀胱');
      prevention.push('多喝水，避免过度劳累');
    }

    // 添加十神分析的健康建议
    prevention.push(...tenGodAnalysis.personality.health);

    return {
      concerns,
      organs: [...new Set(organs)],
      prevention: [...new Set(prevention)],
    };
  }

  /**
   * 生成综合建议
   */
  private generateRecommendations(
    godPreferences: any,
    wuxingStrength: WuxingStrength
  ): BaziAnalysisResult['recommendations'] {
    const colors: string[] = [];
    const numbers: number[] = [];
    const directions: string[] = [];
    const elements: string[] = [];
    const lifestyle: string[] = [];

    // 根据用神推荐
    for (const yong of godPreferences.yongShen) {
      if (yong === '木') {
        colors.push('绿色', '青色');
        numbers.push(3, 8);
        directions.push('东方', '东南方');
        elements.push('木');
        lifestyle.push('多接触大自然');
      } else if (yong === '火') {
        colors.push('红色', '紫色');
        numbers.push(2, 7);
        directions.push('南方');
        elements.push('火');
        lifestyle.push('保持热情积极');
      } else if (yong === '土') {
        colors.push('黄色', '棕色');
        numbers.push(5, 0);
        directions.push('中央', '西南', '东北');
        elements.push('土');
        lifestyle.push('注重稳定踏实');
      } else if (yong === '金') {
        colors.push('白色', '金色');
        numbers.push(4, 9);
        directions.push('西方', '西北');
        elements.push('金');
        lifestyle.push('培养决断力');
      } else if (yong === '水') {
        colors.push('黑色', '蓝色');
        numbers.push(1, 6);
        directions.push('北方');
        elements.push('水');
        lifestyle.push('保持灵活变通');
      }
    }

    return {
      colors: [...new Set(colors)],
      numbers: [...new Set(numbers)],
      directions: [...new Set(directions)],
      elements: [...new Set(elements)],
      lifestyle: [...new Set(lifestyle)],
    };
  }

  /**
   * 计算综合评分
   */
  private calculateScores(
    pattern: BaziAnalysisResult['pattern'],
    tenGodAnalysis: TenGodAnalysis,
    dayMasterStrength: DayMasterStrength
  ): BaziAnalysisResult['scores'] {
    // 基础分60分
    let overall = 60;
    let career = 60;
    let wealth = 60;
    let marriage = 60;
    let health = 60;

    // 格局加分
    overall += pattern.score * 0.2;

    // 日主强弱平衡加分
    if (dayMasterStrength.strength === 'balanced') {
      overall += 10;
      health += 10;
    }

    // 十神组合加分
    if (tenGodAnalysis.combinations.length > 0) {
      const avgScore =
        tenGodAnalysis.combinations.reduce((sum, c) => sum + c.score, 0) /
        tenGodAnalysis.combinations.length;
      career += avgScore * 0.2;
      wealth += avgScore * 0.15;
    }

    // 十神平衡加分
    if (tenGodAnalysis.balance.balance.type === 'balanced') {
      overall += 5;
      marriage += 10;
    }

    return {
      overall: Math.min(Math.round(overall), 100),
      career: Math.min(Math.round(career), 100),
      wealth: Math.min(Math.round(wealth), 100),
      marriage: Math.min(Math.round(marriage), 100),
      health: Math.min(Math.round(health), 100),
    };
  }

  // 辅助方法

  private calculateNayin(fourPillars: FourPillars): any {
    // 纳音五行计算（简化版）
    return {
      year: '海中金',
      month: '炉中火',
      day: '大林木',
      hour: '路旁土',
    };
  }

  private describeWuxingBalance(strength: WuxingStrength): string {
    const elements = [
      { name: '木', value: strength.wood },
      { name: '火', value: strength.fire },
      { name: '土', value: strength.earth },
      { name: '金', value: strength.metal },
      { name: '水', value: strength.water },
    ];

    elements.sort((a, b) => b.value - a.value);

    if (elements[0].value > 30) {
      return `${elements[0].name}过旺`;
    }
    if (elements[4].value < 10) {
      return `${elements[4].name}过弱`;
    }
    return '五行相对平衡';
  }

  private findWeakestElement(strength: WuxingStrength): string {
    const elements = [
      { name: '木', value: strength.wood },
      { name: '火', value: strength.fire },
      { name: '土', value: strength.earth },
      { name: '金', value: strength.metal },
      { name: '水', value: strength.water },
    ];

    elements.sort((a, b) => a.value - b.value);
    return elements[0].name;
  }

  private getGeneratingElement(element: string): string {
    const map: Record<string, string> = {
      木: '水',
      火: '木',
      土: '火',
      金: '土',
      水: '金',
    };
    return map[element] || element;
  }

  private getGeneratedElement(element: string): string {
    const map: Record<string, string> = {
      木: '火',
      火: '土',
      土: '金',
      金: '水',
      水: '木',
    };
    return map[element] || element;
  }

  private getControllingElement(element: string): string {
    const map: Record<string, string> = {
      木: '金',
      火: '水',
      土: '木',
      金: '火',
      水: '土',
    };
    return map[element] || element;
  }

  private getControlledElement(element: string): string {
    const map: Record<string, string> = {
      木: '土',
      火: '金',
      土: '水',
      金: '木',
      水: '火',
    };
    return map[element] || element;
  }

  private checkSpecialPattern(
    fourPillars: FourPillars,
    tenGods: TenGods
  ): boolean {
    // 检查是否为特殊格局（从格、化格等）
    // 这里简化处理
    return false;
  }

  private identifySpecialPattern(
    fourPillars: FourPillars,
    tenGods: TenGods
  ): string {
    // 识别具体的特殊格局
    return '特殊格局';
  }

  private generatePersonalitySummary(
    traits: PersonalityTraits,
    pattern: BaziAnalysisResult['pattern']
  ): string {
    const strengths = traits.strengths.slice(0, 3).join('、');
    const mainPattern = pattern.mainPattern;

    return `${mainPattern}之人，${strengths}，${pattern.description}`;
  }

  private generatePersonalityAdvice(traits: PersonalityTraits): string[] {
    const advice: string[] = [];

    // 根据弱点生成建议
    if (traits.weaknesses.includes('保守谨慎')) {
      advice.push('适当增加创新思维');
    }
    if (traits.weaknesses.includes('冲动鲁莽')) {
      advice.push('决策前多思考');
    }
    if (traits.weaknesses.includes('依赖性强')) {
      advice.push('培养独立能力');
    }

    // 根据优势生成建议
    if (traits.strengths.includes('责任心强')) {
      advice.push('适合担任管理职位');
    }
    if (traits.strengths.includes('才华横溢')) {
      advice.push('发挥创意特长');
    }

    return advice;
  }

  private analyzeCareerDirection(
    pattern: BaziAnalysisResult['pattern'],
    tenGodAnalysis: TenGodAnalysis
  ): string[] {
    const directions: string[] = [];

    if (pattern.mainPattern.includes('贵格')) {
      directions.push('仕途发展');
    }
    if (pattern.mainPattern.includes('富格')) {
      directions.push('商业经营');
    }
    if (pattern.mainPattern.includes('才华格')) {
      directions.push('艺术创作');
    }

    return directions;
  }

  private analyzeCareerTiming(godPreferences: any): string[] {
    const timing: string[] = [];

    // 根据用神分析事业时机
    for (const yong of godPreferences.yongShen) {
      if (yong === '木') {
        timing.push('春季机遇较多');
      } else if (yong === '火') {
        timing.push('夏季发展顺利');
      } else if (yong === '土') {
        timing.push('换季时期有转机');
      } else if (yong === '金') {
        timing.push('秋季收获期');
      } else if (yong === '水') {
        timing.push('冬季蓄势待发');
      }
    }

    return timing;
  }

  private analyzeWealth(tenGodAnalysis: TenGodAnalysis): any {
    let type = '正财型';
    let level = 6;
    const advice: string[] = [];

    if (tenGodAnalysis.balance.wealthFood > 3) {
      type = '财运亨通型';
      level = 8;
      advice.push('善于理财', '投资机会多');
    } else if (tenGodAnalysis.balance.wealthFood < 1) {
      type = '淡泊财运型';
      level = 4;
      advice.push('需要加强理财意识', '稳健为主');
    }

    advice.push(...tenGodAnalysis.personality.wealth);

    return {
      type,
      level,
      advice: [...new Set(advice)],
    };
  }

  private calculateKeyYears(birthYear: number): number[] {
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    const keyYears: number[] = [];

    // 添加重要流年
    for (let i = 0; i < 10; i++) {
      const year = currentYear + i;
      if ((year - birthYear) % 12 === 0) {
        // 本命年
        keyYears.push(year);
      } else if ((year - birthYear) % 10 === 0) {
        // 大运交接
        keyYears.push(year);
      }
    }

    return keyYears;
  }

  private evaluateAccuracy(fourPillars: FourPillars): number {
    let accuracy = 70; // 基础准确度

    // 有真太阳时校正加分
    if ((fourPillars as any).solarTime) {
      accuracy += 10;
    }

    // 有精确出生时间加分
    if (fourPillars.hour) {
      accuracy += 10;
    }

    // 有出生地信息加分
    if ((fourPillars as any).monthOrder) {
      accuracy += 10;
    }

    return Math.min(accuracy, 99);
  }
}

// 导出单例
export const baziAnalyzer = new BaziAnalyzer();

// 导出所有子模块
export { hiddenStemsAnalyzer } from './hidden-stems';
export { wuxingStrengthAnalyzer } from './wuxing-strength';
export { tenGodRelationAnalyzer } from './ten-gods-relations';
export type { HiddenStem } from './hidden-stems';
export type { WuxingStrength, DayMasterStrength } from './wuxing-strength';
export type { TenGodAnalysis, PersonalityTraits } from './ten-gods-relations';
