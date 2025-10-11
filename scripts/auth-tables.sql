-- ============================================
-- Better Auth 认证表结构
-- 用于 Supabase PostgreSQL 数据库
-- ============================================

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
  "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
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
  "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
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

-- 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
CREATE INDEX IF NOT EXISTS idx_session_token ON session(token);
CREATE INDEX IF NOT EXISTS idx_session_userId ON session("userId");
CREATE INDEX IF NOT EXISTS idx_account_userId ON account("userId");
CREATE INDEX IF NOT EXISTS idx_verification_token ON verification(token);

-- 验证表创建成功
SELECT 
  'Tables created successfully!' as message,
  COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('user', 'account', 'session', 'verification');
