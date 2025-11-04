/**
 * AI模型配置管理
 * 支持通过环境变量或配置文件自定义模型选择策略
 */

export interface ModelSelectionRule {
  condition: string;
  provider: string;
  model: string;
  temperature: number;
  maxTokens: number;
  priority: number;
}

export interface AIModelsConfig {
  // 默认模型列表
  lightweightModels: string[];
  fullModels: string[];

  // 智能路由规则
  selectionRules: ModelSelectionRule[];

  // 提供商优先级
  providerPriority: string[];

  // 成本控制
  maxCostPerRequest: number;
  enableCostOptimization: boolean;
}

// 默认配置
const defaultConfig: AIModelsConfig = {
  lightweightModels: [
    'gpt-4o-mini',
    'claude-3-haiku-20240307',
    'gemini-1.5-flash',
    'deepseek-chat',
  ],
  fullModels: ['gpt-4o', 'claude-3-5-sonnet-20241022', 'gemini-1.5-pro'],
  selectionRules: [
    {
      condition: 'educational',
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      temperature: 0.5,
      maxTokens: 1800,
      priority: 1,
    },
    {
      condition: 'fengshui',
      provider: 'deepseek',
      model: 'deepseek-chat',
      temperature: 0.35,
      maxTokens: 1600,
      priority: 2,
    },
    {
      condition: 'western',
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0.3,
      maxTokens: 1200,
      priority: 3,
    },
    {
      condition: 'default',
      provider: 'deepseek',
      model: 'deepseek-chat',
      temperature: 0.3,
      maxTokens: 1200,
      priority: 4,
    },
  ],
  providerPriority: ['deepseek', 'openai', 'anthropic', 'gemini'],
  maxCostPerRequest: 0.1, // $0.10 per request
  enableCostOptimization: true,
};

// 从环境变量加载配置
function loadConfigFromEnv(): Partial<AIModelsConfig> {
  const config: Partial<AIModelsConfig> = {};

  // 加载精简模型列表
  const lightweightModelsEnv = process.env.AI_LIGHTWEIGHT_MODELS;
  if (lightweightModelsEnv) {
    config.lightweightModels = lightweightModelsEnv
      .split(',')
      .map((m) => m.trim());
  }

  // 加载完整模型列表
  const fullModelsEnv = process.env.AI_FULL_MODELS;
  if (fullModelsEnv) {
    config.fullModels = fullModelsEnv.split(',').map((m) => m.trim());
  }

  // 加载提供商优先级
  const providerPriorityEnv = process.env.AI_PROVIDER_PRIORITY;
  if (providerPriorityEnv) {
    config.providerPriority = providerPriorityEnv
      .split(',')
      .map((p) => p.trim());
  }

  // 加载成本控制
  const maxCostEnv = process.env.AI_MAX_COST_PER_REQUEST;
  if (maxCostEnv) {
    config.maxCostPerRequest = Number.parseFloat(maxCostEnv);
  }

  const costOptimizationEnv = process.env.AI_ENABLE_COST_OPTIMIZATION;
  if (costOptimizationEnv) {
    config.enableCostOptimization = costOptimizationEnv === 'true';
  }

  return config;
}

// 合并配置
export function getAIModelsConfig(): AIModelsConfig {
  const envConfig = loadConfigFromEnv();
  return {
    ...defaultConfig,
    ...envConfig,
  };
}

// 根据条件选择模型
export function selectModelByCondition(
  condition: string,
  config: AIModelsConfig = getAIModelsConfig()
): ModelSelectionRule | null {
  const rules = config.selectionRules
    .filter((rule) => rule.condition === condition)
    .sort((a, b) => a.priority - b.priority);

  return rules[0] || null;
}

// 获取可用的提供商列表
export function getAvailableProviders(): string[] {
  const providers = [];

  if (process.env.OPENAI_API_KEY) providers.push('openai');
  if (process.env.ANTHROPIC_API_KEY) providers.push('anthropic');
  if (process.env.GEMINI_API_KEY) providers.push('gemini');
  if (process.env.DEEPSEEK_API_KEY) providers.push('deepseek');

  return providers;
}

// 验证配置
export function validateConfig(config: AIModelsConfig): string[] {
  const errors: string[] = [];

  if (config.lightweightModels.length === 0) {
    errors.push('至少需要配置一个精简模型');
  }

  if (config.fullModels.length === 0) {
    errors.push('至少需要配置一个完整模型');
  }

  if (config.selectionRules.length === 0) {
    errors.push('至少需要配置一个模型选择规则');
  }

  const availableProviders = getAvailableProviders();
  if (availableProviders.length === 0) {
    errors.push('至少需要配置一个AI提供商的API密钥');
  }

  return errors;
}
