-- ============================================
-- 🚀 QiFlow AI 性能优化索引
-- ============================================
-- 说明：复制此文件的全部内容
-- 粘贴到 Supabase SQL Editor 中执行
-- 执行时间：约30-60秒
-- ============================================

-- 1. 积分交易表索引（最重要！）
-- 用于：签到、积分历史、日常进度
CREATE INDEX IF NOT EXISTS idx_credit_transaction_user_type_date 
ON credit_transaction(user_id, type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_credit_transaction_user_date
ON credit_transaction(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_credit_transaction_type_date
ON credit_transaction(type, created_at DESC);

-- 2. 八字分析表索引
-- 用于：仪表盘统计、分析历史
CREATE INDEX IF NOT EXISTS idx_bazi_calculations_user_date 
ON bazi_calculations(user_id, created_at DESC);

-- 3. 风水分析表索引
-- 用于：仪表盘统计、分析历史
CREATE INDEX IF NOT EXISTS idx_fengshui_analysis_user_date
ON fengshui_analysis(user_id, created_at DESC);

-- ============================================
-- ✅ 验证索引创建成功
-- ============================================
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('credit_transaction', 'bazi_calculations', 'fengshui_analysis')
  AND schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- ============================================
-- 预期结果：应该看到5个索引
-- ============================================
-- tablename            | indexname                               
-- ---------------------|----------------------------------------
-- bazi_calculations    | idx_bazi_calculations_user_date        
-- credit_transaction   | idx_credit_transaction_type_date       
-- credit_transaction   | idx_credit_transaction_user_date       
-- credit_transaction   | idx_credit_transaction_user_type_date  
-- fengshui_analysis    | idx_fengshui_analysis_user_date        
-- ============================================
