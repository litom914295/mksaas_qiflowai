import { defaultRateLimiters, getClientIp } from '@/lib/rate-limit';
import { generateId } from '@/lib/utils';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  AlgorithmFirstGuard,
  type AnalysisContext,
  AuditLogger,
  type QuestionType,
  SensitiveTopicFilter,
} from '../../../../lib/qiflow/ai/guardrails';

// 请求验证Schema
const ChatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
  context: z
    .object({
      baziData: z.any().optional(),
      fengshuiData: z.any().optional(),
    })
    .optional(),
});

// 响应类型
interface ChatResponse {
  success: boolean;
  data?: {
    response: string;
    questionType: QuestionType;
    hasData: boolean;
    needsAction?: 'REDIRECT_TO_ANALYSIS' | 'REFRESH_ANALYSIS' | 'PROVIDE_INFO';
    actionUrl?: string;
    sessionId: string;
    confidence?: number;
  };
  error?: string;
}

// OpenAI API配置（从环境变量读取）
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL =
  process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';

/**
 * 调用AI模型
 */
async function callAIModel(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  if (!OPENAI_API_KEY) {
    // 开发环境返回模拟响应
    return '【模拟响应】这是基于您提供数据的分析结果。在生产环境中，这里会显示真实的AI回答。';
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content:
              systemPrompt || '你是一位专业的易学顾问，精通八字命理和风水学。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return (
      data.choices[0]?.message?.content || '抱歉，我暂时无法回答您的问题。'
    );
  } catch (error) {
    console.error('AI Model Error:', error);
    throw error;
  }
}

/**
 * 生成系统提示词
 */
function generateSystemPrompt(
  questionType: QuestionType,
  hasData: boolean
): string {
  const basePrompt = `你是QiFlow AI的专业易学顾问，专注于提供基于数据的专业分析。

## 核心原则
1. **算法优先**：所有个性化建议必须基于已计算的结构化数据
2. **科学态度**：以现代视角解释传统文化，避免迷信色彩
3. **实用导向**：提供可执行的建议和改善方案
4. **隐私保护**：不记录、不外传用户个人信息

## 回答规范
1. 使用通俗易懂的语言，避免过度专业术语
2. 提供具体可行的建议，而非空泛论述
3. 适当使用表情符号增加亲和力
4. 每个回答控制在800字以内
5. 重要建议用加粗或列表形式突出`;

  if (questionType === 'bazi' && hasData) {
    return `${basePrompt}

## 八字专业知识
- 精通四柱八字、十神、大运流年分析
- 能够解读五行生克、用神喜忌
- 擅长性格分析、事业规划、感情婚姻指导
- 基于提供的八字数据进行精准分析`;
  }

  if (questionType === 'fengshui' && hasData) {
    return `${basePrompt}

## 风水专业知识  
- 精通玄空飞星、九宫八卦布局
- 能够分析房屋坐向、飞星组合吉凶
- 擅长居家布局、办公环境优化建议
- 基于提供的风水数据进行精准分析`;
  }

  return `${basePrompt}

## 通用咨询模式
- 提供易学文化知识普及
- 解释基础理论和概念
- 引导用户进行专业分析
- 不进行无数据的个人预测`;
}

/**
 * 处理聊天请求（带限流）
 */
export async function POST(request: NextRequest) {
  // 应用限流
  const clientIp = getClientIp(request);
  const rateLimitResult = await defaultRateLimiters.aiChat(clientIp);

  // 设置限流响应头
  const headers = new Headers();
  headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
  headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  headers.set('X-RateLimit-Reset', rateLimitResult.reset.toISOString());

  // 如果超过限流，返回429
  if (!rateLimitResult.success) {
    return NextResponse.json<ChatResponse>(
      {
        success: false,
        error: rateLimitResult.message,
      },
      {
        status: 429,
        headers: {
          ...Object.fromEntries(headers),
          'Retry-After': Math.ceil(
            (rateLimitResult.reset.getTime() - Date.now()) / 1000
          ).toString(),
        },
      }
    );
  }

  try {
    const body = await request.json();

    // 验证请求数据
    const validationResult = ChatRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json<ChatResponse>(
        {
          success: false,
          error: '请求参数无效',
        },
        { status: 400, headers }
      );
    }

    const { message, context: providedContext } = validationResult.data;
    const sessionId = validationResult.data.sessionId || generateId('session');

    // 敏感话题检查
    if (SensitiveTopicFilter.isSensitive(message)) {
      await AuditLogger.log({
        timestamp: new Date().toISOString(),
        sessionId,
        userId: validationResult.data.userId,
        questionType: 'other',
        hasValidData: false,
        responseType: 'SENSITIVE_FILTER',
      });

      return NextResponse.json<ChatResponse>(
        {
          success: true,
          data: {
            response: SensitiveTopicFilter.getSensitiveWarning(),
            questionType: 'other',
            hasData: false,
            sessionId,
            confidence: 1,
          },
        },
        { headers }
      );
    }

    // 构建分析上下文
    const analysisContext: AnalysisContext = {
      sessionId,
      userId: validationResult.data.userId,
      baziData: providedContext?.baziData || null,
      fengshuiData: providedContext?.fengshuiData || null,
      timestamp: new Date().toISOString(),
    };

    // 创建护栏实例并验证
    const guard = new AlgorithmFirstGuard();
    const validation = await guard.validateContext(message, analysisContext);
    const questionType = AlgorithmFirstGuard.identifyQuestionType(message);

    // 如果不能回答，返回引导信息
    if (!validation.canAnswer) {
      const guidanceMessage =
        AlgorithmFirstGuard.generateGuidanceMessage(validation);

      await AuditLogger.log({
        timestamp: new Date().toISOString(),
        sessionId,
        userId: validationResult.data.userId,
        questionType,
        hasValidData: false,
        responseType: 'GUIDANCE',
      });

      return NextResponse.json<ChatResponse>(
        {
          success: true,
          data: {
            response: guidanceMessage,
            questionType,
            hasData: false,
            needsAction: validation.action,
            sessionId,
            confidence: 0.8,
          },
        },
        { headers }
      );
    }

    // 构建AI提示词
    const systemPrompt = generateSystemPrompt(
      questionType,
      validation.hasData || false
    );
    const contextPrompt = AlgorithmFirstGuard.buildContextPrompt(
      validation.availableData,
      questionType
    );
    const fullPrompt = `${contextPrompt}\n\n用户问题：${message}`;

    // 调用AI模型
    const aiResponse = await callAIModel(fullPrompt, systemPrompt);

    // 记录审计日志
    await AuditLogger.log({
      timestamp: new Date().toISOString(),
      sessionId,
      userId: validationResult.data.userId,
      questionType,
      hasValidData: validation.hasData || false,
      responseType: 'AI_ANSWER' as const,
      confidenceLevel: validation.confidence,
    });

    // 返回响应
    return NextResponse.json<ChatResponse>(
      {
        success: true,
        data: {
          response: aiResponse,
          questionType,
          hasData: validation.hasData || false,
          sessionId,
          confidence: validation.confidence || 0.8,
        },
      },
      { headers }
    );
  } catch (error) {
    console.error('Chat API Error:', error);

    return NextResponse.json<ChatResponse>(
      {
        success: false,
        error: '服务器处理出错，请稍后再试',
      },
      { status: 500, headers }
    );
  }
}
