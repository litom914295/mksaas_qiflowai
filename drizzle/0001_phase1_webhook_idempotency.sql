-- Phase 1: Webhook 幂等性表
-- 用于防止重复处理 Stripe Webhook 事件

CREATE TABLE IF NOT EXISTS "stripe_webhook_events" (
  "id" text PRIMARY KEY,  -- Stripe event.id (天然唯一)
  "event_type" text NOT NULL,  -- 'invoice.paid', 'customer.subscription.updated', etc.
  "processed_at" timestamp DEFAULT now() NOT NULL,
  "payload" jsonb NOT NULL,  -- 完整 event 对象
  "success" boolean DEFAULT true NOT NULL,
  "error_message" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- 索引加速查询
CREATE INDEX IF NOT EXISTS "stripe_webhook_events_event_type_idx" ON "stripe_webhook_events"("event_type");
CREATE INDEX IF NOT EXISTS "stripe_webhook_events_processed_at_idx" ON "stripe_webhook_events"("processed_at");

-- 添加注释
COMMENT ON TABLE "stripe_webhook_events" IS 'Stripe Webhook 事件日志表，用于幂等性检查和调试';
COMMENT ON COLUMN "stripe_webhook_events"."id" IS 'Stripe Event ID (evt_xxx), 天然唯一';
COMMENT ON COLUMN "stripe_webhook_events"."success" IS '处理是否成功 (true=成功, false=失败)';
