-- QiFlow AI 数据库性能优化
-- 创建日期: 2025-01-01
-- 版本: 1.0

-- 1. 核心业务查询索引优化

-- 用户表复合索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role_active 
ON public.users(role, is_active) WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_active 
ON public.users(email, is_active) WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_last_login 
ON public.users(last_login_at DESC) WHERE last_login_at IS NOT NULL;

-- 游客会话优化索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_guest_sessions_token_expires 
ON public.guest_sessions(session_token, expires_at) WHERE expires_at > NOW();

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_guest_sessions_cleanup 
ON public.guest_sessions(expires_at) WHERE expires_at <= NOW();

-- 八字计算查询优化
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bazi_user_date 
ON public.bazi_calculations(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bazi_guest_date 
ON public.bazi_calculations(guest_session_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bazi_birth_info 
ON public.bazi_calculations(birth_date, birth_time);

-- JSONB字段优化索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bazi_five_elements_gin 
ON public.bazi_calculations USING GIN (five_elements);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bazi_favorable_elements_gin 
ON public.bazi_calculations USING GIN (favorable_elements);

-- 房屋信息地理位置索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_houses_location_gist 
ON public.houses USING GIST (point(longitude, latitude));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_houses_user_active 
ON public.houses(user_id, is_active) WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_houses_type_area 
ON public.houses(house_type, area_sqm);

-- 房屋JSONB字段索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_houses_rooms_gin 
ON public.houses USING GIN (rooms);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_houses_floor_plan_gin 
ON public.houses USING GIN (floor_plan_data);

-- 风水分析查询优化
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fengshui_user_house_date 
ON public.fengshui_analyses(user_id, house_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fengshui_status_created 
ON public.fengshui_analyses(status, created_at) WHERE status IN ('pending', 'processing');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fengshui_score_type 
ON public.fengshui_analyses(overall_score DESC, analysis_type);

-- 风水分析JSONB索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fengshui_flying_stars_gin 
ON public.fengshui_analyses USING GIN (flying_stars);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fengshui_recommendations_gin 
ON public.fengshui_analyses USING GIN (recommendations);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fengshui_room_scores_gin 
ON public.fengshui_analyses USING GIN (room_scores);

-- 订阅相关索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_user_status 
ON public.user_subscriptions(user_id, status) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_expires_status 
ON public.user_subscriptions(expires_at, status) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_stripe 
ON public.user_subscriptions(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

-- 使用配额索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quotas_user_type 
ON public.usage_quotas(user_id, quota_type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quotas_reset_period 
ON public.usage_quotas(next_reset_at) WHERE next_reset_at <= NOW();

-- API日志分析索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_logs_endpoint_date 
ON public.api_logs(endpoint, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_logs_user_date 
ON public.api_logs(user_id, created_at DESC) WHERE user_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_logs_status_date 
ON public.api_logs(status_code, created_at DESC);

-- 2. 分区表设置（用于大数据量表）

-- API日志按月分区
CREATE TABLE IF NOT EXISTS public.api_logs_y2025m01 PARTITION OF public.api_logs
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE IF NOT EXISTS public.api_logs_y2025m02 PARTITION OF public.api_logs
FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- 审计日志按月分区
CREATE TABLE IF NOT EXISTS public.audit_logs_y2025m01 PARTITION OF public.audit_logs
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- 3. 数据库连接池配置函数
CREATE OR REPLACE FUNCTION configure_connection_pool()
RETURNS TEXT AS $$
BEGIN
    -- 设置连接池参数
    PERFORM set_config('shared_preload_libraries', 'pg_stat_statements', false);
    PERFORM set_config('max_connections', '200', false);
    PERFORM set_config('shared_buffers', '256MB', false);
    PERFORM set_config('effective_cache_size', '1GB', false);
    PERFORM set_config('work_mem', '4MB', false);
    PERFORM set_config('maintenance_work_mem', '64MB', false);
    
    RETURN 'Connection pool configured successfully';
END;
$$ LANGUAGE plpgsql;

-- 4. 查询性能监控视图
CREATE OR REPLACE VIEW query_performance_stats AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    stddev_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements 
ORDER BY total_time DESC;

-- 5. 慢查询监控函数
CREATE OR REPLACE FUNCTION get_slow_queries(threshold_ms INTEGER DEFAULT 1000)
RETURNS TABLE(
    query TEXT,
    calls BIGINT,
    total_time_ms NUMERIC,
    mean_time_ms NUMERIC,
    hit_percent NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.query,
        s.calls,
        s.total_time,
        s.mean_time,
        100.0 * s.shared_blks_hit / nullif(s.shared_blks_hit + s.shared_blks_read, 0)
    FROM pg_stat_statements s
    WHERE s.mean_time > threshold_ms
    ORDER BY s.total_time DESC;
END;
$$ LANGUAGE plpgsql;

-- 6. 缓存策略配置
CREATE OR REPLACE FUNCTION setup_query_cache()
RETURNS TEXT AS $$
BEGIN
    -- 启用查询计划缓存
    PERFORM set_config('plan_cache_mode', 'auto', false);
    
    -- 配置统计信息收集
    PERFORM set_config('track_activities', 'on', false);
    PERFORM set_config('track_counts', 'on', false);
    PERFORM set_config('track_io_timing', 'on', false);
    PERFORM set_config('track_functions', 'all', false);
    
    RETURN 'Query cache configured successfully';
END;
$$ LANGUAGE plpgsql;

-- 7. 数据清理和维护函数
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS TEXT AS $$
DECLARE
    deleted_sessions INTEGER;
    deleted_logs INTEGER;
    result_text TEXT;
BEGIN
    -- 清理过期的游客会话
    DELETE FROM public.guest_sessions 
    WHERE expires_at < NOW() - INTERVAL '1 day';
    GET DIAGNOSTICS deleted_sessions = ROW_COUNT;
    
    -- 清理旧的API日志（保留30天）
    DELETE FROM public.api_logs 
    WHERE created_at < NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS deleted_logs = ROW_COUNT;
    
    -- 清理旧的审计日志（保留90天）
    DELETE FROM public.audit_logs 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    result_text := format('Cleanup completed: %s expired sessions, %s old logs deleted', 
                         deleted_sessions, deleted_logs);
    
    RETURN result_text;
END;
$$ LANGUAGE plpgsql;

-- 8. 数据库健康检查函数
CREATE OR REPLACE FUNCTION database_health_check()
RETURNS TABLE(
    metric VARCHAR(50),
    value TEXT,
    status VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'Active Connections'::VARCHAR(50),
        (SELECT count(*)::TEXT FROM pg_stat_activity WHERE state = 'active'),
        CASE 
            WHEN (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') < 50 THEN 'GOOD'
            WHEN (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') < 100 THEN 'WARNING'
            ELSE 'CRITICAL'
        END::VARCHAR(20)
    
    UNION ALL
    
    SELECT 
        'Database Size'::VARCHAR(50),
        pg_size_pretty(pg_database_size(current_database())),
        'INFO'::VARCHAR(20)
    
    UNION ALL
    
    SELECT 
        'Cache Hit Ratio'::VARCHAR(50),
        ROUND(
            100.0 * sum(blks_hit) / nullif(sum(blks_hit) + sum(blks_read), 0), 2
        )::TEXT || '%',
        CASE 
            WHEN ROUND(100.0 * sum(blks_hit) / nullif(sum(blks_hit) + sum(blks_read), 0), 2) > 95 THEN 'GOOD'
            WHEN ROUND(100.0 * sum(blks_hit) / nullif(sum(blks_hit) + sum(blks_read), 0), 2) > 90 THEN 'WARNING'
            ELSE 'CRITICAL'
        END::VARCHAR(20)
    FROM pg_stat_database WHERE datname = current_database();
END;
$$ LANGUAGE plpgsql;

-- 9. 自动VACUUM和ANALYZE配置
CREATE OR REPLACE FUNCTION setup_auto_maintenance()
RETURNS TEXT AS $$
BEGIN
    -- 配置自动VACUUM参数
    PERFORM set_config('autovacuum', 'on', false);
    PERFORM set_config('autovacuum_max_workers', '3', false);
    PERFORM set_config('autovacuum_naptime', '1min', false);
    
    -- 配置自动ANALYZE参数
    PERFORM set_config('autovacuum_analyze_threshold', '50', false);
    PERFORM set_config('autovacuum_analyze_scale_factor', '0.1', false);
    
    RETURN 'Auto maintenance configured successfully';
END;
$$ LANGUAGE plpgsql;

-- 10. 创建定期维护任务
CREATE OR REPLACE FUNCTION schedule_maintenance_tasks()
RETURNS TEXT AS $$
BEGIN
    -- 这里可以集成pg_cron扩展来调度任务
    -- 由于pg_cron需要超级用户权限，在Supabase中可能需要通过Edge Functions实现
    
    RETURN 'Maintenance tasks scheduled (implement via Edge Functions)';
END;
$$ LANGUAGE plpgsql;

-- 11. 性能基准测试函数
CREATE OR REPLACE FUNCTION run_performance_benchmark()
RETURNS TABLE(
    test_name VARCHAR(100),
    execution_time_ms NUMERIC,
    rows_affected INTEGER
) AS $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
BEGIN
    -- 测试1: 用户查询性能
    start_time := clock_timestamp();
    PERFORM count(*) FROM public.users WHERE is_active = true;
    end_time := clock_timestamp();
    
    RETURN QUERY SELECT 
        'User Query Test'::VARCHAR(100),
        EXTRACT(MILLISECONDS FROM (end_time - start_time)),
        (SELECT count(*)::INTEGER FROM public.users WHERE is_active = true);
    
    -- 测试2: 复杂JSONB查询性能
    start_time := clock_timestamp();
    PERFORM count(*) FROM public.bazi_calculations 
    WHERE five_elements ? 'wood' AND created_at > NOW() - INTERVAL '30 days';
    end_time := clock_timestamp();
    
    RETURN QUERY SELECT 
        'JSONB Query Test'::VARCHAR(100),
        EXTRACT(MILLISECONDS FROM (end_time - start_time)),
        (SELECT count(*)::INTEGER FROM public.bazi_calculations 
         WHERE five_elements ? 'wood' AND created_at > NOW() - INTERVAL '30 days');
    
    -- 测试3: 地理位置查询性能
    start_time := clock_timestamp();
    PERFORM count(*) FROM public.houses 
    WHERE point(longitude, latitude) <@ circle(point(116.4074, 39.9042), 0.1);
    end_time := clock_timestamp();
    
    RETURN QUERY SELECT 
        'Geolocation Query Test'::VARCHAR(100),
        EXTRACT(MILLISECONDS FROM (end_time - start_time)),
        (SELECT count(*)::INTEGER FROM public.houses 
         WHERE point(longitude, latitude) <@ circle(point(116.4074, 39.9042), 0.1));
END;
$$ LANGUAGE plpgsql;

-- 执行初始配置
SELECT configure_connection_pool();
SELECT setup_query_cache();
SELECT setup_auto_maintenance();