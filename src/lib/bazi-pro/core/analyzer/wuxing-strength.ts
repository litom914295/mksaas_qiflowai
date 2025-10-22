/**
 * 五行力量分析器
 * 精确量化五行力量评分系统
 */

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
 * 五行力量分析器
 */
export class WuxingStrengthAnalyzer {
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
  private calculateStemStrength(fourPillars: FourPillars, strength: any): void {
    const stems = [
      fourPillars.year.gan,
      fourPillars.month.gan,
      fourPillars.day.gan,
      fourPillars.hour.gan,
    ];

    for (const stem of stems) {
      const element = this.STEM_ELEMENTS[stem];
      if (element) {
        const elementKey = this.getElementKey(element);
        strength[elementKey] += 10;
        strength.details.stems[element] += 10;
      }
    }
  }

  /**
   * 计算地支藏干力量
   */
  private calculateHiddenStemStrength(
    fourPillars: FourPillars,
    strength: any
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
        const score = value * 10; // 基础分值10分
        strength[elementKey] += score;
        strength.details.hiddenStems[element] += score;
      }
    }
  }

  /**
   * 应用月令系数
   */
  private applyMonthlyCoefficients(
    fourPillars: FourPillars,
    strength: any
  ): void {
    const monthBranch = fourPillars.monthOrder || fourPillars.month.zhi;
    const season = this.getSeason(monthBranch);

    // 月令旺相休囚死系数
    const coefficients = this.getSeasonalCoefficients(season);

    for (const [element, coefficient] of Object.entries(coefficients)) {
      const elementKey = this.getElementKey(element);
      const adjustment =
        strength[elementKey] * coefficient - strength[elementKey];
      strength[elementKey] += adjustment;
      strength.details.monthlyEffect[element] = adjustment;
    }
  }

  /**
   * 计算通根加成
   */
  private calculateRootingBonus(fourPillars: FourPillars, strength: any): void {
    const stems = [
      { stem: fourPillars.year.gan, position: '年' },
      { stem: fourPillars.month.gan, position: '月' },
      { stem: fourPillars.day.gan, position: '日' },
      { stem: fourPillars.hour.gan, position: '时' },
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

        // 日主通根加成更多
        const bonus =
          position === '日' ? rootingStrength * 1.5 : rootingStrength;

        strength[elementKey] += bonus;
        strength.details.rooting[element] += bonus;
      }
    }
  }

  /**
   * 计算透干加成
   */
  private calculateRevealingBonus(
    fourPillars: FourPillars,
    strength: any
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

          strength[elementKey] += bonus;
          strength.details.revealing[element] += bonus;
        }
      }
    }
  }

  /**
   * 计算生克制化影响
   */
  private calculateInteractions(fourPillars: FourPillars, strength: any): void {
    const elements = ['木', '火', '土', '金', '水'];

    // 计算生的影响
    for (const element of elements) {
      const elementKey = this.getElementKey(element);
      const generator = this.getGeneratingElement(element);
      const generatorKey = this.getElementKey(generator);

      if ((strength as any)[generatorKey] > 0) {
        const bonus = (strength as any)[generatorKey] * 0.2; // 被生加20%
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
        const penalty = (strength as any)[controllerKey] * 0.15; // 被克减15%
        (strength as any)[elementKey] -= penalty;
        (strength.details.interactions as any)[element] -= penalty;
      }
    }
  }

  /**
   * 归一化力量到100分制
   */
  private normalizeStrength(strength: any): WuxingStrength {
    const total =
      strength.wood +
      strength.fire +
      strength.earth +
      strength.metal +
      strength.water;

    if (total === 0) {
      return strength;
    }

    // 归一化到100分
    const factor = 100 / total;

    return {
      wood: Math.round(strength.wood * factor),
      fire: Math.round(strength.fire * factor),
      earth: Math.round(strength.earth * factor),
      metal: Math.round(strength.metal * factor),
      water: Math.round(strength.water * factor),
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
    const coefficients: Record<string, Record<string, number>> = {
      春: { 木: 1.5, 火: 1.2, 水: 1.0, 金: 0.7, 土: 0.5 },
      夏: { 火: 1.5, 土: 1.2, 木: 1.0, 水: 0.7, 金: 0.5 },
      秋: { 金: 1.5, 水: 1.2, 土: 1.0, 火: 0.7, 木: 0.5 },
      冬: { 水: 1.5, 木: 1.2, 金: 1.0, 土: 0.7, 火: 0.5 },
    };
    return coefficients[season] || coefficients.春;
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
