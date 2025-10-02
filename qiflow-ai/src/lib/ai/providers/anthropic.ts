import { AIRequest, AIResponse, ProviderClient, ProviderConfig } from '../types';

// const mapToAnthropic = (messages: AIMessage[]) => {
  // Anthropic uses different message format
  return messages.map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
  }));
};

export const createAnthropicClient = (config: ProviderConfig): ProviderClient => {
  const baseURL = config.baseURL || process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1';
  const apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
  const name = (config.name ?? 'anthropic') as ProviderClient['name'];

  if (!apiKey) {
    // Lazy failure in isHealthy/chat
  }

  const isHealthy = async (signal?: AbortSignal) => {
    try {
      const res = await fetch(`${baseURL}/messages`, {
        method: 'POST',
        headers: { 
          'x-api-key': apiKey || '',
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        } as HeadersInit,
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }]
        }),
        signal,
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const chat = async (input: AIRequest): Promise<AIResponse> => {
    const model = input.model || config.defaultModel || 'claude-3-haiku-20240307';
    const body = {
      model,
      messages: mapToAnthropic(input.messages),
      max_tokens: input.maxTokens || 1000,
      temperature: input.temperature,
      top_p: input.topP,
      stop_sequences: input.stop,
    } as const;

    const res = await fetch(`${baseURL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey || '',
        'anthropic-version': '2023-06-01',
        ...(config.headers || {}),
      } as HeadersInit,
      body: JSON.stringify(body),
      signal: undefined,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Anthropic error ${res.status}: ${text}`);
    }
    const json = await res.json();

    const usage = json.usage
      ? {
          promptTokens: json.usage.input_tokens ?? 0,
          completionTokens: json.usage.output_tokens ?? 0,
          totalTokens: (json.usage.input_tokens ?? 0) + (json.usage.output_tokens ?? 0),
        }
      : undefined;

    const message = json.content?.[0]?.text || '';

    const response: AIResponse = {
      id: json.id || crypto.randomUUID(),
      provider: name,
      model,
      created: Math.floor(Date.now() / 1000),
      choices: [
        {
          index: 0,
          message: { role: 'assistant', content: message },
          finishReason: json.stop_reason,
        },
      ],
      usage,
      raw: json,
    };
    return response;
  };

  return { name, isHealthy, chat };
};
