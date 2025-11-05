/**
 * AI Chat API - 流式传输版本
 * 参考 mksaas 模板实现，使用 Vercel AI SDK
 */

import { handleStreamChat } from '@/server/ai/stream-chat';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

// Edge Runtime 配置（参考 mksaas 模板）
export const runtime = 'edge';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  console.log('\n========== [AI Chat API] 收到请求 ==========');

  try {
    const body = await req.json();
    console.log('[AI Chat API] 请求体:', {
      messagesCount: body.messages?.length,
      hasContext: !!body.context,
      contextLength: body.context?.length,
    });

    // 检查是否禁用流式传输（应急回退）
    if (process.env.AI_STREAMING_ENABLED === 'false') {
      console.error('[AI Chat API] 流式传输已被禁用');
      return new Response(JSON.stringify({ error: '流式传输已禁用' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 调用流式处理器
    console.log('[AI Chat API] 调用 handleStreamChat...');
    const response = await handleStreamChat(body);
    console.log('[AI Chat API] handleStreamChat 返回响应');
    return response;
  } catch (err) {
    console.error('[AI Chat API] 错误:', err);
    if (err instanceof Error) {
      console.error('[AI Chat API] 错误堆栈:', err.stack);
    }

    // 友好的错误消息
    const message =
      err instanceof z.ZodError
        ? '请求参数格式错误: ' + JSON.stringify(err.errors)
        : err instanceof Error
          ? err.message
          : 'AI 服务暂时不可用，请稍后再试';

    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
