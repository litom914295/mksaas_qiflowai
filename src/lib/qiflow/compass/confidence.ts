/**
 * 罗盘置信度分析模块
 */

export type ConfidenceLevel = 'low' | 'medium' | 'high';

/**
 * 获取置信度级别
 */
export function getConfidenceLevel(value: number): ConfidenceLevel {
  if (value < 0.4) return 'low';
  if (value < 0.7) return 'medium';
  return 'high';
}

/**
 * 罗盘置信度分析器
 */
export class CompassConfidenceAnalyzer {
  analyze(sensorData: any, fusedData?: any): number {
    // 简化的置信度分析
    return 0.75;
  }
}
