-- 数据库性能优化索引
-- 创建时间: 2025-01-05
-- 用途: 提升仪表盘和积分系统查询性能

-- ===================================
-- 1. 积分交易表索引
-- ===================================

-- 用户+类型+时间索引 (用于：交易历史查询、日常进度统计)
-- 覆盖查询场景：
-- - /api/credits/transactions (交易记录分页、筛选、排序)
-- - /api/credits/daily-progress (今日任务完成情况)
-- - /api/dashboard/activity (活动趋势统计)
-- - /api/credits/signin-history (签到历史记录)
CREATE INDEX IF NOT EXISTS idx_credit_transaction_user_type_date 
ON credit_transaction(user_id, type, created_at DESC);

-- 用户+时间索引 (用于：按时间范围查询所有类型交易)
CREATE INDEX IF NOT EXISTS idx_credit_transaction_user_date
ON credit_transaction(user_id, created_at DESC);

-- 类型+时间索引 (用于：全局统计某类交易)
CREATE INDEX IF NOT EXISTS idx_credit_transaction_type_date
ON credit_transaction(type, created_at DESC);

-- ===================================
-- 2. 八字分析表索引
-- ===================================

-- 用户+时间索引 (用于：仪表盘统计、日常进度)
-- 覆盖查询场景：
-- - /api/dashboard/stats (八字分析次数统计)
-- - /api/dashboard/activity (活动趋势数据)
-- - /api/credits/daily-progress (今日分析完成情况)
CREATE INDEX IF NOT EXISTS idx_bazi_calculations_user_date 
ON bazi_calculations(user_id, created_at DESC);

-- ===================================
-- 3. 风水分析表索引
-- ===================================

-- 用户+时间索引
CREATE INDEX IF NOT EXISTS idx_fengshui_analysis_user_date
ON fengshui_analysis(user_id, created_at DESC);

-- ===================================
-- 4. 验证索引创建
-- ===================================

-- PostgreSQL: 查看已创建的索引
-- SELECT indexname, tablename FROM pg_indexes 
-- WHERE tablename IN ('credit_transaction', 'bazi_calculations', 'fengshui_analysis')
-- ORDER BY tablename, indexname;

-- MySQL: 查看已创建的索引
-- SHOW INDEX FROM credit_transaction;
-- SHOW INDEX FROM bazi_calculations;
-- SHOW INDEX FROM fengshui_analysis;

-- ===================================
-- 5. 性能提升预估
-- ===================================

-- 基于索引的性能提升（预估）：
-- 
-- 1. 交易记录查询 (带筛选/排序):
--    优化前: ~200-500ms (全表扫描)
--    优化后: ~20-50ms (索引扫描)
--    提升: 90%+
--
-- 2. 仪表盘统计查询:
--    优化前: ~300-800ms (多次全表扫描)
--    优化后: ~30-80ms (索引覆盖扫描)
--    提升: 90%+
--
-- 3. 日常进度统计:
--    优化前: ~150-400ms
--    优化后: ~15-40ms
--    提升: 90%+
--
-- 4. 签到历史查询:
--    优化前: ~100-300ms
--    优化后: ~10-30ms
--    提升: 90%+

-- ===================================
-- 6. 索引维护建议
-- ===================================

-- PostgreSQL: 重建索引 (当索引碎片化严重时)
-- REINDEX INDEX idx_credit_transaction_user_type_date;
-- REINDEX INDEX idx_bazi_calculations_user_date;
-- REINDEX INDEX idx_fengshui_analysis_user_date;

-- MySQL: 优化表 (自动重建索引)
-- OPTIMIZE TABLE credit_transaction;
-- OPTIMIZE TABLE bazi_calculations;
-- OPTIMIZE TABLE fengshui_analysis;

-- ===================================
-- 7. 查询优化示例
-- ===================================

-- 优化前 (全表扫描):
-- SELECT * FROM credit_transaction 
-- WHERE user_id = 'xxx' 
-- ORDER BY created_at DESC;

-- 优化后 (使用索引):
-- EXPLAIN SELECT * FROM credit_transaction 
-- WHERE user_id = 'xxx' 
-- ORDER BY created_at DESC;
-- 应该显示 "Index Scan using idx_credit_transaction_user_date"

-- 带类型筛选 (复合索引):
-- EXPLAIN SELECT * FROM credit_transaction 
-- WHERE user_id = 'xxx' AND type = 'DAILY_SIGNIN'
-- ORDER BY created_at DESC;
-- 应该显示 "Index Scan using idx_credit_transaction_user_type_date"
