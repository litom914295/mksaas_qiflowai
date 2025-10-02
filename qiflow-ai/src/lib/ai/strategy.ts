import type { AIRequest, AIResponse, TemplateName } from './types';
import { templateEngine } from './templates';
import { sanitizeForAI } from './sanitize';
import { estimateCostUsd, getModelTier } from './pricing';

// 四层处理策略：缓存 → 模板 → 精简LLM → 完整LLM
export type ProcessingTier = 'cache' | 'template' | 'lightweight' | 'full';

export type StrategyConfig = {
  enableCache: boolean;
  enableTemplates: boolean;
  enableLightweight: boolean;
  enableFull: boolean;
  cacheTtlMs: number;
  templateFallback: boolean;
  lightweightModels: string[];
  fullModels: string[];
};

const defaultConfig: StrategyConfig = {
  enableCache: true,
  enableTemplates: true,
  enableLightweight: true,
  enableFull: true,
  cacheTtlMs: 5 * 60 * 1000, // 5分钟
  templateFallback: true,
  lightweightModels: ['gpt-4o-mini', 'claude-3-haiku-20240307', 'gemini-1.5-flash', 'deepseek-chat'],
  fullModels: ['gpt-4o', 'claude-3-5-sonnet-20241022', 'gemini-1.5-pro'],
};

// 简化的内存缓存
const cache = new Map<string, { response: AIResponse; expiresAt: number }>();

export const generateCacheKey = (request: AIRequest): string => {
  const sanitized = sanitizeForAI(request);
  return `ai:${JSON.stringify(sanitized)}`;
};

export const getCachedResponse = (key: string): AIResponse | null => {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.response;
};

export const setCachedResponse = (key: string, response: AIResponse, ttlMs: number) => {
  cache.set(key, {
    response,
    expiresAt: Date.now() + ttlMs,
  });
};

export const tryTemplateResponse = (
  templateName: TemplateName,
  input: Record<string, unknown>
): string | null => {
  try {
    return templateEngine.render(templateName, input);
  } catch {
    return null;
  }
};

export const selectModelByTier = (
  tier: ProcessingTier,
  availableModels: string[],
  config: StrategyConfig = defaultConfig
): string | null => {
  switch (tier) {
    case 'lightweight':
      return config.lightweightModels.find(m => availableModels.includes(m)) || null;
    case 'full':
      return config.fullModels.find(m => availableModels.includes(m)) || null;
    default:
      return null;
  }
};

export const shouldUseTier = (
  tier: ProcessingTier,
  request: AIRequest,
  config: StrategyConfig = defaultConfig
): boolean => {
  switch (tier) {
    case 'cache':
      return config.enableCache;
    case 'template':
      return config.enableTemplates && !!request.metadata?.templateName;
    case 'lightweight':
      return config.enableLightweight;
    case 'full':
      return config.enableFull;
    default:
      return false;
  }
};

export const processWithStrategy = async (
  request: AIRequest,
  chatFn: (req: AIRequest) => Promise<AIResponse>,
  config: StrategyConfig = defaultConfig
): Promise<{ response: AIResponse; tier: ProcessingTier }> => {
  const cacheKey = generateCacheKey(request);
  
  // 1. 尝试缓存
  if (shouldUseTier('cache', request, config)) {
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      return { response: cached, tier: 'cache' };
    }
  }
  
  // 2. 尝试模板
  if (shouldUseTier('template', request, config)) {
    const templateName = request.metadata?.templateName as TemplateName;
    if (templateName) {
      const templateResponse = tryTemplateResponse(templateName, request.metadata || {});
      if (templateResponse) {
        const response: AIResponse = {
          id: crypto.randomUUID(),
          provider: 'openai', // 标记为模板生成
          model: 'template',
          created: Math.floor(Date.now() / 1000),
          choices: [{
            index: 0,
            message: { role: 'assistant', content: templateResponse },
            finishReason: 'stop',
          }],
        };
        
        if (config.enableCache) {
          setCachedResponse(cacheKey, response, config.cacheTtlMs);
        }
        
        return { response, tier: 'template' };
      }
    }
  }
  
  // 3. 尝试精简模型
  if (shouldUseTier('lightweight', request, config)) {
    const lightweightModel = selectModelByTier('lightweight', [], config);
    if (lightweightModel) {
      const lightweightRequest = { ...request, model: lightweightModel };
      try {
        const response = await chatFn(lightweightRequest);
        
        if (config.enableCache) {
          setCachedResponse(cacheKey, response, config.cacheTtlMs);
        }
        
        return { response, tier: 'lightweight' };
      } catch (error) {
        // 继续到下一层
      }
    }
  }
  
  // 4. 使用完整模型
  if (shouldUseTier('full', request, config)) {
    const fullModel = selectModelByTier('full', [], config);
    if (fullModel) {
      const fullRequest = { ...request, model: fullModel };
      const response = await chatFn(fullRequest);
      
      if (config.enableCache) {
        setCachedResponse(cacheKey, response, config.cacheTtlMs);
      }
      
      return { response, tier: 'full' };
    }
  }
  
  throw new Error('All processing tiers failed');
};
