import { algorithmFirstService } from '@/lib/ai/algorithm-first-service';
import {
  createErrorResponse,
  createSuccessResponse,
  ErrorCode,
} from '@/types/api-errors';
import { NextRequest, NextResponse } from 'next/server';

interface AnalysisRequest {
  sessionId?: string;
  userId: string;
  message: string;
  locale?: string;
  traceId?: string;
}

interface FollowUpRequest {
  sessionId: string;
  userId: string;
  question: string;
  analysisResult: any; // 之前的分析结果
  traceId?: string;
}

/**
 * POST /api/analysis
 * 算法优先分析接口
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const traceId = request.headers.get('x-qiflow-trace') || requestId;

  try {
    console.log('[AnalysisAPI] 请求接收:', { requestId, traceId });

    // 解析请求体
    let body: AnalysisRequest | FollowUpRequest;
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
          '/api/analysis'
        ),
        { status: 400 }
      );
    }

    // 验证基本字段
    if (
      !body.userId ||
      (!('message' in body) ? !body.question : !body.message)
    ) {
      return NextResponse.json(
        createErrorResponse(
          {
            code: ErrorCode.MISSING_REQUIRED_FIELD,
            message: '缺少必要字段：userId 和 message',
            traceId,
          },
          requestId,
          '/api/analysis'
        ),
        { status: 400 }
      );
    }

    // 判断是分析请求还是追问请求
    const isFollowUp = 'analysisResult' in body;

    let result;

    if (isFollowUp) {
      // 处理追问请求
      const followUpBody = body as FollowUpRequest;
      console.log('[AnalysisAPI] 处理追问请求:', {
        sessionId: followUpBody.sessionId,
        question: followUpBody.question.substring(0, 50),
      });

      result = await algorithmFirstService.processFollowUpQuestion(
        followUpBody.question,
        followUpBody.analysisResult,
        followUpBody.sessionId,
        followUpBody.userId
      );
    } else {
      // 处理分析请求
      const analysisBody = body as AnalysisRequest;
      console.log('[AnalysisAPI] 处理分析请求:', {
        sessionId: analysisBody.sessionId,
        message: analysisBody.message.substring(0, 50),
      });

      result = await algorithmFirstService.processAnalysisRequest(
        analysisBody.message,
        analysisBody.sessionId ||
          `analysis_${analysisBody.userId}_${Date.now()}`,
        analysisBody.userId
      );
    }

    const executionTime = Date.now() - startTime;

    console.log('[AnalysisAPI] 请求完成:', {
      requestId,
      traceId,
      executionTime,
      success:
        ('analysisResult' in result ? result.analysisResult?.success : false) ||
        ('explanation' in result ? !!result.explanation : false),
    });

    return NextResponse.json(
      createSuccessResponse(
        {
          ...result,
          metadata: {
            ...('metadata' in result ? result.metadata : {}),
            requestId,
            executionTime,
          },
        },
        requestId,
        executionTime
      )
    );
  } catch (error) {
    const executionTime = Date.now() - startTime;

    console.error('[AnalysisAPI] 请求处理失败:', {
      requestId,
      traceId,
      error: error instanceof Error ? error.message : error,
      executionTime,
    });

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
        '/api/analysis'
      ),
      { status: 500 }
    );
  }
}

/**
 * GET /api/analysis?sessionId=xxx
 * 获取分析历史
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestId = `get_analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const traceId = request.headers.get('x-qiflow-trace') || requestId;

  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        createErrorResponse(
          {
            code: ErrorCode.MISSING_REQUIRED_FIELD,
            message: '缺少 sessionId 参数',
            traceId,
          },
          requestId,
          '/api/analysis'
        ),
        { status: 400 }
      );
    }

    // 这里可以实现获取分析历史的逻辑
    // 暂时返回空结果
    return NextResponse.json(
      createSuccessResponse(
        {
          sessionId,
          analyses: [],
          message: '分析历史功能待实现',
        },
        requestId
      )
    );
  } catch (error) {
    console.error('[AnalysisAPI] 获取分析历史失败:', {
      requestId,
      traceId,
      error: error instanceof Error ? error.message : error,
    });

    return NextResponse.json(
      createErrorResponse(
        {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: '获取分析历史失败',
          details: {
            originalError: error instanceof Error ? error.message : error,
          },
          traceId,
        },
        requestId,
        '/api/analysis'
      ),
      { status: 500 }
    );
  }
}
