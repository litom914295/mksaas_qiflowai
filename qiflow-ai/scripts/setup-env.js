#!/usr/bin/env node

/**
 * QiFlow AI 环境变量配置脚本
 * 帮助用户快速配置AI八字风水大师所需的环境变量
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const ENV_FILE = '.env.local';
const ENV_EXAMPLE_FILE = 'env.local.example';

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

function createEnvFile() {
  const envPath = path.join(process.cwd(), ENV_FILE);
  const examplePath = path.join(process.cwd(), ENV_EXAMPLE_FILE);

  if (fs.existsSync(envPath)) {
    console.log('✅ .env.local 文件已存在');
    return;
  }

  if (!fs.existsSync(examplePath)) {
    console.error('❌ env.local.example 文件不存在');
    return;
  }

  try {
    // 读取示例文件
    const exampleContent = fs.readFileSync(examplePath, 'utf8');

    // 生成随机密钥
    const nextAuthSecret = generateSecret(32);
    const guestSessionSecret = generateSecret(32);

    // 替换示例内容
    const envContent = exampleContent
      .replace(
        'your-random-secret-key-here-minimum-32-characters',
        nextAuthSecret
      )
      .replace(
        'your-guest-session-secret-key-here-minimum-32-characters',
        guestSessionSecret
      );

    // 写入 .env.local 文件
    fs.writeFileSync(envPath, envContent);

    console.log('✅ 已创建 .env.local 文件');
    console.log('📝 请编辑 .env.local 文件，配置以下必需的环境变量：');
    console.log('');
    console.log('🔑 AI服务提供商 (至少配置一个):');
    console.log('   - OPENAI_API_KEY');
    console.log('   - ANTHROPIC_API_KEY');
    console.log('   - GEMINI_API_KEY');
    console.log('   - DEEPSEEK_API_KEY');
    console.log('');
    console.log('🗄️  Supabase配置:');
    console.log('   - NEXT_PUBLIC_SUPABASE_URL');
    console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.log('   - SUPABASE_SERVICE_ROLE_KEY');
    console.log('   - DATABASE_URL');
    console.log('');
    console.log('📖 详细配置说明请参考: AI_API_SETUP_GUIDE.md');
  } catch (error) {
    console.error('❌ 创建 .env.local 文件失败:', error.message);
  }
}

function checkEnvFile() {
  const envPath = path.join(process.cwd(), ENV_FILE);

  if (!fs.existsSync(envPath)) {
    console.log('❌ .env.local 文件不存在');
    createEnvFile();
    return;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');

  // 检查必需的AI API密钥
  const aiKeys = [
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'GEMINI_API_KEY',
    'DEEPSEEK_API_KEY',
  ];

  const configuredAiKeys = aiKeys.filter(key => {
    const regex = new RegExp(`^${key}=sk-|^${key}=your-`);
    return regex.test(envContent);
  });

  if (configuredAiKeys.length === 0) {
    console.log('⚠️  未配置任何AI服务提供商API密钥');
    console.log('   请至少配置一个AI服务提供商的API密钥');
  } else {
    console.log(`✅ 已配置 ${configuredAiKeys.length} 个AI服务提供商`);
  }

  // 检查Supabase配置
  const supabaseKeys = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'DATABASE_URL',
  ];

  const configuredSupabaseKeys = supabaseKeys.filter(key => {
    const regex = new RegExp(`^${key}=https://|^${key}=postgresql://`);
    return regex.test(envContent);
  });

  if (configuredSupabaseKeys.length < 4) {
    console.log('⚠️  Supabase配置不完整');
    console.log('   请配置所有Supabase相关的环境变量');
  } else {
    console.log('✅ Supabase配置完整');
  }

  console.log('');
  console.log('🚀 配置完成后，运行以下命令启动开发服务器:');
  console.log('   npm run dev');
}

function main() {
  console.log('🔧 QiFlow AI 环境变量配置助手');
  console.log('================================');

  const command = process.argv[2];

  switch (command) {
    case 'create':
      createEnvFile();
      break;
    case 'check':
      checkEnvFile();
      break;
    default:
      console.log('用法:');
      console.log('  node scripts/setup-env.js create  - 创建 .env.local 文件');
      console.log('  node scripts/setup-env.js check   - 检查配置状态');
      console.log('');
      checkEnvFile();
  }
}

main();
