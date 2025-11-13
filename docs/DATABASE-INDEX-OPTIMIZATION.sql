-- 数据库索引优化脚本
-- 为高频查询添加复合索引以提升性能
-- 使用方法: 在PostgreSQL中执行此脚本

-- ========================================
-- 用户相关复合索引
-- ========================================

-- 1. 用户列表查询优化 (按创建时间+角色筛选)
CREATE INDEX CONCURRENTLY IF NOT EXISTS user_created_role_idx 
ON "user" (created_at DESC, role) 
WHERE banned IS NULL OR banned = false;

-- 2. 用户积分排行榜查询优化
CREATE INDEX CONCURRENTLY IF NOT EXISTS user_credits_created_idx 
ON "user" (credits DESC, created_at DESC);

-- ========================================
-- 积分系统复合索引
-- ========================================

-- 3. 用户积分交易历史查询优化 (userId + 时间倒序)
CREATE INDEX CONCURRENTLY IF NOT EXISTS credit_transaction_user_created_idx 
ON credit_transaction (user_id, created_at DESC);

-- 4. 积分类型统计查询优化
CREATE INDEX CONCURRENTLY IF NOT EXISTS credit_transaction_type_created_idx 
ON credit_transaction (type, created_at DESC);

-- 5. 积分过期处理查询优化
CREATE INDEX CONCURRENTLY IF NOT EXISTS credit_transaction_expiration_idx 
ON credit_transaction (expiration_date) 
WHERE expiration_date IS NOT NULL 
  AND expiration_date_processed_at IS NULL;

-- ========================================
-- 推荐系统复合索引
-- ========================================

-- 6. 推荐关系查询优化 (推荐人 + 状态 + 时间)
CREATE INDEX CONCURRENTLY IF NOT EXISTS referral_referrer_status_created_idx 
ON referral_relationships (referrer_id, status, created_at DESC);

-- 7. 被推荐人查询优化
CREATE INDEX CONCURRENTLY IF NOT EXISTS referral_referee_status_idx 
ON referral_relationships (referee_id, status);

-- 8. 推荐激活统计优化
CREATE INDEX CONCURRENTLY IF NOT EXISTS referral_activated_reward_idx 
ON referral_relationships (activated_at) 
WHERE reward_granted = false AND status = 'activated';

-- ========================================
-- 分享系统复合索引
-- ========================================

-- 9. 用户分享记录查询优化
CREATE INDEX CONCURRENTLY IF NOT EXISTS share_records_user_created_idx 
ON share_records (user_id, created_at DESC);

-- 10. 分享转化统计优化
CREATE INDEX CONCURRENTLY IF NOT EXISTS share_records_type_created_idx 
ON share_records (share_type, created_at DESC) 
WHERE reward_granted = true;

-- ========================================
-- 八字分析复合索引
-- ========================================

-- 11. 用户八字历史查询优化
CREATE INDEX CONCURRENTLY IF NOT EXISTS bazi_user_created_idx 
ON bazi_calculations (user_id, created_at DESC);

-- 12. 八字分析统计优化 (按日期聚合)
CREATE INDEX CONCURRENTLY IF NOT EXISTS bazi_created_date_idx 
ON bazi_calculations (DATE(created_at));

-- ========================================
-- 风水分析复合索引
-- ========================================

-- 13. 用户风水历史查询优化
CREATE INDEX CONCURRENTLY IF NOT EXISTS fengshui_user_created_idx 
ON fengshui_analysis (user_id, created_at DESC);

-- 14. 风水分析统计优化 (按日期聚合)
CREATE INDEX CONCURRENTLY IF NOT EXISTS fengshui_created_date_idx 
ON fengshui_analysis (DATE(created_at));

-- ========================================
-- 审计日志复合索引 (已有部分,补充缺失)
-- ========================================

-- 15. 审计日志按时间范围查询优化
CREATE INDEX CONCURRENTLY IF NOT EXISTS audit_logs_created_status_idx 
ON audit_logs (created_at DESC, status);

-- 16. 审计日志按资源ID查询优化
CREATE INDEX CONCURRENTLY IF NOT EXISTS audit_logs_resource_id_created_idx 
ON audit_logs (resource_id, created_at DESC) 
WHERE resource_id IS NOT NULL;

-- ========================================
-- Session表优化
-- ========================================

-- 17. Session过期清理优化
CREATE INDEX CONCURRENTLY IF NOT EXISTS session_expires_at_idx 
ON session (expires_at) 
WHERE expires_at > NOW();

-- ========================================
-- Payment表优化
-- ========================================

-- 18. 用户支付历史查询优化
CREATE INDEX CONCURRENTLY IF NOT EXISTS payment_user_created_idx 
ON payment (user_id, created_at DESC);

-- 19. 支付状态统计优化
CREATE INDEX CONCURRENTLY IF NOT EXISTS payment_status_created_idx 
ON payment (status, created_at DESC);

-- ========================================
-- QiFlow Reports表优化
-- ========================================

-- 20. 报告查询优化 (用户 + 状态 + 时间)
CREATE INDEX CONCURRENTLY IF NOT EXISTS qiflow_reports_user_status_created_idx 
ON qiflow_reports (user_id, status, created_at DESC);

-- ========================================
-- 任务进度表优化
-- ========================================

-- 21. 任务完成情况查询优化
CREATE INDEX CONCURRENTLY IF NOT EXISTS task_progress_completed_reward_idx 
ON task_progress (completed, reward_claimed) 
WHERE completed = true AND reward_claimed = false;

-- ========================================
-- 索引维护命令
-- ========================================

-- 查看索引大小
/*
SELECT 
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexname::regclass) DESC;
*/

-- 查看未使用的索引 (运行一段时间后执行)
/*
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch,
  pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND schemaname = 'public'
ORDER BY pg_relation_size(indexname::regclass) DESC;
*/

-- 重建索引 (可选,维护时使用)
/*
REINDEX TABLE CONCURRENTLY user;
REINDEX TABLE CONCURRENTLY credit_transaction;
REINDEX TABLE CONCURRENTLY audit_logs;
*/

-- ========================================
-- 分析表统计信息 (重要!)
-- ========================================

ANALYZE user;
ANALYZE credit_transaction;
ANALYZE referral_relationships;
ANALYZE share_records;
ANALYZE bazi_calculations;
ANALYZE fengshui_analysis;
ANALYZE audit_logs;
ANALYZE payment;
ANALYZE session;

-- ========================================
-- 完成提示
-- ========================================

SELECT 
  '数据库索引优化完成!' as message,
  COUNT(*) as total_indexes
FROM pg_indexes
WHERE schemaname = 'public';
