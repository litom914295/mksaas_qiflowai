/**
 * 核心流式聊天处理器
 * 参考 mksaas 模板实现，使用 Vercel AI SDK
 */

import type { CoreMessage } from 'ai';
import { streamText } from 'ai';
import { z } from 'zod';
import {
  type ProviderKey,
  getDefaultProvider,
  isProviderAvailable,
  resolveModel,
} from './providers';

// 请求验证 Schema
export const ChatRequestSchema = z.object({
  provider: z.enum(['openai', 'deepseek', 'gemini']).optional(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string(),
    })
  ),
  context: z.string().optional(),
  enableContext: z.boolean().optional(),
  includeReasoning: z.boolean().optional().default(false),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

/**
 * 构建系统提示词（保留原有上下文增强逻辑）
 */
function buildSystemPrompt(input: ChatRequest): string {
  const basePrompt = `你是一位专业的风水大师和八字命理专家，名叫"气流AI大师"。你精通：
1. 八字命理分析：能够根据生辰八字分析人的性格、运势、事业、财运等
2. 风水布局：精通玄空风水、九宫飞星等理论，能给出专业的风水建议
3. 开运指导：提供实用的开运建议和化解方案

请用专业、友好的语气回答用户问题。回答要：
- 专业但易懂
- 有理有据
- 给出具体可行的建议
- 保持积极正面的态度
- 尽快给出首字节，随后逐步补充细节`;

  // 添加当前时间信息
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();
  const dateInfo = `\n\n【当前时间】\n今天是 ${currentYear}年${currentMonth}月${currentDay}日。当前是 ${currentYear} 年（甲辰龙年，九运）。`;

  // 如果有上下文信息，添加到系统提示中
  if (input.enableContext && input.context) {
    const contextInfo = `\n\n【当前用户的背景信息】\n以下是用户已经提供的信息和生成的分析结果，你可以直接引用这些内容来回答问题，无需再次询问用户的生日、房屋朝向等基础信息：\n\n${input.context}\n\n【重要提示】\n- 在回答时，请自然地运用上述背景信息\n- 如果用户的问题与这些信息相关，请结合具体数据给出个性化建议\n- 对于分析结果中已经提到的内容，可以进行更深入的解释和扩展\n- 避免重复询问用户已经提供过的信息`;

    return basePrompt + dateInfo + contextInfo;
  }

  return basePrompt + dateInfo;
}

/**
 * 处理流式聊天请求（核心函数）
 */
export async function handleStreamChat(reqBody: unknown) {
  console.log('[handleStreamChat] 开始处理...');

  // 1. 验证请求体
  let parsed: ChatRequest;
  try {
    parsed = ChatRequestSchema.parse(reqBody);
    console.log('[handleStreamChat] 请求验证成功');
  } catch (error) {
    console.error('[handleStreamChat] 请求验证失败:', error);
    throw error;
  }

  const { temperature, messages, includeReasoning } = parsed;

  // 2. 确定使用的 Provider
  let provider: ProviderKey;
  if (parsed.provider && isProviderAvailable(parsed.provider)) {
    provider = parsed.provider;
  } else {
    provider = getDefaultProvider();
  }

  console.log(`[handleStreamChat] Using provider: ${provider}`);

  // 3. 构建系统提示和消息列表
  const systemPrompt = buildSystemPrompt(parsed);
  const coreMessages: CoreMessage[] = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  console.log('[handleStreamChat] Messages:', coreMessages.length);

  // 4. 调用 Vercel AI SDK 进行流式生成
  try {
    console.log('[handleStreamChat] 调用 streamText...');
    const result = streamText({
      model: resolveModel(provider, parsed.model),
      messages: coreMessages,
      temperature,
      // maxTokens 已移除，使用模型默认设置
    });

    console.log('[handleStreamChat] streamText 返回结果:', typeof result);

    // 5. 返回流式响应（使用纯文本流，更快的 TTFB）
    console.log('[handleStreamChat] 调用 toTextStreamResponse...');
    const response = result.toTextStreamResponse();
    console.log('[handleStreamChat] 返回响应:', response.status);
    return response;
  } catch (error) {
    console.error(`[Stream Chat] Provider ${provider} failed:`, error);

    // 尝试回退到其他 Provider
    const availableProviders = ['deepseek', 'openai', 'gemini'].filter(
      (p) => p !== provider && isProviderAvailable(p as ProviderKey)
    ) as ProviderKey[];

    if (availableProviders.length > 0) {
      const fallbackProvider = availableProviders[0];
      console.log(`[Stream Chat] Fallback to provider: ${fallbackProvider}`);

      const fallbackResult = streamText({
        model: resolveModel(fallbackProvider, parsed.model),
        messages: coreMessages,
        temperature,
        // maxTokens 已移除，使用模型默认设置
      });

      return fallbackResult.toTextStreamResponse();
    }

    // 所有 Provider 都失败，抛出错误
    throw new Error('所有 AI 服务提供商均不可用，请稍后再试');
  }
}

/**
 * 应急回退：非流式响应（用于 AI_STREAMING_ENABLED=false 时）
 */
export async function handleNonStreamChat(reqBody: unknown) {
  const parsed = ChatRequestSchema.parse(reqBody);

  return new Response(
    JSON.stringify({
      message: '抱歉，流式传输暂时不可用。请稍后再试。',
      provider: 'fallback',
    }),
    {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
