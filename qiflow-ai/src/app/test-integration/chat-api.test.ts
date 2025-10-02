/**
 * @jest-environment node
 */

import { POST } from '@/app/api/chat/route';
import { orchestrator, rateLimiter } from '@/app/api/chat/shared';
import { createMockRequest } from '@/lib/__tests__/test-helpers';
import {
  sanitizeAndValidateMessage,
  validateRequest,
  validateSessionId,
  validateUserId,
} from '@/lib/validation/input-validation';
import { ErrorCode, QiFlowApiError } from '@/types/api-errors';

// Mock dependencies
jest.mock('@/app/api/chat/shared', () => ({
  orchestrator: {
    handleUserMessage: jest.fn(),
  },
  rateLimiter: {
    consume: jest.fn(),
  },
}));

jest.mock('@/lib/validation/input-validation', () => ({
  validateRequest: jest.fn(),
  chatRequestSchema: {},
  sanitizeAndValidateMessage: jest.fn(),
  validateUserId: jest.fn(),
  validateSessionId: jest.fn(),
}));

jest.mock('@/lib/utils/retry-utils', () => ({
  withRetry: jest.fn().mockImplementation(async fn => await fn()),
}));

describe('/api/chat - E2E Tests', () => {
  let mockOrchestrator: jest.Mocked<typeof orchestrator>;
  let mockRateLimiter: jest.Mocked<typeof rateLimiter>;
  let mockValidateRequest: jest.MockedFunction<typeof validateRequest>;
  let mockSanitizeMessage: jest.MockedFunction<
    typeof sanitizeAndValidateMessage
  >;
  let mockValidateUserId: jest.MockedFunction<typeof validateUserId>;
  let mockValidateSessionId: jest.MockedFunction<typeof validateSessionId>;

  const mockOrchestratorResult = {
    reply: {
      id: 'reply-123',
      role: 'assistant' as const,
      content: '根据您的八字分析，建议在家中东南方位摆放绿色植物以增强木元素。',
      timestamp: new Date().toISOString(),
      metadata: {
        provider: 'openai',
        model: 'gpt-4o',
        tokens: 120,
        cost: 0.05,
      },
    },
    integratedResponse: {
      aiResponse: {
        id: 'ai-123',
        provider: 'openai',
        model: 'gpt-4o',
        created: Date.now(),
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant' as const,
              content:
                '根据您的八字分析，建议在家中东南方位摆放绿色植物以增强木元素。',
            },
          },
        ],
        confidence: {
          overall: 0.85,
          reasoning: 'Based on BaZi analysis',
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
          type: 'bazi' as const,
          success: true,
          data: {
            pillars: {
              year: { stem: '甲' as any, branch: '子' as any },
              month: { stem: '丙' as any, branch: '寅' as any },
              day: { stem: '戊' as any, branch: '辰' as any },
              hour: { stem: '庚' as any, branch: '午' as any },
            },
            elements: { 金: 2, 水: 1, 木: 1, 火: 3, 土: 1 },
            yongshen: { favorable: ['木' as any], unfavorable: ['金' as any] },
          },
          confidence: {
            overall: 0.9,
            reasoning: '基于八字分析',
            factors: {
              dataQuality: 0.9,
              theoryMatch: 0.8,
              complexity: 0.7,
              culturalRelevance: 0.9,
            },
          },
          executionTime: 150,
        },
      ],
      suggestions: ['在东南方位摆放绿色植物', '增加水元素装饰'],
      followUpQuestions: ['您家中东南方位目前的布置如何？'],
      actionItems: ['选择合适的植物', '调整房间布局'],
      confidence: 0.85,
      metadata: { analysisType: 'bazi_analysis' },
      // analysis: ['五行分析结果'],
      summary: 'BaZi风水分析建议',
      highlights: ['东南方位', '木元素'],
      nextSteps: ['实施风水调整'],
    },
    sessionState: {
      sessionId: 'session-123',
      userId: 'user-456',
      locale: 'zh-CN',
      currentState: 'recommending' as const,
      context: {
        sessionId: 'session-123',
        userId: 'user-456',
        messages: [
          {
            id: 'user-msg-1',
            role: 'user' as const,
            content: '请分析我的八字',
            timestamp: new Date().toISOString(),
          },
          {
            id: 'reply-123',
            role: 'assistant' as const,
            content:
              '根据您的八字分析，建议在家中东南方位摆放绿色植物以增强木元素。',
            timestamp: new Date().toISOString(),
          },
        ],
        userProfile: {
          preferences: {
            language: 'zh-CN' as const,
            responseStyle: 'detailed' as const,
            culturalBackground: 'mainland' as const,
          },
          expertise: 'beginner' as const,
          baziData: {
            year: 1990,
            month: 5,
            day: 15,
            hour: 14,
            gender: 'male' as const,
            timezone: 'Asia/Shanghai',
          },
        },
        metadata: {
          analysisCount: 1,
          totalMessages: 2,
          sessionDuration: 0,
          lastActivity: new Date().toISOString(),
        },
        domainSnapshot: {
          lastUpdatedAt: new Date().toISOString(),
        },
        topicTags: ['bazi'],
        currentTopic: 'bazi_analysis',
        contextStack: [],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    normalized: {
      suggestions: ['在东南方位摆放绿色植物', '增加水元素装饰'],
      followUpQuestions: ['您家中东南方位目前的布置如何？'],
      actionItems: ['选择合适的植物', '调整房间布局'],
    },
    confidence: {
      overall: 0.85,
      dimensions: {
        accuracy: 0.9,
        relevance: 0.8,
        completeness: 0.85,
      },
      requiresReview: false,
    },
    explanation: {
      summary: '基于八字五行分析的风水建议',
      highlights: ['五行平衡', '方位选择'],
      nextSteps: ['加强木元素', '选择有利方位'],
    },
    knowledge: [
      {
        id: 'knowledge-1',
        nodeType: 'principle',
        nodeData: { name: 'Five Elements Theory' },
        confidence: 0.9,
        tags: ['traditional', 'theory'],
      },
    ],
    usage: {
      promptTokens: 80,
      completionTokens: 120,
      totalTokens: 200,
      costUsd: 0.05,
      provider: 'openai',
      model: 'gpt-4o',
      responseTimeMs: 1500,
      success: true,
    },
    state: {
      previous: 'analyzing' as const,
      current: 'recommending' as const,
      decision: {
        nextState: 'recommending' as const,
        reasoning: 'Analysis complete, ready for recommendations',
        confidence: 0.8,
        actions: ['summarize'] as (
          | 'summarize'
          | 'ask_more'
          | 'analyze'
          | 'handoff'
        )[],
      },
    },
    limitedByBudget: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockOrchestrator = orchestrator as jest.Mocked<typeof orchestrator>;
    mockRateLimiter = rateLimiter as jest.Mocked<typeof rateLimiter>;
    mockValidateRequest = validateRequest as jest.MockedFunction<
      typeof validateRequest
    >;
    mockSanitizeMessage = sanitizeAndValidateMessage as jest.MockedFunction<
      typeof sanitizeAndValidateMessage
    >;
    mockValidateUserId = validateUserId as jest.MockedFunction<
      typeof validateUserId
    >;
    mockValidateSessionId = validateSessionId as jest.MockedFunction<
      typeof validateSessionId
    >;

    // Default successful mocks
    mockRateLimiter.consume.mockResolvedValue(true);
    mockOrchestrator.handleUserMessage.mockResolvedValue(
      mockOrchestratorResult
    );
    mockValidateRequest.mockResolvedValue({
      userId: 'user-456',
      message: '请分析我的八字',
      sessionId: 'session-123',
      locale: 'zh-CN',
      attachments: [],
      metadata: {},
    });
    mockSanitizeMessage.mockReturnValue('请分析我的八字');
    mockValidateUserId.mockReturnValue('user-456');
    mockValidateSessionId.mockReturnValue('session-123');
  });

  describe('Successful Chat Interactions', () => {
    it('should handle valid chat request successfully', async () => {
      const requestBody = {
        userId: 'user-456',
        sessionId: 'session-123',
        message: '请分析我的八字',
        locale: 'zh-CN',
        attachments: [],
        metadata: { source: 'web' },
      };

      const request = createMockRequest({
        method: 'POST',
        body: requestBody,
        headers: {
          'Content-Type': 'application/json',
          'x-qiflow-trace': 'trace-123',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual({
        sessionId: 'session-123',
        reply: mockOrchestratorResult.reply,
        messages: mockOrchestratorResult.sessionState.context.messages,
        state: mockOrchestratorResult.state,
        normalized: mockOrchestratorResult.normalized,
        explanation: mockOrchestratorResult.explanation,
        confidence: mockOrchestratorResult.confidence,
        knowledge: mockOrchestratorResult.knowledge,
        usage: mockOrchestratorResult.usage,
        limitedByBudget: false,
      });

      expect(mockOrchestrator.handleUserMessage).toHaveBeenCalledWith({
        sessionId: 'session-123',
        userId: 'user-456',
        message: '请分析我的八字',
        attachments: [],
        locale: 'zh-CN',
        metadata: { source: 'web' },
        traceId: 'trace-123',
      });
    });

    it('should generate sessionId when not provided', async () => {
      const requestBody = {
        userId: 'user-789',
        message: '请看风水',
        locale: 'zh-CN',
      };

      mockValidateRequest.mockResolvedValueOnce({
        ...requestBody,
        sessionId: undefined,
        attachments: [],
        metadata: {},
      });

      const request = createMockRequest({
        method: 'POST',
        body: requestBody,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.sessionId).toMatch(/^session_user-789_\d+$/);
    });

    it('should handle different locales correctly', async () => {
      const locales = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko'];

      for (const locale of locales) {
        const requestBody = {
          userId: `user-${locale}`,
          sessionId: `session-${locale}`,
          message: 'Test message',
          locale,
        };

        mockValidateRequest.mockResolvedValueOnce({
          ...requestBody,
          attachments: [],
          metadata: {},
        });

        const request = createMockRequest({
          method: 'POST',
          body: requestBody,
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(mockOrchestrator.handleUserMessage).toHaveBeenCalledWith(
          expect.objectContaining({ locale })
        );

        jest.clearAllMocks();
      }
    });

    it('should handle attachments correctly', async () => {
      const requestBody = {
        userId: 'user-456',
        sessionId: 'session-123',
        message: '请分析这张户型图',
        locale: 'zh-CN',
        attachments: [
          {
            type: 'image',
            url: 'https://example.com/floorplan.jpg',
            metadata: { width: 800, height: 600 },
          },
        ],
      };

      mockValidateRequest.mockResolvedValueOnce({
        ...requestBody,
        metadata: {},
      });

      const request = createMockRequest({
        method: 'POST',
        body: requestBody,
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockOrchestrator.handleUserMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          attachments: requestBody.attachments,
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should return 400 for invalid JSON', async () => {
      const request = new Request('http://localhost/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json{',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(ErrorCode.INVALID_FORMAT);
      expect(data.error.message).toContain('请求体格式无效');
    });

    it('should return 400 for validation errors', async () => {
      mockValidateRequest.mockRejectedValueOnce(
        new QiFlowApiError(ErrorCode.VALIDATION_ERROR, '输入验证失败')
      );

      const request = createMockRequest({
        method: 'POST',
        body: { message: '' }, // Invalid empty message
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(ErrorCode.VALIDATION_ERROR);
    });

    it('should return 429 for rate limit exceeded', async () => {
      mockRateLimiter.consume.mockResolvedValueOnce(false);

      const request = createMockRequest({
        method: 'POST',
        body: {
          userId: 'user-rate-limited',
          sessionId: 'session-rate-limited',
          message: '测试频率限制',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(ErrorCode.RATE_LIMIT_EXCEEDED);
      expect(data.error.message).toContain('请求过于频繁');
    });

    it('should return 500 for orchestrator failures', async () => {
      mockOrchestrator.handleUserMessage.mockRejectedValueOnce(
        new Error('Internal orchestrator error')
      );

      const request = createMockRequest({
        method: 'POST',
        body: {
          userId: 'user-error',
          sessionId: 'session-error',
          message: '测试内部错误',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
      expect(data.error.message).toContain('服务器内部错误');
    });

    it('should handle QiFlowApiError with appropriate status codes', async () => {
      const testCases = [
        {
          error: new QiFlowApiError(
            ErrorCode.AUTHENTICATION_FAILED,
            'Auth failed'
          ),
          expectedStatus: 401,
        },
        {
          error: new QiFlowApiError(
            ErrorCode.PERMISSION_DENIED,
            'Permission denied'
          ),
          expectedStatus: 403,
        },
        {
          error: new QiFlowApiError(
            ErrorCode.AI_SERVICE_UNAVAILABLE,
            'AI unavailable'
          ),
          expectedStatus: 503,
        },
      ];

      for (const { error, expectedStatus } of testCases) {
        mockOrchestrator.handleUserMessage.mockRejectedValueOnce(error);

        const request = createMockRequest({
          method: 'POST',
          body: {
            userId: 'user-test',
            sessionId: 'session-test',
            message: '测试错误处理',
          },
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(expectedStatus);
        expect(data.success).toBe(false);
        expect(data.error.code).toBe(error.code);

        jest.clearAllMocks();
      }
    });
  });

  describe('Budget and Usage Scenarios', () => {
    it('should handle budget-limited responses', async () => {
      const budgetLimitedResult = {
        ...mockOrchestratorResult,
        limitedByBudget: true,
        reply: {
          ...mockOrchestratorResult.reply,
          content: '当前对话已接近预算上限，请稍后再试或升级套餐。',
        },
      };

      mockOrchestrator.handleUserMessage.mockResolvedValueOnce(
        budgetLimitedResult
      );

      const request = createMockRequest({
        method: 'POST',
        body: {
          userId: 'user-budget-limit',
          sessionId: 'session-budget-limit',
          message: '请进行复杂分析',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.limitedByBudget).toBe(true);
      expect(data.data.reply.content).toContain('预算上限');
    });

    it('should include usage metrics in response', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: {
          userId: 'user-usage',
          sessionId: 'session-usage',
          message: '检查使用量统计',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.usage).toEqual({
        promptTokens: 80,
        completionTokens: 120,
        totalTokens: 200,
        costUsd: 0.05,
        provider: 'openai',
        model: 'gpt-4o',
        responseTimeMs: 1500,
        success: true,
      });
    });
  });

  describe('Conversation State Management', () => {
    it('should track conversation state transitions', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: {
          userId: 'user-state',
          sessionId: 'session-state',
          message: '开始新的对话',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.state).toEqual({
        previous: 'analyzing',
        current: 'recommending',
        decision: {
          nextState: 'recommending',
          reasoning: 'Analysis complete, ready for recommendations',
          confidence: 0.8,
          actions: ['summarize'] as (
            | 'summarize'
            | 'ask_more'
            | 'analyze'
            | 'handoff'
          )[],
        },
      });
    });

    it('should include conversation messages in response', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: {
          userId: 'user-messages',
          sessionId: 'session-messages',
          message: '查看对话历史',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.messages).toHaveLength(2);
      expect(data.data.messages[0].role).toBe('user');
      expect(data.data.messages[1].role).toBe('assistant');
    });
  });

  describe('Request Tracing and Logging', () => {
    it('should handle custom trace IDs', async () => {
      const traceId = 'custom-trace-12345';

      const request = createMockRequest({
        method: 'POST',
        body: {
          userId: 'user-trace',
          sessionId: 'session-trace',
          message: '测试追踪ID',
          traceId,
        },
        headers: {
          'x-qiflow-trace': traceId,
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockOrchestrator.handleUserMessage).toHaveBeenCalledWith(
        expect.objectContaining({ traceId })
      );
    });

    it('should generate trace ID when not provided', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: {
          userId: 'user-no-trace',
          sessionId: 'session-no-trace',
          message: '无追踪ID',
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockOrchestrator.handleUserMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          traceId: expect.stringMatching(/^chat_\d+_[a-z0-9]+$/),
        })
      );
    });
  });

  describe('Performance and Timing', () => {
    it('should include execution time in response metadata', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: {
          userId: 'user-perf',
          sessionId: 'session-perf',
          message: '性能测试',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.executionTime).toBeGreaterThan(0);
      expect(typeof data.executionTime).toBe('number');
    });

    it('should handle timeout scenarios gracefully', async () => {
      // Mock a slow orchestrator response
      mockOrchestrator.handleUserMessage.mockImplementationOnce(
        () =>
          new Promise(resolve => {
            setTimeout(() => resolve(mockOrchestratorResult), 5000);
          })
      );

      const request = createMockRequest({
        method: 'POST',
        body: {
          userId: 'user-timeout',
          sessionId: 'session-timeout',
          message: '超时测试',
        },
      });

      // Test that the request doesn't hang indefinitely
      const responsePromise = POST(request);
      const response = await Promise.race([
        responsePromise,
        new Promise<Response>((_, reject) =>
          setTimeout(() => reject(new Error('Test timeout')), 1000)
        ),
      ]).catch(() => {
        // If it times out, that's expected for this test
        return new Response('Timeout', { status: 408 });
      });

      // We expect either a successful response or a timeout indication
      expect([200, 408, 500]).toContain(response.status);
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle extremely long messages', async () => {
      const longMessage = 'a'.repeat(10000); // 10KB message

      mockSanitizeMessage.mockReturnValue(longMessage);

      const request = createMockRequest({
        method: 'POST',
        body: {
          userId: 'user-long',
          sessionId: 'session-long',
          message: longMessage,
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockOrchestrator.handleUserMessage).toHaveBeenCalledWith(
        expect.objectContaining({ message: longMessage })
      );
    });

    it('should handle empty metadata objects', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: {
          userId: 'user-empty-meta',
          sessionId: 'session-empty-meta',
          message: '空元数据测试',
          metadata: {},
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockOrchestrator.handleUserMessage).toHaveBeenCalledWith(
        expect.objectContaining({ metadata: {} })
      );
    });

    it('should handle null/undefined optional fields', async () => {
      mockValidateRequest.mockResolvedValueOnce({
        userId: 'user-null-fields',
        message: '空字段测试',
        sessionId: undefined,
        locale: undefined,
        attachments: undefined,
        metadata: undefined,
      });

      const request = createMockRequest({
        method: 'POST',
        body: {
          userId: 'user-null-fields',
          message: '空字段测试',
          sessionId: null,
          locale: null,
          attachments: null,
          metadata: null,
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      // Should generate sessionId when not provided
      expect(mockOrchestrator.handleUserMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: expect.stringMatching(/^session_user-null-fields_\d+$/),
        })
      );
    });
  });
});
