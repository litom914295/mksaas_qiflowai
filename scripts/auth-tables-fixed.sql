-- ============================================
-- Better Auth 认证表结构 (修复版本)
-- 用于 Supabase PostgreSQL 数据库
-- ============================================

-- 首先删除可能存在的索引（避免冲突）
DROP INDEX IF EXISTS idx_user_email;
DROP INDEX IF EXISTS idx_session_token;
DROP INDEX IF EXISTS idx_session_userId;
DROP INDEX IF EXISTS idx_account_userId;
DROP INDEX IF EXISTS idx_verification_token;

-- 创建用户表
CREATE TABLE IF NOT EXISTS "user" (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  "emailVerified" BOOLEAN DEFAULT false,
  image TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "customerId" TEXT,
  role TEXT DEFAULT 'user',
  banned BOOLEAN DEFAULT false,
  "banReason" TEXT,
  "banExpires" TIMESTAMP
);

-- 创建账户表 (用于 OAuth)
CREATE TABLE IF NOT EXISTS account (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "expiresAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 创建会话表
CREATE TABLE IF NOT EXISTS session (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  token TEXT NOT NULL UNIQUE,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 创建验证令牌表
CREATE TABLE IF NOT EXISTS verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 添加外键约束（在表创建完成后）
ALTER TABLE account 
  ADD CONSTRAINT fk_account_userId 
  FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE;

ALTER TABLE session 
  ADD CONSTRAINT fk_session_userId 
  FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE;

-- 创建索引以提升查询性能
CREATE INDEX idx_user_email ON "user"(email);
CREATE INDEX idx_session_token ON session(token);
CREATE INDEX idx_session_userid ON session("userId");
CREATE INDEX idx_account_userid ON account("userId");
CREATE INDEX idx_verification_token ON verification(token);

-- 验证表创建成功
SELECT 
  'Tables created successfully!' as message,
  COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('user', 'account', 'session', 'verification');