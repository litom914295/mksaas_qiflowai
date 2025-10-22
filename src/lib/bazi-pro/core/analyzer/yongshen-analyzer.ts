/**
 * 用神综合分析器
 * 多维度智能判定用神系统
 */

import type { Element, FourPillars, WuxingStrength } from '../types';
import { monthlyStateAnalyzer } from './monthly-state';
import { wuxingStrengthAnalyzer } from './wuxing-strength';

/**
 * 用神类型枚举
 */
export enum YongshenType {
  扶抑 = 'FUYI', // 扶抑用神
  调候 = 'TIAOHOU', // 调候用神
  通关 = 'TONGGUAN', // 通关用神
  病药 = 'BINGYAO', // 病药用神
  从格 = 'CONGGE', // 从格用神
}

/**
 * 用神分析结果
 */
export interface YongshenResult {
  type: YongshenType; // 用神类型
  primary: Element[]; // 主要用神
  secondary: Element[]; // 次要用神
  avoid: Element[]; // 忌神
  dayMasterStrength: number; // 日主强度(0-100)
  pattern: string; // 格局描述
  explanation: string; // 详细说明
  recommendations: {
    career: string[]; // 事业建议
    wealth: string[]; // 财运建议
    health: string[]; // 健康建议
    relationship: string[]; // 感情建议
  };
}

/**
 * 季节类型
 */
type Season = 'spring' | 'summer' | 'autumn' | 'winter';

/**
 * 用神综合分析器
 */
export class YongshenAnalyzer {
  // 五行生克关系
  private static readonly GENERATING_CYCLE: { [key in Element]: Element } = {
    wood: 'fire',
    fire: 'earth',
    earth: 'metal',
    metal: 'water',
    water: 'wood',
  };

  private static readonly CONTROLLING_CYCLE: { [key in Element]: Element } = {
    wood: 'earth',
    fire: 'metal',
    earth: 'water',
    metal: 'wood',
    water: 'fire',
  };

  /**
   * 综合分析用神
   */
  public analyzeYongshen(
    fourPillars: FourPillars,
    wuxingStrength: WuxingStrength,
    birthDate: Date
  ): YongshenResult {
    // 1. 计算日主强弱
    const dayMasterStrength = this.calculateDayMasterStrength(
      fourPillars,
      wuxingStrength
    );

    // 2. 判断基本格局
    const pattern = this.determinePattern(
      dayMasterStrength,
      fourPillars,
      wuxingStrength
    );

    // 3. 判定用神类型
    const yongshenType = this.determineYongshenType(
      dayMasterStrength,
      fourPillars,
      pattern
    );

    // 4. 根据不同类型选择用神
    let result: Partial<YongshenResult>;

    switch (yongshenType) {
      case YongshenType.扶抑:
        result = this.selectFuyiYongshen(
          dayMasterStrength,
          fourPillars,
          wuxingStrength
        );
        break;

      case YongshenType.调候:
        result = this.selectTiaohouYongshen(birthDate, fourPillars);
        break;

      case YongshenType.通关:
        result = this.selectTongguanYongshen(wuxingStrength, fourPillars);
        break;

      case YongshenType.病药:
        result = this.selectBingyaoYongshen(fourPillars, wuxingStrength);
        break;

      case YongshenType.从格:
        result = this.selectConggeYongshen(fourPillars, wuxingStrength);
        break;

      default:
        result = this.selectFuyiYongshen(
          dayMasterStrength,
          fourPillars,
          wuxingStrength
        );
    }

    // 5. 生成建议
    const recommendations = this.generateRecommendations(
      result.primary || [],
      result.secondary || [],
      fourPillars
    );

    return {
      type: yongshenType,
      dayMasterStrength,
      pattern,
      ...result,
      recommendations,
    } as YongshenResult;
  }

  /**
   * 计算日主强弱（0-100分）
   */
  private calculateDayMasterStrength(
    fourPillars: FourPillars,
    wuxingStrength: WuxingStrength
  ): number {
    // 验证 fourPillars 数据完整性
    if (!fourPillars?.day?.gan) {
      throw new Error('日柱天干缺失，无法计算日主强度');
    }
    if (!fourPillars?.month?.zhi) {
      console.error('[YongshenAnalyzer] 错误: 月柱地支缺失', { fourPillars });
      throw new Error('月柱地支缺失，无法计算日主强度');
    }

    const dayMasterElement = this.getDayMasterElement(fourPillars.day.gan);

    // 基础分值（五行力量占比）
    const totalStrength = Object.values(wuxingStrength).reduce(
      (a, b) => a + b,
      0
    );
    const dayMasterRatio =
      (wuxingStrength[dayMasterElement] / totalStrength) * 100;

    // 月令调整
    const monthlyTendency = monthlyStateAnalyzer.getDayMasterTendency(
      dayMasterElement,
      fourPillars.month.zhi
    );

    let strength = dayMasterRatio;

    // 根据月令状态调整
    if (monthlyTendency.tendency === 'strong') {
      strength += 15;
    } else if (monthlyTendency.tendency === 'weak') {
      strength -= 15;
    }

    // 通根加分
    const rootingBonus = this.calculateRootingBonus(
      fourPillars,
      dayMasterElement
    );
    strength += rootingBonus;

    // 归一化到0-100
    return Math.max(0, Math.min(100, strength));
  }

  /**
   * 判断格局类型
   */
  private determinePattern(
    dayMasterStrength: number,
    fourPillars: FourPillars,
    wuxingStrength: WuxingStrength
  ): string {
    // 从格判断
    if (dayMasterStrength < 20) {
      const maxElement = this.getStrongestElement(wuxingStrength);
      if (maxElement !== this.getDayMasterElement(fourPillars.day.gan)) {
        return `从${maxElement}格`;
      }
    }

    // 专旺格判断
    if (dayMasterStrength > 80) {
      return '专旺格';
    }

    // 正格判断
    if (dayMasterStrength >= 45 && dayMasterStrength <= 55) {
      return '中和格局';
    }
    if (dayMasterStrength > 55) {
      return '身强格局';
    }
    return '身弱格局';
  }

  /**
   * 判定用神类型
   */
  private determineYongshenType(
    dayMasterStrength: number,
    fourPillars: FourPillars,
    pattern: string
  ): YongshenType {
    // 从格用从格用神
    if (pattern.includes('从')) {
      return YongshenType.从格;
    }

    // 中和格局考虑调候
    if (pattern === '中和格局') {
      return YongshenType.调候;
    }

    // 其他情况用扶抑
    return YongshenType.扶抑;
  }

  /**
   * 选择扶抑用神
   */
  private selectFuyiYongshen(
    dayMasterStrength: number,
    fourPillars: FourPillars,
    wuxingStrength: WuxingStrength
  ): Partial<YongshenResult> {
    const dayMasterElement = this.getDayMasterElement(fourPillars.day.gan);
    let primary: Element[] = [];
    let secondary: Element[] = [];
    let avoid: Element[] = [];
    let explanation: string;

    if (dayMasterStrength < 40) {
      // 身弱，需要生扶
      const generator = this.getGeneratingElement(dayMasterElement);
      primary = [generator, dayMasterElement]; // 印星、比劫
      secondary = [];
      avoid = [
        YongshenAnalyzer.CONTROLLING_CYCLE[dayMasterElement], // 财星
        this.getControllingElement(dayMasterElement), // 官杀
      ];
      explanation = `日主${dayMasterElement}偏弱，以${generator}（印星）、${dayMasterElement}（比劫）为用神，增强日主力量`;
    } else if (dayMasterStrength > 60) {
      // 身强，需要克泄耗
      const controlled = YongshenAnalyzer.CONTROLLING_CYCLE[dayMasterElement];
      const generated = YongshenAnalyzer.GENERATING_CYCLE[dayMasterElement];
      const controller = this.getControllingElement(dayMasterElement);

      primary = [controller, generated]; // 官杀、食伤
      secondary = [controlled]; // 财星
      avoid = [
        this.getGeneratingElement(dayMasterElement), // 印星
        dayMasterElement, // 比劫
      ];
      explanation = `日主${dayMasterElement}偏强，以${controller}（官杀）、${generated}（食伤）为用神，消耗日主力量`;
    } else {
      // 中和，取调候或财官
      const controlled = YongshenAnalyzer.CONTROLLING_CYCLE[dayMasterElement];
      const controller = this.getControllingElement(dayMasterElement);

      primary = [controlled, controller]; // 财星、官星
      secondary = [];
      avoid = [];
      explanation = `日主${dayMasterElement}中和，以${controlled}（财星）、${controller}（官星）为用神，维持平衡`;
    }

    return {
      primary,
      secondary,
      avoid,
      explanation,
    };
  }

  /**
   * 选择调候用神
   */
  private selectTiaohouYongshen(
    birthDate: Date,
    fourPillars: FourPillars
  ): Partial<YongshenResult> {
    const month = birthDate.getMonth() + 1;
    const season = this.getSeasonByMonth(month);
    const dayMasterElement = this.getDayMasterElement(fourPillars.day.gan);

    let primary: Element[] = [];
    let secondary: Element[] = [];
    let explanation: string;

    // 根据季节和日主选择调候用神
    switch (season) {
      case 'summer': // 夏天需要水调候
        primary = ['water'];
        if (dayMasterElement === 'fire') {
          secondary = ['earth']; // 火日主夏天还需土泄
        }
        explanation = '生于夏季，炎热需水调候';
        break;

      case 'winter': // 冬天需要火调候
        primary = ['fire'];
        if (dayMasterElement === 'water') {
          secondary = ['wood']; // 水日主冬天还需木泄
        }
        explanation = '生于冬季，寒冷需火调候';
        break;

      case 'spring':
        if (dayMasterElement === 'wood') {
          primary = ['fire']; // 木旺需火泄
        } else {
          primary = ['wood'];
        }
        explanation = '生于春季，木旺之时';
        break;

      case 'autumn':
        if (dayMasterElement === 'metal') {
          primary = ['water']; // 金旺需水泄
        } else {
          primary = ['metal'];
        }
        explanation = '生于秋季，金旺之时';
        break;
    }

    return {
      primary,
      secondary,
      avoid: [],
      explanation,
    };
  }

  /**
   * 选择通关用神
   */
  private selectTongguanYongshen(
    wuxingStrength: WuxingStrength,
    fourPillars: FourPillars
  ): Partial<YongshenResult> {
    // 找出相克的两个最强五行
    const elements = Object.entries(wuxingStrength)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map((e) => e[0] as Element);

    const elem1 = elements[0];
    const elem2 = elements[1];

    // 判断是否相克
    if (
      YongshenAnalyzer.CONTROLLING_CYCLE[elem1] === elem2 ||
      YongshenAnalyzer.CONTROLLING_CYCLE[elem2] === elem1
    ) {
      // 找通关五行
      const mediator = this.findMediatorElement(elem1, elem2);

      return {
        primary: mediator ? [mediator] : [],
        secondary: [],
        avoid: [],
        explanation: `${elem1}与${elem2}相战，需${mediator}通关调和`,
      };
    }

    // 不需要通关，改用扶抑
    return this.selectFuyiYongshen(
      50, // 默认中和
      fourPillars,
      wuxingStrength
    );
  }

  /**
   * 选择病药用神
   */
  private selectBingyaoYongshen(
    fourPillars: FourPillars,
    wuxingStrength: WuxingStrength
  ): Partial<YongshenResult> {
    // 找出最弱的五行（病）
    const weakestElement = this.getWeakestElement(wuxingStrength);

    // 找出克制最弱五行的元素（病源）
    const diseaseSource = this.getControllingElement(weakestElement);

    // 药是克制病源的五行
    const medicine = this.getControllingElement(diseaseSource);

    return {
      primary: [medicine],
      secondary: [weakestElement], // 补充最弱的
      avoid: [diseaseSource],
      explanation: `${weakestElement}过弱为病，${diseaseSource}为病源，以${medicine}为药制之`,
    };
  }

  /**
   * 选择从格用神
   */
  private selectConggeYongshen(
    fourPillars: FourPillars,
    wuxingStrength: WuxingStrength
  ): Partial<YongshenResult> {
    const dayMasterElement = this.getDayMasterElement(fourPillars.day.gan);
    const strongestElement = this.getStrongestElement(wuxingStrength);

    if (strongestElement === dayMasterElement) {
      // 专旺格
      return {
        primary: [
          dayMasterElement,
          this.getGeneratingElement(dayMasterElement),
        ],
        secondary: [],
        avoid: [this.getControllingElement(dayMasterElement)],
        explanation: `专旺格，顺势而为，以${dayMasterElement}及生扶为用`,
      };
    }
    // 从格
    return {
      primary: [strongestElement],
      secondary: [YongshenAnalyzer.GENERATING_CYCLE[strongestElement]],
      avoid: [dayMasterElement],
      explanation: `从${strongestElement}格，顺从旺势，以${strongestElement}为用`,
    };
  }

  /**
   * 生成个性化建议
   */
  private generateRecommendations(
    primary: Element[],
    secondary: Element[],
    fourPillars: FourPillars
  ): YongshenResult['recommendations'] {
    const recommendations = {
      career: [] as string[],
      wealth: [] as string[],
      health: [] as string[],
      relationship: [] as string[],
    };

    // 根据用神五行生成建议
    for (const element of primary) {
      switch (element) {
        case 'wood':
          recommendations.career.push('适合从事教育、文化、园艺、中医等行业');
          recommendations.wealth.push('东方、绿色有利，春季财运较佳');
          recommendations.health.push('注意肝胆保养，多接触大自然');
          recommendations.relationship.push('宜找金水属性伴侣，互补共赢');
          break;
        case 'fire':
          recommendations.career.push('适合从事能源、照明、演艺、网络等行业');
          recommendations.wealth.push('南方、红色有利，夏季机遇较多');
          recommendations.health.push('注意心血管健康，避免过度兴奋');
          recommendations.relationship.push('宜找水土属性伴侣，性格互补');
          break;
        case 'earth':
          recommendations.career.push('适合从事地产、建筑、农业、咨询等行业');
          recommendations.wealth.push('中央、黄色有利，四季交替时机遇多');
          recommendations.health.push('注意脾胃保养，饮食规律');
          recommendations.relationship.push('宜找木火属性伴侣，相得益彰');
          break;
        case 'metal':
          recommendations.career.push('适合从事金融、机械、珠宝、法律等行业');
          recommendations.wealth.push('西方、白色有利，秋季收获较丰');
          recommendations.health.push('注意肺部呼吸系统，避免吸烟');
          recommendations.relationship.push('宜找火水属性伴侣，刚柔并济');
          break;
        case 'water':
          recommendations.career.push('适合从事物流、贸易、渔业、服务等行业');
          recommendations.wealth.push('北方、黑色有利，冬季蓄势待发');
          recommendations.health.push('注意肾脏泌尿系统，多喝水');
          recommendations.relationship.push('宜找木土属性伴侣，滋润成长');
          break;
      }
    }

    return recommendations;
  }

  // === 辅助方法 ===

  /**
   * 获取日主五行
   */
  private getDayMasterElement(dayStem: string): Element {
    const stemElements: { [key: string]: Element } = {
      甲: 'wood',
      乙: 'wood',
      丙: 'fire',
      丁: 'fire',
      戊: 'earth',
      己: 'earth',
      庚: 'metal',
      辛: 'metal',
      壬: 'water',
      癸: 'water',
    };
    return stemElements[dayStem] || 'wood';
  }

  /**
   * 获取生我的五行
   */
  private getGeneratingElement(element: Element): Element {
    for (const [key, value] of Object.entries(
      YongshenAnalyzer.GENERATING_CYCLE
    )) {
      if (value === element) {
        return key as Element;
      }
    }
    return element;
  }

  /**
   * 获取克我的五行
   */
  private getControllingElement(element: Element): Element {
    for (const [key, value] of Object.entries(
      YongshenAnalyzer.CONTROLLING_CYCLE
    )) {
      if (value === element) {
        return key as Element;
      }
    }
    return element;
  }

  /**
   * 获取最强的五行
   */
  private getStrongestElement(wuxingStrength: WuxingStrength): Element {
    return Object.entries(wuxingStrength).reduce((a, b) =>
      a[1] > b[1] ? a : b
    )[0] as Element;
  }

  /**
   * 获取最弱的五行
   */
  private getWeakestElement(wuxingStrength: WuxingStrength): Element {
    return Object.entries(wuxingStrength).reduce((a, b) =>
      a[1] < b[1] ? a : b
    )[0] as Element;
  }

  /**
   * 找通关五行
   */
  private findMediatorElement(elem1: Element, elem2: Element): Element | null {
    // 通关原理：能被其中一个生，同时能生另一个
    const elements: Element[] = ['wood', 'fire', 'earth', 'metal', 'water'];

    for (const mediator of elements) {
      const canMediate =
        (YongshenAnalyzer.GENERATING_CYCLE[elem1] === mediator &&
          YongshenAnalyzer.GENERATING_CYCLE[mediator] === elem2) ||
        (YongshenAnalyzer.GENERATING_CYCLE[elem2] === mediator &&
          YongshenAnalyzer.GENERATING_CYCLE[mediator] === elem1);

      if (canMediate) {
        return mediator;
      }
    }

    return null;
  }

  /**
   * 计算通根加分
   */
  private calculateRootingBonus(
    fourPillars: FourPillars,
    dayMasterElement: Element
  ): number {
    let bonus = 0;
    const branches = [
      fourPillars.year.zhi,
      fourPillars.month.zhi,
      fourPillars.day.zhi,
      fourPillars.hour.zhi,
    ];

    const branchElements: { [key: string]: Element } = {
      子: 'water',
      丑: 'earth',
      寅: 'wood',
      卯: 'wood',
      辰: 'earth',
      巳: 'fire',
      午: 'fire',
      未: 'earth',
      申: 'metal',
      酉: 'metal',
      戌: 'earth',
      亥: 'water',
    };

    for (const branch of branches) {
      if (branchElements[branch] === dayMasterElement) {
        bonus += 5; // 每个通根加5分
      }
    }

    return bonus;
  }

  /**
   * 根据月份获取季节
   */
  private getSeasonByMonth(month: number): Season {
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }
}

// 导出默认实例
export const yongshenAnalyzer = new YongshenAnalyzer();
