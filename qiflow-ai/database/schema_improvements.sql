-- QiFlow AI 数据库架构改进建议
-- 创建日期: 2025-09-04
-- 版本: 1.1

-- 1. 自动分区管理函数
CREATE OR REPLACE FUNCTION create_monthly_partitions()
RETURNS TEXT AS $$
DECLARE
    partition_date DATE;
    partition_name TEXT;
    start_date TEXT;
    end_date TEXT;
BEGIN
    -- 为未来6个月创建分区
    FOR i IN 0..6 LOOP
        partition_date := DATE_TRUNC('month', CURRENT_DATE) + (i || ' months')::INTERVAL;
        partition_name := 'api_logs_y' || EXTRACT(YEAR FROM partition_date) || 'm' || LPAD(EXTRACT(MONTH FROM partition_date)::TEXT, 2, '0');
        start_date := partition_date::TEXT;
        end_date := (partition_date + INTERVAL '1 month')::TEXT;
        
        EXECUTE format('CREATE TABLE IF NOT EXISTS public.%I PARTITION OF public.api_logs FOR VALUES FROM (%L) TO (%L)',
                      partition_name, start_date, end_date);
    END LOOP;
    
    -- 审计日志分区
    FOR i IN 0..6 LOOP
        partition_date := DATE_TRUNC('month', CURRENT_DATE) + (i || ' months')::INTERVAL;
        partition_name := 'audit_logs_y' || EXTRACT(YEAR FROM partition_date) || 'm' || LPAD(EXTRACT(MONTH FROM partition_date)::TEXT, 2, '0');
        start_date := partition_date::TEXT;
        end_date := (partition_date + INTERVAL '1 month')::TEXT;
        
        EXECUTE format('CREATE TABLE IF NOT EXISTS public.%I PARTITION OF public.audit_logs FOR VALUES FROM (%L) TO (%L)',
                      partition_name, start_date, end_date);
    END LOOP;
    
    RETURN 'Monthly partitions created successfully';
END;
$$ LANGUAGE plpgsql;

-- 2. JSONB字段结构验证约束
ALTER TABLE public.bazi_calculations ADD CONSTRAINT check_five_elements_structure 
CHECK (
    five_elements ? 'wood' AND 
    five_elements ? 'fire' AND 
    five_elements ? 'earth' AND 
    five_elements ? 'metal' AND 
    five_elements ? 'water'
);

ALTER TABLE public.houses ADD CONSTRAINT check_location_structure 
CHECK (
    (latitude IS NULL AND longitude IS NULL) OR
    (latitude IS NOT NULL AND longitude IS NOT NULL AND 
     latitude BETWEEN -90 AND 90 AND 
     longitude BETWEEN -180 AND 180)
);

-- 3. 数据归档表
CREATE TABLE public.archived_api_logs (
    LIKE public.api_logs INCLUDING ALL
) PARTITION BY RANGE (created_at);

CREATE TABLE public.archived_audit_logs (
    LIKE public.audit_logs INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- 4. 数据归档函数
CREATE OR REPLACE FUNCTION archive_old_data()
RETURNS TEXT AS $$
DECLARE
    archived_api_logs INTEGER;
    archived_audit_logs INTEGER;
BEGIN
    -- 归档1年前的API日志
    WITH moved_rows AS (
        DELETE FROM public.api_logs 
        WHERE created_at < NOW() - INTERVAL '1 year'
        RETURNING *
    )
    INSERT INTO public.archived_api_logs SELECT * FROM moved_rows;
    GET DIAGNOSTICS archived_api_logs = ROW_COUNT;
    
    -- 归档1年前的审计日志
    WITH moved_rows AS (
        DELETE FROM public.audit_logs 
        WHERE created_at < NOW() - INTERVAL '1 year'
        RETURNING *
    )
    INSERT INTO public.archived_audit_logs SELECT * FROM moved_rows;
    GET DIAGNOSTICS archived_audit_logs = ROW_COUNT;
    
    RETURN format('Archived %s API logs and %s audit logs', archived_api_logs, archived_audit_logs);
END;
$$ LANGUAGE plpgsql;

-- 5. 数据一致性检查函数
CREATE OR REPLACE FUNCTION check_data_consistency()
RETURNS TABLE(
    check_name VARCHAR(100),
    status VARCHAR(20),
    details TEXT
) AS $$
BEGIN
    -- 检查孤立的八字计算记录
    RETURN QUERY
    SELECT 
        'Orphaned BaZi Calculations'::VARCHAR(100),
        CASE WHEN COUNT(*) = 0 THEN 'GOOD' ELSE 'WARNING' END::VARCHAR(20),
        format('%s records found', COUNT(*))::TEXT
    FROM public.bazi_calculations b
    WHERE b.user_id IS NOT NULL 
      AND NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id = b.user_id);
    
    -- 检查孤立的房屋记录
    RETURN QUERY
    SELECT 
        'Orphaned Houses'::VARCHAR(100),
        CASE WHEN COUNT(*) = 0 THEN 'GOOD' ELSE 'WARNING' END::VARCHAR(20),
        format('%s records found', COUNT(*))::TEXT
    FROM public.houses h
    WHERE h.user_id IS NOT NULL 
      AND NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id = h.user_id);
    
    -- 检查过期的游客会话
    RETURN QUERY
    SELECT 
        'Expired Guest Sessions'::VARCHAR(100),
        CASE WHEN COUNT(*) = 0 THEN 'GOOD' ELSE 'INFO' END::VARCHAR(20),
        format('%s sessions to cleanup', COUNT(*))::TEXT
    FROM public.guest_sessions
    WHERE expires_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;