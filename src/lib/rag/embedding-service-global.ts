/**
 * 全球智能路由 EmbeddingService
 *
 * 根据用户地理位置和配置自动选择最优的 Embedding 提供商
 * - 中国大陆: 硅基流动 (免费)
 * - 亚太地区: Jina AI (便宜)
 * - 欧美地区: OpenAI (稳定)
 */

import OpenAI from 'openai';

export interface EmbeddingResult {
  embedding: number[];
  tokens: number;
  index: number;
  provider?: string; // 实际使用的提供商
}

export interface BatchEmbeddingResult {
  embeddings: number[][];
  totalTokens: number;
  costs: number;
  provider?: string;
}

export type EmbeddingProvider =
  | 'openai'
  | 'siliconflow'
  | 'jina'
  | 'dashscope'
  | 'auto';

export interface GlobalEmbeddingOptions {
  provider?: EmbeddingProvider;
  forceProvider?: boolean; // 强制使用指定提供商
  batchSize?: number;
  retryAttempts?: number;
  userRegion?: string; // 用户地区代码 (cn, us, sg, etc.)
}

/**
 * 地区配置映射
 */
const REGION_PROVIDER_MAP: Record<string, EmbeddingProvider[]> = {
  // 中国大陆及港澳台
  cn: ['siliconflow', 'dashscope', 'jina', 'openai'],
  hk: ['siliconflow', 'jina', 'openai'],
  tw: ['siliconflow', 'jina', 'openai'],
  mo: ['siliconflow', 'jina', 'openai'],

  // 东南亚
  sg: ['jina', 'openai', 'siliconflow'],
  my: ['jina', 'openai', 'siliconflow'],
  th: ['jina', 'openai', 'siliconflow'],
  id: ['jina', 'openai', 'siliconflow'],
  ph: ['jina', 'openai', 'siliconflow'],
  vn: ['jina', 'openai', 'siliconflow'],

  // 日韩
  jp: ['jina', 'openai', 'siliconflow'],
  kr: ['jina', 'openai', 'siliconflow'],

  // 欧美
  us: ['openai', 'jina'],
  ca: ['openai', 'jina'],
  gb: ['openai', 'jina'],
  de: ['openai', 'jina'],
  fr: ['openai', 'jina'],
  au: ['openai', 'jina'],

  // 默认（其他地区）
  default: ['openai', 'jina', 'siliconflow'],
};

export class GlobalEmbeddingService {
  private providers: Map<EmbeddingProvider, any> = new Map();
  private options: Required<Omit<GlobalEmbeddingOptions, 'userRegion'>> & {
    userRegion?: string;
  };
  private stats = {
    requestsByProvider: {} as Record<string, number>,
    totalTokens: 0,
    totalCost: 0,
  };

  constructor(options?: GlobalEmbeddingOptions) {
    this.options = {
      provider: options?.provider || 'auto',
      forceProvider: options?.forceProvider || false,
      batchSize: options?.batchSize || 100,
      retryAttempts: options?.retryAttempts || 3,
      userRegion: options?.userRegion,
    };

    this.initializeProviders();
  }

  /**
   * 初始化所有提供商
   */
  private initializeProviders() {
    // OpenAI
    if (process.env.OPENAI_API_KEY) {
      this.providers.set(
        'openai',
        new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        })
      );
    }

    // 硅基流动 (OpenAI 兼容)
    if (process.env.SILICONFLOW_API_KEY) {
      this.providers.set(
        'siliconflow',
        new OpenAI({
          apiKey: process.env.SILICONFLOW_API_KEY,
          baseURL: 'https://api.siliconflow.cn/v1',
        })
      );
    }

    // Jina AI
    if (process.env.JINA_API_KEY) {
      this.providers.set('jina', {
        apiKey: process.env.JINA_API_KEY,
        baseURL: 'https://api.jina.ai/v1',
      });
    }

    // 阿里云灵积
    if (process.env.DASHSCOPE_API_KEY) {
      this.providers.set('dashscope', {
        apiKey: process.env.DASHSCOPE_API_KEY,
        baseURL: 'https://dashscope.aliyuncs.com/api/v1',
      });
    }
  }

  /**
   * 智能选择提供商
   */
  private selectProvider(): EmbeddingProvider {
    // 如果强制指定提供商
    if (this.options.forceProvider && this.options.provider !== 'auto') {
      return this.options.provider;
    }

    // 如果手动指定了非 auto
    if (this.options.provider !== 'auto') {
      return this.options.provider;
    }

    // 自动选择：根据地区
    const region = this.options.userRegion || this.detectRegion();
    const preferredProviders =
      REGION_PROVIDER_MAP[region] || REGION_PROVIDER_MAP.default;

    // 选择第一个可用的提供商
    for (const provider of preferredProviders) {
      if (this.providers.has(provider)) {
        return provider;
      }
    }

    // 降级：选择任何可用的
    if (this.providers.has('openai')) return 'openai';
    if (this.providers.has('jina')) return 'jina';
    if (this.providers.has('siliconflow')) return 'siliconflow';

    throw new Error(
      'No embedding provider available. Please configure at least one API key.'
    );
  }

  /**
   * 检测用户地区（简化版，实际应用中使用 IP 地理位置服务）
   */
  private detectRegion(): string {
    // 在实际应用中，应该：
    // 1. 从请求头读取 CloudFlare/Vercel 提供的地区信息
    // 2. 或使用 IP 地理位置 API (如 ipapi.co, ip-api.com)
    // 3. 或从用户资料中读取

    // 这里返回默认值
    return process.env.DEFAULT_REGION || 'default';
  }

  /**
   * 向量化单个文本
   */
  async embed(text: string): Promise<EmbeddingResult> {
    const provider = this.selectProvider();

    try {
      const result = await this.embedWithProvider(text, provider);

      // 更新统计
      this.stats.requestsByProvider[provider] =
        (this.stats.requestsByProvider[provider] || 0) + 1;
      this.stats.totalTokens += result.tokens;

      return {
        ...result,
        provider,
      };
    } catch (error) {
      console.error(`[Embedding] ${provider} failed:`, error);

      // 尝试降级到备用提供商
      return this.embedWithFallback(text, provider);
    }
  }

  /**
   * 使用指定提供商进行向量化
   */
  private async embedWithProvider(
    text: string,
    provider: EmbeddingProvider
  ): Promise<EmbeddingResult> {
    switch (provider) {
      case 'openai':
        return this.embedWithOpenAI(text);
      case 'siliconflow':
        return this.embedWithSiliconFlow(text);
      case 'jina':
        return this.embedWithJina(text);
      case 'dashscope':
        return this.embedWithDashScope(text);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  /**
   * OpenAI 向量化
   */
  private async embedWithOpenAI(text: string): Promise<EmbeddingResult> {
    const client = this.providers.get('openai');
    const response = await client.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      dimensions: 1536,
    });

    return {
      embedding: response.data[0].embedding,
      tokens: response.usage.total_tokens,
      index: 0,
    };
  }

  /**
   * 硅基流动向量化（使用 bge-m3）
   */
  private async embedWithSiliconFlow(text: string): Promise<EmbeddingResult> {
    const client = this.providers.get('siliconflow');
    const response = await client.embeddings.create({
      model: 'BAAI/bge-m3',
      input: text,
    });

    return {
      embedding: response.data[0].embedding,
      tokens: response.usage.total_tokens,
      index: 0,
    };
  }

  /**
   * Jina AI 向量化
   */
  private async embedWithJina(text: string): Promise<EmbeddingResult> {
    const config = this.providers.get('jina');
    const response = await fetch(`${config.baseURL}/embeddings`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'jina-embeddings-v2-base-zh',
        input: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Jina API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      embedding: data.data[0].embedding,
      tokens: data.usage.total_tokens,
      index: 0,
    };
  }

  /**
   * 阿里云灵积向量化
   */
  private async embedWithDashScope(text: string): Promise<EmbeddingResult> {
    const config = this.providers.get('dashscope');
    const response = await fetch(
      `${config.baseURL}/services/embeddings/text-embedding/text-embedding`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-v2',
          input: { texts: [text] },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`DashScope API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      embedding: data.output.embeddings[0].embedding,
      tokens: this.estimateTokens(text),
      index: 0,
    };
  }

  /**
   * 降级到备用提供商
   */
  private async embedWithFallback(
    text: string,
    failedProvider: EmbeddingProvider
  ): Promise<EmbeddingResult> {
    const region = this.options.userRegion || this.detectRegion();
    const preferredProviders =
      REGION_PROVIDER_MAP[region] || REGION_PROVIDER_MAP.default;

    // 尝试其他提供商
    for (const provider of preferredProviders) {
      if (provider !== failedProvider && this.providers.has(provider)) {
        try {
          console.log(`[Embedding] Fallback to ${provider}`);
          const result = await this.embedWithProvider(text, provider);
          return { ...result, provider };
        } catch (error) {
          console.error(`[Embedding] ${provider} also failed:`, error);
        }
      }
    }

    throw new Error('All embedding providers failed');
  }

  /**
   * 批量向量化
   */
  async embedBatch(texts: string[]): Promise<BatchEmbeddingResult> {
    const provider = this.selectProvider();
    const embeddings: number[][] = [];
    let totalTokens = 0;

    // 分批处理
    for (let i = 0; i < texts.length; i += this.options.batchSize) {
      const batch = texts.slice(i, i + this.options.batchSize);

      for (const text of batch) {
        const result = await this.embed(text);
        embeddings.push(result.embedding);
        totalTokens += result.tokens;
      }
    }

    const costs = this.calculateCost(totalTokens, provider);

    return {
      embeddings,
      totalTokens,
      costs,
      provider,
    };
  }

  /**
   * 计算成本
   */
  private calculateCost(tokens: number, provider: EmbeddingProvider): number {
    const costPerMillion: Record<EmbeddingProvider, number> = {
      openai: 0.02,
      siliconflow: 0, // 免费
      jina: 0.02,
      dashscope: 0.0007 * 1000, // 人民币转美元
      auto: 0,
    };

    return (tokens / 1_000_000) * (costPerMillion[provider] || 0);
  }

  /**
   * 估算 token 数
   */
  private estimateTokens(text: string): number {
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const otherChars = text.length - chineseChars;
    return Math.ceil(chineseChars / 1.5 + otherChars / 4);
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      ...this.stats,
      availableProviders: Array.from(this.providers.keys()),
      currentProvider: this.selectProvider(),
    };
  }

  /**
   * 重置统计
   */
  resetStats() {
    this.stats = {
      requestsByProvider: {},
      totalTokens: 0,
      totalCost: 0,
    };
  }
}

/**
 * 单例实例
 */
let globalInstance: GlobalEmbeddingService | null = null;

export function getGlobalEmbeddingService(
  options?: GlobalEmbeddingOptions
): GlobalEmbeddingService {
  if (!globalInstance) {
    globalInstance = new GlobalEmbeddingService(options);
  }
  return globalInstance;
}

export function resetGlobalEmbeddingService() {
  globalInstance = null;
}
