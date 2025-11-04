-- P1 Optimization Schema Changes
-- Created: 2025-10-12
-- Task: P1-001
-- Description: Add instant_previews, leaderboard, posters tables
--              Extend users, referrals, check_ins tables

-- ============================================
-- STEP 1: Extend users table
-- ============================================
ALTER TABLE "users" 
  ADD COLUMN IF NOT EXISTS "member_tier" VARCHAR(20) DEFAULT 'basic' NOT NULL,
  ADD COLUMN IF NOT EXISTS "total_invites" INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS "successful_invites" INTEGER DEFAULT 0 NOT NULL;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS "users_member_tier_idx" ON "users"("member_tier");
CREATE INDEX IF NOT EXISTS "users_successful_invites_idx" ON "users"("successful_invites" DESC);

-- ============================================
-- STEP 2: Extend referrals table
-- ============================================
ALTER TABLE "referrals" 
  ADD COLUMN IF NOT EXISTS "progress" JSONB DEFAULT '{}' NOT NULL,
  ADD COLUMN IF NOT EXISTS "activated_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "reward_tier" VARCHAR(20);

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS "referrals_status_idx" ON "referrals"("status");
CREATE INDEX IF NOT EXISTS "referrals_referrer_id_status_idx" ON "referrals"("referrer_id", "status");

-- ============================================
-- STEP 3: Extend check_ins table (if exists, else create)
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'check_ins') THEN
    ALTER TABLE "check_ins" 
      ADD COLUMN IF NOT EXISTS "reward_credits" INTEGER DEFAULT 2 NOT NULL,
      ADD COLUMN IF NOT EXISTS "milestone_reward" INTEGER DEFAULT 0 NOT NULL;
  ELSE
    CREATE TABLE "check_ins" (
      "id" TEXT NOT NULL,
      "user_id" TEXT NOT NULL,
      "check_in_date" DATE NOT NULL DEFAULT CURRENT_DATE,
      "consecutive_days" INTEGER NOT NULL DEFAULT 1,
      "reward_credits" INTEGER NOT NULL DEFAULT 2,
      "milestone_reward" INTEGER NOT NULL DEFAULT 0,
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT "check_ins_pkey" PRIMARY KEY ("id")
    );

    CREATE UNIQUE INDEX "check_ins_user_id_check_in_date_key" ON "check_ins"("user_id", "check_in_date");
    CREATE INDEX "check_ins_user_id_check_in_date_idx" ON "check_ins"("user_id", "check_in_date" DESC);
    
    ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_user_id_fkey" 
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- ============================================
-- STEP 4: Create instant_previews table
-- ============================================
CREATE TABLE IF NOT EXISTS "instant_previews" (
    "id" TEXT NOT NULL,
    "birth_date" DATE NOT NULL,
    "birth_time" TIME,
    "ip_address" VARCHAR(45),
    "fingerprint" VARCHAR(255),
    "user_agent" TEXT,
    "day_pillar" VARCHAR(10) NOT NULL,
    "wuxing" VARCHAR(10) NOT NULL,
    "wuxing_strength" JSONB NOT NULL,
    "today_fortune" TEXT NOT NULL,
    "favorable" TEXT[],
    "unfavorable" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,

    CONSTRAINT "instant_previews_pkey" PRIMARY KEY ("id")
);

-- Indexes for instant_previews
CREATE INDEX IF NOT EXISTS "instant_previews_ip_address_created_at_idx" ON "instant_previews"("ip_address", "created_at");
CREATE INDEX IF NOT EXISTS "instant_previews_fingerprint_idx" ON "instant_previews"("fingerprint");
CREATE INDEX IF NOT EXISTS "instant_previews_user_id_idx" ON "instant_previews"("user_id");

-- Foreign key for instant_previews
ALTER TABLE "instant_previews" ADD CONSTRAINT "instant_previews_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================
-- STEP 5: Create leaderboard table
-- ============================================
CREATE TABLE IF NOT EXISTS "leaderboard" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "period" VARCHAR(20) NOT NULL,
    "type" VARCHAR(20) NOT NULL DEFAULT 'monthly',
    "total_invites" INTEGER NOT NULL DEFAULT 0,
    "activated_invites" INTEGER NOT NULL DEFAULT 0,
    "earned_credits" INTEGER NOT NULL DEFAULT 0,
    "snapshot_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leaderboard_pkey" PRIMARY KEY ("id")
);

-- Unique constraint for leaderboard
CREATE UNIQUE INDEX IF NOT EXISTS "leaderboard_userId_period_type_key" ON "leaderboard"("user_id", "period", "type");

-- Indexes for leaderboard
CREATE INDEX IF NOT EXISTS "leaderboard_period_type_rank_idx" ON "leaderboard"("period", "type", "rank");

-- Foreign key for leaderboard
ALTER TABLE "leaderboard" ADD CONSTRAINT "leaderboard_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- STEP 6: Create posters table
-- ============================================
CREATE TABLE IF NOT EXISTS "posters" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "analysis_id" TEXT,
    "poster_url" TEXT NOT NULL,
    "poster_type" VARCHAR(20) NOT NULL DEFAULT 'bazi',
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "share_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "posters_pkey" PRIMARY KEY ("id")
);

-- Indexes for posters
CREATE INDEX IF NOT EXISTS "posters_user_id_created_at_idx" ON "posters"("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "posters_analysis_id_idx" ON "posters"("analysis_id");

-- Foreign keys for posters
ALTER TABLE "posters" ADD CONSTRAINT "posters_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "posters" ADD CONSTRAINT "posters_analysis_id_fkey" 
    FOREIGN KEY ("analysis_id") REFERENCES "analyses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================
-- STEP 7: Add comments (optional, for documentation)
-- ============================================
COMMENT ON TABLE "instant_previews" IS '即时体验记录（风控+统计）';
COMMENT ON TABLE "leaderboard" IS '邀请排行榜快照（每日/每月更新）';
COMMENT ON TABLE "posters" IS '分享海报记录';

-- ============================================
-- STEP 8: Grant permissions (if needed)
-- ============================================
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- ============================================
-- Migration completed successfully
-- ============================================
