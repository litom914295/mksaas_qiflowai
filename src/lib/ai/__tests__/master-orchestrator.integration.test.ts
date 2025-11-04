/** @jest-environment node */
/**
 * @jest-environment node
 */

import type {
  AlgorithmIntegrationService,
  IntegratedResponse,
} from '../algorithm-integration-service';
import type { ConversationSessionState } from '../conversation-memory';
import type { ConversationMemoryAdapter } from '../conversation-memory';
import type { CostController } from '../cost-controller';
import type { KnowledgeGraphService } from '../knowledge/knowledge-service';
import {
  MasterOrchestrator,
  type MasterOrchestratorOptions,
  type OrchestratorHandleParams,
} from '../master-orchestrator';
import type { PolicyEngine } from '../strategy/policy-engine';
import type { UsageTracker } from '../usage-tracker';

// Mock all external dependencies
jest.mock('../algorithm-integration-service');
jest.mock('../knowledge/knowledge-service');
jest.mock('../cost-controller');
jest.mock('../usage-tracker');
jest.mock('../providers/failover-middleware', () => ({
  withProviderFailover: jest.fn().mockImplementation(async (fn, fallbacks) => {
    try {
      return await fn();
    } catch (error) {
      if (fallbacks && fallbacks.length > 0) {
        return await fallbacks[0]();
      }
      throw error;
    }
  }),
}));

// Mock confidence aggregator
jest.mock('../confidence/confidence-aggregator', () => ({
  evaluateConfidence: jest.fn().mockReturnValue({
    overall: 0.8,
    dimensions: {
      accuracy: 0.8,
      relevance: 0.9,
      completeness: 0.7,
    },
    requiresReview: false,
  }),
  confidenceRepository: {
    upsert: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock explainer
jest.mock('../explainer/conversation-explainer', () => ({
  buildExplanation: jest.fn().mockReturnValue({
    summary: 'Test explanation summary',
    reasoning: 'Test reasoning',
    confidence: 0.8,
    factors: ['factor1', 'factor2'],
  }),
}));

// Mock pricing
jest.mock('../pricing', () => ({
  estimateCostUsd: jest.fn().mockReturnValue(0.05),
}));

describe('MasterOrchestrator Integration Tests', () => {
  let orchestrator: MasterOrchestrator;
  let mockAlgorithmService: jest.Mocked<AlgorithmIntegrationService>;
  let mockMemoryAdapter: jest.Mocked<ConversationMemoryAdapter>;
  let mockPolicyEngine: jest.Mocked<PolicyEngine>;
  let mockKnowledgeService: jest.Mocked<KnowledgeGraphService>;
  let mockCostController: jest.Mocked<CostController>;
  let mockUsageTracker: jest.Mocked<UsageTracker>;
  let mockLogger: jest.Mocked<
    Pick<Console, 'debug' | 'info' | 'warn' | 'error'>
  >;

  const mockIntegratedResponse: IntegratedResponse = {
    aiResponse: {
      id: 'ai-response-123',
      provider: 'openai',
      model: 'gpt-4o',
      created: Date.now(),
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content:
              '根据您的八字分析，您的五行属性偏重金水，建议在家中东南方位摆放绿色植物。',
          },
        },
      ],
      confidence: {
        overall: 0.85,
        reasoning: 'Based on traditional BaZi analysis',
        factors: {
          dataQuality: 0.9,
          theoryMatch: 0.8,
          complexity: 0.7,
          culturalRelevance: 0.9,
        },
      },
    },
    algorithmResults: [
      {
        type: 'bazi',
        success: true,
        data: {
          pillars: {
            year: { stem: '甲', branch: '子' },
            month: { stem: '丙', branch: '寅' },
            day: { stem: '戊', branch: '辰' },
            hour: { stem: '庚', branch: '午' },
          },
          elements: { 金: 3, 水: 2, 木: 1, 火: 1, 土: 1 },
          yongshen: { favorable: ['木'], unfavorable: ['金'] },
        },
        confidence: {
          overall: 0.9,
          reasoning: '算法执行成功',
          factors: {
            dataQuality: 0.9,
            theoryMatch: 0.9,
            complexity: 0.8,
            culturalRelevance: 0.9,
          },
        },
        executionTime: 150,
      },
    ],
    suggestions: ['在东南方位摆放绿色植物', '选择暖色调装饰'],
    followUpQuestions: ['您家中东南方位目前的布置如何？'],
    actionItems: ['确认东南方位', '选择适合的植物'],
    confidence: 0.85,
    metadata: { analysisType: 'bazi_fengshui' },
    analysis: [
      {
        type: 'bazi',
        success: true,
        executionTime: 100,
        data: {
          pillars: {
            year: { stem: '甲', branch: '子' },
            month: { stem: '丙', branch: '寅' },
            day: { stem: '戊', branch: '辰' },
            hour: { stem: '庚', branch: '午' },
          },
          elements: { 金: 3, 水: 2, 木: 1, 火: 1, 土: 1 },
          yongshen: { favorable: ['木'], unfavorable: ['金'] },
        },
        confidence: {
          overall: 0.85,
          reasoning: '基于五行分析',
          factors: {
            dataQuality: 0.9,
            theoryMatch: 0.8,
            complexity: 0.7,
            culturalRelevance: 0.9,
          },
        },
      },
    ],
    summary: '根据八字分析提供的风水建议',
    highlights: ['东南方位', '绿色植物'],
    nextSteps: ['实施风水调整'],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mocks
    mockAlgorithmService = {
      processUserMessage: jest.fn().mockResolvedValue(mockIntegratedResponse),
    } as any;

    mockMemoryAdapter = {
      load: jest.fn(),
      persist: jest.fn().mockResolvedValue(undefined),
      reset: jest.fn().mockResolvedValue(undefined),
    } as any;

    mockPolicyEngine = {
      evaluate: jest.fn().mockResolvedValue({
        nextState: 'analyzing',
        reasoning: 'Ready to analyze user data',
        confidence: 0.8,
        actions: ['analyze'],
      }),
    };

    mockKnowledgeService = {
      searchSimilarConcepts: jest.fn().mockResolvedValue([
        {
          id: 'knowledge-1',
          nodeType: 'principle',
          nodeData: { name: 'Five Elements Theory' },
          confidence: 0.9,
          tags: ['traditional', 'theory'],
        },
      ]),
    } as any;

    mockCostController = {
      ensureWithinBudget: jest.fn().mockResolvedValue(true),
    } as any;

    mockUsageTracker = {
      record: jest.fn().mockResolvedValue(undefined),
    } as any;

    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    // Create orchestrator with mocked dependencies
    const options: MasterOrchestratorOptions = {
      algorithmService: mockAlgorithmService,
      memoryAdapter: mockMemoryAdapter,
      logger: mockLogger,
      policyEngine: mockPolicyEngine,
      knowledgeService: mockKnowledgeService,
      costController: mockCostController,
      usageTracker: mockUsageTracker,
      defaultLocale: 'zh-CN',
    };

    orchestrator = new MasterOrchestrator(options);
  });

  describe('Full Conversation Flow', () => {
    it('should handle a complete conversation flow from greeting to analysis', async () => {
      // Setup: No existing session
      mockMemoryAdapter.load.mockResolvedValue(null);

      // First message: Greeting
      const greetingParams: OrchestratorHandleParams = {
        sessionId: 'session-123',
        userId: 'user-456',
        message: '你好，我想了解我的八字和风水',
        locale: 'zh-CN',
        traceId: 'trace-123',
      };

      const greetingResult =
        await orchestrator.handleUserMessage(greetingParams);

      // Verify greeting response
      expect(greetingResult.reply.content).toBe(
        '根据您的八字分析，您的五行属性偏重金水，建议在家中东南方位摆放绿色植物。'
      );
      expect(greetingResult.sessionState.currentState).toBe('analyzing');
      expect(greetingResult.confidence.overall).toBe(0.8);
      expect(greetingResult.knowledge).toHaveLength(1);

      // Verify session was created and persisted
      expect(mockMemoryAdapter.persist).toHaveBeenCalledTimes(2); // Once for user message, once for assistant message

      // Setup for second message: Use the session from first interaction
      const updatedSession: ConversationSessionState =
        greetingResult.sessionState;
      mockMemoryAdapter.load.mockResolvedValueOnce(updatedSession);

      // Update policy engine response for follow-up
      mockPolicyEngine.evaluate.mockResolvedValueOnce({
        nextState: 'recommending',
        reasoning: 'Ready to provide recommendations',
        confidence: 0.9,
        actions: ['summarize'],
      });

      // Second message: Follow-up question
      const followUpParams: OrchestratorHandleParams = {
        sessionId: 'session-123',
        userId: 'user-456',
        message: '我家东南方位是卧室，应该怎么调整？',
        locale: 'zh-CN',
        traceId: 'trace-124',
      };

      const followUpResult =
        await orchestrator.handleUserMessage(followUpParams);

      // Verify follow-up response
      expect(followUpResult.sessionState.currentState).toBe('recommending');
      expect(followUpResult.sessionState.context.messages).toHaveLength(4); // 2 user + 2 assistant messages
      expect(mockAlgorithmService.processUserMessage).toHaveBeenCalledTimes(2);
    });

    it('should handle conversation with budget constraints', async () => {
      // Setup: Budget exceeded
      mockCostController.ensureWithinBudget.mockResolvedValue(false);
      mockMemoryAdapter.load.mockResolvedValue(null);

      const params: OrchestratorHandleParams = {
        sessionId: 'session-budget-test',
        userId: 'user-budget-test',
        message: '请分析我的八字',
        locale: 'zh-CN',
      };

      const result = await orchestrator.handleUserMessage(params);

      // Should return budget exceeded response
      expect(result.limitedByBudget).toBe(true);
      expect(result.reply.content).toContain('预算上限');
      expect(mockAlgorithmService.processUserMessage).not.toHaveBeenCalled();

      // Usage should still be recorded with success=false
      expect(mockUsageTracker.record).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        })
      );
    });

    it('should handle algorithm service failures with fallback', async () => {
      // Setup: Algorithm service fails
      mockAlgorithmService.processUserMessage.mockRejectedValueOnce(
        new Error('AI service unavailable')
      );
      mockMemoryAdapter.load.mockResolvedValue(null);

      const params: OrchestratorHandleParams = {
        sessionId: 'session-fallback-test',
        userId: 'user-fallback-test',
        message: '请分析我的运势',
        locale: 'zh-CN',
      };

      const result = await orchestrator.handleUserMessage(params);

      // Should use fallback response
      expect(result.reply.content).toContain('暂时不可用');
      expect(result.integratedResponse.metadata?.reason).toBe('failover');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle knowledge service failures gracefully', async () => {
      // Setup: Knowledge service fails
      mockKnowledgeService.searchSimilarConcepts.mockRejectedValueOnce(
        new Error('Knowledge DB unavailable')
      );
      mockMemoryAdapter.load.mockResolvedValue(null);

      const params: OrchestratorHandleParams = {
        sessionId: 'session-knowledge-fail',
        userId: 'user-knowledge-fail',
        message: '告诉我五行理论',
        locale: 'zh-CN',
      };

      const result = await orchestrator.handleUserMessage(params);

      // Should complete successfully without knowledge enhancement
      expect(result.knowledge).toEqual([]);
      expect(result.reply.content).toBeDefined();
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  describe('Session Management', () => {
    it('should create new session when none exists', async () => {
      mockMemoryAdapter.load.mockResolvedValue(null);

      const params: OrchestratorHandleParams = {
        sessionId: 'new-session',
        userId: 'new-user',
        message: '开始新的对话',
        locale: 'zh-CN',
      };

      const result = await orchestrator.handleUserMessage(params);

      expect(result.sessionState.sessionId).toBe('new-session');
      expect(result.sessionState.userId).toBe('new-user');
      expect(result.sessionState.locale).toBe('zh-CN');
      expect(result.sessionState.currentState).toBe('analyzing');
    });

    it('should load and update existing session', async () => {
      const existingSession: ConversationSessionState = {
        sessionId: 'existing-session',
        userId: 'existing-user',
        locale: 'en',
        currentState: 'collecting_info',
        context: {
          sessionId: 'existing-session',
          userId: 'existing-user',
          messages: [
            {
              id: 'msg-1',
              role: 'user',
              content: 'Previous message',
              timestamp: new Date().toISOString(),
            },
          ],
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
          topicTags: ['greeting'],
          currentTopic: 'greeting',
          contextStack: [],
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockMemoryAdapter.load.mockResolvedValue(existingSession);

      const params: OrchestratorHandleParams = {
        sessionId: 'existing-session',
        userId: 'existing-user',
        message: 'Continue conversation',
        locale: 'en',
      };

      const result = await orchestrator.handleUserMessage(params);

      expect(result.sessionState.context.messages).toHaveLength(3); // Previous + new user + new assistant
      expect(result.sessionState.locale).toBe('en'); // Should maintain existing locale
    });

    it('should reset session successfully', async () => {
      await orchestrator.resetSession('session-to-reset', 'user-to-reset');

      expect(mockMemoryAdapter.reset).toHaveBeenCalledWith(
        'session-to-reset',
        'user-to-reset'
      );
    });

    it('should retrieve existing session', async () => {
      const mockSession: ConversationSessionState = {
        sessionId: 'test-session',
        userId: 'test-user',
        locale: 'zh-CN',
        currentState: 'analyzing',
        context: {
          sessionId: 'test-session',
          userId: 'test-user',
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
            analysisCount: 1,
            totalMessages: 0,
            sessionDuration: 0,
            lastActivity: new Date().toISOString(),
          },
          domainSnapshot: { lastUpdatedAt: new Date().toISOString() },
          currentTopic: 'greeting',
          contextStack: [],
          topicTags: [],
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockMemoryAdapter.load.mockResolvedValue(mockSession);

      const result = await orchestrator.getSession('test-session', 'test-user');

      expect(result).toEqual(mockSession);
      expect(mockMemoryAdapter.load).toHaveBeenCalledWith(
        'test-session',
        'test-user'
      );
    });
  });

  describe('State Management', () => {
    it('should transition states based on policy decisions', async () => {
      mockMemoryAdapter.load.mockResolvedValue(null);

      // First call: collecting_info
      mockPolicyEngine.evaluate.mockResolvedValueOnce({
        nextState: 'collecting_info',
        reasoning: 'Need more user information',
        confidence: 0.7,
        actions: ['ask_more'],
      });

      const params1: OrchestratorHandleParams = {
        sessionId: 'state-test',
        userId: 'state-user',
        message: '我想看风水',
        locale: 'zh-CN',
      };

      const result1 = await orchestrator.handleUserMessage(params1);

      expect(result1.state.current).toBe('collecting_info');
      expect(result1.state.previous).toBe('greeting');
      expect(result1.state.decision.nextState).toBe('collecting_info');

      // Second call: analyzing
      mockMemoryAdapter.load.mockResolvedValueOnce(result1.sessionState);
      mockPolicyEngine.evaluate.mockResolvedValueOnce({
        nextState: 'analyzing',
        reasoning: 'Ready to analyze',
        confidence: 0.9,
        actions: ['analyze'],
      });

      const params2: OrchestratorHandleParams = {
        sessionId: 'state-test',
        userId: 'state-user',
        message: '我的生辰八字是1990年5月15日14时',
        locale: 'zh-CN',
      };

      const result2 = await orchestrator.handleUserMessage(params2);

      expect(result2.state.current).toBe('analyzing');
      expect(result2.state.previous).toBe('collecting_info');
    });

    it('should handle expert handoff state', async () => {
      mockMemoryAdapter.load.mockResolvedValue(null);

      mockPolicyEngine.evaluate.mockResolvedValueOnce({
        nextState: 'expert_handoff',
        reasoning: 'Complex case requires expert',
        confidence: 0.6,
        actions: ['handoff'],
      });

      const params: OrchestratorHandleParams = {
        sessionId: 'expert-test',
        userId: 'expert-user',
        message: '我的情况很复杂，需要详细分析',
        locale: 'zh-CN',
      };

      const result = await orchestrator.handleUserMessage(params);

      expect(result.state.current).toBe('expert_handoff');
      expect(result.state.decision.actions).toContain('handoff');
    });
  });

  describe('Domain Knowledge Integration', () => {
    it('should integrate BaZi algorithm results into domain snapshot', async () => {
      mockMemoryAdapter.load.mockResolvedValue(null);

      const baziIntegratedResponse: IntegratedResponse = {
        ...mockIntegratedResponse,
        algorithmResults: [
          {
            type: 'bazi',
            success: true,
            data: {
              pillars: {
                year: { stem: '甲', branch: '子' },
                month: { stem: '丙', branch: '寅' },
                day: { stem: '戊', branch: '辰' },
                hour: { stem: '庚', branch: '午' },
              },
              elements: { 金: 2, 水: 1, 木: 2, 火: 2, 土: 1 },
              yongshen: { favorable: ['火'], unfavorable: ['金'] },
            },
            confidence: {
              overall: 0.95,
              reasoning: '算法执行成功',
              factors: {
                dataQuality: 0.95,
                theoryMatch: 0.95,
                complexity: 0.9,
                culturalRelevance: 0.95,
              },
            },
            executionTime: 200,
          },
        ],
      };

      mockAlgorithmService.processUserMessage.mockResolvedValueOnce(
        baziIntegratedResponse
      );

      const params: OrchestratorHandleParams = {
        sessionId: 'bazi-test',
        userId: 'bazi-user',
        message: '请分析我的八字命理',
        locale: 'zh-CN',
      };

      const result = await orchestrator.handleUserMessage(params);

      expect(result.sessionState.context.domainSnapshot?.bazi).toBeDefined();
      expect(result.sessionState.context.topicTags).toContain('bazi');
    });

    it('should integrate FengShui algorithm results into domain snapshot', async () => {
      mockMemoryAdapter.load.mockResolvedValue(null);

      const fengshuiIntegratedResponse: IntegratedResponse = {
        ...mockIntegratedResponse,
        algorithmResults: [
          {
            type: 'fengshui',
            success: true,
            data: {
              period: 9,
              plates: [],
              evaluation: {},
              meta: {},
            } as any,
            confidence: {
              overall: 0.88,
              reasoning: '算法执行成功',
              factors: {
                dataQuality: 0.88,
                theoryMatch: 0.88,
                complexity: 0.85,
                culturalRelevance: 0.88,
              },
            },
            executionTime: 300,
          },
        ],
      };

      mockAlgorithmService.processUserMessage.mockResolvedValueOnce(
        fengshuiIntegratedResponse
      );

      const params: OrchestratorHandleParams = {
        sessionId: 'fengshui-test',
        userId: 'fengshui-user',
        message: '请看看我家的风水布局',
        locale: 'zh-CN',
      };

      const result = await orchestrator.handleUserMessage(params);

      expect(
        result.sessionState.context.domainSnapshot?.fengshui
      ).toBeDefined();
      expect(result.sessionState.context.topicTags).toContain('fengshui');
    });

    it('should handle both BaZi and FengShui results together', async () => {
      mockMemoryAdapter.load.mockResolvedValue(null);

      const combinedIntegratedResponse: IntegratedResponse = {
        ...mockIntegratedResponse,
        algorithmResults: [
          {
            type: 'bazi',
            success: true,
            data: {
              pillars: {
                year: { stem: '甲', branch: '子' },
                month: { stem: '丙', branch: '寅' },
                day: { stem: '戊', branch: '辰' },
                hour: { stem: '庚', branch: '午' },
              },
              elements: { 金: 3, 水: 2, 木: 1, 火: 1, 土: 1 },
              yongshen: { favorable: ['木'], unfavorable: ['金'] },
            },
            confidence: {
              overall: 0.9,
              reasoning: '算法执行成功',
              factors: {
                dataQuality: 0.9,
                theoryMatch: 0.9,
                complexity: 0.8,
                culturalRelevance: 0.9,
              },
            },
            executionTime: 150,
          },
          {
            type: 'fengshui',
            success: true,
            data: {
              period: 9,
              plates: [],
              evaluation: {},
              meta: {},
            } as any,
            confidence: {
              overall: 0.85,
              reasoning: '算法执行成功',
              factors: {
                dataQuality: 0.85,
                theoryMatch: 0.85,
                complexity: 0.8,
                culturalRelevance: 0.85,
              },
            },
            executionTime: 200,
          },
        ],
      };

      mockAlgorithmService.processUserMessage.mockResolvedValueOnce(
        combinedIntegratedResponse
      );

      const params: OrchestratorHandleParams = {
        sessionId: 'combined-test',
        userId: 'combined-user',
        message: '综合分析我的八字和家宅风水',
        locale: 'zh-CN',
      };

      const result = await orchestrator.handleUserMessage(params);

      expect(result.sessionState.context.domainSnapshot?.bazi).toBeDefined();
      expect(
        result.sessionState.context.domainSnapshot?.fengshui
      ).toBeDefined();
      expect(result.sessionState.context.topicTags).toContain('bazi');
      expect(result.sessionState.context.topicTags).toContain('fengshui');
    });
  });

  describe('Usage Tracking and Metrics', () => {
    it('should record usage metrics for successful interactions', async () => {
      mockMemoryAdapter.load.mockResolvedValue(null);

      const params: OrchestratorHandleParams = {
        sessionId: 'usage-test',
        userId: 'usage-user',
        message: '请分析我的命理',
        locale: 'zh-CN',
        traceId: 'trace-usage-123',
      };

      const result = await orchestrator.handleUserMessage(params);

      expect(mockUsageTracker.record).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 'usage-test',
          userId: 'usage-user',
          provider: 'openai',
          model: 'gpt-4o',
          success: true,
          traceId: 'trace-usage-123',
          metadata: expect.objectContaining({
            state: 'analyzing',
            limitedByBudget: false,
          }),
        })
      );

      expect(result.usage.promptTokens).toBeGreaterThan(0);
      expect(result.usage.completionTokens).toBeGreaterThan(0);
      expect(result.usage.totalTokens).toBeGreaterThan(0);
      expect(result.usage.costUsd).toBe(0.05);
    });

    it('should record usage metrics for budget-limited interactions', async () => {
      mockMemoryAdapter.load.mockResolvedValue(null);
      mockCostController.ensureWithinBudget.mockResolvedValue(false);

      const params: OrchestratorHandleParams = {
        sessionId: 'budget-usage-test',
        userId: 'budget-usage-user',
        message: '请分析',
        locale: 'zh-CN',
      };

      const result = await orchestrator.handleUserMessage(params);

      expect(mockUsageTracker.record).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          metadata: expect.objectContaining({
            limitedByBudget: true,
          }),
        })
      );

      expect(result.limitedByBudget).toBe(true);
    });

    it('should handle usage tracking failures gracefully', async () => {
      mockMemoryAdapter.load.mockResolvedValue(null);
      mockUsageTracker.record.mockRejectedValueOnce(
        new Error('Usage tracking failed')
      );

      const params: OrchestratorHandleParams = {
        sessionId: 'usage-fail-test',
        userId: 'usage-fail-user',
        message: '测试使用量记录失败',
        locale: 'zh-CN',
      };

      // Should not throw despite usage tracking failure
      const result = await orchestrator.handleUserMessage(params);

      expect(result.reply.content).toBeDefined();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        '[MasterOrchestrator] usage record failed',
        expect.any(Error)
      );
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle empty messages gracefully', async () => {
      const params: OrchestratorHandleParams = {
        sessionId: 'empty-test',
        userId: 'empty-user',
        message: '',
        locale: 'zh-CN',
      };

      await expect(orchestrator.handleUserMessage(params)).rejects.toThrow(
        '????????'
      );
    });

    it('should handle whitespace-only messages', async () => {
      const params: OrchestratorHandleParams = {
        sessionId: 'whitespace-test',
        userId: 'whitespace-user',
        message: '   \n\t   ',
        locale: 'zh-CN',
      };

      await expect(orchestrator.handleUserMessage(params)).rejects.toThrow(
        '????????'
      );
    });

    it('should handle memory adapter failures', async () => {
      mockMemoryAdapter.load.mockRejectedValueOnce(
        new Error('Memory load failed')
      );
      mockMemoryAdapter.persist.mockRejectedValueOnce(
        new Error('Memory persist failed')
      );

      const params: OrchestratorHandleParams = {
        sessionId: 'memory-fail-test',
        userId: 'memory-fail-user',
        message: '测试内存适配器失败',
        locale: 'zh-CN',
      };

      // Should handle gracefully by creating new session
      await expect(orchestrator.handleUserMessage(params)).rejects.toThrow();
    });

    it('should handle policy engine failures', async () => {
      mockMemoryAdapter.load.mockResolvedValue(null);
      mockPolicyEngine.evaluate.mockRejectedValueOnce(
        new Error('Policy evaluation failed')
      );

      const params: OrchestratorHandleParams = {
        sessionId: 'policy-fail-test',
        userId: 'policy-fail-user',
        message: '测试策略引擎失败',
        locale: 'zh-CN',
      };

      // Should handle gracefully
      await expect(orchestrator.handleUserMessage(params)).rejects.toThrow();
    });
  });

  describe('Localization and Internationalization', () => {
    it('should handle different locales correctly', async () => {
      mockMemoryAdapter.load.mockResolvedValue(null);

      const locales = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko'];

      for (const locale of locales) {
        const params: OrchestratorHandleParams = {
          sessionId: `locale-test-${locale}`,
          userId: `locale-user-${locale}`,
          message: 'Test message',
          locale,
        };

        const result = await orchestrator.handleUserMessage(params);

        expect(result.sessionState.locale).toBe(locale);
        mockMemoryAdapter.load.mockClear();
      }
    });

    it('should use default locale when none provided', async () => {
      mockMemoryAdapter.load.mockResolvedValue(null);

      const params: OrchestratorHandleParams = {
        sessionId: 'default-locale-test',
        userId: 'default-locale-user',
        message: 'Test message',
        // No locale provided
      };

      const result = await orchestrator.handleUserMessage(params);

      expect(result.sessionState.locale).toBe('zh-CN'); // Default set in beforeEach
    });
  });

  describe('Confidence and Quality Assessment', () => {
    it('should evaluate and record confidence scores', async () => {
      mockMemoryAdapter.load.mockResolvedValue(null);

      const params: OrchestratorHandleParams = {
        sessionId: 'confidence-test',
        userId: 'confidence-user',
        message: '请分析我的运势',
        locale: 'zh-CN',
        traceId: 'trace-confidence-123',
      };

      const result = await orchestrator.handleUserMessage(params);

      expect(result.confidence.overall).toBe(0.8);
      expect(result.confidence.dimensions).toBeDefined();
      expect(result.confidence.requiresReview).toBe(false);

      // Verify confidence was recorded
      const { confidenceRepository } = await import(
        '../confidence/confidence-aggregator'
      );
      expect(confidenceRepository.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 'confidence-test',
          analysisId: 'ai-response-123',
          overall: 0.8,
          traceId: 'trace-confidence-123',
        })
      );
    });

    it('should provide explanations for AI decisions', async () => {
      mockMemoryAdapter.load.mockResolvedValue(null);

      const params: OrchestratorHandleParams = {
        sessionId: 'explanation-test',
        userId: 'explanation-user',
        message: '为什么给出这样的建议？',
        locale: 'zh-CN',
      };

      const result = await orchestrator.handleUserMessage(params);

      expect(result.explanation.summary).toBe('Test explanation summary');
      expect(result.explanation.highlights).toBeDefined();
      expect(result.explanation.nextSteps).toBeDefined();
    });
  });
});
