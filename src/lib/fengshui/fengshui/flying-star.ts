/**
 * QiFlow AI - 玄空飞星风水模块
 * 
 * 实现九宫飞星的计算和分析
 * 包括年飞星、月飞星、日飞星、时飞星
 */

export type StarNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type Direction = '北' | '东北' | '东' | '东南' | '南' | '西南' | '西' | '西北' | '中';
export type Period = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

// 九宫格位置映射
export const PALACE_POSITIONS: Record<Direction, number> = {
  '北': 1,
  '西南': 2,
  '东': 3,
  '东南': 4,
  '中': 5,
  '西北': 6,
  '西': 7,
  '东北': 8,
  '南': 9
};

// 洛书九宫原始位置
export const LUO_SHU_GRID: Record<number, StarNumber> = {
  1: 1, // 北 - 一白水星
  2: 2, // 西南 - 二黑土星
  3: 3, // 东 - 三碧木星
  4: 4, // 东南 - 四绿木星
  5: 5, // 中 - 五黄土星
  6: 6, // 西北 - 六白金星
  7: 7, // 西 - 七赤金星
  8: 8, // 东北 - 八白土星
  9: 9  // 南 - 九紫火星
};

// 飞星五行属性
export const STAR_ELEMENTS: Record<StarNumber, string> = {
  1: '水',
  2: '土',
  3: '木',
  4: '木',
  5: '土',
  6: '金',
  7: '金',
  8: '土',
  9: '火'
};

// 飞星吉凶属性
export const STAR_NATURE: Record<StarNumber, {
  name: string;
  nature: 'auspicious' | 'inauspicious' | 'neutral';
  description: string;
}> = {
  1: {
    name: '一白贪狼星',
    nature: 'auspicious',
    description: '主文昌、名声、人缘、桃花'
  },
  2: {
    name: '二黑巨门星',
    nature: 'inauspicious',
    description: '主疾病、是非、小人'
  },
  3: {
    name: '三碧禄存星',
    nature: 'inauspicious',
    description: '主官非、是非、争斗'
  },
  4: {
    name: '四绿文曲星',
    nature: 'auspicious',
    description: '主文昌、学业、智慧'
  },
  5: {
    name: '五黄廉贞星',
    nature: 'inauspicious',
    description: '主凶灾、意外、疾病'
  },
  6: {
    name: '六白武曲星',
    nature: 'auspicious',
    description: '主武职、权力、驿马'
  },
  7: {
    name: '七赤破军星',
    nature: 'neutral',
    description: '主偏财、口舌、竞争'
  },
  8: {
    name: '八白左辅星',
    nature: 'auspicious',
    description: '主财富、地产、贵人'
  },
  9: {
    name: '九紫右弼星',
    nature: 'auspicious',
    description: '主喜庆、姻缘、名气'
  }
};

export interface FlyingStarGrid {
  period: Period;
  year: number;
  month?: number;
  day?: number;
  hour?: number;
  grid: Record<Direction, StarNumber>;
  centerStar: StarNumber;
  analysis: {
    auspiciousDirections: Direction[];
    inauspiciousDirections: Direction[];
    recommendations: string[];
  };
}

/**
 * 玄空飞星计算器
 */
export class FlyingStarCalculator {
  private currentPeriod: Period = 9; // 2024-2043年为九运

  /**
   * 获取当前元运
   */
  getCurrentPeriod(year: number): Period {
    // 三元九运计算（每运20年）
    // 上元：一运(1864-1883)、二运(1884-1903)、三运(1904-1923)
    // 中元：四运(1924-1943)、五运(1944-1963)、六运(1964-1983)
    // 下元：七运(1984-2003)、八运(2004-2023)、九运(2024-2043)
    
    if (year >= 2024 && year <= 2043) return 9;
    if (year >= 2004 && year <= 2023) return 8;
    if (year >= 1984 && year <= 2003) return 7;
    if (year >= 1964 && year <= 1983) return 6;
    if (year >= 1944 && year <= 1963) return 5;
    if (year >= 1924 && year <= 1943) return 4;
    if (year >= 1904 && year <= 1923) return 3;
    if (year >= 1884 && year <= 1903) return 2;
    if (year >= 1864 && year <= 1883) return 1;
    
    // 推算其他年份
    const baseYear = 1864;
    const diff = year - baseYear;
    const periodIndex = Math.floor(diff / 20) % 9;
    return (periodIndex + 1) as Period;
  }

  /**
   * 计算年飞星
   */
  calculateYearStar(year: number): FlyingStarGrid {
    const period = this.getCurrentPeriod(year);
    
    // 计算年紫白（入中宫的星）
    // 公式：(2024 - year + 9) % 9，若为0则为9
    const yearOffset = (2024 - year + 9) % 9;
    const centerStar = (yearOffset === 0 ? 9 : yearOffset) as StarNumber;
    
    const grid = this.generateFlyingGrid(centerStar);
    const analysis = this.analyzeFlyingStars(grid);
    
    return {
      period,
      year,
      grid,
      centerStar,
      analysis
    };
  }

  /**
   * 计算月飞星
   */
  calculateMonthStar(year: number, month: number): FlyingStarGrid {
    const period = this.getCurrentPeriod(year);
    
    // 月紫白计算（农历）
    // 简化算法：根据年份和月份推算
    const monthStarMap: Record<number, StarNumber[]> = {
      1: [8, 5, 2], // 子年、卯年、午年、酉年
      2: [5, 2, 8], // 丑年、辰年、未年、戌年
      3: [2, 8, 5]  // 寅年、巳年、申年、亥年
    };
    
    const yearBranch = (year - 4) % 12;
    const mapIndex = yearBranch % 3;
    const monthStars = monthStarMap[mapIndex + 1] || [5, 2, 8];
    
    // 根据月份确定入中宫的星
    const centerStar = monthStars[month % 3] as StarNumber;
    
    const grid = this.generateFlyingGrid(centerStar);
    const analysis = this.analyzeFlyingStars(grid);
    
    return {
      period,
      year,
      month,
      grid,
      centerStar,
      analysis
    };
  }

  /**
   * 计算日飞星
   */
  calculateDailyStar(date: Date): FlyingStarGrid {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const period = this.getCurrentPeriod(year);
    
    // 日飞星计算（简化版）
    // 使用日期序数对9取余
    const dayNumber = this.getDayNumber(date);
    const centerStar = ((dayNumber % 9) || 9) as StarNumber;
    
    const grid = this.generateFlyingGrid(centerStar);
    const analysis = this.analyzeFlyingStars(grid);
    
    return {
      period,
      year,
      month,
      day,
      grid,
      centerStar,
      analysis
    };
  }

  /**
   * 计算时飞星
   */
  calculateHourStar(date: Date, hour: number): FlyingStarGrid {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const period = this.getCurrentPeriod(year);
    
    // 时飞星计算
    // 根据时辰（2小时一个时辰）确定入中宫的星
    const hourIndex = Math.floor((hour + 1) / 2) % 12;
    const hourStars: StarNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3];
    const centerStar = hourStars[hourIndex];
    
    const grid = this.generateFlyingGrid(centerStar);
    const analysis = this.analyzeFlyingStars(grid);
    
    return {
      period,
      year,
      month,
      day,
      hour,
      grid,
      centerStar,
      analysis
    };
  }

  /**
   * 生成飞星盘
   */
  private generateFlyingGrid(centerStar: StarNumber): Record<Direction, StarNumber> {
    const grid: Record<Direction, StarNumber> = {} as any;
    
    // 顺飞路径（洛书飞星路径）
    const flyingPath = [5, 6, 7, 8, 9, 1, 2, 3, 4]; // 中宫开始的飞行路径
    const directions: Direction[] = ['中', '西北', '西', '东北', '南', '北', '西南', '东', '东南'];
    
    // 计算每个宫位的飞星
    for (let i = 0; i < 9; i++) {
      const position = flyingPath[i];
      const starOffset = (centerStar - 5 + 9) % 9; // 计算偏移量
      const star = ((i + starOffset) % 9 + 1) as StarNumber;
      grid[directions[i]] = star;
    }
    
    return grid;
  }

  /**
   * 分析飞星吉凶
   */
  private analyzeFlyingStars(grid: Record<Direction, StarNumber>): {
    auspiciousDirections: Direction[];
    inauspiciousDirections: Direction[];
    recommendations: string[];
  } {
    const auspiciousDirections: Direction[] = [];
    const inauspiciousDirections: Direction[] = [];
    const recommendations: string[] = [];
    
    for (const [direction, star] of Object.entries(grid)) {
      const starInfo = STAR_NATURE[star as StarNumber];
      
      if (starInfo.nature === 'auspicious') {
        auspiciousDirections.push(direction as Direction);
      } else if (starInfo.nature === 'inauspicious') {
        inauspiciousDirections.push(direction as Direction);
      }
    }
    
    // 生成建议
    if (grid['南'] === 9) {
      recommendations.push('南方九紫星当旺，利于名声和喜庆之事');
    }
    if (grid['西北'] === 6) {
      recommendations.push('西北六白星得位，利于权力和事业发展');
    }
    if (grid['东北'] === 8) {
      recommendations.push('东北八白星旺财，可在此方位布置财位');
    }
    if (grid['中'] === 5) {
      recommendations.push('五黄入中宫，宜静不宜动，避免大规模装修');
    }
    if (grid['西南'] === 2) {
      recommendations.push('西南二黑病符星，注意健康，可放置金属物品化解');
    }
    if (grid['东'] === 3) {
      recommendations.push('东方三碧是非星，避免在此方位处理重要事务');
    }
    
    // 特殊组合分析
    if (grid['北'] === 1 && grid['南'] === 9) {
      recommendations.push('水火既济格局，阴阳调和，大吉');
    }
    if (grid['东'] === 3 && grid['东南'] === 4) {
      recommendations.push('木木比和，利于学业和文昌');
    }
    
    return {
      auspiciousDirections,
      inauspiciousDirections,
      recommendations
    };
  }

  /**
   * 获取日期序数
   */
  private getDayNumber(date: Date): number {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const diff = date.getTime() - startOfYear.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  }

  /**
   * 飞星组合分析
   */
  analyzeStarCombination(mountainStar: StarNumber, waterStar: StarNumber): {
    combination: string;
    nature: 'excellent' | 'good' | 'neutral' | 'bad' | 'terrible';
    description: string;
    effects: string[];
  } {
    const combo = `${mountainStar}${waterStar}`;
    
    // 定义常见的飞星组合
    const combinations: Record<string, any> = {
      '11': { nature: 'good', description: '双水润泽', effects: ['利文昌', '旺人缘'] },
      '14': { nature: 'excellent', description: '文昌大利', effects: ['利考试', '旺学业'] },
      '16': { nature: 'excellent', description: '金水相生', effects: ['利智慧', '旺财运'] },
      '18': { nature: 'good', description: '土水相济', effects: ['利财运', '稳定'] },
      '19': { nature: 'good', description: '水火既济', effects: ['阴阳调和', '吉祥'] },
      '22': { nature: 'terrible', description: '双土病符', effects: ['主疾病', '凶'] },
      '23': { nature: 'bad', description: '斗牛煞', effects: ['是非争斗', '官司'] },
      '25': { nature: 'terrible', description: '戊己大煞', effects: ['大凶', '灾祸'] },
      '27': { nature: 'bad', description: '火烧天门', effects: ['火灾', '意外'] },
      '33': { nature: 'bad', description: '双木成林', effects: ['是非重重', '争吵'] },
      '44': { nature: 'good', description: '双文昌', effects: ['利学业', '文才'] },
      '55': { nature: 'terrible', description: '五黄大煞', effects: ['极凶', '大灾'] },
      '66': { nature: 'excellent', description: '双金贵人', effects: ['权力', '地位'] },
      '67': { nature: 'neutral', description: '交剑煞', effects: ['竞争', '斗争'] },
      '68': { nature: 'excellent', description: '金土相生', effects: ['大旺财', '稳定'] },
      '77': { nature: 'neutral', description: '双七赤', effects: ['偏财', '口舌'] },
      '88': { nature: 'excellent', description: '双八白', effects: ['大富贵', '地产'] },
      '99': { nature: 'excellent', description: '双九紫', effects: ['大喜庆', '名气'] }
    };
    
    const result = combinations[combo] || {
      nature: 'neutral',
      description: '普通组合',
      effects: ['需结合实际环境分析']
    };
    
    return {
      combination: combo,
      ...result
    };
  }

  /**
   * 计算流年飞星与宅运飞星的组合
   */
  calculateCombinedStars(
    baseStar: StarNumber,
    annualStar: StarNumber
  ): {
    combined: string;
    interaction: 'generate' | 'control' | 'same' | 'neutral';
    effects: string[];
    remedies?: string[];
  } {
    const baseElement = STAR_ELEMENTS[baseStar];
    const annualElement = STAR_ELEMENTS[annualStar];
    
    // 五行关系判断
    let interaction: 'generate' | 'control' | 'same' | 'neutral' = 'neutral';
    const effects: string[] = [];
    const remedies: string[] = [];
    
    // 相生关系
    const generatingPairs = {
      '木火': true, '火土': true, '土金': true, '金水': true, '水木': true
    };
    
    // 相克关系
    const controllingPairs = {
      '木土': true, '土水': true, '水火': true, '火金': true, '金木': true
    };
    
    const pair = baseElement + annualElement;
    const reversePair = annualElement + baseElement;
    
    if (baseElement === annualElement) {
      interaction = 'same';
      effects.push(`${baseElement}气加强`);
    } else if (generatingPairs[pair as keyof typeof generatingPairs]) {
      interaction = 'generate';
      effects.push(`${baseElement}生${annualElement}，相生有情`);
    } else if (generatingPairs[reversePair as keyof typeof generatingPairs]) {
      interaction = 'generate';
      effects.push(`${annualElement}生${baseElement}，得生助力`);
    } else if (controllingPairs[pair as keyof typeof controllingPairs]) {
      interaction = 'control';
      effects.push(`${baseElement}克${annualElement}，需要化解`);
      remedies.push(`使用通关五行化解`);
    } else if (controllingPairs[reversePair as keyof typeof controllingPairs]) {
      interaction = 'control';
      effects.push(`${annualElement}克${baseElement}，受克不利`);
      remedies.push(`增强${baseElement}的力量`);
    }
    
    // 特殊组合效应
    if (baseStar === 5 && annualStar === 2) {
      effects.push('五黄二黑同宫，大凶');
      remedies.push('需要铜铃、六帝钱化解');
    }
    if ((baseStar === 8 && annualStar === 8) || 
        (baseStar === 9 && annualStar === 9)) {
      effects.push('旺星叠临，大吉大利');
    }
    
    return {
      combined: `${baseStar}-${annualStar}`,
      interaction,
      effects,
      ...(remedies.length > 0 && { remedies })
    };
  }
}

/**
 * 创建飞星计算器实例
 */
export function createFlyingStarCalculator(): FlyingStarCalculator {
  return new FlyingStarCalculator();
}

/**
 * 快速计算年飞星
 */
export function calculateYearlyFlyingStars(year: number): FlyingStarGrid {
  const calculator = createFlyingStarCalculator();
  return calculator.calculateYearStar(year);
}

/**
 * 获取当前飞星运势
 */
export function getCurrentFlyingStarFortune(): {
  year: FlyingStarGrid;
  month: FlyingStarGrid;
  today: FlyingStarGrid;
} {
  const calculator = createFlyingStarCalculator();
  const now = new Date();
  
  return {
    year: calculator.calculateYearStar(now.getFullYear()),
    month: calculator.calculateMonthStar(now.getFullYear(), now.getMonth() + 1),
    today: calculator.calculateDailyStar(now)
  };
}