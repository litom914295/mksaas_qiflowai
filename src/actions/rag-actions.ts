'use server';

import { getDb } from '@/db';
import { user } from '@/db/schema';
import type { User } from '@/lib/auth-types';
import {
  type DocumentCategoryType,
  RAGGenerator,
  type RAGResponse,
  type SearchResult,
  quickRAG,
} from '@/lib/rag';
import { rateLimitedActionClient, userActionClient } from '@/lib/safe-action';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// RAG Chat Schema
const ragChatSchema = z.object({
  query: z.string().min(1, '查询内容不能为空').max(5000, '查询内容过长'),
  sessionId: z.string().optional(),
  enableRAG: z.boolean().optional().default(true),
  category: z.string().optional(),
  topK: z.number().min(1).max(20).optional().default(5),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  maxTokens: z.number().min(100).max(4000).optional().default(1000),
});

/**
 * RAG 聊天 Action
 * 支持知识增强的 AI 对话
 * Rate limited: 60 requests/minute (AI action)
 */
export const ragChatAction = rateLimitedActionClient
  .schema(ragChatSchema)
  .action(async ({ parsedInput, ctx }) => {
    const currentUser = (ctx as { user: User }).user;
    const {
      query,
      sessionId,
      enableRAG,
      category,
      topK,
      temperature,
      maxTokens,
    } = parsedInput;

    try {
      const db = await getDb();

      // 检查用户是否存在
      const [userRecord] = await db
        .select()
        .from(user)
        .where(eq(user.id, currentUser.id))
        .limit(1);

      if (!userRecord) {
        return {
          success: false,
          error: '用户不存在',
        };
      }

      // 可选：检查积分
      // if (userRecord.credits < CHAT_COST) {
      //   return { success: false, error: '积分不足' };
      // }

      // 执行 RAG 生成
      let response: RAGResponse;

      if (enableRAG) {
        const generator = new RAGGenerator();
        response = await generator.generate({
          query,
          userId: currentUser.id,
          sessionId,
          topK,
          category: category as DocumentCategoryType | undefined,
          temperature,
          maxTokens,
          enableRAG: true,
        });
      } else {
        const generator = new RAGGenerator();
        response = await generator.generateWithoutRAG(
          query,
          'deepseek-chat',
          temperature,
          maxTokens
        );
      }

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
      console.error('[RAG Chat Error]', error);

      // 安全的错误处理 - 不泄露敏感信息
      if (error instanceof Error) {
        // 特定错误返回用户友好消息
        if (error.message.includes('Insufficient credits')) {
          return { success: false, error: '积分不足，请充值后重试' };
        }
        if (error.message.includes('rate limit')) {
          return { success: false, error: '请求过于频繁，请稍后重试' };
        }
      }

      // 其他错误返回通用消息
      return {
        success: false,
        error: '生成失败，请稍后重试',
      };
    }
  });

// Quick RAG Schema
const quickRAGSchema = z.object({
  query: z.string().min(1, '查询内容不能为空').max(2000, '查询内容过长'),
  category: z.string().optional(),
  topK: z.number().min(1).max(20).optional().default(5),
});

/**
 * 快速 RAG 查询（无需会话）
 * Rate limited: 60 requests/minute (AI action)
 */
export const quickRAGAction = rateLimitedActionClient
  .schema(quickRAGSchema)
  .action(async ({ parsedInput, ctx }) => {
    const currentUser = (ctx as { user: User }).user;
    const { query, category, topK } = parsedInput;

    try {
      // 执行快速 RAG
      const response = await quickRAG(query, currentUser.id, {
        topK,
        category: category as DocumentCategoryType | undefined,
      });

      return {
        success: true,
        answer: response.answer,
        references: response.references,
      };
    } catch (error) {
      console.error('[Quick RAG Error]', error);

      // 安全的错误处理
      if (error instanceof Error) {
        if (error.message.includes('rate limit')) {
          return { success: false, error: '请求过于频繁，请稍后重试' };
        }
      }

      return {
        success: false,
        error: '查询失败，请稍后重试',
      };
    }
  });

/**
 * 获取知识库统计信息
 */
export const getKnowledgeStatsAction = userActionClient.action(async () => {
  try {
    // 获取统计
    const { VectorSearchService } = await import('@/lib/rag');
    const service = new VectorSearchService();
    const stats = await service.getStats();

    return {
      success: true,
      stats,
    };
  } catch (error) {
    console.error('[Knowledge Stats Error]', error);
    return {
      success: false,
      error: '获取统计失败，请稍后重试',
    };
  }
});

// Search Knowledge Schema
const searchKnowledgeSchema = z.object({
  query: z.string().min(1, '搜索内容不能为空').max(500, '搜索内容过长'),
  category: z.string().optional(),
  topK: z.number().min(1).max(20).optional().default(5),
  threshold: z.number().min(0).max(1).optional().default(0.7),
});

/**
 * 搜索知识库（仅返回相关文档，不生成回答）
 */
export const searchKnowledgeAction = userActionClient
  .schema(searchKnowledgeSchema)
  .action(async ({ parsedInput }) => {
    const { query, category, topK, threshold } = parsedInput;

    try {
      // 执行搜索
      const { VectorSearchService } = await import('@/lib/rag');
      const service = new VectorSearchService();
      const results = await service.search({
        query,
        topK,
        threshold,
        category: category as DocumentCategoryType | undefined,
      });

      return {
        success: true,
        results,
      };
    } catch (error) {
      console.error('[Search Knowledge Error]', error);
      return {
        success: false,
        error: '搜索失败，请稍后重试',
      };
    }
  });
