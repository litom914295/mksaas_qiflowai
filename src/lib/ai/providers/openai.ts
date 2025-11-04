import type {
  AIMessage,
  AIRequest,
  AIResponse,
  ProviderClient,
  ProviderConfig,
} from '../types';

/**
 * API密钥格式验证规则
 * OpenAI API密钥格式: sk-[48个字符] 或 sk-proj-[64个字符]
 */
const API_KEY_PATTERNS = {
  openai: /^sk-(proj-)?[A-Za-z0-9]{48,64}$/,
} as const;

/**
 * 安全配置常量
 */
const SECURITY_CONFIG = {
  MAX_CONTENT_LENGTH: 100000, // 最大内容长度
  MAX_MESSAGES: 100, // 最大消息数量
  MAX_TOKENS: 128000, // 最大token数量
  REQUEST_TIMEOUT: 60000, // 请求超时时间 (60秒)
  HEALTH_CHECK_TIMEOUT: 10000, // 健康检查超时 (10秒)
  MAX_RETRIES: 3, // 最大重试次数
  RETRY_DELAY_BASE: 1000, // 重试基础延迟 (毫秒)
  ALLOWED_ROLES: ['system', 'user', 'assistant', 'tool'] as const,
} as const;

/**
 * 验证API密钥格式
 * @param apiKey - API密钥
 * @returns 是否为有效格式
 */
function validateAPIKey(apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }

  // 检查长度和格式
  if (apiKey.length < 20 || apiKey.length > 200) {
    return false;
  }

  // 检查是否匹配已知的API密钥格式
  return API_KEY_PATTERNS.openai.test(apiKey);
}

/**
 * 清理和验证消息内容
 * @param message - 消息对象
 * @returns 清理后的消息
 */
function sanitizeMessage(message: AIMessage): AIMessage {
  const { role, content, name } = message;

  // 验证角色类型
  if (!SECURITY_CONFIG.ALLOWED_ROLES.includes(role as any)) {
    throw new Error(`无效的消息角色: ${role}`);
  }

  // 验证内容长度
  if (
    typeof content !== 'string' ||
    content.length > SECURITY_CONFIG.MAX_CONTENT_LENGTH
  ) {
    throw new Error('消息内容过长或格式无效');
  }

  // 清理内容（移除潜在的恶意脚本标签）
  const cleanContent = content
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .trim();

  const cleanMessage: AIMessage = { role, content: cleanContent };

  // 验证和清理name字段
  if (name) {
    const cleanName = name.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 64);
    if (cleanName) {
      cleanMessage.name = cleanName;
    }
  }

  return cleanMessage;
}

/**
 * 将消息映射为OpenAI格式
 * @param messages - 消息数组
 * @returns 转换后的消息数组
 */
const mapToOpenAI = (messages: AIMessage[]) => {
  if (!Array.isArray(messages)) {
    throw new Error('消息必须是数组格式');
  }

  if (messages.length === 0) {
    throw new Error('消息数组不能为空');
  }

  if (messages.length > SECURITY_CONFIG.MAX_MESSAGES) {
    throw new Error(
      `消息数量超出限制: ${messages.length}/${SECURITY_CONFIG.MAX_MESSAGES}`
    );
  }

  return messages.map(sanitizeMessage).filter((m) => m.content.length > 0); // 过滤空消息
};

/**
 * 指数退避重试延迟计算
 * @param attempt - 当前重试次数
 * @returns 延迟时间（毫秒）
 */
function calculateRetryDelay(attempt: number): number {
  return SECURITY_CONFIG.RETRY_DELAY_BASE * 2 ** attempt + Math.random() * 1000;
}

/**
 * 安全的错误信息处理
 * @param error - 原始错误
 * @param status - HTTP状态码
 * @returns 安全的错误消息
 */
function createSafeErrorMessage(error: unknown, status?: number): string {
  // 不暴露敏感的API密钥或内部错误详情
  if (status === 401) {
    return 'API密钥无效或已过期';
  }
  if (status === 403) {
    return '访问被拒绝，请检查API权限';
  }
  if (status === 429) {
    return 'API请求频率超限，请稍后重试';
  }
  if (status === 500) {
    return 'OpenAI服务暂时不可用';
  }
  if (status && status >= 400 && status < 500) {
    return `客户端请求错误 (${status})`;
  }
  if (status && status >= 500) {
    return `服务器错误 (${status})`;
  }

  // 对于其他错误，提供通用错误消息
  return 'OpenAI API请求失败';
}

export const createOpenAIClient = (config: ProviderConfig): ProviderClient => {
  const baseURL =
    config.baseURL ||
    process.env.OPENAI_BASE_URL ||
    'https://api.openai.com/v1';
  const apiKey = config.apiKey || process.env.OPENAI_API_KEY;
  const name = (config.name ?? 'openai') as ProviderClient['name'];
  const timeoutMs = config.timeoutMs || SECURITY_CONFIG.REQUEST_TIMEOUT;

  // 严格的API密钥验证
  if (!apiKey) {
    console.warn('[OpenAI客户端] API密钥未配置');
  } else if (!validateAPIKey(apiKey)) {
    console.error('[OpenAI客户端] API密钥格式无效');
    throw new Error('OpenAI API密钥格式无效');
  }

  // 验证baseURL格式
  try {
    new URL(baseURL);
  } catch {
    throw new Error('OpenAI baseURL格式无效');
  }

  // 验证超时配置
  if (timeoutMs <= 0 || timeoutMs > 300000) {
    // 最大5分钟
    throw new Error('超时配置无效，必须在0-300000ms之间');
  }

  const isHealthy = async (signal?: AbortSignal) => {
    try {
      const res = await fetch(`${baseURL}/models`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${apiKey}` },
        signal,
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const chat = async (input: AIRequest): Promise<AIResponse> => {
    const model = input.model || config.defaultModel || 'gpt-4o-mini';
    const body = {
      model,
      messages: mapToOpenAI(input.messages),
      temperature: input.temperature,
      max_tokens: input.maxTokens,
      top_p: input.topP,
      presence_penalty: input.presencePenalty,
      frequency_penalty: input.frequencyPenalty,
      stop: input.stop,
      stream: false,
    } as const;

    const res = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        ...(config.headers || {}),
      },
      body: JSON.stringify(body),
      signal: undefined,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenAI error ${res.status}: ${text}`);
    }
    const json = await res.json();

    const usage = json.usage
      ? {
          promptTokens: json.usage.prompt_tokens ?? 0,
          completionTokens: json.usage.completion_tokens ?? 0,
          totalTokens: json.usage.total_tokens ?? 0,
        }
      : undefined;

    const message = json.choices?.[0]?.message || {
      role: 'assistant',
      content: '',
    };

    const response: AIResponse = {
      id: json.id || crypto.randomUUID(),
      provider: name,
      model,
      created: Math.floor(Date.now() / 1000),
      choices: [
        {
          index: 0,
          message: { role: message.role, content: message.content },
          finishReason: json.choices?.[0]?.finish_reason,
        },
      ],
      usage,
      raw: json,
    };
    return response;
  };

  return { name, isHealthy, chat };
};
