/**
 * QiFlow AI - 算法与AI对话系统集成服务
 *
 * 核心功能：
 * 1. 将八字计算算法与AI对话无缝集成
 * 2. 将风水算法与AI对话无缝集成
 * 3. 保持原有算法的准确性和完整性
 * 4. 提供自然流畅的交互体验
 * 5. 优化接口对接和数据传输效率
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
import { AnalysisType, detectAnalysisRequest } from './analysis-detection';
import { baziMasterProcessor } from './bazi-master-processor';
import { selectModelByCondition } from './config/ai-models-config';
import { createRouter } from './router';
import type { AIModelProvider } from './types';
import type { ConversationContext } from './types/conversation';

// 算法集成配置
export interface AlgorithmIntegrationConfig {
  enableBaziAnalysis: boolean;
  enableFengShuiAnalysis: boolean;
  enableRealTimeCalculation: boolean;
  cacheResults: boolean;
  maxCacheSize: number;
  confidenceThreshold: number;
  explanationLevel: 'basic' | 'detailed' | 'expert';
  responseStyle: 'conversational' | 'analytical' | 'educational';
}

// 用户输入解析结果
export interface UserInputAnalysis {
  intent:
    | 'bazi_analysis'
    | 'fengshui_analysis'
    | 'general_question'
    | 'explanation_request'
    | 'consultation';
  confidence: number;
  extractedData: {
    birthInfo?: Partial<EnhancedBirthData>;
    houseInfo?: Partial<GenerateFlyingStarInput>;
    keywords: string[];
    entities: string[];
  };
  requiresCalculation: boolean;
  calculationType?: 'bazi' | 'fengshui' | 'both';
  missingData: string[];
}

// 算法执行结果
export interface AlgorithmExecutionResult {
  type: 'bazi' | 'fengshui';
  success: boolean;
  data?: EnhancedBaziResult | GenerateFlyingStarOutput;
  error?: string;
  executionTime: number;
  confidence: {
    overall: number;
    reasoning: string;
    factors: {
      dataQuality: number;
      theoryMatch: number;
      complexity: number;
      culturalRelevance: number;
    };
  };
  cacheKey?: string;
}

// 集成响应结果
export interface IntegratedResponse {
  aiResponse: {
    id: string;
    provider: string;
    model: string;
    created: number;
    choices: Array<{
      index: number;
      message: {
        role: 'assistant';
        content: string;
      };
    }>;
    confidence?: {
      overall: number;
      reasoning: string;
      factors: {
        dataQuality: number;
        theoryMatch: number;
        complexity: number;
        culturalRelevance: number;
      };
    };
  };
  algorithmResults: AlgorithmExecutionResult[];
  suggestions: string[];
  followUpQuestions: string[];
  educationalContent?: {
    concepts: Array<{
      term: string;
      definition: string;
      pronunciation?: string;
      category: string;
      relatedTerms: string[];
      examples: string[];
    }>;
    resources: string[];
  };
  actionItems: string[];
  confidence?: number;
  metadata?: Record<string, unknown>;
  analysis?: AlgorithmExecutionResult[];
  summary?: string;
  highlights?: string[];
  nextSteps?: string[];
}

/**
 * 算法与AI对话系统集成服务
 */
export class AlgorithmIntegrationService {
  private config: AlgorithmIntegrationConfig;
  private cache = new Map<string, any>();
  private contextHistory = new Map<string, any>();

  constructor(config: Partial<AlgorithmIntegrationConfig> = {}) {
    this.config = {
      enableBaziAnalysis: true,
      enableFengShuiAnalysis: true,
      enableRealTimeCalculation: true,
      cacheResults: true,
      maxCacheSize: 1000,
      confidenceThreshold: 0.7,
      explanationLevel: 'detailed',
      responseStyle: 'conversational',
      ...config,
    };
  }

  /**
   * 处理用户消息的主入口 - 算法优先版本
   */
  async processUserMessage(
    message: string,
    sessionId: string,
    userId: string,
    attachments: any[] = []
  ): Promise<IntegratedResponse> {
    try {
      console.log(
        `[算法集成服务] 处理用户消息: ${message.substring(0, 100)}...`
      );

      // 1. 使用新的分析检测系统
      const analysisDetection = detectAnalysisRequest(message);
      console.log('[算法集成服务] 分析检测结果:', analysisDetection);

      // 2. 如果是八字分析请求，优先使用八字大师处理器
      if (
        analysisDetection.isAnalysisRequest &&
        (analysisDetection.analysisType === AnalysisType.BAZI ||
          analysisDetection.analysisType === AnalysisType.COMBINED)
      ) {
        console.log('[算法集成服务] 检测到八字分析请求，调用八字大师处理器');

        try {
          // 调用八字大师处理器
          const baziResponse = await baziMasterProcessor.processAnalysisRequest(
            {
              sessionId,
              userId,
              userInput: message,
              config: {
                language: 'zh-CN',
                responseStyle: 'professional',
                includeMetadata: true,
                enableValidation: true,
              },
            }
          );

          if (baziResponse.success) {
            // 构建标准的IntegratedResponse格式
            return {
              aiResponse: {
                id: baziResponse.analysisId || `bazi-${Date.now()}`,
                provider: 'qiflow-bazi-master',
                model: 'algorithm-first-bazi',
                created: Date.now(),
                choices: [
                  {
                    index: 0,
                    message: {
                      role: 'assistant',
                      content: baziResponse.content,
                    },
                  },
                ],
                confidence: {
                  overall: 0.95,
                  reasoning: '基于算法优先的八字大师专业分析',
                  factors: {
                    dataQuality: 0.95,
                    theoryMatch: 0.98,
                    complexity: 0.9,
                    culturalRelevance: 1.0,
                  },
                },
              },
              algorithmResults: [], // 八字大师处理器内部已处理算法调用
              suggestions: baziResponse.needsClarification?.suggestions || [
                '查看详细的八字分析报告',
                '了解您的五行平衡状况',
                '获取个性化的开运建议',
              ],
              followUpQuestions: [
                '您想了解哪个方面的运势？',
                '需要我分析您的大运情况吗？',
                '您对五行平衡有什么疑问？',
              ],
              actionItems: [
                '保存八字分析结果',
                '制定个人开运计划',
                '定期复查和调整',
              ],
              metadata: baziResponse.metadata,
            };
          }
          if (baziResponse.needsClarification) {
            // 需要澄清信息
            return {
              aiResponse: {
                id: `clarification-${Date.now()}`,
                provider: 'qiflow-bazi-master',
                model: 'algorithm-first-bazi',
                created: Date.now(),
                choices: [
                  {
                    index: 0,
                    message: {
                      role: 'assistant',
                      content: `我需要更多信息来为您进行准确的八字分析：

${baziResponse.needsClarification.missing.map((item: string) => `• ${item}`).join('\n')}

${baziResponse.needsClarification.suggestions.map((suggestion: string) => `💡 ${suggestion}`).join('\n')}

请提供这些信息，我将为您进行专业的八字排盘和命理分析。`,
                    },
                  },
                ],
              },
              algorithmResults: [],
              suggestions: baziResponse.needsClarification.suggestions,
              followUpQuestions: [
                '请提供您的准确出生时间',
                '请告诉我您的性别',
                '请确认您的出生地点',
              ],
              actionItems: [
                '准备准确的出生证明或户口本',
                '确认出生时间的准确性',
                '提供出生地点信息',
              ],
            };
          }
        } catch (error) {
          console.error('[算法集成服务] 八字大师处理器调用失败:', error);
          // 继续使用原有流程作为备用
        }
      }

      // 3. 原有的分析流程作为备用
      const inputAnalysis = await this.analyzeUserInput(message, attachments);
      console.log('[算法集成服务] 输入分析结果:', inputAnalysis);

      // 2. 获取或创建对话上下文
      const context = this.getOrCreateContext(sessionId, userId);

      // 3. 执行算法计算（如果需要）
      const algorithmResults: AlgorithmExecutionResult[] = [];
      if (inputAnalysis.requiresCalculation) {
        const results = await this.executeAlgorithms(inputAnalysis, context);
        algorithmResults.push(...results);
      }

      // 4. 生成AI响应
      const aiResponse = await this.generateAIResponse(
        message,
        inputAnalysis,
        algorithmResults,
        context
      );

      // 5. 生成建议和后续问题
      const suggestions = this.generateSuggestions(
        inputAnalysis,
        algorithmResults,
        context
      );
      const followUpQuestions = this.generateFollowUpQuestions(
        inputAnalysis,
        algorithmResults
      );
      const actionItems = this.generateActionItems(
        inputAnalysis,
        algorithmResults
      );

      // 6. 更新上下文
      this.updateContext(sessionId, message, aiResponse, algorithmResults);

      // 7. 生成教育内容（如果需要）
      const educationalContent = await this.generateEducationalContent(
        inputAnalysis,
        context
      );

      return {
        aiResponse,
        algorithmResults,
        suggestions,
        followUpQuestions,
        educationalContent,
        actionItems,
      };
    } catch (error) {
      console.error('[算法集成服务] 处理消息失败:', error);

      // 返回错误响应
      return {
        aiResponse: {
          id: Date.now().toString(),
          provider: 'openai',
          model: 'gpt-4',
          created: Date.now(),
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content:
                  '抱歉，我在处理您的请求时遇到了问题。请稍后再试或重新描述您的需求。',
              },
            },
          ],
          confidence: {
            overall: 0.1,
            reasoning: '系统错误导致置信度极低',
            factors: {
              dataQuality: 0,
              theoryMatch: 0,
              complexity: 1,
              culturalRelevance: 0,
            },
          },
        },
        algorithmResults: [],
        suggestions: ['重新描述您的问题', '检查输入信息是否完整'],
        followUpQuestions: [],
        actionItems: [],
      };
    }
  }

  /**
   * 分析用户输入，提取意图和数据
   */
  private async analyzeUserInput(
    message: string,
    attachments: any[] = []
  ): Promise<UserInputAnalysis> {
    const keywords = this.extractKeywords(message);
    const entities = this.extractEntities(message);

    // 意图识别
    let intent: UserInputAnalysis['intent'] = 'general_question';
    let confidence = 0.5;
    let requiresCalculation = false;
    let calculationType: 'bazi' | 'fengshui' | 'both' | undefined;

    // 八字相关关键词
    const baziKeywords = [
      '八字',
      '生辰',
      '出生',
      '命理',
      '五行',
      '天干',
      '地支',
      '大运',
      '流年',
      '十神',
    ];
    const baziMatches = baziKeywords.filter((keyword) =>
      message.includes(keyword)
    ).length;

    // 风水相关关键词
    const fengShuiKeywords = [
      '风水',
      '朝向',
      '户型',
      '布局',
      '飞星',
      '九宫',
      '罗盘',
      '方位',
      '坐向',
      '山向',
    ];
    const fengShuiMatches = fengShuiKeywords.filter((keyword) =>
      message.includes(keyword)
    ).length;

    // 解释请求关键词
    const explanationKeywords = [
      '什么是',
      '解释',
      '含义',
      '意思',
      '原理',
      '为什么',
      '如何',
    ];
    const explanationMatches = explanationKeywords.filter((keyword) =>
      message.includes(keyword)
    ).length;

    // 咨询请求关键词
    const consultationKeywords = [
      '建议',
      '推荐',
      '怎么办',
      '如何改善',
      '优化',
      '调整',
    ];
    const consultationMatches = consultationKeywords.filter((keyword) =>
      message.includes(keyword)
    ).length;

    // 确定主要意图
    if (baziMatches > 0 && fengShuiMatches > 0) {
      intent = 'general_question';
      confidence = 0.8;
      requiresCalculation = true;
      calculationType = 'both';
    } else if (baziMatches > fengShuiMatches) {
      intent = 'bazi_analysis';
      confidence = Math.min(0.9, 0.6 + baziMatches * 0.1);
      requiresCalculation = true;
      calculationType = 'bazi';
    } else if (fengShuiMatches > baziMatches) {
      intent = 'fengshui_analysis';
      confidence = Math.min(0.9, 0.6 + fengShuiMatches * 0.1);
      requiresCalculation = true;
      calculationType = 'fengshui';
    } else if (explanationMatches > 0) {
      intent = 'explanation_request';
      confidence = Math.min(0.8, 0.5 + explanationMatches * 0.1);
    } else if (consultationMatches > 0) {
      intent = 'consultation';
      confidence = Math.min(0.8, 0.5 + consultationMatches * 0.1);
    }

    // 提取出生信息
    const birthInfo = this.extractBirthInfo(message);

    // 提取房屋信息
    const houseInfo = this.extractHouseInfo(message);

    // 确定缺失数据
    const missingData: string[] = [];
    if (requiresCalculation) {
      if (calculationType === 'bazi' || calculationType === 'both') {
        if (!birthInfo.datetime) missingData.push('出生日期时间');
        if (!birthInfo.gender) missingData.push('性别');
      }
      if (calculationType === 'fengshui' || calculationType === 'both') {
        if (!houseInfo.facing?.degrees) missingData.push('房屋朝向');
        if (!houseInfo.observedAt) missingData.push('建造年份或观测时间');
      }
    }

    return {
      intent,
      confidence,
      extractedData: {
        birthInfo,
        houseInfo,
        keywords,
        entities,
      },
      requiresCalculation,
      calculationType,
      missingData,
    };
  }

  /**
   * 提取关键词
   */
  private extractKeywords(message: string): string[] {
    const allKeywords = [
      // 八字关键词
      '八字',
      '生辰',
      '出生',
      '命理',
      '五行',
      '天干',
      '地支',
      '大运',
      '流年',
      '十神',
      '年柱',
      '月柱',
      '日柱',
      '时柱',
      '甲子',
      '乙丑',
      '丙寅',
      '丁卯',
      '戊辰',
      '己巳',
      '庚午',
      '辛未',
      '壬申',
      '癸酉',
      '甲戌',
      '乙亥',
      '用神',
      '忌神',
      '喜神',
      '仇神',

      // 风水关键词
      '风水',
      '朝向',
      '户型',
      '布局',
      '飞星',
      '九宫',
      '罗盘',
      '方位',
      '坐向',
      '山向',
      '东',
      '南',
      '西',
      '北',
      '东南',
      '西南',
      '东北',
      '西北',
      '中宫',
      '乾',
      '坤',
      '震',
      '巽',
      '坎',
      '离',
      '艮',
      '兑',
      '玄空',
      '三元',
      '九运',
      '替卦',
      '兼向',
      '正向',

      // 通用关键词
      '分析',
      '计算',
      '预测',
      '建议',
      '优化',
      '改善',
      '调整',
      '布置',
      '摆放',
      '颜色',
      '吉凶',
      '旺衰',
      '强弱',
      '平衡',
      '和谐',
      '冲突',
      '相生',
      '相克',
      '相冲',
      '相合',
    ];

    return allKeywords.filter((keyword) => message.includes(keyword));
  }

  /**
   * 提取实体
   */
  private extractEntities(message: string): string[] {
    const entities: string[] = [];

    // 提取日期
    const dateRegex = /(\d{4})[年/-](\d{1,2})[月/-](\d{1,2})[日]?/g;
    let dateMatch;
    while ((dateMatch = dateRegex.exec(message)) !== null) {
      entities.push(`日期:${dateMatch[0]}`);
    }

    // 提取时间
    const timeRegex = /(d{1,2})[时点:](d{1,2})?[分]?/g;
    let timeMatch;
    while ((timeMatch = timeRegex.exec(message)) !== null) {
      entities.push(`时间:${timeMatch[0]}`);
    }

    // 提取方向
    const directions = ['东', '南', '西', '北', '东南', '西南', '东北', '西北'];
    directions.forEach((dir) => {
      if (message.includes(dir)) {
        entities.push(`方向:${dir}`);
      }
    });

    return entities;
  }

  /**
   * 提取出生信息
   */
  private extractBirthInfo(message: string): Partial<EnhancedBirthData> {
    const birthInfo: Partial<EnhancedBirthData> = {};

    // 提取性别
    if (
      message.includes('男') ||
      message.includes('先生') ||
      message.includes('男性')
    ) {
      birthInfo.gender = 'male';
    } else if (
      message.includes('女') ||
      message.includes('女士') ||
      message.includes('女性')
    ) {
      birthInfo.gender = 'female';
    }

    // 提取日期时间
    const dateTimeRegex =
      /(\d{4})[年/-](\d{1,2})[月/-](\d{1,2})[日]?\s*(\d{1,2})[时点:](\d{1,2})?[分]?/;
    const dateTimeMatch = message.match(dateTimeRegex);
    if (dateTimeMatch) {
      const [, year, month, day, hour, minute = '0'] = dateTimeMatch;
      birthInfo.datetime = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`;
      birthInfo.isTimeKnown = true;
    } else {
      // 只有日期
      const dateRegex = /(\d{4})[年/-](\d{1,2})[月/-](\d{1,2})[日]?/;
      const dateMatch = message.match(dateRegex);
      if (dateMatch) {
        const [, year, month, day] = dateMatch;
        birthInfo.datetime = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T12:00:00`;
        birthInfo.isTimeKnown = false;
      }
    }

    // 设置默认时区
    if (birthInfo.datetime) {
      birthInfo.timezone = 'Asia/Shanghai';
    }

    return birthInfo;
  }

  /**
   * 提取房屋信息
   */
  private extractHouseInfo(message: string): Partial<GenerateFlyingStarInput> {
    const houseInfo: Partial<GenerateFlyingStarInput> = {};

    // 提取朝向
    const directionMap: { [key: string]: number } = {
      正东: 90,
      东: 90,
      东南: 135,
      巽: 135,
      正南: 180,
      南: 180,
      西南: 225,
      坤: 225,
      正西: 270,
      西: 270,
      西北: 315,
      乾: 315,
      正北: 0,
      北: 0,
      东北: 45,
      艮: 45,
    };

    for (const [direction, degrees] of Object.entries(directionMap)) {
      if (message.includes(direction)) {
        houseInfo.facing = { degrees };
        break;
      }
    }

    // 提取年份
    const yearRegex = /(d{4})年/;
    const yearMatch = message.match(yearRegex);
    if (yearMatch) {
      const year = Number.parseInt(yearMatch[1]);
      houseInfo.observedAt = new Date(year, 0, 1);
    } else {
      // 默认使用当前年份
      houseInfo.observedAt = new Date();
    }

    return houseInfo;
  }

  /**
   * 执行算法计算
   */
  private async executeAlgorithms(
    inputAnalysis: UserInputAnalysis,
    context: any
  ): Promise<AlgorithmExecutionResult[]> {
    const results: AlgorithmExecutionResult[] = [];

    // 执行八字计算
    if (
      (inputAnalysis.calculationType === 'bazi' ||
        inputAnalysis.calculationType === 'both') &&
      this.config.enableBaziAnalysis
    ) {
      const baziResult = await this.executeBaziCalculation(
        inputAnalysis,
        context
      );
      if (baziResult) {
        results.push(baziResult);
      }
    }

    // 执行风水计算
    if (
      (inputAnalysis.calculationType === 'fengshui' ||
        inputAnalysis.calculationType === 'both') &&
      this.config.enableFengShuiAnalysis
    ) {
      const fengShuiResult = await this.executeFengShuiCalculation(
        inputAnalysis,
        context
      );
      if (fengShuiResult) {
        results.push(fengShuiResult);
      }
    }

    return results;
  }

  /**
   * 执行八字计算
   */
  private async executeBaziCalculation(
    inputAnalysis: UserInputAnalysis,
    context: any
  ): Promise<AlgorithmExecutionResult | null> {
    try {
      const startTime = Date.now();

      // 获取出生信息
      let birthInfo = inputAnalysis.extractedData.birthInfo;

      // 如果当前输入缺少信息，尝试从上下文获取
      if (!birthInfo?.datetime && context.userProfile?.baziInfo) {
        birthInfo = { ...context.userProfile.baziInfo, ...birthInfo };
      }

      // 检查必要信息
      if (!birthInfo?.datetime) {
        return {
          type: 'bazi',
          success: false,
          error: '缺少出生日期时间信息',
          executionTime: Date.now() - startTime,
          confidence: {
            overall: 0,
            reasoning: '缺少必要的出生信息',
            factors: {
              dataQuality: 0,
              theoryMatch: 0,
              complexity: 0,
              culturalRelevance: 0,
            },
          },
        };
      }

      // 生成缓存键
      const cacheKey = `bazi_${JSON.stringify(birthInfo)}`;

      // 检查缓存
      if (this.config.cacheResults && this.cache.has(cacheKey)) {
        const cachedResult = this.cache.get(cacheKey);
        return {
          type: 'bazi',
          success: true,
          data: cachedResult,
          executionTime: Date.now() - startTime,
          confidence: {
            overall: 0.95,
            reasoning: '使用缓存结果，数据一致性高',
            factors: {
              dataQuality: 0.95,
              theoryMatch: 0.95,
              complexity: 0.9,
              culturalRelevance: 1.0,
            },
          },
          cacheKey,
        };
      }

      // 执行计算
      const result = await computeBaziSmart(birthInfo as EnhancedBirthData);

      if (!result) {
        return {
          type: 'bazi',
          success: false,
          error: '八字计算失败',
          executionTime: Date.now() - startTime,
          confidence: {
            overall: 0,
            reasoning: '算法执行失败',
            factors: {
              dataQuality: 0.5,
              theoryMatch: 0,
              complexity: 1,
              culturalRelevance: 0.8,
            },
          },
        };
      }

      // 缓存结果
      if (this.config.cacheResults) {
        this.cache.set(cacheKey, result);
        // 限制缓存大小
        if (this.cache.size > this.config.maxCacheSize) {
          const keys = Array.from(this.cache.keys());
          if (keys.length > 0) {
            this.cache.delete(keys[0]);
          }
        }
      }

      // 更新用户档案
      if (context.userProfile) {
        context.userProfile.baziInfo = birthInfo;
      }

      return {
        type: 'bazi',
        success: true,
        data: result,
        executionTime: Date.now() - startTime,
        confidence: {
          overall: 0.9,
          reasoning: '八字计算成功，数据完整',
          factors: {
            dataQuality: birthInfo.isTimeKnown ? 0.95 : 0.8,
            theoryMatch: 0.95,
            complexity: 0.85,
            culturalRelevance: 1.0,
          },
        },
        cacheKey,
      };
    } catch (error) {
      console.error('[算法集成服务] 八字计算失败:', error);
      return {
        type: 'bazi',
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        executionTime: Date.now() - Date.now(),
        confidence: {
          overall: 0,
          reasoning: '计算过程中发生错误',
          factors: {
            dataQuality: 0.5,
            theoryMatch: 0,
            complexity: 1,
            culturalRelevance: 0.8,
          },
        },
      };
    }
  }

  /**
   * 执行风水计算
   */
  private async executeFengShuiCalculation(
    inputAnalysis: UserInputAnalysis,
    context: any
  ): Promise<AlgorithmExecutionResult | null> {
    try {
      const startTime = Date.now();

      // 获取房屋信息
      let houseInfo = inputAnalysis.extractedData.houseInfo;

      // 如果当前输入缺少信息，尝试从上下文获取
      if (
        (!houseInfo?.facing || !houseInfo?.observedAt) &&
        context.userProfile?.houseInfo
      ) {
        houseInfo = { ...context.userProfile.houseInfo, ...houseInfo };
      }

      // 检查必要信息
      if (!houseInfo?.facing?.degrees || !houseInfo?.observedAt) {
        return {
          type: 'fengshui',
          success: false,
          error: '缺少房屋朝向或建造时间信息',
          executionTime: Date.now() - startTime,
          confidence: {
            overall: 0,
            reasoning: '缺少必要的房屋信息',
            factors: {
              dataQuality: 0,
              theoryMatch: 0,
              complexity: 0,
              culturalRelevance: 0,
            },
          },
        };
      }

      // 生成缓存键
      const cacheKey = `fengshui_${JSON.stringify(houseInfo)}`;

      // 检查缓存
      if (this.config.cacheResults && this.cache.has(cacheKey)) {
        const cachedResult = this.cache.get(cacheKey);
        return {
          type: 'fengshui',
          success: true,
          data: cachedResult,
          executionTime: Date.now() - startTime,
          confidence: {
            overall: 0.95,
            reasoning: '使用缓存结果，数据一致性高',
            factors: {
              dataQuality: 0.95,
              theoryMatch: 0.95,
              complexity: 0.9,
              culturalRelevance: 1.0,
            },
          },
          cacheKey,
        };
      }

      // 执行计算
      const result = generateFlyingStar(houseInfo as GenerateFlyingStarInput);

      if (!result) {
        return {
          type: 'fengshui',
          success: false,
          error: '风水计算失败',
          executionTime: Date.now() - startTime,
          confidence: {
            overall: 0,
            reasoning: '算法执行失败',
            factors: {
              dataQuality: 0.5,
              theoryMatch: 0,
              complexity: 1,
              culturalRelevance: 0.8,
            },
          },
        };
      }

      // 缓存结果
      if (this.config.cacheResults) {
        this.cache.set(cacheKey, result);
        // 限制缓存大小
        if (this.cache.size > this.config.maxCacheSize) {
          const keys = Array.from(this.cache.keys());
          if (keys.length > 0) {
            this.cache.delete(keys[0]);
          }
        }
      }

      // 更新用户档案
      if (context.userProfile) {
        context.userProfile.houseInfo = houseInfo;
      }

      return {
        type: 'fengshui',
        success: true,
        data: result,
        executionTime: Date.now() - startTime,
        confidence: {
          overall: 0.9,
          reasoning: '风水计算成功，数据完整',
          factors: {
            dataQuality: 0.9,
            theoryMatch: 0.95,
            complexity: 0.85,
            culturalRelevance: 1.0,
          },
        },
        cacheKey,
      };
    } catch (error) {
      console.error('[算法集成服务] 风水计算失败:', error);
      return {
        type: 'fengshui',
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        executionTime: Date.now() - Date.now(),
        confidence: {
          overall: 0,
          reasoning: '计算过程中发生错误',
          factors: {
            dataQuality: 0.5,
            theoryMatch: 0,
            complexity: 1,
            culturalRelevance: 0.8,
          },
        },
      };
    }
  }

  /**
   * 生成AI响应
   */
  private async generateAIResponse(
    message: string,
    inputAnalysis: UserInputAnalysis,
    algorithmResults: AlgorithmExecutionResult[],
    context: any
  ): Promise<IntegratedResponse['aiResponse']> {
    try {
      // 创建 AI 路由器
      const aiRouter = createRouter();

      // 构建 AI 请求消息
      const aiMessages = [
        {
          role: 'system' as const,
          content: `你是 QiFlow AI 八字风水大师，专门为用户提供专业的八字命理和玄空飞星风水分析。

你的职责：
1. 基于用户提供的出生信息进行八字分析
2. 结合房屋朝向进行风水分析
3. 提供专业、准确、易懂的建议
4. 保持传统命理学的严谨性

当前分析结果：
${algorithmResults.length > 0 ? JSON.stringify(algorithmResults, null, 2) : '暂无算法分析结果'}

请基于以上信息回答用户的问题。`,
        },
        {
          role: 'user' as const,
          content: message,
        },
      ];

      // 调用 AI 服务
      const aiResponse = await aiRouter.chat({
        messages: aiMessages,
        model: 'gpt-4o-mini', // 使用低成本模型
        maxTokens: 1000,
        temperature: 0.7,
      });

      // 计算置信度
      const confidence = this.calculateOverallConfidence(
        inputAnalysis,
        algorithmResults
      );

      return {
        id: aiResponse.id || Date.now().toString(),
        provider: aiResponse.provider || 'qiflow',
        model: aiResponse.model || 'integrated-ai',
        created: aiResponse.created || Date.now(),
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant' as const,
              content:
                aiResponse.choices?.[0]?.message?.content ||
                '抱歉，我暂时无法回答您的问题。',
            },
          },
        ],
        confidence,
      };
    } catch (error) {
      console.error('[算法集成服务] AI响应生成失败:', error);

      // 生成智能回退响应
      const fallbackContent = this.generateSimpleFallbackResponse(
        message,
        inputAnalysis,
        algorithmResults
      );

      return {
        id: Date.now().toString(),
        provider: 'qiflow',
        model: 'integrated-ai',
        created: Date.now(),
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant' as const,
              content: fallbackContent,
            },
          },
        ],
        confidence: {
          overall: 0.6,
          reasoning: 'AI服务不可用，使用智能回退响应',
          factors: {
            dataQuality: 0.7,
            theoryMatch: 0.5,
            complexity: 0.4,
            culturalRelevance: 0.9,
          },
        },
      };
    }
  }

  /**
   * 生成响应内容
   */
  private generateResponseContent(
    message: string,
    inputAnalysis: UserInputAnalysis,
    algorithmResults: AlgorithmExecutionResult[]
  ): string {
    let response = '';

    // 根据意图生成不同的响应
    if (inputAnalysis.intent === 'bazi_analysis') {
      response += '根据您提供的出生信息，我来为您分析八字命理：\n\n';

      const baziResult = algorithmResults.find(
        (r) => r.type === 'bazi' && r.success
      );
      if (baziResult?.data) {
        const data = baziResult.data as EnhancedBaziResult;
        response += `🎯 **八字排盘结果**
`;
        response += `年柱：${data.pillars?.year?.stem || ''}${data.pillars?.year?.branch || ''}
`;
        response += `月柱：${data.pillars?.month?.stem || ''}${data.pillars?.month?.branch || ''}
`;
        response += `日柱：${data.pillars?.day?.stem || ''}${data.pillars?.day?.branch || ''}
`;
        response += `时柱：${data.pillars?.hour?.stem || ''}${data.pillars?.hour?.branch || ''}

`;

        response += `🌟 **五行分析**
`;
        response += `五行分布：${JSON.stringify(data.elements)}
`;
        response += `日主：${data.pillars?.day?.stem || '未知'}（${data.dayMasterStrength?.strength || '未知'}）

`;

        response += `📊 **命理特征**
`;
        response += `用神：${data.yongshen?.favorable?.join('、') || '未知'}
`;
        response += `忌神：${data.yongshen?.unfavorable?.join('、') || '未知'}
`;
      } else {
        response +=
          '抱歉，八字计算遇到问题。请检查您提供的出生信息是否准确完整。\n';
      }
    } else if (inputAnalysis.intent === 'fengshui_analysis') {
      response += '根据您提供的房屋信息，我来为您分析风水布局：\n\n';

      const fengShuiResult = algorithmResults.find(
        (r) => r.type === 'fengshui' && r.success
      );
      if (fengShuiResult?.data) {
        const data = fengShuiResult.data as GenerateFlyingStarOutput;
        response += `🏠 **九宫飞星分析**
`;
        response += `运盘：${data.period}运

`;

        response += `⭐ **各宫位分析**
`;
        if (data.plates?.period) {
          data.plates.period.forEach((cell, index) => {
            response += `${index + 1}宫：山星${cell.mountainStar}，向星${cell.facingStar}，运星${cell.periodStar || data.period}
`;
          });
        }

        response += `
💡 **风水建议**
`;
        response += `根据飞星分布，建议重点关注旺星方位的布局优化。
`;
      } else {
        response +=
          '抱歉，风水计算遇到问题。请检查您提供的房屋朝向和建造时间是否准确。\n';
      }
    } else if (inputAnalysis.intent === 'explanation_request') {
      response += '我来为您解释相关的概念：\n\n';

      inputAnalysis.extractedData.keywords.forEach((keyword) => {
        if (keyword === '八字') {
          response += `📚 **八字**：根据出生年、月、日、时的天干地支组合，共八个字，用于分析个人命理特征。

`;
        } else if (keyword === '风水') {
          response += `🏮 **风水**：研究环境与人的关系，通过调整空间布局来改善运势的学问。

`;
        } else if (keyword === '五行') {
          response += `🌟 **五行**：金、木、水、火、土五种基本元素，相互作用影响万物变化。

`;
        } else if (keyword === '飞星') {
          response += `⭐ **飞星**：九宫飞星理论中的九颗星，按特定规律在九宫中飞布，影响各方位吉凶。

`;
        }
      });
    } else {
      response += '您好！我是QiFlow AI大师，专业的八字命理与玄空风水顾问。\n\n';
      response += '我可以为您提供以下服务：\n';
      response += '🎯 八字排盘与命理分析\n';
      response += '🏠 九宫飞星与风水布局\n';
      response += '📚 传统文化知识解答\n';
      response += '💡 个性化改运建议\n\n';
      response += '请告诉我您的具体需求，我会为您提供专业的分析和建议。';
    }

    // 添加缺失数据提示
    if (inputAnalysis.missingData.length > 0) {
      response += `

⚠️ **需要补充的信息**：${inputAnalysis.missingData.join('、')}`;
    }

    return response;
  }

  /**
   * 计算整体置信度
   */
  private calculateOverallConfidence(
    inputAnalysis: UserInputAnalysis,
    algorithmResults: AlgorithmExecutionResult[]
  ): IntegratedResponse['aiResponse']['confidence'] {
    const factors = {
      dataQuality: 0,
      theoryMatch: 0,
      complexity: 0,
      culturalRelevance: 0,
    };

    let totalWeight = 0;

    // 输入分析置信度
    factors.dataQuality += inputAnalysis.confidence * 0.3;
    factors.theoryMatch += inputAnalysis.confidence * 0.3;
    totalWeight += 0.6;

    // 算法结果置信度
    algorithmResults.forEach((result) => {
      if (result.success) {
        factors.dataQuality += result.confidence.factors.dataQuality * 0.2;
        factors.theoryMatch += result.confidence.factors.theoryMatch * 0.2;
        factors.complexity += result.confidence.factors.complexity * 0.2;
        factors.culturalRelevance +=
          result.confidence.factors.culturalRelevance * 0.2;
        totalWeight += 0.8;
      }
    });

    // 标准化
    if (totalWeight > 0) {
      factors.dataQuality /= totalWeight;
      factors.theoryMatch /= totalWeight;
      factors.complexity /= totalWeight;
      factors.culturalRelevance /= totalWeight;
    }

    const overall =
      (factors.dataQuality +
        factors.theoryMatch +
        factors.complexity +
        factors.culturalRelevance) /
      4;

    let reasoning = '基于输入分析和算法计算结果的综合评估';
    if (overall > 0.8) {
      reasoning = '数据完整，算法计算准确，置信度很高';
    } else if (overall > 0.6) {
      reasoning = '数据基本完整，算法计算正常，置信度较高';
    } else if (overall > 0.4) {
      reasoning = '数据部分缺失或算法计算有限，置信度中等';
    } else {
      reasoning = '数据不足或算法计算失败，置信度较低';
    }

    return {
      overall,
      reasoning,
      factors,
    };
  }

  /**
   * 生成建议
   */
  private generateSuggestions(
    inputAnalysis: UserInputAnalysis,
    algorithmResults: AlgorithmExecutionResult[],
    context: any
  ): string[] {
    const suggestions: string[] = [];

    // 基于缺失数据的建议
    if (inputAnalysis.missingData.length > 0) {
      inputAnalysis.missingData.forEach((missing) => {
        if (missing === '出生日期时间') {
          suggestions.push('请提供准确的出生日期和时间');
        } else if (missing === '性别') {
          suggestions.push('请告诉我您的性别');
        } else if (missing === '房屋朝向') {
          suggestions.push('请使用罗盘测量房屋的准确朝向');
        } else if (missing === '建造年份或观测时间') {
          suggestions.push('请提供房屋的建造年份');
        }
      });
    }

    // 基于算法结果的建议
    algorithmResults.forEach((result) => {
      if (result.success) {
        if (result.type === 'bazi') {
          suggestions.push('查看详细的八字分析报告');
          suggestions.push('了解您的五行平衡状况');
          suggestions.push('获取个性化的开运建议');
        } else if (result.type === 'fengshui') {
          suggestions.push('查看九宫飞星分析结果');
          suggestions.push('获取房间布局优化建议');
          suggestions.push('了解各方位的吉凶情况');
        }
      } else {
        suggestions.push('重新检查输入信息的准确性');
        suggestions.push('尝试提供更详细的信息');
      }
    });

    // 通用建议
    if (suggestions.length === 0) {
      suggestions.push('尝试提供更具体的问题');
      suggestions.push('查看使用帮助和示例');
    }

    return [...new Set(suggestions)].slice(0, 5);
  }

  /**
   * 生成后续问题
   */
  private generateFollowUpQuestions(
    inputAnalysis: UserInputAnalysis,
    algorithmResults: AlgorithmExecutionResult[]
  ): string[] {
    const questions: string[] = [];

    // 基于意图的问题
    if (inputAnalysis.intent === 'bazi_analysis') {
      questions.push('您想了解哪个方面的运势？');
      questions.push('需要我分析您的大运情况吗？');
      questions.push('您对五行平衡有什么疑问？');
    } else if (inputAnalysis.intent === 'fengshui_analysis') {
      questions.push('您希望重点优化哪个房间？');
      questions.push('需要我解释飞星的具体含义吗？');
      questions.push('您想了解如何化解不利的风水吗？');
    } else if (inputAnalysis.intent === 'consultation') {
      questions.push('您的主要关注点是什么？');
      questions.push('需要我提供具体的改善方案吗？');
      questions.push('您希望从哪个方面开始调整？');
    }

    // 基于算法结果的问题
    algorithmResults.forEach((result) => {
      if (result.success) {
        if (result.type === 'bazi') {
          questions.push('您想深入了解您的命理特征吗？');
          questions.push('需要我分析您的流年运势吗？');
        } else if (result.type === 'fengshui') {
          questions.push('您想了解如何布置各个房间吗？');
          questions.push('需要我推荐合适的颜色搭配吗？');
        }
      }
    });

    return [...new Set(questions)].slice(0, 3);
  }

  /**
   * 生成行动项目
   */
  private generateActionItems(
    inputAnalysis: UserInputAnalysis,
    algorithmResults: AlgorithmExecutionResult[]
  ): string[] {
    const actionItems: string[] = [];

    // 基于缺失数据的行动项目
    if (inputAnalysis.missingData.length > 0) {
      if (inputAnalysis.missingData.includes('出生日期时间')) {
        actionItems.push('准备准确的出生证明或户口本');
      }
      if (inputAnalysis.missingData.includes('房屋朝向')) {
        actionItems.push('使用罗盘或指南针测量房屋朝向');
      }
    }

    // 基于算法结果的行动项目
    algorithmResults.forEach((result) => {
      if (result.success) {
        if (result.type === 'bazi') {
          actionItems.push('保存八字分析结果');
          actionItems.push('制定个人开运计划');
        } else if (result.type === 'fengshui') {
          actionItems.push('绘制房屋平面图');
          actionItems.push('标记各房间功能');
          actionItems.push('制定布局调整方案');
        }
      }
    });

    // 通用行动项目
    if (algorithmResults.some((r) => r.success)) {
      actionItems.push('定期复查和调整');
      actionItems.push('记录改善效果');
    }

    return [...new Set(actionItems)].slice(0, 5);
  }

  /**
   * 生成教育内容
   */
  private async generateEducationalContent(
    inputAnalysis: UserInputAnalysis,
    context: any
  ): Promise<IntegratedResponse['educationalContent'] | undefined> {
    if (context.userProfile?.expertise === 'advanced') {
      return undefined; // 高级用户不需要基础教育内容
    }

    const concepts: Array<{
      term: string;
      definition: string;
      pronunciation?: string;
      category: string;
      relatedTerms: string[];
      examples: string[];
    }> = [];
    const resources: string[] = [];

    // 基于关键词添加概念解释
    inputAnalysis.extractedData.keywords.forEach((keyword) => {
      if (keyword === '八字' && !concepts.find((c) => c.term === '八字')) {
        concepts.push({
          term: '八字',
          definition:
            '根据出生年、月、日、时的天干地支组合，共八个字，用于分析个人命理特征',
          pronunciation: 'bā zì',
          category: 'bazi',
          relatedTerms: ['天干', '地支', '四柱', '命理'],
          examples: ['甲子年、乙丑月、丙寅日、丁卯时'],
        });
      }
      if (keyword === '风水' && !concepts.find((c) => c.term === '风水')) {
        concepts.push({
          term: '风水',
          definition: '研究环境与人的关系，通过调整空间布局来改善运势的学问',
          pronunciation: 'fēng shuǐ',
          category: 'fengshui',
          relatedTerms: ['气场', '布局', '方位', '朝向'],
          examples: ['坐北朝南', '藏风聚气', '山环水抱'],
        });
      }
    });

    // 基于意图推荐资源
    if (inputAnalysis.intent === 'bazi_analysis') {
      resources.push('《八字基础入门》视频教程');
      resources.push('《五行理论详解》文章');
      resources.push('《天干地支对照表》参考资料');
    } else if (inputAnalysis.intent === 'fengshui_analysis') {
      resources.push('《风水基础知识》入门指南');
      resources.push('《九宫飞星详解》专题文章');
      resources.push('《罗盘使用方法》实操视频');
    }

    // 通用资源
    resources.push('《中华传统文化概览》');
    resources.push('在线风水罗盘工具');
    resources.push('专家在线咨询服务');

    return concepts.length > 0 || resources.length > 0
      ? {
          concepts: concepts.slice(0, 3),
          resources: resources.slice(0, 5),
        }
      : undefined;
  }

  /**
   * 生成简化回退响应
   */
  private generateSimpleFallbackResponse(
    message: string,
    inputAnalysis: UserInputAnalysis,
    algorithmResults: AlgorithmExecutionResult[]
  ): string {
    // 基于用户意图生成简化响应
    if (inputAnalysis.intent === 'bazi_analysis') {
      return `您好！我是QiFlow AI八字风水大师。

关于八字分析，我需要您提供以下信息：
- 出生日期（年、月、日）
- 出生时间（时、分）
- 性别

请按照以下格式提供信息：
"我是男性，1990年5月15日14时30分出生"

这样我就能为您进行准确的八字排盘和命理分析了。

当前AI服务暂时不可用，但我可以基于传统理论为您提供基础分析。`;
    }
    if (inputAnalysis.intent === 'fengshui_analysis') {
      return `您好！我是QiFlow AI八字风水大师。

关于风水分析，我需要您提供以下信息：
- 房屋朝向（如：正南、东南、正东等）
- 建造年份或观测时间

请按照以下格式提供信息：
"我的房子是正南朝向，2020年建造"

这样我就能为您进行准确的九宫飞星风水分析了。

当前AI服务暂时不可用，但我可以基于传统理论为您提供基础分析。`;
    }
    if (inputAnalysis.intent === 'explanation_request') {
      return `您好！我是QiFlow AI八字风水大师。

我来为您解释相关的概念：

📚 **八字**：根据出生年、月、日、时的天干地支组合，共八个字，用于分析个人命理特征。

🏮 **风水**：研究环境与人的关系，通过调整空间布局来改善运势的学问。

🌟 **五行**：金、木、水、火、土五种基本元素，相互作用影响万物变化。

⭐ **飞星**：九宫飞星理论中的九颗星，按特定规律在九宫中飞布，影响各方位吉凶。

如需更详细的解释，请稍后重试或提出具体问题。`;
    }
    return `您好！我是QiFlow AI八字风水大师，专业的八字命理与玄空风水顾问。

我可以为您提供以下服务：
🎯 八字排盘与命理分析
🏠 九宫飞星与风水布局
📚 传统文化知识解答
💡 个性化改运建议

请告诉我您的具体需求，我会为您提供专业的分析和建议。

当前AI服务暂时不可用，但我可以基于传统理论为您提供基础分析。如需更详细的分析，请稍后重试。`;
  }

  /**
   * 生成智能回退响应
   */
  private generateIntelligentFallbackResponse(
    message: string,
    inputAnalysis: UserInputAnalysis,
    algorithmResults: AlgorithmExecutionResult[]
  ): string {
    // 基于用户意图和算法结果生成智能响应
    if (inputAnalysis.intent === 'bazi_analysis') {
      return this.generateBaziFallbackResponse(
        message,
        inputAnalysis,
        algorithmResults
      );
    }
    if (inputAnalysis.intent === 'fengshui_analysis') {
      return this.generateFengShuiFallbackResponse(
        message,
        inputAnalysis,
        algorithmResults
      );
    }
    if (inputAnalysis.intent === 'explanation_request') {
      return this.generateExplanationFallbackResponse(message, inputAnalysis);
    }
    return this.generateGeneralFallbackResponse(
      message,
      inputAnalysis,
      algorithmResults
    );
  }

  /**
   * 生成八字分析回退响应
   */
  private generateBaziFallbackResponse(
    message: string,
    inputAnalysis: UserInputAnalysis,
    algorithmResults: AlgorithmExecutionResult[]
  ): string {
    const baziResult = algorithmResults.find(
      (r) => r.type === 'bazi' && r.success
    );

    if (baziResult?.data) {
      const data = baziResult.data as any;
      return `根据您的出生信息，我为您分析八字命理：

🎯 **八字排盘**
年柱：${data.pillars?.year?.stem || '未知'}${data.pillars?.year?.branch || '未知'}
月柱：${data.pillars?.month?.stem || '未知'}${data.pillars?.month?.branch || '未知'}
日柱：${data.pillars?.day?.stem || '未知'}${data.pillars?.day?.branch || '未知'}
时柱：${data.pillars?.hour?.stem || '未知'}${data.pillars?.hour?.branch || '未知'}

🌟 **五行分析**
五行分布：${JSON.stringify(data.elements || {})}

💡 **命理建议**
${data.yongshen?.favorable ? `用神：${data.yongshen.favorable.join('、')}` : ''}
${data.yongshen?.unfavorable ? `忌神：${data.yongshen.unfavorable.join('、')}` : ''}

由于当前AI服务暂时不可用，以上是基于传统八字理论的基础分析。如需更详细的分析，请稍后重试。`;
    }
    return `您好！我是QiFlow AI八字风水大师。

关于八字分析，我需要您提供以下信息：
- 出生日期（年、月、日）
- 出生时间（时、分）
- 性别

请按照以下格式提供信息：
"我是男性，1990年5月15日14时30分出生"

这样我就能为您进行准确的八字排盘和命理分析了。`;
  }

  /**
   * 生成风水分析回退响应
   */
  private generateFengShuiFallbackResponse(
    message: string,
    inputAnalysis: UserInputAnalysis,
    algorithmResults: AlgorithmExecutionResult[]
  ): string {
    const fengShuiResult = algorithmResults.find(
      (r) => r.type === 'fengshui' && r.success
    );

    if (fengShuiResult?.data) {
      const data = fengShuiResult.data as any;
      return `根据您房屋的信息，我为您分析风水布局：

🏠 **九宫飞星分析**
运盘：${data.period || '未知'}运

⭐ **各宫位分析**
${Object.entries(data.plates || {})
  .map(
    ([position, plate]: [string, any]) =>
      `${position}宫：山星${plate.mountain || '未知'}，向星${plate.facing || '未知'}，运星${plate.period || '未知'}`
  )
  .join('\n')}

💡 **风水建议**
根据飞星分布，建议重点关注旺星方位的布局优化。避免在衰星方位进行重要活动。

由于当前AI服务暂时不可用，以上是基于玄空飞星理论的基础分析。如需更详细的分析，请稍后重试。`;
    }
    return `您好！我是QiFlow AI八字风水大师。

关于风水分析，我需要您提供以下信息：
- 房屋朝向（如：正南、东南、正东等）
- 建造年份或观测时间

请按照以下格式提供信息：
"我的房子是正南朝向，2020年建造"

这样我就能为您进行准确的九宫飞星风水分析了。`;
  }

  /**
   * 生成解释请求回退响应
   */
  private generateExplanationFallbackResponse(
    message: string,
    inputAnalysis: UserInputAnalysis
  ): string {
    const keywords = inputAnalysis.extractedData.keywords;
    let response = '我来为您解释相关的概念：\n\n';

    keywords.forEach((keyword) => {
      switch (keyword) {
        case '八字':
          response +=
            '📚 **八字**：根据出生年、月、日、时的天干地支组合，共八个字，用于分析个人命理特征。\n\n';
          break;
        case '风水':
          response +=
            '🏮 **风水**：研究环境与人的关系，通过调整空间布局来改善运势的学问。\n\n';
          break;
        case '五行':
          response +=
            '🌟 **五行**：金、木、水、火、土五种基本元素，相互作用影响万物变化。\n\n';
          break;
        case '飞星':
          response +=
            '⭐ **飞星**：九宫飞星理论中的九颗星，按特定规律在九宫中飞布，影响各方位吉凶。\n\n';
          break;
        case '天干':
          response +=
            '🔤 **天干**：甲、乙、丙、丁、戊、己、庚、辛、壬、癸十个符号，代表阳性能量。\n\n';
          break;
        case '地支':
          response +=
            '🐭 **地支**：子、丑、寅、卯、辰、巳、午、未、申、酉、戌、亥十二个符号，代表阴性能量。\n\n';
          break;
      }
    });

    response += '如需更详细的解释，请稍后重试或提出具体问题。';
    return response;
  }

  /**
   * 生成通用回退响应
   */
  private generateGeneralFallbackResponse(
    message: string,
    inputAnalysis: UserInputAnalysis,
    algorithmResults: AlgorithmExecutionResult[]
  ): string {
    return `您好！我是QiFlow AI八字风水大师，专业的八字命理与玄空风水顾问。

我可以为您提供以下服务：
🎯 八字排盘与命理分析
🏠 九宫飞星与风水布局
📚 传统文化知识解答
💡 个性化改运建议

请告诉我您的具体需求，我会为您提供专业的分析和建议。

当前AI服务暂时不可用，但我可以基于传统理论为您提供基础分析。如需更详细的分析，请稍后重试。`;
  }

  /**
   * 生成备用响应
   */
  private generateFallbackResponse(
    inputAnalysis: UserInputAnalysis,
    algorithmResults: AlgorithmExecutionResult[]
  ): string {
    let response = '我理解您的问题，';

    // 基于意图生成响应
    if (inputAnalysis.intent === 'bazi_analysis') {
      response += '关于八字分析，';
      if (algorithmResults.some((r) => r.success && r.type === 'bazi')) {
        response += '我已经完成了您的八字计算。';
      } else {
        response += '我需要您的准确出生信息才能进行分析。';
      }
    } else if (inputAnalysis.intent === 'fengshui_analysis') {
      response += '关于风水分析，';
      if (algorithmResults.some((r) => r.success && r.type === 'fengshui')) {
        response += '我已经完成了您房屋的风水计算。';
      } else {
        response += '我需要您房屋的朝向和建造时间信息。';
      }
    } else {
      response += '我会尽力为您提供专业的建议。';
    }

    // 添加缺失数据提示
    if (inputAnalysis.missingData.length > 0) {
      response += `请提供以下信息：${inputAnalysis.missingData.join('、')}。`;
    }

    response += '如果您有任何疑问，请随时告诉我。';

    return response;
  }

  /**
   * 获取或创建对话上下文
   */
  private getOrCreateContext(sessionId: string, userId: string): any {
    if (this.contextHistory.has(sessionId)) {
      return this.contextHistory.get(sessionId);
    }

    const context = {
      sessionId,
      userId,
      history: [],
      userProfile: {
        expertise: 'beginner',
        interests: [],
        preferredStyle: 'detailed',
      },
      relatedTopics: [],
    };

    this.contextHistory.set(sessionId, context);
    return context;
  }

  /**
   * 更新对话上下文
   */
  private updateContext(
    sessionId: string,
    userMessage: string,
    aiResponse: IntegratedResponse['aiResponse'],
    algorithmResults: AlgorithmExecutionResult[]
  ): void {
    const context = this.contextHistory.get(sessionId);
    if (!context) return;

    // 添加历史记录
    context.history.push({
      userMessage,
      aiResponse: aiResponse.choices[0]?.message.content || '',
      timestamp: new Date(),
      confidence: aiResponse.confidence,
    });

    // 限制历史记录长度
    if (context.history.length > 20) {
      context.history = context.history.slice(-20);
    }

    // 更新当前话题
    algorithmResults.forEach((result) => {
      if (result.success) {
        if (result.type === 'bazi') {
          context.currentTopic = '八字命理';
          if (!context.relatedTopics.includes('八字分析')) {
            context.relatedTopics.push('八字分析');
          }
        } else if (result.type === 'fengshui') {
          context.currentTopic = '风水布局';
          if (!context.relatedTopics.includes('风水分析')) {
            context.relatedTopics.push('风水分析');
          }
        }
      }
    });

    // 限制相关话题数量
    if (context.relatedTopics.length > 10) {
      context.relatedTopics = context.relatedTopics.slice(-10);
    }

    this.contextHistory.set(sessionId, context);
  }

  /**
   * 清理缓存
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存统计
   */
  public getCacheStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxCacheSize,
      hitRate: 0.85, // 模拟命中率
    };
  }

  /**
   * 更新配置
   */
  public updateConfig(newConfig: Partial<AlgorithmIntegrationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 获取当前配置
   */
  public getConfig(): AlgorithmIntegrationConfig {
    return { ...this.config };
  }
}

export interface ProviderStrategy {
  provider: AIModelProvider;
  model: string;
  temperature: number;
  maxTokens: number;
}

export const buildStrategyPlan = (
  context: ConversationContext
): ProviderStrategy => {
  const preferences = context.userProfile.preferences;
  const topicTags = context.topicTags ?? [];

  // 使用配置文件中的规则进行模型选择
  let condition = 'default';

  if (preferences.responseStyle === 'educational') {
    condition = 'educational';
  } else if (
    preferences.responseStyle === 'detailed' ||
    topicTags.includes('fengshui')
  ) {
    condition = 'fengshui';
  } else if (preferences.culturalBackground === 'western') {
    condition = 'western';
  }

  const rule = selectModelByCondition(condition);
  if (rule) {
    return {
      provider: rule.provider as any,
      model: rule.model,
      temperature: rule.temperature,
      maxTokens: rule.maxTokens,
    };
  }

  // 回退到默认配置
  return {
    provider: 'deepseek',
    model: 'deepseek-chat',
    temperature: 0.3,
    maxTokens: 1200,
  };
};

// 创建默认实例
export const algorithmIntegrationService = new AlgorithmIntegrationService();
