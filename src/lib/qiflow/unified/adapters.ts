/**
 * 数据适配器
 *
 * 负责在 xuankong 系统和 fengshui 系统之间转换数据格式
 *
 * @author QiFlow AI Team
 * @version 1.0.0
 */

import type {
  BaziInfo as FengshuiBaziInfo,
  HouseInfo as FengshuiHouseInfo,
  RoomLayout as FengshuiRoomLayout,
  PersonalizedFengshuiInput,
} from '../fengshui/personalized-engine';
import type { ComprehensiveAnalysisOptions } from '../xuankong/comprehensive-engine';
import type { UserProfile } from '../xuankong/personalized-analysis';
import type {
  Mountain,
  PalaceIndex,
  Plate,
  PlateCell,
  Yun,
} from '../xuankong/types';
import type {
  UnifiedAnalysisInput,
  UnifiedBaziInfo,
  UnifiedHouseInfo,
  UnifiedRoomLayout,
} from './types';

// ==================== 八字信息转换 ====================

/**
 * 将统一八字信息转换为 xuankong 系统的 UserProfile
 */
export function toXuankongUserProfile(bazi: UnifiedBaziInfo): UserProfile {
  return {
    birthYear: bazi.birthYear,
    birthMonth: bazi.birthMonth,
    birthDay: bazi.birthDay,
    birthHour: bazi.birthHour,
    gender: bazi.gender,
    occupation: bazi.occupation || '',
    livingHabits: {
      workFromHome: bazi.livingHabits?.workFromHome ?? false,
      frequentTraveling: bazi.livingHabits?.frequentTraveling ?? false,
      hasChildren: bazi.livingHabits?.hasChildren ?? false,
      elderlyLiving: bazi.livingHabits?.elderlyLiving ?? false,
      petsOwner: bazi.livingHabits?.petsOwner ?? false,
    },
    healthConcerns: bazi.healthConcerns,
    careerGoals: bazi.careerGoals,
    familyStatus: bazi.familyStatus || 'single',
    financialGoals: bazi.financialGoals,
  };
}

/**
 * 将统一八字信息转换为 fengshui 系统的 BaziInfo
 */
export function toFengshuiBaziInfo(bazi: UnifiedBaziInfo): FengshuiBaziInfo {
  // 如果缺少必要信息，使用默认值
  return {
    dayMaster: bazi.dayMaster || 'water',
    favorableElements: bazi.favorableElements || ['metal', 'water'],
    unfavorableElements: bazi.unfavorableElements || ['earth', 'fire'],
    season: bazi.season || 'winter',
    strength: bazi.strength || 5,
  };
}

// ==================== 房屋信息转换 ====================

/**
 * 将房间布局从九宫格位置转换为方位名称
 */
function palaceToDirection(palace: PalaceIndex): string {
  const directionMap: Record<PalaceIndex, string> = {
    1: '北',
    2: '西南',
    3: '东',
    4: '东南',
    5: '中',
    6: '西北',
    7: '西',
    8: '东北',
    9: '南',
  };
  return directionMap[palace] || '中';
}

/**
 * 将统一房间布局转换为 fengshui 系统的 RoomLayout
 */
export function toFengshuiRoomLayout(
  room: UnifiedRoomLayout
): FengshuiRoomLayout {
  return {
    id: room.id,
    type: room.type,
    name: room.name,
    position: room.palace,
    area: room.area,
    isPrimary: room.isPrimary,
  };
}

/**
 * 将统一房屋信息转换为 fengshui 系统的 HouseInfo
 */
export function toFengshuiHouseInfo(
  house: UnifiedHouseInfo
): FengshuiHouseInfo {
  return {
    facing: house.facing,
    mountain: house.facing >= 180 ? house.facing - 180 : house.facing + 180,
    period: house.period || calculatePeriod(house.buildYear),
    buildYear: house.buildYear,
    floor: house.floor,
    layout: house.layout?.map(toFengshuiRoomLayout),
    address: house.location?.address,
  };
}

// ==================== 分析选项转换 ====================

/**
 * 将统一分析输入转换为 xuankong 系统的 ComprehensiveAnalysisOptions
 */
export function toXuankongAnalysisOptions(
  input: UnifiedAnalysisInput
): ComprehensiveAnalysisOptions {
  const options = input.options || {};

  return {
    observedAt: new Date(input.time.currentYear, input.time.currentMonth - 1),
    facing: { degrees: input.house.facing },
    location: input.house.location
      ? {
          lat: input.house.location.lat,
          lon: input.house.location.lon,
        }
      : undefined,
    userProfile: toXuankongUserProfile(input.bazi),
    includeLiunian: options.includeLiunian ?? true,
    includePersonalization: options.includePersonalization ?? true,
    includeTiguaAnalysis: options.includeTigua ?? true, // 默认启用
    includeLingzheng: options.includeLingzheng ?? true, // 默认启用
    includeChengmenjue: options.includeChengmenjue ?? true, // 默认启用
    includeTimeSelection: false,
    environmentInfo: input.house.environment
      ? {
          waterPositions: input.house.environment.waterPositions,
          mountainPositions: input.house.environment.mountainPositions,
          description: input.house.environment.description,
        }
      : undefined,
    targetYear: input.time.currentYear,
    targetMonth: input.time.currentMonth,
    eventType: options.eventType,
    config: options.config,
  };
}

/**
 * 将统一分析输入转换为 fengshui 系统的 PersonalizedFengshuiInput
 */
export function toFengshuiInput(
  input: UnifiedAnalysisInput
): PersonalizedFengshuiInput {
  return {
    bazi: toFengshuiBaziInfo(input.bazi),
    house: toFengshuiHouseInfo(input.house),
    time: {
      currentYear: input.time.currentYear,
      currentMonth: input.time.currentMonth,
      targetDate: input.time.targetDate,
    },
    family: input.family?.map(toFengshuiBaziInfo),
  };
}

// ==================== 飞星盘数据转换 ====================

/**
 * 从 xuankong 的 Plate 提取关键信息用于 fengshui 系统评分
 *
 * fengshui 系统需要知道每个宫位的山星、向星、运星，
 * 这个函数帮助提取并整理这些信息
 */
export interface SimplifiedPlateData {
  period: Yun;
  palaces: Array<{
    position: PalaceIndex;
    mountainStar: number;
    facingStar: number;
    periodStar: number;
  }>;
}

export function extractPlateData(
  plate: Plate,
  period: Yun
): SimplifiedPlateData {
  return {
    period,
    palaces: plate.map((cell: PlateCell) => ({
      position: cell.palace,
      mountainStar: cell.mountainStar,
      facingStar: cell.facingStar,
      periodStar: cell.periodStar || period,
    })),
  };
}

// ==================== 辅助函数 ====================

/**
 * 根据建造年份计算元运
 */
export function calculatePeriod(buildYear: number): Yun {
  // 三元九运计算（每运20年）
  // 上元：一运(1864-1883)、二运(1884-1903)、三运(1904-1923)
  // 中元：四运(1924-1943)、五运(1944-1963)、六运(1964-1983)
  // 下元：七运(1984-2003)、八运(2004-2023)、九运(2024-2043)

  if (buildYear >= 2024 && buildYear <= 2043) return 9;
  if (buildYear >= 2004 && buildYear <= 2023) return 8;
  if (buildYear >= 1984 && buildYear <= 2003) return 7;
  if (buildYear >= 1964 && buildYear <= 1983) return 6;
  if (buildYear >= 1944 && buildYear <= 1963) return 5;
  if (buildYear >= 1924 && buildYear <= 1943) return 4;
  if (buildYear >= 1904 && buildYear <= 1923) return 3;
  if (buildYear >= 1884 && buildYear <= 1903) return 2;
  if (buildYear >= 1864 && buildYear <= 1883) return 1;

  // 推算其他年份
  const baseYear = 1864;
  const diff = buildYear - baseYear;
  const periodIndex = Math.floor(diff / 20) % 9;
  return (periodIndex + 1) as Yun;
}

/**
 * 将度数转换为二十四山
 */
export function degreesToMountain(degrees: number): Mountain {
  // 标准化角度到 0-360
  let normalized = degrees % 360;
  if (normalized < 0) normalized += 360;

  // 二十四山，每山15度
  const mountains: Mountain[] = [
    '子',
    '癸',
    '丑',
    '艮',
    '寅',
    '甲',
    '卯',
    '乙',
    '辰',
    '巽',
    '巳',
    '丙',
    '午',
    '丁',
    '未',
    '坤',
    '申',
    '庚',
    '酉',
    '辛',
    '戌',
    '乾',
    '亥',
    '壬',
  ];

  // 子山从352.5度到7.5度
  const index = Math.floor((normalized + 7.5) / 15) % 24;
  return mountains[index];
}

/**
 * 将二十四山转换为度数（取中心度数）
 */
export function mountainToDegrees(mountain: Mountain): number {
  const mountains: Mountain[] = [
    '子',
    '癸',
    '丑',
    '艮',
    '寅',
    '甲',
    '卯',
    '乙',
    '辰',
    '巽',
    '巳',
    '丙',
    '午',
    '丁',
    '未',
    '坤',
    '申',
    '庚',
    '酉',
    '辛',
    '戌',
    '乾',
    '亥',
    '壬',
  ];

  const index = mountains.indexOf(mountain);
  if (index === -1) return 0;

  // 子山为0度（北），顺时针每15度一个山
  return (index * 15) % 360;
}

/**
 * 将宫位转换为二十四山（取该宫位的正中山向）
 */
export function palaceToMountain(palace: PalaceIndex): Mountain {
  const palaceMountainMap: Record<PalaceIndex, Mountain> = {
    1: '子', // 北
    2: '坤', // 西南
    3: '卯', // 东
    4: '巽', // 东南
    5: '中', // 中（实际不存在对应山向，取子）
    6: '乾', // 西北
    7: '酉', // 西
    8: '艮', // 东北
    9: '午', // 南
  };

  return palaceMountainMap[palace] || '子';
}

/**
 * 获取宫位的中文名称
 */
export function getPalaceName(palace: PalaceIndex): string {
  const nameMap: Record<PalaceIndex, string> = {
    1: '坎宫',
    2: '坤宫',
    3: '震宫',
    4: '巽宫',
    5: '中宫',
    6: '乾宫',
    7: '兑宫',
    8: '艮宫',
    9: '离宫',
  };
  return nameMap[palace] || '未知';
}
