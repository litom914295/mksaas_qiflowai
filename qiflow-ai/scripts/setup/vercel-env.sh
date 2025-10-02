#!/bin/bash

# Vercel Environment Variable Setup Script for QiFlow AI
# This script configures all necessary environment variables for deployment

set -e

echo "🚀 Setting up Vercel environment variables for QiFlow AI..."

# Function to add environment variable
add_env_var() {
    local name="$1"
    local prompt="$2"
    local environment="${3:-preview,production}"

    echo
    echo "Setting up $name..."

    if [ -z "${!name}" ]; then
        echo "💡 $prompt"
        echo "Please enter the value for $name:"
        read -r value

        if [ -n "$value" ]; then
            vercel env add "$name" "$environment" <<< "$value"
            echo "✅ $name added successfully"
        else
            echo "⚠️  Skipping $name (empty value)"
        fi
    else
        echo "🔍 Using existing environment variable: $name"
        vercel env add "$name" "$environment" <<< "${!name}"
        echo "✅ $name added successfully"
    fi
}

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Please install it first:"
    echo "npm i -g vercel"
    exit 1
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please log in to Vercel first:"
    vercel login
fi

echo "📋 Setting up core environment variables..."

# Core Supabase configuration
add_env_var "NEXT_PUBLIC_SUPABASE_URL" "Your Supabase project URL (https://xxx.supabase.co)"
add_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "Your Supabase anonymous key"
add_env_var "SUPABASE_SERVICE_ROLE_KEY" "Your Supabase service role key (server-side only)"

# AI Provider APIs
add_env_var "OPENAI_API_KEY" "Your OpenAI API key for GPT-4"
add_env_var "ANTHROPIC_API_KEY" "Your Anthropic Claude API key (optional)" "preview,production"
add_env_var "GEMINI_API_KEY" "Your Google Gemini API key (optional)" "preview,production"
add_env_var "DEEPSEEK_API_KEY" "Your DeepSeek API key (optional)" "preview,production"

# Authentication and Security
add_env_var "GUEST_SESSION_SECRET" "Secret for guest session encryption (generate a random 32-char string)"
add_env_var "NEXTAUTH_SECRET" "NextAuth secret (generate a random 32-char string)"
add_env_var "NEXTAUTH_URL" "Your deployment URL (https://yourdomain.com)"

# Redis Configuration
add_env_var "REDIS_URL" "Your Redis connection URL (redis://user:pass@host:port/db)"
add_env_var "REDIS_HOST" "Redis host (optional if using REDIS_URL)"
add_env_var "REDIS_PORT" "Redis port (optional if using REDIS_URL)"
add_env_var "REDIS_PASSWORD" "Redis password (optional if using REDIS_URL)"

# Monitoring and Observability
add_env_var "SENTRY_DSN" "Sentry DSN for error tracking (optional)" "preview,production"
add_env_var "SLACK_WEBHOOK_URL" "Slack webhook for alerts (optional)" "production"

# Cost Management
add_env_var "AI_DAILY_BUDGET_USD" "Daily AI usage budget in USD (default: 10)" "preview,production"
add_env_var "COST_ALERT_THRESHOLD" "Cost alert threshold percentage (default: 80)" "production"

# Performance and Caching
add_env_var "ENABLE_REDIS_CACHE" "Enable Redis caching (true/false, default: true)" "preview,production"
add_env_var "CACHE_TTL_SECONDS" "Cache TTL in seconds (default: 3600)" "preview,production"

echo
echo "🎉 Environment variable setup completed!"
echo
echo "📝 Next steps:"
echo "1. Run 'vercel env ls' to verify all variables are set"
echo "2. Deploy with 'vercel --prod' to apply changes"
echo "3. Check deployment logs for any missing environment variables"
echo
echo "💡 Tips:"
echo "- Use 'vercel env pull .env.local' to sync variables locally"
echo "- Use 'vercel env rm <name>' to remove variables"
echo "- Environment variables are encrypted and secure in Vercel"
echo
echo "🔗 Useful links:"
echo "- Vercel Environment Variables: https://vercel.com/docs/projects/environment-variables"
echo "- Supabase Dashboard: https://app.supabase.com/"
echo "- Redis Dashboard: Check your Redis provider's dashboard"