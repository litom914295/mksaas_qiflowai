-- Migration: Add Credit Configuration and Check-in System Tables
-- Generated: 2025-01-13
-- Description: Creates credit_rules, user_check_ins, and check_in_config tables

-- ================================================
-- 1. Credit Rules Configuration Table
-- ================================================
CREATE TABLE IF NOT EXISTS credit_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Rule identification
  rule_key TEXT NOT NULL UNIQUE,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('consumption', 'reward', 'penalty')),
  category TEXT NOT NULL CHECK (category IN ('qiflow', 'engagement', 'referral', 'admin')),
  
  -- Credit configuration
  credit_amount INTEGER NOT NULL,
  
  -- Rule status
  enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- Limit configuration
  daily_limit INTEGER,
  weekly_limit INTEGER,
  monthly_limit INTEGER,
  
  -- Advanced configuration
  vip_multiplier JSONB,
  cooldown_minutes INTEGER,
  conditions JSONB,
  
  -- Description and notes
  description TEXT,
  admin_notes TEXT,
  
  -- Metadata
  created_by TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  updated_by TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for credit_rules
CREATE INDEX IF NOT EXISTS credit_rules_rule_key_idx ON credit_rules(rule_key);
CREATE INDEX IF NOT EXISTS credit_rules_rule_type_idx ON credit_rules(rule_type);
CREATE INDEX IF NOT EXISTS credit_rules_category_idx ON credit_rules(category);
CREATE INDEX IF NOT EXISTS credit_rules_enabled_idx ON credit_rules(enabled);

-- ================================================
-- 2. User Check-ins Table
-- ================================================
CREATE TABLE IF NOT EXISTS user_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  
  -- Check-in date
  check_in_date TIMESTAMP NOT NULL,
  
  -- Consecutive check-in statistics
  consecutive_days INTEGER NOT NULL DEFAULT 1,
  total_check_ins INTEGER NOT NULL DEFAULT 1,
  
  -- Reward records
  base_reward INTEGER NOT NULL DEFAULT 5,
  bonus_reward INTEGER NOT NULL DEFAULT 0,
  total_reward INTEGER NOT NULL,
  
  -- Check-in source
  check_in_source TEXT DEFAULT 'web',
  ip_address TEXT,
  user_agent TEXT,
  
  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for user_check_ins
CREATE INDEX IF NOT EXISTS user_check_ins_user_id_idx ON user_check_ins(user_id);
CREATE INDEX IF NOT EXISTS user_check_ins_check_in_date_idx ON user_check_ins(check_in_date);
CREATE INDEX IF NOT EXISTS user_check_ins_user_date_idx ON user_check_ins(user_id, check_in_date);

-- ================================================
-- 3. Check-in Configuration Table
-- ================================================
CREATE TABLE IF NOT EXISTS check_in_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic configuration
  base_reward INTEGER NOT NULL DEFAULT 5,
  enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- Consecutive check-in rewards
  consecutive_rewards JSONB DEFAULT '[
    {"days": 3, "bonus": 10, "label": "三日奖励"},
    {"days": 7, "bonus": 30, "label": "七日大礼"},
    {"days": 30, "bonus": 100, "label": "月度坚持奖"}
  ]'::jsonb,
  
  -- Milestone rewards
  milestone_rewards JSONB DEFAULT '[
    {"total": 10, "bonus": 20, "label": "新手奖励"},
    {"total": 50, "bonus": 100, "label": "老手奖励"},
    {"total": 100, "bonus": 300, "label": "资深用户"},
    {"total": 365, "bonus": 1000, "label": "年度坚持"}
  ]'::jsonb,
  
  -- Make-up check-in configuration
  allow_makeup BOOLEAN NOT NULL DEFAULT true,
  makeup_cost INTEGER DEFAULT 10,
  max_makeup_days INTEGER DEFAULT 3,
  
  -- VIP bonus multiplier
  vip_bonus_multiplier JSONB DEFAULT '{"basic": 1, "premium": 1.5, "enterprise": 2}'::jsonb,
  
  -- Metadata
  updated_by TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ================================================
-- 4. Insert Default Credit Rules
-- ================================================
INSERT INTO credit_rules (rule_key, rule_name, rule_type, category, credit_amount, description, enabled) VALUES
-- QiFlow Service Consumption
('bazi_analysis', '八字排盘', 'consumption', 'qiflow', -10, '进行一次完整八字排盘分析', true),
('bazi_deep_interpretation', '八字深度解读', 'consumption', 'qiflow', -30, 'AI深度解读八字命盘', true),
('fengshui_analysis', '玄空风水分析', 'consumption', 'qiflow', -20, '玄空飞星风水分析', true),
('ai_chat_message', 'AI聊天消息', 'consumption', 'qiflow', -5, '与AI进行对话(每条消息)', true),
('pdf_export', 'PDF报告导出', 'consumption', 'qiflow', -5, '导出分析报告为PDF', true),

-- User Engagement Rewards
('daily_checkin', '每日签到', 'reward', 'engagement', 5, '每日签到奖励', true, 1),
('first_login', '首次登录', 'reward', 'engagement', 50, '新用户首次登录奖励', true),
('profile_complete', '完善资料', 'reward', 'engagement', 20, '完整填写个人资料', true),
('share_result', '分享结果', 'reward', 'engagement', 3, '分享分析结果到社交媒体', true, 5),

-- Referral Rewards
('successful_referral', '成功推荐', 'reward', 'referral', 100, '成功推荐新用户注册并激活', true),
('referee_bonus', '被推荐人奖励', 'reward', 'referral', 50, '通过推荐码注册的新用户奖励', true),

-- Admin Operations
('admin_credit_adjustment', '管理员积分调整', 'reward', 'admin', 0, '管理员手动调整用户积分', true)
ON CONFLICT (rule_key) DO NOTHING;

-- Note: daily_limit is the 8th column, so we need to adjust the INSERT statement
-- Corrected version:
DELETE FROM credit_rules; -- Clear any partial data
INSERT INTO credit_rules (
  rule_key, 
  rule_name, 
  rule_type, 
  category, 
  credit_amount, 
  description, 
  enabled,
  daily_limit
) VALUES
-- QiFlow Service Consumption
('bazi_analysis', '八字排盘', 'consumption', 'qiflow', -10, '进行一次完整八字排盘分析', true, NULL),
('bazi_deep_interpretation', '八字深度解读', 'consumption', 'qiflow', -30, 'AI深度解读八字命盘', true, NULL),
('fengshui_analysis', '玄空风水分析', 'consumption', 'qiflow', -20, '玄空飞星风水分析', true, NULL),
('ai_chat_message', 'AI聊天消息', 'consumption', 'qiflow', -5, '与AI进行对话(每条消息)', true, NULL),
('pdf_export', 'PDF报告导出', 'consumption', 'qiflow', -5, '导出分析报告为PDF', true, NULL),

-- User Engagement Rewards
('daily_checkin', '每日签到', 'reward', 'engagement', 5, '每日签到奖励', true, 1),
('first_login', '首次登录', 'reward', 'engagement', 50, '新用户首次登录奖励', true, NULL),
('profile_complete', '完善资料', 'reward', 'engagement', 20, '完整填写个人资料', true, NULL),
('share_result', '分享结果', 'reward', 'engagement', 3, '分享分析结果到社交媒体', true, 5),

-- Referral Rewards
('successful_referral', '成功推荐', 'reward', 'referral', 100, '成功推荐新用户注册并激活', true, NULL),
('referee_bonus', '被推荐人奖励', 'reward', 'referral', 50, '通过推荐码注册的新用户奖励', true, NULL),

-- Admin Operations
('admin_credit_adjustment', '管理员积分调整', 'reward', 'admin', 0, '管理员手动调整用户积分', true, NULL)
ON CONFLICT (rule_key) DO NOTHING;

-- ================================================
-- 5. Insert Default Check-in Configuration
-- ================================================
INSERT INTO check_in_config (
  base_reward, 
  enabled, 
  allow_makeup, 
  makeup_cost, 
  max_makeup_days
) VALUES (5, true, true, 10, 3)
ON CONFLICT DO NOTHING;

-- ================================================
-- 6. Add Comments for Documentation
-- ================================================
COMMENT ON TABLE credit_rules IS '积分规则配置表 - 存储系统各类操作的积分消费/奖励规则';
COMMENT ON TABLE user_check_ins IS '用户签到记录表 - 记录用户每日签到信息和奖励';
COMMENT ON TABLE check_in_config IS '签到系统配置表 - 全局签到功能配置';

COMMENT ON COLUMN credit_rules.rule_key IS '规则唯一标识,如 bazi_analysis, daily_checkin';
COMMENT ON COLUMN credit_rules.credit_amount IS '积分数量: 正数=奖励, 负数=消费';
COMMENT ON COLUMN user_check_ins.consecutive_days IS '当前连续签到天数';
COMMENT ON COLUMN user_check_ins.total_check_ins IS '累计签到总次数';

-- Migration completed successfully
