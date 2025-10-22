import type {
  AIRequest,
  AIResponse,
  ProviderClient,
  ProviderConfig,
} from '../types';

const mapToDeepSeek = (messages: any[]) =>
  messages
    .map((m) => ({ role: m.role, content: m.content, name: m.name }))
    .filter(Boolean);

export const createDeepSeekClient = (
  config: ProviderConfig
): ProviderClient => {
  const baseURL =
    config.baseURL ||
    process.env.DEEPSEEK_BASE_URL ||
    'https://api.deepseek.com/v1';
  const apiKey = config.apiKey || process.env.DEEPSEEK_API_KEY;
  const name = (config.name ?? 'deepseek') as ProviderClient['name'];

  if (!apiKey) {
    // Lazy failure in isHealthy/chat
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
    const model = input.model || config.defaultModel || 'deepseek-chat';
    const body = {
      model,
      messages: mapToDeepSeek(input.messages),
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
      throw new Error(`DeepSeek error ${res.status}: ${text}`);
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
