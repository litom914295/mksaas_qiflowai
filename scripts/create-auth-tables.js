/**
 * 使用 Supabase REST API 创建认证表
 * 无需登录 Dashboard，直接通过 API 创建
 */

// 加载环境变量
require('dotenv').config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ 缺少 Supabase 配置！');
  console.error('请确保 .env 文件中有：');
  console.error('  NEXT_PUBLIC_SUPABASE_URL');
  console.error('  SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const SQL = `
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

-- 创建账户表 (OAuth)
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

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
CREATE INDEX IF NOT EXISTS idx_session_token ON session(token);
CREATE INDEX IF NOT EXISTS idx_session_userId ON session("userId");
CREATE INDEX IF NOT EXISTS idx_account_userId ON account("userId");
CREATE INDEX IF NOT EXISTS idx_verification_token ON verification(token);
`;

async function createTables() {
  console.log('🚀 开始创建认证表...\n');
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
  console.log(`🔑 使用 Service Role Key\n`);

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: SQL }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API 请求失败: ${response.status} - ${error}`);
    }

    const result = await response.json();
    console.log('✅ 认证表创建成功！\n');
    console.log('📋 创建的表：');
    console.log('  ✅ user          - 用户表');
    console.log('  ✅ account       - OAuth 账户表');
    console.log('  ✅ session       - 会话表');
    console.log('  ✅ verification  - 验证令牌表\n');
    console.log('🎉 现在可以测试注册功能了！');
    console.log('👉 http://localhost:3000/zh-CN/sign-up\n');
    
    return result;
  } catch (error) {
    console.error('❌ 创建表失败:', error.message);
    console.error('\n💡 请尝试以下方案：');
    console.error('\n方案 1: 直接在 Supabase Dashboard 执行 SQL');
    console.error('  1. 访问: https://supabase.com/dashboard');
    console.error('  2. 进入你的项目');
    console.error('  3. 点击 SQL Editor');
    console.error('  4. 复制 scripts/auth-tables.sql 中的 SQL');
    console.error('  5. 点击 Run\n');
    console.error('方案 2: 使用 Supabase CLI');
    console.error('  npx supabase db push\n');
    throw error;
  }
}

// 验证表是否创建成功
async function verifyTables() {
  console.log('🔍 验证表是否创建成功...\n');
  
  const checkSQL = `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name IN ('user', 'account', 'session', 'verification')
    ORDER BY table_name;
  `;

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: checkSQL }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('📊 找到的表:', result);
    }
  } catch (error) {
    console.log('⚠️  无法验证表（可能 API 不支持），但表可能已经创建成功');
  }
}

// 执行
(async () => {
  try {
    await createTables();
    await verifyTables();
  } catch (error) {
    process.exit(1);
  }
})();
