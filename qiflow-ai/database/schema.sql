-- QiFlow AI MVP 数据库架构
-- 创建日期: 2025-01-01
-- 版本: 1.0

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 创建自定义类型
CREATE TYPE user_role AS ENUM ('guest', 'user', 'premium', 'admin');
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'cancelled', 'expired');
CREATE TYPE analysis_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE house_type AS ENUM ('apartment', 'house', 'villa', 'office', 'shop');

-- 1. 用户认证相关表

-- 用户表 (扩展Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    role user_role DEFAULT 'user',
    
    -- 个人信息 (加密存储)
    birth_date_encrypted BYTEA,
    birth_time_encrypted BYTEA,
    birth_location_encrypted BYTEA,
    phone_encrypted BYTEA,
    
    -- 偏好设置
    preferred_locale VARCHAR(10) DEFAULT 'zh-CN',
    timezone VARCHAR(50) DEFAULT 'Asia/Shanghai',
    
    -- 系统字段
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true
);

-- 游客会话表
CREATE TABLE public.guest_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    
    -- 设备指纹和元数据
    device_fingerprint VARCHAR(255),
    user_agent TEXT,
    ip_address INET,
    metadata JSONB DEFAULT '{}',
    
    -- 临时用户信息 (加密存储)
    temp_birth_date_encrypted BYTEA,
    temp_birth_time_encrypted BYTEA,
    temp_birth_location_encrypted BYTEA,
    temp_contact_encrypted BYTEA,
    
    -- 会话管理
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    renewed_at TIMESTAMPTZ,
    renewal_count INTEGER DEFAULT 0,
    
    -- 使用限制和统计
    analysis_count INTEGER DEFAULT 0,
    max_analyses INTEGER DEFAULT 3,
    ai_queries_count INTEGER DEFAULT 0,
    max_ai_queries INTEGER DEFAULT 10,
    
    -- 状态管理
    is_active BOOLEAN DEFAULT true,
    merged_to_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    merged_at TIMESTAMPTZ
);

-- 游客会话索引
CREATE INDEX idx_guest_sessions_token ON public.guest_sessions(session_token);
CREATE INDEX idx_guest_sessions_expires ON public.guest_sessions(expires_at);
CREATE INDEX idx_guest_sessions_fingerprint ON public.guest_sessions(device_fingerprint);
CREATE INDEX idx_guest_sessions_merged ON public.guest_sessions(merged_to_user_id) WHERE merged_to_user_id IS NOT NULL;

-- 游客会话合并函数
CREATE OR REPLACE FUNCTION merge_guest_session_to_user(
    guest_session_id UUID,
    user_id UUID
) RETURNS VOID AS $$
BEGIN
    -- 迁移临时用户信息到用户表 (如果用户表中对应字段为空)
    UPDATE public.users SET
        birth_date_encrypted = COALESCE(
            birth_date_encrypted,
            (SELECT temp_birth_date_encrypted FROM public.guest_sessions WHERE id = guest_session_id)
        ),
        birth_time_encrypted = COALESCE(
            birth_time_encrypted,
            (SELECT temp_birth_time_encrypted FROM public.guest_sessions WHERE id = guest_session_id)
        ),
        birth_location_encrypted = COALESCE(
            birth_location_encrypted,
            (SELECT temp_birth_location_encrypted FROM public.guest_sessions WHERE id = guest_session_id)
        ),
        phone_encrypted = COALESCE(
            phone_encrypted,
            (SELECT temp_contact_encrypted FROM public.guest_sessions WHERE id = guest_session_id)
        ),
        updated_at = NOW()
    WHERE id = user_id;

    -- 迁移游客的房屋数据到用户
    UPDATE public.houses SET
        user_id = user_id,
        guest_session_id = NULL
    WHERE guest_session_id = guest_session_id;

    -- 迁移游客的风水分析数据到用户
    UPDATE public.fengshui_analyses SET
        user_id = user_id,
        guest_session_id = NULL
    WHERE guest_session_id = guest_session_id;

    -- 迁移游客的八字计算数据到用户
    UPDATE public.bazi_calculations SET
        user_id = user_id,
        guest_session_id = NULL
    WHERE guest_session_id = guest_session_id;
END;
$$ LANGUAGE plpgsql;

-- 2. 八字计算相关表

-- 八字计算结果表
CREATE TABLE public.bazi_calculations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    guest_session_id UUID REFERENCES public.guest_sessions(id) ON DELETE CASCADE,
    
    -- 输入信息
    birth_date DATE NOT NULL,
    birth_time TIME NOT NULL,
    birth_location JSONB NOT NULL, -- {latitude, longitude, timezone, address}
    gender VARCHAR(10), -- 'male', 'female', 'other'
    
    -- 八字结果
    year_pillar JSONB NOT NULL, -- {heavenly_stem, earthly_branch}
    month_pillar JSONB NOT NULL,
    day_pillar JSONB NOT NULL,
    hour_pillar JSONB NOT NULL,
    
    -- 五行分析
    five_elements JSONB NOT NULL, -- {wood, fire, earth, metal, water}
    element_strength JSONB NOT NULL,
    favorable_elements JSONB,
    unfavorable_elements JSONB,
    
    -- 大运流年
    major_periods JSONB, -- 大运信息
    annual_fortunes JSONB, -- 流年信息
    
    -- 系统字段
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 确保用户或游客会话二选一
    CONSTRAINT check_user_or_guest CHECK (
        (user_id IS NOT NULL AND guest_session_id IS NULL) OR
        (user_id IS NULL AND guest_session_id IS NOT NULL)
    )
);

-- 3. 风水分析相关表

-- 房屋信息表
CREATE TABLE public.houses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    guest_session_id UUID REFERENCES public.guest_sessions(id) ON DELETE CASCADE,
    
    -- 基本信息
    name VARCHAR(100) NOT NULL,
    house_type house_type NOT NULL,
    address TEXT,
    
    -- 地理信息
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    facing_direction INTEGER, -- 0-359度
    
    -- 户型图信息
    floor_plan_url TEXT,
    floor_plan_data JSONB, -- 户型图矢量数据
    rooms JSONB, -- 房间信息数组
    
    -- 建筑信息
    build_year INTEGER,
    floors INTEGER,
    area_sqm DECIMAL(10, 2),
    
    -- 系统字段
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    
    -- 确保用户或游客会话二选一
    CONSTRAINT check_user_or_guest CHECK (
        (user_id IS NOT NULL AND guest_session_id IS NULL) OR
        (user_id IS NULL AND guest_session_id IS NOT NULL)
    )
);

-- 风水分析结果表
CREATE TABLE public.fengshui_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    guest_session_id UUID REFERENCES public.guest_sessions(id) ON DELETE CASCADE,
    house_id UUID REFERENCES public.houses(id) ON DELETE CASCADE,
    bazi_calculation_id UUID REFERENCES public.bazi_calculations(id) ON DELETE SET NULL,
    
    -- 分析配置
    analysis_type VARCHAR(50) NOT NULL, -- 'xuankong', 'bazhai', 'comprehensive'
    analysis_year INTEGER NOT NULL,
    
    -- 飞星分析结果
    flying_stars JSONB, -- 九宫飞星布局
    star_combinations JSONB, -- 星曜组合分析
    
    -- 房间评分
    room_scores JSONB, -- 各房间风水评分
    overall_score INTEGER, -- 整体评分 0-100
    
    -- AI分析结果
    ai_analysis JSONB, -- GPT分析结果
    recommendations JSONB, -- 改善建议
    
    -- 个性化建议 (基于八字)
    personalized_tips JSONB,
    favorable_areas JSONB,
    unfavorable_areas JSONB,
    
    -- 状态管理
    status analysis_status DEFAULT 'pending',
    error_message TEXT,
    processing_time_ms INTEGER,
    
    -- 系统字段
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 确保用户或游客会话二选一
    CONSTRAINT check_user_or_guest CHECK (
        (user_id IS NOT NULL AND guest_session_id IS NULL) OR
        (user_id IS NULL AND guest_session_id IS NOT NULL)
    )
);

-- 4. 订阅支付相关表

-- 订阅计划表
CREATE TABLE public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- 定价信息
    price_monthly DECIMAL(10, 2),
    price_yearly DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'CNY',
    
    -- 功能限制
    max_houses INTEGER,
    max_analyses_per_month INTEGER,
    max_ai_queries_per_month INTEGER,
    
    -- 功能权限
    features JSONB, -- 功能列表
    
    -- 系统字段
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0
);

-- 用户订阅表
CREATE TABLE public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
    
    -- 订阅信息
    status subscription_status DEFAULT 'active',
    billing_cycle VARCHAR(20), -- 'monthly', 'yearly'
    
    -- 时间管理
    started_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    cancelled_at TIMESTAMPTZ,
    
    -- 支付信息
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    
    -- 系统字段
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 使用配额表
CREATE TABLE public.usage_quotas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- 配额信息
    quota_type VARCHAR(50) NOT NULL, -- 'analyses', 'ai_queries', 'houses'
    quota_limit INTEGER NOT NULL,
    quota_used INTEGER DEFAULT 0,
    
    -- 重置周期
    reset_period VARCHAR(20) NOT NULL, -- 'monthly', 'yearly', 'never'
    last_reset_at TIMESTAMPTZ DEFAULT NOW(),
    next_reset_at TIMESTAMPTZ,
    
    -- 系统字段
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, quota_type)
);

-- 5. 系统日志表

-- API调用日志
CREATE TABLE public.api_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    guest_session_id UUID REFERENCES public.guest_sessions(id) ON DELETE SET NULL,
    
    -- 请求信息
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    
    -- 响应信息
    status_code INTEGER,
    response_time_ms INTEGER,
    error_message TEXT,
    
    -- 系统字段
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_created_at ON public.users(created_at);

CREATE INDEX idx_guest_sessions_token ON public.guest_sessions(session_token);
CREATE INDEX idx_guest_sessions_expires ON public.guest_sessions(expires_at);

CREATE INDEX idx_bazi_user_id ON public.bazi_calculations(user_id);
CREATE INDEX idx_bazi_guest_session_id ON public.bazi_calculations(guest_session_id);
CREATE INDEX idx_bazi_created_at ON public.bazi_calculations(created_at);

CREATE INDEX idx_houses_user_id ON public.houses(user_id);
CREATE INDEX idx_houses_guest_session_id ON public.houses(guest_session_id);
CREATE INDEX idx_houses_location ON public.houses(latitude, longitude);

CREATE INDEX idx_fengshui_analyses_user_id ON public.fengshui_analyses(user_id);
CREATE INDEX idx_fengshui_analyses_house_id ON public.fengshui_analyses(house_id);
CREATE INDEX idx_fengshui_analyses_status ON public.fengshui_analyses(status);
CREATE INDEX idx_fengshui_analyses_created_at ON public.fengshui_analyses(created_at);

CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_expires_at ON public.user_subscriptions(expires_at);

CREATE INDEX idx_usage_quotas_user_id ON public.usage_quotas(user_id);
CREATE INDEX idx_usage_quotas_type ON public.usage_quotas(quota_type);

CREATE INDEX idx_api_logs_created_at ON public.api_logs(created_at);
CREATE INDEX idx_api_logs_endpoint ON public.api_logs(endpoint);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加更新时间触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bazi_calculations_updated_at BEFORE UPDATE ON public.bazi_calculations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_houses_updated_at BEFORE UPDATE ON public.houses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fengshui_analyses_updated_at BEFORE UPDATE ON public.fengshui_analyses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_quotas_updated_at BEFORE UPDATE ON public.usage_quotas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 启用 RLS 与策略（用户侧：仅访问自己数据；游客数据仅服务端迁移使用）
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bazi_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fengshui_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_sessions ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己 user_id 的数据（服务端使用 service role 迁移游客数据）
CREATE POLICY users_self_select ON public.users
  FOR SELECT USING (id = auth.uid());
CREATE POLICY users_self_update ON public.users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY bazi_user_only ON public.bazi_calculations
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY houses_user_only ON public.houses
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY analyses_user_only ON public.fengshui_analyses
  FOR ALL USING (user_id = auth.uid());

-- 游客会话不允许匿名直接访问（通过服务端 service role 访问）
CREATE POLICY guest_sessions_deny_all ON public.guest_sessions
  FOR ALL USING (false);