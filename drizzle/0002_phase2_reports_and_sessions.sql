-- Phase 2: 报告产品与 Chat 会话表
-- 用于存储用户购买的精华报告和 Chat 会话记录

-- ===========================================
-- 1. qiflow_reports - 精华报告主表
-- ===========================================
CREATE TABLE IF NOT EXISTS "qiflow_reports" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  
  -- 报告类型与状态
  "report_type" text NOT NULL,  -- 'basic' | 'essential'
  "status" text NOT NULL DEFAULT 'pending',  -- 'pending' → 'generating' → 'completed' | 'failed'
  
  -- 输入输出数据
  "input" jsonb NOT NULL,  -- { birthInfo, selectedThemes }
  "output" jsonb,          -- { baziData, flyingStarData, themes[], qualityScore }
  
  -- 计费与时间
  "credits_used" integer NOT NULL,
  "generated_at" timestamp,
  "expires_at" timestamp,  -- null = 终身有效
  
  -- 元数据
  "metadata" jsonb,  -- { aiModel, generationTimeMs, aiCostUSD, purchaseMethod, stripePaymentId }
  
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- 索引加速查询
CREATE INDEX IF NOT EXISTS "qiflow_reports_user_id_idx" ON "qiflow_reports"("user_id");
CREATE INDEX IF NOT EXISTS "qiflow_reports_status_idx" ON "qiflow_reports"("status");
CREATE INDEX IF NOT EXISTS "qiflow_reports_report_type_idx" ON "qiflow_reports"("report_type");
CREATE INDEX IF NOT EXISTS "qiflow_reports_created_at_idx" ON "qiflow_reports"("created_at");

-- 添加注释
COMMENT ON TABLE "qiflow_reports" IS '精华报告主表，存储用户购买的八字风水报告';
COMMENT ON COLUMN "qiflow_reports"."status" IS '报告生成状态: pending/generating/completed/failed';
COMMENT ON COLUMN "qiflow_reports"."expires_at" IS '报告过期时间 (null 表示终身有效)';

-- ===========================================
-- 2. chat_sessions - Chat 会话表
-- ===========================================
CREATE TABLE IF NOT EXISTS "chat_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  
  -- 时间控制
  "started_at" timestamp DEFAULT now() NOT NULL,
  "expires_at" timestamp NOT NULL,  -- started_at + 15 mins
  
  -- 使用统计
  "message_count" integer DEFAULT 0 NOT NULL,
  "credits_used" integer DEFAULT 40 NOT NULL,
  
  -- 会话状态
  "status" text DEFAULT 'active' NOT NULL,  -- 'active' → 'expired' | 'completed' | 'renewed'
  
  -- 元数据
  "metadata" jsonb,  -- { aiModel, totalTokens, totalCostUSD, renewalCount }
  
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- 索引加速查询
CREATE INDEX IF NOT EXISTS "chat_sessions_user_id_idx" ON "chat_sessions"("user_id");
CREATE INDEX IF NOT EXISTS "chat_sessions_status_idx" ON "chat_sessions"("status");
CREATE INDEX IF NOT EXISTS "chat_sessions_expires_at_idx" ON "chat_sessions"("expires_at");

-- 添加注释
COMMENT ON TABLE "chat_sessions" IS 'Chat 会话表，15 分钟时长限制';
COMMENT ON COLUMN "chat_sessions"."expires_at" IS '会话过期时间 (started_at + 15 分钟)';
COMMENT ON COLUMN "chat_sessions"."status" IS '会话状态: active/expired/completed/renewed';

-- ===========================================
-- 3. 扩展 credit_transaction 类型
-- ===========================================
-- 无需修改表结构，仅扩展 type 字段枚举值
-- 新增类型: 'report_purchase', 'chat_session_start', 'chat_session_renew'

COMMENT ON COLUMN "credit_transaction"."type" IS '交易类型: purchase/deduction/addition/task_reward/report_purchase/chat_session_start/chat_session_renew';
