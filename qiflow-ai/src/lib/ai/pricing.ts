// 模型价格映射表 (USD per 1K tokens)
export const MODEL_PRICING = {
  // OpenAI
  'gpt-4o': { input: 0.005, output: 0.015 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
  
  // Anthropic
  'claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
  'claude-3-5-haiku-20241022': { input: 0.0008, output: 0.004 },
  'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
  'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
  
  // Gemini
  'gemini-1.5-pro': { input: 0.00125, output: 0.005 },
  'gemini-1.5-flash': { input: 0.000075, output: 0.0003 },
  'gemini-1.0-pro': { input: 0.0005, output: 0.0015 },
  
  // DeepSeek
  'deepseek-chat': { input: 0.00014, output: 0.00028 },
  'deepseek-reasoner': { input: 0.00055, output: 0.00219 },
  
  // Grok (estimated)
  'grok-2': { input: 0.0001, output: 0.0001 },
  'grok-2-mini': { input: 0.00005, output: 0.00005 },
} as const;

export type ModelName = keyof typeof MODEL_PRICING;

export const estimateCostUsd = (
  model: string,
  inputTokens: number,
  outputTokens: number
): number => {
  const pricing = MODEL_PRICING[model as ModelName];
  if (!pricing) {
    // 默认价格作为后备
    return (inputTokens + outputTokens) / 1000 * 0.003;
  }
  
  const inputCost = (inputTokens / 1000) * pricing.input;
  const outputCost = (outputTokens / 1000) * pricing.output;
  return inputCost + outputCost;
};

export const getModelTier = (model: string): 'economy' | 'standard' | 'premium' => {
  const pricing = MODEL_PRICING[model as ModelName];
  if (!pricing) return 'standard';
  
  const avgCost = (pricing.input + pricing.output) / 2;
  if (avgCost < 0.001) return 'economy';
  if (avgCost < 0.01) return 'standard';
  return 'premium';
};
