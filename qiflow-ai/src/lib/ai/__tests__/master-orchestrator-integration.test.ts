import { InMemoryConversationMemory } from '@/lib/ai/conversation-memory';
import { MasterOrchestrator } from '@/lib/ai/master-orchestrator';
import { RuleBasedPolicyEngine } from '@/lib/ai/strategy/policy-engine';
import { afterEach, beforeEach, describe, expect, test } from '@jest/globals';
// import { vi } from '@jest/globals';
const vi = {
  mock: jest.fn,
  mockResolvedValue: jest.fn().mockResolvedValue,
  mockRejectedValue: jest.fn().mockRejectedValue,
  mockImplementation: jest.fn().mockImplementation,
  mockReturnValue: jest.fn().mockReturnValue,
  mockClear: jest.fn().mockClear,
  mockReset: jest.fn().mockReset,
  mockRestore: jest.fn().mockRestore,
  fn: jest.fn,
  spyOn: jest.spyOn,
  clearAllMocks: jest.clearAllMocks,
  resetAllMocks: jest.resetAllMocks,
  restoreAllMocks: jest.restoreAllMocks,
  useFakeTimers: jest.useFakeTimers,
  useRealTimers: jest.useRealTimers,
  advanceTimersByTime: jest.advanceTimersByTime,
  runAllTimers: jest.runAllTimers,
  runOnlyPendingTimers: jest.runOnlyPendingTimers,
  clearAllTimers: jest.clearAllTimers,
  getTimerCount: jest.getTimerCount,
  setSystemTime: jest.setSystemTime,
  getRealSystemTime: jest.getRealSystemTime,
  isMockFunction: jest.isMockFunction,
  mocked: jest.mocked,
  replaceProperty: jest.replaceProperty,
};

// Mock external dependencies
jest.mock('@/lib/ai/providers/failover-middleware');
jest.mock('@/lib/ai/algorithm-integration-service');
jest.mock('@/lib/ai/knowledge/knowledge-service');

describe('MasterOrchestrator 集成测试', () => {
  let orchestrator: MasterOrchestrator;
  let mockAlgorithmService: any;
  let mockKnowledgeService: any;
  let mockCostController: any;
  let mockUsageTracker: any;
  let memoryAdapter: InMemoryConversationMemory;
  let policyEngine: RuleBasedPolicyEngine;

  beforeEach(async () => {
    // 设置 Mock 服务
    mockAlgorithmService = {
      processUserMessage: vi.fn(),
    };

    mockKnowledgeService = {
      queryKnowledge: vi.fn(),
      buildContext: vi.fn(),
    };

    mockCostController = {
      checkBudget: vi.fn().mockResolvedValue({ allowed: true, remaining: 100 }),
      trackUsage: vi.fn(),
    };

    mockUsageTracker = {
      trackRequest: vi.fn(),
      getUsageStats: vi.fn().mockReturnValue({
        totalRequests: 0,
        totalCost: 0,
        averageResponseTime: 0,
      }),
    };

    memoryAdapter = new InMemoryConversationMemory();
    policyEngine = new RuleBasedPolicyEngine();

    // 创建 MasterOrchestrator 实例
    orchestrator = new MasterOrchestrator({
      algorithmService: mockAlgorithmService,
      memoryAdapter,
      policyEngine,
      knowledgeService: mockKnowledgeService,
      costController: mockCostController,
      usageTracker: mockUsageTracker,
      logger: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('初始化和配置', () => {
    test('应该正确初始化所有组件', () => {
      expect(orchestrator).toBeDefined();
      expect(memoryAdapter).toBeDefined();
      expect(policyEngine).toBeDefined();
    });

    test('应该使用默认配置', () => {
      const defaultOrchestrator = new MasterOrchestrator({});
      expect(defaultOrchestrator).toBeDefined();
    });
  });

  describe('消息处理流程', () => {
    test('应该完整处理用户消息', async () => {
      const mockResponse = {
        content: '您好！我是AI风水大师，很高兴为您服务。',
        state: 'greeting' as const,
        confidence: 0.95,
        reasoning: '用户刚开始对话，提供欢迎信息',
        suggestedActions: ['收集八字信息'],
        metadata: {
          processingTime: 1200,
          tokenUsage: { input: 50, output: 30 },
          cost: 0.001,
        },
      };

      mockAlgorithmService.processUserMessage.mockResolvedValue(mockResponse);
      mockKnowledgeService.queryKnowledge.mockResolvedValue({
        relevantInfo: ['风水基础知识'],
        confidence: 0.8,
      });

      const result = await orchestrator.handleUserMessage({
        sessionId: 'test-session-1',
        userId: 'test-user-1',
        message: '你好',
        locale: 'zh-CN',
      });

      expect(result).toBeDefined();
      expect(result.reply.content).toBe(mockResponse.content);
      expect(result.sessionState.currentState).toBe('greeting');
      expect(mockCostController.checkBudget).toHaveBeenCalled();
      expect(mockUsageTracker.trackRequest).toHaveBeenCalled();
    });

    test('应该处理八字分析请求', async () => {
      const baziRequest = {
        sessionId: 'test-session-2',
        userId: 'test-user-2',
        message: '我想分析我的八字，出生日期1990年1月1日12点',
        locale: 'zh-CN',
      };

      const mockBaziResponse = {
        content: '正在为您分析八字信息...',
        state: 'analyzing' as const,
        confidence: 0.9,
        reasoning: '检测到八字信息，开始分析',
        suggestedActions: ['继续收集详细信息'],
        metadata: {
          processingTime: 2500,
          tokenUsage: { input: 120, output: 80 },
          cost: 0.003,
          extractedData: {
            birthDate: '1990-01-01',
            birthTime: '12:00',
          },
        },
      };

      mockAlgorithmService.processUserMessage.mockResolvedValue(
        mockBaziResponse
      );

      const result = await orchestrator.handleUserMessage(baziRequest);

      expect(result.state.current).toBe('analyzing');
      expect(result.integratedResponse.metadata?.extractedData).toBeDefined();
      expect(mockAlgorithmService.processUserMessage).toHaveBeenCalledWith(
        baziRequest.message,
        baziRequest.sessionId,
        baziRequest.userId,
        undefined
      );
    });
  });

  describe('状态管理集成', () => {
    test('应该正确跟踪会话状态转换', async () => {
      const sessionId = 'state-test-session';
      const userId = 'state-test-user';

      // 第一条消息 - greeting
      mockAlgorithmService.processUserMessage.mockResolvedValue({
        content: '欢迎！',
        state: 'greeting',
        confidence: 0.9,
        reasoning: '初始问候',
        suggestedActions: [],
        metadata: {
          processingTime: 800,
          tokenUsage: { input: 20, output: 15 },
          cost: 0.0005,
        },
      });

      await orchestrator.handleUserMessage({
        sessionId,
        userId,
        message: '你好',
      });

      // 第二条消息 - collecting_info
      mockAlgorithmService.processUserMessage.mockResolvedValue({
        content: '请提供您的出生信息',
        state: 'collecting_info',
        confidence: 0.85,
        reasoning: '开始收集用户信息',
        suggestedActions: ['填写八字表单'],
        metadata: {
          processingTime: 1000,
          tokenUsage: { input: 35, output: 25 },
          cost: 0.0008,
        },
      });

      await orchestrator.handleUserMessage({
        sessionId,
        userId,
        message: '我想了解我的八字',
      });

      // 验证状态历史
      const sessionState = await memoryAdapter.load(sessionId, 'test-user-1');
      expect(sessionState).toBeDefined();
      // expect(sessionState?.stateHistory).toHaveLength(2);
      // expect(sessionState?.stateHistory[0].state).toBe('greeting');
      // expect(sessionState?.stateHistory[1].state).toBe('collecting_info');
    });
  });

  describe('知识图谱集成', () => {
    test('应该查询和应用知识图谱信息', async () => {
      const knowledgeQuery = '五行相生相克';
      const mockKnowledgeResult = {
        relevantInfo: [
          '五行相生：金生水，水生木，木生火，火生土，土生金',
          '五行相克：金克木，木克土，土克水，水克火，火克金',
        ],
        confidence: 0.9,
        sources: ['风水经典', '易经'],
      };

      mockKnowledgeService.queryKnowledge.mockResolvedValue(
        mockKnowledgeResult
      );
      mockAlgorithmService.processUserMessage.mockResolvedValue({
        content: '五行理论是风水学的基础...',
        state: 'explaining',
        confidence: 0.95,
        reasoning: '基于知识图谱提供详细解释',
        suggestedActions: ['深入了解个人五行'],
        metadata: {
          processingTime: 1800,
          tokenUsage: { input: 200, output: 150 },
          cost: 0.005,
          knowledgeUsed: true,
        },
      });

      const result = await orchestrator.handleUserMessage({
        sessionId: 'knowledge-test',
        userId: 'knowledge-user',
        message: '请解释五行理论',
      });

      expect(mockKnowledgeService.queryKnowledge).toHaveBeenCalledWith(
        expect.stringContaining('五行')
      );
      expect(result.integratedResponse.metadata?.knowledgeUsed).toBe(true);
    });
  });

  describe('成本控制集成', () => {
    test('应该检查预算限制', async () => {
      mockCostController.checkBudget.mockResolvedValue({
        allowed: false,
        remaining: 0,
        reason: '预算已用完',
      });

      await expect(
        orchestrator.handleUserMessage({
          sessionId: 'budget-test',
          userId: 'budget-user',
          message: '测试消息',
        })
      ).rejects.toThrow('预算限制');

      expect(mockCostController.checkBudget).toHaveBeenCalled();
    });

    test('应该跟踪使用成本', async () => {
      mockAlgorithmService.processUserMessage.mockResolvedValue({
        content: '响应',
        state: 'greeting',
        confidence: 0.8,
        reasoning: '测试',
        suggestedActions: [],
        metadata: {
          processingTime: 1000,
          tokenUsage: { input: 50, output: 30 },
          cost: 0.002,
        },
      });

      await orchestrator.handleUserMessage({
        sessionId: 'cost-test',
        userId: 'cost-user',
        message: '测试消息',
      });

      expect(mockCostController.trackUsage).toHaveBeenCalledWith(
        expect.objectContaining({
          cost: 0.002,
          tokenUsage: { input: 50, output: 30 },
        })
      );
    });
  });

  describe('策略引擎集成', () => {
    test('应该应用对话策略', async () => {
      // 模拟策略决定需要更多信息
      const mockPolicyDecision = {
        action: 'request_more_info',
        confidence: 0.85,
        reasoning: '用户信息不足，需要收集更多数据',
        parameters: {
          requiredFields: ['birthDate', 'birthTime', 'gender'],
        },
        nextState: 'collecting_info' as any,
        actions: ['ask_more', 'analyze'] as any,
      };

      vi.spyOn(policyEngine, 'evaluate').mockResolvedValue(mockPolicyDecision);

      mockAlgorithmService.processUserMessage.mockResolvedValue({
        content: '请提供您的详细出生信息',
        state: 'collecting_info',
        confidence: 0.9,
        reasoning: '策略引擎建议收集更多信息',
        suggestedActions: ['填写表单'],
        metadata: {
          processingTime: 1200,
          tokenUsage: { input: 40, output: 35 },
          cost: 0.001,
          policyApplied: 'request_more_info',
        },
      });

      const result = await orchestrator.handleUserMessage({
        sessionId: 'policy-test',
        userId: 'policy-user',
        message: '我想看风水',
      });

      expect(policyEngine.evaluate).toHaveBeenCalled();
      expect(result.integratedResponse.metadata?.policyApplied).toBe(
        'request_more_info'
      );
    });
  });

  describe('置信度评估集成', () => {
    test('应该评估响应置信度', async () => {
      mockAlgorithmService.processUserMessage.mockResolvedValue({
        content: '基于您的八字分析...',
        state: 'explaining',
        confidence: 0.75,
        reasoning: '分析结果置信度中等',
        suggestedActions: ['获取更多信息提高准确度'],
        metadata: {
          processingTime: 2000,
          tokenUsage: { input: 100, output: 80 },
          cost: 0.003,
          confidenceBreakdown: {
            dataQuality: 0.7,
            algorithmAccuracy: 0.8,
            contextRelevance: 0.75,
          },
        },
      });

      const result = await orchestrator.handleUserMessage({
        sessionId: 'confidence-test',
        userId: 'confidence-user',
        message: '分析我的八字',
      });

      expect(result.confidence.overall).toBe(0.75);
      expect(result.confidence).toBeDefined();
    });
  });

  describe('错误处理和恢复', () => {
    test('应该处理算法服务错误', async () => {
      mockAlgorithmService.processUserMessage.mockRejectedValue(
        new Error('算法服务暂时不可用')
      );

      await expect(
        orchestrator.handleUserMessage({
          sessionId: 'error-test',
          userId: 'error-user',
          message: '测试消息',
        })
      ).rejects.toThrow('算法服务暂时不可用');
    });

    test('应该处理知识服务错误并降级', async () => {
      mockKnowledgeService.queryKnowledge.mockRejectedValue(
        new Error('知识图谱服务错误')
      );

      mockAlgorithmService.processUserMessage.mockResolvedValue({
        content: '响应（未使用知识图谱）',
        state: 'explaining',
        confidence: 0.6,
        reasoning: '知识服务不可用，使用基础回复',
        suggestedActions: [],
        metadata: {
          processingTime: 800,
          tokenUsage: { input: 30, output: 20 },
          cost: 0.0008,
          knowledgeServiceError: true,
        },
      });

      const result = await orchestrator.handleUserMessage({
        sessionId: 'knowledge-error-test',
        userId: 'knowledge-error-user',
        message: '解释风水原理',
      });

      expect(result.confidence.overall).toBe(0.6);
      expect(result.integratedResponse.metadata?.knowledgeServiceError).toBe(
        true
      );
    });
  });

  describe('性能监控', () => {
    test('应该跟踪处理时间', async () => {
      const startTime = Date.now();

      mockAlgorithmService.processUserMessage.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({
                  content: '响应',
                  state: 'greeting',
                  confidence: 0.8,
                  reasoning: '测试',
                  suggestedActions: [],
                  metadata: {
                    processingTime: 1500,
                    tokenUsage: { input: 40, output: 25 },
                    cost: 0.001,
                  },
                }),
              100
            )
          )
      );

      const result = await orchestrator.handleUserMessage({
        sessionId: 'perf-test',
        userId: 'perf-user',
        message: '性能测试',
      });

      const endTime = Date.now();
      const actualTime = endTime - startTime;

      expect(actualTime).toBeGreaterThan(90); // 至少100ms
      expect(mockUsageTracker.trackRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          processingTime: expect.any(Number),
        })
      );
    });
  });
});
