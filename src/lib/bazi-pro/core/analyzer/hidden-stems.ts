/**
 * 地支藏干系统
 * 精确计算地支中的藏干及其力量
 */

export interface HiddenStem {
  stem: string; // 天干
  type: '本气' | '中气' | '余气';
  strength: number; // 力量系数 (0-1)
  element: string; // 五行
}

/**
 * 地支藏干分析器
 */
export class HiddenStemsAnalyzer {
  // 地支藏干表（本气、中气、余气）
  private readonly HIDDEN_STEMS_TABLE: Record<string, HiddenStem[]> = {
    子: [{ stem: '癸', type: '本气', strength: 1.0, element: '水' }],
    丑: [
      { stem: '己', type: '本气', strength: 0.6, element: '土' },
      { stem: '癸', type: '中气', strength: 0.3, element: '水' },
      { stem: '辛', type: '余气', strength: 0.1, element: '金' },
    ],
    寅: [
      { stem: '甲', type: '本气', strength: 0.6, element: '木' },
      { stem: '丙', type: '中气', strength: 0.3, element: '火' },
      { stem: '戊', type: '余气', strength: 0.1, element: '土' },
    ],
    卯: [{ stem: '乙', type: '本气', strength: 1.0, element: '木' }],
    辰: [
      { stem: '戊', type: '本气', strength: 0.6, element: '土' },
      { stem: '乙', type: '中气', strength: 0.3, element: '木' },
      { stem: '癸', type: '余气', strength: 0.1, element: '水' },
    ],
    巳: [
      { stem: '丙', type: '本气', strength: 0.6, element: '火' },
      { stem: '戊', type: '中气', strength: 0.3, element: '土' },
      { stem: '庚', type: '余气', strength: 0.1, element: '金' },
    ],
    午: [
      { stem: '丁', type: '本气', strength: 0.7, element: '火' },
      { stem: '己', type: '中气', strength: 0.3, element: '土' },
    ],
    未: [
      { stem: '己', type: '本气', strength: 0.6, element: '土' },
      { stem: '丁', type: '中气', strength: 0.3, element: '火' },
      { stem: '乙', type: '余气', strength: 0.1, element: '木' },
    ],
    申: [
      { stem: '庚', type: '本气', strength: 0.6, element: '金' },
      { stem: '壬', type: '中气', strength: 0.3, element: '水' },
      { stem: '戊', type: '余气', strength: 0.1, element: '土' },
    ],
    酉: [{ stem: '辛', type: '本气', strength: 1.0, element: '金' }],
    戌: [
      { stem: '戊', type: '本气', strength: 0.6, element: '土' },
      { stem: '辛', type: '中气', strength: 0.3, element: '金' },
      { stem: '丁', type: '余气', strength: 0.1, element: '火' },
    ],
    亥: [
      { stem: '壬', type: '本气', strength: 0.7, element: '水' },
      { stem: '甲', type: '中气', strength: 0.3, element: '木' },
    ],
  };

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

  /**
   * 获取地支的藏干
   */
  public getHiddenStems(branch: string): HiddenStem[] {
    return this.HIDDEN_STEMS_TABLE[branch] || [];
  }

  /**
   * 计算地支藏干的五行力量
   */
  public calculateHiddenStemStrength(
    branch: string,
    monthBranch: string
  ): Record<string, number> {
    const hiddenStems = this.getHiddenStems(branch);
    const strength: Record<string, number> = {
      木: 0,
      火: 0,
      土: 0,
      金: 0,
      水: 0,
    };

    // 获取月令系数
    const monthCoefficient = this.getMonthCoefficient(branch, monthBranch);

    for (const hidden of hiddenStems) {
      const element = hidden.element;
      const baseStrength = hidden.strength;
      const adjustedStrength = baseStrength * monthCoefficient;

      strength[element] += adjustedStrength;
    }

    return strength;
  }

  /**
   * 获取月令对地支藏干的影响系数
   */
  private getMonthCoefficient(branch: string, monthBranch: string): number {
    // 月令旺相休囚死理论
    const seasonalStrength = this.getSeasonalStrength(branch, monthBranch);

    // 基础系数
    let coefficient = 1.0;

    switch (seasonalStrength) {
      case '旺':
        coefficient = 1.5; // 当令最强
        break;
      case '相':
        coefficient = 1.2; // 次旺
        break;
      case '休':
        coefficient = 1.0; // 正常
        break;
      case '囚':
        coefficient = 0.7; // 较弱
        break;
      case '死':
        coefficient = 0.5; // 最弱
        break;
    }

    return coefficient;
  }

  /**
   * 判断地支在月令中的旺相休囚死状态
   */
  private getSeasonalStrength(
    branch: string,
    monthBranch: string
  ): '旺' | '相' | '休' | '囚' | '死' {
    // 根据月令判断季节
    const season = this.getSeason(monthBranch);
    const branchElement = this.getBranchElement(branch);

    // 春季（寅卯辰）：木旺、火相、水休、金囚、土死
    // 夏季（巳午未）：火旺、土相、木休、水囚、金死
    // 秋季（申酉戌）：金旺、水相、土休、火囚、木死
    // 冬季（亥子丑）：水旺、木相、金休、土囚、火死

    const seasonalMap: Record<string, Record<string, string>> = {
      春: { 木: '旺', 火: '相', 水: '休', 金: '囚', 土: '死' },
      夏: { 火: '旺', 土: '相', 木: '休', 水: '囚', 金: '死' },
      秋: { 金: '旺', 水: '相', 土: '休', 火: '囚', 木: '死' },
      冬: { 水: '旺', 木: '相', 金: '休', 土: '囚', 火: '死' },
    };

    return (seasonalMap[season][branchElement] || '休') as any;
  }

  /**
   * 获取月令所属季节
   */
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

  /**
   * 获取地支主导五行
   */
  private getBranchElement(branch: string): string {
    const elementMap: Record<string, string> = {
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

    return elementMap[branch] || '土';
  }

  /**
   * 判断天干是否在地支中有根
   */
  public hasRoot(stem: string, branches: string[]): boolean {
    const stemElement = this.STEM_ELEMENTS[stem];

    for (const branch of branches) {
      const hiddenStems = this.getHiddenStems(branch);
      for (const hidden of hiddenStems) {
        if (hidden.element === stemElement && hidden.strength >= 0.3) {
          return true; // 有根（本气或较强的中气）
        }
      }
    }

    return false;
  }

  /**
   * 计算通根力量
   */
  public calculateRootingStrength(
    stem: string,
    branches: string[],
    monthBranch: string
  ): number {
    const stemElement = this.STEM_ELEMENTS[stem];
    let totalStrength = 0;

    for (const branch of branches) {
      const hiddenStems = this.getHiddenStems(branch);
      const monthCoefficient = this.getMonthCoefficient(branch, monthBranch);

      for (const hidden of hiddenStems) {
        if (hidden.element === stemElement) {
          // 通根加成计算
          const rootStrength = hidden.strength * monthCoefficient;

          // 根据藏干类型给予不同权重
          const typeWeight =
            hidden.type === '本气' ? 1.0 : hidden.type === '中气' ? 0.6 : 0.3; // 余气

          totalStrength += rootStrength * typeWeight * 10; // 基础分值10分
        }
      }
    }

    return totalStrength;
  }

  /**
   * 获取地支藏干详细信息
   */
  public getDetailedHiddenStems(branch: string): {
    branch: string;
    hiddenStems: HiddenStem[];
    totalStrength: number;
    dominantElement: string;
  } {
    const hiddenStems = this.getHiddenStems(branch);
    const totalStrength = hiddenStems.reduce(
      (sum, stem) => sum + stem.strength,
      0
    );

    // 找出主导五行（本气）
    const dominantStem = hiddenStems.find((s) => s.type === '本气');

    return {
      branch,
      hiddenStems,
      totalStrength,
      dominantElement: dominantStem?.element || '未知',
    };
  }
}

// 导出单例
export const hiddenStemsAnalyzer = new HiddenStemsAnalyzer();
