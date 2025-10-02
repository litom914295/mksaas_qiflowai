/**
 * 玄空风水算法类型定义
 */

export interface FlyingStarConfig {
  toleranceDeg: number;
  applyTiGua: boolean;
  applyFanGua: boolean;
  enableAdvancedAnalysis: boolean;
}

export const DEFAULT_FLYING_STAR_CONFIG: FlyingStarConfig = {
  toleranceDeg: 3,
  applyTiGua: true,
  applyFanGua: true,
  enableAdvancedAnalysis: true,
};

export interface GenerateFlyingStarInput {
  observedAt: Date;
  facing: {
    degrees: number;
  };
  config?: Partial<FlyingStarConfig>;
}

export interface GenerateFlyingStarOutput {
  period: number;
  plates: {
    period: PalacePlate;
    year: PalacePlate;
    month: PalacePlate;
    day: PalacePlate;
  };
  evaluation: PalaceEvaluation;
  meta: {
    rulesApplied: string[];
    ambiguous: boolean;
  };
  geju: GejuAnalysis;
  wenchangwei: number[];
  caiwei: number[];
}

export interface PalacePlate {
  [palace: number]: {
    mountain: number;
    water: number;
    period: number;
  };
}

export interface PalaceEvaluation {
  [palace: number]: {
    score: number;
    level: 'excellent' | 'good' | 'average' | 'poor' | 'bad';
    characteristics: string[];
    suggestions: string[];
  };
}

export interface GejuAnalysis {
  type: string;
  strength: number;
  characteristics: string[];
  advantages: string[];
  disadvantages: string[];
  recommendations: string[];
}

export interface LocationAnalysis {
  zuo: number;
  xiang: number;
  isJian: boolean;
  ambiguous: boolean;
}

export interface YunInfo {
  period: number;
  isBoundary: boolean;
  startYear: number;
  endYear: number;
}

