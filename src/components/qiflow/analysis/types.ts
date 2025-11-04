/**
 * QiFlow Analysis Types
 * 分析系统类型定义
 */

export interface BaziData {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  gender: 'male' | 'female';
  solarCalendar: boolean;
}

export interface XuankongData {
  sittingDirection: string;
  facingDirection: string;
  period: number;
  buildingYear: number;
  floors?: number;
  roomLayout?: string;
}

export interface AnalysisRequest {
  type: 'bazi' | 'xuankong' | 'comprehensive';
  baziData?: BaziData;
  xuankongData?: XuankongData;
  userId?: string;
  sessionId?: string;
}

export interface AnalysisResult {
  id: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface FourPillars {
  year: { heavenlyStem: string; earthlyBranch: string };
  month: { heavenlyStem: string; earthlyBranch: string };
  day: { heavenlyStem: string; earthlyBranch: string };
  hour: { heavenlyStem: string; earthlyBranch: string };
}

export interface ElementBalance {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

export interface LifeStage {
  startAge: number;
  endAge: number;
  heavenlyStem: string;
  earthlyBranch: string;
  fortune: string;
}
