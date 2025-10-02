-- =============================================
-- 回滚脚本: 0004_stale_blizzard.sql
-- 版本: 1.0
-- 创建日期: 2025-10-02
-- 目标: 安全删除QiFlow相关数据库对象
-- 警告: ⚠️  此操作不可逆，会删除所有相关数据
-- =============================================

-- 使用事务确保原子性
BEGIN;

-- =============================================
-- Step 1: 备份检查点
-- =============================================
DO $$
DECLARE
  bazi_count INTEGER;
  fengshui_count INTEGER;
  pdf_count INTEGER;
  copyright_count INTEGER;
BEGIN
  -- 统计当前数据量
  SELECT COUNT(*) INTO bazi_count FROM bazi_calculations;
  SELECT COUNT(*) INTO fengshui_count FROM fengshui_analysis;
  SELECT COUNT(*) INTO pdf_count FROM pdf_audit;
  SELECT COUNT(*) INTO copyright_count FROM copyright_audit;
  
  -- 输出警告信息
  RAISE NOTICE '========================================';
  RAISE NOTICE 'QiFlow Rollback Data Loss Warning';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'bazi_calculations: % rows will be deleted', bazi_count;
  RAISE NOTICE 'fengshui_analysis: % rows will be deleted', fengshui_count;
  RAISE NOTICE 'pdf_audit: % rows will be deleted', pdf_count;
  RAISE NOTICE 'copyright_audit: % rows will be deleted', copyright_count;
  RAISE NOTICE 'Total: % rows will be lost', bazi_count + fengshui_count + pdf_count + copyright_count;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Press Ctrl+C within 5 seconds to cancel...';
  
  -- 5秒等待期
  PERFORM pg_sleep(5);
  
  RAISE NOTICE 'Proceeding with rollback...';
END $$;

-- =============================================
-- Step 2: 删除索引
-- =============================================
RAISE NOTICE 'Step 2/4: Dropping indexes...';

DROP INDEX IF EXISTS "bazi_user_id_idx";
DROP INDEX IF EXISTS "bazi_created_at_idx";
DROP INDEX IF EXISTS "fengshui_user_id_idx";
DROP INDEX IF EXISTS "fengshui_created_at_idx";
DROP INDEX IF EXISTS "pdf_audit_user_id_idx";
DROP INDEX IF EXISTS "pdf_audit_created_at_idx";
DROP INDEX IF EXISTS "copyright_audit_user_id_idx";
DROP INDEX IF EXISTS "copyright_audit_created_at_idx";

RAISE NOTICE 'Indexes dropped successfully';

-- =============================================
-- Step 3: 删除外键约束
-- =============================================
RAISE NOTICE 'Step 3/4: Dropping foreign key constraints...';

ALTER TABLE "bazi_calculations" 
  DROP CONSTRAINT IF EXISTS "bazi_calculations_user_id_user_id_fk";

ALTER TABLE "fengshui_analysis" 
  DROP CONSTRAINT IF EXISTS "fengshui_analysis_user_id_user_id_fk";

ALTER TABLE "pdf_audit" 
  DROP CONSTRAINT IF EXISTS "pdf_audit_user_id_user_id_fk";

ALTER TABLE "copyright_audit" 
  DROP CONSTRAINT IF EXISTS "copyright_audit_user_id_user_id_fk";

RAISE NOTICE 'Foreign key constraints dropped successfully';

-- =============================================
-- Step 4: 删除表
-- =============================================
RAISE NOTICE 'Step 4/4: Dropping tables...';

-- 使用CASCADE确保清理所有依赖对象
DROP TABLE IF EXISTS "bazi_calculations" CASCADE;
DROP TABLE IF EXISTS "fengshui_analysis" CASCADE;
DROP TABLE IF EXISTS "pdf_audit" CASCADE;
DROP TABLE IF EXISTS "copyright_audit" CASCADE;

RAISE NOTICE 'Tables dropped successfully';

-- =============================================
-- Step 5: 验证清理结果
-- =============================================
DO $$
DECLARE
  remaining_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO remaining_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name IN (
    'bazi_calculations', 
    'fengshui_analysis', 
    'pdf_audit', 
    'copyright_audit'
  );
  
  IF remaining_count > 0 THEN
    RAISE EXCEPTION 'Rollback verification failed: % QiFlow tables still exist', remaining_count;
  ELSE
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Rollback Verification PASSED';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'All QiFlow tables have been removed';
    RAISE NOTICE 'No remaining QiFlow database objects';
    RAISE NOTICE '========================================';
  END IF;
END $$;

-- =============================================
-- Step 6: 提交事务
-- =============================================
COMMIT;

RAISE NOTICE 'Rollback completed successfully!';
RAISE NOTICE 'Next steps:';
RAISE NOTICE '1. Update Drizzle schema (remove QiFlow tables from src/db/schema.ts)';
RAISE NOTICE '2. Rollback application code (git checkout/revert)';
RAISE NOTICE '3. Remove QiFlow dependencies from package.json';
RAISE NOTICE '4. Test application startup';
RAISE NOTICE '5. Update documentation';

-- =============================================
-- 回滚脚本结束
-- =============================================

-- 使用方法:
-- psql $DATABASE_URL -f artifacts/C11/rollback-0004.sql

