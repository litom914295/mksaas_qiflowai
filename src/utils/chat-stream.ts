/**
 * 前端流式聊天工具函数
 * 用于处理 AI 流式响应数据
 */

import type { Message } from '@/types/ai';

export interface StreamReadOptions {
  onStart?: () => void;
  onUpdate?: (content: string) => void;
  onFinish?: () => void;
  onError?: (error: Error) => void;
  signal?: AbortSignal;
}

/**
 * 读取流式响应并解析数据
 * 兼容 Vercel AI SDK 的 Data Stream 格式
 */
export async function readStreamResponse(
  response: Response,
  options: StreamReadOptions
): Promise<string> {
  const { onStart, onUpdate, onFinish, onError, signal } = options;

  if (!response.body) {
    throw new Error('Response body is empty');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let fullContent = '';

  try {
    onStart?.();

    while (true) {
      // 检查是否中止
      if (signal?.aborted) {
        reader.cancel();
        throw new Error('Stream aborted');
      }

      const { done, value } = await reader.read();

      if (done) break;

      // 解码数据块
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      // 使用纯文本流格式（.toTextStreamResponse()）
      // 直接追加数据块内容
      fullContent += chunk;
      onUpdate?.(fullContent);
    }

    onFinish?.();
    return fullContent;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    onError?.(err);
    throw err;
  } finally {
    reader.releaseLock();
  }
}

/**
 * 发送流式聊天请求
 */
export async function streamChat(
  messages: Array<{ role: string; content: string }>,
  context?: string,
  options: StreamReadOptions = {}
): Promise<string> {
  const controller = new AbortController();
  const signal = options.signal || controller.signal;

  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        context,
        enableContext: !!context,
        includeReasoning: false, // 使用纯文本流以获得更快的 TTFB
      }),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Request failed: ${response.statusText}`
      );
    }

    return await readStreamResponse(response, {
      ...options,
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('请求已取消');
    }
    throw error;
  }
}
