/**
 * 玄空风水相关类型定义
 */

export interface EnhancedXuankongPlate {
  period: number;
  facing: number;
  sitting: number;
  plates: {
    mountain: number[][];
    facing: number[][];
    base: number[][];
    combined?: number[][];
  };
  yun: {
    current: number;
    next: number;
    years: number[];
  };
}

export interface ComprehensiveAnalysisResult {
  overallScore: number;
  confidence: number;
  plates: EnhancedXuankongPlate;
  basicAnalysis?: {
    score: number;
    summary: {
      overallScore: number;
      characteristics: string;
      mainIssues: string[];
      keyPalaces: string[];
    };
    details: string[];
    enhancedPlate: any; // 使用any类型以避免复杂的类型依赖
    palaceDetails: Record<
      string,
      {
        rating: '大吉' | '吉' | '平' | '凶' | '大凶';
        score: number;
        stars: Array<{
          type: string;
          value?: number;
          number?: number;
        }>;
        analysis: string;
        effects: {
          wealth?: string;
          health?: string;
          relationships?: string;
        };
        suggestions: string[];
        suitableFor?: string[];
        interpretation?: string;
        recommendations?: string[];
      }
    >;
  };
  interpretation: {
    wealth: {
      score: number;
      description: string;
      suggestions: string[];
    };
    health: {
      score: number;
      description: string;
      suggestions: string[];
    };
    relationships: {
      score: number;
      description: string;
      suggestions: string[];
    };
    career: {
      score: number;
      description: string;
      suggestions: string[];
    };
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  warnings: string[];
  advancedTechniques?: {
    chengmenjue?: any;
    tigua?: any;
    lingzheng?: any;
    qixing?: any;
    fanfuyin?: any;
  };
}

export interface FlyingStarPosition {
  value: number;
  type: 'mountain' | 'facing' | 'base' | 'combined';
  interpretation?: string;
  auspicious?: boolean;
}

export interface DirectionInfo {
  direction: string;
  degree: number;
  element: string;
  stars: FlyingStarPosition[];
}

export interface XuankongAnalysisParams {
  address: string;
  facing: number;
  floorPlan?: string;
  notes?: string;
}

export interface XuankongAnalysisResponse {
  ok: boolean;
  result?: ComprehensiveAnalysisResult;
  error?: string;
  creditsUsed?: number;
  confidence?: number;
}
