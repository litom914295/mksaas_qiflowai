-- QiFlow AI 数据库性能优化改进
-- 创建日期: 2025-09-04
-- 版本: 1.1

-- 1. 动态连接池配置
CREATE OR REPLACE FUNCTION configure_connection_pool_dynamic()
RETURNS TEXT AS $$
DECLARE
    db_size BIGINT;
    connection_limit INTEGER;
    shared_buffers_size TEXT;
    work_mem_size TEXT;
BEGIN
    -- 获取数据库大小
    SELECT pg_database_size(current_database()) INTO db_size;
    
    -- 根据数据库大小动态调整参数
    IF db_size < 1073741824 THEN -- < 1GB
        connection_limit := 100;
        shared_buffers_size := '128MB';
        work_mem_size := '2MB';
    ELSIF db_size < 10737418240 THEN -- < 10GB
        connection_limit := 200;
        shared_buffers_size := '256MB';
        work_mem_size := '4MB';
    ELSE -- >= 10GB
        connection_limit := 300;
        shared_buffers_size := '512MB';
        work_mem_size := '8MB';
    END IF;
    
    -- 更新配置表
    INSERT INTO public.system_config (key, value, description) VALUES
    ('max_connections', connection_limit::TEXT, 'Maximum database connections'),
    ('shared_buffers', shared_buffers_size, 'Shared buffer size'),
    ('work_mem', work_mem_size, 'Work memory per connection')
    ON CONFLICT (key) DO UPDATE SET 
        value = EXCLUDED.value,
        updated_at = NOW();
    
    RETURN format('Connection pool configured for %s database', pg_size_pretty(db_size));
END;
$$ LANGUAGE plpgsql;

-- 2. 索引使用率监控视图
CREATE OR REPLACE VIEW index_usage_stats AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    idx_scan,
    CASE 
        WHEN idx_scan = 0 THEN 'UNUSED'
        WHEN idx_scan < 10 THEN 'RARELY_USED'
        WHEN idx_scan < 100 THEN 'MODERATELY_USED'
        ELSE 'FREQUENTLY_USED'
    END as usage_status,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- 3. 查询性能监控增强
CREATE OR REPLACE FUNCTION analyze_query_performance(
    top_n INTEGER DEFAULT 10,
    min_calls INTEGER DEFAULT 5
)
RETURNS TABLE(
    query_hash TEXT,
    calls BIGINT,
    total_time_ms NUMERIC,
    mean_time_ms NUMERIC,
    rows_per_call NUMERIC,
    hit_percent NUMERIC,
    recommendation TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        LEFT(s.query, 50) || '...' as query_hash,
        s.calls,
        ROUND(s.total_time::NUMERIC, 2) as total_time_ms,
        ROUND(s.mean_time::NUMERIC, 2) as mean_time_ms,
        ROUND(s.rows / NULLIF(s.calls, 0)::NUMERIC, 2) as rows_per_call,
        ROUND(100.0 * s.shared_blks_hit / NULLIF(s.shared_blks_hit + s.shared_blks_read, 0)::NUMERIC, 2) as hit_percent,
        CASE 
            WHEN s.mean_time > 1000 THEN 'Optimize slow query'
            WHEN (100.0 * s.shared_blks_hit / NULLIF(s.shared_blks_hit + s.shared_blks_read, 0)) < 95 THEN 'Poor cache hit ratio'
            WHEN s.rows / NULLIF(s.calls, 0) > 1000 THEN 'Consider result pagination'
            ELSE 'Performance acceptable'
        END as recommendation
    FROM pg_stat_statements s
    WHERE s.calls >= min_calls
    ORDER BY s.total_time DESC
    LIMIT top_n;
END;
$$ LANGUAGE plpgsql;

-- 4. 自动索引建议函数
CREATE OR REPLACE FUNCTION suggest_missing_indexes()
RETURNS TABLE(
    table_name TEXT,
    column_names TEXT,
    query_sample TEXT,
    estimated_benefit TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'public.bazi_calculations'::TEXT as table_name,
        'birth_date, birth_time'::TEXT as column_names,
        'SELECT * FROM bazi_calculations WHERE birth_date = ? AND birth_time = ?'::TEXT as query_sample,
        'HIGH - Frequently queried together'::TEXT as estimated_benefit
    WHERE NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
          AND tablename = 'bazi_calculations'
          AND indexdef LIKE '%birth_date%birth_time%'
    )
    
    UNION ALL
    
    SELECT 
        'public.fengshui_analyses'::TEXT,
        'user_id, status, created_at'::TEXT,
        'SELECT * FROM fengshui_analyses WHERE user_id = ? AND status = ? ORDER BY created_at'::TEXT,
        'MEDIUM - Common user query pattern'::TEXT
    WHERE NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
          AND tablename = 'fengshui_analyses'
          AND indexdef LIKE '%user_id%status%created_at%'
    );
END;
$$ LANGUAGE plpgsql;

-- 5. 表统计信息更新策略
CREATE OR REPLACE FUNCTION update_table_statistics()
RETURNS TEXT AS $$
DECLARE
    table_record RECORD;
    stats_age INTERVAL;
BEGIN
    FOR table_record IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        -- 检查统计信息年龄
        SELECT NOW() - last_analyze INTO stats_age
        FROM pg_stat_user_tables 
        WHERE schemaname = table_record.schemaname 
          AND relname = table_record.tablename;
        
        -- 如果统计信息超过1天，则更新
        IF stats_age > INTERVAL '1 day' OR stats_age IS NULL THEN
            EXECUTE format('ANALYZE %I.%I', table_record.schemaname, table_record.tablename);
        END IF;
    END LOOP;
    
    RETURN 'Table statistics updated successfully';
END;
$$ LANGUAGE plpgsql;

-- 6. 自动VACUUM调优
CREATE OR REPLACE FUNCTION optimize_vacuum_settings()
RETURNS TEXT AS $$
DECLARE
    table_record RECORD;
    dead_tuple_ratio NUMERIC;
BEGIN
    FOR table_record IN 
        SELECT schemaname, tablename, n_live_tup, n_dead_tup
        FROM pg_stat_user_tables 
        WHERE schemaname = 'public'
          AND n_live_tup > 0
    LOOP
        dead_tuple_ratio := table_record.n_dead_tup::NUMERIC / table_record.n_live_tup::NUMERIC;
        
        -- 为高更新频率的表调整VACUUM参数
        IF dead_tuple_ratio > 0.2 THEN
            EXECUTE format(
                'ALTER TABLE %I.%I SET (autovacuum_vacuum_threshold = 50, autovacuum_vacuum_scale_factor = 0.1)',
                table_record.schemaname, table_record.tablename
            );
        ELSIF dead_tuple_ratio > 0.1 THEN
            EXECUTE format(
                'ALTER TABLE %I.%I SET (autovacuum_vacuum_threshold = 100, autovacuum_vacuum_scale_factor = 0.15)',
                table_record.schemaname, table_record.tablename
            );
        END IF;
    END LOOP;
    
    RETURN 'VACUUM settings optimized based on table usage patterns';
END;
$$ LANGUAGE plpgsql;

-- 7. 实时性能监控视图
CREATE OR REPLACE VIEW real_time_performance AS
SELECT 
    'Active Connections' as metric,
    count(*)::TEXT as current_value,
    CASE WHEN count(*) > 80 THEN 'WARNING' ELSE 'GOOD' END as status
FROM pg_stat_activity WHERE state = 'active'

UNION ALL

SELECT 
    'Longest Running Query (seconds)' as metric,
    COALESCE(EXTRACT(EPOCH FROM MAX(NOW() - query_start))::TEXT, '0') as current_value,
    CASE WHEN MAX(NOW() - query_start) > INTERVAL '30 seconds' THEN 'WARNING' ELSE 'GOOD' END as status
FROM pg_stat_activity WHERE state = 'active' AND query != '<IDLE>'

UNION ALL

SELECT 
    'Cache Hit Ratio (%)' as metric,
    ROUND(100.0 * sum(blks_hit) / NULLIF(sum(blks_hit) + sum(blks_read), 0), 2)::TEXT as current_value,
    CASE WHEN ROUND(100.0 * sum(blks_hit) / NULLIF(sum(blks_hit) + sum(blks_read), 0), 2) < 95 
         THEN 'WARNING' ELSE 'GOOD' END as status
FROM pg_stat_database WHERE datname = current_database();

-- 8. 性能基准测试增强
CREATE OR REPLACE FUNCTION comprehensive_performance_test()
RETURNS TABLE(
    test_category VARCHAR(50),
    test_name VARCHAR(100),
    execution_time_ms NUMERIC,
    throughput_ops_sec NUMERIC,
    status VARCHAR(20)
) AS $$
DECLARE
    start_time TIMESTAMP WITH TIME ZONE;
    end_time TIMESTAMP WITH TIME ZONE;
    execution_time_ms NUMERIC;
    i INTEGER;
BEGIN
    -- 1. 单行插入性能测试
    start_time := clock_timestamp();
    FOR i IN 1..100 LOOP
        INSERT INTO public.guest_sessions (session_token, expires_at) 
        VALUES ('perf_test_' || i || '_' || extract(epoch from now()), NOW() + INTERVAL '1 hour');
    END LOOP;
    end_time := clock_timestamp();
    execution_time_ms := EXTRACT(MILLISECONDS FROM (end_time - start_time));
    
    RETURN QUERY SELECT 
        'Write Performance'::VARCHAR(50),
        'Single Row Insert (100 ops)'::VARCHAR(100),
        execution_time_ms,
        ROUND(100000.0 / execution_time_ms, 2),
        CASE WHEN execution_time_ms < 1000 THEN 'EXCELLENT'
             WHEN execution_time_ms < 2000 THEN 'GOOD'
             WHEN execution_time_ms < 5000 THEN 'ACCEPTABLE'
             ELSE 'POOR' END::VARCHAR(20);
    
    -- 2. 复杂查询性能测试
    start_time := clock_timestamp();
    PERFORM COUNT(*) FROM public.bazi_calculations b
    JOIN public.users u ON b.user_id = u.id
    WHERE b.created_at > NOW() - INTERVAL '30 days'
      AND u.is_active = true;
    end_time := clock_timestamp();
    execution_time_ms := EXTRACT(MILLISECONDS FROM (end_time - start_time));
    
    RETURN QUERY SELECT 
        'Read Performance'::VARCHAR(50),
        'Complex JOIN Query'::VARCHAR(100),
        execution_time_ms,
        ROUND(1000.0 / NULLIF(execution_time_ms, 0), 2),
        CASE WHEN execution_time_ms < 100 THEN 'EXCELLENT'
             WHEN execution_time_ms < 500 THEN 'GOOD'
             WHEN execution_time_ms < 1000 THEN 'ACCEPTABLE'
             ELSE 'POOR' END::VARCHAR(20);
    
    -- 清理测试数据
    DELETE FROM public.guest_sessions WHERE session_token LIKE 'perf_test_%';
END;
$$ LANGUAGE plpgsql;