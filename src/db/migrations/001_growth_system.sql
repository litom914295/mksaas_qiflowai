-- 增长系统数据库迁移
-- Version: 001
-- Description: 创建增长系统相关表和索引

-- =============================================
-- 1. 推荐裂变表
-- =============================================

-- 推荐链接表
CREATE TABLE IF NOT EXISTS referral_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES referral_campaigns(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    reward_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 推荐活动表
CREATE TABLE IF NOT EXISTS referral_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    referrer_reward DECIMAL(10, 2) NOT NULL DEFAULT 0,
    referee_reward DECIMAL(10, 2) NOT NULL DEFAULT 0,
    max_referrals_per_user INTEGER,
    min_purchase_amount DECIMAL(10, 2),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'ended')),
    rules JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 推荐记录表
CREATE TABLE IF NOT EXISTS referral_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_link_id UUID NOT NULL REFERENCES referral_links(id) ON DELETE CASCADE,
    referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    referee_email VARCHAR(255),
    referee_phone VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'registered', 'activated', 'rewarded', 'failed')),
    referrer_reward_status VARCHAR(20) DEFAULT 'pending' CHECK (referrer_reward_status IN ('pending', 'eligible', 'paid', 'failed')),
    referee_reward_status VARCHAR(20) DEFAULT 'pending' CHECK (referee_reward_status IN ('pending', 'eligible', 'paid', 'failed')),
    referrer_reward_amount DECIMAL(10, 2),
    referee_reward_amount DECIMAL(10, 2),
    activation_date TIMESTAMP WITH TIME ZONE,
    reward_date TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 2. 积分系统表
-- =============================================

-- 用户积分余额表
CREATE TABLE IF NOT EXISTS user_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
    total_earned DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_spent DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_expired DECIMAL(10, 2) NOT NULL DEFAULT 0,
    locked_balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
    level INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 积分交易记录表
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('earn', 'spend', 'expire', 'adjust', 'lock', 'unlock')),
    amount DECIMAL(10, 2) NOT NULL,
    balance_before DECIMAL(10, 2) NOT NULL,
    balance_after DECIMAL(10, 2) NOT NULL,
    reason VARCHAR(255) NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    task_id VARCHAR(100),
    expires_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 积分任务配置表
CREATE TABLE IF NOT EXISTS credit_tasks (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    credits INTEGER NOT NULL,
    enabled BOOLEAN DEFAULT true,
    repeatable BOOLEAN DEFAULT false,
    daily_limit INTEGER,
    total_limit INTEGER,
    cooldown_minutes INTEGER,
    requirements JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 积分兑换项目表
CREATE TABLE IF NOT EXISTS credit_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('coupon', 'product', 'service', 'privilege')),
    cost INTEGER NOT NULL,
    value DECIMAL(10, 2),
    stock INTEGER,
    max_per_user INTEGER,
    enabled BOOLEAN DEFAULT true,
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 兑换记录表
CREATE TABLE IF NOT EXISTS redemption_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    redemption_id UUID NOT NULL REFERENCES credit_redemptions(id),
    transaction_id UUID REFERENCES credit_transactions(id),
    credits_spent INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'
);

-- =============================================
-- 3. 分享传播表
-- =============================================

-- 分享记录表
CREATE TABLE IF NOT EXISTS share_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL,
    content_id VARCHAR(255) NOT NULL,
    platform VARCHAR(30) NOT NULL CHECK (platform IN ('wechat', 'weibo', 'qq', 'douyin', 'xiaohongshu', 'twitter', 'facebook', 'other')),
    share_url TEXT NOT NULL,
    short_url VARCHAR(255),
    click_count INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,
    reward_earned DECIMAL(10, 2) DEFAULT 0,
    ip_address INET,
    device_info JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 分享点击记录表
CREATE TABLE IF NOT EXISTS share_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_id UUID NOT NULL REFERENCES share_records(id) ON DELETE CASCADE,
    visitor_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    converted BOOLEAN DEFAULT false,
    converted_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 4. 增长指标表
-- =============================================

-- 增长指标快照表
CREATE TABLE IF NOT EXISTS growth_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(20, 4) NOT NULL,
    dimension_1 VARCHAR(100),
    dimension_2 VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, metric_type, metric_name, dimension_1, dimension_2)
);

-- 用户生命周期价值表
CREATE TABLE IF NOT EXISTS user_ltv (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    acquisition_channel VARCHAR(100),
    acquisition_cost DECIMAL(10, 2),
    total_revenue DECIMAL(10, 2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    first_purchase_date DATE,
    last_purchase_date DATE,
    churn_probability DECIMAL(5, 4),
    predicted_ltv DECIMAL(10, 2),
    segment VARCHAR(50),
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 5. 风控管理表
-- =============================================

-- 黑名单表
CREATE TABLE IF NOT EXISTS fraud_blacklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('user', 'ip', 'device', 'email', 'phone')),
    value VARCHAR(255) NOT NULL,
    reason VARCHAR(255) NOT NULL,
    risk_score DECIMAL(3, 2) CHECK (risk_score >= 0 AND risk_score <= 1),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(type, value)
);

-- 风控事件日志表
CREATE TABLE IF NOT EXISTS fraud_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL,
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    risk_score DECIMAL(3, 2),
    action_taken VARCHAR(50),
    ip_address INET,
    device_fingerprint VARCHAR(255),
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 风控规则表
CREATE TABLE IF NOT EXISTS fraud_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rule_type VARCHAR(50) NOT NULL,
    conditions JSONB NOT NULL,
    actions JSONB NOT NULL,
    priority INTEGER DEFAULT 0,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 6. 创建索引
-- =============================================

-- 推荐系统索引
CREATE INDEX idx_referral_links_user_id ON referral_links(user_id);
CREATE INDEX idx_referral_links_code ON referral_links(code);
CREATE INDEX idx_referral_links_status ON referral_links(status) WHERE status = 'active';
CREATE INDEX idx_referral_links_expires_at ON referral_links(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_referral_records_referrer_id ON referral_records(referrer_id);
CREATE INDEX idx_referral_records_referee_id ON referral_records(referee_id);
CREATE INDEX idx_referral_records_status ON referral_records(status);
CREATE INDEX idx_referral_records_created_at ON referral_records(created_at);

-- 积分系统索引
CREATE INDEX idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_type ON credit_transactions(type);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at);
CREATE INDEX idx_credit_transactions_task_id ON credit_transactions(task_id) WHERE task_id IS NOT NULL;
CREATE INDEX idx_redemption_records_user_id ON redemption_records(user_id);
CREATE INDEX idx_redemption_records_status ON redemption_records(status);

-- 分享系统索引
CREATE INDEX idx_share_records_user_id ON share_records(user_id);
CREATE INDEX idx_share_records_platform ON share_records(platform);
CREATE INDEX idx_share_records_created_at ON share_records(created_at);
CREATE INDEX idx_share_clicks_share_id ON share_clicks(share_id);
CREATE INDEX idx_share_clicks_converted ON share_clicks(converted) WHERE converted = true;

-- 增长指标索引
CREATE INDEX idx_growth_metrics_date ON growth_metrics(date);
CREATE INDEX idx_growth_metrics_type_name ON growth_metrics(metric_type, metric_name);
CREATE INDEX idx_growth_metrics_composite ON growth_metrics(date, metric_type, metric_name);
CREATE INDEX idx_user_ltv_user_id ON user_ltv(user_id);
CREATE INDEX idx_user_ltv_segment ON user_ltv(segment);

-- 风控系统索引
CREATE INDEX idx_fraud_blacklist_type_value ON fraud_blacklist(type, value);
CREATE INDEX idx_fraud_blacklist_expires_at ON fraud_blacklist(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_fraud_events_user_id ON fraud_events(user_id);
CREATE INDEX idx_fraud_events_risk_level ON fraud_events(risk_level);
CREATE INDEX idx_fraud_events_created_at ON fraud_events(created_at);
CREATE INDEX idx_fraud_rules_enabled ON fraud_rules(enabled) WHERE enabled = true;

-- =============================================
-- 7. 创建触发器
-- =============================================

-- 更新时间戳触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 应用触发器到相关表
CREATE TRIGGER update_referral_links_updated_at BEFORE UPDATE ON referral_links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referral_campaigns_updated_at BEFORE UPDATE ON referral_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referral_records_updated_at BEFORE UPDATE ON referral_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_credits_updated_at BEFORE UPDATE ON user_credits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credit_tasks_updated_at BEFORE UPDATE ON credit_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credit_redemptions_updated_at BEFORE UPDATE ON credit_redemptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fraud_rules_updated_at BEFORE UPDATE ON fraud_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 8. 创建视图
-- =============================================

-- 用户增长概览视图
CREATE OR REPLACE VIEW v_user_growth_summary AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as new_users,
    COUNT(CASE WHEN referee_id IS NOT NULL THEN 1 END) as referred_users,
    AVG(CASE WHEN referee_id IS NOT NULL THEN 1 ELSE 0 END) as referral_rate
FROM users
GROUP BY DATE(created_at);

-- 积分统计视图
CREATE OR REPLACE VIEW v_credit_statistics AS
SELECT 
    uc.user_id,
    u.email,
    uc.balance,
    uc.total_earned,
    uc.total_spent,
    uc.level,
    COUNT(ct.id) as transaction_count,
    MAX(ct.created_at) as last_transaction
FROM user_credits uc
LEFT JOIN users u ON uc.user_id = u.id
LEFT JOIN credit_transactions ct ON uc.user_id = ct.user_id
GROUP BY uc.user_id, u.email, uc.balance, uc.total_earned, uc.total_spent, uc.level;

-- =============================================
-- 9. 初始化数据
-- =============================================

-- 插入默认积分任务
INSERT INTO credit_tasks (id, name, description, category, credits, enabled, repeatable, daily_limit) VALUES
('signup', '新用户注册', '完成注册获得积分', 'onboarding', 100, true, false, null),
('first_invite', '首次邀请好友', '成功邀请第一个好友', 'referral', 50, true, false, null),
('daily_login', '每日登录', '每天首次登录获得积分', 'engagement', 10, true, true, 1),
('share_content', '分享内容', '分享内容到社交平台', 'social', 20, true, true, 3),
('complete_profile', '完善资料', '完善个人资料信息', 'onboarding', 30, true, false, null),
('first_purchase', '首次消费', '完成首次购买', 'transaction', 200, true, false, null),
('write_review', '发表评价', '对产品或服务发表评价', 'engagement', 15, true, true, 5),
('verify_email', '验证邮箱', '验证邮箱地址', 'onboarding', 20, true, false, null),
('bind_phone', '绑定手机', '绑定手机号码', 'onboarding', 20, true, false, null);

-- 插入默认兑换项目
INSERT INTO credit_redemptions (name, description, type, cost, value, stock, enabled) VALUES
('10元优惠券', '满50元可用', 'coupon', 100, 10.00, 1000, true),
('50元优惠券', '满200元可用', 'coupon', 450, 50.00, 500, true),
('100元优惠券', '满500元可用', 'coupon', 800, 100.00, 200, true),
('VIP会员1个月', '享受VIP会员权益', 'privilege', 1000, 99.00, null, true),
('高级功能解锁', '解锁全部高级功能', 'service', 500, 49.00, null, true);

-- 创建注释
COMMENT ON TABLE referral_links IS '推荐链接表';
COMMENT ON TABLE referral_campaigns IS '推荐活动表';
COMMENT ON TABLE referral_records IS '推荐记录表';
COMMENT ON TABLE user_credits IS '用户积分余额表';
COMMENT ON TABLE credit_transactions IS '积分交易记录表';
COMMENT ON TABLE credit_tasks IS '积分任务配置表';
COMMENT ON TABLE credit_redemptions IS '积分兑换项目表';
COMMENT ON TABLE redemption_records IS '兑换记录表';
COMMENT ON TABLE share_records IS '分享记录表';
COMMENT ON TABLE share_clicks IS '分享点击记录表';
COMMENT ON TABLE growth_metrics IS '增长指标快照表';
COMMENT ON TABLE user_ltv IS '用户生命周期价值表';
COMMENT ON TABLE fraud_blacklist IS '风控黑名单表';
COMMENT ON TABLE fraud_events IS '风控事件日志表';
COMMENT ON TABLE fraud_rules IS '风控规则表';