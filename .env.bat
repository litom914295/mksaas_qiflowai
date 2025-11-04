# ===========================================
# AI八字风水大师 - 环境变量配置
# 生成时间: 2025-09-20T10:23:16.703Z
# ===========================================

# ===========================================
# AI 服务提供商配置
# ===========================================
# OpenAI
OPENAI_API_KEY=sk-ArQi0bOqLCqsY3sdGnfqF2tSsOnPAV7MyorFrM1Wcqo2uXiw
OPENAI_BASE_URL=https://api.tu-zi.com/v1
# Google Gemini
GEMINI_API_KEY=AIzaSyBvkOWiGmUII2CCCnQoVYHmrbUnOxLJOew
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
# DeepSeek
DEEPSEEK_API_KEY=sk-04104c2d50864c30b307e6f6cfdf8fb4
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1

# ===========================================
# Supabase 配置 (必需)
# ===========================================
NEXT_PUBLIC_SUPABASE_URL=https://sibwcdadrsbfkblinezj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpYndjZGFkcnNiZmtibGluZXpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjI5MjYsImV4cCI6MjA3MzkzODkyNn0.ODBjBTMhTl26ywXjdmTDybFWn9iuQAKIkTCu-yJXgxk
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpYndjZGFkcnNiZmtibGluZXpqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODM2MjkyNiwiZXhwIjoyMDczOTM4OTI2fQ.BSvS72R5k9IWQjkWkCtwCM9kE5eOP41Ej7O2Q9S49nk

# ===========================================
# 数据库配置 (必需)
# ===========================================
# Transaction Pooler (事务模式 - 端口 6543)
# 注意：用户名格式为 postgres.[project-ref]
DATABASE_URL=postgresql://postgres.sibwcdadrsbfkblinezj:ilXZ1KndJSOcIJpQ@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
# Direct Connection (直连 - 当前网络环境不支持 IPv6，不可用)
# DIRECT_DATABASE_URL=postgresql://postgres.sibwcdadrsbfkblinezj:ilXZ1KndJSOcIJpQ@db.sibwcdadrsbfkblinezj.supabase.co:5432/postgres


# 管理员种子用户(用于创建管理员账号)
ADMIN_EMAIL=admin@qiflowai.com
ADMIN_PASSWORD=admin123456
ADMIN_NAME=Admin
SEED_BASE_URL=http://localhost:3001

# ===========================================
# 应用配置 (必需)
# ===========================================
BETTER_AUTH_SECRET=kgfJJ4KfJ930eD8mvKGwqllxDgOoDXt6BmukSUnt6tA=
NEXTAUTH_SECRET=kgfJJ4KfJ930eD8mvKGwqllxDgOoDXt6BmukSUnt6tA=
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
GUEST_SESSION_SECRET=H+KApqQgbugZh+d/BnFuBz5YCFIaPDam04N4+A0a4gA=

# ===========================================
# Stripe 支付配置 (必需)
# ===========================================
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_51SPI1rQVvPHNlwbz8hgtg6Sq6pdj5MjIpY3xd3rwAhlU18jv5ZcceujKJjyg8S1owT6XmqSsQHR4HCLzEJvYp9Uk00VCqCMbJi
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SPI1rQVvPHNlwbziMMo7lKjJXlguEjRiDuD2iV9coIktLLzB9CoZbOxZ2beDixr9txu8EKh1H444Z8tJuV5Ghqf00LdHf2BsA
# Webhook Secret (需要在 Stripe Dashboard 中配置 webhook，然后获取)
STRIPE_WEBHOOK_SECRET=whsec_placeholder

# Stripe Price IDs (需要在 Stripe Dashboard 中创建产品和价格，然后填入 Price ID)
# 月订阅
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=price_placeholder_monthly
# 年订阅
NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY=price_placeholder_yearly
# 终身会员
NEXT_PUBLIC_STRIPE_PRICE_LIFETIME=price_placeholder_lifetime
# 积分包
NEXT_PUBLIC_STRIPE_PRICE_CREDITS_BASIC=price_placeholder_credits_basic
NEXT_PUBLIC_STRIPE_PRICE_CREDITS_STANDARD=price_placeholder_credits_standard
NEXT_PUBLIC_STRIPE_PRICE_CREDITS_PREMIUM=price_placeholder_credits_premium
NEXT_PUBLIC_STRIPE_PRICE_CREDITS_ENTERPRISE=price_placeholder_credits_enterprise

# ===========================================
# 功能开关
# ===========================================
ENABLE_AI_FEATURES=true
ENABLE_GUEST_MODE=true
ENABLE_DEBUG_MODE=false
# 如果数据库直连失败，启用此选项使用 Supabase REST API
# DISABLE_DATABASE=true

# ===========================================
# AI模型配置 (可选)
# ===========================================
AI_LIGHTWEIGHT_MODELS=deepseek-chat,gpt-4o-mini,gemini-2.5-flash
AI_FULL_MODELS=deepseek-chat,gpt-4o,gemini-2.5-flash
AI_PROVIDER_PRIORITY=deepseek,openai,anthropic,gemini
AI_MAX_COST_PER_REQUEST=0.1
AI_ENABLE_COST_OPTIMIZATION=true

# ===========================================
# 应用URL配置
# ===========================================
NEXT_PUBLIC_APP_URL=http://localhost:3001
