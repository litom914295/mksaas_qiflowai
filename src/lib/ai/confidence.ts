/**
 * AI分析结果置信度评估系统
 * 专门针对传统文化领域的分析结果进行可信度评估
 */

import type { AIResponse, ConfidenceScore, TermExplanation } from './types';

export interface AnalysisInput {
  content: string;
  dataSource: 'user_input' | 'calculated' | 'template' | 'ai_generated';
  domain: 'fengshui' | 'bazi' | 'general';
  complexity: 'simple' | 'medium' | 'complex';
  hasStructuredData: boolean;
  culturalTermsCount: number;
  theoreticalBasis: string[];
}

export class ConfidenceEvaluator {
  private readonly domainWeights = {
    fengshui: {
      dataQuality: 0.25,
      theoryMatch: 0.35,
      complexity: 0.2,
      culturalRelevance: 0.2,
    },
    bazi: {
      dataQuality: 0.4, // 八字计算对数据准确性要求更高
      theoryMatch: 0.3,
      complexity: 0.15,
      culturalRelevance: 0.15,
    },
    general: {
      dataQuality: 0.3,
      theoryMatch: 0.25,
      complexity: 0.25,
      culturalRelevance: 0.2,
    },
  };

  /**
   * 计算整体置信度分数
   */
  evaluateConfidence(
    input: AnalysisInput,
    aiResponse: AIResponse
  ): ConfidenceScore {
    const weights = this.domainWeights[input.domain];

    // 评估各个维度
    const dataQuality = this.evaluateDataQuality(input);
    const theoryMatch = this.evaluateTheoryMatch(input, aiResponse);
    const complexity = this.evaluateComplexity(input);
    const culturalRelevance = this.evaluateCulturalRelevance(input);

    // 计算加权总分
    const overall =
      dataQuality * weights.dataQuality +
      theoryMatch * weights.theoryMatch +
      complexity * weights.complexity +
      culturalRelevance * weights.culturalRelevance;

    return {
      overall: Math.round(overall * 100) / 100,
      reasoning: this.generateReasoningText(overall, {
        dataQuality,
        theoryMatch,
        complexity,
        culturalRelevance,
      }),
      factors: {
        dataQuality,
        theoryMatch,
        complexity,
        culturalRelevance,
      },
    };
  }

  /**
   * 评估数据质量
   */
  private evaluateDataQuality(input: AnalysisInput): number {
    let score = 0.5; // 基础分

    // 数据来源可靠性
    switch (input.dataSource) {
      case 'calculated':
        score += 0.3;
        break;
      case 'user_input':
        score += 0.2;
        break;
      case 'template':
        score += 0.1;
        break;
      case 'ai_generated':
        score -= 0.1;
        break;
    }

    // 结构化数据加分
    if (input.hasStructuredData) {
      score += 0.2;
    }

    // 确保分数在合理范围内
    return Math.max(0, Math.min(1, score));
  }

  /**
   * 评估理论匹配度
   */
  private evaluateTheoryMatch(
    input: AnalysisInput,
    aiResponse: AIResponse
  ): number {
    let score = 0.6; // 基础分

    // 理论依据数量
    if (input.theoreticalBasis.length > 0) {
      score += Math.min(0.3, input.theoreticalBasis.length * 0.1);
    }

    // 领域专业度
    if (input.domain === 'fengshui' || input.domain === 'bazi') {
      score += 0.1;
    }

    // AI响应质量指标
    if (aiResponse.usage && aiResponse.usage.totalTokens > 0) {
      // 基于token使用情况评估响应质量
      const tokenRatio =
        aiResponse.usage.completionTokens / aiResponse.usage.totalTokens;
      if (tokenRatio > 0.6 && tokenRatio < 0.9) {
        score += 0.1; // 适当的输出长度
      }
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * 评估复杂度处理能力
   */
  private evaluateComplexity(input: AnalysisInput): number {
    let score = 0.8; // 基础分较高，因为简单问题通常处理良好

    switch (input.complexity) {
      case 'simple':
        score = 0.9; // 简单问题高置信度
        break;
      case 'medium':
        score = 0.7; // 中等复杂度适中置信度
        break;
      case 'complex':
        score = 0.5; // 复杂问题降低置信度
        break;
    }

    return score;
  }

  /**
   * 评估文化相关性
   */
  private evaluateCulturalRelevance(input: AnalysisInput): number {
    let score = 0.5; // 基础分

    // 文化术语使用情况
    if (input.culturalTermsCount > 0) {
      score += Math.min(0.3, input.culturalTermsCount * 0.05);
    }

    // 领域专业性
    if (input.domain === 'fengshui' || input.domain === 'bazi') {
      score += 0.2;
    }

    // 内容长度适宜性（传统文化需要详细解释）
    if (input.content.length > 200) {
      score += 0.1;
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * 生成置信度说明文本
   */
  private generateReasoningText(
    overall: number,
    factors: ConfidenceScore['factors']
  ): string {
    const level = overall >= 0.8 ? '高' : overall >= 0.6 ? '中' : '低';

    let reasoning = `分析置信度: ${level}等级 (${Math.round(overall * 100)}%)`;

    // 分析各个因素
    const factorAnalysis: string[] = [];

    if (factors.dataQuality >= 0.8) {
      factorAnalysis.push('数据质量优秀');
    } else if (factors.dataQuality <= 0.4) {
      factorAnalysis.push('数据质量有待提升');
    }

    if (factors.theoryMatch >= 0.8) {
      factorAnalysis.push('理论依据充分');
    } else if (factors.theoryMatch <= 0.4) {
      factorAnalysis.push('理论支撑较弱');
    }

    if (factors.complexity >= 0.8) {
      factorAnalysis.push('复杂度处理良好');
    } else if (factors.complexity <= 0.4) {
      factorAnalysis.push('复杂度较高，结果需谨慎参考');
    }

    if (factors.culturalRelevance >= 0.8) {
      factorAnalysis.push('文化准确性高');
    } else if (factors.culturalRelevance <= 0.4) {
      factorAnalysis.push('文化专业性需要加强');
    }

    if (factorAnalysis.length > 0) {
      reasoning += `。主要特点: ${factorAnalysis.join(', ')}`;
    }

    // 添加使用建议
    if (overall >= 0.8) {
      reasoning += '。建议: 可以信赖此分析结果';
    } else if (overall >= 0.6) {
      reasoning += '。建议: 结果具有参考价值，建议结合其他信息';
    } else {
      reasoning += '。建议: 结果仅供初步参考，建议寻求专业咨询';
    }

    return reasoning;
  }

  /**
   * 为风水分析评估置信度
   */
  evaluateFengShuiAnalysis(
    flyingStarData: any,
    houseData: any,
    aiResponse: AIResponse
  ): ConfidenceScore {
    const culturalTermsCount = this.countCulturalTerms(
      aiResponse.choices[0]?.message?.content || ''
    );

    const input: AnalysisInput = {
      content: aiResponse.choices[0]?.message?.content || '',
      dataSource: flyingStarData ? 'calculated' : 'user_input',
      domain: 'fengshui',
      complexity: this.assessFengShuiComplexity(flyingStarData, houseData),
      hasStructuredData: !!flyingStarData,
      culturalTermsCount,
      theoreticalBasis: this.extractFengShuiTheory(flyingStarData),
    };

    return this.evaluateConfidence(input, aiResponse);
  }

  /**
   * 为八字分析评估置信度
   */
  evaluateBaziAnalysis(baziData: any, aiResponse: AIResponse): ConfidenceScore {
    const culturalTermsCount = this.countCulturalTerms(
      aiResponse.choices[0]?.message?.content || ''
    );

    const input: AnalysisInput = {
      content: aiResponse.choices[0]?.message?.content || '',
      dataSource: baziData?.pillars ? 'calculated' : 'user_input',
      domain: 'bazi',
      complexity: this.assessBaziComplexity(baziData),
      hasStructuredData: !!baziData?.pillars,
      culturalTermsCount,
      theoreticalBasis: this.extractBaziTheory(baziData),
    };

    return this.evaluateConfidence(input, aiResponse);
  }

  /**
   * 计算文本中的文化术语数量
   */
  private countCulturalTerms(text: string): number {
    const culturalTerms = [
      '五行',
      '阴阳',
      '八卦',
      '九宫',
      '飞星',
      '山星',
      '向星',
      '天干',
      '地支',
      '用神',
      '忌神',
      '旺衰',
      '格局',
      '元运',
      '三元',
      '洛书',
      '河图',
      '太极',
      '两仪',
    ];

    return culturalTerms.filter((term) => text.includes(term)).length;
  }

  /**
   * 评估风水分析复杂度
   */
  private assessFengShuiComplexity(
    flyingStarData: any,
    houseData: any
  ): 'simple' | 'medium' | 'complex' {
    let complexityScore = 0;

    if (flyingStarData?.geju?.types?.length > 1) complexityScore += 2;
    if (houseData?.rooms?.length > 5) complexityScore += 1;
    if (flyingStarData?.meta?.ambiguous) complexityScore += 1;

    if (complexityScore >= 3) return 'complex';
    if (complexityScore >= 1) return 'medium';
    return 'simple';
  }

  /**
   * 评估八字分析复杂度
   */
  private assessBaziComplexity(baziData: any): 'simple' | 'medium' | 'complex' {
    let complexityScore = 0;

    if (baziData?.yongshen?.favorable?.length > 1) complexityScore += 1;
    if (baziData?.elements && Object.keys(baziData.elements).length === 5)
      complexityScore += 1;
    if (baziData?.specialPattern) complexityScore += 2;

    if (complexityScore >= 3) return 'complex';
    if (complexityScore >= 1) return 'medium';
    return 'simple';
  }

  /**
   * 提取风水理论依据
   */
  private extractFengShuiTheory(data: any): string[] {
    const theories: string[] = [];

    if (data?.period) theories.push('三元九运');
    if (data?.plates) theories.push('玄空飞星');
    if (data?.geju) theories.push('格局理论');
    if (data?.evaluation) theories.push('吉凶评定');

    return theories;
  }

  /**
   * 提取八字理论依据
   */
  private extractBaziTheory(data: any): string[] {
    const theories: string[] = [];

    if (data?.pillars) theories.push('四柱八字');
    if (data?.elements) theories.push('五行理论');
    if (data?.yongshen) theories.push('用神体系');
    if (data?.dayMaster) theories.push('日主旺衰');

    return theories;
  }
}

/**
 * 置信度阈值配置
 */
export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,
  MEDIUM: 0.6,
  LOW: 0.4,
} as const;

/**
 * 置信度等级枚举
 */
export enum ConfidenceLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  VERY_LOW = 'very_low',
}

/**
 * 根据置信度分数获取等级
 */
export function getConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= CONFIDENCE_THRESHOLDS.HIGH) return ConfidenceLevel.HIGH;
  if (score >= CONFIDENCE_THRESHOLDS.MEDIUM) return ConfidenceLevel.MEDIUM;
  if (score >= CONFIDENCE_THRESHOLDS.LOW) return ConfidenceLevel.LOW;
  return ConfidenceLevel.VERY_LOW;
}

/**
 * 生成置信度警告
 */
export function generateConfidenceWarning(
  score: ConfidenceScore
): string | null {
  if (score.overall < CONFIDENCE_THRESHOLDS.LOW) {
    return '⚠️ 此分析结果置信度较低，建议仅作参考或寻求专业咨询';
  }

  if (score.factors.dataQuality < 0.4) {
    return '⚠️ 输入数据可能不够准确，建议核实相关信息';
  }

  if (score.factors.culturalRelevance < 0.4) {
    return '⚠️ 传统文化专业性有待提升，建议参考专业资料';
  }

  return null;
}

/**
 * 全局置信度评估器实例
 */
export const confidenceEvaluator = new ConfidenceEvaluator();
