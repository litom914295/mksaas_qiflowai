# Phase 0: Schema 变更设计 v1.0

## 📋 新增表结构 (Phase 2)

### 1. qiflow_reports - 精华报告主表
```typescript
// src/db/schema.ts 新增
export const qiflowReports = pgTable('qiflow_reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  
  // 报告类型与状态
  reportType: text('report_type').notNull(), // 'basic' | 'essential'
  status: text('status').notNull().default('pending'), 
  // 'pending' → 'generating' → 'completed' | 'failed'
  
  // 输入输出数据
  input: jsonb('input').$type<{
    birthInfo: BirthInfo;
    selectedThemes?: string[];  // Phase 3: 用户选择的主题
  }>().notNull(),
  
  output: jsonb('output').$type<{
    baziData: FourPillars;
    flyingStarData: FlyingStarGrid;
    themes: Array<{
      id: string;
      title: string;
      story: string;
      synthesis: string;
      recommendations: string[];
    }>;
    qualityScore?: number;  // 0-100
  }>(),
  
  // 计费与时间
  creditsUsed: integer('credits_used').notNull(), // 120 for essential
  generatedAt: timestamp('generated_at'),
  expiresAt: timestamp('expires_at'),  // null = 终身有效
  
  // 元数据
  metadata: jsonb('metadata').$type<{
    aiModel: string;  // 'deepseek-chat'
    generationTimeMs: number;
    aiCostUSD: number;
    purchaseMethod: 'credits' | 'stripe';
    stripePaymentId?: string;
  }>(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('qiflow_reports_user_id_idx').on(table.userId),
  statusIdx: index('qiflow_reports_status_idx').on(table.status),
  reportTypeIdx: index('qiflow_reports_report_type_idx').on(table.reportType),
  createdAtIdx: index('qiflow_reports_created_at_idx').on(table.createdAt),
}));
```

**关键设计决策**:
- ✅ `expiresAt = null` 表示终身有效 (符合产品定位)
- ✅ `output.themes[]` 存储 3 个主题的完整内容 (避免重复生成)
- ✅ `metadata.aiCostUSD` 记录实际成本 (用于成本监控)

---

### 2. chat_sessions - Chat 会话表
```typescript
export const chatSessions = pgTable('chat_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  
  // 时间控制
  startedAt: timestamp('started_at').notNull().defaultNow(),
  expiresAt: timestamp('expires_at').notNull(), // startedAt + 15 mins
  
  // 使用统计
  messageCount: integer('message_count').notNull().default(0),
  creditsUsed: integer('credits_used').notNull().default(40),
  
  // 会话状态
  status: text('status').notNull().default('active'),
  // 'active' → 'expired' | 'completed' | 'renewed'
  
  // 元数据
  metadata: jsonb('metadata').$type<{
    aiModel: string;
    totalTokens: number;
    totalCostUSD: number;
    renewalCount: number;  // 续费次数
  }>(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('chat_sessions_user_id_idx').on(table.userId),
  statusIdx: index('chat_sessions_status_idx').on(table.status),
  expiresAtIdx: index('chat_sessions_expires_at_idx').on(table.expiresAt),
}));
```

**关键设计决策**:
- ✅ `expiresAt` 索引用于定时任务清理过期会话
- ✅ `metadata.renewalCount` 追踪续费行为 (Phase 6 分析指标)

---

### 3. stripe_webhook_events - Webhook 幂等性表
```typescript
export const stripeWebhookEvents = pgTable('stripe_webhook_events', {
  id: text('id').primaryKey(), // Stripe event.id
  eventType: text('event_type').notNull(), // 'invoice.paid', 'customer.subscription.updated'
  processedAt: timestamp('processed_at').notNull().defaultNow(),
  payload: jsonb('payload').notNull(), // 完整 event 对象
  
  // 处理结果
  success: boolean('success').notNull().default(true),
  errorMessage: text('error_message'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  eventTypeIdx: index('stripe_webhook_events_event_type_idx').on(table.eventType),
  processedAtIdx: index('stripe_webhook_events_processed_at_idx').on(table.processedAt),
}));
```

**关键设计决策**:
- ✅ 主键 `id` = Stripe `event.id` 天然去重
- ✅ 保留完整 `payload` 便于调试和重放

---

### 4. qiflow_knowledge_embeddings - RAG 向量表 (Phase 7)
```typescript
// 需启用 pgvector 扩展
// CREATE EXTENSION IF NOT EXISTS vector;

export const qiflowKnowledgeEmbeddings = pgTable('qiflow_knowledge_embeddings', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // 文档来源
  documentId: text('document_id').notNull(), // '滴天髓.chapter1'
  documentType: text('document_type').notNull(), // 'classic' | 'modern_article'
  chunkIndex: integer('chunk_index').notNull(), // 章节内分块索引
  
  // 文本内容
  content: text('content').notNull(), // 原文分块 (~500 tokens)
  title: text('title'), // 章节标题
  
  // 向量
  embedding: vector('embedding', { dimensions: 1536 }), // OpenAI text-embedding-3-small
  
  // 元数据
  metadata: jsonb('metadata').$type<{
    source: string;  // '《滴天髓》卷一'
    author?: string;
    year?: string;
    tags?: string[];  // ['八字', '十神', '格局']
  }>(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  documentIdIdx: index('embeddings_document_id_idx').on(table.documentId),
  documentTypeIdx: index('embeddings_document_type_idx').on(table.documentType),
  // pgvector IVFFlat 索引 (100万+ 向量时启用)
  embeddingIdx: index('embeddings_embedding_idx')
    .using('ivfflat', table.embedding.op('vector_cosine_ops')),
}));
```

**关键设计决策**:
- ✅ 使用 OpenAI `text-embedding-3-small` (1536 维, $0.00002/1K tokens)
- ✅ 分块策略: 每块 ~500 tokens (平衡检索准确性与成本)
- ✅ IVFFlat 索引: 100 lists (适合 1-10 万条向量)

---

### 5. monthly_fortunes - Pro 月度运势表 (Phase 8)
```typescript
export const monthlyFortunes = pgTable('monthly_fortunes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  
  // 时间范围
  year: integer('year').notNull(),
  month: integer('month').notNull(), // 1-12
  
  // 运势数据
  fortuneData: jsonb('fortune_data').$type<{
    overallScore: number;  // 0-100
    luckyDirections: string[];
    luckyColors: string[];
    careerForecast: string;
    healthWarnings: string[];
    relationshipTips: string[];
  }>().notNull(),
  
  // 飞星分析
  flyingStarAnalysis: jsonb('flying_star_analysis').$type<{
    monthlyGrid: FlyingStarGrid;
    criticalWarnings: Array<{
      direction: string;
      issue: string;
      remedy: string;
    }>;
  }>(),
  
  // 生成状态
  status: text('status').notNull().default('pending'),
  // 'pending' → 'generated' | 'failed'
  
  generatedAt: timestamp('generated_at'),
  notifiedAt: timestamp('notified_at'), // 推送通知时间
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('monthly_fortunes_user_id_idx').on(table.userId),
  yearMonthIdx: index('monthly_fortunes_year_month_idx').on(table.year, table.month),
  statusIdx: index('monthly_fortunes_status_idx').on(table.status),
  // 唯一约束: 每人每月只有一份运势
  unique: index('monthly_fortunes_user_year_month_unique')
    .on(table.userId, table.year, table.month)
    .unique(),
}));
```

**关键设计决策**:
- ✅ 唯一约束防止重复生成
- ✅ `notifiedAt` 追踪推送状态 (避免重复推送)

---

## 📊 现有表改动 (Phase 2)

### 1. creditTransaction 表扩展
```typescript
// 新增交易类型常量
export const CREDIT_TRANSACTION_TYPE = {
  // 现有类型
  PURCHASE: 'purchase',
  DEDUCTION: 'deduction',
  ADDITION: 'addition',
  TASK_REWARD: 'task_reward',
  
  // Phase 2-6 新增
  REPORT_PURCHASE: 'report_purchase',      // 报告购买扣费
  CHAT_SESSION_START: 'chat_session_start', // 会话开启扣费
  CHAT_SESSION_RENEW: 'chat_session_renew', // 会话续费
  AB_TEST_BONUS: 'ab_test_bonus',          // A/B 测试奖励
} as const;
```

**无需修改表结构**, 仅扩展 `type` 字段枚举值。

---

### 2. taskProgress 表扩展 (Phase 5)
```typescript
// 新增任务元数据字段 (已存在 JSON 字段可复用)
// 示例: 存储 A/B 分组信息
await db.insert(taskProgress).values({
  userId,
  taskId: 'try_essential_report',
  taskType: 'NEWBIE',
  progress: 0,
  target: 1,
  metadata: jsonb('metadata').$type<{
    abTestGroup: 'A' | 'B';  // Phase 5 分组标识
    triggeredAt: Date;
  }>(),
});
```

**无需修改表结构**, 利用现有 JSON 字段。

---

## 🔄 迁移脚本 (Drizzle ORM)

### Phase 2 迁移
```typescript
// drizzle/0001_phase2_reports_and_sessions.sql
CREATE TABLE IF NOT EXISTS "qiflow_reports" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "report_type" text NOT NULL,
  "status" text NOT NULL DEFAULT 'pending',
  "input" jsonb NOT NULL,
  "output" jsonb,
  "credits_used" integer NOT NULL,
  "generated_at" timestamp,
  "expires_at" timestamp,
  "metadata" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX "qiflow_reports_user_id_idx" ON "qiflow_reports"("user_id");
CREATE INDEX "qiflow_reports_status_idx" ON "qiflow_reports"("status");
CREATE INDEX "qiflow_reports_report_type_idx" ON "qiflow_reports"("report_type");
CREATE INDEX "qiflow_reports_created_at_idx" ON "qiflow_reports"("created_at");

-- Chat Sessions 表
CREATE TABLE IF NOT EXISTS "chat_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "started_at" timestamp DEFAULT now() NOT NULL,
  "expires_at" timestamp NOT NULL,
  "message_count" integer DEFAULT 0 NOT NULL,
  "credits_used" integer DEFAULT 40 NOT NULL,
  "status" text DEFAULT 'active' NOT NULL,
  "metadata" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX "chat_sessions_user_id_idx" ON "chat_sessions"("user_id");
CREATE INDEX "chat_sessions_status_idx" ON "chat_sessions"("status");
CREATE INDEX "chat_sessions_expires_at_idx" ON "chat_sessions"("expires_at");

-- Stripe Webhook 幂等性表
CREATE TABLE IF NOT EXISTS "stripe_webhook_events" (
  "id" text PRIMARY KEY,
  "event_type" text NOT NULL,
  "processed_at" timestamp DEFAULT now() NOT NULL,
  "payload" jsonb NOT NULL,
  "success" boolean DEFAULT true NOT NULL,
  "error_message" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX "stripe_webhook_events_event_type_idx" ON "stripe_webhook_events"("event_type");
CREATE INDEX "stripe_webhook_events_processed_at_idx" ON "stripe_webhook_events"("processed_at");
```

### Phase 7 迁移 (RAG)
```sql
-- drizzle/0002_phase7_rag_embeddings.sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS "qiflow_knowledge_embeddings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "document_id" text NOT NULL,
  "document_type" text NOT NULL,
  "chunk_index" integer NOT NULL,
  "content" text NOT NULL,
  "title" text,
  "embedding" vector(1536),
  "metadata" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX "embeddings_document_id_idx" ON "qiflow_knowledge_embeddings"("document_id");
CREATE INDEX "embeddings_document_type_idx" ON "qiflow_knowledge_embeddings"("document_type");

-- IVFFlat 索引 (需先插入数据后再创建)
-- CREATE INDEX "embeddings_embedding_idx" ON "qiflow_knowledge_embeddings" 
--   USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### Phase 8 迁移 (Pro 运势)
```sql
-- drizzle/0003_phase8_monthly_fortunes.sql
CREATE TABLE IF NOT EXISTS "monthly_fortunes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "year" integer NOT NULL,
  "month" integer NOT NULL,
  "fortune_data" jsonb NOT NULL,
  "flying_star_analysis" jsonb,
  "status" text DEFAULT 'pending' NOT NULL,
  "generated_at" timestamp,
  "notified_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX "monthly_fortunes_user_id_idx" ON "monthly_fortunes"("user_id");
CREATE INDEX "monthly_fortunes_year_month_idx" ON "monthly_fortunes"("year", "month");
CREATE INDEX "monthly_fortunes_status_idx" ON "monthly_fortunes"("status");
CREATE UNIQUE INDEX "monthly_fortunes_user_year_month_unique" 
  ON "monthly_fortunes"("user_id", "year", "month");
```

---

## 🔥 数据库性能优化

### 1. 索引策略
- ✅ **高频查询字段**: userId, status, createdAt
- ✅ **复合索引**: (userId, year, month) for monthly_fortunes
- ✅ **向量索引**: 延迟创建 (数据量 > 1 万后)

### 2. JSON 字段查询优化
```sql
-- 示例: 按报告类型查询
CREATE INDEX IF NOT EXISTS "qiflow_reports_output_quality_idx" 
  ON "qiflow_reports" USING GIN ((output->'qualityScore'));

-- 查询质量分 < 60 的报告
SELECT * FROM qiflow_reports 
WHERE (output->>'qualityScore')::int < 60;
```

### 3. 分区策略 (Phase 9+)
```sql
-- 按年月分区 monthly_fortunes (数据量 > 100 万时考虑)
CREATE TABLE monthly_fortunes_2025_01 PARTITION OF monthly_fortunes
  FOR VALUES FROM (2025, 1) TO (2025, 2);
```

---

## ➡️ Phase 0.4 Next Step
创建 **支付流程扩展方案.md** (Stripe 集成细节)
