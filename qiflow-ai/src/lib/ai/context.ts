/**
 * 多轮对话上下文管理系统
 * 专门针对传统文化领域的智能对话优化
 */

import type { 
  ConversationContext, 
  TermExplanation, 
  ConfidenceScore,
  AIResponse,
  TemplateName 
} from './types';

// 传统文化领域知识库
const CULTURAL_TERMS_DB: Record<string, TermExplanation> = {
  '玄空飞星': {
    term: '玄空飞星',
    definition: '风水学中的核心理论，通过分析九颗星的飞布规律来判断环境吉凶',
    pronunciation: 'xuán kōng fēi xīng',
    category: 'fengshui',
    relatedTerms: ['九宫', '三元九运', '山星', '向星'],
    examples: ['根据玄空飞星理论，此房屋为旺山旺水格局']
  },
  '八字': {
    term: '八字',
    definition: '传统命理学术语，指一个人出生的年、月、日、时的天干地支组合',
    pronunciation: 'bā zì',
    category: 'bazi',
    relatedTerms: ['天干', '地支', '四柱', '用神'],
    examples: ['通过分析八字可以了解个人的性格特点和运势走向']
  },
  '五行': {
    term: '五行',
    definition: '中国古代哲学概念，指木、火、土、金、水五种基本元素',
    pronunciation: 'wǔ xíng',
    category: 'wuxing',
    relatedTerms: ['相生', '相克', '用神', '忌神'],
    examples: ['五行相生：木生火，火生土，土生金，金生水，水生木']
  },
  '九宫': {
    term: '九宫',
    definition: '将方位分为九个区域，用于分析空间的能量分布',
    pronunciation: 'jiǔ gōng',
    category: 'fengshui',
    relatedTerms: ['洛书', '飞星', '八卦'],
    examples: ['九宫飞星图显示了每个方位的吉凶情况']
  },
  '用神': {
    term: '用神',
    definition: '八字命理中对日主有利的五行元素',
    pronunciation: 'yòng shén',
    category: 'bazi',
    relatedTerms: ['忌神', '喜神', '日主'],
    examples: ['此八字用神为木，宜从事与木相关的行业']
  }
};

export class ContextManager {
  private contexts: Map<string, ConversationContext> = new Map();
  private readonly maxHistoryLength = 20;
  private readonly maxContextAge = 24 * 60 * 60 * 1000; // 24小时

  /**
   * 创建新的对话上下文
   */
  createContext(sessionId: string, userId: string, userProfile?: any): ConversationContext {
    const context: ConversationContext = {
      sessionId,
      userId,
      history: [],
      userProfile: {
        expertise: userProfile?.expertise || 'beginner',
        interests: userProfile?.interests || [],
        preferredStyle: userProfile?.preferredStyle || 'educational',
        baziInfo: userProfile?.baziInfo,
        houseInfo: userProfile?.houseInfo
      },
      relatedTopics: []
    };

    this.contexts.set(sessionId, context);
    return context;
  }

  /**
   * 获取对话上下文
   */
  getContext(sessionId: string): ConversationContext | null {
    return this.contexts.get(sessionId) || null;
  }

  /**
   * 更新对话历史
   */
  updateHistory(
    sessionId: string, 
    userMessage: string, 
    aiResponse: string,
    confidence?: ConfidenceScore
  ): void {
    const context = this.contexts.get(sessionId);
    if (!context) return;

    // 添加新的对话记录
    context.history.push({
      userMessage,
      aiResponse,
      timestamp: new Date(),
      confidence
    });

    // 保持历史长度在限制内
    if (context.history.length > this.maxHistoryLength) {
      context.history = context.history.slice(-this.maxHistoryLength);
    }

    // 更新当前话题和相关话题
    const detectedTopics = this.extractTopics(userMessage + ' ' + aiResponse);
    context.currentTopic = detectedTopics[0];
    context.relatedTopics = this.mergeTopics(context.relatedTopics, detectedTopics);

    this.contexts.set(sessionId, context);
  }

  /**
   * 根据上下文选择最佳模板
   */
  selectTemplate(
    sessionId: string, 
    userMessage: string,
    analysisType?: string
  ): TemplateName {
    const context = this.getContext(sessionId);
    
    // 意图分析
    const intent = this.analyzeIntent(userMessage, context);
    
    // 根据意图和用户级别选择模板
    if (intent.includes('education') || intent.includes('explain')) {
      return 'fengshui.educational';
    }
    
    if (intent.includes('consultation') || intent.includes('advice')) {
      return 'fengshui.consultation';
    }
    
    if (intent.includes('room') || intent.includes('bedroom') || intent.includes('kitchen')) {
      return 'fengshui.room_analysis';
    }
    
    if (intent.includes('bazi') || intent.includes('八字') || intent.includes('命理')) {
      return 'bazi.explain';
    }
    
    if (analysisType === 'summary') {
      return 'fengshui.summary';
    }
    
    return 'fengshui.analysis';
  }

  /**
   * 生成个性化的上下文信息
   */
  generateContextualInfo(sessionId: string): Record<string, any> {
    const context = this.getContext(sessionId);
    if (!context) return {};

    return {
      userProfile: context.userProfile,
      recentTopics: context.relatedTopics.slice(0, 5),
      conversationStage: this.getConversationStage(context),
      suggestedQuestions: this.generateSuggestedQuestions(context),
      relevantTerms: this.getRelevantTerms(context.currentTopic),
      sessionSummary: this.generateSessionSummary(context)
    };
  }

  /**
   * 提取消息中的关键话题
   */
  private extractTopics(text: string): string[] {
    const topics: string[] = [];
    
    // 风水相关关键词
    const fengShuiKeywords = [
      '风水', '玄空', '飞星', '八宅', '九宫', '罗盘', '朝向', '布局',
      '方位', '格局', '旺山旺水', '上山下水', '文昌', '财位'
    ];
    
    // 八字相关关键词
    const baziKeywords = [
      '八字', '四柱', '天干', '地支', '五行', '用神', '忌神', '大运',
      '流年', '命理', '生辰', '时辰'
    ];
    
    // 房屋相关关键词
    const houseKeywords = [
      '房屋', '户型', '客厅', '卧室', '厨房', '卫生间', '书房', '阳台',
      '门', '窗', '楼层', '装修', '颜色', '家具'
    ];

    fengShuiKeywords.forEach(keyword => {
      if (text.includes(keyword)) topics.push('fengshui');
    });
    
    baziKeywords.forEach(keyword => {
      if (text.includes(keyword)) topics.push('bazi');
    });
    
    houseKeywords.forEach(keyword => {
      if (text.includes(keyword)) topics.push('house');
    });

    return [...new Set(topics)]; // 去重
  }

  /**
   * 分析用户意图
   */
  private analyzeIntent(message: string, context?: ConversationContext | null): string[] {
    const intents: string[] = [];
    const messageLower = message.toLowerCase();

    // 教育意图
    if (messageLower.includes('什么是') || messageLower.includes('解释') || 
        messageLower.includes('原理') || messageLower.includes('如何理解')) {
      intents.push('education');
    }

    // 咨询意图
    if (messageLower.includes('建议') || messageLower.includes('怎么办') || 
        messageLower.includes('如何改善') || messageLower.includes('推荐')) {
      intents.push('consultation');
    }

    // 分析意图
    if (messageLower.includes('分析') || messageLower.includes('看看') || 
        messageLower.includes('评估') || messageLower.includes('判断')) {
      intents.push('analysis');
    }

    // 房间相关意图
    if (messageLower.includes('房间') || messageLower.includes('卧室') || 
        messageLower.includes('客厅') || messageLower.includes('厨房')) {
      intents.push('room');
    }

    return intents;
  }

  /**
   * 合并话题列表
   */
  private mergeTopics(existing: string[], newTopics: string[]): string[] {
    const merged = [...existing];
    
    newTopics.forEach(topic => {
      if (!merged.includes(topic)) {
        merged.unshift(topic); // 新话题放在前面
      }
    });

    return merged.slice(0, 10); // 保持最多10个话题
  }

  /**
   * 获取对话阶段
   */
  private getConversationStage(context: ConversationContext): string {
    if (context.history.length === 0) return 'initial';
    if (context.history.length <= 3) return 'exploration';
    if (context.history.length <= 10) return 'analysis';
    return 'deep_consultation';
  }

  /**
   * 生成建议问题
   */
  private generateSuggestedQuestions(context: ConversationContext): string[] {
    const stage = this.getConversationStage(context);
    const currentTopic = context.currentTopic;
    
    if (stage === 'initial') {
      return [
        '请问您想了解什么方面的风水知识？',
        '您是否有具体的房屋或个人情况需要分析？',
        '您对传统文化的了解程度如何？'
      ];
    }
    
    if (currentTopic === 'fengshui') {
      return [
        '您想了解更多关于玄空飞星的理论吗？',
        '需要我分析具体的房间布局吗？',
        '您对格局判断还有疑问吗？'
      ];
    }
    
    if (currentTopic === 'bazi') {
      return [
        '需要我解释您的用神选择吗？',
        '您想了解流年运势的影响吗？',
        '需要结合八字分析居住环境吗？'
      ];
    }
    
    return [
      '还有其他问题需要讨论吗？',
      '需要更详细的分析报告吗？',
      '您想了解实际的改善建议吗？'
    ];
  }

  /**
   * 获取相关术语解释
   */
  private getRelevantTerms(topic?: string): TermExplanation[] {
    if (!topic) return [];
    
    const relevantTerms = Object.values(CULTURAL_TERMS_DB)
      .filter(term => 
        term.category === topic || 
        term.relatedTerms.some(related => 
          Object.keys(CULTURAL_TERMS_DB).includes(related)
        )
      );
    
    return relevantTerms.slice(0, 5); // 最多返回5个相关术语
  }

  /**
   * 生成会话摘要
   */
  private generateSessionSummary(context: ConversationContext): string {
    if (context.history.length === 0) return '新对话开始';
    
    const recentHistory = context.history.slice(-3);
    const topics = context.relatedTopics.slice(0, 3).join('、');
    
    return `本次讨论主要涉及${topics}等话题，已进行${context.history.length}轮对话`;
  }

  /**
   * 清理过期的上下文
   */
  cleanupExpiredContexts(): void {
    const now = Date.now();
    
    for (const [sessionId, context] of this.contexts.entries()) {
      const lastActivity = context.history.length > 0 
        ? context.history[context.history.length - 1].timestamp.getTime()
        : 0;
      
      if (now - lastActivity > this.maxContextAge) {
        this.contexts.delete(sessionId);
      }
    }
  }

  /**
   * 获取用户专业程度
   */
  getUserExpertise(sessionId: string): 'beginner' | 'intermediate' | 'advanced' {
    const context = this.getContext(sessionId);
    return context?.userProfile.expertise || 'beginner';
  }

  /**
   * 更新用户档案
   */
  updateUserProfile(sessionId: string, updates: Partial<ConversationContext['userProfile']>): void {
    const context = this.contexts.get(sessionId);
    if (!context) return;

    context.userProfile = { ...context.userProfile, ...updates };
    this.contexts.set(sessionId, context);
  }
}

/**
 * 全局上下文管理器实例
 */
export const contextManager = new ContextManager();

/**
 * 术语解释助手
 */
export class TermExplainer {
  /**
   * 解释文本中的术语
   */
  static explainTermsInText(text: string): TermExplanation[] {
    const foundTerms: TermExplanation[] = [];
    
    for (const [term, explanation] of Object.entries(CULTURAL_TERMS_DB)) {
      if (text.includes(term)) {
        foundTerms.push(explanation);
      }
    }
    
    return foundTerms;
  }

  /**
   * 获取术语解释
   */
  static getTerm(term: string): TermExplanation | null {
    return CULTURAL_TERMS_DB[term] || null;
  }

  /**
   * 搜索相关术语
   */
  static searchTerms(query: string): TermExplanation[] {
    const results: TermExplanation[] = [];
    
    for (const explanation of Object.values(CULTURAL_TERMS_DB)) {
      if (explanation.term.includes(query) || 
          explanation.definition.includes(query) ||
          explanation.relatedTerms.some(related => related.includes(query))) {
        results.push(explanation);
      }
    }
    
    return results;
  }

  /**
   * 添加新术语
   */
  static addTerm(explanation: TermExplanation): void {
    CULTURAL_TERMS_DB[explanation.term] = explanation;
  }
}