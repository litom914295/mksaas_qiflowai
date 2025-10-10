/**
 * @deprecated 此文件已弃用！请使用统一系统代替。
 *
 * ⚠️ 重要提示：
 * - 本文件与 xuankong/ 系统功能重复
 * - 请改用：`src/lib/qiflow/xuankong/comprehensive-engine.ts`
 * - 迁移指南：`MIGRATION_GUIDE.md`
 *
 * 原文档：
 * 玄空飞星计算模块
 *
 * 实现玄空风水的核心算法：
 * - 九宫飞星排盘
 * - 山星、向星、运星计算
 * - 上山下水判断
 * - 双星到向/到山判断
 *
 * @author 玄空风水大师团队
 * @version 6.0.0
 * @deprecated 使用 unified/ 系统代替
 */

// ==================== 常量定义 ====================

/**
 * 九宫方位（洛书九宫）
 */
export const NINE_PALACES = {
  1: { name: '坎宫', direction: '正北', degrees: [337.5, 22.5] },
  2: { name: '坤宫', direction: '西南', degrees: [202.5, 247.5] },
  3: { name: '震宫', direction: '正东', degrees: [67.5, 112.5] },
  4: { name: '巽宫', direction: '东南', degrees: [112.5, 157.5] },
  5: { name: '中宫', direction: '中央', degrees: null },
  6: { name: '乾宫', direction: '西北', degrees: [292.5, 337.5] },
  7: { name: '兑宫', direction: '正西', degrees: [247.5, 292.5] },
  8: { name: '艮宫', direction: '东北', degrees: [22.5, 67.5] },
  9: { name: '离宫', direction: '正南', degrees: [157.5, 202.5] },
} as const;

/**
 * 元运周期（180年一个大循环）
 */
export const PERIODS = {
  1: { start: 1864, end: 1883, name: '一运' },
  2: { start: 1884, end: 1903, name: '二运' },
  3: { start: 1904, end: 1923, name: '三运' },
  4: { start: 1924, end: 1943, name: '四运' },
  5: { start: 1944, end: 1963, name: '五运' },
  6: { start: 1964, end: 1983, name: '六运' },
  7: { start: 1984, end: 2003, name: '七运' },
  8: { start: 2004, end: 2023, name: '八运' },
  9: { start: 2024, end: 2043, name: '九运' },
} as const;

/**
 * 飞星顺逆飞规则
 * - 阳顺阴逆：1、3、7、9 为阳，顺飞；2、4、6、8 为阴，逆飞
 */
export const STAR_FLIGHT_DIRECTION = {
  1: 'forward', // 顺飞
  2: 'backward', // 逆飞
  3: 'forward',
  4: 'backward',
  5: 'forward', // 五黄特殊，一般按顺飞
  6: 'backward',
  7: 'forward',
  8: 'backward',
  9: 'forward',
} as const;

/**
 * 飞星顺序（洛书轨迹）
 * 顺飞：中 → 西北 → 正西 → 东北 → 正南 → 正北 → 西南 → 正东 → 东南 → 中
 * 逆飞：中 → 东南 → 正东 → 西南 → 正北 → 正南 → 东北 → 正西 → 西北 → 中
 */
const FORWARD_SEQUENCE = [5, 6, 7, 8, 9, 1, 2, 3, 4, 5];
const BACKWARD_SEQUENCE = [5, 4, 3, 2, 1, 9, 8, 7, 6, 5];

// ==================== 类型定义 ====================

/**
 * 飞星盘数据
 */
export interface FlyingStarChart {
  /** 元运（1-9）*/
  period: number;

  /** 坐向（度数，0-360）*/
  facing: number;

  /** 山向（facing的相反方向）*/
  mountain: number;

  /** 九宫飞星数据 */
  palaces: {
    [key: number]: {
      /** 宫位编号（1-9）*/
      position: number;

      /** 宫位名称 */
      name: string;

      /** 方位 */
      direction: string;

      /** 运星（元运星）*/
      periodStar: number;

      /** 山星（坐星）*/
      mountainStar: number;

      /** 向星（朝星）*/
      facingStar: number;

      /** 是否为当旺星（与元运相同）*/
      isCurrentStar: boolean;

      /** 是否为生气星（元运后一位）*/
      isProsperous: boolean;

      /** 是否为退气星（元运前一位）*/
      isDeclining: boolean;

      /** 是否为死气星（元运前两位及更早）*/
      isDead: boolean;
    };
  };

  /** 特殊格局 */
  patterns: {
    /** 是否双星到向（财旺人旺）*/
    isDoubleStarsToFacing: boolean;

    /** 是否双星到山（人旺财不旺）*/
    isDoubleStarsToMountain: boolean;

    /** 是否上山下水（人财两败）*/
    isUpMountainDownWater: boolean;

    /** 是否旺山旺向（理想格局）*/
    isWangShanWangXiang: boolean;

    /** 其他特殊格局 */
    specialPatterns: string[];
  };
}

/**
 * 方位转换结果
 */
export interface DirectionInfo {
  /** 度数 */
  degrees: number;

  /** 宫位（1-9）*/
  palace: number;

  /** 方位名称 */
  name: string;

  /** 是否在卦气分界线（空亡线）*/
  isOnBoundary: boolean;
}

// ==================== 核心计算类 ====================

/**
 * 玄空飞星计算器
 */
export class XuankongCalculator {
  /**
   * 根据年份获取元运
   */
  static getPeriodByYear(year: number): number {
    // 处理超出范围的年份（简单循环，实际应用中可能需要更复杂的处理）
    let adjustedYear = year;
    while (adjustedYear < 1864) adjustedYear += 180;
    while (adjustedYear >= 2044) adjustedYear -= 180;

    for (const [period, info] of Object.entries(PERIODS)) {
      if (adjustedYear >= info.start && adjustedYear <= info.end) {
        return Number.parseInt(period);
      }
    }

    // 默认返回当前运（2024年起为九运）
    return 9;
  }

  /**
   * 将度数转换为宫位信息
   */
  static degreesToPalace(degrees: number): DirectionInfo {
    // 标准化角度到 0-360
    let normalized = degrees % 360;
    if (normalized < 0) normalized += 360;

    // 检查每个宫位的度数范围
    for (const [palace, info] of Object.entries(NINE_PALACES)) {
      if (info.degrees === null) continue; // 跳过中宫

      const [start, end] = info.degrees;

      // 处理跨越0度的情况（如正北：337.5-22.5）
      if (start > end) {
        if (normalized >= start || normalized < end) {
          return {
            degrees: normalized,
            palace: Number.parseInt(palace),
            name: info.direction,
            isOnBoundary: XuankongCalculator.isNearBoundary(
              normalized,
              start,
              end
            ),
          };
        }
      } else {
        if (normalized >= start && normalized < end) {
          return {
            degrees: normalized,
            palace: Number.parseInt(palace),
            name: info.direction,
            isOnBoundary: XuankongCalculator.isNearBoundary(
              normalized,
              start,
              end
            ),
          };
        }
      }
    }

    // 理论上不会到达这里，但作为保险返回中宫
    return {
      degrees: normalized,
      palace: 5,
      name: '中央',
      isOnBoundary: false,
    };
  }

  /**
   * 检查是否接近卦气分界线（±1.5度以内）
   */
  private static isNearBoundary(
    degrees: number,
    start: number,
    end: number
  ): boolean {
    const threshold = 1.5;

    // 处理跨越0度的情况
    if (start > end) {
      return (
        Math.abs(degrees - start) <= threshold ||
        Math.abs(degrees - end) <= threshold ||
        Math.abs(degrees - (end + 360)) <= threshold
      );
    }

    return (
      Math.abs(degrees - start) <= threshold ||
      Math.abs(degrees - end) <= threshold
    );
  }

  /**
   * 计算完整的飞星盘
   */
  static calculateFlyingStars(facing: number, period: number): FlyingStarChart {
    console.log('[玄空飞星] 开始计算飞星盘', { facing, period });

    // 1. 确定坐向
    const facingInfo = XuankongCalculator.degreesToPalace(facing);
    const mountain = (facing + 180) % 360;
    const mountainInfo = XuankongCalculator.degreesToPalace(mountain);

    // 2. 初始化九宫数据
    const palaces: FlyingStarChart['palaces'] = {};

    for (let pos = 1; pos <= 9; pos++) {
      const palaceInfo = NINE_PALACES[pos as keyof typeof NINE_PALACES];

      palaces[pos] = {
        position: pos,
        name: palaceInfo.name,
        direction: palaceInfo.direction,
        periodStar: 0,
        mountainStar: 0,
        facingStar: 0,
        isCurrentStar: false,
        isProsperous: false,
        isDeclining: false,
        isDead: false,
      };
    }

    // 3. 排运星（以向为中宫飞布）
    const periodStars = XuankongCalculator.flyStars(period, facingInfo.palace);
    for (let pos = 1; pos <= 9; pos++) {
      palaces[pos].periodStar = periodStars[pos];
    }

    // 4. 排山星（从向星起飞）
    const mountainStars = XuankongCalculator.flyStars(
      periodStars[mountainInfo.palace],
      mountainInfo.palace
    );
    for (let pos = 1; pos <= 9; pos++) {
      palaces[pos].mountainStar = mountainStars[pos];
    }

    // 5. 排向星（从向星起飞）
    const facingStars = XuankongCalculator.flyStars(
      periodStars[facingInfo.palace],
      facingInfo.palace
    );
    for (let pos = 1; pos <= 9; pos++) {
      palaces[pos].facingStar = facingStars[pos];
    }

    // 6. 标记星曜旺衰
    for (let pos = 1; pos <= 9; pos++) {
      const palace = palaces[pos];
      palace.isCurrentStar = palace.periodStar === period;
      palace.isProsperous = palace.periodStar === (period % 9) + 1;
      palace.isDeclining =
        palace.periodStar === period - 1 ||
        (period === 1 && palace.periodStar === 9);
      palace.isDead =
        !palace.isCurrentStar && !palace.isProsperous && !palace.isDeclining;
    }

    // 7. 判断特殊格局
    const patterns = XuankongCalculator.identifyPatterns(
      palaces,
      facingInfo.palace,
      mountainInfo.palace,
      period
    );

    const chart: FlyingStarChart = {
      period,
      facing,
      mountain,
      palaces,
      patterns,
    };

    console.log('[玄空飞星] 飞星盘计算完成', {
      facingPalace: facingInfo.palace,
      mountainPalace: mountainInfo.palace,
      patterns: patterns.specialPatterns,
    });

    return chart;
  }

  /**
   * 飞星排布（核心算法）
   * @param centerStar 中宫星数
   * @param startPalace 起飞宫位
   */
  private static flyStars(
    centerStar: number,
    startPalace: number
  ): { [key: number]: number } {
    const stars: { [key: number]: number } = {};

    // 确定顺逆飞方向
    const direction =
      STAR_FLIGHT_DIRECTION[centerStar as keyof typeof STAR_FLIGHT_DIRECTION] ||
      'forward';
    const sequence =
      direction === 'forward' ? FORWARD_SEQUENCE : BACKWARD_SEQUENCE;

    // 中宫星
    stars[5] = centerStar;

    // 按洛书轨迹飞布
    let currentStar = centerStar;
    for (let i = 0; i < 9; i++) {
      const targetPalace = sequence[i];
      if (targetPalace === 5) continue; // 跳过中宫

      currentStar = (currentStar % 9) + 1;
      stars[targetPalace] = currentStar;
    }

    return stars;
  }

  /**
   * 识别特殊格局
   */
  private static identifyPatterns(
    palaces: FlyingStarChart['palaces'],
    facingPalace: number,
    mountainPalace: number,
    period: number
  ): FlyingStarChart['patterns'] {
    const patterns: string[] = [];

    // 获取向首和坐首的山向星
    const facingMountainStar = palaces[facingPalace].mountainStar;
    const facingFacingStar = palaces[facingPalace].facingStar;
    const mountainMountainStar = palaces[mountainPalace].mountainStar;
    const mountainFacingStar = palaces[mountainPalace].facingStar;

    // 1. 旺山旺向（最佳格局）
    const isWangShanWangXiang =
      mountainMountainStar === period && facingFacingStar === period;

    if (isWangShanWangXiang) {
      patterns.push('旺山旺向');
    }

    // 2. 双星到向（财旺人也旺）
    const isDoubleStarsToFacing =
      facingMountainStar === period && facingFacingStar === period;

    if (isDoubleStarsToFacing) {
      patterns.push('双星到向');
    }

    // 3. 双星到山（人旺财不旺）
    const isDoubleStarsToMountain =
      mountainMountainStar === period && mountainFacingStar === period;

    if (isDoubleStarsToMountain) {
      patterns.push('双星到山');
    }

    // 4. 上山下水（人财两败，大凶）
    const isUpMountainDownWater =
      facingMountainStar === period && mountainFacingStar === period;

    if (isUpMountainDownWater) {
      patterns.push('上山下水');
    }

    // 5. 检查其他特殊组合
    for (const [pos, palace] of Object.entries(palaces)) {
      const { mountainStar, facingStar, periodStar } = palace;

      // 三般卦（1-4-7，2-5-8，3-6-9）
      if (
        XuankongCalculator.isSanPanGua(mountainStar, facingStar, periodStar)
      ) {
        patterns.push(`${palace.name}三般卦`);
      }

      // 伏吟（山向星与运星相同）
      if (mountainStar === periodStar && facingStar === periodStar) {
        patterns.push(`${palace.name}伏吟`);
      }
    }

    return {
      isDoubleStarsToFacing,
      isDoubleStarsToMountain,
      isUpMountainDownWater,
      isWangShanWangXiang,
      specialPatterns: patterns,
    };
  }

  /**
   * 判断是否为三般卦
   */
  private static isSanPanGua(
    star1: number,
    star2: number,
    star3: number
  ): boolean {
    const set = new Set([star1, star2, star3]);

    // 父母三般卦
    if (set.has(1) && set.has(4) && set.has(7)) return true;
    if (set.has(2) && set.has(5) && set.has(8)) return true;
    if (set.has(3) && set.has(6) && set.has(9)) return true;

    return false;
  }

  /**
   * 评估飞星组合吉凶（用于后续评分）
   */
  static evaluateStarCombination(
    mountainStar: number,
    facingStar: number,
    period: number
  ): {
    score: number; // 0-100，分数越高越吉
    level: 'excellent' | 'good' | 'neutral' | 'bad' | 'terrible';
    description: string;
  } {
    let score = 50; // 基础分
    let level: 'excellent' | 'good' | 'neutral' | 'bad' | 'terrible' =
      'neutral';
    const reasons: string[] = [];

    // 1. 当旺星加分
    if (mountainStar === period) {
      score += 15;
      reasons.push('山星当旺');
    }
    if (facingStar === period) {
      score += 15;
      reasons.push('向星当旺');
    }

    // 2. 生气星加分
    const prosperousStar = (period % 9) + 1;
    if (mountainStar === prosperousStar) {
      score += 10;
      reasons.push('山星生气');
    }
    if (facingStar === prosperousStar) {
      score += 10;
      reasons.push('向星生气');
    }

    // 3. 五黄、二黑扣分（病符星）
    if (mountainStar === 5 || mountainStar === 2) {
      score -= 20;
      reasons.push('山星病符');
    }
    if (facingStar === 5 || facingStar === 2) {
      score -= 20;
      reasons.push('向星病符');
    }

    // 4. 组合判断
    if (mountainStar === facingStar) {
      score += 5;
      reasons.push('山向星同宫');
    }

    // 确定等级
    if (score >= 80) level = 'excellent';
    else if (score >= 65) level = 'good';
    else if (score >= 40) level = 'neutral';
    else if (score >= 25) level = 'bad';
    else level = 'terrible';

    const description = reasons.join('，');

    return { score, level, description };
  }
}

// ==================== 导出 ====================
