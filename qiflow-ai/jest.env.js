// 测试环境变量配置
process.env.NODE_ENV = 'test';

// Supabase 测试环境变量
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QtcHJvamVjdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQwOTk1MjAwLCJleHAiOjE5NTYzNTUyMDB9.test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QtcHJvamVjdCIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2NDA5OTUyMDAsImV4cCI6MTk1NjM1NTIwMH0.test-service-role-key';

// AI Provider 测试环境变量
process.env.OPENAI_API_KEY = 'sk-test-openai-key';
process.env.ANTHROPIC_API_KEY = 'sk-ant-test-anthropic-key';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.DEEPSEEK_API_KEY = 'sk-test-deepseek-key';

// 游客会话配置
process.env.GUEST_SESSION_SECRET = 'test-guest-session-secret-key-for-testing-only';

// 数据库配置
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';

// NextAuth 配置
process.env.NEXTAUTH_SECRET = 'test-nextauth-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';

// 禁用一些在测试中不需要的功能
process.env.DISABLE_ANALYTICS = 'true';
process.env.DISABLE_TELEMETRY = 'true';

