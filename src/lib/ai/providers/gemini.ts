import type {
  AIRequest,
  AIResponse,
  ProviderClient,
  ProviderConfig,
} from '../types';

const mapToGemini = (messages: any[]) => {
  // Gemini uses different message format
  return messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
};

export const createGeminiClient = (config: ProviderConfig): ProviderClient => {
  const baseURL =
    config.baseURL ||
    process.env.GEMINI_BASE_URL ||
    'https://generativelanguage.googleapis.com/v1beta';
  const apiKey = config.apiKey || process.env.GEMINI_API_KEY;
  const name = (config.name ?? 'gemini') as ProviderClient['name'];

  if (!apiKey) {
    // Lazy failure in isHealthy/chat
  }

  const isHealthy = async (signal?: AbortSignal) => {
    try {
      const res = await fetch(`${baseURL}/models?key=${apiKey}`, {
        method: 'GET',
        signal,
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const chat = async (input: AIRequest): Promise<AIResponse> => {
    const model = input.model || config.defaultModel || 'gemini-1.5-flash';
    const body = {
      contents: mapToGemini(input.messages),
      generationConfig: {
        temperature: input.temperature,
        topP: input.topP,
        maxOutputTokens: input.maxTokens,
        stopSequences: input.stop,
      },
    } as const;

    const res = await fetch(
      `${baseURL}/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.headers || {}),
        },
        body: JSON.stringify(body),
        signal: undefined,
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Gemini error ${res.status}: ${text}`);
    }
    const json = await res.json();

    const usage = json.usageMetadata
      ? {
          promptTokens: json.usageMetadata.promptTokenCount ?? 0,
          completionTokens: json.usageMetadata.candidatesTokenCount ?? 0,
          totalTokens: json.usageMetadata.totalTokenCount ?? 0,
        }
      : undefined;

    const message = json.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const response: AIResponse = {
      id: json.candidates?.[0]?.finishReason || crypto.randomUUID(),
      provider: name,
      model,
      created: Math.floor(Date.now() / 1000),
      choices: [
        {
          index: 0,
          message: { role: 'assistant', content: message },
          finishReason: json.candidates?.[0]?.finishReason,
        },
      ],
      usage,
      raw: json,
    };
    return response;
  };

  return { name, isHealthy, chat };
};
