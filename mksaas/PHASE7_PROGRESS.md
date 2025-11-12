# Phase 7 - RAG 知识库集成进度

**开始日期**: 2025-01-12  
**当前进度**: 62.5% (5/8 Steps)  
**预计总耗时**: 12 小时  
**实际耗时**: 2.5 小时  
**预计剩余**: 4.5 小时

---

## ✅ 已完成 (Steps 1-5)

### Step 1: 数据库 Schema 和迁移文件
- [x] 创建 `drizzle/0004_phase7_knowledge_base.sql` (147 行)
- [x] 创建 `src/db/schema-knowledge.ts` (146 行)
- [x] 启用 pgvector 扩展
- [x] 定义 knowledge_documents 表
- [x] 定义 rag_retrieval_logs 表
- [x] 创建 HNSW 向量索引
- [x] 创建辅助搜索函数

**关键特性**:
- 支持 1536 维向量 (OpenAI text-embedding-3-small)
- 余弦相似度搜索
- 文档分块支持
- 性能指标追踪
- 用户反馈收集

---

### Step 2: 文本分块工具 (TextChunker)
- [x] 创建 `src/lib/rag/text-chunker.ts` (323 行)
- [x] 实现按段落分块（优先策略）
- [x] 实现按字符分块（Fallback）
- [x] 实现重叠处理（默认 200 字符）
- [x] 实现句子完整性保持
- [x] Token 数估算（中英文区分）

**关键特性**:
- 智能分段：优先段落，保持语义
- 可配置：最大/最小块大小、重叠大小
- 支持中英文混合
- 不同分隔符（段落/句子）

---

### Step 3: 向量化服务 (EmbeddingService)
- [x] 创建 `src/lib/rag/embedding-service.ts` (277 行)
- [x] OpenAI Embeddings API 封装
- [x] 单个文本向量化
- [x] 批量文本向量化（最大 100/批）
- [x] 重试机制（Rate Limit 处理）
- [x] 成本估算和统计

**关键特性**:
- 模型：text-embedding-3-small（1536 维）
- 批量处理：最多 100 个文本/请求
- 重试延迟：1s、 2s、 3s
- 成本：$0.00002 / 1K tokens
- 单例模式：共享实例

---

### Step 4: 向量搜索服务 (VectorSearchService)
- [x] 创建 `src/lib/rag/vector-search.ts` (257 行)
- [x] PostgreSQL pgvector 集成
- [x] 余弦相似度搜索
- [x] 阈值过滤（默认 0.7）
- [x] 类别过滤（bazi/fengshui/faq/case）
- [x] 统计信息和健康检查

**关键特性**:
- HNSW 索引：快速近似搜索
- Top-K 结果：默认 5 个
- 相似度分数：0-1
- 性能目标：< 200ms

---

### Step 5: RAG 生成器 (RAGGenerator)
- [x] 创建 `src/lib/rag/rag-generator.ts` (298 行)
- [x] 整合检索和生成流程
- [x] DeepSeek Chat API 集成
- [x] RAG Prompt 模板
- [x] 检索日志记录
- [x] Fallback 到非 RAG 生成

**关键特性**:
- 全流程：向量化 → 检索 → 生成 → 记录
- 智能引用：自动标注来源和相似度
- 性能监控：检索和生成耗时分开
- 成本控制：~$0.005 / 次查询

---

### 统一导出
- [x] 创建 `src/lib/rag/index.ts` (48 行)
- [x] 导出所有 RAG 相关类型和函数
- [x] 提供便捷函数

**使用示例**:
```typescript
import { quickRAG } from '@/lib/rag';

const response = await quickRAG(
  '八字中的食神是什么？',
  'user-123',
  { topK: 5, category: 'bazi' }
);
```

---

## ⏳ 待完成 (Steps 2-8)

### Step 2: 文本分块工具 (TextChunker) - 2h
**目标**: 智能文本分块，保持语义完整性

**实现要点**:
```typescript
// src/lib/rag/text-chunker.ts

export interface ChunkOptions {
  maxChunkSize: number;  // 默认 1000 字符
  overlap: number;        // 默认 200 字符重叠
  separator: string;      // 默认段落分隔符 \n\n
}

export class TextChunker {
  // 1. 按段落分块 (优先)
  chunkByParagraph(text: string, options: ChunkOptions): TextChunk[]
  
  // 2. 按字符数分块 (fallback)
  chunkBySize(text: string, options: ChunkOptions): TextChunk[]
  
  // 3. 智能分块 (结合两种策略)
  chunk(text: string, options?: Partial<ChunkOptions>): TextChunk[]
}
```

**测试用例**:
- 短文本 (< 1000 字符): 不分块
- 长文本 (> 1000 字符): 按段落分块
- 无段落文本: 按字符分块 + 重叠

---

### Step 3: 向量化服务 (EmbeddingService) - 2h
**目标**: OpenAI Embeddings API 封装

**实现要点**:
```typescript
// src/lib/rag/embedding-service.ts

export class EmbeddingService {
  private apiKey: string;
  private model = 'text-embedding-3-small';  // 1536 维
  
  // 单个文本向量化
  async embed(text: string): Promise<number[]>
  
  // 批量文本向量化
  async embedBatch(texts: string[]): Promise<number[][]>
  
  // 成本估算
  estimateCost(texts: string[]): number
}
```

**成本控制**:
- text-embedding-3-small: $0.00002 / 1K tokens
- 批量处理 (最多 2048 个文本/请求)
- 重试机制 (rate limit)
- Token 计数优化

---

### Step 4: 向量搜索服务 (VectorSearchService) - 2h
**目标**: 语义相似度搜索

**实现要点**:
```typescript
// src/lib/rag/vector-search.ts

export interface SearchOptions {
  query: string;
  topK?: number;              // 默认 5
  threshold?: number;         // 默认 0.7
  category?: DocumentCategoryType;
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  category: string;
  source: string;
  similarity: number;
}

export class VectorSearchService {
  // 语义搜索
  async search(options: SearchOptions): Promise<SearchResult[]>
  
  // 使用现有向量搜索 (跳过 embedding 步骤)
  async searchByEmbedding(
    embedding: number[],
    options: Omit<SearchOptions, 'query'>
  ): Promise<SearchResult[]>
}
```

**性能优化**:
- 使用 HNSW 索引 (< 200ms)
- PostgreSQL 函数直接调用
- 连接池复用

---

### Step 5: RAG 生成器 (RAGGenerator) - 3h
**目标**: 整合检索和生成，增强回答质量

**实现要点**:
```typescript
// src/lib/rag/rag-generator.ts

export interface RAGOptions {
  query: string;
  userId: string;
  sessionId?: string;
  model?: string;            // 默认 'deepseek-chat'
  topK?: number;
  category?: DocumentCategoryType;
}

export interface RAGResponse {
  answer: string;
  references: SearchResult[];
  retrievalTimeMs: number;
  generationTimeMs: number;
  totalTokens: number;
}

export class RAGGenerator {
  // RAG 增强生成
  async generate(options: RAGOptions): Promise<RAGResponse>
  
  // Fallback 到非 RAG 生成
  async generateWithoutRAG(query: string): Promise<string>
}
```

**Prompt 模板**:
```
基于以下知识库内容回答用户问题：

知识库内容:
1. [来源: 滴天髓] {content_1}
2. [来源: 宅经] {content_2}
...

用户问题: {query}

要求:
- 优先使用知识库内容回答
- 明确引用来源
- 如果知识库无法回答，说明并给出通用建议
```

---

### Step 6: 知识库导入脚本 - 2h
**目标**: 批量导入和向量化文档

**实现要点**:
```typescript
// scripts/import-knowledge-base.ts

interface ImportOptions {
  sourcePath: string;    // 文档目录路径
  category: DocumentCategoryType;
  chunkSize?: number;
  batchSize?: number;    // 批量向量化大小
}

async function importDocuments(options: ImportOptions) {
  // 1. 读取文档文件 (.txt, .md)
  // 2. 解析元数据 (title, author, source)
  // 3. 文本分块
  // 4. 批量向量化
  // 5. 插入数据库
  // 6. 进度显示
}
```

**示例用法**:
```bash
# 导入八字知识
npx tsx scripts/import-knowledge-base.ts \
  --source ./knowledge/bazi \
  --category bazi

# 导入风水知识
npx tsx scripts/import-knowledge-base.ts \
  --source ./knowledge/fengshui \
  --category fengshui
```

---

### Step 7: Frontend 引用组件 - 1h
**目标**: 显示知识来源和相似度

**实现要点**:
```tsx
// src/components/rag/knowledge-reference.tsx

interface KnowledgeReferenceProps {
  references: SearchResult[];
  onReferenceClick?: (ref: SearchResult) => void;
}

export function KnowledgeReference({ references }: Props) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold">📚 知识来源</h4>
      {references.map((ref) => (
        <div key={ref.id} className="border rounded p-3">
          <div className="flex justify-between">
            <span className="font-medium">{ref.title}</span>
            <Badge>{(ref.similarity * 100).toFixed(0)}%</Badge>
          </div>
          <p className="text-xs text-gray-500">{ref.source}</p>
          <p className="text-sm mt-1 line-clamp-2">{ref.content}</p>
        </div>
      ))}
    </div>
  );
}
```

---

### Step 8: 集成到 Chat 系统 - 2h
**目标**: 在 AI Chat 中启用 RAG

**实现要点**:
1. 修改 Chat API 端点，添加 RAG 选项
2. 在 `ai-chat-with-context.tsx` 中集成 RAG
3. 显示 KnowledgeReference 组件
4. 添加"知识增强"开关

**UI 变更**:
```tsx
// 在 chat 界面添加知识引用展示
<div className="space-y-4">
  {/* AI 回答 */}
  <div>{aiResponse}</div>
  
  {/* 知识引用 */}
  {references.length > 0 && (
    <KnowledgeReference references={references} />
  )}
</div>
```

---

## 📊 整体进度追踪

| Step | 任务 | 预计 | 实际 | 状态 |
|------|------|------|------|------|
| 1 | Database Schema | 1h | 0.5h | ✅ 完成 |
| 2 | TextChunker | 2h | 0.5h | ✅ 完成 |
| 3 | EmbeddingService | 2h | 0.7h | ✅ 完成 |
| 4 | VectorSearchService | 2h | 0.6h | ✅ 完成 |
| 5 | RAGGenerator | 3h | 0.7h | ✅ 完成 |
| 6 | Import Script | 2h | - | ⏸️ 待开始 |
| 7 | Frontend Component | 1h | - | ⏸️ 待开始 |
| 8 | Chat Integration | 2h | - | ⏸️ 待开始 |
| **总计** | **全部步骤** | **15h** | **2.5h** | **62.5%** |

---

## 🔑 关键依赖

### 环境变量
```env
# OpenAI API Key (用于 Embeddings)
OPENAI_API_KEY=sk-...

# Database URL (需支持 pgvector)
DATABASE_URL=postgresql://...
```

### 数据库要求
- PostgreSQL >= 12
- pgvector 扩展已安装
- 支持 HNSW 索引

### npm 包
```bash
npm install openai
# openai SDK 已包含 embeddings API
```

---

## 📈 性能目标

| 指标 | 目标 | 验证方法 |
|------|------|----------|
| 检索延迟 | < 200ms | `rag_retrieval_logs.retrieval_time_ms` |
| 生成延迟 | < 3s | `rag_retrieval_logs.generation_time_ms` |
| 召回率 | > 80% | 人工评估相关文档比例 |
| 准确率 | > 90% | 用户反馈 `helpful` 比例 |
| 单次成本 | < $0.02 | Embedding + Generation 总成本 |

---

## 🧪 测试计划

### 单元测试
- [ ] TextChunker 分块逻辑
- [ ] EmbeddingService API 调用
- [ ] VectorSearchService 相似度搜索
- [ ] RAGGenerator 生成质量

### 集成测试
- [ ] 端到端 RAG 流程
- [ ] 数据库向量索引性能
- [ ] 批量导入脚本

### 性能测试
- [ ] 1000 文档检索性能
- [ ] 10,000 文档检索性能
- [ ] 并发查询性能

---

## 💰 成本估算

### Embedding 成本
- text-embedding-3-small: $0.00002 / 1K tokens
- 10,000 文档 × 500 tokens/文档 = 5M tokens
- 一次性成本: $0.10

### 运行成本
- 单次查询 embedding: ~50 tokens = $0.000001
- 单次生成: ~500 tokens = $0.005 (DeepSeek)
- **单次 RAG 查询总成本**: ~$0.005

**月度成本** (假设 1000 次查询):
- Embedding: $0.001
- Generation: $5.00
- **总计**: ~$5.00/月

---

## 📞 技术支持

**已完成文档**:
- `drizzle/0004_phase7_knowledge_base.sql`
- `src/db/schema-knowledge.ts`

**计划文档**:
- `docs/phase7/Phase7实施计划.md` (已存在)
- `PHASE7_COMPLETION_GUIDE.md` (待创建)

**参考资料**:
- OpenAI Embeddings API: https://platform.openai.com/docs/guides/embeddings
- pgvector 文档: https://github.com/pgvector/pgvector
- HNSW 算法: https://arxiv.org/abs/1603.09320

---

**更新日期**: 2025-01-12 07:35 UTC+8  
**下一步**: 实现 Step 6 - 知识库导入脚本  
**预计完成**: 2025-01-12 (剩余 4.5 小时)
