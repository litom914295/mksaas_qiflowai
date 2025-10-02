/**
 * QiFlow AI - 增强版 AI 对话服务
 *
 * 基于 MasterOrchestrator 与八字/玄空算法集成，提供对话、推荐与分析能力。
 */

import {
  algorithmIntegrationService,
  type AlgorithmExecutionResult,
  type IntegratedResponse,
} from '@/lib/ai/algorithm-integration-service';
import type { ConversationSessionState } from '@/lib/ai/conversation-memory';
import { MasterOrchestrator } from '@/lib/ai/master-orchestrator';

export interface EnhancedChatMessage {
  id: string;
  type: 'user' | 'assistant';
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  algorithmResults?: AlgorithmExecutionResult[];
  suggestions?: string[];
  followUpQuestions?: string[];
  confidence?: number;
  actionItems?: string[];
  educationalContent?: unknown;
  metadata?: Record<string, unknown>;
}

export interface EnhancedChatSession {
  id: string;
  userId: string;
  sessionType: 'general' | 'analysis' | 'consultation' | 'troubleshooting';
  createdAt: Date;
  updatedAt: Date;
  title: string;
  locale: string;
  messages: EnhancedChatMessage[];
  algorithmHistory: Array<{
    type: 'bazi' | 'fengshui';
    timestamp: Date;
    result: unknown;
    cacheKey?: string;
  }>;
  userProfile: {
    baziInfo?: unknown;
    houseInfo?: unknown;
    expertise: 'beginner' | 'intermediate' | 'advanced';
    preferences: {
      responseStyle: 'conversational' | 'analytical' | 'educational';
      explanationLevel: 'basic' | 'detailed' | 'expert';
      includeEducationalContent: boolean;
    };
  };
  settings: {
    language: string;
  };
  metadata?: Record<string, unknown>;
}

export interface EnhancedProcessResult {
  message: EnhancedChatMessage;
  session: EnhancedChatSession;
  integratedResponse: IntegratedResponse;
  normalized: {
    suggestions: string[];
    followUpQuestions: string[];
    actionItems: string[];
  };
  orchestratorState: ConversationSessionState;
}

type SessionInit = {
  sessionId: string;
  userId: string;
  sessionType?: 'general' | 'analysis' | 'consultation' | 'troubleshooting';
  locale?: string;
  metadata?: Record<string, unknown>;
};

export class EnhancedAIChatService {
  private orchestrator: MasterOrchestrator;
  private sessions = new Map<string, EnhancedChatSession>();

  constructor(orchestrator?: MasterOrchestrator) {
    this.orchestrator =
      orchestrator ??
      new MasterOrchestrator({
        algorithmService: algorithmIntegrationService,
        defaultLocale: 'zh-CN',
      });
  }

  createEnhancedSession(
    userId: string,
    sessionType:
      | 'general'
      | 'analysis'
      | 'consultation'
      | 'troubleshooting' = 'general',
    sessionId?: string
  ): EnhancedChatSession {
    return this.ensureSession({
      sessionId: sessionId ?? this.generateSessionId(userId),
      userId,
      sessionType,
    });
  }

  getEnhancedSession(sessionId: string): EnhancedChatSession | null {
    return this.sessions.get(sessionId) ?? null;
  }

  async processMessage(params: {
    sessionId: string;
    userId: string;
    message: string;
    attachments?: unknown[];
    locale?: string;
    metadata?: Record<string, unknown>;
  }): Promise<EnhancedProcessResult> {
    const trimmed = params.message?.trim();
    if (!trimmed) {
      throw new Error('用户消息不能为空');
    }

    const session = this.ensureSession({
      sessionId: params.sessionId,
      userId: params.userId,
      locale: params.locale,
      metadata: params.metadata,
    });

    const userTimestamp = new Date();
    const userMessage: EnhancedChatMessage = {
      id: `user-${userTimestamp.getTime()}`,
      type: 'user',
      role: 'user',
      content: trimmed,
      timestamp: userTimestamp,
      metadata: params.metadata,
    };

    session.messages.push(userMessage);

    const orchestratorResult = await this.orchestrator.handleUserMessage({
      sessionId: session.id,
      userId: session.userId,
      message: trimmed,
      locale: params.locale ?? session.locale,
      attachments: params.attachments,
      metadata: params.metadata,
    });

    const assistantTimestamp = orchestratorResult.reply.timestamp
      ? new Date(orchestratorResult.reply.timestamp)
      : new Date();

    const assistantMessage: EnhancedChatMessage = {
      id:
        orchestratorResult.reply.id ??
        `assistant-${assistantTimestamp.getTime()}`,
      type: 'assistant',
      role: 'assistant',
      content: orchestratorResult.reply.content,
      timestamp: assistantTimestamp,
      algorithmResults: orchestratorResult.integratedResponse.algorithmResults,
      suggestions: orchestratorResult.normalized.suggestions,
      followUpQuestions: orchestratorResult.normalized.followUpQuestions,
      actionItems: orchestratorResult.normalized.actionItems,
      confidence:
        orchestratorResult.integratedResponse.aiResponse.confidence?.overall,
      educationalContent:
        orchestratorResult.integratedResponse.educationalContent,
      metadata: orchestratorResult.reply.metadata as Record<string, unknown>,
    };

    session.messages.push(assistantMessage);
    session.updatedAt = assistantTimestamp;
    session.metadata = { ...session.metadata, ...params.metadata };

    this.updateAlgorithmHistory(
      session,
      orchestratorResult.integratedResponse.algorithmResults
    );
    this.updateUserProfile(
      session,
      orchestratorResult.integratedResponse.algorithmResults
    );
    this.adjustUserExpertise(session);

    this.sessions.set(session.id, session);

    return {
      message: assistantMessage,
      session,
      integratedResponse: orchestratorResult.integratedResponse,
      normalized: orchestratorResult.normalized,
      orchestratorState: orchestratorResult.sessionState,
    };
  }

  async chat(params: {
    message: string;
    userId: string;
    sessionId?: string;
    attachments?: unknown[];
    locale?: string;
    sessionType?: 'general' | 'analysis' | 'consultation' | 'troubleshooting';
    metadata?: Record<string, unknown>;
  }) {
    const sessionId = params.sessionId ?? this.generateSessionId(params.userId);
    const session = this.ensureSession({
      sessionId,
      userId: params.userId,
      sessionType: params.sessionType,
      locale: params.locale,
      metadata: params.metadata,
    });

    const result = await this.processMessage({
      sessionId: session.id,
      userId: params.userId,
      message: params.message,
      attachments: params.attachments,
      locale: params.locale,
      metadata: params.metadata,
    });

    return {
      aiResponse: result.integratedResponse.aiResponse,
      algorithmResults: result.integratedResponse.algorithmResults,
      suggestions: result.normalized.suggestions,
      followUpQuestions: result.normalized.followUpQuestions,
      actionItems: result.normalized.actionItems,
      session: result.session,
      orchestratorState: result.orchestratorState,
      integratedResponse: result.integratedResponse,
    };
  }

  getSessionStats(sessionId: string): {
    messageCount: number;
    algorithmUsage: { bazi: number; fengshui: number };
    averageConfidence: number;
    userExpertise: string;
  } | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const baziCount = session.algorithmHistory.filter(
      h => h.type === 'bazi'
    ).length;
    const fengshuiCount = session.algorithmHistory.filter(
      h => h.type === 'fengshui'
    ).length;
    const confidences = session.messages
      .map(msg => msg.confidence)
      .filter((value): value is number => typeof value === 'number');

    const averageConfidence = confidences.length
      ? confidences.reduce((sum, value) => sum + value, 0) / confidences.length
      : 0;

    return {
      messageCount: session.messages.length,
      algorithmUsage: { bazi: baziCount, fengshui: fengshuiCount },
      averageConfidence,
      userExpertise: session.userProfile.expertise,
    };
  }

  exportSession(sessionId: string): {
    session: EnhancedChatSession;
    algorithmResults: unknown[];
    summary: string;
  } | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const algorithmResults = session.algorithmHistory.map(item => item.result);
    const summaryLines = [
      '\u4f1a\u8bdd\u6807\u9898: ' + session.title,
      '\u603b\u6d88\u606f\u6570: ' + session.messages.length,
      '\u516b\u5b57\u5206\u6790\u6b21\u6570: ' +
        session.algorithmHistory.filter(h => h.type === 'bazi').length,
      '\u98ce\u6c34\u5206\u6790\u6b21\u6570: ' +
        session.algorithmHistory.filter(h => h.type === 'fengshui').length,
      '\u7528\u6237\u4e13\u4e1a\u6c34\u5e73: ' + session.userProfile.expertise,
    ];

    if (session.userProfile.baziInfo) {
      summaryLines.push('已记录八字信息');
    }
    if (session.userProfile.houseInfo) {
      summaryLines.push('已记录风水（房屋）信息');
    }

    return {
      session,
      algorithmResults,
      summary: summaryLines.join('\n'),
    };
  }

  getRecommendedQuestions(sessionId: string): string[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    const questions: string[] = [];

    if (!session.userProfile.baziInfo) {
      questions.push('请帮我分析一下我的八字');
      questions.push('我的五行是否平衡？');
    }

    if (!session.userProfile.houseInfo) {
      questions.push('请分析一下我家的风水布局');
      questions.push('我的住宅朝向有什么影响？');
    }

    switch (session.userProfile.expertise) {
      case 'beginner':
        questions.push('什么是八字？');
        questions.push('如何看懂九宫飞星？');
        break;
      case 'intermediate':
        questions.push('如何分析大运流年？');
        questions.push('兼向的处理方法有哪些？');
        break;
      case 'advanced':
        questions.push('复杂格局的判断标准是什么？');
        questions.push('现代建筑风水的调整技巧有哪些？');
        break;
    }

    return Array.from(new Set(questions)).slice(0, 6);
  }

  cleanupSession(sessionId: string, keepRecentMessages = 20): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    if (session.messages.length > keepRecentMessages) {
      session.messages = session.messages.slice(-keepRecentMessages);
    }

    if (session.algorithmHistory.length > 20) {
      session.algorithmHistory = session.algorithmHistory.slice(-20);
    }

    session.updatedAt = new Date();
    this.sessions.set(session.id, session);

    void this.orchestrator.resetSession(session.id, session.userId);

    return true;
  }

  async batchProcessMessages(
    sessionId: string,
    messages: string[]
  ): Promise<EnhancedChatMessage[]> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('会话不存在');
    }

    const results: EnhancedChatMessage[] = [];

    for (const message of messages) {
      const { message: assistantMessage } = await this.processMessage({
        sessionId,
        userId: session.userId,
        message,
      });
      results.push(assistantMessage);

      await new Promise(resolve => setTimeout(resolve, 250));
    }

    return results;
  }

  private ensureSession(init: SessionInit): EnhancedChatSession {
    const existing = this.sessions.get(init.sessionId);
    if (existing) {
      if (init.locale && existing.locale !== init.locale) {
        existing.locale = init.locale;
      }
      if (init.metadata) {
        existing.metadata = { ...existing.metadata, ...init.metadata };
      }
      return existing;
    }

    const session: EnhancedChatSession = {
      id: init.sessionId,
      userId: init.userId,
      sessionType: init.sessionType ?? 'general',
      createdAt: new Date(),
      updatedAt: new Date(),
      title: '智能风水对话',
      locale: init.locale ?? 'zh-CN',
      messages: [],
      algorithmHistory: [],
      userProfile: {
        expertise: 'beginner',
        preferences: {
          responseStyle: 'conversational',
          explanationLevel: 'detailed',
          includeEducationalContent: true,
        },
      },
      settings: {
        language: init.locale ?? 'zh-CN',
      },
      metadata: init.metadata,
    };

    this.sessions.set(session.id, session);
    return session;
  }

  private updateAlgorithmHistory(
    session: EnhancedChatSession,
    results: AlgorithmExecutionResult[]
  ): void {
    results.forEach(result => {
      if (!result?.success) return;
      session.algorithmHistory.push({
        type: result.type,
        timestamp: new Date(),
        result: result.data,
        cacheKey: result.cacheKey,
      });
    });

    if (session.algorithmHistory.length > 60) {
      session.algorithmHistory = session.algorithmHistory.slice(-60);
    }
  }

  private updateUserProfile(
    session: EnhancedChatSession,
    results: AlgorithmExecutionResult[]
  ): void {
    results.forEach(result => {
      if (!result?.success) return;
      if (result.type === 'bazi' && result.data) {
        session.userProfile.baziInfo = result.data;
      }
      if (result.type === 'fengshui' && result.data) {
        session.userProfile.houseInfo = result.data;
      }
    });
  }

  private adjustUserExpertise(session: EnhancedChatSession): void {
    const messageCount = session.messages.length;
    const algorithmCount = session.algorithmHistory.length;

    if (messageCount > 50 && algorithmCount > 12) {
      session.userProfile.expertise = 'advanced';
    } else if (messageCount > 20 && algorithmCount > 6) {
      session.userProfile.expertise = 'intermediate';
    }

    const complexKeywords = ['兼向', '替卦', '大运', '流年', '反吟', '伏吟'];
    const hasAdvancedTopics = session.messages
      .filter(msg => msg.type === 'user')
      .some(msg =>
        complexKeywords.some(keyword => msg.content.includes(keyword))
      );

    if (hasAdvancedTopics && session.userProfile.expertise === 'beginner') {
      session.userProfile.expertise = 'intermediate';
    }
  }

  private generateSessionId(userId: string): string {
    return `session_${userId}_${Date.now()}`;
  }
}

export const enhancedAIChatService = new EnhancedAIChatService();
