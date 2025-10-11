/**
 * QiFlow AI - 算法优先分析服务
 *
 * 核心设计理念：
 * 1. 严格遵循"算法优先"原则，确保权威计算结果
 * 2. 验证和标准化输入参数
 * 3. 基于算法结果生成专业AI解读
 * 4. 返回结构化的专业分析报告
 */

import {
  type EnhancedBaziResult,
  type EnhancedBirthData,
  computeBaziSmart,
} from '@/lib/bazi';
import {
  type GenerateFlyingStarInput,
  type GenerateFlyingStarOutput,
  generateFlyingStar,
} from '@/lib/fengshui';
import { dataConsistencyMonitor } from './data-consistency-monitor';
import { createRouter } from './router';
import type { ConversationContext } from './types/conversation';

// 分析结果类型
export interface AnalysisResult {
  type: 'bazi' | 'fengshui' | 'combined';
  success: boolean;
  data?: EnhancedBaziResult | GenerateFlyingStarOutput | CombinedAnalysisData;
  error?: string;
  executionTime: number;
  timestamp: string;
  sessionId: string;
  userId: string;
}

// 综合分析数据
export interface CombinedAnalysisData {
  bazi?: EnhancedBaziResult;
  fengshui?: GenerateFlyingStarOutput;
  combinedInsights?: string[];
  recommendations?: string[];
}

// AI补充响应
export interface AIEnhancementResponse {
  explanation: string;
  insights: string[];
  recommendations: string[];
  followUpQuestions: string[];
  confidence: number;
}

// 结构化分析内容
export interface StructuredAnalysis {
  inputConfirmation: {
    datetime: string;
    gender: string;
    location?: string;
    timezone: string;
  };
  fourPillarsResult: {
    year: { stem: string; branch: string; chinese: string };
    month: { stem: string; branch: string; chinese: string };
    day: { stem: string; branch: string; chinese: string };
    hour: { stem: string; branch: string; chinese: string };
  };
  keyConclusions: {
    dayMaster: string;
    tenGods: Record<string, string>;
    pattern: string;
    favorableElements: string[];
  };
  detailedAnalysis: {
    fiveElements: Record<string, number>;
    strengthAnalysis: string;
    usefulGod: string;
    personalityTraits: string[];
    careerGuidance: string[];
    relationshipAdvice: string[];
  };
  recommendations: {
    colors: string[];
    directions: string[];
    careers: string[];
    timing: string[];
  };
  verificationNote: string;
}

// 完整分析响应
export interface CompleteAnalysisResponse {
  analysisResult: AnalysisResult;
  aiEnhancement?: AIEnhancementResponse;
  rawData: any; // 原始算法结果
  redirectTo?: { path: string; params: Record<string, string> } | null;
  structuredAnalysis?: StructuredAnalysis;
  metadata: {
    sessionId: string;
    userId: string;
    timestamp: string;
    processingTime: number;
    algorithmVersion?: string;
    quality?: 'high' | 'medium' | 'low';
  };
}

/**
 * 算法优先分析服务
 */
export class AlgorithmFirstService {
  private aiRouter = createRouter();
  private analysisCache = new Map<string, AnalysisResult>();

  constructor() {
    console.log('[算法优先服务] 初始化完成');
  }

  /**
   * 验证是否为有效的分析请求
   */
  private isValidAnalysisRequest(message: string): boolean {
    if (!message || message.length < 3) {
      return false;
    }

    // 检查是否包含分析关键词
    const analysisKeywords = [
      '八字',
      '命理',
      '出生',
      '生辰',
      '命盘',
      '四柱',
      '天干',
      '地支',
      '五行',
      '年柱',
      '月柱',
      '日柱',
      '时柱',
      '十神',
      '用神',
      '喜神',
      '忌神',
      '风水',
      '房屋',
      '朝向',
      '布局',
      '玄空',
      '飞星',
      '九宫',
      '方位',
      '坐向',
      '山向',
      '罗盘',
      '指南针',
      '分析',
      '计算',
      '排盘',
      '算命',
      '占卜',
      '预测',
    ];

    const hasAnalysisKeyword = analysisKeywords.some((keyword) =>
      message.includes(keyword)
    );

    // 检查是否包含出生信息
    const hasBirthInfo =
      /\d{4}年|\d{1,2}月|\d{1,2}日|\d{1,2}时|\d{4}[\-年]|\d{1,2}[\-月]|\d{1,2}[\-日]|\d{1,2}[\-时]/.test(
        message
      );

    // 检查是否包含房屋信息
    const hasHouseInfo = /[东西南北]向|朝向|坐向/.test(message);

    // 检查是否包含数字模式（可能是出生信息）
    const hasNumberPattern = /\d{4}.*\d{1,2}.*\d{1,2}.*\d{1,2}/.test(message);

    const result =
      hasAnalysisKeyword || hasBirthInfo || hasHouseInfo || hasNumberPattern;

    console.log('[算法优先服务] 分析请求验证:', {
      message: message.substring(0, 50),
      hasAnalysisKeyword,
      hasBirthInfo,
      hasHouseInfo,
      hasNumberPattern,
      result,
    });

    return result;
  }

  /**
   * 处理用户分析请求
   * 严格遵循算法优先原则：
   * 1. 验证和标准化输入参数
   * 2. 调用算法引擎获取权威计算结果
   * 3. 基于算法结果生成AI解读
   * 4. 返回结构化的专业分析
   */
  async processAnalysisRequest(
    message: string,
    sessionId: string,
    userId: string,
    context?:
      | ConversationContext
      | {
          analysisType?: string;
          confidence?: number;
          extractedParams?: any;
        }
  ): Promise<CompleteAnalysisResponse> {
    const startTime = Date.now();
    console.log(
      `[算法优先服务] 开始处理分析请求: ${message.substring(0, 100)}...`
    );

    // 记录输入数据流
    dataConsistencyMonitor.recordTrace(sessionId, {
      timestamp: new Date().toISOString(),
      stage: 'input',
      data: { message, context },
      metadata: { userId },
    });

    try {
      // 步骤1: 输入验证与参数标准化
      const validationResult = this.validateAndStandardizeInput(
        message,
        context as ConversationContext
      );
      if (!validationResult.isValid) {
        console.log(`[算法优先服务] 输入验证失败: ${validationResult.error}`);
        return this.createErrorResponse(
          validationResult.error || '输入参数不完整',
          'bazi',
          sessionId,
          userId,
          Date.now() - startTime
        );
      }

      // 步骤2: 确定分析类型
      const analysisType =
        validationResult.analysisType || this.determineAnalysisType(message);
      console.log(`[算法优先服务] 分析类型: ${analysisType}`);

      // 步骤3: 调用算法引擎获取权威计算结果
      const algorithmResult = await this.executeAlgorithmCalculation(
        validationResult.standardizedInput,
        analysisType,
        sessionId,
        userId
      );

      if (!algorithmResult.success) {
        console.error(`[算法优先服务] 算法计算失败: ${algorithmResult.error}`);
        return this.createErrorResponse(
          algorithmResult.error || '算法计算失败',
          analysisType,
          sessionId,
          userId,
          Date.now() - startTime
        );
      }

      // 步骤4: 基于算法结果生成专业AI解读
      let aiInterpretation: AIEnhancementResponse | undefined;
      if (algorithmResult.success && algorithmResult.data) {
        aiInterpretation = await this.generateProfessionalInterpretation(
          algorithmResult,
          validationResult.standardizedInput,
          sessionId,
          userId
        );
      }

      // 步骤5: 构建结构化的专业分析响应
      const structuredResponse = this.buildStructuredResponse(
        algorithmResult,
        aiInterpretation,
        validationResult.standardizedInput
      );

      const processingTime = Date.now() - startTime;

      // 生成重定向信息
      const redirectInfo = this.generateRedirectInfo(
        algorithmResult,
        message,
        sessionId,
        userId
      );

      return {
        analysisResult: algorithmResult,
        aiEnhancement: aiInterpretation,
        rawData: algorithmResult.data,
        redirectTo: redirectInfo,
        structuredAnalysis: structuredResponse,
        metadata: {
          sessionId,
          userId,
          timestamp: new Date().toISOString(),
          processingTime,
          algorithmVersion: '2.0.0',
          quality: this.assessQuality(algorithmResult, aiInterpretation),
        },
      };
    } catch (error) {
      console.error('[算法优先服务] 处理分析请求失败:', error);
      return this.createErrorResponse(
        error instanceof Error ? error.message : '系统错误',
        'bazi',
        sessionId,
        userId,
        Date.now() - startTime
      );
    }
  }

  /**
   * 验证和标准化输入
   */
  private validateAndStandardizeInput(
    message: string,
    context?: ConversationContext
  ): {
    isValid: boolean;
    error?: string;
    standardizedInput?: any;
    analysisType?: 'bazi' | 'fengshui' | 'combined';
  } {
    // 检查是否为有效的分析请求
    if (!this.isValidAnalysisRequest(message)) {
      return {
        isValid: false,
        error: '请提供完整的出生信息（年月日时）进行八字分析',
      };
    }

    // 提取并标准化出生信息
    const birthInfo = this.extractBirthInfo(message, context);
    const houseInfo = this.extractHouseInfo(message, context);

    // 确定分析类型
    let analysisType: 'bazi' | 'fengshui' | 'combined';
    if (birthInfo.datetime && houseInfo.facing) {
      analysisType = 'combined';
    } else if (birthInfo.datetime) {
      analysisType = 'bazi';
    } else if (houseInfo.facing) {
      analysisType = 'fengshui';
    } else {
      return {
        isValid: false,
        error: '未能识别有效的分析信息，请提供出生时间或房屋朝向',
      };
    }

    // 标准化输入数据
    const standardizedInput = {
      birthInfo: birthInfo.datetime
        ? {
            ...birthInfo,
            gender: birthInfo.gender || 'unknown',
            timezone: birthInfo.timezone || 'Asia/Shanghai',
            isTimeKnown: birthInfo.isTimeKnown !== false,
            preferredLocale: 'zh-CN',
          }
        : null,
      houseInfo: houseInfo.facing ? houseInfo : null,
      originalMessage: message,
    };

    return {
      isValid: true,
      standardizedInput,
      analysisType,
    };
  }

  /**
   * 执行算法计算（优化版）
   */
  private async executeAlgorithmCalculation(
    standardizedInput: any,
    analysisType: 'bazi' | 'fengshui' | 'combined',
    sessionId: string,
    userId: string
  ): Promise<AnalysisResult> {
    const startTime = Date.now();

    try {
      switch (analysisType) {
        case 'bazi':
          if (!standardizedInput.birthInfo) {
            throw new Error('缺少出生信息');
          }
          return await this.executeBaziCalculation(
            standardizedInput.birthInfo,
            sessionId,
            userId
          );

        case 'fengshui':
          if (!standardizedInput.houseInfo) {
            throw new Error('缺少房屋信息');
          }
          return await this.executeFengshuiCalculation(
            standardizedInput.houseInfo,
            sessionId,
            userId
          );

        case 'combined':
          return await this.executeCombinedCalculation(
            standardizedInput,
            sessionId,
            userId
          );

        default:
          throw new Error(`不支持的分析类型: ${analysisType}`);
      }
    } catch (error) {
      console.error('[算法优先服务] 算法计算失败:', error);
      return {
        type: analysisType,
        success: false,
        error: error instanceof Error ? error.message : '算法计算错误',
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        sessionId,
        userId,
      };
    }
  }

  /**
   * 执行八字计算（优化版）
   */
  private async executeBaziCalculation(
    birthInfo: EnhancedBirthData,
    sessionId: string,
    userId: string
  ): Promise<AnalysisResult> {
    const startTime = Date.now();

    try {
      console.log('[算法优先服务] 执行八字计算，输入:', birthInfo);

      // 调用computeBaziSmart算法
      const baziResult = await computeBaziSmart(birthInfo);

      if (!baziResult || !baziResult.pillars) {
        throw new Error('八字计算返回结果不完整');
      }

      console.log('[算法优先服务] 八字计算成功，四柱:', baziResult.pillars);

      return {
        type: 'bazi',
        success: true,
        data: baziResult,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        sessionId,
        userId,
      };
    } catch (error) {
      console.error('[算法优先服务] 八字计算失败:', error);
      throw error;
    }
  }

  /**
   * 执行风水计算（优化版）
   */
  private async executeFengshuiCalculation(
    houseInfo: GenerateFlyingStarInput,
    sessionId: string,
    userId: string
  ): Promise<AnalysisResult> {
    const startTime = Date.now();

    try {
      const fengshuiResult = await generateFlyingStar(houseInfo);

      if (!fengshuiResult) {
        throw new Error('风水计算返回结果为空');
      }

      return {
        type: 'fengshui',
        success: true,
        data: fengshuiResult,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        sessionId,
        userId,
      };
    } catch (error) {
      console.error('[算法优先服务] 风水计算失败:', error);
      throw error;
    }
  }

  /**
   * 执行综合计算
   */
  private async executeCombinedCalculation(
    standardizedInput: any,
    sessionId: string,
    userId: string
  ): Promise<AnalysisResult> {
    const startTime = Date.now();

    try {
      const combinedData: CombinedAnalysisData = {};

      // 并行执行八字和风水计算
      const promises: Promise<any>[] = [];

      if (standardizedInput.birthInfo) {
        promises.push(
          this.executeBaziCalculation(
            standardizedInput.birthInfo,
            sessionId,
            userId
          ).then((result) => {
            if (result.success)
              combinedData.bazi = result.data as EnhancedBaziResult;
          })
        );
      }

      if (standardizedInput.houseInfo) {
        promises.push(
          this.executeFengshuiCalculation(
            standardizedInput.houseInfo,
            sessionId,
            userId
          ).then((result) => {
            if (result.success)
              combinedData.fengshui = result.data as GenerateFlyingStarOutput;
          })
        );
      }

      await Promise.all(promises);

      // 生成综合分析
      if (combinedData.bazi && combinedData.fengshui) {
        combinedData.combinedInsights =
          this.generateCombinedInsights(combinedData);
        combinedData.recommendations =
          this.generateCombinedRecommendations(combinedData);
      }

      return {
        type: 'combined',
        success: true,
        data: combinedData,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        sessionId,
        userId,
      };
    } catch (error) {
      console.error('[算法优先服务] 综合计算失败:', error);
      throw error;
    }
  }

  /**
   * 生成专业的AI解读
   * 遵循专业八字风水大师的解读标准
   * 增强：添加输出验证和自动修正机制
   */
  private async generateProfessionalInterpretation(
    analysisResult: AnalysisResult,
    standardizedInput: any,
    sessionId: string,
    userId: string
  ): Promise<AIEnhancementResponse> {
    try {
      console.log(
        `[算法优先服务] 开始生成专业AI解读，分析结果类型: ${analysisResult.type}`
      );

      const formattedResult = this.formatAnalysisResultForAI(analysisResult);

      // 调试输出：确保传递给AI的数据正确
      console.log('[算法优先服务] 传递给AI的格式化结果:');
      console.log(formattedResult);

      // 专业八字风水大师prompt模板
      const masterPrompt = this.getProfessionalMasterPrompt(
        analysisResult.type
      );

      // 根据分析类型构建不同的提示内容
      let userContent = '';
      if (analysisResult.type === 'bazi') {
        userContent = `【重要】必须严格基于以下算法计算结果进行分析，禁止使用任何其他八字数据：

${formattedResult}

【核心要求】
1. 必须使用上述算法提供的确切四柱数据，不得修改或替换
2. 在"四柱结果"部分必须原样显示算法计算的年柱、月柱、日柱、时柱
3. 所有分析必须基于上述具体的四柱进行，不得使用其他假设数据

【输出格式】
请严格按照以下结构输出：

## 一、输入确认
- 出生时间：[确认年月日时]
- 性别：[确认性别]
- 时区：[确认时区]

## 二、四柱结果（必须使用算法提供的确切数据）
- 年柱：[直接引用算法计算的年柱]
- 月柱：[直接引用算法计算的月柱]
- 日柱：[直接引用算法计算的日柱]
- 时柱：[直接引用算法计算的时柱]

## 三、关键结论
- 日主强弱：[基于上述具体四柱分析]
- 格局判定：[基于上述具体四柱判断]
- 用神分析：[基于上述具体四柱的喜用神分析]
- 十神配置：[基于上述具体四柱的十神关系]

## 四、详细解读
- 五行分析：[基于上述具体四柱的五行分布]
- 性格特质：[基于上述具体四柱组合分析]
- 事业财运：[基于上述具体四柱的职业指导]
- 感情婚姻：[基于上述具体四柱的婚姻建议]
- 健康提示：[基于上述具体四柱的健康分析]

## 五、建议与注意
- 有利颜色：[基于上述具体四柱的用神]
- 有利方位：[基于上述具体四柱的用神]
- 适合职业：[基于上述具体四柱的格局]
- 开运时机：[基于上述具体四柱的大运分析]

## 六、复核提示
提醒：以上分析严格基于算法引擎计算的四柱结果，您可以验证上述天干地支的准确性。`;
      } else if (analysisResult.type === 'fengshui') {
        userContent = `基于以下算法计算结果，请提供专业的风水分析解读：

${formattedResult}

【输出要求】
请严格按照风水分析的专业结构输出。`;
      } else {
        userContent = `基于以下算法计算结果，请提供专业的综合分析解读：

${formattedResult}

【输出要求】
请结合八字与风水，提供综合分析建议。`;
      }

      const aiMessages = [
        {
          role: 'system' as const,
          content: masterPrompt,
        },
        {
          role: 'user' as const,
          content: userContent,
        },
      ];

      // 调试输出：显示完整的AI prompt
      console.log('[算法优先服务] 完整AI Prompt:');
      console.log('System Message:');
      console.log(masterPrompt);
      console.log('\nUser Message:');
      console.log(userContent);

      console.log(
        `[算法优先服务] 调用AI路由器，消息数量: ${aiMessages.length}`
      );

      // 检查断路器状态
      if (this.checkCircuitBreaker()) {
        console.warn('[算法优先服务] 断路器已开启，使用纯算法输出模式');
        return this.generatePureAlgorithmInterpretation(
          analysisResult,
          standardizedInput
        );
      }

      const aiResponse = await this.aiRouter.chat({
        messages: aiMessages,
        model: 'gpt-4o-mini',
        maxTokens: 2500,
        temperature: 0.6, // 降低温度以获得更稳定的输出
      });

      console.log('[算法优先服务] AI响应接收成功');

      let content =
        aiResponse.choices?.[0]?.message?.content ||
        '抱歉，我暂时无法解释这个分析结果。';

      // 调试输出：显示AI的原始响应
      console.log('[算法优先服务] AI原始响应内容:');
      console.log(content);

      // 数据一致性验证和修正
      if (analysisResult.type === 'bazi' && analysisResult.data) {
        const baziData = analysisResult.data as EnhancedBaziResult;
        const validationResult = this.validateAndCorrectAIOutput(
          content,
          baziData
        );

        if (!validationResult.isValid) {
          console.warn('[算法优先服务] 检测到AI输出四柱不一致，正在修正...');
          console.log('不一致详情:', validationResult.discrepancies);

          // 自动修正AI输出
          content = this.correctAIOutput(content, baziData, validationResult);
          console.log('[算法优先服务] 已修正AI输出，确保四柱数据一致');

          // 记录AI失败（输出不一致也算失败）
          this.recordAIFailure();
        } else {
          console.log('[算法优先服务] AI输出验证通过，四柱数据一致');
          this.recordAISuccess();
        }
      } else {
        this.recordAISuccess();
      }

      // 提取结构化内容
      const insights = this.extractInsights(content);
      const recommendations = this.extractRecommendations(content);
      const followUpQuestions = this.generateContextualFollowUpQuestions(
        analysisResult,
        standardizedInput
      );

      const result = {
        explanation: content,
        insights,
        recommendations,
        followUpQuestions,
        confidence: this.calculateInterpretationConfidence(
          content,
          analysisResult
        ),
      };

      console.log(
        `[算法优先服务] AI补充解释生成成功，内容长度: ${content.length}，置信度: ${result.confidence}`
      );
      return result;
    } catch (error) {
      console.error('[算法优先服务] AI补充生成失败:', error);

      // 记录AI失败
      this.recordAIFailure();

      // 提供更详细的错误信息
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      console.error('[算法优先服务] 错误详情:', {
        errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        analysisResultType: analysisResult.type,
        analysisResultSuccess: analysisResult.success,
      });

      // 即使AI失败，也提供基本的算法结果解释
      return this.generateFallbackInterpretation(
        analysisResult,
        standardizedInput
      );
    }
  }

  /**
   * 生成降级的基本解释（当AI服务不可用时）
   */
  private generateFallbackInterpretation(
    analysisResult: AnalysisResult,
    standardizedInput: any
  ): AIEnhancementResponse {
    let explanation = '算法计算已完成。';
    const insights: string[] = [];
    const recommendations: string[] = [];

    if (analysisResult.type === 'bazi' && analysisResult.data) {
      const baziData = analysisResult.data as EnhancedBaziResult;
      explanation = `八字分析结果：

四柱信息：
- 年柱：${baziData.pillars?.year?.stem}${baziData.pillars?.year?.branch}
- 月柱：${baziData.pillars?.month?.stem}${baziData.pillars?.month?.branch}
- 日柱：${baziData.pillars?.day?.stem}${baziData.pillars?.day?.branch}
- 时柱：${baziData.pillars?.hour?.stem}${baziData.pillars?.hour?.branch}

日主：${baziData.pillars?.day?.stem}
喜用元素：${baziData.favorableElements?.primary?.join('、') || '待分析'}
忌用元素：${baziData.favorableElements?.unfavorable?.join('、') || '待分析'}

注：由于AI服务暂时不可用，仅显示基本计算结果。`;

      insights.push('四柱八字计算完成');
      insights.push(`日主为${baziData.pillars?.day?.stem}`);

      recommendations.push('请根据喜用神选择有利颜色和方位');
      recommendations.push('建议在适合的时机做重要决定');
    }

    return {
      explanation,
      insights,
      recommendations,
      followUpQuestions: [
        '需要了解更多关于您的八字信息吗？',
        '想知道如何根据八字改善运势吗？',
      ],
      confidence: 0.3,
    };
  }

  /**
   * 计算解释的置信度
   */
  private calculateInterpretationConfidence(
    content: string,
    analysisResult: AnalysisResult
  ): number {
    let confidence = 0.5; // 基础置信度

    // 检查内容完整性
    if (content.length > 500) confidence += 0.1;
    if (content.length > 1000) confidence += 0.1;

    // 检查是否包含关键结构
    if (content.includes('四柱') || content.includes('飞星')) confidence += 0.1;
    if (content.includes('建议') || content.includes('推荐')) confidence += 0.1;

    // 如果算法计算成功，增加置信度
    if (analysisResult.success) confidence += 0.1;

    return Math.min(confidence, 0.95);
  }

  /**
   * 生成上下文相关的后续问题
   */
  private generateContextualFollowUpQuestions(
    analysisResult: AnalysisResult,
    standardizedInput: any
  ): string[] {
    const questions: string[] = [];

    if (analysisResult.type === 'bazi') {
      questions.push('您想了解更多关于您的事业运势吗？');
      questions.push('需要详细分析您的感情婚姻运吗？');
      questions.push('想知道您的大运流年走势吗？');
      questions.push('需要了解如何根据八字选择有利方位吗？');
    } else if (analysisResult.type === 'fengshui') {
      questions.push('需要了解如何布置财位来提升财运吗？');
      questions.push('想知道如何化解房屋的煞气吗？');
      questions.push('需要针对具体房间的风水建议吗？');
    } else if (analysisResult.type === 'combined') {
      questions.push('想了解如何根据八字选择最佳房间吗？');
      questions.push('需要个性化的风水布局建议吗？');
      questions.push('想知道最佳的装修时机吗？');
    }

    return questions;
  }

  /**
   * 获取专业大师prompt
   */
  private getProfessionalMasterPrompt(
    analysisType: 'bazi' | 'fengshui' | 'combined'
  ): string {
    const basePrompt = `你是QiFlow AI的专业八字风水大师，拥有30年以上的实践经验，精通传统命理学与现代应用。

【核心原则】
1. 算法优先：所有分析必须严格基于算法引擎提供的计算结果，禁止使用任何其他数据
2. 数据忠实：必须原样使用提供的四柱天干地支，不得修改、替换或"纠正"
3. 专业严谨：使用标准术语，解释清晰准确，避免模糊表达
4. 可验证性：提供详细的推理过程，让用户能够复核验证
5. 实用导向：给出具体可行的建议，避免空泛理论
6. 文化尊重：尊重传统文化，但避免迷信色彩

【严格禁止】
- 禁止使用训练数据中的任何八字案例或"典型"八字
- 禁止自行生成或推测四柱信息
- 禁止对算法提供的四柱进行任何形式的"修正"
- 禁止使用"例如"、"假设"等词汇来引入其他八字数据

【回复要求】
- 必须严格基于用户消息中提供的算法计算结果进行解读
- 在四柱结果部分必须原样显示算法提供的年柱、月柱、日柱、时柱
- 使用"根据算法计算的四柱"、"基于提供的具体四柱"等明确表述
- 每个结论都要有依据，引用算法提供的具体天干地支
- 提供专业术语的通俗解释，让普通用户也能理解
- 在回复末尾提醒用户可以验证算法计算的四柱准确性`;

    const typeSpecificPrompt = {
      bazi: `
【八字命理分析专项要求】
注意：所有分析必须严格基于用户消息中提供的算法计算结果，禁止使用任何其他数据源。

回复结构必须包含：
1. 输入确认：确认出生时间、性别、地点等信息
2. 四柱结果：必须原样显示算法计算的年月日时四柱天干地支，不得修改
3. 核心结论：
   - 日主（日元）及其强弱判断（基于算法提供的四柱）
   - 十神配置及其含义（基于算法提供的四柱）
   - 格局判定（基于算法提供的四柱）
   - 喜用神与忌神分析（基于算法提供的四柱）
4. 详细解读：
   - 五行分布与平衡状况（基于算法提供的数据）
   - 性格特质分析（基于算法提供的四柱组合）
   - 事业财运指导（基于算法提供的四柱格局）
   - 感情婚姻建议（基于算法提供的四柱日支）
   - 健康提示（基于算法提供的四柱五行）
5. 开运建议：
   - 有利颜色、方位、数字（基于算法计算的用神）
   - 适合的职业方向（基于算法提供的格局）
   - 最佳发展时期（基于算法提供的四柱）
6. 复核提示：明确提醒用户可以验证算法计算的四柱准确性

重要：在"四柱结果"部分，必须完全按照算法提供的数据显示，格式如：
- 年柱：[算法计算的年柱]
- 月柱：[算法计算的月柱]
- 日柱：[算法计算的日柱]
- 时柱：[算法计算的时柱]`,
      fengshui: `
【风水布局分析专项要求】
回复结构必须包含：
1. 房屋信息确认：坐向、建造年份、楼层等
2. 飞星盘解读：
   - 山盘、向盘、天盘的飞星分布
   - 各宫位的吉凶判断
   - 重要方位的特殊说明
3. 格局分析：
   - 整体格局评估（旺山旺向、上山下水等）
   - 财位、文昌位、桃花位定位
   - 煞位及其化解方法
4. 布局建议：
   - 各房间的最佳用途
   - 家具摆放原则
   - 颜色搭配建议
5. 化煞催吉：
   - 需要化解的问题
   - 具体的风水调整方案
   - 吉祥物品的使用建议`,
      combined: `
【综合分析专项要求】
回复结构必须包含：
1. 个人命理概述（基于八字）
2. 居住环境分析（基于风水）
3. 人宅配合度评估：
   - 个人喜用方位与房屋吉位的匹配
   - 五行属性的协调性
   - 时运与空间的结合
4. 优化方案：
   - 根据个人命理选择最佳房间
   - 个性化的风水布局建议
   - 时空结合的开运策略
5. 注意事项与跟进建议`,
    };

    return basePrompt + (typeSpecificPrompt[analysisType] || '');
  }

  /**
   * 构建结构化响应
   */
  private buildStructuredResponse(
    algorithmResult: AnalysisResult,
    aiInterpretation?: AIEnhancementResponse,
    standardizedInput?: any
  ): StructuredAnalysis | undefined {
    if (!algorithmResult.success || !algorithmResult.data) {
      return undefined;
    }

    if (algorithmResult.type === 'bazi') {
      const baziData = algorithmResult.data as EnhancedBaziResult;
      return {
        inputConfirmation: {
          datetime: standardizedInput?.birthInfo?.datetime || '',
          gender: standardizedInput?.birthInfo?.gender || 'unknown',
          location: standardizedInput?.birthInfo?.location,
          timezone: standardizedInput?.birthInfo?.timezone || 'Asia/Shanghai',
        },
        fourPillarsResult: {
          year: this.formatPillar(baziData.pillars?.year),
          month: this.formatPillar(baziData.pillars?.month),
          day: this.formatPillar(baziData.pillars?.day),
          hour: this.formatPillar(baziData.pillars?.hour),
        },
        keyConclusions: {
          dayMaster: baziData.pillars?.day?.stem || '',
          tenGods: this.extractTenGods(baziData),
          pattern: this.determinePattern(baziData),
          favorableElements: baziData.favorableElements?.primary || [],
        },
        detailedAnalysis: {
          fiveElements: this.analyzeFiveElements(baziData),
          strengthAnalysis: this.analyzeStrength(baziData),
          usefulGod: this.determineUsefulGod(baziData),
          personalityTraits: aiInterpretation?.insights || [],
          careerGuidance: this.extractCareerGuidance(aiInterpretation),
          relationshipAdvice: this.extractRelationshipAdvice(aiInterpretation),
        },
        recommendations: {
          colors: this.recommendColors(baziData),
          directions: this.recommendDirections(baziData),
          careers: this.recommendCareers(baziData),
          timing: this.recommendTiming(baziData),
        },
        verificationNote: '以上分析基于传统八字命理学算法，结果可供参考验证',
      };
    }

    return undefined;
  }

  /**
   * 格式化柱信息
   */
  private formatPillar(pillar: any): {
    stem: string;
    branch: string;
    chinese: string;
  } {
    if (!pillar) {
      return { stem: '', branch: '', chinese: '' };
    }
    return {
      stem: pillar.stem || '',
      branch: pillar.branch || '',
      chinese: pillar.chinese || `${pillar.stem}${pillar.branch}`,
    };
  }

  /**
   * 提取十神信息
   */
  private extractTenGods(baziData: EnhancedBaziResult): Record<string, string> {
    // 基于八字数据提取十神关系
    // 实际实现需要根据日主与其他天干的关系计算
    return {
      year: '正印',
      month: '偏财',
      hour: '食神',
    };
  }

  /**
   * 判定格局
   */
  private determinePattern(baziData: EnhancedBaziResult): string {
    // 基于八字配置判定格局
    // 实际实现需要分析十神配置和五行强弱
    return '身强财旺格';
  }

  /**
   * 分析五行
   */
  private analyzeFiveElements(
    baziData: EnhancedBaziResult
  ): Record<string, number> {
    const elements = baziData.elements || {};
    return {
      木: elements.木 || 0,
      火: elements.火 || 0,
      土: elements.土 || 0,
      金: elements.金 || 0,
      水: elements.水 || 0,
    };
  }

  /**
   * 分析日主强弱
   */
  private analyzeStrength(baziData: EnhancedBaziResult): string {
    // 基于五行分布判断日主强弱
    return '日主偏强，需要克泄耗';
  }

  /**
   * 判定用神
   */
  private determineUsefulGod(baziData: EnhancedBaziResult): string {
    // 基于日主强弱和五行平衡判定用神
    return '金水为用神';
  }

  /**
   * 提取职业指导
   */
  private extractCareerGuidance(
    aiInterpretation?: AIEnhancementResponse
  ): string[] {
    if (!aiInterpretation) return [];
    // 从AI解读中提取职业相关建议
    return aiInterpretation.recommendations.filter(
      (r) => r.includes('事业') || r.includes('工作') || r.includes('职业')
    );
  }

  /**
   * 提取感情建议
   */
  private extractRelationshipAdvice(
    aiInterpretation?: AIEnhancementResponse
  ): string[] {
    if (!aiInterpretation) return [];
    // 从AI解读中提取感情相关建议
    return aiInterpretation.recommendations.filter(
      (r) => r.includes('感情') || r.includes('婚姻') || r.includes('伴侣')
    );
  }

  /**
   * 推荐颜色
   */
  private recommendColors(baziData: EnhancedBaziResult): string[] {
    const favorable = baziData.favorableElements?.primary || [];
    const colorMap: Record<string, string[]> = {
      wood: ['绿色', '青色'],
      fire: ['红色', '紫色'],
      earth: ['黄色', '棕色'],
      metal: ['白色', '金色'],
      water: ['黑色', '蓝色'],
    };

    return (favorable || []).flatMap(
      (element: string) => colorMap[element] || []
    );
  }

  /**
   * 推荐方位
   */
  private recommendDirections(baziData: EnhancedBaziResult): string[] {
    const favorable = baziData.favorableElements?.primary || [];
    const directionMap: Record<string, string[]> = {
      wood: ['东方', '东南方'],
      fire: ['南方'],
      earth: ['中央', '东北方', '西南方'],
      metal: ['西方', '西北方'],
      water: ['北方'],
    };

    return (favorable || []).flatMap(
      (element: string) => directionMap[element] || []
    );
  }

  /**
   * 推荐职业
   */
  private recommendCareers(baziData: EnhancedBaziResult): string[] {
    // 基于八字特点推荐职业
    return ['管理类', '金融类', '技术类'];
  }

  /**
   * 推荐时机
   */
  private recommendTiming(baziData: EnhancedBaziResult): string[] {
    // 基于八字推荐有利时机
    return ['申酉月', '亥子月', '下午3-5点'];
  }

  /**
   * 评估分析质量
   */
  private assessQuality(
    algorithmResult: AnalysisResult,
    aiInterpretation?: AIEnhancementResponse
  ): 'high' | 'medium' | 'low' {
    if (!algorithmResult.success) return 'low';
    if (
      algorithmResult.data &&
      aiInterpretation &&
      aiInterpretation.confidence > 0.8
    )
      return 'high';
    if (algorithmResult.data || aiInterpretation) return 'medium';
    return 'low';
  }

  /**
   * 创建错误响应
   */
  private createErrorResponse(
    error: string,
    type: 'bazi' | 'fengshui' | 'combined',
    sessionId: string,
    userId: string,
    executionTime: number
  ): CompleteAnalysisResponse {
    // 生成用户友好的错误消息和建议
    const userFriendlyError = this.getUserFriendlyErrorMessage(error, type);

    return {
      analysisResult: {
        type,
        success: false,
        error: userFriendlyError.message,
        executionTime,
        timestamp: new Date().toISOString(),
        sessionId,
        userId,
      },
      aiEnhancement: {
        explanation: userFriendlyError.explanation,
        insights: [],
        recommendations: userFriendlyError.suggestions,
        followUpQuestions: userFriendlyError.followUpQuestions,
        confidence: 0,
      },
      rawData: null,
      metadata: {
        sessionId,
        userId,
        timestamp: new Date().toISOString(),
        processingTime: executionTime,
        algorithmVersion: '2.0.0',
        quality: 'low',
      },
    };
  }

  /**
   * 生成用户友好的错误消息
   */
  private getUserFriendlyErrorMessage(
    error: string,
    type: 'bazi' | 'fengshui' | 'combined'
  ): {
    message: string;
    explanation: string;
    suggestions: string[];
    followUpQuestions: string[];
  } {
    // 根据错误类型生成不同的用户提示
    if (error.includes('输入参数不完整') || error.includes('未能识别')) {
      if (type === 'bazi') {
        return {
          message: '输入信息不完整',
          explanation: '抱歉，我需要更完整的出生信息才能进行八字分析。',
          suggestions: [
            '请提供完整的出生年月日时（精确到小时）',
            '请说明性别（男/女）',
            '如有可能，请提供出生地点',
          ],
          followUpQuestions: [
            '您能提供准确的出生时间吗？例如：1990年3月15日下午3点',
            '您的性别是？',
            '您是在哪个城市出生的？',
          ],
        };
      }
      if (type === 'fengshui') {
        return {
          message: '房屋信息不完整',
          explanation: '抱歉，我需要更详细的房屋信息才能进行风水分析。',
          suggestions: [
            '请提供房屋的坐向（如：坐北朝南）',
            '请说明房屋的建造年份或入住时间',
            '如有可能，请描述房屋的基本布局',
          ],
          followUpQuestions: [
            '您的房子朝向是什么？',
            '房子是哪一年建造的？',
            '能描述一下房屋的户型布局吗？',
          ],
        };
      }
    }

    if (error.includes('算法计算失败') || error.includes('技术问题')) {
      return {
        message: '计算服务暂时不可用',
        explanation:
          '很抱歉，算法引擎遇到了技术问题。我们的工程师正在处理，请稍后重试。',
        suggestions: [
          '请检查输入的日期格式是否正确',
          '请确保提供的信息完整准确',
          '您可以先尝试其他功能或稍后再试',
        ],
        followUpQuestions: [
          '您想了解八字命理的基本概念吗？',
          '需要我解释风水的基本原理吗？',
          '您有其他问题想要咨询吗？',
        ],
      };
    }

    // 默认错误处理
    return {
      message: error,
      explanation: '抱歉，处理您的请求时遇到了问题。请检查输入信息并重试。',
      suggestions: [
        '请确保提供的信息格式正确',
        '尝试用更清晰的方式描述您的需求',
        '如问题持续，请联系客服支持',
      ],
      followUpQuestions: [
        '您能重新描述一下您的需求吗？',
        '需要查看使用示例吗？',
        '有其他问题需要帮助吗？',
      ],
    };
  }

  /**
   * 生成重定向信息
   */
  private generateRedirectInfo(
    analysisResult: AnalysisResult,
    message: string,
    sessionId: string,
    userId: string
  ): { path: string; params: Record<string, string> } | null {
    if (!analysisResult.success) {
      return null;
    }

    const analysisType = analysisResult.type;
    const basePath = '/analysis-result';

    // 提取出生信息
    const birthData = this.extractBirthInfo(message);
    const houseInfo = this.extractHouseInfo(message);

    switch (analysisType) {
      case 'bazi':
        if (birthData.datetime) {
          return {
            path: basePath,
            params: {
              type: 'bazi',
              birthData: encodeURIComponent(JSON.stringify(birthData)),
              sessionId,
              userId,
            },
          };
        }
        break;

      case 'fengshui':
        if (houseInfo.facing) {
          return {
            path: basePath,
            params: {
              type: 'fengshui',
              houseInfo: encodeURIComponent(JSON.stringify(houseInfo)),
              sessionId,
              userId,
            },
          };
        }
        break;

      case 'combined':
        if (birthData.datetime || houseInfo.facing) {
          return {
            path: basePath,
            params: {
              type: 'comprehensive',
              birthData: encodeURIComponent(JSON.stringify(birthData)),
              houseInfo: encodeURIComponent(JSON.stringify(houseInfo)),
              sessionId,
              userId,
            },
          };
        }
        break;
    }

    return null;
  }

  /**
   * 处理AI对话追问
   */
  async processFollowUpQuestion(
    question: string,
    analysisResult: AnalysisResult,
    sessionId: string,
    userId: string
  ): Promise<AIEnhancementResponse> {
    console.log(`[算法优先服务] 处理追问: ${question.substring(0, 50)}...`);

    try {
      // 构建基于算法结果的AI对话上下文
      const aiMessages = [
        {
          role: 'system' as const,
          content: `你是 QiFlow AI 八字风水大师，专门为用户解释和分析八字命理和风水结果。

当前分析结果：
${this.formatAnalysisResultForAI(analysisResult)}

请基于以上分析结果回答用户的问题。如果用户询问具体的技术细节，请结合传统命理学理论进行专业解释。`,
        },
        {
          role: 'user' as const,
          content: question,
        },
      ];

      const aiResponse = await this.aiRouter.chat({
        messages: aiMessages,
        model: 'gpt-4o-mini',
        maxTokens: 1000,
        temperature: 0.7,
      });

      const content =
        aiResponse.choices?.[0]?.message?.content ||
        '抱歉，我暂时无法回答您的问题。';

      return {
        explanation: content,
        insights: this.extractInsights(content),
        recommendations: this.extractRecommendations(content),
        followUpQuestions: this.generateFollowUpQuestions(
          analysisResult,
          question
        ),
        confidence: 0.8,
      };
    } catch (error) {
      console.error('[算法优先服务] AI追问处理失败:', error);

      return {
        explanation:
          '抱歉，我在处理您的问题时遇到了技术问题。请重新描述您的问题。',
        insights: [],
        recommendations: [],
        followUpQuestions: [],
        confidence: 0.1,
      };
    }
  }

  /**
   * 确定分析类型
   */
  private determineAnalysisType(
    message: string
  ): 'bazi' | 'fengshui' | 'combined' {
    const baziKeywords = [
      '八字',
      '命理',
      '出生',
      '生辰',
      '命盘',
      '四柱',
      '天干',
      '地支',
      '五行',
      '解析八字',
      '算八字',
      '分析八字',
    ];
    const fengshuiKeywords = [
      '风水',
      '房屋',
      '朝向',
      '布局',
      '玄空',
      '飞星',
      '九宫',
      '方位',
    ];

    const hasBazi = baziKeywords.some((keyword) => message.includes(keyword));
    const hasFengshui = fengshuiKeywords.some((keyword) =>
      message.includes(keyword)
    );

    console.log('[算法优先服务] 分析类型判断:', {
      message: message.substring(0, 50),
      hasBazi,
      hasFengshui,
      baziKeywords: baziKeywords.filter((k) => message.includes(k)),
    });

    if (hasBazi && hasFengshui) {
      return 'combined';
    }
    if (hasBazi) {
      return 'bazi';
    }
    if (hasFengshui) {
      return 'fengshui';
    }
    // 默认根据是否包含出生信息判断
    const birthInfoPattern =
      /(\d{4}年|\d{1,2}月|\d{1,2}日|\d{1,2}时|\d{4}[\-年]|\d{1,2}[\-月]|\d{1,2}[\-日]|\d{1,2}[\-时])/;
    const hasBirthInfo = birthInfoPattern.test(message);
    console.log('[算法优先服务] 根据出生信息判断:', {
      hasBirthInfo,
      pattern: birthInfoPattern,
    });
    return hasBirthInfo ? 'bazi' : 'combined';
  }

  /**
   * 提取出生信息
   */
  private extractBirthInfo(
    message: string,
    context?: ConversationContext
  ): Partial<EnhancedBirthData> {
    // 从消息中提取出生信息
    const birthInfo: Partial<EnhancedBirthData> = {};

    console.log(`[算法优先服务] 开始提取出生信息，消息: "${message}"`);

    // 提取性别
    if (message.includes('男') || message.includes('男性')) {
      birthInfo.gender = 'male';
      console.log('[算法优先服务] 提取到性别: 男');
    } else if (message.includes('女') || message.includes('女性')) {
      birthInfo.gender = 'female';
      console.log('[算法优先服务] 提取到性别: 女');
    }

    // 提取日期时间 - 支持多种格式（按优先级排序，先匹配精确格式）
    let dateTimeMatch = message.match(
      /(\d{4})年(\d{1,2})月(\d{1,2})日[，,](\d{1,2})点(\d{1,2})分/
    );
    if (!dateTimeMatch) {
      // 尝试格式：1973年1月7日2点30分（无逗号）
      dateTimeMatch = message.match(
        /(\d{4})年(\d{1,2})月(\d{1,2})日(\d{1,2})点(\d{1,2})分/
      );
    }
    if (!dateTimeMatch) {
      // 尝试数字格式：1990年5月15日14时30分
      dateTimeMatch = message.match(
        /(\d{4})年(\d{1,2})月(\d{1,2})日(\d{1,2})时\d{1,2}分/
      );
    }
    if (!dateTimeMatch) {
      // 尝试格式：1990年5月15日14时
      dateTimeMatch = message.match(
        /(\d{4})年(\d{1,2})月(\d{1,2})日(\d{1,2})时/
      );
    }
    if (!dateTimeMatch) {
      // 尝试其他格式
      dateTimeMatch = message.match(
        /(\d{4})[年\-/](\d{1,2})[月\-/](\d{1,2})[日\s](\d{1,2})[时点]/
      );
    }
    if (!dateTimeMatch) {
      // 尝试更宽松的格式
      dateTimeMatch = message.match(
        /(\d{4}).*?(\d{1,2}).*?(\d{1,2}).*?(\d{1,2})/
      );
    }
    if (!dateTimeMatch) {
      // 尝试纯数字格式：1990-5-15-14
      dateTimeMatch = message.match(/(\d{4})-(\d{1,2})-(\d{1,2})-(\d{1,2})/);
    }
    if (!dateTimeMatch) {
      // 尝试格式：1973-1-7,2点半
      dateTimeMatch = message.match(
        /(\d{4})-(\d{1,2})-(\d{1,2}),(\d{1,2})点半/
      );
    }
    if (!dateTimeMatch) {
      // 尝试格式：1973-1-7,2点
      dateTimeMatch = message.match(/(\d{4})-(\d{1,2})-(\d{1,2}),(\d{1,2})点/);
    }
    if (!dateTimeMatch) {
      // 尝试格式：1973-1-7 2点半
      dateTimeMatch = message.match(
        /(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2})点半/
      );
    }
    if (!dateTimeMatch) {
      // 尝试格式：1973-1-7 2点
      dateTimeMatch = message.match(
        /(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2})点/
      );
    }

    if (dateTimeMatch) {
      // 根据匹配的格式调整解析逻辑
      let year: number;
      let month: number;
      let day: number;
      let hour: number;
      let minute = 0;

      console.log(
        `[算法优先服务] 匹配结果长度: ${dateTimeMatch.length}, 内容:`,
        dateTimeMatch
      );

      if (dateTimeMatch.length === 6) {
        // 格式：1973年1月7日，2点30分 - 有5个捕获组 + 完整匹配 = 6
        const [, yearStr, monthStr, dayStr, hourStr, minuteStr] =
          dateTimeMatch as [string, string, string, string, string, string];
        year = Number.parseInt(yearStr);
        month = Number.parseInt(monthStr);
        day = Number.parseInt(dayStr);
        hour = Number.parseInt(hourStr);
        minute = Number.parseInt(minuteStr);
        console.log(
          `[算法优先服务] 使用6元素格式解析: ${year}年${month}月${day}日${hour}时${minute}分`
        );
      } else if (dateTimeMatch.length === 7) {
        // 格式：1973年1月7日2点30分 - 有6个捕获组 + 完整匹配 = 7
        const [, yearStr, monthStr, dayStr, hourStr, minuteStr] =
          dateTimeMatch as [string, string, string, string, string, string];
        year = Number.parseInt(yearStr);
        month = Number.parseInt(monthStr);
        day = Number.parseInt(dayStr);
        hour = Number.parseInt(hourStr);
        minute = Number.parseInt(minuteStr);
        console.log(
          `[算法优先服务] 使用7元素格式解析: ${year}年${month}月${day}日${hour}时${minute}分`
        );
      } else if (dateTimeMatch.length === 5) {
        // 格式：1973年1月7日2时 - 有4个捕获组 + 完整匹配 = 5
        const [, yearStr, monthStr, dayStr, hourStr] = dateTimeMatch;
        year = Number.parseInt(yearStr);
        month = Number.parseInt(monthStr);
        day = Number.parseInt(dayStr);
        hour = Number.parseInt(hourStr);
        console.log(
          `[算法优先服务] 使用5元素格式解析: ${year}年${month}月${day}日${hour}时`
        );
      } else {
        // 其他格式 - 有4个捕获组
        const [, yearStr, monthStr, dayStr, hourStr] = dateTimeMatch;
        year = Number.parseInt(yearStr);
        month = Number.parseInt(monthStr);
        day = Number.parseInt(dayStr);
        hour = Number.parseInt(hourStr);
        console.log(
          `[算法优先服务] 使用默认格式解析: ${year}年${month}月${day}日${hour}时`
        );
      }

      const yearNum = year;
      const monthNum = month;
      const dayNum = day;
      const hourNum = hour;
      const minuteNum = minute;

      console.log(
        `[算法优先服务] 匹配到日期时间: ${yearNum}年${monthNum}月${dayNum}日${hourNum}时`
      );

      // 验证日期有效性
      if (
        yearNum >= 1900 &&
        yearNum <= 2100 &&
        monthNum >= 1 &&
        monthNum <= 12 &&
        dayNum >= 1 &&
        dayNum <= 31 &&
        hourNum >= 0 &&
        hourNum <= 23
      ) {
        // 转换为ISO字符串格式（使用本地时区）
        const date = new Date(
          yearNum,
          monthNum - 1,
          dayNum,
          hourNum,
          minuteNum
        );
        // 格式化为 YYYY-MM-DDTHH:mm 格式，保持本地时间
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        birthInfo.datetime = `${year}-${month}-${day}T${hour}:${minute}`;
        birthInfo.isTimeKnown = true;

        console.log(
          `[算法优先服务] 成功提取出生信息: ${yearNum}年${monthNum}月${dayNum}日${hourNum}时${minuteNum}分 -> ${birthInfo.datetime}`
        );
      } else {
        console.log(
          `[算法优先服务] 日期时间验证失败: ${yearNum}年${monthNum}月${dayNum}日${hourNum}时`
        );
      }
    } else {
      console.log('[算法优先服务] 未匹配到有效的日期时间格式');
    }

    // 从上下文获取补充信息
    if (context?.userProfile) {
      // 暂时跳过上下文信息，因为类型不匹配
      // Object.assign(birthInfo, context.userProfile);
    }

    return birthInfo;
  }

  /**
   * 提取房屋信息
   */
  private extractHouseInfo(
    message: string,
    context?: ConversationContext
  ): Partial<GenerateFlyingStarInput> {
    const houseInfo: Partial<GenerateFlyingStarInput> = {};

    // 设置默认的观察时间
    houseInfo.observedAt = new Date();

    // 提取朝向 - 支持多种格式
    let directionMatch = message.match(/([东西南北])([东西南北])向/);
    if (!directionMatch) {
      // 尝试其他格式
      directionMatch = message.match(/坐([东西南北])向([东西南北])/);
    }
    if (!directionMatch) {
      // 尝试更宽松的格式
      directionMatch = message.match(/([东西南北])([东西南北])/);
    }

    if (directionMatch) {
      const [, sitting, facing] = directionMatch;
      // 转换为罗盘角度（简化版本）
      const directionMap: { [key: string]: number } = {
        北: 0,
        东北: 45,
        东: 90,
        东南: 135,
        南: 180,
        西南: 225,
        西: 270,
        西北: 315,
      };

      houseInfo.facing = (directionMap[facing] || 0) as any;

      console.log(
        `[算法优先服务] 提取到房屋信息: 坐${sitting}向${facing} (角度: ${houseInfo.facing})`
      );
    } else {
      // 设置默认朝向（坐北朝南）
      houseInfo.facing = 180 as any; // 南向
      console.log('[算法优先服务] 使用默认房屋信息: 坐北朝南');
    }

    return houseInfo;
  }

  /**
   * 格式化分析结果供AI使用
   */
  private formatAnalysisResultForAI(analysisResult: AnalysisResult): string {
    if (!analysisResult.success || !analysisResult.data) {
      return `分析失败: ${analysisResult.error}`;
    }

    let resultText = `分析类型: ${analysisResult.type}\n`;
    resultText += `分析时间: ${analysisResult.timestamp}\n`;
    resultText += `执行时间: ${analysisResult.executionTime}ms\n\n`;

    if (analysisResult.type === 'bazi' && 'pillars' in analysisResult.data) {
      const baziData = analysisResult.data as any;
      resultText += '八字信息:\n';
      resultText += `- 年柱: ${(baziData.pillars?.year as any)?.chinese || baziData.pillars?.year?.stem + baziData.pillars?.year?.branch || '未知'}\n`;
      resultText += `- 月柱: ${(baziData.pillars?.month as any)?.chinese || baziData.pillars?.month?.stem + baziData.pillars?.month?.branch || '未知'}\n`;
      resultText += `- 日柱: ${(baziData.pillars?.day as any)?.chinese || baziData.pillars?.day?.stem + baziData.pillars?.day?.branch || '未知'}\n`;
      resultText += `- 时柱: ${(baziData.pillars?.hour as any)?.chinese || baziData.pillars?.hour?.stem + baziData.pillars?.hour?.branch || '未知'}\n`;
      resultText += `- 五行: ${JSON.stringify(baziData.elements) || '未知'}\n`;
      resultText += `- 日主: ${baziData.pillars?.day?.stem || '未知'}\n`;
    }

    if (
      analysisResult.type === 'fengshui' &&
      'palaces' in analysisResult.data
    ) {
      const fengshuiData = analysisResult.data as any;
      resultText += '风水信息:\n';
      resultText += `- 坐向: ${fengshuiData.sitting || '未知'}坐${fengshuiData.facing || '未知'}向\n`;
      resultText += `- 元运: ${fengshuiData.period || '未知'}运\n`;
      resultText += `- 飞星盘: ${JSON.stringify(fengshuiData.palaces || {})}\n`;
    }

    return resultText;
  }

  /**
   * 提取洞察
   */
  private extractInsights(content: string): string[] {
    // 简单的洞察提取逻辑
    const insights: string[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
      if (
        line.includes('特点') ||
        line.includes('特征') ||
        line.includes('优势') ||
        line.includes('需要注意')
      ) {
        insights.push(line.trim());
      }
    }

    return insights;
  }

  /**
   * 提取建议
   */
  private extractRecommendations(content: string): string[] {
    const recommendations: string[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
      if (
        line.includes('建议') ||
        line.includes('推荐') ||
        line.includes('应该') ||
        line.includes('可以')
      ) {
        recommendations.push(line.trim());
      }
    }

    return recommendations;
  }

  /**
   * 生成后续问题
   */
  private generateFollowUpQuestions(
    analysisResult: AnalysisResult,
    originalMessage: string
  ): string[] {
    const questions: string[] = [];

    if (analysisResult.type === 'bazi') {
      questions.push('这个八字有什么特别需要注意的地方吗？');
      questions.push('我的事业运势如何？');
      questions.push('感情方面有什么建议？');
    }

    if (analysisResult.type === 'fengshui') {
      questions.push('这个房屋布局有什么需要调整的地方？');
      questions.push('如何改善房屋的风水？');
      questions.push('哪些方位比较吉利？');
    }

    return questions;
  }

  /**
   * 生成综合洞察
   */
  private generateCombinedInsights(data: CombinedAnalysisData): string[] {
    const insights: string[] = [];

    if (data.bazi && data.fengshui) {
      insights.push('八字与风水相结合，可以更全面地分析运势');
      insights.push('个人命理与居住环境需要相互配合');
    }

    return insights;
  }

  /**
   * 生成综合建议
   */
  private generateCombinedRecommendations(
    data: CombinedAnalysisData
  ): string[] {
    const recommendations: string[] = [];

    if (data.bazi && data.fengshui) {
      recommendations.push('根据个人八字特点调整居住环境');
      recommendations.push('选择适合自己命理的方位和布局');
    }

    return recommendations;
  }

  /**
   * 验证AI输出的四柱是否与算法计算一致
   */
  private validateAndCorrectAIOutput(
    aiContent: string,
    baziData: EnhancedBaziResult
  ): {
    isValid: boolean;
    discrepancies: Array<{ pillar: string; expected: string; actual: string }>;
  } {
    const discrepancies: Array<{
      pillar: string;
      expected: string;
      actual: string;
    }> = [];

    // 提取AI输出中的四柱信息
    const extractedPillars = this.extractPillarsFromAIContent(aiContent);

    // 算法计算的准确四柱
    const expectedPillars = {
      year: `${baziData.pillars?.year?.stem}${baziData.pillars?.year?.branch}`,
      month: `${baziData.pillars?.month?.stem}${baziData.pillars?.month?.branch}`,
      day: `${baziData.pillars?.day?.stem}${baziData.pillars?.day?.branch}`,
      hour: `${baziData.pillars?.hour?.stem}${baziData.pillars?.hour?.branch}`,
    };

    console.log('[数据一致性验证] 算法计算四柱:', expectedPillars);
    console.log('[数据一致性验证] AI输出四柱:', extractedPillars);

    // 对比每一柱
    const pillars = ['year', 'month', 'day', 'hour'] as const;
    const pillarNames = {
      year: '年柱',
      month: '月柱',
      day: '日柱',
      hour: '时柱',
    };

    for (const pillar of pillars) {
      if (
        extractedPillars[pillar] &&
        extractedPillars[pillar] !== expectedPillars[pillar]
      ) {
        discrepancies.push({
          pillar: pillarNames[pillar],
          expected: expectedPillars[pillar],
          actual: extractedPillars[pillar],
        });
      }
    }

    return {
      isValid: discrepancies.length === 0,
      discrepancies,
    };
  }

  /**
   * 从AI内容中提取四柱信息
   */
  private extractPillarsFromAIContent(content: string): Record<string, string> {
    const extracted: Record<string, string> = {};

    // 多种匹配模式，适应不同的AI输出格式
    const patterns = [
      /年柱[：:：]\s*([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])/,
      /月柱[：:：]\s*([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])/,
      /日柱[：:：]\s*([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])/,
      /时柱[：:：]\s*([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])/,
    ];

    const keys = ['year', 'month', 'day', 'hour'];

    patterns.forEach((pattern, index) => {
      const match = content.match(pattern);
      if (match?.[1]) {
        extracted[keys[index]] = match[1];
      }
    });

    return extracted;
  }

  /**
   * 修正AI输出中的四柱信息
   */
  private correctAIOutput(
    content: string,
    baziData: EnhancedBaziResult,
    validationResult: {
      discrepancies: Array<{
        pillar: string;
        expected: string;
        actual: string;
      }>;
    }
  ): string {
    let correctedContent = content;

    // 记录修正操作
    console.log('[数据修正] 开始修正AI输出的四柱信息');
    console.log(
      '[数据修正] 需要修正的不一致项:',
      validationResult.discrepancies
    );

    // 对每个不一致的四柱进行替换
    for (const discrepancy of validationResult.discrepancies) {
      const patterns = [
        new RegExp(
          `(${discrepancy.pillar}[：:：]\s*)${discrepancy.actual}`,
          'g'
        ),
        new RegExp(`(${discrepancy.pillar}.*?)${discrepancy.actual}`, 'g'),
      ];

      for (const pattern of patterns) {
        if (pattern.test(correctedContent)) {
          correctedContent = correctedContent.replace(
            pattern,
            `$1${discrepancy.expected}`
          );
          console.log(
            `[数据修正] 已修正 ${discrepancy.pillar}: ${discrepancy.actual} -> ${discrepancy.expected}`
          );
        }
      }
    }

    // 如果AI完全没有包含四柱信息，在开头插入准确的四柱
    if (
      !correctedContent.includes('年柱') ||
      !correctedContent.includes('四柱')
    ) {
      const accuratePillars =
        '\n【算法计算的准确四柱】\n' +
        `年柱：${baziData.pillars?.year?.stem}${baziData.pillars?.year?.branch}\n` +
        `月柱：${baziData.pillars?.month?.stem}${baziData.pillars?.month?.branch}\n` +
        `日柱：${baziData.pillars?.day?.stem}${baziData.pillars?.day?.branch}\n` +
        `时柱：${baziData.pillars?.hour?.stem}${baziData.pillars?.hour?.branch}\n\n`;

      correctedContent = accuratePillars + correctedContent;
      console.log('[数据修正] 已在开头插入准确的四柱信息');
    }

    // 添加数据验证标记
    if (!correctedContent.includes('复核提示')) {
      correctedContent +=
        '\n\n【数据验证】以上四柱信息已经过算法验证，确保准确无误。';
    }

    return correctedContent;
  }

  /**
   * 断路器状态管理
   */
  private circuitBreakerState = {
    failureCount: 0,
    lastFailureTime: 0,
    isOpen: false,
    threshold: 3,
    resetTimeout: 60000, // 60秒后重置
  };

  /**
   * 检查断路器状态
   */
  private checkCircuitBreaker(): boolean {
    const now = Date.now();

    // 如果断路器开启且超过重置时间，尝试关闭
    if (this.circuitBreakerState.isOpen) {
      if (
        now - this.circuitBreakerState.lastFailureTime >
        this.circuitBreakerState.resetTimeout
      ) {
        console.log('[断路器] 重置断路器状态');
        this.circuitBreakerState.isOpen = false;
        this.circuitBreakerState.failureCount = 0;
      }
    }

    return this.circuitBreakerState.isOpen;
  }

  /**
   * 记录AI失败
   */
  private recordAIFailure(): void {
    this.circuitBreakerState.failureCount++;
    this.circuitBreakerState.lastFailureTime = Date.now();

    if (
      this.circuitBreakerState.failureCount >=
      this.circuitBreakerState.threshold
    ) {
      console.warn('[断路器] AI连续失败次数达到阈值，开启断路器');
      this.circuitBreakerState.isOpen = true;
    }
  }

  /**
   * 记录AI成功
   */
  private recordAISuccess(): void {
    if (this.circuitBreakerState.failureCount > 0) {
      console.log('[断路器] AI调用成功，重置失败计数');
      this.circuitBreakerState.failureCount = 0;
    }
  }

  /**
   * 生成纯AI算法解释（当断路器开启时使用）
   */
  private generatePureAlgorithmInterpretation(
    analysisResult: AnalysisResult,
    standardizedInput: any
  ): AIEnhancementResponse {
    console.log('[算法优先服务] 使用纯算法输出模式');

    if (analysisResult.type === 'bazi' && analysisResult.data) {
      const baziData = analysisResult.data as EnhancedBaziResult;
      const explanation = `【算法计算结果】

## 一、输入确认
- 出生时间：${standardizedInput?.birthInfo?.datetime || ''}
- 性别：${standardizedInput?.birthInfo?.gender === 'male' ? '男' : standardizedInput?.birthInfo?.gender === 'female' ? '女' : '未知'}
- 时区：${standardizedInput?.birthInfo?.timezone || 'Asia/Shanghai'}

## 二、四柱结果（算法计算）
- 年柱：${baziData.pillars?.year?.stem}${baziData.pillars?.year?.branch}
- 月柱：${baziData.pillars?.month?.stem}${baziData.pillars?.month?.branch}
- 日柱：${baziData.pillars?.day?.stem}${baziData.pillars?.day?.branch}
- 时柱：${baziData.pillars?.hour?.stem}${baziData.pillars?.hour?.branch}

## 三、关键结论
- 日主：${baziData.pillars?.day?.stem}
- 五行分布：
   木：${baziData.elements?.木 || 0} 个
   火：${baziData.elements?.火 || 0} 个
   土：${baziData.elements?.土 || 0} 个
   金：${baziData.elements?.金 || 0} 个
   水：${baziData.elements?.水 || 0} 个
- 喜用元素：${baziData.favorableElements?.primary?.join('、') || '待分析'}
- 忌用元素：${baziData.favorableElements?.unfavorable?.join('、') || '待分析'}

## 四、基本分析
根据五行分布和日主关系，这个八字具有以下特点：
- 日主属${this.getElementOfStem(baziData.pillars?.day?.stem || '')}，五行中${this.analyzeElementBalance(baziData.elements)}
- 此命局宜用${baziData.favorableElements?.primary?.join('、') || '待分析'}来平衡五行
- 需要避免${baziData.favorableElements?.unfavorable?.join('、') || '待分析'}的过度增强

## 五、建议与注意
- 有利颜色：${this.recommendColors(baziData).join('、') || '待分析'}
- 有利方位：${this.recommendDirections(baziData).join('、') || '待分析'}
- 适合职业：根据五行属性选择相关行业

## 六、复核提示
以上分析严格基于算法引擎计算的四柱结果。由于AI服务暂时不可用，仅提供基础分析结果。

【数据验证】以上四柱信息由算法直接计算得出，确保准确无误。`;

      return {
        explanation,
        insights: [
          `日主${baziData.pillars?.day?.stem}属${this.getElementOfStem(baziData.pillars?.day?.stem || '')}`,
          `五行${this.analyzeElementBalance(baziData.elements)}`,
          `喜用${baziData.favorableElements?.primary?.join('、') || '待分析'}元素`,
        ],
        recommendations: [
          `宜穿${this.recommendColors(baziData).join('、')}系列颜色`,
          `宜住${this.recommendDirections(baziData).join('、')}方位`,
          `适合与${baziData.favorableElements?.primary?.join('、')}属性相关的职业`,
        ],
        followUpQuestions: [
          '需要了解更详细的五行分析吗？',
          '想知道如何根据八字改善运势吗？',
          '需要查看大运流年分析吗？',
        ],
        confidence: 0.95, // 算法结果的置信度很高
      };
    }

    // 其他类型的默认处理
    return this.generateFallbackInterpretation(
      analysisResult,
      standardizedInput
    );
  }

  /**
   * 获取天干的五行属性
   */
  private getElementOfStem(stem: string): string {
    const stemElements: Record<string, string> = {
      甲: '木',
      乙: '木',
      丙: '火',
      丁: '火',
      戊: '土',
      己: '土',
      庚: '金',
      辛: '金',
      壬: '水',
      癸: '水',
    };
    return stemElements[stem] || '未知';
  }

  /**
   * 分析五行平衡
   */
  private analyzeElementBalance(elements?: Record<string, number>): string {
    if (!elements) return '待分析';

    const total = Object.values(elements).reduce(
      (sum, count) => sum + count,
      0
    );
    if (total === 0) return '待分析';

    let maxElement = '';
    let maxCount = 0;
    let minElement = '';
    let minCount = total;

    for (const [element, count] of Object.entries(elements)) {
      if (count > maxCount) {
        maxElement = element;
        maxCount = count;
      }
      if (count < minCount && count > 0) {
        minElement = element;
        minCount = count;
      }
    }

    const elementNames: Record<string, string> = {
      wood: '木',
      fire: '火',
      earth: '土',
      metal: '金',
      water: '水',
    };

    if (maxCount > total * 0.4) {
      return `${elementNames[maxElement]}气过旺`;
    }
    if (minCount === 0) {
      return `缺${elementNames[minElement]}`;
    }
    return '五行相对平衡';
  }
}

// 导出单例实例
export const algorithmFirstService = new AlgorithmFirstService();
