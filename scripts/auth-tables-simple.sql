-- ============================================
-- Better Auth 认证表结构 (简化版本)
-- 只创建表，不添加复杂约束
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

-- 验证表创建成功
SELECT 
  'Auth tables created successfully!' as message,
  COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('user', 'account', 'session', 'verification');