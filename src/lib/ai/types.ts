export type AIModelProvider =
  | 'openai'
  | 'openai-compatible'
  | 'anthropic'
  | 'gemini'
  | 'grok'
  | 'deepseek';

export type AIMessageRole = 'system' | 'user' | 'assistant' | 'tool';

export type AIMessage = {
  role: AIMessageRole;
  content: string;
  name?: string;
};

export type AIRequest = {
  provider?: AIModelProvider;
  model: string;
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  stop?: string[];
  stream?: boolean;
  userId?: string;
  metadata?: Record<string, unknown>;
};

export type AIChoice = {
  index: number;
  message: AIMessage;
  finishReason?: string;
};

export type AIResponseUsage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd?: number;
};

export type AIResponse = {
  id: string;
  provider: AIModelProvider;
  model: string;
  created: number;
  choices: AIChoice[];
  usage?: AIResponseUsage;
  raw?: unknown;
};

export type ProviderConfig = {
  name: AIModelProvider;
  apiKey?: string;
  baseURL?: string;
  defaultModel?: string;
  timeoutMs?: number;
  headers?: Record<string, string>;
  costPer1kTokensUsd?: number; // default model-level cost hint
};

export type ProviderCallContext = {
  requestId: string;
  now: number;
};

export type ProviderClient = {
  readonly name: AIModelProvider;
  isHealthy: (signal?: AbortSignal) => Promise<boolean>;
  chat: (input: AIRequest, ctx?: ProviderCallContext) => Promise<AIResponse>;
};

export type CostBudget = {
  userId?: string;
  dailyUsd?: number;
  monthlyUsd?: number;
  hardLimitUsd?: number;
};

export type RoutingPolicy = {
  order: AIModelProvider[]; // priority order for failover
  allowFallback: boolean;
};

export type CachedEntry = {
  key: string;
  value: AIResponse;
  createdAt: number;
  expiresAt: number;
};

export type TemplateName =
  | 'fengshui.analysis'
  | 'fengshui.summary'
  | 'fengshui.educational'
  | 'fengshui.consultation'
  | 'fengshui.room_analysis'
  | 'chat.assistant'
  | 'bazi.explain';

export type TemplateInput = Record<string, unknown>;

export type TemplateEngine = {
  render: (name: TemplateName, input: TemplateInput) => string;
  validate: (name: TemplateName) => boolean;
  getTemplateNames: () => TemplateName[];
  preview: (
    name: TemplateName,
    input: TemplateInput
  ) => {
    success: boolean;
    result?: string;
    error?: string;
    template: string;
  };
};

// 新增：AI分析置信度评估
export type ConfidenceScore = {
  overall: number; // 整体置信度 0-1
  reasoning: string; // 置信度理由
  factors: {
    dataQuality: number; // 数据质量 0-1
    theoryMatch: number; // 理论匹配度 0-1
    complexity: number; // 分析复杂度 0-1
    culturalRelevance: number; // 文化相关性 0-1
  };
};

// 新增：专业术语解释
export type TermExplanation = {
  term: string;
  definition: string;
  pronunciation?: string; // 发音
  category: 'fengshui' | 'bazi' | 'wuxing' | 'general';
  relatedTerms: string[];
  examples?: string[];
};

// 新增：上下文管理
export type ConversationContext = {
  sessionId: string;
  userId: string;
  history: {
    userMessage: string;
    aiResponse: string;
    timestamp: Date;
    confidence?: ConfidenceScore;
  }[];
  userProfile: {
    expertise: 'beginner' | 'intermediate' | 'advanced';
    interests: string[];
    preferredStyle: 'detailed' | 'concise' | 'educational';
    baziInfo?: any;
    houseInfo?: any;
  };
  currentTopic?: string;
  relatedTopics: string[];
};

// 新增：增强的AI响应类型
export type EnhancedAIResponse = AIResponse & {
  confidence: ConfidenceScore;
  explanations: TermExplanation[];
  suggestions: string[];
  followUpQuestions: string[];
  educationalContent?: {
    concepts: TermExplanation[];
    resources: string[];
  };
  context?: ConversationContext;
};
