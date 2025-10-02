/**
 * AI对话服务
 * 提供智能对话、上下文管理和多模态交互功能
 */

// import type { ChatMessage, ChatSession } from '@/components/chat/chat-interface';

// 临时类型定义
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  type?: string;
  confidence?: number;
  suggestions?: any;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  title?: string;
  context?: any;
  settings?: any;
}

// AI模型配置
export interface AIModelConfig {
  provider: 'openai' | 'anthropic' | 'local';
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  apiKey?: string;
  baseURL?: string;
  timeout?: number;
  retryAttempts?: number;
}

// 对话上下文
export interface ChatContext {
  sessionId: string;
  userId: string;
  propertyId?: string;
  analysisId?: string;
  conversationHistory: ChatMessage[];
  currentTopic: string;
  userPreferences: {
    language: string;
    responseStyle: 'professional' | 'friendly' | 'detailed' | 'concise';
    includeImages: boolean;
    includeAnalysis: boolean;
    includeSources: boolean;
  };
  systemPrompt: string;
  maxContextLength: number;
}

// 响应生成配置
export interface ResponseConfig {
  includeSuggestions: boolean;
  includeAnalysis: boolean;
  includeSources: boolean;
  maxSuggestions: number;
  responseLength: 'short' | 'medium' | 'long';
  tone: 'formal' | 'casual' | 'technical' | 'educational';
}

// AI响应结果
export interface AIResponse {
  content: string;
  confidence: number;
  suggestions: string[];
  analysisData?: any;
  sources?: string[];
  reasoning?: string;
  nextSteps?: string[];
  relatedTopics?: string[];
  requiresFollowUp: boolean;
  estimatedTokens: number;
  timestamp?: Date;
  metadata?: {
    model: string;
    tokens: number;
    cost: number;
    processingTime: number;
  };
}

// 流式响应配置
export interface StreamConfig {
  enableStreaming: boolean;
  chunkSize: number;
  onToken?: (token: string) => void;
  onComplete?: (response: AIResponse) => void;
  onError?: (error: Error) => void;
}

// AI提供商接口
export interface AIProvider {
  generateResponse(
    messages: ChatMessage[],
    config: AIModelConfig,
    streamConfig?: StreamConfig
  ): Promise<AIResponse>;

  generateStreamResponse(
    messages: ChatMessage[],
    config: AIModelConfig,
    streamConfig: StreamConfig
  ): Promise<ReadableStream<Uint8Array>>;
}

// 风水知识库
export class FengShuiKnowledgeBase {
  private static instance: FengShuiKnowledgeBase;
  private knowledge: Map<string, any> = new Map();

  private constructor() {
    this.initializeKnowledge();
  }

  static getInstance(): FengShuiKnowledgeBase {
    if (!FengShuiKnowledgeBase.instance) {
      FengShuiKnowledgeBase.instance = new FengShuiKnowledgeBase();
    }
    return FengShuiKnowledgeBase.instance;
  }

  private initializeKnowledge() {
    // 基础风水理论
    this.knowledge.set('basic_principles', {
      title: '风水基础原理',
      content:
        '风水学是研究人与环境关系的学问，主要关注气场、方位、布局等因素对居住者的影响。',
      keywords: ['气场', '方位', '布局', '阴阳', '五行'],
      relatedTopics: ['阴阳理论', '五行学说', '八卦理论', '九宫飞星'],
    });

    // 方位理论
    this.knowledge.set('directions', {
      title: '方位理论',
      content: '风水中的方位分为八个方向，每个方向都有其特定的属性和影响。',
      keywords: ['东', '南', '西', '北', '东南', '西南', '东北', '西北'],
      relatedTopics: ['二十四山', '罗盘使用', '坐向理论'],
    });

    // 九宫飞星
    this.knowledge.set('flying_stars', {
      title: '九宫飞星',
      content:
        '九宫飞星是风水学中的重要理论，通过九颗星的飞布来分析空间的气场变化。',
      keywords: ['九宫', '飞星', '元运', '向山', '坐山'],
      relatedTopics: ['玄空风水', '三元九运', '飞星盘'],
    });

    // 户型分析
    this.knowledge.set('floor_plan_analysis', {
      title: '户型分析',
      content:
        '户型分析是风水实践中的重要环节，需要综合考虑房间布局、朝向、采光等因素。',
      keywords: ['户型', '布局', '朝向', '采光', '通风'],
      relatedTopics: ['房间功能', '动线设计', '空间利用'],
    });

    // 色彩搭配
    this.knowledge.set('color_theory', {
      title: '色彩理论',
      content:
        '色彩在风水中具有重要作用，不同颜色代表不同的五行属性，影响空间的气场。',
      keywords: ['颜色', '五行', '气场', '情绪', '能量'],
      relatedTopics: ['五行色彩', '心理色彩', '空间色彩'],
    });
  }

  searchKnowledge(query: string): any[] {
    const results: any[] = [];
    const queryLower = query.toLowerCase();

    for (const [key, knowledge] of this.knowledge) {
      if (
        knowledge.title.toLowerCase().includes(queryLower) ||
        knowledge.content.toLowerCase().includes(queryLower) ||
        knowledge.keywords.some((keyword: string) =>
          keyword.toLowerCase().includes(queryLower)
        )
      ) {
        results.push({
          key,
          ...knowledge,
          relevance: this.calculateRelevance(query, knowledge),
        });
      }
    }

    return results.sort((a, b) => b.relevance - a.relevance);
  }

  private calculateRelevance(query: string, knowledge: any): number {
    let relevance = 0;
    const queryLower = query.toLowerCase();

    if (knowledge.title.toLowerCase().includes(queryLower)) relevance += 3;
    if (knowledge.content.toLowerCase().includes(queryLower)) relevance += 2;
    knowledge.keywords.forEach((keyword: string) => {
      if (keyword.toLowerCase().includes(queryLower)) relevance += 1;
    });

    return relevance;
  }

  getRelatedTopics(topic: string): string[] {
    const knowledge = this.knowledge.get(topic);
    return knowledge?.relatedTopics || [];
  }
}

// 对话管理器
export class ConversationManager {
  private sessions: Map<string, ChatSession> = new Map();
  private contextHistory: Map<string, ChatContext> = new Map();

  createSession(
    userId: string,
    sessionType:
      | 'general'
      | 'analysis'
      | 'consultation'
      | 'troubleshooting' = 'general'
  ): ChatSession {
    const sessionId = Date.now().toString();
    const session: ChatSession = {
      id: sessionId,
      title: '新对话',
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
      context: {
        propertyId: undefined,
        analysisId: undefined,
        userId,
        sessionType,
      },
      settings: {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000,
        language: 'zh-CN',
        includeImages: true,
        includeAnalysis: true,
      },
    };

    this.sessions.set(sessionId, session);
    this.initializeContext(sessionId, userId);
    return session;
  }

  getSession(sessionId: string): ChatSession | undefined {
    return this.sessions.get(sessionId);
  }

  updateSession(sessionId: string, updates: Partial<ChatSession>): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const updatedSession = { ...session, ...updates, updatedAt: new Date() };
    this.sessions.set(sessionId, updatedSession);
    return true;
  }

  addMessage(sessionId: string, message: ChatMessage): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.messages.push(message);
    session.updatedAt = new Date();
    this.sessions.set(sessionId, session);
    return true;
  }

  getContext(sessionId: string): ChatContext | undefined {
    return this.contextHistory.get(sessionId);
  }

  updateContext(sessionId: string, updates: Partial<ChatContext>): boolean {
    const context = this.contextHistory.get(sessionId);
    if (!context) return false;

    const updatedContext = { ...context, ...updates };
    this.contextHistory.set(sessionId, updatedContext);
    return true;
  }

  private initializeContext(sessionId: string, userId: string): void {
    const context: ChatContext = {
      sessionId,
      userId,
      conversationHistory: [],
      currentTopic: 'general',
      userPreferences: {
        language: 'zh-CN',
        responseStyle: 'professional',
        includeImages: true,
        includeAnalysis: true,
        includeSources: true,
      },
      systemPrompt: this.generateSystemPrompt(),
      maxContextLength: 4000,
    };

    this.contextHistory.set(sessionId, context);
  }

  private generateSystemPrompt(): string {
    return `你是一位专业的风水顾问和AI助手，具有深厚的风水学知识和实践经验。你的职责是：

1. 提供准确、专业的风水分析和建议
2. 解释复杂的风水理论，使其易于理解
3. 根据用户的具体情况提供个性化建议
4. 保持客观、科学的态度，避免过度迷信
5. 结合现代居住理念和传统风水智慧

请始终以专业、友好、耐心的态度回答用户的问题，并提供实用的建议。`;
  }
}

// AI对话服务
export class AIChatService {
  private knowledgeBase: FengShuiKnowledgeBase;
  private conversationManager: ConversationManager;
  private modelConfig: AIModelConfig;

  constructor() {
    this.knowledgeBase = FengShuiKnowledgeBase.getInstance();
    this.conversationManager = new ConversationManager();
    this.modelConfig = {
      provider: 'openai',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
      topP: 0.9,
      frequencyPenalty: 0.1,
      presencePenalty: 0.1,
    };
  }

  // 处理用户消息
  async processMessage(
    sessionId: string,
    userMessage: string,
    attachments: any[] = [],
    config: ResponseConfig = {
      includeSuggestions: true,
      includeAnalysis: true,
      includeSources: true,
      maxSuggestions: 3,
      responseLength: 'medium',
      tone: 'formal',
    }
  ): Promise<AIResponse> {
    try {
      // 获取会话上下文
      const session = this.conversationManager.getSession(sessionId);
      const context = this.conversationManager.getContext(sessionId);

      if (!session || !context) {
        throw new Error('会话不存在');
      }

      // 分析用户意图
      const intent = await this.analyzeIntent(userMessage, context);

      // 搜索相关知识
      const knowledgeResults = this.knowledgeBase.searchKnowledge(userMessage);

      // 生成响应
      const response = await this.generateResponse(
        userMessage,
        intent,
        knowledgeResults,
        context,
        config
      );

      // 更新上下文
      this.updateConversationContext(sessionId, userMessage, response);

      return response;
    } catch (error) {
      console.error('处理消息失败:', error);
      return {
        content: '抱歉，我暂时无法处理您的请求。请稍后再试。',
        confidence: 0,
        suggestions: [
          '重新描述您的问题',
          '尝试使用不同的关键词',
          '检查网络连接',
        ],
        requiresFollowUp: false,
        estimatedTokens: 0,
      };
    }
  }

  // 分析用户意图
  private async analyzeIntent(
    message: string,
    context: ChatContext
  ): Promise<any> {
    // 这里应该使用实际的NLP模型来分析用户意图
    // 目前使用简单的关键词匹配

    const intents = {
      analysis: ['分析', '风水', '布局', '朝向', '户型'],
      consultation: ['建议', '推荐', '如何', '怎么办', '优化'],
      education: ['解释', '什么是', '原理', '理论', '知识'],
      troubleshooting: ['问题', '错误', '故障', '不工作', '失败'],
    };

    const messageLower = message.toLowerCase();
    const detectedIntents = [];

    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(keyword => messageLower.includes(keyword))) {
        detectedIntents.push(intent);
      }
    }

    return {
      primary: detectedIntents[0] || 'general',
      secondary: detectedIntents.slice(1),
      confidence: detectedIntents.length > 0 ? 0.8 : 0.5,
    };
  }

  // 生成AI响应
  private async generateResponse(
    userMessage: string,
    intent: any,
    knowledgeResults: any[],
    context: ChatContext,
    config: ResponseConfig
  ): Promise<AIResponse> {
    // 这里应该调用实际的AI模型
    // 目前使用模拟响应

    const responseTemplates = {
      analysis: [
        '根据您的描述，我建议您考虑以下几个方面...',
        '这是一个很好的问题。让我为您详细分析一下...',
        '基于风水学的原理，我推荐以下解决方案...',
      ],
      consultation: [
        '我理解您的担忧。让我为您提供一些专业的建议...',
        '这是一个常见的风水问题，通常可以通过以下方式改善...',
        '基于您的具体情况，我建议您重点关注以下几个方面...',
      ],
      education: [
        '让我为您详细解释一下这个风水概念...',
        '这是一个很有趣的问题。在风水学中...',
        '根据传统风水理论...',
      ],
      general: [
        '我很乐意为您提供帮助。请告诉我您想了解什么...',
        '作为您的风水顾问，我可以协助您...',
        '请详细描述您的情况，我会为您提供专业建议...',
      ],
    };

    const templates =
      responseTemplates[intent.primary as keyof typeof responseTemplates] ||
      responseTemplates.general;
    const content = templates[Math.floor(Math.random() * templates.length)];

    // 生成建议
    const suggestions = this.generateSuggestions(
      intent,
      knowledgeResults,
      config
    );

    // 生成分析数据
    const analysisData = this.generateAnalysisData(
      intent,
      knowledgeResults,
      context
    );

    // 生成相关话题
    const relatedTopics = this.generateRelatedTopics(intent, knowledgeResults);

    return {
      content,
      confidence: 0.85 + Math.random() * 0.1,
      suggestions,
      analysisData,
      sources: knowledgeResults.slice(0, 3).map(r => r.title),
      reasoning: `基于${intent.primary}意图和相关知识库匹配`,
      nextSteps: this.generateNextSteps(intent, context),
      relatedTopics,
      requiresFollowUp:
        intent.primary === 'analysis' || intent.primary === 'consultation',
      estimatedTokens: content.length + suggestions.join('').length,
    };
  }

  // 生成建议
  private generateSuggestions(
    intent: any,
    knowledgeResults: any[],
    config: ResponseConfig
  ): string[] {
    const suggestions = [
      '能否详细说明一下您的房屋朝向？',
      '您希望我分析哪个具体的房间？',
      '需要我为您生成详细的分析报告吗？',
      '您对哪个风水理论比较感兴趣？',
      '需要我解释一下飞星分析的结果吗？',
      '您想了解如何改善房间布局吗？',
      '需要我为您推荐合适的颜色搭配吗？',
    ];

    return suggestions.slice(0, config.maxSuggestions);
  }

  // 生成分析数据
  private generateAnalysisData(
    intent: any,
    knowledgeResults: any[],
    context: ChatContext
  ): any {
    return {
      intent: intent.primary,
      confidence: intent.confidence,
      knowledgeMatches: knowledgeResults.length,
      relatedTopics: knowledgeResults.slice(0, 5).map(r => r.title),
      contextRelevance: 0.8,
      suggestedActions: this.generateSuggestedActions(intent),
    };
  }

  // 生成相关话题
  private generateRelatedTopics(
    intent: any,
    knowledgeResults: any[]
  ): string[] {
    const topics = new Set<string>();

    knowledgeResults.forEach(result => {
      if (result.relatedTopics) {
        result.relatedTopics.forEach((topic: string) => topics.add(topic));
      }
    });

    return Array.from(topics).slice(0, 5);
  }

  // 生成下一步建议
  private generateNextSteps(intent: any, context: ChatContext): string[] {
    const steps = {
      analysis: ['上传户型图', '进行罗盘测量', '查看详细报告'],
      consultation: ['提供更多细节', '预约专业咨询', '查看相关案例'],
      education: ['阅读相关文章', '观看教学视频', '参加在线课程'],
      general: ['描述具体需求', '选择服务类型', '开始对话'],
    };

    return steps[intent.primary as keyof typeof steps] || steps.general;
  }

  // 生成建议行动
  private generateSuggestedActions(intent: any): string[] {
    const actions = {
      analysis: ['上传户型图', '进行罗盘测量', '查看飞星分析'],
      consultation: ['预约咨询', '查看案例', '获取报价'],
      education: ['阅读资料', '观看视频', '参加课程'],
      general: ['选择服务', '描述需求', '开始对话'],
    };

    return actions[intent.primary as keyof typeof actions] || actions.general;
  }

  // 更新对话上下文
  private updateConversationContext(
    sessionId: string,
    userMessage: string,
    response: AIResponse
  ): void {
    const context = this.conversationManager.getContext(sessionId);
    if (!context) return;

    // 更新当前话题
    if (response.analysisData?.intent) {
      context.currentTopic = response.analysisData.intent;
    }

    // 更新对话历史
    context.conversationHistory.push({
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    });

    context.conversationHistory.push({
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
      confidence: response.confidence,
      suggestions: response.suggestions,
      // analysisData: response.analysisData,
    });

    // 保持上下文长度在限制内
    if (context.conversationHistory.length > 20) {
      context.conversationHistory = context.conversationHistory.slice(-20);
    }

    this.conversationManager.updateContext(sessionId, context);
  }

  // 创建新会话
  createSession(
    userId: string,
    sessionType:
      | 'general'
      | 'analysis'
      | 'consultation'
      | 'troubleshooting' = 'general'
  ): ChatSession {
    return this.conversationManager.createSession(userId, sessionType);
  }

  // 获取会话
  getSession(sessionId: string): ChatSession | undefined {
    return this.conversationManager.getSession(sessionId);
  }

  // 更新会话
  updateSession(sessionId: string, updates: Partial<ChatSession>): boolean {
    return this.conversationManager.updateSession(sessionId, updates);
  }

  // 添加消息
  addMessage(sessionId: string, message: ChatMessage): boolean {
    return this.conversationManager.addMessage(sessionId, message);
  }

  // 获取上下文
  getContext(sessionId: string): ChatContext | undefined {
    return this.conversationManager.getContext(sessionId);
  }

  // 更新上下文
  updateContext(sessionId: string, updates: Partial<ChatContext>): boolean {
    return this.conversationManager.updateContext(sessionId, updates);
  }
}

// OpenAI提供商实现
export class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey: string, baseURL: string = 'https://api.openai.com/v1') {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
  }

  async generateResponse(
    messages: ChatMessage[],
    config: AIModelConfig,
    streamConfig?: StreamConfig
  ): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.model,
          messages: this.formatMessages(messages),
          temperature: config.temperature,
          max_tokens: config.maxTokens,
          top_p: config.topP,
          frequency_penalty: config.frequencyPenalty,
          presence_penalty: config.presencePenalty,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `OpenAI API错误: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const choice = data.choices[0];

      return {
        content: choice.message.content,
        confidence: 0.9,
        suggestions: [],
        analysisData: null,
        sources: [],
        reasoning: choice.message.reasoning || '',
        nextSteps: [],
        relatedTopics: [],
        requiresFollowUp: false,
        estimatedTokens: data.usage?.total_tokens || 0,
        timestamp: new Date(),
        metadata: {
          model: config.model,
          tokens: data.usage?.total_tokens || 0,
          cost: this.calculateCost(data.usage, config.model),
          processingTime: Date.now() - Date.now(),
        },
      };
    } catch (error) {
      console.error('OpenAI API调用失败:', error);
      throw error;
    }
  }

  async generateStreamResponse(
    messages: ChatMessage[],
    config: AIModelConfig,
    streamConfig: StreamConfig
  ): Promise<ReadableStream<Uint8Array>> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.model,
          messages: this.formatMessages(messages),
          temperature: config.temperature,
          max_tokens: config.maxTokens,
          top_p: config.topP,
          frequency_penalty: config.frequencyPenalty,
          presence_penalty: config.presencePenalty,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `OpenAI API错误: ${response.status} ${response.statusText}`
        );
      }

      return response.body!;
    } catch (error) {
      console.error('OpenAI流式API调用失败:', error);
      throw error;
    }
  }

  private formatMessages(messages: ChatMessage[]): any[] {
    return messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));
  }

  private calculateCost(usage: any, model: string): number {
    // 简化的成本计算（实际应用中应使用准确的定价）
    const pricing: { [key: string]: { input: number; output: number } } = {
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-3.5-turbo': { input: 0.001, output: 0.002 },
    };

    const modelPricing = pricing[model] || pricing['gpt-3.5-turbo'];
    const inputCost = (usage.prompt_tokens / 1000) * modelPricing.input;
    const outputCost = (usage.completion_tokens / 1000) * modelPricing.output;

    return inputCost + outputCost;
  }
}

// 本地AI提供商实现（用于测试）
export class LocalAIProvider implements AIProvider {
  async generateResponse(
    messages: ChatMessage[],
    config: AIModelConfig,
    streamConfig?: StreamConfig
  ): Promise<AIResponse> {
    // 模拟本地AI响应
    const lastMessage = messages[messages.length - 1];
    const response = this.generateMockResponse(lastMessage.content);

    return {
      content: response,
      confidence: 0.8,
      suggestions: ['了解更多风水知识', '查看详细分析', '咨询专家'],
      analysisData: null,
      sources: ['风水经典', '现代研究'],
      reasoning: '基于传统风水理论和现代环境科学',
      nextSteps: ['进行实地勘测', '制定改善方案'],
      relatedTopics: ['五行理论', '方位学', '色彩搭配'],
      requiresFollowUp: false,
      estimatedTokens: 150,
      timestamp: new Date(),
      metadata: {
        model: 'local-mock',
        tokens: 150,
        cost: 0,
        processingTime: 100,
      },
    };
  }

  async generateStreamResponse(
    messages: ChatMessage[],
    config: AIModelConfig,
    streamConfig: StreamConfig
  ): Promise<ReadableStream<Uint8Array>> {
    // 模拟流式响应
    const lastMessage = messages[messages.length - 1];
    const response = this.generateMockResponse(lastMessage.content);

    const encoder = new TextEncoder();
    const chunks = response.split(' ').map(word => word + ' ');

    return new ReadableStream({
      start(controller) {
        let index = 0;
        const interval = setInterval(() => {
          if (index < chunks.length) {
            const chunk = encoder.encode(chunks[index]);
            controller.enqueue(chunk);
            if (streamConfig.onToken) {
              streamConfig.onToken(chunks[index]);
            }
            index++;
          } else {
            clearInterval(interval);
            controller.close();
          }
        }, 50);
      },
    });
  }

  private generateMockResponse(input: string): string {
    const responses = [
      '根据传统风水理论，您提到的布局确实需要调整。建议在东南角放置绿色植物，以增强木元素的能量。',
      '从现代环境科学角度分析，这个空间的光照和通风条件良好，但需要注意色彩搭配的和谐性。',
      '根据五行相生相克的原理，建议在客厅中央放置圆形装饰品，以增强整体空间的流动性。',
      '从方位学角度来看，您的主卧位置较为理想，但建议调整床头朝向以获得更好的睡眠质量。',
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }
}

// 默认导出
export const aiChatService = new AIChatService();
