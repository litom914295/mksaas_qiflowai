/**
 * 坐向分析
 */

import { LocationAnalysis } from './types';

export function analyzeLocation(degrees: number, toleranceDeg: number): LocationAnalysis {
  // 简化的坐向分析逻辑
  const zuo = Math.floor(degrees / 15) + 1;
  const xiang = (zuo + 4) % 8 + 1;
  const isJian = (degrees % 15) < toleranceDeg;
  
  return {
    zuo,
    xiang,
    isJian,
    ambiguous: false,
  };
}

