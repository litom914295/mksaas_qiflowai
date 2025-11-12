/**
 * 八字核心类型定义
 * 所有模块统一使用此文件的类型定义
 *
 * @module bazi/types/core
 */

// ===== 基础类型 =====

/** 天干 */
export type Stem = string;
export type HeavenlyStem =
  | '甲'
  | '乙'
  | '丙'
  | '丁'
  | '戊'
  | '己'
  | '庚'
  | '辛'
  | '壬'
  | '癸';

/** 地支 */
export type Branch = string;
export type EarthlyBranch =
  | '子'
  | '丑'
  | '寅'
  | '卯'
  | '辰'
  | '巳'
  | '午'
  | '未'
  | '申'
  | '酉'
  | '戌'
  | '亥';

/** 五行 */
export type Element = '木' | '火' | '土' | '金' | '水';
export type FiveElement = Element;

// ===== 干支对 =====

/**
 * 干支对（天干+地支）
 * 统一使用 gan/zhi 命名
 */
export interface StemBranch {
  /** 天干 */
  gan: string;
  /** 地支 */
  zhi: string;
  /** 纳音 */
  nayin?: string;
  /** 五行 */
  element?: string;
  /** @deprecated 兼容旧代码 - 使用 gan 代替 */
  stem?: Stem;
  /** @deprecated 兼容旧代码 - 使用 zhi 代替 */
  branch?: Branch;
  /** @deprecated 兼容旧代码 - 使用 gan 代替 */
  heavenlyStem?: HeavenlyStem;
  /** @deprecated 兼容旧代码 - 使用 zhi 代替 */
  earthlyBranch?: EarthlyBranch;
}

/**
 * 八字柱（年/月/日/时柱）
 * @alias StemBranch
 */
export type BaziPillar = StemBranch;

/**
 * 简化的干支对（仅天干地支）
 */
export interface Pillar {
  stem: Stem;
  branch: Branch;
}

// ===== 四柱 =====

/**
 * 四柱（年月日时）
 */
export interface FourPillars {
  year: StemBranch;
  month: StemBranch;
  day: StemBranch;
  hour: StemBranch;
}

/**
 * 简化版四柱
 */
export interface Pillars {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
}

/**
 * 八字图表
 * @alias FourPillars
 */
export type BaziChart = FourPillars;

// ===== 五行强度 =====

/**
 * 五行强度分布
 */
export interface WuxingStrength {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

/**
 * 五行强度（别名）
 * @alias WuxingStrength
 */
export type ElementStrength = WuxingStrength;

/**
 * 五行强度（按中文键）
 */
export type FiveElementStrength = Record<FiveElement, number>;

// ===== 日期时间 =====

/**
 * 八字日期
 */
export interface BaziDate {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute?: number;
  isLunar?: boolean;
}

/**
 * 历法类型
 */
export type CalendarType = 'gregorian' | 'lunar';

/**
 * 位置信息
 */
export interface Location {
  /** 纬度（度） */
  latitude: number;
  /** 经度（度） */
  longitude: number;
  /** IANA 时区 */
  timezone?: string;
}

/**
 * 出生信息输入
 */
export interface BirthInput {
  /** 历法类型 */
  calendar: CalendarType;
  /** 日期 YYYY-MM-DD */
  date: string;
  /** 时间 HH:mm 或 HH:mm:ss */
  time?: string;
  /** 是否使用真太阳时 */
  useTrueSolarTime?: boolean;
  /** 位置信息 */
  location?: Location;
}

// ===== 用神 =====

/**
 * 用神类型
 */
export type YongshenType =
  | 'fuyi' // 扶抑
  | 'tiaohou' // 调候
  | 'tongguan' // 通关
  | 'bingyao' // 病药
  | 'congge'; // 从格

/**
 * 用神结果
 */
export interface YongShen {
  /** 喜用神 */
  favorable: FiveElement[];
  /** 忌神 */
  unfavorable: FiveElement[];
  /** 说明 */
  commentary?: string;
}

/**
 * 用神详细结果
 */
export interface YongshenResult {
  /** 主用神 */
  primary: {
    element: Element;
    type: YongshenType;
    reason: string;
  };
  /** 辅用神 */
  secondary?: {
    element: Element;
    type: YongshenType;
    reason: string;
  };
  /** 忌神 */
  avoid: {
    element: Element;
    reason: string;
  };
  /** 建议 */
  recommendations: string[];
}

// ===== 八字结果 =====

/**
 * 八字计算结果
 */
export interface BaziResult {
  /** 四柱 */
  pillars: FourPillars;
  /** 五行强度 */
  elements: WuxingStrength;
  /** 用神 */
  yongshen?: YongShen | YongshenResult | any;
  /** @deprecated 使用 pillars.year */
  yearPillar?: StemBranch;
  /** @deprecated 使用 pillars.month */
  monthPillar?: StemBranch;
  /** @deprecated 使用 pillars.day */
  dayPillar?: StemBranch;
  /** @deprecated 使用 pillars.hour */
  hourPillar?: StemBranch;
}

// ===== 大运 =====

/**
 * 大运期间
 */
export interface DayunPeriod {
  startAge: number;
  endAge: number;
  stem: Stem;
  branch: Branch;
}

/**
 * 大运详细信息
 */
export interface DaYun {
  startAge: number;
  endAge: number;
  gan: HeavenlyStem;
  zhi: EarthlyBranch;
  element: Element;
  isGood: boolean;
  description: string;
}

// ===== 月令状态 =====

/**
 * 月令状态
 */
export interface MonthlyState {
  month: number;
  state: string;
  strength: number;
}

// ===== 性别 =====

/**
 * 性别
 */
export type Gender = 'male' | 'female';

// ===== 导出兼容别名 =====

// 注意: Pillars 已在上方定义为 interface (简化版四柱)
// 旧代码如果使用 Pillars 类型, 应该迁移到 FourPillars
