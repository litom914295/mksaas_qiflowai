import type {
  AlgorithmExecutionResult,
  IntegratedResponse,
} from '@/lib/ai/algorithm-integration-service';
import type { ConversationSessionState } from '@/lib/ai/conversation-memory';
import type { MasterOrchestrator } from '@/lib/ai/master-orchestrator';
import { EnhancedAIChatService } from '../enhanced-ai-chat-service';

describe('EnhancedAIChatService', () => {
  const createAlgorithmResult = (
    overrides: Partial<AlgorithmExecutionResult> = {}
  ): AlgorithmExecutionResult => ({
    type: 'bazi',
    success: true,
    executionTime: 12,
    data: {
      pillars: {
        year: { stem: '甲', branch: '子' },
        month: { stem: '丙', branch: '寅' },
        day: { stem: '戊', branch: '辰' },
        hour: { stem: '庚', branch: '午' },
      },
      elements: { 金: 1, 水: 1, 木: 1, 火: 1, 土: 1 },
      yongshen: { favorable: ['木'], unfavorable: ['金'] },
    },
    confidence: {
      overall: 0.85,
      reasoning: '测试数据',
      factors: {
        dataQuality: 0.8,
        theoryMatch: 0.82,
        complexity: 0.6,
        culturalRelevance: 0.78,
      },
    },
    cacheKey: 'cache-key',
    ...overrides,
  });

  const createIntegratedResponse = (
    overrides: Partial<IntegratedResponse> = {}
  ): IntegratedResponse => ({
    aiResponse: {
      id: 'resp-1',
      provider: 'openai',
      model: 'gpt-test',
      created: Date.now(),
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: '这是一个测试回复',
          },
        },
      ],
    },
    algorithmResults: [createAlgorithmResult()],
    suggestions: [],
    followUpQuestions: [],
    actionItems: [],
    ...overrides,
  });

  const createSessionState = (): ConversationSessionState => ({
    sessionId: 'session-1',
    userId: 'user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currentState: 'greeting',
    context: {
      sessionId: 'session-1',
      userId: 'user-1',
      messages: [],
      userProfile: {
        preferences: {
          language: 'zh-CN',
          responseStyle: 'detailed',
          culturalBackground: 'mainland',
        },
        expertise: 'beginner',
        baziData: undefined,
      },
      metadata: {
        analysisCount: 0,
        totalMessages: 0,
        sessionDuration: 0,
        lastActivity: new Date().toISOString(),
      },
      domainSnapshot: { lastUpdatedAt: new Date().toISOString() },
      topicTags: [],
      currentTopic: 'greeting',
      contextStack: [],
    },
  });

  const buildStubOrchestrator = (response: IntegratedResponse) => {
    const normalized = {
      suggestions: ['保持家居整洁'],
      followUpQuestions: ['是否需要进一步分析住宅朝向？'],
      actionItems: ['准备户型图供进一步分析'],
    };

    const handleUserMessage = jest.fn(async () => ({
      reply: {
        id: 'assistant-1',
        role: 'assistant',
        content: response.aiResponse.choices[0]?.message.content ?? '',
        createdAt: new Date().toISOString(),
      },
      integratedResponse: response,
      sessionState: createSessionState(),
      normalized,
    }));

    const resetSession = jest.fn(async () => undefined);

    const stub = {
      handleUserMessage,
      resetSession,
    } as unknown as MasterOrchestrator;

    return { stub, handleUserMessage, resetSession, normalized };
  };

  it('通过 orchestrator 处理消息并更新会话状态', async () => {
    const integratedResponse = createIntegratedResponse();
    const { stub, handleUserMessage, normalized } =
      buildStubOrchestrator(integratedResponse);
    const service = new EnhancedAIChatService(stub);

    const result = await service.processMessage({
      sessionId: 'session-1',
      userId: 'user-1',
      message: '请帮我看看八字和风水布局',
    });

    expect(handleUserMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: 'session-1',
        userId: 'user-1',
        message: '请帮我看看八字和风水布局',
      })
    );

    expect(result.message.content).toBe('这是一个测试回复');
    expect(result.normalized).toEqual(normalized);

    const session = service.getEnhancedSession('session-1');
    expect(session).not.toBeNull();
    expect(session?.messages).toHaveLength(2);
    expect(session?.algorithmHistory).toHaveLength(1);
  });

  it('清理会话时调用 orchestrator.resetSession', async () => {
    const integratedResponse = createIntegratedResponse();
    const { stub, resetSession } = buildStubOrchestrator(integratedResponse);
    const service = new EnhancedAIChatService(stub);

    await service.processMessage({
      sessionId: 'session-2',
      userId: 'user-2',
      message: '查询住宅朝向',
    });

    const cleaned = service.cleanupSession('session-2', 1);
    expect(cleaned).toBe(true);
    expect(resetSession).toHaveBeenCalledWith('session-2', 'user-2');
  });
});
