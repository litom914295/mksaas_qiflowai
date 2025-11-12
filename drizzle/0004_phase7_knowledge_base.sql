-- Phase 7: RAG 知识库表
-- 用于存储向量化的知识文档和检索历史

-- ===========================================
-- 1. 启用 pgvector 扩展
-- ===========================================
CREATE EXTENSION IF NOT EXISTS vector;

-- ===========================================
-- 2. knowledge_documents - 知识库文档表
-- ===========================================
CREATE TABLE IF NOT EXISTS "knowledge_documents" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 文档信息
  "title" text NOT NULL,
  "category" text NOT NULL,  -- 'bazi' | 'fengshui' | 'faq' | 'case'
  "source" text NOT NULL,    -- 来源书籍/网站名称
  "content" text NOT NULL,
  
  -- 元数据
  "metadata" jsonb DEFAULT '{}',  -- { author, year, page, tags, language }
  
  -- 向量 (1536 维 - OpenAI text-embedding-3-small)
  "embedding" vector(1536),
  
  -- 分块信息
  "chunk_index" integer DEFAULT 0,  -- 分块索引 (0 表示完整文档)
  "parent_doc_id" uuid REFERENCES "knowledge_documents"("id") ON DELETE CASCADE,  -- 父文档 ID
  
  -- 统计数据
  "view_count" integer DEFAULT 0,
  "reference_count" integer DEFAULT 0,
  "avg_similarity" real,  -- 平均相似度 (用于质量评估)
  
  -- 时间戳
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- 索引加速查询
CREATE INDEX IF NOT EXISTS "knowledge_documents_category_idx" ON "knowledge_documents"("category");
CREATE INDEX IF NOT EXISTS "knowledge_documents_source_idx" ON "knowledge_documents"("source");
CREATE INDEX IF NOT EXISTS "knowledge_documents_parent_doc_idx" ON "knowledge_documents"("parent_doc_id");
CREATE INDEX IF NOT EXISTS "knowledge_documents_created_at_idx" ON "knowledge_documents"("created_at");

-- 向量相似度搜索索引 (HNSW - Hierarchical Navigable Small World)
-- HNSW 是一种近似最近邻搜索算法，性能远超暴力搜索
-- vector_cosine_ops: 使用余弦相似度作为距离度量
CREATE INDEX IF NOT EXISTS "knowledge_documents_embedding_idx" ON "knowledge_documents" 
USING hnsw ("embedding" vector_cosine_ops);

-- 添加注释
COMMENT ON TABLE "knowledge_documents" IS 'RAG 知识库文档表，存储向量化的八字风水知识';
COMMENT ON COLUMN "knowledge_documents"."category" IS '文档分类: bazi(八字) / fengshui(风水) / faq(常见问题) / case(案例)';
COMMENT ON COLUMN "knowledge_documents"."embedding" IS 'OpenAI text-embedding-3-small 生成的 1536 维向量';
COMMENT ON COLUMN "knowledge_documents"."chunk_index" IS '分块索引，0 表示完整文档，1+ 表示第 N 个分块';
COMMENT ON COLUMN "knowledge_documents"."parent_doc_id" IS '父文档 ID，用于关联分块到原始文档';

-- ===========================================
-- 3. rag_retrieval_logs - RAG 检索历史表
-- ===========================================
CREATE TABLE IF NOT EXISTS "rag_retrieval_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 查询信息
  "user_id" text NOT NULL,
  "session_id" uuid,  -- 关联到 chat_sessions
  "query" text NOT NULL,
  "query_embedding" vector(1536),
  
  -- 检索结果
  "retrieved_doc_ids" jsonb NOT NULL,  -- UUID[]
  "top_k" integer NOT NULL DEFAULT 3,
  "similarity_scores" jsonb NOT NULL,  -- number[]
  
  -- 生成结果
  "generated_response" text,
  "model" text NOT NULL,  -- 'deepseek-chat' | 'gpt-4' | ...
  
  -- 性能指标
  "retrieval_time_ms" integer,  -- 检索耗时 (毫秒)
  "generation_time_ms" integer,  -- 生成耗时 (毫秒)
  "total_tokens" integer,  -- 总 Token 数
  
  -- 质量评估
  "user_feedback" text,  -- 'helpful' | 'not_helpful' | null
  "feedback_note" text,
  
  -- 元数据
  "metadata" jsonb DEFAULT '{}',
  
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- 索引加速查询
CREATE INDEX IF NOT EXISTS "rag_retrieval_logs_user_idx" ON "rag_retrieval_logs"("user_id");
CREATE INDEX IF NOT EXISTS "rag_retrieval_logs_session_idx" ON "rag_retrieval_logs"("session_id");
CREATE INDEX IF NOT EXISTS "rag_retrieval_logs_created_at_idx" ON "rag_retrieval_logs"("created_at");
CREATE INDEX IF NOT EXISTS "rag_retrieval_logs_model_idx" ON "rag_retrieval_logs"("model");

-- 添加注释
COMMENT ON TABLE "rag_retrieval_logs" IS 'RAG 检索历史表，记录每次知识库检索和生成';
COMMENT ON COLUMN "rag_retrieval_logs"."query_embedding" IS '查询文本的向量表示';
COMMENT ON COLUMN "rag_retrieval_logs"."retrieved_doc_ids" IS '检索到的文档 ID 列表 (JSON 数组)';
COMMENT ON COLUMN "rag_retrieval_logs"."similarity_scores" IS '每个文档的相似度分数 (JSON 数组)';
COMMENT ON COLUMN "rag_retrieval_logs"."user_feedback" IS '用户反馈: helpful / not_helpful';

-- ===========================================
-- 4. 辅助函数 - 余弦相似度搜索
-- ===========================================
-- 创建便捷函数用于相似度搜索
CREATE OR REPLACE FUNCTION search_knowledge_documents(
  query_embedding vector(1536),
  match_threshold real DEFAULT 0.7,
  match_count integer DEFAULT 5,
  filter_category text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  category text,
  source text,
  similarity real
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kd.id,
    kd.title,
    kd.content,
    kd.category,
    kd.source,
    1 - (kd.embedding <=> query_embedding) AS similarity
  FROM knowledge_documents kd
  WHERE 
    (filter_category IS NULL OR kd.category = filter_category)
    AND (1 - (kd.embedding <=> query_embedding)) >= match_threshold
  ORDER BY kd.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION search_knowledge_documents IS 'RAG 向量相似度搜索函数，支持分类过滤和相似度阈值';
