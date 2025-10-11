-- 推荐系统数据库迁移脚本
-- 执行前请确保已连接到正确的数据库

-- ========================================
-- 1. 推荐关系表
-- ========================================
CREATE TABLE IF NOT EXISTS referral_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id VARCHAR(255) NOT NULL,      -- 推荐人
  referee_id VARCHAR(255) NOT NULL,       -- 被推荐人
  referral_code VARCHAR(20),              -- 使用的推荐码
  level INTEGER DEFAULT 1,                -- 推荐层级(1=直接,2=间接)
  status VARCHAR(20) DEFAULT 'pending',   -- pending/active/expired
  reward_granted BOOLEAN DEFAULT false,   -- 是否已发放奖励
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activated_at TIMESTAMP,                 -- 激活时间
  CONSTRAINT fk_referrer FOREIGN KEY (referrer_id) REFERENCES "user"(id) ON DELETE CASCADE,
  CONSTRAINT fk_referee FOREIGN KEY (referee_id) REFERENCES "user"(id) ON DELETE CASCADE,
  CONSTRAINT unique_referral UNIQUE(referrer_id, referee_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_referral_referrer ON referral_relationships(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_referee ON referral_relationships(referee_id);
CREATE INDEX IF NOT EXISTS idx_referral_status ON referral_relationships(status);
CREATE INDEX IF NOT EXISTS idx_referral_code ON referral_relationships(referral_code);

-- ========================================
-- 2. 推荐码表
-- ========================================
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,       -- 推荐码
  user_id VARCHAR(255) NOT NULL,          -- 所属用户
  custom_code VARCHAR(20),                -- VIP自定义码
  usage_count INTEGER DEFAULT 0,          -- 使用次数
  max_usage INTEGER,                      -- 最大使用次数
  total_rewards INTEGER DEFAULT 0,        -- 累计奖励积分
  expire_at TIMESTAMP,                    -- 过期时间
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_code_user FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_code_user ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_code_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_code_custom ON referral_codes(custom_code);

-- ========================================
-- 3. 分享记录表
-- ========================================
CREATE TABLE IF NOT EXISTS share_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  share_type VARCHAR(50) NOT NULL,        -- dailyFortune/baziAnalysis等
  platform VARCHAR(20),                   -- wechat/weibo/douyin等
  share_url TEXT,                         -- 分享链接
  click_count INTEGER DEFAULT 0,          -- 点击次数
  conversion_count INTEGER DEFAULT 0,     -- 转化次数
  reward_granted BOOLEAN DEFAULT false,   -- 是否已发放奖励
  reward_amount INTEGER DEFAULT 0,        -- 奖励积分数
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_share_user FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_share_user ON share_records(user_id);
CREATE INDEX IF NOT EXISTS idx_share_type ON share_records(share_type);
CREATE INDEX IF NOT EXISTS idx_share_user_type ON share_records(user_id, share_type);
CREATE INDEX IF NOT EXISTS idx_share_created ON share_records(created_at DESC);

-- ========================================
-- 4. 任务进度表
-- ========================================
CREATE TABLE IF NOT EXISTS task_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  task_id VARCHAR(50) NOT NULL,           -- 任务ID
  task_type VARCHAR(20),                  -- daily/weekly/achievement
  progress INTEGER DEFAULT 0,             -- 当前进度
  target INTEGER NOT NULL,                -- 目标值
  completed BOOLEAN DEFAULT false,        -- 是否完成
  reward_claimed BOOLEAN DEFAULT false,   -- 是否已领取奖励
  completed_at TIMESTAMP,                 -- 完成时间
  reset_at TIMESTAMP,                     -- 重置时间(每日/每周任务)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_task_user FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE,
  CONSTRAINT unique_task_user UNIQUE(user_id, task_id, reset_at)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_task_user ON task_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_task_type ON task_progress(task_type);
CREATE INDEX IF NOT EXISTS idx_task_user_type ON task_progress(user_id, task_type);
CREATE INDEX IF NOT EXISTS idx_task_reset ON task_progress(reset_at);

-- ========================================
-- 5. 成就记录表
-- ========================================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  achievement_id VARCHAR(50) NOT NULL,    -- 成就ID
  achievement_name VARCHAR(100),          -- 成就名称
  achievement_level INTEGER DEFAULT 1,    -- 成就等级
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reward_amount INTEGER,                  -- 奖励积分
  CONSTRAINT fk_achievement_user FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_achievement UNIQUE(user_id, achievement_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_achievement_user ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievement_unlocked ON achievements(unlocked_at DESC);

-- ========================================
-- 6. 用户统计扩展表(存储推荐相关统计)
-- ========================================
CREATE TABLE IF NOT EXISTS user_referral_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) UNIQUE NOT NULL,
  direct_referrals INTEGER DEFAULT 0,     -- 直接推荐数
  indirect_referrals INTEGER DEFAULT 0,   -- 间接推荐数
  total_referral_rewards INTEGER DEFAULT 0, -- 总推荐奖励
  total_shares INTEGER DEFAULT 0,         -- 总分享数
  total_share_clicks INTEGER DEFAULT 0,   -- 总分享点击数
  total_share_conversions INTEGER DEFAULT 0, -- 总分享转化数
  referral_level VARCHAR(50),             -- 推荐等级称号
  last_referral_at TIMESTAMP,             -- 最后推荐时间
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_stats_user FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_stats_user ON user_referral_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_stats_level ON user_referral_stats(referral_level);

-- ========================================
-- 7. 为每个现有用户生成推荐码
-- ========================================
DO $$
DECLARE
    user_record RECORD;
    generated_code VARCHAR(20);
BEGIN
    FOR user_record IN SELECT id FROM "user" LOOP
        -- 生成6位推荐码 (QF + 4位随机数字)
        generated_code := 'QF' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        
        -- 确保推荐码唯一
        WHILE EXISTS(SELECT 1 FROM referral_codes WHERE code = generated_code) LOOP
            generated_code := 'QF' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        END LOOP;
        
        -- 插入推荐码
        INSERT INTO referral_codes (code, user_id)
        VALUES (generated_code, user_record.id)
        ON CONFLICT (user_id) DO NOTHING;
        
        -- 初始化用户统计
        INSERT INTO user_referral_stats (user_id)
        VALUES (user_record.id)
        ON CONFLICT (user_id) DO NOTHING;
    END LOOP;
END $$;

-- ========================================
-- 8. 创建触发器函数：自动为新用户生成推荐码
-- ========================================
CREATE OR REPLACE FUNCTION generate_referral_code_for_new_user()
RETURNS TRIGGER AS $$
DECLARE
    generated_code VARCHAR(20);
BEGIN
    -- 生成推荐码
    generated_code := 'QF' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    -- 确保唯一
    WHILE EXISTS(SELECT 1 FROM referral_codes WHERE code = generated_code) LOOP
        generated_code := 'QF' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    END LOOP;
    
    -- 插入推荐码
    INSERT INTO referral_codes (code, user_id)
    VALUES (generated_code, NEW.id);
    
    -- 初始化统计
    INSERT INTO user_referral_stats (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS trigger_generate_referral_code ON "user";
CREATE TRIGGER trigger_generate_referral_code
    AFTER INSERT ON "user"
    FOR EACH ROW
    EXECUTE FUNCTION generate_referral_code_for_new_user();

-- ========================================
-- 9. 创建视图：推荐排行榜
-- ========================================
CREATE OR REPLACE VIEW referral_leaderboard AS
SELECT 
    u.id,
    u.name,
    u.email,
    urs.direct_referrals,
    urs.indirect_referrals,
    urs.total_referral_rewards,
    urs.referral_level,
    rc.code as referral_code,
    RANK() OVER (ORDER BY urs.direct_referrals DESC) as rank
FROM "user" u
JOIN user_referral_stats urs ON u.id = urs.user_id
LEFT JOIN referral_codes rc ON u.id = rc.user_id AND rc.custom_code IS NULL
WHERE urs.direct_referrals > 0
ORDER BY urs.direct_referrals DESC;

-- ========================================
-- 10. 授权说明
-- ========================================
-- 请确保应用程序用户有适当的权限
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;