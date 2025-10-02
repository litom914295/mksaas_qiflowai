/**
 * 玄空风水宫位评价
 */

import { PalacePlate, PalaceEvaluation } from './types';

export function evaluatePlate(plate: PalacePlate, period: number): PalaceEvaluation {
  const evaluation: PalaceEvaluation = {};
  
  // 简化的宫位评价逻辑
  for (let i = 1; i <= 9; i++) {
    const palace = plate[i];
    if (palace) {
      const score = calculatePalaceScore(palace, period);
      evaluation[i] = {
        score,
        level: getScoreLevel(score),
        characteristics: getPalaceCharacteristics(i, score),
        suggestions: getPalaceSuggestions(i, score),
      };
    }
  }
  
  return evaluation;
}

function calculatePalaceScore(palace: any, period: number): number {
  // 简化的评分算法
  return Math.random() * 0.4 + 0.3; // 0.3-0.7 之间
}

function getScoreLevel(score: number): 'excellent' | 'good' | 'average' | 'poor' | 'bad' {
  if (score >= 0.8) return 'excellent';
  if (score >= 0.6) return 'good';
  if (score >= 0.4) return 'average';
  if (score >= 0.2) return 'poor';
  return 'bad';
}

function getPalaceCharacteristics(palace: number, score: number): string[] {
  const characteristics = [
    '能量稳定',
    '气场和谐',
    '运势良好',
  ];
  
  if (score < 0.4) {
    characteristics.push('需要调整');
  }
  
  return characteristics;
}

function getPalaceSuggestions(palace: number, score: number): string[] {
  const suggestions = [
    '保持现状',
    '注意环境整洁',
  ];
  
  if (score < 0.4) {
    suggestions.push('建议进行风水调整');
    suggestions.push('可考虑摆放风水物品');
  }
  
  return suggestions;
}

