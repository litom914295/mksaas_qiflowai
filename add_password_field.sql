-- 添加 password 字段到 user 表
-- 请在 Supabase Dashboard 的 SQL Editor 中执行此脚本

-- 添加 password 列（如果不存在）
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user' 
        AND column_name = 'password'
    ) THEN
        ALTER TABLE "user" ADD COLUMN "password" text;
        RAISE NOTICE 'Password column added successfully';
    ELSE
        RAISE NOTICE 'Password column already exists';
    END IF;
END $$;
