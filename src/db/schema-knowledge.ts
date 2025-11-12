/**
 * Phase 7 - RAG 知识库 Schema
 * 
 * 包含:
 * - knowledge_documents: 知识库文档表
 * - rag_retrieval_logs: RAG 检索历史表
 */

import { 
  pgTable, 
  uuid, 
  text, 
  timestamp, 
  jsonb, 
  integer, 
  index,
  real,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ==========================================
// knowledge_documents - 知识库文档表
// ==========================================
export const knowledgeDocuments = pgTable(
  "knowledge_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    
    // 文档信息
    title: text("title").notNull(),
    category: text("category").notNull(), // 'bazi' | 'fengshui' | 'faq' | 'case'
    source: text("source").notNull(),
    content: text("content").notNull(),
    
    // 元数据
    metadata: jsonb("metadata").$type<{
      author?: string;
      year?: number;
      page?: number;
      tags?: string[];
      language?: string;
      [key: string]: unknown;
    }>().default({}),
    
    // 向量 (1536 维 - OpenAI text-embedding-3-small)
    // 注意: pgvector 类型在 drizzle-orm 中需要特殊处理
    embedding: text("embedding"),  // 存储为 text，实际是 vector(1536)
    
    // 分块信息
    chunkIndex: integer("chunk_index").default(0),
    parentDocId: uuid("parent_doc_id").references((): any => knowledgeDocuments.id, {
      onDelete: "cascade",
    }),
    
    // 统计数据
    viewCount: integer("view_count").default(0),
    referenceCount: integer("reference_count").default(0),
    avgSimilarity: real("avg_similarity"),
    
    // 时间戳
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    categoryIdx: index("knowledge_documents_category_idx").on(table.category),
    sourceIdx: index("knowledge_documents_source_idx").on(table.source),
    parentDocIdx: index("knowledge_documents_parent_doc_idx").on(table.parentDocId),
    createdAtIdx: index("knowledge_documents_created_at_idx").on(table.createdAt),
    // HNSW embedding index 在 SQL migration 中创建
  })
);

// 类型定义
export type KnowledgeDocument = typeof knowledgeDocuments.$inferSelect;
export type NewKnowledgeDocument = typeof knowledgeDocuments.$inferInsert;

// ==========================================
// rag_retrieval_logs - RAG 检索历史表
// ==========================================
export const ragRetrievalLogs = pgTable(
  "rag_retrieval_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    
    // 查询信息
    userId: text("user_id").notNull(),
    sessionId: uuid("session_id"),  // 关联到 chat_sessions
    query: text("query").notNull(),
    queryEmbedding: text("query_embedding"),  // 存储为 text，实际是 vector(1536)
    
    // 检索结果
    retrievedDocIds: jsonb("retrieved_doc_ids").$type<string[]>().notNull(),
    topK: integer("top_k").notNull().default(3),
    similarityScores: jsonb("similarity_scores").$type<number[]>().notNull(),
    
    // 生成结果
    generatedResponse: text("generated_response"),
    model: text("model").notNull(),
    
    // 性能指标
    retrievalTimeMs: integer("retrieval_time_ms"),
    generationTimeMs: integer("generation_time_ms"),
    totalTokens: integer("total_tokens"),
    
    // 质量评估
    userFeedback: text("user_feedback"), // 'helpful' | 'not_helpful' | null
    feedbackNote: text("feedback_note"),
    
    // 元数据
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("rag_retrieval_logs_user_idx").on(table.userId),
    sessionIdx: index("rag_retrieval_logs_session_idx").on(table.sessionId),
    createdAtIdx: index("rag_retrieval_logs_created_at_idx").on(table.createdAt),
    modelIdx: index("rag_retrieval_logs_model_idx").on(table.model),
  })
);

// 类型定义
export type RagRetrievalLog = typeof ragRetrievalLogs.$inferSelect;
export type NewRagRetrievalLog = typeof ragRetrievalLogs.$inferInsert;

// ==========================================
// 文档分类枚举
// ==========================================
export const DocumentCategory = {
  BAZI: "bazi" as const,
  FENGSHUI: "fengshui" as const,
  FAQ: "faq" as const,
  CASE: "case" as const,
};

export type DocumentCategoryType = typeof DocumentCategory[keyof typeof DocumentCategory];

// ==========================================
// 用户反馈枚举
// ==========================================
export const UserFeedback = {
  HELPFUL: "helpful" as const,
  NOT_HELPFUL: "not_helpful" as const,
};

export type UserFeedbackType = typeof UserFeedback[keyof typeof UserFeedback];
