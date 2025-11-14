/**
 * RAG 生成器 - RAGGenerator
 *
 * 检索增强生成 (Retrieval-Augmented Generation)
 * 整合向量搜索和 LLM 生成
 */

import { getDb } from '@/db';
import { ragRetrievalLogs } from '@/db/schema-knowledge';
import OpenAI from 'openai';
import { getSharedEmbeddingService } from './embedding-service';
import {
  type DocumentCategoryType,
  type SearchResult,
  getSharedVectorSearchService,
} from './vector-search';

export interface RAGOptions {
  query: string; // 用户问题
  userId: string; // 用户 ID
  sessionId?: string; // 会话 ID（可选）
  model?: string; // LLM 模型，默认 'deepseek-chat'
  topK?: number; // 检索文档数，默认 5
  category?: DocumentCategoryType; // 文档类别过滤
  temperature?: number; // 生成温度，默认 0.7
  maxTokens?: number; // 最大 token 数，默认 1000
  enableRAG?: boolean; // 是否启用 RAG，默认 true
}

export interface RAGResponse {
  answer: string; // AI 回答
  references: SearchResult[]; // 引用的文档
  retrievalTimeMs: number; // 检索耗时
  generationTimeMs: number; // 生成耗时
  totalTokens: number; // 总 token 数
  modelUsed: string; // 使用的模型
  ragEnabled: boolean; // 是否启用了 RAG
}

const DEFAULT_MODEL = 'deepseek-chat';
const DEFAULT_TOP_K = 5;
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 1000;

export class RAGGenerator {
  private llmClient: OpenAI;

  constructor(apiKey?: string) {
    const key =
      apiKey || process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;

    if (!key) {
      throw new Error('DEEPSEEK_API_KEY or OPENAI_API_KEY is required');
    }

    // DeepSeek 使用 OpenAI 兼容的 API
    this.llmClient = new OpenAI({
      apiKey: key,
      baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
    });
  }

  /**
   * RAG 增强生成（主入口）
   */
  async generate(options: RAGOptions): Promise<RAGResponse> {
    const {
      query,
      userId,
      sessionId,
      model = DEFAULT_MODEL,
      topK = DEFAULT_TOP_K,
      category,
      temperature = DEFAULT_TEMPERATURE,
      maxTokens = DEFAULT_MAX_TOKENS,
      enableRAG = true,
    } = options;

    if (!query || query.trim().length === 0) {
      throw new Error('Query cannot be empty');
    }

    // 如果禁用 RAG，直接调用 LLM
    if (!enableRAG) {
      return this.generateWithoutRAG(query, model, temperature, maxTokens);
    }

    const startTime = Date.now();

    // 1. 检索相关文档
    const retrievalStartTime = Date.now();
    const vectorSearch = getSharedVectorSearchService();
    const references = await vectorSearch.search({
      query,
      topK,
      category,
    });
    const retrievalTimeMs = Date.now() - retrievalStartTime;

    // 2. 生成 RAG 回答
    const generationStartTime = Date.now();
    let answer: string;
    let totalTokens = 0;

    if (references.length > 0) {
      // 有相关文档，使用 RAG
      const prompt = this.buildRAGPrompt(query, references);
      const response = await this.callLLM(
        prompt,
        model,
        temperature,
        maxTokens
      );
      answer = response.answer;
      totalTokens = response.tokens;
    } else {
      // 没有相关文档，直接回答
      const response = await this.callLLM(query, model, temperature, maxTokens);
      answer = `[知识库中未找到相关内容]\n\n${response.answer}`;
      totalTokens = response.tokens;
    }

    const generationTimeMs = Date.now() - generationStartTime;

    // 3. 记录检索日志
    await this.logRetrieval({
      userId,
      sessionId,
      query,
      retrievedDocIds: references.map((r) => r.id),
      topK,
      similarityScores: references.map((r) => r.similarity),
      generatedResponse: answer,
      model,
      retrievalTimeMs,
      generationTimeMs,
      totalTokens,
    });

    return {
      answer,
      references,
      retrievalTimeMs,
      generationTimeMs,
      totalTokens,
      modelUsed: model,
      ragEnabled: true,
    };
  }

  /**
   * 不使用 RAG 的生成（Fallback）
   */
  async generateWithoutRAG(
    query: string,
    model = DEFAULT_MODEL,
    temperature = DEFAULT_TEMPERATURE,
    maxTokens = DEFAULT_MAX_TOKENS
  ): Promise<RAGResponse> {
    const startTime = Date.now();

    const response = await this.callLLM(query, model, temperature, maxTokens);

    const generationTimeMs = Date.now() - startTime;

    return {
      answer: response.answer,
      references: [],
      retrievalTimeMs: 0,
      generationTimeMs,
      totalTokens: response.tokens,
      modelUsed: model,
      ragEnabled: false,
    };
  }

  /**
   * 构建 RAG Prompt
   */
  private buildRAGPrompt(query: string, references: SearchResult[]): string {
    const contextParts = references.map((ref, index) => {
      return `${index + 1}. [来源: ${ref.source}]\n标题: ${ref.title}\n内容: ${ref.content}\n(相似度: ${(ref.similarity * 100).toFixed(1)}%)`;
    });

    const context = contextParts.join('\n\n');

    return `你是一位专业的命理学和风水学顾问。基于以下知识库内容回答用户问题。

知识库内容：
${context}

用户问题：${query}

回答要求：
1. 优先使用知识库内容回答，明确引用来源
2. 如果知识库内容不足以完全回答，可以补充你的专业知识，但要说明
3. 保持专业、客观、易懂的语言风格
4. 如果知识库内容与问题完全不相关，诚实说明并给出通用建议

请回答：`;
  }

  /**
   * 调用 LLM API
   */
  private async callLLM(
    prompt: string,
    model: string,
    temperature: number,
    maxTokens: number
  ): Promise<{ answer: string; tokens: number }> {
    try {
      const response = await this.llmClient.chat.completions.create({
        model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature,
        max_tokens: maxTokens,
      });

      const answer =
        response.choices[0]?.message?.content || '抱歉，生成回答失败。';
      const tokens = response.usage?.total_tokens || 0;

      return { answer, tokens };
    } catch (error: any) {
      console.error('LLM API call failed:', error);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }

  /**
   * 记录检索日志
   */
  private async logRetrieval(data: {
    userId: string;
    sessionId?: string;
    query: string;
    retrievedDocIds: string[];
    topK: number;
    similarityScores: number[];
    generatedResponse: string;
    model: string;
    retrievalTimeMs: number;
    generationTimeMs: number;
    totalTokens: number;
  }): Promise<void> {
    try {
      // 向量化查询用于日志
      const embeddingService = getSharedEmbeddingService();
      const result = await embeddingService.embed(data.query);

      const db = await getDb();
      await db.insert(ragRetrievalLogs).values({
        userId: data.userId,
        sessionId: data.sessionId,
        query: data.query,
        queryEmbedding: JSON.stringify(result.embedding), // 存储为 JSON 字符串
        retrievedDocIds: data.retrievedDocIds,
        topK: data.topK,
        similarityScores: data.similarityScores,
        generatedResponse: data.generatedResponse,
        model: data.model,
        retrievalTimeMs: data.retrievalTimeMs,
        generationTimeMs: data.generationTimeMs,
        totalTokens: data.totalTokens,
        totalTimeMs: data.retrievalTimeMs + data.generationTimeMs,
      });
    } catch (error) {
      // 日志记录失败不影响主流程
      console.error('Failed to log retrieval:', error);
    }
  }
}

/**
 * 便捷函数：快速 RAG 生成
 */
export async function quickRAG(
  query: string,
  userId: string,
  options?: Partial<RAGOptions>
): Promise<RAGResponse> {
  const generator = new RAGGenerator();
  return generator.generate({
    query,
    userId,
    ...options,
  });
}

/**
 * 单例模式：共享 RAGGenerator 实例
 */
let sharedInstance: RAGGenerator | null = null;

export function getSharedRAGGenerator(apiKey?: string): RAGGenerator {
  if (!sharedInstance) {
    sharedInstance = new RAGGenerator(apiKey);
  }
  return sharedInstance;
}

export function resetSharedRAGGenerator() {
  sharedInstance = null;
}
