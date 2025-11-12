/**
 * 向量化服务 - EmbeddingService
 * 
 * 封装 OpenAI Embeddings API
 * 支持单个和批量文本向量化
 */

import OpenAI from 'openai';

export interface EmbeddingResult {
  embedding: number[];
  tokens: number;
  index: number;
}

export interface BatchEmbeddingResult {
  embeddings: number[][];
  totalTokens: number;
  costs: number;
}

export interface EmbeddingOptions {
  model?: string;          // 默认 'text-embedding-3-small'
  dimensions?: number;     // 向量维度，默认 1536
  batchSize?: number;      // 批量处理大小，默认 100
  retryAttempts?: number;  // 重试次数，默认 3
  retryDelay?: number;     // 重试延迟（毫秒），默认 1000
}

const DEFAULT_OPTIONS: Required<EmbeddingOptions> = {
  model: 'text-embedding-3-small',
  dimensions: 1536,
  batchSize: 100,
  retryAttempts: 3,
  retryDelay: 1000,
};

export class EmbeddingService {
  private client: OpenAI;
  private options: Required<EmbeddingOptions>;
  private requestCount = 0;
  private totalTokens = 0;

  constructor(
    apiKey?: string,
    options?: Partial<EmbeddingOptions>
  ) {
    const key = apiKey || process.env.OPENAI_API_KEY;
    
    if (!key) {
      throw new Error('OPENAI_API_KEY is required');
    }

    this.client = new OpenAI({ apiKey: key });
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * 向量化单个文本
   */
  async embed(text: string): Promise<EmbeddingResult> {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    try {
      const response = await this.makeEmbeddingRequest([text]);
      
      this.requestCount++;
      this.totalTokens += response.usage.total_tokens;

      return {
        embedding: response.data[0].embedding,
        tokens: response.usage.total_tokens,
        index: 0,
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to embed text');
    }
  }

  /**
   * 向量化多个文本（批量处理）
   */
  async embedBatch(texts: string[]): Promise<BatchEmbeddingResult> {
    if (!texts || texts.length === 0) {
      throw new Error('Texts array cannot be empty');
    }

    // 过滤空文本
    const validTexts = texts.filter(t => t && t.trim().length > 0);
    
    if (validTexts.length === 0) {
      throw new Error('No valid texts to embed');
    }

    const embeddings: number[][] = [];
    let totalTokens = 0;

    // 分批处理
    for (let i = 0; i < validTexts.length; i += this.options.batchSize) {
      const batch = validTexts.slice(i, i + this.options.batchSize);
      
      try {
        const response = await this.makeEmbeddingRequest(batch);
        
        // 按正确顺序添加 embeddings
        response.data.forEach(item => {
          embeddings[item.index] = item.embedding;
        });

        totalTokens += response.usage.total_tokens;
        this.requestCount++;
        this.totalTokens += response.usage.total_tokens;

      } catch (error) {
        throw this.handleError(error, `Failed to embed batch ${i / this.options.batchSize + 1}`);
      }
    }

    const costs = this.calculateCost(totalTokens);

    return {
      embeddings,
      totalTokens,
      costs,
    };
  }

  /**
   * 发送 Embedding 请求（带重试）
   */
  private async makeEmbeddingRequest(
    input: string[],
    attempt = 1
  ): Promise<OpenAI.Embeddings.CreateEmbeddingResponse> {
    try {
      return await this.client.embeddings.create({
        model: this.options.model,
        input,
        dimensions: this.options.dimensions,
      });
    } catch (error: any) {
      // Rate limit 或网络错误，重试
      if (
        attempt < this.options.retryAttempts &&
        (error.status === 429 || error.code === 'ECONNRESET')
      ) {
        const delay = this.options.retryDelay * attempt;
        console.warn(`Retrying embedding request (attempt ${attempt + 1}/${this.options.retryAttempts}) after ${delay}ms`);
        
        await this.sleep(delay);
        return this.makeEmbeddingRequest(input, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * 计算成本
   * text-embedding-3-small: $0.00002 per 1K tokens
   */
  private calculateCost(tokens: number): number {
    const COST_PER_1K_TOKENS = 0.00002;
    return (tokens / 1000) * COST_PER_1K_TOKENS;
  }

  /**
   * 估算成本（不实际调用 API）
   */
  estimateCost(texts: string[]): { tokens: number; cost: number } {
    // 粗略估算：中文 1.5 字符/token，英文 4 字符/token
    let totalChars = 0;
    let chineseChars = 0;

    for (const text of texts) {
      totalChars += text.length;
      chineseChars += (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    }

    const otherChars = totalChars - chineseChars;
    const estimatedTokens = Math.ceil(chineseChars / 1.5 + otherChars / 4);

    return {
      tokens: estimatedTokens,
      cost: this.calculateCost(estimatedTokens),
    };
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      requestCount: this.requestCount,
      totalTokens: this.totalTokens,
      totalCost: this.calculateCost(this.totalTokens),
      model: this.options.model,
      dimensions: this.options.dimensions,
    };
  }

  /**
   * 重置统计信息
   */
  resetStats() {
    this.requestCount = 0;
    this.totalTokens = 0;
  }

  /**
   * 检查 API Key 有效性
   */
  async validateApiKey(): Promise<boolean> {
    try {
      await this.embed('test');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 错误处理
   */
  private handleError(error: any, message: string): Error {
    if (error instanceof OpenAI.APIError) {
      return new Error(`${message}: ${error.message} (Status: ${error.status})`);
    }
    return new Error(`${message}: ${error.message || 'Unknown error'}`);
  }

  /**
   * Sleep 工具函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 便捷函数：快速向量化单个文本
 */
export async function embedText(text: string): Promise<number[]> {
  const service = new EmbeddingService();
  const result = await service.embed(text);
  return result.embedding;
}

/**
 * 便捷函数：快速向量化多个文本
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  const service = new EmbeddingService();
  const result = await service.embedBatch(texts);
  return result.embeddings;
}

/**
 * 单例模式：共享 EmbeddingService 实例
 */
let sharedInstance: EmbeddingService | null = null;

export function getSharedEmbeddingService(
  apiKey?: string,
  options?: Partial<EmbeddingOptions>
): EmbeddingService {
  if (!sharedInstance) {
    sharedInstance = new EmbeddingService(apiKey, options);
  }
  return sharedInstance;
}

export function resetSharedEmbeddingService() {
  sharedInstance = null;
}
