-- QiFlow AI 敏感数据加密改进
-- 创建日期: 2025-09-04
-- 版本: 1.1

-- 1. 增强密钥管理
CREATE OR REPLACE FUNCTION get_encryption_key_with_rotation()
RETURNS TEXT AS $$
DECLARE
    key_version INTEGER;
    encryption_key TEXT;
BEGIN
    -- 从配置表获取当前密钥版本
    SELECT COALESCE(
        (SELECT value::INTEGER FROM public.system_config WHERE key = 'encryption_key_version'), 
        1
    ) INTO key_version;
    
    -- 根据版本获取密钥
    CASE key_version
        WHEN 1 THEN
            encryption_key := current_setting('app.encryption_key_v1', true);
        WHEN 2 THEN
            encryption_key := current_setting('app.encryption_key_v2', true);
        ELSE
            encryption_key := current_setting('app.encryption_key_v' || key_version, true);
    END CASE;
    
    -- 如果密钥为空，使用默认值（仅开发环境）
    IF encryption_key IS NULL OR encryption_key = '' THEN
        IF current_setting('app.environment', true) = 'development' THEN
            encryption_key := 'qiflow_dev_key_' || key_version || '_2025';
        ELSE
            RAISE EXCEPTION 'Encryption key not configured for production environment';
        END IF;
    END IF;
    
    RETURN encryption_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 系统配置表
CREATE TABLE IF NOT EXISTS public.system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 插入默认配置
INSERT INTO public.system_config (key, value, description) VALUES
('encryption_key_version', '1', 'Current encryption key version'),
('data_retention_days', '2555', 'Data retention period in days (7 years)'),
('backup_retention_days', '90', 'Backup retention period in days')
ON CONFLICT (key) DO NOTHING;

-- 3. 分批加密备份函数
CREATE OR REPLACE FUNCTION create_encrypted_backup_batch(
    table_name TEXT,
    batch_size INTEGER DEFAULT 1000,
    offset_val INTEGER DEFAULT 0
)
RETURNS TABLE(
    batch_id INTEGER,
    records_processed INTEGER,
    backup_chunk TEXT
) AS $$
DECLARE
    backup_data JSONB;
    encrypted_backup BYTEA;
    record_count INTEGER;
BEGIN
    -- 动态构建查询
    EXECUTE format(
        'SELECT jsonb_agg(row_to_json(t)) FROM (SELECT * FROM %I ORDER BY created_at LIMIT %s OFFSET %s) t',
        table_name, batch_size, offset_val
    ) INTO backup_data;
    
    GET DIAGNOSTICS record_count = ROW_COUNT;
    
    IF backup_data IS NOT NULL THEN
        -- 加密数据
        encrypted_backup := pgp_sym_encrypt(backup_data::text, get_encryption_key_with_rotation());
        
        RETURN QUERY SELECT 
            (offset_val / batch_size + 1)::INTEGER,
            record_count,
            encode(encrypted_backup, 'base64');
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 敏感数据审计函数
CREATE OR REPLACE FUNCTION audit_sensitive_data_access()
RETURNS TRIGGER AS $$
BEGIN
    -- 记录敏感数据访问
    INSERT INTO public.audit_logs (
        table_name,
        operation,
        user_id,
        new_values,
        ip_address,
        user_agent,
        created_at
    ) VALUES (
        'sensitive_data_access',
        'SELECT',
        auth.uid(),
        jsonb_build_object(
            'table', TG_TABLE_NAME,
            'columns', CASE 
                WHEN TG_TABLE_NAME = 'users' THEN jsonb_build_array('birth_date_encrypted', 'birth_time_encrypted', 'birth_location_encrypted', 'phone_encrypted')
                ELSE jsonb_build_array('all')
            END
        ),
        inet_client_addr(),
        current_setting('app.user_agent', true),
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. 数据泄露检测函数
CREATE OR REPLACE FUNCTION detect_potential_data_breach()
RETURNS TABLE(
    risk_level VARCHAR(20),
    description TEXT,
    affected_records INTEGER,
    recommendation TEXT
) AS $$
BEGIN
    -- 检测异常的敏感数据访问模式
    RETURN QUERY
    SELECT 
        'HIGH'::VARCHAR(20),
        'Multiple failed decryption attempts detected'::TEXT,
        COUNT(*)::INTEGER,
        'Review encryption key configuration and user access patterns'::TEXT
    FROM public.audit_logs
    WHERE table_name = 'sensitive_data_access'
      AND created_at > NOW() - INTERVAL '1 hour'
      AND error_message LIKE '%decrypt%'
    GROUP BY user_id
    HAVING COUNT(*) > 10;
    
    -- 检测大量数据导出
    RETURN QUERY
    SELECT 
        'MEDIUM'::VARCHAR(20),
        'Large volume data access detected'::TEXT,
        COUNT(*)::INTEGER,
        'Verify if bulk data access is authorized'::TEXT
    FROM public.audit_logs
    WHERE operation = 'SELECT'
      AND created_at > NOW() - INTERVAL '1 hour'
    GROUP BY user_id, ip_address
    HAVING COUNT(*) > 100;
END;
$$ LANGUAGE plpgsql;

-- 6. 加密健康检查
CREATE OR REPLACE FUNCTION encryption_health_check()
RETURNS TABLE(
    check_name VARCHAR(100),
    status VARCHAR(20),
    details TEXT
) AS $$
BEGIN
    -- 检查加密配置
    RETURN QUERY
    SELECT 
        'Encryption Extension'::VARCHAR(100),
        CASE WHEN EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') 
             THEN 'GOOD' ELSE 'CRITICAL' END::VARCHAR(20),
        'pgcrypto extension status'::TEXT;
    
    -- 检查加密密钥配置
    RETURN QUERY
    SELECT 
        'Encryption Key Configuration'::VARCHAR(100),
        CASE WHEN get_encryption_key_with_rotation() IS NOT NULL 
             THEN 'GOOD' ELSE 'CRITICAL' END::VARCHAR(20),
        'Encryption key availability'::TEXT;
    
    -- 检查敏感数据加密率
    RETURN QUERY
    SELECT 
        'Sensitive Data Encryption Rate'::VARCHAR(100),
        CASE WHEN 
            (SELECT COUNT(*) FROM public.users WHERE birth_date_encrypted IS NOT NULL) * 100.0 / 
            NULLIF((SELECT COUNT(*) FROM public.users), 0) > 95 
        THEN 'GOOD' ELSE 'WARNING' END::VARCHAR(20),
        format('%s%% of user records have encrypted sensitive data', 
               ROUND((SELECT COUNT(*) FROM public.users WHERE birth_date_encrypted IS NOT NULL) * 100.0 / 
                     NULLIF((SELECT COUNT(*) FROM public.users), 0), 2))::TEXT;
END;
$$ LANGUAGE plpgsql;