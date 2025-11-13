/**
 * 向量搜索服务 - VectorSearchService
 *
 * 使用 PostgreSQL pgvector 进行语义相似度搜索
 */

import { db } from '@/db';
import { knowledgeDocuments } from '@/db/schema-knowledge';
import { sql } from 'drizzle-orm';
import { getSharedEmbeddingService } from './embedding-service';

export type DocumentCategoryType = 'bazi' | 'fengshui' | 'faq' | 'case';

export interface SearchOptions {
  query: string; // 搜索查询
  topK?: number; // 返回结果数，默认 5
  threshold?: number; // 相似度阈值 (0-1)，默认 0.7
  category?: DocumentCategoryType; // 文档类别过滤
  minSimilarity?: number; // 最小相似度，默认 0.6
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  category: DocumentCategoryType;
  source: string;
  similarity: number; // 相似度分数 (0-1)
  chunkIndex: number | null;
  metadata?: Record<string, any>;
}

export interface SearchByEmbeddingOptions {
  embedding: number[];
  topK?: number;
  threshold?: number;
  category?: DocumentCategoryType;
  minSimilarity?: number;
}

const DEFAULT_TOP_K = 5;
const DEFAULT_THRESHOLD = 0.7;
const DEFAULT_MIN_SIMILARITY = 0.6;

export class VectorSearchService {
  /**
   * 语义搜索（主入口）
   * 1. 向量化查询
   * 2. 执行相似度搜索
   */
  async search(options: SearchOptions): Promise<SearchResult[]> {
    const {
      query,
      topK = DEFAULT_TOP_K,
      threshold = DEFAULT_THRESHOLD,
      category,
      minSimilarity = DEFAULT_MIN_SIMILARITY,
    } = options;

    if (!query || query.trim().length === 0) {
      throw new Error('Search query cannot be empty');
    }

    // 1. 向量化查询
    const embeddingService = getSharedEmbeddingService();
    const result = await embeddingService.embed(query);
    const queryEmbedding = result.embedding;

    // 2. 执行向量搜索
    return this.searchByEmbedding({
      embedding: queryEmbedding,
      topK,
      threshold,
      category,
      minSimilarity,
    });
  }

  /**
   * 使用现有向量进行搜索
   */
  async searchByEmbedding(
    options: SearchByEmbeddingOptions
  ): Promise<SearchResult[]> {
    const {
      embedding,
      topK = DEFAULT_TOP_K,
      threshold = DEFAULT_THRESHOLD,
      category,
      minSimilarity = DEFAULT_MIN_SIMILARITY,
    } = options;

    if (!embedding || embedding.length === 0) {
      throw new Error('Embedding vector cannot be empty');
    }

    try {
      // 使用 PostgreSQL 函数进行向量搜索
      const embeddingString = `[${embedding.join(',')}]`;

      let query = sql`
        SELECT 
          id,
          title,
          content,
          category,
          source,
          chunk_index,
          metadata,
          1 - (embedding <=> ${embeddingString}::vector) AS similarity
        FROM ${knowledgeDocuments}
        WHERE 1 - (embedding <=> ${embeddingString}::vector) >= ${minSimilarity}
      `;

      // 添加类别过滤
      if (category) {
        query = sql`${query} AND category = ${category}`;
      }

      // 排序和限制
      query = sql`
        ${query}
        ORDER BY embedding <=> ${embeddingString}::vector
        LIMIT ${topK}
      `;

      const results = await db.execute(query);

      // 转换为 SearchResult 格式
      return (results.rows as any[])
        .filter((row) => row.similarity >= threshold)
        .map((row) => ({
          id: row.id,
          title: row.title,
          content: row.content,
          category: row.category as DocumentCategoryType,
          source: row.source,
          similarity: Number.parseFloat(row.similarity),
          chunkIndex: row.chunk_index,
          metadata: row.metadata,
        }));
    } catch (error: any) {
      throw new Error(`Vector search failed: ${error.message}`);
    }
  }

  /**
   * 按 ID 批量获取文档
   */
  async getDocumentsByIds(ids: string[]): Promise<SearchResult[]> {
    if (!ids || ids.length === 0) {
      return [];
    }

    try {
      const results = await db
        .select({
          id: knowledgeDocuments.id,
          title: knowledgeDocuments.title,
          content: knowledgeDocuments.content,
          category: knowledgeDocuments.category,
          source: knowledgeDocuments.source,
          chunkIndex: knowledgeDocuments.chunkIndex,
          metadata: knowledgeDocuments.metadata,
        })
        .from(knowledgeDocuments)
        .where(sql`${knowledgeDocuments.id} = ANY(${ids})`);

      return results.map((row) => ({
        id: row.id,
        title: row.title,
        content: row.content,
        category: row.category as DocumentCategoryType,
        source: row.source,
        similarity: 1.0, // 直接查询，相似度为 1
        chunkIndex: row.chunkIndex,
        metadata: row.metadata as Record<string, any>,
      }));
    } catch (error: any) {
      throw new Error(`Failed to get documents by IDs: ${error.message}`);
    }
  }

  /**
   * 获取文档统计信息
   */
  async getStats(): Promise<{
    totalDocuments: number;
    byCategory: Record<DocumentCategoryType, number>;
  }> {
    try {
      const results = await db
        .select({
          category: knowledgeDocuments.category,
          count: sql<number>`count(*)`,
        })
        .from(knowledgeDocuments)
        .groupBy(knowledgeDocuments.category);

      const byCategory = results.reduce(
        (acc, row) => {
          acc[row.category as DocumentCategoryType] = Number(row.count);
          return acc;
        },
        {} as Record<DocumentCategoryType, number>
      );

      const totalDocuments = Object.values(byCategory).reduce(
        (sum, count) => sum + count,
        0
      );

      return {
        totalDocuments,
        byCategory,
      };
    } catch (error: any) {
      throw new Error(`Failed to get document stats: ${error.message}`);
    }
  }

  /**
   * 健康检查：测试向量搜索是否正常工作
   */
  async healthCheck(): Promise<boolean> {
    try {
      // 测试向量搜索
      const testEmbedding = new Array(1536).fill(0);
      testEmbedding[0] = 1; // 非零向量

      const results = await this.searchByEmbedding({
        embedding: testEmbedding,
        topK: 1,
        minSimilarity: 0,
      });

      return true;
    } catch (error) {
      console.error('Vector search health check failed:', error);
      return false;
    }
  }
}

/**
 * 便捷函数：快速搜索
 */
export async function quickSearch(
  query: string,
  topK = 5,
  category?: DocumentCategoryType
): Promise<SearchResult[]> {
  const service = new VectorSearchService();
  return service.search({ query, topK, category });
}

/**
 * 单例模式：共享 VectorSearchService 实例
 */
let sharedInstance: VectorSearchService | null = null;

export function getSharedVectorSearchService(): VectorSearchService {
  if (!sharedInstance) {
    sharedInstance = new VectorSearchService();
  }
  return sharedInstance;
}

export function resetSharedVectorSearchService() {
  sharedInstance = null;
}
