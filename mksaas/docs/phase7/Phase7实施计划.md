# Phase 7 实施计划 - RAG 知识库集成

**目标**: 通过 RAG (Retrieval-Augmented Generation) 技术增强 AI 回答质量  
**预计耗时**: 12 小时  
**优先级**: 中高

---

## 🎯 改造目标

### 1. 知识库体系
- 📚 八字经典文献 (滴天髓、三命通会、渊海子平)
- 🏠 风水经典文献 (宅经、阳宅三要、玄空飞星)
- 🔮 现代应用案例
- 📖 FAQ 常见问题

### 2. 技术架构
- 🔍 向量化引擎 (OpenAI Embeddings)
- 💾 向量数据库 (Supabase pgvector)
- 🔎 语义检索 (Similarity Search)
- 🤖 RAG 增强生成
- 📎 知识引用展示

### 3. 性能目标
- 检索延迟: < 200ms
- 召回率: > 80%
- 准确率: > 90%
- 单次成本: < $0.02

---

## 📋 实施步骤

### Step 1: 数据库 Schema (1 小时)

#### 1.1 创建向量表
**文件**: `drizzle/0004_phase7_knowledge_base.sql`

```sql
-- 启用 pgvector 扩展
CREATE EXTENSION IF NOT EXISTS vector;

-- 知识库文档表
CREATE TABLE knowledge_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 文档信息
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- 'bazi' | 'fengshui' | 'faq' | 'case'
  source TEXT NOT NULL, -- 来源书籍/网站
  content TEXT NOT NULL,
  
  -- 元数据
  metadata JSONB DEFAULT '{}',
  
  -- 向量 (1536 维 - OpenAI text-embedding-3-small)
  embedding vector(1536),
  
  -- 统计
  chunk_index INTEGER DEFAULT 0, -- 分块索引
  parent_doc_id UUID REFERENCES knowledge_documents(id), -- 父文档 ID (用于分块)
  view_count INTEGER DEFAULT 0,
  reference_count INTEGER DEFAULT 0,
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 索引
CREATE INDEX knowledge_documents_category_idx ON knowledge_documents(category);
CREATE INDEX knowledge_documents_source_idx ON knowledge_documents(source);
CREATE INDEX knowledge_documents_parent_doc_idx ON knowledge_documents(parent_doc_id);

-- 向量相似度搜索索引 (HNSW)
CREATE INDEX knowledge_documents_embedding_idx ON knowledge_documents 
USING hnsw (embedding vector_cosine_ops);

-- RAG 检索历史表
CREATE TABLE rag_retrieval_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 查询信息
  user_id TEXT NOT NULL,
  session_id UUID,
  query TEXT NOT NULL,
  query_embedding vector(1536),
  
  -- 检索结果
  retrieved_doc_ids UUID[] NOT NULL,
  top_k INTEGER NOT NULL DEFAULT 3,
  similarity_scores FLOAT[] NOT NULL,
  
  -- 生成结果
  generated_response TEXT,
  model TEXT NOT NULL,
  
  -- 元数据
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 索引
CREATE INDEX rag_retrieval_logs_user_idx ON rag_retrieval_logs(user_id);
CREATE INDEX rag_retrieval_logs_session_idx ON rag_retrieval_logs(session_id);
CREATE INDEX rag_retrieval_logs_created_at_idx ON rag_retrieval_logs(created_at);
```

#### 1.2 Drizzle Schema 定义
**文件**: `src/db/schema-knowledge.ts`

```typescript
import { pgTable, uuid, text, timestamp, jsonb, integer, index, vector } from "drizzle-orm/pg-core";
import { user } from "./schema";

// 知识库文档表
export const knowledgeDocuments = pgTable(
  "knowledge_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    
    title: text("title").notNull(),
    category: text("category").notNull(), // 'bazi' | 'fengshui' | 'faq' | 'case'
    source: text("source").notNull(),
    content: text("content").notNull(),
    
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    
    // pgvector: vector(1536) for OpenAI embeddings
    embedding: vector("embedding", { dimensions: 1536 }),
    
    chunkIndex: integer("chunk_index").default(0),
    parentDocId: uuid("parent_doc_id"),
    viewCount: integer("view_count").default(0),
    referenceCount: integer("reference_count").default(0),
    
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    categoryIdx: index("knowledge_documents_category_idx").on(table.category),
    sourceIdx: index("knowledge_documents_source_idx").on(table.source),
    parentDocIdx: index("knowledge_documents_parent_doc_idx").on(table.parentDocId),
    // HNSW index created in SQL migration
  })
);

// RAG 检索历史表
export const ragRetrievalLogs = pgTable(
  "rag_retrieval_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    
    userId: text("user_id").notNull(),
    sessionId: uuid("session_id"),
    query: text("query").notNull(),
    queryEmbedding: vector("query_embedding", { dimensions: 1536 }),
    
    retrievedDocIds: jsonb("retrieved_doc_ids").$type<string[]>().notNull(),
    topK: integer("top_k").notNull().default(3),
    similarityScores: jsonb("similarity_scores").$type<number[]>().notNull(),
    
    generatedResponse: text("generated_response"),
    model: text("model").notNull(),
    
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("rag_retrieval_logs_user_idx").on(table.userId),
    sessionIdx: index("rag_retrieval_logs_session_idx").on(table.sessionId),
    createdAtIdx: index("rag_retrieval_logs_created_at_idx").on(table.createdAt),
  })
);
```

---

### Step 2: 文档处理工具 (3 小时)

#### 2.1 文本分块工具
**文件**: `src/lib/rag/text-chunker.ts`

```typescript
/**
 * 文本分块策略
 * - 按段落分块 (优先)
 * - 按字符数分块 (fallback)
 * - 保留重叠部分 (overlap)
 */

export interface ChunkOptions {
  maxChunkSize: number; // 最大字符数 (默认 1000)
  overlap: number; // 重叠字符数 (默认 200)
  separator: string; // 分隔符 (默认 \n\n)
}

export interface TextChunk {
  content: string;
  index: number;
  metadata: {
    startChar: number;
    endChar: number;
    parentLength: number;
  };
}

export class TextChunker {
  private options: ChunkOptions;

  constructor(options?: Partial<ChunkOptions>) {
    this.options = {
      maxChunkSize: options?.maxChunkSize || 1000,
      overlap: options?.overlap || 200,
      separator: options?.separator || "\n\n",
    };
  }

  /**
   * 分块文本
   */
  chunk(text: string): TextChunk[] {
    // 1. 按段落分割
    const paragraphs = text.split(this.options.separator);
    
    const chunks: TextChunk[] = [];
    let currentChunk = "";
    let currentIndex = 0;
    let charPosition = 0;

    for (const paragraph of paragraphs) {
      // 如果当前段落过长，需要进一步切分
      if (paragraph.length > this.options.maxChunkSize) {
        // 保存当前块
        if (currentChunk) {
          chunks.push({
            content: currentChunk.trim(),
            index: currentIndex++,
            metadata: {
              startChar: charPosition - currentChunk.length,
              endChar: charPosition,
              parentLength: text.length,
            },
          });
          currentChunk = "";
        }

        // 按字符切分长段落
        const subChunks = this.chunkByCharacters(paragraph);
        for (const subChunk of subChunks) {
          chunks.push({
            content: subChunk,
            index: currentIndex++,
            metadata: {
              startChar: charPosition,
              endChar: charPosition + subChunk.length,
              parentLength: text.length,
            },
          });
          charPosition += subChunk.length;
        }
      } else {
        // 如果加上当前段落超过最大长度，保存当前块
        if (currentChunk.length + paragraph.length > this.options.maxChunkSize) {
          chunks.push({
            content: currentChunk.trim(),
            index: currentIndex++,
            metadata: {
              startChar: charPosition - currentChunk.length,
              endChar: charPosition,
              parentLength: text.length,
            },
          });

          // 保留重叠部分
          const overlapText = currentChunk.slice(-this.options.overlap);
          currentChunk = overlapText + this.options.separator + paragraph;
        } else {
          currentChunk += (currentChunk ? this.options.separator : "") + paragraph;
        }
        charPosition += paragraph.length + this.options.separator.length;
      }
    }

    // 保存最后一个块
    if (currentChunk.trim()) {
      chunks.push({
        content: currentChunk.trim(),
        index: currentIndex,
        metadata: {
          startChar: charPosition - currentChunk.length,
          endChar: charPosition,
          parentLength: text.length,
        },
      });
    }

    return chunks;
  }

  /**
   * 按字符数切分 (用于超长段落)
   */
  private chunkByCharacters(text: string): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + this.options.maxChunkSize, text.length);
      chunks.push(text.slice(start, end));
      start = end - this.options.overlap; // 重叠
    }

    return chunks;
  }
}
```

#### 2.2 向量化服务
**文件**: `src/lib/rag/embedding-service.ts`

```typescript
import { openai } from "@ai-sdk/openai";
import { embed } from "ai";

/**
 * OpenAI Embeddings 服务
 */
export class EmbeddingService {
  private model = openai.embedding("text-embedding-3-small");

  /**
   * 生成单个文本的向量
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const { embedding } = await embed({
        model: this.model,
        value: text,
      });

      return embedding;
    } catch (error) {
      console.error("Generate embedding error:", error);
      throw new Error("Failed to generate embedding");
    }
  }

  /**
   * 批量生成向量
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const embeddings = await Promise.all(
        texts.map((text) => this.generateEmbedding(text))
      );

      return embeddings;
    } catch (error) {
      console.error("Generate embeddings batch error:", error);
      throw new Error("Failed to generate embeddings");
    }
  }
}

export const embeddingService = new EmbeddingService();
```

---

### Step 3: RAG 检索引擎 (3 小时)

#### 3.1 向量检索服务
**文件**: `src/lib/rag/vector-search.ts`

```typescript
import { db } from "@/db";
import { knowledgeDocuments } from "@/db/schema-knowledge";
import { sql } from "drizzle-orm";
import { embeddingService } from "./embedding-service";

export interface SearchOptions {
  category?: string; // 过滤分类
  topK?: number; // 返回前 K 个结果 (默认 3)
  threshold?: number; // 相似度阈值 (默认 0.7)
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  category: string;
  source: string;
  similarity: number;
  metadata: Record<string, unknown>;
}

export class VectorSearchService {
  /**
   * 语义搜索
   */
  async search(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    const { category, topK = 3, threshold = 0.7 } = options;

    try {
      // 1. 生成查询向量
      const queryEmbedding = await embeddingService.generateEmbedding(query);

      // 2. 向量相似度搜索 (余弦相似度)
      const results = await db.execute(sql`
        SELECT 
          id,
          title,
          content,
          category,
          source,
          metadata,
          1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector) AS similarity
        FROM knowledge_documents
        WHERE 
          ${category ? sql`category = ${category} AND` : sql``}
          1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector) > ${threshold}
        ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector
        LIMIT ${topK}
      `);

      return results.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        content: row.content,
        category: row.category,
        source: row.source,
        similarity: parseFloat(row.similarity),
        metadata: row.metadata || {},
      }));
    } catch (error) {
      console.error("Vector search error:", error);
      throw new Error("Failed to perform vector search");
    }
  }

  /**
   * 混合搜索 (向量 + 关键词)
   */
  async hybridSearch(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    // 未来可以实现 BM25 + Vector 的混合检索
    return this.search(query, options);
  }
}

export const vectorSearchService = new VectorSearchService();
```

#### 3.2 RAG 生成服务
**文件**: `src/lib/rag/rag-generator.ts`

```typescript
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { vectorSearchService, type SearchResult } from "./vector-search";
import { db } from "@/db";
import { ragRetrievalLogs } from "@/db/schema-knowledge";
import { embeddingService } from "./embedding-service";

export interface RAGOptions {
  category?: string;
  topK?: number;
  model?: string;
  temperature?: number;
}

export interface RAGResult {
  response: string;
  references: SearchResult[];
  metadata: {
    retrievalCount: number;
    model: string;
    tokensUsed?: number;
  };
}

export class RAGGenerator {
  /**
   * RAG 增强生成
   */
  async generate(
    query: string,
    userId: string,
    sessionId?: string,
    options: RAGOptions = {}
  ): Promise<RAGResult> {
    const {
      category,
      topK = 3,
      model = "gpt-4o-mini",
      temperature = 0.7,
    } = options;

    try {
      // 1. 检索相关文档
      const references = await vectorSearchService.search(query, {
        category,
        topK,
      });

      if (references.length === 0) {
        // 没有检索到相关文档，降级到普通生成
        return this.generateWithoutRAG(query, model, temperature);
      }

      // 2. 构建 Prompt (包含检索到的知识)
      const context = references
        .map(
          (ref, index) =>
            `【参考资料 ${index + 1}】\n来源: ${ref.source}\n内容: ${ref.content}\n相似度: ${(ref.similarity * 100).toFixed(1)}%`
        )
        .join("\n\n");

      const prompt = `你是一位资深的八字风水大师。请根据以下参考资料回答用户的问题。

${context}

用户问题: ${query}

请注意:
1. 优先使用参考资料中的信息
2. 如果参考资料不足以回答问题，请明确说明
3. 回答要专业、准确、易懂
4. 如有引用，请注明出处

你的回答:`;

      // 3. 生成回答
      const { text, usage } = await generateText({
        model: openai(model),
        prompt,
        temperature,
      });

      // 4. 记录检索日志
      const queryEmbedding = await embeddingService.generateEmbedding(query);
      
      await db.insert(ragRetrievalLogs).values({
        userId,
        sessionId,
        query,
        queryEmbedding: JSON.stringify(queryEmbedding),
        retrievedDocIds: references.map((ref) => ref.id),
        topK,
        similarityScores: references.map((ref) => ref.similarity),
        generatedResponse: text,
        model,
        metadata: {
          tokensUsed: usage?.totalTokens,
        },
      });

      // 5. 更新文档引用计数
      for (const ref of references) {
        await db.execute(sql`
          UPDATE knowledge_documents
          SET reference_count = reference_count + 1
          WHERE id = ${ref.id}
        `);
      }

      return {
        response: text,
        references,
        metadata: {
          retrievalCount: references.length,
          model,
          tokensUsed: usage?.totalTokens,
        },
      };
    } catch (error) {
      console.error("RAG generation error:", error);
      throw new Error("Failed to generate RAG response");
    }
  }

  /**
   * 降级: 无 RAG 生成
   */
  private async generateWithoutRAG(
    query: string,
    model: string,
    temperature: number
  ): Promise<RAGResult> {
    const { text } = await generateText({
      model: openai(model),
      prompt: `你是一位资深的八字风水大师。请回答用户的问题：\n\n${query}`,
      temperature,
    });

    return {
      response: text,
      references: [],
      metadata: {
        retrievalCount: 0,
        model,
      },
    };
  }
}

export const ragGenerator = new RAGGenerator();
```

---

### Step 4: 知识库管理 (2 小时)

#### 4.1 文档导入脚本
**文件**: `scripts/import-knowledge-base.ts`

```typescript
import { db } from "../src/db";
import { knowledgeDocuments } from "../src/db/schema-knowledge";
import { TextChunker } from "../src/lib/rag/text-chunker";
import { embeddingService } from "../src/lib/rag/embedding-service";
import fs from "fs";
import path from "path";

interface DocumentInput {
  title: string;
  category: "bazi" | "fengshui" | "faq" | "case";
  source: string;
  filePath: string;
}

async function importDocument(doc: DocumentInput) {
  console.log(`Importing: ${doc.title}...`);

  // 1. 读取文件
  const content = fs.readFileSync(doc.filePath, "utf-8");

  // 2. 分块
  const chunker = new TextChunker({ maxChunkSize: 1000, overlap: 200 });
  const chunks = chunker.chunk(content);

  console.log(`  - Split into ${chunks.length} chunks`);

  // 3. 生成向量
  const chunkContents = chunks.map((chunk) => chunk.content);
  const embeddings = await embeddingService.generateEmbeddings(chunkContents);

  console.log(`  - Generated ${embeddings.length} embeddings`);

  // 4. 插入数据库
  for (let i = 0; i < chunks.length; i++) {
    await db.insert(knowledgeDocuments).values({
      title: `${doc.title} (第 ${i + 1} 部分)`,
      category: doc.category,
      source: doc.source,
      content: chunks[i].content,
      embedding: JSON.stringify(embeddings[i]),
      chunkIndex: i,
      metadata: chunks[i].metadata,
    });
  }

  console.log(`✓ Imported: ${doc.title}\n`);
}

async function main() {
  const documents: DocumentInput[] = [
    {
      title: "滴天髓精华",
      category: "bazi",
      source: "滴天髓",
      filePath: path.join(__dirname, "../knowledge-base/bazi/ditianmiao.txt"),
    },
    {
      title: "玄空飞星基础",
      category: "fengshui",
      source: "玄空飞星秘籍",
      filePath: path.join(__dirname, "../knowledge-base/fengshui/xuankong.txt"),
    },
    // 更多文档...
  ];

  for (const doc of documents) {
    try {
      await importDocument(doc);
    } catch (error) {
      console.error(`Failed to import ${doc.title}:`, error);
    }
  }

  console.log("Import completed!");
  process.exit(0);
}

main();
```

---

### Step 5: 前端集成 (3 小时)

#### 5.1 知识引用组件
**文件**: `src/components/rag/knowledge-reference.tsx`

```typescript
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ExternalLink } from "lucide-react";
import type { SearchResult } from "@/lib/rag/vector-search";

interface KnowledgeReferenceProps {
  references: SearchResult[];
}

export function KnowledgeReference({ references }: KnowledgeReferenceProps) {
  if (references.length === 0) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          参考资料 ({references.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {references.map((ref, index) => (
          <div
            key={ref.id}
            className="p-3 bg-white rounded-lg border border-blue-100"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="font-medium text-sm">{ref.title}</p>
              <Badge variant="secondary" className="text-xs">
                {(ref.similarity * 100).toFixed(0)}%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {ref.content}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">
                来源: {ref.source}
              </span>
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

---

## 📊 验收标准

| 标准 | 检查项 |
|------|--------|
| ✅ 数据库 Schema | pgvector 扩展、向量索引 |
| ✅ 文本分块 | 1000 字符/块,  200 重叠 |
| ✅ 向量生成 | OpenAI Embeddings 1536 维 |
| ✅ 相似度搜索 | 余弦相似度 > 0.7 |
| ✅ RAG 生成 | 包含参考资料的回答 |
| ✅ 知识引用展示 | 前端组件显示引用 |
| ✅ 检索日志 | 记录查询和结果 |
| ✅ 性能 | 检索 < 200ms |

---

## 💰 成本估算

### OpenAI Embeddings 成本
- text-embedding-3-small: $0.00002 / 1K tokens
- 1000 字文档 ≈ 400 tokens
- 1000 字文档向量化: $0.000008
- 10,000 条文档: $0.08

### 查询成本
- 每次查询生成向量: $0.000008
- GPT-4o-mini 生成: $0.15 / 1M input tokens
- 单次 RAG 查询 (含 3 个参考): ~$0.01

### 总成本
- 初始化知识库: $0.08 (一次性)
- 单次 RAG 查询: $0.01
- **月成本 (1000 次查询)**: ~$10

---

## 🔄 下一步 (Phase 8)

- Pro 订阅月度运势
- 定时任务调度
- 通知推送机制

---

**文档生成时间**: 2025-01-12 03:00 UTC+8  
**Phase 7 状态**: ⏳ 计划完成  
**预计耗时**: 12 小时
