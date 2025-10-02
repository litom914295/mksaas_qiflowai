-- QiFlow AI 敏感数据加密存储机制
-- 创建日期: 2025-01-01
-- 版本: 1.0

-- 确保pgcrypto扩展已启用
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 创建加密密钥管理函数
CREATE OR REPLACE FUNCTION get_encryption_key()
RETURNS TEXT AS $$
BEGIN
    -- 从环境变量或配置中获取加密密钥
    -- 在生产环境中，这应该从安全的密钥管理系统获取
    RETURN current_setting('app.encryption_key', true);
EXCEPTION
    WHEN OTHERS THEN
        -- 如果没有设置密钥，使用默认值（仅用于开发环境）
        RETURN 'qiflow_ai_default_key_2025';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建数据加密函数
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(data TEXT)
RETURNS BYTEA AS $$
BEGIN
    IF data IS NULL OR data = '' THEN
        RETURN NULL;
    END IF;
    
    RETURN pgp_sym_encrypt(data, get_encryption_key());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建数据解密函数
CREATE OR REPLACE FUNCTION decrypt_sensitive_data(encrypted_data BYTEA)
RETURNS TEXT AS $$
BEGIN
    IF encrypted_data IS NULL THEN
        RETURN NULL;
    END IF;
    
    RETURN pgp_sym_decrypt(encrypted_data, get_encryption_key());
EXCEPTION
    WHEN OTHERS THEN
        -- 解密失败时返回NULL，避免应用崩溃
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建用户敏感数据加密触发器函数
CREATE OR REPLACE FUNCTION encrypt_user_sensitive_data()
RETURNS TRIGGER AS $$
BEGIN
    -- 加密出生日期
    IF NEW.birth_date_encrypted IS NULL AND TG_ARGV[0] IS NOT NULL THEN
        NEW.birth_date_encrypted = encrypt_sensitive_data(TG_ARGV[0]);
    END IF;
    
    -- 加密出生时间
    IF NEW.birth_time_encrypted IS NULL AND TG_ARGV[1] IS NOT NULL THEN
        NEW.birth_time_encrypted = encrypt_sensitive_data(TG_ARGV[1]);
    END IF;
    
    -- 加密出生地点
    IF NEW.birth_location_encrypted IS NULL AND TG_ARGV[2] IS NOT NULL THEN
        NEW.birth_location_encrypted = encrypt_sensitive_data(TG_ARGV[2]);
    END IF;
    
    -- 加密手机号码
    IF NEW.phone_encrypted IS NULL AND TG_ARGV[3] IS NOT NULL THEN
        NEW.phone_encrypted = encrypt_sensitive_data(TG_ARGV[3]);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建敏感数据访问视图
CREATE OR REPLACE VIEW user_sensitive_data_view AS
SELECT 
    id,
    email,
    display_name,
    avatar_url,
    role,
    decrypt_sensitive_data(birth_date_encrypted) AS birth_date,
    decrypt_sensitive_data(birth_time_encrypted) AS birth_time,
    decrypt_sensitive_data(birth_location_encrypted) AS birth_location,
    decrypt_sensitive_data(phone_encrypted) AS phone,
    preferred_locale,
    timezone,
    created_at,
    updated_at,
    last_login_at,
    is_active
FROM public.users;

-- 创建安全的用户数据插入函数
CREATE OR REPLACE FUNCTION insert_user_with_encryption(
    p_id UUID,
    p_email VARCHAR(255),
    p_display_name VARCHAR(100) DEFAULT NULL,
    p_avatar_url TEXT DEFAULT NULL,
    p_role user_role DEFAULT 'user',
    p_birth_date TEXT DEFAULT NULL,
    p_birth_time TEXT DEFAULT NULL,
    p_birth_location TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL,
    p_preferred_locale VARCHAR(10) DEFAULT 'zh-CN',
    p_timezone VARCHAR(50) DEFAULT 'Asia/Shanghai'
)
RETURNS UUID AS $$
DECLARE
    new_user_id UUID;
BEGIN
    INSERT INTO public.users (
        id,
        email,
        display_name,
        avatar_url,
        role,
        birth_date_encrypted,
        birth_time_encrypted,
        birth_location_encrypted,
        phone_encrypted,
        preferred_locale,
        timezone
    ) VALUES (
        p_id,
        p_email,
        p_display_name,
        p_avatar_url,
        p_role,
        encrypt_sensitive_data(p_birth_date),
        encrypt_sensitive_data(p_birth_time),
        encrypt_sensitive_data(p_birth_location),
        encrypt_sensitive_data(p_phone),
        p_preferred_locale,
        p_timezone
    )
    RETURNING id INTO new_user_id;
    
    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建安全的用户数据更新函数
CREATE OR REPLACE FUNCTION update_user_sensitive_data(
    p_user_id UUID,
    p_birth_date TEXT DEFAULT NULL,
    p_birth_time TEXT DEFAULT NULL,
    p_birth_location TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.users SET
        birth_date_encrypted = CASE 
            WHEN p_birth_date IS NOT NULL THEN encrypt_sensitive_data(p_birth_date)
            ELSE birth_date_encrypted
        END,
        birth_time_encrypted = CASE 
            WHEN p_birth_time IS NOT NULL THEN encrypt_sensitive_data(p_birth_time)
            ELSE birth_time_encrypted
        END,
        birth_location_encrypted = CASE 
            WHEN p_birth_location IS NOT NULL THEN encrypt_sensitive_data(p_birth_location)
            ELSE birth_location_encrypted
        END,
        phone_encrypted = CASE 
            WHEN p_phone IS NOT NULL THEN encrypt_sensitive_data(p_phone)
            ELSE phone_encrypted
        END,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 启用行级安全(RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bazi_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fengshui_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_quotas ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略

-- 用户表策略：用户只能访问自己的数据
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- 游客会话策略：基于会话令牌
CREATE POLICY "Guest sessions access" ON public.guest_sessions
    FOR ALL USING (
        session_token = current_setting('app.guest_session_token', true)
    );

-- 八字计算策略：用户只能访问自己的计算结果
CREATE POLICY "Bazi calculations user access" ON public.bazi_calculations
    FOR ALL USING (
        auth.uid() = user_id OR 
        guest_session_id IN (
            SELECT id FROM public.guest_sessions 
            WHERE session_token = current_setting('app.guest_session_token', true)
        )
    );

-- 房屋信息策略：用户只能访问自己的房屋
CREATE POLICY "Houses user access" ON public.houses
    FOR ALL USING (
        auth.uid() = user_id OR 
        guest_session_id IN (
            SELECT id FROM public.guest_sessions 
            WHERE session_token = current_setting('app.guest_session_token', true)
        )
    );

-- 风水分析策略：用户只能访问自己的分析结果
CREATE POLICY "Fengshui analyses user access" ON public.fengshui_analyses
    FOR ALL USING (
        auth.uid() = user_id OR 
        guest_session_id IN (
            SELECT id FROM public.guest_sessions 
            WHERE session_token = current_setting('app.guest_session_token', true)
        )
    );

-- 订阅信息策略：用户只能访问自己的订阅
CREATE POLICY "User subscriptions access" ON public.user_subscriptions
    FOR ALL USING (auth.uid() = user_id);

-- 使用配额策略：用户只能访问自己的配额
CREATE POLICY "Usage quotas access" ON public.usage_quotas
    FOR ALL USING (auth.uid() = user_id);

-- 管理员策略：管理员可以访问所有数据
CREATE POLICY "Admin full access users" ON public.users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admin full access bazi" ON public.bazi_calculations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admin full access houses" ON public.houses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admin full access analyses" ON public.fengshui_analyses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 创建数据清理函数（用于GDPR合规）
CREATE OR REPLACE FUNCTION anonymize_user_data(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- 匿名化用户敏感数据
    UPDATE public.users SET
        email = 'deleted_' || id::text || '@example.com',
        display_name = 'Deleted User',
        avatar_url = NULL,
        birth_date_encrypted = NULL,
        birth_time_encrypted = NULL,
        birth_location_encrypted = NULL,
        phone_encrypted = NULL,
        is_active = false,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- 删除相关的敏感分析数据
    DELETE FROM public.bazi_calculations WHERE user_id = p_user_id;
    DELETE FROM public.fengshui_analyses WHERE user_id = p_user_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建数据备份加密函数
CREATE OR REPLACE FUNCTION create_encrypted_backup()
RETURNS TEXT AS $$
DECLARE
    backup_data JSONB;
    encrypted_backup BYTEA;
BEGIN
    -- 创建包含所有敏感数据的备份
    SELECT jsonb_build_object(
        'users', (SELECT jsonb_agg(row_to_json(u)) FROM public.users u),
        'bazi_calculations', (SELECT jsonb_agg(row_to_json(b)) FROM public.bazi_calculations b),
        'houses', (SELECT jsonb_agg(row_to_json(h)) FROM public.houses h),
        'fengshui_analyses', (SELECT jsonb_agg(row_to_json(f)) FROM public.fengshui_analyses f),
        'timestamp', NOW()
    ) INTO backup_data;
    
    -- 加密备份数据
    encrypted_backup := pgp_sym_encrypt(backup_data::text, get_encryption_key());
    
    -- 返回Base64编码的加密备份
    RETURN encode(encrypted_backup, 'base64');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建审计日志表
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    operation VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
    user_id UUID,
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建审计触发器函数
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB;
    new_data JSONB;
    changed_fields TEXT[];
BEGIN
    -- 获取操作类型和数据
    IF TG_OP = 'DELETE' THEN
        old_data := row_to_json(OLD);
        new_data := NULL;
    ELSIF TG_OP = 'UPDATE' THEN
        old_data := row_to_json(OLD);
        new_data := row_to_json(NEW);
        
        -- 计算变更字段
        SELECT array_agg(key) INTO changed_fields
        FROM jsonb_each(old_data) o
        JOIN jsonb_each(new_data) n ON o.key = n.key
        WHERE o.value IS DISTINCT FROM n.value;
    ELSIF TG_OP = 'INSERT' THEN
        old_data := NULL;
        new_data := row_to_json(NEW);
    END IF;
    
    -- 插入审计日志
    INSERT INTO public.audit_logs (
        table_name,
        operation,
        user_id,
        old_values,
        new_values,
        changed_fields,
        ip_address,
        user_agent
    ) VALUES (
        TG_TABLE_NAME,
        TG_OP,
        auth.uid(),
        old_data,
        new_data,
        changed_fields,
        inet_client_addr(),
        current_setting('app.user_agent', true)
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 为敏感表添加审计触发器
CREATE TRIGGER audit_users_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_bazi_calculations_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.bazi_calculations
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- 创建索引以提高审计查询性能
CREATE INDEX idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_audit_logs_operation ON public.audit_logs(operation);