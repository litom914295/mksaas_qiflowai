import { algorithmFirstService } from '@/lib/ai/algorithm-first-service';
import {
  detectAnalysisRequest,
  extractAnalysisParams,
} from '@/lib/ai/analysis-detection';
import { withRetry } from '@/lib/utils/retry-utils';
import {
  chatRequestSchema,
  sanitizeAndValidateMessage,
  validateRequest,
  validateSessionId,
  validateUserId,
} from '@/lib/validation/input-validation';
import {
  ErrorCode,
  QiFlowApiError,
  createErrorResponse,
  createSuccessResponse,
} from '@/types/api-errors';
import { NextResponse } from 'next/server';
import { orchestrator, rateLimiter } from './shared';

interface ChatRequestBody {
  sessionId?: string;
  userId?: string;
  message?: string;
  attachments?: unknown[];
  locale?: string;
  metadata?: Record<string, unknown>;
  traceId?: string;
}

export async function POST(request: Request): Promise<Response> {
  const startTime = Date.now();
  const requestId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const traceId = request.headers.get('x-qiflow-trace') || requestId;

  try {
    // 解析请求体
    let body: ChatRequestBody;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        createErrorResponse(
          {
            code: ErrorCode.INVALID_FORMAT,
            message: '请求体格式无效，必须是有效的JSON',
            traceId,
          },
          requestId,
          '/api/chat'
        ),
        { status: 400 }
      );
    }

    // 验证输入数据
    const validatedData = await validateRequest(
      chatRequestSchema,
      body,
      traceId
    );

    // 额外的安全验证
    const userId = validateUserId(validatedData.userId, traceId);
    const message = sanitizeAndValidateMessage(validatedData.message, traceId);
    const sessionId = validatedData.sessionId
      ? validateSessionId(validatedData.sessionId, traceId)
      : `session_${userId}_${Date.now()}`;

    // 使用增强版分析请求检测
    const detectionResult = detectAnalysisRequest(message);
    console.log('[ChatAPI] 智能分析请求检测结果:', {
      timestamp: new Date().toISOString(),
      requestId,
      sessionId,
      userId,
      originalMessage: message.substring(0, 100),
      isAnalysisRequest: detectionResult.isAnalysisRequest,
      analysisType: detectionResult.analysisType,
      confidence: `${(detectionResult.confidence * 100).toFixed(1)}%`,
      keywords: detectionResult.extractedInfo.keywords.slice(0, 5),
      hasBirthDate: detectionResult.extractedInfo.hasBirthDate,
      hasGender: detectionResult.extractedInfo.hasGender,
      hasHouseInfo: detectionResult.extractedInfo.hasHouseInfo,
      dateFormats: detectionResult.extractedInfo.dateFormats,
      reason: detectionResult.reason,
    });

    // 检查是否为分析请求但信息不完整
    if (
      detectionResult.isAnalysisRequest &&
      (detectionResult as any).isIncomplete
    ) {
      console.log('[ChatAPI] 检测到分析请求但信息不完整:', {
        requestId,
        missingInfo: (detectionResult as any).missingInfo,
        analysisType: detectionResult.analysisType,
      });

      const missingInfo = (detectionResult as any).missingInfo || [];
      const errorMessage = `请补充以下信息以进行分析：\n\n${missingInfo.map((info: string) => `• ${info}`).join('\n')}\n\n例如："请帮我分析八字：1990年3月15日下午3点，男性，出生在北京"`;

      return NextResponse.json(
        createErrorResponse(
          {
            code: ErrorCode.INVALID_INPUT,
            message: errorMessage,
            details: {
              missingInfo,
              analysisType: detectionResult.analysisType,
              confidence: detectionResult.confidence,
            },
            traceId,
          },
          requestId,
          '/api/chat'
        ),
        { status: 400 }
      );
    }

    // 如果检测到分析请求，提取参数并调用算法服务
    if (
      detectionResult.isAnalysisRequest &&
      detectionResult.confidence >= 0.3
    ) {
      console.log(
        `[ChatAPI] 检测到${detectionResult.analysisType}分析请求 (置信度: ${(detectionResult.confidence * 100).toFixed(1)}%)，重定向到算法优先服务`
      );

      // 提取结构化参数
      const extractedParams = extractAnalysisParams(message);
      console.log('[ChatAPI] 提取的分析参数:', {
        requestId,
        birthDate: extractedParams.birthDate,
        gender: extractedParams.gender,
        location: extractedParams.location,
        houseInfo: extractedParams.houseInfo,
      });

      try {
        console.log('[ChatAPI] 调用算法优先服务开始', {
          timestamp: new Date().toISOString(),
          requestId,
          analysisType: detectionResult.analysisType,
        });

        // 传递分析类型和提取的参数到算法服务
        const analysisResult =
          await algorithmFirstService.processAnalysisRequest(
            message,
            sessionId,
            userId,
            {
              analysisType: detectionResult.analysisType,
              confidence: detectionResult.confidence,
              extractedParams,
            }
          );

        console.log('[ChatAPI] 算法优先服务响应成功', {
          timestamp: new Date().toISOString(),
          requestId,
          analysisSuccess: analysisResult.analysisResult?.success,
          hasAIEnhancement: !!analysisResult.aiEnhancement,
          hasRedirectInfo: !!analysisResult.redirectTo,
          processingTime: analysisResult.metadata?.processingTime,
        });

        // 提取纯文本回复
        let replyContent: string;
        if (analysisResult.aiEnhancement?.explanation) {
          replyContent = analysisResult.aiEnhancement.explanation;
          console.log('[ChatAPI] 使用AI增强解释作为回复', {
            requestId,
            contentLength: replyContent.length,
          });
        } else if (analysisResult.analysisResult.success) {
          replyContent =
            '分析完成，但AI解释生成失败。请查看下方的详细分析结果。';
          console.log('[ChatAPI] AI解释生成失败，使用默认回复', { requestId });
        } else {
          replyContent =
            analysisResult.analysisResult.error || '分析失败，请检查输入信息。';
          console.log('[ChatAPI] 分析失败，返回错误信息', {
            requestId,
            error: analysisResult.analysisResult.error,
          });
        }

        const executionTime = Date.now() - startTime;
        console.log('[ChatAPI] 分析请求处理完成', {
          timestamp: new Date().toISOString(),
          requestId,
          totalExecutionTime: executionTime,
          responseLength: replyContent.length,
        });

        return NextResponse.json(
          createSuccessResponse(
            {
              sessionId,
              reply: {
                content: replyContent,
                id: `reply_${Date.now()}`,
                role: 'assistant',
                timestamp: new Date().toISOString(),
                metadata: {
                  cost: 0,
                  model: 'integrated',
                  provider: 'algorithm-first',
                  tokens: 0,
                },
              },
              analysisResult: analysisResult.analysisResult,
              aiEnhancement: analysisResult.aiEnhancement,
              rawData: analysisResult.rawData,
              redirectTo: analysisResult.redirectTo, // 添加重定向信息
              messages: [
                {
                  id: `user_${Date.now()}`,
                  role: 'user',
                  content: message,
                  timestamp: new Date().toISOString(),
                },
                {
                  id: `assistant_${Date.now()}`,
                  role: 'assistant',
                  content: replyContent,
                  timestamp: new Date().toISOString(),
                },
              ], // 分析请求返回用户输入和AI回复
              state: { type: 'analysis_completed' },
              normalized: {
                suggestions:
                  analysisResult.aiEnhancement?.recommendations || [],
                followUpQuestions:
                  analysisResult.aiEnhancement?.followUpQuestions || [],
                actionItems: [],
              },
              explanation: {
                summary: analysisResult.aiEnhancement?.explanation || '',
                highlights: analysisResult.aiEnhancement?.insights || [],
                nextSteps:
                  analysisResult.aiEnhancement?.followUpQuestions || [],
              },
              confidence: analysisResult.aiEnhancement?.confidence || 0.5,
              knowledge: [],
              usage: {
                promptTokens: 0,
                completionTokens: 0,
                totalTokens: 0,
                costUsd: 0,
                provider: 'algorithm-first',
                model: 'integrated',
                responseTimeMs: executionTime,
                success: true,
              },
              limitedByBudget: false,
            },
            requestId,
            executionTime
          )
        );
      } catch (error) {
        console.error('[ChatAPI] 算法优先服务调用失败:', {
          timestamp: new Date().toISOString(),
          requestId,
          error: error instanceof Error ? error.message : '未知错误',
          stack: error instanceof Error ? error.stack : undefined,
        });

        // 如果算法优先服务失败，返回用户友好的错误响应
        const executionTime = Date.now() - startTime;
        const errorMessage =
          '很抱歉，八字分析服务暂时遇到技术问题。请检查您的输入信息是否完整，或稍后重试。';

        return NextResponse.json(
          createErrorResponse(
            {
              code: ErrorCode.INTERNAL_SERVER_ERROR,
              message: errorMessage,
              details: {
                originalError:
                  error instanceof Error ? error.message : '未知错误',
                executionTime,
                suggestions: [
                  '请确保提供完整的出生年月日时',
                  '请说明性别（男/女）',
                  '如果需要风水分析，请提供房屋朝向信息',
                ],
              },
              traceId,
            },
            requestId,
            '/api/chat'
          ),
          { status: 500 }
        );
      }
    }

    // 频率限制检查
    const allowed = await withRetry(() => rateLimiter.consume(sessionId), {
      retries: 2,
      delay: 100,
      onError: error => console.warn('[ChatAPI] Rate limiter retry:', error),
    });

    if (!allowed) {
      return NextResponse.json(
        createErrorResponse(
          {
            code: ErrorCode.RATE_LIMIT_EXCEEDED,
            message: '请求过于频繁，请稍后再试',
            details: { sessionId },
            traceId,
          },
          requestId,
          '/api/chat'
        ),
        { status: 429 }
      );
    }

    // 处理普通对话（非分析请求）
    console.log('[ChatAPI] 处理普通对话请求', {
      timestamp: new Date().toISOString(),
      requestId,
      sessionId,
      userId,
      messagePreview: message.substring(0, 50),
      detectionConfidence: detectionResult.confidence,
    });

    const result = await withRetry(
      () =>
        orchestrator.handleUserMessage({
          sessionId,
          userId,
          message,
          attachments: validatedData.attachments,
          locale: validatedData.locale,
          metadata: validatedData.metadata,
          traceId,
        }),
      {
        retries: 2,
        delay: 1000,
        shouldRetry: error => {
          // 只重试系统级错误，不重试业务逻辑错误
          return error instanceof QiFlowApiError ? error.retryable : true;
        },
        onError: (error, attempt) => {
          console.warn(`[ChatAPI] Orchestrator retry ${attempt}:`, error);
        },
      }
    );

    const executionTime = Date.now() - startTime;

    // 提取纯文本回复内容
    let replyContent: string;
    if (typeof result.reply === 'string') {
      replyContent = result.reply;
    } else if (result.reply?.content) {
      replyContent = result.reply.content;
    } else if ((result.reply as any)?.choices?.[0]?.message?.content) {
      replyContent = (result.reply as any).choices[0].message.content;
    } else {
      replyContent = '抱歉，我暂时无法回答您的问题。';
    }

    return NextResponse.json(
      createSuccessResponse(
        {
          sessionId,
          reply: {
            content: replyContent,
            id: `reply_${Date.now()}`,
            role: 'assistant',
            timestamp: new Date().toISOString(),
            metadata: {
              cost: result.usage?.costUsd || 0,
              model: result.usage?.model || 'unknown',
              provider: result.usage?.provider || 'unknown',
              tokens: result.usage?.totalTokens || 0,
            },
          },
          messages: result.sessionState.context.messages,
          state: result.state,
          normalized: result.normalized,
          explanation: result.explanation,
          confidence: result.confidence,
          knowledge: result.knowledge,
          usage: result.usage,
          limitedByBudget: result.limitedByBudget,
        },
        requestId,
        executionTime
      )
    );
  } catch (error) {
    const executionTime = Date.now() - startTime;

    console.error('[ChatAPI] Request processing failed:', {
      requestId,
      traceId,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      executionTime,
    });

    // 处理自定义错误
    if (error instanceof QiFlowApiError) {
      const statusCode = getHttpStatusFromErrorCode(error.code);
      return NextResponse.json(error.toApiResponse(requestId, '/api/chat'), {
        status: statusCode,
      });
    }

    // 处理未知错误
    return NextResponse.json(
      createErrorResponse(
        {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: '服务器内部错误，请稍后重试',
          details: {
            originalError: error instanceof Error ? error.message : '未知错误',
            executionTime,
          },
          traceId,
        },
        requestId,
        '/api/chat'
      ),
      { status: 500 }
    );
  }
}

/**
 * 旧版分析请求检测函数 - 已废弃，保留用于兼容性
 * @deprecated 使用 detectAnalysisRequest 替代
 */
function isAnalysisRequestLegacy(message: string): boolean {
  const result = detectAnalysisRequest(message);
  return result.isAnalysisRequest;
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
