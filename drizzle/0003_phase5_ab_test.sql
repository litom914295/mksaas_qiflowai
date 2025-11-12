-- Phase 5: A/B 测试基础设施
-- 用于实验管理、用户分组和事件追踪

-- ===========================================
-- 1. ab_test_experiments - 实验配置表
-- ===========================================
CREATE TABLE IF NOT EXISTS "ab_test_experiments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 实验基本信息
  "name" text NOT NULL UNIQUE,
  "description" text,
  "status" text NOT NULL DEFAULT 'draft',  -- 'draft' | 'active' | 'paused' | 'completed'
  
  -- 变体配置
  "variants" jsonb NOT NULL,  -- [{ id: 'control', weight: 50 }, { id: 'variant_a', weight: 50 }]
  
  -- 时间控制
  "start_date" timestamp,
  "end_date" timestamp,
  
  -- 目标指标
  "goal_metric" text,  -- 'conversion_rate' | 'revenue' | 'engagement'
  
  -- 元数据
  "metadata" jsonb,
  
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- 索引
CREATE INDEX IF NOT EXISTS "ab_test_experiments_name_idx" ON "ab_test_experiments"("name");
CREATE INDEX IF NOT EXISTS "ab_test_experiments_status_idx" ON "ab_test_experiments"("status");

-- 注释
COMMENT ON TABLE "ab_test_experiments" IS 'A/B 测试实验配置表';
COMMENT ON COLUMN "ab_test_experiments"."status" IS '实验状态: draft/active/paused/completed';
COMMENT ON COLUMN "ab_test_experiments"."variants" IS '变体配置数组，包含 id 和 weight';

-- ===========================================
-- 2. ab_test_assignments - 用户分组表
-- ===========================================
CREATE TABLE IF NOT EXISTS "ab_test_assignments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  "experiment_id" uuid NOT NULL REFERENCES "ab_test_experiments"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  
  "variant_id" text NOT NULL,  -- 'control' | 'variant_a' | 'variant_b'
  
  "assigned_at" timestamp DEFAULT now() NOT NULL,
  
  UNIQUE("experiment_id", "user_id")
);

-- 索引
CREATE INDEX IF NOT EXISTS "ab_test_assignments_experiment_idx" ON "ab_test_assignments"("experiment_id");
CREATE INDEX IF NOT EXISTS "ab_test_assignments_user_idx" ON "ab_test_assignments"("user_id");
CREATE INDEX IF NOT EXISTS "ab_test_assignments_variant_idx" ON "ab_test_assignments"("variant_id");

-- 注释
COMMENT ON TABLE "ab_test_assignments" IS '用户实验分组表，记录每个用户分配的变体';
COMMENT ON COLUMN "ab_test_assignments"."variant_id" IS '用户被分配的变体 ID';

-- ===========================================
-- 3. ab_test_events - 事件追踪表
-- ===========================================
CREATE TABLE IF NOT EXISTS "ab_test_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  "experiment_id" uuid NOT NULL REFERENCES "ab_test_experiments"("id") ON DELETE CASCADE,
  "assignment_id" uuid NOT NULL REFERENCES "ab_test_assignments"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  
  "event_type" text NOT NULL,  -- 'view' | 'click' | 'adoption' | 'conversion' | 'reward'
  "event_data" jsonb,  -- { adoptedThemes, creditsUsed, ... }
  
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- 索引
CREATE INDEX IF NOT EXISTS "ab_test_events_experiment_idx" ON "ab_test_events"("experiment_id");
CREATE INDEX IF NOT EXISTS "ab_test_events_assignment_idx" ON "ab_test_events"("assignment_id");
CREATE INDEX IF NOT EXISTS "ab_test_events_user_idx" ON "ab_test_events"("user_id");
CREATE INDEX IF NOT EXISTS "ab_test_events_type_idx" ON "ab_test_events"("event_type");
CREATE INDEX IF NOT EXISTS "ab_test_events_created_at_idx" ON "ab_test_events"("created_at");

-- 注释
COMMENT ON TABLE "ab_test_events" IS '事件追踪表，记录用户在实验中的所有行为';
COMMENT ON COLUMN "ab_test_events"."event_type" IS '事件类型: view/click/adoption/conversion/reward';
COMMENT ON COLUMN "ab_test_events"."event_data" IS '事件附加数据 (JSON)';

-- ===========================================
-- 4. 初始化主题推荐实验
-- ===========================================
INSERT INTO "ab_test_experiments" ("name", "description", "status", "variants", "start_date", "goal_metric", "metadata")
VALUES (
  'theme_recommendation_v1',
  '基于八字特征的主题推荐 A/B 测试',
  'active',
  '[
    { "id": "control", "weight": 50, "config": { "type": "default" } },
    { "id": "variant_a", "weight": 50, "config": { "type": "smart" } }
  ]'::jsonb,
  now(),
  'conversion_rate',
  '{
    "rewardAmount": 10,
    "rewardDescription": "采纳推荐奖励 10 积分"
  }'::jsonb
)
ON CONFLICT (name) DO NOTHING;
