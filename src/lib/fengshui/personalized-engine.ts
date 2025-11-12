/**
 * Personalized Engine Types Stub
 * 
 * DEPRECATED: This is a compatibility stub for type definitions.
 * Please migrate to @/lib/qiflow/xuankong/personalized-analysis
 */

// Re-export types from xuankong where available
export type { UserProfile } from '@/lib/qiflow/xuankong/personalized-analysis';

/**
 * Element types for Feng Shui analysis
 */
export type Element = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

/**
 * Bazi information for personalized analysis
 */
export interface BaziInfo {
  dayMaster: Element;
  favorableElements: Element[];
  unfavorableElements: Element[];
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  strength: number; // 1-10
}

/**
 * House information
 */
export interface HouseInfo {
  facing: number; // degrees
  mountain: number; // degrees
  period: number; // 1-9
  buildYear: number;
  floor?: number;
  layout?: RoomLayout[];
  address?: string;
}

/**
 * Room layout information
 */
export interface RoomLayout {
  id: string;
  type: string;
  name: string;
  position: number; // Palace index 1-9
  area?: number;
  isPrimary?: boolean;
}

/**
 * Time information for analysis
 */
export interface TimeInfo {
  currentYear: number;
  currentMonth: number;
  targetDate?: Date;
}

/**
 * Personalized Feng Shui input
 */
export interface PersonalizedFengshuiInput {
  bazi: BaziInfo;
  house: HouseInfo;
  time: TimeInfo;
  family?: BaziInfo[];
}
