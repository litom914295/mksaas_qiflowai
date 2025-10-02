import { NextRequest, NextResponse } from 'next/server';
import { rateLimitConfigs, withRateLimit } from '@/lib/rate-limit';
import { createRouter } from '@/lib/ai/router';
import { sanitizeForAI } from '@/lib/ai/sanitize';
import { processWithStrategy } from '@/lib/ai/strategy';
import { estimateCostUsd } from '@/lib/ai/pricing';
import { checkBudget, recordUsage } from '@/lib/ai/cost';
import type { AIRequest, TemplateName } from '@/lib/ai/types';

async function handlePOST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证请求格式
    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array required' },
        { status: 400 }
      );
    }

    // 提取用户ID（从认证中间件或请求头）
    const userId = request.headers.get('x-user-id') || undefined;
    
    // 构建AI请求
    const aiRequest: AIRequest = {
      model: body.model || 'gpt-4o-mini',
      messages: body.messages,
      temperature: body.temperature,
      maxTokens: body.maxTokens,
      topP: body.topP,
      presencePenalty: body.presencePenalty,
      frequencyPenalty: body.frequencyPenalty,
      stop: body.stop,
      userId,
      metadata: {
        templateName: body.templateName as TemplateName,
        ...body.metadata,
      },
    };

    // 检查预算限制
    const budget = {
      userId,
      dailyUsd: 10, // 示例：每日10美元限制
      monthlyUsd: 100, // 示例：每月100美元限制
    };

    if (!checkBudget(userId, budget)) {
      return NextResponse.json(
        { error: 'Budget limit exceeded' },
        { status: 429 }
      );
    }

    // 去敏化处理
    const sanitizedRequest = {
      ...aiRequest,
      messages: aiRequest.messages.map(msg => ({
        ...msg,
        content: typeof msg.content === 'string' 
          ? msg.content 
          : JSON.stringify(sanitizeForAI(msg.content)),
      })),
    };

    // 创建路由器
    const router = createRouter({
      order: ['openai', 'anthropic', 'gemini', 'deepseek'],
      allowFallback: true,
    });

    // 使用四层策略处理
    const { response, tier } = await processWithStrategy(
      sanitizedRequest,
      router.chat
    );

    // 记录使用量和成本
    if (response.usage) {
      const cost = estimateCostUsd(
        response.model,
        response.usage.promptTokens,
        response.usage.completionTokens
      );
      recordUsage(userId, cost);
    }

    // 返回响应
    return NextResponse.json({
      id: response.id,
      model: response.model,
      provider: response.provider,
      tier,
      choices: response.choices,
      usage: response.usage,
      created: response.created,
    });

  } catch (error) {
    console.error('AI Chat API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// 应用速率限制的POST处理器
export const POST = withRateLimit(rateLimitConfigs.aiChat, handlePOST);

// 健康检查端点
export async function GET() {
  try {
    const router = createRouter();
    // 这里可以添加健康检查逻辑
    return NextResponse.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
