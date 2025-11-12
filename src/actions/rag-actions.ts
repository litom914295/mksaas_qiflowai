'use server';

import { db } from '@/db';
import { user } from '@/db/schema';
import { auth } from '@/lib/auth';
import {
  type DocumentCategoryType,
  RAGGenerator,
  type RAGOptions,
  type RAGResponse,
  type SearchResult,
  quickRAG,
} from '@/lib/rag';
import { eq } from 'drizzle-orm';

/**
 * RAG 聊天 Action
 * 支持知识增强的 AI 对话
 */
export async function ragChatAction({
  query,
  sessionId,
  enableRAG = true,
  category,
  topK = 5,
  temperature = 0.7,
  maxTokens = 1000,
}: {
  query: string;
  sessionId?: string;
  enableRAG?: boolean;
  category?: DocumentCategoryType;
  topK?: number;
  temperature?: number;
  maxTokens?: number;
}): Promise<{
  success: boolean;
  answer?: string;
  references?: SearchResult[];
  error?: string;
  metrics?: {
    retrievalTimeMs: number;
    generationTimeMs: number;
    totalTokens: number;
    modelUsed: string;
    ragEnabled: boolean;
  };
}> {
  try {
    // 1. 验证用户身份
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: '请先登录',
      };
    }

    const userId = session.user.id;

    // 2. 检查用户积分（可选）
    const [currentUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!currentUser) {
      return {
        success: false,
        error: '用户不存在',
      };
    }

    // 可选：检查积分
    // if (currentUser.credits < CHAT_COST) {
    //   return {
    //     success: false,
    //     error: '积分不足',
    //   };
    // }

    // 3. 执行 RAG 生成
    let response: RAGResponse;

    if (enableRAG) {
      // RAG 增强生成
      const generator = new RAGGenerator();
      response = await generator.generate({
        query,
        userId,
        sessionId,
        topK,
        category,
        temperature,
        maxTokens,
        enableRAG: true,
      });
    } else {
      // 普通生成（不使用 RAG）
      const generator = new RAGGenerator();
      response = await generator.generateWithoutRAG(
        query,
        'deepseek-chat',
        temperature,
        maxTokens
      );
    }

    // 4. 返回结果
    return {
      success: true,
      answer: response.answer,
      references: response.references,
      metrics: {
        retrievalTimeMs: response.retrievalTimeMs,
        generationTimeMs: response.generationTimeMs,
        totalTokens: response.totalTokens,
        modelUsed: response.modelUsed,
        ragEnabled: response.ragEnabled,
      },
    };
  } catch (error) {
    console.error('RAG Chat Action Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '生成失败',
    };
  }
}

/**
 * 快速 RAG 查询（无需会话）
 */
export async function quickRAGAction({
  query,
  category,
  topK = 5,
}: {
  query: string;
  category?: DocumentCategoryType;
  topK?: number;
}): Promise<{
  success: boolean;
  answer?: string;
  references?: SearchResult[];
  error?: string;
}> {
  try {
    // 验证用户
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: '请先登录',
      };
    }

    // 执行快速 RAG
    const response = await quickRAG(query, session.user.id, { topK, category });

    return {
      success: true,
      answer: response.answer,
      references: response.references,
    };
  } catch (error) {
    console.error('Quick RAG Action Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '查询失败',
    };
  }
}

/**
 * 获取知识库统计信息
 */
export async function getKnowledgeStatsAction(): Promise<{
  success: boolean;
  stats?: {
    totalDocuments: number;
    byCategory: Record<DocumentCategoryType, number>;
  };
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: '请先登录',
      };
    }

    // 获取统计
    const { VectorSearchService } = await import('@/lib/rag');
    const service = new VectorSearchService();
    const stats = await service.getStats();

    return {
      success: true,
      stats,
    };
  } catch (error) {
    console.error('Get Knowledge Stats Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取统计失败',
    };
  }
}

/**
 * 搜索知识库（仅返回相关文档，不生成回答）
 */
export async function searchKnowledgeAction({
  query,
  category,
  topK = 5,
  threshold = 0.7,
}: {
  query: string;
  category?: DocumentCategoryType;
  topK?: number;
  threshold?: number;
}): Promise<{
  success: boolean;
  results?: SearchResult[];
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: '请先登录',
      };
    }

    // 执行搜索
    const { VectorSearchService } = await import('@/lib/rag');
    const service = new VectorSearchService();
    const results = await service.search({
      query,
      topK,
      threshold,
      category,
    });

    return {
      success: true,
      results,
    };
  } catch (error) {
    console.error('Search Knowledge Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '搜索失败',
    };
  }
}
