/**
 * 八字专业版核心类型定义
 */

export type Stem = string;
export type Branch = string;

export interface StemBranch {
  gan: string; // 天干
  zhi: string; // 地支
  stem?: Stem; // 兼容旧代码
  branch?: Branch; // 兼容旧代码
  element?: string; // 五行
  nayin?: string; // 纳音
}

export interface BaziChart {
  year: StemBranch;
  month: StemBranch;
  day: StemBranch;
  hour: StemBranch;
}

export interface ElementStrength {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

export type Element = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

export interface MonthlyState {
  month: number;
  state: string;
  strength: number;
}

export interface FourPillars {
  year: StemBranch;
  month: StemBranch;
  day: StemBranch;
  hour: StemBranch;
}

export interface WuxingStrength {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

export interface BaziDate {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute?: number;
  isLunar?: boolean;
}

export interface BaziResult {
  pillars: FourPillars;
  elements: WuxingStrength;
  yongshen?: any;
  yearPillar?: StemBranch;
  monthPillar?: StemBranch;
  dayPillar?: StemBranch;
  hourPillar?: StemBranch;
}

export interface DayunPeriod {
  startAge: number;
  endAge: number;
  stem: Stem;
  branch: Branch;
}
