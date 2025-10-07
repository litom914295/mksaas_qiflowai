import type { GenerateFlyingStarOutput, FlyingStarExplanation } from '@/lib/fengshui';
import type { LucideIcon } from 'lucide-react';

/**
 * 个人信息数据
 */
export interface PersonalData {
  name: string;
  birthDate: string;
  birthTime: string;
  gender: 'male' | 'female';
  location: string;
}

/**
 * 房屋方位数据
 */
export interface HouseData {
  /** 方位角度 (0-360度) */
  orientation: number;
  /** 房屋地址 */
  address: string;
  /** 楼层 */
  floor: number;
  /** 房间数量 */
  roomCount: number;
  /** 罗盘测量方式 */
  compassMethod: 'manual' | 'compass';
}

/**
 * 房间信息
 */
export interface Room {
  id: string;
  name: string;
  type: 'living' | 'living_room' | 'bedroom' | 'study' | 'kitchen' | 'bathroom' | 'dining' | 'dining_room';
  position?: {
    x: number;
    y: number;
  };
  size?: {
    width: number;
    height: number;
  };
}

/**
 * 标准户型图数据
 */
export interface FloorPlan {
  id: string;
  name: string;
  description: string;
  orientation: number;
  rooms?: Room[];
}

/**
 * 八字分析结果（简化版）
 */
export interface BaziResult {
  fourPillars: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  fiveElements: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  favorableElements: string[];
  unfavorableElements: string[];
  analysis: string;
}

/**
 * 完整分析数据
 */
export interface AnalysisData {
  personal: PersonalData;
  house: HouseData;
  floorPlan?: FloorPlan;
  baziResult?: BaziResult;
  fengshuiResult?: GenerateFlyingStarOutput;
  fengshuiExplanation?: FlyingStarExplanation;
}

/**
 * 步骤配置
 */
export interface Step {
  id: number;
  title: string;
  icon: LucideIcon;
  description: string;
}

/**
 * 组件属性类型
 */
export interface GuestAnalysisPageProps {
  locale?: string;
}
