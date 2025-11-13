/**
 * 五行力量分析器
 * 精确量化五行力量评分系统
 */

import { type BaziConfig, getCurrentConfig } from '../../config';
import { type FourPillars, Pillar } from '../calculator/four-pillars';
import { hiddenStemsAnalyzer } from './hidden-stems';

export interface WuxingStrength {
  wood: number; // 木
  fire: number; // 火
  earth: number; // 土
  metal: number; // 金
  water: number; // 水

  // 详细分析
  details: {
    stems: Record<string, number>; // 天干贡献
    hiddenStems: Record<string, number>; // 地支藏干贡献
    monthlyEffect: Record<string, number>; // 月令影响
    rooting: Record<string, number>; // 通根加成
    revealing: Record<string, number>; // 透干加成
    interactions: Record<string, number>; // 生克制化影响
  };
}

export interface DayMasterStrength {
  strength: 'strong' | 'weak' | 'balanced';
  score: number; // 0-100
  factors: string[];
  element: string;
}

/**
 * 五行力量可变类型（计算过程中使用）
 */
interface WuxingStrengthMutable {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
  details: {
    stems: { 木: number; 火: number; 土: number; 金: number; 水: number };
    hiddenStems: { 木: number; 火: number; 土: number; 金: number; 水: number };
    monthlyEffect: {
      木: number;
      火: number;
      土: number;
      金: number;
      水: number;
    };
    rooting: { 木: number; 火: number; 土: number; 金: number; 水: number };
    revealing: { 木: number; 火: number; 土: number; 金: number; 水: number };
    interactions: {
      木: number;
      火: number;
      土: number;
      金: number;
      水: number;
    };
  };
}

/**
 * 五行力量分析器
 */
export class WuxingStrengthAnalyzer {
  // 配置实例
  private readonly config: BaziConfig;

  // 天干五行映射
  private readonly STEM_ELEMENTS: Record<string, string> = {
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

  // 地支五行映射（主导五行）
  private readonly BRANCH_ELEMENTS: Record<string, string> = {
    子: '水',
    亥: '水',
    寅: '木',
    卯: '木',
    巳: '火',
    午: '火',
    申: '金',
    酉: '金',
    辰: '土',
    戌: '土',
    丑: '土',
    未: '土',
  };

  // 五行生克关系
  private readonly GENERATING: Record<string, string> = {
    木: '火',
    火: '土',
    土: '金',
    金: '水',
    水: '木',
  };

  private readonly CONTROLLING: Record<string, string> = {
    木: '土',
    土: '水',
    水: '火',
    火: '金',
    金: '木',
  };

  /**
   * 构造函数
   * @param config 八字配置,如果未提供则使用默认配置
   */
  constructor(config?: BaziConfig) {
    this.config = config || getCurrentConfig();
  }

  /**
   * 计算五行综合力量
   */
  public calculateWuxingStrength(fourPillars: FourPillars): WuxingStrength {
    const strength = {
      wood: 0,
      fire: 0,
      earth: 0,
      metal: 0,
      water: 0,
      details: {
        stems: { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 },
        hiddenStems: { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 },
        monthlyEffect: { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 },
        rooting: { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 },
        revealing: { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 },
        interactions: { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 },
      },
    };

    // Step 1: 计算天干基础分值（每个天干10分）
    this.calculateStemStrength(fourPillars, strength);

    // Step 2: 计算地支藏干分值
    this.calculateHiddenStemStrength(fourPillars, strength);

    // Step 3: 应用月令系数
    this.applyMonthlyCoefficients(fourPillars, strength);

    // Step 4: 计算通根加成
    this.calculateRootingBonus(fourPillars, strength);

    // Step 5: 计算透干加成
    this.calculateRevealingBonus(fourPillars, strength);

    // Step 6: 计算生克制化影响
    this.calculateInteractions(fourPillars, strength);

    // Step 7: 归一化到100分制
    return this.normalizeStrength(strength);
  }

  /**
   * 计算天干力量
   */
  private calculateStemStrength(
    fourPillars: FourPillars,
    strength: WuxingStrengthMutable
  ): void {
    const stems = [
      fourPillars.year.gan,
      fourPillars.month.gan,
      fourPillars.day.gan,
      fourPillars.hour.gan,
    ];

    const stemBase = this.config.wuxingWeights.stemBase;

    for (const stem of stems) {
      const element = this.STEM_ELEMENTS[stem];
      if (element) {
        const elementKey = this.getElementKey(element);
        (strength as any)[elementKey] += stemBase;
        (strength.details.stems as any)[element] += stemBase;
      }
    }
  }

  /**
   * 计算地支藏干力量
   */
  private calculateHiddenStemStrength(
    fourPillars: FourPillars,
    strength: WuxingStrengthMutable
  ): void {
    const branches = [
      fourPillars.year.zhi,
      fourPillars.month.zhi,
      fourPillars.day.zhi,
      fourPillars.hour.zhi,
    ];

    const monthBranch = fourPillars.month.zhi;

    for (const branch of branches) {
      const hiddenStrength = hiddenStemsAnalyzer.calculateHiddenStemStrength(
        branch,
        monthBranch
      );

      for (const [element, value] of Object.entries(hiddenStrength)) {
        const elementKey = this.getElementKey(element);
        const score = value * 10; // 基础分倴10分
        (strength as any)[elementKey] += score;
        (strength.details.hiddenStems as any)[element] += score;
      }
    }
  }

  /**
   * 应用月令系数
   */
  private applyMonthlyCoefficients(
    fourPillars: FourPillars,
    strength: WuxingStrengthMutable
  ): void {
    const monthBranch = fourPillars.monthOrder || fourPillars.month.zhi;
    const season = this.getSeason(monthBranch);

    // 月令旺相休囚死系数
    const coefficients = this.getSeasonalCoefficients(season);

    for (const [element, coefficient] of Object.entries(coefficients)) {
      const elementKey = this.getElementKey(element);
      const adjustment =
        (strength as any)[elementKey] * coefficient - (strength as any)[elementKey];
      (strength as any)[elementKey] += adjustment;
      (strength.details.monthlyEffect as any)[element] = adjustment;
    }
  }

  /**
   * 计算通根加成
   * 改进：区分不同柱位的通根系数
   */
  private calculateRootingBonus(
    fourPillars: FourPillars,
    strength: WuxingStrengthMutable
  ): void {
    const stems = [
      { stem: fourPillars.year.gan, position: '年' as const },
      { stem: fourPillars.month.gan, position: '月' as const },
      { stem: fourPillars.day.gan, position: '日' as const },
      { stem: fourPillars.hour.gan, position: '时' as const },
    ];

    const branches = [
      fourPillars.year.zhi,
      fourPillars.month.zhi,
      fourPillars.day.zhi,
      fourPillars.hour.zhi,
    ];

    for (const { stem, position } of stems) {
      const rootingStrength = hiddenStemsAnalyzer.calculateRootingStrength(
        stem,
        branches,
        fourPillars.month.zhi
      );

      const element = this.STEM_ELEMENTS[stem];
      if (element && rootingStrength > 0) {
        const elementKey = this.getElementKey(element);

        // 根据柱位应用不同的通根系数
        const coefficientMap = {
          年: this.config.rootingCoefficients.year,
          月: this.config.rootingCoefficients.month,
          日: this.config.rootingCoefficients.day,
          时: this.config.rootingCoefficients.hour,
        };
        const coefficient = coefficientMap[position];
        const bonus = rootingStrength * coefficient;

        (strength as any)[elementKey] += bonus;
        (strength.details.rooting as any)[element] += bonus;
      }
    }
  }

  /**
   * 计算透干加成
   */
  private calculateRevealingBonus(
    fourPillars: FourPillars,
    strength: WuxingStrengthMutable
  ): void {
    const stems = [
      fourPillars.year.gan,
      fourPillars.month.gan,
      fourPillars.day.gan,
      fourPillars.hour.gan,
    ];

    const branches = [
      fourPillars.year.zhi,
      fourPillars.month.zhi,
      fourPillars.day.zhi,
      fourPillars.hour.zhi,
    ];

    // 检查每个地支的藏干是否透出
    for (const branch of branches) {
      const hiddenStems = hiddenStemsAnalyzer.getHiddenStems(branch);

      for (const hidden of hiddenStems) {
        if (stems.includes(hidden.stem)) {
          // 藏干透出，给予加成
          const element = hidden.element;
          const elementKey = this.getElementKey(element);
          const bonus =
            hidden.type === '本气' ? 8 : hidden.type === '中气' ? 5 : 3;

          (strength as any)[elementKey] += bonus;
          (strength.details.revealing as any)[element] += bonus;
        }
      }
    }
  }

  /**
   * 计算生克制化影响
   * 改进：调整生扶系数从20%到15%，使用类型安全访问
   */
  private calculateInteractions(
    fourPillars: FourPillars,
    strength: WuxingStrengthMutable
  ): void {
    const elements = ['木', '火', '土', '金', '水'] as const;

    // 计算生的影响（调整为15%）
    for (const element of elements) {
      const elementKey = this.getElementKey(element);
      const generator = this.getGeneratingElement(element);
      const generatorKey = this.getElementKey(generator);

      if ((strength as any)[generatorKey] > 0) {
        const bonus =
          (strength as any)[generatorKey] *
          this.config.interactionCoefficients.generation;
        (strength as any)[elementKey] += bonus;
        (strength.details.interactions as any)[element] += bonus;
      }
    }

    // 计算克的影响
    for (const element of elements) {
      const elementKey = this.getElementKey(element);
      const controller = this.getControllingElement(element);
      const controllerKey = this.getElementKey(controller);

      if ((strength as any)[controllerKey] > 0) {
        const penalty =
          (strength as any)[controllerKey] * this.config.interactionCoefficients.control;
        (strength as any)[elementKey] -= penalty;
        (strength.details.interactions as any)[element] -= penalty;
      }
    }
  }

  /**
   * 归一化力量到100分制
   */
  private normalizeStrength(strength: WuxingStrengthMutable): WuxingStrength {
    const total =
      strength.wood +
      strength.fire +
      strength.earth +
      strength.metal +
      strength.water;

    if (total === 0) {
      return strength;
    }

    // 根据配置决定是否归一化
    if (!this.config.options?.normalizeToHundred) {
      return strength;
    }

    // 归一化到100分
    const factor = 100 / total;
    const precision = this.config.options?.precision ?? 2;

    const multiplier = 10 ** precision;
    return {
      wood: Math.round(strength.wood * factor * multiplier) / multiplier,
      fire: Math.round(strength.fire * factor * multiplier) / multiplier,
      earth: Math.round(strength.earth * factor * multiplier) / multiplier,
      metal: Math.round(strength.metal * factor * multiplier) / multiplier,
      water: Math.round(strength.water * factor * multiplier) / multiplier,
      details: strength.details,
    };
  }

  /**
   * 计算日主强弱
   */
  public calculateDayMasterStrength(
    fourPillars: FourPillars,
    wuxingStrength: WuxingStrength
  ): DayMasterStrength {
    const dayMaster = fourPillars.dayMaster;
    const dayMasterElement = (this.STEM_ELEMENTS as any)[dayMaster];
    const elementKey = this.getElementKey(dayMasterElement);

    // 日主同类力量（比劫 + 印星）
    const supportingElements = this.getSupportingElements(dayMasterElement);
    let supportingStrength = (wuxingStrength as any)[elementKey];

    for (const element of supportingElements) {
      const key = this.getElementKey(element);
      supportingStrength += (wuxingStrength as any)[key];
    }

    // 总力量
    const totalStrength = 100;
    const ratio = supportingStrength / totalStrength;

    // 判定强弱
    let strength: 'strong' | 'weak' | 'balanced';
    if (ratio > 0.55) {
      strength = 'strong';
    } else if (ratio < 0.45) {
      strength = 'weak';
    } else {
      strength = 'balanced';
    }

    const factors: string[] = [];

    // 分析因素
    if (
      hiddenStemsAnalyzer.hasRoot(dayMaster, [
        fourPillars.year.zhi,
        fourPillars.month.zhi,
        fourPillars.day.zhi,
        fourPillars.hour.zhi,
      ])
    ) {
      factors.push('日主有根');
    }

    if ((wuxingStrength as any)[elementKey] > 20) {
      factors.push('比劫帮身');
    }

    const generator = this.getGeneratingElementFor(dayMasterElement);
    const generatorKey = this.getElementKey(generator);
    if ((wuxingStrength as any)[generatorKey] > 15) {
      factors.push('印星生助');
    }

    return {
      strength,
      score: Math.round(ratio * 100),
      factors,
      element: dayMasterElement,
    };
  }

  // 辅助方法

  private getElementKey(element: string): string {
    const mapping: Record<string, string> = {
      木: 'wood',
      火: 'fire',
      土: 'earth',
      金: 'metal',
      水: 'water',
    };
    return mapping[element] || 'earth';
  }

  private getSeason(monthBranch: string): string {
    const seasonMap: Record<string, string> = {
      寅: '春',
      卯: '春',
      辰: '春',
      巳: '夏',
      午: '夏',
      未: '夏',
      申: '秋',
      酉: '秋',
      戌: '秋',
      亥: '冬',
      子: '冬',
      丑: '冬',
    };
    return seasonMap[monthBranch] || '春';
  }

  private getSeasonalCoefficients(season: string): Record<string, number> {
    const seasonMap: Record<
      string,
      keyof typeof this.config.monthlyCoefficients
    > = {
      春: 'spring',
      夏: 'summer',
      秋: 'autumn',
      冬: 'winter',
    };

    const seasonKey = seasonMap[season] || 'spring';
    const seasonCoeff = this.config.monthlyCoefficients[seasonKey];

    return {
      木: seasonCoeff.wood,
      火: seasonCoeff.fire,
      土: seasonCoeff.earth,
      金: seasonCoeff.metal,
      水: seasonCoeff.water,
    };
  }

  private getSupportingElements(element: string): string[] {
    // 返回生我的元素
    for (const [key, value] of Object.entries(this.GENERATING)) {
      if (value === element) {
        return [key];
      }
    }
    return [];
  }

  private getGeneratingElement(element: string): string {
    // 返回生我的元素
    for (const [key, value] of Object.entries(this.GENERATING)) {
      if (value === element) {
        return key;
      }
    }
    return element;
  }

  private getGeneratingElementFor(element: string): string {
    // 返回生我的元素
    for (const [key, value] of Object.entries(this.GENERATING)) {
      if (value === element) {
        return key;
      }
    }
    return element;
  }

  private getControllingElement(element: string): string {
    // 返回克我的元素
    for (const [key, value] of Object.entries(this.CONTROLLING)) {
      if (value === element) {
        return key;
      }
    }
    return element;
  }
}

// 兼容导出
export const WuxingStrengthCalculator = WuxingStrengthAnalyzer;

// 导出单例
export const wuxingStrengthAnalyzer = new WuxingStrengthAnalyzer();
