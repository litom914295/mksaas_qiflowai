/**
 * QiFlow 算法优先·八字风水大师
 *
 * 专精于子平八字的专业顾问，严格遵循"算法优先"原则
 * 先调用应用内置的八字计算引擎获取权威四柱与运势数据
 * 再基于结果进行系统化、可溯源的专业解读与建议
 */

import {
  type EnhancedBaziResult,
  type EnhancedBirthData,
  computeBaziSmart,
} from '@/lib/bazi';
import {
  detectAnalysisRequest,
  extractAnalysisParams,
} from './analysis-detection';

export interface BaziMasterConfig {
  language: 'zh-CN' | 'zh-TW' | 'en';
  responseStyle: 'professional' | 'conversational' | 'educational';
  explanationLevel: 'basic' | 'detailed' | 'expert';
  includeMetadata: boolean;
  enableTraceability: boolean;
}

export interface BaziAnalysisContext {
  sessionId: string;
  userId: string;
  userInput: string;
  extractedParams: any;
  analysisId?: string;
  timestamp: string;
  traceId?: string;
}

export interface BaziMasterResponse {
  content: string;
  analysisResult?: EnhancedBaziResult;
  metadata: {
    analysisId?: string;
    algorithmVersion?: string;
    calendarUsed?: string;
    timezoneUsed?: string;
    confidence: number;
    traceability: {
      inputConfirmed: boolean;
      algorithmCalled: boolean;
      resultValidated: boolean;
      uncertainties: string[];
    };
  };
  suggestions: string[];
  followUpQuestions: string[];
  needsClarification: boolean;
  clarificationQuestions?: string[];
}

export class QiFlowBaziMaster {
  private config: BaziMasterConfig;

  constructor(config: Partial<BaziMasterConfig> = {}) {
    this.config = {
      language: 'zh-CN',
      responseStyle: 'professional',
      explanationLevel: 'detailed',
      includeMetadata: true,
      enableTraceability: true,
      ...config,
    };
  }

  /**
   * 处理用户消息 - 核心入口点
   */
  async processUserMessage(
    message: string,
    context: BaziAnalysisContext
  ): Promise<BaziMasterResponse> {
    console.log('[QiFlowBaziMaster] 开始处理用户消息:', {
      sessionId: context.sessionId,
      messagePreview: message.substring(0, 100),
      timestamp: context.timestamp,
    });

    // 步骤1: 识别与收集
    const detectionResult = detectAnalysisRequest(message);

    if (!detectionResult.isAnalysisRequest) {
      return this.handleNonAnalysisRequest(message, context);
    }

    console.log('[QiFlowBaziMaster] 检测到分析请求:', {
      analysisType: detectionResult.analysisType,
      confidence: detectionResult.confidence,
      isIncomplete: detectionResult.isIncomplete,
    });

    // 检查信息完整性
    if (detectionResult.isIncomplete && detectionResult.missingInfo) {
      return this.requestClarification(detectionResult.missingInfo, context);
    }

    // 提取并标准化参数
    const extractedParams = extractAnalysisParams(message);
    const standardizedInput = this.standardizeInput(extractedParams, context);

    // 步骤2: 算法调用与结果校验
    try {
      const analysisResult = await this.callAlgorithmFirst(
        standardizedInput,
        context
      );

      if (!analysisResult) {
        return this.handleAlgorithmFailure(context);
      }

      // 步骤3: 呈现与专业解读
      return await this.generateProfessionalResponse(
        analysisResult,
        standardizedInput,
        context
      );
    } catch (error) {
      console.error('[QiFlowBaziMaster] 算法调用失败:', error);
      return this.handleAlgorithmFailure(context, error);
    }
  }

  /**
   * 标准化输入参数
   */
  private standardizeInput(
    extractedParams: any,
    context: BaziAnalysisContext
  ): EnhancedBirthData {
    const { birthDate, gender, location } = extractedParams;

    // 构造标准化的出生数据
    let datetime = '';
    if (birthDate) {
      const year = birthDate.year || new Date().getFullYear() - 30; // 默认30岁
      const month = birthDate.month || 1;
      const day = birthDate.day || 1;
      const hour = birthDate.hour || 12;
      const minute = birthDate.minute || 0;

      datetime = `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
    } else {
      // 如果没有提供日期，使用默认值并标记需要澄清
      const defaultDate = new Date();
      defaultDate.setFullYear(defaultDate.getFullYear() - 30);
      datetime = defaultDate.toISOString().substring(0, 19);
    }

    return {
      datetime,
      gender: gender || 'male', // 默认男性，但会在响应中标注不确定性
      timezone: 'Asia/Shanghai', // 默认中国时区
      isTimeKnown: !!birthDate?.hour,
      preferredLocale: this.config.language,
    };
  }

  /**
   * 调用算法优先服务
   */
  private async callAlgorithmFirst(
    birthData: EnhancedBirthData,
    context: BaziAnalysisContext
  ): Promise<EnhancedBaziResult | null> {
    console.log('[QiFlowBaziMaster] 调用算法优先服务 - computeBaziSmart');

    // 直接调用 computeBaziSmart 获取权威四柱数据
    const result = await computeBaziSmart(birthData);

    if (result) {
      console.log('[QiFlowBaziMaster] 算法计算成功:', {
        hasPillars: !!result.pillars,
        hasYongshen: !!(result as any).yongshen,
        hasLuckPillars: !!result.luckPillars,
      });
    }

    return result;
  }

  /**
   * 生成专业解读响应
   */
  private async generateProfessionalResponse(
    analysisResult: EnhancedBaziResult,
    inputData: EnhancedBirthData,
    context: BaziAnalysisContext
  ): Promise<BaziMasterResponse> {
    const uncertainties: string[] = [];

    // 检查输入假设和不确定性
    if (!context.extractedParams?.birthDate?.hour) {
      uncertainties.push('出生时辰未明确，使用默认中午12点计算');
    }
    if (!context.extractedParams?.gender) {
      uncertainties.push('性别未明确，按男性计算大运方向');
    }
    if (!context.extractedParams?.location) {
      uncertainties.push('出生地未明确，使用北京时区计算');
    }

    // 构建专业解读内容
    const content = this.buildProfessionalAnalysis(
      analysisResult,
      inputData,
      uncertainties
    );

    // 生成建议和后续问题
    const suggestions = this.generateSuggestions(analysisResult);
    const followUpQuestions = this.generateFollowUpQuestions(
      analysisResult,
      uncertainties
    );

    return {
      content,
      analysisResult,
      metadata: {
        analysisId: `bazi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        algorithmVersion: 'enhanced-v2.0',
        calendarUsed: '公历转农历',
        timezoneUsed: inputData.timezone || 'Asia/Shanghai',
        confidence: this.calculateConfidence(analysisResult, uncertainties),
        traceability: {
          inputConfirmed: uncertainties.length === 0,
          algorithmCalled: true,
          resultValidated: true,
          uncertainties,
        },
      },
      suggestions,
      followUpQuestions,
      needsClarification: uncertainties.length > 0,
      clarificationQuestions:
        uncertainties.length > 0
          ? [
              '请确认您的准确出生时间（年月日时分）',
              '请确认您的性别（男/女）',
              '请确认您的出生地点（用于时区校正）',
            ]
          : undefined,
    };
  }

  /**
   * 构建专业分析内容
   */
  private buildProfessionalAnalysis(
    result: EnhancedBaziResult,
    inputData: EnhancedBirthData,
    uncertainties: string[]
  ): string {
    const sections: string[] = [];

    // 输入确认部分
    sections.push('## 📋 输入信息确认');
    sections.push(`**计算时间**: ${inputData.datetime}`);
    sections.push(`**使用时区**: ${inputData.timezone}`);
    sections.push('**历法**: 公历转农历计算');

    if (uncertainties.length > 0) {
      sections.push(`**⚠️ 不确定性提示**: ${uncertainties.join('；')}`);
    }

    // 四柱结果部分
    if (result.pillars) {
      sections.push('\n## 🏛️ 四柱八字');
      sections.push('```');
      sections.push(
        `年柱: ${result.pillars.year.stem}${result.pillars.year.branch}`
      );
      sections.push(
        `月柱: ${result.pillars.month.stem}${result.pillars.month.branch}`
      );
      sections.push(
        `日柱: ${result.pillars.day.stem}${result.pillars.day.branch} ← 日主`
      );
      sections.push(
        `时柱: ${result.pillars.hour.stem}${result.pillars.hour.branch}`
      );
      sections.push('```');
    }

    // 关键结论部分
    sections.push('\n## 🎯 关键结论');

    if (result.dayMasterStrength) {
      sections.push(
        `**日主强弱**: ${this.translateStrength(result.dayMasterStrength.strength)}`
      );
      if (result.dayMasterStrength.factors.length > 0) {
        sections.push(
          `**判断依据**: ${result.dayMasterStrength.factors.join('；')}`
        );
      }
    }

    // 用神喜忌部分
    if (result.favorableElements || (result as any).yongshen) {
      sections.push('\n## ⚖️ 用神喜忌');
      const yongshen = result.favorableElements || (result as any).yongshen;

      if (yongshen.primary || yongshen.favorable) {
        const favorable = yongshen.primary || yongshen.favorable;
        sections.push(
          `**喜用神**: ${Array.isArray(favorable) ? favorable.join('、') : favorable}`
        );
      }

      if (yongshen.unfavorable) {
        sections.push(
          `**忌神**: ${Array.isArray(yongshen.unfavorable) ? yongshen.unfavorable.join('、') : yongshen.unfavorable}`
        );
      }

      if (yongshen.explanation || yongshen.commentary) {
        sections.push(
          `**用神理由**: ${yongshen.explanation || yongshen.commentary}`
        );
      }
    }

    // 详细解读部分
    sections.push('\n## 📖 详细解读');

    if (result.tenGodsAnalysis) {
      sections.push(
        '**十神分析**: ' +
          (result.tenGodsAnalysis.recommendations?.join('；') || '十神配置合理')
      );
    }

    // 运势展望部分
    if (result.luckPillars && result.luckPillars.length > 0) {
      sections.push('\n## 🔮 运势展望');
      const currentLuck = result.luckPillars[0];
      if (currentLuck) {
        sections.push(
          `**当前大运**: ${currentLuck.heavenlyStem}${currentLuck.earthlyBranch} (${currentLuck.startAge}-${currentLuck.endAge}岁)`
        );
        sections.push(
          `**运势特点**: ${this.translateStrength(currentLuck.strength)}`
        );
      }
    }

    // 建议与注意部分
    sections.push('\n## 💡 专业建议');
    if (result.dayMasterStrength?.recommendations) {
      result.dayMasterStrength.recommendations.forEach((rec) => {
        sections.push(`• ${rec}`);
      });
    } else {
      sections.push('• 根据用神喜忌调整生活和工作方向');
      sections.push('• 注意大运流年的变化影响');
      sections.push('• 保持心态平和，顺应自然规律');
    }

    // 复核提示部分
    sections.push('\n## 🔍 复核提示');
    sections.push('请核对以下信息的准确性，如有偏差可重新计算：');
    sections.push('• 出生年月日时是否准确（公历/农历）');
    sections.push('• 出生地点和时区是否正确');
    sections.push('• 是否考虑夏令时影响');

    return sections.join('\n');
  }

  /**
   * 翻译强弱程度
   */
  private translateStrength(strength: string): string {
    const translations: Record<string, string> = {
      strong: '偏强',
      weak: '偏弱',
      balanced: '中和',
    };
    return translations[strength] || strength;
  }

  /**
   * 生成建议
   */
  private generateSuggestions(result: EnhancedBaziResult): string[] {
    const suggestions: string[] = [];

    if (result.favorableElements?.primary) {
      suggestions.push(
        `多接触${result.favorableElements.primary.join('、')}属性的事物`
      );
    }

    if (result.dayMasterStrength?.strength === 'weak') {
      suggestions.push('适合团队合作，借助他人力量');
      suggestions.push('注意身体健康，避免过度劳累');
    } else if (result.dayMasterStrength?.strength === 'strong') {
      suggestions.push('可以独当一面，发挥领导才能');
      suggestions.push('注意控制脾气，避免过于强势');
    }

    suggestions.push('定期关注大运流年变化');
    suggestions.push('保持学习和自我提升');

    return suggestions;
  }

  /**
   * 生成后续问题
   */
  private generateFollowUpQuestions(
    result: EnhancedBaziResult,
    uncertainties: string[]
  ): string[] {
    const questions: string[] = [];

    if (uncertainties.length > 0) {
      questions.push('您能提供更准确的出生时间信息吗？');
    }

    questions.push('您最关心哪个方面的运势？（事业/财运/感情/健康）');
    questions.push('您想了解近期的流年运势吗？');
    questions.push('需要针对具体问题进行深入分析吗？');

    return questions;
  }

  /**
   * 计算置信度
   */
  private calculateConfidence(
    result: EnhancedBaziResult,
    uncertainties: string[]
  ): number {
    let confidence = 0.8; // 基础置信度

    // 根据不确定性调整
    confidence -= uncertainties.length * 0.1;

    // 根据结果完整性调整
    if (result.pillars) confidence += 0.1;
    if (result.favorableElements || (result as any).yongshen) confidence += 0.1;
    if (result.luckPillars) confidence += 0.05;

    return Math.max(0.3, Math.min(1.0, confidence));
  }

  /**
   * 处理非分析请求
   */
  private async handleNonAnalysisRequest(
    message: string,
    context: BaziAnalysisContext
  ): Promise<BaziMasterResponse> {
    let content = '';

    if (message.includes('你好') || message.includes('您好')) {
      content = `您好！我是QiFlow算法优先·八字风水大师，专精于子平八字的专业解读。

我严格遵循"算法优先"原则，会先调用内置的八字计算引擎获取权威四柱数据，再基于结果进行系统化、可溯源的专业分析。

请提供您的出生信息（年月日时、性别、出生地），我将为您进行专业的八字分析。

例如："请帮我分析八字：1990年3月15日下午3点，男性，出生在北京"`;
    } else if (
      message.includes('什么是八字') ||
      message.includes('八字是什么')
    ) {
      content = `八字，又称四柱，是中国传统命理学的核心体系。

**基本概念**：
• 四柱：年柱、月柱、日柱、时柱
• 每柱由天干地支组成，共八个字
• 日柱天干为"日主"，代表命主本人

**分析要素**：
• 五行强弱：金木水火土的旺衰分析
• 十神关系：以日主为中心的六亲关系
• 用神喜忌：调候、通关、扶抑的核心
• 大运流年：时间维度的运势变化

如需具体分析，请提供您的出生信息。`;
    } else {
      content = `我专注于八字命理分析。如需分析，请提供：

**必需信息**：
• 出生年月日时（具体到时分）
• 性别（影响大运起运方向）
• 出生地点（用于时区校正）

**示例格式**：
"请分析八字：1985年7月20日上午10点30分，女性，出生在上海"

我将基于算法计算的权威四柱数据，为您提供专业、可溯源的命理解读。`;
    }

    return {
      content,
      metadata: {
        confidence: 0.9,
        traceability: {
          inputConfirmed: true,
          algorithmCalled: false,
          resultValidated: true,
          uncertainties: [],
        },
      },
      suggestions: [
        '提供完整的出生信息进行八字分析',
        '了解八字基础知识',
        '咨询具体的人生问题',
      ],
      followUpQuestions: [
        '您想了解八字的基本原理吗？',
        '您有具体的出生信息需要分析吗？',
        '您最关心哪方面的运势？',
      ],
      needsClarification: false,
    };
  }

  /**
   * 请求澄清信息
   */
  private requestClarification(
    missingInfo: string[],
    context: BaziAnalysisContext
  ): BaziMasterResponse {
    const content = `请补充以下信息以进行专业的八字分析：

${missingInfo.map((info) => `• ${info}`).join('\n')}

**完整示例**：
"请帮我分析八字：1990年3月15日下午3点，男性，出生在北京"

**重要说明**：
• 出生时间需精确到时分（影响时柱）
• 性别影响大运起运方向
• 出生地用于时区和节气校正

提供完整信息后，我将调用专业算法引擎为您计算权威四柱，并进行系统化解读。`;

    return {
      content,
      metadata: {
        confidence: 0.7,
        traceability: {
          inputConfirmed: false,
          algorithmCalled: false,
          resultValidated: false,
          uncertainties: missingInfo,
        },
      },
      suggestions: [
        '提供准确的出生年月日时',
        '说明性别（男/女）',
        '提供出生地点信息',
      ],
      followUpQuestions: [
        '您能提供完整的出生信息吗？',
        '您记得准确的出生时间吗？',
        '需要我解释为什么需要这些信息吗？',
      ],
      needsClarification: true,
      clarificationQuestions: missingInfo.map((info) => `请提供${info}`),
    };
  }

  /**
   * 处理算法失败
   */
  private handleAlgorithmFailure(
    context: BaziAnalysisContext,
    error?: any
  ): BaziMasterResponse {
    const content = `很抱歉，八字计算引擎暂时遇到技术问题。

**可能原因**：
• 输入的日期格式不正确
• 系统暂时维护中
• 网络连接问题

**建议操作**：
1. 检查出生信息格式是否正确
2. 稍后重试分析请求
3. 联系技术支持

**正确格式示例**：
"请分析八字：1990年3月15日下午3点，男性，出生在北京"

我严格遵循"算法优先"原则，必须获得计算引擎的权威结果才能进行专业解读，不会提供臆测的四柱信息。`;

    return {
      content,
      metadata: {
        confidence: 0.3,
        traceability: {
          inputConfirmed: true,
          algorithmCalled: false,
          resultValidated: false,
          uncertainties: ['算法引擎调用失败'],
        },
      },
      suggestions: ['检查输入信息格式', '稍后重试', '联系技术支持'],
      followUpQuestions: [
        '您能重新确认出生信息吗？',
        '需要我解释正确的输入格式吗？',
        '要不要稍后再试？',
      ],
      needsClarification: true,
      clarificationQuestions: ['请确认出生信息格式是否正确'],
    };
  }
}

// 创建全局实例
export const qiflowBaziMaster = new QiFlowBaziMaster({
  language: 'zh-CN',
  responseStyle: 'professional',
  explanationLevel: 'detailed',
  includeMetadata: true,
  enableTraceability: true,
});
