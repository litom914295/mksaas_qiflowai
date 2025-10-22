/**
 * 月令旺相休囚死系统
 * 根据月令判断五行强弱状态
 */

import type { Element } from '../types';

/**
 * 五行状态枚举
 */
export enum WuxingState {
  旺 = 'wang', // 当令，最强
  相 = 'xiang', // 生我，次强
  休 = 'xiu', // 我生，平常
  囚 = 'qiu', // 克我，较弱
  死 = 'si', // 我克，最弱
}

/**
 * 月令五行状态
 */
export interface MonthlyState {
  month: string; // 月支
  monthElement: Element; // 月支五行
  states: {
    wood: WuxingState;
    fire: WuxingState;
    earth: WuxingState;
    metal: WuxingState;
    water: WuxingState;
  };
  coefficients: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
}

/**
 * 月令旺相休囚死分析器
 */
export class MonthlyStateAnalyzer {
  // 地支与五行对应关系
  private static readonly BRANCH_ELEMENTS: { [key: string]: Element } = {
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

  // 旺相休囚死系数
  private static readonly STATE_COEFFICIENTS = {
    [WuxingState.旺]: 1.5, // 当令最强
    [WuxingState.相]: 1.2, // 被生次强
    [WuxingState.休]: 1.0, // 正常状态
    [WuxingState.囚]: 0.7, // 被克较弱
    [WuxingState.死]: 0.5, // 去克最弱
  };

  // 四季月令分组
  private static readonly SEASONAL_MONTHS = {
    spring: ['寅', '卯'], // 春季 - 木旺
    summer: ['巳', '午'], // 夏季 - 火旺
    autumn: ['申', '酉'], // 秋季 - 金旺
    winter: ['亥', '子'], // 冬季 - 水旺
    transition: ['辰', '未', '戌', '丑'], // 四季土月
  };

  /**
   * 分析月令旺相休囚死
   * @param monthBranch 月支
   * @returns 月令五行状态
   */
  public analyzeMonthlyState(monthBranch: string): MonthlyState {
    if (!monthBranch || typeof monthBranch !== 'string') {
      console.error('[MonthlyStateAnalyzer] 错误: 月支参数无效', {
        monthBranch,
        type: typeof monthBranch,
        validBranches: Object.keys(MonthlyStateAnalyzer.BRANCH_ELEMENTS),
      });
      throw new Error(
        `Invalid month branch: ${monthBranch} (type: ${typeof monthBranch}). ` +
        `Expected one of: ${Object.keys(MonthlyStateAnalyzer.BRANCH_ELEMENTS).join(', ')}`
      );
    }

    const monthElement = MonthlyStateAnalyzer.BRANCH_ELEMENTS[monthBranch];

    if (!monthElement) {
      console.error('[MonthlyStateAnalyzer] 错误: 无法识别的月支', {
        monthBranch,
        validBranches: Object.keys(MonthlyStateAnalyzer.BRANCH_ELEMENTS),
      });
      throw new Error(
        `Invalid month branch: ${monthBranch}. ` +
        `Expected one of: ${Object.keys(MonthlyStateAnalyzer.BRANCH_ELEMENTS).join(', ')}`
      );
    }

    // 获取各五行在该月令的状态
    const states = this.calculateStates(monthElement);

    // 计算对应的力量系数
    const coefficients = this.calculateCoefficients(states);

    return {
      month: monthBranch,
      monthElement,
      states,
      coefficients,
    };
  }

  /**
   * 计算各五行在特定月令的状态
   */
  private calculateStates(monthElement: Element): MonthlyState['states'] {
    const states = {} as MonthlyState['states'];
    const elements: Element[] = ['wood', 'fire', 'earth', 'metal', 'water'];

    for (const element of elements) {
      (states as any)[element] = this.getElementState(element, monthElement);
    }

    return states;
  }

  /**
   * 获取单个五行在月令中的状态
   */
  private getElementState(
    element: Element,
    monthElement: Element
  ): WuxingState {
    // 当令者旺
    if (element === monthElement) {
      return WuxingState.旺;
    }

    // 生我者相
    const generator = this.getGeneratingElement(element);
    if (generator === monthElement) {
      return WuxingState.相;
    }

    // 我生者休
    const generated = MonthlyStateAnalyzer.GENERATING_CYCLE[element];
    if (generated === monthElement) {
      return WuxingState.休;
    }

    // 克我者囚
    const controller = this.getControllingElement(element);
    if (controller === monthElement) {
      return WuxingState.囚;
    }

    // 我克者死
    const controlled = MonthlyStateAnalyzer.CONTROLLING_CYCLE[element];
    if (controlled === monthElement) {
      return WuxingState.死;
    }

    // 默认为休（理论上不应该到这里）
    return WuxingState.休;
  }

  /**
   * 获取生我的五行
   */
  private getGeneratingElement(element: Element): Element {
    for (const [key, value] of Object.entries(
      MonthlyStateAnalyzer.GENERATING_CYCLE
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
      MonthlyStateAnalyzer.CONTROLLING_CYCLE
    )) {
      if (value === element) {
        return key as Element;
      }
    }
    return element;
  }

  /**
   * 计算力量系数
   */
  private calculateCoefficients(
    states: MonthlyState['states']
  ): MonthlyState['coefficients'] {
    const coefficients = {} as MonthlyState['coefficients'];
    const elements: Element[] = ['wood', 'fire', 'earth', 'metal', 'water'];

    for (const element of elements) {
      const state = (states as any)[element];
      (coefficients as any)[element] = (
        MonthlyStateAnalyzer.STATE_COEFFICIENTS as any
      )[state];
    }

    return coefficients;
  }

  /**
   * 获取月令描述
   */
  public getMonthDescription(monthBranch: string): string {
    const descriptions: { [key: string]: string } = {
      寅: '正月建寅，木气始生，万物萌动',
      卯: '二月建卯，木气正旺，生机勃发',
      辰: '三月建辰，土旺用事，木气渐退',
      巳: '四月建巳，火气初生，阳气渐盛',
      午: '五月建午，火气正旺，阳极阴生',
      未: '六月建未，土旺用事，火气渐退',
      申: '七月建申，金气始生，秋风乍起',
      酉: '八月建酉，金气正旺，肃杀之气',
      戌: '九月建戌，土旺用事，金气渐退',
      亥: '十月建亥，水气始生，阴气渐盛',
      子: '十一月建子，水气正旺，阴极阳生',
      丑: '十二月建丑，土旺用事，水气渐退',
    };

    return descriptions[monthBranch] || '';
  }

  /**
   * 判断是否为四季土月
   */
  public isTransitionMonth(monthBranch: string): boolean {
    return MonthlyStateAnalyzer.SEASONAL_MONTHS.transition.includes(
      monthBranch
    );
  }

  /**
   * 获取月令所属季节
   */
  public getSeason(monthBranch: string): string {
    for (const [season, months] of Object.entries(
      MonthlyStateAnalyzer.SEASONAL_MONTHS
    )) {
      if (months.includes(monthBranch)) {
        return season;
      }
    }
    return 'unknown';
  }

  /**
   * 计算五行在特定月令的综合力量
   * @param element 五行
   * @param monthBranch 月支
   * @param baseStrength 基础力量
   * @returns 调整后的力量值
   */
  public calculateAdjustedStrength(
    element: Element,
    monthBranch: string,
    baseStrength: number
  ): number {
    const monthlyState = this.analyzeMonthlyState(monthBranch);
    const coefficient = (monthlyState.coefficients as any)[element];

    // 应用月令系数
    let adjustedStrength = baseStrength * coefficient;

    // 四季土月特殊处理
    if (this.isTransitionMonth(monthBranch)) {
      // 土在四季月额外加强
      if (element === 'earth') {
        adjustedStrength *= 1.1;
      }
      // 其他五行在四季月略微减弱
      else {
        adjustedStrength *= 0.95;
      }
    }

    return adjustedStrength;
  }

  /**
   * 获取月令旺相休囚死表
   */
  public getStateTable(): { [key: string]: MonthlyState } {
    const table: { [key: string]: MonthlyState } = {};
    const branches = [
      '子',
      '丑',
      '寅',
      '卯',
      '辰',
      '巳',
      '午',
      '未',
      '申',
      '酉',
      '戌',
      '亥',
    ];

    for (const branch of branches) {
      table[branch] = this.analyzeMonthlyState(branch);
    }

    return table;
  }

  /**
   * 根据月令判断日主强弱倾向
   * @param dayMasterElement 日主五行
   * @param monthBranch 月支
   * @returns 强弱倾向描述
   */
  public getDayMasterTendency(
    dayMasterElement: Element,
    monthBranch: string
  ): {
    tendency: 'strong' | 'weak' | 'neutral';
    description: string;
    coefficient: number;
  } {
    const monthlyState = this.analyzeMonthlyState(monthBranch);
    const state = (monthlyState.states as any)[dayMasterElement];
    const coefficient = (monthlyState.coefficients as any)[dayMasterElement];

    let tendency: 'strong' | 'weak' | 'neutral';
    let description: string;

    switch (state) {
      case WuxingState.旺:
        tendency = 'strong';
        description = `日主${dayMasterElement}当令而旺，得月令之力`;
        break;
      case WuxingState.相:
        tendency = 'strong';
        description = `日主${dayMasterElement}得月令生扶，处于相地`;
        break;
      case WuxingState.休:
        tendency = 'neutral';
        description = `日主${dayMasterElement}泄月令之气，处于休地`;
        break;
      case WuxingState.囚:
        tendency = 'weak';
        description = `日主${dayMasterElement}受月令克制，处于囚地`;
        break;
      case WuxingState.死:
        tendency = 'weak';
        description = `日主${dayMasterElement}克月令之气，处于死地`;
        break;
      default:
        tendency = 'neutral';
        description = `日主${dayMasterElement}与月令关系中和`;
    }

    return {
      tendency,
      description,
      coefficient,
    };
  }
}

// 导出默认实例
export const monthlyStateAnalyzer = new MonthlyStateAnalyzer();
