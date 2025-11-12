/**
 * Score Calculator Stub
 * 
 * DEPRECATED: This is a compatibility stub.
 * Consider implementing full scoring logic or migrating to xuankong
 */

import type { PersonalizedFengshuiInput } from './personalized-engine';

export interface ScoreDetail {
  dimension: string;
  score: number;
  weight: number;
  reasons: string[];
  suggestions: string[];
}

export interface ScoreResult {
  overall: number;
  level: 'excellent' | 'good' | 'fair' | 'poor';
  details: ScoreDetail[];
  summary: string;
}

/**
 * @deprecated Implement or migrate to xuankong
 */
export class ScoreCalculator {
  static async calculate(
    input: PersonalizedFengshuiInput
  ): Promise<ScoreResult> {
    // Stub implementation - returns neutral score
    console.warn('[ScoreCalculator] Using stub implementation');
    
    return {
      overall: 70,
      level: 'good',
      details: [
        {
          dimension: 'Layout',
          score: 70,
          weight: 0.3,
          reasons: ['评分功能待实现'],
          suggestions: ['请迁移到完整实现'],
        },
        {
          dimension: 'Energy Flow',
          score: 70,
          weight: 0.3,
          reasons: ['评分功能待实现'],
          suggestions: ['请迁移到完整实现'],
        },
        {
          dimension: 'Personalization',
          score: 70,
          weight: 0.4,
          reasons: ['评分功能待实现'],
          suggestions: ['请迁移到完整实现'],
        },
      ],
      summary: '使用存根实现，建议迁移到完整版本',
    };
  }
}
