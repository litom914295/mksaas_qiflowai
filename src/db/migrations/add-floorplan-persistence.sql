-- 户型叠加持久化功能 - 数据库迁移脚本
-- 版本: v5.1.1
-- 创建时间: 2025-01-22
-- 说明: 为 fengshuiAnalysis 表添加户型叠加状态持久化支持

-- ============================================
-- 向上迁移 (Migration UP)
-- ============================================

-- 1. 添加 floorPlanData 字段（如果不存在）
-- 存储完整的户型叠加状态 (JSON 格式)
ALTER TABLE "fengshuiAnalysis" 
ADD COLUMN IF NOT EXISTS "floorPlanData" JSONB DEFAULT NULL;

-- 2. 添加 floorPlanUrl 字段（如果不存在）
-- 存储云存储图片 URL（当使用云存储时）
ALTER TABLE "fengshuiAnalysis" 
ADD COLUMN IF NOT EXISTS "floorPlanUrl" TEXT DEFAULT NULL;

-- 3. 为 userId 和 createdAt 创建复合索引
-- 用于快速查询用户的所有户型方案
CREATE INDEX IF NOT EXISTS "idx_fengshui_userId_createdAt" 
ON "fengshuiAnalysis" ("userId", "createdAt" DESC);

-- 4. 为 floorPlanData 内的 updatedAt 创建表达式索引（可选）
-- 用于按更新时间排序和查询
CREATE INDEX IF NOT EXISTS "idx_fengshui_floorPlanData_updatedAt" 
ON "fengshuiAnalysis" ((("floorPlanData"->>'updatedAt')::BIGINT)) 
WHERE "floorPlanData" IS NOT NULL;

-- 5. 为 floorPlanData 内的 name 创建 GIN 索引（可选）
-- 用于方案名称搜索
CREATE INDEX IF NOT EXISTS "idx_fengshui_floorPlanData_name" 
ON "fengshuiAnalysis" USING GIN ((to_tsvector('simple', "floorPlanData"->>'name'))) 
WHERE "floorPlanData" IS NOT NULL;

-- 6. 添加检查约束（可选）
-- 确保 floorPlanData 包含必需字段
ALTER TABLE "fengshuiAnalysis" 
ADD CONSTRAINT IF NOT EXISTS "chk_floorPlanData_structure" 
CHECK (
  "floorPlanData" IS NULL OR (
    "floorPlanData" ? 'id' AND
    "floorPlanData" ? 'createdAt' AND
    "floorPlanData" ? 'updatedAt'
  )
);

-- 7. 添加注释
COMMENT ON COLUMN "fengshuiAnalysis"."floorPlanData" IS '户型叠加完整状态数据，包含图片、旋转、缩放等所有参数 (JSONB)';
COMMENT ON COLUMN "fengshuiAnalysis"."floorPlanUrl" IS '户型图云存储 URL（使用云存储时）';
COMMENT ON INDEX "idx_fengshui_userId_createdAt" IS '用户户型方案查询索引';
COMMENT ON INDEX "idx_fengshui_floorPlanData_updatedAt" IS '户型方案更新时间索引';

-- ============================================
-- 向下迁移 (Migration DOWN / Rollback)
-- ============================================

-- 取消注释以下内容以执行回滚

/*
-- 1. 删除检查约束
ALTER TABLE "fengshuiAnalysis" 
DROP CONSTRAINT IF EXISTS "chk_floorPlanData_structure";

-- 2. 删除索引
DROP INDEX IF EXISTS "idx_fengshui_floorPlanData_name";
DROP INDEX IF EXISTS "idx_fengshui_floorPlanData_updatedAt";
DROP INDEX IF EXISTS "idx_fengshui_userId_createdAt";

-- 3. 删除字段
ALTER TABLE "fengshuiAnalysis" 
DROP COLUMN IF EXISTS "floorPlanUrl";

ALTER TABLE "fengshuiAnalysis" 
DROP COLUMN IF EXISTS "floorPlanData";
*/

-- ============================================
-- 验证脚本
-- ============================================

-- 查询表结构，验证字段已添加
/*
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'fengshuiAnalysis' 
  AND column_name IN ('floorPlanData', 'floorPlanUrl')
ORDER BY ordinal_position;

-- 查询索引，验证索引已创建
SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'fengshuiAnalysis' 
  AND indexname LIKE '%floorplan%'
ORDER BY indexname;

-- 查询约束
SELECT 
  conname, 
  pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'fengshuiAnalysis'::regclass 
  AND conname LIKE '%floorplan%';
*/

-- ============================================
-- 数据迁移示例（如果有旧数据需要迁移）
-- ============================================

/*
-- 示例：如果之前使用其他字段存储户型数据，可以迁移到新结构
UPDATE "fengshuiAnalysis"
SET "floorPlanData" = jsonb_build_object(
  'id', 'migrated_' || id::TEXT,
  'name', '迁移方案',
  'imageData', old_image_field,
  'imageType', 'base64',
  'rotation', 0,
  'scale', 1,
  'position', jsonb_build_object('x', 0, 'y', 0),
  'showOverlay', true,
  'showLabels', true,
  'overlayOpacity', 0.7,
  'gridLineWidth', 2,
  'createdAt', EXTRACT(EPOCH FROM "createdAt") * 1000,
  'updatedAt', EXTRACT(EPOCH FROM "updatedAt") * 1000
)
WHERE old_image_field IS NOT NULL 
  AND "floorPlanData" IS NULL;
*/

-- ============================================
-- 性能优化建议
-- ============================================

-- 如果表数据量很大（> 10万行），建议：
-- 1. 在非高峰时段执行迁移
-- 2. 使用 CONCURRENTLY 创建索引（不会锁表）
-- 3. 分批更新数据（如果有旧数据迁移）

-- 并发创建索引示例（不锁表，但速度较慢）：
/*
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_fengshui_userId_createdAt" 
ON "fengshuiAnalysis" ("userId", "createdAt" DESC);
*/

-- ============================================
-- 监控建议
-- ============================================

-- 查询使用户型叠加功能的用户数
/*
SELECT COUNT(DISTINCT "userId") AS active_floorplan_users
FROM "fengshuiAnalysis"
WHERE "floorPlanData" IS NOT NULL;

-- 查询平均户型数据大小
SELECT 
  AVG(pg_column_size("floorPlanData")) AS avg_size_bytes,
  MAX(pg_column_size("floorPlanData")) AS max_size_bytes,
  MIN(pg_column_size("floorPlanData")) AS min_size_bytes
FROM "fengshuiAnalysis"
WHERE "floorPlanData" IS NOT NULL;

-- 查询最活跃的用户（户型方案最多）
SELECT 
  "userId",
  COUNT(*) AS plan_count
FROM "fengshuiAnalysis"
WHERE "floorPlanData" IS NOT NULL
GROUP BY "userId"
ORDER BY plan_count DESC
LIMIT 10;
*/
