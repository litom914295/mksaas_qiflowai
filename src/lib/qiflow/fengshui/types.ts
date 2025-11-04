/**
 * 风水分析类型定义
 */

export interface SmartRecommendation {
  priority: number;
  category: string;
  title: string;
  description: string;
  expectedImpact: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedCost?: string;
  steps?: string[];
}

export interface RecommendationOptions {
  focusAreas?: string[];
  budget?: { min: number; max: number };
  timeframe?: 'immediate' | 'short_term' | 'long_term';
}

export * from '../xuankong/types';
