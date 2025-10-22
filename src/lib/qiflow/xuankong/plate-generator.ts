// 玄空风水盘生成器 - 简化版本

export interface XuankongPlate {
  mountain: string;
  direction: string;
  facing?: string | number;
  period: number;
  specialPatterns?: string[];
  palaces?: any;
  plate: {
    [position: string]: {
      mountain: number;
      direction: number;
      period: number;
    };
  };
}

export interface PlateGeneratorInput {
  mountain?: string;
  direction?: string;
  facing?: number | string;
  buildYear?: number;
  period?: number;
  location?: any;
}

// 导出生成玄空盘函数
export function generateXuankongPlate(
  input: PlateGeneratorInput
): XuankongPlate {
  // 处理不同的输入格式
  const adaptedInput = {
    mountain: input.mountain || getMountainFromFacing(input.facing),
    direction: input.direction || getDirectionFromFacing(input.facing),
    period: input.period || getPeriodFromBuildYear(input.buildYear),
  };
  return PlateGenerator.generate(adaptedInput);
}

// 辅助函数：从朝向度数获取坐山
function getMountainFromFacing(facing: number | string | undefined): string {
  if (!facing) return '子';
  const degree = typeof facing === 'string' ? Number.parseInt(facing) : facing;

  if (degree >= 337.5 || degree < 22.5) return '子';
  if (degree >= 22.5 && degree < 67.5) return '丑';
  if (degree >= 67.5 && degree < 112.5) return '寅';
  if (degree >= 112.5 && degree < 157.5) return '卯';
  if (degree >= 157.5 && degree < 202.5) return '辰';
  if (degree >= 202.5 && degree < 247.5) return '巳';
  if (degree >= 247.5 && degree < 292.5) return '午';
  if (degree >= 292.5 && degree < 337.5) return '未';
  return '子';
}

// 辅助函数：从朝向度数获取向山
function getDirectionFromFacing(facing: number | string | undefined): string {
  if (!facing) return '午';
  const degree = typeof facing === 'string' ? Number.parseInt(facing) : facing;

  if (degree >= 337.5 || degree < 22.5) return '午';
  if (degree >= 22.5 && degree < 67.5) return '未';
  if (degree >= 67.5 && degree < 112.5) return '申';
  if (degree >= 112.5 && degree < 157.5) return '酉';
  if (degree >= 157.5 && degree < 202.5) return '戌';
  if (degree >= 202.5 && degree < 247.5) return '亥';
  if (degree >= 247.5 && degree < 292.5) return '子';
  if (degree >= 292.5 && degree < 337.5) return '丑';
  return '午';
}

// 辅助函数：从建造年份获取运期
function getPeriodFromBuildYear(buildYear: number | undefined): number {
  if (!buildYear) return 8;

  // 三元九运计算 (1864年起)
  const year = buildYear;
  if (year >= 2024) return 9;
  if (year >= 2004) return 8;
  if (year >= 1984) return 7;
  if (year >= 1964) return 6;
  if (year >= 1944) return 5;
  if (year >= 1924) return 4;
  if (year >= 1904) return 3;
  if (year >= 1884) return 2;
  return 1;
}

export class PlateGenerator {
  private static readonly MOUNTAINS = [
    '壬子癸',
    '丑艮寅',
    '甲卯乙',
    '辰巽巳',
    '丙午丁',
    '未坤申',
    '庚酉辛',
    '戌乾亥',
  ];

  private static readonly NINE_PALACES = [
    'southeast',
    'south',
    'southwest',
    'east',
    'center',
    'west',
    'northeast',
    'north',
    'northwest',
  ];

  static generate(input: PlateGeneratorInput): XuankongPlate {
    const { mountain, direction, period = 8 } = input;

    // 简化的飞星排盘逻辑
    const plate: XuankongPlate = {
      mountain: mountain || '',
      direction: direction || '',
      period,
      plate: {},
    };

    // 生成九宫格飞星盘
    PlateGenerator.NINE_PALACES.forEach((position, index) => {
      plate.plate[position] = {
        mountain: ((index + period) % 9) + 1,
        direction: ((index + period + 1) % 9) + 1,
        period: period,
      };
    });

    return plate;
  }

  static validateInput(input: PlateGeneratorInput): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!input.mountain) {
      errors.push('缺少坐山信息');
    }

    if (!input.direction) {
      errors.push('缺少向山信息');
    }

    if (input.period && (input.period < 1 || input.period > 9)) {
      errors.push('运期必须在1-9之间');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static getPlateAnalysis(plate: XuankongPlate): {
    favorable: string[];
    unfavorable: string[];
    remedies: string[];
  } {
    const favorable: string[] = [];
    const unfavorable: string[] = [];
    const remedies: string[] = [];

    // 简化的分析逻辑
    Object.entries(plate.plate).forEach(([position, stars]) => {
      const { mountain, direction } = stars;

      if (mountain === 8 && direction === 8) {
        favorable.push(`${position}宫: 双星到位，极佳方位`);
      } else if (mountain === 5 || direction === 5) {
        unfavorable.push(`${position}宫: 五黄煞星，需要化解`);
        remedies.push(`在${position}宫放置金属饰品化解五黄煞`);
      }
    });

    return { favorable, unfavorable, remedies };
  }

  static generateDetailedReport(plate: XuankongPlate): string {
    const analysis = PlateGenerator.getPlateAnalysis(plate);

    return `
玄空风水分析报告
================

基本信息:
- 坐山: ${plate.mountain}
- 向山: ${plate.direction}  
- 运期: ${plate.period}运

吉利方位:
${analysis.favorable.map((f) => `• ${f}`).join('\n')}

不利方位:
${analysis.unfavorable.map((u) => `• ${u}`).join('\n')}

化解建议:
${analysis.remedies.map((r) => `• ${r}`).join('\n')}

注：此为简化分析，实际风水布局需考虑更多因素。
`;
  }
}
