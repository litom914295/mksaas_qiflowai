CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 用户用途券表
CREATE TABLE IF NOT EXISTS public.user_vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL,               -- bazi / fengshui / ai_chat / pdf_export
  units_total INTEGER NOT NULL,              -- 总配额（一次性=1；对话=轮数）
  units_used INTEGER NOT NULL DEFAULT 0,     -- 已使用
  voucher_code VARCHAR(50) NOT NULL,         -- 券类型标识（展示/统计）
  issued_reason VARCHAR(50),                 -- 发放原因（daily_signin / streak_7 / ...）
  expire_at TIMESTAMP NULL,                  -- 可为空=长期有效
  metadata JSONB DEFAULT '{}'::jsonb,        -- giftable、giftToken等
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT user_vouchers_user_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE
);

-- 约束：units_used 不超过 units_total
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_user_vouchers_units'
  ) THEN
    ALTER TABLE public.user_vouchers
    ADD CONSTRAINT chk_user_vouchers_units CHECK (units_used <= units_total AND units_total > 0 AND units_used >= 0);
  END IF;
END $$;

-- 索引
CREATE INDEX IF NOT EXISTS idx_user_vouchers_user ON public.user_vouchers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_vouchers_action ON public.user_vouchers(action);
CREATE INDEX IF NOT EXISTS idx_user_vouchers_expire ON public.user_vouchers(expire_at);
CREATE INDEX IF NOT EXISTS idx_user_vouchers_user_action ON public.user_vouchers(user_id, action);
