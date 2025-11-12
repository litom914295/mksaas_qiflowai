-- Phase 8: Pro 月度运势表
-- 用于存储用户的月度运势分析结果

CREATE TABLE IF NOT EXISTS "monthly_fortunes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  
  -- 时间范围
  "year" integer NOT NULL,
  "month" integer NOT NULL,
  
  -- 运势数据 (包含整体评分、吉祥方位颜色数字、各方面预测)
  "fortune_data" jsonb NOT NULL,
  
  -- 飞星分析 (月度飞星布局、凶煞方位、化解方法)
  "flying_star_analysis" jsonb,
  
  -- 八字流年流月分析 (流年月柱、刑冲合害、五行强弱)
  "bazi_timeliness" jsonb,
  
  -- 生成状态
  "status" text NOT NULL DEFAULT 'pending',
  -- 'pending' → 'generating' → 'completed' | 'failed'
  
  "generated_at" timestamp,
  "notified_at" timestamp,
  
  -- AI 成本与元数据
  "credits_used" integer DEFAULT 0,
  "metadata" jsonb,
  
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- 索引优化
CREATE INDEX "monthly_fortunes_user_id_idx" ON "monthly_fortunes"("user_id");
CREATE INDEX "monthly_fortunes_year_month_idx" ON "monthly_fortunes"("year", "month");
CREATE INDEX "monthly_fortunes_status_idx" ON "monthly_fortunes"("status");

-- 唯一约束: 每人每月只能有一份运势
CREATE UNIQUE INDEX "monthly_fortunes_user_year_month_unique" 
  ON "monthly_fortunes"("user_id", "year", "month");

-- 添加注释
COMMENT ON TABLE "monthly_fortunes" IS 'Pro 用户月度运势分析表 (Phase 8)';
COMMENT ON COLUMN "monthly_fortunes"."fortune_data" IS '运势数据 JSON: 整体评分、吉祥方位颜色数字、事业健康感情财运预测';
COMMENT ON COLUMN "monthly_fortunes"."flying_star_analysis" IS '玄空飞星月度布局分析';
COMMENT ON COLUMN "monthly_fortunes"."bazi_timeliness" IS '八字流年流月时运分析';
COMMENT ON COLUMN "monthly_fortunes"."notified_at" IS '推送通知时间戳 (用于避免重复推送)';
