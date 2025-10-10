/**
 * 风水罗盘AI分析服务
 *
 * 基于传统风水理论的智能分析引擎
 * 提供方位分析、风水建议和吉凶判断
 */

import type { CompassUtil } from './feng-shui-engine';
import type { AIAnalysisResult } from './feng-shui-types';

export class FengShuiAIAnalysis {
  private util: CompassUtil;

  constructor(util: CompassUtil) {
    this.util = util;
  }

  // 执行完整的风水分析
  async analyzeDirection(direction: number): Promise<AIAnalysisResult> {
    const mountain = this.util.getTwentyFourMountain(direction);
    const bagua = this.util.getBaguaInfo(direction);

    // 分析吉凶
    const auspiciousness = this.analyzeAuspiciousness(
      direction,
      mountain.element
    );

    // 生成建议
    const suggestions = this.generateSuggestions(
      mountain,
      bagua,
      auspiciousness
    );

    // 计算置信度
    const confidence = this.calculateConfidence(direction);

    const result: AIAnalysisResult = {
      direction,
      mountain: mountain.name,
      bagua: bagua.name,
      confidence,
      analysis: this.generateAnalysis(mountain, bagua, auspiciousness),
      suggestions,
      timestamp: Date.now(),
      score: Math.round(confidence * 100),
      recommendations: suggestions.slice(0, 3),
    };
    return result;
  }

  // 分析方位吉凶
  private analyzeAuspiciousness(
    direction: number,
    element: string
  ): 'auspicious' | 'neutral' | 'inauspicious' {
    // 基于传统风水理论的简化判断
    const auspiciousAngles = [0, 45, 90, 135, 180, 225, 270, 315];
    const tolerance = 15;

    for (const angle of auspiciousAngles) {
      if (
        Math.abs(direction - angle) <= tolerance ||
        Math.abs(direction - angle - 360) <= tolerance
      ) {
        return 'auspicious';
      }
    }

    // 检查是否为凶方位
    const inauspiciousAngles = [
      22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5,
    ];
    for (const angle of inauspiciousAngles) {
      if (Math.abs(direction - angle) <= tolerance) {
        return 'inauspicious';
      }
    }

    return 'neutral';
  }

  // 生成分析文本
  private generateAnalysis(
    mountain: any,
    bagua: any,
    auspiciousness: string
  ): string {
    const elementDesc = this.getElementDescription(mountain.element);
    const baguaDesc = this.getBaguaDescription(bagua.name);
    const auspiciousnessDesc =
      this.getAuspiciousnessDescription(auspiciousness);

    return `当前方向为${mountain.name}山，属${bagua.name}卦，五行属${mountain.element}。${elementDesc} ${baguaDesc} ${auspiciousnessDesc}`;
  }

  // 生成建议
  private generateSuggestions(
    mountain: any,
    bagua: any,
    auspiciousness: string
  ): string[] {
    const suggestions: string[] = [];

    // 基于五行的建议
    suggestions.push(
      `${mountain.name}山方位适宜进行${mountain.element}属性的活动`
    );

    // 基于八卦的建议
    suggestions.push(
      `${bagua.name}卦象征${bagua.meaning}，建议注意相关风水布局`
    );

    // 基于吉凶的建议
    if (auspiciousness === 'auspicious') {
      suggestions.push('此方位为吉方，适宜重要活动和决策');
    } else if (auspiciousness === 'inauspicious') {
      suggestions.push('此方位需谨慎，建议避免重要决策');
    } else {
      suggestions.push('此方位为平方，可进行日常活动');
    }

    // 基于五行相生相克的建议
    suggestions.push(`五行${mountain.element}与当前环境的协调性需要注意`);

    return suggestions;
  }

  // 计算置信度
  private calculateConfidence(direction: number): number {
    // 基于方向的精确度计算置信度
    const baseConfidence = 0.8;
    const directionFactor = Math.cos(((direction % 45) * Math.PI) / 180) * 0.2;
    return Math.min(0.99, baseConfidence + directionFactor);
  }

  // 获取五行描述
  private getElementDescription(element: string): string {
    const descriptions: Record<string, string> = {
      金: '金主收敛、肃杀，具有清洁、肃降、收敛等特性。',
      木: '木主生发、条达，具有生长、升发、条达等特性。',
      水: '水主滋润、下行，具有滋润、下行、寒凉等特性。',
      火: '火主温热、上炎，具有温热、上升、光明等特性。',
      土: '土主运化、承载，具有承载、受纳、化生等特性。',
    };
    return descriptions[element] || '';
  }

  // 获取八卦描述
  private getBaguaDescription(bagua: string): string {
    const descriptions: Record<string, string> = {
      乾: '乾为天，象征刚健、创造、领导。',
      坤: '坤为地，象征柔顺、包容、承载。',
      震: '震为雷，象征动、奋起、发展。',
      巽: '巽为风，象征顺、渗透、灵活。',
      坎: '坎为水，象征险、智慧、流动。',
      离: '离为火，象征明、美丽、文明。',
      艮: '艮为山，象征止、稳定、阻碍。',
      兑: '兑为泽，象征悦、交流、收获。',
    };
    return descriptions[bagua] || '';
  }

  // 获取吉凶描述
  private getAuspiciousnessDescription(auspiciousness: string): string {
    const descriptions: Record<string, string> = {
      auspicious: '此方位为吉方，气场和谐，适宜进行重要活动。',
      neutral: '此方位为平方，气场平稳，可进行日常活动。',
      inauspicious: '此方位为凶方，气场不稳，需要谨慎对待。',
    };
    return descriptions[auspiciousness] || '';
  }
}
