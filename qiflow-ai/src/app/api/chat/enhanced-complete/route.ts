import { algorithmIntegrationService } from '@/lib/ai/algorithm-integration-service';
import { enhancedAIChatService } from '@/lib/chat/enhanced-ai-chat-service';
import { getServiceClient } from '@/lib/database/supabase-server';
import { RedisConnection } from '@/lib/redis/connection';
import { AI_SERVICE_RETRY_CONFIG, withRetry } from '@/lib/utils/retry-utils';
import {
    enhancedChatRequestSchema,
    sanitizeAndValidateMessage,
    validateRequest,
    validateSessionId,
    validateUserId,
} from '@/lib/validation/input-validation';
import {
    ErrorCode,
    QiFlowApiError,
    createErrorResponse,
    createRateLimitError,
    createSuccessResponse,
} from '@/types/api-errors';
import { NextRequest, NextResponse } from 'next/server';

interface EnhancedChatRequest {
  sessionId?: string;
  userId: string;
  message: string;
  attachments?: any[];
  config?: {
    enableBaziAnalysis?: boolean;
    enableFengShuiAnalysis?: boolean;
    responseStyle?: 'conversational' | 'analytical' | 'educational';
    explanationLevel?: 'basic' | 'detailed' | 'expert';
  };
}

interface EnhancedChatResponse {
  sessionId: string;
  message: any;
  session: {
    id: string;
    title: string;
    messageCount: number;
    userProfile: any;
    updatedAt: string;
  };
  algorithmResults: any[];
  suggestions: string[];
  followUpQuestions: string[];
  actionItems: string[];
  confidence: number;
  orchestratorState: any;
  executionTime: number;
  performanceMetrics: {
    databaseResponseTime?: number;
    redisResponseTime?: number;
    aiServiceResponseTime?: number;
    totalProcessingTime: number;
  };
}

/**
 * POST /api/chat/enhanced-complete
 * 完整版增强聊天处理
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = `chat_enhanced_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const traceId = request.headers.get('x-qiflow-trace') || requestId;
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const ipAddress =
    request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  // 性能指标
  const performanceMetrics = {
    databaseResponseTime: 0,
    redisResponseTime: 0,
    aiServiceResponseTime: 0,
    totalProcessingTime: 0,
  };

  try {
    console.log('[EnhancedChatAPI] Request received:', {
      requestId,
      traceId,
      userAgent,
      ipAddress,
      timestamp: new Date().toISOString(),
    });

    // 1. 解析和验证请求体
    let body: EnhancedChatRequest;
    try {
      const rawBody = await request.json();
      body = await validateRequest(enhancedChatRequestSchema, rawBody, traceId);
    } catch (error) {
      if (error instanceof QiFlowApiError) {
        return NextResponse.json(
          error.toApiResponse(requestId, '/api/chat/enhanced-complete'),
          { status: getHttpStatusFromErrorCode(error.code) }
        );
      }

      return NextResponse.json(
        createErrorResponse(
          {
            code: ErrorCode.INVALID_FORMAT,
            message: '请求体格式无效或解析失败',
            details: {
              originalError: error instanceof Error ? error.message : error,
            },
            traceId,
          },
          requestId,
          '/api/chat/enhanced-complete'
        ),
        { status: 400 }
      );
    }

    // 2. 额外的安全验证
    const userId = validateUserId(body.userId, traceId);
    const message = sanitizeAndValidateMessage(body.message, traceId);
    const sessionId = body.sessionId
      ? validateSessionId(body.sessionId, traceId)
      : `enhanced_session_${userId}_${Date.now()}`;

    // 3. 速率限制检查（使用 Redis）
    const rateLimitKey = `rate_limit:${userId}:chat`;
    const rateLimitStart = Date.now();

    try {
      const currentCount = await RedisConnection.getWithMemoryFallback(
        rateLimitKey,
        0
      );

      const maxRequests = 60; // 每分钟最多60次请求
      if (currentCount >= maxRequests) {
        throw createRateLimitError(maxRequests, 60, traceId);
      }

      // 更新计数器
      await RedisConnection.setWithMemoryFallback(
        rateLimitKey,
        currentCount + 1,
        60 // TTL 60秒
      );
    } catch (error) {
      if (
        error instanceof QiFlowApiError &&
        error.code === ErrorCode.RATE_LIMIT_EXCEEDED
      ) {
        return NextResponse.json(
          error.toApiResponse(requestId, '/api/chat/enhanced-complete'),
          { status: 429 }
        );
      }

      // Redis 失败时记录警告但继续处理
      console.warn(
        '[EnhancedChatAPI] Rate limit check failed, continuing:',
        error
      );
    }

    performanceMetrics.redisResponseTime = Date.now() - rateLimitStart;

    // 4. 更新算法集成服务配置
    if (body.config) {
      try {
        algorithmIntegrationService.updateConfig(body.config);
      } catch (error) {
        console.warn(
          '[EnhancedChatAPI] Failed to update algorithm config:',
          error
        );
      }
    }

    // 5. 处理消息（带重试机制）
    const aiServiceStart = Date.now();
    const result = await withRetry(
      async () => {
        return await enhancedAIChatService.processMessage({
          sessionId,
          userId,
          message,
          attachments: body.attachments || [],
          locale: request.headers.get('x-qiflow-locale') ?? undefined,
          metadata: {
            requestId,
            config: body.config,
            userAgent,
            ipAddress,
            traceId,
          },
        });
      },
      {
        ...AI_SERVICE_RETRY_CONFIG,
        onError: (error, attempt) => {
          console.warn(`[EnhancedChatAPI] AI service retry ${attempt}:`, {
            error: error.message,
            sessionId,
            userId,
            traceId,
          });
        },
      }
    );

    performanceMetrics.aiServiceResponseTime = Date.now() - aiServiceStart;

    // 6. 数据库操作（保存会话状态）
    const dbStart = Date.now();
    try {
      const client = getServiceClient();
      await withRetry(async () => {
        // 这里可以添加会话状态保存逻辑
        // 例如：保存消息历史、更新用户状态等
        const { data, error } = await client
          .from('users')
          .select('id')
          .eq('id', userId)
          .single();

        if (error && error.code !== 'PGRST116') {
          // PGRST116 = not found
          throw new Error(`Database query failed: ${error.message}`);
        }

        return data;
      }, AI_SERVICE_RETRY_CONFIG);
    } catch (error) {
      // 数据库保存失败不应该阻止响应，只记录错误
      console.error(
        '[EnhancedChatAPI] Failed to save session to database:',
        error
      );
    }

    performanceMetrics.databaseResponseTime = Date.now() - dbStart;
    performanceMetrics.totalProcessingTime = Date.now() - startTime;

    // 7. 构建响应
    const response: EnhancedChatResponse = {
      sessionId,
      message: result.message,
      session: {
        id: result.session.id,
        title: result.session.title,
        messageCount: result.session.messages.length,
        userProfile: result.session.userProfile,
        updatedAt:
          result.session.updatedAt instanceof Date
            ? result.session.updatedAt.toISOString()
            : result.session.updatedAt,
      },
      algorithmResults: result.integratedResponse.algorithmResults,
      suggestions: result.normalized.suggestions,
      followUpQuestions: result.normalized.followUpQuestions,
      actionItems: result.normalized.actionItems,
      confidence: result.integratedResponse.aiResponse.confidence?.overall || 0,
      orchestratorState: result.orchestratorState,
      executionTime: performanceMetrics.totalProcessingTime,
      performanceMetrics,
    };

    console.log('[EnhancedChatAPI] Request completed successfully:', {
      requestId,
      traceId,
      userId,
      sessionId,
      executionTime: performanceMetrics.totalProcessingTime,
      performanceMetrics,
    });

    return NextResponse.json(
      createSuccessResponse(
        response,
        requestId,
        performanceMetrics.totalProcessingTime
      )
    );
  } catch (error) {
    performanceMetrics.totalProcessingTime = Date.now() - startTime;

    console.error('[EnhancedChatAPI] Request processing failed:', {
      requestId,
      traceId,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      executionTime: performanceMetrics.totalProcessingTime,
      performanceMetrics,
    });

    // 处理自定义错误
    if (error instanceof QiFlowApiError) {
      const statusCode = getHttpStatusFromErrorCode(error.code);
      const errorResponse = error.toApiResponse(
        requestId,
        '/api/chat/enhanced-complete'
      );

      // 添加性能指标到错误响应
      (errorResponse.metadata as any).executionTime =
        performanceMetrics.totalProcessingTime;
      (errorResponse as any).performanceMetrics = performanceMetrics;

      return NextResponse.json(errorResponse, { status: statusCode });
    }

    // 处理未知错误
    return NextResponse.json(
      createErrorResponse(
        {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: '服务器内部错误，请稍后重试',
          details: {
            originalError: error instanceof Error ? error.message : '未知错误',
            executionTime: performanceMetrics.totalProcessingTime,
            performanceMetrics,
          },
          traceId,
        },
        requestId,
        '/api/chat/enhanced-complete'
      ),
      { status: 500 }
    );
  }
}

/**
 * GET /api/chat/enhanced-complete?sessionId=xxx
 * 获取会话信息
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestId = `get_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const traceId = request.headers.get('x-qiflow-trace') || requestId;

  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      throw new QiFlowApiError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        '缺少 sessionId 参数',
        { field: 'sessionId', traceId }
      );
    }

    // 验证会话ID格式
    const validSessionId = validateSessionId(sessionId, traceId);

    // 获取会话信息
    const session = enhancedAIChatService.getEnhancedSession(validSessionId);

    if (!session) {
      throw new QiFlowApiError(ErrorCode.INVALID_INPUT, '会话不存在或已过期', {
        details: { sessionId: validSessionId },
        traceId,
      });
    }

    // 获取会话统计
    const stats = enhancedAIChatService.getSessionStats(validSessionId);

    const response = {
      session: {
        id: session.id,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        messageCount: session.messages.length,
        userProfile: session.userProfile,
        context: (session as any).context,
      },
      stats,
      messages: session.messages.slice(-10), // 最近10条消息
      algorithmHistory: session.algorithmHistory.slice(-5), // 最近5次算法结果
    };

    return NextResponse.json(createSuccessResponse(response, requestId));
  } catch (error) {
    console.error('[EnhancedChatAPI] Get session failed:', {
      requestId,
      traceId,
      error: error instanceof Error ? error.message : error,
    });

    if (error instanceof QiFlowApiError) {
      const statusCode = getHttpStatusFromErrorCode(error.code);
      return NextResponse.json(
        error.toApiResponse(requestId, '/api/chat/enhanced-complete'),
        { status: statusCode }
      );
    }

    return NextResponse.json(
      createErrorResponse(
        {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: '获取会话信息失败',
          details: {
            originalError: error instanceof Error ? error.message : error,
          },
          traceId,
        },
        requestId,
        '/api/chat/enhanced-complete'
      ),
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/chat/enhanced-complete?sessionId=xxx
 * 删除会话
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const requestId = `delete_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const traceId = request.headers.get('x-qiflow-trace') || requestId;

  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      throw new QiFlowApiError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        '缺少 sessionId 参数',
        { field: 'sessionId', traceId }
      );
    }

    // 验证会话ID格式
    const validSessionId = validateSessionId(sessionId, traceId);

    // 删除会话
    const success = enhancedAIChatService.cleanupSession(validSessionId, 0);

    // 同时清理Redis中的相关数据
    try {
      await RedisConnection.deleteWithMemoryFallback(
        `session:${validSessionId}`
      );
      await RedisConnection.deleteWithMemoryFallback(
        `rate_limit:*:${validSessionId}`
      );
    } catch (error) {
      console.warn('[EnhancedChatAPI] Failed to cleanup Redis data:', error);
    }

    return NextResponse.json(
      createSuccessResponse(
        {
          sessionId: validSessionId,
          deleted: success,
        },
        requestId
      )
    );
  } catch (error) {
    console.error('[EnhancedChatAPI] Delete session failed:', {
      requestId,
      traceId,
      error: error instanceof Error ? error.message : error,
    });

    if (error instanceof QiFlowApiError) {
      const statusCode = getHttpStatusFromErrorCode(error.code);
      return NextResponse.json(
        error.toApiResponse(requestId, '/api/chat/enhanced-complete'),
        { status: statusCode }
      );
    }

    return NextResponse.json(
      createErrorResponse(
        {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: '删除会话失败',
          details: {
            originalError: error instanceof Error ? error.message : error,
          },
          traceId,
        },
        requestId,
        '/api/chat/enhanced-complete'
      ),
      { status: 500 }
    );
  }
}

/**
 * 根据错误代码获取HTTP状态码
 */
function getHttpStatusFromErrorCode(code: ErrorCode): number {
  switch (code) {
    case ErrorCode.VALIDATION_ERROR:
    case ErrorCode.INVALID_INPUT:
    case ErrorCode.MISSING_REQUIRED_FIELD:
    case ErrorCode.INVALID_FORMAT:
      return 400;
    case ErrorCode.AUTHENTICATION_FAILED:
    case ErrorCode.INVALID_SESSION:
      return 401;
    case ErrorCode.PERMISSION_DENIED:
      return 403;
    case ErrorCode.RATE_LIMIT_EXCEEDED:
    case ErrorCode.QUOTA_EXCEEDED:
    case ErrorCode.BUDGET_LIMIT_EXCEEDED:
      return 429;
    case ErrorCode.AI_SERVICE_UNAVAILABLE:
    case ErrorCode.EXTERNAL_SERVICE_ERROR:
      return 503;
    default:
      return 500;
  }
}
