-- 数据库性能优化索引脚本
-- 用于解决仪表盘加载慢的问题
-- 执行时间: 2025-01-05

-- ========================================
-- 1. 用户积分表索引
-- ========================================

-- 用户积分查询索引 (getUserCredits 函数)
CREATE INDEX IF NOT EXISTS idx_user_credit_user_id 
ON user_credit(user_id);

-- 分析: 这个查询每次仪表盘加载都会执行
-- 影响: 将查询时间从秒级降低到毫秒级

-- ========================================
-- 2. 积分交易表索引 (签到查询优化)
-- ========================================

-- 签到状态查询索引
CREATE INDEX IF NOT EXISTS idx_credit_transaction_signin 
ON credit_transaction(user_id, type, created_at DESC)
WHERE type = 'DAILY_SIGNIN';

-- 分析: 签到查询每次加载都会执行，查询30天历史
-- 影响: 将查询时间从 3-25秒 降低到 < 100ms

-- 覆盖索引 (包含所有查询字段)
CREATE INDEX IF NOT EXISTS idx_credit_transaction_signin_covering 
ON credit_transaction(user_id, type, created_at DESC)
INCLUDE (id)
WHERE type = 'DAILY_SIGNIN';

-- ========================================
-- 3. 八字分析表索引
-- ========================================

-- 用户分析查询索引
CREATE INDEX IF NOT EXISTS idx_bazi_calculations_user 
ON bazi_calculations(user_id, created_at DESC);

-- 分析: 用于获取用户的八字分析历史和统计
-- 影响: 加速 analysisCount 和 recentAnalyses 查询

-- 月度分析统计索引
CREATE INDEX IF NOT EXISTS idx_bazi_calculations_monthly 
ON bazi_calculations(user_id, created_at)
WHERE created_at >= CURRENT_DATE - INTERVAL '31 days';

-- ========================================
-- 4. 风水分析表索引
-- ========================================

-- 用户风水分析查询索引
CREATE INDEX IF NOT EXISTS idx_fengshui_analysis_user 
ON fengshui_analysis(user_id, created_at DESC);

-- 分析: 用于获取用户的风水分析历史和统计
-- 影响: 加速 analysisCount 和 recentAnalyses 查询

-- 月度风水分析统计索引
CREATE INDEX IF NOT EXISTS idx_fengshui_analysis_monthly 
ON fengshui_analysis(user_id, created_at)
WHERE created_at >= CURRENT_DATE - INTERVAL '31 days';

-- ========================================
-- 5. 支付表索引
-- ========================================

-- 用户支付记录查询索引
CREATE INDEX IF NOT EXISTS idx_payment_user 
ON payment(user_id, created_at DESC);

-- ========================================
-- 6. 分析现有索引
-- ========================================

-- 查看所有表的索引使用情况
-- SELECT 
--   schemaname,
--   tablename,
--   indexname,
--   idx_scan as index_scans,
--   idx_tup_read as tuples_read,
--   idx_tup_fetch as tuples_fetched
-- FROM pg_stat_user_indexes
-- ORDER BY idx_scan DESC;

-- 查看表的统计信息
-- SELECT 
--   schemaname,
--   tablename,
--   n_tup_ins as inserts,
--   n_tup_upd as updates,
--   n_tup_del as deletes,
--   n_live_tup as live_tuples,
--   n_dead_tup as dead_tuples,
--   last_autovacuum,
--   last_autoanalyze
-- FROM pg_stat_user_tables
-- WHERE tablename IN ('user_credit', 'credit_transaction', 'bazi_calculations', 'fengshui_analysis')
-- ORDER BY n_live_tup DESC;

-- ========================================
-- 7. 慢查询分析 (需要启用 pg_stat_statements)
-- ========================================

-- 查看最慢的查询
-- SELECT 
--   query,
--   calls,
--   total_exec_time / 1000 as total_time_seconds,
--   mean_exec_time / 1000 as mean_time_seconds,
--   max_exec_time / 1000 as max_time_seconds
-- FROM pg_stat_statements
-- WHERE query NOT LIKE '%pg_%'
-- ORDER BY mean_exec_time DESC
-- LIMIT 20;

-- ========================================
-- 8. 表维护命令
-- ========================================

-- 更新表统计信息 (建议在创建索引后执行)
ANALYZE user_credit;
ANALYZE credit_transaction;
ANALYZE bazi_calculations;
ANALYZE fengshui_analysis;
ANALYZE payment;

-- 清理死元组
-- VACUUM ANALYZE user_credit;
-- VACUUM ANALYZE credit_transaction;
-- VACUUM ANALYZE bazi_calculations;
-- VACUUM ANALYZE fengshui_analysis;

-- ========================================
-- 执行说明
-- ========================================

/*
执行方式:

1. 使用 psql 命令行:
   psql "your-database-url" -f scripts/optimize-database-indexes.sql

2. 使用 Supabase SQL Editor:
   - 登录 Supabase Dashboard
   - 进入 SQL Editor
   - 复制粘贴本文件内容
   - 点击 Run

3. 使用 Drizzle Kit:
   - 将索引添加到 schema 文件
   - 运行 npm run db:push

预期效果:
- getUserCredits: 从 2-5秒 → < 50ms
- 签到查询: 从 3-25秒 → < 100ms
- 分析统计: 从 1-3秒 → < 200ms
- 总仪表盘加载: 从 1-5分钟 → < 2秒

注意事项:
- 创建索引可能需要几秒到几分钟（取决于表大小）
- 索引会占用额外存储空间（通常 10-30% 的表大小）
- 索引会略微降低写入性能（INSERT/UPDATE）
- 对于读多写少的场景（如仪表盘），索引是必须的
*/
