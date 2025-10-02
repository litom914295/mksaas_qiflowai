import {
  MasterOrchestrator,
  type ConversationAlgorithmService,
} from '../master-orchestrator';
import type {
  IntegratedResponse,
  AlgorithmExecutionResult,
} from '../algorithm-integration-service';

describe('MasterOrchestrator', () => {
  const buildAlgorithmResult = (
    overrides: Partial<AlgorithmExecutionResult> = {}
  ): AlgorithmExecutionResult => ({
    type: 'bazi',
    success: true,
    executionTime: 12,
    confidence: {
      overall: 0.82,
      reasoning: '测试数据',
      factors: {
        dataQuality: 0.8,
        theoryMatch: 0.8,
        complexity: 0.6,
        culturalRelevance: 0.75,
      },
    },
    ...overrides,
  });

  const buildResponse = (
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
    algorithmResults: [buildAlgorithmResult()],
    suggestions: ['保持居家整洁'],
    followUpQuestions: ['是否需要进一步分析住宅朝向？'],
    actionItems: ['准备户型图供进一步分析'],
    ...overrides,
  });

  class StubAlgorithmService implements ConversationAlgorithmService {
    constructor(private readonly response: IntegratedResponse) {}

    async processUserMessage(): Promise<IntegratedResponse> {
      return this.response;
    }
  }

  it('整合算法结果并维护会话上下文', async () => {
    const orchestrator = new MasterOrchestrator({
      algorithmService: new StubAlgorithmService(buildResponse()),
      defaultLocale: 'zh-CN',
    });

    const result = await orchestrator.handleUserMessage({
      sessionId: 'session-1',
      userId: 'user-1',
      message: '请帮我看看八字和风水布局',
    });

    expect(result.reply.content).toBe('这是一个测试回复');
    expect(result.sessionState.context.messages).toHaveLength(2);
    expect(result.sessionState.context.domainSnapshot?.bazi).toBeDefined();
    expect(result.normalized.suggestions).toContain('保持居家整洁');
    expect(result.normalized.followUpQuestions.length).toBeGreaterThan(0);
    expect(result.normalized.actionItems[0]).toContain('准备');
  });

  it('在算法服务失败时返回降级响应', async () => {
    const failingService: ConversationAlgorithmService = {
      async processUserMessage() {
        throw new Error('service unavailable');
      },
    };

    const orchestrator = new MasterOrchestrator({
      algorithmService: failingService,
      defaultLocale: 'zh-CN',
    });

    const result = await orchestrator.handleUserMessage({
      sessionId: 'session-2',
      userId: 'user-2',
      message: '查询住宅朝向',
    });

    expect(result.integratedResponse.aiResponse.provider).toBe('fallback');
    expect(result.reply.content).toContain('抱歉');
    expect(result.sessionState.context.messages).toHaveLength(2);
  });
});
